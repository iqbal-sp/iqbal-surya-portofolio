// Builds Phosphor OS's mark (asset/icon/phosphor-mark.svg): one lit spot glowing in a CRT's dark glass, in a beige
// bezel like the loading screen's computer. Drawn on a 20 by 20 grid, a unit a pixel: the spot's glow falls off with
// distance and is broken into the site's 4 by 4 ordered dither, in four phosphor greens over black. Each colour is
// one path of row runs, so the file stays small and sharp at any whole-number scale (show it with
// image-rendering: pixelated).
// usage: node tools/phosphor-mark/build.mjs   (then bump phosphor-mark.svg?v= where the site uses it)
import { writeFileSync } from 'node:fs';

const N = 20;
const GLOW = ['#000000', '#0c3a16', '#1d7a33', '#4cda50', '#d9ffd6'];   // off, deep, mid, phosphor, core
const BEZEL = { rim: '#3b3528', lit: '#efe7d1', face: '#cfc4a6' };
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);
const RADIUS = 2.6;   // how far the glow carries, in pixels

// inside a rounded rectangle from (x0, y0) to (x1, y1) with corner radius r
function inRound(x, y, x0, y0, x1, y1, r) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r), cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return Math.hypot(x - cx, y - cy) <= r + 0.2;
}
const core = [[9, 9], [10, 9], [9, 10], [10, 10]];
const isCore = (x, y) => core.some(([a, b]) => a === x && b === y);

// the colour of each pixel, or null outside the bezel
function colour(x, y) {
  if (!inRound(x, y, 0, 1, 19, 18, 3)) return null;
  if (!inRound(x, y, 2, 3, 17, 16, 2)) {
    if (!inRound(x, y, 1, 2, 18, 17, 3)) return BEZEL.rim;
    return y < 3 || x < 2 ? BEZEL.lit : BEZEL.face;
  }
  if (isCore(x, y)) return GLOW[4];
  const d = Math.min(...core.map(([a, b]) => Math.hypot(a - x, b - y)));
  const glow = Math.exp(-(d - 1) / RADIUS) * 3;
  return GLOW[Math.max(0, Math.min(3, Math.floor(glow + BAYER[(y & 3) * 4 + (x & 3)] - 0.5)))];
}

const paths = new Map();
for (let y = 0; y < N; y++) {
  for (let x = 0; x < N;) {
    const c = colour(x, y);
    let e = x + 1;
    while (e < N && colour(e, y) === c) e++;
    if (c) paths.set(c, (paths.get(c) || '') + `M${x} ${y}h${e - x}v1h-${e - x}z`);
    x = e;
  }
}
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}" width="${N}" height="${N}" shape-rendering="crispEdges">`
  + [...paths].map(([c, d]) => `<path fill="${c}" d="${d}"/>`).join('') + '</svg>\n';
writeFileSync(new URL('../../asset/icon/phosphor-mark.svg', import.meta.url), svg);
console.log('wrote asset/icon/phosphor-mark.svg', svg.length, 'bytes');
