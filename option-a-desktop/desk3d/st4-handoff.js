/*
  Station 4, Handoff or build (Premiere): the keys to the finished project, handed over. A nickel-silver key on a
  steel split ring with a green anodised tag lies on a closed graphite leather folio: the organised files, their
  sections showing as paper between the covers, an elastic band holding them shut.

  The loop runs 8.4 s. It opens on a dim stage, the camera low and wide and creeping in. A spotlight above the front
  fades up into a soft pool on the folio. The key lifts a little, tips up and rolls slowly so its faces sweep through
  the light, then sets back down. The folio, key and all, slides towards the camera as the camera eases in: handed
  over. After a beat a cut (hidden by the core's glitch) puts the light out and everything back where it began,
  which is pose(0), so the dark beat runs on into the next loop.
*/
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export default function build(k) {
  const { THREE, INK } = k;
  const P = 8.4;
  const T = { spot: 1.5, lit: 2.4, lift: 2.7, peak: 4.0, down: 4.95, rest: 5.65, slide: 5.9, handed: 7.2, cut: 8.0 };
  const E = k.easeInOut, S = k.seg;
  const group = new THREE.Group();
  const tray = new THREE.Group();              // the folio and everything on it: the part that is handed over
  group.add(tray);

  // Polished metal lying flat mirrors whatever is above and behind it, which in the room is dark. A product
  // photographer hangs a card there; this is that card, as the metal's own reflection (see studioEnv below).
  const studio = studioEnv();

  /* ---------- the folio: graphite leather covers, a paper block in sections, an elastic band ---------- */
  const F = { w: 1.84, d: 1.24, cover: 0.024, block: 0.1, sq: 0.04, x: -0.04, z: -0.2 };
  const FT = F.cover * 2 + F.block;            // the folio's top face
  const folio = new THREE.Group();
  folio.position.set(F.x, 0, F.z);
  tray.add(folio);

  // a little less rough than the kit's leather, so the spot's pool shows on it as a soft gradient; the grain is drawn
  // large enough to show at this distance as a quiet mottle in the light, not as a pattern
  const leatherTop = k.finish.leather(INK.paper, { repeat: [1.6, 1.6] });
  leatherTop.map = stitching();                // graphite, with the stitching and a crease painted in
  const leather = k.finish.leather(INK.graphite, { repeat: [1.6, 1.6] });
  for (const m of [leatherTop, leather]) { m.roughness = 0.62; m.envMapIntensity = 0.25; m.bumpScale = 0.03; }
  // edge paint close to the leather's own tone: the far edge is thinner than a dot, and a black edge there breaks
  // into dashes that crawl as the camera moves
  const edgePaint = k.finish.satin(INK.graphite, { rough: 0.4 });
  const coverGeo = k.plate(F.w, F.d, F.cover, 0.045, 0.006);
  folio.add(k.mesh(coverGeo, [leather, edgePaint]));
  folio.add(Object.assign(k.mesh(coverGeo, [leatherTop, edgePaint], { y: F.cover + F.block }), { name: 'cover' }));

  // the spine: a half round of leather joining the covers down the left side
  const spineGeo = new THREE.CylinderGeometry(FT / 2, FT / 2, F.d - 0.09, 24, 1, false, Math.PI, Math.PI);
  spineGeo.rotateX(Math.PI / 2);
  folio.add(k.mesh(spineGeo, leather, { x: -F.w / 2 + FT / 2, y: FT / 2 }));

  // the page block, set well back under the covers' edges (so it sits in their shade and never outshines the key),
  // its sheets ruled on the edges in three sections
  const pages = k.finish.paper({ color: INK.steel, map: sheetEdges(), repeat: [1, 1] });
  const blockW = F.w - F.sq - FT / 2;
  folio.add(k.mesh(k.box(blockW, F.block, F.d - F.sq * 2), pages, { x: -F.w / 2 + FT / 2 + blockW / 2, y: F.cover + F.block / 2 }));

  // an elastic closure band across the open side, over the top cover and round the front and back edges
  const bandGeo = (() => {
    const bw = 0.055, bt = 0.006, x = F.w / 2 - 0.2;
    const parts = [
      k.roundBox(bw, bt, F.d + bt * 2, 0.002, 1).translate(x, FT + bt / 2, 0),
      k.roundBox(bw, FT + bt * 2, bt, 0.002, 1).translate(x, FT / 2 + bt / 2, F.d / 2 + bt / 2),
      k.roundBox(bw, FT + bt * 2, bt, 0.002, 1).translate(x, FT / 2 + bt / 2, -F.d / 2 - bt / 2),
    ];
    return mergeGeometries(parts, false);
  })();
  const elastic = k.finish.satin(INK.ink, { rough: 0.62 });
  elastic.roughnessMap = k.surfaces.brushed();       // the woven rib runs round the band
  elastic.roughnessMap.repeat.set(1, 30);
  folio.add(k.mesh(bandGeo, elastic));

  /* ---------- the key, its ring and tag ---------- */
  const KEY_HOLE = -0.24;                      // the hole's centre along the key, in its drawing below
  const KEY_TIP = 0.49;
  const BOW_H = 0.015;                         // half thickness of the bow (the blade is a little thinner)
  const key = new THREE.Group();
  // polished nickel silver: fully metallic, so it shows as reflections and highlights, never as painted grey
  const nickel = k.finish.aluminium({ rough: 0.24, repeat: [2, 16] });
  nickel.envMap = studio;
  key.add(Object.assign(k.mesh(keyGeometry(), nickel), { name: 'key' }));
  tray.add(key);

  const RING = { R: 0.118, wire: 0.0095, turns: 1.5, pitch: 0.02 };
  // a split ring's wire: a flat helix of one and a half turns around y, centred on y = 0
  class Helix extends THREE.Curve {
    getPoint(s, target = new THREE.Vector3()) {
      const ang = s * RING.turns * Math.PI * 2;
      return target.set(RING.R * Math.cos(ang), (s - 0.5) * RING.turns * RING.pitch, RING.R * Math.sin(ang));
    }
  }
  const steel = k.finish.aluminium({ color: INK.steel, rough: 0.2, brushed: false });
  steel.envMap = studio;
  const ring = k.mesh(new THREE.TubeGeometry(new Helix(), 120, RING.wire, 8, false), steel);
  ring.name = 'ring';
  tray.add(ring);

  // the one accent: a green anodised aluminium tag, its diamond-cut edges bare metal. Anodising is a dyed film on
  // the metal, so the tag is fully metallic: its green comes from what it reflects, not from the spot painting it
  const anodised = k.finish.accent({ rough: 0.4, metal: 1 });
  anodised.roughnessMap = k.surfaces.brushed();
  anodised.roughnessMap.repeat.set(3, 12);
  anodised.envMap = studio;
  const tagEdge = k.finish.aluminium({ rough: 0.2, brushed: false });
  tagEdge.envMap = studio;
  const tag = k.mesh(tagGeometry(), [anodised, tagEdge]);
  tag.name = 'tag';
  tray.add(tag);
  const metals = [[nickel, 1], [steel, 1], [anodised, 0.55], [tagEdge, 1]];

  /* ---------- rest layout (tray-local) ---------- */
  const YAW = 0.16;                              // the key's heading: tip a little to the back right
  const H0 = new THREE.Vector3(-0.42, FT + BOW_H + 0.021, -0.25);  // the key's hole; its bow rests on the ring's wire
  const TILT0 = Math.asin((FT + 0.013 - H0.y) / (KEY_TIP - KEY_HOLE));   // so the tip lies on the leather
  const dirXZ = (a) => new THREE.Vector3(Math.cos(a), 0, -Math.sin(a));
  const beta = Math.PI + YAW + 0.72;
  const E0 = H0.clone().addScaledVector(dirXZ(beta), 0.19).setY(FT + 0.022);  // the tag's eyelet, near enough that the lifted key never drags it
  const TAG_YAW = beta + 0.2;
  const REST_W = dirXZ(beta + 0.9);               // which side of the chord the ring lies
  const FLOOR = FT + RING.wire;

  /* ---------- the spot ---------- */
  const SPOT = { pos: new THREE.Vector3(0.3, 4.4, 2.5), aim: new THREE.Vector3(-0.16, 0.1, -0.4), power: 210 };
  const spot = new THREE.SpotLight(INK.paper, 0, 0, 0.21, 1, 2);
  spot.castShadow = true;
  spot.shadow.mapSize.set(1024, 1024);
  spot.shadow.bias = -0.0004;
  spot.shadow.normalBias = 0.01;
  spot.shadow.radius = 3;
  Object.assign(spot.shadow.camera, { near: 2.5, far: 7 });
  spot.shadow.needsUpdate = true;               // draw its map once up front, so a dark spot still has one to bind
  group.add(spot, spot.target);

  k.shadows(tray);

  /* ---------- poses ---------- */
  const H = new THREE.Vector3(), Et = new THREE.Vector3();
  const eul = new THREE.Euler(0, 0, 0, 'YZX');
  const u = new THREE.Vector3(), M = new THREE.Vector3(), a = new THREE.Vector3(), b = new THREE.Vector3();
  const w = new THREE.Vector3(), n = new THREE.Vector3(), ex = new THREE.Vector3(), ez = new THREE.Vector3();
  const basis = new THREE.Matrix4();

  // the key turns about its own hole, so the ring stays threaded; only the lift moves the hole
  function keyPose(t) {
    const live = t > 0 && t < T.cut;
    // set down more slowly than it was picked up, so it lands without a knock
    const up = live ? E(S(t, T.lift, T.lift + 1.0)) - E(S(t, T.down - 0.1, T.rest)) : 0;
    const tip = live ? E(S(t, T.lift + 0.15, T.lift + 1.2)) - E(S(t, T.down - 0.2, T.rest - 0.1)) : 0;
    const roll = live ? E(S(t, T.lift + 0.25, T.peak)) - E(S(t, T.peak + 0.15, T.down + 0.2)) : 0;
    const turn = live ? Math.sin(Math.PI * S(t, T.lift + 0.15, T.rest - 0.2)) ** 2 : 0;
    H.copy(H0); H.y += 0.12 * up;
    key.position.copy(H);
    // the roll sweeps the face through the angle where it mirrors the spot and the softbox, so it glints once going
    // up and once coming back, and at the top of the roll the bitting shows in silhouette
    key.rotation.copy(eul.set(1.2 * roll, YAW - 0.3 * turn, TILT0 + 0.2 * tip));
  }

  // a rigid ring through two points (the key's hole, the tag's eyelet): of all the ways it can turn about that chord,
  // take the lowest that clears the leather, as a ring settles under its own weight
  function ringPose() {
    Et.copy(E0);
    const reach = 2 * RING.R * 0.985;
    let dist = Et.distanceTo(H);
    if (dist > reach) {                          // the lifted key drags the tag a little way after it
      u.set(H.x - Et.x, 0, H.z - Et.z).normalize();
      Et.addScaledVector(u, dist - reach);
      dist = Et.distanceTo(H);
    }
    u.subVectors(H, Et).divideScalar(dist);
    M.addVectors(H, Et).multiplyScalar(0.5);
    const d = Math.min(dist / 2, RING.R * 0.999), h = Math.sqrt(RING.R * RING.R - d * d);
    a.copy(REST_W).addScaledVector(u, -REST_W.dot(u)).normalize();
    b.crossVectors(u, a);
    const low = (ang) => {
      w.copy(a).multiplyScalar(Math.cos(ang)).addScaledVector(b, Math.sin(ang));
      n.crossVectors(u, w);
      return M.y + h * w.y - RING.R * Math.sqrt(Math.max(0, 1 - n.y * n.y)) - RING.pitch * 0.75 * Math.abs(n.y) - FLOOR;
    };
    // start from the ring lying level (the far side of the chord at the chord's height) and let the far side drop
    // until the ring touches the leather or hangs straight down
    let flat = Math.atan2(-a.y, b.y);
    if (Math.cos(flat) < 0) flat += Math.PI;
    const drop = (-a.y * Math.sin(flat) + b.y * Math.cos(flat)) > 0 ? -1 : 1;
    let lo = flat, hi = flat + drop * Math.PI / 2, ang;
    if (low(lo) < 0) ang = lo;
    else if (low(hi) >= 0) ang = hi;
    else { for (let i = 0; i < 26; i++) { const m = (lo + hi) / 2; if (low(m) >= 0) lo = m; else hi = m; } ang = lo; }
    low(ang);
    ring.position.copy(M).addScaledVector(w, h);
    ex.copy(w).negate(); ez.crossVectors(ex, n);
    ring.quaternion.setFromRotationMatrix(basis.makeBasis(ex, n, ez));

    tag.position.copy(Et);
    tag.rotation.set(0, TAG_YAW, -0.035, 'YXZ');
  }

  function lightUp(t) {
    const live = t > 0 && t < T.cut;
    const on = live ? k.smooth(S(t, T.spot, T.lit)) ** 1.4 : 0;
    spot.intensity = SPOT.power * on;
    // the light stays in the scene so shaders never recompile; its shadow pass only runs while it is lit
    spot.shadow.autoUpdate = on > 0.001;
    // the metal's card comes up with the spot, so in the dark beat the key is only a faint gleam
    for (const [m, g] of metals) m.envMapIntensity = g * k.lerp(0.16, 1, on);
    // a follow spot: it keeps the folio in its pool as it is handed over
    spot.position.copy(SPOT.pos).add(tray.position);
    spot.target.position.copy(SPOT.aim).add(tray.position);
  }

  function slide(t) {
    const live = t > 0 && t < T.cut;
    const s = live ? E(S(t, T.slide, T.handed)) : 0;
    tray.position.set(-0.03 * s, 0, 0.46 * s);
  }

  /* ---------- camera: a long lens, low and wide in the dark, craning up and in as the light comes up ---------- */
  // pitched down far enough at every point that the desk's back edge (and the bright field above it) stays out of shot
  const CAM = {
    pos: [new THREE.Vector3(0.1, 3.1, 5.0), new THREE.Vector3(0.0, 3.08, 4.3), new THREE.Vector3(-0.06, 3.05, 3.4)],
    aim: [new THREE.Vector3(-0.02, 0.05, -0.25), new THREE.Vector3(-0.05, 0.05, -0.25), new THREE.Vector3(0.0, 0.05, -0.16)],
    push: new THREE.Vector3(0.0, -0.25, -0.4),
  };
  const camCurve = new THREE.CatmullRomCurve3(CAM.pos, false, 'centripetal');
  const aimCurve = new THREE.CatmullRomCurve3(CAM.aim, false, 'centripetal');
  const CRANE = T.rest + P - T.cut;               // the crane runs from the cut to the key's rest

  return {
    name: 'handoff',
    period: P,
    still: 5,              // the key in the spot's pool, turned so the blade catches the light: the reveal itself
    cuts: [T.cut],
    group,
    // no rim: seen from the front, a rim light only lays a wide blue sheen across the felt, which fights the pool
    mood: { key: 0.32, fill: 0.4, rim: 0 },
    update(t) {
      slide(t);
      keyPose(t);
      ringPose();
      lightUp(t);
    },
    camera(t, out) {
      const since = (t - T.cut + P) % P;         // time since the cut; runs on smoothly over the loop's seam
      const c = k.smooth(Math.min(1, since / CRANE));
      camCurve.getPoint(c, out.pos);
      aimCurve.getPoint(c, out.target);
      const live = t > 0 && t < T.cut;
      const s = live ? E(S(t, T.slide, T.handed + 0.2)) : 0;
      out.pos.addScaledVector(CAM.push, s);
      out.target.z += 0.5 * s;
      out.target.x += 0.03 * s;
      out.fov = k.lerp(16, 19, c);
    },
  };

  /* ---------- builders ---------- */

  // A modern pin-tumbler key in its own frame: the hole at the origin, the blade along +x, lying flat (thickness on
  // y), the bitting on the back edge. Built from slabs so the milled keyway grooves are real recesses and every edge
  // carries a small 45 degree chamfer, which is where the light catches.
  function keyGeometry() {
    const yT = 0.045, yB = -0.045;              // the blade's edges
    const s = new THREE.Shape();
    s.moveTo(KEY_TIP - 0.018, yB);
    s.lineTo(0.0, yB);
    // the neck flares into the bow
    s.bezierCurveTo(-0.03, yB, -0.04, -0.118, -0.085, -0.118);
    s.lineTo(-0.23, -0.118); s.bezierCurveTo(-0.295, -0.118, -0.315, -0.09, -0.315, -0.04);
    s.lineTo(-0.315, 0.04); s.bezierCurveTo(-0.315, 0.09, -0.295, 0.118, -0.23, 0.118);
    s.lineTo(-0.085, 0.118); s.bezierCurveTo(-0.04, 0.118, -0.03, 0.064, 0.0, 0.064);
    s.lineTo(0.03, 0.064); s.lineTo(0.03, yT);                  // the shoulder that stops the key at the lock face
    // six V cuts of differing depth with small flat roots; neighbouring flanks meet in peaks, as a real key's do
    const depth = [0.018, 0.03, 0.014, 0.026, 0.032, 0.02], pitch = 0.054, first = 0.078, f = 0.005, slope = 0.95;
    const root = (i) => first + i * pitch;
    s.lineTo(root(0) - f / 2 - depth[0] / slope, yT);
    depth.forEach((dp, i) => {
      const r = root(i);
      s.lineTo(r - f / 2, yT - dp); s.lineTo(r + f / 2, yT - dp);
      if (i < depth.length - 1) {
        const dn = depth[i + 1], rn = root(i + 1);
        // where this cut's right flank meets the next cut's left flank, capped at the blade's edge
        const xp = ((r + f / 2) + (rn - f / 2)) / 2 + (dp - dn) / (2 * slope);
        const yp = yT - dp + (xp - r - f / 2) * slope;
        if (yp < yT) s.lineTo(xp, yp);
        else { s.lineTo(r + f / 2 + dp / slope, yT); s.lineTo(rn - f / 2 - dn / slope, yT); }
      } else s.lineTo(r + f / 2 + dp / slope, yT);
    });
    s.lineTo(KEY_TIP - 0.05, yT); s.lineTo(KEY_TIP, 0.004); s.lineTo(KEY_TIP, yB + 0.018);
    const outline = s.getPoints(12);
    const circle = (x, y, r, n = 40) => new THREE.Path().absarc(x, y, r, 0, Math.PI * 2, true).getPoints(n);
    const hole = circle(KEY_HOLE, 0, 0.034);

    const band = (poly, lo, hi) => clip(clip(poly, 'y', lo, 1), 'y', hi, -1);
    const bow = clip(outline, 'x', 0.034, -1);
    const blade = clip(outline, 'x', 0.028, 1);
    const hB = BOW_H, hK = 0.013, g = 0.005, c = 0.006;     // half thicknesses, groove depth, chamfer
    const parts = [
      // the bow: a plain core, then a top and bottom plate whose chamfers make the edge and the hole's lip; each
      // plate's inner chamfer is buried in the core
      slab(bow, -hB + 0.004, hB - 0.004, 0, [hole]),
      slab(bow, hB - 0.004 - 0.008, hB, c, [hole]),
      slab(bow, -hB, -hB + 0.004 + 0.008, c, [hole]),
      // the blade: a core, then face plates with the keyway grooves between them (a wide one on top, a narrow
      // one lower down on the underside)
      slab(blade, -(hK - g), hK - g, 0),
      slab(band(blade, 0.012, 1), hK - g - 0.008, hK, 0.004),
      slab(band(blade, -1, -0.006), hK - g - 0.008, hK, c),
      slab(band(blade, -0.024, 1), -hK, -hK + g + 0.008, 0.004),
      slab(band(blade, -1, -0.034), -hK, -hK + g + 0.008, 0.004),
    ];
    const merged = mergeGeometries(parts, false);
    parts.forEach((p) => p.dispose());
    merged.translate(-KEY_HOLE, 0, 0);
    merged.rotateX(-Math.PI / 2);              // shape y (bitting side) turns to -z, the upper face to +y
    return merged;
  }

  // Sutherland-Hodgman against one half plane: keep the side where sign * (p[axis] - v) >= 0
  function clip(poly, axis, v, sign) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const p = poly[i], q = poly[(i + 1) % poly.length];
      const dp = (p[axis] - v) * sign, dq = (q[axis] - v) * sign;
      if (dp >= 0) out.push(p);
      if ((dp >= 0) !== (dq >= 0)) out.push(new THREE.Vector2().lerpVectors(p, q, dp / (dp - dq)));
    }
    return out;
  }

  // a polygon extruded between z0 and z1; bev > 0 gives its edges a flat 45 degree chamfer that stays inside the
  // outline (so parts meet exactly where drawn)
  function slab(poly, z0, z1, bev, holes = []) {
    const sh = new THREE.Shape(poly);
    holes.forEach((h) => sh.holes.push(new THREE.Path(h)));
    const g = new THREE.ExtrudeGeometry(sh, bev > 0
      ? { depth: Math.max(1e-4, z1 - z0 - 2 * bev), bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelOffset: -bev, bevelSegments: 1, curveSegments: 1 }
      : { depth: z1 - z0, bevelEnabled: false, curveSegments: 1 });
    g.translate(0, 0, z0 + bev);
    return g;
  }

  // a key tag: round at the eyelet end (the eyelet at the origin), square-cornered at the other, lying flat
  function tagGeometry() {
    const s = new THREE.Shape(), r = 0.052, L = 0.29, rc = 0.02;
    s.moveTo(0, -r);
    s.lineTo(L - rc, -r); s.quadraticCurveTo(L, -r, L, -r + rc);
    s.lineTo(L, r - rc); s.quadraticCurveTo(L, r, L - rc, r);
    s.lineTo(0, r);
    s.absarc(0, 0, r, Math.PI / 2, Math.PI * 1.5, false);
    const eye = new THREE.Path(); eye.absarc(0, 0, 0.02, 0, Math.PI * 2, true);
    s.holes.push(eye);
    // a flat 45 degree chamfer all round: the diamond-cut edge that shows bare metal through the anodising
    const th = 0.018, bev = 0.006;
    const g = new THREE.ExtrudeGeometry(s, { depth: th - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelOffset: -bev, bevelSegments: 1, curveSegments: 16 });
    g.translate(0, 0, -th / 2 + bev);
    g.rotateX(-Math.PI / 2);
    return g;
  }

  // the top cover's face: graphite leather with a line of tonal stitching set in from the edge
  function stitching() {
    const px = 1024 / F.w;
    const tex = k.canvasTex(1024, Math.round(F.d * px), (c, W, Hh) => {
      c.fillStyle = INK.graphite; c.fillRect(0, 0, W, Hh);
      const inset = 0.05 * px, r = 0.028 * px;
      // stitches finer than a dither dot, so the seam reads as a quiet line rather than a dotted outline
      c.globalAlpha = 0.5; c.strokeStyle = INK.slate; c.lineWidth = 0.005 * px; c.lineCap = 'round';
      c.setLineDash([0.009 * px, 0.005 * px]);
      c.beginPath(); c.roundRect(inset, inset, W - inset * 2, Hh - inset * 2, r); c.stroke();
      // a faint creased rule inside the stitching
      c.globalAlpha = 0.8; c.setLineDash([]); c.strokeStyle = INK.ink; c.lineWidth = 0.004 * px;
      const i2 = inset + 0.02 * px;
      c.beginPath(); c.roundRect(i2, i2, W - i2 * 2, Hh - i2 * 2, r); c.stroke();
    });
    tex.repeat.set(1 / F.w, 1 / F.d);
    tex.offset.set(0.5, 0.5);
    return tex;
  }

  // the page block's edges: fine sheets in three sections, each parted by a divider card
  function sheetEdges() {
    return k.canvasTex(64, 256, (c, W, Hh) => {
      c.fillStyle = INK.silver; c.fillRect(0, 0, W, Hh);
      for (let y = 2; y < Hh; y += 4) { c.fillStyle = (y / 4) % 2 < 1 ? INK.paperTint : INK.steelDeep; c.fillRect(0, y, W, 1); }
      for (const y of [Hh * 0.34, Hh * 0.67]) { c.fillStyle = INK.slate; c.fillRect(0, y | 0, W, 6); }
    });
  }

  // The metal's reflections, an HDR studio drawn as an equirectangular map: a dark room, a broad card overhead
  // and behind (what a flat face sees from the camera's angle), the softbox in front and to the left (what a
  // chamfer facing the camera sees), a strip on the right and the room's blue low behind. Neutral whites only,
  // plus the room's own blue.
  function studioEnv() {
    const W = 256, Hh = 128, data = new Uint16Array(W * Hh * 4);
    const lin = (hex, g) => new THREE.Color(hex).multiplyScalar(g);
    const up = lin(INK.graphite, 0.35), horizon = lin(INK.slate, 0.1), floor = lin(INK.ink, 0.5);
    const white = lin(INK.paper, 1), blue = lin(INK.blue, 0.9);
    const ss = (e0, e1, x) => k.smooth((x - e0) / (e1 - e0));
    const box = (x, a, b, f) => ss(a - f, a + f, x) * (1 - ss(b - f, b + f, x));
    const ang = (phi, c) => Math.atan2(Math.sin(phi - c), Math.cos(phi - c));
    const col = new THREE.Color();
    const add = (c, g) => { col.r += c.r * g; col.g += c.g * g; col.b += c.b * g; };
    for (let j = 0; j < Hh; j++) {
      const el = ((j + 0.5) / Hh - 0.5) * Math.PI;     // rows run from straight down to straight up
      for (let i = 0; i < W; i++) {
        const phi = ((i + 0.5) / W - 0.5) * Math.PI * 2; // 0 is +x, pi/2 is +z (towards the viewer), -pi/2 behind
        if (el > 0) col.copy(horizon).lerp(up, Math.min(1, el / 0.9));
        else col.copy(floor);
        // the card's right-hand edge falls off across the angles the resting key sees, so its face runs from bright
        // at the bow to a darker grey at the tip, as polished metal does at a softbox's edge
        const across = ang(phi, -Math.PI / 2);
        // it stops short of white and ends well below the zenith: a tipped key must not blow out, and the dark gap
        // overhead is what makes the roll read as metal (bright, dark, a flash, then steel grey)
        const card = box(across, -0.95, 0.95, 0.35) * box(el, 0.3, 1.02, 0.2) * (0.14 + 0.96 * (1 - ss(-0.16, 0.16, across)));
        add(white, card);
        // the softbox in front, a strip: the chamfers facing the camera sit in it at rest, a rolling face only
        // crosses it, so its glint is a flash rather than a held white. Mid-roll the reflection moves about 0.1 rad
        // a frame, so its edges ramp over several frames instead of strobing from dark to white
        const soft = box(ang(phi, Math.PI / 2 + 0.4), -0.5, 0.5, 0.2) * box(el, 0.55, 1.05, 0.2);
        add(white, soft * 2.0);
        // a faint ceiling, so the gap between card and softbox is dark grey rather than black
        add(white, 0.1 * ss(0.8, 1.3, el));
        // a dim bounce card low in front, so a face turned towards the camera goes steel grey, not black
        const bounce = box(ang(phi, Math.PI / 2), -1.1, 1.1, 0.4) * box(el, -0.05, 0.42, 0.15);
        add(white, bounce * 0.28);
        const strip = box(ang(phi, 0), -0.09, 0.09, 0.05) * box(el, 0.05, 0.95, 0.1);
        add(white, strip * 1.4);
        const rimStrip = box(ang(phi, -Math.PI / 2 + 0.55), -0.9, 0.9, 0.2) * box(el, 0.08, 0.26, 0.06);
        add(blue, rimStrip);
        const o = (j * W + i) * 4;
        data[o] = THREE.DataUtils.toHalfFloat(col.r);
        data[o + 1] = THREE.DataUtils.toHalfFloat(col.g);
        data[o + 2] = THREE.DataUtils.toHalfFloat(col.b);
        data[o + 3] = THREE.DataUtils.toHalfFloat(1);
      }
    }
    const tex = new THREE.DataTexture(data, W, Hh, THREE.RGBAFormat, THREE.HalfFloatType);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    tex.magFilter = tex.minFilter = THREE.LinearFilter;
    tex.needsUpdate = true;
    return tex;
  }
}
