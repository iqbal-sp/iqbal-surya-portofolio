/*
  Option A: the welcome screen, after Windows XP's own (the screen that said "welcome" while it loaded your
  settings). It shows once a session while the desktop loads: "hello" is written by hand (GSAP DrawSVG), the
  owner's account picture logs in, and the bar counts what has really arrived. A click or any key skips it.
  index.html's head adds html.booting before the first paint; app.js hands over Home (PF.boot.home) and
  runs its first-view moments through PF.bootDone.
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
  const main = $('.boot-main'), ink = $('.boot-hello path'), pic = $('.boot-pic img');
  const what = $('#bootWhat'), pct = $('#bootPct'), bar = $('#bootBar'), fill = $('#bootBar i'), say = $('#bootSay'), hint = $('#bootHint');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(pointer: coarse)').matches;
  const liveWall = !matchMedia('(max-width: 720px)').matches && !/[?&]wall=static\b/.test(location.search);

  const TXT = {
    en: {
      photo: 'Loading the account picture', fonts: 'Loading typefaces', content: 'Loading content', cases: 'Loading case studies',
      icons: 'Loading icons', app: 'Starting the desktop', gsap: 'Loading the animation', wall: 'Loading the wallpaper',
      home: 'Opening Home', wall3d: 'Drawing the wallpaper', ready: 'All set', aria: 'Loading the portfolio',
      hint: 'Click anywhere or press any key to skip', hintTouch: 'Tap anywhere to skip',
    },
    id: {
      photo: 'Memuat foto akun', fonts: 'Memuat huruf', content: 'Memuat konten', cases: 'Memuat studi kasus',
      icons: 'Memuat ikon', app: 'Menyiapkan desktop', gsap: 'Memuat animasi', wall: 'Memuat wallpaper',
      home: 'Membuka Home', wall3d: 'Menggambar wallpaper', ready: 'Semua siap', aria: 'Memuat portofolio',
      hint: 'Klik di mana saja atau tekan tombol apa saja untuk melewati', hintTouch: 'Ketuk di mana saja untuk melewati',
    },
  };
  const t = (k) => (TXT[root.lang === 'id' ? 'id' : 'en'])[k];

  // what the bar counts, in the order the status line names it; each weight is the part's rough share of
  // the bytes, so the bar moves with the wait and not with the count
  const PARTS = [['photo', 2], ['fonts', 6], ['content', 3], ['cases', 5], ['icons', 4], ['app', 10], ['gsap', 6], ['wall', 3], ['home', 30]]
    .concat(liveWall ? [['wall3d', 25]] : []);
  const PART_WAIT = 9000;   // a part that has not answered by then stops holding the bar
  const CAP = 12000;        // the visitor never waits longer than this; the rest keeps loading behind the desktop
  const DRAW = 2.1;         // seconds the hand takes to write "hello"

  /* ---------- arrivals, recorded from the first byte so a later replay finds them settled ---------- */
  const SCRIPTS = { 'content.js': 'content', 'cases.js': 'cases', 'icons.js': 'icons', 'app.js': 'app', 'gsap.min.js': 'gsapCore', 'DrawSVGPlugin.min.js': 'gsapDraw' };
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
  const scriptIn = (...keys) => new Promise((res) => {
    const check = () => {
      if (keys.every((k) => arrived.has(k)) || document.readyState === 'complete') res();
      else heard.push(check);
    };
    check();
  });
  const gsapReady = () => scriptIn('gsapCore', 'gsapDraw').then(() => !!(window.gsap && window.DrawSVGPlugin));

  const imgReady = (img) => new Promise((res) => {
    const done = () => (img.decode ? img.decode().catch(() => {}).then(res) : res());
    if (img.complete) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', res, { once: true }); }
  });
  const urlReady = (src) => { const img = new Image(); img.src = src; return imgReady(img); };
  const cssUrls = (value) => Array.from(String(value).matchAll(/url\("?([^")]+)"?\)/g), (m) => m[1]).filter((u) => !u.startsWith('data:'));

  function wall3dReady() {
    const desk = document.getElementById('desktop');
    const on = () => !!desk.querySelector('canvas.wall3d.on');
    return new Promise((res) => {
      if (on()) return res();
      const mo = new MutationObserver(() => { if (on()) { mo.disconnect(); res(); } });
      mo.observe(desk, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
      // wallpaper3d.js runs before the page's load event; when WebGL or the CDN fails it stays on the still
      pageLoaded.then(() => { mo.disconnect(); res(); });
    });
  }

  // Home's first view: every picture and CSS texture inside the window's visible part
  function firstView(el) {
    const view = (el.querySelector('.win-body') || el).getBoundingClientRect();
    const inView = (n) => { const r = n.getBoundingClientRect(); return r.width > 0 && r.bottom > view.top && r.top < view.bottom && r.right > view.left && r.left < view.right; };
    const waits = [], urls = new Set();
    el.querySelectorAll('*').forEach((n) => {
      if (!inView(n)) return;
      if (n.tagName === 'IMG') waits.push(imgReady(n));
      [null, '::before', '::after'].forEach((p) => {
        const cs = getComputedStyle(n, p);
        cssUrls(cs.backgroundImage).concat(cssUrls(cs.maskImage || cs.webkitMaskImage)).forEach((u) => urls.add(u));
      });
    });
    urls.forEach((u) => waits.push(urlReady(u)));
    return Promise.all(waits);
  }

  /* ---------- one showing of the screen ---------- */
  let run = null;
  const waiters = [];
  const shown = { v: 0 };
  let frozen = [];
  let hand = null;

  function show() {
    if (run) return;
    const r = (run = { done: new Set(), drawn: false, leaving: false, t0: performance.now() });
    let homeIn;
    r.home = new Promise((res) => (homeIn = res));
    r.giveHome = (el) => { if (el) firstView(el).then(homeIn); else homeIn(); };

    root.classList.remove('boot-out');
    root.classList.add('booting');
    [box, main, ink].forEach((n) => n.removeAttribute('style'));
    shown.v = 0; drawBar();
    hint.textContent = t(touch ? 'hintTouch' : 'hint');
    bar.setAttribute('aria-label', t('aria'));
    say.textContent = `${t('aria')}…`;
    if (themeColor) { r.theme = themeColor.content; themeColor.content = '#00309c'; }
    frozen = Array.from(document.body.children).filter((n) => n !== box && n.tagName !== 'SCRIPT' && !n.inert);
    frozen.forEach((n) => (n.inert = true));
    addEventListener('keydown', onKey, true);
    box.addEventListener('click', onClick);

    const wait = (p) => Promise.race([p, new Promise((res) => setTimeout(res, PART_WAIT))]);
    const checks = {
      photo: () => imgReady(pic),
      fonts: () => (document.fonts ? Promise.all(['400 16px "Space Grotesk"', '700 16px "Space Grotesk"'].map((f) => document.fonts.load(f))) : null),
      content: () => scriptIn('content'),
      cases: () => scriptIn('cases'),
      icons: () => scriptIn('icons'),
      app: () => scriptIn('app'),
      gsap: gsapReady,
      wall: () => Promise.all(cssUrls(getComputedStyle(document.getElementById('desktop')).backgroundImage).map(urlReady)),
      home: () => r.home,
      // once its first frame is up, the live wallpaper waits behind the screen so the hand gets every frame
      wall3d: () => wall3dReady().then(() => { if (run === r && PF.wall3d) { PF.wall3d.pause(); r.wallPaused = true; } }),
    };
    PARTS.forEach(([k]) => wait(Promise.resolve().then(checks[k]).catch(() => {})).then(() => settle(r, k)));
    paint(r);
    write(r);
    r.cap = setTimeout(() => leave(r, true), CAP);
  }

  function settle(r, key) {
    if (run !== r || r.done.has(key)) return;
    r.done.add(key);
    paint(r);
  }

  function paint(r) {
    const total = PARTS.reduce((s, [, w]) => s + w, 0);
    const got = PARTS.reduce((s, [k, w]) => s + (r.done.has(k) ? w : 0), 0);
    const next = PARTS.find(([k]) => !r.done.has(k));
    what.textContent = next ? `${t(next[0])}…` : t('ready');
    bar.setAttribute('aria-valuenow', Math.round((got / total) * 100));
    bar.setAttribute('aria-valuetext', `${Math.round((got / total) * 100)}%, ${what.textContent}`);
    toward(got / total);
    if (!next) { box.classList.add('ready'); say.textContent = t('ready'); ready(r); }
  }

  // the bar fills in XP's whole blocks (8px green, 2px gap) and never runs ahead of what has arrived
  function toward(v) {
    if (window.gsap && !reduce) window.gsap.to(shown, { v, duration: 0.6, ease: 'power2.out', overwrite: true, onUpdate: drawBar });
    else { shown.v = v; drawBar(); }
  }
  function drawBar() {
    const inner = Math.max(0, bar.clientWidth - 4);
    fill.style.width = `${shown.v >= 1 ? inner : Math.floor((shown.v * inner) / 10) * 10}px`;
    pct.textContent = `${Math.round(shown.v * 100)}%`;
  }

  /* ---------- the hand ---------- */
  function write(r) {
    // the account is chosen as the hand starts: its picture takes XP's gold selected frame
    const still = () => { box.classList.add('chosen'); ink.style.visibility = 'visible'; r.drawn = true; ready(r); };
    if (reduce) return still();
    const within = (p, ms, miss) => Promise.race([p, new Promise((res) => setTimeout(() => res(miss), ms))]);
    // the pen touches down once GSAP is here and the desktop has been built, so the long first task is behind it
    Promise.all([within(gsapReady(), 4000, false), within(scriptIn('app'), 4000)]).then(([ok]) => requestAnimationFrame(() => {
      if (run !== r || r.leaving) return;
      if (!ok) return still();
      const gsap = window.gsap;
      gsap.registerPlugin(window.DrawSVGPlugin);
      box.classList.add('chosen');
      r.pen = gsap.fromTo(ink, { drawSVG: '0% 0%', visibility: 'visible' }, {
        drawSVG: '0% 100%', duration: DRAW, ease: handEase(), onComplete: () => { r.drawn = true; ready(r); },
      });
    }));
  }

  // the pen slows where the line bends hard (the loop tops, the foot of the h) and runs on the straights,
  // easing in as it touches down and out on the last flick; the result is an ease over the path's length.
  // The path (M and C only, as index.html draws it) is sampled from its own curves: getPointAtLength is too slow
  function handEase() {
    if (hand) return hand;
    const n = ink.getAttribute('d').match(/-?\d*\.?\d+/g).map(Number);
    const pts = [[n[0], n[1]]];
    for (let i = 2; i + 5 < n.length; i += 6) {
      const [x0, y0] = pts[pts.length - 1];
      for (let k = 1; k <= 16; k++) {
        const q = k / 16, u = 1 - q, a = u * u * u, b = 3 * u * u * q, c = 3 * u * q * q, e = q * q * q;
        pts.push([a * x0 + b * n[i] + c * n[i + 2] + e * n[i + 4], a * y0 + b * n[i + 1] + c * n[i + 3] + e * n[i + 5]]);
      }
    }
    const along = [0];
    for (let i = 1; i < pts.length; i++) along.push(along[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = along[along.length - 1], N = Math.ceil(L / 3), step = L / N;
    const P = [];
    for (let i = 0, j = 0; i <= N; i++) {
      const s = i * step;
      while (j < along.length - 2 && along[j + 1] < s) j++;
      const f = Math.min(1, (s - along[j]) / (along[j + 1] - along[j] || 1));
      P.push({ x: pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, y: pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f });
    }
    const bend = new Float32Array(N + 1);
    for (let i = 1; i < N; i++) {
      const a = Math.atan2(P[i].y - P[i - 1].y, P[i].x - P[i - 1].x);
      const b = Math.atan2(P[i + 1].y - P[i].y, P[i + 1].x - P[i].x);
      bend[i] = Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a))) / step;
    }
    const time = new Float32Array(N + 1);
    for (let i = 1; i <= N; i++) {
      let k = 0, count = 0;
      for (let j = Math.max(1, i - 6); j <= Math.min(N - 1, i + 6); j++) { k += bend[j]; count++; }
      const s = i / N;
      const v = (1 / (1 + 22 * (k / (count || 1)))) * Math.min(1, 0.25 + s * 12) * Math.min(1, 0.35 + (1 - s) * 10);
      time[i] = time[i - 1] + 1 / v;
    }
    const T = time[N];
    hand = (x) => {
      if (x <= 0) return 0;
      if (x >= 1) return 1;
      const at = x * T;
      let lo = 0, hi = N;
      while (hi - lo > 1) { const m = (lo + hi) >> 1; if (time[m] < at) lo = m; else hi = m; }
      return (lo + (at - time[lo]) / (time[hi] - time[lo])) / N;
    };
    return hand;
  }

  /* ---------- leaving ---------- */
  function ready(r) {
    if (run !== r || r.leaving || !r.drawn || PARTS.some(([k]) => !r.done.has(k))) return;
    // a still "hello" (reduced motion) stays long enough to be read rather than flash
    const early = (reduce ? 900 : 0) - (performance.now() - r.t0);
    if (early > 0) setTimeout(() => ready(r), early);
    else leave(r, false);
  }

  function leave(r, fast) {
    if (run !== r || r.leaving) return;
    r.leaving = true;
    clearTimeout(r.cap);
    try { sessionStorage.setItem('pf-a-boot', '1'); } catch (e) { /* storage unavailable */ }
    // the desktop is painted now, while the screen still covers it
    root.classList.add('boot-out');
    const end = () => {
      if (r.pen) r.pen.kill();
      run = null;
      root.classList.remove('booting', 'boot-out');
      box.classList.remove('ready', 'chosen');
      if (themeColor && r.theme) themeColor.content = r.theme;
      if (r.wallPaused && PF.wall3d) PF.wall3d.play();
      frozen.forEach((n) => (n.inert = false));
      frozen = [];
      removeEventListener('keydown', onKey, true);
      box.removeEventListener('click', onClick);
      waiters.splice(0).forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    };
    const gsap = window.gsap;
    if (reduce || !gsap) return end();
    if (r.pen && fast) r.pen.pause();
    const tl = gsap.timeline({ onComplete: end });
    if (!fast) {
      // the bar lands on its last block, holds a beat, then the welcome screen gives way to the desktop
      tl.to(shown, { v: 1, duration: 0.3, ease: 'power1.out', overwrite: true, onUpdate: drawBar })
        .to({}, { duration: 0.4 });
    }
    tl.to(main, { autoAlpha: 0, duration: fast ? 0.15 : 0.3, ease: 'power1.in' })
      .to(box, { autoAlpha: 0, duration: fast ? 0.25 : 0.5, ease: 'power2.out' }, '-=0.1');
  }

  function onKey(e) {
    if (e.metaKey || e.ctrlKey || e.altKey || ['Shift', 'Control', 'Alt', 'Meta', 'CapsLock', 'Fn', 'Tab'].includes(e.key)) return;
    e.preventDefault();
    e.stopPropagation();
    if (run) leave(run, true);
  }
  function onClick() { if (run) leave(run, true); }

  /* ---------- hand-over ---------- */
  // runs fn once the welcome screen has gone (right away when none is showing)
  PF.bootDone = (fn) => { if (run) waiters.push(fn); else fn(); };
  PF.boot = {
    // app.js hands over the Home window it opened at startup (null when Home does not open at startup)
    home: (el) => { if (run) run.giveHome(el); },
    // Shut Down > Restart plays the welcome screen again
    replay: () => { try { sessionStorage.removeItem('pf-a-boot'); } catch (e) { /* storage unavailable */ } show(); },
  };

  if (root.classList.contains('booting')) show();
})();
