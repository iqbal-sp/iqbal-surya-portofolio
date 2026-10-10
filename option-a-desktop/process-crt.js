// Local displacement of the process artwork near a mouse pointer. No continuous idle rendering.
(() => {
  'use strict';
  const ns = 'http://www.w3.org/2000/svg';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover: hover) and (pointer: fine)');
  let active = null, serial = 0, texture = null;
  const allowed = e => !reduce.matches && fine.matches && (!e || !e.pointerType || e.pointerType === 'mouse');
  const el = (name, attrs = {}) => {
    const node = document.createElementNS(ns, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    return node;
  };
  function lensTexture() {
    if (texture) return texture;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const pixels = ctx.createImageData(128, 128);
    for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) {
      const dx = (x - 63.5) / 63.5, dy = (y - 63.5) / 63.5;
      const radius = Math.hypot(dx, dy);
      const weight = radius < 1 ? Math.pow(1 - radius * radius, 2) : 0;
      const i = (y * 128 + x) * 4;
      pixels.data[i] = Math.round(128 + dx * 118 * weight);
      pixels.data[i + 1] = Math.round(128 + dy * 118 * weight);
      pixels.data[i + 2] = 128;
      pixels.data[i + 3] = 255;
    }
    ctx.putImageData(pixels, 0, 0);
    texture = canvas.toDataURL('image/png');
    return texture;
  }
  function clear(s) {
    if (!s) return;
    cancelAnimationFrame(s.raf);
    s.img.style.removeProperty('filter');
    s.screen.classList.remove('pointer-distort');
    ['--crt-pointer-x', '--crt-pointer-y', '--crt-pointer-radius', '--crt-pointer-strength'].forEach(key => s.screen.style.removeProperty(key));
    s.svg.remove();
    s.glow.remove();
    if (active === s) active = null;
  }
  function tick(s, now) {
    s.raf = 0;
    if (!s.img.isConnected || !allowed() || document.hidden) { clear(s); return; }
    const target = s.inside ? now - s.moved < 100 ? s.peak : 8 : 0;
    const dt = Math.min(32, Math.max(1, now - s.frameTime));
    s.frameTime = now;
    s.scale += (target - s.scale) * (1 - Math.exp(-dt / 65));
    s.displace.setAttribute('scale', s.scale.toFixed(2));
    s.screen.style.setProperty('--crt-pointer-strength', Math.min(.28, s.scale / 230).toFixed(3));
    if (!s.inside && s.scale < .2) { clear(s); return; }
    if (Math.abs(target - s.scale) > .2 || (s.inside && now - s.moved < 110)) s.raf = requestAnimationFrame(time => tick(s, time));
  }
  function wake(s) {
    if (s.raf) return;
    s.frameTime = performance.now();
    s.raf = requestAnimationFrame(time => tick(s, time));
  }
  function arm(screen) {
    const img = screen.querySelector('.pe-img');
    if (!img || !img.complete || !img.naturalWidth) return null;
    if (active?.screen === screen && active.img === img) return active;
    clear(active);
    const href = lensTexture();
    if (!href) return null;
    const svg = el('svg', { width: 0, height: 0, 'aria-hidden': 'true', focusable: 'false', class: 'pe-distort-defs' });
    const defs = el('defs');
    const filter = el('filter', { id: `process-lens-${++serial}`, filterUnits: 'userSpaceOnUse', primitiveUnits: 'userSpaceOnUse', x: 0, y: 0, 'color-interpolation-filters': 'sRGB' });
    const neutral = el('feFlood', { 'flood-color': '#808080', result: 'neutral' });
    const lens = el('feImage', { href, preserveAspectRatio: 'none', result: 'lens' });
    const composite = el('feComposite', { in: 'lens', in2: 'neutral', operator: 'over', result: 'field' });
    const displace = el('feDisplacementMap', { in: 'SourceGraphic', in2: 'field', scale: 0, xChannelSelector: 'R', yChannelSelector: 'G' });
    filter.append(neutral, lens, composite, displace); defs.append(filter); svg.append(defs); screen.append(svg);
    const glow = document.createElement('span');
    glow.className = 'crt-pointer-glow'; glow.setAttribute('aria-hidden', 'true'); screen.append(glow);
    const s = { screen, img, svg, glow, filter, lens, displace, inside: true, scale: 0, peak: 48, moved: 0, frameTime: 0, raf: 0, x: null, y: null };
    active = s;
    img.style.filter = `url(#${filter.id})`;
    screen.classList.add('pointer-distort');
    return s;
  }
  function move(e) {
    if (!allowed(e)) return;
    const screen = e.target.closest?.('.pe-screen');
    if (!screen) return;
    const s = arm(screen);
    if (!s) return;
    const bounds = s.img.getBoundingClientRect(), now = performance.now();
    const x = Math.max(0, Math.min(bounds.width, e.clientX - bounds.left));
    const y = Math.max(0, Math.min(bounds.height, e.clientY - bounds.top));
    const speed = s.x === null ? .8 : Math.hypot(x - s.x, y - s.y) / Math.max(8, now - s.moved);
    const radius = Math.max(60, Math.min(125, bounds.width * .16));
    s.filter.setAttribute('width', bounds.width);
    s.filter.setAttribute('height', bounds.height);
    s.lens.setAttribute('x', x - radius); s.lens.setAttribute('y', y - radius);
    s.lens.setAttribute('width', radius * 2); s.lens.setAttribute('height', radius * 2);
    s.screen.style.setProperty('--crt-pointer-x', `${x}px`);
    s.screen.style.setProperty('--crt-pointer-y', `${y}px`);
    s.screen.style.setProperty('--crt-pointer-radius', `${radius}px`);
    s.peak = Math.min(64, 30 + speed * 22);
    s.x = x; s.y = y; s.moved = now; s.inside = true;
    wake(s);
  }
  function leave() {
    if (!active) return;
    active.inside = false;
    wake(active);
  }
  document.addEventListener('pointerover', move, { passive: true });
  document.addEventListener('pointermove', move, { passive: true });
  document.addEventListener('pointerout', e => {
    if (active && !active.screen.contains(e.relatedTarget)) leave();
  }, { passive: true });
  document.addEventListener('pointercancel', leave, { passive: true });
  document.addEventListener('pointerdown', e => { if (active && !active.screen.contains(e.target)) clear(active); }, { passive: true });
  window.addEventListener('blur', () => clear(active));
  window.addEventListener('resize', () => clear(active), { passive: true });
  document.addEventListener('visibilitychange', () => { if (document.hidden) clear(active); });
  reduce.addEventListener('change', () => { if (reduce.matches) clear(active); });
  fine.addEventListener('change', () => { if (!fine.matches) clear(active); });
})();
