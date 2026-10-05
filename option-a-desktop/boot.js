/*
  Option A: the loading screen. An old beige PC in a dark room, modelled in Blender and drawn by three.js through the
  wallpaper's dither (crt3d/crt.js); a still of the same picture shows from the first paint, and on a phone, or
  with reduced motion, the still is all there is. Its CRT runs a power-on self test in HTML laid on the glass: one
  line per part of the portfolio, printed when that part has really arrived, and a bar that counts them.
  There is no skip and no time limit: the screen waits until every part is in (owner's request, 2026-09-29). A part
  that fails is marked FAILED and the page tries again on its own, after 4s, then 8s, 16s and every 30s, and once the
  network is back when it is offline; the foot of the test names F5 (Reload on a phone) as the way to start over.
  Three parts have a stand-in (the system's sans-serif for the fonts, the desktop's blue for the wallpaper's picture,
  Home without one of its pictures), and one of them that can never arrive is marked SKIPPED and the test goes on
  (owner's approval, 2026-10-05): at once when the server answers its file with an error, after one more try when the
  server sends the file but the browser turned it down, after the third failed load when the server can't be asked.
  A part that fails, and one passed over, is counted through /api/event, once a session.
  When everything is in, the tube turns XP's welcome blue and the camera flies into the glass (a CSS zoom on the
  still), then the desktop comes up in XP's order. The test is English on both languages, as a BIOS was; the screen
  reader's status follows the page's language.
  index.html's head adds html.booting before the first paint; app.js hands over Home (PF.boot.home) and runs its
  first-view moments through PF.bootDone.
*/
(() => {
  'use strict';
  const root = document.documentElement;
  const PF = (window.PF = window.PF || {});
  const box = document.getElementById('boot');
  if (!box) {
    root.classList.remove('booting');
    PF.bootDone = (fn) => fn();
    PF.boot = { home() {}, replay() {} };
    return;
  }
  const $ = (s) => box.querySelector(s);
  const scene = $('.boot-scene'), room = $('.boot-room'), crt = $('.boot-crt'), lines = $('.bios-test');
  const mem = $('.bios-mem'), cells = $('.bios-bar'), pctEl = $('.bios-pct'), tail = $('.bios-tail'), foot = $('.bios-foot');
  const meter = $('#bootMeter'), say = $('#bootSay');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  // a phone gets the still and a CSS zoom, never the 3D (as the live wallpaper and desk3d)
  const small = matchMedia('(max-width: 720px), (max-height: 500px) and (pointer: coarse)');
  const liveWall = !small.matches && !/[?&]wall=static\b/.test(location.search);

  const TXT = {
    en: { aria: 'Loading the portfolio', failed: 'A part did not load. Trying again.', skipped: 'A part did not load. Going on without it.', offline: 'You are offline. Waiting for the network.', ready: 'Welcome in' },
    id: { aria: 'Memuat portofolio', failed: 'Sebagian gagal dimuat. Mencoba lagi.', skipped: 'Sebagian gagal dimuat. Melanjutkan tanpanya.', offline: 'Kamu sedang offline. Menunggu jaringan.', ready: 'Selamat datang' },
  };
  const t = (k) => (TXT[root.lang === 'id' ? 'id' : 'en'])[k];

  // what the bar counts, in the order the test prints it; each weight is the part's rough share of the bytes, so the
  // bar moves with the wait and not with the count
  const PARTS = [
    ['fonts', 6, 'Preparing the text'], ['content', 3, 'Loading the portfolio'], ['cases', 5, 'Loading the projects'],
    ['icons', 4, 'Loading icons'], ['app', 10, 'Starting the desktop'], ['wall', 3, 'Loading the wallpaper'], ['home', 30, 'Opening Home'],
  ].concat(liveWall ? [['wall3d', 25, 'Preparing the wallpaper']] : []);
  const TOTAL = PARTS.reduce((s, [, w]) => s + w, 0);
  const TEMPO = 0.11;         // s: the least time between two printed lines, so a cached load still reads as a boot
  const DONE_HOLD = 0.6;      // s the finished test stays before the tube turns blue
  const FLY = 1500;           // ms into the glass (the 3D); the still's CSS zoom takes the same
  const RETRY = [4, 8, 16, 30];  // s before each new try after a part failed
  const WELCOMED = 'pf-a-welcomed', TRIES = 'pf-a-boot-tries', MISSES = 'pf-a-boot-misses', SAID = 'pf-a-boot-said';
  // the parts with a stand-in, which can be passed over when they can never arrive (a font blocker, a file gone after
  // a deploy); a script that never arrives still means a reload, as the desktop can't run without it
  const CAN_SKIP = new Set(['fonts', 'wall', 'home']);
  // where the glass sits on each still, as fractions of it (tools/poster.mjs): top left, top right, bottom right,
  // bottom left; and each still's size in CSS px (one dot is 2px)
  const STILL = {
    room: { src: '../asset/boot/room.webp?v=1', w: 1920, h: 1200, glass: [[0.36476, 0.15812], [0.6108, 0.14806], [0.60731, 0.43451], [0.36914, 0.45205]] },
    phone: { src: '../asset/boot/room-phone.webp?v=1', w: 480, h: 1040, glass: [[0.163, 0.32809], [0.82551, 0.32802], [0.81053, 0.54838], [0.17894, 0.55453]] },
  };
  const SCREEN = { w: 1024, h: 768 };   // the test's own box in CSS px, before it is laid on the glass

  /* ---------- arrivals, recorded from the first byte so a later replay finds them settled ---------- */
  const SCRIPTS = { 'content.js': 'content', 'cases.js': 'cases', 'icons.js': 'icons', 'app.js': 'app' };
  const arrived = new Set();
  const heard = [];
  const onScript = (e) => {
    const s = e.target;
    if (s.tagName !== 'SCRIPT' || !s.src) return;
    const key = SCRIPTS[s.src.split('?')[0].split('/').pop()];
    if (!key) return;
    arrived.add(key);
    if (e.type === 'error') arrived.add(key + ':failed');
    heard.splice(0).forEach((fn) => fn());
  };
  document.addEventListener('load', onScript, true);
  document.addEventListener('error', onScript, true);
  const pageLoaded = new Promise((res) => (document.readyState === 'complete' ? res() : addEventListener('load', res, { once: true })));
  pageLoaded.then(() => heard.splice(0).forEach((fn) => fn()));
  // true once the script has run; false when it failed or the page finished without it
  const scriptIn = (key) => new Promise((res) => {
    const check = () => {
      if (arrived.has(key) || document.readyState === 'complete') res(arrived.has(key) && !arrived.has(key + ':failed'));
      else heard.push(check);
    };
    check();
  });

  // true when the picture decoded, false when it failed; a failed picture's address goes into miss
  const imgReady = (img, miss = []) => new Promise((res) => {
    const no = () => { miss.push(img.currentSrc || img.src); res(false); };
    const done = () => (img.decode ? img.decode().then(() => true, () => img.naturalWidth > 0) : Promise.resolve(img.naturalWidth > 0)).then((ok) => (ok ? res(true) : no()));
    if (img.complete) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', no, { once: true }); }
  });
  const urlReady = (src, miss) => { const img = new Image(); img.src = src; return imgReady(img, miss); };
  const cssUrls = (value) => Array.from(String(value).matchAll(/url\("?([^")]+)"?\)/g), (m) => m[1]).filter((u) => !u.startsWith('data:'));
  const allOk = (list) => Promise.all(list).then((oks) => oks.every(Boolean));

  function wall3dReady() {
    const desk = document.getElementById('desktop');
    const on = () => !!desk.querySelector('canvas.wall3d.on');
    return new Promise((res) => {
      if (on()) return res(true);
      const mo = new MutationObserver(() => { if (on()) { mo.disconnect(); res(true); } });
      mo.observe(desk, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
      // wallpaper3d.js runs before the page's load event and fetches three.js on its own; when WebGL or the CDN
      // fails it stays on the still, which is the wallpaper working as designed, not a missing part
      pageLoaded.then(() => PF.wall3dLoad).then(() => { mo.disconnect(); res(true); }, () => { mo.disconnect(); res(true); });
    });
  }

  // Home's first view: every picture and CSS texture inside the window's visible part
  function firstView(el, miss) {
    const view = (el.querySelector('.win-body') || el).getBoundingClientRect();
    const inView = (n) => { const r = n.getBoundingClientRect(); return r.width > 0 && r.bottom > view.top && r.top < view.bottom && r.right > view.left && r.left < view.right; };
    const waits = [], urls = new Set();
    el.querySelectorAll('*').forEach((n) => {
      if (!inView(n)) return;
      if (n.tagName === 'IMG') waits.push(imgReady(n, miss));
      [null, '::before', '::after'].forEach((p) => {
        const cs = getComputedStyle(n, p);
        cssUrls(cs.backgroundImage).concat(cssUrls(cs.maskImage || cs.webkitMaskImage)).forEach((u) => urls.add(u));
      });
    });
    urls.forEach((u) => waits.push(urlReady(u, miss)));
    return allOk(waits);
  }

  /* ---------- a part that can't arrive ---------- */
  // what the server says about files the browser did not load: 'gone' when it answers one with an error (a reload
  // can't bring it back), 'refused' when it sends them all (the browser, or something in it, turned them down), and
  // 'unknown' when it can't be asked (offline, a network that drops the request, nothing to ask about)
  function ask(urls) {
    if (!urls.length) return Promise.resolve('unknown');
    const answers = Promise.all(urls.map((u) => fetch(u, { method: 'HEAD', cache: 'no-store' })
      .then((res) => (res.ok ? true : res.status === 405 || res.status === 501 ? null : false), () => null)))
      .then((oks) => (oks.includes(false) ? 'gone' : oks.includes(null) ? 'unknown' : 'refused'));
    return Promise.race([answers, pause(5000).then(() => 'unknown')]);
  }
  // how many loads this session the part has failed on, this one counted
  function missed(key) {
    try {
      const m = JSON.parse(sessionStorage.getItem(MISSES) || '{}') || {};
      m[key] = (m[key] || 0) + 1;
      sessionStorage.setItem(MISSES, JSON.stringify(m));
      return m[key];
    } catch (e) { return 1; }
  }
  // one count a session for each part that fails or is passed over (worker/index.js, EVENTS.boot), so the owner hears
  // of a file a deploy left out before a visitor writes about it
  function tell(d) {
    try {
      const said = JSON.parse(sessionStorage.getItem(SAID) || '[]');
      if (said.includes(d)) return;
      said.push(d);
      sessionStorage.setItem(SAID, JSON.stringify(said));
      navigator.sendBeacon('/api/event', new Blob([JSON.stringify({ e: 'boot', d })], { type: 'application/json' }));
    } catch (e) { /* counting is optional */ }
  }

  /* ---------- the glass: the test's box laid on the picture's four corners ---------- */
  // the projective map from the box (0,0 w,0 w,h 0,h) onto four points, as a CSS matrix3d (transform-origin 0 0)
  function onto(q) {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q, { w, h } = SCREEN;
    const dx1 = x1 - x2, dx2 = x3 - x2, dy1 = y1 - y2, dy2 = y3 - y2, sx = x0 - x1 + x2 - x3, sy = y0 - y1 + y2 - y3;
    const det = dx1 * dy2 - dx2 * dy1;
    const g = (sx * dy2 - dx2 * sy) / det, hh = (dx1 * sy - sx * dy1) / det;
    const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3;
    const m = [a / w, d / w, 0, g / w, b / h, e / h, 0, hh / h, 0, 0, 1, 0, x0, y0, 0, 1];
    return `matrix3d(${m.map((v) => +v.toFixed(8)).join(',')})`;
  }
  // where the glass is on the still as the page shows it (object-fit: cover, centred)
  function stillGlass() {
    const s = small.matches ? STILL.phone : STILL.room;
    const vw = box.clientWidth, vh = box.clientHeight, k = Math.max(vw / s.w, vh / s.h);
    const ox = (vw - s.w * k) / 2, oy = (vh - s.h * k) / 2;
    return s.glass.map(([fx, fy]) => [ox + fx * s.w * k, oy + fy * s.h * k]);
  }
  let glassNow = null;
  function layGlass(q) { glassNow = q; crt.style.transform = onto(q); crt.classList.add('laid'); }

  /* ---------- the room's still, dithered here at the page's own dots ---------- */
  // the still is the 3D's first frame before its lines and dither (tools/poster.mjs); it gets them here, at exactly
  // 2px a dot for this window, with the 3D's own 4 by 4 matrix counted from the bottom left, so it is the picture
  // the 3D draws and a scaled still never shows bands
  const BAYER4 = (() => {
    const fract = (v) => v - Math.floor(v), b2 = (x, y) => fract(0.5 * x + 0.75 * y * y);
    const m = new Float32Array(16);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) m[y * 4 + x] = b2(x >> 1, y >> 1) * 0.25 + b2(x, y);
    return m;
  })();
  const stills = {};
  const stillImage = () => {
    const s = small.matches ? STILL.phone : STILL.room;
    if (!stills[s.src]) stills[s.src] = new Promise((res) => { const img = new Image(); img.onload = () => res(img); img.onerror = () => res(null); img.src = s.src; });
    return stills[s.src];
  };
  function paintRoom() {
    return stillImage().then((img) => {
      if (!img || !run) return;
      const w = Math.max(1, Math.round(box.clientWidth / 2)), h = Math.max(1, Math.round(box.clientHeight / 2));
      room.width = w; room.height = h;
      const ctx = room.getContext('2d', { willReadFrequently: true });
      // cover, centred: the framing the 3D keeps at any window shape
      const k = Math.max(w / img.naturalWidth, h / img.naturalHeight), dw = img.naturalWidth * k, dh = img.naturalHeight * k;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      const px = ctx.getImageData(0, 0, w, h), d = px.data;
      for (let row = 0; row < h; row++) {
        const y = h - 1 - row, scan = (1 - 0.06 * (y & 1)) * 5 / 255, by = (y & 3) * 4;
        for (let x = 0, i = row * w * 4; x < w; x++, i += 4) {
          const b = BAYER4[by + (x & 3)] + 0.03125;
          d[i] = Math.min(5, Math.floor(d[i] * scan + b)) * 51;
          d[i + 1] = Math.min(5, Math.floor(d[i + 1] * scan + b)) * 51;
          d[i + 2] = Math.min(5, Math.floor(d[i + 2] * scan + b)) * 51;
        }
      }
      ctx.putImageData(px, 0, 0);
    });
  }

  /* ---------- the 3D, when this screen can have it ---------- */
  let crt3d = null, crt3dReady = null;
  function webgl() {
    try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
  }
  function start3d() {
    if (small.matches || reduce || !webgl()) return null;
    return import('./crt3d/crt.js?v=2').then((m) => {
      if (!run) return null;
      crt3d = m.createCrt(scene, { onFrame: (q) => { if (!run || run.zooming) return; layGlass(q); } });
      return crt3d.ready.then(() => {
        if (!run) return null;
        scene.classList.add('live');   // the canvas takes over from the still: the same picture
        return crt3d;
      });
    }).catch((e) => { console.warn('loading screen: staying on the still', e); if (crt3d) { crt3d.destroy(); crt3d = null; } return null; });
  }

  /* ---------- one showing of the screen ---------- */
  let run = null;
  const waiters = [];
  let frozen = [];

  function show(replayed) {
    if (run) return;
    let welcomed = false;
    try { welcomed = localStorage.getItem(WELCOMED) === '1'; } catch (e) { /* storage unavailable */ }
    const now = performance.now();
    const r = (run = {
      ok: new Set(), failed: new Set(), skipped: new Set(), shown: 0, printed: 0, lastPrint: 0, kb: 0, holding: false, leaving: false, zooming: false,
      t0: now, last: now, q: welcomed && !replayed ? 0.6 : 1, replayed: !!replayed,
      // the files a part was waiting on and did not get: the fonts are the ones the page preloads
      miss: { fonts: Array.from(document.querySelectorAll('link[rel="preload"][as="font"]'), (l) => l.href), wall: [], home: [] },
    });
    let homeIn;
    r.home = new Promise((res) => (homeIn = res));
    r.giveHome = (el) => { if (el) firstView(el, r.miss.home).then(homeIn); else homeIn(true); };

    root.classList.remove('boot-out', 'boot-in');
    root.classList.add('booting');
    box.classList.remove('ready', 'failing');
    crt.classList.remove('blue', 'done');
    scene.classList.remove('live');
    [box, scene, room].forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
    lines.innerHTML = PARTS.map(([k, , label]) => `<p data-part="${k}"><span>${label}</span><b></b></p>`).join('');
    const n = small.matches ? 20 : 26;
    cells.innerHTML = '<i></i>'.repeat(n);
    tail.textContent = '';
    foot.textContent = foot.dataset.id;
    meter.setAttribute('aria-label', t('aria'));
    say.textContent = `${t('aria')}…`;
    if (themeColor) { r.theme = themeColor.content; themeColor.content = '#141414'; }
    frozen = Array.from(document.body.children).filter((el) => el !== box && el.tagName !== 'SCRIPT' && !el.inert);
    frozen.forEach((el) => (el.inert = true));
    layGlass(stillGlass());
    paintRoom();
    draw(r);
    crt3dReady = start3d();

    const checks = {
      fonts: () => (document.fonts
        ? Promise.all(['400 16px "Noto Sans"', '700 16px "Noto Sans"', '400 16px "Noto Sans Mono"'].map((f) => document.fonts.load(f))).then((sets) => sets.every((s) => s.length > 0))
        : true),
      content: () => scriptIn('content'),
      cases: () => scriptIn('cases'),
      icons: () => scriptIn('icons'),
      app: () => scriptIn('app'),
      wall: () => allOk(cssUrls(getComputedStyle(document.getElementById('desktop')).backgroundImage).map((u) => urlReady(u, r.miss.wall))),
      home: () => r.home,
      // once its first frame is up, the live wallpaper waits behind the screen
      wall3d: () => wall3dReady().then((ok) => { if (run === r && PF.wall3d) { PF.wall3d.pause(); r.wallPaused = true; } return ok; }),
    };
    PARTS.forEach(([k]) => Promise.resolve().then(checks[k]).catch(() => false).then((ok) => settle(r, k, !!ok)));
    requestAnimationFrame((ts) => tick(r, ts));
  }

  function settle(r, key, ok) {
    if (run !== r || r.ok.has(key) || r.failed.has(key) || r.skipped.has(key)) return;
    // on a replay the page is already up: nothing there is worth a reload, so what answered is taken as in
    if (ok || r.replayed) { r.ok.add(key); return; }
    tell('fail:' + key);
    if (!CAN_SKIP.has(key)) { fail(r, key); return; }
    // a part with a stand-in: passed over when no reload can bring it (the server says it's gone, or sends it and the
    // browser turned it down a second time), or after its third failed load; offline, the screen waits as before
    const n = missed(key);
    ask(r.miss[key]).then((said) => {
      if (run !== r) return;
      if (navigator.onLine && (said === 'gone' || (said === 'refused' && n >= 2) || n >= 3)) {
        r.skipped.add(key);
        say.textContent = t('skipped');
        tell('skip:' + key);
      } else fail(r, key);
    });
  }
  function fail(r, key) {
    r.failed.add(key);
    if (!r.retrying) retry(r);
  }
  const done = (r, k) => r.ok.has(k) || r.skipped.has(k);
  const got = (r) => PARTS.reduce((s, [k, w]) => s + (done(r, k) ? w : 0), 0) / TOTAL;

  // a part failed: the page loads again after a pause that grows with each try, and not while offline
  function retry(r) {
    r.retrying = true;
    box.classList.add('failing');
    let tries = 0;
    try { tries = +sessionStorage.getItem(TRIES) || 0; sessionStorage.setItem(TRIES, String(tries + 1)); } catch (e) { /* storage unavailable */ }
    let left = RETRY[Math.min(tries, RETRY.length - 1)];
    foot.textContent = small.matches ? 'Reload to start over' : 'Press F5 to start over';
    say.textContent = t('failed');
    const count = () => {
      if (run !== r) return;
      if (!navigator.onLine) {
        tail.textContent = 'Waiting for the network';
        say.textContent = t('offline');
        addEventListener('online', () => { if (run === r) location.reload(); }, { once: true });
        return;
      }
      if (left <= 0) { tail.textContent = 'Retrying'; location.reload(); return; }
      tail.textContent = `Retrying in ${left}s`;
      left -= 1;
      setTimeout(count, 1000);
    };
    count();
  }

  // the test as it stands: the lines printed so far, the memory count, the bar in whole blocks and the percent
  function draw(r) {
    const rows = lines.children;
    for (let i = 0; i < rows.length; i++) {
      const k = rows[i].dataset.part, row = rows[i];
      const state = i < r.printed ? (r.ok.has(k) ? 'ok' : r.skipped.has(k) ? 'skipped' : 'failed') : r.failed.has(k) && i === r.printed ? 'failed' : i === r.printed ? 'cur' : '';
      if (row.dataset.state !== state) {
        row.dataset.state = state;
        row.lastChild.textContent = state === 'ok' ? 'OK' : state === 'failed' ? 'FAILED' : state === 'skipped' ? 'SKIPPED' : '';
      }
    }
    const blocks = cells.children, on = Math.floor(r.shown * blocks.length + 1e-6);
    for (let i = 0; i < blocks.length; i++) blocks[i].classList.toggle('on', i < on);
    const p = Math.round(r.shown * 100);
    pctEl.textContent = `${p}%`;
    mem.textContent = `Memory Test : ${String(Math.round(r.kb)).padStart(5, ' ')}K${p >= 100 ? ' OK' : ''}`;
    meter.setAttribute('aria-valuenow', p);
  }

  // the bytes that have really arrived, in KB: the page and everything it fetched
  function loadedKB() {
    let bytes = 0;
    for (const e of performance.getEntriesByType('navigation').concat(performance.getEntriesByType('resource'))) bytes += e.encodedBodySize || e.transferSize || 0;
    return bytes / 1024;
  }

  // one frame: lines print in order, never ahead of what arrived and never faster than TEMPO; the bar eases to them
  function tick(r, now) {
    if (run !== r || r.leaving) return;
    const dt = Math.min(0.25, (now - r.last) / 1000);
    r.last = now;
    const k = PARTS[r.printed];
    if (k && done(r, k[0]) && (now - r.lastPrint) / 1000 >= TEMPO * r.q) { r.printed++; r.lastPrint = now; }
    const target = PARTS.slice(0, r.printed).reduce((s, [key, w]) => s + (done(r, key) ? w : 0), 0) / TOTAL;
    r.shown = reduce ? target : r.shown + (target - r.shown) * (1 - Math.exp(-dt / 0.12));
    if (Math.abs(target - r.shown) < 0.002) r.shown = target;
    const kb = loadedKB();
    r.kb = reduce ? kb : r.kb + (kb - r.kb) * (1 - Math.exp(-dt / 0.2));
    draw(r);
    // the camera's push while loading, at about 30 frames a second: it moves a few centimetres over seconds
    if (crt3d && !r.zooming && !r.flying && !reduce && now - (r.leant || 0) > 30) { r.leant = now; crt3d.lean((now - r.t0) / 1000); }
    ready(r);
    requestAnimationFrame((ts) => tick(r, ts));
  }

  /* ---------- leaving ---------- */
  function ready(r) {
    if (r.holding || r.leaving || r.printed < PARTS.length || r.shown < 0.999 || got(r) < 0.999) return;
    r.holding = true;
    box.classList.add('ready');
    crt.classList.add('done');
    tail.textContent = 'Starting iqbalsurya.com';
    say.textContent = t('ready');
    meter.setAttribute('aria-valuenow', 100);
    try { sessionStorage.removeItem(TRIES); sessionStorage.removeItem(MISSES); } catch (e) { /* storage unavailable */ }
    setTimeout(() => {
      if (run !== r) return;
      crt.classList.add('blue');
      if (crt3d) crt3d.tube('blue');
      // the flight waits a moment for the 3D if it is still on its way (a replay builds it again); after that the
      // still flies instead, the same move in CSS
      const wait = crt3dReady ? Promise.race([crt3dReady, new Promise((res) => setTimeout(() => res(null), 1200))]) : Promise.resolve(null);
      wait.then((live) => {
        if (reduce) return pause(450);
        if (live && crt3d) { r.flying = true; return crt3d.fly(FLY); }
        return zoomStill(r);
      }).then(() => leave(r));
    }, DONE_HOLD * 1000 * r.q);
  }
  const pause = (ms) => new Promise((res) => setTimeout(res, ms));

  // the still's flight: the whole picture scales about the glass until only the blue is left (past the welcome's
  // bands, as the 3D's last frame), and the room fades on the way, before its dots grow coarse
  function zoomStill(r) {
    r.zooming = true;
    const q = glassNow || stillGlass();
    const xs = q.map((p) => p[0]), ys = q.map((p) => p[1]);
    const gx = (Math.min(...xs) + Math.max(...xs)) / 2, gy = (Math.min(...ys) + Math.max(...ys)) / 2;
    const k = Math.max(box.clientWidth / (Math.max(...xs) - Math.min(...xs)), box.clientHeight / (Math.max(...ys) - Math.min(...ys))) * 1.2;
    const to = `translate(${box.clientWidth / 2 - gx * k}px, ${box.clientHeight / 2 - gy * k}px) scale(${k})`;
    scene.style.transformOrigin = '0 0';
    room.animate([{ opacity: 1 }, { opacity: 1, offset: 0.35 }, { opacity: 0 }], { duration: FLY, easing: 'ease-in', fill: 'forwards' });
    return scene.animate([{ transform: 'none' }, { transform: to }], { duration: FLY, easing: 'cubic-bezier(.65, 0, .35, 1)', fill: 'forwards' }).finished.catch(() => {});
  }

  function leave(r) {
    if (run !== r || r.leaving) return;
    r.leaving = true;
    try { sessionStorage.setItem('pf-a-boot', '1'); localStorage.setItem(WELCOMED, '1'); } catch (e) { /* storage unavailable */ }
    const q = r.q;
    // the wallpaper is painted now, while the screen still covers it
    root.classList.add('boot-out');
    if (reduce) root.classList.add('boot-in');
    const end = () => {
      run = null;
      if (crt3d) { crt3d.destroy(); crt3d = null; }
      crt3dReady = null;
      root.classList.remove('booting', 'boot-out', 'boot-in');
      box.classList.remove('ready', 'failing');
      [box, scene, room].forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
      scene.style.transformOrigin = '';
      if (themeColor && r.theme) themeColor.content = r.theme;
      if (r.wallPaused && PF.wall3d) PF.wall3d.play();
      frozen.forEach((el) => (el.inert = false));
      frozen = [];
      waiters.splice(0).forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    };
    if (reduce) return end();
    // the blue fades, and the desktop comes up in XP's steps behind it
    box.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500 * q, easing: 'ease-out', fill: 'forwards' }).finished
      .then(() => enter(q))
      .catch(() => { root.classList.add('boot-in'); })
      .then(end);
  }

  // XP brought the desktop up in steps after its Welcome screen: the wallpaper first, then the taskbar and the
  // icons, and the startup window last, zooming open from its icon in the 2px outline app.js also draws
  function enter(q) {
    const taskbar = document.querySelector('.taskbar');
    const icons = Array.from(document.querySelectorAll('#deskIcons > li'));
    const layer = document.getElementById('windows');
    const win = layer && (layer.querySelector('.win.active') || layer.querySelector('.win'));
    if (layer) layer.style.visibility = 'hidden';
    root.classList.add('boot-in');
    const moves = [];
    if (taskbar) moves.push(taskbar.animate([{ transform: 'translateY(100%)' }, { transform: 'none' }], { duration: 280 * q, easing: 'cubic-bezier(.2, .8, .2, 1)' }).finished);
    icons.forEach((li, i) => moves.push(li.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 200 * q, delay: (60 + i * 30) * q, easing: 'ease-out', fill: 'backwards' }).finished));
    // the window starts to open just before the last icon has settled
    const opensAt = (60 + Math.max(0, icons.length - 1) * 30 + 200 - 80) * q;
    return new Promise((res) => setTimeout(res, opensAt))
      .then(() => (win ? zoomOpen(win, q) : null))
      .then(() => { if (layer) layer.style.visibility = ''; return Promise.all(moves); });
  }
  function zoomOpen(win, q) {
    const zr = document.getElementById('zoomRect');
    const icon = document.querySelector(`.dicon[data-desk="${win.dataset.id}"] .px`);
    if (!zr || !icon) return null;
    const a = icon.getBoundingClientRect(), b = win.getBoundingClientRect();
    const rect = (x) => ({ left: `${x.left}px`, top: `${x.top}px`, width: `${x.width}px`, height: `${x.height}px` });
    zr.style.display = 'block';
    return zr.animate([rect(a), rect(b)], { duration: 160 * q, easing: 'steps(7)' }).finished
      .then(() => { zr.style.display = 'none'; }, () => { zr.style.display = 'none'; });
  }

  // the still moves with the window's shape; the 3D follows its own frames
  let resizing = 0;
  addEventListener('resize', () => {
    if (!run || run.zooming || (crt3d && scene.classList.contains('live'))) return;
    layGlass(stillGlass());
    clearTimeout(resizing);
    resizing = setTimeout(paintRoom, 120);
  });

  /* ---------- hand-over ---------- */
  // runs fn once the loading screen has gone (right away when none is showing)
  PF.bootDone = (fn) => { if (run) waiters.push(fn); else fn(); };
  PF.boot = {
    // app.js hands over the Home window it opened at startup (null when Home does not open at startup)
    home: (el) => { if (run) run.giveHome(el); },
    // Shut Down > Restart, and Blank's finale in Screen Saver XP, play the loading screen again
    replay: () => { try { sessionStorage.removeItem('pf-a-boot'); } catch (e) { /* storage unavailable */ } show(true); },
  };

  if (root.classList.contains('booting')) show();
})();
