// Uses Playwright and Sharp from an existing runtime; does not install packages.
// PROCESS_DESKTOP_RUNTIME=/path/to/node_modules node prototype/process-desktop/render.mjs
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const runtime=process.env.PROCESS_DESKTOP_RUNTIME;
const require=runtime?createRequire(path.join(runtime,'package.json')):createRequire(import.meta.url);
const {chromium}=require('playwright');
const sharp=require('sharp');
const out=path.join(root,'asset/Home/process/xp-window');
const manifest=JSON.parse(fs.readFileSync(path.join(out,'manifest.json')));
const types={'.html':'text/html','.css':'text/css','.svg':'image/svg+xml','.woff2':'font/woff2','.png':'image/png'};
const server=http.createServer((req,res)=>{
  const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  let file=path.resolve(root,'.'+pathname);
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');const data=fs.readFileSync(file);res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'}).end(data);}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`;
let browser;
try{
  browser=await chromium.launch({executablePath:process.env.PROCESS_DESKTOP_CHROME||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  const page=await browser.newPage({viewport:{width:1700,height:1000},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const ep of manifest.episodes){
    await page.goto(`${base}/asset/Home/process/xp-window/${ep.svg}`);
    await page.evaluate(()=>document.fonts.ready);
    await page.screenshot({path:path.join(out,ep.png),omitBackground:true});
    const im=sharp(path.join(out,ep.png));const metadata=await im.metadata();const stats=await im.stats();
    if(metadata.width!==1700||metadata.height!==1000||!metadata.hasAlpha||stats.isOpaque)throw new Error(`Incorrect PNG export: ${ep.png}`);
    // 850px is a convenient retina-size derivative for the existing TV.
    await sharp(path.join(out,ep.png)).resize(850,500).webp({quality:90}).toFile(path.join(out,ep.slug+'-850.webp'));
    console.log(`${ep.png}: 1700×1000, transparent`);
  }
  await page.goto(`${base}/asset/Home/process/xp-window/crt-wallpaper.svg`);
  await page.screenshot({path:path.join(out,'crt-wallpaper.png')});
  for(const ep of manifest.episodes){
    await page.goto(`${base}/prototype/process-desktop/?render=1&ep=${ep.episode}`);
    await page.evaluate(async()=>{await document.fonts.ready;await document.getElementById('active-asset').decode();});
    await page.locator('.screen').screenshot({path:path.join(out,ep.slug+'-crt.png'),animations:'disabled'});
    const meta=await sharp(path.join(out,ep.slug+'-crt.png')).metadata();
    if(meta.width!==1700||meta.height!==1000)throw new Error('Incorrect composed asset dimensions');
    await sharp(path.join(out,ep.slug+'-crt.png')).resize(850,500).webp({quality:90}).toFile(path.join(out,ep.slug+'-crt-850.webp'));
    console.log(`${ep.slug}-crt.png: 1700×1000, complete CRT composition`);
  }
  await page.setViewportSize({width:1360,height:1130});
  await page.goto(`${base}/prototype/process-desktop/?board=1`);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  await page.screenshot({path:path.join(out,'contact-sheet.png'),fullPage:true});
  // Exercise all episode keys, download targets and the texture toggle.
  await page.goto(`${base}/prototype/process-desktop/`);
  for(let i=0;i<4;i++){
    await page.locator(`[data-ep="${i}"]`).click();
    const current=await page.locator('#active-asset').getAttribute('src');
    if(!current.endsWith(manifest.episodes[i].svg))throw new Error('Incorrect episode selection');
    if(await page.locator(`[data-ep="${i}"]`).getAttribute('aria-pressed')!=='true')throw new Error('Incorrect active key');
    const png=await page.locator('#png-link').getAttribute('href');
    if(!(await page.request.get(new URL(png,page.url()).href)).ok())throw new Error('Missing PNG download');
  }
  await page.locator('[data-ep="0"]').click();
  await page.locator('[data-ep="1"]').click();
  const transition=await page.locator('.crt-channel').evaluate(el=>getComputedStyle(el).animationName);
  if(transition!=='crt-channel-change')throw new Error('Channel transition was not enabled');
  await page.locator('#crt-toggle').click();
  if(await page.locator('#crt-toggle').getAttribute('aria-pressed')!=='false')throw new Error('CRT toggle failed');
  await page.setViewportSize({width:1360,height:1130});
  await page.goto(`${base}/prototype/process-desktop/?board=1`);
  await page.locator('#crt-toggle').click();
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
  await page.screenshot({path:path.join(out,'contact-sheet-clean.png'),fullPage:true});
  await page.goto(`${base}/prototype/process-desktop/`);
  await page.locator('[data-ep="0"]').click();await page.locator('[data-ep="0"]').focus();await page.keyboard.press('ArrowRight');
  if(await page.locator('[data-ep="1"]').getAttribute('aria-pressed')!=='true')throw new Error('Keyboard selection failed');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-ep="0"]').click();
  const reduced=await page.locator('.crt-channel').evaluate(el=>getComputedStyle(el).animationName);
  if(reduced!=='none')throw new Error('Channel animation ignores reduced motion');
  await page.locator('.screen').screenshot({path:path.join(out,'tv-preview.png'),animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('[data-ep="0"]').click();
  await page.screenshot({path:path.join(out,'mobile-preview.png'),fullPage:true});
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);
  if(overflow)throw new Error('Preview overflows on mobile');
  if(errors.length)throw new Error(errors.join('\n'));
  console.log('Preview verified: 4 episode keys, downloads, CRT toggle, channel transition, reduced motion, keyboard, mobile width, no page errors.');
}finally{if(browser)await browser.close();server.close();}
