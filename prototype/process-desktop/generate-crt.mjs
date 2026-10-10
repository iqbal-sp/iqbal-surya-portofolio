// Background and reusable surface layers, kept separate from editable XP windows.
// node prototype/process-desktop/generate-crt.mjs
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const out=path.join(root,'asset/Home/process/xp-window');
fs.mkdirSync(out,{recursive:true});
const wallpaper=`<svg xmlns="http://www.w3.org/2000/svg" width="1700" height="1000" viewBox="0 0 1700 1000" role="img" aria-labelledby="title desc">
<title id="title">Blue CRT wallpaper</title><desc id="desc">Deep broadcast blue with a softly lit cobalt ribbon flowing across the desktop.</desc>
<defs>
<radialGradient id="ground" cx="39%" cy="29%" r="85%"><stop stop-color="#224d91"/><stop offset=".48" stop-color="#143366"/><stop offset="1" stop-color="#08172f"/></radialGradient>
<linearGradient id="ribbon" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#7bbaff" stop-opacity=".08"/><stop offset=".26" stop-color="#4096fa" stop-opacity=".36"/><stop offset=".56" stop-color="#1d56b8" stop-opacity=".09"/><stop offset=".9" stop-color="#479ce8" stop-opacity=".27"/><stop offset="1" stop-color="#c2e1ff" stop-opacity=".09"/></linearGradient>
<linearGradient id="edge" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#90c4ff" stop-opacity=".02"/><stop offset=".25" stop-color="#9bcaff" stop-opacity=".21"/><stop offset=".55" stop-color="#66a6ee" stop-opacity=".02"/><stop offset=".92" stop-color="#b0d9ff" stop-opacity=".2"/></linearGradient>
<radialGradient id="bloom"><stop stop-color="#2b81ed" stop-opacity=".19"/><stop offset="1" stop-color="#2b81ed" stop-opacity="0"/></radialGradient>
<filter id="soft"><feGaussianBlur stdDeviation="24"/></filter>
</defs>
<rect width="1700" height="1000" fill="url(#ground)"/>
<ellipse cx="230" cy="780" rx="660" ry="450" fill="url(#bloom)"/>
<ellipse cx="1630" cy="60" rx="480" ry="650" fill="url(#bloom)"/>
<path d="M-175 818C147 291 577 859 981 637S1527 339 1820-174" fill="none" stroke="url(#ribbon)" stroke-width="174"/>
<path d="M-175 818C147 291 577 859 981 637S1527 339 1820-174" fill="none" stroke="#5da9f9" stroke-opacity=".075" stroke-width="210" filter="url(#soft)"/>
<path d="M-175 725C147 198 577 766 981 544S1527 246 1820-267" fill="none" stroke="url(#edge)" stroke-width="2"/>
<path d="M-100 1210C95 837 493 770 816 867S1530 735 1810 653" fill="none" stroke="#568dd5" stroke-width="142" stroke-opacity=".05"/>
</svg>\n`;
const grain=`<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><filter id="grain" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".78" numOctaves="3" seed="8" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter><rect width="128" height="128" filter="url(#grain)"/></svg>\n`;
fs.writeFileSync(path.join(out,'crt-wallpaper.svg'),wallpaper);
fs.writeFileSync(path.join(out,'crt-grain.svg'),grain);
console.log('Wrote blue ribbon wallpaper and seamless monochrome grain.');
