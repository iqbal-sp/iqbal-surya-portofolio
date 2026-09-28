/*
  Shared kit for the desk's four stations: the palette, materials, a few shapes and the timing helpers.

  A station is a module whose default export builds it:

    export default function build(k) {
      return {
        name: 'brief',
        period: 7,          // seconds in one loop; pose(0) must equal pose(period), so the loop never jumps
        still: 4.2,         // the moment that tells the episode best: reduced motion and the phone stills show this
        cuts: [3.1],        // optional: local times where the core fires a short glitch, to hide a cut or a reset
        group,              // a THREE.Group built around (0, 0, 0) = the station's spot on the desk top
        update(t) {},       // pose everything for local time t in [0, period]; a pure function of t
        camera(t, out) {},  // set out.pos and out.target (Vector3, station-local) and out.fov; seamless over the loop
        mood: { key: 1, rim: 1, fill: 1 },   // optional light levels while this station is on screen
      };
    }

  Units: 1 unit is about 10 cm. The desk top is y = 0; +x runs right, +y up, +z towards the viewer. A station
  keeps inside x -1.4..1.4 and z -1.2..1.2 so its neighbours (4.4 units away) stay clear of it.
  Framing: the TV is 17:10. The bottom quarter of the picture carries the caption and the remote covers the
  lower right, so the subject sits in the upper middle, a little left of centre.
  Look: a modern studio still life. Real proportions, fine bevels, parts that are made of parts; materials from
  finish below; colours from INK only (neutrals plus one green accent per station).
*/
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

export { THREE };

// The palette is held tight on purpose (the owner: modern, not childish, not too many colours). Objects are
// neutrals only: paper, aluminium, graphite, ink. One accent, Focus Glow green, goes on at most one element per
// station: the thing that carries the episode's verb. Blue comes only from the room: the field behind the desk,
// the rim light and reflections. Every value is a DESIGN.md colour.
export const INK = {
  // neutrals, light to dark
  paper: '#ffffff', paperTint: '#f3f6fd', silver: '#d4d7de', steel: '#c3c8cf', steelDeep: '#a4aab4',
  slate: '#5b5f6b', graphite: '#2a2d35', ink: '#141414',
  // the one accent
  glow: '#86d13f', glowEdge: '#d4f7ad', glowInk: '#0b2206',
  // the room only (field, rim light, fog); never an object's own colour
  deep: '#04163f', mid: '#0d3a8f', hi: '#1d56b8', blue: '#6aa8ff',
};

/* ---------- surfaces ----------
   Small canvas textures, drawn once from a fixed seed so every load looks the same. Under the dither they do not
   read as pattern; they break up flat fills and shape the highlights, which is what makes a surface read as a
   material instead of a toy's paint. Each call returns a new texture sharing the same picture, so a caller may
   set its own repeat. */
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const surfaceCache = new Map();
function surface(name, w, h, draw) {
  if (!surfaceCache.has(name)) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    draw(c.getContext('2d'), w, h, rng(name.length * 977 + w));
    surfaceCache.set(name, c);
  }
  const t = new THREE.CanvasTexture(surfaceCache.get(name));
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.anisotropy = 4;
  return t;
}
export const surfaces = {
  // brushed metal: fine streaks along x, for roughness (and a touch of bump)
  brushed: () => surface('brushed', 512, 128, (c, w, h, r) => {
    c.fillStyle = '#8c8c8c'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { const v = 110 + r() * 60 | 0; c.fillStyle = `rgba(${v},${v},${v},${0.25 + r() * 0.4})`; c.fillRect(r() * w - 60, r() * h, 60 + r() * 260, 1); }
  }),
  // paper: soft fibre noise, for bump and roughness
  paper: () => surface('paper', 256, 256, (c, w, h, r) => {
    c.fillStyle = '#c8c8c8'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 2600; i++) { const v = 170 + r() * 80 | 0; c.strokeStyle = `rgba(${v},${v},${v},0.35)`; c.lineWidth = 0.6; const x = r() * w, y = r() * h, a = r() * Math.PI; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * (2 + r() * 6), y + Math.sin(a) * (2 + r() * 6)); c.stroke(); }
  }),
  // felt / linoleum desk top: a soft, even grain
  felt: () => surface('felt', 512, 512, (c, w, h, r) => {
    c.fillStyle = '#808080'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 16000; i++) { const v = 100 + r() * 60 | 0; c.fillStyle = `rgba(${v},${v},${v},0.5)`; c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
  }),
  // pebbled leather grain, for bump
  leather: () => surface('leather', 256, 256, (c, w, h, r) => {
    c.fillStyle = '#909090'; c.fillRect(0, 0, w, h);
    for (let i = 0; i < 1400; i++) { const x = r() * w, y = r() * h, rad = 2 + r() * 4, g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, 'rgba(200,200,200,0.55)'); g.addColorStop(1, 'rgba(90,90,90,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, rad, 0, Math.PI * 2); c.fill(); }
  }),
};

/* ---------- materials ----------
   The shared finishes. Stations build from these so the four read as one set, lit the same way. */
function withSurface(m, tex, { repeat = [1, 1], bump = 0, rough = true } = {}) {
  tex.repeat.set(...repeat);
  if (rough) m.roughnessMap = tex;
  if (bump) { m.bumpMap = tex; m.bumpScale = bump; }
  return m;
}
export const finish = {
  // paper: matte white, a faint fibre, little reflection so shadows stay soft grey rather than sky blue
  paper: (o = {}) => { const m = withSurface(new THREE.MeshStandardMaterial({ color: o.color ?? INK.paper, roughness: 0.92, map: o.map ?? null }), surfaces.paper(), { repeat: o.repeat ?? [2, 2], bump: 0.004 }); m.envMapIntensity = 0.3; return m; },
  // bead-blasted or brushed aluminium (brushed: streaks along the part's u direction)
  aluminium: (o = {}) => withSurface(new THREE.MeshStandardMaterial({ color: o.color ?? INK.silver, metalness: 1, roughness: o.rough ?? 0.38 }), surfaces.brushed(), { repeat: o.repeat ?? [1, 4], bump: o.brushed === false ? 0 : 0.002, rough: o.brushed !== false }),
  // dark anodised aluminium / graphite metal
  graphite: (o = {}) => withSurface(new THREE.MeshStandardMaterial({ color: o.color ?? INK.graphite, metalness: 0.7, roughness: o.rough ?? 0.42 }), surfaces.brushed(), { repeat: o.repeat ?? [1, 4], rough: o.brushed !== false }),
  // satin plastic or painted metal in a neutral
  satin: (color = INK.steel, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: o.rough ?? 0.5, metalness: 0 }),
  // soft-touch rubber, feet and pads
  rubber: (color = INK.ink) => new THREE.MeshStandardMaterial({ color, roughness: 0.95, metalness: 0 }),
  // black glass: a phone front, a lens
  glass: (o = {}) => { const m = new THREE.MeshStandardMaterial({ color: o.color ?? INK.ink, roughness: 0.06, metalness: 0.2 }); m.envMapIntensity = 1.4; return m; },
  // leather in a neutral, pebbled
  leather: (color = INK.graphite, o = {}) => withSurface(new THREE.MeshStandardMaterial({ color, roughness: 0.78 }), surfaces.leather(), { repeat: o.repeat ?? [2, 2], bump: 0.01 }),
  // the accent, as a satin painted or anodised finish
  accent: (o = {}) => new THREE.MeshStandardMaterial({ color: INK.glow, roughness: o.rough ?? 0.45, metalness: o.metal ?? 0 }),
  // a lit screen: the picture glows on its own, under a thin film of gloss
  screen: (map, strength = 1) => { const m = new THREE.MeshStandardMaterial({ color: '#000000', roughness: 0.2, emissive: '#ffffff', emissiveMap: map, emissiveIntensity: strength }); m.envMapIntensity = 0.6; return m; },
};

// Standard material. o: rough, metal, glow (emissive strength in the material's own colour), flat, side, opacity, map
export function mat(color, o = {}) {
  const m = new THREE.MeshStandardMaterial({
    color,
    roughness: o.rough ?? 0.7,
    metalness: o.metal ?? 0,
    flatShading: o.flat ?? false,
    side: o.side ?? THREE.FrontSide,
    map: o.map ?? null,
  });
  if (o.glow) { m.emissive = new THREE.Color(o.emissive ?? color); m.emissiveIntensity = o.glow; if (o.emissiveMap) m.emissiveMap = o.emissiveMap; }
  if (o.opacity != null && o.opacity < 1) { m.transparent = true; m.opacity = o.opacity; m.depthWrite = false; }
  return m;
}
// Light that is not lit: screens, glowing marks. Added onto the scene only if additive is set
export function glowMat(color, o = {}) {
  return new THREE.MeshBasicMaterial({ color, map: o.map ?? null, transparent: o.opacity != null || !!o.additive, opacity: o.opacity ?? 1,
    blending: o.additive ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: !o.additive, side: o.side ?? THREE.FrontSide, toneMapped: false });
}

export const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
// a box with rounded edges and corners (radius r)
export const roundBox = (w, h, d, r = 0.04, seg = 3) => new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2) * 0.999);
export const cyl = (rt, rb, h, seg = 24) => new THREE.CylinderGeometry(rt, rb, h, seg);

// A flat plate with rounded corners, extruded upward from y = 0 (w along x, d along z, h thick)
export function plate(w, d, h, r = 0.05, bevel = 0.01) {
  const s = new THREE.Shape(), x = w / 2 - r, z = d / 2 - r;
  s.moveTo(-x, -z - r);
  s.lineTo(x, -z - r); s.quadraticCurveTo(x + r, -z - r, x + r, -z);
  s.lineTo(x + r, z); s.quadraticCurveTo(x + r, z + r, x, z + r);
  s.lineTo(-x, z + r); s.quadraticCurveTo(-x - r, z + r, -x - r, z);
  s.lineTo(-x - r, -z); s.quadraticCurveTo(-x - r, -z - r, -x, -z - r);
  const g = new THREE.ExtrudeGeometry(s, { depth: Math.max(0.0001, h - bevel * 2), bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 6 });
  g.rotateX(-Math.PI / 2);        // the shape's y becomes -z, the extrusion runs up +y
  g.translate(0, bevel, 0);
  return g;
}

export function mesh(geometry, material, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, shadow = true } = {}) {
  const m = new THREE.Mesh(geometry, material);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.castShadow = shadow; m.receiveShadow = true;
  return m;
}
// every mesh under root casts and receives shadows (glowing ones only receive nothing)
export function shadows(root, cast = true) {
  root.traverse((o) => { if (o.isMesh) { o.castShadow = cast && !o.material.isMeshBasicMaterial; o.receiveShadow = !o.material.isMeshBasicMaterial; } });
  return root;
}

// A canvas texture drawn by fn(ctx, w, h); flat UI pictures for screens and printed pages
export function canvasTex(w, h, fn) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  fn(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* ---------- time ---------- */
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
// progress of t through [a, b], 0..1
export const seg = (t, a, b) => clamp01((t - a) / (b - a));
export const lerp = (a, b, k) => a + (b - a) * k;
export const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
export const easeIn = (x) => { x = clamp01(x); return x * x * x; };
export const easeOut = (x) => { x = clamp01(x); return 1 - (1 - x) ** 3; };
export const easeInOut = (x) => { x = clamp01(x); return x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2; };
// overshoots past 1 and settles (a thing landing)
export const backOut = (x, s = 1.7) => { x = clamp01(x); const c = s + 1; return 1 + c * (x - 1) ** 3 + s * (x - 1) ** 2; };
// a decaying wobble after an impact at time 0: 0 at x = 0, dies out by x = 1
export const wobble = (x, cycles = 3) => { x = clamp01(x); return Math.sin(x * Math.PI * 2 * cycles) * (1 - x) ** 2; };
// 1 while t is inside [a, b], easing in and out over f seconds at each end
export const window01 = (t, a, b, f = 0.2) => smooth(seg(t, a, a + f)) * (1 - smooth(seg(t, b - f, b)));
