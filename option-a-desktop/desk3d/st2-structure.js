/*
  Station 2, Structure (Documentary): an exploded presentation model of a web page, like an architect's layered
  model. A 3 mm space-grey anodised plate with a bright machined chamfer stands on rubber feet; the page's layout
  is etched into it: the page frame, a column grid and the empty slots, hatched. Above it the page's panels float
  in an exploded stack: nav, hero, three cards, a text block and a footer, each a 2.5 to 3.5 mm panel with a white
  printed face over a pale grey core. Two steel pins locate each panel in its slot, and dashed construction lines
  rise from them to the panel's holes. The one green panel is the key action; it floats highest, over its place
  on the hero.

  The loop runs 8 s. The stack holds still while the camera arrives. From 1.45 s the panels come down their
  guides one by one, front of the page first, and take the last 2 mm onto their pins more slowly; the key action
  lands last, at about 3.9 s. A hairline flow then draws out of it to the middle card, which branches to the
  other two; they hold, and rewind into the key action. The panels lift back into the stack in reverse order and
  are at rest there just before 8 s, so the loop closes on the same picture.
  Camera: a slow orbit of about 30 degrees on a cosine at a high three-quarter angle, with a slow push-in; widest
  and highest while the stack stands tallest, closest and most frontal while the flows hold.
  Still (2.8 s): the lower half of the page seated, the hero coming down its guides, the nav and the key action
  waiting above.
*/
export default function build(k) {
  const { THREE, INK } = k;
  const P = 8;
  const TAU = Math.PI * 2;
  const group = new THREE.Group();
  // the model is turned on the desk, so the camera sees it at three-quarters while looking along the desk, where
  // the neighbouring stations stay out of shot
  const YAW = -0.3;
  const model = new THREE.Group();
  model.rotation.y = YAW;
  group.add(model);

  /* ---------- sizes (1 unit = 10 cm) ---------- */
  const FEET = 0.012, PLATE_H = 0.03, SHEET_H = 0.001;
  const FLOOR = FEET + PLATE_H + SHEET_H;           // the sheet's face: where the slots are
  const BASE = { w: 2.36, d: 1.7 };
  const SHEET = { w: 2.16, d: 1.5 };
  const PX = 600;                                    // canvas px per unit for everything printed
  const hair = 1.6 / PX, fine = 2.4 / PX;            // printed line weights, in units
  // each panel is located by two steel pins under its front corners, shorter than the panel is thick, so a seated
  // panel hides them; the guides rise from the pins to the holes above
  const PIN = { r: 0.0075, h: 0.014, inset: 0.022 };
  // where a flow lands on a card: face units from its back-left corner
  const PORT = { x: 0.45, y: 0.206 };

  /* ---------- the panels ----------
     x, z: slot centre on the page; w, d, h: size; gap: how high it floats in the stack;
     down: when it starts down its guides; up: when it starts back up */
  const PANELS = [
    { id: 'footer', x: 0, z: 0.575, w: 1.9, d: 0.09, h: 0.025, gap: 0.165, down: 1.45, up: 6.98, face: footerFace },
    { id: 'text', x: 0, z: 0.42, w: 1.9, d: 0.14, h: 0.025, gap: 0.225, down: 1.66, up: 6.85, face: textFace },
    { id: 'card1', x: -0.645, z: 0.14, w: 0.61, d: 0.32, h: 0.03, gap: 0.3, down: 1.88, up: 6.72, face: cardFace },
    { id: 'card2', x: 0, z: 0.14, w: 0.61, d: 0.32, h: 0.03, gap: 0.3, down: 1.98, up: 6.66, face: cardFace },
    { id: 'card3', x: 0.645, z: 0.14, w: 0.61, d: 0.32, h: 0.03, gap: 0.3, down: 2.08, up: 6.6, face: cardFace },
    { id: 'hero', x: 0, z: -0.28, w: 1.9, d: 0.42, h: 0.035, gap: 0.39, down: 2.42, up: 6.54, face: heroFace },
    { id: 'nav', x: 0, z: -0.575, w: 1.9, d: 0.09, h: 0.025, gap: 0.48, down: 2.72, up: 6.45, face: navFace },
    // the key action seats on the hero
    { id: 'cta', x: -0.67, z: -0.18, w: 0.42, d: 0.1, h: 0.025, gap: 0.6, down: 3.05, up: 6.36, on: 'hero' },
  ];
  const byId = Object.fromEntries(PANELS.map((p) => [p.id, p]));
  const hero = byId.hero, cta = byId.cta;
  const DOWN = (p) => 0.55 + 0.3 * p.gap, UP = 0.9;

  /* ---------- the base: rubber feet, a 3 mm anodised plate, four screws, the etched layout ---------- */
  // space-grey anodised with a bright machined chamfer: the white panels read against it as parts, where on a pale
  // plate they sank into white-on-white. Some diffuse body, or the metal only mirrors the dark studio as navy
  const anod = k.finish.graphite({ color: INK.slate, rough: 0.46, repeat: [1, 3] });
  anod.metalness = 0.5;
  anod.envMapIntensity = 0.6;
  const chamfer = k.finish.aluminium({ rough: 0.22, brushed: false, color: INK.silver });
  chamfer.metalness = 0.75;
  // caps take the anodised finish, the sides and the bevel the machined one
  const plate = k.mesh(k.plate(BASE.w, BASE.d, PLATE_H, 0.035, 0.012), [anod, chamfer], { y: FEET });
  model.add(plate);
  const feet = new THREE.InstancedMesh(k.cyl(0.05, 0.05, FEET, 16), k.finish.rubber(), 4);
  // small steel parts keep some diffuse body; fully metallic they mirror the blue strip and read as blue lights
  const steel = k.finish.aluminium({ rough: 0.4, brushed: false, color: INK.steel });
  steel.metalness = 0.55;
  const screws = new THREE.InstancedMesh(k.cyl(0.016, 0.017, 0.004, 20), steel, 4);
  const sockets = new THREE.InstancedMesh(k.cyl(0.0065, 0.0065, 0.0015, 6), k.finish.satin(INK.ink, { rough: 0.6 }), 4);
  const m4 = new THREE.Matrix4();
  [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sz], i) => {
    feet.setMatrixAt(i, m4.makeTranslation(sx * (BASE.w / 2 - 0.16), FEET / 2, sz * (BASE.d / 2 - 0.16)));
    screws.setMatrixAt(i, m4.makeTranslation(sx * (BASE.w / 2 - 0.06), FEET + PLATE_H + 0.002, sz * (BASE.d / 2 - 0.06)));
    sockets.setMatrixAt(i, m4.makeTranslation(sx * (BASE.w / 2 - 0.06), FEET + PLATE_H + 0.0042, sz * (BASE.d / 2 - 0.06)));
  });
  for (const m of [feet, screws, sockets]) { m.castShadow = m !== feet; m.receiveShadow = true; model.add(m); }

  // the layout is laser-etched into the anodising: pale matte marks on the grey metal, drawn on a clear decal
  const sheetTex = k.canvasTex(Math.round(SHEET.w * PX), Math.round(SHEET.d * PX), drawSheet);
  const sheetMat = k.finish.satin(INK.paper, { rough: 0.85 });
  Object.assign(sheetMat, { map: sheetTex, transparent: true, depthWrite: false, envMapIntensity: 0.2 });
  const sheet = k.mesh(new THREE.PlaneGeometry(SHEET.w, SHEET.d), sheetMat, { y: FLOOR, rx: -Math.PI / 2, shadow: false });
  model.add(sheet);

  /* ---------- the panels: a printed white face on an aluminium-edged core ---------- */
  const edge = k.finish.satin(INK.silver, { rough: 0.5 });
  const faces = new Map();
  for (const p of PANELS) {
    const geo = k.plate(p.w, p.d, p.h, 0.012, 0.0025);
    let face;
    if (p === cta) {
      const tex = k.canvasTex(Math.round(p.w * PX), Math.round(p.d * PX), (c, w, h) => ctaFace(c, p.w, p.d));
      face = k.finish.accent({ rough: 0.42 });
      face.color.set(INK.paper);   // white, so the printed canvas shows as drawn
      face.map = alignMap(tex, p);
      p.mats = [face, k.finish.accent({ rough: 0.36 })];
    } else {
      if (!faces.has(p.face)) {
        const tex = k.canvasTex(Math.round(p.w * PX), Math.round(p.d * PX), (c) => { c.fillStyle = INK.paper; c.fillRect(0, 0, c.canvas.width, c.canvas.height); c.save(); c.scale(PX, PX); p.face(c, p.w, p.d); holes(c, p, INK.slate); c.restore(); });
        faces.set(p.face, calm(k.finish.paper({ map: alignMap(tex, p), repeat: [3, 3] })));
      }
      p.mats = [faces.get(p.face), edge];
    }
    p.mesh = k.mesh(geo, p.mats);
    model.add(p.mesh);
    p.seat = FLOOR + (p.on ? byId[p.on].h : 0);   // y of the panel's underside once seated
  }
  // less of the blue room in the paper's fill light, so white stays white and the prints stay grey
  function calm(m) { m.envMapIntensity = 0.12; return m; }
  // the plate's caps take shape coordinates (units) as UVs; this maps the printed canvas onto the face exactly
  function alignMap(tex, p) { tex.repeat.set(1 / p.w, 1 / p.d); tex.offset.set(0.5, 0.5); return tex; }

  /* ---------- guides: dashed construction lines from each panel's two front corners down to its slot ---------- */
  const N = PANELS.length;
  const gPos = [], gPid = [], gTop = [];
  PANELS.forEach((p, i) => {
    for (const [x, z] of pinsOf(p)) { gPos.push(x, 0, z, x, 0, z); gPid.push(i, i); gTop.push(0, 1); }
  });
  function pinsOf(p) { return [-1, 1].map((sx) => [p.x + sx * (p.w / 2 - PIN.inset), p.z + p.d / 2 - PIN.inset]); }
  const pinGeo = k.cyl(PIN.r, PIN.r, PIN.h, 10), pinMat = steel;
  const sheetPins = PANELS.filter((p) => !p.on).flatMap(pinsOf);
  const pins = new THREE.InstancedMesh(pinGeo, pinMat, sheetPins.length);
  sheetPins.forEach(([x, z], i) => pins.setMatrixAt(i, m4.makeTranslation(x, FLOOR + PIN.h / 2, z)));
  pins.castShadow = pins.receiveShadow = true;
  model.add(pins);
  // the key action's pins stand on the hero and travel with it
  for (const [x, z] of pinsOf(cta)) hero.mesh.add(k.mesh(pinGeo, pinMat, { x: x - hero.x, y: hero.h + PIN.h / 2, z: z - hero.z }));
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.Float32BufferAttribute(gPos, 3));
  gGeo.setAttribute('pid', new THREE.Float32BufferAttribute(gPid, 1));
  gGeo.setAttribute('top', new THREE.Float32BufferAttribute(gTop, 1));
  const span = Array.from({ length: N }, () => new THREE.Vector2());
  const guideMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(INK.steelDeep) }, uSpan: { value: span } },
    vertexShader: /* glsl */ `
      attribute float pid;
      attribute float top;
      uniform vec2 uSpan[${N}];
      varying float vY;
      void main() {
        vec2 s = uSpan[int(pid + 0.5)];
        vec3 p = vec3(position.x, mix(s.x, s.y, top), position.z);
        vY = p.y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vY;
      void main() {
        // the dashes are fixed to the desk, so a line shortens from the top as its panel comes down; on a small
        // screen the dash doubles so it never breaks up into single dots
        float px = fwidth(vY);
        float period = 0.05 * exp2(max(0.0, ceil(log2(px * 6.0 / 0.05))));
        if (fract(vY / period) > 0.56) discard;
        gl_FragColor = vec4(uColor, 1.0);
      }`,
  });
  const guides = new THREE.LineSegments(gGeo, guideMat);
  guides.frustumCulled = false;
  model.add(guides);

  /* ---------- flows: hairline arcs from the key action to the middle card, which branches to the other two ---------- */
  // each card has a small printed port on the white band under its image, where a flow lands
  const topOf = (p) => p.seat + p.h;
  const port = (id) => { const p = byId[id]; return new THREE.Vector3(p.x - p.w / 2 + PORT.x, topOf(p), p.z - p.d / 2 + PORT.y); };
  const NODES = [
    new THREE.Vector3(cta.x + 0.15, topOf(cta), cta.z),
    port('card2'), port('card1'), port('card3'),
  ];
  // flow i ends on node i + 1; the two branches draw out of the middle card together
  const FLOWS = [
    { a: 0, b: 1, lift: 0.2, on: 3.98, draw: 0.5, off: 6.02 },
    { a: 1, b: 2, lift: 0.16, on: 4.46, draw: 0.55, off: 5.8 },
    { a: 1, b: 3, lift: 0.16, on: 4.46, draw: 0.55, off: 5.8 },
  ];
  const REWIND = 0.3, FS = 40;
  const fPos = [], fAttr = [];
  FLOWS.forEach((f, i) => {
    const a = NODES[f.a], b = NODES[f.b];
    f.curve = new THREE.CubicBezierCurve3(a, a.clone().setY(a.y + f.lift), b.clone().setY(b.y + f.lift), b);
    const pts = f.curve.getSpacedPoints(FS);
    for (let j = 0; j < FS; j++) {
      fPos.push(pts[j].x, pts[j].y, pts[j].z, pts[j + 1].x, pts[j + 1].y, pts[j + 1].z);
      fAttr.push(i, j / FS, i, (j + 1) / FS);
    }
  });
  const fGeo = new THREE.BufferGeometry();
  fGeo.setAttribute('position', new THREE.Float32BufferAttribute(fPos, 3));
  fGeo.setAttribute('fs', new THREE.Float32BufferAttribute(fAttr, 2));
  const head = [0, 0, 0];
  const flowMat = new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(INK.graphite) }, uHead: { value: head } },
    vertexShader: /* glsl */ `
      attribute vec2 fs;
      uniform float uHead[3];
      varying float vS;
      varying float vHead;
      void main() {
        vS = fs.y;
        vHead = uHead[int(fs.x + 0.5)];
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vS;
      varying float vHead;
      void main() {
        if (vS > vHead) discard;
        gl_FragColor = vec4(uColor, 1.0);
      }`,
  });
  const flows = new THREE.LineSegments(fGeo, flowMat);
  model.add(flows);

  // the nodes: node 0 sits on the key action; node i rides the tip of flow i-1 like a pen and stays at its end
  const nodeMat = k.finish.satin(INK.graphite, { rough: 0.32 });
  const nodeGeo = new THREE.SphereGeometry(0.017, 16, 12);
  const nodes = NODES.map(() => { const m = k.mesh(nodeGeo, nodeMat); model.add(m); return m; });

  /* ---------- motion ---------- */
  // how high a panel is over its seat. It comes down its guides to where the pins meet its holes, then takes the
  // last 2 mm onto the pins more slowly: the settle. It goes back up in one gentle move
  const HOVER = 0.018, SEAT = 0.22;
  function height(p, t) {
    if (t >= p.up) return p.gap * k.easeInOut(k.seg(t, p.up, p.up + UP));
    const end = p.down + DOWN(p);
    const main = HOVER + (p.gap - HOVER) * (1 - k.easeInOut(k.seg(t, p.down, end)));
    return main - HOVER * k.easeInOut(k.seg(t, end - 0.06, end - 0.06 + SEAT));
  }
  // how far a flow has drawn, 0..1: out along its path, then back into its start
  function drawn(f, t) {
    return k.easeInOut(k.seg(t, f.on, f.on + f.draw)) * (1 - k.easeInOut(k.seg(t, f.off, f.off + REWIND)));
  }

  const tmp = new THREE.Vector3();
  function update(t) {
    for (const p of PANELS) {
      // gap is measured from the seat; the key action's guides still end on the hero, wherever the hero is
      const floor = p.on ? byId[p.on].mesh.position.y + byId[p.on].h : FLOOR;
      const y = p.seat + height(p, t);
      p.mesh.position.set(p.x, y, p.z);
      span[PANELS.indexOf(p)].set(floor + PIN.h, Math.max(floor + PIN.h, y));
    }
    FLOWS.forEach((f, i) => { head[i] = drawn(f, t); });
    // node 0 comes up as flow 0 starts and goes when it has rewound into it
    const f0 = FLOWS[0];
    const s0 = k.smooth(k.seg(t, f0.on - 0.12, f0.on)) * (1 - k.smooth(k.seg(t, f0.off + REWIND - 0.1, f0.off + REWIND)));
    nodes[0].position.copy(NODES[0]);
    nodes[0].scale.setScalar(Math.max(0.001, s0));
    nodes[0].visible = s0 > 0.001;
    FLOWS.forEach((f, i) => {
      const n = nodes[i + 1], d = head[i];
      f.curve.getPointAt(d, tmp);
      n.position.copy(tmp);
      // a pen that has come home into the node it started from is hidden inside it
      const s = k.smooth(k.seg(d, 0, 0.06));
      n.scale.setScalar(Math.max(0.001, s));
      n.visible = s > 0.001;
    });
  }

  /* ---------- camera: a slow documentary orbit ---------- */
  // the widest three-quarter view and the widest shot come while the stack stands tallest (about 1 s); the
  // closest, most frontal view while the finished page holds its flows (about 5 s)
  // a long lens from further back, and higher while wide: the frame's top edge stays on the desk, so the desk's far
  // edge and the bright field behind it never cut across the top corner
  const AZC = -0.02, AZA = 0.25, EL0 = 0.92, EL1 = 0.74, R0 = 6.0, DOLLY = 1.2, NEAR_AT = 5.0;
  function camera(t, out) {
    const az = AZC - AZA * Math.cos(TAU * (t - NEAR_AT) / P);
    // 1 while the page lies assembled (around 5 s), 0 while the stack stands tallest (around 1 s)
    const near = 0.5 + 0.5 * Math.cos(TAU * (t - NEAR_AT) / P);
    const r = R0 - DOLLY * near, el = k.lerp(EL0, EL1, near);
    // aim a little right of the model so it sits left of centre (less so up close, where it fills the frame), and
    // a little up while the stack stands, so it sits in the upper middle
    const off = k.lerp(0.2, 0.05, near);
    const tx = off * Math.cos(az), tz = -off * Math.sin(az) + 0.3, ty = 0.03 - 0.03 * near;
    out.target.set(tx, ty, tz);
    out.pos.set(tx + r * Math.sin(az) * Math.cos(el), ty + r * Math.sin(el), tz + r * Math.cos(az) * Math.cos(el));
    out.fov = 27;
  }

  /* ---------- printing ----------
     Faces are drawn in units (the canvas is scaled by PX), origin at the face's back-left corner, y toward the
     front. Greys only; the lines are fine, and at the picture's size they read as the texture of a printed page. */
  function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
  function bar(c, x, y, w, h, col) { c.fillStyle = col; rr(c, x, y, w, h, h / 2); c.fill(); }
  // an image placeholder: a solid block with the wireframe cross drawn through it
  function frame(c, x, y, w, h, fill, line) {
    c.fillStyle = fill; c.fillRect(x, y, w, h);
    c.strokeStyle = line; c.lineWidth = fine;
    c.beginPath(); c.moveTo(x, y); c.lineTo(x + w, y + h); c.moveTo(x + w, y); c.lineTo(x, y + h); c.stroke();
  }
  // the through-holes over the locating pins
  function holes(c, p, col) {
    c.fillStyle = col;
    for (const x of [PIN.inset, p.w - PIN.inset]) { c.beginPath(); c.arc(x, p.d - PIN.inset, PIN.r + 0.002, 0, TAU); c.fill(); }
  }
  function outline(c, x, y, w, h, r, col = INK.slate, lw = fine) { c.strokeStyle = col; c.lineWidth = lw; rr(c, x, y, w, h, r); c.stroke(); }
  function hatch(c, x, y, w, h, step, col) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    c.strokeStyle = col; c.lineWidth = hair; c.beginPath();
    for (let s = -h; s < w; s += step) { c.moveTo(x + s, y + h); c.lineTo(x + s + h, y); }
    c.stroke(); c.restore();
  }
  function dashed(c, x, y, w, h, col) {
    c.save(); c.setLineDash([0.012, 0.008]); c.strokeStyle = col; c.lineWidth = fine; c.strokeRect(x, y, w, h); c.restore();
  }

  function navFace(c, w, d) {
    c.fillStyle = INK.graphite; c.beginPath(); c.arc(0.07, d / 2, 0.02, 0, TAU); c.fill();
    bar(c, 0.105, d / 2 - 0.008, 0.13, 0.016, INK.slate);
    for (let i = 0; i < 4; i++) bar(c, 1.02 + i * 0.13, d / 2 - 0.007, 0.09, 0.014, INK.slate);
    outline(c, w - 0.22, d / 2 - 0.026, 0.17, 0.052, 0.026, INK.graphite);
    bar(c, w - 0.18, d / 2 - 0.006, 0.09, 0.012, INK.slate);
  }
  function heroFace(c, w, d) {
    bar(c, 0.07, 0.045, 0.12, 0.014, INK.slate);
    bar(c, 0.07, 0.078, 0.78, 0.04, INK.graphite);
    bar(c, 0.07, 0.132, 0.54, 0.04, INK.graphite);
    [0.66, 0.7].forEach((f, i) => bar(c, 0.07, 0.198 + i * 0.024, f, 0.014, INK.steelDeep));
    // the key action's slot, and a secondary button beside it
    const sx = cta.x - cta.w / 2 - (hero.x - w / 2), sy = cta.z - cta.d / 2 - (hero.z - d / 2);
    hatch(c, sx, sy, cta.w, cta.d, 0.012, INK.slate);
    dashed(c, sx, sy, cta.w, cta.d, INK.graphite);
    outline(c, sx + cta.w + 0.04, sy, 0.3, cta.d, 0.012, INK.graphite);
    bar(c, sx + cta.w + 0.12, sy + cta.d / 2 - 0.007, 0.14, 0.014, INK.slate);
    frame(c, 0.98, 0.05, 0.86, 0.32, INK.slate, INK.steelDeep);
  }
  function cardFace(c, w, d) {
    frame(c, 0.03, 0.03, w - 0.06, 0.14, INK.slate, INK.steelDeep);
    bar(c, 0.03, 0.194, 0.32, 0.024, INK.graphite);
    bar(c, 0.03, 0.234, 0.5, 0.013, INK.steelDeep);
    bar(c, 0.03, 0.256, 0.38, 0.013, INK.steelDeep);
    bar(c, 0.03, 0.286, 0.11, 0.014, INK.slate);
    // the flow's port: a printed ring the node lands in
    c.strokeStyle = INK.slate; c.lineWidth = fine; c.beginPath(); c.arc(PORT.x, PORT.y, 0.024, 0, TAU); c.stroke();
  }
  function textFace(c, w, d) {
    for (const [x, hd] of [[0.07, 1], [1.0, 0]]) {
      if (hd) bar(c, x, 0.02, 0.32, 0.022, INK.graphite);
      const y0 = hd ? 0.056 : 0.02;
      for (let i = 0; i < 4; i++) bar(c, x, y0 + i * 0.021, (i === 3 ? 0.5 : 0.83), 0.012, INK.steelDeep);
    }
  }
  function footerFace(c, w, d) {
    c.strokeStyle = INK.steelDeep; c.lineWidth = fine; c.beginPath(); c.moveTo(0.07, 0.012); c.lineTo(w - 0.07, 0.012); c.stroke();
    for (let i = 0; i < 4; i++) { bar(c, 0.07 + i * 0.26, 0.03, 0.14, 0.016, INK.slate); bar(c, 0.07 + i * 0.26, 0.058, 0.1, 0.012, INK.steelDeep); }
    for (let i = 0; i < 3; i++) { c.fillStyle = INK.slate; c.beginPath(); c.arc(w - 0.09 - i * 0.055, d / 2 + 0.006, 0.015, 0, TAU); c.fill(); }
  }
  function ctaFace(c, w, d) {
    c.fillStyle = INK.glow; c.fillRect(0, 0, c.canvas.width, c.canvas.height);
    c.save(); c.scale(PX, PX);
    bar(c, w / 2 - 0.09, d / 2 - 0.007, 0.18, 0.014, INK.glowInk);
    holes(c, cta, INK.glowInk);
    c.restore();
  }

  // the etched layout on the plate: page frame, a 12 column grid, hatched slots, crop marks, a dimension line and
  // a scale bar. Clear where nothing is etched; the marks are pale greys, the finest ones faint
  function drawSheet(c, cw, ch) {
    c.clearRect(0, 0, cw, ch);
    c.save(); c.scale(PX, PX);
    const ox = SHEET.w / 2, oz = SHEET.d / 2;       // page (0, 0) on the sheet
    const L = ox - 0.95, T = oz - 0.62, W = 1.9, D = 1.24;
    c.globalAlpha = 0.35;
    c.strokeStyle = INK.steelDeep; c.lineWidth = hair; c.beginPath();
    for (let i = 0; i <= 12; i++) { const x = L + (W * i) / 12; c.moveTo(x, T - 0.03); c.lineTo(x, T + D + 0.03); }
    c.stroke();
    c.globalAlpha = 0.8;
    c.strokeStyle = INK.steel; c.lineWidth = hair; c.strokeRect(L - 0.03, T - 0.03, W + 0.06, D + 0.06);
    for (const p of PANELS) {
      if (p.on) continue;
      const x = ox + p.x - p.w / 2, y = oz + p.z - p.d / 2;
      c.globalAlpha = 0.4; hatch(c, x, y, p.w, p.d, 0.016, INK.steelDeep);
      c.globalAlpha = 1; dashed(c, x, y, p.w, p.d, INK.silver);
    }
    c.globalAlpha = 1;
    // crop marks
    c.strokeStyle = INK.silver; c.lineWidth = hair; c.beginPath();
    for (const [x, y, sx, sy] of [[L - 0.06, T - 0.06, -1, -1], [L + W + 0.06, T - 0.06, 1, -1], [L - 0.06, T + D + 0.06, -1, 1], [L + W + 0.06, T + D + 0.06, 1, 1]]) {
      c.moveTo(x, y); c.lineTo(x + sx * 0.05, y); c.moveTo(x, y); c.lineTo(x, y + sy * 0.05);
    }
    // a dimension line over the page, with the architect's slashes at its ends
    const dy = T - 0.075;
    c.moveTo(L, dy); c.lineTo(L + W, dy);
    for (const x of [L, L + W]) { c.moveTo(x - 0.01, dy + 0.01); c.lineTo(x + 0.01, dy - 0.01); c.moveTo(x, dy - 0.02); c.lineTo(x, dy + 0.035); }
    c.stroke();
    // a scale bar in the front margin
    const sy = T + D + 0.07;
    for (let i = 0; i < 6; i += 2) { c.fillStyle = INK.silver; c.fillRect(L + i * 0.04, sy, 0.04, 0.012); }
    c.strokeStyle = INK.silver; c.strokeRect(L, sy, 0.24, 0.012);
    c.restore();
  }

  update(0);
  return { name: 'structure', period: P, still: 2.8, group, update, camera, mood: { key: 1.3, fill: 0.5, rim: 0.75 } };
}
