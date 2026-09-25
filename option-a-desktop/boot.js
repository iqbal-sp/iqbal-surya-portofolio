/*
  Option A: the welcome screen, after Windows XP's own (the screen that said "welcome" while it loaded your
  settings). It shows once a session while the desktop loads: "hello" is written in a pointed pen (driven by
  GSAP), the owner's account picture logs in, and the bar counts what has really arrived. Then the desktop comes
  up in XP's order. A visitor who has been welcomed before gets a quicker hand. A click or any key skips it.
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
  const main = $('.boot-main'), hello = $('.boot-hello'), line = $('.boot-line'), inkLayer = $('.boot-ink'), pic = $('.boot-pic img');
  const what = $('#bootWhat'), pct = $('#bootPct'), bar = $('#bootBar'), fill = $('#bootBar i'), say = $('#bootSay'), hint = $('#bootHint');
  const themeColor = document.querySelector('meta[name="theme-color"]');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const touch = matchMedia('(pointer: coarse)').matches;
  const liveWall = !matchMedia('(max-width: 720px), (max-height: 500px) and (pointer: coarse)').matches && !/[?&]wall=static\b/.test(location.search);

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
  const DRAW_AGAIN = 1.2;   // the same hand for a visitor it has welcomed before
  const WELCOMED = 'pf-a-welcomed';

  /* ---------- arrivals, recorded from the first byte so a later replay finds them settled ---------- */
  const SCRIPTS = { 'content.js': 'content', 'cases.js': 'cases', 'icons.js': 'icons', 'app.js': 'app', 'gsap.min.js': 'gsap' };
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
  const gsapReady = () => scriptIn('gsap').then(() => !!window.gsap);

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
      // wallpaper3d.js runs before the page's load event and fetches three.js on its own; when WebGL or the CDN
      // fails it stays on the still
      pageLoaded.then(() => PF.wall3dLoad).then(() => { mo.disconnect(); res(); });
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

  function show(replayed) {
    if (run) return;
    let welcomed = false;
    try { welcomed = localStorage.getItem(WELCOMED) === '1'; } catch (e) { /* storage unavailable */ }
    // a visitor welcomed before gets the quicker hand; Restart plays the full one again
    const r = (run = { done: new Set(), drawn: false, leaving: false, t0: performance.now(), quick: welcomed && !replayed });
    let homeIn;
    r.home = new Promise((res) => (homeIn = res));
    r.giveHome = (el) => { if (el) firstView(el).then(homeIn); else homeIn(); };

    root.classList.remove('boot-out');
    root.classList.add('booting');
    [box, main].forEach((n) => n.removeAttribute('style'));
    inkReady();
    hello.classList.remove('whole');
    inkLayer.querySelectorAll('.on').forEach((p) => p.classList.remove('on'));
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
  let pieces = null, starts = null;
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

  function write(r) {
    // the account is chosen as the hand starts: its picture takes XP's gold selected frame
    const still = () => { box.classList.add('chosen'); hello.classList.add('whole'); r.drawn = true; ready(r); };
    if (reduce) return still();
    const within = (p, ms, miss) => Promise.race([p, new Promise((res) => setTimeout(() => res(miss), ms))]);
    // the pen touches down once GSAP is here and the desktop has been built, so the long first task is behind it
    Promise.all([within(gsapReady(), 4000, false), within(scriptIn('app'), 4000)]).then(([ok]) => requestAnimationFrame(() => {
      if (run !== r || r.leaving) return;
      if (!ok) return still();
      box.classList.add('chosen');
      const pen = { at: 0 };
      let next = 0;
      r.pen = window.gsap.to(pen, {
        at: LINE.length, duration: r.quick ? DRAW_AGAIN : DRAW, ease: handEase(),
        onUpdate: () => { while (next < pieces.length && starts[next] <= pen.at) pieces[next++].classList.add('on'); },
        onComplete: () => { hello.classList.add('whole'); r.drawn = true; ready(r); },
      });
    }));
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
    try { sessionStorage.setItem('pf-a-boot', '1'); localStorage.setItem(WELCOMED, '1'); } catch (e) { /* storage unavailable */ }
    const gsap = window.gsap;
    // the desktop comes up in XP's steps after the screen; a skip, reduced motion or a missing GSAP brings it up whole
    const steps = !fast && !reduce && !!gsap;
    // the wallpaper is painted now, while the screen still covers it
    root.classList.add('boot-out');
    if (!steps) root.classList.add('boot-in');
    const end = () => {
      if (r.pen) r.pen.kill();
      run = null;
      root.classList.remove('booting', 'boot-out', 'boot-in');
      box.classList.remove('ready', 'chosen');
      if (themeColor && r.theme) themeColor.content = r.theme;
      if (r.wallPaused && PF.wall3d) PF.wall3d.play();
      frozen.forEach((n) => (n.inert = false));
      frozen = [];
      removeEventListener('keydown', onKey, true);
      box.removeEventListener('click', onClick);
      waiters.splice(0).forEach((fn) => { try { fn(); } catch (e) { console.error(e); } });
    };
    if (reduce || !gsap) return end();
    if (r.pen && fast) r.pen.pause();
    const q = r.quick ? 0.6 : 1;
    const tl = gsap.timeline({ onComplete: end });
    if (!fast) {
      // the bar lands on its last block, holds a beat, then the welcome screen gives way to the desktop
      tl.to(shown, { v: 1, duration: 0.3 * q, ease: 'power1.out', overwrite: true, onUpdate: drawBar })
        .to({}, { duration: 0.4 * q });
    }
    tl.to(main, { autoAlpha: 0, duration: fast ? 0.15 : 0.3 * q, ease: 'power1.in' })
      .to(box, { autoAlpha: 0, duration: fast ? 0.25 : 0.5 * q, ease: 'power2.out' }, '-=0.1');
    if (steps) tl.add(enter(q));
  }

  // XP brought the desktop up in steps after its Welcome screen: the wallpaper first, then the taskbar and the
  // icons, and the startup window last, zooming open from its icon in the 2px outline app.js also draws
  function enter(q) {
    const gsap = window.gsap;
    const taskbar = document.querySelector('.taskbar');
    const icons = Array.from(document.querySelectorAll('#deskIcons > li'));
    const layer = document.getElementById('windows');
    const win = layer && (layer.querySelector('.win.active') || layer.querySelector('.win'));
    const tl = gsap.timeline();
    tl.add(() => {
      gsap.set(taskbar, { yPercent: 100 });
      gsap.set(icons, { autoAlpha: 0, y: 6 });
      gsap.set(layer, { autoAlpha: 0 });
      root.classList.add('boot-in');
    })
      .to(taskbar, { yPercent: 0, duration: 0.28 * q, ease: 'power2.out' })
      .to(icons, { autoAlpha: 1, y: 0, duration: 0.2 * q, ease: 'power2.out', stagger: 0.03 * q }, 0.06 * q);
    if (win) tl.add(zoomOpen(win, q), `>-${0.08 * q}`);
    return tl.set(layer, { autoAlpha: 1 })
      .add(() => gsap.set([taskbar, layer, ...icons], { clearProps: 'transform,opacity,visibility' }));
  }
  function zoomOpen(win, q) {
    const gsap = window.gsap, zr = document.getElementById('zoomRect');
    const icon = document.querySelector(`.dicon[data-desk="${win.dataset.id}"] .px`);
    if (!zr || !icon) return gsap.timeline();
    const to = (k) => () => win.getBoundingClientRect()[k];
    return gsap.timeline()
      .add(() => { const a = icon.getBoundingClientRect(); gsap.set(zr, { display: 'block', left: a.left, top: a.top, width: a.width, height: a.height }); })
      .to(zr, { left: to('left'), top: to('top'), width: to('width'), height: to('height'), duration: 0.16 * q, ease: 'steps(7)' })
      .set(zr, { display: 'none' });
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
    replay: () => { try { sessionStorage.removeItem('pf-a-boot'); } catch (e) { /* storage unavailable */ } show(true); },
  };

  if (root.classList.contains('booting')) show();
})();
