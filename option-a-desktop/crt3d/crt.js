/*
  The loading screen's computer (boot.js): the beige PC modelled in Blender (crt.glb and scene.json, written by
  prototype/loader-crt/blender/web.py) in a dark room, drawn the way desk3d draws: rendered at 2px dots, then pushed
  through the wallpaper's 4 by 4 ordered dither to the 216-colour web palette with faint scanlines.
  The CRT's picture is not in here: it is boot.js's HTML, laid on the glass. Every drawn frame reports where the
  glass is (onFrame), so the HTML moves with the picture.

  createCrt(host, { onFrame, phone }) puts a canvas in host and returns at once:
    ready       settles once the model is in, every shader compiled and the first frame drawn (rejects on failure)
    corners()   the glass as four points in host CSS pixels: top left, top right, bottom right, bottom left
    lean(t)     the camera's slow push while the portfolio loads: t seconds since the screen appeared
    tube(state) the light the tube throws on the room: 'test' (the self-test's grey) or 'blue' (XP's welcome)
    fly(ms)     the flight into the glass; resolves when the glass fills the frame
    still(name, raw) draw one pose (the stills the loader shows before the 3D is up, see tools/poster.mjs); raw: without
                the lines and the dither, which boot.js adds to the still at the page's own dots
    destroy()
  The framing follows the stills: at any window shape the picture is the still's picture as CSS object-fit: cover
  would crop it, so the canvas can take over from the still without a jump.
*/
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

const HERE = new URL('.', import.meta.url);
const DRACO = 'https://cdn.jsdelivr.net/npm/three@0.186.0/examples/jsm/libs/draco/gltf/';

export const CFG = {
  pixel: 2,          // CSS px per dot, as the wallpaper and desk3d
  levels: 6,         // six levels a channel: the 216-colour web palette
  scanlines: 0.06,
  exposure: 1.15,
  push: 9,           // s: the loading push's time constant (it eases toward the closer pose and never quite gets there)
  fly: 1500,         // ms into the glass
};

export async function loadScene() {
  const res = await fetch(new URL('scene.json?v=1', HERE));
  if (!res.ok) throw new Error('scene.json ' + res.status);
  return res.json();
}

export function createCrt(host, opts = {}) {
  const cfg = { ...CFG, ...opts.cfg };
  const canvas = document.createElement('canvas');
  canvas.className = 'boot-3d';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: !!opts.preserve });
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;
  const half = renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');
  // four samples a dot: the vents, the grille and the keys would crawl as the camera moves without them
  const target = new THREE.WebGLRenderTarget(4, 4, { type: half ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: true, samples: 4 });

  const scene = new THREE.Scene();
  scene.background = roomTexture();
  const camera = new THREE.PerspectiveCamera(30, 1.6, 0.02, 20);
  let info = null, posterAspect = 1.6, dead = false, raf = 0;

  /* ---------- light: a warm key above left, a cool rim from behind, a dim fill, and the tube itself ---------- */
  scene.add(new THREE.HemisphereLight('#8c8a84', '#141414', 0.3));
  const key = new THREE.DirectionalLight('#fff6ea', 3.1);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  Object.assign(key.shadow.camera, { left: -0.75, right: 0.75, top: 0.75, bottom: -0.75, near: 0.5, far: 5 });
  key.shadow.bias = -0.0004;
  key.shadow.normalBias = 0.01;
  key.shadow.radius = 4;
  const rim = new THREE.DirectionalLight('#a6c4f7', 1.1);
  const fill = new THREE.DirectionalLight('#d8d2bd', 0.25);
  scene.add(key, key.target, rim, rim.target, fill, fill.target);
  // the tube's own light: a wide spot on the glass, thrown into the room (no shadows: it is a glow, not a lamp)
  const tubeLight = new THREE.SpotLight('#9aa29a', 0.35, 1.6, Math.PI * 0.42, 0.9, 1.4);
  scene.add(tubeLight, tubeLight.target);

  /* ---------- the desk: near-black felt that thins out to nothing past half a metre ---------- */
  const desk = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshStandardMaterial({ color: '#141414', roughness: 0.92, transparent: true, alphaMap: fadeTexture(), depthWrite: false }));
  desk.rotation.x = -Math.PI / 2;
  desk.position.set(0, 0, 0.1);
  desk.receiveShadow = true;
  scene.add(desk);

  /* ---------- post: desk3d's dither ---------- */
  const post = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: target.texture }, uRes: { value: new THREE.Vector2(4, 4) }, uOut: { value: new THREE.Vector2(8, 8) },
      uPixel: { value: cfg.pixel }, uLevels: { value: cfg.levels }, uScan: { value: cfg.scanlines }, uExposure: { value: cfg.exposure },
      uRaw: { value: 0 },
    },
    vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: /* glsl */ `
      uniform sampler2D tScene;
      uniform vec2 uRes, uOut;
      uniform float uPixel, uLevels, uScan, uExposure, uRaw;
      varying vec2 vUv;
      float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
      float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
      vec3 toSRGB(vec3 c) { c = clamp(c, 0.0, 1.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
      vec3 filmic(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
      void main() {
        vec2 dotCell = floor(vUv * uOut / uPixel);
        vec3 col = toSRGB(filmic(texture2D(tScene, (dotCell + 0.5) / uRes).rgb * uExposure));
        // raw: the picture before its lines and its dither, for the stills (boot.js dithers them itself, at the page's own dots)
        if (uRaw > 0.5) { gl_FragColor = vec4(col, 1.0); return; }
        col *= 1.0 - uScan * mod(dotCell.y, 2.0);
        float steps = uLevels - 1.0;
        gl_FragColor = vec4(floor(col * steps + bayer4(dotCell) + 0.03125) / steps, 1.0);
      }`,
    depthTest: false, depthWrite: false,
  });
  const postScene = new THREE.Scene();
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post);
  quad.frustumCulled = false;
  postScene.add(quad);
  const postCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  /* ---------- size ---------- */
  let cssW = 1, cssH = 1;
  function layout() {
    cssW = Math.max(1, host.clientWidth); cssH = Math.max(1, host.clientHeight);
    const w = Math.max(1, Math.round(cssW / cfg.pixel)), h = Math.max(1, Math.round(cssH / cfg.pixel));
    renderer.setSize(w * cfg.pixel, h * cfg.pixel, false);
    canvas.style.width = '100%'; canvas.style.height = '100%';
    target.setSize(w, h);
    post.uniforms.uRes.value.set(w, h);
    post.uniforms.uOut.value.set(w * cfg.pixel, h * cfg.pixel);
  }

  /* ---------- camera ---------- */
  const pose = { pos: new THREE.Vector3(), at: new THREE.Vector3(), hfov: 35 };
  const P = (p) => ({ pos: new THREE.Vector3(...p.pos), at: new THREE.Vector3(...p.at), hfov: p.hfov });
  let poses = null;
  // the still's framing at any aspect: its width when the window is wider than the still, its height when taller
  function aim() {
    const aspect = cssW / cssH, h = THREE.MathUtils.degToRad(pose.hfov);
    const v = aspect >= posterAspect ? 2 * Math.atan(Math.tan(h / 2) / aspect) : 2 * Math.atan(Math.tan(h / 2) / posterAspect);
    camera.aspect = aspect;
    camera.fov = THREE.MathUtils.radToDeg(v);
    camera.position.copy(pose.pos);
    camera.lookAt(pose.at);
    camera.updateProjectionMatrix();
  }
  const setPose = (p) => { pose.pos.copy(p.pos); pose.at.copy(p.at); pose.hfov = p.hfov; };
  const mix = (a, b, u) => ({ pos: a.pos.clone().lerp(b.pos, u), at: a.at.clone().lerp(b.at, u), hfov: a.hfov + (b.hfov - a.hfov) * u });
  function catmull(ps, s) {
    const i = Math.min(Math.floor(s), ps.length - 2), x = s - i;
    const p0 = ps[Math.max(i - 1, 0)], p1 = ps[i], p2 = ps[i + 1], p3 = ps[Math.min(i + 2, ps.length - 1)];
    return p1.clone().multiplyScalar(2)
      .add(p2.clone().sub(p0).multiplyScalar(x))
      .add(p0.clone().multiplyScalar(2).sub(p1.clone().multiplyScalar(5)).add(p2.clone().multiplyScalar(4)).sub(p3).multiplyScalar(x * x))
      .add(p1.clone().multiplyScalar(3).sub(p0).sub(p2.clone().multiplyScalar(3)).add(p3).multiplyScalar(x * x * x))
      .multiplyScalar(0.5);
  }
  const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2);

  /* ---------- the glass, projected ---------- */
  let glass = [];
  const v3 = new THREE.Vector3();
  function corners() {
    return glass.map((c) => {
      v3.copy(c).project(camera);
      return [(v3.x + 1) / 2 * cssW, (1 - v3.y) / 2 * cssH];
    });
  }

  function draw() {
    aim();
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
    opts.onFrame?.(corners());
  }

  /* ---------- build ---------- */
  const idle = () => new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 120 }) : setTimeout(r, 16)));
  async function build() {
    info = opts.scene || await loadScene();
    if (dead) throw new Error('destroyed');
    posterAspect = opts.phone ? info.phoneAspect || 0.4615 : info.posterAspect || 1.6;
    poses = Object.fromEntries(Object.entries(info.poses).map(([k, p]) => [k, P(p)]));
    glass = info.screen.corners.map((c) => new THREE.Vector3(...c));
    // the tube's light sits on the glass and faces the room
    const [tl, , br] = glass;
    tubeLight.position.set((tl.x + br.x) / 2, (tl.y + br.y) / 2, tl.z + 0.01);
    tubeLight.target.position.set(tubeLight.position.x, tubeLight.position.y - 0.35, tubeLight.position.z + 1);
    // lights where Blender had them, aimed at the computer
    const L = info.lights;
    key.position.set(...L.key.pos); key.target.position.set(0, 0.2, 0.15);
    rim.position.set(...L.rim.pos); rim.target.position.set(0, 0.3, 0);
    fill.position.set(...L.fill.pos); fill.target.position.set(0, 0.25, 0.2);

    const draco = new DRACOLoader().setDecoderPath(DRACO);
    const gltf = await new GLTFLoader().setDRACOLoader(draco).loadAsync(new URL('crt.glb?v=1', HERE).href);
    draco.dispose();
    if (dead) throw new Error('destroyed');
    await idle();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(studio(), 0.02).texture;
    scene.environmentIntensity = 0.55;
    pmrem.dispose();
    gltf.scene.traverse((o) => {
      if (!o.isMesh) return;
      o.castShadow = o.receiveShadow = true;
      const m = o.material;
      if (o.name === 'screen' || m.name === 'screen') {
        // black glass: the HTML screen lies on it; only its rim shows, catching the room
        o.material = new THREE.MeshStandardMaterial({ color: '#050506', roughness: 0.08, metalness: 0.1, envMapIntensity: 1.2 });
        o.castShadow = false;
      }
    });
    scene.add(gltf.scene);
    layout();
    setPose(opts.phone ? poses.phone : poses.p1);
    aim();
    // every shader compiled against the target it draws into, then one unseen pass for the shadow map's own
    renderer.setRenderTarget(target);
    await renderer.compileAsync(scene, camera);
    renderer.setRenderTarget(null);
    renderer.compile(postScene, postCam);
    await idle();
    if (dead) throw new Error('destroyed');
    draw();
    return true;
  }
  const ready = build();

  const ro = new ResizeObserver(() => { layout(); if (poses) draw(); });
  ro.observe(host);

  /* ---------- motion ---------- */
  function lean(t) {
    if (!poses || opts.phone) return;
    setPose(mix(poses.p1, poses.p3, 1 - Math.exp(-t / cfg.push)));
    draw();
  }
  function tube(state) {
    const blue = state === 'blue';
    tubeLight.color.set(blue ? '#5a7edc' : '#9aa29a');
    tubeLight.intensity = blue ? 2.6 : 0.35;
    if (poses) draw();
  }
  function fly(ms = cfg.fly) {
    if (!poses) return Promise.resolve();
    const start = { pos: pose.pos.clone(), at: pose.at.clone(), hfov: pose.hfov };
    const keys = [start, poses.p4, poses.p5, poses.p6];
    const t0 = performance.now();
    return new Promise((res) => {
      const step = (now) => {
        if (dead) return res();
        // a frame's timestamp can be a little before the call: the way is clamped to 0..1
        const e = easeInOut(Math.max(0, Math.min(1, (now - t0) / ms))), s = e * (keys.length - 1);
        pose.pos.copy(catmull(keys.map((k) => k.pos), s));
        pose.at.copy(catmull(keys.map((k) => k.at), s));
        const i = Math.min(Math.floor(s), keys.length - 2);
        pose.hfov = keys[i].hfov + (keys[i + 1].hfov - keys[i].hfov) * (s - i);
        draw();
        if (e < 1) raf = requestAnimationFrame(step); else res();
      };
      raf = requestAnimationFrame(step);
    });
  }
  function still(name, raw = false) {
    post.uniforms.uRaw.value = raw ? 1 : 0;
    setPose(poses[name]);
    draw();
  }

  return {
    ready, canvas, corners, lean, tube, fly, still,
    redraw: () => { if (poses) draw(); },
    state: () => ({ programs: renderer.info.programs?.length, calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, size: [canvas.width, canvas.height] }),
    destroy() {
      dead = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
        for (const m of [].concat(o.material || [])) { for (const v of Object.values(m)) if (v && v.isTexture) v.dispose(); m.dispose(); }
      });
      scene.background?.dispose?.();
      scene.environment?.dispose?.();
      target.dispose(); post.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
    },
  };
}

/* ---------- helpers ---------- */

// the room the camera sees: near-black, a little lighter behind the monitor (as Blender's room: a round lift
// centred 64% up the frame, gone by 85% of the way out)
function roomTexture() {
  const c = document.createElement('canvas');
  c.width = 160; c.height = 100;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(80, 36, 0, 80, 36, 136);
  r.addColorStop(0, '#34363c');
  r.addColorStop(1, '#101013');
  g.fillStyle = r;
  g.fillRect(0, 0, c.width, c.height);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

// the desk's edge: opaque under the computer, thinning out between half a metre and a metre and a half
function fadeTexture() {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const g = c.getContext('2d');
  const r = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  r.addColorStop(0, '#fff');
  r.addColorStop(0.55 / 2, '#fff');
  r.addColorStop(1.5 / 2, '#000');
  r.addColorStop(1, '#000');
  g.fillStyle = r;
  g.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}

// what the plastic and glass reflect: a dark studio with a warm softbox above left (the key) and a cool strip behind
function studio() {
  const s = new THREE.Scene();
  s.add(new THREE.Mesh(new THREE.SphereGeometry(10, 24, 12), new THREE.MeshBasicMaterial({ side: THREE.BackSide, color: new THREE.Color('#141416') })));
  const panel = (w, h, color, gain, pos) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(gain), side: THREE.DoubleSide }));
    p.position.set(...pos); p.lookAt(0, 0, 0); s.add(p);
  };
  panel(6, 4, '#fff4e2', 3, [-2.5, 6, 3]);
  panel(1.2, 5, '#a6c4f7', 1.2, [5, 2, -4]);
  return s;
}
