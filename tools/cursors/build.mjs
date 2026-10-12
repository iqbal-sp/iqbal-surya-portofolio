// Builds the desktop's pointers (option-a-desktop/cursors.css) from the bitmaps below, drawn for this site in the
// manner of XP's: one pixel to a CSS pixel, a black outline round a white face, and the soft shadow XP cast down and
// to the right of every pointer. Each pointer is an SVG of runs of square pixels, so it stays sharp at any zoom, and
// each custom property carries the system pointer after it, for a browser that won't draw an image pointer.
// usage: node tools/cursors/build.mjs            writes option-a-desktop/cursors.css (then bump cursors.css?v= in
//                                                 option-a-desktop/index.html)
//        node tools/cursors/build.mjs --sheet f  also writes an HTML sheet of the pointers at 1x and 8x, to look at
import { writeFileSync } from 'node:fs';

// k outline, w face, b sand (the hourglass), . or space nothing
const INK = { k: '#000', w: '#fff', b: '#d6a23c' };
const SHADOW = 'rgba(0,0,0,.32)';

const ARROW = [
  'k',
  'kk',
  'kwk',
  'kwwk',
  'kwwwk',
  'kwwwwk',
  'kwwwwwk',
  'kwwwwwwk',
  'kwwwwwwwk',
  'kwwwwwwwwk',
  'kwwwwwwwwwk',
  'kwwwwwwkkkkk',
  'kwwwkwwk',
  'kwwk kwwk',
  'kwk  kwwk',
  'kk    kwwk',
  'k     kwwk',
  '       kwwk',
  '        kk',
];

const HAND = [
  '     kk',
  '    kwwk',
  '    kwwk',
  '    kwwk',
  '    kwwk',
  '    kwwkkk',
  '    kwwkwwkkk',
  '    kwwkwwkwwkk',
  ' kk kwwkwwkwwkwk',
  'kwwkkwwwwwwwwkwwk',
  'kwwwkwwwwwwwwwwwk',
  ' kwwkwwwwwwwwwwwk',
  '  kwwwwwwwwwwwwwk',
  '  kwwwwwwwwwwwwk',
  '   kwwwwwwwwwwwk',
  '   kwwwwwwwwwwk',
  '    kwwwwwwwwwk',
  '    kwwwwwwwwwk',
  '    kkkkkkkkkkk',
];

const MINI_GLASS = [
  'kkkkkkkk',
  'kwwwwwwk',
  ' kbbbbk',
  ' kwbbwk',
  '  kwwk',
  '  kwbk',
  ' kwwbwk',
  ' kwbbbk',
  'kwwwwwwk',
  'kkkkkkkk',
];

const NWSE = [
  'kkkkkkk',
  'kwwwwk',
  'kwwwk',
  'kwwwwk',
  'kwkwwwk',
  'kk kwwwk',
  'k   kwwwk',
  '     kwwwk',
  '      kwwwk   k',
  '       kwwwk kk',
  '        kwwwkwk',
  '         kwwwwk',
  '          kwwwk',
  '         kwwwwk',
  '        kkkkkkk',
];

// a bitmap laid over another at (x, y)
function over(base, top, x, y) {
  const rows = base.map((r) => r.split(''));
  top.forEach((r, j) => r.split('').forEach((c, i) => {
    if (c === ' ' || c === '.') return;
    while (rows.length <= y + j) rows.push([]);
    const row = rows[y + j];
    while (row.length < x + i) row.push(' ');
    row[x + i] = c;
  }));
  return rows.map((r) => r.join(''));
}

// name, bitmap, hotspot, the system pointer it stands for
const POINTERS = [
  ['arrow', ARROW, [0, 0], 'default'],
  ['hand', HAND, [5, 0], 'pointer'],
  ['busy', over(ARROW, MINI_GLASS, 11, 9), [0, 0], 'progress'],
  ['nwse', NWSE, [7, 7], 'nwse-resize'],
];

// runs of one ink along each row, as one path a colour; the shadow is the whole shape again, one pixel down and to the right
function svg(rows) {
  const w = Math.max(...rows.map((r) => r.length)) + 1, h = rows.length + 1;
  const rects = (hit, dx) => {
    let out = '';
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length;) {
        if (!hit(r[x])) { x++; continue; }
        let e = x;
        while (e < r.length && hit(r[e])) e++;
        out += `M${x + dx} ${y + dx}h${e - x}v1h-${e - x}z`;
        x = e;
      }
    });
    return out;
  };
  const shadow = `<path fill='${SHADOW}' d='${rects((c) => c in INK, 1)}'/>`;
  const inks = Object.keys(INK).map((k) => { const d = rects((c) => c === k, 0); return d ? `<path fill='${INK[k]}' d='${d}'/>` : ''; }).join('');
  return `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='${h}' viewBox='0 0 ${w} ${h}' shape-rendering='crispEdges'>${shadow}${inks}</svg>`;
}

const uri = (s) => `data:image/svg+xml,${s.replace(/[%#<>"]/g, encodeURIComponent)}`;

const head = `/* The desktop's pointers, drawn for this site in XP's manner (tools/cursors/build.mjs writes this file; edit the
   bitmaps there, not here). Each property is the picture, its hotspot, then the system pointer for a browser that
   won't draw it; every rule that sets a pointer names its system one again, for a page that doesn't load this file. */
`;
const props = POINTERS.map(([name, rows, [x, y], sys]) => `  --cur-${name}: url("${uri(svg(rows))}") ${x} ${y}, ${sys};`).join('\n');
const css = `${head}:root {\n${props}\n}\n/* a link takes the hand, as the page's own buttons do (style.css) */\n:where(a[href]) { cursor: var(--cur-hand, pointer); }\n`;
writeFileSync(new URL('../../option-a-desktop/cursors.css', import.meta.url), css);
console.log('wrote option-a-desktop/cursors.css');

const at = process.argv.indexOf('--sheet');
if (at > 0) {
  const cells = POINTERS.map(([name, rows]) => {
    const s = uri(svg(rows));
    return `<figure><img src="${s}" style="width:auto"><img src="${s}" class="big"><figcaption>${name}</figcaption></figure>`;
  }).join('');
  writeFileSync(process.argv[at + 1], `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#3a6ea5;font:12px sans-serif;color:#fff;display:flex;gap:24px;flex-wrap:wrap}figure{margin:0;display:grid;gap:8px;justify-items:start}img.big{image-rendering:pixelated;zoom:8}</style>${cells}`);
}
