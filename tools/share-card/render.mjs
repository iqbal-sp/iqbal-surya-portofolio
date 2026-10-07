// Renders the share card (index.html beside this file) in headless Chrome at 2x and writes the 1200 x 630 JPEG the site's
// og:image points at, scaled down with Lanczos (Python's PIL) at quality 86.
//   node tools/share-card/render.mjs [--v a|b] [--out asset/share/share-1200x630.jpg] [--png the-2x.png]
// After a new card: bump og:image's ?v= in option-a-desktop/index.html, so link previews fetch it again.
import http from 'node:http';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn, execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const variant = arg('v', 'a');
const out = path.resolve(arg('out', path.join(root, 'asset/share/share-1200x630.jpg')));
const png = path.resolve(arg('png', path.join(os.tmpdir(), `share-card-${variant}@2x.png`)));

const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.avif': 'image/avif', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
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

const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'share-card-'));
const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--hide-scrollbars', '--force-color-profile=srgb', '--window-size=1200,630', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
const done = (code) => { try { chrome.kill('SIGKILL'); } catch {} server.close(); try { fs.rmSync(profile, { recursive: true, force: true }); } catch {} process.exit(code); };
setTimeout(() => { console.error('timed out'); done(1); }, 60000);

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
const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
const { sessionId: s } = await send('Target.attachToTarget', { targetId, flatten: true });
await send('Page.enable', {}, s);
await send('Runtime.enable', {}, s);
await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 2, mobile: false }, s);
await send('Page.navigate', { url: `http://127.0.0.1:${server.address().port}/tools/share-card/?v=${variant}` }, s);
await send('Runtime.evaluate', { expression: `new Promise((r) => { const t = setInterval(() => { if (document.documentElement.dataset.ready) { clearInterval(t); setTimeout(r, 300); } }, 50); })`, awaitPromise: true }, s);
const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } }, s);
fs.writeFileSync(png, Buffer.from(data, 'base64'));
execFileSync('python3', ['-c', 'import sys\nfrom PIL import Image\nImage.open(sys.argv[1]).convert("RGB").resize((1200, 630), Image.LANCZOS).save(sys.argv[2], "JPEG", quality=86, optimize=True, progressive=True)', png, out]);
console.log(`${png}\n${out}`);
if (errors.length) console.log('page errors:\n  ' + errors.join('\n  '));
done(0);
