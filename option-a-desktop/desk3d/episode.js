/*
  The 3D desk on Home's episode TV ("How a project runs"). Each episode's still (asset/Home/process/, rendered from
  this same desk) is always in the screen; where the desk can run it draws over the still, and the remote's keys
  glide the camera along the desk (app.js calls PF.desk3d.go). three.js and the desk are fetched only once the TV
  comes near the viewport on a screen wider than a phone, so a phone never downloads them. Phones, reduced motion,
  no WebGL, or ?desk=static keep the stills.
*/
const PF = (window.PF = window.PF || {});
// phone mode, as style.css's SMALL SCREENS and the wallpaper ask it
const mqMobile = window.matchMedia('(max-width: 720px), (max-height: 500px) and (pointer: coarse)');
const mqReduce = window.matchMedia('(prefers-reduced-motion: reduce)');
const wantStatic = new URLSearchParams(location.search).get('desk') === 'static';

let desk = null, host = null, watched = null, loading = null, failed = false;

// the episode the remote shows as pressed, for a desk mounted after the visitor already changed episode
function remoteEp(screen) {
  const on = screen.closest('.pe-set')?.querySelector('.rm-num[aria-pressed="true"]');
  return on ? +on.dataset.i || 0 : 0;
}

function hasWebGL() {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch (e) { return false; }
}
const allowed = () => !failed && !wantStatic && !mqReduce.matches && !mqMobile.matches;

function mount(screen) {
  if (host === screen || !allowed()) return;
  if (host) host.classList.remove('is-3d');
  host = screen;
  // the page has one desk: one built for an earlier screen moves to this one, at the episode its remote shows
  if (desk) {
    const d = desk, ep = remoteEp(screen);
    d.move(screen);
    if (d.state().active !== ep) d.go(ep, { instant: true });
    d.ready.then(() => { if (desk === d && host === screen) screen.classList.add('is-3d'); });
    return;
  }
  loading = loading || import('./desk.js');
  loading.then(({ createDesk }) => {
    if (host !== screen || !screen.isConnected || !allowed() || desk) return;
    const d = desk = createDesk(screen, { start: remoteEp(screen), onLost: () => { failed = true; unmount(); } });
    // the desk builds in idle time; the still and the snow stay until it has drawn
    d.ready.then(() => { if (desk === d && host === screen) screen.classList.add('is-3d'); });
  }).catch((err) => { failed = true; host = null; console.warn('[desk3d] staying on the stills:', err); });
}
// the screen went with its Home (closed, or built again): the desk waits off the page for the next screen
function park() {
  if (desk) desk.park();
  if (host) host.classList.remove('is-3d');
  host = null;
}
function unmount() {
  if (desk) { desk.destroy(); desk = null; }
  if (host) host.classList.remove('is-3d');
  host = null;
}

// Home is built and rebuilt by app.js (opening the window, switching language), so the screen is looked up again
// whenever the page changes, and the desk moves to the new screen once that screen comes within 600px of the view.
// Measured against Home's own scroller (the screen scrolls inside the window, so the viewport's margin never reaches
// it), so the desk is built and drawn before the TV shows. A jump down Home (app.js, PF.homeJumping) only passes the
// screen: it is looked at again where the jump lands
let near = null;
function watch(screen) {
  if (near) near.disconnect();
  near = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting || e.target !== watched) continue;
      if (PF.homeJumping) addEventListener('pf-jumpend', () => { if (watched === screen) watch(screen); }, { once: true });
      else mount(e.target);
    }
  }, { root: screen.closest('.win-body'), rootMargin: '600px 0px' });
  near.observe(screen);
}

let queued = false;
function check() {
  queued = false;
  if (host && !host.isConnected) park();
  const screen = document.querySelector('.home .pe-screen');
  if (screen === watched) return;
  if (near) near.disconnect();
  watched = screen;
  if (screen) watch(screen);
}

if (!wantStatic && !mqReduce.matches && hasWebGL()) {
  // a timer rather than a frame: a tab that is not painting still has to notice the screen
  new MutationObserver(() => { if (!queued) { queued = true; setTimeout(check, 60); } }).observe(document.body, { childList: true, subtree: true });
  mqMobile.addEventListener('change', () => { if (mqMobile.matches) unmount(); else if (watched) watch(watched); });
  check();
}

PF.desk3d = {
  go(i) { if (desk) desk.go(i); },
  state: () => ({ mounted: !!desk, failed, desk: desk ? desk.state() : null }),
};
