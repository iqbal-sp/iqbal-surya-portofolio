// Draws Phosphor OS's own icons for the desktop's places and writes them into option-a-desktop/icons.js, between its
// "phosphor-icons" markers: Home, About Me (computer, and computerOff for Shut Down), Portfolio (folder, folderOpen),
// Contact (envelope), Network (globe) and the Recycle Bin. They share the library's 24 pixel grid, so they sit beside
// its icons at every size, but not its look: the beige plastic of the loading screen's computer and of the mark, a
// black outline traced round each shape, and in each one thing lit in phosphor green, always on dark glass, as the
// mark's spot is.
// Each icon is drawn with a few shapes on a grid; the outline is then every filled pixel at the shape's edge, so every
// icon has the same one pixel line. The outline is the icon's .l layer (var(--ic-line), black unless a control
// recolours it); the other colours are fixed.
// usage: node tools/phosphor-icons/build.mjs [--sheet out.html]   (then bump icons.js?v= in option-a-desktop/index.html)
import { readFileSync, writeFileSync } from 'node:fs';

const N = 24;
const INK = {
  w: '#f4eedd',   // beige, lit
  b: '#d8ceb2',   // beige, face
  s: '#b3a684',   // beige, shade
  r: '#3b3528',   // dark plastic, roof
  x: '#0b0f0c',   // glass
  q: '#0c3a16',   // phosphor, deep
  d: '#1d7a33',   // phosphor, mid
  g: '#4cda50',   // phosphor
  c: '#d9ffd6',   // phosphor, core
};

function grid() {
  const px = Array.from({ length: N }, () => Array(N).fill(null));
  const set = (x, y, c) => { if (x >= 0 && y >= 0 && x < N && y < N) px[y][x] = c; };
  const api = {
    px,
    set(x, y, c) { set(x, y, c); return api; },
    rect(x0, y0, x1, y1, c) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) set(x, y, c); return api; },
    // a rectangle with its four corner pixels left out
    round(x0, y0, x1, y1, c) { api.rect(x0, y0, x1, y1, c); [[x0, y0], [x1, y0], [x0, y1], [x1, y1]].forEach(([x, y]) => set(x, y, null)); return api; },
    fill(test, c) { for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (test(x, y)) set(x, y, c); return api; },
    // the outline: every filled pixel with an empty pixel (or the edge) beside it
    outline() {
      const filled = (x, y) => x >= 0 && y >= 0 && x < N && y < N && px[y][x] !== null;
      const edge = [];
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        if (filled(x, y) && (!filled(x - 1, y) || !filled(x + 1, y) || !filled(x, y - 1) || !filled(x, y + 1))) edge.push([x, y]);
      }
      edge.forEach(([x, y]) => { px[y][x] = 'k'; });
      return api;
    },
  };
  return api;
}

// a CRT monitor on a stand: the beige case, its dark glass inside a black rim, the power lamp
function monitor() {
  const g = grid();
  g.round(1, 1, 22, 17, 'b').rect(2, 2, 21, 2, 'w').rect(2, 2, 2, 16, 'w').rect(3, 16, 21, 16, 's').rect(21, 3, 21, 16, 's');
  g.rect(9, 18, 14, 19, 's').round(5, 20, 18, 22, 'b').rect(6, 20, 17, 20, 'w');
  g.outline();
  g.round(3, 3, 20, 15, 'k').rect(4, 4, 19, 14, 'x');
  return g;
}

const ICONS = {
  // About Me: the monitor showing a person, head and shoulders in phosphor
  computer() {
    const g = monitor();
    g.round(10, 5, 13, 8, 'g').set(11, 6, 'c');
    g.round(7, 11, 16, 14, 'd').rect(8, 11, 15, 11, 'g');
    g.set(19, 16, 'g');
    return g;
  },
  // Shut Down: the monitor off, only a fading dot left in the middle of the glass
  computerOff() {
    const g = monitor();
    g.rect(11, 9, 12, 9, 'q').set(11, 9, 'd');
    g.set(19, 16, 'r');
    return g;
  },
  // Home: a house with its window lit
  home() {
    const g = grid();
    g.fill((x, y) => y >= 2 && y <= 10 && Math.abs(x - 11.5) <= (y - 1) * 1.25, 'r');
    g.rect(16, 3, 18, 6, 'r');
    g.rect(4, 11, 19, 21, 'b').rect(4, 11, 4, 21, 'w').rect(5, 21, 19, 21, 's');
    g.outline();
    g.rect(6, 14, 9, 21, 'r').rect(7, 15, 8, 20, 's');
    g.rect(12, 13, 17, 18, 'k').rect(13, 14, 16, 17, 'g').rect(14, 15, 15, 16, 'c');
    return g;
  },
  // Portfolio: a manila folder with a lit label
  folder() {
    const g = grid();
    g.round(2, 4, 10, 7, 's').round(2, 6, 21, 20, 's');
    g.round(2, 9, 21, 20, 'b').rect(3, 10, 20, 10, 'w');
    g.outline();
    g.rect(3, 9, 20, 9, 'k');
    g.rect(14, 13, 18, 15, 'k').rect(15, 14, 17, 14, 'g').set(16, 14, 'c');
    return g;
  },
  // the folder open: its front swung down and away
  folderOpen() {
    const g = grid();
    g.round(2, 3, 10, 6, 's').round(2, 5, 18, 20, 's');
    g.fill((x, y) => y >= 10 && y <= 20 && x >= 6 - Math.floor((y - 10) / 2) && x <= 22 - Math.floor((y - 10) / 2), 'b');
    g.fill((x, y) => y === 10 && x >= 6 && x <= 22, 'w');
    g.outline();
    g.rect(13, 14, 17, 16, 'k').rect(14, 15, 16, 15, 'g').set(15, 15, 'c');
    return g;
  },
  // Contact: an envelope with a lit new-message lamp
  envelope() {
    const g = grid();
    g.rect(1, 6, 22, 20, 'w').rect(2, 14, 21, 19, 'b');
    g.outline();
    for (let i = 0; i <= 9; i++) { g.set(2 + i, 7 + Math.round(i * 0.75), 'k'); g.set(21 - i, 7 + Math.round(i * 0.75), 'k'); }
    g.fill((x, y) => Math.hypot(x - 19.5, y - 4.5) <= 3.3, 'g');
    g.fill((x, y) => Math.hypot(x - 19.5, y - 4.5) <= 3.3 && Math.hypot(x - 19.5, y - 4.5) > 2.4, 'k');
    g.rect(19, 4, 20, 5, 'c');
    return g;
  },
  // Network: the globe as a vector display draws it, green lines on a round dark screen in a beige ring
  globe() {
    const g = grid();
    const cx = 11.5, cy = 11.5;
    g.fill((x, y) => Math.hypot(x - cx, y - cy) <= 10.9, 'b');
    g.fill((x, y) => Math.hypot(x - cx, y - cy) <= 10.9 && (x - cx) + (y - cy) < -7, 'w');
    g.outline();
    g.fill((x, y) => Math.hypot(x - cx, y - cy) <= 8.6, 'k');
    g.fill((x, y) => Math.hypot(x - cx, y - cy) <= 7.6, 'x');
    const wire = (x, y) => {
      const dx = x - cx, dy = y - cy, r = Math.hypot(dx, dy);
      if (r > 7.6) return false;
      const lim = Math.sqrt(Math.max(0, 7.6 * 7.6 - dy * dy));
      return Math.abs(Math.abs(dy) - 4.5) < 0.5 || Math.abs(Math.abs(dx) - lim * 0.55) < 0.6 || r > 7;
    };
    // the lines of latitude and longitude dim, the equator and the middle meridian lit, their crossing brightest
    g.fill(wire, 'd');
    g.fill((x, y) => Math.hypot(x - cx, y - cy) <= 7 && (Math.abs(y - cy) < 0.6 || Math.abs(x - cx) < 0.6), 'g');
    g.rect(11, 11, 12, 12, 'c');
    return g;
  },
  // the Recycle Bin: a beige bin with the recycling loop lit on its front
  recycle() {
    const g = grid();
    g.round(3, 4, 20, 6, 'w');
    g.fill((x, y) => y >= 7 && y <= 21 && x >= 4 + Math.floor((y - 7) / 6) && x <= 19 - Math.floor((y - 7) / 6), 'b');
    g.fill((x, y) => y >= 7 && y <= 21 && x === 19 - Math.floor((y - 7) / 6), 's');
    g.outline();
    g.rect(4, 7, 19, 7, 'k');
    // the loop on a dark panel: a triangle of three arrows, each broken where the next begins
    g.round(6, 9, 17, 18, 'k').rect(7, 10, 16, 17, 'x');
    [[11, 11], [12, 11], [10, 12], [13, 12], [14, 13], [9, 14], [15, 14], [8, 15], [9, 16], [10, 16], [11, 16], [13, 16], [14, 16], [15, 16], [16, 15]]
      .forEach(([x, y]) => g.set(x, y, 'g'));
    [[12, 11], [16, 15], [9, 16]].forEach(([x, y]) => g.set(x, y, 'c'));
    return g;
  },
};

// the icon as an SVG body on the library's viewBox: the outline as the .l layer, each colour one path of row runs
function body(g) {
  const paths = new Map();
  g.px.forEach((row, y) => {
    for (let x = 0; x < N;) {
      const c = row[x];
      let e = x + 1;
      while (e < N && row[e] === c) e++;
      if (c) paths.set(c, (paths.get(c) || '') + `M${x} ${y}h${e - x}v1h-${e - x}z`);
      x = e;
    }
  });
  return [...paths].map(([c, d]) => (c === 'k' ? `<path class="l" d="${d}"/>` : `<path fill="${INK[c]}" d="${d}"/>`)).join('');
}

const built = Object.fromEntries(Object.entries(ICONS).map(([name, draw]) => [name, body(draw())]));

const FILE = new URL('../../option-a-desktop/icons.js', import.meta.url);
const START = '  // <phosphor-icons>', END = '  // </phosphor-icons>';
const src = readFileSync(FILE, 'utf8');
const a = src.indexOf(START), b = src.indexOf(END);
if (a < 0 || b < a) throw new Error('icons.js has no phosphor-icons markers');
const block = `${START} written by tools/phosphor-icons/build.mjs; draw them there, not here\n  const OWN = {\n`
  + Object.entries(built).map(([k, v]) => `    "${k}": '${v}',`).join('\n') + '\n  };\n';
writeFileSync(FILE, src.slice(0, a) + block + src.slice(b));
console.log('wrote', Object.keys(built).length, 'icons into option-a-desktop/icons.js');

const at = process.argv.indexOf('--sheet');
if (at > 0) {
  const icon = (name, size, bg) => `<span style="background:${bg};padding:6px;display:inline-grid"><svg width="${size}" height="${size}" viewBox="0 0 24 24" shape-rendering="crispEdges">${built[name].replace('class="l"', 'fill="#000"')}</svg></span>`;
  const rows = Object.keys(built).map((n) => `<tr><td>${n}</td><td>${[16, 24, 32, 48].map((s) => icon(n, s, '#3a6ea5')).join(' ')}</td><td>${icon(n, 32, '#ece9d8')} ${icon(n, 96, '#3a6ea5')}</td></tr>`).join('');
  writeFileSync(process.argv[at + 1], `<!doctype html><meta charset="utf-8"><style>body{margin:0;padding:16px;background:#222;color:#ddd;font:13px sans-serif}td{padding:6px 10px;vertical-align:middle}svg{image-rendering:pixelated}</style><table>${rows}</table>`);
}
