/* Option A — the site's volume and Winamp.

   PF.volume: the master volume behind the tray's speaker. Every sound on the site goes through it: Winamp, Boss Rush
   XP and Screen Saver XP each route their output through PF.volume.node(ctx). Its flyout is XP's tray volume: a
   vertical slider and a Mute box over the speaker. The level and the mute are kept in localStorage.
     level, muted, set(0..100), setMuted(bool), node(audioContext) -> GainNode, on(fn) -> off(), tray(lang)

   PF.winamp: a music player skinned after Winamp 5's Winamp Modern, drawn in CSS and canvases (no Winamp bitmaps):
   one window with a title bar, a File/Play/View menubar, a big visualizer (Bliss, Spectrum, Oscilloscope), a blue
   LCD, the position bar, round transport keys, the volume (the site's own) and Eject and PL, the playlist folding out
   under it. It plays the MP3s listed in asset/music/playlist.json, and a visitor's own files picked with Eject or
   Add (played in the page, never uploaded).
     available() -> Promise<bool>, mount(host, { changed }), caption(), stop()
*/
(() => {
  'use strict';
  const PF = window.PF;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const lang = () => (PF.getLang ? PF.getLang() : 'en');
  const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const AC = window.AudioContext || window.webkitAudioContext;

  const STR = {
    en: {
      volume: 'Volume', mute: 'Mute', volPct: (n) => `Volume: ${n}%`, volMuted: 'Volume: muted',
      play: 'Play', pause: 'Pause', stop: 'Stop', prev: 'Previous track', next: 'Next track', eject: 'Open files…',
      shuffle: 'Shuffle', repeat: 'Repeat', seek: 'Position in the song', pl: 'Playlist',
      minimize: 'Minimize', close: 'Close', remain: 'Show time remaining', vis: 'Visualization',
      visPrev: 'Previous visualization', visNext: 'Next visualization', visRnd: 'Change visualization by itself', random: 'Random',
      vis_bliss: 'Bliss', vis_bars: 'Spectrum', vis_scope: 'Oscilloscope',
      menu_file: 'File', menu_play: 'Play', menu_view: 'View',
      add: 'Add files', addShort: 'Add files', rem: 'Remove the selected song', remShort: 'Remove', list: 'Songs', nowPlaying: 'Now playing', unavailable: 'This video can\'t be played here',
      tracks: (n, t) => `${n} ${n === 1 ? 'song' : 'songs'} · ${t}`, empty: 'Press Eject to play your own songs', emptyList: 'No songs yet. Add your own with Add files.',
    },
    id: {
      volume: 'Volume', mute: 'Bisukan', volPct: (n) => `Volume: ${n}%`, volMuted: 'Volume: dibisukan',
      play: 'Putar', pause: 'Jeda', stop: 'Berhenti', prev: 'Lagu sebelumnya', next: 'Lagu berikutnya', eject: 'Buka file…',
      shuffle: 'Acak', repeat: 'Ulangi', seek: 'Posisi lagu', pl: 'Playlist',
      minimize: 'Minimalkan', close: 'Tutup', remain: 'Tampilkan sisa waktu', vis: 'Visualisasi',
      visPrev: 'Visualisasi sebelumnya', visNext: 'Visualisasi berikutnya', visRnd: 'Ganti visualisasi sendiri', random: 'Acak',
      vis_bliss: 'Bliss', vis_bars: 'Spektrum', vis_scope: 'Osiloskop',
      menu_file: 'File', menu_play: 'Putar', menu_view: 'Tampilan',
      add: 'Tambah file', addShort: 'Tambah file', rem: 'Hapus lagu yang dipilih', remShort: 'Hapus', list: 'Daftar lagu', nowPlaying: 'Sedang diputar', unavailable: 'Video ini tidak bisa diputar di sini',
      tracks: (n, t) => `${n} lagu · ${t}`, empty: 'Tekan Eject untuk memutar lagumu sendiri', emptyList: 'Belum ada lagu. Tambahkan lagumu dengan Tambah file.',
    },
  };
  const s = (k, ...a) => { const v = (STR[lang()] || STR.en)[k]; return typeof v === 'function' ? v(...a) : v; };

  /* ================================================================ the site's volume */
  const VKEY = 'pf-volume';
  const vol = { level: 80, muted: false };
  try { const v = JSON.parse(store.get(VKEY) || 'null'); if (v && Number.isFinite(+v.level)) { vol.level = clamp(Math.round(+v.level), 0, 100); vol.muted = !!v.muted; } } catch (e) { /* a broken entry keeps the defaults */ }
  const gains = new Set(), subs = new Set();
  // the slider reads as loudness: the gain follows its square, so the lower half isn't all near silence
  const amount = () => (vol.muted ? 0 : (vol.level / 100) ** 2);
  function volApply() {
    const g = amount();
    gains.forEach((n) => {
      const c = n.context;
      if (c.state === 'closed') { gains.delete(n); return; }
      n.gain.setTargetAtTime(g, c.currentTime, 0.015);
    });
    subs.forEach((fn) => fn(vol));
    volPaint();
  }
  const volSave = () => store.set(VKEY, JSON.stringify(vol));
  // a short tone at the new level when the slider is let go, as XP's tray volume answered
  let blipCtx = null;
  function blip() {
    if (!AC || vol.muted || !vol.level) return;
    try {
      if (!blipCtx) blipCtx = new AC();
      if (blipCtx.state === 'suspended') blipCtx.resume();
      const c = blipCtx, t = c.currentTime + 0.01, o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(0.18, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12);
      o.connect(g); g.connect(PF.volume.node(c)); o.start(t); o.stop(t + 0.14);
    } catch (e) { /* no sound is fine */ }
  }

  PF.volume = {
    get level() { return vol.level; },
    get muted() { return vol.muted; },
    get amount() { return amount(); },
    set(level) { vol.level = clamp(Math.round(level), 0, 100); if (vol.level > 0 && vol.muted) vol.muted = false; volSave(); volApply(); },
    setMuted(m) { vol.muted = !!m; volSave(); volApply(); },
    // a gain at the end of a context's chain, kept at the site's level: connect a sound's master to it instead of
    // ctx.destination
    node(ctx) {
      let n = null;
      gains.forEach((x) => { if (x.context === ctx) n = x; });
      if (n) return n;
      n = ctx.createGain(); n.gain.value = amount(); n.connect(ctx.destination); gains.add(n);
      return n;
    },
    on(fn) { subs.add(fn); return () => subs.delete(fn); },
    tray: volPaint,
  };

  /* ---- the tray's speaker and its flyout ---- */
  const speaker = document.getElementById('volBtn');
  let fly = null;
  function volPaint() {
    if (!speaker) return;
    const icon = window.PXI ? window.PXI.svg(vol.muted || !vol.level ? 'soundMute' : 'sound', 16) : '';
    const label = vol.muted ? s('volMuted') : s('volPct', vol.level);
    const key = vol.muted || !vol.level ? 'off' : 'on';
    if (speaker.dataset.icon !== key) { speaker.innerHTML = icon; speaker.dataset.icon = key; }
    speaker.setAttribute('aria-label', label); speaker.title = label;
    if (fly) {
      const r = fly.querySelector('input[type="range"]'), m = fly.querySelector('input[type="checkbox"]');
      if (+r.value !== vol.level) r.value = vol.level;
      r.setAttribute('aria-valuetext', `${vol.level}%`);
      m.checked = vol.muted;
    }
  }
  function flyOpen() {
    if (fly) return;
    fly = document.createElement('div');
    fly.className = 'vol-fly'; fly.setAttribute('role', 'dialog'); fly.setAttribute('aria-label', s('volume'));
    fly.innerHTML = `<span class="vol-h" aria-hidden="true">${esc(s('volume'))}</span>
      <span class="vol-track"><input type="range" min="0" max="100" step="1" value="${vol.level}" aria-label="${esc(s('volume'))}"><i class="vol-ticks" aria-hidden="true"></i></span>
      <label class="chk vol-mute"><input type="checkbox"${vol.muted ? ' checked' : ''}><span>${esc(s('mute'))}</span></label>`;
    document.body.appendChild(fly);
    const r = speaker.getBoundingClientRect();
    fly.style.left = clamp(Math.round(r.left + r.width / 2 - fly.offsetWidth / 2), 4, innerWidth - fly.offsetWidth - 4) + 'px';
    const range = fly.querySelector('input[type="range"]');
    range.addEventListener('input', () => PF.volume.set(+range.value));
    range.addEventListener('change', blip);
    fly.querySelector('input[type="checkbox"]').addEventListener('change', (e) => { PF.volume.setMuted(e.target.checked); if (!e.target.checked) blip(); });
    fly.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); flyClose(true); }
      // the flyout keeps the keys while it is open: Tab goes round its two controls
      if (e.key === 'Tab') {
        const f = Array.from(fly.querySelectorAll('input')), i = f.indexOf(document.activeElement);
        e.preventDefault(); f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    });
    fly.addEventListener('focusout', (e) => { const t = e.relatedTarget; if (t && !fly.contains(t) && t !== speaker) flyClose(false); });
    speaker.setAttribute('aria-expanded', 'true');
    volPaint();
    range.focus({ preventScroll: true });
  }
  function flyClose(back) {
    if (!fly) return;
    const had = fly.contains(document.activeElement);
    fly.remove(); fly = null;
    speaker.setAttribute('aria-expanded', 'false');
    if (back || had) speaker.focus({ preventScroll: true });
  }
  if (speaker) {
    speaker.addEventListener('click', () => (fly ? flyClose(true) : flyOpen()));
    document.addEventListener('pointerdown', (e) => { if (fly && !fly.contains(e.target) && !speaker.contains(e.target)) flyClose(false); });
    window.addEventListener('resize', () => flyClose(false));
    volPaint();
  }

  /* ================================================================ the LCD's letters and digits */
  // a 5x7 dot-matrix font, as character LCDs drew it: capitals, digits and the marks a song title needs; lower case
  // reads as capitals and accents are dropped
  const F57 = {
    A: '.###.|#...#|#...#|#####|#...#|#...#|#...#', B: '####.|#...#|#...#|####.|#...#|#...#|####.', C: '.###.|#...#|#....|#....|#....|#...#|.###.',
    D: '###..|#..#.|#...#|#...#|#...#|#..#.|###..', E: '#####|#....|#....|####.|#....|#....|#####', F: '#####|#....|#....|####.|#....|#....|#....',
    G: '.###.|#...#|#....|#.###|#...#|#...#|.####', H: '#...#|#...#|#...#|#####|#...#|#...#|#...#', I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.',
    J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..', K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#', L: '#....|#....|#....|#....|#....|#....|#####',
    M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#', N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#', O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
    P: '####.|#...#|#...#|####.|#....|#....|#....', Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#', R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
    S: '.####|#....|#....|.###.|....#|....#|####.', T: '#####|..#..|..#..|..#..|..#..|..#..|..#..', U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
    V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..', W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.', X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
    Y: '#...#|#...#|#...#|.#.#.|..#..|..#..|..#..', Z: '#####|....#|...#.|..#..|.#...|#....|#####',
    0: '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.', 1: '..#..|.##..|..#..|..#..|..#..|..#..|.###.', 2: '.###.|#...#|....#|...#.|..#..|.#...|#####',
    3: '#####|...#.|..#..|...#.|....#|#...#|.###.', 4: '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.', 5: '#####|#....|####.|....#|....#|#...#|.###.',
    6: '..##.|.#...|#....|####.|#...#|#...#|.###.', 7: '#####|....#|...#.|..#..|.#...|.#...|.#...', 8: '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
    9: '.###.|#...#|#...#|.####|....#|...#.|.##..',
    '.': '.....|.....|.....|.....|.....|.##..|.##..', ',': '.....|.....|.....|.....|.##..|..#..|.#...', ':': '.....|.##..|.##..|.....|.##..|.##..|.....',
    ';': '.....|.##..|.##..|.....|.##..|..#..|.#...', '-': '.....|.....|.....|#####|.....|.....|.....', _: '.....|.....|.....|.....|.....|.....|#####',
    '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.', ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...', '[': '.###.|.#...|.#...|.#...|.#...|.#...|.###.',
    ']': '.###.|...#.|...#.|...#.|...#.|...#.|.###.', "'": '.##..|..#..|.#...|.....|.....|.....|.....', '"': '.#.#.|.#.#.|.#.#.|.....|.....|.....|.....',
    '!': '..#..|..#..|..#..|..#..|.....|.....|..#..', '?': '.###.|#...#|....#|...#.|..#..|.....|..#..', '/': '.....|....#|...#.|..#..|.#...|#....|.....',
    '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#', '*': '.....|..#..|#.#.#|.###.|#.#.#|..#..|.....', '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
    '=': '.....|.....|#####|.....|#####|.....|.....', '#': '.#.#.|.#.#.|#####|.#.#.|#####|.#.#.|.#.#.', '@': '.###.|#...#|....#|.##.#|#.#.#|#.#.#|.###.',
    '%': '##...|##..#|...#.|..#..|.#...|#..##|...##', '~': '.....|.....|.#...|#.#.#|...#.|.....|.....', '<': '...#.|..#..|.#...|#....|.#...|..#..|...#.',
    '>': '.#...|..#..|...#.|....#|...#.|..#..|.#...',
  };
  const DOTS = {};
  Object.keys(F57).forEach((k) => {
    const d = [];
    F57[k].split('|').forEach((row, y) => { for (let x = 0; x < 5; x++) if (row[x] === '#') d.push(x, y); });
    DOTS[k] = d;
  });
  const plain = (t) => String(t).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  // text in device pixels: each dot u pixels square, its last gap pixels left dark so a large size reads as a matrix
  const dotsW = (t, u) => Math.max(0, plain(t).length * 6 - 1) * u;
  function dots(c, t, x, y, u, color, gap = 0) {
    c.fillStyle = color;
    const str = plain(t), d = u - gap;
    for (let i = 0; i < str.length; i++) {
      const g = DOTS[str[i]]; if (!g) continue;
      const ox = x + i * 6 * u;
      for (let k = 0; k < g.length; k += 2) c.fillRect(ox + g[k] * u, y + g[k + 1] * u, d, d);
    }
  }
  // the cells of a field with nothing in it: every dot faintly there, as on a real LCD
  function cells(c, x, y, n, u, color) {
    c.fillStyle = color;
    const d = u >= 2 ? u - 1 : u;
    for (let i = 0; i < n; i++) for (let r = 0; r < 7; r++) for (let k = 0; k < 5; k++) c.fillRect(x + (i * 6 + k) * u, y + r * u, d, d);
  }
  // a seven-segment digit 13 by 24 (in CSS pixels, on a scaled context), slanted a little; segs lists the lit ones
  const DIGIT = ['abcdef', 'bc', 'abdeg', 'abcdg', 'bcfg', 'acdfg', 'acdefg', 'abc', 'abcdefg', 'abcdfg'];
  function seg7(c, x, y, segs, color, w = 13) {
    const h = 24, t = 3, g = 0.6, k = t / 2, L = k, R = w - k, T = k, M = h / 2, B = h - k;
    c.save(); c.translate(x, y); c.transform(1, 0, -0.08, 1, 0.08 * h, 0);
    c.fillStyle = color; c.beginPath();
    const hz = (yc) => { c.moveTo(L + g, yc); c.lineTo(L + g + k, yc - k); c.lineTo(R - g - k, yc - k); c.lineTo(R - g, yc); c.lineTo(R - g - k, yc + k); c.lineTo(L + g + k, yc + k); c.closePath(); };
    const vt = (xc, y0, y1) => { c.moveTo(xc, y0 + g); c.lineTo(xc + k, y0 + g + k); c.lineTo(xc + k, y1 - g - k); c.lineTo(xc, y1 - g); c.lineTo(xc - k, y1 - g - k); c.lineTo(xc - k, y0 + g + k); c.closePath(); };
    for (const q of segs) {
      if (q === 'a') hz(T); else if (q === 'd') hz(B); else if (q === 'g') hz(M);
      else if (q === 'b') vt(R, T, M); else if (q === 'c') vt(R, M, B); else if (q === 'e') vt(L, M, B); else if (q === 'f') vt(L, T, M);
    }
    c.fill(); c.restore();
  }
  function colon(c, x, y, color) {
    c.save(); c.translate(x, y); c.transform(1, 0, -0.08, 1, 0.08 * 24, 0);
    c.fillStyle = color; c.fillRect(0.5, 6.5, 3, 3); c.fillRect(0.5, 14.5, 3, 3); c.restore();
  }
  // two linked rings, the stereo mark, in 1px dots
  const RING = ['..###..', '.#...#.', '#.....#', '#.....#', '#.....#', '.#...#.', '..###..'];
  function stereoMark(c, x, y, u, color) {
    c.fillStyle = color;
    for (const ox of [0, 5]) RING.forEach((row, r) => { for (let k = 0; k < 7; k++) if (row[k] === '#') c.fillRect(x + (ox + k) * u, y + r * u, u, u); });
  }

  /* ================================================================ the player */
  // Winamp's default viscolor.txt: the spectrum from its top (red) down to its foot (green)
  const VIS = ['#ef3110', '#ce2910', '#d65a00', '#d66600', '#d67300', '#c67b08', '#dea518', '#d6b521', '#bdde29', '#94de21', '#29ce10', '#32be10', '#39b510', '#319c08', '#299400', '#188408'];
  // the LCD: lit pixels, labels, unlit segments and dots, and its chips
  const LIT = '#eaf2ff', LABEL = '#a3bbe6', GHOST = 'rgba(234, 242, 255, .1)', OFF = 'rgba(163, 187, 230, .45)';
  const CHIP_LINE = 'rgba(163, 187, 230, .5)', CHIP_FILL = 'rgba(8, 24, 64, .35)', RULE = 'rgba(163, 187, 230, .3)';
  // the LCD spectrum's segments, from its foot (#a9cbf8) up to its top (the lit white)
  const SPEC = Array.from({ length: 10 }, (_, k) => {
    const a = [0xa9, 0xcb, 0xf8], b = [0xea, 0xf2, 0xff], f = k / 9;
    return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * f)).join(',')})`;
  });
  const VISUALS = ['bliss', 'bars', 'scope'];

  const WKEY = 'pf-winamp';
  const st = { shuffle: false, repeat: false, showPl: false, remain: false, vis: 0, rnd: false };
  try { Object.assign(st, JSON.parse(store.get(WKEY) || '{}')); } catch (e) { /* defaults */ }
  st.vis = clamp(+st.vis || 0, 0, VISUALS.length - 1);
  const save = () => store.set(WKEY, JSON.stringify(st));

  const list = [];          // { src | yt, artist, title, credit, dur, bytes, local, bad }
  let cur = -1, sel = -1;   // the track loaded, the row selected
  let state = 'stop';       // 'play' | 'pause' | 'stop'
  let bag = [];             // shuffle's order still to play
  const audio = new Audio();
  audio.preload = 'metadata';
  let ctx = null, analyser = null, wired = false;
  let view = null;          // the mounted skin's parts
  let seeking = false;

  const base = new URL('../asset/music/', location.href);
  let loaded = null;
  function loadList() {
    if (!loaded) {
      loaded = fetch(new URL('playlist.json', base), { cache: 'no-cache' })
        .then((r) => (r.ok ? r.json() : { tracks: [] }))
        .catch(() => ({ tracks: [] }))
        .then((j) => {
          (j.tracks || []).forEach((t) => {
            if (t && t.youtube) list.push({ yt: String(t.youtube), src: '', artist: t.artist || '', title: t.title || 'YouTube', credit: t.credit || '', dur: +t.duration || 0, local: false });
            else if (t && t.file) list.push({ src: new URL(t.file, base).href, artist: t.artist || '', title: t.title || t.file.replace(/\.[^.]+$/, ''), credit: t.credit || '', dur: +t.duration || 0, local: false });
          });
          if (list.length && cur < 0) { cur = 0; sel = 0; }
          render();
          return list.length;
        });
    }
    return loaded;
  }
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);

  // the music runs through an analyser (the visualizer's) into the site's volume; Winamp's own slider is that volume,
  // as Winamp's slider was Windows' wave volume
  function wire() {
    if (wired || !AC) return;
    wired = true;
    try {
      ctx = new AC();
      const src = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser(); analyser.fftSize = 1024; analyser.smoothingTimeConstant = 0.6;
      src.connect(analyser); analyser.connect(PF.volume.node(ctx));
      audio.volume = 1;
    } catch (e) { ctx = null; analyser = null; }
  }
  // without Web Audio the element's own volume follows the site's
  const elementVol = () => { if (!analyser) audio.volume = clamp(PF.volume.amount, 0, 1); };
  elementVol();
  PF.volume.on(() => { elementVol(); ytVol(); paintVol(); });

  /* ---- YouTube: a song that is an official video plays in YouTube's own player (its privacy host, its script loaded
     at the first such song), shown in the visualizer's place. YouTube's terms ask that the player shows, 200 by 200
     at least, with nothing laid over it; Winamp's keys drive it through YouTube's API ---- */
  const isYT = (t) => !!(t && t.yt);
  let yt = null, ytApi = null, ytFails = 0, ytAt = 0;
  function ytLoad() {
    if (ytApi) return ytApi;
    ytApi = new Promise((res, rej) => {
      if (window.YT && window.YT.Player) { res(); return; }
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => { if (prev) prev(); res(); };
      const sc = document.createElement('script');
      sc.src = 'https://www.youtube.com/iframe_api'; sc.async = true;
      sc.onerror = () => { ytApi = null; rej(new Error('youtube')); };
      document.head.appendChild(sc);
    });
    return ytApi;
  }
  // start a video from a given second; a remounted window builds a fresh player and carries on where the old one was
  function ytStart(id, from = 0, go = true) {
    ytLoad().then(() => {
      if (!view || !isYT(list[cur]) || list[cur].yt !== id) return;
      const ok = yt && yt.getIframe && yt.getIframe() && yt.getIframe().isConnected;
      if (ok) { yt[go ? 'loadVideoById' : 'cueVideoById']({ videoId: id, startSeconds: from }); return; }
      const holder = document.createElement('div');
      view.ytBox.innerHTML = ''; view.ytBox.appendChild(holder);
      yt = new window.YT.Player(holder, {
        host: 'https://www.youtube-nocookie.com', width: '100%', height: '100%', videoId: id,
        playerVars: { autoplay: go ? 1 : 0, controls: 0, disablekb: 1, fs: 0, rel: 0, playsinline: 1, iv_load_policy: 3, start: Math.floor(from), origin: location.origin },
        events: { onReady: () => ytVol(), onStateChange: ytState, onError: ytError },
      });
    }).catch(() => { const t = list[cur]; if (t) t.bad = true; if (state === 'play') step(1); });
  }
  function ytVol() {
    if (!yt || !yt.setVolume) return;
    yt.setVolume(PF.volume.level);
    if (PF.volume.muted) yt.mute(); else yt.unMute();
  }
  function ytState(e) {
    if (!isYT(list[cur])) return;
    const S = window.YT.PlayerState;
    if (e.data === S.PLAYING) {
      ytFails = 0;
      const t = list[cur], d = yt.getDuration();
      if (d && !t.dur && !ytAd()) t.dur = d;
      if (state !== 'play') { state = 'play'; loop(); }
      render();
    } else if (e.data === S.PAUSED && state === 'play') { state = 'pause'; render(); }
    else if (e.data === S.ENDED && state === 'play') {
      // an ad reports an end of its own: only this song's own video, played to its end, moves the list on
      const d = yt.getDuration ? yt.getDuration() : 0, t = yt.getCurrentTime ? yt.getCurrentTime() : 0;
      if (!ytAd() && d > 0 && t >= d - 2) ended();
    }
  }
  // YouTube's API doesn't say when an ad plays; the player then runs another length than the song's (playlist.json
  // keeps each video's own length), so a length off by more than a few seconds is an ad
  function ytAd() {
    const t = list[cur];
    if (!isYT(t) || !yt || !yt.getDuration || state === 'stop') return false;
    const d = yt.getDuration(), id = yt.getVideoData ? (yt.getVideoData() || {}).video_id : t.yt;
    return id !== t.yt || (!!t.dur && d > 0 && Math.abs(d - t.dur) > 3);
  }
  // a video its owner took down or keeps off other sites is skipped, and marked in the list
  function ytError() {
    const t = list[cur]; if (t) t.bad = true;
    if (++ytFails >= list.length) { stop(); return; }
    if (state === 'play') step(1); else render();
  }
  // during an ad the song's own clock stands at its start
  const mediaTime = () => (isYT(list[cur]) ? (ytAd() ? 0 : yt && yt.getCurrentTime ? yt.getCurrentTime() || 0 : ytAt) : audio.currentTime);
  const mediaDur = () => (isYT(list[cur]) ? (ytAd() ? NaN : yt && yt.getDuration && yt.getDuration() ? yt.getDuration() : NaN) : audio.duration);

  /* ---- transport ---- */
  function load(i) {
    if (!list[i]) return false;
    cur = i; sel = i;
    if (isYT(list[i])) { audio.pause(); return true; }
    if (yt && yt.stopVideo) yt.stopVideo();
    audio.src = list[i].src;
    sizeOf(list[i]);
    return true;
  }
  // the bitrate is the file's size over its length; a visitor's own file knows its size already
  function sizeOf(t) {
    if (t.bytes || t.local || isYT(t) || !/^https?:/.test(t.src)) return;
    fetch(t.src, { method: 'HEAD' }).then((r) => { const n = +r.headers.get('content-length'); if (n) { t.bytes = n; render(); } }).catch(() => {});
  }
  function play(i) {
    if (!list.length) { pickFiles(); return; }
    wire();
    if (ctx && ctx.state === 'suspended') ctx.resume();
    const was = cur, wasState = state;
    if (i !== undefined && i !== cur) load(i);
    else if (cur < 0) load(sel >= 0 ? sel : 0);
    else if (!isYT(list[cur]) && state === 'play') audio.currentTime = 0;
    else if (!isYT(list[cur]) && !audio.src) load(cur);
    const t = list[cur];
    if (isYT(t)) {
      // the same video from paused carries on, from playing starts again; another video loads
      if (yt && yt.playVideo && cur === was && wasState === 'pause') yt.playVideo();
      else if (yt && yt.seekTo && cur === was && wasState === 'play') yt.seekTo(0, true);
      else ytStart(t.yt, 0, true);
    } else {
      const p = audio.play();
      if (p && p.catch) p.catch(() => { state = 'stop'; render(); });
    }
    if (state !== 'play' || cur !== was) say(`${s('nowPlaying')}: ${nameOf(list[cur])}`);
    state = 'play'; render(); loop();
  }
  function pause() {
    const v = isYT(list[cur]);
    if (state === 'play') { if (v) { if (yt && yt.pauseVideo) yt.pauseVideo(); } else audio.pause(); state = 'pause'; }
    else if (state === 'pause') { if (v) { if (yt && yt.playVideo) yt.playVideo(); } else audio.play(); state = 'play'; loop(); }
    render();
  }
  function stop() {
    audio.pause();
    try { audio.currentTime = 0; } catch (e) { /* not loaded */ }
    if (yt && yt.stopVideo) yt.stopVideo();
    ytAt = 0;
    state = 'stop'; mini.fill(0); miniPk.fill(0); render();
  }
  function step(d) {
    if (!list.length) return;
    let i;
    if (st.shuffle) {
      if (!bag.length) bag = list.map((_, k) => k).filter((k) => k !== cur).sort(() => Math.random() - 0.5);
      i = bag.length ? bag.shift() : cur;
    } else {
      // past the songs that won't play
      i = cur;
      for (let k = 0; k < list.length; k++) { i = (i + d + list.length) % list.length; if (!list[i].bad) break; }
    }
    if (state === 'play') play(i); else { load(i); render(); }
  }
  function ended() {
    if (st.repeat && list.length === 1) { play(cur); return; }
    if (!st.shuffle && cur === list.length - 1 && !st.repeat) { stop(); return; }
    step(1);
  }
  audio.addEventListener('ended', ended);
  // a server that sends no length leaves the duration unknown (Infinity): the list's own duration stands, and seeking waits
  audio.addEventListener('loadedmetadata', () => { const t = list[cur]; if (t && Number.isFinite(audio.duration)) t.dur = audio.duration; render(); });
  audio.addEventListener('timeupdate', () => { if (state !== 'play') paintLcd(); });
  audio.addEventListener('error', () => { if (state === 'play') { state = 'stop'; render(); } });

  function pickFiles() {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'audio/*,.mp3,.ogg,.wav,.m4a'; inp.multiple = true;
    inp.addEventListener('change', () => {
      const start = list.length;
      Array.from(inp.files || []).forEach((f) => {
        const name = f.name.replace(/\.[^.]+$/, ''), m = name.split(' - ');
        list.push({ src: URL.createObjectURL(f), artist: m.length > 1 ? m[0] : '', title: m.length > 1 ? m.slice(1).join(' - ') : name, credit: '', dur: 0, bytes: f.size, local: true });
      });
      if (list.length > start) play(start);
    });
    inp.click();
  }
  function remove(i) {
    const t = list[i]; if (!t) return;
    if (t.local) URL.revokeObjectURL(t.src);
    list.splice(i, 1);
    bag = bag.filter((k) => k !== i).map((k) => (k > i ? k - 1 : k));
    if (i === cur) { stop(); audio.removeAttribute('src'); audio.load(); if (isYT(t) && yt && yt.destroy) { yt.destroy(); yt = null; } cur = list.length ? Math.min(i, list.length - 1) : -1; }
    else if (i < cur) cur--;
    sel = list.length ? Math.min(i, list.length - 1) : -1;
    render();
  }

  /* ---- what the LCD reads ---- */
  const mmss = (sec) => { const v = Number.isFinite(sec) ? Math.max(0, Math.floor(sec)) : 0; return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`; };
  const nameOf = (t) => (t.artist ? `${t.artist} - ${t.title}` : t.title);
  function caption() { const t = list[cur]; return t && state !== 'stop' ? `${cur + 1}. ${nameOf(t)} - Winamp` : 'Winamp'; }
  function marquee() {
    const t = list[cur];
    if (ytAd()) return `YOUTUBE AD *** ${cur + 1}. ${nameOf(t)}`;
    if (!t) return list.length ? 'WINAMP' : s('empty');
    return `${cur + 1}. ${nameOf(t)} (${mmss(t.dur)})${t.credit ? ` *** ${t.credit}` : ''}`;
  }

  /* ================================================================ the skin, after Winamp 5's Winamp Modern */
  const SVG = (w, h, d) => `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><path d="${d}" fill="currentColor"/></svg>`;
  const G = {
    prev: SVG(12, 10, 'M0 0h2v10H0zM12 0v10L2 5z'),
    play: SVG(10, 12, 'M0 0l10 6-10 6z'),
    pause: SVG(10, 11, 'M0 0h3.5v11H0zM6.5 0H10v11H6.5z'),
    stop: SVG(10, 10, 'M0 0h10v10H0z'),
    next: SVG(12, 10, 'M0 0l10 5-10 5zM10 0h2v10h-2z'),
    eject: SVG(10, 10, 'M5 0l5 6H0zM0 7.5h10V10H0z'),
    min: SVG(8, 8, 'M0 5.5h8V8H0z'),
    close: SVG(8, 8, 'M1.4 0L4 2.6 6.6 0 8 1.4 5.4 4 8 6.6 6.6 8 4 5.4 1.4 8 0 6.6 2.6 4 0 1.4z'),
    left: SVG(6, 8, 'M6 0v8L0 4z'),
    right: SVG(6, 8, 'M0 0l6 4-6 4z'),
    plus: SVG(9, 9, 'M3.6 0h1.8v3.6H9v1.8H5.4V9H3.6V5.4H0V3.6h3.6z'),
    minus: SVG(9, 9, 'M0 3.6h9v1.8H0z'),
    bolt: SVG(14, 18, 'M9 0L1 10.5h5.5L4 18l9-11.5H7.5L11 0z'),
    note: SVG(16, 18, 'M6 2.5L15 0v12.5a2.6 2.6 0 1 1-1.6-2.4V4.4L7.6 5.9v8.6A2.6 2.6 0 1 1 6 12.1z'),
    rowPlay: SVG(7, 8, 'M0 0l7 4-7 4z'),
    rowPause: SVG(7, 8, 'M0 0h2.5v8H0zM4.5 0H7v8H4.5z'),
    check: '<svg width="9" height="8" viewBox="0 0 9 8" aria-hidden="true"><path d="M1 4l2.5 2.5L8 1.5" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>',
    dot: '<svg width="6" height="6" viewBox="0 0 6 6" aria-hidden="true"><circle cx="3" cy="3" r="2.5" fill="currentColor"/></svg>',
    // the speaker: its waves follow the level (data-level 0 to 3), and a cross when muted
    spk: '<svg class="wm-spk" width="20" height="16" viewBox="0 0 20 16" aria-hidden="true"><path d="M1.5 5.5h3l4.5-3.8v12.6l-4.5-3.8h-3z" fill="currentColor"/><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path class="w1" d="M11.6 6c.6.6.9 1.3.9 2s-.3 1.4-.9 2"/><path class="w2" d="M13.6 4.2c1.1 1 1.7 2.3 1.7 3.8s-.6 2.8-1.7 3.8"/><path class="w3" d="M15.6 2.4c1.6 1.5 2.5 3.4 2.5 5.6s-.9 4.1-2.5 5.6"/><path class="x" d="M12 5.5l5 5m0-5l-5 5"/></g></svg>',
  };
  // a key with its name read out and shown on hover; key: Winamp's own shortcut, added to the tooltip
  const btn = (cls, act, lab, inner = '', extra = '', key = '') => `<button type="button" class="${cls}" data-wa="${act}" aria-label="${esc(lab)}" title="${esc(key ? `${lab} (${key})` : lab)}"${key ? ` aria-keyshortcuts="${key}"` : ''}${extra}>${inner}</button>`;

  function skin() {
    // the volume keeps the window's bottom-right corner: at the end of the deck, or at the playlist's foot when the
    // playlist is open
    const vol = `<span class="wm-vol">
          ${btn('wm-mute', 'mute', s('mute'), G.spk, ' aria-pressed="false" data-level="3"')}
          <input type="range" min="0" max="100" step="1" value="${PF.volume.level}" aria-label="${esc(s('volume'))}">
        </span>`;
    return `
    <div class="wm" tabindex="-1">
      <header class="wm-title" data-drag>
        <span class="wm-ico" aria-hidden="true">${G.bolt}</span><span class="wm-groove" aria-hidden="true"></span><span class="wm-name" aria-hidden="true">WINAMP</span>
        <span class="wm-caps">${btn('wm-cap', 'min', s('minimize'), G.min, ' data-wact="min"')}${btn('wm-cap', 'close', s('close'), G.close, ' data-wact="close"')}</span>
      </header>
      <nav class="wm-menubar" role="menubar" aria-label="Winamp">
        ${['file', 'play', 'view'].map((k) => `<button type="button" role="menuitem" aria-haspopup="menu" aria-expanded="false" data-wm-menu="${k}">${esc(s('menu_' + k))}</button>`).join('')}
      </nav>
      <div class="wm-vis wm-bezel"><div class="wm-glass"><canvas aria-hidden="true"></canvas><div class="wm-yt"></div></div></div>
      <div class="wm-visbar" data-drag>
        <span class="wm-seg" role="group" aria-label="${esc(s('vis'))}">
          ${btn('wm-seg-b', 'visprev', s('visPrev'), G.left)}<span class="wm-seg-name" aria-live="polite"></span>${btn('wm-seg-b', 'visnext', s('visNext'), G.right)}
        </span>
        ${btn('wm-pill wm-rnd', 'rnd', s('visRnd'), `<i class="wm-led" aria-hidden="true"></i>${esc(s('random'))}`, ` aria-pressed="${st.rnd}"`)}
      </div>
      <div class="wm-lcd wm-bezel" data-drag>
        <div class="wm-glass">
          <canvas class="wm-lcd-base" aria-hidden="true"></canvas><canvas class="wm-lcd-lit" aria-hidden="true"></canvas>
          ${btn('wm-hit', 'remain', s('remain'), '', ` aria-pressed="${st.remain}"`)}
          <p class="wm-sr" role="status"></p>
        </div>
      </div>
      <input type="range" class="wm-seek" min="0" max="1000" step="1" value="0" aria-label="${esc(s('seek'))}">
      <div class="wm-deck" data-drag>
        <span class="wm-transport">
          ${btn('wm-round', 'prev', s('prev'), G.prev, '', 'Z')}${btn('wm-round wm-play', 'toggle', s('play'), G.play, '', 'X')}${btn('wm-round', 'stop', s('stop'), G.stop, '', 'V')}${btn('wm-round', 'next', s('next'), G.next, '', 'B')}
        </span>
        <span class="wm-side">
          ${btn('wm-key', 'eject', s('eject'), G.eject)}${btn('wm-key wm-plb', 'pl', s('pl'), `<i class="wm-led" aria-hidden="true"></i>PL`, ` aria-pressed="${st.showPl}"`)}
        </span>
        ${st.showPl ? '' : vol}
      </div>
      <section class="wm-pl"${st.showPl ? '' : ' hidden'} aria-label="${esc(s('pl'))}">
        <div class="wm-pl-head" data-drag><span class="wm-pl-title">${esc(s('pl'))}</span><span class="wm-total"></span></div>
        <div class="wm-well wm-bezel"><ol class="wm-list" role="listbox" tabindex="0" aria-label="${esc(s('list'))}"></ol></div>
        <div class="wm-pl-foot" data-drag>
          ${btn('wm-pill', 'add', s('add'), `${G.plus}${esc(s('addShort'))}`)}${btn('wm-pill', 'rem', s('rem'), `${G.minus}${esc(s('remShort'))}`)}
          ${st.showPl ? vol : ''}
        </div>
      </section>
    </div>`;
  }

  let hooks = { changed() {} };
  function mount(host, h) {
    hooks = Object.assign({ changed() {} }, h);
    closeMenu(false);
    host.innerHTML = skin();
    const q = (x) => host.querySelector(x);
    view = {
      host, root: q('.wm'), vis: q('.wm-vis canvas'), lcdBase: q('.wm-lcd-base'), lcdLit: q('.wm-lcd-lit'),
      list: q('.wm-list'), seek: q('.wm-seek'), volBox: q('.wm-vol'), vol: q('.wm-vol input'), mute: q('[data-wa="mute"]'), sr: q('.wm-sr'),
      visName: q('.wm-seg-name'), total: q('.wm-total'), rem: q('[data-wa="rem"]'), ytBox: q('.wm-yt'),
      marqX: 0, marqT: 0, marqText: '', rndT: 0, cap: null, baseKey: '',
    };
    wireSkin(host);
    // the window was rebuilt (a language change): YouTube's old player went with it, so a new one picks up the video
    if (isYT(list[cur]) && state !== 'stop') { yt = null; ytStart(list[cur].yt, ytAt, state === 'play'); }
    render(); loadList(); paintVis(null);
  }

  function act(k) {
    if (k === 'play') play();
    else if (k === 'pause') pause();
    // one key plays and pauses: from a stop it plays, otherwise it pauses or carries on
    else if (k === 'toggle') { if (state === 'stop') play(); else pause(); }
    else if (k === 'stop') stop();
    else if (k === 'prev') step(-1);
    else if (k === 'next') step(1);
    else if (k === 'eject' || k === 'add') pickFiles();
    else if (k === 'rem') { if (sel >= 0) remove(sel); }
    else if (k === 'shuffle') { st.shuffle = !st.shuffle; bag = []; }
    else if (k === 'repeat') st.repeat = !st.repeat;
    else if (k === 'pl') { st.showPl = !st.showPl; save(); render(); fit(); return; }
    else if (k === 'rnd') { st.rnd = !st.rnd; if (view) view.rndT = 0; }
    else if (k === 'visprev' || k === 'visnext') { setVis(st.vis + (k === 'visnext' ? 1 : VISUALS.length - 1)); return; }
    else if (k === 'remain') st.remain = !st.remain;
    else if (k === 'mute') PF.volume.setMuted(!PF.volume.muted);
    else return;
    save(); render();
  }
  function setVis(i) { st.vis = (i + VISUALS.length) % VISUALS.length; trace = null; save(); render(); paintVis(null); }
  // the playlist folding out keeps the whole window on the desktop
  function fit() {
    const win = view && view.host.closest('.win'), desk = document.getElementById('desktop');
    if (!win || !desk) return;
    const over = win.offsetTop + win.offsetHeight - (desk.clientHeight - 8);
    if (over > 0) win.style.top = Math.max(8, win.offsetTop - over) + 'px';
  }

  function wireSkin(host) {
    const v = view;
    host.addEventListener('click', (e) => {
      const m = e.target.closest('[data-wm-menu]'); if (m) { openMenu(m); return; }
      const b = e.target.closest('[data-wa]'); if (b && !b.disabled) act(b.dataset.wa);
    });
    v.vol.addEventListener('input', () => PF.volume.set(+v.vol.value));
    v.seek.addEventListener('input', () => { seeking = true; paintLcd(); });
    v.seek.addEventListener('change', () => {
      seeking = false;
      const d = mediaDur();
      if (Number.isFinite(d)) { const at = (+v.seek.value / 1000) * d; if (isYT(list[cur])) { if (yt && yt.seekTo) yt.seekTo(at, true); } else audio.currentTime = at; }
      paintLcd();
    });
    v.list.addEventListener('click', (e) => { const li = e.target.closest('li[data-i]'); if (!li) return; sel = +li.dataset.i; markSel(); });
    v.list.addEventListener('dblclick', (e) => { const li = e.target.closest('li[data-i]'); if (li) play(+li.dataset.i); });
    v.list.addEventListener('keydown', (e) => {
      if (!list.length) return;
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); sel = clamp((sel < 0 ? 0 : sel) + (e.key === 'ArrowDown' ? 1 : -1), 0, list.length - 1); markSel(); }
      else if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); sel = e.key === 'Home' ? 0 : list.length - 1; markSel(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (sel >= 0) play(sel); }
      else if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); if (sel >= 0) remove(sel); }
      else return;
      e.stopPropagation();
    });
    // Winamp's own keys while it has the focus: Z back, X play, C pause, V stop, B next
    v.root.addEventListener('keydown', (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.target.matches('input')) return;
      const k = { z: 'prev', x: 'play', c: 'pause', v: 'stop', b: 'next' }[(e.key || '').toLowerCase()];
      if (k) { e.preventDefault(); act(k); }
    });
  }
  const say = (msg) => { if (view) view.sr.textContent = msg; };

  /* ---- the menubar: File, Play, View ---- */
  let menu = null;
  function menuItems(k) {
    if (k === 'file') return [{ label: s('eject'), run: pickFiles }, '-', { label: s('close'), run: () => { const c = view && view.host.querySelector('[data-wact="close"]'); if (c) c.click(); } }];
    if (k === 'play') return [
      { label: s('play'), key: 'X', run: () => act('play') }, { label: s('pause'), key: 'C', run: () => act('pause'), disabled: state === 'stop' },
      { label: s('stop'), key: 'V', run: () => act('stop'), disabled: state === 'stop' }, { label: s('prev'), key: 'Z', run: () => act('prev') }, { label: s('next'), key: 'B', run: () => act('next') },
      '-', { label: s('shuffle'), checked: st.shuffle, run: () => act('shuffle') }, { label: s('repeat'), checked: st.repeat, run: () => act('repeat') },
    ];
    return [
      { label: s('pl'), checked: st.showPl, run: () => act('pl') }, '-',
      ...VISUALS.map((id, i) => ({ label: s('vis_' + id), radio: true, checked: st.vis === i, run: () => setVis(i) })),
      '-', { label: s('visRnd'), checked: st.rnd, run: () => act('rnd') },
    ];
  }
  function closeMenu(back) {
    if (!menu) return;
    const m = menu; menu = null;
    m.el.remove(); m.anchor.setAttribute('aria-expanded', 'false');
    document.removeEventListener('pointerdown', m.out, true);
    if (back && m.anchor.isConnected) m.anchor.focus({ preventScroll: true });
  }
  function openMenu(anchor) {
    const again = menu && menu.anchor === anchor;
    closeMenu(false);
    if (again) return;
    const items = menuItems(anchor.dataset.wmMenu);
    const el = document.createElement('div');
    el.className = 'menu wm-menu'; el.setAttribute('role', 'menu');
    el.innerHTML = items.map((it, i) => (it === '-' ? '<div class="hr" role="separator"></div>'
      : `<button type="button" role="${it.radio ? 'menuitemradio' : it.checked !== undefined ? 'menuitemcheckbox' : 'menuitem'}"${it.checked !== undefined ? ` aria-checked="${it.checked}"` : ''} data-i="${i}"${it.disabled ? ' disabled' : ''}><span class="mk">${it.checked ? (it.radio ? G.dot : G.check) : ''}</span><span>${esc(it.label)}</span>${it.key ? `<kbd>${it.key}</kbd>` : ''}</button>`)).join('');
    document.body.appendChild(el);
    const r = anchor.getBoundingClientRect();
    el.style.left = clamp(r.left, 4, innerWidth - el.offsetWidth - 4) + 'px';
    el.style.top = clamp(r.bottom, 4, innerHeight - el.offsetHeight - 4) + 'px';
    anchor.setAttribute('aria-expanded', 'true');
    const out = (e) => { if (!el.contains(e.target) && !anchor.contains(e.target)) closeMenu(false); };
    document.addEventListener('pointerdown', out, true);
    menu = { el, anchor, out };
    const btns = Array.from(el.querySelectorAll('button:not(:disabled)'));
    el.addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (!b) return; const it = items[+b.dataset.i]; closeMenu(true); it.run(); });
    el.addEventListener('keydown', (e) => {
      const i = btns.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); btns[(i + (e.key === 'ArrowDown' ? 1 : btns.length - 1)) % btns.length].focus(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        const all = Array.from(anchor.parentNode.querySelectorAll('[data-wm-menu]')), j = all.indexOf(anchor);
        openMenu(all[(j + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length]);
      } else if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); e.stopPropagation(); closeMenu(true); }
    });
    if (btns[0]) btns[0].focus({ preventScroll: true });
  }

  /* ---- painting ---- */
  function render() {
    if (!view || !view.host.isConnected) return;
    const r = view.root;
    const set = (k, on) => { const b = r.querySelector(`[data-wa="${k}"]`); if (b) b.setAttribute('aria-pressed', String(on)); };
    set('pl', st.showPl); set('rnd', st.rnd); set('remain', st.remain);
    r.querySelector('.wm-pl').hidden = !st.showPl;
    const corner = r.querySelector(st.showPl ? '.wm-pl-foot' : '.wm-deck');
    if (view.volBox.parentNode !== corner) corner.appendChild(view.volBox);
    // the play key shows what it will do: pause while the music plays, play otherwise
    const pk = r.querySelector('[data-wa="toggle"]'), playing = state === 'play';
    pk.classList.toggle('on', playing);
    if (pk.dataset.shows !== (playing ? 'pause' : 'play')) {
      pk.dataset.shows = playing ? 'pause' : 'play';
      pk.innerHTML = playing ? G.pause : G.play;
      const lab = playing ? s('pause') : s('play'), key = playing ? 'C' : 'X';
      pk.setAttribute('aria-label', lab); pk.title = `${lab} (${key})`; pk.setAttribute('aria-keyshortcuts', key);
    }
    // a YouTube song shows its video in the visualizer's place; the visual keys rest meanwhile
    const video = isYT(list[cur]) && state !== 'stop';
    r.classList.toggle('video', video);
    r.querySelectorAll('[data-wa="visprev"], [data-wa="visnext"], [data-wa="rnd"]').forEach((b) => { b.disabled = video; });
    view.visName.textContent = video ? 'YouTube' : s('vis_' + VISUALS[st.vis]);
    view.seek.disabled = cur < 0 || !Number.isFinite(mediaDur());
    view.rem.disabled = sel < 0 || !list.length;
    const txt = marquee();
    if (txt !== view.marqText) { view.marqText = txt; view.marqX = 0; }
    paintVol(); paintList(); paintLcd();
    if (state !== 'play') paintVis(null);
    loop();
    const c = caption();
    if (c !== view.cap) { view.cap = c; hooks.changed(c); }
  }
  function paintVol() {
    if (!view) return;
    const v = PF.volume;
    if (+view.vol.value !== v.level) view.vol.value = v.level;
    view.vol.setAttribute('aria-valuetext', `${v.level}%`);
    view.vol.title = `${s('volume')} ${v.level}%`;
    view.vol.style.setProperty('--wm-fill', `${v.level}%`);
    view.mute.dataset.level = v.level === 0 ? 0 : v.level < 34 ? 1 : v.level < 67 ? 2 : 3;
    view.mute.setAttribute('aria-pressed', String(v.muted));
  }
  function paintList() {
    if (!view) return;
    const ol = view.list;
    ol.innerHTML = list.length ? list.map((t, i) => {
      const now = i === cur && state !== 'stop';
      const tip = t.bad ? s('unavailable') : t.credit;
      return `<li role="option" data-i="${i}" id="wm-o-${i}" aria-selected="${i === sel}" class="${i === cur ? 'cur' : ''}${t.bad ? ' bad' : ''}"${tip ? ` title="${esc(tip)}"` : ''}><span class="n">${now ? (state === 'play' ? G.rowPlay : G.rowPause) : i + 1}</span><span class="t">${esc(nameOf(t))}</span><span class="d">${t.dur ? mmss(t.dur) : ''}</span></li>`;
    }).join('')
      : `<li class="wm-empty" role="presentation">${G.note}<span>${esc(s('emptyList'))}</span></li>`;
    const tot = list.reduce((a, t) => a + (t.dur || 0), 0);
    view.total.textContent = s('tracks', list.length, mmss(tot));
    markSel();
  }
  // picking a row only moves the mark: the rows stay the same elements, so the second click of a double-click lands
  // on the row the first one picked
  function markSel() {
    if (!view) return;
    const ol = view.list;
    Array.from(ol.querySelectorAll('li[data-i]')).forEach((li) => li.setAttribute('aria-selected', String(+li.dataset.i === sel)));
    if (sel >= 0 && list.length) { ol.setAttribute('aria-activedescendant', `wm-o-${sel}`); const li = ol.querySelector(`#wm-o-${sel}`); if (li) li.scrollIntoView({ block: 'nearest' }); } else ol.removeAttribute('aria-activedescendant');
    view.rem.disabled = sel < 0 || !list.length;
  }

  // The LCD, on two canvases: the base holds what is always there (the unlit segments and dots, the labels, the
  // chips, the rule), the lit one what the music lights (and glows, in CSS). Coordinates are CSS pixels of a 356 by
  // 70 glass, rounded to device pixels so the dots stay sharp.
  const mini = new Array(16).fill(0), miniPk = new Array(16).fill(0), miniHold = new Array(16).fill(0);
  function fitCanvas(cv) {
    const S = Math.min(3, window.devicePixelRatio || 1), w = Math.round(cv.clientWidth * S), h = Math.round(cv.clientHeight * S);
    if (!w || !h) return false;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    return true;
  }
  function chip(c, P, x, y, w, h) {
    const x0 = P(x), y0 = P(y), w0 = P(x + w) - x0, h0 = P(y + h) - y0, r = P(3);
    c.beginPath(); if (c.roundRect) c.roundRect(x0 + 0.5, y0 + 0.5, w0 - 1, h0 - 1, r); else c.rect(x0 + 0.5, y0 + 0.5, w0 - 1, h0 - 1);
    c.fillStyle = CHIP_FILL; c.fill(); c.lineWidth = 1; c.strokeStyle = CHIP_LINE; c.stroke();
  }
  function paintBase() {
    const cv = view.lcdBase;
    if (!fitCanvas(cv)) return;
    const key = `${cv.width}x${cv.height}`;
    if (view.baseKey === key) return;
    view.baseKey = key;
    const c = cv.getContext('2d'), S = cv.width / cv.clientWidth, u = Math.max(1, Math.round(S)), P = (v) => Math.round(v * S);
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    // the time's unlit segments, the minus of the time left among them
    c.setTransform(S, 0, 0, S, 0, 0);
    seg7(c, 25, 8, 'g', GHOST, 10);
    [38, 55, 80, 97].forEach((x) => seg7(c, x, 8, 'abcdefg', GHOST));
    colon(c, 72, 8, GHOST);
    c.setTransform(1, 0, 0, 1, 0, 0);
    // the fields: kbps and kHz, the stereo mark, the track
    chip(c, P, 149, 7, 23, 13); chip(c, P, 207, 7, 17, 13); chip(c, P, 122, 24, 58, 13); chip(c, P, 207, 24, 17, 13);
    dots(c, 'KBPS', P(122), P(10), u, LABEL); dots(c, 'KHZ', P(186), P(10), u, LABEL); dots(c, 'TRK', P(186), P(27), u, LABEL);
    cells(c, P(152), P(10), 3, u, GHOST); cells(c, P(210), P(10), 2, u, GHOST); cells(c, P(210), P(27), 2, u, GHOST);
    stereoMark(c, P(126), P(27), u, OFF); dots(c, 'STEREO', P(142), P(27), u, OFF);
    // the spectrum's unlit segments: 16 bars of ten
    c.fillStyle = GHOST;
    for (let b = 0; b < 16; b++) for (let k = 0; k < 10; k++) c.fillRect(P(234 + b * 7), P(35 - 3 * k), P(239 + b * 7) - P(234 + b * 7), P(37 - 3 * k) - P(35 - 3 * k));
    // the rule over the song's name
    c.fillStyle = RULE; c.fillRect(P(12), P(44), P(344) - P(12), Math.max(1, Math.round(S / 2)));
  }
  function paintLcd() {
    if (!view) return;
    paintBase();
    const cv = view.lcdLit;
    if (!fitCanvas(cv)) return;
    const c = cv.getContext('2d'), S = cv.width / cv.clientWidth, u = Math.max(1, Math.round(S)), P = (v) => Math.round(v * S);
    const d = mediaDur(), t = mediaTime(), on = cur >= 0 && state !== 'stop';
    c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cv.width, cv.height);
    c.setTransform(S, 0, 0, S, 0, 0);
    // the play state: a triangle, two bars, or a square, dimmer while stopped
    c.beginPath();
    if (state === 'play') { c.moveTo(11, 14); c.lineTo(20, 20); c.lineTo(11, 26); c.closePath(); c.fillStyle = LIT; }
    else if (state === 'pause') { c.rect(11, 15, 3, 10); c.rect(16, 15, 3, 10); c.fillStyle = LIT; }
    else { c.rect(11.5, 16, 8, 8); c.fillStyle = OFF; }
    c.fill();
    // the time, or the time left; paused, it blinks, as Winamp's did
    if (on && !(state === 'pause' && !mqReduce.matches && Math.floor(performance.now() / 500) % 2)) {
      let v = seeking && Number.isFinite(d) ? (+view.seek.value / 1000) * d : t;
      if (st.remain && Number.isFinite(d)) { v = d - v; seg7(c, 25, 8, 'g', LIT, 10); }
      v = Math.max(0, Math.floor(v));
      const m = Math.min(99, Math.floor(v / 60)), sec = v % 60;
      if (m >= 10) seg7(c, 38, 8, DIGIT[Math.floor(m / 10)], LIT);
      seg7(c, 55, 8, DIGIT[m % 10], LIT); colon(c, 72, 8, LIT);
      seg7(c, 80, 8, DIGIT[Math.floor(sec / 10)], LIT); seg7(c, 97, 8, DIGIT[sec % 10], LIT);
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    // kbps from the file's size, kHz as nearly every MP3 is (a page can't read a file's sample rate), the track's number
    const tr = list[cur], kbps = on && tr && tr.bytes && tr.dur ? Math.min(999, Math.round((tr.bytes * 8) / tr.dur / 1000)) : 0;
    if (kbps) { const k = String(kbps); dots(c, k, P(152) + (3 - k.length) * 6 * u, P(10), u, LIT); }
    if (on) { dots(c, '44', P(210), P(10), u, LIT); stereoMark(c, P(126), P(27), u, LIT); dots(c, 'STEREO', P(142), P(27), u, LIT); }
    if (cur >= 0) dots(c, String(Math.min(99, cur + 1)).padStart(2, '0'), P(210), P(27), u, LIT);
    // the small spectrum: lit segments from the foot, and a peak that waits a moment before it falls
    for (let b = 0; b < 16; b++) {
      const x0 = P(234 + b * 7), w = P(239 + b * 7) - x0, n = Math.min(10, Math.round(mini[b])), pk = Math.min(10, Math.round(miniPk[b]));
      for (let k = 0; k < n; k++) { c.fillStyle = SPEC[k]; c.fillRect(x0, P(35 - 3 * k), w, P(37 - 3 * k) - P(35 - 3 * k)); }
      if (pk > n && pk > 0) { c.fillStyle = '#fff'; c.fillRect(x0, P(35 - 3 * (pk - 1)), w, P(37 - 3 * (pk - 1)) - P(35 - 3 * (pk - 1))); }
    }
    // the song's name along the foot in large dots, running when it is longer than the glass, and fading at the edges
    const du = Math.max(2, Math.round(2 * S)), gap = du >= 3 ? 1 : 0, x = P(12), y = P(50), W = P(344) - x, H = du * 7, fw = P(18);
    const txt = view.marqText, tw = dotsW(txt, du);
    c.save(); c.beginPath(); c.rect(x, y, W, H); c.clip();
    if (tw <= W) dots(c, txt, x, y, du, LIT, gap);
    else if (mqReduce.matches) { dots(c, txt, x, y, du, LIT, gap); fade(c, x + W - fw, y, fw, H, false); }
    else {
      const loopT = `${txt}   ***   `, period = plain(loopT).length * 6 * du, off = (view.marqX * du) % period;
      dots(c, loopT, x - off, y, du, LIT, gap); dots(c, loopT, x - off + period, y, du, LIT, gap);
      fade(c, x, y, fw, H, true); fade(c, x + W - fw, y, fw, H, false);
    }
    c.restore();
    if (!seeking) view.seek.value = Number.isFinite(d) && d > 0 ? Math.round((t / d) * 1000) : 0;
    view.seek.style.setProperty('--wm-fill', `${view.seek.value / 10}%`);
    view.seek.setAttribute('aria-valuetext', `${mmss(t)} / ${mmss(d)}`);
  }
  // rub out the lit pixels toward an edge, so the running name comes in and goes out softly
  function fade(c, x, y, w, h, left) {
    const g = c.createLinearGradient(left ? x : x + w, 0, left ? x + w : x, 0);
    g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.save(); c.globalCompositeOperation = 'destination-out'; c.fillStyle = g; c.fillRect(x, y, w, h); c.restore();
  }
  function updateMini(lv) {
    for (let b = 0; b < 16; b++) {
      const v = lv ? Math.max(lv[b * 2], lv[b * 2 + 1]) * 10 : 0;
      mini[b] = v >= mini[b] ? v : Math.max(0, mini[b] - 0.45);
      if (mini[b] >= miniPk[b]) { miniPk[b] = mini[b]; miniHold[b] = 18; } else if (miniHold[b] > 0) miniHold[b]--; else miniPk[b] = Math.max(0, miniPk[b] - 0.15);
    }
  }

  /* ---- the big visualizer: Bliss (the XP hill, its grass growing with the music and a butterfly over it), Spectrum
     (Winamp's bars on a glossy floor) or Oscilloscope (a phosphor trace on a graticule) ---- */
  let freq = null, wave = null;
  function levels(n) {
    if (!freq) freq = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(freq);
    const N = freq.length, out = [];
    for (let b = 0; b < n; b++) {
      const a = Math.floor(2 * (N / 2) ** (b / n) * 0.5), z = Math.max(a + 1, Math.floor(2 * (N / 2) ** ((b + 1) / n) * 0.5));
      let m = 0; for (let i = a; i < z && i < N; i++) m = Math.max(m, freq[i]);
      out.push(m / 255);
    }
    return out;
  }
  // a small seeded random, so the meadow is the same on every visit
  const seeded = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  // value noise on a lattice that can wrap every px cells across (and py down), so a strip or a tile of it repeats
  // without a seam; fbm sums it over octaves
  function lattice(seed) {
    const rnd = seeded(seed), perm = new Uint8Array(512), val = new Float32Array(256);
    for (let i = 0; i < 256; i++) { perm[i] = i; val[i] = rnd(); }
    for (let i = 255; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)), t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
    for (let i = 0; i < 256; i++) perm[i + 256] = perm[i];
    const at = (x, y) => val[perm[(x & 255) + perm[y & 255]]];
    return (x, y, px, py) => {
      const xi = Math.floor(x), yi = Math.floor(y), u = x - xi, v = y - yi, su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
      const x0 = ((xi % px) + px) % px, x1 = (x0 + 1) % px, y0 = py ? ((yi % py) + py) % py : yi, y1 = py ? (y0 + 1) % py : yi + 1;
      const a = at(x0, y0), b = at(x1, y0), c = at(x0, y1), d = at(x1, y1);
      return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
    };
  }
  function fbm(n, x, y, px, py, oct = 5) {
    let s = 0, a = 0.5, f = 1, norm = 0;
    for (let i = 0; i < oct; i++) { s += a * n(x * f, y * f, px * f, py ? py * f : 0); norm += a; a *= 0.5; f *= 2; }
    return s / norm;
  }
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  function layer(W, H) { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; return cv; }

  // a grey noise tile that repeats both ways: laid over the sky and the hill in soft light, it gives them a grain
  let grain = null;
  function grainTile() {
    if (grain) return grain;
    const N = 128, n = lattice(5);
    grain = layer(N, N);
    const c = grain.getContext('2d'), img = c.createImageData(N, N), d = img.data;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const v = clamp(fbm(n, (x / N) * 8, (y / N) * 8, 8, 8, 4) * 1.6 - 0.3, 0, 1) * 255, i = (y * N + x) * 4;
      d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255;
    }
    c.putImageData(img, 0, 0);
    return grain;
  }

  // cumulus: fractal noise held to a band of the sky, cut off softly, and lit from the sun's side (a point whose
  // neighbour toward the sun is denser sits in its shadow); worked out small and drawn up smooth, wider than the view
  // so it can drift and wrap
  function cloudStrip(W, H) {
    const k = 2, SW = Math.ceil(W * 1.5), SH = Math.ceil(H * 0.62), cw = Math.ceil(SW / k), ch = Math.ceil(SH / k), n = lattice(23), P = 5;
    const small = layer(cw, ch), sc = small.getContext('2d'), img = sc.createImageData(cw, ch), d = img.data;
    for (let y = 0; y < ch; y++) {
      const yn = y / ch, band = smooth(0, 0.28, yn) * (1 - smooth(0.55, 0.98, yn));
      if (band <= 0) continue;
      for (let x = 0; x < cw; x++) {
        const nx = (x / cw) * P, ny = yn * 2.2, v = fbm(n, nx, ny, P, 0, 6) * (0.55 + band * 0.6);
        const a = smooth(0.45, 0.58, v);
        if (a <= 0) continue;
        const toward = fbm(n, nx + 0.06, ny - 0.1, P, 0, 6) * (0.55 + band * 0.6), lit = clamp(1 - (toward - v) * 7, 0.2, 1);
        const i = (y * cw + x) * 4;
        d[i] = 150 + 105 * lit; d[i + 1] = 172 + 83 * lit; d[i + 2] = 206 + 47 * lit; d[i + 3] = 255 * a;
      }
    }
    sc.putImageData(img, 0, 0);
    const strip = layer(SW, SH), c = strip.getContext('2d');
    c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high';
    c.drawImage(small, 0, 0, SW, SH);
    return strip;
  }

  // Bliss: a meadow seen from the grass, after the owner's reference. Built once per size: the sky with the sun's
  // bloom, the clouds, the land (hazy far hills, the near hill grained as grass, lit from the sun's side, its crest
  // glowing, small tufts all over it) and the shade (the roots' shadow and a vignette). Each frame lays those down with
  // the near grass between them, the blades swaying in a wind the music raises, and the butterfly.
  function makeScene(W, H, S) {
    const rnd = seeded(11), sky = layer(W, H), land = layer(W, H), shade = layer(W, H), tile = grainTile();
    let c = sky.getContext('2d'), g = c.createLinearGradient(0, 0, 0, H * 0.66);
    g.addColorStop(0, '#1a56c4'); g.addColorStop(0.45, '#3f86e0'); g.addColorStop(0.85, '#9cc9f2'); g.addColorStop(1, '#d4e9f8');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    const sx = W * 0.9, sy = -H * 0.08;
    g = c.createRadialGradient(sx, sy, 0, sx, sy, W * 0.75);
    g.addColorStop(0, 'rgba(255, 250, 228, .95)'); g.addColorStop(0.18, 'rgba(255, 248, 225, .5)'); g.addColorStop(0.5, 'rgba(240, 246, 255, .14)'); g.addColorStop(1, 'rgba(240, 246, 255, 0)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);

    c = land.getContext('2d');
    const far = (x) => H * (0.575 + 0.025 * Math.sin((x / W) * Math.PI * 2.2 + 1.1) + 0.012 * Math.sin((x / W) * Math.PI * 5.3));
    const near = (x) => H * (0.64 - 0.085 * Math.sin((x / W) * Math.PI * 0.95 + 0.35));
    const shape = (fn) => { c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 2) c.lineTo(x, fn(x)); c.lineTo(W, fn(W)); c.lineTo(W, H); c.closePath(); };
    c.filter = `blur(${S}px)`;
    shape(far); g = c.createLinearGradient(0, H * 0.53, 0, H * 0.7); g.addColorStop(0, '#acd6a6'); g.addColorStop(1, '#7fb877');
    c.fillStyle = g; c.fill();
    c.filter = 'none';
    shape(near); g = c.createLinearGradient(0, H * 0.52, 0, H); g.addColorStop(0, '#8fd14c'); g.addColorStop(0.3, '#5fb02e'); g.addColorStop(0.7, '#3c8c1e'); g.addColorStop(1, '#2a6c14');
    c.fillStyle = g; c.fill();
    c.save(); shape(near); c.clip();
    // light from the sun's side, shade away from it
    g = c.createLinearGradient(0, 0, W, 0); g.addColorStop(0, 'rgba(0, 30, 0, .25)'); g.addColorStop(1, 'rgba(255, 245, 190, .28)');
    c.globalCompositeOperation = 'soft-light'; c.fillStyle = g; c.fillRect(0, 0, W, H);
    // grass: broad soft patches of light and shade, then fine upright streaks
    const pat = c.createPattern(tile, 'repeat');
    c.globalAlpha = 0.38; c.fillStyle = pat;
    c.save(); c.scale(3.5 * S, 2 * S); c.fillRect(0, 0, W / (3.5 * S), H / (2 * S)); c.restore();
    c.globalAlpha = 0.22;
    c.save(); c.scale(0.4 * S, 3 * S); c.fillRect(0, 0, W / (0.4 * S), H / (3 * S)); c.restore();
    c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1;
    // then the field itself: thousands of thin strokes close in hue to the hill, tiny at the crest and longer toward
    // the foot, leaning a little with the wind, so they read as a texture of grass rather than as shapes
    c.lineCap = 'round';
    [['rgba(46, 120, 22, .7)', 0.32, 0], ['rgba(70, 150, 34, .65)', 0.3, 0], ['rgba(98, 176, 50, .55)', 0.24, 0.1], ['rgba(150, 212, 92, .45)', 0.14, 0.25]].forEach(([col, share, top]) => {
      c.strokeStyle = col;
      for (const lw of [0.6, 1]) {
        c.lineWidth = lw * S; c.beginPath();
        for (let i = 0; i < 1600 * share; i++) {
          const x = rnd() * W, depth = top + (1 - top) * rnd() ** 1.25, y = near(x) + 1.5 * S + depth * (H - near(x)), len = (1 + rnd() * 2 + depth * depth * 12) * S;
          c.moveTo(x, y); c.lineTo(x + (rnd() - 0.3) * len * 0.35, y - len);
        }
        c.stroke();
      }
    });
    c.restore();
    // the crest catches the light
    c.save(); c.shadowColor = 'rgba(230, 255, 180, .9)'; c.shadowBlur = 5 * S; c.strokeStyle = 'rgba(214, 250, 160, .65)'; c.lineWidth = 1.2 * S; c.beginPath();
    for (let x = 0; x <= W; x += 2) { const y = near(x) + 0.6 * S; if (x) c.lineTo(x, y); else c.moveTo(x, y); }
    c.stroke(); c.restore();

    c = shade.getContext('2d');
    g = c.createLinearGradient(0, H * 0.62, 0, H); g.addColorStop(0, 'rgba(8, 36, 6, 0)'); g.addColorStop(1, 'rgba(8, 36, 6, .5)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    g = c.createRadialGradient(W * 0.55, H * 0.42, Math.min(W, H) * 0.4, W * 0.55, H * 0.42, Math.max(W, H) * 0.78);
    g.addColorStop(0, 'rgba(0, 16, 30, 0)'); g.addColorStop(1, 'rgba(0, 16, 30, .32)');
    c.fillStyle = g; c.fillRect(0, 0, W, H);

    // the near grass, rooted under the frame's foot: denser and taller at the sides, so it frames the view; nearer
    // blades darker, longer and wider; each one answers a band of the music
    const blades = [];
    for (let i = 0; i < 58; i++) {
      let u = rnd();
      u = u < 0.5 ? 0.5 * (u * 2) ** 1.4 : 1 - 0.5 * ((1 - u) * 2) ** 1.4;
      const d = rnd(), side = 0.55 + 0.9 * Math.abs(u - 0.5);
      blades.push({ x: u * W, len: H * (0.14 + d * 0.34 + rnd() * 0.12) * side, w: (3.5 + d * 7 + rnd() * 2) * S, lean: (rnd() - 0.5) * 0.5 + (u - 0.5) * 0.35, ph: rnd() * 6.28, band: Math.floor(rnd() * 24), d });
    }
    blades.sort((a, b) => a.d - b.d);
    // out of focus in front of it all: big dark blades at the corners, drawn once, blurred, and only tilted as they sway
    const blurs = [[0.03, 0.95, 26, -0.08], [0.11, 0.7, 18, 0.1], [0.92, 0.85, 22, 0.06], [0.985, 0.62, 16, -0.12]].map(([u, l, w, lean]) => {
      const len = H * l, bw = w * S, pad = 8 * S, sp = layer(Math.ceil(bw + Math.abs(lean) * len + pad * 2), Math.ceil(len + pad * 2)), k = sp.getContext('2d');
      const ox = pad + (lean < 0 ? -lean * len : 0) + bw / 2, oy = sp.height - pad;
      k.filter = `blur(${3 * S}px)`; k.fillStyle = '#123f0b'; k.beginPath();
      k.moveTo(ox - bw / 2, oy); k.quadraticCurveTo(ox + lean * len * 0.2 - bw * 0.3, oy - len * 0.55, ox + lean * len, oy - len); k.quadraticCurveTo(ox + lean * len * 0.2 + bw * 0.3, oy - len * 0.55, ox + bw / 2, oy); k.fill();
      return { img: sp, x: u * W, ox, oy, ph: rnd() * 6.28 };
    });
    // the butterfly rests on a tall blade right of centre when the music stops
    const perch = blades.reduce((best, b, i) => (b.x > W * 0.58 && b.x < W * 0.82 && (best < 0 || b.len > blades[best].len) ? i : best), -1);
    return { W, H, S, sky, strip: cloudStrip(W, H), land, shade, blades, perch, blurs };
  }

  // four depths of near grass, from the farthest (lighter) to the nearest (darkest), each lit along its sun side
  const BLADE = ['#4f9e2c', '#3a8423', '#2a6a19', '#1b4d10'];
  const BLADE_LIT = ['rgba(196, 242, 128, .55)', 'rgba(176, 232, 110, .5)', 'rgba(154, 218, 98, .42)', 'rgba(126, 192, 82, .36)'];
  let scene = null, trace = null, flap = 0, lastVis = 0, sceneT = 0, cloudX = 0, wind = 0;
  function bladeTip(b, H, S, e, sway) {
    const len = b.len * (1 + e * 0.22), bend = b.lean * len + sway;
    return { len, bend, tx: b.x + bend, ty: H + 2 * S - len };
  }
  function bliss(c, W, H, S, lv, still) {
    if (!scene || scene.W !== W || scene.H !== H) scene = makeScene(W, H, S);
    const bass = lv ? (lv[0] + lv[1] + lv[2]) / 3 : 0, T = sceneT;
    c.drawImage(scene.sky, 0, 0);
    const sw = scene.strip.width, off = cloudX % sw;
    c.drawImage(scene.strip, -off, 0); c.drawImage(scene.strip, sw - off, 0);
    c.drawImage(scene.land, 0, 0);
    // the near grass, depth by depth: bodies, then their lit edges
    const D = BLADE.length;
    for (let k = 0; k < D; k++) {
      const lo = k / D, hi = (k + 1) / D, set = scene.blades.filter((b) => b.d >= lo && (b.d < hi || k === D - 1));
      const shapes = set.map((b) => {
        const e = lv ? lv[b.band] : 0, sway = still ? 0 : Math.sin(T * 1.4 + b.x * 0.004 / S + b.ph * 0.3) * (2 + wind * 14) * S * (b.len / H) * 3;
        const { len, tx, ty, bend } = bladeTip(b, H, S, e, sway), by = H + 2 * S, cx = b.x + bend * 0.2, cy = by - len * 0.55;
        return { b, tx, ty, cx, cy, by };
      });
      c.fillStyle = BLADE[k]; c.beginPath();
      for (const p of shapes) { const w = p.b.w; c.moveTo(p.b.x - w / 2, p.by); c.quadraticCurveTo(p.cx - w * 0.3, p.cy, p.tx, p.ty); c.quadraticCurveTo(p.cx + w * 0.3, p.cy, p.b.x + w / 2, p.by); }
      c.fill();
      c.fillStyle = BLADE_LIT[k]; c.beginPath();
      for (const p of shapes) { const w = p.b.w; c.moveTo(p.b.x + w * 0.04, p.by); c.quadraticCurveTo(p.cx + w * 0.18, p.cy, p.tx, p.ty); c.quadraticCurveTo(p.cx + w * 0.3, p.cy, p.b.x + w * 0.46, p.by); }
      c.fill();
    }
    // the butterfly: over the meadow while the music plays, bigger as it comes nearer; resting on its blade otherwise
    let bx, by, open, tilt, size;
    if (still) {
      const b = scene.blades[Math.max(0, scene.perch)], tip = bladeTip(b, H, S, 0, 0);
      bx = tip.tx; by = tip.ty - 3 * S; open = 0.6; tilt = b.lean * 0.6; size = 12 * S;
    } else {
      bx = W * (0.56 + 0.27 * Math.sin(T * 0.23) + 0.09 * Math.sin(T * 0.61 + 1.7));
      by = H * (0.3 + 0.11 * Math.sin(T * 0.37 + 0.6) + 0.04 * Math.sin(T * 1.3)) + Math.sin(flap * 2) * 1.2 * S;
      tilt = 0.18 * Math.cos(T * 0.23) + 0.06 * Math.sin(T * 1.1);
      open = 0.38 + 0.62 * Math.abs(Math.sin(flap));
      size = (10 + (by / H) * 6) * S;
    }
    butterfly(c, bx, by, size, open, tilt, S);
    for (const f of scene.blurs) {
      c.save(); c.translate(f.x, H + 2 * S); c.rotate(still ? 0 : Math.sin(T * 1.1 + f.ph) * (0.015 + wind * 0.05));
      c.drawImage(f.img, -f.ox, -f.oy); c.restore();
    }
    c.drawImage(scene.shade, 0, 0);
    // the sun's glow over it all, swelling a little with the bass
    const fx = W * 0.9, fy = -H * 0.08, fg = c.createRadialGradient(fx, fy, 0, fx, fy, W * (0.42 + bass * 0.12));
    fg.addColorStop(0, `rgba(255, 244, 214, ${0.16 + bass * 0.22})`); fg.addColorStop(1, 'rgba(255, 244, 214, 0)');
    c.save(); c.globalCompositeOperation = 'screen'; c.fillStyle = fg; c.fillRect(0, 0, W, H); c.restore();
  }
  // a painted lady: orange wings darkening to a black margin with pale spots, black tips with white spots, fine veins,
  // a segmented body and clubbed antennae; open is how far its wings show (they fold edge-on as they beat)
  function butterfly(c, x, y, s, open, tilt, S) {
    c.save(); c.translate(x, y); c.rotate(tilt);
    c.shadowColor = 'rgba(0, 30, 0, .3)'; c.shadowBlur = 3 * S; c.shadowOffsetY = 1.5 * S;
    const wing = (path, stops, margin) => {
      path();
      const g = c.createRadialGradient(0, 0, 0, 0, 0, s * 1.25);
      stops.forEach(([o, col]) => g.addColorStop(o, col));
      c.fillStyle = g; c.fill();
      c.save(); c.shadowColor = 'transparent'; path(); c.clip();
      c.lineWidth = margin * s; c.strokeStyle = '#26140a'; path(); c.stroke();
      return () => c.restore();
    };
    for (const side of [-1, 1]) {
      c.save(); c.scale(side * open, 1);
      const hind = () => { c.beginPath(); c.moveTo(0, s * 0.06); c.bezierCurveTo(s * 0.55, 0, s * 0.98, s * 0.42, s * 0.66, s * 0.9); c.bezierCurveTo(s * 0.42, s * 1.08, s * 0.12, s * 0.62, 0, s * 0.14); c.closePath(); };
      let done = wing(hind, [[0, '#ffbe57'], [0.6, '#f0822a'], [1, '#9a4612']], 0.24);
      c.fillStyle = '#fff1cc';
      [[0.62, 0.78], [0.78, 0.58], [0.45, 0.88]].forEach(([px, py]) => { c.beginPath(); c.arc(s * px, s * py, s * 0.045, 0, Math.PI * 2); c.fill(); });
      c.fillStyle = '#2a1608';
      [[0.5, 0.5], [0.66, 0.42]].forEach(([px, py]) => { c.beginPath(); c.arc(s * px, s * py, s * 0.06, 0, Math.PI * 2); c.fill(); });
      done();
      const fore = () => { c.beginPath(); c.moveTo(0, -s * 0.04); c.bezierCurveTo(s * 0.25, -s * 1.08, s * 1.22, -s * 1.06, s * 1.14, -s * 0.28); c.bezierCurveTo(s * 1.0, s * 0.04, s * 0.42, s * 0.12, 0, s * 0.04); c.closePath(); };
      done = wing(fore, [[0, '#ffc95f'], [0.55, '#f2892a'], [1, '#a14b12']], 0.18);
      c.fillStyle = '#21110a'; c.beginPath(); c.ellipse(s * 0.98, -s * 0.72, s * 0.42, s * 0.3, -0.5, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fff7e4';
      [[0.96, -0.74, 0.07], [0.78, -0.84, 0.055], [1.08, -0.52, 0.05]].forEach(([px, py, pr]) => { c.beginPath(); c.arc(s * px, s * py, s * pr, 0, Math.PI * 2); c.fill(); });
      c.strokeStyle = 'rgba(60, 25, 5, .35)'; c.lineWidth = Math.max(0.5, s * 0.035); c.beginPath();
      [[0.95, -0.55], [0.75, -0.2], [0.5, -0.75]].forEach(([px, py]) => { c.moveTo(0, 0); c.quadraticCurveTo(s * px * 0.5, s * py * 0.4, s * px, s * py); });
      c.stroke();
      done();
      c.restore();
    }
    c.shadowColor = 'transparent';
    c.fillStyle = '#2b1a0a';
    c.beginPath(); c.ellipse(0, s * 0.36, s * 0.075, s * 0.4, 0, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#3d2614';
    c.beginPath(); c.ellipse(0, -s * 0.04, s * 0.11, s * 0.2, 0, 0, Math.PI * 2); c.fill();
    c.beginPath(); c.arc(0, -s * 0.28, s * 0.08, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#2b1a0a'; c.lineWidth = Math.max(0.6, s * 0.05); c.beginPath();
    c.moveTo(0, -s * 0.32); c.quadraticCurveTo(-s * 0.1, -s * 0.78, -s * 0.3, -s * 0.95); c.moveTo(0, -s * 0.32); c.quadraticCurveTo(s * 0.1, -s * 0.78, s * 0.3, -s * 0.95);
    c.stroke();
    c.fillStyle = '#2b1a0a';
    c.beginPath(); c.arc(-s * 0.3, -s * 0.95, s * 0.05, 0, Math.PI * 2); c.arc(s * 0.3, -s * 0.95, s * 0.05, 0, Math.PI * 2); c.fill();
    c.restore();
  }
  const bars = new Array(32).fill(0), peaks = new Array(32).fill(0), hold = new Array(32).fill(0);
  function spectrum(c, cv, W, H, S, lv) {
    const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#060a14'); bg.addColorStop(1, '#0d1530');
    c.fillStyle = bg; c.fillRect(0, 0, W, H);
    const floor = Math.round(H * 0.78), bw = W / 32, seg = Math.max(3, Math.round(floor / 16)), gx = Math.max(1, Math.round(S)), gy = Math.max(1, Math.round(S));
    for (let b = 0; b < 32; b++) {
      const h = (lv ? lv[b] : 0) * floor * 0.96;
      // no music, no bars: a pause or a stop empties the floor at once
      if (!lv) { bars[b] = 0; peaks[b] = 0; hold[b] = 0; }
      bars[b] = h >= bars[b] ? h : Math.max(0, bars[b] - floor * 0.025);
      if (bars[b] >= peaks[b]) { peaks[b] = bars[b]; hold[b] = 14; } else if (hold[b] > 0) hold[b]--; else peaks[b] = Math.max(0, peaks[b] - floor * 0.01);
      const x = Math.round(b * bw) + gx, w = Math.round((b + 1) * bw) - Math.round(b * bw) - gx * 2;
      for (let k = 0; k * seg < bars[b]; k++) { c.fillStyle = VIS[15 - Math.min(15, k)]; c.fillRect(x, floor - (k + 1) * seg + gy, w, seg - gy); }
      if (peaks[b] > seg) { c.fillStyle = '#d8dde6'; c.fillRect(x, floor - Math.round(peaks[b]) - 2 * gy, w, 2 * gy); }
    }
    // the floor and the bars' reflection in it
    const rh = H - floor;
    c.save(); c.globalAlpha = 0.28; c.setTransform(1, 0, 0, -1, 0, floor * 2); c.drawImage(cv, 0, floor - rh, W, rh, 0, floor - rh, W, rh); c.restore();
    const fg = c.createLinearGradient(0, floor, 0, H); fg.addColorStop(0, 'rgba(13, 21, 48, .35)'); fg.addColorStop(1, 'rgba(13, 21, 48, 1)');
    c.fillStyle = fg; c.fillRect(0, floor, W, rh);
    c.fillStyle = 'rgba(160, 190, 255, .25)'; c.fillRect(0, floor, W, Math.max(1, Math.round(S)));
  }
  function scope(c, W, H, S, live) {
    // the trace lives on its own layer, fading a little each frame like a phosphor; the graticule stays still under it
    if (!trace || trace.width !== W || trace.height !== H) trace = layer(W, H);
    const t = trace.getContext('2d');
    if (live) { t.globalCompositeOperation = 'destination-out'; t.fillStyle = 'rgba(0,0,0,.3)'; t.fillRect(0, 0, W, H); t.globalCompositeOperation = 'source-over'; }
    else t.clearRect(0, 0, W, H);
    t.strokeStyle = '#9fd4ff'; t.lineWidth = 2 * S; t.lineJoin = 'round'; t.shadowColor = '#4aa8ff'; t.shadowBlur = 8 * S; t.beginPath();
    if (live && analyser) {
      if (!wave) wave = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(wave);
      for (let x = 0; x <= W; x += 2) { const y = H / 2 + ((wave[Math.floor((x / W) * (wave.length - 1))] - 128) / 128) * H * 0.42; if (x) t.lineTo(x, y); else t.moveTo(x, y); }
    } else { t.moveTo(0, H / 2); t.lineTo(W, H / 2); }
    t.stroke(); t.shadowBlur = 0;
    c.fillStyle = '#04070e'; c.fillRect(0, 0, W, H);
    c.fillStyle = 'rgba(110, 160, 255, .12)';
    for (let i = 1; i < 10; i++) c.fillRect(Math.round((W * i) / 10), 0, Math.max(1, Math.round(S / 2)), H);
    for (let j = 1; j < 8; j++) c.fillRect(0, Math.round((H * j) / 8), W, Math.max(1, Math.round(S / 2)));
    c.fillStyle = 'rgba(110, 160, 255, .22)'; c.fillRect(Math.round(W / 2), 0, Math.max(1, Math.round(S)), H); c.fillRect(0, Math.round(H / 2), W, Math.max(1, Math.round(S)));
    c.drawImage(trace, 0, 0);
  }
  function paintVis(lv) {
    if (!view) return;
    const cv = view.vis, S = Math.min(2, window.devicePixelRatio || 1);
    const W = Math.round(cv.clientWidth * S), H = Math.round(cv.clientHeight * S);
    if (!W || !H) return;
    if (cv.width !== W || cv.height !== H) { cv.width = W; cv.height = H; }
    const mode = VISUALS[st.vis], key = `${mode} ${W}x${H}`, still = !lv;
    // a pause holds the picture as it was, and a still picture isn't drawn twice; a stop, another visual or another
    // size draws it afresh
    if (still && view.visKey === key && (state === 'pause' || view.visStill)) return;
    view.visKey = key; view.visStill = still;
    const c = cv.getContext('2d'), now = performance.now() / 1000;
    const dt = Math.min(0.1, now - (lastVis || now)); lastVis = now;
    if (!still) {
      // the music's loudness is the meadow's wind; the scene's own clock runs only while it plays
      wind += (lv.reduce((a, v) => a + v, 0) / lv.length - wind) * 0.06;
      sceneT += dt; cloudX += dt * W * 0.012;
      // the wings beat faster when the music is loud
      flap += dt * (15 + (lv[0] + lv[4] + lv[10]) * 9);
    }
    if (mode === 'bliss') bliss(c, W, H, S, lv, still);
    else if (mode === 'bars') spectrum(c, cv, W, H, S, lv);
    else scope(c, W, H, S, !still);
  }

  let raf = 0, lastT = 0;
  const scrolls = () => view && view.lcdLit.clientWidth && dotsW(view.marqText, 2) > 332 && !mqReduce.matches;
  function loop() {
    if (raf) return;
    const tick = (now) => {
      raf = 0;
      if (!view || !view.host.isConnected) return;
      const dt = now - (lastT || now); lastT = now;
      if (view.host.offsetParent) {
        const video = isYT(list[cur]);
        if (video && yt && yt.getCurrentTime && !ytAd()) ytAt = yt.getCurrentTime() || ytAt;
        // the ad starting or ending changes what the LCD reads
        if (video) { const m = marquee(); if (m !== view.marqText) { view.marqText = m; view.marqX = 0; view.seek.disabled = !Number.isFinite(mediaDur()); } }
        const lv = state === 'play' && analyser && !video ? levels(32) : null;
        // under reduced motion nothing in the window moves with the music, the LCD's small spectrum included
        updateMini(mqReduce.matches ? null : lv);
        if (state === 'play' && !video) {
          paintVis(mqReduce.matches ? null : lv);
          // Random: a new visual every 20 seconds of music
          if (st.rnd) { view.rndT += dt; if (view.rndT > 20000) { view.rndT = 0; setVis(st.vis + 1 + Math.floor(Math.random() * (VISUALS.length - 1))); } }
        }
        if (scrolls()) { view.marqT += dt; if (view.marqT > 55) { view.marqX += Math.floor(view.marqT / 55); view.marqT %= 55; } }
        paintLcd();
      }
      if (state !== 'stop' || scrolls()) raf = requestAnimationFrame(tick); else lastT = 0;
    };
    raf = requestAnimationFrame(tick);
  }
  window.addEventListener('resize', () => { if (view && state !== 'play') { paintVis(null); paintLcd(); } });

  PF.winamp = {
    available: () => loadList().then((n) => n > 0 || isLocal),
    mount,
    caption,
    playing: () => state === 'play',
    // closing the window quits Winamp: the music stops, the list stays for the next time it opens
    stop() { stop(); closeMenu(false); if (yt && yt.destroy) yt.destroy(); yt = null; view = null; },
  };
})();
