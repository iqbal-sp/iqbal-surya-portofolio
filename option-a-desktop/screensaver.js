/* Screen Saver XP: the portfolio's second game, a bullet hell for a phone as much as a desk (GAME2_BRIEF.md). The
   visitor is the mouse cursor, with Boss Rush XP's stickman riding it, against XP's own screensavers one after another:
   Starfield, Mystify, 3D Pipes, Marquee, and last Blank, kept out of the menu's demo until a run has reached it. The
   cursor fires on its own and only the tip of the arrow can be hit.
   The game's window is a device, drawn after the owner's reference (2026-09-30): app.js draws its warm grey body and
   its two keys, sound and start/pause, and this file draws its screen, in a shadow root so its classes and the
   portfolio's never meet. The screen holds the HUD over the arena (360 by 480 units on one canvas), a menu before each
   run (Start game, How to play, Leaderboard, About this game) over a dim live demo, and every other screen, all in the
   game's own pixel letters (SSXP Pixel, asset/fonts): grey, with orange for what matters. The leaderboard is
   worker/index.js with ?game=ssxp. app.js loads this file the first time the game's window opens or the idle
   screensaver runs, as it loads game.js.
   window.ScreenSaverXP.create({ lang, owner, onContact, onWin, onReboot, onRun, onKeys, touchArea }) -> game:
   attach(host), setLang(l), primary(), toggleSound(), isPaused(), isMuted(), focus(), destroy().
   onWin: a full run is won; the portfolio answers 'new' the first time (the pointer trails go on its desktop).
   onReboot(done): Blank.scr is beaten; the portfolio replays its loading screen, then calls done for the result.
   onRun(step): how far a full run got, for the portfolio's day counts: start, boss2 to boss4, final, win, practice,
   practice-done.
   onKeys({ muted, go }): what the device's keys show: the sound, and what start/pause does now ('start', 'pause',
   'resume', 'ok' for a screen's default choice, or 'none').
   primary(): the orange key: it starts a run from the menu, pauses and resumes a fight, and takes a screen's default.
   touchArea: the device's body, where a finger may also start a drag. */
(() => {
  'use strict';

  // SSXP Pixel (asset/fonts/ssxp-pixel.woff), the letters drawn for this game's screen; found from this file's own
  // address, since the page may sit anywhere
  const PIXEL_FONT_URL = new URL('../asset/fonts/ssxp-pixel.woff?v=1', document.currentScript ? document.currentScript.src : location.href).href;
  let pixelFont = null;
  function loadPixelFont() {
    if (pixelFont || typeof FontFace === 'undefined' || !document.fonts) return;
    try { pixelFont = new FontFace('SSXP Pixel', `url("${PIXEL_FONT_URL}") format("woff")`); document.fonts.add(pixelFont); pixelFont.load().catch(() => {}); } catch (e) { pixelFont = null; }
  }

  /* ------------------------------------------------------------ the screen's own styles, inside its shadow root */
  const CSS = `:host {
  --lcd: #d3cfc9;
  --lcd-hi: #f1eee9;
  --lcd-dim: #8a8580;
  --lcd-off: #34312e;
  --lcd-line: #5d5955;
  --acc: #e0683f;
  --hud: 28px;
  --px: "SSXP Pixel", ui-monospace, monospace;
  --ui: "Noto Sans", sans-serif;
  color-scheme: dark;
}
/* the screen sits in the device's body (app.js), as large as the body lets it be; round it is the body's plastic */
:host { position: relative; display: grid; place-items: center; width: 100%; height: 100%; overflow: hidden; color: var(--lcd); font: 16px/20px var(--px); -webkit-text-size-adjust: 100%; -webkit-font-smoothing: antialiased; }
*, *::before, *::after { box-sizing: border-box; }
button, input, textarea { margin: 0; font: inherit; color: inherit; }
::selection { background: var(--acc); color: #000; }
[hidden] { display: none !important; }
/* a screen with more on it than fits (a short phone's leaderboard) scrolls, with a thin dark bar */
* { scrollbar-width: thin; scrollbar-color: var(--lcd-line) transparent; }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-thumb { border-radius: 3px; background: var(--lcd-line); }
/* read aloud, not shown: what the dot-matrix numbers say */
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }

/* the screen: black glass with round corners, the HUD over the arena */
.stage { position: relative; display: grid; grid-template-rows: var(--hud) var(--ah); width: var(--aw); background: #000; border-radius: 14px; overflow: hidden; outline: none; container: scr / inline-size; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; box-shadow: 0 0 0 1px #2c2926, 0 1px 0 1px rgba(255, 255, 255, .14); }
.arena { position: relative; width: var(--aw); height: var(--ah); }
.arena canvas { display: block; width: 100%; height: 100%; }
.stage.fight .arena canvas { cursor: none; }

/* the HUD: health, the boss and its bar, the clock, over a dotted rule */
.hud { position: relative; display: flex; align-items: center; gap: 8px; min-width: 0; padding: 0 12px; }
.hud::after { content: ""; position: absolute; left: 8px; right: 8px; bottom: 0; height: 2px; background: radial-gradient(circle, #45413d 0.9px, transparent 1.1px) 0 0 / 4px 2px repeat-x; }
.hp { flex: none; display: flex; gap: 2px; }
.hp i { position: relative; width: 8px; height: 8px; background: var(--lcd-off); overflow: hidden; }
.hp i.on { background: var(--acc); }
.hp i em { position: absolute; left: 0; right: 0; bottom: 0; height: 0; background: var(--acc); opacity: .5; }
.hp i.lost { animation: lost .5s ease-out; }
@keyframes lost { from { background: var(--lcd-hi); } }
.bname { flex: 0 1 auto; min-width: 0; overflow: hidden; white-space: nowrap; color: var(--lcd-dim); }
/* the boss's health: a row of dots, lit for what is left, with an orange tick at the half where phase two begins */
.bbar { position: relative; flex: 1 1 24px; min-width: 24px; height: 8px; }
.bbar::before, .bbar b { position: absolute; top: 0; bottom: 0; left: 0; background: radial-gradient(circle, currentColor 1.6px, transparent 1.9px) 0 0 / 4px 8px repeat-x; }
.bbar::before { content: ""; right: 0; color: var(--lcd-off); }
.bbar b { width: 100%; color: var(--lcd); }
.bbar i { position: absolute; left: 50%; top: -2px; bottom: -2px; width: 2px; margin-left: -1px; background: var(--acc); }
.clock { flex: none; }
/* Blank.scr: the light goes out of the screen, and only what still works stays lit (health and the clock) */
.stage.blank :is(.bname, .bbar) { opacity: .3; transition: opacity 1.2s ease; }
@media (prefers-reduced-motion: reduce) { .stage.blank :is(.bname, .bbar) { transition: none; } }

/* the first fight's pointers: a box at the core and one at the hotspot, each with its point */
.tips, .chips { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.tip { position: absolute; left: 0; top: 0; width: max-content; max-width: min(260px, calc(100% - 16px)); padding: 8px 12px; border: 1px solid var(--lcd-line); border-radius: 8px; background: #000; color: var(--lcd-hi); opacity: 0; transition: opacity .25s ease-out; }
.tip b { display: block; margin-bottom: 4px; color: var(--acc); font-weight: 400; }
.tip.on { opacity: 1; }
.tip::after { content: ""; position: absolute; left: calc(var(--sx, 24px) - 6px); width: 12px; height: 12px; background: #000; transform: rotate(45deg); }
.tip.up::after { top: -7px; border-left: 1px solid var(--lcd-line); border-top: 1px solid var(--lcd-line); }
.tip.down::after { bottom: -7px; border-right: 1px solid var(--lcd-line); border-bottom: 1px solid var(--lcd-line); }
@media (prefers-reduced-motion: reduce) { .tip { transition: none; } }
/* callouts over play: a pill ringed in orange; a boss's name comes in big dot-matrix letters */
.chip { position: absolute; left: 50%; top: 40%; translate: -50% -50%; padding: 4px 16px; border: 1px solid var(--acc); border-radius: 999px; background: rgba(0, 0, 0, .8); color: var(--lcd-hi); white-space: nowrap; animation: chip var(--dur, 1.5s) ease-out forwards; }
.chip.big { top: 34%; width: max-content; max-width: calc(100% - 16px); padding: 0; border: 0; background: none; color: var(--lcd-hi); font-size: 24px; line-height: 30px; white-space: normal; text-align: center; -webkit-mask: radial-gradient(circle, #000 1.05px, transparent 1.3px) 0 0 / 3px 3px; mask: radial-gradient(circle, #000 1.05px, transparent 1.3px) 0 0 / 3px 3px; }
.chip.low { top: 78%; width: max-content; max-width: calc(100% - 32px); white-space: normal; text-align: center; }
@keyframes chip { 0% { opacity: 0; transform: scale(1.18); } 12% { opacity: 1; transform: scale(1); } 60% { opacity: 1; } 100% { opacity: 0; } }
@keyframes chip-still { 0%, 60% { opacity: 1; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .chip { animation-name: chip-still; } }

/* practice: a box at the top of the arena with the lesson, its step, how to do it, and Skip */
.les { position: absolute; left: 8px; right: 8px; top: 8px; display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 12px; align-items: center; padding: 8px 12px; border: 1px solid var(--lcd-line); border-radius: 8px; background: rgba(0, 0, 0, .86); }
.les-h { display: flex; justify-content: space-between; gap: 8px; }
.les-h b { color: var(--acc); font-weight: 400; }
.les-h span { color: var(--lcd-dim); }
.les p { grid-column: 1; margin: 0; text-wrap: pretty; }
.les .pill { grid-column: 2; grid-row: 1 / span 2; }

/* the screens: the menu before a run and its pages over the demo, and a fight's screens over the arena */
.front, .layer { position: absolute; inset: 0; z-index: 5; overflow-y: auto; overscroll-behavior: contain; padding: 16px; background: rgba(0, 0, 0, .92); }
.front { background: rgba(0, 0, 0, .78); }
/* a result and what follows it (sharing, the board) lie on plain black, clear of the arena's last picture */
.layer.solid { background: #000; }
/* under a screen only the arena shows through, dimmed: the HUD's figures, the pointers and the menu's page wait */
.stage:is(.demo, .over) .hud > *, .stage:is(.demo, .over) .hud::after, .stage.over :is(.front, .tips, .chips, .les) { visibility: hidden; }
.scr { display: flex; flex-direction: column; gap: 12px; min-height: 100%; }
.scr.mid { align-items: center; text-align: center; }
.scr p { margin: 0; text-wrap: pretty; }
.scr-h { color: var(--acc); }
.row-h { display: flex; justify-content: space-between; gap: 12px; }
.dim { color: var(--lcd-dim); }
.acc { color: var(--acc); }
.hi { color: var(--lcd-hi); }
.grow { flex: 1 1 auto; }
.scr a { color: var(--acc); text-underline-offset: 3px; }
.scr a:focus-visible { outline: 1px solid var(--acc); outline-offset: 2px; }
/* a screen's choices: pills in a column, the picked one ringed in orange with its ▶ */
.menu { display: flex; flex-direction: column; align-items: center; }
.menu button { display: inline-flex; align-items: center; gap: 8px; min-height: 32px; padding: 0 16px; border: 1px solid transparent; border-radius: 999px; background: none; cursor: pointer; }
.menu button:hover { color: var(--lcd-hi); }
.menu button:focus { outline: none; }
.menu button:focus, .menu:not(:focus-within) button.sel { border-color: var(--acc); }
.menu button:focus::before, .menu:not(:focus-within) button.sel::before { content: "▶"; color: var(--acc); }
.menu button:disabled { color: var(--lcd-off); cursor: default; }
/* a small action inside a screen (Save, Try again, Skip): a pill ringed in orange */
.pill { display: inline-flex; align-items: center; justify-content: center; min-height: 32px; padding: 0 16px; border: 1px solid var(--acc); border-radius: 999px; background: none; cursor: pointer; }
.pill:hover { color: var(--lcd-hi); }
.pill:focus-visible { outline: 1px solid var(--lcd-hi); outline-offset: 2px; }
.pill:disabled { border-color: var(--lcd-off); color: var(--lcd-off); cursor: default; }
@media (pointer: coarse) { .menu button, .pill { min-height: 44px; } }

/* dot-matrix: numbers and marks drawn big, each of their pixels a round dot */
.dots4 { display: inline-block; font-size: 32px; line-height: 40px; -webkit-mask: radial-gradient(circle, #000 1.45px, transparent 1.7px) 0 0 / 4px 4px; mask: radial-gradient(circle, #000 1.45px, transparent 1.7px) 0 0 / 4px 4px; }
.dots3 { display: inline-block; line-height: 0; -webkit-mask: radial-gradient(circle, #000 1.05px, transparent 1.3px) 0 0 / 3px 3px; mask: radial-gradient(circle, #000 1.05px, transparent 1.3px) 0 0 / 3px 3px; }
.dots3 svg { display: block; }
.big { color: var(--lcd-hi); }
.best { display: grid; justify-items: center; gap: 4px; }
/* the grade, stamped: its letter in dots, in an orange frame */
.res { display: flex; align-items: center; justify-content: center; gap: 16px; }
.grade { display: grid; place-items: center; width: 56px; height: 56px; border: 2px solid var(--acc); border-radius: 12px; color: var(--acc); animation: stamp .45s cubic-bezier(.2, .8, .3, 1) .2s both; }
.grade.still { animation: none; }
@keyframes stamp { from { opacity: 0; transform: scale(1.7) rotate(-10deg); } 70% { opacity: 1; transform: scale(.94) rotate(1deg); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .grade { animation: none; } }
.gift { display: flex; align-items: flex-start; gap: 8px; text-align: left; color: var(--lcd-hi); }
.gift svg { flex: none; margin-top: 2px; }
/* how to play: what each move is, the move in orange */
.list { display: grid; grid-template-columns: max-content minmax(0, 1fr); gap: 8px 12px; margin: 0; }
.list dt { color: var(--acc); }
.list dd { margin: 0; }
.credits { display: grid; gap: 8px; margin: 0; padding: 0; list-style: none; }
/* the leaderboard: rank, name, score and grade, and the time and hits too where the screen is wide */
.lb { width: 100%; border-collapse: collapse; table-layout: fixed; }
.lb td { height: 24px; padding: 0 0 0 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lb td:first-child { width: 28px; padding: 0; text-align: right; color: var(--lcd-dim); }
.lb .t { width: 72px; text-align: right; }
.lb .h { width: 40px; text-align: right; }
.lb td:last-child { width: 32px; }
.lb tr.me td { color: var(--acc); }
.lb tr.gap td { height: 16px; text-align: center; color: var(--lcd-dim); }
.gd { display: inline-grid; place-items: center; width: 20px; height: 20px; border: 1px solid var(--acc); border-radius: 4px; color: var(--acc); }
@container scr (max-width: 419px) { .lb .w { display: none; } }
/* the player's name, and the run's place on the board under the win */
.name-form { display: grid; gap: 8px; }
.field { display: grid; gap: 8px; }
.field input { width: 100%; min-height: 36px; padding: 0 12px; border: 1px solid var(--lcd-line); border-radius: 8px; background: #000; color: var(--lcd-hi); caret-color: var(--acc); user-select: text; -webkit-user-select: text; }
.field input:focus { outline: none; border-color: var(--acc); }
.field input:disabled { color: var(--lcd-dim); }
@media (pointer: coarse) { .field input { min-height: 44px; } }
.name-row { display: flex; align-items: flex-end; gap: 8px; }
.name-row .field { flex: 1; }
.err { color: var(--acc); }
.lb-run { display: grid; gap: 8px; justify-items: center; }
.lb-run:empty { display: none; }
.lb-run .name-form { justify-self: stretch; text-align: left; }
/* sharing: the card's picture, its room kept while it draws */
.card-frame { display: grid; place-items: center; aspect-ratio: 1200 / 630; border: 1px solid var(--lcd-line); border-radius: 8px; overflow: hidden; }
.card-frame img { display: block; width: 100%; height: auto; }
.share-msg:empty { display: none; }
.copy { display: grid; gap: 8px; }
.copy textarea { width: 100%; resize: none; padding: 8px 12px; border: 1px solid var(--lcd-line); border-radius: 8px; background: #000; color: var(--lcd); font: 12px/16px var(--ui); user-select: text; -webkit-user-select: text; }

/* a window too small to play: the message on the dark glass */
.small { position: absolute; inset: 0; z-index: 10; display: grid; place-items: center; padding: 16px; }
.small p { max-width: 320px; margin: 0; padding: 16px; border-radius: 14px; background: #000; text-align: center; text-wrap: pretty; box-shadow: 0 0 0 1px #2c2926; }`;
  const MARKUP = `<div class="stage" id="stage" tabindex="-1">
  <div class="hud" id="hud"><span class="hp" id="hp" role="img"></span><span class="bname" id="bname"></span><span class="bbar" id="bbar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><b></b><i></i></span><span class="clock" id="clock">0:00</span></div>
  <div class="arena" id="arena"><canvas id="cv" role="img"></canvas><div class="chips" id="chips" aria-live="polite"></div><div class="tips" aria-live="polite"><div class="tip up" id="tipCore"></div><div class="tip down" id="tipCur"></div></div><div class="les" id="les" aria-live="polite" hidden><div class="les-h"><b id="lesName"></b><span id="lesStep"></span></div><p id="lesHow"></p><button class="pill" id="lesSkip" type="button"></button></div></div>
  <div class="front" id="front" hidden></div>
  <div class="layer" id="layer" hidden></div>
</div>
<div class="small" id="small" hidden></div>`;

  function create(opts = {}) {
    loadPixelFont();

    /* ------------------------------------------------------------ constants + helpers */
    const AW = 360, AH = 480;               // the arena in units (3:4)
    const HUD_H = 28;                       // the HUD's row over the arena, in CSS px
    const MIN_SCALE = 0.8;                  // under this the bullets and the hotspot get too small to play fair
    const STEP = 1 / 120, TAU = Math.PI * 2;
    const MAX_SPEED = 520;                  // mouse and finger: the cursor chases the pointer no faster than this
    const KEY_SPEED = 250, KEY_SLOW = 110;
    const TOUCH_GAIN = 1.2;                 // a finger moves the cursor a little further than itself
    const HIT_R = 2.4, LASER_R = 1.4;
    // short mercy after a hit, so a cursor that stands still keeps losing blocks
    const HP_MAX = 6, INV_TIME = 1.2, REFILL_TIME = 12, CANCEL_R = 48;
    const SHOT_EVERY = 0.1, SHOT_SPEED = 820;
    const CORE_R = 18, NODE_R = 10;         // how close a shot must pass to a core (Starfield's, or Blank's dot), or to a Mystify corner
    // where the hotspot may go, so the arrow and its rider stay on the screen
    const X_MIN = 3, X_MAX = AW - 16, Y_MIN = 16, Y_MAX = AH - 26;
    // a boss attacks in a fight, and in the front door's demo, once its opening pause is over
    const isLive = () => (G.mode === 'fight' || G.mode === 'demo') && B.pause <= 0;
    // in practice the top of the arena is Setup's band, so the cursor stays under it
    const yTop = () => (G.practice ? G.practice.top + 14 : Y_MIN);
    const MOVE = { ArrowLeft: [-1, 0], KeyA: [-1, 0], ArrowRight: [1, 0], KeyD: [1, 0], ArrowUp: [0, -1], KeyW: [0, -1], ArrowDown: [0, 1], KeyS: [0, 1] };
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const coarse = matchMedia('(pointer: coarse)');
    // the portfolio's small screens (style.css SMALL SCREENS), where its window is always maximised
    const smallScreen = matchMedia('(max-width: 720px), (max-height: 500px) and (pointer: coarse)');
    // ?debug in the address: the Backquote key shows the frame counter, and window.__ssxp drives the game from the
    // console
    const DEBUG = /[?&]debug\b/.test(location.search);

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, k) => a + (b - a) * k;
    const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));
    const rand = (a, b) => a + Math.random() * (b - a);
    const esc = (v) => String(v).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const fmt = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    const fmt1 = (t) => `${Math.floor(t / 60)}:${(Math.floor((t % 60) * 10) / 10).toFixed(1).padStart(4, '0')}`;
    const store = {
      get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
      set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
    };

    /* ------------------------------------------------------------ strings */
    const STR = {
      en: {
        goal: 'Shoot whatever wears a green ring until the ring runs out, and keep the tip of the arrow away from bullets, lines, pipes and letters.',
        tips: { starfield: 'Shoot this core until its green ring runs out. The cursor fires on its own.', mystify: 'Shoot the corners with green rings. The lines hurt too, so stay off them.', pipes: 'Shoot the pipe heads with green rings. When a ring runs out, that pipe stops growing. Don’t touch the pipes.', marquee: 'Shoot the letters with green rings until they break. Get past each line through a gap. Every letter hurts.', blank: 'The screen went dark, but the ring is still there. Shoot it until it runs out. The No signal box hurts and stops your shots.' },
        tipCursor: 'Only this tip can be hit. Dodge the bullets.', tipCursorTouch: 'Only this tip can be hit. Drag anywhere to dodge.',
        premise: 'The computer was left alone too long, and the screensavers refuse to wake up. You are the cursor, and the stickman is along for the ride.',
        // how to play: what each move is, on a touch screen and at a desk
        keysTouch: [['Drag', 'Drag a finger anywhere. The cursor moves with it and never hides under your thumb.'], ['Fire', 'The cursor fires on its own. Keep it under whatever wears a green ring.'], ['Pause', 'The orange key pauses the fight and plays it again.'], ['Sound', 'The grey key turns the sound on or off.']],
        keysDesk: [['Mouse', 'Move the mouse. The cursor chases the pointer.'], ['← ↑ → ↓', 'Or the arrow keys and WASD. Hold Shift to move slowly.'], ['P', 'Pause, as the orange key does. Esc too.'], ['M', 'Sound on or off, as the grey key does.']],
        howRun: 'A run is all five screensavers in a row, about four minutes. Only a whole run goes on the leaderboard.',
        practiceInfo: 'The practice is three short lessons, under a minute. Nothing costs health there.',
        phase: (n) => `Phase ${n}`,
        phase2: { starfield: 'Phase 2: warp', mystify: 'Phase 2: two polygons', pipes: 'Phase 2: screen full', marquee: 'Phase 2: both ways', blank: 'Phase 2: burn-in' },
        noSignal: 'No signal', corner: 'Corner!',
        practice: 'Practice', lesStep: (i, n) => `${i} of ${n}`, skip: 'Skip',
        lesGood: 'Nice!', lesDodgeHit: 'Hit! Only the tip of the arrow counts.',
        // a lesson's how-to is one line, or [touch screen, desk] when the two are done differently
        les: {
          move: ['Move', ['Drag a finger anywhere. The cursor moves with it and never hides under your thumb.', 'Move the mouse, or use the arrow keys and WASD.']],
          aim: ['Aim', 'The cursor fires on its own. Keep it under the green ring until the ring runs out.'],
          dodge: ['Dodge', 'Only the tip of the arrow can be hit. Keep it clear of the bullets for 8 seconds.'],
        },
        drillDone: 'Practice complete!', drillText: 'You’ve tried every move. Start the run, or practice again.', drillFight: 'Start the run', drillAgain: 'Practice again',
        // the menu before a run, and its pages
        menuStart: 'Start game', menuHow: 'How to play', menuBoard: 'Leaderboard', menuAbout: 'About this game',
        back: 'Back', tryPractice: 'Try the practice', pressPre: 'press ', pressPost: ' to start',
        yourBest: 'Your best', noBest: 'No finished run yet', rankOf: (r, n) => `#${r} of ${n}`,
        aboutVer: 'version 2026',
        aboutMusic: 'Music: eight songs made for this game, played on Boss Rush XP’s chiptune synth.',
        aboutIcons: (a, b) => `Icons: ${a} by HackerNoon, ${b}.`,
        aboutFont: 'Letters: SSXP Pixel, drawn for this game.',
        board: 'Leaderboard', lbLoading: 'Checking the leaderboard…', lbOff: 'The leaderboard can’t be reached right now.',
        lbEmptyHead: 'No finished runs yet', lbEmptyText: 'Close all five screensavers to post the first run.',
        lbYou: 'you', lbCount: (n) => `${n} ${n === 1 ? 'player' : 'players'}`,
        lbHow: 'Ranked by score: the time plus 10 seconds for every hit taken.', lbCols: ['#', 'Name', 'Time', 'Hits', 'Score', 'Grade'],
        // the player's name, the win screen's place on the board, and the result card (worded as in Boss Rush XP)
        nameTitle: 'New player', nameText: 'Choose the public name shown with your finished runs.', nameRule: 'Up to 12 letters, numbers, spaces, - or _.',
        nameLabel: 'Your name', namePlay: 'Play', nameChange: 'Change name', nameChangeText: 'Future saved runs will use this public name.',
        nameNow: 'Your name:', cancel: 'Cancel', save: 'Save', saving: 'Saving…',
        lbAsk: (r, n) => `This run ranks #${r} of ${n} on the leaderboard.`, lbSaved: (name, r, n) => `Saved as ${name}: #${r} of ${n}.`,
        lbKept: (r, n, t) => `Your best run (${t}) stays #${r} of ${n}.`,
        lbErr: { format: 'Use 1 to 12 letters, numbers, spaces, - or _.', name: 'That name can’t be used. Try another one.', slow: 'Too many saves from here. Try again in a few minutes.', net: 'Couldn’t save. Try again.' },
        cta: 'Enjoyed exploring? Tell me about your website or app.', contact: 'Contact me',
        gift: 'Your reward: pointer trails on the desktop.',
        share: (r, t, n, who, url, pos) => `I beat Screen Saver XP${who ? ` on ${who}’s portfolio` : ''}: grade ${r}, ${t}, ${n} ${n === 1 ? 'hit' : 'hits'} taken${pos ? `, #${pos.rank} of ${pos.total} ${pos.total === 1 ? 'player' : 'players'}` : ''}. Can you do better? ${url}`,
        shareOpen: 'Share result', shareTitle: 'Share your result', shareHint: 'Copy the image and text to share your result. The text includes a link to the game.',
        cardMaking: 'Drawing your result card…', cardFail: 'The result image couldn’t be created. You can still copy the result text.', cardNoRank: 'Save your run first to include your leaderboard rank.',
        copyImg: 'Copy image', imgCopied: 'Image copied!', imgFail: 'This browser couldn’t copy the image. Download it instead.', saveImg: 'Download image', imgSaved: (f) => `Downloading ${f}…`, copyText: 'Copy text', shareTo: 'Share to…',
        cardPos: (r, n) => `#${r} of ${n}`, cardAsk: 'Can you beat it?', cardOwner: (o) => `${o}’s portfolio`, startBtn: 'start',
        cardAlt: (g, t, n, pos) => `Screen Saver XP result card: grade ${g}, ${t}, ${n} ${n === 1 ? 'hit' : 'hits'} taken${pos ? `, #${pos.rank} of ${pos.total} on the leaderboard` : ''}.`,
        // Marquee.scr's messages: system jokes, never lines about the owner (GAME2_BRIEF.md); the first always opens
        marquee: ['PLEASE WAIT...', 'ARE YOU SURE?', 'NOT RESPONDING...', 'PRESS ANY KEY!', 'ERROR: SUCCESS.', 'LOW DISK SPACE!', 'IT IS NOW SAFE TO TURN OFF YOUR COMPUTER.', 'YOUR TEXT HERE.', '404: CURSOR NOT FOUND', 'MOVE THE MOUSE TO CONTINUE...'],
        closed: (n) => `${n} closed`,
        paused: 'Paused', resume: 'Resume', restart: 'Restart',
        deadHead: 'Out of health', dead: 'The cursor is not responding.', deadText: (n) => `${n} starts over. The time and the hits still count.`, retry: 'Try again', menu: 'Menu',
        runDone: (n) => `${n} ${n === 1 ? 'screensaver' : 'screensavers'} closed`,
        flavor: 'The screen is back on. For now.',
        hitsN: (n) => `${n} ${n === 1 ? 'hit' : 'hits'}`, scoreIs: (t) => `score ${t}`, lossesN: (n) => `${n} ${n === 1 ? 'loss' : 'losses'}`,
        rank: 'Grade', target: (t) => `Target for a clean run against these bosses: about ${t} without a hit.`,
        copied: 'Copied', copyHand: 'Copy this text:', again: 'Play again',
        tooSmall: 'This window is too small to play. Maximize it, or make the browser window bigger.',
        tooShort: 'This screen is too small to play. Try a computer, or a phone with a taller screen.',
        rotate: 'Turn your phone upright to play.',
        clock: 'Time', hp: 'Health',
        arena: (n) => `${n}, with the cursor at the bottom`,
      },
      id: {
        goal: 'Tembak apa pun yang bercincin hijau sampai cincinnya habis, dan jaga ujung panah dari peluru, garis, pipa, dan huruf.',
        tips: { starfield: 'Tembak inti ini sampai cincin hijaunya habis. Kursor menembak sendiri.', mystify: 'Tembak sudut-sudut yang bercincin hijau. Garisnya juga melukai, jadi jangan disentuh.', pipes: 'Tembak kepala pipa yang bercincin hijau. Kalau cincinnya habis, pipa itu berhenti tumbuh. Jangan sentuh pipanya.', marquee: 'Tembak huruf yang bercincin hijau sampai pecah. Lolos dari tiap baris lewat celahnya. Semua huruf melukai.', blank: 'Layarnya gelap, tapi cincinnya masih ada. Tembak sampai habis. Kotak Tidak ada sinyal melukai dan menahan tembakan.' },
        tipCursor: 'Hanya ujung ini yang bisa kena. Hindari peluru.', tipCursorTouch: 'Hanya ujung ini yang bisa kena. Geser di mana saja untuk menghindar.',
        premise: 'Komputer ditinggal terlalu lama, dan screensaver menolak dibangunkan. Kamu adalah kursornya, dan stickman ikut menumpang.',
        keysTouch: [['Geser', 'Geser jari di mana saja. Kursor ikut bergerak dan tidak tertutup jempol.'], ['Tembak', 'Kursor menembak sendiri. Jaga kursor di bawah apa pun yang bercincin hijau.'], ['Jeda', 'Tombol oranye menjeda pertarungan dan melanjutkannya lagi.'], ['Suara', 'Tombol abu-abu menyalakan atau mematikan suara.']],
        keysDesk: [['Mouse', 'Gerakkan mouse. Kursor mengejar pointer.'], ['← ↑ → ↓', 'Atau tombol panah dan WASD. Tahan Shift untuk bergerak pelan.'], ['P', 'Jeda, sama seperti tombol oranye. Esc juga bisa.'], ['M', 'Suara nyala atau mati, sama seperti tombol abu-abu.']],
        howRun: 'Satu run berisi kelima screensaver berturut-turut, sekitar empat menit. Hanya run penuh yang masuk papan peringkat.',
        practiceInfo: 'Latihannya tiga langkah singkat, kurang dari semenit. Nyawa tidak berkurang di sana.',
        phase: (n) => `Fase ${n}`,
        phase2: { starfield: 'Fase 2: warp', mystify: 'Fase 2: dua segi empat', pipes: 'Fase 2: layar penuh', marquee: 'Fase 2: dua arah', blank: 'Fase 2: burn-in' },
        noSignal: 'Tidak ada sinyal', corner: 'Pojok!',
        practice: 'Latihan', lesStep: (i, n) => `${i} dari ${n}`, skip: 'Lewati',
        lesGood: 'Bagus!', lesDodgeHit: 'Kena! Yang dihitung hanya ujung panah.',
        les: {
          move: ['Gerak', ['Geser jari di mana saja. Kursor ikut bergerak dan tidak tertutup jempol.', 'Gerakkan mouse, atau pakai tombol panah dan WASD.']],
          aim: ['Bidik', 'Kursor menembak sendiri. Jaga kursor di bawah cincin hijau sampai cincinnya habis.'],
          dodge: ['Menghindar', 'Hanya ujung panah yang bisa kena. Jaga ujungnya dari peluru selama 8 detik.'],
        },
        drillDone: 'Latihan selesai!', drillText: 'Kamu sudah mencoba semua gerakan. Mulai run, atau latihan lagi.', drillFight: 'Mulai run', drillAgain: 'Latihan lagi',
        menuStart: 'Mulai main', menuHow: 'Cara bermain', menuBoard: 'Papan peringkat', menuAbout: 'Tentang game ini',
        back: 'Kembali', tryPractice: 'Coba latihan', pressPre: 'tekan ', pressPost: ' untuk mulai',
        yourBest: 'Rekor terbaikmu', noBest: 'Belum ada run yang selesai', rankOf: (r, n) => `#${r} dari ${n}`,
        aboutVer: 'versi 2026',
        aboutMusic: 'Musik: delapan lagu yang dibuat untuk game ini, dimainkan dengan synth chiptune Boss Rush XP.',
        aboutIcons: (a, b) => `Ikon: ${a} oleh HackerNoon, ${b}.`,
        aboutFont: 'Huruf: SSXP Pixel, digambar untuk game ini.',
        board: 'Papan peringkat', lbLoading: 'Mengecek papan peringkat…', lbOff: 'Papan peringkat sedang tidak bisa dihubungi.',
        lbEmptyHead: 'Belum ada run yang selesai', lbEmptyText: 'Tutup kelima screensaver untuk mencatat run pertama.',
        lbYou: 'kamu', lbCount: (n) => `${n} pemain`,
        lbHow: 'Peringkat dihitung dari skor: waktu ditambah 10 detik untuk setiap hit yang diterima.', lbCols: ['#', 'Nama', 'Waktu', 'Hit', 'Skor', 'Grade'],
        nameTitle: 'Pemain baru', nameText: 'Pilih nama publik yang tampil bersama rekormu.', nameRule: 'Maksimal 12 huruf, angka, spasi, - atau _.',
        nameLabel: 'Namamu', namePlay: 'Main', nameChange: 'Ganti nama', nameChangeText: 'Run yang tersimpan setelah ini akan memakai nama publik ini.',
        nameNow: 'Namamu:', cancel: 'Batal', save: 'Simpan', saving: 'Menyimpan…',
        lbAsk: (r, n) => `Run ini masuk peringkat #${r} dari ${n} pemain.`, lbSaved: (name, r, n) => `Tersimpan sebagai ${name}: peringkat #${r} dari ${n}.`,
        lbKept: (r, n, t) => `Rekor terbaikmu (${t}) tetap peringkat #${r} dari ${n}.`,
        lbErr: { format: 'Pakai 1 sampai 12 huruf, angka, spasi, - atau _.', name: 'Nama itu tidak bisa dipakai. Coba nama lain.', slow: 'Terlalu sering menyimpan dari sini. Coba lagi beberapa menit lagi.', net: 'Gagal menyimpan. Coba lagi.' },
        cta: 'Suka menjelajahi portofolio ini? Ceritakan rencana website atau aplikasimu.', contact: 'Hubungi saya',
        gift: 'Hadiahmu: jejak pointer di desktop.',
        share: (r, t, n, who, url, pos) => `Aku menamatkan Screen Saver XP${who ? ` di portofolio ${who}` : ''}: grade ${r}, waktu ${t}, kena ${n} hit${pos ? `, peringkat #${pos.rank} dari ${pos.total} pemain` : ''}. Bisa lebih baik? ${url}`,
        shareOpen: 'Bagikan hasil', shareTitle: 'Bagikan hasil', shareHint: 'Salin gambar dan teks untuk membagikan hasilmu. Teksnya menyertakan tautan ke game.',
        cardMaking: 'Menggambar kartu hasil…', cardFail: 'Gambarnya gagal dibuat. Teksnya tetap bisa disalin.', cardNoRank: 'Simpan rekormu dulu agar peringkat ikut tampil di kartu.',
        copyImg: 'Salin gambar', imgCopied: 'Gambar tersalin!', imgFail: 'Browser ini tidak bisa menyalin gambar. Unduh saja gambarnya.', saveImg: 'Unduh gambar', imgSaved: (f) => `Mengunduh ${f}…`, copyText: 'Salin teks', shareTo: 'Bagikan ke…',
        cardPos: (r, n) => `#${r} dari ${n}`, cardAsk: 'Bisa mengalahkan rekor ini?', cardOwner: (o) => `Portofolio ${o}`, startBtn: 'mulai',
        cardAlt: (g, t, n, pos) => `Kartu hasil Screen Saver XP: grade ${g}, waktu ${t}, kena ${n} hit${pos ? `, peringkat #${pos.rank} dari ${pos.total}` : ''}.`,
        marquee: ['HARAP TUNGGU...', 'YAKIN?', 'TIDAK MERESPONS...', 'TEKAN TOMBOL APA SAJA!', 'ERROR: BERHASIL.', 'RUANG DISK HAMPIR PENUH!', 'SEKARANG AMAN UNTUK MEMATIKAN KOMPUTER.', 'KETIK TEKS DI SINI.', '404: KURSOR TIDAK DITEMUKAN', 'GERAKKAN MOUSE UNTUK MELANJUTKAN...'],
        closed: (n) => `${n} ditutup`,
        paused: 'Dijeda', resume: 'Lanjut', restart: 'Mulai ulang',
        deadHead: 'Nyawa habis', dead: 'Kursor tidak merespons.', deadText: (n) => `${n} diulang dari awal. Waktu dan hit tetap dihitung.`, retry: 'Coba lagi', menu: 'Menu',
        runDone: (n) => `${n} screensaver ditutup`,
        flavor: 'Layar menyala lagi. Untuk sementara.',
        hitsN: (n) => `kena ${n} hit`, scoreIs: (t) => `skor ${t}`, lossesN: (n) => `kalah ${n}x`,
        rank: 'Grade', target: (t) => `Target run bersih untuk bos yang dilawan: sekitar ${t} tanpa kena hit.`,
        copied: 'Tersalin', copyHand: 'Salin teks ini:', again: 'Main lagi',
        tooSmall: 'Jendela ini terlalu kecil untuk bermain. Besarkan jendelanya, atau perbesar jendela browser.',
        tooShort: 'Layar ini terlalu kecil untuk bermain. Coba di komputer, atau di HP dengan layar yang lebih tinggi.',
        rotate: 'Putar HP ke posisi tegak untuk bermain.',
        clock: 'Waktu', hp: 'Nyawa',
        arena: (n) => `${n}, dengan kursor di bagian bawah`,
      },
    };

    /* ------------------------------------------------------------ icons: Pixel Icon Library by HackerNoon (CC BY 4.0),
       drawn as the portfolio's icons.js draws them: the solid shape as a colour fill under the regular outline */
    const ICONS = {
      star: ['<path d="m16,8v-2h-1v-2h-1v-2h-1v-1h-2v1h-1v2h-1v2h-1v2H1v2h1v1h1v1h1v1h1v1h1v5h-1v4h2v-1h2v-1h2v-1h2v1h2v1h2v1h2v-4h-1v-5h1v-1h1v-1h1v-1h1v-1h1v-2h-7Zm4,3h-1v1h-1v1h-1v1h-1v5h1v1h-2v-1h-2v-1h-2v1h-2v1h-2v-1h1v-5h-1v-1h-1v-1h-1v-1h-1v-1h4v-1h1v-1h1v-2h1v-2h2v2h1v2h1v1h1v1h4v1Z"/>', '<polygon points="23 8 23 10 22 10 22 11 21 11 21 12 20 12 20 13 19 13 19 14 18 14 18 19 19 19 19 23 17 23 17 22 15 22 15 21 13 21 13 20 11 20 11 21 9 21 9 22 7 22 7 23 5 23 5 19 6 19 6 14 5 14 5 13 4 13 4 12 3 12 3 11 2 11 2 10 1 10 1 8 8 8 8 6 9 6 9 4 10 4 10 2 11 2 11 1 13 1 13 2 14 2 14 4 15 4 15 6 16 6 16 8 23 8"/>'],
      moon: ['<path d="m21,17v1h-2v1h-4v-1h-2v-1h-2v-1h-1v-2h-1v-2h-1v-4h1v-2h1v-2h1v-1h2v-1h2v-1h-5v1h-2v1h-2v1h-1v1h-1v2h-1v2h-1v6h1v2h1v2h1v1h1v1h2v1h2v1h6v-1h2v-1h2v-1h1v-1h1v-2h-1Zm-13,3v-1h-2v-2h-1v-2h-1v-6h1v-2h1v-2h2v1h-1v2h-1v4h1v2h1v2h1v1h1v1h1v1h2v1h2v1h-5v-1h-2Z"/>', '<polygon points="22 17 22 19 21 19 21 20 20 20 20 21 18 21 18 22 16 22 16 23 10 23 10 22 8 22 8 21 6 21 6 20 5 20 5 19 4 19 4 17 3 17 3 15 2 15 2 9 3 9 3 7 4 7 4 5 5 5 5 4 6 4 6 3 8 3 8 2 10 2 10 1 15 1 15 2 13 2 13 3 11 3 11 4 10 4 10 6 9 6 9 8 8 8 8 12 9 12 9 14 10 14 10 16 11 16 11 17 13 17 13 18 15 18 15 19 19 19 19 18 21 18 21 17 22 17"/>'],
      'sound-on': ['<polygon points="17 15 17 14 16 14 16 13 17 13 17 11 16 11 16 10 17 10 17 9 18 9 18 10 19 10 19 14 18 14 18 15 17 15"/><polygon points="23 10 23 14 22 14 22 16 21 16 21 17 20 17 20 18 19 18 19 17 18 17 18 16 19 16 19 15 20 15 20 14 21 14 21 10 20 10 20 9 19 9 19 8 18 8 18 7 19 7 19 6 20 6 20 7 21 7 21 8 22 8 22 10 23 10"/><path d="m11,2v1h-1v1h-1v1h-1v1h-1v1h-1v1H1v8h5v1h1v1h1v1h1v1h1v1h1v1h3V2h-3Zm1,17h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1H3v-4h4v-1h1v-1h1v-1h1v-1h1v-1h1v14Z"/>', '<polygon points="14 2 14 22 11 22 11 21 10 21 10 20 9 20 9 19 8 19 8 18 7 18 7 17 6 17 6 16 1 16 1 8 6 8 6 7 7 7 7 6 8 6 8 5 9 5 9 4 10 4 10 3 11 3 11 2 14 2"/><polygon points="17 15 17 14 16 14 16 13 17 13 17 11 16 11 16 10 17 10 17 9 18 9 18 10 19 10 19 14 18 14 18 15 17 15"/><polygon points="23 10 23 14 22 14 22 16 21 16 21 17 20 17 20 18 19 18 19 17 18 17 18 16 19 16 19 15 20 15 20 14 21 14 21 10 20 10 20 9 19 9 19 8 18 8 18 7 19 7 19 6 20 6 20 7 21 7 21 8 22 8 22 10 23 10"/>'],
    };
    const ICON_FILL = { star: '#f7c948', moon: '#6aa8ff', 'sound-on': '#c9c6bd' };
    // the same icon on a canvas (the share card): its shapes read back out of the markup, drawn size px wide at x, y, in
    // its own two colours or all in one ink
    function icoDraw(c, name, x, y, size, ink) {
      const shapes = (markup) => {
        const p = new Path2D();
        for (const [, tag, attrs] of markup.matchAll(/<(\w+)([^>]*)\/>/g)) {
          const a = Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map((m) => [m[1], m[2]]));
          if (tag === 'path') p.addPath(new Path2D(a.d));
          else if (tag === 'rect') p.rect(+a.x, +a.y, +a.width, +a.height);
          else if (tag === 'polygon') { const n = a.points.trim().split(/[\s,]+/).map(Number); p.moveTo(n[0], n[1]); for (let i = 2; i < n.length; i += 2) p.lineTo(n[i], n[i + 1]); p.closePath(); }
        }
        return p;
      };
      const [line, body] = ICONS[name];
      c.save(); c.translate(x, y); c.scale(size / 24, size / 24);
      c.fillStyle = ink || ICON_FILL[name]; c.fill(shapes(body));
      c.fillStyle = ink || '#000'; c.fill(shapes(line));
      c.restore();
    }

    /* ------------------------------------------------------------ music: a new loop for each screen, on Boss Rush XP's synth
       Tracker notation, as in game.js: a bar is 16 sixteenth steps, one token each. A note (A4, C#5, Bb2) starts on its
       step, '-' holds the note before it for one more step, '.' is silence. A drum step combines k (kick), s (snare),
       h (closed hat), o (open hat) and t (a clock tick). In phase 2 the loop runs 10% faster, and the chords come in as
       an arpeggio (every `arp` steps) with, where `hats` is set, a hat on every empty step. Each tune takes its mood
       from its screensaver (GAME2_BRIEF.md). */
    const SONGS = {
      // the menu: F major, slow and soft, a PC left on and idle
      menu: {
        bpm: 84, kit: 0.5, leadTone: ['triangle', 0.08], bassTone: ['triangle', 0.14],
        chords: ['F4 A4 C5 E5', 'D4 F4 A4 C5', 'Bb3 D4 F4 A4', 'C4 E4 G4', 'A3 C4 E4 G4', 'D4 F4 A4 C5', 'G3 Bb3 D4 F4', 'C4 E4 G4 Bb4'],
        melody: [
          'A4 - - - C5 - - - E5 - - - D5 - C5 -', 'D5 - - - - - - . A4 - - - F4 - - .',
          'F4 - - - A4 - - - D5 - - - C5 - A4 -', 'G4 - - - - - - - . . . . . . . .',
          'E5 - - - C5 - - - A4 - - - G4 - A4 -', 'F5 - - - E5 - - - D5 - - - A4 - - .',
          'Bb4 - - - D5 - - - F5 - - - E5 - D5 -', 'E5 - - - - - - - G4 - - - Bb4 - - .',
        ],
        bassline: [
          'F2 - - - - - - . C3 - - - - - - .', 'D2 - - - - - - . A2 - - - - - - .',
          'Bb2 - - - - - - . F2 - - - - - - .', 'C3 - - - - - - . G2 - - - C3 - - .',
          'A2 - - - - - - . E2 - - - - - - .', 'D3 - - - - - - . A2 - - - - - - .',
          'G2 - - - - - - . D3 - - - - - - .', 'C3 - - - - - - . G2 - - - E2 - - .',
        ],
        drums: ['k . . . h . . . . . . . h . . .'],
      },
      // practice: G major, light and easy, Setup's pace
      practice: {
        bpm: 100, kit: 0.6, leadTone: ['triangle', 0.09], bassTone: ['triangle', 0.15],
        chords: ['G4 B4 D5', 'E4 G4 B4', 'C4 E4 G4', 'D4 F#4 A4'],
        melody: ['B4 - D5 - G5 - - . F#5 - E5 - D5 - - .', 'E5 - G5 - B5 - - . A5 - G5 - E5 - - .', 'C5 - E5 - G5 - A5 - G5 - E5 - C5 - - .', 'D5 - F#5 - A5 - - - G5 - F#5 - D5 - - .'],
        bassline: ['G2 - - . D3 - - . G2 - - . D3 - - .', 'E2 - - . B2 - - . E2 - - . B2 - - .', 'C3 - - . G2 - - . C3 - - . G2 - - .', 'D3 - - . A2 - - . D3 - - . F#2 - - .'],
        drums: ['kh . . . sh . . . kh . h . sh . . .'],
      },
      // Starfield: A minor and fast, arpeggios racing outward like the stars
      starfield: {
        bpm: 144, arp: 1, hats: true, leadTone: ['square', 0.05, 2800], bassTone: ['square', 0.065, 700],
        chords: ['A4 C5 E5', 'F4 A4 C5', 'C5 E5 G5', 'G4 B4 D5', 'A4 C5 E5', 'F4 A4 C5', 'D4 F4 A4', 'E4 G#4 B4'],
        melody: [
          'A4 C5 E5 A5 E5 C5 A4 C5 E5 - - - D5 - C5 -', 'F4 A4 C5 F5 C5 A4 F4 A4 C5 - - - A4 - G4 -',
          'E5 G5 C6 G5 E5 C5 E5 G5 C6 - - - B5 - G5 -', 'D5 - - - B4 - - - G4 - B4 - D5 - G5 -',
          'A5 - - - E5 - - - C5 - E5 - A5 - C6 -', 'A5 - - - F5 - - - C5 - F5 - A5 - G5 -',
          'F5 - E5 - D5 - A4 - D5 - F5 - A5 - F5 -', 'G#5 - - - - - - - E5 - - - B4 - G#4 -',
        ],
        bassline: [
          'A2 . A3 . A2 . A3 . A2 . A3 . A2 . A3 .', 'F2 . F3 . F2 . F3 . F2 . F3 . F2 . F3 .',
          'C3 . C4 . C3 . C4 . C3 . C4 . C3 . C4 .', 'G2 . G3 . G2 . G3 . G2 . G3 . G2 . B2 .',
          'A2 . A3 . A2 . A3 . A2 . A3 . A2 . A3 .', 'F2 . F3 . F2 . F3 . F2 . F3 . F2 . F3 .',
          'D2 . D3 . D2 . D3 . D2 . D3 . D2 . D3 .', 'E2 . E3 . E2 . E3 . E2 . E3 . G#2 . B2 .',
        ],
        drums: ['k . h . s . h k . k h . s . h .'],
      },
      // Mystify: floating and strange, its chords a major third apart; in phase 2 they shimmer on every step
      mystify: {
        bpm: 96, kit: 0.5, arp: 1, leadTone: ['triangle', 0.08], bassTone: ['triangle', 0.14],
        chords: ['C4 E4 G4 B4', 'E4 G#4 B4 D#5', 'Ab3 C4 Eb4 G4', 'C4 E4 G4 B4', 'A3 C4 E4 G4', 'F4 A4 C5 E5', 'Db4 F4 Ab4 C5', 'G3 B3 D4 F#4'],
        melody: [
          'G5 - - - - - E5 - - - B4 - - - C5 -', 'D#5 - - - - - B4 - - - G#4 - - - B4 -',
          'C5 - - - - - Eb5 - - - G5 - - - F5 -', 'E5 - - - - - - - - - - - . . . .',
          'E5 - - - G5 - - - A5 - - - G5 - E5 -', 'A5 - - - - - E5 - - - C5 - - - E5 -',
          'F5 - - - - - Ab5 - - - C6 - - - Ab5 -', 'F#5 - - - - - D5 - - - B4 - - - . .',
        ],
        bassline: [
          'C3 - - - - - - - G2 - - - - - - .', 'E2 - - - - - - - B2 - - - - - - .',
          'Ab2 - - - - - - - Eb3 - - - - - - .', 'C3 - - - - - - - G2 - - - C3 - - .',
          'A2 - - - - - - - E3 - - - - - - .', 'F2 - - - - - - - C3 - - - - - - .',
          'Db3 - - - - - - - Ab2 - - - - - - .', 'G2 - - - - - - - D3 - - - F#2 - - .',
        ],
        drums: ['k . . . . . . . o . . . . . h .'],
      },
      // 3D Pipes: D minor, a machine that repeats itself, ticking like a clock
      pipes: {
        bpm: 128, arp: 1, hats: true, leadTone: ['square', 0.05, 2000], bassTone: ['square', 0.07, 600],
        chords: ['D4 F4 A4', 'D4 F4 A4', 'C4 E4 G4', 'C4 E4 G4', 'Bb3 D4 F4', 'Bb3 D4 F4', 'A3 C#4 E4', 'A3 C#4 E4'],
        melody: [
          'D5 . D5 . A4 . D5 . F5 . E5 . D5 . A4 .', 'D5 . D5 . A4 . D5 . G5 . F5 . E5 . C5 .',
          'C5 . C5 . G4 . C5 . E5 . D5 . C5 . G4 .', 'C5 . C5 . G4 . C5 . F5 . E5 . D5 . G5 .',
          'Bb4 . Bb4 . F4 . Bb4 . D5 . C5 . Bb4 . F4 .', 'Bb4 . Bb4 . F4 . Bb4 . F5 . E5 . D5 . Bb4 .',
          'A4 . C#5 . E5 . A5 . G5 . E5 . C#5 . E5 .', 'A5 - - - E5 - - - C#5 - - - A4 - - -',
        ],
        bassline: [
          'D2 D2 . D2 D3 . D2 D2 . D2 D3 . D2 . D3 .', 'D2 D2 . D2 D3 . D2 D2 . D2 D3 . D2 . D3 .',
          'C2 C2 . C2 C3 . C2 C2 . C2 C3 . C2 . C3 .', 'C2 C2 . C2 C3 . C2 C2 . C2 C3 . C2 . C3 .',
          'Bb1 Bb1 . Bb1 Bb2 . Bb1 Bb1 . Bb1 Bb2 . Bb1 . Bb2 .', 'Bb1 Bb1 . Bb1 Bb2 . Bb1 Bb1 . Bb1 Bb2 . Bb1 . Bb2 .',
          'A1 A1 . A1 A2 . A1 A1 . A1 A2 . A1 . A2 .', 'A1 A1 . A1 A2 . A1 A1 . A1 A2 . C#2 . E2 .',
        ],
        drums: ['kt . t . st . t . kt . t . st . t t'],
      },
      // Marquee: B-flat major, a news theme that marches while a ticker clicks along
      marquee: {
        bpm: 116, kit: 0.7, arp: 2, leadTone: ['square', 0.055, 3000], bassTone: ['triangle', 0.17],
        chords: ['Bb4 D5 F5', 'Eb4 G4 Bb4', 'F4 A4 C5', 'Bb4 D5 F5', 'G4 Bb4 D5', 'Eb4 G4 Bb4', 'C4 Eb4 G4', 'F4 A4 C5'],
        melody: [
          'F5 . F5 . F5 - . D5 Bb4 - - . D5 . F5 .', 'G5 . G5 . G5 - . Eb5 Bb4 - - . Eb5 . G5 .',
          'A5 - - . F5 . C5 . F5 - - . A5 . C6 .', 'Bb5 - - - F5 - - - D5 - - - . . . .',
          'D5 . D5 . G5 - . D5 Bb4 - - . D5 . G5 .', 'Eb5 . Eb5 . G5 - . Eb5 Bb4 - - . Eb5 . Bb5 .',
          'C5 . Eb5 . G5 . C6 . Bb5 . G5 . Eb5 . C5 .', 'F5 - - - A5 - - - C6 - - - A5 . F5 .',
        ],
        bassline: [
          'Bb2 . . . F2 . . . Bb2 . . . F2 . . .', 'Eb2 . . . Bb2 . . . Eb2 . . . Bb2 . . .',
          'F2 . . . C3 . . . F2 . . . C3 . . .', 'Bb2 . . . F2 . . . Bb2 . D3 . F3 . . .',
          'G2 . . . D3 . . . G2 . . . D3 . . .', 'Eb2 . . . Bb2 . . . Eb2 . . . Bb2 . . .',
          'C3 . . . G2 . . . C3 . . . G2 . . .', 'F2 . . . C3 . . . F2 . A2 . C3 . . .',
        ],
        drums: ['kt t s t kt t s t kt t s t k s s s'],
      },
      // Blank: E minor and nearly silent; the boss's own beat is the slow pulse under it, and in phase 2 the chords
      // come back one soft note a beat, like something faint showing through
      blank: {
        bpm: 54, arp: 4, arpTone: ['sine', 0.03], leadTone: ['sine', 0.07], bassTone: ['triangle', 0.12],
        chords: ['E3 G3 B3', 'C3 E3 G3', 'A2 C3 E3', 'B2 D#3 F#3'],
        melody: ['B5 - - - - - - - . . . . . . . .', '. . . . G5 - - - - - - - . . . .', 'E5 - - - - - - - . . . . A5 - - -', '- - - - F#5 - - - - - - - . . . .'],
        bassline: ['E2 - - - - - - - - - - - - - - .', 'C3 - - - - - - - - - - - - - - .', 'A2 - - - - - - - - - - - - - - .', 'B2 - - - - - - - - - - - - - - .'],
        drums: ['. . . . . . . . . . . . . . . .'],
      },
      // the screen is back on: two bars, once
      win: {
        bpm: 132, once: true, leadTone: ['square', 0.07, 3400], bassTone: ['triangle', 0.18],
        chords: ['C4 E4 G4', 'C4 E4 G4'],
        melody: ['C5 . E5 . G5 . C6 - - . B5 . C6 - D6 -', 'E6 - - - - - - - - - - - . . . .'],
        bassline: ['C3 . . . G2 . . . C3 . . . G2 . G2 .', 'C2 - - - - - - - - - - - . . . .'],
        drums: ['k . h . s . h . k . h . s . s s', 'ko . . . . . . . . . . . . . . .'],
      },
    };
    const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    function hz(n) {
      const m = /^([A-G])([#b]?)(\d)$/.exec(n);
      if (!m) throw new Error(`Screen Saver XP: bad note "${n}"`);
      return 440 * 2 ** ((SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] ? -1 : 0) + (+m[3] + 1) * 12 - 69) / 12);
    }
    const tokens = (bar) => {
      const t = bar.trim().split(/\s+/);
      if (t.length !== 16) throw new Error(`Screen Saver XP: a bar needs 16 steps, got ${t.length}: ${bar}`);
      return t;
    };
    // one slot per step: { f, len } where a note starts (len counts its held steps), null elsewhere
    function track(bars) {
      const out = [];
      let last = null;
      for (const t of bars.flatMap(tokens)) {
        if (t === '-') { if (last) last.len += 1; out.push(null); } else if (t === '.') { last = null; out.push(null); } else { last = { f: hz(t), len: 1 }; out.push(last); }
      }
      return out;
    }
    const TUNES = {};
    for (const [name, song] of Object.entries(SONGS)) {
      const lead = track(song.melody), bass = track(song.bassline);
      const drums = song.drums.flatMap(tokens).map((d) => { if (d !== '.' && /[^kshot]/.test(d)) throw new Error(`Screen Saver XP: bad drum "${d}"`); return d === '.' ? '' : d; });
      if (bass.length !== lead.length || song.chords.length * 16 !== lead.length) throw new Error(`Screen Saver XP: ${name} voices differ in length`);
      TUNES[name] = { ...song, lead, bass, drums, steps: lead.length, chords: song.chords.map((c) => c.split(' ').map(hz)) };
    }

    /* ------------------------------------------------------------ sound: synth effects, and the music player from game.js */
    const sfx = (() => {
      const VOL = 0.5, MUSIC = 0.3;   // the music sits under the effects
      let actx = null, master = null, noise = null, muted = store.get('ssxp-mute') === '1', quiet = false;
      // music state: the tune playing, its own fade bus, and a step clock scheduled a little ahead
      let tune = null, bus = null, duckBus = null, timer = 0, stepI = 0, nextT = 0, level = 1, want = null, held = false;
      function ensure() {
        if (actx) { if (actx.state === 'suspended') actx.resume(); return; }
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        try { actx = new AC(); } catch (e) { actx = null; return; }
        master = actx.createGain(); master.gain.value = muted ? 0 : VOL; master.connect(actx.destination);
        duckBus = actx.createGain(); duckBus.connect(master);
        noise = actx.createBuffer(1, actx.sampleRate, actx.sampleRate);
        const d = noise.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
        // a tune asked for before the first touch or key starts now
        if (want) cue(want);
      }
      function tone(type, f0, f1, dur, vol, delay = 0) {
        if (!actx || muted || quiet) return;
        const t = actx.currentTime + delay, o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.setValueAtTime(f0, t);
        if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
      }
      function hiss(dur, vol, type, f0, f1, delay = 0) {
        if (!actx || muted || quiet) return;
        const t = actx.currentTime + delay, src = actx.createBufferSource(), f = actx.createBiquadFilter(), g = actx.createGain();
        src.buffer = noise; f.type = type;
        f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur);
        g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        src.connect(f); f.connect(g); g.connect(master); src.start(t, Math.random() * 0.35); src.stop(t + dur + 0.02);
      }
      // move a gain smoothly from wherever it is now
      function glide(p, v, tc, at = actx.currentTime) {
        if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(at); else { p.cancelScheduledValues(at); p.setValueAtTime(p.value, at); }
        p.setTargetAtTime(v, at, tc);
      }
      function voice(type, f, t, dur, vol, cut) {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.setValueAtTime(f, t);
        g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.006);
        g.gain.setTargetAtTime(vol * 0.55, t + 0.02, dur * 0.35); g.gain.setTargetAtTime(0.0001, t + dur, 0.025);
        if (cut) { const lp = actx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut; o.connect(lp); lp.connect(g); } else o.connect(g);
        g.connect(bus); o.start(t); o.stop(t + dur + 0.2);
      }
      function drum(kind, t, k) {
        if (kind === 'k' || kind === 't') {
          const o = actx.createOscillator(), g = actx.createGain(), kick = kind === 'k', end = kick ? 0.16 : 0.025;
          o.type = kick ? 'sine' : 'square'; o.frequency.setValueAtTime(kick ? 140 : 1250, t);
          if (kick) o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
          g.gain.setValueAtTime((kick ? 0.45 : 0.035) * k, t); g.gain.exponentialRampToValueAtTime(0.001, t + end);
          o.connect(g); g.connect(bus); o.start(t); o.stop(t + end + 0.02);
          return;
        }
        // the snare and the hats are filtered noise; the snare also gets a short body
        const [type, f, dur, vol] = { s: ['bandpass', 1800, 0.12, 0.2], h: ['highpass', 7000, 0.035, 0.08], o: ['highpass', 6000, 0.16, 0.07] }[kind];
        const src = actx.createBufferSource(), fl = actx.createBiquadFilter(), g = actx.createGain();
        src.buffer = noise; fl.type = type; fl.frequency.value = f;
        g.gain.setValueAtTime(vol * k, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
        src.connect(fl); fl.connect(g); g.connect(bus); src.start(t, Math.random() * 0.8); src.stop(t + dur + 0.02);
        if (kind === 's') voice('triangle', 190, t, 0.05, 0.1 * k);
      }
      function playStep(i, t, sd) {
        const u = tune, s = i % 16, kit = u.kit || 1;
        if (u.swing && s % 4 === 2) t += u.swing * sd;
        const n = u.lead[i], b = u.bass[i], d = u.drums[i % u.drums.length];
        if (n) voice(u.leadTone[0], n.f, t, n.len * sd * (n.len > 1 ? 0.92 : 0.6), u.leadTone[1], u.leadTone[2]);
        if (b) voice(u.bassTone[0], b.f, t, b.len * sd * (b.len > 1 ? 0.92 : 0.7), u.bassTone[1], u.bassTone[2]);
        for (const c of d) drum(c, t, kit);
        if (level < 2) return;
        if (u.hats && !d) drum('h', t, 0.5 * kit);
        if (u.arp && s % u.arp === 0) { const ch = u.chords[Math.floor(i / 16)], a = u.arpTone || ['square', 0.028, 1800]; voice(a[0], ch[(s / u.arp) % ch.length], t, sd * u.arp * 0.5, a[1], a[2]); }
      }
      // schedule every step that starts in the next fifth of a second
      function pump() {
        if (!actx || !tune || held) return;
        const sd = 60 / tune.bpm / 4 / (level > 1 ? 1.1 : 1);
        // the page was throttled and the clock ran past: pick up from now instead of playing a burst
        if (nextT < actx.currentTime - 0.1) nextT = actx.currentTime + 0.05;
        while (nextT < actx.currentTime + 0.2) {
          if (!muted) playStep(stepI, nextT, sd);
          nextT += sd; stepI += 1;
          if (stepI >= tune.steps) { if (tune.once) { tune = null; want = null; clearInterval(timer); timer = 0; return; } stepI = 0; }
        }
      }
      // start a tune from its first bar (null stops); the old one fades out on its own bus
      function cue(name) {
        if (bus) { const old = bus; glide(old.gain, 0.0001, 0.08); setTimeout(() => { try { old.disconnect(); } catch (e) { /* context closed */ } }, 700); bus = null; }
        tune = TUNES[name] || null; stepI = 0; level = 1; held = false;
        if (!tune) { clearInterval(timer); timer = 0; return; }
        bus = actx.createGain(); bus.gain.value = MUSIC; bus.connect(duckBus);
        nextT = actx.currentTime + 0.06;
        if (!timer) timer = setInterval(pump, 50);
        pump();
      }
      return {
        ensure,
        close() { clearInterval(timer); timer = 0; tune = null; want = null; if (actx) { try { actx.close(); } catch (e) { /* already closed */ } actx = null; } },
        get muted() { return muted; },
        setMuted(m) { muted = m; store.set('ssxp-mute', m ? '1' : '0'); if (master) master.gain.value = m ? 0 : VOL; },
        get tune() { return want; },
        // the front door's demo fights in silence under the menu's tune
        set quiet(q) { quiet = q; },
        // music: a tune by name from its top (null stops), phase 2's faster level, a pause, and a dip under a big moment
        music(name) { want = name || null; if (actx) cue(want); },
        musicLevel(n) { level = n; },
        musicHold(on) {
          held = on;
          if (!actx || !bus) return;
          glide(bus.gain, on ? 0.0001 : MUSIC, on ? 0.04 : 0.12);
          if (!on) { nextT = actx.currentTime + 0.05; pump(); }
        },
        duck(k, d) {
          if (!actx) return;
          glide(duckBus.gain, k, 0.05);
          duckBus.gain.setTargetAtTime(1, actx.currentTime + d, 0.25);
        },
        hit() { hiss(0.2, 0.2, 'bandpass', 1200, 260); tone('square', 220, 90, 0.18, 0.07); },
        phase() { tone('sine', 260, 1300, 0.55, 0.07); hiss(0.6, 0.06, 'highpass', 800, 5000); },
        ready() { tone('triangle', 1319, 1319, 0.09, 0.05); tone('triangle', 1976, 1976, 0.12, 0.05, 0.09); },
        heal() { tone('triangle', 988, 1319, 0.12, 0.04); },
        burn() { tone('sawtooth', 110, 220, 0.6, 0.035); },
        clank() { tone('square', 200, 90, 0.12, 0.05); hiss(0.1, 0.08, 'bandpass', 2400, 900); },
        sweep() { hiss(1.2, 0.08, 'lowpass', 900, 160); tone('sine', 110, 70, 1, 0.05); },
        flush() { tone('sine', 360, 120, 0.35, 0.05); hiss(0.3, 0.05, 'bandpass', 700, 300); },
        crack() { hiss(0.16, 0.12, 'bandpass', 2600, 700); tone('square', 480, 140, 0.13, 0.05); },
        fall() { tone('sine', 1200, 300, 0.45, 0.04); },
        beat() { tone('sine', 88, 44, 0.32, 0.1); },
        off() { tone('sine', 1400, 90, 0.8, 0.05); hiss(0.6, 0.04, 'highpass', 7000, 900); },
        on() { tone('sine', 90, 1500, 1, 0.04); hiss(0.4, 0.05, 'bandpass', 900, 4000, 0.2); },
        corner() { [659, 880, 1319].forEach((f, i) => tone('triangle', f, f, 0.12, 0.05, i * 0.08)); },
        win() { [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.16, 0.06, i * 0.1)); },
        down() { tone('square', 440, 110, 0.6, 0.06); },
        start() { [392, 587, 784].forEach((f, i) => tone('triangle', f, f, 0.14, 0.05, i * 0.09)); },
      };
    })();

    /* ------------------------------------------------------------ DOM */
    // the screen lives in a shadow root on a host of its own, so its classes and the portfolio's never meet
    const host = document.createElement('div');
    host.className = 'ss-host';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${CSS}</style>${MARKUP}`;
    const $ = (q) => root.querySelector(q);
    const stage = $('#stage'), cv = $('#cv'), ctx = cv.getContext('2d');
    const hudEl = $('#hud'), layer = $('#layer'), chipsEl = $('#chips'), smallEl = $('#small'), front = $('#front');
    const tipCore = $('#tipCore'), tipCur = $('#tipCur');
    const lesEl = $('#les'), lesName = $('#lesName'), lesStep = $('#lesStep'), lesHow = $('#lesHow'), lesSkip = $('#lesSkip');
    const hpEl = $('#hp'), bossName = $('#bname'), bossBar = $('#bbar'), bossFill = bossBar.querySelector('b'), bossTick = bossBar.querySelector('i'), clockVal = $('#clock');
    hpEl.innerHTML = '<i><em></em></i>'.repeat(HP_MAX);
    const hpBlocks = [...hpEl.children];
    // the pixel letters change the HUD's widths once they arrive, so the boss's bar is measured again then
    if (pixelFont) pixelFont.loaded.then(() => { barDots = 0; }, () => {});

    // the portfolio's language, switched with it (setLang)
    let lang = opts.lang === 'id' ? 'id' : 'en';
    let s = STR[lang];

    /* ------------------------------------------------------------ state */
    const G = {
      mode: 'menu', paused: false, t: 0, fightTime: 0, hits: 0, deaths: 0,
      bossIdx: 0, startIdx: 0, bossT0: 0, bossH0: 0, splits: [], introT: 0, introLen: 1.8, taught: {}, endT: 0, demoT: 0,
      warp: 0, shake: 0, dlg: null, front: null, practice: null, debug: false,
    };
    const P = { x: AW / 2 - 6, y: AH - 90, tx: AW / 2 - 6, ty: AH - 90, hp: HP_MAX, inv: 0, clean: 0, shotCd: 0, lean: 0, duck: 0, knock: 0, cheer: 0, press: 0, fall: 0 };
    const B = { def: null, on: false, x: AW / 2, y: 112, max: 480, hp: 480, phase: 1, inv: 0, pause: 0, pi: 0, p: null, t: 0, t2: 0, alpha: 0, flash: 0, dying: false, dieK: 0, m: null, p2At: null };
    const VP = { x: AW / 2, y: AH * 0.42 };   // where the stars come from while no boss is up
    const bullets = [], pool = [], shots = [], sparks = [], tele = [], stars = [];
    const keys = new Set();
    let input = coarse.matches ? 'touch' : 'mouse', dragId = null, tipsOn = false;
    for (let i = 0; i < 110; i++) stars.push({ a: rand(0, TAU), d: rand(0, 520), v: rand(0.6, 1.3) });

    function resetPlayer() { Object.assign(P, { x: AW / 2 - 6, y: AH - 90, tx: AW / 2 - 6, ty: AH - 90, hp: HP_MAX, inv: 1.2, clean: 0, shotCd: 0, lean: 0, duck: 0, knock: 0, cheer: 0, press: 0, fall: 0 }); }
    function resetBoss(def) {
      Object.assign(B, { def, on: true, x: AW / 2, y: 112, max: def.hp, hp: def.hp, phase: 1, inv: 1.8, pause: 2, pi: 0, p: null, t: 0, t2: 0, alpha: 0, flash: 0, dying: false, dieK: 0, m: null, p2At: null });
      def.init();
    }

    /* ------------------------------------------------------------ layout: the largest screen that fits, never under MIN_SCALE */
    // The device's body is the room: the screen is the HUD's row over the arena at 3:4, as large as the body allows, in
    // the middle of it
    let S = 1, K = 1, DPR = Math.min(window.devicePixelRatio || 1, 2), tooSmall = false;
    function layout() {
      const vw = host.clientWidth, vh = host.clientHeight;
      if (!vw || !vh) return;
      const sc = Math.min(vw / AW, (vh - HUD_H) / AH);
      if (sc < MIN_SCALE) {
        if (!tooSmall && (G.mode === 'fight' || G.mode === 'intro')) { G.paused = true; sfx.musicHold(true); }
        tooSmall = true; stage.hidden = true; showSmall();
        return;
      }
      const wasSmall = tooSmall;
      tooSmall = false; stage.hidden = false; smallEl.hidden = true;
      S = Math.floor(sc * 1000) / 1000;
      stage.style.setProperty('--aw', `${AW * S}px`);
      stage.style.setProperty('--ah', `${AH * S}px`);
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(AW * S * DPR), ch = Math.round(AH * S * DPR);
      if (cv.width !== cw || cv.height !== ch || !sprites) { cv.width = cw; cv.height = ch; K = cw / AW; buildSprites(); }
      barDots = 0;
      practiceTop();
      if (wasSmall && G.paused && !G.dlg) pause(true);
    }
    // a phone on its side can't hold the arena, and one upright can have too short a screen; anywhere else the window is
    // too small, and can be made bigger
    function showSmall() {
      const text = coarse.matches && host.clientWidth > host.clientHeight ? s.rotate : smallScreen.matches ? s.tooShort : s.tooSmall;
      smallEl.hidden = false;
      smallEl.innerHTML = `<p role="alert">${esc(text)}</p>`;
    }

    /* ------------------------------------------------------------ sprites: each bullet drawn once, at the screen's own density */
    // Mystify's own colours, cycled as the screensaver cycled them; each arena keeps its period's colours (DESIGN.md)
    const toRgb = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const MCOL = ['#ff5ad9', '#5ae7ff', '#ffe45a', '#6dff7a', '#ff8a4a', '#9d7bff'];
    const MRGB = MCOL.map(toRgb);
    // 3D Pipes' solid colours; the curtain is chrome, drawn in the portfolio's steel
    const PCOL = ['#e0493e', '#3f8fe6', '#45c24b', '#e8c23a', '#39c6c6', '#c552c5'];
    const PRGB = PCOL.map(toRgb);
    // Marquee's text colours, the bright ones from the old 16-colour palette; no green, which is the rings' colour
    const MQCOL = ['#ffff00', '#00ffff', '#ff00ff', '#ff9a00'];
    // the same, washed halfway to white: a letter lights up in it while shots land
    const MQLIT = MQCOL.map((c) => `rgb(${toRgb(c).map((v) => Math.round(v + (255 - v) * 0.55)).join(',')})`);
    let sprites = null;
    function buildSprites() {
      sprites = { star: disc(4.5, 2.9, 9, '#9fd0ff', '159,208,255'), big: disc(6.5, 4.2, 12, '#ffe89a', '255,232,154'), glow: haze(34) };
      MCOL.forEach((c, i) => { sprites[`m${i}`] = disc(4.5, 2.9, 9, c, MRGB[i].join(',')); });
      MQCOL.forEach((c, i) => { sprites[`q${i}`] = disc(4.5, 2.9, 9, c, toRgb(c).join(',')); });
      // Blank's bullets glow a pale phosphor white, the only light on its screen
      sprites.w = disc(4.5, 2.9, 9, '#c8d2ea', '200,210,234'); sprites.wBig = disc(6.5, 4.2, 12, '#eef2fb', '238,242,251');
      PCOL.forEach((c, i) => { sprites[`p${i}`] = disc(4.5, 2.9, 9, c, PRGB[i].join(',')); sprites[`b${i}`] = ballSprite(PRGB[i]); });
      sprites.bSteel = ballSprite(toRgb('#c3c8cf'));
    }
    function canvasFor(R) { const c = document.createElement('canvas'); c.width = c.height = Math.max(2, Math.ceil(R * 2 * K)); return c; }
    // a danger star: a white core in a coloured ring, in a soft glow, so it never reads as the sky behind it
    function disc(ring, core, R, ringColor, rgb) {
      const c = canvasFor(R), g = c.getContext('2d'), m = c.width / 2, k = c.width / (R * 2);
      const gr = g.createRadialGradient(m, m, 0, m, m, m);
      gr.addColorStop(0, `rgba(${rgb},.45)`); gr.addColorStop(0.45, `rgba(${rgb},.18)`); gr.addColorStop(1, `rgba(${rgb},0)`);
      g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
      g.fillStyle = ringColor; g.beginPath(); g.arc(m, m, ring * k, 0, TAU); g.fill();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(m, m, core * k, 0, TAU); g.fill();
      return { c, R };
    }
    // a ball joint, lit from the top left like the screensaver's
    function ballSprite([r, g, b]) {
      const R = 8, c = canvasFor(R), x = c.getContext('2d'), m = c.width / 2, k = c.width / (R * 2), lift = (v) => Math.round(v + (255 - v) * 0.65);
      const gr = x.createRadialGradient(m - 2.4 * k, m - 2.4 * k, 0.4 * k, m, m, 7.2 * k);
      gr.addColorStop(0, `rgb(${lift(r)},${lift(g)},${lift(b)})`); gr.addColorStop(0.45, `rgb(${r},${g},${b})`); gr.addColorStop(1, `rgb(${(r * 0.38) | 0},${(g * 0.38) | 0},${(b * 0.38) | 0})`);
      x.fillStyle = gr; x.beginPath(); x.arc(m, m, 7.2 * k, 0, TAU); x.fill();
      return { c, R };
    }
    function haze(R) {
      const c = canvasFor(R), g = c.getContext('2d'), m = c.width / 2, gr = g.createRadialGradient(m, m, 0, m, m, m);
      gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(0.3, 'rgba(214,226,248,.22)'); gr.addColorStop(1, 'rgba(159,208,255,0)');
      g.fillStyle = gr; g.fillRect(0, 0, c.width, c.height);
      return { c, R };
    }

    /* ------------------------------------------------------------ bullets: pooled */
    function bullet(o) {
      const b = pool.pop() || {};
      b.x = o.x; b.y = o.y; b.dx = o.dx; b.dy = o.dy; b.sp = o.sp; b.acc = o.acc || 0; b.vmax = o.vmax || o.sp;
      b.kind = o.kind; b.r = o.r; b.len = o.len || 0; b.dist = 0; b.grow = 0.85; b.mode = null; b.fade = 1;
      bullets.push(b);
      return b;
    }
    function drop(i) { const b = bullets[i], tail = bullets.pop(); if (b !== tail) bullets[i] = tail; pool.push(b); }
    const out = (b) => b.x < -30 || b.x > AW + 30 || b.y < -30 || b.y > AH + 30;
    // a bullet leaving any point at angle a
    function shoot(x, y, a, kind, sp, acc, vmax, r) { const dx = Math.cos(a), dy = Math.sin(a); bullet({ x: x + dx * 6, y: y + dy * 6, dx, dy, sp, acc, vmax, kind, r }); }
    // Starfield's stars all leave the vanishing point
    function star(a, kind, sp, acc, vmax) { shoot(B.x + Math.cos(a) * 4, B.y + Math.sin(a) * 4, a, kind, sp, acc, vmax, kind === 'big' ? 5.2 : 3.6); }
    function ring(n, rot, kind, sp, acc, vmax) { for (let k = 0; k < n; k++) star(rot + (k * TAU) / n, kind, sp, acc, vmax); }
    function streak(a, sp, ox, oy) { const dx = Math.cos(a), dy = Math.sin(a); bullet({ x: ox + dx * 14, y: oy + dy * 14, dx, dy, sp, kind: 'streak', r: 2.6, len: 16 }); }
    const aim = () => Math.atan2(P.y - B.y, P.x - B.x);
    function segD(px, py, ax, ay, bx, by) {
      const vx = bx - ax, vy = by - ay, t = clamp(((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy || 1), 0, 1);
      return Math.hypot(px - (ax + vx * t), py - (ay + vy * t));
    }
    const segDist = (px, py, b) => segD(px, py, b.x - b.dx * b.len, b.y - b.dy * b.len, b.x, b.y);

    /* ------------------------------------------------------------ boss 1: Starfield.scr
       Stars stream out of a vanishing point, which is the core to shoot. Phase 1 teaches: rings with wide gaps, a turning
       spiral, fans aimed at the cursor. Phase 2 is warp speed: lanes shown before they fire, two spirals turning
       against each other, a two-speed burst, while the core drifts from side to side. */
    const PHASES = [
      [['rings', 5], ['rest', 0.7], ['spiral', 5], ['rest', 0.7], ['aimed', 5], ['rest', 0.7]],
      [['lanes', 6], ['rest', 0.5], ['twin', 6], ['rest', 0.5], ['burst', 6], ['rest', 0.5]],
    ];
    const PAT = {
      rest: { init() {}, step() {} },
      // rings, spiral, aimed and burst also aim a little at the cursor, so standing still is never safe
      rings: {
        init(p) { p.cd = 0; p.ca = 0.9; p.rot = rand(0, TAU); },
        step(p, dt) {
          if ((p.cd -= dt) <= 0) { p.cd += 0.5; ring(26, p.rot, 'star', 55, 85, 190); p.rot += 0.12; }
          if ((p.ca -= dt) <= 0) { p.ca += 1.5; const a = aim(); for (let k = -1; k <= 1; k++) star(a + k * 0.14, 'big', 110, 120, 260); }
        },
      },
      spiral: {
        init(p) { p.cd = 0; p.ca = 0.8; p.a = rand(0, TAU); },
        step(p, dt) {
          p.a += 1.25 * dt;
          if ((p.cd -= dt) <= 0) { p.cd += 0.075; for (let k = 0; k < 3; k++) star(p.a + (k * TAU) / 3, 'star', 90, 40, 170); }
          if ((p.ca -= dt) <= 0) { p.ca += 1.6; star(aim(), 'big', 120, 140, 300); }
        },
      },
      aimed: {
        init(p) { p.cd = 0.3; p.cr = 0.6; p.rot = rand(0, TAU); },
        step(p, dt) {
          if ((p.cd -= dt) <= 0) { p.cd += 1.1; const a = aim(); for (let k = -2; k <= 2; k++) star(a + k * 0.2, 'big', 120, 120, 280); }
          if ((p.cr -= dt) <= 0) { p.cr += 0.9; ring(14, p.rot, 'star', 50, 60, 150); p.rot += 0.2; }
        },
      },
      lanes: {
        init(p) { p.cd = 0.2; p.fire = []; },
        step(p, dt, dur) {
          if ((p.cd -= dt) <= 0) {
            p.cd += 1.4;
            // a wave starts only if it can finish: every lane shown is a lane that fires
            if (p.t + 0.9 < dur) {
              const base = rand(0, TAU), lanes = [];
              for (let k = 0; k < 7; k++) lanes.push(base + (k * TAU) / 7);
              const w = { t: 0.55, lanes, n: 0, cd: 0, x: B.x, y: B.y };
              tele.push({ lanes, x: w.x, y: w.y, t: 0.55, T: 0.55 });
              p.fire.push(w);
              ring(16, base + TAU / 14, 'star', 40, 40, 120);
            }
          }
          for (const w of p.fire) {
            if ((w.t -= dt) > 0) continue;
            if ((w.cd -= dt) <= 0 && w.n < 4) { w.cd += 0.07; w.n += 1; for (const a of w.lanes) streak(a, 400, w.x, w.y); }
          }
          p.fire = p.fire.filter((w) => w.n < 4);
        },
      },
      twin: {
        init(p) { p.cd = 0; p.a = rand(0, TAU); p.b = p.a + Math.PI / 2; },
        step(p, dt) {
          p.a += 1.6 * dt; p.b -= 1.6 * dt;
          if ((p.cd -= dt) > 0) return;
          p.cd += 0.1;
          for (let k = 0; k < 2; k++) { star(p.a + k * Math.PI, 'star', 70, 70, 210); star(p.b + k * Math.PI, 'star', 70, 70, 210); }
        },
      },
      burst: {
        init(p) { p.cd = 0; p.ca = 0.8; p.rot = rand(0, TAU); },
        step(p, dt) {
          if ((p.cd -= dt) <= 0) {
            p.cd += 0.8;
            for (let k = 0; k < 30; k++) { const a = p.rot + (k * TAU) / 30; if (k % 2) star(a, 'star', 45, 50, 140); else star(a, 'star', 90, 110, 260); }
            p.rot += 0.09;
          }
          if ((p.ca -= dt) <= 0) { p.ca += 1.6; const a = aim(); for (let k = -1; k <= 1; k++) star(a + k * 0.16, 'big', 130, 130, 290); }
        },
      },
    };
    const STARFIELD = {
      id: 'starfield', name: 'Starfield.scr', hp: 480, target: 35, bg: 'stars',
      init() { B.x = AW / 2; B.y = 112; },
      move(dt) { if (B.phase === 2) { B.t2 += dt; B.x = AW / 2 + Math.sin((B.t2 * TAU) / 7) * 90; } },
      attack(dt) {
        const seq = PHASES[B.phase - 1], [name, dur] = seq[B.pi];
        if (!B.p) { B.p = { t: 0 }; PAT[name].init(B.p); }
        B.p.t += dt;
        PAT[name].step(B.p, dt, dur);
        if (B.p && B.p.t >= dur) { B.pi = (B.pi + 1) % seq.length; B.p = null; }
      },
      phase2() { B.t2 = 0; },
      hitShot(o) { return Math.hypot(o.x - B.x, o.y - B.y) < CORE_R; },
      hazard() { return Infinity; },
      tipAt() { return { x: B.x, y: B.y, below: 34 }; },
      stop() { if (B.p && B.p.fire) B.p.fire.length = 0; },
      draw() {
        if (B.alpha <= 0) return;
        const x = B.x, y = B.y, t = G.t, grow = B.dying ? B.dieK * 18 : 0, g = sprites.glow, R = g.R * (1 + grow / 18);
        ctx.globalAlpha = B.alpha;
        ctx.drawImage(g.c, x - R, y - R, R * 2, R * 2);
        // two thin rings turning opposite ways, like a target on the vanishing point
        ctx.strokeStyle = 'rgba(214,226,248,.45)'; ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]); ctx.lineDashOffset = -t * 12;
        ctx.beginPath(); ctx.arc(x, y, 15 + grow, 0, TAU); ctx.stroke();
        ctx.setLineDash([2, 9]); ctx.lineDashOffset = t * 9;
        ctx.beginPath(); ctx.arc(x, y, 24 + grow * 1.6, 0, TAU); ctx.stroke();
        ctx.setLineDash([]); ctx.lineDashOffset = 0;
        ctx.fillStyle = B.flash > 0 ? '#9fd0ff' : '#ffffff';
        ctx.beginPath(); ctx.arc(x, y, 6.5 + Math.sin(t * 5) * 0.6 + grow, 0, TAU); ctx.fill();
        if (!B.dying) healthRing(x, y, 31, 3);
        ctx.globalAlpha = 1;
      },
    };

    /* ------------------------------------------------------------ boss 2: Mystify.scr
       Polygons bounce round the screen trailing their own echo, as the screensaver drew them. Their sides are lasers
       and their corners, each wearing the green ring, are what to shoot. A corner that hits a wall sprays a fan away
       from it, and the corner nearest the cursor pings a small aimed fan. Phase 1 is one polygon, kept in the top of
       the arena. Phase 2 splits it in two, lets the sides dip into the cursor's half and adds burn-in: the echo of
       one polygon lights up dotted, then holds as lasers for a moment, the very thing screensavers were made to stop. */
    const mixCol = (t) => {
      const n = MRGB.length, f = t - Math.floor(t), c0 = MRGB[((Math.floor(t) % n) + n) % n], c1 = MRGB[((Math.floor(t) + 1) % n + n) % n];
      return `rgb(${Math.round(lerp(c0[0], c1[0], f))},${Math.round(lerp(c0[1], c1[1], f))},${Math.round(lerp(c0[2], c1[2], f))})`;
    };
    const colorOf = (q) => Math.round(B.m.cyc / 1.5 + q.ci) % MCOL.length;
    function quad(ci) {
      const v = [];
      for (let k = 0; k < 4; k++) { const a = rand(0, TAU), sp = rand(70, 95); v.push({ x: rand(40, AW - 40), y: rand(30, 250), vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, cd: 0 }); }
      return { v, ci, trail: [], trailT: 0 };
    }
    function burst(x, y, a, q) {
      const n = B.phase === 2 ? 8 : 6, kind = `m${colorOf(q)}`;
      for (let k = 0; k < n; k++) shoot(x, y, a + (k / (n - 1) - 0.5) * 1.6, kind, 80, 90, 190, 3.6);
    }
    function poly(pts) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.closePath(); ctx.stroke(); }
    function segs(list) { ctx.beginPath(); for (const g of list) { ctx.moveTo(g[0], g[1]); ctx.lineTo(g[2], g[3]); } ctx.stroke(); }
    const MYSTIFY = {
      id: 'mystify', name: 'Mystify.scr', hp: 520, target: 45, bg: 'none',
      init() { B.m = { quads: [quad(0)], cyc: rand(0, MCOL.length), arm: 0.8, burn: null, burnCd: 4.5, pingCd: 1.6 }; },
      move(dt) {
        const m = B.m, live = isLive(), slow = G.mode === 'intro' ? 0.3 : 1, yMax = B.phase === 2 ? 400 : 320;
        m.cyc += dt;
        // the sides stay a dotted outline, harmless, for a moment after the fight starts or the polygon splits
        if (m.arm > 0 && (G.mode === 'fight' || G.mode === 'demo')) m.arm -= dt;
        for (const q of m.quads) {
          for (const p of q.v) {
            p.x += p.vx * dt * slow; p.y += p.vy * dt * slow;
            if (p.cd > 0) p.cd -= dt;
            let nx = 0, ny = 0;
            if (p.x < 10) { p.x = 10; p.vx = Math.abs(p.vx); nx = 1; } else if (p.x > AW - 10) { p.x = AW - 10; p.vx = -Math.abs(p.vx); nx = -1; }
            if (p.y < 10) { p.y = 10; p.vy = Math.abs(p.vy); ny = 1; } else if (p.y > yMax) { p.y = yMax; p.vy = -Math.abs(p.vy); ny = -1; }
            if ((nx || ny) && live && p.cd <= 0) { p.cd = 0.4; burst(p.x, p.y, Math.atan2(ny, nx), q); }
          }
          // the echo: where the corners were, every 0.08 s
          if ((q.trailT -= dt) <= 0) { q.trailT += 0.08; q.trail.unshift(q.v.map((p) => [p.x, p.y])); if (q.trail.length > 14) q.trail.pop(); }
        }
        if (m.burn && (m.burn.t -= dt) <= 0) { if (m.burn.on) m.burn = null; else { m.burn.on = true; m.burn.t = 0.9; } }
      },
      attack(dt) {
        const m = B.m;
        if (m.arm > 0) return;
        if ((m.pingCd -= dt) <= 0) {
          m.pingCd += B.phase === 2 ? 2.4 : 2;
          for (const q of m.quads) {
            let best = q.v[0], bd = Infinity;
            for (const p of q.v) { const d = Math.hypot(p.x - P.x, p.y - P.y); if (d < bd) { bd = d; best = p; } }
            const a = Math.atan2(P.y - best.y, P.x - best.x);
            for (let k = -1; k <= 1; k++) shoot(best.x, best.y, a + k * 0.16, 'big', 120, 120, 270, 5.2);
          }
        }
        if (B.phase === 2 && !m.burn && (m.burnCd -= dt) <= 0) {
          m.burnCd = 6.5;
          const q = m.quads[Math.floor(Math.random() * m.quads.length)];
          // four of its past outlines, about a quarter second apart, so there is room to stand between them
          if (q.trail.length >= 13) {
            const list = [];
            for (const i of [3, 6, 9, 12]) { const c = q.trail[i]; for (let k = 0; k < 4; k++) { const a = c[k], b = c[(k + 1) % 4]; list.push([a[0], a[1], b[0], b[1]]); } }
            m.burn = { segs: list, t: 0.7, on: false, ci: colorOf(q) };
            sfx.burn();
          }
        }
      },
      phase2() {
        const m = B.m, q1 = m.quads[0];
        for (const p of q1.v) { p.vx *= 1.15; p.vy *= 1.15; }
        m.quads.push({ v: q1.v.map((p) => ({ x: p.x, y: p.y, vx: -p.vx, vy: p.vy * 0.9 + 20, cd: 0.5 })), ci: q1.ci + 3, trail: [], trailT: 0 });
        Object.assign(m, { arm: 0.9, burn: null, burnCd: 4, pingCd: 1.5 });
      },
      hitShot(o) { for (const q of B.m.quads) for (const p of q.v) if (Math.hypot(o.x - p.x, o.y - p.y) < NODE_R) return true; return false; },
      hazard(px, py) {
        const m = B.m;
        let d = Infinity;
        if (m.arm <= 0) for (const q of m.quads) for (let k = 0; k < 4; k++) { const a = q.v[k], b = q.v[(k + 1) % 4]; d = Math.min(d, segD(px, py, a.x, a.y, b.x, b.y)); }
        if (m.burn && m.burn.on) for (const g of m.burn.segs) d = Math.min(d, segD(px, py, g[0], g[1], g[2], g[3]));
        return d;
      },
      tipAt() { let top = B.m.quads[0].v[0]; for (const p of B.m.quads[0].v) if (p.y < top.y) top = p; return { x: top.x, y: top.y, below: 14 }; },
      stop() { B.m.burn = null; },
      draw() {
        const m = B.m;
        if (!m || B.alpha <= 0) return;
        const a = B.alpha, armed = m.arm <= 0 && !B.dying, k = B.dying ? B.dieK : 0;
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        for (const q of m.quads) {
          const col = mixCol(m.cyc / 1.5 + q.ci);
          let pts = q.v.map((p) => [p.x, p.y]);
          // closed, it folds into its own middle
          if (k) { const cx = pts.reduce((t, p) => t + p[0], 0) / 4, cy = pts.reduce((t, p) => t + p[1], 0) / 4; pts = pts.map((p) => [lerp(p[0], cx, k), lerp(p[1], cy, k)]); }
          ctx.strokeStyle = col; ctx.lineWidth = 1.2;
          for (let i = 1, n = Math.min(q.trail.length, 9); i < n; i++) { ctx.globalAlpha = a * Math.max(0, 0.3 - i * 0.032); poly(q.trail[i]); }
          if (armed) {
            ctx.globalAlpha = a * 0.28; ctx.lineWidth = 8; poly(pts);
            ctx.globalAlpha = a; ctx.lineWidth = 2.4; poly(pts);
          } else {
            ctx.setLineDash([5, 5]); ctx.globalAlpha = a * 0.8; ctx.lineWidth = 1.5; poly(pts); ctx.setLineDash([]);
          }
          ctx.globalAlpha = a;
          for (const p of pts) {
            ctx.fillStyle = B.flash > 0 ? '#9fd0ff' : '#ffffff';
            ctx.beginPath(); ctx.arc(p[0], p[1], 3.4, 0, TAU); ctx.fill();
            if (!B.dying) healthRing(p[0], p[1], 8, 2);
          }
        }
        if (m.burn && !B.dying) {
          const b = m.burn;
          if (b.on) {
            ctx.globalAlpha = a * 0.3; ctx.strokeStyle = MCOL[b.ci]; ctx.lineWidth = 8; segs(b.segs);
            ctx.globalAlpha = a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2; segs(b.segs);
          } else {
            const w = 1 - b.t / 0.7;
            ctx.setLineDash([4, 6]); ctx.globalAlpha = a * (0.25 + w * 0.55); ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1 + w; segs(b.segs); ctx.setLineDash([]);
          }
        }
        ctx.globalAlpha = 1;
      },
    };

    /* ------------------------------------------------------------ boss 3: 3D Pipes.scr
       Pipes grow cell by cell on a grid and turn at ball joints, in the screensaver's solid colours. The growing head of
       each pipe wears the green ring, showing that head's own strength: shoot it empty and the pipe stops, capped, and a
       new one starts from an edge. The pipes hurt to touch and stay as walls, and they fight back: a new joint spits a
       fan at the cursor, a head pings a star now and then, and a whole pipe can flush, lit up first, then leaking both
       ways from every other cell. Phase 1 keeps the pipes out of the bottom rows, and the oldest capped pipes fade when
       the room runs out. Phase 2 grows three at a time and faster, and when the screen fills, as the screensaver's did, a
       chrome pipe curtain sweeps down the whole width, wiping the old pipes, with one gap to pass through. */
    const PCELL = 30, PCOLS = AW / PCELL, PROWS = AH / PCELL, PIPE_W = 12, PIPE_HP = 26;
    const cellX = (c) => PCELL / 2 + c * PCELL, cellY = (r) => PCELL / 2 + r * PCELL;
    const pfree = (c, r) => c >= 0 && c < PCOLS && r >= 0 && r <= B.m.rowMax && !B.m.occ[r * PCOLS + c];
    function headOf(p) { const [c, r] = p.pts[p.pts.length - 1], k = p.alive ? p.t : 0; return { x: cellX(c) + p.dir[0] * PCELL * k, y: cellY(r) + p.dir[1] * PCELL * k }; }
    function spawnPipe() {
      const m = B.m, starts = [];
      for (let c = 0; c < PCOLS; c++) starts.push([c, 0, 0, 1]);
      for (let r = 1; r <= m.rowMax - 2; r++) { starts.push([0, r, 1, 0]); starts.push([PCOLS - 1, r, -1, 0]); }
      const ok = starts.filter(([c, r, dc, dr]) => pfree(c, r) && pfree(c + dc, r + dr));
      if (!ok.length) return false;
      const [c, r, dc, dr] = ok[Math.floor(Math.random() * ok.length)];
      let ci = Math.floor(Math.random() * PCOL.length);
      if (ci === m.lastCi) ci = (ci + 1) % PCOL.length;
      m.lastCi = ci;
      m.occ[r * PCOLS + c] = 1; m.occ[(r + dr) * PCOLS + c + dc] = 1;
      m.pipes.push({ pts: [[c, r]], dir: [dc, dr], next: [c + dc, r + dr], t: 0, ci, hp: PIPE_HP, alive: true, joints: [], flush: 0, hitT: 0, gone: false, fade: 1 });
      return true;
    }
    function capPipe(p) {
      if (!p.alive) return;
      p.alive = false;
      // the cell it was heading for is free again
      if (p.next) { B.m.occ[p.next[1] * PCOLS + p.next[0]] = 0; p.next = null; }
    }
    // the oldest capped pipe fades out and frees its cells, so there is always room to grow
    function retirePipe() {
      const p = B.m.pipes.find((q) => !q.alive && !q.gone);
      if (!p) return false;
      p.gone = true;
      for (const [c, r] of p.pts) B.m.occ[r * PCOLS + c] = 0;
      return true;
    }
    // arrive in the next cell, then pick the one after: straight more often than not, never into a pipe or a wall
    function growPipe(p, live) {
      const m = B.m, [nc, nr] = p.next, [dx, dy] = p.dir, straight = [dx, dy], opts = [];
      p.pts.push([nc, nr]);
      for (const d of [straight, [dy, -dx], [-dy, dx]]) if (pfree(nc + d[0], nr + d[1])) opts.push(d);
      if (!opts.length) { p.next = null; capPipe(p); return; }
      const d = opts[0] === straight && Math.random() < 0.62 ? straight : opts[Math.floor(Math.random() * opts.length)];
      if (d !== straight) { p.joints.push([nc, nr]); if (live) jointFan(cellX(nc), cellY(nr), p.ci); }
      p.dir = d; p.next = [nc + d[0], nr + d[1]];
      m.occ[p.next[1] * PCOLS + p.next[0]] = 1;
    }
    function jointFan(x, y, ci) { const a = Math.atan2(P.y - y, P.x - x); for (let k = -2; k <= 2; k++) shoot(x, y, a + k * 0.17, `p${ci}`, 90, 90, 200, 3.6); }
    function leak(p) {
      for (let i = 1; i < p.pts.length; i += 2) {
        const [c0, r0] = p.pts[i - 1], [c1, r1] = p.pts[i], dx = c1 - c0, dy = r1 - r0, x = cellX(c1), y = cellY(r1);
        shoot(x, y, Math.atan2(dx, -dy), `p${p.ci}`, 50, 70, 140, 3.6);
        shoot(x, y, Math.atan2(-dx, dy), `p${p.ci}`, 50, 70, 140, 3.6);
      }
    }
    const fillFrac = () => B.m.occ.reduce((a, v) => a + v, 0) / (PCOLS * (B.m.rowMax + 1));
    // the gap opens away from the cursor, so passing it always takes a move
    function startCurtain() {
      const m = B.m;
      let gx = rand(60, AW - 60);
      if (Math.abs(gx - P.x) < 80) gx = clamp(P.x + (P.x < AW / 2 ? 1 : -1) * rand(90, 160), 60, AW - 60);
      m.curtain = { y: -12, gx, w: 64 };
      Object.assign(m, { since: 0, curtainCd: 99 });
      for (const p of m.pipes) { capPipe(p); p.flush = 0; }
      sfx.sweep();
    }
    function pipePath(pts, o) { ctx.beginPath(); ctx.moveTo(pts[0][0] + o, pts[0][1] + o); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0] + o, pts[i][1] + o); }
    function drawPipe(p, a) {
      if (a <= 0) return;
      const pts = p.pts.map(([c, r]) => [cellX(c), cellY(r)]);
      if (p.alive) { const h = headOf(p); pts.push([h.x, h.y]); }
      const [r, g, b] = PRGB[p.ci], bs = sprites[`b${p.ci}`];
      ctx.globalAlpha = a; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (pts.length > 1) {
        // a tube: a dark edge, the colour, and a light line where the light catches it
        pipePath(pts, 0);
        ctx.strokeStyle = `rgb(${(r * 0.42) | 0},${(g * 0.42) | 0},${(b * 0.42) | 0})`; ctx.lineWidth = PIPE_W; ctx.stroke();
        ctx.strokeStyle = PCOL[p.ci]; ctx.lineWidth = PIPE_W - 4; ctx.stroke();
        pipePath(pts, -1.6); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.stroke();
        // about to flush: the whole pipe lights up
        if (p.flush > 0) { pipePath(pts, 0); ctx.strokeStyle = `rgba(255,255,255,${(0.2 + (1 - p.flush / 0.6) * 0.6).toFixed(2)})`; ctx.lineWidth = PIPE_W + 2; ctx.stroke(); }
      }
      for (const [c, rr] of p.joints) ctx.drawImage(bs.c, cellX(c) - bs.R, cellY(rr) - bs.R, bs.R * 2, bs.R * 2);
      ctx.drawImage(bs.c, pts[0][0] - bs.R, pts[0][1] - bs.R, bs.R * 2, bs.R * 2);
      const end = pts[pts.length - 1];
      if (p.alive) {
        ctx.fillStyle = p.hitT > 0 ? '#9fd0ff' : '#ffffff';
        ctx.beginPath(); ctx.arc(end[0], end[1], 4.2, 0, TAU); ctx.fill();
        healthRing(end[0], end[1], 11, 2.4, p.hp / PIPE_HP);
      } else ctx.drawImage(bs.c, end[0] - bs.R, end[1] - bs.R, bs.R * 2, bs.R * 2);
    }
    function drawCurtain(c, a) {
      const gl = c.gx - c.w / 2, gr = c.gx + c.w / 2, y = c.y, bs = sprites.bSteel;
      ctx.globalAlpha = a;
      // where to go: the gap's edges, dotted, all the way down
      ctx.setLineDash([3, 6]); ctx.strokeStyle = 'rgba(255,255,255,.3)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(gl + 4, y + 8); ctx.lineTo(gl + 4, AH); ctx.moveTo(gr - 4, y + 8); ctx.lineTo(gr - 4, AH); ctx.stroke();
      ctx.setLineDash([]); ctx.lineCap = 'butt';
      for (const [x0, x1] of [[-10, gl], [gr, AW + 10]]) {
        ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x1, y);
        ctx.strokeStyle = '#4a4f59'; ctx.lineWidth = 14; ctx.stroke();
        ctx.strokeStyle = '#c3c8cf'; ctx.lineWidth = 10; ctx.stroke();
        ctx.beginPath(); ctx.moveTo(x0, y - 2.5); ctx.lineTo(x1, y - 2.5); ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 2; ctx.stroke();
      }
      ctx.lineCap = 'round';
      for (const x of [gl, gr]) ctx.drawImage(bs.c, x - bs.R, y - bs.R, bs.R * 2, bs.R * 2);
    }
    const PIPES = {
      id: 'pipes', name: '3D Pipes.scr', hp: 560, target: 50, bg: 'none',
      init() { B.m = { occ: new Uint8Array(PCOLS * PROWS), pipes: [], lastCi: -1, spawnCd: 0.1, pingCd: 1.8, flushCd: 4.5, curtain: null, curtainCd: 99, since: 0, rowMax: 11, speed: 2.2, want: 2 }; },
      move(dt) {
        const m = B.m, live = isLive(), slow = G.mode === 'intro' ? 0.3 : 1;
        for (const p of m.pipes) {
          if (p.gone) { p.fade -= dt * 2; continue; }
          if (p.hitT > 0) p.hitT -= dt;
          if (p.alive) { p.t += m.speed * dt * slow; while (p.alive && p.t >= 1) { p.t -= 1; growPipe(p, live); } }
          if (p.flush > 0 && (p.flush -= dt) <= 0) { p.flush = 0; if (live && !m.curtain) { leak(p); sfx.flush(); } }
        }
        m.pipes = m.pipes.filter((p) => !p.gone || p.fade > 0);
        if (m.curtain) {
          m.curtain.y += 130 * dt;
          // swept clean: the pipes start again
          if (m.curtain.y > AH + 16) { m.curtain = null; m.pipes = []; m.occ.fill(0); Object.assign(m, { spawnCd: 0.3, curtainCd: 16, since: 0 }); }
          return;
        }
        if (G.mode === 'won' || G.mode === 'dead') return;
        if (m.pipes.filter((p) => p.alive).length < m.want && (m.spawnCd -= dt) <= 0) {
          m.spawnCd = B.phase === 2 ? 0.5 : 0.8;
          if (!spawnPipe() && B.phase === 1 && retirePipe()) spawnPipe();
        }
        if (B.phase === 1 && m.pipes.filter((p) => !p.gone).length > 9) retirePipe();
      },
      attack(dt) {
        const m = B.m;
        // phase 2: when the screen fills, or every 16 s, the curtain sweeps it clean
        if (B.phase === 2 && !m.curtain) {
          m.since += dt; m.curtainCd -= dt;
          if (m.curtainCd <= 0 || m.since > 16 || fillFrac() > 0.5) startCurtain();
        }
        if (m.curtain) return;   // nothing else fires while the screen clears
        if ((m.pingCd -= dt) <= 0) {
          m.pingCd += B.phase === 2 ? 1.9 : 2.3;
          for (const p of m.pipes) if (p.alive) { const h = headOf(p); shoot(h.x, h.y, Math.atan2(P.y - h.y, P.x - h.x), 'big', 110, 130, 280, 5.2); }
        }
        if ((m.flushCd -= dt) <= 0) {
          m.flushCd = B.phase === 2 ? 4 : 5;
          const list = m.pipes.filter((p) => !p.gone && !p.flush && p.pts.length >= 5);
          if (list.length) list[Math.floor(Math.random() * list.length)].flush = 0.6;
        }
      },
      phase2() {
        const m = B.m;
        for (const p of m.pipes) { capPipe(p); p.flush = 0; }
        Object.assign(m, { want: 3, speed: 3.2, rowMax: 12, pingCd: 2.6, flushCd: 6, spawnCd: 99, curtainCd: 0, since: 0 });
      },
      hitShot(o) {
        const cy = B.m.curtain ? B.m.curtain.y : -Infinity;
        for (const p of B.m.pipes) if (p.alive) { const h = headOf(p); if (h.y > cy && Math.hypot(o.x - h.x, o.y - h.y) < 11) return p; }
        return null;
      },
      onHit(p) {
        p.hitT = 0.06;
        if ((p.hp -= 1) > 0) return;
        capPipe(p);
        const h = headOf(p);
        spark(h.x, h.y, PCOL[p.ci], 8); sfx.clank();
        B.m.spawnCd = Math.min(B.m.spawnCd, 0.8);
      },
      hazard(px, py) {
        const m = B.m, cy = m.curtain ? m.curtain.y : -Infinity;
        let d = Infinity;
        for (const p of m.pipes) {
          if (p.gone) continue;
          const n = p.pts.length;
          let x0 = cellX(p.pts[0][0]), y0 = cellY(p.pts[0][1]);
          if (n === 1 && !p.alive) { if (y0 > cy) d = Math.min(d, Math.hypot(px - x0, py - y0)); continue; }
          for (let i = 1; i <= n; i++) {
            let x1, y1;
            if (i < n) { x1 = cellX(p.pts[i][0]); y1 = cellY(p.pts[i][1]); } else if (p.alive) { const h = headOf(p); x1 = h.x; y1 = h.y; } else break;
            if (Math.max(y0, y1) > cy) d = Math.min(d, segD(px, py, x0, y0, x1, y1));
            x0 = x1; y0 = y1;
          }
        }
        // a pipe is thicker than a laser: measure from its surface
        d -= PIPE_W / 2 - LASER_R;
        if (m.curtain) {
          const c = m.curtain, gl = c.gx - c.w / 2, gr = c.gx + c.w / 2;
          const dc = px < gl || px > gr ? Math.abs(py - c.y) : Math.min(Math.hypot(px - gl, py - c.y), Math.hypot(px - gr, py - c.y));
          d = Math.min(d, dc - (7 - LASER_R));
        }
        return d;
      },
      tipAt() { const p = B.m.pipes.find((q) => q.alive); if (!p) return { x: AW / 2, y: 20, below: 14 }; const h = headOf(p); return { x: h.x, y: h.y, below: 14 }; },
      stop() { for (const p of B.m.pipes) p.flush = 0; },
      draw() {
        const m = B.m;
        if (!m || B.alpha <= 0) return;
        ctx.save();
        // above the curtain the screen is already clear
        if (m.curtain) { ctx.beginPath(); ctx.rect(0, m.curtain.y, AW, AH); ctx.clip(); }
        for (const p of m.pipes) drawPipe(p, B.alpha * (p.gone ? Math.max(0, p.fade) : 1));
        ctx.restore();
        if (m.curtain) drawCurtain(m.curtain, B.alpha);
        ctx.globalAlpha = 1;
      },
    };
    /* ------------------------------------------------------------ boss 4: Marquee.scr
       Giant lines of text scroll sideways, as the screensaver scrolled its message, and come down the screen one after
       another. Every letter hurts to touch, and about one in three wears the green ring: shoot it until the ring runs out
       and it breaks, leaving a gap; the others are armour. To get past a line, slip through the gap between two words, or
       break a ringed letter to make one. A line blinks before each of its letters drops a bullet, the punctuation fires at
       the cursor, and now and then a loose letter shakes, then falls. Phase 1 scrolls every line to the left, one at a
       time. Phase 2 sends them in pairs that scroll opposite ways at different speeds, closer together, and the dropped
       bullets slant with their line. */
    const MQ_SIZE = 84, MQ_PAD = 18, MQ_M = 110;     // the font size in units; how far round a letter its distance map reaches; the wrap margin
    const MQ_SPACE = 30, MQ_TRACK = 2, MQ_SEP = 64;  // the gap a space leaves, the gap between letters, the gap before the message repeats
    const LETTER_HP = 12, GUN_HP = 10, MQ_GUNS = '.,!?:';
    const MQ_SPEED2 = [58, 104, 70, 120, 62, 92];    // phase 2's scroll speeds, taken in turn
    const MQ = { font: '', cap: 59, desc: 12, glyphs: new Map() };
    const mqX = (ln, l) => ((((ln.off + l.x) % ln.L) + ln.L) % ln.L) - MQ_M;
    // Noto Sans once it has loaded, so the letters have the same shapes on every screen; the system's sans-serif if it never does
    function mqSetup() {
      const sg = `700 ${MQ_SIZE}px "Noto Sans"`;
      let ok = false;
      try { ok = !!document.fonts && document.fonts.check(sg); } catch (e) { ok = false; }
      const font = ok ? `${sg}, sans-serif` : `700 ${MQ_SIZE}px sans-serif`;
      if (font === MQ.font) return;
      const m = document.createElement('canvas').getContext('2d');
      m.font = font;
      const h = m.measureText('H'), q = m.measureText('Q,');
      Object.assign(MQ, { font, cap: Math.round(h.actualBoundingBoxAscent || MQ_SIZE * 0.7), desc: Math.ceil(Math.max(q.actualBoundingBoxDescent || 0, 6)) });
      MQ.glyphs.clear();
    }
    // a two-pass chamfer: every empty cell learns roughly how far it is from the nearest ink
    function chamfer(d, W, H) {
      const D = Math.SQRT2;
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const i = y * W + x;
        if (!d[i]) continue;
        let v = d[i];
        if (x > 0) v = Math.min(v, d[i - 1] + 1);
        if (y > 0) { v = Math.min(v, d[i - W] + 1); if (x > 0) v = Math.min(v, d[i - W - 1] + D); if (x < W - 1) v = Math.min(v, d[i - W + 1] + D); }
        d[i] = v;
      }
      for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
        const i = y * W + x;
        if (!d[i]) continue;
        let v = d[i];
        if (x < W - 1) v = Math.min(v, d[i + 1] + 1);
        if (y < H - 1) { v = Math.min(v, d[i + W] + 1); if (x < W - 1) v = Math.min(v, d[i + W + 1] + D); if (x > 0) v = Math.min(v, d[i + W - 1] + D); }
        d[i] = v;
      }
    }
    // each letter is drawn once, a unit a pixel, into a map of how far every point round it is from its ink:
    // a touch is judged on the letter's real shape, so the hole under a T is as open as it looks
    function mqGlyph(ch) {
      let g = MQ.glyphs.get(ch);
      if (g) return g;
      const c = document.createElement('canvas'), m = c.getContext('2d', { willReadFrequently: true });
      m.font = MQ.font;
      const adv = Math.ceil(m.measureText(ch).width);
      c.width = adv + MQ_PAD * 2; c.height = MQ.cap + MQ.desc + MQ_PAD * 2;
      m.font = MQ.font; m.fillStyle = '#fff';
      m.fillText(ch, MQ_PAD, MQ_PAD + MQ.cap);
      const W = c.width, H = c.height, px = m.getImageData(0, 0, W, H).data, df = new Float32Array(W * H);
      let sx = 0, sy = 0, n = 0;
      for (let i = 0; i < W * H; i++) {
        if (px[i * 4 + 3] > 127) { sx += i % W; sy += Math.floor(i / W); n += 1; } else df[i] = 1e4;
      }
      chamfer(df, W, H);
      g = { ch, adv, W, H, df, cx: n ? sx / n + 0.5 - MQ_PAD : adv / 2, cy: n ? sy / n + 0.5 - MQ_PAD : MQ.cap / 2 };
      MQ.glyphs.set(ch, g);
      return g;
    }
    // how far a point is from a letter's ink, with the letter's left edge and cap top at x, y
    function inkDist(g, x, y, px, py) {
      const i = Math.floor(px - x) + MQ_PAD, j = Math.floor(py - y) + MQ_PAD;
      if (i < 0 || j < 0 || i >= g.W || j >= g.H) return Infinity;
      return Math.max(0, g.df[j * g.W + i] - 0.5);
    }
    function mqLine(text, y, dir, sp, ci) {
      const letters = [];
      let x = 0;
      // the message repeats until one pass is wider than the arena plus a margin each side, so no letter is on screen twice
      do {
        // about one letter in three wears the ring, spread through each word, and every punctuation mark does; the rest
        // are armour, so hitting the boss means keeping under a ring rather than firing at the text anywhere
        let wi = 0, r = Math.floor(Math.random() * 3);
        for (const ch of text) {
          if (ch === ' ') { x += MQ_SPACE; wi = 0; r = Math.floor(Math.random() * 3); continue; }
          const g = mqGlyph(ch), gun = MQ_GUNS.includes(ch), ring = gun || (wi + r) % 3 === 0, hp = gun ? GUN_HP : LETTER_HP;
          letters.push({ g, x, hp, max: hp, gun, ring, armor: !ring, gone: 0, hitAt: -1, cd: rand(0.8, 2.2), flash: 0, shake: 0, ln: null });
          x += g.adv + MQ_TRACK; wi += 1;
        }
        x += MQ_SEP;
      } while (x < AW + MQ_M * 2);
      const ln = { y, dir, sp, ci, L: x, off: rand(0, x), letters, vcd: rand(1.4, 2.2), blink: 0, min: null };
      for (const l of letters) l.ln = ln;
      return ln;
    }
    // the next line comes in above the screen; its dotted edge shows at the top until it does
    function mqSpawn() {
      const m = B.m;
      let dir = -1, sp = rand(44, 58);
      if (B.phase === 2) { dir = m.pat % 2 ? 1 : -1; sp = MQ_SPEED2[m.pat % MQ_SPEED2.length]; m.spawnCd = m.pat % 2 ? 3.7 : 2.3; m.pat += 1; }
      else m.spawnCd = 4.8;
      m.lines.push(mqLine(s.marquee[m.order[m.oi % m.order.length]], -(MQ.cap + MQ.desc) - 50, dir, sp, m.ci % MQCOL.length));
      m.oi += 1; m.ci += 1;
    }
    // punctuation fires at the cursor: a full stop or a comma once, a colon twice, an exclamation mark three wide, a question mark five
    function mqFire(ch, x, y, ci) {
      const a = Math.atan2(P.y - y, P.x - x), n = { '!': 3, '?': 5, ':': 2 }[ch] || 1, w = n === 5 ? 0.22 : 0.16;
      for (let k = 0; k < n; k++) shoot(x, y, a + (k - (n - 1) / 2) * w, `q${ci}`, 105, 110, 240, 3.6);
    }
    // a broken letter splits along a crack and the halves tumble apart
    function mqShatter(l, x, y, ci) {
      const g = l.g, t0 = G.t;
      B.m.shards.push({ g, x, y, ci, t0, half: 0, vx: rand(-55, -20), vy: rand(-90, -40), vr: rand(-3.2, -1.2) }, { g, x, y, ci, t0, half: 1, vx: rand(20, 55), vy: rand(-40, 0), vr: rand(1.2, 3.2) });
      spark(x + g.cx, y + g.cy, MQCOL[ci], 6);
    }
    // the green ring sits on a dark ring of its own, so it shows on the brightest letter
    function mqRing(x, y, frac) {
      ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 4.6;
      ctx.beginPath(); ctx.arc(x, y, 8, 0, TAU); ctx.stroke();
      healthRing(x, y, 8, 2, frac);
    }
    const MARQUEE = {
      id: 'marquee', name: 'Marquee.scr', hp: 340, target: 50, bg: 'none',
      init() {
        mqSetup();
        // the first message always opens; the rest come in a shuffled order
        const order = [];
        for (let i = 1; i < s.marquee.length; i++) order.splice(Math.floor(Math.random() * (order.length + 1)), 0, i);
        B.m = { lines: [], falls: [], shards: [], shaking: [], order, oi: 0, ci: 1, vy: 50, spawnCd: 2.6, looseCd: 4, gunEvery: 1.9, volleyEvery: 2, pat: 0, tip: null };
        const ln = mqLine(s.marquee[0], 40, -1, 50, 0);
        ln.off = MQ_M + 20;
        B.m.lines.push(ln);
        // the first meeting's balloon points at the ringed letter nearest the middle
        let bd = Infinity;
        for (const l of ln.letters) { const d = Math.abs(mqX(ln, l) + l.g.cx - AW * 0.45); if (l.ring && !l.gun && d < bd) { bd = d; B.m.tip = l; } }
      },
      move(dt) {
        const m = B.m, live = isLive(), slow = G.mode === 'intro' ? 0.3 : 1;
        for (const ln of m.lines) {
          ln.off += ln.dir * ln.sp * dt * slow;
          if (live) ln.y += m.vy * dt;
        }
        m.lines = m.lines.filter((ln) => ln.y < AH + 8);
        for (const f of m.falls) {
          f.vy = Math.min(460, f.vy + 700 * dt); f.y += f.vy * dt;
        }
        m.falls = m.falls.filter((f) => f.y < AH + 10);
        m.shards = m.shards.filter((p) => G.t - p.t0 < 0.7);
      },
      attack(dt) {
        const m = B.m;
        if ((m.spawnCd -= dt) <= 0) mqSpawn();
        for (const ln of m.lines) {
          // a line fires only while it is on screen and well above the cursor
          if (ln.y < -MQ.cap / 2 || ln.y + MQ.cap > P.y - 70) continue;
          for (const l of ln.letters) {
            if (!l.gun || l.gone) continue;
            const x = mqX(ln, l) + l.g.cx;
            if (x < 6 || x > AW - 6) continue;
            if (l.flash > 0) { if ((l.flash -= dt) <= 0) mqFire(l.g.ch, x, ln.y + l.g.cy, ln.ci); }
            else if ((l.cd -= dt) <= 0) { l.cd = m.gunEvery + rand(-0.3, 0.3); l.flash = 0.3; }
          }
          // the whole line blinks, then every letter on screen drops a bullet
          if (ln.y + MQ.cap > P.y - 110) continue;
          if (ln.blink > 0) {
            if ((ln.blink -= dt) > 0) continue;
            const a = Math.PI / 2 - (B.phase === 2 ? ln.dir * 0.3 : 0);
            for (const l of ln.letters) {
              if (l.gone || l.gun) continue;
              const x = mqX(ln, l) + l.g.adv / 2;
              if (x > 4 && x < AW - 4) shoot(x, ln.y + MQ.cap - 4, a, `q${ln.ci}`, 90, 110, 190, 3.6);
            }
          } else if ((ln.vcd -= dt) <= 0) { ln.vcd = m.volleyEvery; ln.blink = 0.35; }
        }
        // a loose letter: an armoured one well above the cursor and near it shakes, then falls; never while the cursor is threading a line
        if ((m.looseCd -= dt) <= 0) {
          m.looseCd = 0.5;
          if (!m.lines.some((ln) => P.y > ln.y - 40 && P.y < ln.y + MQ.cap + 40)) {
            let best = null, bd = 90;
            for (const ln of m.lines) {
              if (ln.y < 0 || ln.y + MQ.cap > P.y - 150) continue;
              for (const l of ln.letters) {
                if (l.gone || l.ring || l.shake > 0) continue;
                const x = mqX(ln, l);
                if (x < 4 || x + l.g.adv > AW - 4) continue;
                const d = Math.abs(x + l.g.cx - P.x);
                if (d < bd) { bd = d; best = l; }
              }
            }
            if (best) { best.shake = 0.5; m.shaking.push(best); m.looseCd = B.phase === 2 ? 3.2 : 4.2; }
          }
        }
        for (let i = m.shaking.length - 1; i >= 0; i--) {
          const l = m.shaking[i];
          if (l.gone) { l.shake = 0; m.shaking.splice(i, 1); continue; }
          if ((l.shake -= dt) > 0) continue;
          m.shaking.splice(i, 1);
          l.gone = 2;
          m.falls.push({ g: l.g, x: mqX(l.ln, l), y: l.ln.y, vy: 30, ci: l.ln.ci, min: null });
          sfx.fall();
        }
      },
      phase2() {
        const m = B.m;
        // the screen clears: every letter on it breaks, and the first new line waits above until the fight picks up again
        for (const ln of m.lines) for (const l of ln.letters) {
          if (l.gone) continue;
          const x = mqX(ln, l);
          if (x < AW && x + l.g.adv > 0 && ln.y < AH && ln.y + MQ.cap > 0) mqShatter(l, x, ln.y, ln.ci);
          l.gone = 1;
        }
        Object.assign(m, { lines: [], falls: [], shaking: [], vy: 62, gunEvery: 1.5, volleyEvery: 1.7, looseCd: 3, pat: 0 });
        mqSpawn();
      },
      hitShot(o) {
        const y = o.y - 4;
        for (const ln of B.m.lines) {
          if (y < ln.y - 2 || y > ln.y + MQ.cap + MQ.desc) continue;
          for (const l of ln.letters) {
            if (l.gone) continue;
            const x = mqX(ln, l);
            if (o.x < x - 2 || o.x > x + l.g.adv + 2) continue;
            if (inkDist(l.g, x, ln.y, o.x, y) < 1) return l;
          }
        }
        return null;
      },
      onHit(l) {
        l.hitAt = G.t;
        if ((l.hp -= 1) > 0) return;
        l.gone = 1;
        mqShatter(l, mqX(l.ln, l), l.ln.y, l.ln.ci);
        sfx.crack();
      },
      hazard(px, py) {
        const m = B.m;
        let d = Infinity;
        for (const ln of m.lines) {
          if (py < ln.y - MQ_PAD || py > ln.y + MQ.cap + MQ.desc + MQ_PAD) continue;
          for (const l of ln.letters) {
            if (l.gone) continue;
            const x = mqX(ln, l);
            if (px < x - MQ_PAD || px > x + l.g.adv + MQ_PAD) continue;
            d = Math.min(d, inkDist(l.g, x, ln.y, px, py));
          }
        }
        for (const f of m.falls) if (!f.min) d = Math.min(d, inkDist(f.g, f.x, f.y, px, py));
        // measured from the ink itself, so only the hotspot's own radius touches
        return d + LASER_R;
      },
      tipAt() {
        const l = B.m.tip;
        if (!l || l.gone || !B.m.lines.includes(l.ln)) return { x: AW / 2, y: 40, below: 20 };
        return { x: mqX(l.ln, l) + l.g.cx, y: l.ln.y + l.g.cy, below: MQ.cap - l.g.cy + 8 };
      },
      stop() {
        const m = B.m;
        for (const l of m.shaking) l.shake = 0;
        m.shaking = [];
        for (const ln of m.lines) { ln.blink = 0; for (const l of ln.letters) l.flash = 0; }
      },
      draw() {
        const m = B.m;
        if (!m || B.alpha <= 0) return;
        const a = B.alpha, k = B.dying ? B.dieK : 0, cap = MQ.cap, blinkOn = Math.floor(G.t * 16) % 2 === 0;
        ctx.font = MQ.font; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        for (const ln of m.lines) {
          if (ln.y + cap + MQ.desc < 0) {
            if (B.dying) continue;
            ctx.globalAlpha = a * (0.45 + Math.sin(G.t * 10) * 0.25);
            ctx.setLineDash([4, 6]); ctx.strokeStyle = MQCOL[ln.ci]; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, 1.5); ctx.lineTo(AW, 1.5); ctx.stroke(); ctx.setLineDash([]);
            continue;
          }
          const col = MQCOL[ln.ci];
          for (const l of ln.letters) {
            if (l.gone) continue;
            let x = mqX(ln, l), y = ln.y;
            if (x > AW || x + l.g.adv < 0) continue;
            ctx.fillStyle = (l.flash > 0 || ln.blink > 0) && blinkOn ? '#ffffff' : G.t - l.hitAt < 0.06 ? MQLIT[ln.ci] : col;
            if (l.shake > 0) x += Math.sin(G.t * 70) * 1.8;
            // beaten, the sign falls apart
            if (k) y += k * k * (110 + (l.x % 9) * 16);
            ctx.globalAlpha = a;
            ctx.fillText(l.g.ch, x, y + cap);
            if (l.ring && !B.dying) mqRing(x + l.g.cx, y + l.g.cy, l.hp / l.max);
          }
        }
        for (const f of m.falls) {
          ctx.fillStyle = MQCOL[f.ci];
          ctx.globalAlpha = a * 0.3; ctx.fillText(f.g.ch, f.x, f.y + cap - f.vy * 0.05);
          ctx.globalAlpha = a; ctx.fillText(f.g.ch, f.x, f.y + cap);
        }
        for (const p of m.shards) {
          const t = G.t - p.t0;
          if (t >= 0.7) continue;
          const w = p.g.adv, h = cap;
          ctx.save();
          ctx.globalAlpha = a * (1 - t / 0.7);
          ctx.translate(p.x + p.vx * t + w / 2, p.y + p.vy * t + 300 * t * t + h / 2); ctx.rotate(p.vr * t);
          ctx.beginPath();
          if (p.half === 0) { ctx.moveTo(-w, -h); ctx.lineTo(w, -h); ctx.lineTo(w, -h * 0.12); ctx.lineTo(-w, h * 0.12); }
          else { ctx.moveTo(-w, h * 0.12 + 1.5); ctx.lineTo(w, -h * 0.12 + 1.5); ctx.lineTo(w, h * 1.5); ctx.lineTo(-w, h * 1.5); }
          ctx.closePath(); ctx.clip();
          ctx.fillStyle = MQCOL[p.ci]; ctx.fillText(p.g.ch, -w / 2, h / 2);
          ctx.restore();
        }
        ctx.globalAlpha = 1;
      },
    };
    /* ------------------------------------------------------------ boss 5: Blank.scr, the hidden last boss
       The screen goes dark, as the Blank screensaver left it: the picture folds into a line, the line into a dot, and
       the dot is the boss. It shows nothing but its green ring and a faint glow; only the bullets and the hotspot are
       lit, and the window dims round the arena. Phase 1: the dot drifts and pulses like a slow bass beat, each beat a
       ring of bullets; the portfolio CRT's No signal box wanders the screen, stopping shots and spraying where it
       bounces (all round, in a corner); now and then the dot goes dark and moves, so it is found again by where its
       bullets come from. Phase 2 is burn-in, what screensavers were made to prevent: with nothing left to cover it,
       the screen shows ghosts of the four screensavers already closed, one after another, each shown first as a faint
       outline. Beaten, the tube switches on again, to the Welcome screen. */
    const DOT_R = 22, BOX_W = 150, BOX_H = 40;
    const ARMOR = { armor: true };          // what a shot hits when something other than the boss stops it
    const GHOSTS = ['stars', 'poly', 'pipe', 'text'];
    // a colour from a screensaver's own list, never its green, which is the rings' colour
    const notGreen = (list, green) => { const i = Math.floor(rand(0, list.length - 1)); return i >= green ? i + 1 : i; };
    // a grid path for the 3D Pipes ghost: 6 to 11 cells, straight more often than not, never over itself
    function pipeWalk() {
      for (let tries = 0; tries < 20; tries++) {
        let c = Math.floor(rand(1, PCOLS - 1)), r = Math.floor(rand(3, PROWS - 3)), d = [[1, 0], [-1, 0], [0, 1], [0, -1]][Math.floor(rand(0, 4))];
        const seen = new Set([`${c},${r}`]), pts = [[c, r]];
        for (let i = 0; i < 10; i++) {
          const opts = [d, [d[1], -d[0]], [-d[1], d[0]]].filter(([dc, dr]) => c + dc >= 0 && c + dc < PCOLS && r + dr >= 1 && r + dr < PROWS - 1 && !seen.has(`${c + dc},${r + dr}`));
          if (!opts.length) break;
          d = opts[0] === d && Math.random() < 0.6 ? d : opts[Math.floor(rand(0, opts.length))];
          c += d[0]; r += d[1]; seen.add(`${c},${r}`); pts.push([c, r]);
        }
        if (pts.length >= 6) return pts;
      }
      return [[2, 5], [3, 5], [4, 5], [5, 5], [5, 6], [5, 7]];
    }
    // a burned-in ghost of one of the four screensavers already closed
    function ghost(kind) {
      const m = B.m;
      if (kind === 'stars') {
        // Starfield: lanes shown from a vanishing point well away from the cursor, then streaks down every lane
        let x = 0, y = 0;
        for (let i = 0; i < 8; i++) { x = rand(60, AW - 60); y = rand(50, 210); if (Math.hypot(x - P.x, y - P.y) > 170) break; }
        const base = rand(0, TAU), lanes = [];
        for (let k = 0; k < 7; k++) lanes.push(base + (k * TAU) / 7);
        tele.push({ lanes, x, y, t: 0.8, T: 0.8 });
        for (let k = 0; k < 14; k++) shoot(x, y, base + TAU / 14 + (k * TAU) / 14, 'star', 40, 40, 120, 3.6);
        m.ghosts.push({ kind, x, y, lanes, t: 0.8, n: 0, cd: 0 });
      } else if (kind === 'poly') {
        // Mystify: a four-sided outline that lights up as lasers, its corners spraying outward
        const cx = rand(100, AW - 100), cy = rand(110, AH - 110), r = rand(70, 120), base = rand(0, TAU), pts = [];
        for (let k = 0; k < 4; k++) { const a = base + (k * TAU) / 4 + rand(-0.35, 0.35); pts.push([clamp(cx + Math.cos(a) * r, 8, AW - 8), clamp(cy + Math.sin(a) * r, 8, AH - 8)]); }
        const segs = pts.map((p, k) => [p[0], p[1], pts[(k + 1) % 4][0], pts[(k + 1) % 4][1]]);
        m.ghosts.push({ kind, pts, segs, cx, cy, ci: notGreen(MCOL, 3), t: 0.8, on: 0 });
      } else if (kind === 'pipe') {
        // 3D Pipes: a pipe that fills in, then flushes both ways from every other cell
        m.ghosts.push({ kind, pts: pipeWalk(), ci: notGreen(PCOL, 2), t: 0.8, on: 0 });
      } else {
        // Marquee: one of its messages, burned in, comes down the screen scrolling sideways
        const ln = mqLine(s.marquee[Math.floor(rand(0, s.marquee.length))], -(MQ.cap + MQ.desc) - 40, Math.random() < 0.5 ? -1 : 1, 70, Math.floor(rand(0, MQCOL.length)));
        m.ghosts.push({ kind, ln });
      }
    }
    function ghostFire(gh) {
      if (gh.kind === 'pipe') { leak({ pts: gh.pts, ci: gh.ci }); sfx.flush(); return; }
      for (const p of gh.pts) { const a = Math.atan2(p[1] - gh.cy, p[0] - gh.cx); for (let k = 0; k < 5; k++) shoot(p[0], p[1], a + (k / 4 - 0.5) * 1.2, `m${gh.ci}`, 80, 90, 190, 3.6); }
      sfx.burn();
    }
    function drawGhost(gh, a) {
      if (gh.kind === 'stars') return;   // its lanes show as the telegraph, its streaks as bullets
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (gh.kind === 'text') {
        const ln = gh.ln, cap = MQ.cap, col = MQCOL[ln.ci];
        if (ln.y + cap + MQ.desc < 0) {
          ctx.globalAlpha = a * (0.45 + Math.sin(G.t * 10) * 0.25); ctx.setLineDash([4, 6]); ctx.strokeStyle = col; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.moveTo(0, 1.5); ctx.lineTo(AW, 1.5); ctx.stroke(); ctx.setLineDash([]);
          return;
        }
        ctx.font = MQ.font; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        for (const l of ln.letters) {
          const x = mqX(ln, l);
          if (x > AW || x + l.g.adv < 0) continue;
          // burned in: the letter's outline in its colour over a faint fill of the whole shape that hurts
          ctx.globalAlpha = a * 0.2; ctx.fillStyle = col; ctx.fillText(l.g.ch, x, ln.y + cap);
          ctx.globalAlpha = a; ctx.strokeStyle = col; ctx.lineWidth = 2; ctx.strokeText(l.g.ch, x, ln.y + cap);
        }
        return;
      }
      const warn = gh.t > 0, w = warn ? 1 - gh.t / 0.8 : 1;
      if (gh.kind === 'poly') {
        if (warn) { ctx.setLineDash([4, 6]); ctx.globalAlpha = a * (0.25 + w * 0.55); ctx.strokeStyle = MCOL[gh.ci]; ctx.lineWidth = 1 + w; poly(gh.pts); ctx.setLineDash([]); return; }
        ctx.globalAlpha = a * 0.3; ctx.strokeStyle = MCOL[gh.ci]; ctx.lineWidth = 8; poly(gh.pts);
        ctx.globalAlpha = a; ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 2.2; poly(gh.pts);
        return;
      }
      const pts = gh.pts.map(([c, r]) => [cellX(c), cellY(r)]), [r, g, b] = PRGB[gh.ci];
      if (warn) { ctx.setLineDash([4, 6]); ctx.globalAlpha = a * (0.25 + w * 0.55); ctx.strokeStyle = PCOL[gh.ci]; ctx.lineWidth = 2; pipePath(pts, 0); ctx.stroke(); ctx.setLineDash([]); return; }
      ctx.globalAlpha = a;
      pipePath(pts, 0); ctx.strokeStyle = `rgb(${(r * 0.42) | 0},${(g * 0.42) | 0},${(b * 0.42) | 0})`; ctx.lineWidth = PIPE_W; ctx.stroke();
      ctx.strokeStyle = PCOL[gh.ci]; ctx.lineWidth = PIPE_W - 4; ctx.stroke();
      pipePath(pts, -1.6); ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 2; ctx.stroke();
      const bs = sprites[`b${gh.ci}`];
      for (const [x, y] of [pts[0], pts[pts.length - 1]]) ctx.drawImage(bs.c, x - bs.R, y - bs.R, bs.R * 2, bs.R * 2);
    }
    // the portfolio CRT's own On-Screen Display (style.css .osd-box): navy, a Luna Inactive Blue line, a blue glow
    function drawBox(b, a) {
      ctx.globalAlpha = a;
      ctx.shadowColor = 'rgba(9,151,255,.35)'; ctx.shadowBlur = 16 * K;
      ctx.fillStyle = '#00138c'; ctx.fillRect(b.x, b.y, BOX_W, BOX_H);
      ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0;
      ctx.strokeStyle = '#7a96df'; ctx.lineWidth = 1; ctx.strokeRect(b.x + 0.5, b.y + 0.5, BOX_W - 1, BOX_H - 1);
      ctx.fillStyle = '#ffffff'; ctx.font = '700 14px "Noto Sans", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(s.noSignal, b.x + BOX_W / 2, b.y + BOX_H / 2 + 1, BOX_W - 24);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }
    // the Welcome screen (style.css .boot-screen): logon blue lit from the top left between two navy bands, a light
    // rule under the top band and the orange light over the foot; after it, runOver() hands over to boot.js (onReboot)
    function drawWelcome() {
      const band = 40;
      ctx.globalAlpha = 1;
      ctx.fillStyle = '#5a7edc'; ctx.fillRect(0, 0, AW, AH);
      const gr = ctx.createRadialGradient(0, band, 0, 0, band, AW * 0.9);
      gr.addColorStop(0, 'rgba(166,196,247,.8)'); gr.addColorStop(0.6, 'rgba(166,196,247,0)');
      ctx.fillStyle = gr; ctx.fillRect(0, band, AW, AH - band * 2);
      ctx.fillStyle = '#00309c'; ctx.fillRect(0, 0, AW, band); ctx.fillRect(0, AH - band, AW, band);
      let lg = ctx.createLinearGradient(0, 0, AW, 0);
      lg.addColorStop(0, 'rgba(166,196,247,0)'); lg.addColorStop(0.25, '#a6c4f7'); lg.addColorStop(0.6, 'rgba(166,196,247,.5)'); lg.addColorStop(1, 'rgba(166,196,247,0)');
      ctx.fillStyle = lg; ctx.fillRect(0, band, AW, 2);
      lg = ctx.createLinearGradient(0, 0, AW, 0);
      lg.addColorStop(0, 'rgba(232,148,58,0)'); lg.addColorStop(0.3, '#e8943a'); lg.addColorStop(0.7, '#e8943a'); lg.addColorStop(1, 'rgba(232,148,58,0)');
      ctx.fillStyle = lg; ctx.fillRect(0, AH - band - 2, AW, 2);
      ctx.fillStyle = '#ffffff'; ctx.font = '700 44px "Noto Sans", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('hello', AW / 2, AH / 2);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    }
    const BLANK = {
      id: 'blank', name: 'Blank.scr', hp: 600, target: 60, bg: 'none',
      init() {
        mqSetup();
        store.set('ssxp-met-blank', '1');
        B.x = AW / 2; B.y = 120;
        B.m = { tx: AW / 2, ty: 120, moveCd: 2.5, beatCd: 1.2, beat: 0, spin: rand(0, TAU), glow: 0, waves: [], box: { x: 24, y: 196, vx: 62, vy: 50, hx: -9, hy: -9 }, sleep: 0, sleepCd: 7, ghosts: [], ghostCd: 0.6, gi: 0 };
        sfx.off();
      },
      move(dt) {
        const m = B.m, live = isLive(), slow = G.mode === 'intro' ? 0.3 : 1;
        if (m.sleep > 0) m.sleep -= dt;
        const rate = m.sleep > 0 ? 2.6 : B.phase === 2 ? 1.4 : 0.9;
        B.x = damp(B.x, m.tx, rate, dt * slow); B.y = damp(B.y, m.ty, rate, dt * slow);
        m.glow = Math.max(0, m.glow - dt * 2.5);
        for (const w of m.waves) w.t += dt;
        m.waves = m.waves.filter((w) => w.t < 0.8);
        const b = m.box;
        if (!b) return;
        b.x += b.vx * dt * slow; b.y += b.vy * dt * slow;
        let hx = 0, hy = 0;
        if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); hx = 1; } else if (b.x > AW - BOX_W) { b.x = AW - BOX_W; b.vx = -Math.abs(b.vx); hx = -1; }
        if (b.y < 0) { b.y = 0; b.vy = Math.abs(b.vy); hy = 1; } else if (b.y > AH - BOX_H) { b.y = AH - BOX_H; b.vy = -Math.abs(b.vy); hy = -1; }
        if (!hx && !hy) return;
        if (hx) b.hx = G.t;
        if (hy) b.hy = G.t;
        if (!live) return;
        if (Math.abs(b.hx - b.hy) < 0.25) {
          // it went into a corner, as everyone watching one of these hoped it would
          for (let k = 0; k < 24; k++) shoot(b.x + BOX_W / 2, b.y + BOX_H / 2, (k * TAU) / 24, 'wBig', 60, 90, 200, 5.2);
          b.hx = b.hy = -9;
          chip(s.corner, '', 1.2); sfx.corner();
          return;
        }
        const x = hx ? (hx > 0 ? b.x : b.x + BOX_W) : b.x + BOX_W / 2, y = hy ? (hy > 0 ? b.y : b.y + BOX_H) : b.y + BOX_H / 2, a = Math.atan2(hy, hx);
        for (let k = 0; k < 5; k++) shoot(x, y, a + (k / 4 - 0.5) * 1.4, 'w', 70, 80, 170, 3.6);
      },
      attack(dt) {
        const m = B.m;
        if ((m.moveCd -= dt) <= 0) { m.moveCd = rand(2, 3.2); m.tx = rand(56, AW - 56); m.ty = B.phase === 2 ? rand(60, 220) : rand(70, 190); }
        // standby: the dot goes out and moves somewhere well away before it comes back
        if (B.phase === 1 && (m.sleepCd -= dt) <= 0) {
          m.sleepCd = 7.5; m.sleep = 1.8; m.moveCd = 2.4;
          for (let i = 0; i < 6; i++) { m.tx = rand(56, AW - 56); m.ty = rand(70, 190); if (Math.hypot(m.tx - B.x, m.ty - B.y) > 130) break; }
        }
        // the beat: a ring of bullets, every third one with a fan at the cursor
        if ((m.beatCd -= dt) <= 0) {
          m.beatCd += B.phase === 2 ? 1.35 : 1.1;
          m.beat += 1; m.glow = 1; m.spin += 0.13;
          if (m.sleep <= 0) m.waves.push({ t: 0 });
          sfx.beat();
          const n = B.phase === 2 ? 26 : 20, rot = m.spin + (m.beat % 2) * (Math.PI / n);
          for (let k = 0; k < n; k++) shoot(B.x, B.y, rot + (k * TAU) / n, 'w', 55, 90, 160, 3.6);
          if (m.beat % 3 === 0) { const a = aim(); for (let k = -1; k <= 1; k++) shoot(B.x, B.y, a + k * 0.15, 'wBig', 110, 130, 280, 5.2); }
        }
        if (B.phase !== 2) return;
        if ((m.ghostCd -= dt) <= 0) { m.ghostCd = 3.2; ghost(GHOSTS[m.gi % GHOSTS.length]); m.gi += 1; }
        for (const gh of m.ghosts) {
          if (gh.kind === 'stars') { if (gh.t > 0) gh.t -= dt; else if ((gh.cd -= dt) <= 0 && gh.n < 4) { gh.cd += 0.07; gh.n += 1; for (const a of gh.lanes) streak(a, 400, gh.x, gh.y); } }
          else if (gh.kind === 'text') { gh.ln.off += gh.ln.dir * gh.ln.sp * dt; gh.ln.y += 95 * dt; }
          else if (gh.t > 0) { if ((gh.t -= dt) <= 0) { gh.on = gh.kind === 'pipe' ? 1.4 : 1.1; ghostFire(gh); } }
          else gh.on -= dt;
        }
        m.ghosts = m.ghosts.filter((gh) => (gh.kind === 'stars' ? gh.n < 4 : gh.kind === 'text' ? gh.ln.y < AH + 8 : gh.t > 0 || gh.on > 0));
      },
      phase2() {
        const m = B.m;
        // the No signal box goes, and the screen starts to show what it remembers
        if (m.box) { spark(m.box.x + BOX_W / 2, m.box.y + BOX_H / 2, '#7a96df', 14); m.box = null; }
        Object.assign(m, { sleep: 0, ghostCd: 0.6, gi: 0, beatCd: 1.2 });
      },
      hitShot(o) {
        const b = B.m.box;
        if (b && o.x > b.x && o.x < b.x + BOX_W && o.y > b.y && o.y < b.y + BOX_H) return ARMOR;
        return Math.hypot(o.x - B.x, o.y - B.y) < CORE_R;
      },
      hazard(px, py) {
        const m = B.m, b = m.box;
        let d = Infinity;
        // solid shapes are measured from their surface, so a touch is the hotspot's own radius
        if (b) d = Math.hypot(Math.max(b.x - px, 0, px - b.x - BOX_W), Math.max(b.y - py, 0, py - b.y - BOX_H)) + LASER_R;
        for (const gh of m.ghosts) {
          if (gh.kind === 'poly' && gh.on > 0) for (const g of gh.segs) d = Math.min(d, segD(px, py, g[0], g[1], g[2], g[3]));
          else if (gh.kind === 'pipe' && gh.on > 0) {
            for (let i = 1; i < gh.pts.length; i++) d = Math.min(d, segD(px, py, cellX(gh.pts[i - 1][0]), cellY(gh.pts[i - 1][1]), cellX(gh.pts[i][0]), cellY(gh.pts[i][1])) - (PIPE_W / 2 - LASER_R));
          } else if (gh.kind === 'text') {
            const ln = gh.ln;
            if (py < ln.y - MQ_PAD || py > ln.y + MQ.cap + MQ.desc + MQ_PAD) continue;
            for (const l of ln.letters) { const x = mqX(ln, l); if (px >= x - MQ_PAD && px <= x + l.g.adv + MQ_PAD) d = Math.min(d, inkDist(l.g, x, ln.y, px, py) + LASER_R); }
          }
        }
        return d;
      },
      tipAt() { return { x: B.x, y: B.y, below: DOT_R + 8 }; },
      stop() { B.m.ghosts = []; B.m.sleep = 0; },
      onDown() { sfx.on(); },
      draw() {
        const m = B.m;
        if (!m) return;
        // beaten, the tube switches on again: the dot, then a line, then the picture opening to the Welcome screen
        if (B.dying) {
          const k = reduceMotion ? 1 : B.dieK, x = B.x, y = B.y;
          if (k < 0.3) {
            const e = k / 0.3, g = sprites.glow, R = g.R * (0.6 + e);
            ctx.globalAlpha = 0.6; ctx.drawImage(g.c, x - R, y - R, R * 2, R * 2);
            ctx.globalAlpha = 1; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 2.6 + e * 4, 0, TAU); ctx.fill();
          } else if (k < 0.55) {
            const e = ((k - 0.3) / 0.25) ** 2;
            ctx.globalAlpha = 1; ctx.fillStyle = '#e6ecfb'; ctx.fillRect(lerp(x, 0, e), y - 1.5, lerp(0, AW, e) + 6, 3);
          } else {
            const e = 1 - (1 - (k - 0.55) / 0.45) ** 2, top = lerp(y, 0, e), bot = lerp(y, AH, e);
            ctx.save(); ctx.beginPath(); ctx.rect(0, top - 1.5, AW, bot - top + 3); ctx.clip(); drawWelcome(); ctx.restore();
          }
          ctx.globalAlpha = 1;
          return;
        }
        const a = B.alpha, intro = G.mode === 'intro' && !reduceMotion ? G.introT : 9;
        // the picture folds into a line, then the line into the dot, as a tube switching off
        if (intro < 1) {
          if (intro < 0.5) { const e = intro / 0.5, h = lerp(AH, 2, e * e); ctx.globalAlpha = 0.22 + e * 0.13; ctx.fillStyle = '#c8d2ea'; ctx.fillRect(0, B.y - h / 2, AW, h); }
          else { const e = ((intro - 0.5) / 0.5) ** 2; ctx.globalAlpha = 0.8 - e * 0.4; ctx.fillStyle = '#e6ecfb'; ctx.fillRect(lerp(0, B.x, e), B.y - 1, lerp(AW, 0, e) + 3, 2); }
        }
        for (const gh of m.ghosts) drawGhost(gh, a);
        if (m.box) drawBox(m.box, a);
        const vis = (m.sleep > 0 ? clamp(Math.max(m.sleep - 1.5, 0.3 - m.sleep) / 0.3, 0, 1) : 1) * clamp((intro - 0.85) / 0.4, 0, 1);
        if (vis > 0) {
          ctx.strokeStyle = '#c8d2ea'; ctx.lineWidth = 1;
          for (const w of m.waves) { const k = w.t / 0.8; ctx.globalAlpha = a * vis * (1 - k) * 0.4; ctx.beginPath(); ctx.arc(B.x, B.y, 10 + k * 56, 0, TAU); ctx.stroke(); }
          const g = sprites.glow, R = g.R * (0.45 + m.glow * 0.4);
          ctx.globalAlpha = a * vis * (0.3 + m.glow * 0.45); ctx.drawImage(g.c, B.x - R, B.y - R, R * 2, R * 2);
          ctx.globalAlpha = a * vis; ctx.fillStyle = B.flash > 0 ? '#9fd0ff' : '#ffffff';
          ctx.beginPath(); ctx.arc(B.x, B.y, 2.6 + m.glow * 1.2, 0, TAU); ctx.fill();
          healthRing(B.x, B.y, DOT_R, 3);
        }
        ctx.globalAlpha = 1;
      },
    };
    /* ------------------------------------------------------------ practice: three short lessons on XP Setup's blue
       As in Boss Rush XP: one lesson at a time, each finished by one thing done in the game, shown in a box at the top
       of the arena with a Skip key (Enter at a desk). The sparring partner is a little monitor playing a preview; it
       never goes down, and nothing costs health here. */
    const LESSONS = ['move', 'aim', 'dodge'];
    const MOVE_NEED = 700, DODGE_NEED = 8;
    function rrect(x, y, w, h, r) {
      ctx.beginPath(); ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    }
    const PRACTICE = {
      id: 'practice', get name() { return s.practice; }, hp: 30, target: 0, bg: 'none',
      init() { B.x = AW / 2; B.y = 160; B.m = { t: 0, cd: 0.6, rot: 0, stars: Array.from({ length: 14 }, () => ({ a: rand(0, TAU), d: rand(0, 26), v: rand(0.6, 1.3) })) }; },
      move(dt) {
        const m = B.m, pr = G.practice;
        m.t += dt;
        for (const st of m.stars) { st.d += (4 + st.d * 1.2) * st.v * dt; if (st.d > 30) { st.d = rand(0, 4); st.a = rand(0, TAU); } }
        if (!pr) return;
        // it holds still for the first lesson, then drifts from side to side under the lesson's box
        const id = LESSONS[Math.min(pr.step, LESSONS.length - 1)];
        B.x = damp(B.x, id === 'move' ? AW / 2 : AW / 2 + Math.sin(m.t * 0.8) * 100, 2, dt);
        B.y = damp(B.y, pr.top + 64, 4, dt);
      },
      attack(dt) {
        const m = B.m, pr = G.practice;
        if (!pr || pr.good > 0 || (m.cd -= dt) > 0) return;
        const id = LESSONS[pr.step], x = B.x, y = B.y + 8;
        if (id === 'dodge') { m.cd = 0.9; const a = Math.atan2(P.y - y, P.x - x); for (let k = -1; k <= 1; k++) shoot(x, y, a + k * 0.22, 'q3', 90, 80, 170, 3.6); }
        else m.cd = 0.3;
      },
      phase2() {},
      hitShot(o) { return Math.abs(o.x - B.x) < 34 && Math.abs(o.y - B.y) < 30; },
      hazard() { return Infinity; },
      tipAt() { return { x: B.x, y: B.y, below: 50 }; },
      // Setup's blue in the welcome screen's colours, and the monitor drawn like the portfolio's own CRT
      draw() {
        const m = B.m, x = B.x, y = B.y;
        if (!m) return;
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#5a7edc'; ctx.fillRect(0, 0, AW, AH);
        const gr = ctx.createRadialGradient(0, 0, 0, 0, 0, AW * 1.1);
        gr.addColorStop(0, 'rgba(166,196,247,.8)'); gr.addColorStop(0.6, 'rgba(166,196,247,0)');
        ctx.fillStyle = gr; ctx.fillRect(0, 0, AW, AH);
        ctx.fillStyle = '#aca899'; ctx.fillRect(x - 10, y + 27, 20, 7); ctx.fillRect(x - 22, y + 33, 44, 5);
        ctx.fillStyle = '#ece9d8'; rrect(x - 34, y - 29, 68, 58, 6); ctx.fill();
        ctx.strokeStyle = '#aca899'; ctx.lineWidth = 1; rrect(x - 33.5, y - 28.5, 67, 57, 6); ctx.stroke();
        ctx.fillStyle = '#1b1d22'; rrect(x - 27, y - 23, 54, 40, 3); ctx.fill();
        // on its screen, a small Starfield preview
        ctx.save(); ctx.beginPath(); ctx.rect(x - 26, y - 22, 52, 38); ctx.clip();
        ctx.fillStyle = '#d6e2f8';
        for (const st of m.stars) { const z = 0.6 + st.d / 30; ctx.globalAlpha = 0.3 + st.d / 40; ctx.fillRect(x + Math.cos(st.a) * st.d - z / 2, y - 3 + Math.sin(st.a) * st.d * 0.8 - z / 2, z, z); }
        ctx.restore();
        ctx.globalAlpha = 1;
        // its ring is what the aiming lesson empties; once that is done it has nothing left to shoot
        if (B.hp > 0) healthRing(x, y, 46, 3);
      },
    };
    const BOSSES = [STARFIELD, MYSTIFY, PIPES, MARQUEE, BLANK];
    // the boss's health as a green ring: whatever wears one is what to shoot
    function healthRing(x, y, r, w, frac = Math.max(0, B.hp) / B.max) {
      ctx.lineWidth = w; ctx.lineCap = 'butt';
      ctx.strokeStyle = 'rgba(255,255,255,.14)'; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
      if (frac > 0) { ctx.strokeStyle = '#4cda50'; ctx.beginPath(); ctx.arc(x, y, r, -Math.PI / 2, -Math.PI / 2 + frac * TAU); ctx.stroke(); }
      ctx.lineCap = 'round';
    }

    /* ------------------------------------------------------------ update */
    function update(dt) {
      G.t += dt;
      stepStars(dt);
      G.warp = damp(G.warp, B.on && B.def === STARFIELD && B.phase === 2 && !B.dying ? 1 : 0, 2.5, dt);
      if (G.shake > 0) G.shake = Math.max(0, G.shake - dt * 24);
      stepPlayer(dt);
      stepBoss(dt);
      stepBullets(dt);
      stepHazard();
      stepShots(dt);
      stepSparks(dt);
      for (let i = tele.length - 1; i >= 0; i--) if ((tele[i].t -= dt) <= 0) tele.splice(i, 1);
      if (G.mode === 'intro') { if ((G.introT += dt) >= G.introLen) { G.mode = 'fight'; if (tipsOn) showTips(false); } }
      else if (G.mode === 'fight') { if (G.practice) stepPractice(dt); else G.fightTime += dt; }
      else if (G.mode === 'won') { if ((G.endT -= dt) <= 0) { if (G.bossIdx < BOSSES.length - 1) { G.bossIdx += 1; beginBoss(false); } else runOver(); } }
      else if (G.mode === 'dead') { if ((G.endT -= dt) <= 0) showDead(); }
      else if (G.mode === 'demo') stepDemo(dt);
    }
    function stepStars(dt) {
      const w = G.warp;
      for (const st of stars) {
        st.d += (14 + st.d * (0.9 + w * 2.2)) * st.v * dt;
        if (st.d > 560) { st.d = rand(1, 24); st.a = rand(0, TAU); st.v = rand(0.6, 1.3); }
      }
    }
    function stepPlayer(dt) {
      const px = P.x;
      if (G.mode === 'demo') demoPilot();
      if (G.mode === 'intro' || G.mode === 'fight' || G.mode === 'won' || G.mode === 'demo') {
        let kx = 0, ky = 0;
        for (const c of keys) { const m = MOVE[c]; if (m) { kx += m[0]; ky += m[1]; } }
        if (kx || ky) {
          const n = Math.hypot(kx, ky), sp = keys.has('Shift') ? KEY_SLOW : KEY_SPEED;
          P.x = clamp(P.x + (kx / n) * sp * dt, X_MIN, X_MAX);
          P.y = clamp(P.y + (ky / n) * sp * dt, yTop(), Y_MAX);
          P.tx = P.x; P.ty = P.y;
        } else {
          // mouse and finger set a target; the cursor chases it, no faster than MAX_SPEED
          const dx = P.tx - P.x, dy = P.ty - P.y, d = Math.hypot(dx, dy), m = MAX_SPEED * dt;
          if (d <= m) { P.x = P.tx; P.y = P.ty; } else { P.x += (dx / d) * m; P.y += (dy / d) * m; }
        }
      }
      P.lean = damp(P.lean, dt ? clamp((P.x - px) / dt / MAX_SPEED, -1, 1) : 0, 12, dt);
      if (P.inv > 0) P.inv -= dt;
      if (P.knock > 0) P.knock = Math.max(0, P.knock - dt / 0.8);
      if (P.duck > 0) P.duck = Math.max(0, P.duck - dt);
      if (P.press > 0) P.press = Math.max(0, P.press - dt);
      if (P.cheer > 0) P.cheer -= dt;
      if (G.mode === 'dead') P.fall += dt;
      if (G.mode !== 'fight' && G.mode !== 'demo') return;
      // clean play brings a block back
      if (G.mode === 'fight' && P.hp < HP_MAX && P.inv <= 0 && (P.clean += dt) >= REFILL_TIME) { P.hp += 1; P.clean = 0; sfx.heal(); }
      // the cursor fires on its own, from either side of the tip
      if (!B.dying && (P.shotCd -= dt) <= 0) { P.shotCd += SHOT_EVERY; shots.push({ x: P.x - 1.5, y: P.y - 3 }, { x: P.x + 6, y: P.y + 1 }); }
    }
    function stepBoss(dt) {
      if (!B.on) return;
      B.t += dt;
      if (B.flash > 0) B.flash -= dt;
      if (B.dying) { B.dieK = Math.min(1, B.dieK + dt / 1.6); B.alpha = 1 - B.dieK; return; }
      B.alpha = Math.min(1, B.alpha + dt / 1.2);
      if (B.inv > 0) B.inv -= dt;
      B.def.move(dt);
      if (B.pause > 0) { B.pause -= dt; return; }
      if (G.mode === 'fight' || G.mode === 'demo') B.def.attack(dt);
    }
    function stepBullets(dt) {
      const live = G.mode === 'fight';
      for (let i = bullets.length - 1; i >= 0; i--) {
        const b = bullets[i];
        if (!b) continue;
        if (b.mode === 'debris') {
          b.sp += 700 * dt; b.x += b.dx * b.sp * dt; b.y += b.dy * b.sp * dt; b.fade -= dt * 1.6;
          if (b.fade <= 0 || out(b)) drop(i);
          continue;
        }
        if (b.acc) b.sp = Math.min(b.vmax, b.sp + b.acc * dt);
        const d = b.sp * dt;
        b.x += b.dx * d; b.y += b.dy * d; b.dist += d;
        b.grow = 0.85 + Math.min(1, b.dist / 260) * 0.3;
        if (out(b)) { drop(i); continue; }
        if (!live) continue;
        const dist = b.kind === 'streak' ? segDist(P.x, P.y, b) : Math.hypot(b.x - P.x, b.y - P.y);
        if (dist < b.r + HIT_R && P.inv <= 0) hurt();
      }
    }
    // what the boss is made of (lasers, pipes, letters, the No signal box): a touch hurts
    function stepHazard() {
      if (G.mode !== 'fight' || !B.on || B.dying) return;
      if (B.def.hazard(P.x, P.y) < LASER_R + HIT_R && P.inv <= 0) hurt();
    }
    function stepShots(dt) {
      for (let i = shots.length - 1; i >= 0; i--) {
        const o = shots[i];
        if (!o) continue;
        o.y -= SHOT_SPEED * dt;
        if (o.y < -12) { shots[i] = shots[shots.length - 1]; shots.pop(); continue; }
        const tgt = B.on && !B.dying ? B.def.hitShot(o) : null;
        if (tgt) {
          shots[i] = shots[shots.length - 1]; shots.pop();
          // the demo's shots land, but only as sparks
          if (G.mode === 'demo') { if (Math.random() < 0.6) spark(o.x, o.y + 3, '#9fd0ff', 1); continue; }
          // a grey spark: the boss can't be hurt yet, or the shot hit armour (a Marquee letter without a ring)
          if (G.mode !== 'fight' || B.inv > 0 || tgt.armor) { spark(o.x, o.y + 3, '#8a8f9c', 1); continue; }
          if (Math.random() < 0.6) spark(o.x, o.y + 3, '#9fd0ff', 1);
          if (B.def.onHit) B.def.onHit(tgt);
          damage(1);
        }
      }
    }
    function spark(x, y, c, n) {
      for (let i = 0; i < n; i++) {
        if (sparks.length > 300) sparks.shift();
        const a = rand(0, TAU), v = rand(30, 110);
        sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: rand(0.18, 0.4), c, z: rand(1, 2.2) });
      }
    }
    function stepSparks(dt) {
      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        if ((p.life -= dt) <= 0) { sparks.splice(i, 1); continue; }
        p.x += p.vx * dt; p.y += p.vy * dt; p.vx *= 0.92; p.vy *= 0.92;
      }
    }

    /* ------------------------------------------------------------ what happens in a fight */
    function hurt() {
      if (G.practice) { practiceHit(); return; }
      P.hp -= 1; G.hits += 1;
      P.inv = INV_TIME; P.clean = 0; P.knock = 1;
      G.shake = reduceMotion ? 0 : 5;
      sfx.hit();
      // mercy: the stars around the hotspot go out, so one mistake is one hit, not three
      for (const b of bullets) if (!b.mode && Math.hypot(b.x - P.x, b.y - P.y) < CANCEL_R) { b.mode = 'debris'; b.fade = 0.25; }
      spark(P.x, P.y, '#ff3b30', 6);
      const blk = hpBlocks[Math.max(0, P.hp)];
      if (blk) { blk.classList.remove('lost'); void blk.offsetWidth; blk.classList.add('lost'); }
      if (P.hp <= 0) lose();
    }
    function debrisAll() { for (const b of bullets) { b.mode = 'debris'; b.fade = 0.8; } }
    function damage(n) {
      if (!B.on || B.dying || B.inv > 0) return;
      // the practice monitor never goes down: its ring only counts the aiming lesson
      if (G.practice) { if (LESSONS[G.practice.step] === 'aim' && !G.practice.good) { B.hp = Math.max(0, B.hp - n); B.flash = 0.05; if (B.hp <= 0) lessonDone(); } return; }
      B.hp -= n; B.flash = 0.05;
      if (B.phase === 1 && B.hp <= B.max / 2) { B.hp = B.max / 2; enterPhase2(); }
      else if (B.hp <= 0) bossDown();
    }
    function enterPhase2() {
      Object.assign(B, { phase: 2, inv: 2, pause: 2, pi: 0, p: null, p2At: G.fightTime - G.bossT0 });
      B.def.phase2();
      debrisAll(); tele.length = 0;
      G.shake = reduceMotion ? 0 : 4;
      chip(s.phase2[B.def.id], '', 1.6); sfx.phase(); sfx.musicLevel(2);
    }
    function bossDown() {
      B.hp = 0; B.dying = true; B.dieK = 0;
      G.mode = 'won'; G.endT = 2;
      sfx.music(null);
      G.splits.push({ id: B.def.id, time: +(G.fightTime - G.bossT0).toFixed(1), hits: G.hits - G.bossH0, phase2At: B.p2At == null ? null : +B.p2At.toFixed(1) });
      debrisAll(); tele.length = 0; shots.length = 0;
      P.cheer = 2.4; G.shake = reduceMotion ? 0 : 4;
      chip(s.closed(B.def.name), 'big', 1.9); sfx.win();
      if (B.def.onDown) B.def.onDown();
    }
    function lose() {
      G.mode = 'dead'; G.deaths += 1; G.endT = 1.1; P.fall = 0;
      debrisAll(); tele.length = 0; shots.length = 0;
      if (B.def.stop) B.def.stop();
      sfx.down(); sfx.music(null);
    }
    /* ------------------------------------------------------------ drawing */
    function render() {
      if (!sprites || tooSmall) return;
      const sh = G.shake, sx = sh ? rand(-sh, sh) : 0, sy = sh ? rand(-sh, sh) : 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.setTransform(K, 0, 0, K, sx * K, sy * K);
      if (!B.on || B.def.bg === 'stars') drawStars();
      drawTele();
      if (B.on) B.def.draw();
      drawBullets(); drawShots(); drawSparks(); drawPlayer();
      if (G.debug) { ctx.setTransform(K, 0, 0, K, 0, 0); drawDebug(); }
    }
    // the screensaver itself: dim stars streaming out of the vanishing point, streaks once it warps
    function drawStars() {
      const o = B.on ? B : VP, w = G.warp;
      ctx.fillStyle = '#d6e2f8'; ctx.strokeStyle = '#d6e2f8'; ctx.lineCap = 'round';
      for (const st of stars) {
        const c = Math.cos(st.a), n = Math.sin(st.a), x = o.x + c * st.d, y = o.y + n * st.d;
        if (x < -4 || x > AW + 4 || y < -4 || y > AH + 4) continue;
        const k = Math.min(1, st.d / 260);
        ctx.globalAlpha = 0.12 + k * 0.45;
        if (w > 0.05) { const L = st.d * 0.12 * w + 1; ctx.lineWidth = 0.6 + k * 1.2; ctx.beginPath(); ctx.moveTo(x - c * L, y - n * L); ctx.lineTo(x, y); ctx.stroke(); }
        else { const z = 0.6 + k * 1.6; ctx.fillRect(x - z / 2, y - z / 2, z, z); }
      }
      ctx.globalAlpha = 1;
    }
    function drawTele() {
      if (!tele.length) return;
      ctx.setLineDash([6, 6]);
      for (const tl of tele) {
        const k = 1 - tl.t / tl.T;
        ctx.strokeStyle = `rgba(159,208,255,${(0.15 + k * 0.4).toFixed(2)})`; ctx.lineWidth = 1 + k;
        ctx.beginPath();
        for (const a of tl.lanes) { ctx.moveTo(tl.x + Math.cos(a) * 14, tl.y + Math.sin(a) * 14); ctx.lineTo(tl.x + Math.cos(a) * 700, tl.y + Math.sin(a) * 700); }
        ctx.stroke();
      }
      ctx.setLineDash([]);
    }
    function drawBullets() {
      let streaks = false;
      for (const b of bullets) {
        if (b.kind === 'streak') { streaks = true; continue; }
        const sp = sprites[b.kind];
        const R = sp.R * b.grow;
        ctx.globalAlpha = b.mode === 'debris' ? Math.max(0, b.fade) : 1;
        ctx.drawImage(sp.c, b.x - R, b.y - R, R * 2, R * 2);
      }
      ctx.globalAlpha = 1;
      if (!streaks) return;
      ctx.lineCap = 'round';
      for (const [color, width] of [['rgba(159,208,255,.45)', 5.5], ['#ffffff', 2.2]]) {
        ctx.strokeStyle = color; ctx.lineWidth = width;
        ctx.beginPath();
        for (const b of bullets) {
          if (b.kind !== 'streak') continue;
          ctx.moveTo(b.x - b.dx * b.len, b.y - b.dy * b.len); ctx.lineTo(b.x, b.y);
        }
        ctx.stroke();
      }
    }
    function drawShots() {
      ctx.fillStyle = 'rgba(224,240,255,.95)';
      for (const o of shots) ctx.fillRect(o.x - 1.2, o.y - 6, 2.4, 12);
    }
    function drawSparks() {
      for (const p of sparks) { ctx.globalAlpha = Math.min(1, p.life / 0.4); ctx.fillStyle = p.c; ctx.fillRect(p.x - p.z / 2, p.y - p.z / 2, p.z, p.z); }
      ctx.globalAlpha = 1;
    }
    function drawPlayer() {
      const x = P.x, y = P.y, dark = B.on && B.def === BLANK && !B.dying;
      ctx.save();
      if ((P.inv > 0 && G.mode === 'fight') || G.mode === 'dead') ctx.globalAlpha = 0.45;
      drawArrow(x, y, dark);
      drawRider(x, y);
      ctx.restore();
      // on Blank's dark screen the arrow goes unlit and only the hotspot glows
      if (dark) { const g = sprites.glow, R = 13; ctx.globalAlpha = 0.55; ctx.drawImage(g.c, x - R, y - R, R * 2, R * 2); ctx.globalAlpha = 1; }
      // the hotspot: the one point that can be hit, drawn over everything
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x, y, 2.1, 0, TAU); ctx.fill();
      ctx.strokeStyle = '#ff3b30'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(x, y, 3.3, 0, TAU); ctx.stroke();
    }
    // the XP arrow pointer, tip at the hotspot
    const ARROW = [[0, 0], [0, 17], [4, 13.2], [6.9, 19.6], [9.5, 18.5], [6.7, 12.3], [12, 12.3]];
    function drawArrow(x, y, dark, c = ctx) {
      c.beginPath();
      ARROW.forEach(([ax, ay], i) => { if (i) c.lineTo(x + ax * 1.15, y + ay * 1.15); else c.moveTo(x, y); });
      c.closePath();
      c.fillStyle = dark ? '#2b2f38' : '#fff'; c.fill();
      c.lineJoin = 'miter'; c.lineWidth = 1.2; c.strokeStyle = dark ? '#8b93a6' : '#000'; c.stroke();
    }
    // a two-bone limb from a to b: the middle joint bent to one side, the far end kept at the bone's length
    function joint(ax, ay, bx, by, l1, l2, bend) {
      const dx = bx - ax, dy = by - ay, d = Math.max(0.001, Math.min(Math.hypot(dx, dy), l1 + l2 - 0.001));
      const a = Math.atan2(dy, dx), c = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1), o = a + Math.acos(c) * bend;
      const jx = ax + Math.cos(o) * l1, jy = ay + Math.sin(o) * l1, ex = bx - jx, ey = by - jy, e = Math.hypot(ex, ey) || 1;
      return [jx, jy, jx + (ex / e) * l2, jy + (ey / e) * l2];
    }
    // the stickman from Boss Rush XP and the taskbar, surfing the arrow's back and facing its tip; the share card draws him
    // on its own canvas (c), cheering and still (card)
    function drawRider(x, y, c = ctx, card = false) {
      const t = card || reduceMotion ? 0 : G.t, lean = card ? 0 : P.lean;
      const duck = !card && P.duck > 0 ? Math.sin((P.duck / 0.18) * Math.PI) : 0;
      const cheer = card || (P.cheer > 0 && G.mode !== 'dead'), press = !card && P.press > 0;
      const hop = cheer && !reduceMotion ? Math.abs(Math.sin(t * 9)) * 2.4 : 0;
      const bob = Math.sin(t * 3.2) * 0.35;
      // his feet on the edge that runs from the tip down to the tail
      const fF = [5.4, 5.6 - hop], bF = [11.4, 11.8 - hop];
      const hip = [9.6 + lean * 1.2, 1.4 + duck * 1.8 + bob - hop];
      const neck = [hip[0] - 1.1 + lean * 2.6, hip[1] - 8.4 + duck * 2.4];
      const head = [neck[0] - 1.1, neck[1] - 3.7], sh = [neck[0], neck[1] + 1.3];
      let hF, hB;
      if (cheer) { hF = [sh[0] - 2.6, sh[1] - 7.4]; hB = [sh[0] + 2.8, sh[1] - 7.2]; }
      else if (press) { hF = [sh[0] - 7.4, sh[1] - 3.4]; hB = [sh[0] + 4.6, sh[1] + 3.4]; }
      else { hF = [sh[0] - 5.2, sh[1] - 2.6 - duck * 1.2 + Math.sin(t * 2.4) * 0.4]; hB = [sh[0] + 5.2, sh[1] + 2.6 + Math.sin(t * 2.4 + 1) * 0.4]; }
      const legF = joint(hip[0], hip[1], fF[0], fF[1], 6, 6, 1), legB = joint(hip[0], hip[1], bF[0], bF[1], 6, 6, 1);
      const armF = joint(sh[0], sh[1], hF[0], hF[1], 4.4, 4.4, -1), armB = joint(sh[0], sh[1], hB[0], hB[1], 4.4, 4.4, 1);
      // a hit tips him back off the arrow and he climbs on again; when the cursor stops responding he falls away
      let rot = 0, ox = 0, oy = 0;
      if (card) { /* standing tall */ }
      else if (G.mode === 'dead') { rot = Math.min(2.4, P.fall * 3); ox = P.fall * 20; oy = P.fall * P.fall * 260; }
      else if (P.knock > 0) { const k = Math.sin(P.knock * Math.PI); rot = 0.9 * k; oy = -2.5 * k; }
      c.save();
      c.translate(x + bF[0], y + bF[1]); c.rotate(rot); c.translate(-bF[0] + ox, -bF[1] + oy);
      const parts = [[...sh, ...armB], [...hip, ...legB], [...hip, ...neck], [...hip, ...legF], [...sh, ...armF]];
      const seg = (p) => { c.beginPath(); c.moveTo(p[0], p[1]); for (let i = 2; i < p.length; i += 2) c.lineTo(p[i], p[i + 1]); c.stroke(); };
      const ball = (bx, by, r) => { c.beginPath(); c.arc(bx, by, r, 0, TAU); c.fill(); };
      c.lineCap = 'round'; c.lineJoin = 'round';
      // a white halo keeps him readable on the night sky, as on the portfolio's taskbar
      c.strokeStyle = 'rgba(255,255,255,.92)'; c.lineWidth = 3.8; parts.forEach(seg);
      c.fillStyle = 'rgba(255,255,255,.92)'; ball(head[0], head[1], 4.5);
      c.lineWidth = 1.9;
      c.strokeStyle = '#4a4a4a'; seg(parts[0]); seg(parts[1]);
      c.strokeStyle = '#111'; seg(parts[2]); seg(parts[3]); seg(parts[4]);
      c.fillStyle = '#111'; ball(head[0], head[1], 3.1);
      // the red headband, its tails streaming back
      const hy = head[1] - 1.2, fl = card ? 1.4 : 0.8 + Math.abs(lean) * 0.8;
      c.strokeStyle = '#e0301e'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(head[0] - 3, hy); c.lineTo(head[0] + 3, hy); c.stroke();
      c.beginPath(); c.moveTo(head[0] + 2.6, hy); c.lineTo(head[0] + 5.4, hy + 1 + Math.sin(t * 9) * fl); c.lineTo(head[0] + 8.2, hy + 2.2 + Math.sin(t * 9 + 1.3) * fl * 1.3); c.stroke();
      // one eye, on the side he faces
      c.fillStyle = '#fff'; c.beginPath(); c.ellipse(head[0] - 1.5, head[1] - 0.3, 0.6, 0.9, 0, 0, TAU); c.fill();
      c.restore();
    }
    function drawDebug() {
      ctx.font = '10px "Noto Sans", sans-serif'; ctx.textBaseline = 'top';
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(2, 2, 236, 27);
      ctx.fillStyle = '#9fe6a0';
      ctx.fillText(`fps ${Math.round(fpsE)}  bullets ${bullets.length}  scale ${S.toFixed(2)}  dpr ${DPR}`, 6, 5);
      ctx.fillText(`${lay}  ${input}  ${B.on ? B.def.id : '-'} ${Math.max(0, B.hp)}/${B.max}  t ${G.fightTime.toFixed(1)}`, 6, 16);
    }

    /* ------------------------------------------------------------ HUD, the device's keys, pointers and callouts */
    const last = {};
    function put(key, v, fn) { if (last[key] !== v) { last[key] = v; fn(v); } }
    // how many dots the boss's bar has room for, measured again whenever the screen or the boss's name changes
    let barDots = 0;
    // on a short screen the first fight's two pointers can overlap: then they take turns, the boss's first
    let tipsTurn = false;
    function hudSync() {
      put('bname', G.practice ? s.practice : B.on ? B.def.name : BOSSES[G.startIdx].name, (v) => { bossName.textContent = v; cv.setAttribute('aria-label', s.arena(v)); barDots = 0; });
      put('clen', fmt(Math.floor(G.fightTime)).length, () => { barDots = 0; });
      if (!barDots) { barDots = Math.max(1, Math.floor(bossBar.clientWidth / 4)); delete last.boss; }
      const pr = G.practice, frac = pr ? lessonProgress() : B.on ? Math.max(0, B.hp) / B.max : 1;
      put('boss', Math.round(frac * barDots) * 1000 + barDots, () => {
        bossFill.style.width = `${Math.round(frac * barDots) * 4}px`;
        bossBar.setAttribute('aria-valuenow', String(Math.round(frac * 100)));
      });
      put('phase', pr ? `p:${pr.step}` : B.on ? `${B.def.id}:${B.phase}` : '', () => {
        bossBar.setAttribute('aria-label', pr ? `${s.practice}, ${s.lesStep(Math.min(pr.step, LESSONS.length - 1) + 1, LESSONS.length)}` : B.on ? `${B.def.name}, ${s.phase(B.phase)}` : '');
      });
      put('tick', !!pr, (v) => { bossTick.hidden = v; });
      const fill = Math.floor((P.clean / REFILL_TIME) * 20);
      put('hp', P.hp * 100 + fill, () => {
        hpBlocks.forEach((blk, i) => { blk.classList.toggle('on', i < P.hp); blk.firstElementChild.style.height = i === P.hp && P.hp < HP_MAX ? `${fill * 5}%` : '0'; });
        hpEl.setAttribute('aria-label', `${s.hp}: ${P.hp} / ${HP_MAX}`);
      });
      put('mode', G.mode, (v) => { stage.classList.toggle('fight', v === 'fight' || v === 'intro'); stage.classList.toggle('demo', v === 'demo'); });
      put('blank', B.on && B.def === BLANK && !B.dying && (G.mode === 'intro' || G.mode === 'fight' || G.mode === 'dead'), (v) => { stage.classList.toggle('blank', v); });
      put('clock', Math.floor(G.fightTime), (v) => { clockVal.textContent = fmt(v); clockVal.setAttribute('aria-label', `${s.clock} ${fmt(v)}`); });
      // the practice has no clock: nothing is timed there
      put('drill', !!G.practice, (v) => { clockVal.hidden = v; });
      put('keys', `${sfx.muted}:${goState()}`, () => { if (opts.onKeys) opts.onKeys({ muted: sfx.muted, go: goState() }); });
      if (tipsOn) {
        placeTips();
        if (tipsTurn) { const late = G.introT > G.introLen / 2; put('turn', late, () => { tipCore.classList.toggle('on', !late); tipCur.classList.toggle('on', late); }); }
      }
    }
    // what the device's orange key does now, for its name: start from the menu, pause or resume a fight, or take the
    // default choice of the screen showing
    function goState() {
      if (tooSmall) return 'none';
      const d = G.dlg;
      if (d && d.kind === 'pause') return 'resume';
      if (d && !d.front && d.def) return 'ok';
      if (G.mode === 'demo') return 'start';
      if ((G.mode === 'fight' || G.mode === 'intro') && !G.paused) return 'pause';
      return 'none';
    }
    function primary() {
      const g = goState(), d = G.dlg;
      if (g === 'resume') resume();
      else if (g === 'ok') d.def.run(layer.querySelector('.menu button.sel'));
      else if (g === 'start') go(false);
      else if (g === 'pause') pause();
    }
    // the first meeting with a boss points at what to shoot; the very first also points at the hotspot
    function showTips(on, withCursor) {
      tipsOn = on;
      if (on) {
        tipCore.innerHTML = `<b>${esc(B.def.name)}</b>${esc(s.tips[B.def.id])}`;
        tipCur.textContent = coarse.matches ? s.tipCursorTouch : s.tipCursor;
        tipCur.hidden = !withCursor;
        placeTips();
        const a = tipCore.getBoundingClientRect(), c = tipCur.getBoundingClientRect();
        tipsTurn = withCursor && !(a.bottom + 8 <= c.top || c.bottom + 8 <= a.top || a.right <= c.left || c.right <= a.left);
        if (tipsTurn) { G.introLen += 1.4; B.pause += 1.4; }
      }
      tipCore.classList.toggle('on', on); tipCur.classList.toggle('on', on && !tipsTurn);
    }
    // the boss's box hangs under what to shoot, pointing up; the tip's sits above and to the left, clear of the rider
    function placeTips() {
      const aw = AW * S, at = B.def.tipAt();
      let w = tipCore.offsetWidth, tx = at.x * S, left = clamp(tx - 28, 8, aw - w - 8);
      tipCore.style.transform = `translate(${Math.round(left)}px, ${Math.round((at.y + at.below) * S + 12)}px)`;
      tipCore.style.setProperty('--sx', `${Math.round(clamp(tx - left, 16, w - 16))}px`);
      if (tipCur.hidden) return;
      w = tipCur.offsetWidth; tx = P.x * S; left = clamp(tx - w + 24, 8, aw - w - 8);
      tipCur.style.transform = `translate(${Math.round(left)}px, ${Math.round(P.y * S - tipCur.offsetHeight - 14)}px)`;
      tipCur.style.setProperty('--sx', `${Math.round(clamp(tx - left, 16, w - 16))}px`);
    }
    function chip(text, size, dur) {
      const c = document.createElement('div');
      c.className = `chip ${size || ''}`; c.textContent = text; c.style.setProperty('--dur', `${dur}s`);
      chipsEl.append(c);
      setTimeout(() => c.remove(), dur * 1000);
    }
    function setTexts() {
      s = STR[lang];
      stage.lang = lang; smallEl.lang = lang;
      lesSkip.textContent = s.skip;
      for (const k of Object.keys(last)) delete last[k];
      barDots = 0;
    }
    function toggleSound() { sfx.ensure(); sfx.setMuted(!sfx.muted); }
    // the game's icons in one colour, as the screen's dot-matrix and its orange marks draw them
    function icoMono(name, size, color) {
      const [line, body] = ICONS[name];
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" shape-rendering="crispEdges" aria-hidden="true" focusable="false"><g fill="${color}">${body}${line}</g></svg>`;
    }
    const focusEl = (el) => { if (!el) return; try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } };
    function focusStage() { focusEl(stage); }

    /* ------------------------------------------------------------ screens
       Every screen is the device's own: its heading in orange, its text in grey, and its choices as a column of pills,
       the picked one ringed in orange behind its ▶. The menu before a run and its pages (How to play, Leaderboard,
       About this game) lie over the demo on the front; a fight's screens (pause, a loss, a win, the practice's end, the
       name, sharing, the board after a win) lie over everything on the layer. Up and down move between the choices,
       Enter takes one, Escape goes back.
       o: title, aside (grey, at the heading's right), body (HTML), buttons [{ label, run, def }], foot (under the
       choices), mid (the column in the middle), onEsc, kind, acts ({ act: fn } for data-act in the body), onSubmit
       (Enter in the body's form), rebuild (draws it again as it is: a language switch) */
    function screenHTML(o, id) {
      const head = !o.title ? '' : o.mid ? `<p class="scr-h" id="${id}">${esc(o.title)}</p>`
        : `<p class="row-h"><span class="scr-h" id="${id}">${esc(o.title)}</span>${o.aside ? `<span class="dim">${esc(o.aside)}</span>` : ''}</p>`;
      const choices = o.buttons.length ? `<div class="menu">${o.buttons.map((b, i) => `<button type="button" data-i="${i}"${b.def ? ' class="sel"' : ''}>${esc(b.label)}</button>`).join('')}</div>` : '';
      return `<div class="scr${o.mid ? ' mid' : ''}">${head}${o.body}<div class="grow"></div>${choices}${o.foot || ''}</div>`;
    }
    // a choice's index stays picked when its screen is drawn again (the board arrives, the language switches)
    function draw(el, o, id) {
      const a = root.activeElement, keep = a && el.contains(a) && a.dataset && a.dataset.i !== undefined ? +a.dataset.i : -1;
      el.innerHTML = screenHTML(o, id);
      const box = el.firstElementChild;
      if (o.title) box.setAttribute('aria-labelledby', id); else box.setAttribute('aria-label', 'Screen Saver XP');
      return el.querySelector(`.menu button[data-i="${keep}"]`) || el.querySelector('.menu .sel') || el.querySelector('.menu button');
    }
    // the menu's pages, over the demo
    function openFront(o) {
      o.front = true; o.def = o.buttons.find((b) => b.def) || null;
      front.hidden = false; front.scrollTop = 0;
      const f = draw(front, o, 'frontT');
      front.firstElementChild.setAttribute('role', 'region');
      G.front = o;
      if (layer.hidden) { G.dlg = o; focusEl(f); }
    }
    function openDlg(o) {
      o.def = o.buttons.find((b) => b.def) || null;
      layer.hidden = false; layer.scrollTop = 0; stage.classList.add('over'); layer.classList.toggle('solid', !!o.solid);
      const f = draw(layer, o, 'dlgT');
      const box = layer.firstElementChild;
      box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
      G.dlg = o;
      // a screen here is modal: the menu's page, the HUD and the arena behind it take no Tab and no click
      setBehind(true);
      focusEl(f);
    }
    // the layer closes back onto the menu's page under it, if there is one
    function closeDlg() {
      layer.hidden = true; layer.textContent = ''; setBehind(false); stage.classList.remove('over');
      G.dlg = !front.hidden && G.front ? G.front : null;
      if (G.dlg) focusEl(front.querySelector('.menu .sel') || front.querySelector('.menu button'));
    }
    function hideFront() { front.hidden = true; front.textContent = ''; G.front = null; if (G.dlg && G.dlg.front) G.dlg = null; }
    function setBehind(on) { for (const el of [hudEl, $('#arena'), front]) el.inert = on; }
    // up and down move between the choices of the screen on top
    function moveSel(dir) {
      const box = layer.hidden ? front : layer;
      const bs = [...box.querySelectorAll('.menu button:not(:disabled)')];
      if (!bs.length) return;
      const i = bs.indexOf(root.activeElement), cur = i >= 0 ? i : bs.findIndex((b) => b.classList.contains('sel'));
      focusEl(bs[(cur + dir + bs.length) % bs.length]);
    }
    function copyBox() { return `<div class="copy" hidden><label for="copyText" class="dim">${esc(s.copyHand)}</label><textarea id="copyText" rows="4" readonly></textarea></div>`; }

    /* ------------------------------------------------------------ the menu before a run, over a live demo
       Behind the menu the screensavers take turns playing, dimmed, with the stickman on a cursor that dodges on its own
       (under reduced motion it holds still on one frame). Blank.scr joins them once a run has reached it. Start game
       always starts the full run from Starfield.scr (GAME2_BRIEF.md); the practice starts from How to play. */
    const DEMO_Y = 250, DEMO_LEN = 16;
    const RUN_GOAL = BOSSES.reduce((t, b) => t + b.target, 0);
    const gradeOf = (score, goal = RUN_GOAL) => (score <= goal * 1.125 ? 'S' : score <= goal * 1.5 ? 'A' : score <= goal * 2 ? 'B' : 'C');
    const blankMet = () => store.get('ssxp-met-blank') === '1';
    let demoI = 0;
    function startDemo() {
      const list = blankMet() ? BOSSES : BOSSES.slice(0, 4), d = list[demoI % list.length];
      clearField(); resetPlayer();
      Object.assign(P, { inv: 0, x: AW / 2, tx: AW / 2, y: DEMO_Y, ty: DEMO_Y });
      G.mode = 'demo'; G.demoT = 0;
      resetBoss(d);
      Object.assign(B, { inv: 0, pause: 0.6 });
      // under reduced motion the fight is run 2.5 s ahead here, unseen, and then holds still (frame)
      if (reduceMotion) for (let i = 0; i < 300; i++) update(STEP);
    }
    // each screensaver has its turn, then the next one plays
    function stepDemo(dt) { if ((G.demoT += dt) >= DEMO_LEN) { demoI += 1; startDemo(); } }
    // the demo's cursor keeps under whatever is to shoot and steps away from the nearest danger
    function demoPilot() {
      const aimX = B.on ? clamp(B.def.tipAt().x - 2, 40, AW - 56) : AW / 2;
      let best = P.x, low = Infinity;
      for (const dx of [-48, -24, 0, 24, 48]) {
        const x = clamp(P.x + dx, X_MIN + 16, X_MAX - 16);
        let risk = Math.abs(x - aimX) * 0.02 + Math.abs(dx) * 0.004;
        for (const b of bullets) {
          if (b.mode) continue;
          const r = Math.hypot(b.x + b.dx * b.sp * 0.2 - x, b.y + b.dy * b.sp * 0.2 - DEMO_Y);
          if (r < 60) risk += 30 / (r + 6);
        }
        if (B.on && !B.dying && B.def.hazard(x, DEMO_Y) < 14) risk += 8;
        if (risk < low) { low = risk; best = x; }
      }
      P.tx = best; P.ty = DEMO_Y + Math.sin(G.t * 1.3) * 10;
    }
    function showMenu() {
      closeDlg();
      G.practice = null; lesEl.hidden = true;
      if (sfx.tune !== 'menu') sfx.music('menu');
      sfx.quiet = true;
      G.paused = false; keys.clear(); dragId = null; G.lb = null;
      startDemo();
      showTitle();
      loadFrontBoard();
    }
    // the best full run on this device, shown even where the board can't be reached
    const best = () => { try { const b = JSON.parse(store.get('ssxp-best') || 'null'); return b && Number.isFinite(b.score) ? b : null; } catch (e) { return null; } };
    // the game's moon in dots, its name, the best run in big dot-matrix figures with its place on the board, and the
    // four ways on
    function showTitle() {
      const b = best(), d = lbFront.st === 'ok' ? lbFront.data : null, me = d && d.me;
      const place = b && me ? ` · <span class="acc">${esc(s.rankOf(me.rank, d.total))}</span>` : '';
      openFront({
        kind: 'title', mid: true, rebuild: showTitle,
        body: `<span class="dots3 big" aria-hidden="true">${icoMono('moon', 72, 'currentColor')}</span><p class="hi">Screen Saver <span class="acc">XP</span></p>`
          + `<div class="best">${b ? `<span class="dots4 big" aria-hidden="true">${fmt1(b.score)}</span>` : ''}<p class="dim">${b ? `${esc(s.yourBest)}<span class="sr"> ${fmt1(b.score)}</span>${place}` : esc(s.noBest)}</p></div>`,
        buttons: [{ label: s.menuStart, def: true, run: () => go(false) }, { label: s.menuHow, run: showHow }, { label: s.menuBoard, run: showBoard }, { label: s.menuAbout, run: showAbout }],
        foot: `<p class="dim" aria-hidden="true">${esc(s.pressPre)}<span class="acc">▶</span>${esc(s.pressPost)}</p>`,
      });
    }
    // how to play: the goal, the moves (a touch screen's or a desk's), what a run is, and the practice
    function showHow() {
      const list = coarse.matches ? s.keysTouch : s.keysDesk;
      openFront({
        kind: 'how', title: s.menuHow, rebuild: showHow, onEsc: showTitle,
        body: `<p>${esc(s.goal)}</p><dl class="list">${list.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('')}</dl><p class="dim">${esc(s.howRun)}</p><p class="dim">${esc(s.practiceInfo)}</p>`,
        buttons: [{ label: s.tryPractice, def: true, run: () => go(true) }, { label: s.back, run: showTitle }],
      });
    }
    // the leaderboard as the front last heard it; the player's name, and the way to change it, under it
    function showBoard() {
      const v = lbFront.st, d = v === 'ok' ? lbFront.data : null, who = playerName();
      let body;
      const buttons = [{ label: s.back, def: true, run: showTitle }];
      if (v === 'load') body = `<p class="dim">${esc(s.lbLoading)}</p>`;
      else if (v === 'off') { body = `<p>${esc(s.lbOff)}</p>`; buttons.unshift({ label: s.retry, run: () => { loadFrontBoard(); showBoard(); } }); }
      else if (!d || !d.total) body = `<p>${esc(s.lbEmptyHead)}</p><p class="dim">${esc(s.lbEmptyText)}</p>`;
      else body = boardTable(d) + `<p class="dim">${esc(s.lbHow)}</p>`;
      if (who) { body += `<p class="dim">${esc(s.nameNow)} <span class="hi">${esc(who)}</span></p>`; buttons.push({ label: s.nameChange, run: () => askName(() => { closeDlg(); showBoard(); }, true) }); }
      openFront({ kind: 'board', title: s.board, aside: d && d.total ? s.lbCount(d.total) : '', rebuild: showBoard, onEsc: showTitle, body, buttons });
    }
    function showAbout() {
      const a1 = '<a href="https://pixeliconlibrary.com" target="_blank" rel="noopener">Pixel Icon Library</a>';
      const a2 = '<a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a>';
      openFront({
        kind: 'about', title: s.menuAbout, rebuild: showAbout, onEsc: showTitle,
        body: `<p class="hi">Screen Saver XP <span class="dim">· ${esc(s.aboutVer)}</span></p><p>${esc(s.premise)}</p>`
          + `<ul class="credits dim"><li>${esc(s.aboutMusic)}</li><li>${s.aboutIcons(a1, a2)}</li><li>${esc(s.aboutFont)}</li></ul>`,
        buttons: [{ label: s.back, def: true, run: showTitle }],
      });
    }
    // a run, or the practice; the first play asks for the player's name
    function go(practice) {
      if (!playerName()) { askName(() => { closeDlg(); go(practice); }); return; }
      hideFront();
      if (practice) startPractice(); else startGame(0);
    }

    /* ------------------------------------------------------------ the leaderboard: worker/index.js with ?game=ssxp
       As in Boss Rush XP, a player is a random id kept in this browser, with a public name asked before the first play (a
       name already chosen for Boss Rush XP fills the field). A full run from Starfield.scr is offered to the board as
       soon as it is won. */
    const BOARD_URL = '/api/scores?game=ssxp', BOARD_WAIT = 8000, NAME_MAX = 12;
    // the share text and the card send people to this page's own link to the game (GAME2_BRIEF.md): the page without its
    // query (?debug, anything a link brought along) and #/screensaver; owner: whose portfolio it is, for the text
    const gameUrl = () => `${String(location.href).split(/[?#]/)[0]}#/screensaver`;
    const OWNER = opts.owner || '';
    let pidNow = null, pname = '', nameDraft = null, nameErr = false;
    function playerId() {
      if (pidNow) return pidNow;
      pidNow = store.get('ssxp-pid');
      if (!/^[a-z0-9]{16,40}$/.test(pidNow || '')) {
        pidNow = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
        store.set('ssxp-pid', pidNow);
      }
      return pidNow;
    }
    // names follow the server's rule: 1 to 12 letters, digits, spaces, - or _
    const tidyName = (v) => String(v || '').replace(/\s+/g, ' ').trim();
    const nameOk = (n) => n.length <= NAME_MAX && /^[A-Za-z0-9 _-]+$/.test(n) && /[A-Za-z0-9]/.test(n);
    // kept in this browser and in memory too, so a browser that keeps nothing asks once a visit, not before every run
    function playerName() {
      if (!pname) { const n = tidyName(store.get('ssxp-name')); if (nameOk(n)) pname = n; }
      return pname;
    }
    function setName(n) { pname = n; store.set('ssxp-name', n); }
    // one request: the server's answer, or { error } with its code ('net' when it can't be reached in time)
    async function boardCall(query, body) {
      const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), BOARD_WAIT);
      try {
        const r = await fetch(BOARD_URL + (query ? `&${query}` : ''), body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal } : { signal: ctl.signal });
        const j = await r.json();
        return r.ok && j && !j.error ? j : { error: (j && j.error) || 'net' };
      } catch (e) { return { error: 'net' }; } finally { clearTimeout(timer); }
    }
    // New player: asked before the first play, over the menu. then runs once a valid name is in; change: from the
    // leaderboard, to change the name
    function askName(then, change) {
      const draft = nameDraft !== null ? nameDraft : playerName() || tidyName(store.get('brxp-name'));
      const leave = (fn) => { nameDraft = null; nameErr = false; fn(); };
      const back = () => leave(closeDlg);
      const submit = () => {
        const f = layer.querySelector('#pName'), typed = f ? f.value : draft, n = tidyName(typed);
        if (!nameOk(n)) { nameDraft = typed; nameErr = true; askName(then, change); return; }
        setName(n);
        leave(then);
      };
      openDlg({
        title: change ? s.nameChange : s.nameTitle, kind: 'name', rebuild: () => askName(then, change),
        body: `<form class="name-form" novalidate><p>${esc(change ? s.nameChangeText : s.nameText)}</p>`
          + `<label class="field"><span class="dim">${esc(s.nameLabel)}</span><input id="pName" maxlength="${NAME_MAX}" autocomplete="nickname" autocapitalize="words" spellcheck="false" enterkeyhint="go" value="${esc(draft)}" aria-describedby="pNameNote"${nameErr ? ' aria-invalid="true"' : ''}></label>`
          + (nameErr ? `<p class="err" id="pNameNote">${esc(s.lbErr.format)}</p>` : `<p class="dim" id="pNameNote">${esc(s.nameRule)}</p>`) + '</form>',
        buttons: [{ label: change ? s.save : s.namePlay, def: true, run: submit }, { label: s.cancel, run: back }],
        onEsc: back, onSubmit: submit,
      });
      const f = layer.querySelector('#pName');
      f.addEventListener('input', () => { nameDraft = f.value; });
      focusEl(f);
      // a name already there (this game's, or Boss Rush XP's) is selected: Enter keeps it, typing replaces it
      if (nameErr || f.value) f.select();
    }
    // the front's board: 'load', then 'ok' with the server's answer or 'off'; the title and the leaderboard page show it
    let lbFront = { st: 'load', data: null };
    function loadFrontBoard() {
      const v = lbFront = { st: 'load', data: null };
      boardCall(`pid=${playerId()}`).then((j) => {
        if (lbFront !== v) return;
        Object.assign(v, j.error ? { st: 'off' } : { st: 'ok', data: j });
        if (G.front && (G.front.kind === 'title' || G.front.kind === 'board')) G.front.rebuild();
      });
    }
    const scoreOf = (r) => r.time + r.hits * 10;
    // the top ten, and the player's own row under them when it is further down; the time and the hits show where the
    // screen is wide enough
    function boardTable(d) {
      const row = (r) => `<tr${r.me ? ' class="me"' : ''}><td>${r.rank}</td><td>${esc(r.name)}${r.me ? ` (${esc(s.lbYou)})` : ''}</td><td class="t w">${fmt1(r.time)}</td><td class="h w">${r.hits}</td><td class="t">${fmt1(scoreOf(r))}</td><td><span class="gd">${gradeOf(scoreOf(r))}</span></td></tr>`;
      const mine = d.me && !d.top.some((r) => r.me) ? `<tr class="gap" aria-hidden="true"><td colspan="6">…</td></tr>${row({ ...d.me, me: true })}` : '';
      return `<table class="lb"><thead class="sr"><tr>${s.lbCols.map((c) => `<th scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${d.top.map(row).join('')}${mine}</tbody></table>`;
    }
    // the board after a win, asked afresh, on the layer; Back returns to the win
    function showBoardWin() {
      const bv = { st: 'load', data: null };
      const paint = () => {
        const d = bv.data;
        const body = bv.st === 'load' ? `<p class="dim">${esc(s.lbLoading)}</p>` : bv.st === 'off' ? `<p>${esc(s.lbOff)}</p>`
          : !d.total ? `<p>${esc(s.lbEmptyHead)}</p>` : boardTable(d) + `<p class="dim">${esc(s.lbHow)}</p>`;
        openDlg({ kind: 'board', title: s.board, aside: d && d.total ? s.lbCount(d.total) : '', solid: true, rebuild: paint, onEsc: renderWin, body, buttons: [{ label: s.back, def: true, run: renderWin }] });
      };
      paint();
      boardCall(`pid=${playerId()}`).then((j) => {
        Object.assign(bv, j.error ? { st: 'off' } : { st: 'ok', data: j });
        if (G.dlg && G.dlg.kind === 'board' && G.dlg.rebuild === paint) paint();
      });
    }

    /* ------------------------------------------------------------ a run */
    function newRun() {
      Object.assign(G, { fightTime: 0, hits: 0, deaths: 0, splits: [] });
    }
    function clearField() {
      for (let i = bullets.length - 1; i >= 0; i--) drop(i);
      shots.length = 0; sparks.length = 0; tele.length = 0; G.shake = 0;
      chipsEl.textContent = '';
      if (tipsOn) showTips(false);
    }
    // how far a full run gets, told to the portfolio's day counts (onRun): its start, each later boss, Blank, the win,
    // and the practice begun and finished; a retry and a ?debug run from a later boss tell nothing
    const tell = (d) => { if (opts.onRun) opts.onRun(d); };
    // a boss begins with full health; a retry keeps the run's time and hits
    function beginBoss(retrying) {
      clearField(); resetBoss(BOSSES[G.bossIdx]); resetPlayer();
      if (!retrying) { G.bossT0 = G.fightTime; G.bossH0 = G.hits; }
      if (!retrying && G.startIdx === 0) tell(G.bossIdx === 0 ? 'start' : G.bossIdx === BOSSES.length - 1 ? 'final' : `boss${G.bossIdx + 1}`);
      G.mode = 'intro'; G.introT = 0; G.paused = false;
      // the first meeting with each boss points at what to shoot before anything fires; later ones only name it
      const first = !G.taught[B.def.id], cursor = !G.taught.cursor;
      G.introLen = first ? (cursor ? 3.8 : 3) : 1.8;
      B.pause = G.introLen + 0.2;
      if (first) showTips(true, cursor); else chip(B.def.name, 'big', 1.8);
      G.taught[B.def.id] = true; G.taught.cursor = true;
      sfx.music(B.def.id);
      focusStage();
    }
    function startGame(from) { hideFront(); sfx.quiet = false; sfx.ensure(); sfx.start(); closeDlg(); newRun(); G.practice = null; lesEl.hidden = true; G.startIdx = G.bossIdx = from; beginBoss(false); }
    function startPractice() {
      tell('practice');
      hideFront(); sfx.quiet = false; sfx.ensure(); sfx.start(); sfx.music('practice'); closeDlg(); newRun();
      clearField(); resetBoss(PRACTICE); resetPlayer();
      G.practice = { step: 0, good: 0, moved: 0, clean: 0, lx: P.x, ly: P.y, top: 90 };
      Object.assign(G, { mode: 'fight', paused: false });
      Object.assign(B, { inv: 0, pause: 0.6 });
      lesEl.hidden = false;
      lessonStart();
      focusStage();
    }
    // the lesson's box, in arena units, so the sparring partner and the cursor keep under it
    function practiceTop() { if (G.practice && !lesEl.hidden) G.practice.top = (lesEl.offsetTop + lesEl.offsetHeight) / S + 2; }
    function lessonStart() {
      const pr = G.practice, id = LESSONS[pr.step], [name, how] = s.les[id];
      Object.assign(pr, { good: 0, moved: 0, clean: 0, lx: P.x, ly: P.y });
      debrisAll();
      if (id === 'aim') B.hp = B.max;
      lesName.textContent = name;
      lesStep.textContent = s.lesStep(pr.step + 1, LESSONS.length);
      lesHow.textContent = typeof how === 'string' ? how : how[coarse.matches ? 0 : 1];
      lesSkip.textContent = s.skip;
      if (coarse.matches) { lesSkip.removeAttribute('title'); lesSkip.removeAttribute('aria-keyshortcuts'); } else { lesSkip.title = 'Enter'; lesSkip.setAttribute('aria-keyshortcuts', 'Enter'); }
      practiceTop();
    }
    function stepPractice(dt) {
      const pr = G.practice, id = LESSONS[pr.step];
      if (pr.good > 0) { if ((pr.good -= dt) <= 0) nextLesson(); return; }
      if (id === 'move') { pr.moved += Math.hypot(P.x - pr.lx, P.y - pr.ly); if (pr.moved >= MOVE_NEED) lessonDone(); }
      else if (id === 'dodge' && P.inv <= 0 && (pr.clean += dt) >= DODGE_NEED) lessonDone();
      pr.lx = P.x; pr.ly = P.y;
    }
    function lessonProgress() {
      const pr = G.practice, id = LESSONS[Math.min(pr.step, LESSONS.length - 1)];
      if (pr.good > 0 || pr.step >= LESSONS.length) return 1;
      return clamp(id === 'move' ? pr.moved / MOVE_NEED : id === 'aim' ? 1 - B.hp / B.max : id === 'dodge' ? pr.clean / DODGE_NEED : 0, 0, 1);
    }
    function lessonDone() {
      const pr = G.practice;
      if (!pr || pr.good > 0) return;
      pr.good = 0.9;
      chip(s.lesGood, '', 0.9); sfx.ready();
    }
    function nextLesson() {
      const pr = G.practice;
      pr.step += 1;
      if (pr.step >= LESSONS.length) practiceDone(); else lessonStart();
    }
    function skipLesson() { const pr = G.practice; if (pr && !pr.good && G.mode === 'fight' && !G.paused) nextLesson(); }
    // a hit costs nothing in practice; the dodging lesson says what went wrong
    function practiceHit() {
      const pr = G.practice, id = LESSONS[pr.step];
      P.inv = INV_TIME; P.knock = 1;
      sfx.hit(); spark(P.x, P.y, '#ff3b30', 6);
      for (const b of bullets) if (!b.mode && Math.hypot(b.x - P.x, b.y - P.y) < CANCEL_R) { b.mode = 'debris'; b.fade = 0.25; }
      if (id === 'dodge') { pr.clean = 0; chip(s.lesDodgeHit, 'low', 2.2); }
    }
    function practiceDone() {
      tell('practice-done');
      G.mode = 'result'; G.taught.cursor = true;
      lesEl.hidden = true;
      debrisAll(); sfx.win(); sfx.music('win');
      practiceDlg();
    }
    function practiceDlg() {
      openDlg({
        title: s.drillDone, kind: 'drill', mid: true, solid: true, rebuild: practiceDlg, onEsc: showMenu,
        body: `<p>${esc(s.drillText)}</p>`,
        buttons: [{ label: s.drillFight, def: true, run: () => startGame(0) }, { label: s.drillAgain, run: () => startPractice() }, { label: s.menu, run: showMenu }],
      });
    }
    function retry() { closeDlg(); beginBoss(true); }
    const statLine = () => (G.practice ? s.lesStep(Math.min(G.practice.step, LESSONS.length - 1) + 1, LESSONS.length) : `${B.def.name} · ${s.hitsN(G.hits)}`);
    function pause(force) {
      if (G.mode !== 'fight' && G.mode !== 'intro') return;
      if (G.dlg && !force) return;
      G.paused = true; keys.clear(); dragId = null; sfx.musicHold(true);
      openDlg({
        title: s.paused, kind: 'pause', mid: true, rebuild: () => pause(true),
        body: `<span class="dots4 big" aria-hidden="true">${fmt(G.fightTime)}</span><p class="dim"><span class="sr">${s.clock} ${fmt(G.fightTime)} · </span>${esc(statLine())}</p><p>${esc(s.goal)}</p>`,
        buttons: [{ label: s.resume, def: true, run: resume }, { label: s.restart, run: () => (G.practice ? startPractice() : startGame(G.startIdx)) }, { label: s.menu, run: showMenu }],
        onEsc: resume,
      });
    }
    function resume() { closeDlg(); G.paused = false; sfx.musicHold(false); focusStage(); }
    const runBosses = () => BOSSES.slice(G.startIdx);
    // the last boss down. Past Blank.scr the tube is back on and the PC starts again: the portfolio plays its loading
    // screen (onReboot), and the result comes after it
    function runOver() {
      if (B.def !== BLANK || !opts.onReboot) { showWin(); return; }
      G.mode = 'reboot';
      opts.onReboot(() => { if (G.mode === 'reboot' && !gone) showWin(); });
    }
    // grades on the scale of the bosses fought: S within 1.125 times their target, A 1.5 times, B twice (GAME2_BRIEF.md)
    function showWin() {
      G.mode = 'result';
      sfx.music('win');
      const list = runBosses(), goal = list.reduce((t, b) => t + b.target, 0), score = G.fightTime + G.hits * 10;
      const rank = gradeOf(score, goal), full = G.startIdx === 0;
      if (full) { const b = best(); if (!b || score < b.score) store.set('ssxp-best', JSON.stringify({ score: +score.toFixed(1), time: +G.fightTime.toFixed(1), hits: G.hits })); }
      // the first full win puts the pointer trails on the desktop: the portfolio answers 'new' then (onWin)
      const gift = full && opts.onWin ? opts.onWin() === 'new' : false;
      if (full) tell('win');
      G.win = { list, goal, score, rank, full, gift, time: G.fightTime, hits: G.hits, deaths: G.deaths, seen: false };
      // only a run from the first boss to the last goes on the board (a ?debug run from a later one doesn't)
      G.lb = full ? { st: 'load', name: playerName(), auto: false, err: null, time: G.fightTime, hits: G.hits } : null;
      renderWin();
      if (G.lb) lbCheck();
    }
    // the win screen, drawn again as it was whenever sharing or the board closes back onto it: the grade stamped in dots
    // beside the run's time, the run in a line, and what to do next
    function renderWin() {
      const w = G.win;
      const line = [s.hitsN(w.hits), s.scoreIs(fmt1(w.score)), ...(w.deaths ? [s.lossesN(w.deaths)] : [])].join(' · ');
      openDlg({
        title: s.runDone(w.list.length), kind: 'win', mid: true, solid: true, rebuild: renderWin, onEsc: showMenu,
        body: `<div class="res"><span class="grade${w.seen ? ' still' : ''}" role="img" aria-label="${esc(s.rank)} ${w.rank}"><span class="dots4" aria-hidden="true">${w.rank}</span></span><span class="dots4 big" aria-hidden="true">${fmt1(w.time)}</span></div>`
          + `<p class="dim"><span class="sr">${s.clock} ${fmt1(w.time)} · </span>${esc(line)}</p><p>${esc(s.flavor)}</p><p class="dim">${esc(s.target(fmt(w.goal)))}</p>`
          + (w.gift ? `<p class="gift">${icoMono('star', 16, 'var(--acc)')}<span>${esc(s.gift)}</span></p>` : '')
          + `<div class="lb-run" aria-live="polite">${lbRunHTML()}</div>`
          + (opts.onContact ? `<p class="dim">${esc(s.cta)}</p>` : ''),
        buttons: [{ label: s.again, def: true, run: () => startGame(G.startIdx) }, { label: s.shareOpen, run: showShare }, ...(G.lb ? [{ label: s.board, run: showBoardWin }] : []), ...(opts.onContact ? [{ label: s.contact, run: () => opts.onContact() }] : []), { label: s.menu, run: showMenu }],
        acts: { retry: lbCheck },
        onSubmit: () => lbSave(),
      });
      w.seen = true;
    }
    /* ---- the win screen's place on the board ----
       A run beating the player's saved best is saved at once under their name; the field shows only when the server
       refuses the name or can't be reached. 'kept' shows the best that stands, 'none' a run that doesn't rank */
    function lbCheck() {
      const lb = G.lb;
      if (!lb) return;
      Object.assign(lb, { st: 'load', err: null });
      renderLb();
      boardCall(`pid=${playerId()}&time=${lb.time.toFixed(2)}&hits=${lb.hits}`).then((j) => {
        if (!j.error && j.would) {
          Object.assign(lb, { st: 'ask', rank: j.would.rank, total: j.would.total });
          // a run that ranks is saved under the name already known, even once the player has left the win screen
          if (lb.name && !lb.auto) { lb.auto = true; lbSave(true, lb); return; }
        } else if (!j.error && j.me) Object.assign(lb, { st: 'kept', me: j.me, total: j.total });
        else lb.st = j.error ? 'off' : 'none';
        if (G.lb === lb) renderLb(true);
      });
    }
    // auto: the save lbCheck makes by itself, with the name already known rather than whatever the field holds; which:
    // the run to save, whether or not the win screen still shows it
    function lbSave(auto, which) {
      const lb = which || G.lb, field = !auto && layer.querySelector('#lbName');
      if (!lb || lb.st !== 'ask') return;
      lb.name = tidyName(field ? field.value : lb.name);
      if (!nameOk(lb.name)) { lb.err = 'format'; renderLb(true); return; }
      Object.assign(lb, { st: 'saving', err: null });
      if (G.lb === lb) renderLb();
      boardCall('', { pid: playerId(), name: lb.name, time: +lb.time.toFixed(2), hits: lb.hits }).then((j) => {
        if (j.error) { Object.assign(lb, { st: 'ask', err: j.error === 'name' || j.error === 'slow' ? j.error : 'net' }); if (G.lb === lb) renderLb(true); return; }
        setName(lb.name);
        Object.assign(lb, { st: j.saved ? 'saved' : 'kept', me: j.me, total: j.total });
        if (G.lb !== lb) return;
        sfx.ready();
        renderLb(true);
      });
    }
    function lbRunHTML() {
      const lb = G.lb;
      if (!lb) return '';
      if (lb.st === 'load') return `<p class="dim">${esc(s.lbLoading)}</p>`;
      if (lb.st === 'off') return `<p class="dim">${esc(s.lbOff)}</p><button class="pill" type="button" data-act="retry">${esc(s.retry)}</button>`;
      if (lb.st === 'saved') return `<p class="acc">${esc(s.lbSaved(lb.me.name, lb.me.rank, lb.total))}</p>`;
      if (lb.st === 'kept') return `<p class="dim">${esc(s.lbKept(lb.me.rank, lb.total, fmt1(scoreOf(lb.me))))}</p>`;
      if (lb.st === 'none') return '';
      const busy = lb.st === 'saving' ? ' disabled' : '';
      return `<form class="name-form" novalidate><p class="acc">${esc(s.lbAsk(lb.rank, lb.total))}</p>`
        + `<div class="name-row"><label class="field"><span class="dim">${esc(s.nameLabel)}</span><input id="lbName" maxlength="${NAME_MAX}" autocomplete="nickname" autocapitalize="words" spellcheck="false" enterkeyhint="done" value="${esc(lb.name)}"${busy}${lb.err ? ' aria-describedby="lbErr" aria-invalid="true"' : ''}></label>`
        + `<button class="pill" type="submit"${busy}>${esc(lb.st === 'saving' ? s.saving : s.save)}</button></div>`
        + (lb.err ? `<p class="err" id="lbErr">${esc(s.lbErr[lb.err])}</p>` : '') + '</form>';
    }
    // redraws the win screen's board part in place; arrived: an answer just came, so the name field (or the button that
    // replaced it) takes the focus, unless the player has already moved it somewhere else
    function renderLb(arrived) {
      const box = G.dlg && G.dlg.kind === 'win' && layer.querySelector('.lb-run');
      if (!box) return;
      // the focus as the screen's shadow root sees it: null when it is somewhere else on the page
      const a = root.activeElement, untouched = !a || box.contains(a) || (layer.contains(a) && a.classList.contains('sel'));
      box.innerHTML = lbRunHTML();
      if (!arrived || !untouched) return;
      const f = box.querySelector('input:not(:disabled)') || (!a || box.contains(a) ? box.querySelector('.pill') : null);
      if (f) { focusEl(f); if (f.tagName === 'INPUT' && G.lb.err) f.select(); }
    }

    /* ---- sharing: the result card, and the text with the link to the game ---- */
    // the place on the board shows on the card and in the text once this run is the one saved there
    function boardPos() { const lb = G.lb; return lb && lb.st === 'saved' && lb.me ? { rank: lb.me.rank, total: lb.total } : null; }
    const shareText = () => s.share(G.win.rank, fmt1(G.win.time), G.win.hits, OWNER, gameUrl(), boardPos());
    const cardFile = () => `screen-saver-xp-${G.win.rank}-${fmt1(G.win.time).replace(':', '-')}.png`;
    function cardData() {
      const now = new Date();
      return {
        grade: G.win.rank, time: G.win.time, hits: G.win.hits, name: playerName(), pos: boardPos(), owner: OWNER, bosses: G.win.list.length,
        link: gameUrl().replace(/^https?:\/\//, ''), clock: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      };
    }
    // the card for this win as it stands, drawn again only when what it shows changes (the place arrives once the run is
    // saved; the language can switch). Resolves to { blob, url }
    let cardMemo = null;
    function card() {
      const d = cardData(), key = JSON.stringify({ ...d, clock: 0, lang });
      if (cardMemo && cardMemo.key === key) return cardMemo.p;
      if (cardMemo && cardMemo.url) URL.revokeObjectURL(cardMemo.url);
      const memo = cardMemo = { key, url: null };
      memo.p = makeCard(d).then((blob) => { memo.blob = blob; memo.url = URL.createObjectURL(blob); return memo; });
      memo.p.catch(() => { if (cardMemo === memo) cardMemo = null; });
      return memo.p;
    }
    function canShareFiles() {
      try { return !!(navigator.canShare && navigator.canShare({ files: [new File([''], 'card.png', { type: 'image/png' })] })); } catch (e) { return false; }
    }
    function showShare() {
      const lb = G.lb, canCopy = !!(window.ClipboardItem && navigator.clipboard && navigator.clipboard.write);
      const ways = [canCopy && [s.copyImg, copyImage], [s.saveImg, saveImage], canShareFiles() && [s.shareTo, shareTo], [s.copyText, copyShare]].filter(Boolean);
      openDlg({
        title: s.shareTitle, kind: 'share', solid: true, rebuild: showShare, onEsc: renderWin,
        body: `<div class="card-frame"><p class="dim">${esc(s.cardMaking)}</p></div><p class="dim">${esc(s.shareHint)}</p>`
          + (lb && (lb.st === 'ask' || lb.st === 'saving') ? `<p class="acc">${esc(s.cardNoRank)}</p>` : '')
          + `<p class="share-msg" aria-live="polite"></p>${copyBox()}`,
        buttons: [...ways.map(([label, run], i) => ({ label, run, def: i === 0 })), { label: s.back, run: renderWin }],
      });
      const w = G.win, alt = s.cardAlt(w.rank, fmt1(w.time), w.hits, boardPos());
      card().then((m) => {
        const frame = G.dlg && G.dlg.kind === 'share' && layer.querySelector('.card-frame');
        if (frame) frame.innerHTML = `<img src="${m.url}" width="1200" height="630" alt="${esc(alt)}">`;
      }, () => {
        const wait = G.dlg && G.dlg.kind === 'share' && layer.querySelector('.card-frame p');
        if (wait) wait.textContent = s.cardFail;
      });
    }
    function shareMsg(text) { const m = G.dlg && G.dlg.kind === 'share' && layer.querySelector('.share-msg'); if (m) m.textContent = text; }
    // a choice says what just happened for a moment, then goes back to its own label
    function flash(b, text) {
      if (!b || !b.isConnected) return;
      const label = b.dataset.label || (b.dataset.label = b.textContent);
      b.textContent = text; clearTimeout(b.flashT);
      b.flashT = setTimeout(() => { b.textContent = label; }, 1800);
    }
    // the picture goes on the clipboard; the item is made while the click still counts as the player's own (Safari wants
    // that), with the picture itself possibly still on its way
    function copyImage(b) {
      try {
        const item = new ClipboardItem({ 'image/png': card().then((m) => m.blob) });
        navigator.clipboard.write([item]).then(() => { flash(b, s.imgCopied); shareMsg(''); }, () => shareMsg(s.imgFail));
      } catch (e) { shareMsg(s.imgFail); }
    }
    function saveImage() {
      card().then((m) => {
        const a = document.createElement('a');
        a.href = m.url; a.download = cardFile(); a.hidden = true;
        document.body.appendChild(a); a.click(); a.remove();
        shareMsg(s.imgSaved(a.download));
      }, () => shareMsg(s.cardFail));
    }
    // the system's own share sheet, where the browser has one for pictures
    function shareTo() {
      card().then((m) => navigator.share({ files: [new File([m.blob], cardFile(), { type: 'image/png' })], text: shareText() }))
        .catch(() => { /* the sheet was closed: nothing to do */ });
    }
    // the clipboard where it is allowed, the old copy command where not, and failing both the text to copy by hand
    function copyShare(b) {
      const text = shareText();
      const done = (ok) => {
        if (ok) { flash(b, s.copied); return; }
        const box = layer.querySelector('.copy');
        if (!box) return;
        box.hidden = false;
        const ta = box.querySelector('textarea');
        ta.value = text; ta.focus(); ta.select();
      };
      const fallback = () => {
        const ta = document.createElement('textarea');
        ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
        document.body.appendChild(ta); ta.select();
        let ok = false;
        try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
        ta.remove(); if (b) b.focus({ preventScroll: true });
        return ok;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), () => done(fallback()));
      else done(fallback());
    }

    /* ------------------------------------------------------------ the result card
       A picture of a win to post anywhere, at the size link previews use (1200 × 630: drawn at half that and doubled).
       It is the game's device on the desktop, its screen showing the win as the win screen does (the grade stamped in
       dots beside the run's time, the player and the place, and where to play); next to it the stickman cheers on his
       cursor. Boss Rush XP's card is its Start menu; this one keeps the same desktop and taskbar.
       d: grade, time, hits, name, pos ({ rank, total } or null), owner, bosses, link, clock */
    const CARD = { w: 600, h: 315, k: 2, bar: 30 };
    const CARD_FONT = '"Noto Sans", sans-serif', PX_FONT = '"SSXP Pixel", monospace';
    const CARD_INK = { lcd: '#d3cfc9', hi: '#f1eee9', dim: '#8a8580', acc: '#e0683f', print: '#211e1b' };
    // the text's size shrinks, down to min, until it fits in maxW; the font is left set on c
    function fitFont(c, text, style, size, min, maxW) {
      let n = size;
      for (;;) { c.font = `${style}${n}px ${CARD_FONT}`; if (n <= min || c.measureText(text).width <= maxW) return n; n -= 0.5; }
    }
    // a rounded rectangle's path; top: only the top corners round, as a window's
    function rrPath(c, x, y, w, h, r, top) {
      const b = top ? 0 : r;
      c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, b); c.arcTo(x, y + h, x, y, b); c.arcTo(x, y, x + w, y, r); c.closePath();
    }
    // the screen's pixel letters on the card: plain at one card unit a pixel, centred on x
    function pxText(c, text, x, y, color) {
      c.font = `8px ${PX_FONT}`; c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.fillStyle = color;
      const w = Math.round(c.measureText(text).width);
      c.fillText(text, Math.round(x - w / 2), y);
      return w;
    }
    // and its big figures in dots: the text is set at one pixel a font pixel on a scratch canvas, and each lit pixel
    // becomes a round dot `cell` units wide; y is the baseline, x the left edge
    function dotText(c, text, x, y, cell, color) {
      const t = document.createElement('canvas').getContext('2d');
      t.font = `8px ${PX_FONT}`;
      const w = Math.ceil(t.measureText(text).width), h = 10;
      t.canvas.width = w; t.canvas.height = h;
      t.font = `8px ${PX_FONT}`; t.textBaseline = 'alphabetic'; t.fillStyle = '#000';
      t.fillText(text, 0, 8);
      const px = t.getImageData(0, 0, w, h).data, r = cell * 0.36;
      c.fillStyle = color; c.beginPath();
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        if (px[(j * w + i) * 4 + 3] < 128) continue;
        const cx = x + (i + 0.5) * cell, cy = y + (j - 8 + 0.5) * cell;
        c.moveTo(cx + r, cy); c.arc(cx, cy, r, 0, TAU);
      }
      c.fill();
      return w * cell;
    }
    function drawCard(c, d) {
      const CW = CARD.w, CH = CARD.h, bar = CARD.bar, floor = CH - bar;
      c.textBaseline = 'alphabetic'; c.textAlign = 'left';
      // the desktop, lit from its top right corner, the game's name on it as wallpaper type; the light stays off the
      // owner's line, which is white on the sky's own blue
      const sky = c.createLinearGradient(0, 0, 0, floor);
      sky.addColorStop(0, '#2a5fbf'); sky.addColorStop(0.6, '#3b73d1'); sky.addColorStop(1, '#5a8fe0');
      c.fillStyle = sky; c.fillRect(0, 0, CW, floor);
      const light = c.createRadialGradient(640, -100, 10, 640, -100, 240);
      light.addColorStop(0, 'rgba(255,255,255,.26)'); light.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = light; c.fillRect(0, 0, CW, floor);
      const tx = 390, room = CW - tx - 16;
      fitFont(c, 'Screen Saver XP', 'bold ', 24, 16, room);
      c.save(); c.shadowColor = 'rgba(0,20,70,.5)'; c.shadowBlur = 6; c.shadowOffsetY = 2;
      c.fillStyle = '#fff'; c.fillText('Screen Saver XP', tx, 52);
      c.restore();
      const rule = c.createLinearGradient(tx, 0, tx + 192, 0);
      rule.addColorStop(0, '#e8943a'); rule.addColorStop(1, 'rgba(232,148,58,0)');
      c.fillStyle = rule; c.fillRect(tx, 60, 192, 2);
      if (d.owner) { const o = s.cardOwner(d.owner); c.fillStyle = '#fff'; fitFont(c, o, '', 11, 9, room); c.fillText(o, tx + 1, 78); }

      // the stickman cheering on his cursor, a zoomed-in pointer with its soft shadow, and the hotspot at its tip
      const ax = 460, ay = 174, k = 3.8;
      c.save(); c.translate(ax, ay); c.scale(k, k);
      c.save(); c.shadowColor = 'rgba(0,10,50,.35)'; c.shadowBlur = 5; c.shadowOffsetX = 1.2; c.shadowOffsetY = 1.2; drawArrow(0, 0, false, c); c.restore();
      drawRider(0, 0, c, true);
      c.restore();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(ax, ay, 3, 0, TAU); c.fill();
      c.strokeStyle = '#ff3b30'; c.lineWidth = 2; c.beginPath(); c.arc(ax, ay, 5, 0, TAU); c.stroke();

      // the taskbar: start, the game's task pressed in, the tray and its clock
      const tb = c.createLinearGradient(0, floor, 0, CH);
      tb.addColorStop(0, '#3168d5'); tb.addColorStop(0.08, '#4993e6'); tb.addColorStop(0.2, '#2157d7'); tb.addColorStop(0.9, '#2663e0'); tb.addColorStop(1, '#1941a5');
      c.fillStyle = tb; c.fillRect(0, floor, CW, bar);
      c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(0, floor, CW, 1);
      const sb = c.createLinearGradient(0, floor + 1, 0, CH);
      sb.addColorStop(0, '#2f7a28'); sb.addColorStop(0.5, '#237a23'); sb.addColorStop(1, '#3c8f33');
      c.fillStyle = sb; c.beginPath(); c.moveTo(0, floor + 1); c.lineTo(66, floor + 1); c.quadraticCurveTo(84, floor + bar / 2, 66, CH); c.lineTo(0, CH); c.closePath(); c.fill();
      c.textBaseline = 'middle'; c.font = `italic bold 15px ${CARD_FONT}`;
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillText(s.startBtn, 15, floor + bar / 2 + 2);
      c.fillStyle = '#fff'; c.fillText(s.startBtn, 14, floor + bar / 2 + 1);
      c.fillStyle = '#1e52b7'; rrPath(c, 86, floor + 4, 136, bar - 7, 3); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1; rrPath(c, 86.5, floor + 4.5, 135, bar - 8, 3); c.stroke();
      icoDraw(c, 'moon', 92, floor + 7, 16);
      c.fillStyle = '#fff'; c.font = `bold 11px ${CARD_FONT}`; c.fillText('Screen Saver XP', 113, floor + bar / 2 + 0.5);
      const tray = c.createLinearGradient(0, floor, 0, CH);
      tray.addColorStop(0, '#0c59b9'); tray.addColorStop(0.1, '#18b5f2'); tray.addColorStop(0.2, '#0f9deb'); tray.addColorStop(1, '#095bc9');
      c.fillStyle = tray; c.fillRect(534, floor + 1, CW - 534, bar - 1);
      c.fillStyle = '#1042af'; c.fillRect(533, floor + 1, 1, bar - 1);
      c.textAlign = 'right'; c.fillStyle = '#fff'; c.font = `11px ${CARD_FONT}`; c.fillText(d.clock, CW - 12, floor + bar / 2 + 0.5);
      c.textAlign = 'left'; c.textBaseline = 'alphabetic';

      // the device: warm grey plastic lit from above, the screen on the left and the panel of keys on the right
      const x = 16, y = 18, w = 356, h = 248;
      c.save(); c.shadowColor = 'rgba(0,0,40,.45)'; c.shadowBlur = 12; c.shadowOffsetX = 3; c.shadowOffsetY = 4;
      const body = c.createLinearGradient(0, y, 0, y + h);
      body.addColorStop(0, '#928c88'); body.addColorStop(0.7, '#88827e'); body.addColorStop(1, '#6a6663');
      c.fillStyle = body; rrPath(c, x, y, w, h, 18); c.fill();
      c.restore();
      c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 18, y + 0.5); c.lineTo(x + w - 18, y + 0.5); c.stroke();
      const sx = x + 10, sy = y + 10, sw = 234, sh = h - 20, px0 = sx + sw + 10;
      // the seams across the panel, a dark groove over a lit edge
      for (const gy of [y + 76, y + h - 64]) { c.fillStyle = '#57534f'; c.fillRect(px0, gy, x + w - px0, 1); c.fillStyle = '#a39f9b'; c.fillRect(px0, gy + 1, x + w - px0, 1); }
      icoDraw(c, 'moon', px0 + 12, y + 14, 16, CARD_INK.print);
      c.fillStyle = CARD_INK.acc; c.fillRect(px0 + 30, y + 14, 2, 6); c.fillRect(px0 + 28, y + 16, 6, 2);
      // the window's keys in their dark well
      c.fillStyle = '#1e1b19'; rrPath(c, x + w - 58, y + 12, 46, 18, 9); c.fill();
      for (let i = 0; i < 3; i++) { c.fillStyle = '#b0aca8'; c.beginPath(); c.arc(x + w - 49 + i * 14, y + 21, 5, 0, TAU); c.fill(); }
      // sound, a light grey pill, and start/pause, the orange round key with its dotted ring
      const kx = px0 + (x + w - px0) / 2;
      const pill = c.createLinearGradient(0, y + 98, 0, y + 124);
      pill.addColorStop(0, '#cfcbc7'); pill.addColorStop(1, '#98948f');
      c.fillStyle = '#45403c'; rrPath(c, kx - 22, y + 100, 44, 26, 13); c.fill();
      c.fillStyle = pill; rrPath(c, kx - 22, y + 98, 44, 26, 13); c.fill();
      c.strokeStyle = '#3c3734'; c.lineWidth = 1; rrPath(c, kx - 21.5, y + 98.5, 43, 25, 12.5); c.stroke();
      icoDraw(c, 'sound-on', kx - 8, y + 103, 16, '#2a2622');
      const oy = y + 150, orange = c.createRadialGradient(kx - 5, oy - 6, 2, kx, oy, 22);
      orange.addColorStop(0, '#de7348'); orange.addColorStop(0.55, '#c4552e'); orange.addColorStop(1, '#8c391b');
      c.fillStyle = '#5c2814'; c.beginPath(); c.arc(kx, oy + 2, 21, 0, TAU); c.fill();
      c.fillStyle = orange; c.beginPath(); c.arc(kx, oy, 21, 0, TAU); c.fill();
      c.save(); c.setLineDash([1, 2]); c.strokeStyle = 'rgba(40,14,4,.55)'; c.beginPath(); c.arc(kx, oy, 17, 0, TAU); c.stroke(); c.restore();
      c.fillStyle = '#24130c';
      c.beginPath(); c.moveTo(kx - 9, oy - 6); c.lineTo(kx - 2, oy); c.lineTo(kx - 9, oy + 6); c.closePath(); c.fill();
      c.fillRect(kx + 1, oy - 6, 3, 12); c.fillRect(kx + 6, oy - 6, 3, 12);
      c.fillStyle = CARD_INK.print; c.font = `bold 10px ${CARD_FONT}`; c.textAlign = 'right'; c.fillText('Screen Saver XP', x + w - 12, y + h - 14); c.textAlign = 'left';

      // the screen: the win as the win screen shows it
      c.fillStyle = '#2c2926'; rrPath(c, sx - 1, sy - 1, sw + 2, sh + 2, 10); c.fill();
      c.fillStyle = '#000'; rrPath(c, sx, sy, sw, sh, 9); c.fill();
      const cx = sx + sw / 2;
      pxText(c, s.runDone(d.bosses), cx, sy + 26, CARD_INK.acc);
      // the grade stamped in dots in its orange frame, beside the run's time in big dots
      const tw = Math.ceil(fitW(fmt1(d.time)) * 4), gw = 40, all = gw + 12 + tw, gx = Math.round(cx - all / 2), gy = sy + 40;
      c.strokeStyle = CARD_INK.acc; c.lineWidth = 2; rrPath(c, gx + 1, gy + 1, gw - 2, gw - 2, 7); c.stroke();
      dotText(c, d.grade, gx + (gw - fitW(d.grade) * 4) / 2, gy + 34, 4, CARD_INK.acc);
      dotText(c, fmt1(d.time), gx + gw + 12, gy + 34, 4, CARD_INK.hi);
      const who = d.name || '', place = d.pos ? s.cardPos(d.pos.rank, d.pos.total) : '';
      if (who || place) {
        const wW = who ? pxW(c, who) : 0, sep = who && place ? pxW(c, ' · ') : 0, pW = place ? pxW(c, place) : 0;
        let lx = Math.round(cx - (wW + sep + pW) / 2);
        c.font = `8px ${PX_FONT}`;
        if (who) { c.fillStyle = CARD_INK.hi; c.fillText(who, lx, sy + 108); lx += wW; }
        if (sep) { c.fillStyle = CARD_INK.dim; c.fillText(' · ', lx, sy + 108); lx += sep; }
        if (place) { c.fillStyle = CARD_INK.acc; c.fillText(place, lx, sy + 108); }
      }
      pxText(c, s.hitsN(d.hits), cx, sy + 124, CARD_INK.dim);
      // a dotted rule, then the challenge and where to take it up
      c.fillStyle = '#45413d';
      for (let i = sx + 16; i < sx + sw - 16; i += 4) { c.beginPath(); c.arc(i + 2, sy + 146, 0.9, 0, TAU); c.fill(); }
      pxText(c, s.cardAsk, cx, sy + 172, CARD_INK.lcd);
      pxText(c, d.link, cx, sy + 190, CARD_INK.acc);
    }
    // a pixel line's width in card units, set at one unit a pixel
    function pxW(c, text) { c.font = `8px ${PX_FONT}`; return Math.round(c.measureText(text).width); }
    function fitW(text) { const t = document.createElement('canvas').getContext('2d'); t.font = `8px ${PX_FONT}`; return Math.ceil(t.measureText(text).width); }
    // the fonts are the page's own and the game's pixel letters; either may still be on its way when the first card is
    // drawn
    async function makeCard(d) {
      if (document.fonts && document.fonts.load) {
        try { await Promise.race([Promise.all([document.fonts.load(`bold 24px "Noto Sans"`), document.fonts.load(`12px "Noto Sans"`), document.fonts.load(`italic bold 15px "Noto Sans"`), document.fonts.load(`8px ${PX_FONT}`)]), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* its fallback will do */ }
      }
      const cv2 = document.createElement('canvas');
      cv2.width = CARD.w * CARD.k; cv2.height = CARD.h * CARD.k;
      const c = cv2.getContext('2d');
      c.scale(CARD.k, CARD.k);
      drawCard(c, d);
      const blob = await new Promise((res) => cv2.toBlob(res, 'image/png'));
      if (!blob) throw new Error('the card could not be encoded');
      return blob;
    }
    // a result screen (this, the practice's and the win) takes Escape as Menu
    function showDead() {
      G.mode = 'result';
      openDlg({
        title: s.deadHead, kind: 'dead', mid: true, rebuild: showDead, onEsc: showMenu,
        body: `<p>${esc(s.dead)}</p><p class="dim">${esc(s.deadText(B.def.name))}</p>`,
        buttons: [{ label: s.retry, def: true, run: retry }, { label: s.menu, run: showMenu }],
      });
    }
    // a choice on either the menu's page or the layer runs its own action; a body's own buttons (data-act) run the
    // screen's acts, and a form in it takes Enter
    function onChoice(e, box) {
      const d = box === front ? G.front : G.dlg;
      if (!d) return;
      const a = e.target.closest('[data-act]');
      if (a && d.acts && d.acts[a.dataset.act]) { d.acts[a.dataset.act](a); return; }
      const b = e.target.closest('.menu button[data-i]');
      const it = b && d.buttons[+b.dataset.i];
      if (it) it.run(b);
    }
    front.addEventListener('click', (e) => onChoice(e, front));
    layer.addEventListener('click', (e) => onChoice(e, layer));
    layer.addEventListener('submit', (e) => { e.preventDefault(); if (G.dlg && G.dlg.onSubmit) G.dlg.onSubmit(); });
    // Tab goes round the layer's screen and never out of it, as a modal dialog's does
    layer.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !G.dlg) return;
      const f = [...layer.querySelectorAll('button, input, textarea, [href]')].filter((x) => !x.disabled && x.getClientRects().length);
      if (!f.length) return;
      const i = f.indexOf(root.activeElement);
      if (e.shiftKey ? i <= 0 : i === f.length - 1) { e.preventDefault(); f[e.shiftKey ? f.length - 1 : 0].focus(); }
    });

    /* ------------------------------------------------------------ input */
    // a finger steers from wherever it lands, on the screen or anywhere on the device's body (touchArea) that isn't a key:
    // the cursor moves by the finger's movement, not to the finger
    let lastX = 0, lastY = 0;
    const dragFrom = opts.touchArea || stage;
    const onDown = (e) => {
      if (e.pointerType === 'mouse' || dragId !== null) return;
      const t = e.composedPath()[0];
      if (t && t.closest && t.closest('button, input, textarea, a, .layer, .front, [data-wact], [data-drag]')) return;
      dragId = e.pointerId; lastX = e.clientX; lastY = e.clientY; input = 'touch';
      try { dragFrom.setPointerCapture(e.pointerId); } catch (err) { /* capture unavailable */ }
      e.preventDefault();
    };
    const onDrag = (e) => {
      if (e.pointerId !== dragId) return;
      const g = TOUCH_GAIN / S;
      P.tx = clamp(P.tx + (e.clientX - lastX) * g, X_MIN, X_MAX);
      P.ty = clamp(P.ty + (e.clientY - lastY) * g, yTop(), Y_MAX);
      lastX = e.clientX; lastY = e.clientY;
    };
    const endDrag = (e) => { if (e.pointerId === dragId) dragId = null; };
    dragFrom.addEventListener('pointerdown', onDown);
    dragFrom.addEventListener('pointermove', onDrag);
    dragFrom.addEventListener('pointerup', endDrag);
    dragFrom.addEventListener('pointercancel', endDrag);
    // the mouse points where the cursor should go, anywhere on the page
    const onMouse = (e) => {
      if (e.pointerType !== 'mouse') return;
      const r = cv.getBoundingClientRect();
      if (!r.width) return;
      P.tx = clamp((e.clientX - r.left) / S, X_MIN, X_MAX);
      P.ty = clamp((e.clientY - r.top) / S, yTop(), Y_MAX);
      input = 'mouse';
    };
    addEventListener('pointermove', onMouse);
    stage.addEventListener('contextmenu', (e) => e.preventDefault());
    lesSkip.addEventListener('click', () => { skipLesson(); focusStage(); });
    // keys reach the game only while its screen (or something in it) has the focus, so typing elsewhere on the page never
    // moves the cursor
    stage.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const typing = e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA');
      if (G.dlg) {
        if (e.key === 'Escape' && G.dlg.onEsc) { e.preventDefault(); G.dlg.onEsc(); return; }
        if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && !typing) { e.preventDefault(); moveSel(e.key === 'ArrowDown' ? 1 : -1); return; }
        if (e.code === 'KeyM' && !typing) toggleSound();
        return;
      }
      if (e.key === 'Escape' || e.code === 'KeyP') { e.preventDefault(); pause(); return; }
      if (e.key === 'Enter' && G.practice) { e.preventDefault(); skipLesson(); return; }
      if (e.code === 'KeyM') { toggleSound(); return; }
      if (e.code === 'Backquote' && DEBUG) { G.debug = !G.debug; return; }
      if (MOVE[e.code]) { e.preventDefault(); keys.add(e.code); input = 'keys'; }
      if (e.key === 'Shift') keys.add('Shift');
    });
    stage.addEventListener('keyup', (e) => { keys.delete(e.code); if (e.key === 'Shift') keys.delete('Shift'); });
    // browsers start sound only from a touch or a key; the first one in the game starts the menu's tune too
    const unlock = () => { sfx.ensure(); stage.removeEventListener('pointerup', unlock); stage.removeEventListener('keydown', unlock); };
    stage.addEventListener('pointerup', unlock);
    stage.addEventListener('keydown', unlock);
    // the fight stops when the visitor turns to something else: another tab, another window, or the rest of the page
    const away = () => { keys.clear(); dragId = null; pause(); };
    const onVis = () => { if (document.hidden) pause(); if (G.mode === 'demo') sfx.musicHold(document.hidden); };
    addEventListener('blur', away);
    document.addEventListener('visibilitychange', onVis);
    // (the device's own keys are part of the game: a finger or a Tab onto them doesn't pause it)
    const ours = (el) => !!el && (root.contains(el) || !!(opts.touchArea && opts.touchArea.contains(el)));
    root.addEventListener('focusout', (e) => { if (!ours(e.relatedTarget)) away(); });
    // the device's body changes size when the window is maximised, restored or turned
    let relayoutRaf = 0;
    const relayout = () => { cancelAnimationFrame(relayoutRaf); relayoutRaf = requestAnimationFrame(layout); };
    const ro = new ResizeObserver(relayout);
    ro.observe(host);
    // a touch screen and a mouse get their own moves in How to play and their own pointer, so the texts are set again when
    // that changes
    const onCoarse = () => { setTexts(); if (G.front && G.front.rebuild) G.front.rebuild(); relayout(); };
    if (coarse.addEventListener) coarse.addEventListener('change', onCoarse);

    /* ------------------------------------------------------------ loop: fixed 1/120 s steps, drawn once a frame */
    // it rests while the window is minimised (the host then has no size); a fight pauses first
    let lastT = 0, acc = 0, fpsE = 60, raf = 0, gone = false;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = lastT ? Math.min(0.05, (now - lastT) / 1000) : 0;
      lastT = now;
      if (!host.offsetWidth) { pause(); return; }
      if (dt > 0) fpsE = lerp(fpsE, 1 / dt, 0.05);
      if (!G.paused && !tooSmall && !(reduceMotion && G.mode === 'demo')) {
        acc += dt;
        let n = 0;
        while (acc >= STEP && n < 10) { update(STEP); acc -= STEP; n += 1; }
        if (n === 10) acc = 0;
      }
      render();
      hudSync();
    }

    /* ------------------------------------------------------------ the game as the portfolio's window holds it */
    // the focus goes to the choice picked on the screen on top, or to the screen itself in a fight
    function focusGame() {
      const box = !layer.hidden ? layer : !front.hidden ? front : null;
      const f = box && (box.querySelector('input:not(:disabled)') || box.querySelector('.menu button:focus') || box.querySelector('.menu .sel') || box.querySelector('.menu button'));
      if (f) focusEl(f); else focusStage();
    }
    function destroy() {
      gone = true;
      cancelAnimationFrame(raf); cancelAnimationFrame(relayoutRaf);
      ro.disconnect();
      removeEventListener('pointermove', onMouse);
      removeEventListener('blur', away);
      document.removeEventListener('visibilitychange', onVis);
      if (coarse.removeEventListener) coarse.removeEventListener('change', onCoarse);
      if (dragFrom !== stage) {
        dragFrom.removeEventListener('pointerdown', onDown); dragFrom.removeEventListener('pointermove', onDrag);
        dragFrom.removeEventListener('pointerup', endDrag); dragFrom.removeEventListener('pointercancel', endDrag);
      }
      if (cardMemo && cardMemo.url) URL.revokeObjectURL(cardMemo.url);
      sfx.close();
      host.remove();
    }
    const api = {
      // host: the device's screen slot; the screen moves into a new one when the window is drawn again (a language switch)
      attach(el) { if (host.parentNode !== el) el.appendChild(host); layout(); },
      setLang(l) {
        lang = l === 'id' ? 'id' : 'en';
        setTexts();
        const child = G.dlg && !G.dlg.front ? G.dlg : null;
        if (G.front && G.front.rebuild) G.front.rebuild();
        if (child && child.rebuild) child.rebuild();
        if (tooSmall) showSmall();
      },
      primary,
      toggleSound,
      isPaused: () => G.paused,
      isMuted: () => sfx.muted,
      focus: focusGame,
      destroy,
    };

    setTexts();
    showMenu();
    raf = requestAnimationFrame(frame);
    // Marquee's letters are Noto Sans Bold: fetched now, so it is there before that fight
    try { document.fonts.load(`700 ${MQ_SIZE}px "Noto Sans"`).catch(() => {}); } catch (e) { /* no font loading API */ }
    if (DEBUG) window.__ssxp = { B, G, P, MQ, sfx, bullets, shots, start: (i) => startGame(i), step: (sec) => { for (let k = 0; k < Math.round(sec * 120); k++) update(STEP); render(); hudSync(); }, run: (sec, fn) => { for (let k = 0; k < Math.round(sec * 120); k++) { if (fn() === false) break; update(STEP); } render(); hudSync(); } };
    return api;

  }

  /* ------------------------------------------------------------ the idle screensaver: XP's Starfield over the whole page
     app.js shows it after the desktop has sat still. Stars fly out of the middle of the screen as XP's did, and the
     pointer hides. Any input wakes it; before it goes, the stars swirl round and fall in at the pointer, the screensaver
     fighting back. The input that wakes it does nothing else, as on a real PC.
     idle({ onWake }) -> { stop() } */
  function idle(opts = {}) {
    const c = document.createElement('canvas');
    c.className = 'ss-idle'; c.setAttribute('aria-hidden', 'true');
    document.body.appendChild(c);
    const x = c.getContext('2d');
    let W = 0, H = 0, k = 1;
    const fit = () => { k = Math.min(window.devicePixelRatio || 1, 2); W = innerWidth; H = innerHeight; c.width = Math.round(W * k); c.height = Math.round(H * k); };
    fit();
    // stars in a box ahead of the eye, coming toward it; XP's Starfield ran about 200 of them
    const stars = [];
    const spawn = (st, far) => { st.x = Math.random() * 2 - 1; st.y = Math.random() * 2 - 1; st.z = far ? 1 : 0.05 + Math.random() * 0.95; };
    for (let i = 0; i < 220; i++) { const st = {}; spawn(st, false); stars.push(st); }
    let raf = 0, last = 0, wake = null, gone = false, lx = null, ly = null, moved = 0;
    const SWIRL = 0.7, FADE = 0.3;
    function frame(now) {
      raf = requestAnimationFrame(frame);
      const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
      last = now;
      let e = 0;
      if (wake) {
        wake.t += dt;
        if (wake.t >= SWIRL + FADE) { end(); return; }
        e = Math.min(1, wake.t / SWIRL);
        c.style.opacity = String(wake.t > SWIRL ? 1 - (wake.t - SWIRL) / FADE : 1);
      }
      const cx = W / 2, cy = H / 2, f = Math.min(W, H) * 0.5;
      x.setTransform(k, 0, 0, k, 0, 0);
      x.fillStyle = '#000'; x.fillRect(0, 0, W, H);
      for (const st of stars) {
        st.z -= dt * 0.35 * (1 - e);
        if (st.z <= 0.02) spawn(st, true);
        let sx = cx + (st.x / st.z) * f, sy = cy + (st.y / st.z) * f;
        if (sx < -40 || sx > W + 40 || sy < -40 || sy > H + 40) { spawn(st, true); continue; }
        if (wake) {
          // round the pointer and into it, the nearer stars turning faster
          const dx = sx - wake.x, dy = sy - wake.y, a = e * e * 2.4 * (1 + 200 / (Math.hypot(dx, dy) + 60)), r = 1 - e * e;
          const ca = Math.cos(a), sa = Math.sin(a);
          sx = wake.x + (dx * ca - dy * sa) * r; sy = wake.y + (dx * sa + dy * ca) * r;
        }
        // a star grows and brightens as it comes near
        const near = 1 - st.z, size = 1 + near * near * 3.6;
        x.fillStyle = `rgba(255,255,255,${Math.min(1, 0.3 + near * 1.2).toFixed(2)})`;
        x.fillRect(sx - size / 2, sy - size / 2, size, size);
      }
    }
    // a mouse has to travel a few pixels, as XP asked, so a bumped desk doesn't count; a key only wakes it, and the page
    // under it hears neither its press nor its release
    const kinds = ['pointermove', 'pointerdown', 'keydown', 'keyup', 'wheel', 'touchstart'];
    const onInput = (ev) => {
      if (gone) return;
      if (ev.type === 'keydown' || ev.type === 'keyup') { ev.preventDefault(); ev.stopImmediatePropagation(); }
      if (wake || ev.type === 'keyup') return;
      if (ev.type === 'pointermove') {
        if (lx !== null) moved += Math.hypot(ev.clientX - lx, ev.clientY - ly);
        lx = ev.clientX; ly = ev.clientY;
        if (moved < 8) return;
      }
      const px = typeof ev.clientX === 'number' ? ev.clientX : lx, py = typeof ev.clientY === 'number' ? ev.clientY : ly;
      wake = { t: 0, x: px === null ? W / 2 : px, y: py === null ? H / 2 : py };
    };
    function end() {
      if (gone) return;
      gone = true;
      cancelAnimationFrame(raf);
      kinds.forEach((kind) => window.removeEventListener(kind, onInput, true));
      window.removeEventListener('resize', fit);
      c.remove();
      if (opts.onWake) opts.onWake();
    }
    kinds.forEach((kind) => window.addEventListener(kind, onInput, { capture: true, passive: !kind.startsWith('key') }));
    window.addEventListener('resize', fit);
    raf = requestAnimationFrame(frame);
    return { stop: end };
  }

  window.ScreenSaverXP = { create, idle };
})();
