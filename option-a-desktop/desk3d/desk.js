/*
  The desk behind "How a project runs": one desk in three.js, and the TV's camera moves along it to a different
  thing for each episode (the brief, the structure, the design, the handoff). Each thing is a station module
  (st1-brief.js .. st4-handoff.js, their contract is in kit.js); this file owns the desk, the lights, the camera
  moves between stations and the picture: rendered at low resolution, then pushed through the wallpaper's ordered
  dither (216-colour web palette), faint scanlines and a glitch burst when the channel changes.

  createDesk(host) puts a canvas in host and returns the controls at once:
    ready          a promise, settled once the desk is built and has drawn its first frame
    go(i)          glide to station i (0..3); with reduced motion it cuts to the station's still
    freeze(i, t)   show station i at its local time t and stop (screenshots, stills)
    move(host)     carry the canvas, built, to a new host; park() takes it off the page until then
    play(), pause(), destroy(), state()
  The desk is built in small steps while the browser is idle (the room, each station, every shader compiled for all
  four stations, every texture uploaded), so building it never holds up scrolling and the first glide to a station
  never stalls on a shader. Until then the canvas stays transparent over whatever the host shows.
  It draws only while host is on screen and the tab is visible, at 30 fps.
*/
import * as THREE from 'three';
import * as k from './kit.js';
import brief from './st1-brief.js';
import structure from './st2-structure.js';
import review from './st3-review.js';
import handoff from './st4-handoff.js';

export const CFG = {
  pixel: 2,             // CSS px per rendered pixel (one dither dot), as the wallpaper
  levels: 6,            // colour levels per channel after dithering (6 = the 216-colour web palette)
  scanlines: 0.06,
  exposure: 1.15,
  fps: 30,
  glide: 1.4,           // s for the camera to travel between stations
  glitch: [180, 320],   // ms of the burst when the channel changes
  cutGlitch: 110,       // ms of the burst a station asks for at a cut
  parallax: [0.10, 0.06], // units the camera leans with the pointer over the screen
  spacing: 4.4,         // units between stations along the desk: far enough that a neighbour stays out of the next shot
};

const BUILDERS = [brief, structure, review, handoff];

export function createDesk(host, opts = {}) {
  const cfg = { ...CFG, ...opts.cfg };
  // read live: Reduce motion switched on mid-visit freezes the desk on its station's still (onReduce)
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const rm = () => opts.reduceMotion ?? mqReduce.matches;

  const canvas = document.createElement('canvas');
  canvas.className = 'desk3d';
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, { position: 'absolute', inset: '0', width: '100%', height: '100%', display: 'block', imageRendering: 'pixelated' });
  host.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: !!opts.preserve });
  renderer.setPixelRatio(1);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFShadowMap;

  const floatTarget = renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');
  const target = new THREE.WebGLRenderTarget(4, 4, { type: floatTarget ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: true, samples: 0 });

  /* ---------- the room ---------- */
  const scene = new THREE.Scene();
  scene.background = fieldTexture();
  scene.fog = new THREE.Fog(new THREE.Color(k.INK.deep), 7, 16);

  scene.environmentIntensity = 0.7;

  const hemi = new THREE.HemisphereLight('#b8c8ff', k.INK.graphite, 0.5);
  scene.add(hemi);
  // the key follows the camera's station, so its shadow map only has to cover one station sharply
  const key = new THREE.DirectionalLight('#fff6ea', 2.7);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);   // plenty for a 340-dot picture of one station
  Object.assign(key.shadow.camera, { left: -2.4, right: 2.4, top: 2.4, bottom: -2.4, near: 0.5, far: 20 });
  key.shadow.bias = -0.0006;
  key.shadow.normalBias = 0.02;
  key.shadow.radius = 3;          // soft-edged shadows, as under a studio softbox
  scene.add(key, key.target);
  // a cool rim from behind, so every silhouette separates from the blue field
  const rim = new THREE.DirectionalLight('#7fb2ff', 1.6);
  scene.add(rim, rim.target);
  const KEY_OFF = new THREE.Vector3(-2.6, 5.2, 3.4), RIM_OFF = new THREE.Vector3(1.5, 2.6, -5);
  const LIGHT = { key: key.intensity, rim: rim.intensity, fill: hemi.intensity };

  const stations = [];     // filled by build() below
  function addStation(build, i) {
    const s = build(k);
    s.x = (i - (BUILDERS.length - 1) / 2) * cfg.spacing;
    s.group.position.x += s.x;
    s.mood = { key: 1, rim: 1, fill: 1, ...s.mood };
    s.cuts = s.cuts || [];
    s.time = 0;
    s.finishing = false;   // left while mid-loop: runs on to the loop's end, then rests at pose(0)
    s.update(0);
    scene.add(s.group);
    stations.push(s);
  }

  /* ---------- camera ---------- */
  const camera = new THREE.PerspectiveCamera(30, 1.7, 0.05, 40);
  const pose = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 30 };
  const shot = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 30 };
  const from = { pos: new THREE.Vector3(), target: new THREE.Vector3(), fov: 30, lx: 0 };
  const lean = new THREE.Vector2(), leanAim = new THREE.Vector2();
  const right = new THREE.Vector3(), up = new THREE.Vector3(), fwd = new THREE.Vector3();
  let active = opts.start ?? 0, gliding = 0;      // gliding: seconds left in the move to the active station
  let lightX = 0;
  const mood = { key: 1, rim: 1, fill: 1 };
  let ready = false, dead = false, wanted = active;   // wanted: the station asked for while still building

  function stationShot(s, t, out) {
    s.camera(t, out);
    out.pos.x += s.x; out.target.x += s.x;
    out.fov = out.fov || 30;
    return out;
  }

  function aim(dt) {
    const s = stations[active];
    stationShot(s, s.time, shot);
    if (gliding > 0) {
      const e = k.easeInOut(1 - gliding / cfg.glide);
      pose.pos.lerpVectors(from.pos, shot.pos, e);
      pose.pos.y += Math.sin(Math.PI * e) * 0.35;          // a small crane up over the desk on the way
      pose.pos.z += Math.sin(Math.PI * e) * 0.6;           // and back a little, so the move reads as travel
      pose.target.lerpVectors(from.target, shot.target, e);
      pose.fov = k.lerp(from.fov, shot.fov, e);
      lightX = k.lerp(from.lx, s.x, e);
    } else {
      pose.pos.copy(shot.pos); pose.target.copy(shot.target); pose.fov = shot.fov;
      lightX = s.x;
    }
    // the pointer leans the camera a little, eased the same at any frame rate
    lean.lerp(leanAim, 1 - Math.exp(-dt / 0.35));
    fwd.subVectors(pose.target, pose.pos).normalize();
    right.crossVectors(fwd, THREE.Object3D.DEFAULT_UP).normalize();
    up.crossVectors(right, fwd);
    camera.position.copy(pose.pos).addScaledVector(right, lean.x * cfg.parallax[0]).addScaledVector(up, lean.y * cfg.parallax[1]);
    camera.lookAt(pose.target);
    if (camera.fov !== pose.fov) { camera.fov = pose.fov; camera.updateProjectionMatrix(); }

    key.position.set(lightX, 0, 0).add(KEY_OFF); key.target.position.set(lightX, 0, 0);
    rim.position.set(lightX, 0, 0).add(RIM_OFF); rim.target.position.set(lightX, 0.4, 0);
    const m = s.mood, ease = gliding > 0 ? 1 - Math.exp(-dt / 0.3) : 1;
    mood.key = k.lerp(mood.key, m.key, ease); mood.rim = k.lerp(mood.rim, m.rim, ease); mood.fill = k.lerp(mood.fill, m.fill, ease);
    key.intensity = LIGHT.key * mood.key; rim.intensity = LIGHT.rim * mood.rim; hemi.intensity = LIGHT.fill * mood.fill;
  }

  /* ---------- post: glitch, dither, scanlines (the wallpaper's, without the water) ---------- */
  const post = new THREE.ShaderMaterial({
    uniforms: {
      tScene: { value: target.texture },
      uRes: { value: new THREE.Vector2(4, 4) },
      uOut: { value: new THREE.Vector2(8, 8) },
      uPixel: { value: cfg.pixel },
      uLevels: { value: cfg.levels },
      uScan: { value: cfg.scanlines },
      uExposure: { value: cfg.exposure },
      uGlitch: { value: 0 },
      uSeed: { value: 0 },
      uRaw: { value: opts.raw ? 1 : 0 },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform sampler2D tScene;
      uniform vec2 uRes, uOut;
      uniform float uPixel, uLevels, uScan, uGlitch, uSeed, uExposure, uRaw;
      varying vec2 vUv;
      float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
      float bayer2(vec2 a) { a = floor(a); return fract(dot(a, vec2(0.5, a.y * 0.75))); }
      float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
      vec3 toSRGB(vec3 c) { c = clamp(c, 0.0, 1.0); return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
      // filmic response (ACES fit): highlights roll off and whites keep their shape instead of clipping flat
      vec3 filmic(vec3 x) { return clamp((x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14), 0.0, 1.0); }
      void main() {
        vec2 dotCell = floor(vUv * uOut / uPixel);
        vec2 uv = (dotCell + 0.5) / uRes;
        float gain = 1.0;
        if (uGlitch > 0.0) {
          vec2 cell = floor(uv * vec2(14.0, 9.0));
          float r = hash12(cell + uSeed);
          if (r < 0.12 * uGlitch) {
            uv.x += (hash12(cell + uSeed + 3.7) - 0.5) * 0.24;
            uv.y += (hash12(cell + uSeed + 9.1) - 0.5) * 0.05;
            if (r < 0.04 * uGlitch) gain = hash12(cell + uSeed + 5.3) < 0.5 ? 0.45 : 1.5;
          }
          float band = floor(uv.y * uRes.y / 3.0);
          float rb = hash12(vec2(band, uSeed + 1.3));
          if (rb < 0.08 * uGlitch) uv.x += rb * 1.4;
          uv = fract(uv);
        }
        float split = uGlitch * 2.0 / uRes.x;
        vec3 col = vec3(texture2D(tScene, uv + vec2(split, 0.0)).r, texture2D(tScene, uv).g, texture2D(tScene, uv - vec2(split, 0.0)).b);
        col = toSRGB(filmic(col * uExposure)) * gain;
        if (uRaw > 0.5) { gl_FragColor = vec4(col, 1.0); return; }
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

  /* ---------- layout ---------- */
  let cssW = 1, cssH = 1;
  function layout() {
    if (!host) return;
    cssW = Math.max(1, host.clientWidth); cssH = Math.max(1, host.clientHeight);
    const w = Math.max(1, Math.round(cssW / cfg.pixel)), h = Math.max(1, Math.round(cssH / cfg.pixel));
    renderer.setSize(w * cfg.pixel, h * cfg.pixel, false);
    target.setSize(w, h);
    post.uniforms.uRes.value.set(w, h);
    post.uniforms.uOut.value.set(w * cfg.pixel, h * cfg.pixel);
    camera.aspect = cssW / cssH;
    camera.updateProjectionMatrix();
  }

  /* ---------- glitch ---------- */
  let glitchUntil = 0, reseedAt = 0;
  const rand = (a, b) => a + Math.random() * (b - a);
  function glitch(ms) { glitchUntil = Math.max(glitchUntil, performance.now() + ms); reseedAt = 0; }
  function glitchTick(now) {
    if (now < glitchUntil) {
      if (now > reseedAt) { post.uniforms.uSeed.value = Math.random() * 100; post.uniforms.uGlitch.value = rand(0.45, 1); reseedAt = now + rand(40, 90); }
    } else post.uniforms.uGlitch.value = 0;
  }

  /* ---------- time ---------- */
  function advance(dt) {
    stations.forEach((s, i) => {
      if (i === active) {
        const was = s.time;
        s.time += dt;
        if (s.time >= s.period) s.time -= s.period;
        // a station's own cuts glitch only once the camera has arrived
        if (gliding <= 0 && !rm()) for (const c of s.cuts) if ((was < c && s.time >= c) || (s.time < was && (c > was || c <= s.time))) glitch(cfg.cutGlitch);
      } else if (s.finishing) {
        s.time += dt;
        if (s.time >= s.period) { s.time = 0; s.finishing = false; }
      } else return;
      s.update(s.time);
    });
    if (gliding > 0) gliding = Math.max(0, gliding - dt);
  }

  function draw() {
    renderer.setRenderTarget(target);
    renderer.render(scene, camera);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
    if (!canvas.classList.contains('on')) canvas.classList.add('on');
    opts.onDraw?.(canvas);
  }

  /* ---------- loop ---------- */
  // Between draws it sleeps on a timer instead of waking every display frame, and while something else lies over the
  // middle of the screen (another window, the Starfield) it holds its frame and only looks again twice a second
  let raf = 0, timer = 0, last = 0, paused = !!opts.paused, onScreen = true, frozen = false, coverAt = 0, covered = false;
  const coveredNow = (now) => {
    if (!host) return true;
    if (now > coverAt) {
      coverAt = now + 500;
      const r = host.getBoundingClientRect(), e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      covered = !e || !host.contains(e);
    }
    return covered;
  };
  const wait = (ms) => { timer = setTimeout(() => { timer = 0; raf = requestAnimationFrame(frame); }, Math.max(0, ms)); };
  // timed on the clock the timer keeps (a frame's own timestamp can trail it by most of a frame), so each wake draws
  function frame() {
    raf = 0;
    const now = performance.now(), gap = 1000 / cfg.fps;
    if (now - last < gap - 8) { wait(last + gap - now - 4); return; }
    const dt = Math.min(0.1, (now - last) / 1000 || 0);
    last = now;
    if (coveredNow(now)) { wait(500); return; }
    advance(dt);
    aim(dt);
    glitchTick(now);
    draw();
    wait(last + gap - performance.now() - 4);
  }
  function play() {
    frozen = false;
    if (!ready || raf || timer || paused || rm() || !onScreen || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); clearTimeout(timer); raf = 0; timer = 0; }

  function go(i, { instant = false } = {}) {
    i = ((i % BUILDERS.length) + BUILDERS.length) % BUILDERS.length;
    if (!ready) { wanted = i; return; }
    if (rm() || instant) return freeze(i, rm() ? stations[i].still : 0, !rm());
    if (i === active && !frozen) return;
    const leaving = stations[active];
    if (leaving !== stations[i] && leaving.time > 0) leaving.finishing = true;
    from.pos.copy(pose.pos); from.target.copy(pose.target); from.fov = pose.fov; from.lx = lightX;
    active = i;
    const s = stations[i];
    s.finishing = false; s.time = 0; s.update(0);
    gliding = cfg.glide;
    glitch(rand(...cfg.glitch));
    if (!raf && !timer) { frozen = false; play(); }
  }

  // show station i at local time t, all at rest, and draw once; resume = keep playing from there
  function freeze(i, t, resume = false) {
    active = i;
    stations.forEach((s, j) => { s.finishing = false; s.time = j === i ? t : 0; s.update(s.time); });
    gliding = 0;
    Object.assign(mood, stations[i].mood);
    post.uniforms.uGlitch.value = 0; glitchUntil = 0;
    lean.set(0, 0);
    aim(1);
    draw();
    if (resume) play(); else { frozen = true; stop(); }
  }

  // a frame in the middle of the glide from station i to station j (e = 0..1 of the way), for checking the moves
  function between(i, j, e) {
    freeze(i, 0);
    from.pos.copy(pose.pos); from.target.copy(pose.target); from.fov = pose.fov; from.lx = lightX;
    active = j;
    const s = stations[j];
    s.time = e * cfg.glide; s.update(s.time);
    gliding = cfg.glide * (1 - e);
    Object.assign(mood, stations[e < 0.5 ? i : j].mood);
    aim(0);
    draw();
  }

  /* ---------- pointer, visibility, size ---------- */
  const onMove = (e) => {
    const r = host.getBoundingClientRect();
    leanAim.set(((e.clientX - r.left) / r.width - 0.5) * 2, -((e.clientY - r.top) / r.height - 0.5) * 2);
  };
  const onLeave = () => leanAim.set(0, 0);
  const onVis = () => (document.hidden ? stop() : play());
  document.addEventListener('visibilitychange', onVis);
  const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; if (onScreen) { if (!frozen) play(); } else stop(); });
  const ro = new ResizeObserver(() => { layout(); if (ready && !raf && !timer) { aim(1); draw(); } });
  // what the desk listens to and watches on its host, taken along when it moves to a new one (move() below)
  function hook() {
    host.addEventListener('pointermove', onMove, { passive: true });
    host.addEventListener('pointerleave', onLeave);
    io.observe(host); ro.observe(host);
  }
  function unhook() {
    if (!host) return;
    host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerleave', onLeave);
    io.unobserve(host); ro.unobserve(host);
  }
  hook();
  const onLost = (e) => { e.preventDefault(); stop(); opts.onLost?.(); };
  canvas.addEventListener('webglcontextlost', onLost);

  /* ---------- building, a step at a time ---------- */
  const idle = () => new Promise((r) => (window.requestIdleCallback ? requestIdleCallback(() => r(), { timeout: 150 }) : setTimeout(r, 30)));
  function textures(root) {
    const found = new Set();
    root.traverse((o) => {
      for (const m of [].concat(o.material || [])) {
        for (const v of Object.values(m)) if (v && v.isTexture && !v.isRenderTargetTexture) found.add(v);
        if (m.uniforms) for (const u of Object.values(m.uniforms)) if (u.value && u.value.isTexture && !u.value.isRenderTargetTexture) found.add(u.value);
      }
    });
    return [...found];
  }
  async function build() {
    await idle(); if (dead) return;
    // a soft environment for anything metal or glossy: a dark studio with a warm softbox overhead
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(envScene(), 0.02).texture;
    pmrem.dispose();
    await idle(); if (dead) return;
    scene.add(buildDesk());
    for (let i = 0; i < BUILDERS.length; i++) { await idle(); if (dead) return; addStation(BUILDERS[i], i); }
    layout();
    // every shader, for all four stations and their hidden parts, compiled for the render target they draw into,
    // one station at a time; with KHR_parallel_shader_compile the GPU compiles them without holding up the page
    renderer.setRenderTarget(target);
    for (const s of stations) { await idle(); if (dead) return; await renderer.compileAsync(s.group, camera, scene); }
    await idle(); if (dead) return;
    await renderer.compileAsync(scene, camera);
    renderer.setRenderTarget(null);
    renderer.compile(postScene, postCam);
    for (const t of textures(scene)) { await idle(); if (dead) return; renderer.initTexture(t); }
    // one unseen pass at each station warms what compile cannot: the shadow maps' own shaders
    for (let i = 0; i < stations.length; i++) {
      await idle(); if (dead) return;
      active = i; stations[i].update(stations[i].still); aim(1);
      renderer.setRenderTarget(target); renderer.render(scene, camera); renderer.setRenderTarget(null);
      stations[i].update(0);
    }
    active = wanted;
    lightX = stations[active].x;
    Object.assign(mood, stations[active].mood);
    ready = true;
    if (rm()) freeze(active, stations[active].still);
    else { stations[active].update(0); aim(1); draw(); play(); }
  }
  const onReduce = () => { if (!ready) return; if (rm()) { stop(); freeze(active, stations[active].still); } else play(); };
  mqReduce.addEventListener('change', onReduce);
  const whenReady = build();

  return {
    ready: whenReady,
    canvas, cfg, stations,
    go, freeze, between,
    glitch: (ms = 300) => glitch(ms),
    play() { paused = false; play(); },
    pause() { paused = true; stop(); },
    setRaw(on) { post.uniforms.uRaw.value = on ? 1 : 0; if (!raf && !timer) draw(); },
    redraw() { aim(0); draw(); },
    state: () => ({ ready, active, parked: !host, time: ready ? +stations[active].time.toFixed(2) : 0, gliding: +gliding.toFixed(2), running: !!(raf || timer), size: [canvas.width, canvas.height], render: [post.uniforms.uRes.value.x, post.uniforms.uRes.value.y], programs: renderer.info.programs.length, calls: renderer.info.render.calls, textures: renderer.info.memory.textures }),
    // Home is built again on a language switch and on a reopen: the desk moves to the new screen with all it has
    // built, so the page keeps one WebGL context however often Home is rebuilt (episode.js)
    move(to) {
      if (dead || to === host) return;
      unhook();
      host = to;
      host.prepend(canvas);
      hook();
      layout();
      if (ready && !raf && !timer) { aim(1); draw(); }
    },
    // the screen went with its Home: the desk stops and leaves the page, keeping nothing of the old Home
    park() {
      if (dead || !host) return;
      stop(); unhook();
      canvas.remove();
      host = null; onScreen = false;
    },
    destroy() {
      dead = true;
      stop(); io.disconnect(); ro.disconnect(); unhook();
      document.removeEventListener('visibilitychange', onVis);
      mqReduce.removeEventListener('change', onReduce);
      // dispose() alone keeps the context: three.js's shared DFG texture (getDFGLUT) holds every renderer that used it,
      // so the GPU copies go, then the context, without telling episode.js the desk was lost
      canvas.removeEventListener('webglcontextlost', onLost);
      for (const t of textures(scene)) t.dispose();
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); for (const m of [].concat(o.material || [])) m.dispose(); });
      scene.background?.dispose?.();
      scene.environment?.dispose?.();
      quad.geometry.dispose(); post.dispose(); target.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      host = null;
    },
  };
}

/* ---------- helpers ---------- */

// the field behind the desk: Broadcast Mid high up, into Deep near the desk
function fieldTexture() {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const g = c.getContext('2d');
  const r = g.createLinearGradient(0, 0, 0, c.height);
  // held darker than the wallpaper's (Mid at the top, not Hi), so the room stays behind the neutral objects
  r.addColorStop(0, k.INK.mid);
  r.addColorStop(0.5, k.INK.deep);
  r.addColorStop(1, k.INK.deep);
  g.fillStyle = r;
  g.fillRect(0, 0, c.width, c.height);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

// what metal and glass reflect: a dark studio (graphite into Broadcast Deep) with a large softbox above and to the
// left (the key), a tall strip to the right, and a thin blue strip behind (the rim)
function envScene() {
  const s = new THREE.Scene();
  const c = document.createElement('canvas');
  c.width = 16; c.height = 128;
  const g = c.getContext('2d'), r = g.createLinearGradient(0, 0, 0, c.height);
  r.addColorStop(0, k.INK.graphite); r.addColorStop(0.55, k.INK.deep); r.addColorStop(1, k.INK.ink);
  g.fillStyle = r; g.fillRect(0, 0, c.width, c.height);
  const room = new THREE.CanvasTexture(c);
  room.colorSpace = THREE.SRGBColorSpace;
  s.add(new THREE.Mesh(new THREE.SphereGeometry(10, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: room })));
  const panel = (w, h, color, gain, pos) => {
    const p = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(gain), side: THREE.DoubleSide }));
    p.position.set(...pos); p.lookAt(0, 0, 0); s.add(p);
  };
  panel(7, 4, '#fff4e2', 4, [-2.5, 7, 3.5]);
  panel(1.2, 6, '#ffffff', 2.2, [6.5, 2.5, 1]);
  panel(9, 0.6, k.INK.blue, 2, [2, 2.5, -6.5]);
  return s;
}

// the desk: a long top in dark graphite felt, with a rounded front edge
function buildDesk() {
  const g = new THREE.Group();
  const felt = k.surfaces.felt();
  felt.repeat.set(12, 3);
  // the grain goes into bump only: as a roughness map its mid grey would halve the roughness and the felt would
  // catch the rim light as a pale blue glare
  const m = new THREE.MeshStandardMaterial({ color: k.INK.graphite, roughness: 0.95, bumpMap: felt, bumpScale: 0.003 });
  m.envMapIntensity = 0.35;
  const top = k.mesh(k.roundBox(24, 0.3, 5.2, 0.08, 3), m, { y: -0.15, z: -0.3 });
  top.castShadow = false;
  g.add(top);
  return g;
}
