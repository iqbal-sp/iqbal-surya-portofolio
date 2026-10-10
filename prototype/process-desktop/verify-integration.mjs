// Check the real portfolio, rather than the isolated asset preview.
// PROCESS_DESKTOP_RUNTIME=/path/to/node_modules node prototype/process-desktop/verify-integration.mjs
// Requires the existing static preview server at PROCESS_DESKTOP_URL or localhost:7421.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const require=createRequire(path.join(process.env.PROCESS_DESKTOP_RUNTIME,'package.json'));
const {chromium}=require('playwright');
const base=process.env.PROCESS_DESKTOP_URL||'http://127.0.0.1:7421';
const out=path.join(root,'prototype/process-desktop/integration');
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
const results=[];
try{
  for(const [label,viewport,reduced] of [
    ['desktop',{width:1440,height:1100},false],
    ['mobile',{width:390,height:844},true],
  ]){
    const context=await browser.newContext({viewport,locale:'en-US',reducedMotion:reduced?'reduce':'no-preference'});
    const page=await context.newPage();
    const errors=[],badAssets=[],requests=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('request',r=>requests.push(r.url()));
    page.on('response',r=>{if(r.url().includes('/process/xp-window/')&&!r.ok())badAssets.push(r.url());});
    await page.goto(`${base}/option-a-desktop/?preview&wall=static#/home`,{waitUntil:'load'});
    const home=page.locator('.win[data-id="home"]');
    await home.waitFor({state:'visible'});
    if(label==='desktop')await home.locator('[data-wact="max"]').click();
    const section=home.locator('#hm-eps');
    await section.scrollIntoViewIfNeeded();
    await page.evaluate(()=>document.fonts.ready);
    const expectEpisode=async i=>{
      const slug=['ep1-brief','ep2-structure','ep3-review','ep4-handoff'][i];
      await page.waitForFunction(({slug,i})=>{
        const s=document.querySelector('.win[data-id="home"] .pe-screen');
        const img=s?.querySelector('img');
        const key=document.querySelector(`.win[data-id="home"] .rm-num[data-i="${i}"]`);
        return img?.src.endsWith(slug+'.svg')&&img.complete&&img.naturalWidth===1700&&key?.getAttribute('aria-pressed')==='true';
      },{slug,i});
      const title=await page.evaluate(i=>PF.t(PF.home.process.steps[i].title,PF.getLang()),i);
      await home.locator('.pe-now .pe-title').filter({hasText:title}).waitFor();
      if(await home.locator('.rm-num[aria-pressed="true"]').count()!==1)throw new Error('Multiple selected episode keys');
    };
    for(let i=0;i<4;i++){
      await home.locator(`.rm-num[data-i="${i}"]`).click();
      await expectEpisode(i);
      if(reduced&&await home.locator('.pe-screen').evaluate(el=>el.classList.contains('channel-change')))throw new Error('Reduced-motion channel still animates');
      await section.screenshot({path:path.join(out,`${label}-ep${i+1}.png`),animations:'disabled'});
    }
    await home.locator('.rm-num[data-i="0"]').click();
    await home.locator('.rm-num[data-i="0"]').focus();await page.keyboard.press('ArrowRight');await expectEpisode(1);
    await page.keyboard.press('4');await expectEpisode(3);
    await page.keyboard.press('ArrowRight');await expectEpisode(0);
    if(!reduced){
      await home.locator('.rm-go').click();await expectEpisode(1);
      const transition=await home.locator('.crt-channel').evaluate(el=>getComputedStyle(el).animationName);
      if(transition!=='crt-channel-change')throw new Error('Desktop channel sweep missing');
      await home.locator('.rm-prev').click();await expectEpisode(0);
    }
    const styles=await home.locator('.pe-screen').evaluate(el=>({
      wallpaper:getComputedStyle(el).backgroundImage,
      glass:getComputedStyle(el.querySelector('.crt-surface')).opacity,
      pointer:getComputedStyle(el.querySelector('.crt-surface')).pointerEvents,
      grain:getComputedStyle(el.querySelector('.crt-grain')).backgroundImage,
      svgRendering:getComputedStyle(el.querySelector('.pe-img')).imageRendering,
    }));
    if(!styles.wallpaper.includes('crt-wallpaper.svg')||styles.glass!=='1'||styles.pointer!=='none'||!styles.grain.includes('crt-grain.svg')||styles.svgRendering==='pixelated')throw new Error('Incorrect CRT layer styles');
    await page.locator('#langBtn').click();
    await expectEpisode(0);
    if(await home.locator('.pe-img').getAttribute('alt')!=='Jendela Notepad Windows XP dengan kolom cakupan, anggaran, dan jadwal')throw new Error('Indonesian alt text missing');
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({path:path.join(out,`${label}-indonesian.png`),animations:'disabled'});
    const size=await section.evaluate(el=>{
      const body=el.closest('.win-body'),r=el.getBoundingClientRect(),b=body.getBoundingClientRect();
      return {overflow:body.scrollWidth-body.clientWidth,left:r.left-b.left,right:r.right-b.right};
    });
    if(size.overflow>1||size.left < -1||size.right>1)throw new Error('Process section overflows horizontally: '+JSON.stringify(size));
    if(await home.locator('.desk3d, .pe-screen canvas').count())throw new Error('Old 3D desk still mounted');
    if(requests.some(url=>url.includes('/desk3d/')))throw new Error('Old desk module still requested');
    if(errors.length||badAssets.length)throw new Error(JSON.stringify({errors,badAssets}));
    results.push({viewport:label,episodes:4,remote:'clicks, arrows, digits and wraparound',localisation:'English and Indonesian',crt:'wallpaper, glass, grain and transition',reducedMotion:reduced,overflow:0,deskRequests:0,pageErrors:0});
    await context.close();
  }
  fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(results,null,2)+'\n');
  console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
