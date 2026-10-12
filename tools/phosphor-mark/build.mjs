// Builds Phosphor OS's mark and the site's tab icons from it: one lit spot glowing in a CRT's dark glass, in a beige
// bezel like the loading screen's computer. The spot's glow falls off with distance and is broken into the site's
// 4 by 4 ordered dither, in four phosphor greens over black. Two grids, each drawn a pixel a unit:
//   20 by 20  asset/icon/phosphor-mark.svg   the Start button, the BIOS, the welcome screen, About this portfolio
//             asset/icon/apple-touch-icon.png  seven times over, on the taskbar's blue (a home screen wants it opaque)
//   16 by 16  asset/icon/favicon.svg, favicon.ico (16, 32 and 48: one, two and three times over), so a tab's icon
//             lands on whole pixels
// Each SVG colour is one path of row runs, small and sharp at any whole-number scale (show it with
// image-rendering: pixelated). The PNGs are written here with zlib alone.
// usage: node tools/phosphor-mark/build.mjs   (then bump the ?v= of each file where the site links it)
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const GLOW = ['#000000', '#0c3a16', '#1d7a33', '#4cda50', '#d9ffd6'];   // off, deep, mid, phosphor, core
const BEZEL = { rim: '#3b3528', lit: '#efe7d1', face: '#cfc4a6' };
const BACKDROP = '#245edb';   // the taskbar's blue, behind the home-screen icon
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16);

// the bezel's outer edge, its rim's inner edge and the glass, each [x0, y0, x1, y1, corner radius]; the lit spot's
// pixels; and how far its glow carries
const GRIDS = {
  20: { outer: [0, 1, 19, 18, 3], rim: [1, 2, 18, 17, 3], glass: [2, 3, 17, 16, 2], core: [[9, 9], [10, 9], [9, 10], [10, 10]], radius: 2.6 },
  16: { outer: [0, 1, 15, 14, 2], rim: [1, 2, 14, 13, 2], glass: [2, 3, 13, 12, 1], core: [[7, 7], [8, 7], [7, 8], [8, 8]], radius: 2.0 },
};

function inRound(x, y, [x0, y0, x1, y1, r]) {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r), cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return Math.hypot(x - cx, y - cy) <= r + 0.2;
}

// the grid's pixels as colours, null outside the bezel
function pixels(n) {
  const g = GRIDS[n];
  const at = (x, y) => {
    if (!inRound(x, y, g.outer)) return null;
    if (!inRound(x, y, g.glass)) {
      if (!inRound(x, y, g.rim)) return BEZEL.rim;
      return y < g.glass[1] || x < g.glass[0] ? BEZEL.lit : BEZEL.face;
    }
    if (g.core.some(([a, b]) => a === x && b === y)) return GLOW[4];
    const d = Math.min(...g.core.map(([a, b]) => Math.hypot(a - x, b - y)));
    const glow = Math.exp(-(d - 1) / g.radius) * 3;
    return GLOW[Math.max(0, Math.min(3, Math.floor(glow + BAYER[(y & 3) * 4 + (x & 3)] - 0.5)))];
  };
  return Array.from({ length: n }, (_, y) => Array.from({ length: n }, (_, x) => at(x, y)));
}

function svg(n) {
  const px = pixels(n), paths = new Map();
  px.forEach((row, y) => {
    for (let x = 0; x < n;) {
      const c = row[x];
      let e = x + 1;
      while (e < n && row[e] === c) e++;
      if (c) paths.set(c, (paths.get(c) || '') + `M${x} ${y}h${e - x}v1h-${e - x}z`);
      x = e;
    }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n} ${n}" width="${n}" height="${n}" shape-rendering="crispEdges">`
    + [...paths].map(([c, d]) => `<path fill="${c}" d="${d}"/>`).join('') + '</svg>\n';
}

/* ---- PNG: the grid scaled k times, at an offset on a canvas of a size, transparent or on a backdrop ---- */
const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
function png(n, k, size = n * k, backdrop = null) {
  const px = pixels(n), off = (size - n * k) >> 1;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;   // no filter
    for (let x = 0; x < size; x++) {
      const gx = Math.floor((x - off) / k), gy = Math.floor((y - off) / k);
      const c = gx >= 0 && gy >= 0 && gx < n && gy < n ? px[gy][gx] : null;
      const fill = c || backdrop, i = y * (size * 4 + 1) + 1 + x * 4;
      if (fill) { const [r, g, b] = rgb(fill); raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = 255; }
    }
  }
  const head = Buffer.alloc(13);
  head.writeUInt32BE(size, 0); head.writeUInt32BE(size, 4); head[8] = 8; head[9] = 6;   // 8-bit RGBA
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}
// an ICO of PNG images
function ico(images) {
  const dir = Buffer.alloc(6 + images.length * 16);
  dir.writeUInt16LE(0, 0); dir.writeUInt16LE(1, 2); dir.writeUInt16LE(images.length, 4);
  let offset = dir.length;
  images.forEach(({ size, data }, i) => {
    const e = 6 + i * 16;
    dir[e] = size >= 256 ? 0 : size; dir[e + 1] = size >= 256 ? 0 : size;
    dir.writeUInt16LE(1, e + 4); dir.writeUInt16LE(32, e + 6);
    dir.writeUInt32LE(data.length, e + 8); dir.writeUInt32LE(offset, e + 12);
    offset += data.length;
  });
  return Buffer.concat([dir, ...images.map((x) => x.data)]);
}

const out = (p) => new URL(`../../${p}`, import.meta.url);
const files = {
  'asset/icon/phosphor-mark.svg': svg(20),
  'asset/icon/favicon.svg': svg(16),
  'asset/icon/apple-touch-icon.png': png(20, 7, 180, BACKDROP),
  'favicon.ico': ico([16, 32, 48].map((s) => ({ size: s, data: png(16, s / 16) }))),
};
for (const [p, data] of Object.entries(files)) { writeFileSync(out(p), data); console.log('wrote', p, data.length, 'bytes'); }
