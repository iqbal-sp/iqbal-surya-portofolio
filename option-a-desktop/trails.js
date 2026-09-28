/* Pointer trails: the reward for beating Screen Saver XP, as Mouse Properties' "Display pointer trails" drew them in XP.
   app.js loads this file only once they have been earned (or switched back on from the game's menu or its Settings)
   and calls PointerTrails.create({ lang, fresh }). A few copies of the arrow follow the pointer and catch up with it
   when it stops. A touch screen has no pointer, so there they follow a finger moving over the desktop. They are
   drawn on one canvas over the page that takes no input, and it rests while nothing moves. Not over Screen Saver XP's
   own stage, whose cursor is part of the game. app.js never loads them under reduced motion.
   fresh: they have just been won, so the tray says so at once. On a small screen app.js leaves fresh off, because the
   note would cover the win screen, and calls notify() once the game's window is out of the way.
   create() -> { setLang(l), notify(), destroy() } */
(() => {
  'use strict';

  const STR = {
    en: {
      installed: 'Pointer trails installed', close: 'Close',
      installedText: 'Your reward is on the desktop: the pointer leaves a trail. Switch it off in Screen Saver XP’s Settings.',
      installedTouch: 'Your reward is on the desktop: a trail of arrows follows your finger. Switch it off in Screen Saver XP’s Settings.',
    },
    id: {
      installed: 'Jejak pointer terpasang', close: 'Tutup',
      installedText: 'Hadiahmu sudah ada di desktop: pointer meninggalkan jejak. Matikan lewat Pengaturan di Screen Saver XP.',
      installedTouch: 'Hadiahmu sudah ada di desktop: jejak panah mengikuti jarimu. Matikan lewat Pengaturan di Screen Saver XP.',
    },
  };
  // how many arrows follow, and how much of the pointer's past (ms) lies between two of them
  const COPIES = 6, EVERY = 30;
  // XP's arrow, its tip at the hotspot, as the game draws it
  const ARROW = [[0, 0], [0, 17], [4, 13.2], [6.9, 19.6], [9.5, 18.5], [6.7, 12.3], [12, 12.3]];
  const esc = (v) => String(v).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));

  function create(opts = {}) {
    let s = STR[opts.lang === 'id' ? 'id' : 'en'];
    const c = document.createElement('canvas');
    c.className = 'trails'; c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    const x = c.getContext('2d');
    let k = 1, raf = 0, note = null;
    const path = [];   // where the pointer has been: { x, y, t }
    const fit = () => { k = Math.min(window.devicePixelRatio || 1, 2); c.width = Math.round(innerWidth * k); c.height = Math.round(innerHeight * k); };
    fit();

    function arrow(px, py, a) {
      x.globalAlpha = a;
      x.beginPath();
      ARROW.forEach(([ax, ay], i) => (i ? x.lineTo(px + ax, py + ay) : x.moveTo(px, py)));
      x.closePath();
      x.fillStyle = '#fff'; x.fill();
      x.lineJoin = 'miter'; x.lineWidth = 1; x.strokeStyle = '#000'; x.stroke();
    }
    // where the pointer was at time t: the last point it had reached by then
    function at(t) {
      let p = null;
      for (const q of path) { if (q.t > t) break; p = q; }
      return p;
    }
    function frame(now) {
      raf = 0;
      x.setTransform(k, 0, 0, k, 0, 0);
      x.clearRect(0, 0, innerWidth, innerHeight);
      // the oldest copy looks this far back; what is older than that is forgotten, and once the pointer has been still
      // that long every copy sits under it and the canvas rests
      const reach = COPIES * EVERY;
      while (path.length > 1 && now - path[1].t > reach) path.shift();
      const end = path[path.length - 1];
      if (!end || now - end.t > reach) { path.length = 0; return; }
      for (let i = COPIES; i >= 1; i--) {
        const p = at(now - i * EVERY);
        if (p && (p.x !== end.x || p.y !== end.y)) arrow(p.x, p.y, 0.55 * (1 - i / (COPIES + 1)));
      }
      x.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    }
    const onMove = (e) => {
      const t = e.target;
      if (t && t.closest && t.closest('.ss-host')) return;
      // a finger only leaves a trail on the bare desktop, never over a window
      if (e.pointerType !== 'mouse' && !(t && t.closest && t.closest('#desktop') && !t.closest('.win'))) return;
      path.push({ x: e.clientX, y: e.clientY, t: performance.now() });
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('resize', fit);

    /* ---- the tray's note that they have been installed ---- */
    function installed() {
      if (note) return;
      note = document.createElement('div');
      note.className = 'pet-note'; note.setAttribute('role', 'status');
      const ico = window.PXI ? window.PXI.svg('moon', 16) : '';
      note.innerHTML = `<button type="button" class="pet-x" aria-label="${esc(s.close)}"></button><b>${ico}${esc(s.installed)}</b><p>${esc(matchMedia('(pointer: coarse)').matches ? s.installedTouch : s.installedText)}</p>`;
      document.body.appendChild(note);
      const drop = () => { if (note) { note.remove(); note = null; } };
      note.querySelector('.pet-x').addEventListener('click', drop);
      setTimeout(drop, 8000);
    }

    function setLang(l) {
      s = STR[l === 'id' ? 'id' : 'en'];
      if (note) { note.remove(); note = null; }
    }
    function destroy() {
      cancelAnimationFrame(raf); raf = 0;
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('resize', fit);
      if (note) { note.remove(); note = null; }
      c.remove();
    }

    if (opts.fresh) installed();
    return { setLang, notify: installed, destroy };
  }

  window.PointerTrails = { create };
})();
