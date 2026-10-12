// Draws Phosphor OS's own icons for the desktop's places and writes them into option-a-desktop/icons.js, between its
// "phosphor-icons" markers: Home, About Me (computer, and computerOff for Shut Down), Portfolio (folder, folderOpen),
// Contact (envelope), Network (globe) and the Recycle Bin. In XP's Luna manner: each face a gradient lit from the top
// left, its outline a deep shade of its own colour rather than black, a soft shadow down and to the right; the
// computer's glass shows the mark's lit spot.
// Each icon is drawn twice: on the library's 24 pixel grid (24 px and up) and again on a 16 pixel grid for the title
// bars, the taskbar and the lists, so a 16 px icon lands on whole pixels. A shape is a few layers in paint order, each
// a role (main, second, light, glass, lit, ink: lines inside the shape) and a test for its pixels; the outline is
// every filled pixel at the shape's edge.
// Each icon also carries a flat two-tone copy (.f fill, .l outline, as the library's), hidden unless a control
// recolours its icons (the red page keys draw theirs in white): .px .fl in shared/xp-system.css.
// usage: node tools/phosphor-icons/build.mjs [--sheet out.html]   (then bump icons.js?v= where the site loads it)
import { readFileSync, writeFileSync } from 'node:fs';

const inRound = (x, y, x0, y0, x1, y1, r = 1) => {
  if (x < x0 || x > x1 || y < y0 || y > y1) return false;
  const cx = Math.min(Math.max(x, x0 + r), x1 - r), cy = Math.min(Math.max(y, y0 + r), y1 - r);
  return Math.hypot(x - cx, y - cy) <= r + 0.25;
};
const ell = (x, y, cx, cy, rx, ry) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
// a one pixel line from (x0, y0) to (x1, y1), as a test
const line = (x, y, x0, y0, x1, y1) => {
  const steps = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0));
  for (let i = 0; i <= steps; i++) if (Math.round(x0 + ((x1 - x0) * i) / steps) === x && Math.round(y0 + ((y1 - y0) * i) / steps) === y) return true;
  return false;
};
const frame = (x, y, x0, y0, x1, y1) => ((y === y0 - 1 || y === y1 + 1) && x >= x0 && x <= x1) || ((x === x0 - 1 || x === x1 + 1) && y >= y0 && y <= y1);

// the monitor, on either grid: the case, the stand, the base, the glass in its dark rim
const monitor = (n, lit) => {
  const s = n === 24
    ? { body: [2, 2, 21, 16], stand: [9, 17, 14, 18], base: [5, 19, 18, 21], glass: [5, 5, 18, 12], spot: [11, 8, 12, 9] }
    : { body: [1, 1, 14, 10], stand: [6, 11, 9, 11], base: [3, 12, 12, 14], glass: [3, 3, 12, 7], spot: [7, 5, 8, 5] };
  const box = ([x0, y0, x1, y1]) => (x, y) => x >= x0 && x <= x1 && y >= y0 && y <= y1;
  return [
    ['main', (x, y) => inRound(x, y, ...s.body, 1)],
    ['main', box(s.stand)],
    ['main', (x, y) => inRound(x, y, ...s.base, 1)],
    ['glass', box(s.glass)],
    ...(lit ? [['lit', box(s.spot)]] : []),
    ['ink', (x, y) => frame(x, y, ...s.glass)],
  ];
};

const SHAPES = {
  24: {
    home: ['home', [
      ['second', (x, y) => y >= 2 && y <= 11 && Math.abs(x - 11.5) <= (y - 1.5) * 1.15],
      ['second', (x, y) => x >= 16 && x <= 18 && y >= 3 && y <= 7],
      ['main', (x, y) => x >= 4 && x <= 19 && y >= 11 && y <= 21],
      ['ink', (x, y) => x >= 7 && x <= 10 && y >= 14 && y <= 21 && (x === 7 || x === 10 || y === 14)],
      ['glass', (x, y) => x >= 13 && x <= 17 && y >= 14 && y <= 17],
      ['ink', (x, y) => (x === 15 && y >= 14 && y <= 17) || (y === 15 && x >= 13 && x <= 17)],
    ]],
    computer: ['computer', monitor(24, true)],
    computerOff: ['computerOff', monitor(24, false)],
    folder: ['folder', [
      ['second', (x, y) => inRound(x, y, 2, 3, 10, 7, 1)],
      ['second', (x, y) => inRound(x, y, 2, 5, 21, 20, 1)],
      ['main', (x, y) => inRound(x, y, 2, 8, 21, 20, 1)],
      ['light', (x, y) => y === 9 && x >= 3 && x <= 20],
      ['ink', (x, y) => y === 8 && x >= 2 && x <= 21],
    ]],
    folderOpen: ['folder', [
      ['second', (x, y) => inRound(x, y, 2, 3, 10, 7, 1)],
      ['second', (x, y) => inRound(x, y, 2, 5, 18, 20, 1)],
      ['main', (x, y) => y >= 10 && y <= 20 && x >= 6 - Math.floor((y - 10) / 2) && x <= 22 - Math.floor((y - 10) / 2)],
      ['light', (x, y) => y === 11 && x >= 6 && x <= 21],
    ]],
    envelope: ['envelope', [
      ['main', (x, y) => x >= 1 && x <= 22 && y >= 5 && y <= 19],
      ['light', (x, y) => x >= 2 && x <= 21 && y >= 6 && y <= 12 && y - 6 <= Math.min(x - 2, 21 - x) * 0.7],
      ['ink', (x, y) => line(x, y, 2, 6, 11, 13) || line(x, y, 21, 6, 12, 13)],
    ]],
    globe: ['globe', [
      ['main', (x, y) => Math.hypot(x - 11.5, y - 11.5) <= 10.4],
      ['second', (x, y) => Math.hypot(x - 11.5, y - 11.5) <= 9.6 && (ell(x, y, 8, 8, 3.6, 2.8) || ell(x, y, 14.5, 14, 3.2, 3.6) || ell(x, y, 16, 6.5, 2.2, 1.6) || ell(x, y, 6, 15, 1.8, 2.4))],
      ['light', (x, y) => Math.hypot(x - 11.5, y - 11.5) <= 9.6 && Math.hypot(x - 7, y - 5) <= 1.6],
    ]],
    recycle: ['recycle', [
      ['second', (x, y) => inRound(x, y, 3, 3, 20, 5, 1)],
      ['second', (x, y) => x >= 9 && x <= 14 && y >= 1 && y <= 2],
      ['main', (x, y) => y >= 6 && y <= 21 && x >= 4 + Math.floor((y - 6) / 7) && x <= 19 - Math.floor((y - 6) / 7)],
      ['ink', (x, y) => (x === 8 || x === 12 || x === 15) && y >= 9 && y <= 18],
    ]],
  },
  16: {
    home: ['home', [
      ['second', (x, y) => y >= 1 && y <= 7 && Math.abs(x - 7.5) <= (y - 0.5) * 1.1],
      ['second', (x, y) => x >= 11 && x <= 12 && y >= 2 && y <= 4],
      ['main', (x, y) => x >= 3 && x <= 12 && y >= 7 && y <= 14],
      ['ink', (x, y) => x >= 4 && x <= 6 && y >= 10 && y <= 14 && (x !== 5 || y === 10)],
      ['glass', (x, y) => x >= 8 && x <= 10 && y >= 9 && y <= 11],
    ]],
    computer: ['computer', monitor(16, true)],
    computerOff: ['computerOff', monitor(16, false)],
    folder: ['folder', [
      ['second', (x, y) => inRound(x, y, 1, 2, 6, 4, 1)],
      ['second', (x, y) => inRound(x, y, 1, 3, 14, 13, 1)],
      ['main', (x, y) => inRound(x, y, 1, 5, 14, 13, 1)],
      ['light', (x, y) => y === 6 && x >= 2 && x <= 13],
      ['ink', (x, y) => y === 5 && x >= 1 && x <= 14],
    ]],
    folderOpen: ['folder', [
      ['second', (x, y) => inRound(x, y, 1, 2, 6, 4, 1)],
      ['second', (x, y) => inRound(x, y, 1, 3, 12, 13, 1)],
      ['main', (x, y) => y >= 7 && y <= 13 && x >= 4 - Math.floor((y - 7) / 2) && x <= 15 - Math.floor((y - 7) / 2)],
      ['light', (x, y) => y === 8 && x >= 4 && x <= 14],
    ]],
    envelope: ['envelope', [
      ['main', (x, y) => x >= 0 && x <= 15 && y >= 3 && y <= 12],
      ['light', (x, y) => x >= 1 && x <= 14 && y >= 4 && y <= 7 && y - 4 <= Math.min(x - 1, 14 - x) * 0.6],
      ['ink', (x, y) => line(x, y, 1, 4, 7, 8) || line(x, y, 14, 4, 8, 8)],
    ]],
    globe: ['globe', [
      ['main', (x, y) => Math.hypot(x - 7.5, y - 7.5) <= 7],
      ['second', (x, y) => Math.hypot(x - 7.5, y - 7.5) <= 6.2 && (ell(x, y, 5, 5, 2.4, 1.8) || ell(x, y, 9.6, 9.4, 2.2, 2.5) || ell(x, y, 10.6, 4.2, 1.4, 1.1) || ell(x, y, 4, 10, 1.2, 1.6))],
      ['light', (x, y) => Math.hypot(x - 7.5, y - 7.5) <= 6.2 && Math.hypot(x - 4.5, y - 3.2) <= 0.8],
    ]],
    recycle: ['recycle', [
      ['second', (x, y) => inRound(x, y, 2, 2, 13, 3, 1)],
      ['second', (x, y) => x >= 6 && x <= 9 && y === 1],
      ['main', (x, y) => y >= 4 && y <= 14 && x >= 3 + Math.floor((y - 4) / 5) && x <= 12 - Math.floor((y - 4) / 5)],
      ['ink', (x, y) => (x === 6 || x === 9) && y >= 6 && y <= 12],
    ]],
  },
};

// each place's colours: the main face, a second one (roof, tab, lid, land), a light one, the glass, the lit spot
const HUES = {
  home: { main: '#fbf3dc', second: '#e25b2c', glass: '#4f8fe6', light: '#fff' },
  computer: { main: '#e9e2cc', glass: '#2a63d6', lit: '#4cda50', light: '#fff' },
  computerOff: { main: '#e9e2cc', glass: '#3a3f48', light: '#fff' },
  folder: { main: '#f9cf55', second: '#e2a531', light: '#fff1b8' },
  envelope: { main: '#fbfaf4', light: '#e3e0d4' },
  globe: { main: '#3f8ef0', second: '#57c24a', light: '#e8f2ff' },
  recycle: { main: '#dfe8f3', second: '#b7c6d9' },
};
const SHADOW = 'rgba(0,0,30,.28)';

const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const toHex = (c) => '#' + c.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => toHex(hex(a).map((v, i) => v + (hex(b)[i] - v) * t));

// one icon on its grid: the Luna picture, and the flat copy's fill and outline as pixel sets
function draw(n, [hue, layers]) {
  const h = HUES[hue], role = Array.from({ length: n }, () => Array(n).fill(null));
  for (const [r, test] of layers) for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (test(x, y)) role[y][x] = r;
  const filled = (x, y) => x >= 0 && y >= 0 && x < n && y < n && role[y][x] !== null;
  // a face lit from the top left: lighter there, deeper toward the bottom right
  const face = (r, x, y) => {
    const base = h[r] || h.main;
    if (r === 'lit' || r === 'light') return base;
    const t = (x + y) / (2 * n);
    return t < 0.45 ? mix(base, '#ffffff', (0.45 - t) * 0.9) : mix(base, '#000000', (t - 0.45) * 0.45);
  };
  const luna = Array.from({ length: n }, () => Array(n).fill(null)), fill = [], outline = [];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const r = role[y][x];
    if (!r) { if (filled(x - 1, y - 1) && n > 16) luna[y][x] = SHADOW; continue; }
    const edge = !filled(x - 1, y) || !filled(x + 1, y) || !filled(x, y - 1) || !filled(x, y + 1);
    if (edge || r === 'ink') { luna[y][x] = mix(face(r === 'ink' ? 'main' : r, x, y), '#000000', 0.62); outline.push([x, y]); }
    else { luna[y][x] = face(r, x, y); fill.push([x, y]); }
  }
  return { luna, fill, outline };
}

// pixels as one path of row runs
function runs(cells) {
  const rows = new Map();
  cells.forEach(([x, y]) => { if (!rows.has(y)) rows.set(y, []); rows.get(y).push(x); });
  let d = '';
  [...rows].sort((a, b) => a[0] - b[0]).forEach(([y, xs]) => {
    xs.sort((a, b) => a - b);
    for (let i = 0; i < xs.length;) {
      let e = i;
      while (e + 1 < xs.length && xs[e + 1] === xs[e] + 1) e++;
      d += `M${xs[i]} ${y}h${xs[e] - xs[i] + 1}v1h-${xs[e] - xs[i] + 1}z`;
      i = e + 1;
    }
  });
  return d;
}
function body({ luna, fill, outline }) {
  const byColour = new Map();
  luna.forEach((row, y) => row.forEach((c, x) => { if (c) { if (!byColour.has(c)) byColour.set(c, []); byColour.get(c).push([x, y]); } }));
  const lu = [...byColour].map(([c, cells]) => `<path fill="${c}" d="${runs(cells)}"/>`).join('');
  return `<g class="lu">${lu}</g><g class="fl"><path class="f" d="${runs(fill)}"/><path class="l" d="${runs(outline)}"/></g>`;
}

const built = {};
for (const n of [24, 16]) built[n] = Object.fromEntries(Object.entries(SHAPES[n]).map(([name, shape]) => [name, body(draw(n, shape))]));

const FILE = new URL('../../option-a-desktop/icons.js', import.meta.url);
const START = '  // <phosphor-icons>', END = '  // </phosphor-icons>';
const src = readFileSync(FILE, 'utf8');
const a = src.indexOf(START), b = src.indexOf(END);
if (a < 0 || b < a) throw new Error('icons.js has no phosphor-icons markers');
const list = (o) => Object.entries(o).map(([k, v]) => `    "${k}": '${v}',`).join('\n');
const block = `${START} written by tools/phosphor-icons/build.mjs; draw them there, not here\n`
  + `  // on the 24 pixel grid, for 24 px and up\n  const OWN = {\n${list(built[24])}\n  };\n`
  + `  // on a 16 pixel grid, for 16 px and smaller\n  const OWN16 = {\n${list(built[16])}\n  };\n`;
writeFileSync(FILE, src.slice(0, a) + block + src.slice(b));
console.log('wrote', Object.keys(built[24]).length, 'icons, each on 24 and 16 pixel grids, into option-a-desktop/icons.js');

const at = process.argv.indexOf('--sheet');
if (at > 0) {
  const icon = (name, size, bg, flat) => {
    const n = size <= 16 ? 16 : 24, inner = built[n][name];
    const show = flat ? inner.replace('<g class="lu">', '<g class="lu" style="display:none">').replace('<g class="fl">', '<g class="fl" style="--ic-fill:rgba(255,255,255,.22)">') : inner.replace('<g class="fl">', '<g class="fl" style="display:none">');
    return `<span style="background:${bg};padding:6px;display:inline-grid"><svg width="${size}" height="${size}" viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" style="--ic-line:#fff">${show.replace('class="f"', 'class="f" fill="rgba(255,255,255,.22)"').replace('class="l"', 'class="l" fill="#fff"')}</svg></span>`;
  };
  const rows = Object.keys(built[24]).map((n) => `<tr><td>${n}</td><td>${[16, 24, 32, 48].map((s) => icon(n, s, '#1d54b8')).join(' ')}</td><td>${icon(n, 32, '#ece9d8')} ${icon(n, 16, '#c62a1f', true)}</td></tr>`).join('');
  writeFileSync(process.argv[at + 1], `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#222;color:#ddd;font:13px sans-serif}td{padding:6px 10px;vertical-align:middle}svg{image-rendering:pixelated}</style><table>${rows}</table>`);
}
