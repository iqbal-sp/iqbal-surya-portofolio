// Builds Home's paper: the grain of the printed guide its light sections are set on, as one seamless grey tile that
// home.css multiplies over the paper's colour (--print), so the colour stays a token and the tile only darkens it.
// Three layers, all wrapping at the tile's edge so the tile repeats without a seam:
//   cloud   soft unevenness in the pulp, value noise at 64 and 32px cells
//   tooth   the fine grain of the sheet, one value a pixel
//   fibres  a few short, faint strokes lying mostly along the web
// The darkest point is 10 levels under white, so the paper reads as a material, never as a pattern behind the words.
// usage: node tools/paper/build.mjs   (then bump the ?v= of home.css)
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const N = 256;
let seed = 20261013;
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);

// value noise on a wrapping lattice of cell px, smoothed
function cloud(cell) {
  const k = N / cell, g = Array.from({ length: k * k }, rnd), out = new Float32Array(N * N);
  const s = (t) => t * t * (3 - 2 * t);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const gx = x / cell, gy = y / cell, x0 = Math.floor(gx), y0 = Math.floor(gy), fx = s(gx - x0), fy = s(gy - y0);
    const v = (i, j) => g[((j % k) * k) + (i % k)];
    const a = v(x0, y0) + (v(x0 + 1, y0) - v(x0, y0)) * fx, b = v(x0, y0 + 1) + (v(x0 + 1, y0 + 1) - v(x0, y0 + 1)) * fx;
    out[y * N + x] = a + (b - a) * fy;
  }
  return out;
}
const c64 = cloud(64), c32 = cloud(32);
const dark = new Float32Array(N * N);
for (let i = 0; i < N * N; i++) dark[i] = (c64[i] * 0.6 + c32[i] * 0.4) * 4 + rnd() * 4;
// fibres: 70 short strokes, 6 to 22px, within 25 degrees of the horizontal
for (let f = 0; f < 70; f++) {
  let x = rnd() * N, y = rnd() * N; const len = 6 + rnd() * 16, a = (rnd() - 0.5) * 0.9, depth = 1.5 + rnd() * 2.5;
  for (let t = 0; t < len; t++) {
    const px = ((Math.round(x) % N) + N) % N, py = ((Math.round(y) % N) + N) % N;
    dark[py * N + px] += depth * Math.sin(Math.PI * t / len);
    x += Math.cos(a); y += Math.sin(a) + (rnd() - 0.5) * 0.3;
  }
}
// grey, filter byte 0 on each row
const raw = Buffer.alloc((N + 1) * N);
for (let y = 0; y < N; y++) { raw[y * (N + 1)] = 0; for (let x = 0; x < N; x++) raw[y * (N + 1) + 1 + x] = 255 - Math.min(10, Math.round(dark[y * N + x])); }

const CRC = Array.from({ length: 256 }, (_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; return c >>> 0; });
const crc32 = (buf) => { let c = 0xffffffff; for (const b of buf) c = CRC[(c ^ b) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
const chunk = (type, data) => {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type), data]), crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([len, body, crc]);
};
const head = Buffer.alloc(13); head.writeUInt32BE(N, 0); head.writeUInt32BE(N, 4); head[8] = 8; head[9] = 0;
const out = new URL('../../asset/Home/paper-grain-256.png', import.meta.url);
writeFileSync(out, Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', head), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
console.log('wrote', out.pathname);
