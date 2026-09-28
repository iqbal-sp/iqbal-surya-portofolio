/*
  Station 3, Design and review (Series). A phone stands in a milled aluminium dock, showing an app screen; the
  flow's next screens float beside it as thin glass panes, joined to the phone's green button by a hairline
  prototype connector. A pointer, the reviewer, glides in and clicks the button; the screen pushes on to the next
  screen and a comment bubble settles beside the phone. Everything is neutral except that one button.

  The 8 s loop is three shots joined by hard cuts: wide (the camera arrives, then the pointer glides in), close
  (the click and the push) and three-quarter (the comment; the still). The cut back to the wide shot hides the
  reset, so t = 0 and t = 8 are the same frame.
*/
export default function build(k) {
  const { THREE, INK } = k;
  const P = 8;
  const CUT = [2.6, 4.7, 7.0];              // wide | close | three-quarter | wide again
  const group = new THREE.Group();
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const V2 = (x = 0, y = 0) => new THREE.Vector2(x, y);

  /* ---------- geometry helpers ---------- */
  // a rounded rectangle centred on the origin; sharp: corners to leave square ({ bl, br, tr, tl })
  function rrShape(w, h, r, sharp = {}) {
    const s = new THREE.Shape(), a = w / 2, b = h / 2;
    const R = (c) => (sharp[c] ? 0 : Math.min(r, a, b));
    let q = R('bl'); s.moveTo(-a + q, -b);
    q = R('br'); s.lineTo(a - q, -b); if (q) s.absarc(a - q, -b + q, q, -Math.PI / 2, 0, false);
    q = R('tr'); s.lineTo(a, b - q); if (q) s.absarc(a - q, b - q, q, 0, Math.PI / 2, false);
    q = R('tl'); s.lineTo(-a + q, b); if (q) s.absarc(-a + q, b - q, q, Math.PI / 2, Math.PI, false);
    q = R('bl'); s.lineTo(-a, -b + q); if (q) s.absarc(-a + q, -b + q, q, Math.PI, Math.PI * 1.5, false);
    return s;
  }
  // extruded along z and centred on z = 0; the bevel rounds the edges without growing the outline
  function slab(shape, depth, bevel = 0, seg = 12) {
    const d = Math.max(1e-4, depth - bevel * 2);
    const g = new THREE.ExtrudeGeometry(shape, { depth: d, bevelEnabled: bevel > 0, bevelThickness: bevel, bevelSize: bevel, bevelOffset: -bevel, bevelSegments: 3, curveSegments: seg });
    g.translate(0, 0, -d / 2);
    return g;
  }
  // a flat face whose UVs span its box, or one cell of the screen atlas
  function face(shape, w, h, cell = -1) {
    const g = new THREE.ShapeGeometry(shape, 12), uv = g.attributes.uv, p = g.attributes.position;
    for (let i = 0; i < uv.count; i++) {
      let u = p.getX(i) / w + 0.5;
      if (cell >= 0) u = (cell + u) / CELLS;
      uv.setXY(i, u, p.getY(i) / h + 0.5);
    }
    return g;
  }
  // several geometries as one (fewer draw calls for parts that never move apart)
  function merge(parts) {
    const geos = parts.map((g) => (g.index ? g.toNonIndexed() : g));
    const out = new THREE.BufferGeometry();
    for (const n of ['position', 'normal', 'uv']) {
      const size = geos[0].attributes[n].itemSize;
      const arr = new Float32Array(geos.reduce((s, g) => s + g.attributes[n].array.length, 0));
      let o = 0;
      for (const g of geos) { arr.set(g.attributes[n].array, o); o += g.attributes[n].array.length; }
      out.setAttribute(n, new THREE.BufferAttribute(arr, size));
    }
    return out;
  }
  const placed = (g, { x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0, order = 'XYZ' } = {}) => {
    g.applyMatrix4(new THREE.Matrix4().compose(V3(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz, order)), V3(1, 1, 1)));
    return g;
  };
  // a closed outline through pts, each corner rounded by radii[i] (a gentle quadratic round, fine at this size)
  function roundedPoly(pts, radii) {
    const s = new THREE.Shape(), n = pts.length;
    pts.forEach((c, i) => {
      const p = pts[(i + n - 1) % n], q = pts[(i + 1) % n], r = radii[i];
      const a = c.clone().sub(p), b = q.clone().sub(c);
      const p1 = c.clone().addScaledVector(a.clone().normalize(), -Math.min(r, a.length() / 2));
      const p2 = c.clone().addScaledVector(b.clone().normalize(), Math.min(r, b.length() / 2));
      if (i) s.lineTo(p1.x, p1.y); else s.moveTo(p1.x, p1.y);
      s.quadraticCurveTo(c.x, c.y, p2.x, p2.y);
    });
    s.closePath();
    return s;
  }

  /* ---------- colour through the picture ----------
     The post pass runs everything through a filmic curve (desk.js, exposure 1.15), which lifts mid tones and
     never quite reaches white. Screens and glowing marks are pre-bent by its inverse, so a canvas colour lands on
     the screen as the INK value it names: white is white, slate is slate, the button is exactly Focus Glow. */
  const EXPOSURE = 1.15, GAIN = 4.9;
  const l2s = (v) => (v <= 0.0031308 ? v * 12.92 : 1.055 * v ** (1 / 2.4) - 0.055);
  const unfilm = (y) => { y = Math.min(y, 0.99); const a = 2.51 - 2.43 * y, b = 0.03 - 0.59 * y, c = -0.14 * y; return (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a) / EXPOSURE; };
  const px = (hex, alpha = 1) => {
    const c = new THREE.Color(hex), ch = (v) => Math.round(l2s(Math.min(1, unfilm(v) / GAIN)) * 255);
    return `rgba(${ch(c.r)}, ${ch(c.g)}, ${ch(c.b)}, ${alpha})`;
  };
  const exact = (hex) => { const c = new THREE.Color(hex); return new THREE.Color().setRGB(unfilm(c.r), unfilm(c.g), unfilm(c.b)); };

  /* ---------- sizes (phone-local: x right, y up the phone from its foot, z out of the screen) ---------- */
  const PH = { w: 0.72, h: 1.5, t: 0.08, r: 0.11 };
  const BEZEL = 0.017;                               // the frame's edge plus a 1.1 mm black border round the picture
  const SCR = { w: PH.w - BEZEL * 2, h: PH.h - BEZEL * 2, r: PH.r - BEZEL + 0.004 };
  const zFront = PH.t / 2 + 0.002, zScr = zFront + 0.0006;
  const TILT = 12 * Math.PI / 180;
  // the app is laid out in iPhone points, 390 wide; a point on it in phone space
  const PT = SCR.w / 390, DESIGN_H = SCR.h / PT;
  const at = (x, y, z = zScr) => V3((x - 195) * PT, BEZEL + (DESIGN_H - y) * PT, z);
  const BTN = { x: 24, y: 628, w: 342, h: 52, r: 16 };   // the primary button, with a text link under it

  /* ---------- the screens: one atlas, drawn once ----------
     0 and 1 are the phone's (it pushes from 0 to 1); 2..4 are the panes, whose buttons are grey so the one
     green on screen stays the phone's. */
  const CELLS = 5, CW = 300, CH = Math.round(CW * DESIGN_H / 390);
  const atlas = k.canvasTex(CW * CELLS, CH, (c) => {
    [[home, INK.glow, INK.glowInk], [detail, INK.glow, INK.glowInk], [detail, INK.steelDeep, INK.paper], [gallery], [profile]].forEach(([draw, btn, label], i) => {
      c.save(); c.translate(i * CW, 0); c.beginPath(); c.rect(0, 0, CW, CH); c.clip();
      const p = painter(c, CW / 390);
      p.rect(0, 0, 390, DESIGN_H + 2, 0, INK.paper);
      statusBar(p);
      draw(p);
      if (btn) { p.rect(BTN.x, BTN.y, BTN.w, BTN.h, BTN.r, btn); p.rect(155, BTN.y + 21.5, 80, 9, 4.5, label); p.rect(160, BTN.y + 80, 70, 9, 4.5, INK.slate); }
      p.rect(128, DESIGN_H - 14, 134, 5, 2.5, INK.ink);            // home indicator
      c.restore();
    });
  });
  function painter(c, s) {
    const api = {
      rect(x, y, w, h, r, col, a = 1) { c.fillStyle = px(col, a); c.beginPath(); c.roundRect(x * s, y * s, w * s, h * s, r * s); c.fill(); },
      frame(x, y, w, h, r, lw, col, a = 1) { c.strokeStyle = px(col, a); c.lineWidth = lw * s; c.beginPath(); c.roundRect(x * s, y * s, w * s, h * s, r * s); c.stroke(); },
      dot(x, y, r, col, a = 1) { c.fillStyle = px(col, a); c.beginPath(); c.arc(x * s, y * s, r * s, 0, Math.PI * 2); c.fill(); },
      ring(x, y, r, lw, col) { c.strokeStyle = px(col); c.lineWidth = lw * s; c.beginPath(); c.arc(x * s, y * s, r * s, 0, Math.PI * 2); c.stroke(); },
      line(pts, lw, col) { c.strokeStyle = px(col); c.lineWidth = lw * s; c.lineCap = c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x * s, y * s) : c.moveTo(x * s, y * s))); c.stroke(); },
      chevron(x, y, col, back = false) { const d = back ? -1 : 1; api.line([[x - 3.5 * d, y - 7], [x + 3.5 * d, y], [x - 3.5 * d, y + 7]], 2.2, col); },
      // a greyscale picture: a soft gradient, a pale disc and two layered hills, clipped to a rounded card
      picture(x, y, w, h, r, v = 0) {
        c.save(); c.beginPath(); c.roundRect(x * s, y * s, w * s, h * s, r * s); c.clip();
        const g = c.createLinearGradient(0, y * s, 0, (y + h) * s);
        g.addColorStop(0, px(v % 2 ? INK.steel : INK.silver)); g.addColorStop(1, px(v % 2 ? INK.silver : INK.steel));
        c.fillStyle = g; c.fillRect(x * s, y * s, w * s, h * s);
        api.dot(x + w * (0.7 - 0.35 * (v % 2)), y + h * 0.3, h * 0.13, INK.paper, 0.8);
        const hill = (y0, amp, col, ph) => {
          c.fillStyle = px(col); c.beginPath(); c.moveTo(x * s, (y + h) * s);
          for (let i = 0; i <= 24; i++) { const u = i / 24; c.lineTo((x + w * u) * s, (y + h * (y0 - amp * Math.sin(Math.PI * (u * 1.3 + ph)))) * s); }
          c.lineTo((x + w) * s, (y + h) * s); c.fill();
        };
        hill(0.72, 0.2, INK.steelDeep, 0.1 + v * 0.4);
        hill(0.86, 0.14, INK.slate, 0.7 + v * 0.3);
        c.restore();
      },
    };
    return api;
  }
  function statusBar(p) {
    p.rect(34, 17, 32, 11, 5.5, INK.graphite);
    [4, 6, 8.5, 11].forEach((h, i) => p.rect(290 + i * 5, 28 - h, 3.2, h, 1, INK.graphite));
    p.frame(334, 16.5, 24, 12, 3.8, 1.2, INK.graphite, 0.5);
    p.rect(336, 18.5, 17, 8, 2, INK.graphite);
  }
  // home: a big title, a segmented control, a picture card with its caption, two list rows
  function home(p) {
    p.rect(24, 70, 170, 25, 7, INK.graphite);
    p.rect(24, 105, 112, 9, 4.5, INK.steelDeep);
    p.dot(344, 86, 21, INK.silver); p.dot(344, 80, 7.5, INK.steelDeep); p.rect(331, 91, 26, 12, 6, INK.steelDeep);
    p.rect(24, 132, 342, 34, 10, INK.silver, 0.75);
    p.rect(27, 135, 112, 28, 8, INK.paper);
    p.rect(60, 145, 46, 8, 4, INK.graphite); p.rect(178, 145, 36, 8, 4, INK.slate); p.rect(292, 145, 40, 8, 4, INK.slate);
    p.picture(24, 180, 342, 192, 20, 0);
    p.rect(38, 194, 62, 22, 11, INK.paper, 0.92); p.rect(50, 201, 38, 8, 4, INK.slate);
    p.rect(24, 388, 196, 14, 7, INK.graphite); p.rect(24, 410, 132, 9, 4.5, INK.slate); p.rect(312, 388, 54, 14, 7, INK.graphite);
    [0, 1].forEach((i) => {
      const y = 442 + i * 70;
      p.rect(24, y, 52, 52, 13, INK.silver); p.dot(50, y + 26, 11, INK.steelDeep);
      p.rect(90, y + 13, 150, 11, 5.5, INK.graphite); p.rect(90, y + 32, 104, 8, 4, INK.slate);
      p.chevron(356, y + 26, INK.steelDeep);
      p.rect(90, y + 62, 276, 1.2, 0, INK.silver);
    });
  }
  // detail: a picture with pager dots, a title, three rows with switches
  function detail(p) {
    p.chevron(30, 82, INK.graphite, true);
    p.ring(318, 82, 9, 1.8, INK.graphite); p.dot(352, 82, 2, INK.graphite); p.dot(344, 82, 2, INK.graphite); p.dot(360, 82, 2, INK.graphite);
    p.picture(24, 104, 342, 212, 22, 1);
    [0, 1, 2].forEach((i) => p.dot(183 + i * 12, 332, 3.3, i ? INK.silver : INK.graphite));
    p.rect(24, 352, 220, 17, 8.5, INK.graphite); p.rect(24, 378, 164, 9, 4.5, INK.slate);
    [0, 1, 2].forEach((i) => {
      const y = 400 + i * 56, on = i < 2;
      p.rect(24, y + 15, 132, 10, 5, INK.graphite); p.rect(24, y + 32, 92, 8, 4, INK.slate);
      p.rect(314, y + 12, 52, 31, 15.5, on ? INK.graphite : INK.silver);
      p.dot(on ? 350.5 : 329.5, y + 27.5, 13, INK.paper);
      p.rect(24, y + 55, 342, 1.2, 0, INK.silver);
    });
  }
  // gallery: a title, filter chips, a grid of pictures and a tab bar
  function gallery(p) {
    p.rect(24, 70, 130, 25, 7, INK.graphite); p.ring(346, 82, 9, 2, INK.graphite); p.line([[352.5, 88.5], [359, 95]], 2.2, INK.graphite);
    [[24, 74, 1], [106, 64, 0], [178, 80, 0], [266, 60, 0]].forEach(([x, w, on]) => { if (on) p.rect(x, 116, w, 30, 15, INK.graphite); else p.frame(x, 116, w, 30, 15, 1.2, INK.steelDeep); p.rect(x + 16, 127, w - 32, 8, 4, on ? INK.paper : INK.slate); });
    for (let i = 0; i < 6; i++) p.picture(24 + (i % 2) * 175, 162 + Math.floor(i / 2) * 182, 167, 170, 16, i);
    p.rect(0, 740, 390, 1.2, 0, INK.silver);
    [60, 150, 240, 330].forEach((x, i) => (i ? p.frame(x - 11, 760, 22, 22, 7, 2, INK.slate) : p.rect(x - 11, 760, 22, 22, 7, INK.graphite)));
  }
  // profile: a portrait, a name, three figures, an outlined button and a list
  function profile(p) {
    p.chevron(30, 82, INK.graphite, true);
    [344, 352, 360].forEach((x) => p.dot(x, 82, 2, INK.graphite));
    p.dot(195, 156, 48, INK.silver); p.dot(195, 142, 17, INK.steelDeep); p.rect(166, 165, 58, 30, 15, INK.steelDeep);
    p.rect(122, 222, 146, 16, 8, INK.graphite); p.rect(150, 247, 90, 9, 4.5, INK.slate);
    [95, 195, 295].forEach((x, i) => { p.rect(x - 20, 284, 40, 13, 6.5, INK.graphite); p.rect(x - 26, 305, 52, 8, 4, INK.slate); if (i) p.rect(x - 50, 284, 1.2, 30, 0, INK.silver); });
    p.frame(24, 338, 342, 46, 14, 1.6, INK.graphite); p.rect(155, 357, 80, 9, 4.5, INK.graphite);
    for (let i = 0; i < 4; i++) {
      const y = 404 + i * 64;
      p.rect(24, y + 12, 38, 38, 11, INK.silver); p.rect(78, y + 20, 150, 10, 5, INK.graphite); p.rect(78, y + 37, 96, 8, 4, INK.slate);
      p.chevron(356, y + 31, INK.steelDeep); p.rect(78, y + 62, 288, 1.2, 0, INK.silver);
    }
  }

  /* ---------- materials ---------- */
  // aluminium keeps a little diffuse, so it still reads as silver where it faces the dark side of the studio
  const alu = k.finish.aluminium({ color: INK.silver, rough: 0.3 });
  alu.metalness = 0.55;
  const aluBlast = k.finish.aluminium({ color: INK.silver, rough: 0.4, brushed: false });
  aluBlast.metalness = 0.8;
  const seamMat = k.finish.satin(INK.steelDeep, { rough: 0.6 });
  const glass = k.finish.glass();
  const backGlass = k.finish.satin(INK.steel, { rough: 0.62 });
  const lensGlass = k.finish.glass({ color: INK.graphite });
  const rubber = k.finish.rubber(INK.ink);

  /* ---------- the dock: a milled block of bead-blasted aluminium, a slot raked back 12 degrees ----------
     One profile in (z, y), extruded along x, so the slot shows at the ends. A rubber strip lines the slot's floor
     and a rubber pad lifts the block a hair off the desk. */
  const DOCK = V3(-0.46, 0.003, 0.1);
  // turned a little towards its next screens, so the aluminium band shows down the left edge in every shot
  const YAW = 0.3;
  const SLOT = { floor: 0.026, front: 0.074, back: 0.13 };
  const PIVOT_Y = SLOT.floor + 0.002 + Math.sin(TILT) * PH.t / 2 + 0.0003;   // the phone rests on its back foot edge
  const rake = Math.tan(TILT);
  const zF = (y) => 0.046 - rake * (y - 0.046), zB = (y) => -0.044 - rake * (y - 0.028);
  const dockShape = roundedPoly([
    V2(0.2, 0), V2(0.2, SLOT.front), V2(zF(SLOT.front), SLOT.front), V2(zF(SLOT.floor), SLOT.floor),
    V2(zB(SLOT.floor), SLOT.floor), V2(zB(SLOT.back), SLOT.back), V2(-0.19, SLOT.back), V2(-0.27, 0),
  ], [0.004, 0.034, 0.006, 0.005, 0.005, 0.006, 0.03, 0.004]);
  const dockGeo = slab(dockShape, 0.64, 0.006, 10);
  dockGeo.rotateY(-Math.PI / 2);                     // profile x becomes z, the extrusion runs along x
  const dock = new THREE.Group();
  dock.position.copy(DOCK);
  dock.rotation.y = YAW;
  group.add(dock);
  dock.add(k.mesh(dockGeo, aluBlast));
  dock.add(k.mesh(merge([
    placed(k.roundBox(0.6, 0.004, (zF(SLOT.floor) - zB(SLOT.floor)) * 0.9, 0.0019), { y: SLOT.floor + 0.001, z: (zF(SLOT.floor) + zB(SLOT.floor)) / 2 }),
    placed(k.roundBox(0.6, 0.006, 0.4, 0.0029), { y: -0.002, z: -0.03 }),
  ]), rubber, { shadow: false }));

  /* ---------- the phone ---------- */
  const tilt = new THREE.Group();
  tilt.position.set(0, PIVOT_Y, 0);
  tilt.rotation.x = -TILT;
  dock.add(tilt);
  const phone = new THREE.Group();
  tilt.add(phone);
  const up = (g) => placed(g, { y: PH.h / 2 });
  // the aluminium band, with glass front and back set into it
  phone.add(k.mesh(up(slab(rrShape(PH.w, PH.h, PH.r), PH.t - 0.004, 0.008, 16)), alu));
  const glassShape = rrShape(PH.w - 0.012, PH.h - 0.012, PH.r - 0.006);
  phone.add(k.mesh(placed(slab(glassShape, 0.006, 0.0025, 16), { y: PH.h / 2, z: zFront - 0.003 }), glass));
  phone.add(k.mesh(placed(slab(glassShape, 0.006, 0.0025, 16), { y: PH.h / 2, z: -zFront + 0.003 }), backGlass));
  // antenna seams across the band, and the side keys: action and volume on the left, power on the right
  const seams = [], keys = [];
  for (const sx of [-1, 1]) for (const y of [0.16, 1.34]) seams.push(placed(k.roundBox(0.012, 0.007, PH.t * 0.72, 0.003), { x: sx * (PH.w / 2 - 0.004), y }));
  for (const y of [PH.r * 0.55, PH.h - PH.r * 0.55]) seams.push(placed(k.roundBox(0.007, 0.012, PH.t * 0.72, 0.003), { x: 0.2 * (y < 1 ? 1 : -1), y: y < 1 ? 0.004 : PH.h - 0.004 }));
  for (const [y, len] of [[1.2, 0.06], [1.07, 0.11], [0.93, 0.11]]) keys.push(placed(k.roundBox(0.014, len, 0.032, 0.006), { x: -PH.w / 2 - 0.002, y }));
  keys.push(placed(k.roundBox(0.014, 0.16, 0.032, 0.006), { x: PH.w / 2 + 0.002, y: 1.08 }));
  phone.add(k.mesh(merge(seams), seamMat, { shadow: false }));
  phone.add(k.mesh(merge(keys), alu));
  // the camera island on the back: a raised glass plate, three lenses in aluminium rings
  const islandAt = V3(PH.w / 2 - 0.19, PH.h - 0.19, -zFront);
  phone.add(k.mesh(placed(slab(rrShape(0.3, 0.3, 0.075), 0.02, 0.006), { x: islandAt.x, y: islandAt.y, z: islandAt.z - 0.006 }), backGlass));
  const lensAt = [[-0.068, 0.068], [-0.068, -0.068], [0.07, 0]];
  phone.add(k.mesh(merge(lensAt.map(([x, y]) => placed(k.cyl(0.05, 0.052, 0.02, 32), { x: islandAt.x + x, y: islandAt.y + y, z: islandAt.z - 0.022, rx: Math.PI / 2 }))), alu));
  phone.add(k.mesh(merge(lensAt.map(([x, y]) => placed(k.cyl(0.036, 0.036, 0.004, 28), { x: islandAt.x + x, y: islandAt.y + y, z: islandAt.z - 0.032, rx: Math.PI / 2 }))), lensGlass, { shadow: false }));

  // the picture: the atlas slides along under the glass from screen 0 to screen 1
  const phoneTex = atlas.clone();
  phoneTex.needsUpdate = true;
  phoneTex.repeat.set(1 / CELLS, 1);
  const screenMat = k.finish.screen(phoneTex, GAIN);
  const screen = k.mesh(face(rrShape(SCR.w, SCR.h, SCR.r), SCR.w, SCR.h), screenMat, { y: BEZEL + SCR.h / 2, z: zScr, shadow: false });
  phone.add(screen);
  // the camera cut-out at the top of the picture
  phone.add(k.mesh(new THREE.ShapeGeometry(rrShape(0.125, 0.036, 0.018), 8), glass, { y: PH.h - BEZEL - 0.042, z: zScr + 0.0006, shadow: false }));

  /* ---------- the click: the button darkens a touch, a thin ring spreads from the pointer's tip ---------- */
  const btnCentre = at(BTN.x + BTN.w / 2, BTN.y + BTN.h / 2);
  const pressMat = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0, depthWrite: false });
  const press = new THREE.Mesh(new THREE.ShapeGeometry(rrShape(BTN.w * PT, BTN.h * PT, BTN.r * PT), 8), pressMat);
  press.position.copy(btnCentre).setZ(zScr + 0.0008);
  phone.add(press);
  const ringMat = new THREE.MeshBasicMaterial({ color: exact(INK.glow), transparent: true, opacity: 0, depthWrite: false });
  const ring = new THREE.Mesh(new THREE.RingGeometry(0.92, 1, 72), ringMat);
  phone.add(ring);

  /* ---------- the pointer: a white arrow with a thin dark rim, slightly extruded, its tip at the origin ---------- */
  const PX = 0.0082;                                  // one pixel of the classic 12 x 19 arrow
  const ARROW = [[0, 0], [0, -17], [4.1, -13.2], [6.9, -19.4], [9.6, -18.2], [6.9, -12.2], [12.3, -12.2]];
  const arrowPts = ARROW.map(([x, y]) => V2(x * PX, y * PX));
  if (THREE.ShapeUtils.isClockWise(arrowPts)) arrowPts.reverse();
  const inflate = (pts, d) => pts.map((c, i) => {
    const p = pts[(i + pts.length - 1) % pts.length], q = pts[(i + 1) % pts.length];
    const e1 = c.clone().sub(p).normalize(), e2 = q.clone().sub(c).normalize();
    const n1 = V2(e1.y, -e1.x), n2 = V2(e2.y, -e2.x), m = n1.clone().add(n2).normalize();
    return c.clone().addScaledVector(m, d / Math.max(m.dot(n1), 0.4));
  });
  const pointer = new THREE.Group();
  phone.add(pointer);
  const rimMat = k.finish.satin(INK.ink, { rough: 0.4 });
  const fillMat = k.finish.satin(INK.paper, { rough: 0.32 });
  for (const m of [rimMat, fillMat]) m.transparent = true;
  fillMat.emissive.set(INK.paper); fillMat.emissiveIntensity = 0.8;   // a lit white that stays white on the screen side
  const rim = k.mesh(slab(new THREE.Shape(inflate(arrowPts, 0.0075)), 0.01, 0.0025, 4), rimMat, { z: -0.003 });
  const fill = k.mesh(slab(new THREE.Shape(arrowPts), 0.01, 0.002, 4), fillMat, { z: 0.0015 });
  pointer.add(rim, fill);
  // its soft shadow on the glass (a lit screen shows no real shadow)
  const shadowTex = k.canvasTex(128, 160, (c) => {
    c.filter = 'blur(5px)'; c.fillStyle = '#000'; c.beginPath();
    ARROW.forEach(([x, y], i) => (i ? c.lineTo(20 + x * 6, 20 - y * 6) : c.moveTo(20 + x * 6, 20 - y * 6)));
    c.closePath(); c.fill();
  });
  const pShadowMat = new THREE.MeshBasicMaterial({ color: '#000000', map: shadowTex, transparent: true, opacity: 0, depthWrite: false });
  const pShadowGeo = new THREE.PlaneGeometry(128 / 6 * PX, 160 / 6 * PX);
  pShadowGeo.translate((64 - 20) / 6 * PX, -(80 - 20) / 6 * PX, 0);     // its tip at the origin, like the pointer's
  const pShadow = new THREE.Mesh(pShadowGeo, pShadowMat);
  phone.add(pShadow);

  /* ---------- the comment: a white bubble pinned by its sharp corner, an avatar and two lines ---------- */
  const BUB = { w: 0.5, h: 0.24, r: 0.08 };
  const bubble = new THREE.Group();
  const BUB_AT = V3(-PH.w / 2 - 0.07, at(0, 236).y, zScr + 0.16);   // its sharp corner points at the picture card, from just off the edge
  bubble.position.copy(BUB_AT);
  phone.add(bubble);
  const bubInner = new THREE.Group();                  // turned a little towards the three-quarter camera
  bubInner.rotation.y = -0.28;
  bubble.add(bubInner);
  const bubMat = k.finish.satin(INK.paper, { rough: 0.45 });
  const avMat = k.finish.satin(INK.graphite, { rough: 0.5 });
  const lineMat = k.finish.satin(INK.slate, { rough: 0.6 });
  for (const m of [bubMat, avMat, lineMat]) m.transparent = true;
  bubMat.emissive.set(INK.paper); bubMat.emissiveIntensity = 0.7;
  bubInner.add(k.mesh(placed(slab(rrShape(BUB.w, BUB.h, BUB.r, { br: true }), 0.022, 0.006, 12), { x: -BUB.w / 2, y: BUB.h / 2 }), bubMat, { shadow: false }));
  bubInner.add(k.mesh(placed(k.cyl(0.05, 0.05, 0.01, 32), { rx: Math.PI / 2 }), avMat, { x: -BUB.w + 0.1, y: BUB.h / 2, z: 0.012, shadow: false }));
  const lines = [0.25, 0.16].map((w, i) => {
    const g = k.roundBox(w, 0.017, 0.005, 0.0024);
    g.translate(w / 2, 0, 0);                          // grows from its left end, like a line being written
    const m = k.mesh(g, lineMat, { x: -BUB.w + 0.18, y: BUB.h / 2 + 0.033 - i * 0.066, z: 0.012, shadow: false });
    bubInner.add(m);
    return m;
  });

  /* ---------- the next screens: thin glass panes in a fan ---------- */
  const PANE = { w: 0.5, h: 0.5 * SCR.h / SCR.w, r: 0.06, t: 0.012 };
  const FAN = [
    { cell: 2, p: V3(0.36, 0.84, -0.22), ry: -0.2 },
    { cell: 3, p: V3(0.74, 0.9, -0.56), ry: -0.3 },
    { cell: 4, p: V3(1.08, 0.96, -0.9), ry: -0.4 },
  ];
  const paneMat = k.finish.glass({ color: INK.slate });
  const paneFaceMat = k.finish.screen(atlas, 2.2);   // a step dimmer than the phone, which stays the subject
  const panePose = (f) => ({ x: f.p.x, y: f.p.y, z: f.p.z, rx: -0.07, ry: f.ry, order: 'YXZ' });
  const panes = new THREE.Group();
  group.add(panes);
  panes.add(k.mesh(merge(FAN.map((f) => placed(slab(rrShape(PANE.w + 0.014, PANE.h + 0.014, PANE.r + 0.007), PANE.t, 0.003, 12), panePose(f)))), paneMat));
  panes.add(k.mesh(merge(FAN.map((f) => placed(face(rrShape(PANE.w, PANE.h, PANE.r), PANE.w, PANE.h, f.cell).translate(0, 0, PANE.t / 2 + 0.0006), panePose(f)))), paneFaceMat, { shadow: false }));

  /* ---------- the prototype connector: from the button's right end to the first pane's left edge ---------- */
  group.updateMatrixWorld(true);
  const toGroup = (obj, v) => group.worldToLocal(obj.localToWorld(v.clone()));
  const start = toGroup(phone, at(BTN.x + BTN.w - 6, BTN.y + BTN.h / 2, zScr + 0.004));
  const paneQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-0.07, FAN[0].ry, 0, 'YXZ'));
  const paneX = V3(1, 0, 0).applyQuaternion(paneQ);
  const end = FAN[0].p.clone().add(V3(-PANE.w / 2 - 0.05, -0.36, PANE.t / 2).applyQuaternion(paneQ));
  const phoneX = V3(1, 0, 0).applyQuaternion(phone.getWorldQuaternion(new THREE.Quaternion()));
  const curve = new THREE.CubicBezierCurve3(start, start.clone().addScaledVector(phoneX, 0.42), end.clone().addScaledVector(paneX, -0.3), end);
  const tip = curve.getPointAt(1), dir = curve.getTangentAt(1);
  const head = k.cyl(0, 0.012, 0.034, 16);
  head.translate(0, -0.017, 0);
  head.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V3(0, 1, 0), dir));
  head.translate(tip.x + dir.x * 0.03, tip.y + dir.y * 0.03, tip.z + dir.z * 0.03);
  // drawn, not lit: shaded and shadowed it would read as a cable
  const wireMat = new THREE.MeshBasicMaterial({ color: exact(INK.slate) });
  const wire = k.mesh(merge([new THREE.TubeGeometry(curve, 72, 0.0045, 6), placed(new THREE.SphereGeometry(0.014, 16, 12), { x: start.x, y: start.y, z: start.z }), head]), wireMat, { shadow: false });
  group.add(wire);

  // names for the parts, so a bench script can report where each lands in the picture
  for (const [o, part] of [[dock, 'dock'], [phone, 'phone'], [pointer, 'pointer'], [bubble, 'bubble'], [panes, 'panes'], [wire, 'wire']]) o.userData.part = part;

  /* ---------- the shots ---------- */
  const btnW = toGroup(phone, btnCentre);
  const shots = {
    wide: { az: -0.08, el: 0.24, d: 5.6, tgt: V3(0.22, 0.54, -0.2), fov: 24 },
    close: { az: 0.1, el: 0.22, d: 2.0, tgt: btnW.clone().add(V3(0.14, -0.1, 0)), fov: 24 },
    side: { az: -0.42, el: 0.25, d: 6.2, tgt: V3(-0.1, 0.56, -0.1), fov: 22 },
  };
  function place(s, out, push, drift = 0) {
    const d = s.d * push, az = s.az + drift;
    out.target.copy(s.tgt);
    out.pos.set(s.tgt.x + Math.sin(az) * Math.cos(s.el) * d, s.tgt.y + Math.sin(s.el) * d, s.tgt.z + Math.cos(az) * Math.cos(s.el) * d);
    out.fov = s.fov;
  }

  /* ---------- the timeline ---------- */
  const T = {
    enter: 1.55, arrive: 2.5,               // the pointer glides in over the wide shot
    dip: 3.0, down: 3.1, lift: 3.3,         // the click, in the close shot
    ring: 3.08, ringEnd: 3.75,
    slide: 3.42, slid: 4.02,                // the screen pushes on
    bub: 5.0, bubSet: 5.6,                  // the comment, in the three-quarter shot
    line: 5.5,
  };
  const HOVER = at(178, BTN.y + 24, zScr + 0.032);  // the tip over the button, a little left of its middle
  const FROM = V3(1.15, 0.58, 0.4);                   // where it enters: right of the phone, in front of the first pane
  const tmp = V3();

  // local time into [0, P); only wrapped when outside it, so a cut's own time lands exactly on the cut
  const wrap = (t) => (t >= 0 && t < P ? t : ((t % P) + P) % P);

  function update(t) {
    t = wrap(t);
    const live = t < CUT[2];

    // pointer: fades in on the right and glides onto the button, clicks, then rests there through the comment
    const g = k.easeInOut(k.seg(t, T.enter, T.arrive));
    tmp.lerpVectors(FROM, HOVER, g);
    tmp.y += Math.sin(Math.PI * g) * 0.08;
    const dip = k.smooth(k.seg(t, T.dip, T.down)) * (1 - k.smooth(k.seg(t, T.down + 0.04, T.lift)));
    tmp.z -= dip * 0.022;
    pointer.position.copy(tmp);
    const show = live ? k.smooth(k.seg(t, T.enter - 0.05, T.enter + 0.35)) : 0;
    rimMat.opacity = fillMat.opacity = show;
    pointer.visible = show > 0.001;
    rimMat.depthWrite = fillMat.depthWrite = show > 0.99;
    // its shadow lands once it is over the glass, closer and darker as it dips
    const lift = tmp.z - zScr;
    pShadow.position.set(tmp.x + lift * 0.45, tmp.y - lift * 0.7, zScr + 0.0012);
    pShadowMat.opacity = live ? 0.3 * k.smooth(k.seg(g, 0.75, 1)) * (1 + dip * 0.4) : 0;
    pShadow.visible = pShadowMat.opacity > 0.001;

    // the button takes the press, the ring spreads
    pressMat.opacity = live ? 0.2 * k.smooth(k.seg(t, T.dip, T.down)) * (1 - k.smooth(k.seg(t, T.lift, T.lift + 0.2))) : 0;
    press.visible = pressMat.opacity > 0.001;
    const rp = live ? k.seg(t, T.ring, T.ringEnd) : 0;
    ring.position.set(HOVER.x, HOVER.y, zScr + 0.0016);
    ring.scale.setScalar(0.03 + k.easeOut(rp) * 0.09);
    ringMat.opacity = rp > 0 && rp < 1 ? 1 - k.easeIn(rp) : 0;
    ring.visible = ringMat.opacity > 0.001;

    // the screen pushes on to the next one
    phoneTex.offset.x = (live ? k.easeInOut(k.seg(t, T.slide, T.slid)) : 0) / CELLS;

    // the comment fades in, grows out of its pinned corner as it rises into place and settles; then its lines write in
    const b = live ? k.seg(t, T.bub, T.bubSet) : 0;
    bubble.scale.setScalar(Math.max(1e-4, 0.84 + 0.16 * k.backOut(b, 0.9)));
    bubble.position.copy(BUB_AT).setY(BUB_AT.y - 0.035 * (1 - k.backOut(b, 0.9)));
    const op = live ? k.smooth(k.seg(t, T.bub, T.bub + 0.3)) : 0;
    bubMat.opacity = avMat.opacity = op;
    bubMat.depthWrite = avMat.depthWrite = op > 0.99;
    bubble.visible = op > 0.001;
    lines.forEach((m, i) => { const w = live ? k.easeInOut(k.seg(t, T.line + i * 0.22, T.line + i * 0.22 + 0.45)) : 0; m.scale.x = Math.max(w, 1e-4); m.visible = w > 0.001; });
    lineMat.opacity = op;
  }

  function camera(t, out) {
    t = wrap(t);
    if (t >= CUT[2] || t < CUT[0]) {
      // one continuous slow push from the cut at CUT[2], over the loop's end, to CUT[0]
      const a = (t >= CUT[2] ? t - CUT[2] : t + P - CUT[2]) / (P - CUT[2] + CUT[0]);
      place(shots.wide, out, 1.04 - 0.07 * k.smooth(a));
    } else if (t < CUT[1]) {
      place(shots.close, out, 1.02 - 0.05 * k.smooth(k.seg(t, CUT[0], CUT[1])));
    } else {
      const a = k.smooth(k.seg(t, CUT[1], CUT[2]));
      place(shots.side, out, 1.02 - 0.04 * a, 0.05 * a);
    }
  }

  return { name: 'review', period: P, still: 6.3, cuts: CUT, group, update, camera, mood: { key: 1, rim: 0.1, fill: 1 } };
}
