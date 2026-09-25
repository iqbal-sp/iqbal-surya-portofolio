// Prints resume/cv.html to one A4 PDF per language in asset/cv/, with Google Chrome in headless mode.
// Run: node resume/build.mjs   (Node 22 or newer; set CHROME=/path/to/chrome if Chrome is not in /Applications)
// Chrome is driven over the DevTools protocol so the page is printed only after its web font has loaded,
// and Chrome is closed afterwards (the plain --print-to-pdf switch leaves it running on macOS).
import { spawn } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const out = path.join(here, '..', 'asset', 'cv');
const chrome = process.env.CHROME || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
// the site links these names from PF.owner.cv in shared/content.js
const files = { en: 'Iqbal-Surya-Pratama-Resume.pdf', id: 'Iqbal-Surya-Pratama-CV.pdf' };

const profile = mkdtempSync(path.join(tmpdir(), 'cv-chrome-'));
const proc = spawn(chrome, ['--headless=new', '--disable-gpu', '--no-first-run', '--remote-debugging-port=0', `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });

const wsUrl = await new Promise((resolve, reject) => {
  let log = '';
  const timer = setTimeout(() => reject(new Error(`Chrome did not start:\n${log}`)), 20000);
  proc.stderr.on('data', (d) => {
    log += d;
    const m = log.match(/DevTools listening on (ws:\/\/\S+)/);
    if (m) { clearTimeout(timer); resolve(m[1]); }
  });
  proc.on('exit', () => reject(new Error(`Chrome exited early:\n${log}`)));
});

const ws = new WebSocket(wsUrl);
await new Promise((resolve, reject) => { ws.onopen = resolve; ws.onerror = reject; });
let nextId = 0;
const pending = new Map();
const waiters = [];
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    if (msg.error) reject(new Error(msg.error.message)); else resolve(msg.result);
  } else if (msg.method) {
    for (const w of waiters.slice()) if (w.method === msg.method && w.sessionId === msg.sessionId) { waiters.splice(waiters.indexOf(w), 1); w.resolve(msg.params); }
  }
};
const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
  const id = ++nextId;
  pending.set(id, { resolve, reject });
  ws.send(JSON.stringify({ id, method, params, sessionId }));
});
const once = (method, sessionId) => new Promise((resolve) => waiters.push({ method, sessionId, resolve }));

try {
  mkdirSync(out, { recursive: true });
  for (const [lang, name] of Object.entries(files)) {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Page.enable', {}, sessionId);
    // Google Fonts sends a modern browser the variable Space Grotesk, which Chrome can only put in a PDF as
    // Type3 glyphs (text extracts badly, so CV-screening software misreads it). An old user agent gets one
    // static TrueType file per weight instead, which Chrome embeds as a real font.
    await send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/4.0' }, sessionId);
    const loaded = once('Page.loadEventFired', sessionId);
    await send('Page.navigate', { url: `${pathToFileURL(path.join(here, 'cv.html')).href}?lang=${lang}` }, sessionId);
    await loaded;
    // wait for Space Grotesk (a fallback face would print silently otherwise) and for the portrait
    const { result } = await send('Runtime.evaluate', {
      expression: `(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.decode().catch(() => {}))); return document.fonts.check('700 12px "Space Grotesk"') && document.fonts.check('400 12px "Space Grotesk"'); })()`,
      awaitPromise: true, returnByValue: true,
    }, sessionId);
    if (!result.value) throw new Error(`Space Grotesk did not load for ${lang}; check the network and try again`);
    const { data } = await send('Page.printToPDF', { preferCSSPageSize: true, printBackground: true, generateTaggedPDF: true }, sessionId);
    writeFileSync(path.join(out, name), Buffer.from(data, 'base64'));
    console.log(`${lang}: asset/cv/${name} (${Math.round(Buffer.byteLength(data, 'base64') / 1024)} KB)`);
    await send('Target.closeTarget', { targetId });
  }
  await send('Browser.close').catch(() => {});
} finally {
  ws.close();
  // let Chrome finish writing its profile before the folder is removed
  if (proc.exitCode === null) {
    const exited = new Promise((resolve) => proc.once('exit', resolve));
    const timer = setTimeout(() => proc.kill(), 5000);
    await exited;
    clearTimeout(timer);
  }
  rmSync(profile, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
}
