/*
  Station 1, Before we start (News): a scope document on an anodised aluminium clipboard, a slim pen beside it.

  The loop runs 8 s. Everything rests while the camera arrives. Then the pen lifts off the desk, travels to the
  signature line and signs: the ink draws on under its tip while the camera pushes in a little. The pen lifts just
  off the page and a green index flag slides in and is set on the sheet's right edge: agreed. The pen goes back to
  its place and the camera eases back; the clip opens, the signed sheet slides away with its flag and leaves an
  identical fresh sheet underneath, the clip closes, and the loop ends where it began.
*/
export default function build(k) {
  const { THREE, INK } = k;
  const S = Math.sin, C = Math.cos, PI = Math.PI;
  const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const P = 8.0;
  const group = new THREE.Group();

  /* ---------- layout (desk top y = 0) ----------
     The footprint cannot hold a full-size A4 board, so the sheet is A4 at about 0.62 scale (1 unit is about 16 cm
     on it) and everything that sits on it is sized against that sheet: the pen, the flag, the ink line, the board's
     5 mm. Sized to the kit's 10 cm unit instead, the pen reads as an oversized marker beside a toy clipboard. */
  const BOARD = { x: -0.36, z: 0.0, yaw: 0.05, w: 1.46, d: 2.3, h: 0.032, r: 0.1 };
  const PAGE = { w: 1.3, d: 1.84, z: 0.12 };            // A-series sheet; its centre on the board, towards the foot
  const STACK = 0.012, SHEET = 0.0025;                  // a few fresh sheets underneath, and the one on top
  const TOP = BOARD.h + STACK + SHEET;                  // the top sheet's face, board-local
  const HINGE = { z: -0.9, y: BOARD.h + 0.012 + 0.021 };
  const FLAG = { x: PAGE.w / 2 - 0.2, z: 0.6, len: 0.33, wid: 0.082 };  // x: its inner end, page-local
  const PS = 0.64;                                      // the pen is modelled at 14 cm to the kit's unit, then scaled
  const PEN = { len: 1.405 * PS, r: 0.043 * PS };

  // the agreed state (signature, flag, pen just lifted) holds from flagSet to back, long enough to read
  const T = {
    lift: 1.45, touch: 2.55, signed: 4.1, off: 4.4,
    flagIn: 3.95, flagDown: 4.95, flagSet: 5.2,
    back: 5.85, home: 6.62,
    open: 6.4, slide: 6.5, gone: 7.62, shut: 7.86,
  };

  /* ---------- the board: anodised aluminium, 5 mm, a fine chamfer all round ---------- */
  const board = new THREE.Group();
  board.position.set(BOARD.x, 0, BOARD.z);
  board.rotation.y = BOARD.yaw;
  group.add(board);
  const anodised = k.finish.graphite({ color: INK.graphite, rough: 0.46, repeat: [1, 3] });
  anodised.envMapIntensity = 0.6;     // the chamfer otherwise catches the strip light as a dashed white line
  anodised.metalness = 0.5;           // some diffuse body, so it reads dark grey under the key and not as the blue room
  board.add(k.mesh(boardGeo(), anodised));

  /* ---------- the clip: a riveted base plate, two ears and a pin, a curved spring lever ---------- */
  // metals keep some diffuse body: fully metallic, they only mirror the dark studio and read as navy chrome
  const metal = (m, metalness) => { m.metalness = metalness; return m; };
  const steel = metal(k.finish.aluminium({ color: INK.steel, rough: 0.32, repeat: [2, 6] }), 0.6);
  const bright = metal(k.finish.aluminium({ color: INK.silver, rough: 0.2, brushed: false }), 0.75);
  board.add(k.mesh(k.plate(0.9, 0.12, 0.012, 0.03, 0.003), steel, { y: BOARD.h, z: HINGE.z - 0.028 }));
  const rivet = dome(0.021, 0.009);
  for (const x of [-0.39, 0.39]) board.add(k.mesh(rivet, bright, { x, y: BOARD.h + 0.012, z: HINGE.z - 0.03 }));
  for (const x of [-0.338, 0.338]) board.add(k.mesh(k.roundBox(0.016, 0.046, 0.05, 0.006), steel, { x, y: HINGE.y - 0.006, z: HINGE.z }));
  board.add(k.mesh(k.cyl(0.0075, 0.0075, 0.7, 12), bright, { y: HINGE.y, z: HINGE.z, rz: PI / 2 }));
  const lever = new THREE.Group();
  lever.position.set(0, HINGE.y, HINGE.z);
  board.add(lever);
  lever.add(k.mesh(k.cyl(0.021, 0.021, 0.64, 24), steel, { rz: PI / 2 }));
  lever.add(k.mesh(leverGeo(0.64), steel));
  // a soft pad under the jaw, where it presses the paper
  lever.add(k.mesh(k.roundBox(0.58, 0.006, 0.026, 0.002), k.finish.rubber(INK.graphite), { y: TOP - HINGE.y + 0.003, z: 0.262 }));

  /* ---------- the paper: fresh sheets underneath, the scope document on top ---------- */
  const pageTex = k.canvasTex(1024, 1449, drawPage);
  const paper = k.finish.paper({ map: pageTex, repeat: [3, 4] });
  // the core's filmic curve holds lit white near 236, which the dither turns into a grey checker that swallows the
  // print; a little self-light in the page's own picture lifts it to about 241 and keeps the print dark. More than
  // this flattens the page's curl and the pen's shadow on it
  paper.emissive = new THREE.Color(INK.paper);
  paper.emissiveMap = pageTex;
  paper.emissiveIntensity = 0.3;
  const lift = (x, z) => { const q = (x - PAGE.w / 2 + z - PAGE.d / 2) / Math.SQRT2 + 0.17; return q > 0 ? 0.05 * (q / 0.17) ** 2 : 0; };
  const stack = k.mesh(slab(PAGE.w, PAGE.d, STACK, 32, 44, lift), paper, { y: BOARD.h + 0.0002, z: PAGE.z });
  board.add(stack);
  const sheet = k.mesh(slab(PAGE.w, PAGE.d, SHEET, 32, 44, lift), paper, { y: BOARD.h + STACK, z: PAGE.z });
  board.add(sheet);

  /* ---------- the signature: one continuous stroke, drawn on as the pen's tip travels it ---------- */
  const sig = signature();
  const inkMat = new THREE.ShaderMaterial({
    uniforms: { map: { value: sig.tex }, progress: { value: -1 }, color: { value: new THREE.Color(INK.ink) } },
    transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    vertexShader: /* glsl */ `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    // r holds the stroke's progress (premultiplied by coverage, so it survives mipmapping), g the coverage
    fragmentShader: /* glsl */ `
      uniform sampler2D map; uniform float progress; uniform vec3 color; varying vec2 vUv;
      void main() {
        vec4 s = texture2D(map, vUv);
        float f = s.r / max(s.g, 0.004);
        // coverage is lifted so the line, averaged thin by the mipmaps at a dot wide, stays ink-dark instead of grey
        float a = min(1.0, s.g * 2.4) * clamp((progress - f) / 0.008 + 0.5, 0.0, 1.0);
        if (a < 0.01) discard;
        gl_FragColor = vec4(color, a);
      }`,
  });
  const ink = new THREE.Mesh(new THREE.PlaneGeometry(sig.box.w, sig.box.d).rotateX(-PI / 2), inkMat);
  ink.position.set(sig.box.x, SHEET + 0.0006, sig.box.z);
  sheet.add(ink);

  /* ---------- the accent: a green index flag, set on the sheet's right edge ---------- */
  const flag = new THREE.Group();
  sheet.add(flag);
  // past the page edge the free end droops a little under its own weight, towards the board below it
  const edge = PAGE.w / 2 - FLAG.x - FLAG.len / 2, free = FLAG.len / 2 - edge;
  const flagGeo = slab(FLAG.len, FLAG.wid, 0.0016, 24, 2, (x) => (x > edge ? -0.009 * ((x - edge) / free) ** 2 : 0));
  flagGeo.translate(FLAG.len / 2, 0, 0);      // origin at its inner end, so it lays down from there
  flag.add(k.mesh(flagGeo, k.finish.accent({ rough: 0.34 })));

  /* ---------- the pen: aluminium barrel, graphite grip and end, steel tip, ring and clip ---------- */
  const pen = new THREE.Group();    // origin at the ball of the tip, axis along +y
  board.add(pen);
  const penBody = new THREE.Group();
  penBody.scale.setScalar(PS);
  pen.add(penBody);
  const penAlu = metal(k.finish.aluminium({ color: INK.silver, rough: 0.3, repeat: [1, 6] }), 0.62);
  const penDark = k.finish.graphite({ color: INK.graphite, rough: 0.46, repeat: [1, 3] });
  penBody.add(k.mesh(lathe([[0, 0], [0.004, 0.0006], [0.006, 0.004], [0.008, 0.011], [0.016, 0.034], [0.024, 0.062], [0.029, 0.088], [0.03, 0.1], [0, 0.1]]), bright));
  penBody.add(k.mesh(lathe([[0, 0.098], [0.03, 0.098], [0.034, 0.104], [0.036, 0.13], [0.0345, 0.19], [0.0355, 0.26], [0.038, 0.34], [0.04, 0.4], [0.0395, 0.414], [0, 0.414]]), penDark));
  penBody.add(k.mesh(lathe([[0, 0.412], [0.04, 0.412], [0.0435, 0.416], [0.0438, 0.43], [0.0435, 0.444], [0.04, 0.448], [0, 0.448]]), bright));
  penBody.add(k.mesh(lathe([[0, 0.446], [0.0415, 0.446], [0.043, 0.452], [0.043, 1.25], [0.0425, 1.296], [0, 1.296]], 40), penAlu));
  penBody.add(k.mesh(lathe([[0, 1.294], [0.0415, 1.294], [0.042, 1.3], [0.0418, 1.36], [0.0395, 1.39], [0.032, 1.402], [0.018, 1.407], [0, 1.408]]), penDark));
  penBody.add(k.mesh(k.roundBox(0.026, 0.34, 0.008, 0.0035), bright, { y: 1.15, z: 0.054 }));
  penBody.add(k.mesh(k.roundBox(0.026, 0.034, 0.02, 0.005), bright, { y: 1.325, z: 0.047 }));
  penBody.add(k.mesh(k.roundBox(0.02, 0.016, 0.012, 0.005), bright, { y: 0.986, z: 0.05 }));

  k.shadows(group);
  ink.castShadow = false;
  sheet.castShadow = false;   // it lies on the stack; a shadow there is only acne. It casts while it slides away

  /* ---------- the pen's moves ---------- */
  const UP = V(0, 1, 0);
  const qRoll = new THREE.Quaternion();
  const qOf = (dir, roll, out) => out.setFromUnitVectors(UP, dir).multiply(qRoll.setFromAxisAngle(UP, roll));
  const onPage = (x, z, out) => out.set(x, TOP + 0.001, z + PAGE.z);

  const REST = { tip: V(0.93, PEN.r, 0.42), dir: V(0.3, 0, -0.95).normalize(), roll: 0.4 };
  const qRest = qOf(REST.dir, REST.roll, new THREE.Quaternion());
  const LEAN = V(0.62, 0.76, -0.1).normalize();         // a right hand's pen, turned so the camera sees its length
  const ROLL_W = -0.5;

  // while writing the tip follows the stroke exactly and the hand behind it glides along a smoothed stroke,
  // so the barrel leans a little with each loop instead of shaking
  const tmpA = V(), tmpB = V();
  function writing(p, tip, q) {
    sig.at(p, tmpA); onPage(tmpA.x, tmpA.z, tip);
    sig.smoothAt(p, tmpB); onPage(tmpB.x, tmpB.z, tmpB).addScaledVector(LEAN, PEN.len);
    return qOf(tmpB.sub(tip).normalize(), ROLL_W, q);
  }
  const W0 = { tip: V(), q: new THREE.Quaternion() }, W1 = { tip: V(), q: new THREE.Quaternion() };
  writing(0, W0.tip, W0.q); writing(1, W1.tip, W1.q);
  const HOVER = { tip: W1.tip.clone().add(V(-0.035, 0.09, -0.015)), q: qOf(LEAN, ROLL_W, new THREE.Quaternion()) };

  const bez = (a, b, c, d, s, out) => {
    const u = 1 - s;
    return out.copy(a).multiplyScalar(u * u * u).addScaledVector(b, 3 * u * u * s).addScaledVector(c, 3 * u * s * s).addScaledVector(d, s * s * s);
  };
  const LIFT = { a: REST.tip.clone().add(V(0, 0.42, 0)), b: W0.tip.clone().add(V(0, 0.24, 0)) };
  const BACK = { a: HOVER.tip.clone().add(V(0.04, 0.22, 0)), b: REST.tip.clone().add(V(0, 0.26, 0)) };
  // the stroke starts and ends at rest, faster through its middle
  const stroke = (s) => s - S(2 * PI * s) / (2 * PI);

  function posePen(t) {
    const tip = pen.position, q = pen.quaternion;
    if (t < T.lift || t >= T.home) { tip.copy(REST.tip); q.copy(qRest); return 1; }
    if (t < T.touch) {
      const s = k.easeInOut(k.seg(t, T.lift, T.touch));
      bez(REST.tip, LIFT.a, LIFT.b, W0.tip, s, tip);
      // it turns up to the writing angle early, so it is carried rather than dragged across the page
      q.slerpQuaternions(qRest, W0.q, k.smooth(k.easeOut(k.seg(t, T.lift, T.touch - 0.25))));
      return 0;
    }
    if (t < T.signed) { writing(stroke(k.seg(t, T.touch, T.signed)), tip, q); return stroke(k.seg(t, T.touch, T.signed)); }
    if (t < T.back) {
      const s = k.easeInOut(k.seg(t, T.signed, T.off));
      tip.lerpVectors(W1.tip, HOVER.tip, s);
      q.slerpQuaternions(W1.q, HOVER.q, s);
      return 1;
    }
    const s = k.easeInOut(k.seg(t, T.back, T.home));
    bez(HOVER.tip, BACK.a, BACK.b, REST.tip, s, tip);
    q.slerpQuaternions(HOVER.q, qRest, k.easeInOut(k.seg(t, T.back, T.home - 0.06)));
    return 1;
  }

  /* ---------- the camera: a steady news-desk three-quarter, pushing in a little on the signature ---------- */
  board.updateMatrix();
  // the push aims between the signature and the middle of the page, so the clip stays in frame at its closest
  const FOCUS = V(sig.box.x + 0.1, TOP, sig.box.z + PAGE.z - 0.2).applyMatrix4(board.matrix);
  const CAM = { target: V(0.05, 0.1, 0.28), az: 0.3, el: 0.88, dist: 5.85, fov: 26 };
  const push = (t) => k.easeInOut(k.seg(t, T.lift + 0.7, T.signed - 0.2)) * (1 - k.easeInOut(k.seg(t, T.back - 0.1, T.shut - 0.2)));

  function camera(t, out) {
    t = ((t % P) + P) % P;
    const p = push(t);
    out.target.copy(CAM.target).lerp(FOCUS, 0.35 * p);
    const d = CAM.dist * (1 - 0.15 * p);
    out.pos.set(S(CAM.az) * C(CAM.el) * d, S(CAM.el) * d, C(CAM.az) * C(CAM.el) * d).add(out.target);
    out.fov = CAM.fov;
  }

  function update(t) {
    t = ((t % P) + P) % P;
    const p = posePen(t);
    inkMat.uniforms.progress.value = t < T.touch ? -1 : p >= 1 ? 2 : p;

    // the flag enters from beyond the frame's right edge, travels low at an even pace, touches down at its inner
    // end and lays flat; a fast fly-in that brakes hard reads as a cartoon
    const placed = t >= T.flagIn;
    flag.visible = placed;
    if (placed) {
      const g = k.easeInOut(k.seg(t, T.flagIn, T.flagDown));
      const down = k.easeInOut(k.seg(t, T.flagDown - 0.4, T.flagDown));
      const lay = k.easeInOut(k.seg(t, T.flagDown - 0.12, T.flagSet));
      flag.position.set(FLAG.x + 2.3 * (1 - g), SHEET + 0.0004 + 0.035 * (1 - down), FLAG.z - 0.08 * (1 - g));
      flag.rotation.set(0, 0.14 * (1 - g), 0.12 * (1 - lay));
    }

    // the clip opens, the signed sheet slides off to the left, the clip closes on the fresh one
    const slide = k.easeInOut(k.seg(t, T.slide, T.gone));
    sheet.visible = t < T.gone;
    sheet.position.set(-3.3 * slide, BOARD.h + STACK + 0.03 * k.smooth(k.seg(t, T.slide, T.slide + 0.25)) * (t < T.gone ? 1 : 0), PAGE.z + 0.12 * slide);
    sheet.rotation.y = 0.12 * slide;
    sheet.castShadow = t > T.slide && t < T.gone;
    const open = k.easeInOut(k.seg(t, T.open, T.slide + 0.1)) * (1 - k.easeInOut(k.seg(t, T.gone - 0.05, T.shut)));
    lever.rotation.x = -0.2 * open;
  }

  /* ---------- geometry helpers ---------- */

  function rrPath(path, w, h, r, cx = 0, cy = 0) {
    const x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2;
    path.moveTo(x0 + r, y0);
    path.lineTo(x1 - r, y0); path.absarc(x1 - r, y0 + r, r, -PI / 2, 0, false);
    path.lineTo(x1, y1 - r); path.absarc(x1 - r, y1 - r, r, 0, PI / 2, false);
    path.lineTo(x0 + r, y1); path.absarc(x0 + r, y1 - r, r, PI / 2, PI, false);
    path.lineTo(x0, y0 + r); path.absarc(x0 + r, y0 + r, r, PI, 1.5 * PI, false);
    return path;
  }

  // the board: a rounded plate with a small chamfer all round. No hang slot: at a few dots its far rim only
  // aliases into a dashed grey line above the clip
  function boardGeo() {
    const bev = 0.008, { w, d, h, r } = BOARD;
    const s = rrPath(new THREE.Shape(), w - 2 * bev, d - 2 * bev, r - bev);
    const g = new THREE.ExtrudeGeometry(s, { depth: h - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 3, curveSegments: 12 });
    g.rotateX(-PI / 2);
    g.translate(0, bev, 0);
    return g;
  }

  // the spring lever, as a side profile: a short thumb tab behind the pin, a low arch, the jaw and a turned-up lip
  function leverGeo(width) {
    const pts = [[-0.058, 0.03], [-0.03, 0.022], [0, 0.021], [0.05, 0.03], [0.12, 0.036], [0.19, 0.024], [0.235, 0.002], [0.262, -0.0085], [0.284, -0.007], [0.302, 0.004]];
    const curve = new THREE.SplineCurve(pts.map(([z, y]) => new THREE.Vector2(z, y)));
    const n = 60, t = 0.0035, top = [], bot = [];
    for (let i = 0; i <= n; i++) {
      const p = curve.getPoint(i / n), d = curve.getTangent(i / n);
      top.push(new THREE.Vector2(p.x - d.y * t, p.y + d.x * t));
      bot.push(new THREE.Vector2(p.x + d.y * t, p.y - d.x * t));
    }
    const bev = 0.0025;
    const g = new THREE.ExtrudeGeometry(new THREE.Shape([...top, ...bot.reverse()]), { depth: width - 2 * bev, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 2, curveSegments: 1 });
    g.rotateY(-PI / 2);          // profile x runs along z, the extrusion across x
    g.translate(width / 2 - bev, 0, 0);
    return g;
  }

  // a low dome (rivet head)
  function dome(r, h) {
    const pts = [];
    for (let i = 0; i <= 8; i++) { const a = (i / 8) * PI / 2; pts.push(new THREE.Vector2(r * C(a) + 0.00001, h * S(a))); }
    pts[pts.length - 1].x = 0;
    return new THREE.LatheGeometry(pts, 20);
  }

  function lathe(pts, seg = 36) { return new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), seg); }

  // A thin slab w x d (along x and z), t thick, its bottom at y = lift(x, z): a sheet of paper whose corner curls up,
  // a flag whose free end droops. The top face maps the whole texture (canvas top at -z); the edges show its margin.
  function slab(w, d, t, nx, nz, lift) {
    const pos = [], uv = [], idx = [];
    const add = (x, y, z, u, v) => { pos.push(x, y, z); uv.push(u, v); return pos.length / 3 - 1; };
    const X = (i) => -w / 2 + (i / nx) * w, Z = (j) => -d / 2 + (j / nz) * d;
    for (const top of [true, false]) {
      const base = pos.length / 3;
      for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) add(X(i), lift(X(i), Z(j)) + (top ? t : 0), Z(j), i / nx, 1 - j / nz);
      for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
        const a = base + j * (nx + 1) + i, b = a + 1, c = a + nx + 1, e = c + 1;
        if (top) idx.push(a, c, b, b, c, e); else idx.push(a, b, c, b, e, c);
      }
    }
    // the four edges, each its own strip so the corners stay crisp
    const edge = (n, at, out) => {
      for (let i = 0; i < n; i++) {
        const [x0, z0] = at(i), [x1, z1] = at(i + 1);
        const p0 = add(x0, lift(x0, z0), z0, 0.004, 0.996), p1 = add(x1, lift(x1, z1), z1, 0.004, 0.996);
        const p2 = add(x0, lift(x0, z0) + t, z0, 0.004, 0.996), p3 = add(x1, lift(x1, z1) + t, z1, 0.004, 0.996);
        if (out) idx.push(p0, p1, p2, p1, p3, p2); else idx.push(p0, p2, p1, p1, p2, p3);
      }
    };
    edge(nx, (i) => [X(i), d / 2], true);
    edge(nx, (i) => [X(i), -d / 2], false);
    edge(nz, (j) => [w / 2, Z(j)], false);
    edge(nz, (j) => [-w / 2, Z(j)], true);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  /* ---------- the signature ---------- */
  // A fast, illegible signature: a tall swash that curls back under itself, two small loops, a tall narrow loop, a
  // hook and a long tail rising to the right. Few, round features: at a dot or two of line they still read as a hand,
  // where a run of sharp zigzags reads as a child's pretend writing.
  // Sampled evenly along its length so progress p moves the tip at a steady rate; a smoothed copy guides the hand.
  function signature() {
    const pts = [
      [-0.46, 0.6], [-0.43, 0.545], [-0.405, 0.51], [-0.388, 0.515], [-0.392, 0.56], [-0.408, 0.625], [-0.428, 0.68],
      [-0.455, 0.708], [-0.488, 0.712], [-0.498, 0.692], [-0.472, 0.673], [-0.42, 0.664], [-0.37, 0.662],
      [-0.345, 0.645], [-0.328, 0.618], [-0.338, 0.605], [-0.352, 0.625], [-0.345, 0.665], [-0.325, 0.688],
      [-0.3, 0.672], [-0.28, 0.645], [-0.262, 0.65], [-0.255, 0.675], [-0.24, 0.688],
      [-0.215, 0.655], [-0.198, 0.595], [-0.19, 0.556], [-0.2, 0.55], [-0.214, 0.58], [-0.216, 0.64], [-0.205, 0.684], [-0.18, 0.69],
      [-0.155, 0.672], [-0.14, 0.662], [-0.128, 0.676], [-0.11, 0.688],
      [-0.08, 0.682], [-0.02, 0.678], [0.04, 0.662], [0.095, 0.638], [0.145, 0.612],
    ].map(([x, z]) => new THREE.Vector3(-0.5 + (x + 0.5) * 1.08, 0, 0.7 + (z - 0.7) * 1.08));
    const curve = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
    const N = 480, line = curve.getSpacedPoints(N);
    const smooth = line.map((_, i) => {
      const a = Math.max(0, i - 44), b = Math.min(N, i + 44), s = V();
      for (let j = a; j <= b; j++) s.add(line[j]);
      return s.divideScalar(b - a + 1);
    });
    const pad = 0.03;
    let x0 = Infinity, x1 = -Infinity, z0 = Infinity, z1 = -Infinity;
    for (const p of line) { x0 = Math.min(x0, p.x); x1 = Math.max(x1, p.x); z0 = Math.min(z0, p.z); z1 = Math.max(z1, p.z); }
    x0 -= pad; x1 += pad; z0 -= pad; z1 += pad;
    const box = { x: (x0 + x1) / 2, z: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 };
    const W = 1024, H = Math.round((W * box.d) / box.w / 4) * 4;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.lineCap = 'round'; g.lineJoin = 'round';
    g.lineWidth = (0.013 * W) / box.w;         // a fine liner's line on the A4 sheet, about one dot at 680
    const px = (p) => [((p.x - x0) / box.w) * W, ((p.z - z0) / box.d) * H];
    // drawn from the end back to the start, so where the line crosses itself the earlier pass wins
    for (let i = N - 1; i >= 0; i--) {
      const f = Math.round((i / N) * 255);
      g.strokeStyle = `rgb(${f},255,0)`;
      g.beginPath(); g.moveTo(...px(line[i])); g.lineTo(...px(line[i + 1])); g.stroke();
    }
    const tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    const at = (list) => (p, out) => {
      const f = Math.min(N, Math.max(0, p * N)), i = Math.min(N - 1, Math.floor(f));
      return out.lerpVectors(list[i], list[i + 1], f - i);
    };
    return { tex, box, at: at(line), smoothAt: at(smooth) };
  }

  /* ---------- the printed page ---------- */
  // A scope document at small scale, all in fine rules and grey type blocks: a title, a paragraph of scope, a three-row
  // table of deliverables with prices, a small timeline, and the signature and date lines at the foot.
  function drawPage(c, w, h) {
    const s = w / PAGE.w, X = (x) => (x + PAGE.w / 2) * s, Y = (z) => (z + PAGE.d / 2) * s;
    let seed = 7;
    const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    // everything is printed in ink at a few tones: the palette's slate and graphite lean blue and dither into blue dots
    const HEAD = 0.9, RULE = 0.7, TYPE = 0.5, FAINT = 0.3;
    const bar = (x0, x1, z, th, tone) => { c.globalAlpha = tone; c.fillRect(X(x0), Y(z) - (th * s) / 2, (x1 - x0) * s, th * s); };
    // a line of type: words of uneven length with small gaps
    const words = (x0, x1, z, th, tone) => {
      for (let x = x0; x < x1 - 0.01;) { const wl = Math.min(x1 - x, 0.025 + rnd() * 0.07); bar(x, x + wl, z, th, tone); x += wl + 0.014; }
    };
    const L = -0.53, R = 0.53;
    c.fillStyle = INK.paper; c.fillRect(0, 0, w, h);
    c.fillStyle = INK.ink;
    // head
    bar(L, -0.3, -0.62, 0.032, HEAD); bar(-0.27, -0.1, -0.62, 0.032, HEAD);
    words(L, -0.16, -0.555, 0.014, TYPE);
    bar(0.31, R, -0.635, 0.012, TYPE);
    bar(0.37, R, -0.603, 0.012, TYPE);
    bar(L, R, -0.505, 0.004, RULE);
    // scope
    [0.52, 0.49, 0.53, 0.45, 0.08].forEach((end, i) => words(L, end, -0.45 + i * 0.038, 0.012, TYPE));
    // deliverables: a header row, three rows with thin rules, a total
    bar(L, -0.31, -0.225, 0.018, HEAD);
    bar(L, R, -0.18, 0.005, RULE);
    bar(L, -0.47, -0.152, 0.01, TYPE); bar(-0.4, -0.22, -0.152, 0.01, TYPE); bar(0.4, R, -0.152, 0.01, TYPE);
    bar(L, R, -0.128, 0.0025, TYPE);
    [[0.08, 0.13], [-0.02, 0.1], [0.16, 0.15]].forEach(([end, price], i) => {
      const z = -0.093 + i * 0.07;
      bar(L, -0.495, z, 0.013, HEAD);
      words(-0.4, end, z, 0.012, TYPE);
      bar(R - price, R, z, 0.013, HEAD);
      bar(L, R, z + 0.035, 0.0022, FAINT);
    });
    bar(L, R, 0.087, 0.004, RULE);
    bar(0.3, R, 0.122, 0.017, HEAD);
    // timeline: three staggered phases over a ruled axis
    bar(L, -0.33, 0.215, 0.018, HEAD);
    bar(L, -0.1, 0.268, 0.02, RULE);
    bar(-0.16, 0.22, 0.302, 0.02, TYPE);
    bar(0.16, R, 0.336, 0.02, TYPE);
    bar(L, R, 0.372, 0.003, RULE);
    for (let i = 0; i <= 4; i++) { const x = L + (i / 4) * (R - L); bar(x - 0.002, x + 0.002, 0.382, 0.02, RULE); }
    // signature and date
    bar(L, 0.14, 0.72, 0.0035, RULE);
    bar(L, -0.34, 0.752, 0.01, TYPE);
    bar(0.3, R, 0.72, 0.0035, RULE);
    bar(0.3, 0.42, 0.752, 0.01, TYPE);
    bar(0.32, 0.48, 0.692, 0.012, TYPE);
    // footer
    bar(L, -0.36, 0.85, 0.008, FAINT);
    bar(R - 0.05, R, 0.85, 0.008, FAINT);
    c.globalAlpha = 1;
  }


  update(0);
  return { name: 'brief', period: P, still: 5.5, cuts: [], group, update, camera };
}
