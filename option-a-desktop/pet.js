/* The stickman on the taskbar: the reward for beating Boss Rush XP. app.js loads this file only once he has been
   earned (or switched back on from the game's menu) and calls DesktopPet.create({ lang, fresh, onPlay, onHide }).
   He walks along the top edge of the taskbar, turns to wave when the pointer comes near, sits with his legs over
   the edge now and then, and dozes off when nothing has moved for a while. Click him: a hop and a line of chat.
   Double-click him, or Enter on him: the game again. Right-click, or the context-menu key: play again or hide him.
   He only shows on desktop-sized screens with a mouse or trackpad, and under reduced motion he stands still.
   fresh: he has just been won, so he drops in from the top of the screen and the tray says so.
   create() -> { setLang(l), destroy() } */
(() => {
  'use strict';

  const STR = {
    en: {
      label: 'Stickman. Double-click to play Boss Rush XP again.',
      name: 'Stickman', play: 'Play again', hide: 'Hide the stickman', close: 'Close',
      installed: 'Stickman.exe installed', installedText: 'He lives on your taskbar now. Double-click him to play again.',
      quips: ['Hi!', 'I beat four bosses, you know.', 'This taskbar is safe with me.', 'Double-click me for a rematch.', 'Nice wallpaper.', 'Still here!', 'Ctrl+Alt+Del? Not on my watch.'],
    },
    id: {
      label: 'Stickman. Klik dua kali untuk main Boss Rush XP lagi.',
      name: 'Stickman', play: 'Main lagi', hide: 'Sembunyikan stickman', close: 'Tutup',
      installed: 'Stickman.exe terpasang', installedText: 'Ia sekarang tinggal di taskbar Anda. Klik dua kali untuk bermain lagi.',
      quips: ['Halo!', 'Aku sudah mengalahkan empat bos, lho.', 'Taskbar ini aman bersamaku.', 'Klik dua kali kalau mau tanding ulang.', 'Wallpaper-nya keren.', 'Masih di sini!', 'Ctrl+Alt+Del? Tidak selama aku berjaga.'],
    },
  };
  // his canvas in CSS px; the taskbar's top edge runs GROUND px down it, and his legs hang below it when he sits
  const CW = 64, CH = 96, GROUND = 78;
  const LEG = [11, 11], ARM = [8, 8];
  const SPEED = 38, SLEEP_AFTER = 45000;
  const TAU = Math.PI * 2;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const roomy = window.matchMedia('(min-width: 721px) and (any-pointer: fine)');
  const rand = (a, b) => a + Math.random() * (b - a);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = (name, size) => (window.PXI ? window.PXI.svg(name, size) : '');
  // a limb from (x, y): the first bone at angle a1 from straight down (forward positive), the second bent a2 more
  function limb(x, y, a1, a2, [l1, l2], f) {
    const kx = x + Math.sin(a1) * l1 * f, ky = y + Math.cos(a1) * l1;
    return [kx, ky, kx + Math.sin(a1 + a2) * l2 * f, ky + Math.cos(a1 + a2) * l2];
  }

  function create(opts) {
    let s = STR[opts.lang === 'id' ? 'id' : 'en'];
    const el = document.createElement('div');
    el.className = 'pet';
    el.innerHTML = '<canvas aria-hidden="true"></canvas><button class="pet-hit" type="button"></button><p class="pet-say" hidden></p>';
    const cv = el.querySelector('canvas'), hit = el.querySelector('.pet-hit'), say = el.querySelector('.pet-say');
    const ctx = cv.getContext('2d');
    document.body.appendChild(el);

    const me = {
      x: opts.fresh ? innerWidth / 2 : -30, face: 1, act: opts.fresh ? 'fall' : 'walk', t: 0, dur: 6, target: rand(140, 380),
      ph: 0, up: opts.fresh ? innerHeight : 0, upV: 0, land: 0, dust: 0, near: false, waveCd: 0, lastPoint: performance.now(),
    };
    if (reduceMotion) Object.assign(me, { x: clamp(opts.fresh ? innerWidth / 2 : 180, 40, innerWidth - 40), act: 'idle', up: 0, dur: Infinity });
    let raf = 0, last = 0, clock = 0, sayT = 0, lastQuip = -1, menu = null, note = null, dirty = true, groundY = innerHeight - 30;
    // the taskbar's top edge on screen, where he stands
    const measure = () => { const tb = document.getElementById('taskbar'); groundY = tb ? tb.getBoundingClientRect().top : innerHeight - 30; };
    measure();

    function go(act, dur, extra) { Object.assign(me, { act, t: 0, dur }, extra || {}); dirty = true; }
    // what to do next, mostly walking about
    function next() {
      if (reduceMotion) { go('idle', Infinity); return; }
      const r = Math.random();
      if (r < 0.5) go('walk', rand(3, 8), { target: clamp(me.x + rand(-420, 420), 30, innerWidth - 30) });
      else if (r < 0.72) go('idle', rand(2, 5));
      else if (r < 0.9) go('sit', rand(6, 14));
      else go('wave', 1.6);
    }

    function update(dt, now) {
      clock += dt; me.t += dt; me.waveCd -= dt;
      me.land = Math.max(0, me.land - dt * 5); me.dust = Math.max(0, me.dust - dt);
      if (sayT > 0 && (sayT -= dt) <= 0) say.hidden = true;
      if (reduceMotion) return;
      // in the air: dropping in when first won, or a hop after a click
      if (me.up > 0 || me.upV > 0) {
        me.upV -= (me.act === 'fall' ? 1500 : 900) * dt; me.up += me.upV * dt;
        if (me.up <= 0) {
          me.up = 0; me.upV = 0; me.land = 1;
          if (me.act === 'fall') { me.dust = 0.35; go('wave', 1.8); me.waveCd = 6; }
        }
        if (me.act === 'fall') return;
      }
      const sleepy = now - me.lastPoint > SLEEP_AFTER;
      if (me.act === 'walk') {
        const d = me.target - me.x, step = Math.sign(d) * Math.min(Math.abs(d), SPEED * dt);
        me.face = d < 0 ? -1 : 1; me.x += step; me.ph += Math.abs(step) * 0.16;
        if (Math.abs(d) < 1 || me.t > me.dur) next();
      } else if (me.act === 'look') {
        if (!me.near) next();
      } else if (me.act === 'sleep') {
        if (!sleepy) go('sit', 2);
      } else if (me.t > me.dur) {
        if (sleepy && (me.act === 'sit' || me.act === 'idle')) go('sleep', Infinity);
        else if (me.act === 'wave' && me.near) go('look', Infinity);
        else next();
      }
      me.x = clamp(me.x, -40, innerWidth + 40);
    }

    // the pose for this frame, as bone angles
    function pose(t) {
      const a = me.act, sit = a === 'sit' || a === 'sleep';
      let legs = [[0.08, 0], [-0.08, 0]], arms = [[0.15, 0.2], [-0.12, 0.15]];
      if (a === 'walk') {
        const sn = Math.sin(me.ph);
        legs = [[sn * 0.55, -Math.max(0, Math.sin(me.ph + 1.2)) * 0.9], [-sn * 0.55, -Math.max(0, -Math.sin(me.ph + 1.2)) * 0.9]];
        arms = [[-sn * 0.5, 0.35], [sn * 0.5, 0.3]];
      } else if (a === 'wave') arms = [[2.6, 0.4 + Math.sin(t * 12) * 0.45], [-0.15, 0.15]];
      else if (a === 'fall') { legs = [[0.35, -0.3], [-0.3, -0.2]]; arms = [[2.7, 0.2], [2.5, 0.3]]; }
      if (me.up > 0 && a !== 'fall') { legs = [[0.45, -0.9], [0.1, -0.6]]; arms = [[1.2, 0.6], [-0.9, 0.4]]; }
      if (sit) { const sw = Math.sin(t * 1.6); legs = [[1.45, -1.35 + sw * 0.18], [1.3, -1.2 - sw * 0.18]]; arms = [[0.8, 0.7], [0.6, 0.6]]; }
      // the longer leg reaches the ground; sitting, he rests on the edge
      const reach = (l) => Math.cos(l[0]) * LEG[0] + Math.cos(l[0] + l[1]) * LEG[1];
      const hipY = (sit ? GROUND - 1 : GROUND - Math.max(reach(legs[0]), reach(legs[1]))) + me.land * 3;
      const breathe = !reduceMotion && (a === 'idle' || a === 'look' || sit) ? Math.sin(t * 2.2) * 0.5 : 0;
      return { legs, arms, hipY, breathe, sit };
    }

    function draw() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      if (cv.width !== Math.round(CW * dpr)) { cv.width = Math.round(CW * dpr); cv.height = Math.round(CH * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, CW, CH);
      const t = reduceMotion ? 0 : clock, q = pose(t), f = me.face, cx = CW / 2, asleep = me.act === 'sleep';
      const hip = [cx, q.hipY], neck = [cx + (q.sit ? 0 : f), q.hipY - 16 + q.breathe];
      const head = [neck[0] + f + (asleep ? 2 * f : 0), neck[1] - 7 + (asleep ? 2 : 0)], sh = [neck[0], neck[1] + 2];
      const L = q.legs.map((l) => limb(hip[0], hip[1], l[0], l[1], LEG, f));
      const A = q.arms.map((l) => limb(sh[0], sh[1], l[0], l[1], ARM, f));
      const parts = [[...sh, ...A[1]], [...hip, ...L[1]], [...hip, ...neck], [...hip, ...L[0]], [...sh, ...A[0]]];
      const seg = (p) => { ctx.beginPath(); ctx.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) ctx.lineTo(p[i], p[i + 1]); ctx.stroke(); };
      const dot = (x, y, r) => { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); };
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      // a white halo keeps him readable over any window or wallpaper, as in the game
      ctx.strokeStyle = 'rgba(255,255,255,.92)'; ctx.lineWidth = 6.5; parts.forEach(seg);
      ctx.fillStyle = 'rgba(255,255,255,.92)'; dot(head[0], head[1], 8);
      ctx.lineWidth = 3.4;
      ctx.strokeStyle = '#4a4a4a'; seg(parts[0]); seg(parts[1]);
      ctx.strokeStyle = '#111'; seg(parts[2]); seg(parts[3]); seg(parts[4]);
      ctx.fillStyle = '#111'; dot(head[0], head[1], 5.6);
      // the red headband, its tails flying behind him
      const hy = head[1] - 2.2, flap = me.act === 'walk' || me.up > 0 ? 2.2 : 1, bx = head[0] - 5 * f;
      ctx.strokeStyle = '#e0301e'; ctx.lineWidth = 2.2;
      ctx.beginPath(); ctx.moveTo(head[0] - 5.4, hy); ctx.lineTo(head[0] + 5.4, hy); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(bx, hy); ctx.lineTo(bx - 5 * f, hy + 1 + Math.sin(t * 9) * flap); ctx.lineTo(bx - 10 * f, hy + 2 + Math.sin(t * 9 + 1.3) * flap * 1.3); ctx.stroke();
      // one eye, which shuts while he sleeps
      if (asleep) { ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(head[0] + 1.4 * f, head[1] + 0.5); ctx.lineTo(head[0] + 3.8 * f, head[1] + 0.5); ctx.stroke(); }
      else { ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(head[0] + 2.6 * f, head[1] - 0.4, 1.1, 1.6, 0, 0, TAU); ctx.fill(); }
      if (asleep) {
        ctx.font = 'bold 10px Tahoma, sans-serif'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
        for (let i = 0; i < 3; i++) {
          const k = (t * 0.45 + i / 3) % 1;
          ctx.globalAlpha = 1 - k; ctx.fillStyle = '#1f55c9'; ctx.strokeStyle = '#fff'; ctx.lineWidth = 2.5;
          const zx = head[0] + (7 + k * 9) * f - (f < 0 ? 6 : 0), zy = head[1] - 8 - k * 18;
          ctx.strokeText('z', zx, zy); ctx.fillText('z', zx, zy);
        }
        ctx.globalAlpha = 1;
      }
      // a puff of dust where he lands
      if (me.dust > 0) {
        const k = 1 - me.dust / 0.35;
        ctx.fillStyle = `rgba(255,255,255,${0.8 * (1 - k)})`;
        for (const d of [-1, 1]) for (let i = 0; i < 2; i++) dot(cx + d * (7 + k * 14 + i * 5), GROUND - 2 - i * 2, 2.5 + k * 2.5);
      }
    }

    // where his balloon sits: over his head, kept on screen, its tail still pointing at him
    function placeSay() {
      if (say.hidden) return;
      const bw = say.offsetWidth, left = clamp(CW / 2 - bw / 2, 4 - (me.x - CW / 2), innerWidth - 4 - bw - (me.x - CW / 2));
      say.style.left = `${left}px`;
      say.style.setProperty('--tail', `${clamp(CW / 2 - left, 10, bw - 10)}px`);
    }
    // an XP balloon tip: his name as its bold title, over what he says
    function speak(text) { say.innerHTML = `<b>${esc(s.name)}</b>${esc(text)}`; say.hidden = false; sayT = 2.8; placeSay(); }
    function quip() {
      let i = Math.floor(Math.random() * s.quips.length);
      if (i === lastQuip) i = (i + 1) % s.quips.length;
      lastQuip = i; speak(s.quips[i]);
    }
    const rect = () => { const r = hit.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };

    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      update(dt, now);
      el.style.transform = `translate(${Math.round(me.x - CW / 2)}px, ${-Math.round(me.up)}px)`;
      if (!say.hidden) placeSay();
      if (reduceMotion && !dirty) return;
      dirty = false;
      draw();
    }
    function start() { if (!raf && !el.hidden) { last = 0; raf = requestAnimationFrame(frame); } }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    // desktop-sized screens only
    function fit() { el.hidden = !roomy.matches; if (el.hidden) { stop(); closeMenu(); } else start(); }

    /* ---- the small menu: play again, hide him ---- */
    function openMenu(x, y) {
      closeMenu();
      menu = document.createElement('div');
      menu.className = 'menu pet-menu'; menu.setAttribute('role', 'menu');
      menu.innerHTML = `<button type="button" role="menuitem" data-a="play"><b>${esc(s.play)}</b></button><button type="button" role="menuitem" data-a="hide">${esc(s.hide)}</button>`;
      document.body.appendChild(menu);
      // it opens upward from the pointer, since he stands at the very bottom of the screen
      menu.style.left = `${clamp(x, 2, innerWidth - menu.offsetWidth - 2)}px`;
      menu.style.top = `${clamp(y - menu.offsetHeight, 2, innerHeight - menu.offsetHeight - 2)}px`;
      menu.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-a]');
        if (!b) return;
        closeMenu();
        if (b.dataset.a === 'play') opts.onPlay(rect()); else opts.onHide();
      });
      menu.addEventListener('keydown', (e) => {
        const bs = [...menu.querySelectorAll('button')], i = bs.indexOf(document.activeElement);
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); bs[(i + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length].focus(); }
        if (e.key === 'Escape') { e.preventDefault(); closeMenu(); hit.focus(); }
      });
      menu.querySelector('button').focus({ preventScroll: true });
      document.addEventListener('pointerdown', outside, true);
    }
    function outside(e) { if (menu && !menu.contains(e.target)) closeMenu(); }
    function closeMenu() {
      if (!menu) return;
      menu.remove(); menu = null;
      document.removeEventListener('pointerdown', outside, true);
    }

    /* ---- the tray's note that he has been installed ---- */
    function installed() {
      note = document.createElement('div');
      note.className = 'pet-note'; note.setAttribute('role', 'status');
      note.innerHTML = `<button type="button" class="pet-x" aria-label="${esc(s.close)}"></button><b>${icon('trophy', 16)}${esc(s.installed)}</b><p>${esc(s.installedText)}</p>`;
      document.body.appendChild(note);
      const drop = () => { if (note) { note.remove(); note = null; } };
      note.querySelector('.pet-x').addEventListener('click', drop);
      setTimeout(drop, 8000);
    }

    /* ---- input ---- */
    // keyboard activation (detail 0) plays; a mouse click is a hop and a word
    hit.addEventListener('click', (e) => {
      if (e.detail === 0) { opts.onPlay(rect()); return; }
      if (!reduceMotion && me.up === 0 && me.act !== 'fall') { me.upV = 260; me.up = 0.01; if (me.act === 'sleep') go('idle', 3); }
      me.lastPoint = performance.now();
      quip();
    });
    hit.addEventListener('dblclick', (e) => { e.preventDefault(); opts.onPlay(rect()); });
    hit.addEventListener('contextmenu', (e) => { e.preventDefault(); openMenu(e.clientX, e.clientY); });
    hit.addEventListener('keydown', (e) => {
      if (e.key === 'ContextMenu' || (e.shiftKey && e.key === 'F10')) { e.preventDefault(); const r = rect(); openMenu(r.x, r.y); }
    });
    // the pointer coming near makes him stop, turn and (now and then) wave
    const onMove = (e) => {
      me.lastPoint = performance.now();
      const near = Math.hypot(e.clientX - me.x, e.clientY - (groundY - 40 - me.up)) < 110;
      if (near && me.act !== 'fall') {
        const f = e.clientX < me.x ? -1 : 1;
        if (f !== me.face && me.act !== 'walk') { me.face = f; dirty = true; }
        if (!me.near && ['walk', 'idle', 'sit', 'sleep'].includes(me.act) && !reduceMotion) {
          me.face = f;
          if (me.waveCd <= 0) { go('wave', 1.4); me.waveCd = 8; } else go('look', Infinity);
        }
      }
      me.near = near;
    };
    const onResize = () => { measure(); me.x = clamp(me.x, 20, innerWidth - 20); if (me.act === 'walk') me.target = clamp(me.target, 30, innerWidth - 30); closeMenu(); };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', onResize);
    roomy.addEventListener('change', fit);

    function setLang(l) {
      s = STR[l === 'id' ? 'id' : 'en'];
      hit.setAttribute('aria-label', s.label); hit.title = s.label;
      say.hidden = true; closeMenu();
      if (note) { note.remove(); note = null; }
    }
    function destroy() {
      stop(); closeMenu();
      if (note) { note.remove(); note = null; }
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', onResize);
      roomy.removeEventListener('change', fit);
      el.remove();
    }

    setLang(opts.lang);
    // in place before the first frame, so he never shows at the left edge for a moment
    el.style.transform = `translate(${Math.round(me.x - CW / 2)}px, ${-Math.round(me.up)}px)`;
    fit();
    if (opts.fresh && !el.hidden) installed();
    return { setLang, destroy };
  }

  window.DesktopPet = { create };
})();
