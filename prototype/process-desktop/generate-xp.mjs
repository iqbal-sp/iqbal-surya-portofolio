// Concept 02: one native-looking XP window per episode, no surrounding props.
// node prototype/process-desktop/generate-xp.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'asset/Home/process/xp-window');
fs.mkdirSync(out,{recursive:true});
const C={ink:'#141414',blue:'#0053ee',navy:'#00138c',face:'#ece9d8',rule:'#d8d2bd',etched:'#aca899',green:'#86d13f',paper:'#fff',soft:'#d8e1f3'};
const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const r=(x,y,w,h,fill,rx=0,stroke='none',sw=1)=>`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"/>`;
const t=(x,y,s,size=28,fill=C.ink,weight=400,extra='')=>`<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-weight="${weight}" ${extra}>${esc(s)}</text>`;
const p=(d,stroke=C.ink,sw=2,fill='none',extra='')=>`<path d="${d}" stroke="${stroke}" stroke-width="${sw}" fill="${fill}" ${extra}/>`;
const g=(id,body,extra='')=>`<g id="${id}" ${extra}>${body}</g>`;
const noteIcon=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${p('M4 5L31 0L35 33L8 38Z','#346390',1.5,'#bce8ff')}${r(8,4,30,34,'#fffff5',0,'#6f8f9d',1.5)}${p('M11 13H33M11 19H33M11 25H27','#627e8c',1.3)}${p('M9 3V37','#78b8d0',3)}</g>`;
const folderIcon=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${p('M0 10H17L23 18H55V46H0Z','#ab780a',1.3,'#ecc556')}${p('M0 23L10 16H60L53 48H0Z','#a97609',1.3,'url(#folder)')}${p('M11 19H58','#fff5bf',1.5)}</g>`;
const paintIcon=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${p('M6 9C-8 21 5 41 25 33C32 30 30 23 23 24C18 25 21 20 25 18C34 9 16-2 6 9Z','#8b7240',1.2,'#f0d5a2')}<circle cx="9" cy="13" r="3" fill="#e9523e"/><circle cx="7" cy="23" r="3" fill="#0053ee"/><circle cx="17" cy="29" r="3" fill="#3c9a3c"/>${p('M16 23L32 0L36 3L21 27Z','#7d513b',1,'#a57551')}${p('M15 24L19 29L11 34Z','#397091',1,'#62bdd8')}</g>`;
const pictureIcon=(x,y,s=1)=>`<g transform="translate(${x} ${y}) scale(${s})">${r(0,4,38,30,'white',0,'#588097',1.5)}${r(4,8,30,22,'#a6d9f5')}<circle cx="27" cy="13" r="4" fill="#ffe96c"/>${p('M5 28L15 15L24 26L28 20L34 28Z','#398339',1,'#70b052')}</g>`;
const fileIcon=(x,y,s=1,kind='design')=>`<g transform="translate(${x} ${y}) scale(${s})">${p('M0 0H72L101 29V129H0Z','#527495',2,'url(#paper)')}${p('M72 0V29H101','#527495',2,'#dceaf6')}${kind==='components'?`${r(19,49,25,25,'#8db4f1',1,'#4273b0')}${r(54,49,25,25,'#c0eaa0',1,'#649c39')}${r(19,84,25,25,'#d6e5f9',1,'#4273b0')}${r(54,84,25,25,'#8db4f1',1,'#4273b0')}`:kind==='notes'?p('M19 52H80M19 69H80M19 86H69M19 103H57','#66839d',3):`${r(16,45,70,60,'#eef4fc',0,'#7b9bbe',2)}${r(16,45,70,13,'#0053ee')}${r(25,69,23,26,'#d7ecc0')}${p('M56 72H76M56 83H76M56 94H69','#7893af',3)}`}</g>`;

const W=1210,H=674;
function controls(){return g('window-controls',[0,1,2].map((n)=>{
  const x=W-143+n*44;
  return r(x,10,37,36,n===2?'url(#close-button)':'url(#caption-button)',4,'#fff',1.6)+
    (n===0?p(`M${x+8} 36H${x+21}`,'white',3):n===1?`${r(x+9,18,19,17,'none',0,'white',2.6)}${p(`M${x+9} 21H${x+28}`,'white',3)}`:p(`M${x+10} 19L${x+27} 36M${x+27} 19L${x+10} 36`,'white',3.4));
}).join(''));}
function menu(items){let x=21;return g('menu-bar',r(5,56,W-10,44,C.face)+items.map(s=>{const el=t(x,87,s,26);x+=s.length*14+28;return el;}).join('')+p(`M5 100H${W-5}`,C.rule,1.5));}
function status(left,right=''){return g('status-bar',r(5,H-38,W-10,33,C.face)+p(`M5 ${H-39}H${W-5}`,C.rule,1.5)+t(21,H-15,left,22,'#4a4942')+(right?p(`M${W-220} ${H-35}V${H-7}`,C.etched,1)+t(W-203,H-15,right,22,'#4a4942'):'')+p(`M${W-21} ${H-9}l11-11M${W-14} ${H-9}l4-4`,C.etched,1.5));}
function window(title,icon,body){return g('xp-window',
  `<g filter="url(#shadow)">${r(0,0,W,H,C.blue,10,C.navy,2)}${r(4,4,W-8,H-8,C.face,6,'#0831d9',2)}</g>`+
  r(2,2,W-4,54,'url(#caption)',8)+r(2,34,W-4,23,'url(#caption)')+
  p(`M10 4H${W-10}`,'#6bbdff',1.5)+icon+
  t(60,39,title,28,'#fff',700,'style="text-shadow:1px 1px #00309a"')+controls()+body,
  'transform="translate(245 138)"');}

const brief=window('Project brief.txt - Notepad',noteIcon(15,14,.8),
  menu(['File','Edit','Format','View','Help'])+r(5,102,W-10,H-144,'white')+
  g('brief-lines',t(62,226,'Scope:    __________',45,C.ink,400,'font-family="Noto Sans Mono, monospace"')+
    t(62,336,'Budget:   __________',45,C.ink,400,'font-family="Noto Sans Mono, monospace"')+
    t(62,446,'Timeline: __________',45,C.ink,400,'font-family="Noto Sans Mono, monospace"'))+
  g('text-caret',p('M63 500V545','#141414',2.5))+status('Project brief','Ln 4, Col 1'));

const tools=[
  p('M11 10H30V27H11Z','#444',1.5,'none','stroke-dasharray="3 3"'),
  p('M12 28L28 10L33 15L17 33Z','#705433',1.5,'#d6bc83'),
  p('M10 20H31M20 10V31','#222',1.5),
  p('M11 29L30 10','#252525',2.5),
  r(11,12,22,17,'none',0,'#252525',2),
  '<ellipse cx="22" cy="21" rx="11" ry="9" fill="none" stroke="#252525" stroke-width="2"/>'
];
function wireframe(x,label,selected=false){return g(`page-${label.toLowerCase()}`,`<g transform="translate(${x} 221)">`+
  r(0,0,238,240,'white',0,selected?'#0053ee':'#8290a3',selected?3:2)+r(1,1,236,47,selected?'#edf7df':'#f3f6fd')+
  t(119,33,label,29,C.ink,400,'text-anchor="middle"')+r(23,70,192,64,selected?'#d9ebc2':'#e9eef5')+
  r(23,154,163,9,'#aebcce')+r(23,178,134,9,'#c2cddd')+r(23,209,61,13,selected?'#86d13f':'#b1bfce')+`</g>`);}
const structure=window('Page map - Paint',paintIcon(14,13,.83),
  menu(['File','Edit','View','Image','Colors','Help'])+r(5,102,W-10,H-143,'#c0c0c0')+
  r(5,102,91,532,C.face)+g('paint-tools',tools.map((shape,i)=>`<g transform="translate(${9+i%2*42} ${118+Math.floor(i/2)*43})">${r(1,1,39,39,i===0?'#fff':'#ece9d8',0,i===0?'#7b9bce':'#aca899',1)}${shape}</g>`).join(''))+
  r(108,117,1085,478,'white',0,'#808080',1)+
  g('flow-connectors',p('M393 341H497M735 341H839','#728096',3)+p('M486 330L497 341L486 352M828 330L839 341L828 352','#728096',3))+
  wireframe(155,'Home')+wireframe(497,'Work',true)+wireframe(839,'Contact')+
  g('paint-palette',r(5,602,W-10,32,C.face)+['#000','#808080','#800000','#808000','#008000','#008080','#000080','#800080','#fff','#c0c0c0','#f00','#ff0','#0f0','#0ff','#00f','#f0f'].map((col,i)=>r(116+i*26,608,22,20,col,0,'#777',1)).join(''))+
  status('Page structure','3 pages'));

const design=window('Design review - Picture Viewer',pictureIcon(15,13,.8),
  r(5,58,W-10,H-98,'#f3f3f3')+
  g('design-preview',`<g transform="translate(163 105)">`+
    r(0,0,884,439,'white',0,'#c4c4c4',1)+r(0,0,884,71,'white')+
    r(31,22,27,27,'#0053ee',3)+t(73,45,'Studio',27,C.ink,700)+r(665,31,63,8,'#abb3ba')+r(757,31,96,8,'#abb3ba')+
    r(0,71,884,279,'#eaf1df')+t(45,150,'A clear next step.',48,C.ink,700)+r(46,177,346,11,'#b3bea9')+r(46,201,279,11,'#c4cebb')+
    r(46,246,190,56,'#0053ee',4)+t(141,283,'Explore',28,'white',700,'text-anchor="middle"')+
    `<circle cx="727" cy="209" r="92" fill="#b7d98e"/>`+
    [0,1,2].map(i=>r(45+i*274,373,249,35,'#eef1f4',2)).join('')+`</g>`)+
  g('cursor',`<g transform="translate(381 365)">${p('M0 0V69L19 50L32 80L45 74L31 44H59Z','#141414',2.8,'white')}</g>`)+
  g('viewer-toolbar',r(5,568,W-10,68,C.face)+[0,1,2,3,4,5].map(i=>{
    const x=463+i*49;
    let icon;
    if(i<2)icon=p(i===0?'M27 10L12 21L27 32Z':'M13 10L28 21L13 32Z','#4d6d89',1,'#7092ac');
    else if(i<4)icon='<circle cx="17" cy="17" r="9" fill="#f0f9ff" stroke="#577b96" stroke-width="2"/>'+p('M24 24L32 32','#577b96',4)+p('M12 17H22','#577b96',2)+(i===2?p('M17 12V22','#577b96',2):'');
    else icon=i===4?p('M10 11H31V31H10Z','#4d6d89',2,'#f9fcff'):p('M29 27C9 36 3 13 21 10M21 10L18 4M21 10L14 13','#3c9a3c',3);
    return `<g transform="translate(${x} 581)">${r(0,0,40,40,C.face,2,'#c9c6b9',1)}${icon}</g>`;
  }).join(''))+status('Design preview'));

const handoff=window('Final files',folderIcon(15,13,.65),
  menu(['File','Edit','View','Favorites','Tools','Help'])+
  g('address-bar',r(5,101,W-10,53,C.face)+t(22,137,'Address',24,'#55544e')+r(129,108,987,35,'white',0,'#9a9a91',1)+folderIcon(139,112,.48)+t(182,134,'Project / Final files',24)+p('M1091 122L1099 129L1107 122','#494941',2)+p('M1142 122H1170M1160 112L1170 122L1160 132','#3c9a3c',4))+
  r(5,155,W-10,H-195,'white')+
  g('final-files',[['Design','design'],['Components','components'],['Notes','notes']].map(([label,kind],i)=>{
    const x=236+i*365;
    return g(`file-${kind}`,fileIcon(x-61,267,1.22,kind)+t(x,479,label,36,C.ink,400,'text-anchor="middle"'));
  }).join(''))+status('3 objects'));

const font=fs.readFileSync(path.join(root,'asset/fonts/noto-sans-latin.woff2')).toString('base64');
const mono=fs.readFileSync(path.join(root,'asset/fonts/noto-sans-mono-latin.woff2')).toString('base64');
const defs=`<style>@font-face{font-family:'Noto Sans';src:url('data:font/woff2;base64,${font}') format('woff2');font-weight:100 900}@font-face{font-family:'Noto Sans Mono';src:url('data:font/woff2;base64,${mono}') format('woff2');font-weight:100 900}</style><defs>
<linearGradient id="caption" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#0997ff"/><stop offset=".14" stop-color="#0053ee"/><stop offset=".82" stop-color="#0053ee"/><stop offset="1" stop-color="#003dd7"/></linearGradient>
<radialGradient id="caption-button" cx="90%" cy="90%" r="125%"><stop stop-color="#0054e9"/><stop offset=".55" stop-color="#2263d5"/><stop offset=".7" stop-color="#4479e4"/><stop offset=".9" stop-color="#a3bbec"/><stop offset="1" stop-color="white"/></radialGradient>
<radialGradient id="close-button" cx="90%" cy="90%" r="125%"><stop stop-color="#cc4600"/><stop offset=".55" stop-color="#dc6527"/><stop offset=".7" stop-color="#cd7546"/><stop offset=".9" stop-color="#ffccb2"/><stop offset="1" stop-color="white"/></radialGradient>
<linearGradient id="folder" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#fff0a6"/><stop offset="1" stop-color="#e7b944"/></linearGradient>
<linearGradient id="paper" x1="0" y1="0" x2="1" y2="1"><stop stop-color="white"/><stop offset="1" stop-color="#e6eff8"/></linearGradient>
<filter id="shadow" x="-20%" y="-20%" width="140%" height="155%"><feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#001446" flood-opacity=".42"/></filter>
</defs>`;
const scenes=[
  ['ep1-brief','Agree on the work','One XP Notepad window with three brief fields: scope, budget and timeline.',brief,'Notepad'],
  ['ep2-structure','Map out the pages and flows','One XP Paint window showing three connected wireframe pages.',structure,'Paint'],
  ['ep3-review','Review the design','One XP Picture Viewer window with a single interface preview and cursor.',design,'Picture Viewer'],
  ['ep4-handoff','Prepare the final files','One XP Explorer window containing Design, Components and Notes.',handoff,'Explorer']
];
for(const [slug,title,description,body] of scenes){
  fs.writeFileSync(path.join(out,slug+'.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="1700" height="1000" viewBox="0 0 1700 1000" role="img" aria-labelledby="title desc"><title id="title">${esc(title)}</title><desc id="desc">${esc(description)}</desc>${defs}<g font-family="Noto Sans,Arial,sans-serif">${body}</g></svg>\n`);
}
fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({width:1700,height:1000,background:'transparent',style:'One XP window',concept:2,windowBounds:{x:245,y:138,width:W,height:H},crt:{wallpaper:'crt-wallpaper.svg',wallpaperPng:'crt-wallpaper.png',grain:'crt-grain.svg',stylesheet:'crt.css',channelTransitionMs:340},episodes:scenes.map(([slug,title,description,,application],i)=>({episode:i+1,slug,title,description,application,svg:slug+'.svg',png:slug+'.png',crtPng:slug+'-crt.png',crtWebp:slug+'-crt-850.webp'}))},null,2)+'\n');
console.log(`Wrote ${scenes.length} single-window XP SVGs to ${out}`);
