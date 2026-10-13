// Renders the stills that stand under the live wallpaper (option-a-desktop/wallpaper3d.js) and show in its place on
// phones, with reduced motion and without WebGL: the picture at 10 s, the moment the live one starts from, with no
// wake, pluck or glitch, one per window shape style.css picks between (1920, 2160, 2400 and 2700 by 1200). Drawn by
// the wallpaper's own code (index.html beside this file) in headless Chrome on its software GL, so every machine
// renders the same dots, then written as lossless WebP (Python's PIL).
//   node tools/wallpaper-still/render.mjs [--chrome /path/to/chrome]
// After new stills: bump the ?v= of style.css.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const chromePath = arg('chrome', process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome');
const SIZES = [['wallpaper-phosphor', 1920], ['wallpaper-phosphor-2160', 2160], ['wallpaper-phosphor-2400', 2400], ['wallpaper-phosphor-2700', 2700]];
const H = 1200;

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  let file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try { if (fs.statSync(file).isDirectory()) file = path.join(file, 'index.html'); } catch {}
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404).end(); return; }
    res.writeHead(200, { 'content-type': types[path.extname(file)] || 'application/octet-stream', 'cache-control': 'no-store' }).end(data);
  });
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'wallpaper-still-'));
const chrome = spawn(chromePath, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run', '--no-default-browser-check',
  '--hide-scrollbars', '--force-color-profile=srgb', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--window-size=2700,1200', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const done = (code) => { try { chrome.kill('SIGKILL'); } catch {} server.close(); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(code); };
setTimeout(() => { console.error('timed out'); done(1); }, 40000);

const ws = new WebSocket(await new Promise((resolve) => { let buf = ''; chrome.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) resolve(m[1]); }); }));
await new Promise((r) => ws.addEventListener('open', r, { once: true }));
let id = 0;
const pending = new Map(), errors = [];
ws.addEventListener('message', (ev) => {
  const m = JSON.parse(ev.data);
  if (m.id && pending.has(m.id)) { const { resolve, reject } = pending.get(m.id); pending.delete(m.id); m.error ? reject(new Error(m.error.message)) : resolve(m.result); }
  else if (m.method === 'Runtime.exceptionThrown') errors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
});
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => { const i = ++id; pending.set(i, { resolve, reject }); ws.send(JSON.stringify({ id: i, method, params, sessionId })); });

console.error('connected');
for (const [name, W] of SIZES) {
  const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
  const { sessionId: s } = await send('Target.attachToTarget', { targetId, flatten: true });
  await send('Runtime.enable', {}, s);
  await send('Emulation.setDeviceMetricsOverride', { width: W, height: H, deviceScaleFactor: 1, mobile: false }, s);
  console.error('navigating', W);
  await send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/tools/wallpaper-still/?w=${W}&h=${H}` }, s);
  const { result } = await send('Runtime.evaluate', { expression: `new Promise((r) => { const t = setInterval(() => { if (window.PF && PF.wall3d) { clearInterval(t); r(PF.wall3d.seek(10)); } }, 50); })`, awaitPromise: true }, s);
  const png = path.join(profile, name + '.png'), out = path.join(root, 'asset', name + '.webp');
  fs.writeFileSync(png, Buffer.from(result.value.split(',')[1], 'base64'));
  execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").save(sys.argv[2], "WEBP", lossless=True, method=6)', png, out]);
  console.log(out, fs.statSync(out).size, 'bytes');
  await send('Target.closeTarget', { targetId });
}
if (errors.length) console.log('page errors:\n  ' + errors.join('\n  '));
done(0);
