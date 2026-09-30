// Builds SSXP Pixel, Screen Saver XP's screen letters, from glyphs.mjs with no dependencies: each lit pixel's edges are
// traced into outlines, so a letter is one clean contour (plus its holes) on a grid of 125 units, 8 pixels to the em.
// The TrueType font is made first, then wrapped as WOFF, the file the site serves.
// usage: node tools/ssxp-pixel/build.mjs asset/fonts   (then bump ssxp-pixel.woff?v= in option-a-desktop/screensaver.js)
import { writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';
import { GLYPHS, NOTDEF } from './glyphs.mjs';

const OUT = process.argv[2] || '.';
const PX = 125, EM = 1000, ASC = 1000, DESC = 250, CAP = 7 * PX, XH = 5 * PX;
const FAMILY = 'SSXP Pixel', PS = 'SSXPPixel-Regular', VERSION = 'Version 1.000';

// ---- outlines: trace the lit cells' boundary into closed contours, clockwise outside and counter-clockwise holes
function outline(rows) {
  const h = rows.length, w = Math.max(...rows.map((r) => r.length));
  const lit = (r, c) => r >= 0 && r < h && c >= 0 && c < w && rows[r][c] === '#';
  const edges = new Map(); // "x,y" -> list of [x2, y2]
  const add = (x1, y1, x2, y2) => { const k = `${x1},${y1}`; if (!edges.has(k)) edges.set(k, []); edges.get(k).push([x2, y2]); };
  for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) {
    if (!lit(r, c)) continue;
    const top = 7 - r, bot = 6 - r;
    if (!lit(r - 1, c)) add(c, top, c + 1, top);           // top, going right
    if (!lit(r, c + 1)) add(c + 1, top, c + 1, bot);       // right, going down
    if (!lit(r + 1, c)) add(c + 1, bot, c, bot);           // bottom, going left
    if (!lit(r, c - 1)) add(c, bot, c, top);               // left, going up
  }
  const contours = [];
  const take = (k, dir) => {
    const list = edges.get(k);
    if (!list || !list.length) return null;
    let i = 0;
    if (list.length > 1 && dir) {
      // where two cells meet only at a corner, turn right, so each keeps its own contour
      const [x, y] = k.split(',').map(Number);
      const right = [dir[1], -dir[0]];
      i = Math.max(0, list.findIndex(([x2, y2]) => Math.sign(x2 - x) === right[0] && Math.sign(y2 - y) === right[1]));
    }
    const e = list.splice(i, 1)[0];
    if (!list.length) edges.delete(k);
    return e;
  };
  while (edges.size) {
    const startKey = edges.keys().next().value;
    const pts = [startKey.split(',').map(Number)];
    let k = startKey, dir = null;
    for (;;) {
      const [x, y] = k.split(',').map(Number);
      const nx = take(k, dir);
      if (!nx) break;
      dir = [Math.sign(nx[0] - x), Math.sign(nx[1] - y)];
      k = `${nx[0]},${nx[1]}`;
      if (k === startKey) break;
      pts.push(nx);
    }
    // drop the points in the middle of a straight run
    const simple = pts.filter((p, i) => {
      const a = pts[(i - 1 + pts.length) % pts.length], b = pts[(i + 1) % pts.length];
      return !((a[0] === p[0] && p[0] === b[0]) || (a[1] === p[1] && p[1] === b[1]));
    });
    contours.push(simple.map(([x, y]) => [x * PX, y * PX]));
  }
  return { contours, width: w };
}

// ---- binary helpers
class Buf {
  constructor() { this.a = []; }
  u8(v) { this.a.push(v & 255); return this; }
  u16(v) { this.a.push((v >> 8) & 255, v & 255); return this; }
  i16(v) { return this.u16(v < 0 ? v + 65536 : v); }
  u32(v) { this.a.push((v >>> 24) & 255, (v >>> 16) & 255, (v >>> 8) & 255, v & 255); return this; }
  tag(s) { for (const ch of s) this.u8(ch.charCodeAt(0)); return this; }
  bytes(b) { for (const v of b) this.a.push(v); return this; }
  pad4() { while (this.a.length % 4) this.a.push(0); return this; }
  get length() { return this.a.length; }
  out() { return Uint8Array.from(this.a); }
}
const checksum = (bytes) => {
  let sum = 0;
  for (let i = 0; i < bytes.length; i += 4) sum = (sum + (((bytes[i] << 24) | ((bytes[i + 1] || 0) << 16) | ((bytes[i + 2] || 0) << 8) | (bytes[i + 3] || 0)) >>> 0)) >>> 0;
  return sum;
};

// ---- glyphs in code point order, so each run of code points maps onto a run of glyph ids
const chars = Object.keys(GLYPHS).sort((a, b) => a.codePointAt(0) - b.codePointAt(0));
const glyphs = [{ name: '.notdef', ...outline(NOTDEF) }, ...chars.map((ch) => ({ ch, ...outline(GLYPHS[ch]) }))];
for (const g of glyphs) g.advance = (g.width + 1) * PX;

const glyf = new Buf(), loca = [];
let maxPoints = 0, maxContours = 0;
const bbox = { xMin: 1e9, yMin: 1e9, xMax: -1e9, yMax: -1e9 };
for (const g of glyphs) {
  loca.push(glyf.length);
  const pts = g.contours.flat();
  if (!pts.length) { g.xMin = 0; g.xMax = 0; continue; }
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  g.xMin = Math.min(...xs); g.xMax = Math.max(...xs); g.yMin = Math.min(...ys); g.yMax = Math.max(...ys);
  bbox.xMin = Math.min(bbox.xMin, g.xMin); bbox.yMin = Math.min(bbox.yMin, g.yMin); bbox.xMax = Math.max(bbox.xMax, g.xMax); bbox.yMax = Math.max(bbox.yMax, g.yMax);
  maxPoints = Math.max(maxPoints, pts.length); maxContours = Math.max(maxContours, g.contours.length);
  glyf.i16(g.contours.length).i16(g.xMin).i16(g.yMin).i16(g.xMax).i16(g.yMax);
  let end = -1;
  for (const c of g.contours) { end += c.length; glyf.u16(end); }
  glyf.u16(0); // no instructions
  const flags = [], xb = new Buf(), yb = new Buf();
  let px = 0, py = 0;
  for (const [x, y] of pts) {
    const dx = x - px, dy = y - py; px = x; py = y;
    let f = 1;
    if (dx === 0) f |= 16; else if (Math.abs(dx) < 256) { f |= 2; if (dx > 0) f |= 16; xb.u8(Math.abs(dx)); } else xb.i16(dx);
    if (dy === 0) f |= 32; else if (Math.abs(dy) < 256) { f |= 4; if (dy > 0) f |= 32; yb.u8(Math.abs(dy)); } else yb.i16(dy);
    flags.push(f);
  }
  glyf.bytes(flags).bytes(xb.a).bytes(yb.a).pad4();
}
loca.push(glyf.length);
const n = glyphs.length;

// ---- the tables
const T = {};
const now = BigInt(Math.floor(Date.UTC(2026, 8, 29) / 1000)) + 2082844800n; // seconds since 1904
const longDate = (b) => { b.u32(Number(now >> 32n)); b.u32(Number(now & 0xffffffffn)); };
{
  const b = new Buf();
  b.u16(1).u16(0).u32(0x00010000).u32(0).u32(0x5f0f3cf5).u16(0x0003).u16(EM);
  longDate(b); longDate(b);
  b.i16(bbox.xMin).i16(bbox.yMin).i16(bbox.xMax).i16(bbox.yMax).u16(0).u16(8).i16(2).i16(1).i16(0);
  T.head = b;
}
{
  const b = new Buf();
  const advMax = Math.max(...glyphs.map((g) => g.advance));
  const minRsb = Math.min(...glyphs.map((g) => g.advance - g.xMax));
  b.u32(0x00010000).i16(ASC).i16(-DESC).i16(0).u16(advMax).i16(0).i16(minRsb).i16(bbox.xMax)
    .i16(1).i16(0).i16(0).i16(0).i16(0).i16(0).i16(0).i16(0).u16(n);
  T.hhea = b;
}
{
  const b = new Buf();
  b.u32(0x00010000).u16(n).u16(maxPoints).u16(maxContours).u16(0).u16(0).u16(2).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0).u16(0);
  T.maxp = b;
}
{
  const b = new Buf();
  for (const g of glyphs) b.u16(g.advance).i16(g.xMin);
  T.hmtx = b;
}
{
  const b = new Buf();
  for (const o of loca) b.u32(o);
  T.loca = b;
}
T.glyf = glyf;
{
  // format 4: one segment per run of consecutive code points
  const cps = chars.map((c) => c.codePointAt(0));
  const segs = [];
  cps.forEach((cp, i) => {
    const gid = i + 1, last = segs[segs.length - 1];
    if (last && cp === last.end + 1 && gid === last.gid + (cp - last.start)) last.end = cp;
    else segs.push({ start: cp, end: cp, gid });
  });
  segs.push({ start: 0xffff, end: 0xffff, gid: 0, delta: 1 });
  const sc = segs.length, sr = 2 * 2 ** Math.floor(Math.log2(sc));
  const sub = new Buf();
  sub.u16(4).u16(16 + sc * 8).u16(0).u16(sc * 2).u16(sr).u16(Math.log2(sr / 2)).u16(sc * 2 - sr);
  for (const s of segs) sub.u16(s.end);
  sub.u16(0);
  for (const s of segs) sub.u16(s.start);
  for (const s of segs) sub.u16(s.delta !== undefined ? s.delta : (s.gid - s.start + 65536) % 65536);
  for (let i = 0; i < sc; i++) sub.u16(0);
  const b = new Buf();
  b.u16(0).u16(1).u16(3).u16(1).u32(12).bytes(sub.a);
  T.cmap = b;
}
{
  const b = new Buf();
  const avg = Math.round(glyphs.filter((g) => g.ch && g.ch !== ' ').reduce((a, g) => a + g.advance, 0) / (n - 1));
  const cps = chars.map((c) => c.codePointAt(0));
  b.u16(4).i16(avg).u16(400).u16(5).u16(0)
    .i16(650).i16(600).i16(0).i16(75).i16(650).i16(600).i16(0).i16(350)
    .i16(PX).i16(3 * PX).i16(0)
    .bytes([2, 0, 0, 0, 0, 0, 0, 0, 0, 0])                         // panose: a Latin text face, the rest unspecified
    .u32((1 << 0) | (1 << 1) | (1 << 31)).u32((1 << 5) | (1 << 13)).u32(0).u32(0)
    .tag('NONE').u16(0x40 | 0x80).u16(Math.min(...cps)).u16(Math.min(0xffff, Math.max(...cps)))
    .i16(ASC).i16(-DESC).i16(0).u16(ASC).u16(DESC)
    .u32(1).u32(0).i16(XH).i16(CAP).u16(0).u16(32).u16(1);
  T['OS/2'] = b;
}
{
  const names = [
    [0, 'Drawn for Screen Saver XP at iqbalsurya.com'],
    [1, FAMILY], [2, 'Regular'], [3, `${FAMILY} Regular ${VERSION}`], [4, `${FAMILY} Regular`], [5, VERSION], [6, PS],
  ];
  const strs = new Buf(), recs = [];
  for (const [id, s] of names) {
    const off = strs.length;
    for (const ch of s) strs.u16(ch.charCodeAt(0));
    recs.push([id, strs.length - off, off]);
  }
  const b = new Buf();
  b.u16(0).u16(recs.length).u16(6 + recs.length * 12);
  for (const [id, len, off] of recs) b.u16(3).u16(1).u16(0x409).u16(id).u16(len).u16(off);
  b.bytes(strs.a);
  T.name = b;
}
{
  const b = new Buf();
  b.u32(0x00030000).u32(0).i16(-PX).i16(PX).u32(0).u32(0).u32(0).u32(0).u32(0);
  T.post = b;
}

// ---- the sfnt: directory, tables in tag order, then head's whole-font checksum
const tags = Object.keys(T).sort();
const tables = tags.map((tag) => ({ tag, data: T[tag].out() }));
// each table's checksum is taken before head carries the whole font's adjustment
for (const t of tables) t.sum = checksum(t.data);
function sfnt() {
  const nt = tables.length, sr = 16 * 2 ** Math.floor(Math.log2(nt));
  const b = new Buf();
  b.u32(0x00010000).u16(nt).u16(sr).u16(Math.floor(Math.log2(nt))).u16(nt * 16 - sr);
  let off = 12 + nt * 16;
  for (const t of tables) { t.offset = off; off += Math.ceil(t.data.length / 4) * 4; }
  for (const t of tables) b.tag(t.tag).u32(t.sum).u32(t.offset).u32(t.data.length);
  for (const t of tables) b.bytes(t.data).pad4();
  return b.out();
}
let ttf = sfnt();
const adj = (0xb1b0afba - checksum(ttf)) >>> 0;
const head = tables.find((t) => t.tag === 'head');
head.data[8] = adj >>> 24; head.data[9] = (adj >>> 16) & 255; head.data[10] = (adj >>> 8) & 255; head.data[11] = adj & 255;
ttf = sfnt();

// ---- WOFF 1.0: the same tables, each deflated where that makes it smaller
{
  const nt = tables.length;
  const parts = tables.map((t) => {
    const z = deflateSync(t.data, { level: 9 });
    return { t, body: z.length < t.data.length ? z : t.data };
  });
  let off = 44 + nt * 20;
  for (const p of parts) { p.offset = off; off += Math.ceil(p.body.length / 4) * 4; }
  const b = new Buf();
  b.tag('wOFF').u32(0x00010000).u32(off).u16(nt).u16(0).u32(ttf.length).u16(1).u16(0).u32(0).u32(0).u32(0).u32(0).u32(0);
  for (const p of parts) b.tag(p.t.tag).u32(p.offset).u32(p.body.length).u32(p.t.data.length).u32(p.t.sum);
  for (const p of parts) b.bytes(p.body).pad4();
  writeFileSync(`${OUT}/ssxp-pixel.woff`, b.out());
  console.log(`glyphs ${n}, ttf ${ttf.length} bytes, woff ${off} bytes, maxPoints ${maxPoints}, maxContours ${maxContours}`);
}
