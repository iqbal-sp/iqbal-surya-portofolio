/*
  Live wallpaper for Option A: Media Center blue with ribbons of light, drawn in three.js.
  A Broadcast blue field (Hi in the top-right corner, through Mid, to Deep) crossed by ribbons of light that
  rise from the bottom into the right half and leave off the right edge: a wide one in Focus Glow green, a
  lower one in blue, each on a soft halo and drawn in threads of light, and one fine pale thread. The ribbons
  turn slowly along their length, so a fold of light travels along them.
  Rendered at low resolution, then pushed through an ordered dither (web-safe style palette), faint
  scanlines and the odd glitch burst, as the earlier teal wallpaper was.
  Moving the mouse over the wallpaper drags a small water wake through it: a low-res flow field
  (splat, self-advect, blur, decay) sweeps the dither dots along and bends the picture a little,
  then settles. Brushing a ribbon touches it: it gives a little, flutters out from the spot you brushed,
  and a small ripple runs through the dots.
  Hover only, no clicks. It renders at display rate only while the water or a ribbon is still moving,
  30 fps otherwise.

  A still of this scene (asset/wallpaper-media-center.webp) stays on .desktop underneath and remains the
  wallpaper whenever this can't run: no WebGL, CDN blocked, phones (windows cover the desktop there), or
  ?wall=static. With prefers-reduced-motion it renders one still frame and never animates or glitches.
  three.js (about 190 KB) is fetched only where the wallpaper is drawn, so a phone never downloads it; a
  screen that leaves phone mode (a window widened past 720px) fetches it then.

  Tuning lives in CFG. Console helpers: PF.wall3d.glitch(ms), .pause(), .play(), .step(dt), .state(), .targets().
*/
let THREE = null;

const CFG = {
  pixel: 2,                     // CSS px per rendered pixel (the size of one dither dot)
  levels: 6,                    // colour levels per channel after dithering (6 = the 216-colour web palette)
  scanlines: 0.06,              // darkening of every other row
  exposure: 1.15,
  fps: 30,                      // idle frame rate
  fpsActive: 120,               // while the water wake or a touched ribbon moves (the display caps it: 60 or 120)
  glitchEvery: [3500, 9000],    // ms between glitch bursts
  glitchLength: [140, 420],     // ms per burst
  twist: 0.16,                  // rad/s the ribbons turn along their length
  flow: {
    grid: 4,                    // flow field resolution = rendered size / grid
    radius: 70,                 // CSS px of water the cursor drags
    follow: 0.06,               // s; cursor smoothing so the wake never jerks
    settle: 1.0,                // s for the wake to fade to about a third
    diffuse: 0.047,             // s; how fast the wake spreads into the water around it
    drag: 0.021,                // s; how fast water under the cursor takes on its speed
    sweep: 0.016,               // s of flow turned into displacement
    maxShift: 14,               // CSS px the dots can be swept at most (approached softly, never hit)
    bend: 0.6,                  // share of that shift applied to the picture (the dots take all of it)
    grain: 1.5,                 // CSS px each dot may land ahead or behind along the flow
    glow: 0.02,                 // faint lift of the wake so it reads as water, 0 to switch off
  },
  touch: {
    ribbon: [1.0, 0.5],         // spring [Hz, damping ratio] of the give when a ribbon is brushed
    push: 0.7,                  // units/s a gentle brush gives (a quick swipe adds up to 0.9 more)
    flutter: 0.55,              // flutter a brush gives the ribbon (0..1)
    ripple: 0.45,               // strength of the ring of water around the touch
    cooldown: 220,              // ms before the same ribbon reacts again
  },
};

// DESIGN.md colours: Broadcast Deep, Mid and Hi for the field; Focus Glow and Glow Edge for the green ribbon;
// the icon blue and Broadcast Soft for the blue one; Glow Edge into white for the fine thread
const INK = { deep: '#04163f', mid: '#0d3a8f', hi: '#1d56b8', glow: '#86d13f', glowEdge: '#d4f7ad', blue: '#6aa8ff', soft: '#d6e2f8', white: '#ffffff' };

// Composition in "wallpaper units": the frame is 7.4 units tall and x = 0 is its right edge, so the ribbons
// always rise into the right half whatever the screen's shape, and the left stays calm for icons and windows.
// Each ribbon: its path, width, how many half-turns of twist it carries, its colours, brightness, the
// threads of light across it, and the brightness of its halo (0 = none).
const RIBBONS = [
  { name: 'green', points: [[-9.2, -4.9, 0.6], [-6.2, -3.0, 0], [-3.9, -1.2, -0.5], [-1.6, 0.1, 0.2], [1.3, 0.9, 0.6]],
    width: 1.5, turns: 0.75, colors: [INK.glow, INK.glowEdge], gain: 0.62, threads: 30, halo: 0.12, offset: 0 },
  { name: 'blue', points: [[-8.0, -5.1, -0.4], [-5.2, -3.6, 0.3], [-2.8, -2.7, -0.2], [-0.4, -2.2, 0.3], [1.5, -2.0, -0.2]],
    width: 1.0, turns: 0.8, colors: [INK.blue, INK.soft], gain: 0.45, threads: 26, halo: 0.1, offset: 2.1 },
  { name: 'thread', points: [[-9.0, -4.55, 0.7], [-6.0, -2.7, 0.1], [-3.7, -0.9, -0.4], [-1.4, 0.4, 0.3], [1.4, 1.2, 0.7]],
    width: 0.07, turns: 0, colors: [INK.glowEdge, INK.white], gain: 1.1, threads: 0, halo: 0, offset: 0 },
];

const PF = (window.PF = window.PF || {});
const desktop = document.getElementById('desktop');
// phone mode, as style.css's SMALL SCREENS asks it
const mqMobile = window.matchMedia('(max-width: 720px), (max-height: 500px) and (pointer: coarse)');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const wantStatic = new URLSearchParams(location.search).get('wall') === 'static';

if (desktop && !wantStatic) {
  // PF.wall3dLoad settles once the wallpaper has started or given up; the welcome screen waits on it
  const load = () => {
    PF.wall3dLoad = import('three')
      .then((mod) => { THREE = mod; start(); })
      .catch((err) => console.warn('[wall3d] staying on the static wallpaper:', err));
  };
  if (!mqMobile.matches) load();
  else mqMobile.addEventListener('change', function widened() { if (mqMobile.matches) return; mqMobile.removeEventListener('change', widened); load(); });
}

function start() {
  const canvas = document.createElement('canvas');
  canvas.className = 'wall3d';
  canvas.setAttribute('aria-hidden', 'true');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(1);
  desktop.prepend(canvas);

  const floatTarget = renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');
  const target = new THREE.WebGLRenderTarget(4, 4, { type: floatTarget ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: true });

  /* ---------- scene ---------- */
  const scene = new THREE.Scene();
  scene.background = fieldTexture();

  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  const camHome = new THREE.Vector3(0, 0, 14);
  camera.position.copy(camHome);

  const group = new THREE.Group();
  scene.add(group);

  // Each ribbon is a strip of light plus, for the wide ones, a flat halo along the same path. The strip is the
  // part a brush touches; its halo gives and flutters with it.
  const lights = RIBBONS.map((spec) => {
    const strip = makeRibbon(spec.points, 220, spec.width, spec.turns);
    const mesh = new THREE.Mesh(strip.geometry, lightMaterial(spec.colors, spec.gain, spec.threads, 2.6, 0.9));
    const halo = spec.halo ? makeRibbon(spec.points, 110, spec.width * 2.2, 0) : null;
    const haloMesh = halo ? new THREE.Mesh(halo.geometry, lightMaterial(spec.colors, spec.halo, 0, 2.2, 0)) : null;
    mesh.userData.touch = { off: new THREE.Vector3(), vel: new THREE.Vector3(), flutter: 0, wave: 0, at: 0.5, cool: 0 };
    group.add(...(haloMesh ? [haloMesh, mesh] : [mesh]));
    return { spec, strip, mesh, halo, haloMesh };
  });
  const touchables = lights.map((L) => L.mesh);

  /* ---------- post: glitch, dither, scanlines ---------- */
  const post = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: target.texture },
      uRes: { value: new THREE.Vector2(4, 4) },
      uOut: { value: new THREE.Vector2(8, 8) },
      uPixel: { value: CFG.pixel },
      uLevels: { value: CFG.levels },
      uScan: { value: CFG.scanlines },
      uExposure: { value: CFG.exposure },
      uGlitch: { value: 0 },
      uSeed: { value: 0 },
      tFlow: { value: null },
      uFlowOn: { value: 0 },
      uSweep: { value: CFG.flow.sweep },
      uMaxShift: { value: CFG.flow.maxShift },
      uBend: { value: CFG.flow.bend },
      uGlow: { value: CFG.flow.glow },
      uGrain: { value: CFG.flow.grain },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tScene, tFlow;
      uniform vec2 uRes, uOut;          // rendered (dot) size and output (CSS px) size
      uniform float uPixel, uLevels, uScan, uGlitch, uSeed, uExposure;
      uniform float uFlowOn, uSweep, uMaxShift, uBend, uGlow, uGrain;
      varying vec2 vUv;

      float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
      float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
      float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
      vec3 toSRGB(vec3 c) { c = clamp(c, 0.0, 1.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }

      void main() {
        // The canvas is drawn at CSS resolution while the dots stay CFG.pixel wide, so the wake can move them
        // one CSS pixel at a time instead of a whole dot at a time.
        vec2 pos = vUv * uOut;

        // water wake, in CSS px; soft-capped so even a fast flick eases in instead of hitting a wall
        vec2 shift = vec2(0.0);
        if (uFlowOn > 0.5) {
          vec2 raw = texture2D(tFlow, vUv).xy * uSweep * uOut;
          float len = length(raw);
          if (len > 1e-3) shift = raw * (uMaxShift * tanh(len / uMaxShift) / len);
        }
        float amt = clamp(length(shift) / 2.0, 0.0, 1.0);
        vec2 dir = amt > 0.0 ? normalize(shift) : vec2(0.0);
        // Rounding a smooth shift onto the dot grid draws contour lines, so the rounding is dithered:
        // each swept dot (as a whole) lands a little ahead or behind along the flow. Still water keeps the grid.
        vec2 dot0 = floor((pos - shift) / uPixel);
        vec2 dotCell = floor((pos - shift + dir * (hash12(dot0) - 0.5) * uGrain * amt) / uPixel);
        vec2 uv = (floor((pos - shift * uBend) / uPixel) + 0.5) / uRes;   // the picture bends less than the dots
        float gain = 1.0;
        if (uGlitch > 0.0) {
          // whole tiles jump sideways, like a frame that decoded wrong
          vec2 cell = floor(uv * vec2(18.0, 11.0));
          float r = hash12(cell + uSeed);
          if (r < 0.1 * uGlitch) {
            uv.x += (hash12(cell + uSeed + 3.7) - 0.5) * 0.24;
            uv.y += (hash12(cell + uSeed + 9.1) - 0.5) * 0.05;
            if (r < 0.03 * uGlitch) gain = hash12(cell + uSeed + 5.3) < 0.5 ? 0.45 : 1.5;  // a few tiles drop out or flare, staying in palette
          }
          // thin bands smear to the left
          float band = floor(uv.y * uRes.y / 3.0);
          float rb = hash12(vec2(band, uSeed + 1.3));
          if (rb < 0.07 * uGlitch) uv.x += rb * 1.4;
          uv = fract(uv);
        }
        float split = uGlitch * 2.0 / uRes.x;
        vec3 col = vec3(
          texture2D(tScene, uv + vec2(split, 0.0)).r,
          texture2D(tScene, uv).g,
          texture2D(tScene, uv - vec2(split, 0.0)).b);
        col = toSRGB(col * uExposure);
        col *= gain;
        col += uGlow * smoothstep(0.0, uMaxShift, length(shift));

        col *= 1.0 - uScan * mod(dotCell.y, 2.0);
        float steps = uLevels - 1.0;
        col = floor(col * steps + bayer4(dotCell) + 0.03125) / steps;
        gl_FragColor = vec4(col, 1.0);
      }`,
    depthTest: false,
    depthWrite: false,
  });
  const postScene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post);
  quad.frustumCulled = false;
  postScene.add(quad);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  /* ---------- water wake: a tiny flow field, ping-ponged between two float targets ---------- */
  const flowOn = floatTarget && !reduceMotion;
  const flowOpts = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, depthBuffer: false };
  const flowRT = flowOn ? [new THREE.WebGLRenderTarget(2, 2, flowOpts), new THREE.WebGLRenderTarget(2, 2, flowOpts)] : null;
  const flowMat = new THREE.ShaderMaterial({
    uniforms: {
      tPrev: { value: null },
      uTexel: { value: new THREE.Vector2(0.5, 0.5) },
      uAspect: { value: 1 },
      uA: { value: new THREE.Vector2(-9, -9) },
      uB: { value: new THREE.Vector2(-9, -9) },
      uForce: { value: new THREE.Vector2() },
      uRadius: { value: 0.1 },
      uDecay: { value: 1 },
      uDt: { value: 1 / 60 },
      uDiffuse: { value: 0.3 },
      uDrag: { value: 0.55 },
      uRipple: { value: new THREE.Vector3() },
    },
    vertexShader: post.vertexShader,
    fragmentShader: /* glsl */ `
      uniform sampler2D tPrev;
      uniform vec2 uTexel, uA, uB, uForce;
      uniform float uAspect, uRadius, uDecay, uDt, uDiffuse, uDrag;
      uniform vec3 uRipple;   // xy = centre (uv), z = amount added this step
      varying vec2 vUv;
      float segDist(vec2 p, vec2 a, vec2 b) { vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0); return length(pa - ba * h); }
      void main() {
        vec2 back = vUv - texture2D(tPrev, vUv).xy * uDt * 0.6;        // the wake drifts along itself
        vec2 v = texture2D(tPrev, back).xy;
        vec2 around = texture2D(tPrev, back + vec2(uTexel.x, 0.0)).xy + texture2D(tPrev, back - vec2(uTexel.x, 0.0)).xy
                    + texture2D(tPrev, back + vec2(0.0, uTexel.y)).xy + texture2D(tPrev, back - vec2(0.0, uTexel.y)).xy;
        v = mix(v, around * 0.25, uDiffuse);                            // and spreads out
        vec2 asp = vec2(uAspect, 1.0);
        float d = segDist(vUv * asp, uA * asp, uB * asp);
        v = mix(v, uForce, clamp(exp(-d * d / (uRadius * uRadius)) * uDrag, 0.0, 1.0));  // water near the cursor is dragged along
        if (uRipple.z > 0.0) {                                           // a touched ribbon pushes a ring of water outwards
          vec2 dp = (vUv - uRipple.xy) * asp;
          float dr = length(dp), r = uRadius * 1.1;
          vec2 n = dr > 1e-5 ? dp / dr : vec2(0.0);
          v += vec2(n.x / uAspect, n.y) * uRipple.z * 2.33 * (dr / r) * exp(-dr * dr / (r * r));
        }
        gl_FragColor = vec4(v * uDecay, 0.0, 1.0);
      }`,
    depthTest: false,
    depthWrite: false,
  });
  const flowScene = new THREE.Scene();
  const flowQuad = new THREE.Mesh(quad.geometry, flowMat);
  flowQuad.frustumCulled = false;
  flowScene.add(flowQuad);
  function clearFlow() {
    if (!flowOn) return;
    renderer.setClearColor(0x000000, 0);
    flowRT.forEach((rt) => { renderer.setRenderTarget(rt); renderer.clear(true, false, false); });
    renderer.setRenderTarget(null);
    post.uniforms.tFlow.value = flowRT[0].texture;
  }

  /* ---------- layout ---------- */
  function layout() {
    const cssW = Math.max(1, desktop.clientWidth), cssH = Math.max(1, desktop.clientHeight);
    const w = Math.max(1, Math.round(cssW / CFG.pixel)), h = Math.max(1, Math.round(cssH / CFG.pixel));
    renderer.setSize(w * CFG.pixel, h * CFG.pixel, false);   // output at CSS resolution (one whole number of dots)
    target.setSize(w, h);                                   // the 3D scene itself stays at dot resolution
    post.uniforms.uRes.value.set(w, h);
    post.uniforms.uOut.value.set(w * CFG.pixel, h * CFG.pixel);
    if (flowOn) {
      const fw = Math.max(2, Math.round(w / CFG.flow.grid)), fh = Math.max(2, Math.round(h / CFG.flow.grid));
      flowRT.forEach((rt) => rt.setSize(fw, fh));
      flowMat.uniforms.uTexel.value.set(1 / fw, 1 / fh);
      flowMat.uniforms.uAspect.value = cssW / cssH;
      flowMat.uniforms.uRadius.value = CFG.flow.radius / cssH;
      clearFlow();
    }
    camera.aspect = cssW / cssH;
    camera.updateProjectionMatrix();
    const visH = 2 * camHome.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const visW = visH * camera.aspect;
    const s = visH / 7.4;
    group.scale.setScalar(s);
    group.position.set(visW / 2, 0, 0);
  }

  /* ---------- motion ---------- */
  const pointer = new THREE.Vector2();
  // Wake input, in desktop UV (0..1, y up). Only the bare wallpaper reacts: not windows, menus or the taskbar.
  const cursorAim = new THREE.Vector2(), cursor = new THREE.Vector2(), cursorWas = new THREE.Vector2(), cursorVel = new THREE.Vector2();
  // wake: 1 while the cursor stirs the water, easing to 0; below WAKE_MIN the shift is under a fifth of a pixel, so the field is cleared
  const WAKE_MIN = 0.03;
  let overWall = false, wake = 0, flowIdle = true;
  const ptrVel = new THREE.Vector2(), ptrStep = new THREE.Vector2();   // raw cursor velocity (uv/s), for touches
  let ptrAt = 0, pointerMoved = false;
  window.addEventListener('pointermove', (e) => {
    pointer.set((e.clientX / window.innerWidth - 0.5) * 2, -(e.clientY / window.innerHeight - 0.5) * 2);
    const r = desktop.getBoundingClientRect();
    const u = (e.clientX - r.left) / r.width, v = 1 - (e.clientY - r.top) / r.height;
    const inside = u >= 0 && u <= 1 && v >= 0 && v <= 1 && !(e.target.closest && e.target.closest('.win, .taskbar, .start-menu, .menu'));
    if (!inside) { overWall = false; return; }
    const now = performance.now();
    if (!overWall) { cursor.set(u, v); cursorWas.set(u, v); ptrVel.set(0, 0); }   // entering: no streak from the old spot
    else {
      const dt = Math.max(0.008, (now - ptrAt) / 1000);
      ptrVel.lerp(ptrStep.set((u - cursorAim.x) / dt, (v - cursorAim.y) / dt), 0.5);
    }
    ptrAt = now;
    overWall = true;
    cursorAim.set(u, v);
    pointerMoved = true;
    if (flowOn) wake = 1;
  }, { passive: true });
  document.documentElement.addEventListener('pointerleave', () => { overWall = false; });

  function flowStep(dt) {
    if (!flowOn) return;
    if (wake < WAKE_MIN) {
      if (!flowIdle) { clearFlow(); post.uniforms.uFlowOn.value = 0; flowIdle = true; }
      return;
    }
    flowIdle = false;
    cursorWas.copy(cursor);
    if (overWall) cursor.lerp(cursorAim, 1 - Math.exp(-dt / CFG.flow.follow));
    cursorVel.subVectors(cursor, cursorWas).divideScalar(Math.max(dt, 1e-3));
    const moving = overWall && cursorVel.lengthSq() > 0.0004;
    const u = flowMat.uniforms;
    if (moving) { u.uA.value.copy(cursorWas); u.uB.value.copy(cursor); u.uForce.value.copy(cursorVel); }
    else { u.uA.value.set(-9, -9); u.uB.value.set(-9, -9); u.uForce.value.set(0, 0); }
    u.uDecay.value = Math.exp(-dt / CFG.flow.settle);
    u.uDiffuse.value = 1 - Math.exp(-dt / CFG.flow.diffuse);
    u.uDrag.value = 1 - Math.exp(-dt / CFG.flow.drag);
    u.uDt.value = dt;
    if (ripple.age < 0.14) {           // the ring of water rises over 140 ms instead of popping in
      const part = Math.min(dt, 0.14 - ripple.age) / 0.14;
      u.uRipple.value.set(ripple.u, ripple.v, ripple.amount * part);
      ripple.age += dt;
    } else u.uRipple.value.z = 0;
    u.tPrev.value = flowRT[0].texture;
    renderer.setRenderTarget(flowRT[1]);
    renderer.render(flowScene, postCam);
    renderer.setRenderTarget(null);
    flowRT.reverse();
    post.uniforms.tFlow.value = flowRT[0].texture;
    post.uniforms.uFlowOn.value = 1;
    wake = moving ? 1 : wake * Math.exp(-dt / CFG.flow.settle);
  }

  /* ---------- touch ---------- */
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();
  const ripple = { u: 0, v: 0, amount: 0, age: 1 };
  const vA = new THREE.Vector3(), vB = new THREE.Vector3();
  let lastHit = null, touchLive = false;

  // Only a moving cursor touches: a ribbon drifting under a resting cursor is left alone.
  function touchTest(now) {
    if (!overWall) { lastHit = null; pointerMoved = false; return; }
    if (!pointerMoved) return;
    pointerMoved = false;
    ndc.set(cursorAim.x * 2 - 1, cursorAim.y * 2 - 1);
    camera.updateMatrixWorld();
    group.updateMatrixWorld(true);
    raycaster.setFromCamera(ndc, camera);
    const hit = raycaster.intersectObjects(touchables, false)[0];
    const mesh = hit ? hit.object : null;
    if (mesh && mesh !== lastHit && now > mesh.userData.touch.cool) touch(mesh, hit, now);
    lastHit = mesh;
  }

  function touch(mesh, hit, now) {
    const T = CFG.touch, st = mesh.userData.touch;
    st.cool = now + T.cooldown;
    const speed = Math.min(1, ptrVel.length() / 1.2);                  // 0 = a gentle brush, 1 = a quick swipe
    const push = vB.set(ptrVel.x * camera.aspect, ptrVel.y, 0);         // the ribbon gives along the swipe...
    if (push.lengthSq() < 1e-8) push.set(0, 0, -1); else push.normalize();
    push.z -= 0.35;                                                     // ...and a little into the screen, like a press
    push.normalize();
    st.vel.addScaledVector(push, (T.push + 0.9 * speed) * 0.35);
    if (st.flutter < 0.1 && hit.uv) st.at = hit.uv.x;                  // the flutter spreads out from the spot brushed
    st.flutter = Math.min(1, st.flutter + T.flutter + 0.45 * speed);
    if (flowOn) {
      vA.copy(hit.point).project(camera);
      Object.assign(ripple, { u: (vA.x + 1) / 2, v: (vA.y + 1) / 2, amount: T.ripple * (0.8 + 0.5 * speed), age: 0 });
      wake = 1;
    }
    touchLive = true;
  }

  // damped spring toward zero, sub-stepped so it behaves the same at 30 and 120 fps
  function spring(x, v, [hz, zeta], dt) {
    const w = 2 * Math.PI * hz, k = w * w, c = 2 * zeta * w;
    const n = Math.max(1, Math.ceil(dt * 240)), h = dt / n;
    for (let i = 0; i < n; i++) {
      v.x += (-k * x.x - c * v.x) * h; v.y += (-k * x.y - c * v.y) * h; v.z += (-k * x.z - c * v.z) * h;
      x.addScaledVector(v, h);
    }
  }
  function touchStep(dt) {
    if (!touchLive) return;
    let live = false;
    for (const m of touchables) {
      const st = m.userData.touch;
      spring(st.off, st.vel, CFG.touch.ribbon, dt);
      if (st.flutter > 0) {
        st.wave += dt * 7;
        st.flutter *= Math.exp(-dt / 0.7);
        if (st.flutter < 0.01) { st.flutter = 0; st.wave = 0; }
      }
      if (st.off.lengthSq() < 1e-6 && st.vel.lengthSq() < 1e-5) { st.off.set(0, 0, 0); st.vel.set(0, 0, 0); }   // under 0.1 px: at rest
      else live = true;
      if (st.flutter > 0) live = true;
    }
    touchLive = live;
  }

  let time = 0;
  function animate(t, dt = 1 / 60) {
    lights.forEach((L, i) => {
      const st = L.mesh.userData.touch;
      L.strip.update(t * CFG.twist + L.spec.offset, st);
      L.mesh.position.copy(st.off);
      L.mesh.position.y += Math.sin(t * 0.23 + i * 1.9) * 0.06;         // each ribbon breathes a little on its own
      L.mesh.material.uniforms.uTime.value = t;
      if (L.halo) {
        L.halo.update(0, st);
        L.haloMesh.position.copy(L.mesh.position);
      }
    });
    const ease = 1 - Math.exp(-dt / 0.33);   // same glide at 30, 60 or 120 fps
    camera.position.x += (camHome.x + pointer.x * 0.45 - camera.position.x) * ease;
    camera.position.y += (camHome.y + pointer.y * 0.3 - camera.position.y) * ease;
    camera.lookAt(0, 0, 0);
  }

  const rand = (a, b) => a + Math.random() * (b - a);
  let glitchUntil = 0, nextGlitch = performance.now() + 1500, reseedAt = 0;
  function glitchTick(now) {
    if (now > nextGlitch && now > glitchUntil) {
      glitchUntil = now + rand(...CFG.glitchLength);
      nextGlitch = glitchUntil + rand(...CFG.glitchEvery);
    }
    if (now < glitchUntil) {
      if (now > reseedAt) {
        post.uniforms.uSeed.value = Math.random() * 100;
        post.uniforms.uGlitch.value = rand(0.35, 1);
        reseedAt = now + rand(40, 100);
      }
    } else post.uniforms.uGlitch.value = 0;
  }

  let drawn = 0;
  function draw() {
    drawn++;
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
    if (!canvas.classList.contains('on')) canvas.classList.add('on');
  }

  // Nothing to show when a maximized window or the shutdown screen covers the desktop.
  let coveredCheckAt = 0, covered = false;
  function isCovered(now) {
    if (now > coveredCheckAt) {
      covered = !!document.querySelector('.win.max:not([hidden]), .shutdown-screen');
      coveredCheckAt = now + 500;
    }
    return covered;
  }

  let raf = 0, last = 0, paused = false;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    const frameMs = 1000 / (wake >= WAKE_MIN || touchLive ? CFG.fpsActive : CFG.fps);
    if (now - last < frameMs - 1) return;
    const dt = Math.min(0.1, (now - last) / 1000 || 0);
    last = now;
    if (isCovered(now)) return;
    time += dt;
    touchStep(dt);
    animate(time, dt);
    touchTest(now);
    glitchTick(now);
    flowStep(dt);
    draw();
  }
  function play() {
    if (raf || paused || reduceMotion || mqMobile.matches || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); raf = 0; }
  function still() { animate(time); draw(); }

  layout();
  if (flowOn) {   // run the water shader once now: compiling it on the first mouse move would stall that frame
    flowMat.uniforms.tPrev.value = flowRT[0].texture;
    renderer.setRenderTarget(flowRT[1]);
    renderer.render(flowScene, postCam);
    renderer.setRenderTarget(null);
    clearFlow();
  }
  animate(0);
  if (!mqMobile.matches) draw();
  play();

  window.addEventListener('resize', () => { layout(); if (!raf && !mqMobile.matches) still(); });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));
  mqMobile.addEventListener('change', () => { if (mqMobile.matches) stop(); else { layout(); still(); play(); } });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); canvas.remove(); });

  PF.wall3d = {
    cfg: CFG,
    glitch(ms = 400) { const now = performance.now(); glitchUntil = now + ms; reseedAt = 0; if (!raf) { glitchTick(now); still(); } },
    pause() { paused = true; stop(); },
    // where the middle of each ribbon sits on screen (CSS px), for testing touches
    targets: () => { const r = desktop.getBoundingClientRect(); group.updateMatrixWorld(true); return lights.map((L) => { L.strip.pointAt(0.5, vA); L.mesh.localToWorld(vA).project(camera); const st = L.mesh.userData.touch; return { name: L.spec.name, x: Math.round(r.left + ((vA.x + 1) / 2) * r.width), y: Math.round(r.top + ((1 - vA.y) / 2) * r.height), push: +st.off.length().toFixed(3), flutter: +st.flutter.toFixed(3) }; }); },
    state: () => ({ running: !!raf, covered, time: +time.toFixed(2), glitch: post.uniforms.uGlitch.value, size: [canvas.width, canvas.height], flow: flowOn, wake: +wake.toFixed(3), touching: touchLive, drawn }),
    play() { paused = false; play(); },
    // advance one frame by hand (the browser pauses requestAnimationFrame in hidden tabs)
    step(dt = 1 / 60) { time += dt; touchStep(dt); animate(time, dt); touchTest(performance.now()); glitchTick(performance.now()); flowStep(dt); draw(); },
  };
}

/* ---------- helpers ---------- */

// The flat field behind the ribbons: Broadcast Hi in the top-right corner, through Mid, to Deep at the bottom
// left, the way Tonight's features lays its band
function fieldTexture() {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 320;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(c.width * 0.9, -c.height * 0.08, 0, c.width * 0.9, -c.height * 0.08, c.width * 1.15);
  r.addColorStop(0, INK.hi);
  r.addColorStop(0.42, INK.mid);
  r.addColorStop(1, INK.deep);
  g.fillStyle = r;
  g.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// Light, not a surface: added onto whatever is behind it. Along the strip the colour runs from its first to its
// second colour and fades in and out at the ends; across it the light falls off softly to both edges and, for a
// ribbon, is drawn in fine threads. Where the strip turns edge-on it brightens, like folded silk catching light.
function lightMaterial([a, b], gain, threads, falloff, edge) {
  return new THREE.ShaderMaterial({
    uniforms: {
      uA: { value: new THREE.Color(a) },
      uB: { value: new THREE.Color(b) },
      uGain: { value: gain },
      uThreads: { value: threads },
      uFalloff: { value: falloff },
      uEdge: { value: edge },
      uTime: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      varying float vFacing;
      void main() {
        vUv = uv;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vFacing = abs(dot(normalize(normalMatrix * normal), normalize(-mv.xyz)));
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */ `
      uniform vec3 uA, uB;
      uniform float uGain, uThreads, uFalloff, uEdge, uTime;
      varying vec2 vUv;
      varying float vFacing;
      void main() {
        float along = vUv.x, across = vUv.y * 2.0 - 1.0;
        float ends = smoothstep(0.0, 0.22, along) * smoothstep(1.0, 0.72, along);
        float body = exp(-across * across * uFalloff);
        float threads = uThreads > 0.0 ? 0.62 + 0.38 * sin(across * uThreads + along * 9.0 + uTime * 0.3) : 1.0;
        float fold = mix(1.0 + uEdge, 0.8, vFacing);
        vec3 col = mix(uA, uB, smoothstep(0.35, 0.95, along));
        gl_FragColor = vec4(col * (uGain * ends * body * threads * fold), 1.0);
      }`,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
}

// A strip that twists along a curve. Its frame is taken against the screen's depth axis rather than the curve's
// own bend, so the strip never flips where the curve changes direction. update(twist, touch) rolls the twist
// along the strip and, while touch.flutter is above 0, sends a wave out from the brushed spot (touch.at, 0..1).
function makeRibbon(points, segments = 220, width = 1, turns = 0.5) {
  const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'centripetal');
  const centers = curve.getSpacedPoints(segments);
  const tangents = centers.map((_, i) => curve.getTangentAt(i / segments));
  const pos = new Float32Array((segments + 1) * 6);
  const uv = new Float32Array((segments + 1) * 4);
  const index = [];
  for (let i = 0; i <= segments; i++) uv.set([i / segments, 0, i / segments, 1], i * 4);
  for (let i = 0; i < segments; i++) {
    const a = i * 2;
    index.push(a, a + 2, a + 1, a + 1, a + 2, a + 3);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geometry.setIndex(index);
  const Z = new THREE.Vector3(0, 0, 1), n = new THREE.Vector3(), b = new THREE.Vector3(), dir = new THREE.Vector3(), mid = new THREE.Vector3();
  function update(twist, touch) {
    const flutter = touch ? touch.flutter : 0;
    for (let i = 0; i <= segments; i++) {
      const t = i / segments, T = tangents[i];
      n.crossVectors(Z, T).normalize();          // across the strip, in the picture plane
      b.crossVectors(T, n);                      // out of the picture plane
      mid.copy(centers[i]);
      if (flutter > 0) {
        const d = t - touch.at;
        mid.addScaledVector(n, flutter * 0.22 * Math.sin(Math.abs(d) * 40 - touch.wave) * Math.exp(-d * d * 18));
      }
      const th = twist + t * Math.PI * 2 * turns;
      dir.copy(n).multiplyScalar(Math.cos(th)).addScaledVector(b, Math.sin(th));
      const half = (width / 2) * (0.3 + 0.7 * Math.sqrt(Math.sin(Math.PI * t)));
      const k = i * 6;
      pos[k] = mid.x + dir.x * half; pos[k + 1] = mid.y + dir.y * half; pos[k + 2] = mid.z + dir.z * half;
      pos[k + 3] = mid.x - dir.x * half; pos[k + 4] = mid.y - dir.y * half; pos[k + 5] = mid.z - dir.z * half;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.computeVertexNormals();
    geometry.computeBoundingSphere();
  }
  update(0);
  return { geometry, update, pointAt: (t, v) => v.copy(curve.getPointAt(t)) };
}
