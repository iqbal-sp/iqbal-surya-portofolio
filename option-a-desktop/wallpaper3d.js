/*
  Live wallpaper for Option A: Phosphor OS's own, the Phosphor Signal. A CRT's power-on line, held: on the
  Broadcast blue field (Hi in the top-right corner, through Mid, to Deep) a phosphor-green trace runs flat out of
  the calm left, where the icons sit, and wakes into a swell on the right, over an oscilloscope's faint graticule
  with its middle axis ticked. The trace keeps its afterglow a beat behind it, as phosphor does, and its waves
  crawl slowly along it. Drawn as one picture in a shader (no geometry) at low resolution, then pushed through an
  ordered dither (web-safe style palette), faint scanlines and the odd glitch burst.
  Moving the mouse over the wallpaper drags a small water wake through it: a low-res flow field (splat,
  self-advect, blur, decay) sweeps the dither dots along and bends the picture a little, then settles. Crossing
  the trace plucks it like a string: a kink rises where the pointer crossed, in the way it was moving, and runs
  out both ways along the line as it dies away, with a small ripple through the dots, and sounds a soft string note
  (PF.sfx.pluck, higher further right).
  While Winamp plays a song through its analyser (PF.winamp.loudness: a file, not a YouTube video) the trace listens:
  the bass swells the main wave and brightens it, the treble lifts the fine wave, the overall level wakes the flat
  line further left and quickens the crawl. Every one of these is eased (a quick rise, a slow fall), so the line
  breathes with the music rather than jittering to it, and settles back the same way when the music stops. A song
  the page can't hear (a YouTube video: its sound stays in YouTube's frame) gets a slow even breath instead, smaller
  than a heard song's, so the line still shows that music is on without pretending to follow it.
  The loading screen hands the trace over as the tube's power-on line (boot.js): it calls flatten() before the
  desktop shows, so the trace lies flat where that line lands, and rise(ms) once the line has gone, so the swell wakes
  out of it on the right, eased in and out.
  Hover only, no clicks. It renders at display rate only while the water or a pluck is still moving, 30 fps
  otherwise.

  A still of this scene at 10s (asset/wallpaper-phosphor*.webp, one per window shape, picked by style.css; made by
  tools/wallpaper-still) stays on .desktop underneath and remains the wallpaper whenever this can't run: no WebGL,
  CDN blocked, phones (windows cover the desktop there), or ?wall=static. With prefers-reduced-motion it renders one
  still frame and never animates or glitches.
  three.js (about 190 KB) is fetched only where the wallpaper is drawn, so a phone never downloads it; a
  screen that leaves phone mode (a window widened past 720px) fetches it then.

  Tuning lives in CFG; the trace's shape lives in TRACE, once for the shader and once for the pointer (traceAt).
  Console helpers: PF.wall3d.glitch(ms), .pause(), .play(), .step(dt), .state(), .targets().
*/
let THREE = null;

const CFG = {
  pixel: 2,                     // CSS px per rendered pixel (the size of one dither dot)
  levels: 6,                    // colour levels per channel after dithering (6 = the 216-colour web palette)
  scanlines: 0.06,              // darkening of every other row
  exposure: 1.0,
  fps: 30,                      // idle frame rate
  fpsActive: 120,               // while the water wake or a pluck moves (the display caps it: 60 or 120)
  glitchEvery: [3500, 9000],    // ms between glitch bursts
  glitchLength: [140, 420],     // ms per burst
  crawl: 0.35,                  // rad/s the trace's waves travel along it
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
  pluck: {
    reach: 16,                  // CSS px from the trace a moving pointer plucks it
    lift: [0.03, 0.075],        // height of the kink (share of the screen's height), a gentle cross to a quick one
    run: 0.32,                  // screen widths a second the two halves of the kink run apart
    width: 0.045,               // the kink's half-width, in screen widths
    ring: 70,                   // its ripples across that width
    life: 1.7,                  // s for a pluck to die to about a third
    ripple: 0.45,               // strength of the ring of water around the pluck
    cooldown: 220,              // ms before the pointer can pluck again
  },
  music: {
    rise: 0.08,                 // s for the line to take up a louder moment
    fall: 0.5,                  // s for it to let a quieter one go
    swell: 0.6,                 // the main wave grows by up to this share with the bass
    fine: 0.8,                  // the fine wave by up to this share with the treble
    reach: 0.15,                // screen widths further left the swell wakes at full level
    spread: 0.4,                // and how much wider its bunch grows
    glow: 0.35,                 // the trace brightens by up to this share with the bass
    speed: 0.8,                 // the crawl quickens by up to this share at full level
    // a song Winamp plays but the page can't hear (YouTube): one breath every `every` s, the swell between its two
    // levels, the rest held low (each as a share of full, like a heard song's)
    breath: { every: 2.6, swell: [0.18, 0.38], fine: 0.12, reach: 0.4, glow: [0, 0.2] },
  },
};
// the music's hold on the trace, each 0..1 and eased: bass swell, treble fine wave, overall reach, bass glow
const MUSIC = { swell: 0, fine: 0, reach: 0, glow: 0 };
// how far the swell has woken out of the flat power-on line, 0..1 (1 but for the moments after the loading screen)
let RISEN = 1;

// DESIGN.md colours: Broadcast Deep, Mid and Hi for the field, Broadcast Soft for the graticule, Phosphor OS's
// green (--ph) for the trace and its pale core
const INK = { deep: '#04163f', mid: '#0d3a8f', hi: '#1d56b8', soft: '#d6e2f8', ph: '#4cda50', core: '#d9ffd6' };

// The trace, in picture units: y 0..1 top down, and x as across a 16:10 screen (0..1), measured from the right edge
// by the screen's height, so a wider screen adds flat line on the left and a narrower one crops it, and the still
// on .desktop (anchored right, scaled by its height) always lines up. It rests at y, flat out of the left, and from
// wake on its swell rises (an envelope eased in to full by full), a main wave bunched about peak plus a fine one
const TRACE = { y: 0.62, wake: 0.3, full: 0.92, main: [0.085, 22, 0.8, 0.16], fine: [0.018, 57], on: [0.1, 0.24] };
const REF = 1.6;               // the aspect the picture units are laid out at
const toPic = (x, aspect) => 1 + ((x - 1) * aspect) / REF;   // screen x (0..1) to picture x
const PLUCKS = 4;              // plucks running at once

const PF = (window.PF = window.PF || {});
const desktop = document.getElementById('desktop');
// phone mode, as style.css's SMALL SCREENS asks it
const mqMobile = window.matchMedia('(max-width: 720px), (max-height: 500px) and (pointer: coarse)');
// read live, so Reduce motion switched on mid-visit stills the wallpaper at once
const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
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

const ease = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
// the trace's height at x (screen units) for a crawl phase and the plucks running, as the shader draws it
function traceAt(x, phase, plucks) {
  const [a0, k, peak, s0] = TRACE.main, [fa0, fk] = TRACE.fine, M = CFG.music;
  const a = a0 * (1 + MUSIC.swell * M.swell), fa = fa0 * (1 + MUSIC.fine * M.fine), spread = s0 * (1 + MUSIC.reach * M.spread);
  const env = RISEN * Math.pow(ease(TRACE.wake - MUSIC.reach * M.reach, TRACE.full, x), 1.6);
  let y = TRACE.y + env * (a * Math.sin(x * k - phase) * Math.exp(-(((x - peak) / spread) ** 2)) + fa * Math.sin(x * fk - phase * 2));
  for (const p of plucks) y -= pluckAt(x, p);
  return y;
}
// a pluck's lift at x: two halves of a kink running apart and dying away (p: x, age s, lift; 0 lift = none)
function pluckAt(x, p) {
  if (!p.lift) return 0;
  const P = CFG.pluck, fade = Math.exp(-p.age / P.life);
  let s = 0;
  for (const dir of [-1, 1]) { const d = x - p.x - dir * P.run * p.age; s += 0.5 * Math.exp(-((d / P.width) ** 2)) * Math.cos(d * P.ring); }
  return p.lift * fade * s;
}

function start() {
  const canvas = document.createElement('canvas');
  canvas.className = 'wall3d';
  canvas.setAttribute('aria-hidden', 'true');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(1);
  desktop.prepend(canvas);

  const floatTarget = renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float');
  const target = new THREE.WebGLRenderTarget(4, 4, { type: floatTarget ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: false });

  /* ---------- scene: the signal, drawn whole in one pass ---------- */
  const lin = (hex) => new THREE.Color(hex);   // three keeps colours linear, so a hex comes in already converted
  const plucks = Array.from({ length: PLUCKS }, () => ({ x: 0, age: 0, lift: 0 }));
  const signal = new THREE.ShaderMaterial({
    uniforms: {
      uRes: { value: new THREE.Vector2(4, 4) },
      uPhase: { value: 0 },
      uPluck: { value: plucks.map(() => new THREE.Vector3()) },
      uMusic: { value: new THREE.Vector4() },
      uRisen: { value: 1 },
      uDeep: { value: lin(INK.deep) }, uMid: { value: lin(INK.mid) }, uHi: { value: lin(INK.hi) },
      uSoft: { value: lin(INK.soft) }, uPh: { value: lin(INK.ph) }, uCore: { value: lin(INK.core) },
    },
    defines: { PLUCKS },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }`,
    fragmentShader: /* glsl */ `
      uniform vec2 uRes;
      uniform float uPhase;
      uniform vec3 uPluck[PLUCKS];      // x, age (s), lift
      uniform vec4 uMusic;              // MUSIC scaled by CFG.music: main wave gain, fine wave gain, wake shift, glow
      uniform float uRisen;             // RISEN: the swell out of the power-on line
      uniform vec3 uDeep, uMid, uHi, uSoft, uPh, uCore;
      varying vec2 vUv;
      const float RUN = ${CFG.pluck.run.toFixed(4)}, WID = ${CFG.pluck.width.toFixed(4)}, RING = ${CFG.pluck.ring.toFixed(2)}, LIFE = ${CFG.pluck.life.toFixed(3)};

      float pluck(float x, vec3 p) {
        if (p.z == 0.0) return 0.0;
        float s = 0.0;
        for (int i = 0; i < 2; i++) {
          float d = x - p.x - (float(i) * 2.0 - 1.0) * RUN * p.y;
          s += 0.5 * exp(-(d / WID) * (d / WID)) * cos(d * RING);
        }
        return p.z * exp(-p.y / LIFE) * s;
      }
      // the trace's height at x for the crawl phase ph (screen units, y down), as traceAt() in the script
      float trace(float x, float ph) {
        float env = uRisen * pow(smoothstep(${TRACE.wake.toFixed(3)} - uMusic.z, ${TRACE.full.toFixed(3)}, x), 1.6);
        float d = x - ${TRACE.main[2].toFixed(3)}, sp = ${TRACE.main[3].toFixed(4)} * (1.0 + uMusic.z / ${CFG.music.reach.toFixed(4)} * ${CFG.music.spread.toFixed(4)});
        float y = ${TRACE.y.toFixed(3)} + env * (${TRACE.main[0].toFixed(4)} * (1.0 + uMusic.x) * sin(x * ${TRACE.main[1].toFixed(2)} - ph) * exp(-d * d / (sp * sp))
                  + ${TRACE.fine[0].toFixed(4)} * (1.0 + uMusic.y) * sin(x * ${TRACE.fine[1].toFixed(2)} - ph * 2.0));
        for (int i = 0; i < PLUCKS; i++) y -= pluck(x, uPluck[i]);
        return y;
      }
      // the light of a trace at this dot: a sharp line, a soft glow and a wide halo, by the distance across it in dots
      // x in picture units; e is one dot of the screen in those units, so the slope comes out in dots per dot
      float light(float x, float y, float ph) {
        float e = (uRes.x / uRes.y) / ${REF.toFixed(2)} / uRes.x;
        float t = trace(x, ph), slope = (trace(x + e, ph) - trace(x - e, ph)) * 0.5 * uRes.y;
        float d = abs(y - t) * uRes.y / sqrt(1.0 + slope * slope);
        return exp(-d * d) * 1.3 + exp(-d * d / 49.0) * 0.28 + exp(-d * d / 1156.0) * 0.08;
      }

      void main() {
        float asp = uRes.x / uRes.y, y = 1.0 - vUv.y;
        float x = 1.0 + (vUv.x - 1.0) * asp / ${REF.toFixed(2)};   // picture units, from the right edge by the height
        // the field: Hi in the top-right corner, through Mid, to Deep
        float r = length(vec2((vUv.x - 1.0) * asp, y));
        vec3 col = mix(uMid, uDeep, smoothstep(0.2, 1.6, r));
        col = mix(col, uHi, exp(-r * 2.2) * 0.55);
        // the graticule: square divisions an eighth of the height, one dot wide, its middle axis ticked in fortieths,
        // fading out to the left and at the foot
        vec2 g = vec2((vUv.x - 1.0) * asp * 8.0, y * 8.0), dg = (0.5 - abs(fract(g) - 0.5)) * (uRes.y / 8.0);
        float grid = step(dg.x, 0.5) + step(dg.y, 0.5);
        float tick = step(abs(y - ${TRACE.y.toFixed(3)}) * uRes.y, 1.5) * step(fract((vUv.x - 1.0) * asp * 40.0), 0.18);
        col += uSoft * (0.035 * min(grid, 1.0) + 0.06 * tick) * smoothstep(0.35, 0.7, x) * (1.0 - smoothstep(0.85, 1.0, y));
        // the trace with its afterglow a beat behind, drawn in only once clear of the icons
        float on = smoothstep(${TRACE.on[0]}, ${TRACE.on[1]}, x);
        float now = light(x, y, uPhase), was = light(x, y, uPhase - 0.9);
        col += uPh * (now + 0.22 * was) * on * (1.0 + uMusic.w);
        float t = trace(x, uPhase), dc = abs(y - t) * uRes.y;
        col += uCore * exp(-dc * dc / 0.36) * 0.5 * smoothstep(0.35, 0.85, x) * on;
        gl_FragColor = vec4(col, 1.0);
      }`,
    depthTest: false,
    depthWrite: false,
  });
  const scene = new THREE.Scene();
  const sigQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), signal);
  sigQuad.frustumCulled = false;
  scene.add(sigQuad);

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
  const flowOn = floatTarget && !mqReduce.matches;
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
    target.setSize(w, h);                                   // the picture itself stays at dot resolution
    signal.uniforms.uRes.value.set(w, h);
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
  }

  /* ---------- motion ---------- */
  // Wake input, in desktop UV (0..1, y up). Only the bare wallpaper reacts: not windows, menus or the taskbar.
  const cursorAim = new THREE.Vector2(), cursor = new THREE.Vector2(), cursorWas = new THREE.Vector2(), cursorVel = new THREE.Vector2();
  // wake: 1 while the cursor stirs the water, easing to 0; below WAKE_MIN the shift is under a fifth of a pixel, so the field is cleared
  const WAKE_MIN = 0.03;
  let overWall = false, wake = 0, flowIdle = true;
  const ptrVel = new THREE.Vector2(), ptrStep = new THREE.Vector2();   // raw cursor velocity (uv/s), for plucks
  let ptrAt = 0, pointerMoved = false;
  window.addEventListener('pointermove', (e) => {
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
    if (overWall) side.was = side.now;
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

  /* ---------- plucks ---------- */
  const ripple = { u: 0, v: 0, amount: 0, age: 1 };
  // which side of the trace the pointer is on (1 above, -1 below, 0 out of reach), now and at the last move
  const side = { now: 0, was: 0 };
  let phase = 0, coolUntil = 0, plucking = false;

  // A moving pointer plucks the trace where it crosses it, or brushes within reach of it: the kink rises the way the
  // pointer was going, higher for a quicker cross. A pointer resting on the line leaves it alone.
  function pluckTest(now) {
    if (!overWall) { side.now = side.was = 0; pointerMoved = false; return; }
    if (!pointerMoved) return;
    pointerMoved = false;
    const h = desktop.clientHeight || 1, x = toPic(cursorAim.x, (desktop.clientWidth || 1) / h), y = 1 - cursorAim.y;
    const t = traceAt(x, phase, plucks), off = (y - t) * h;
    const on = ease(TRACE.on[0], TRACE.on[1], x) > 0.5;
    side.now = !on ? 0 : off < 0 ? 1 : -1;
    const crossed = side.was && side.now && side.was !== side.now;
    if (!on || now < coolUntil || !(crossed || Math.abs(off) < CFG.pluck.reach)) return;
    const P = CFG.pluck, speed = Math.min(1, ptrVel.length() / 1.2);
    const up = ptrVel.y !== 0 ? Math.sign(ptrVel.y) : side.now;          // the way the pointer went, up the screen = up
    const slot = plucks.reduce((a, b) => (b.lift === 0 || b.age > a.age ? b : a));
    Object.assign(slot, { x, age: 0, lift: up * (P.lift[0] + (P.lift[1] - P.lift[0]) * speed) });
    coolUntil = now + P.cooldown;
    plucking = true;
    if (PF.sfx && PF.sfx.pluck) PF.sfx.pluck((x - TRACE.on[1]) / (1 - TRACE.on[1]), speed);
    if (flowOn) { Object.assign(ripple, { u: cursorAim.x, v: 1 - t, amount: P.ripple * (0.8 + 0.5 * speed), age: 0 }); wake = 1; }
  }
  function pluckStep(dt) {
    if (!plucking) return;
    let live = false;
    for (const p of plucks) {
      if (!p.lift) continue;
      p.age += dt;
      if (Math.abs(p.lift) * Math.exp(-p.age / CFG.pluck.life) < 0.0008) p.lift = 0;   // under half a pixel: gone
      else live = true;
    }
    plucking = live;
  }

  /* ---------- music ---------- */
  // Winamp's loudness (or the slow breath for a song it can't hear), eased toward each frame (a quick rise, a slow
  // fall); hearing, the music runs the active frame rate, and the crawl it quickens is kept as its own phase so the
  // trace never jumps when the music stops
  let hearing = false, musicPhase = 0, breathT = 0;
  const QUIET = { swell: 0, fine: 0, reach: 0, glow: 0 };
  function musicStep(dt) {
    const W = PF.winamp, l = W && W.loudness ? W.loudness() : null;
    let aim = QUIET;
    if (l) aim = { swell: l.low * 0.7 + l.mid * 0.3, fine: l.high, reach: Math.max(l.low, l.mid), glow: l.low };
    else if (W && W.playing && W.playing()) {
      const B = CFG.music.breath, b = 0.5 - 0.5 * Math.cos((breathT += dt) * ((2 * Math.PI) / B.every));
      aim = { swell: B.swell[0] + (B.swell[1] - B.swell[0]) * b, fine: B.fine, reach: B.reach, glow: B.glow[0] + (B.glow[1] - B.glow[0]) * b };
    } else breathT = 0;
    let live = false;
    for (const k in MUSIC) {
      const tau = aim[k] > MUSIC[k] ? CFG.music.rise : CFG.music.fall;
      MUSIC[k] += (aim[k] - MUSIC[k]) * (1 - Math.exp(-dt / tau));
      if (MUSIC[k] < 0.002 && !aim[k]) MUSIC[k] = 0; else live = true;
    }
    hearing = live;
    musicPhase += dt * CFG.crawl * CFG.music.speed * MUSIC.reach;
  }

  /* ---------- out of the power-on line ---------- */
  // the swell wakes over `ms`, eased in and out, from the moment rise() is called; rising, it runs the active frame rate
  let rising = null;
  function riseStep(now) {
    if (!rising) return;
    const t = Math.min(1, (now - rising.at) / rising.ms);
    RISEN = t * t * (3 - 2 * t);
    if (t >= 1) rising = null;
  }

  // the clock starts at the moment the still on .desktop was rendered, so the first frame fades in over the same picture
  const STILL_T = 10;
  let time = STILL_T;
  function animate(t) {
    phase = t * CFG.crawl + musicPhase;
    signal.uniforms.uPhase.value = phase;
    plucks.forEach((p, i) => signal.uniforms.uPluck.value[i].set(p.x, p.age, p.lift));
    const M = CFG.music;
    signal.uniforms.uMusic.value.set(MUSIC.swell * M.swell, MUSIC.fine * M.fine, MUSIC.reach * M.reach, MUSIC.glow * M.glow);
    signal.uniforms.uRisen.value = RISEN;
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
    renderer.render(scene, postCam);
    renderer.setRenderTarget(null);
    renderer.render(postScene, postCam);
    if (!canvas.classList.contains('on')) canvas.classList.add('on');
  }

  // How much of the desktop shows between the windows, sampled on an 8 x 6 grid twice a second: with nothing showing
  // (a maximised window, the shutdown screen) it draws nothing; with under 30% showing it runs at 10 fps
  let coveredCheckAt = 0, shown = 1, covered = false;
  function visibleShare(now) {
    if (now > coveredCheckAt) {
      coveredCheckAt = now + 500;
      if (document.querySelector('.win.max:not([hidden]), .shutdown-screen')) shown = 0;
      else {
        const d = desktop.getBoundingClientRect(), rs = Array.from(document.querySelectorAll('#windows .win:not([hidden])'), (w) => w.getBoundingClientRect());
        let n = 0;
        for (let i = 0; i < 8; i++) for (let j = 0; j < 6; j++) {
          const x = d.left + ((i + 0.5) * d.width) / 8, y = d.top + ((j + 0.5) * d.height) / 6;
          if (!rs.some((q) => x >= q.left && x <= q.right && y >= q.top && y <= q.bottom)) n++;
        }
        shown = n / 48;
      }
    }
    return shown;
  }
  // the next glitch comes its usual 3.5 to 9 s after the wallpaper shows again, never the moment it does
  const reglitch = (now) => { nextGlitch = Math.max(nextGlitch, now + rand(...CFG.glitchEvery)); };

  // between draws it sleeps on a timer rather than waking every display frame for nothing
  let raf = 0, timer = 0, last = 0, paused = false;
  const wait = (ms) => { timer = setTimeout(() => { timer = 0; raf = requestAnimationFrame(frame); }, Math.max(0, ms)); };
  // timed on the clock the timer keeps (a frame's own timestamp can trail it by most of a frame), so each wake draws
  function frame() {
    raf = 0;
    const now = performance.now(), share = visibleShare(now);
    const frameMs = 1000 / (share < 0.3 ? 10 : wake >= WAKE_MIN || plucking || hearing || rising ? CFG.fpsActive : CFG.fps);
    if (now - last < frameMs - 8) { wait(last + frameMs - now - 4); return; }
    const dt = Math.min(0.1, (now - last) / 1000 || 0);
    last = now;
    if (share === 0) { covered = true; wait(500); return; }
    if (covered) { covered = false; reglitch(now); }
    wait(last + frameMs - performance.now() - 4);
    time += dt;
    pluckStep(dt);
    musicStep(dt);
    riseStep(now);
    animate(time);
    pluckTest(now);
    glitchTick(now);
    flowStep(dt);
    draw();
  }
  function play() {
    if (raf || timer || paused || mqReduce.matches || mqMobile.matches || document.hidden) return;
    last = performance.now();
    reglitch(last);
    raf = requestAnimationFrame(frame);
  }
  function stop() { cancelAnimationFrame(raf); clearTimeout(timer); raf = 0; timer = 0; }
  function still() { animate(time); draw(); }

  layout();
  if (flowOn) {   // run the water shader once now: compiling it on the first mouse move would stall that frame
    flowMat.uniforms.tPrev.value = flowRT[0].texture;
    renderer.setRenderTarget(flowRT[1]);
    renderer.render(flowScene, postCam);
    renderer.setRenderTarget(null);
    clearFlow();
  }
  animate(time);
  if (!mqMobile.matches) draw();
  play();

  window.addEventListener('resize', () => { layout(); if (!raf && !timer && !mqMobile.matches) still(); });
  mqReduce.addEventListener('change', () => { if (mqReduce.matches) { stop(); glitchUntil = 0; post.uniforms.uGlitch.value = 0; if (!mqMobile.matches) still(); } else play(); });
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));
  mqMobile.addEventListener('change', () => { if (mqMobile.matches) stop(); else { layout(); still(); play(); } });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); stop(); canvas.remove(); });

  PF.wall3d = {
    cfg: CFG,
    glitch(ms = 400) { const now = performance.now(); glitchUntil = now + ms; reseedAt = 0; if (!raf && !timer) { glitchTick(now); still(); } },
    // a quiet spell while the interface moves (a window zooming, a balloon), so a glitch never lands on it
    calm(ms = 1500) { const t = performance.now() + ms; if (nextGlitch < t) nextGlitch = t; },
    // the loading screen's hand-over (boot.js): flatten() lays the trace flat and draws it at once, even while paused;
    // rise(ms) wakes the swell out of it. Under reduced motion the swell stays as it is, as the wallpaper never moves
    flatten() { if (mqReduce.matches) return; rising = null; RISEN = 0; still(); },
    rise(ms = 1600) { rising = { at: performance.now(), ms }; if (!raf && !timer) { riseStep(performance.now()); still(); } },
    pause() { paused = true; stop(); },
    // where the trace sits on screen (CSS px) at a few points along it, for testing plucks
    targets: () => { const r = desktop.getBoundingClientRect(), a = r.width / r.height; return [0.4, 0.6, 0.8].map((x) => ({ x: Math.round(r.left + x * r.width), y: Math.round(r.top + traceAt(toPic(x, a), phase, plucks) * r.height) })); },
    state: () => ({ running: !!(raf || timer), covered, shown, time: +time.toFixed(2), glitch: post.uniforms.uGlitch.value, size: [canvas.width, canvas.height], flow: flowOn, wake: +wake.toFixed(3), plucking, plucks: plucks.filter((p) => p.lift).length, music: Object.fromEntries(Object.entries(MUSIC).map(([k, v]) => [k, +v.toFixed(3)])), risen: +RISEN.toFixed(3), drawn }),
    play() { paused = false; play(); },
    // advance one frame by hand (the browser pauses requestAnimationFrame in hidden tabs)
    step(dt = 1 / 60) { time += dt; pluckStep(dt); musicStep(dt); riseStep(performance.now()); animate(time); pluckTest(performance.now()); glitchTick(performance.now()); flowStep(dt); draw(); },
    // draw the picture at time t and hand it back as a PNG data URL, in the same task, so the drawing is still there to
    // read (tools/wallpaper-still makes the stills on .desktop with it)
    seek(t = STILL_T) { stop(); paused = true; time = t; musicPhase = 0; breathT = 0; rising = null; RISEN = 1; for (const k in MUSIC) MUSIC[k] = 0; post.uniforms.uGlitch.value = 0; animate(time); draw(); return canvas.toDataURL('image/png'); },
  };
}
