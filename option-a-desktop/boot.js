/*
  Option A: the welcome screen, after Windows XP's own (the screen that said "welcome" while it loaded your
  settings). It shows once a session while the desktop loads: "hello" is written in a pointed pen, and below it
  the owner's picture, name and the bar that counts what has really arrived. The bar alone decides when the
  portfolio is in; the hand keeps its own tempo. There is no skip: the screen is there so every part has loaded
  before the visitor moves around. A part that fails, or has not answered in 9s, is left out of the bar, the
  status says so, and the screen never stays past 12s. Then the desktop comes up in XP's order.
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
  const main = $('.boot-main'), hello = $('.boot-hello'), line = $('.boot-line'), inkLayer = $('.boot-ink'), pic = $('.boot-pic img');
  const dots = $('.boot-dots'), what = $('#bootWhat'), pct = $('#bootPct'), bar = $('#bootBar'), fill = $('#bootBar i'), say = $('#bootSay');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const liveWall = !matchMedia('(max-width: 720px), (max-height: 500px) and (pointer: coarse)').matches && !/[?&]wall=static\b/.test(location.search);

  const TXT = {
    en: {
      photo: 'Loading your host’s photo', fonts: 'Preparing the text', content: 'Loading the portfolio', cases: 'Loading the projects',
      icons: 'Loading icons', app: 'Starting the desktop', wall: 'Loading the wallpaper',
      home: 'Opening Home', wall3d: 'Preparing the wallpaper', ready: 'Welcome in', aria: 'Loading the portfolio',
      missed: 'Some parts haven’t loaded', missedSay: 'Some parts haven’t loaded. Opening the desktop.',
    },
    id: {
      photo: "Memuat foto Iqbal", fonts: "Menyiapkan teks", content: "Memuat portofolio", cases: "Memuat proyek",
      icons: 'Memuat ikon', app: 'Menyiapkan desktop', wall: 'Memuat wallpaper',
      home: "Membuka Beranda", wall3d: "Menyiapkan wallpaper", ready: "Selamat datang", aria: 'Memuat portofolio',
      missed: 'Sebagian belum termuat', missedSay: 'Sebagian belum termuat. Membuka desktop.',
    },
  };
  const t = (k) => (TXT[root.lang === 'id' ? 'id' : 'en'])[k];

  // what the bar counts, in the order the status line names it; each weight is the part's rough share of
  // the bytes, so the bar moves with the wait and not with the count
  const PARTS = [['photo', 2], ['fonts', 6], ['content', 3], ['cases', 5], ['icons', 4], ['app', 10], ['wall', 3], ['home', 30]]
    .concat(liveWall ? [['wall3d', 25]] : []);
  const TOTAL = PARTS.reduce((s, [, w]) => s + w, 0);
  const PART_WAIT = 9000;   // a part that has not answered by then is left out of the bar
  const CAP = 12000;        // the visitor never waits longer than this; the rest keeps loading behind the desktop
  const MISSED_HOLD = 1200; // long enough to read that some parts are missing
  const TOUCH_DOWN = 0.25;  // seconds before the pen touches down, so the picture's pale frame is seen first
  const DRAW = 2.1;         // seconds the hand takes to write "hello"
  const DRAW_AGAIN = 1.2;   // the same hand for a visitor it has welcomed before
  const WELCOMED = 'pf-a-welcomed';

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

  // true when the picture decoded, false when it failed
  const imgReady = (img) => new Promise((res) => {
    const done = () => (img.decode ? img.decode().then(() => true, () => img.naturalWidth > 0) : Promise.resolve(img.naturalWidth > 0)).then(res);
    if (img.complete) done();
    else { img.addEventListener('load', done, { once: true }); img.addEventListener('error', () => res(false), { once: true }); }
  });
  const urlReady = (src) => { const img = new Image(); img.src = src; return imgReady(img); };
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
    return allOk(waits);
  }

  /* ---------- the field: XP's logon light, drawn in the wallpaper's ordered-dither dots ---------- */
  // 2px dots, 16 levels a channel. Around "hello" the light is held back to where even the dither's lighter
  // dot keeps white's 3:1, easing back over a wide feather, so the hand never loses its contrast to the dots and
  // the light simply fades a little sooner there
  const BAYER = [0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54, 22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29, 53, 21];
  const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  const lum = (c) => 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]);
  const LUM_MAX = 1.05 / 3 - 0.05;   // the lightest a dot may be for white to keep 3:1 on it
  const BASE = [0x5a, 0x7e, 0xdc], LIGHT = [0xa6, 0xc4, 0xf7], LEVEL = 255 / 15;
  // the most light the field may take under the word: the lighter dot the dither can draw there (every
  // channel rounded up a level) still under the ceiling
  const A_WORD = (() => {
    const top = (a) => BASE.map((b, c) => Math.min(255, Math.ceil((b + (LIGHT[c] - b) * a) / LEVEL) * LEVEL));
    let a = 0;
    while (a < 0.8 && lum(top(a + 0.005)) <= LUM_MAX) a += 0.005;
    return a;
  })();
  function paintField() {
    const DOT = 2, step = LEVEL, FEATHER = 96;
    if (!dots) return;
    const w = Math.ceil(main.clientWidth / DOT), h = Math.ceil(main.clientHeight / DOT);
    if (!w || !h) return;
    dots.width = w; dots.height = h;
    const ctx = dots.getContext('2d'), img = ctx.createImageData(w, h), d = img.data;
    const m = main.getBoundingClientRect(), hr = hello.getBoundingClientRect();
    const x0 = (hr.left - m.left) / DOT, x1 = (hr.right - m.left) / DOT, y0 = (hr.top - m.top) / DOT, y1 = (hr.bottom - m.top) / DOT;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        // Welcome Light from the top left: 80% at the corner, gone by 60% of a 90% radius
        let a = 0.8 * Math.max(0, 1 - Math.hypot(x / w / 0.9, y / h / 0.9) / 0.6);
        // how close the dot is to the word's box: 1 inside, easing to 0 over FEATHER dots outside
        const dist = Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(y0 - y, 0, y - y1));
        const t = Math.min(1, dist / FEATHER), near = 1 - t * t * (3 - 2 * t);
        if (near > 0 && a > A_WORD) a -= (a - A_WORD) * near;
        const th = (BAYER[(y & 7) * 8 + (x & 7)] + 0.5) / 64, i = (y * w + x) * 4;
        for (let c = 0; c < 3; c++) {
          const lv = (BASE[c] + (LIGHT[c] - BASE[c]) * a) / step, lo = Math.floor(lv);
          d[i + c] = Math.min(255, (lv - lo > th ? lo + 1 : lo) * step);
        }
        d[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }
  let resizing;
  addEventListener('resize', () => { if (!run) return; clearTimeout(resizing); resizing = setTimeout(paintField, 150); });

  /* ---------- the hand ---------- */
  // "hello" is one centreline (the hidden .boot-line, M and C only), sampled from its own curves every 1.5 units
  // (getPointAtLength is too slow); both the pen's weight and its pace are read from it
  const LINE = (() => {
    const n = line.getAttribute('d').match(/-?\d*\.?\d+/g).map(Number);
    const pts = [[n[0], n[1]]];
    for (let i = 2; i + 5 < n.length; i += 6) {
      const [x0, y0] = pts[pts.length - 1];
      for (let k = 1; k <= 24; k++) {
        const q = k / 24, u = 1 - q, a = u * u * u, b = 3 * u * u * q, c = 3 * u * q * q, e = q * q * q;
        pts.push([a * x0 + b * n[i] + c * n[i + 2] + e * n[i + 4], a * y0 + b * n[i + 1] + c * n[i + 3] + e * n[i + 5]]);
      }
    }
    const along = [0];
    for (let i = 1; i < pts.length; i++) along.push(along[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const length = along[along.length - 1], N = Math.ceil(length / 1.5), step = length / N, P = [];
    for (let i = 0, j = 0; i <= N; i++) {
      const s = i * step;
      while (j < along.length - 2 && along[j + 1] < s) j++;
      const f = Math.min(1, (s - along[j]) / (along[j + 1] - along[j] || 1));
      P.push([pts[j][0] + (pts[j + 1][0] - pts[j][0]) * f, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * f]);
    }
    return { P, step, length };
  })();

  // a pointed pen, in viewBox units: the line swells to `heavy` where it runs down the lettering's 13.5deg slant
  // and thins to a `hair` going up or across, softened over a few units and lifted to a hairline at both ends.
  // It is drawn as 3-unit round-capped pieces, so the pen can reveal them one after another
  const PEN = { hair: 3.8, heavy: 13.5, swell: 1.6, soften: 14, lift: 10, slant: Math.atan(0.24) };
  let pieces = null, starts = null, hand = null;
  function inkReady() {
    if (pieces) return;
    const { P, step } = LINE, n = P.length;
    const ax = -Math.sin(PEN.slant), ay = Math.cos(PEN.slant);
    const raw = P.map((_, i) => {
      const a = P[Math.max(0, i - 2)], b = P[Math.min(n - 1, i + 2)];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      return PEN.hair + (PEN.heavy - PEN.hair) * Math.max(0, (dx * ax + dy * ay) / (Math.hypot(dx, dy) || 1)) ** PEN.swell;
    });
    const R = Math.round(PEN.soften / step), T = Math.round(PEN.lift / step);
    const w = raw.map((_, i) => {
      let s = 0, c = 0;
      for (let j = Math.max(0, i - R); j <= Math.min(n - 1, i + R); j++) { s += raw[j]; c++; }
      const edge = Math.min(i, n - 1 - i);
      return (s / c) * (edge < T ? 0.35 + 0.65 * (edge / T) : 1);
    });
    let html = '';
    starts = [];
    for (let i = 0; i < n - 1; i += 2) {
      const k = Math.min(n - 1, i + 2);
      html += `<path d="M${P.slice(i, k + 1).map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L')}" stroke-width="${((w[i] + w[k]) / 2).toFixed(2)}"/>`;
      starts.push(i * step);
    }
    inkLayer.innerHTML = html;
    pieces = Array.from(inkLayer.children);
  }

  // the pen slows where the line bends hard (the loop tops, the foot of the h) and runs on the straights,
  // easing in as it touches down and out on the last flick; the result is an ease over the line's length
  function handEase() {
    if (hand) return hand;
    const { P, step } = LINE, N = P.length - 1;
    const bend = new Float32Array(N + 1);
    for (let i = 1; i < N; i++) {
      const a = Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0]);
      const b = Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0]);
      bend[i] = Math.abs(Math.atan2(Math.sin(b - a), Math.cos(b - a))) / step;
    }
    const R = Math.round(18 / step);
    const time = new Float32Array(N + 1);
    for (let i = 1; i <= N; i++) {
      let k = 0, count = 0;
      for (let j = Math.max(1, i - R); j <= Math.min(N - 1, i + R); j++) { k += bend[j]; count++; }
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

  /* ---------- one showing of the screen ---------- */
  let run = null;
  const waiters = [];
  let frozen = [];

  function show(replayed) {
    if (run) return;
    let welcomed = false;
    try { welcomed = localStorage.getItem(WELCOMED) === '1'; } catch (e) { /* storage unavailable */ }
    // a visitor welcomed before gets the quicker hand; Restart plays the full one again
    const quick = welcomed && !replayed;
    const now = performance.now();
    const r = (run = {
      ok: new Set(), missed: new Set(), shown: 0, label: '', penT: 0, next: 0, drawn: reduce, holding: false, leaving: false,
      t0: now, last: now, quick, draw: quick ? DRAW_AGAIN : DRAW,
    });
    let homeIn;
    r.home = new Promise((res) => (homeIn = res));
    r.giveHome = (el) => { if (el) firstView(el).then(homeIn); else homeIn(true); };

    root.classList.remove('boot-out', 'boot-in');
    root.classList.add('booting');
    box.classList.remove('ready', 'chosen');
    [box, main].forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
    inkReady();
    hello.classList.toggle('whole', reduce);
    inkLayer.querySelectorAll('.on').forEach((p) => p.classList.remove('on'));
    if (reduce) box.classList.add('chosen');
    drawBar(r);
    bar.setAttribute('aria-label', t('aria'));
    say.textContent = `${t('aria')}…`;
    if (themeColor) { r.theme = themeColor.content; themeColor.content = '#00309c'; }
    frozen = Array.from(document.body.children).filter((n) => n !== box && n.tagName !== 'SCRIPT' && !n.inert);
    frozen.forEach((n) => (n.inert = true));
    requestAnimationFrame(paintField);

    const checks = {
      photo: () => imgReady(pic),
      fonts: () => (document.fonts
        ? Promise.all(['400 16px "Noto Sans"', '700 16px "Noto Sans"'].map((f) => document.fonts.load(f))).then((sets) => sets.every((s) => s.length > 0))
        : true),
      content: () => scriptIn('content'),
      cases: () => scriptIn('cases'),
      icons: () => scriptIn('icons'),
      app: () => scriptIn('app'),
      wall: () => allOk(cssUrls(getComputedStyle(document.getElementById('desktop')).backgroundImage).map(urlReady)),
      home: () => r.home,
      // once its first frame is up, the live wallpaper waits behind the screen so the hand gets every frame
      wall3d: () => wall3dReady().then((ok) => { if (run === r && PF.wall3d) { PF.wall3d.pause(); r.wallPaused = true; } return ok; }),
    };
    PARTS.forEach(([k]) => {
      const late = new Promise((res) => setTimeout(() => res(false), PART_WAIT));
      Promise.race([Promise.resolve().then(checks[k]), late]).catch(() => false).then((ok) => settle(r, k, !!ok));
    });
    // whatever has not arrived by the cap is left out, the status says so, and the screen goes at 12s
    r.warn = setTimeout(() => { PARTS.forEach(([k]) => settle(r, k, false)); }, CAP - MISSED_HOLD);
    r.cap = setTimeout(() => leave(r), CAP);
    requestAnimationFrame((ts) => tick(r, ts));
  }

  function settle(r, key, ok) {
    if (run !== r || r.ok.has(key) || r.missed.has(key)) return;
    (ok ? r.ok : r.missed).add(key);
  }
  const got = (r) => PARTS.reduce((s, [k, w]) => s + (r.ok.has(k) ? w : 0), 0) / TOTAL;
  const settled = (r) => PARTS.every(([k]) => r.ok.has(k) || r.missed.has(k));

  // the bar fills in XP's whole blocks (8px green, 2px gap), eases toward what has arrived and never runs ahead
  // of it; the status names the first part still coming and says welcome only once the bar has landed
  function drawBar(r) {
    const inner = Math.max(0, bar.clientWidth - 4);
    fill.style.width = `${r.shown >= 0.999 ? inner : Math.floor((r.shown * inner) / 10) * 10}px`;
    const p = Math.round(r.shown * 100);
    pct.textContent = `${p}%`;
    const next = PARTS.find(([k]) => !r.ok.has(k) && !r.missed.has(k));
    if (next) r.label = t(next[0]);
    what.textContent = r.missed.size && settled(r) ? t('missed')
      : r.shown >= 0.999 ? t('ready')
      : `${r.label || t(PARTS[0][0])}…`;
    bar.setAttribute('aria-valuenow', p);
    bar.setAttribute('aria-valuetext', `${p}%, ${what.textContent}`);
  }

  // one frame: the bar and the pen, each at its own pace
  function tick(r, now) {
    if (run !== r || r.leaving) return;
    const dt = Math.min(0.25, (now - r.last) / 1000);
    r.last = now;
    const target = got(r);
    r.shown = reduce ? target : r.shown + (target - r.shown) * (1 - Math.exp(-dt / 0.16));
    if (Math.abs(target - r.shown) < 0.002) r.shown = target;
    drawBar(r);
    // the account is chosen as the hand touches down: its picture takes XP's gold selected frame
    if (!r.drawn && (now - r.t0) / 1000 >= TOUCH_DOWN) {
      box.classList.add('chosen');
      r.penT = Math.min(r.draw, r.penT + dt);
      const at = handEase()(r.penT / r.draw) * LINE.length;
      while (r.next < pieces.length && starts[r.next] <= at) pieces[r.next++].classList.add('on');
      if (r.penT >= r.draw) { r.drawn = true; hello.classList.add('whole'); }
    }
    ready(r);
    requestAnimationFrame((ts) => tick(r, ts));
  }

  /* ---------- leaving ---------- */
  function ready(r) {
    if (r.holding || r.leaving || !r.drawn || !settled(r)) return;
    const q = r.quick ? 0.6 : 1;
    if (r.missed.size) {
      // some parts are missing: the bar stays where it truly is, and the status says so before the desktop opens
      r.holding = true;
      box.classList.add('ready');
      say.textContent = t('missedSay');
      setTimeout(() => leave(r), MISSED_HOLD);
      return;
    }
    if (r.shown < 0.999) return;
    r.holding = true;
    box.classList.add('ready');
    say.textContent = t('ready');
    // the bar holds its last block a beat; a still "hello" (reduced motion) stays long enough to be read
    const hold = Math.max(400 * q, reduce ? 900 - (performance.now() - r.t0) : 0);
    setTimeout(() => leave(r), hold);
  }

  function leave(r) {
    if (run !== r || r.leaving) return;
    r.leaving = true;
    clearTimeout(r.cap);
    clearTimeout(r.warn);
    try { sessionStorage.setItem('pf-a-boot', '1'); localStorage.setItem(WELCOMED, '1'); } catch (e) { /* storage unavailable */ }
    const q = r.quick ? 0.6 : 1;
    // the wallpaper is painted now, while the screen still covers it
    root.classList.add('boot-out');
    if (reduce) root.classList.add('boot-in');
    const end = () => {
      run = null;
      root.classList.remove('booting', 'boot-out', 'boot-in');
      box.classList.remove('ready', 'chosen');
      [box, main].forEach((n) => n.getAnimations().forEach((a) => a.cancel()));
      if (themeColor && r.theme) themeColor.content = r.theme;
      if (r.wallPaused && PF.wall3d) PF.wall3d.play();
      frozen.forEach((n) => (n.inert = false));
      frozen = [];
      waiters.splice(0).forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    };
    if (reduce) return end();
    // the content fades, then the screen, and the desktop comes up in XP's steps behind it
    const fade = (el, ms, easing) => el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: ms, easing, fill: 'forwards' }).finished;
    fade(main, 300 * q, 'ease-in')
      .then(() => fade(box, 500 * q, 'ease-out'))
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

  /* ---------- hand-over ---------- */
  // runs fn once the welcome screen has gone (right away when none is showing)
  PF.bootDone = (fn) => { if (run) waiters.push(fn); else fn(); };
  PF.boot = {
    // app.js hands over the Home window it opened at startup (null when Home does not open at startup)
    home: (el) => { if (run) run.giveHome(el); },
    // Shut Down > Restart plays the welcome screen again
    replay: () => { try { sessionStorage.removeItem('pf-a-boot'); } catch (e) { /* storage unavailable */ } show(true); },
  };

  if (root.classList.contains('booting')) show();
})();
