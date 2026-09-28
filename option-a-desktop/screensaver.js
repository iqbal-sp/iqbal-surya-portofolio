/* DIRECTION CONTRACT: Screen Saver XP's front door and its desktop ways in
   THESIS: The front door is XP's own Display Properties at the Screen Saver tab: pick a screensaver, watch it on the
   little monitor, press Preview to fight it. It refuses the title-screen default, a logo over a Play button.
   OWN-WORLD: Luna mini windows on the beige face; one working tab with its orange line; etched group boxes captioned in
   Group Caption Blue; an XP drop-down and push buttons; a beige monitor on a stand playing the live screensaver; the
   Leaderboard window's gold, silver and orange podium, grade chips, a Selection Blue "you"; XP tray balloons; Noto Sans.
   STORY: The visitor meets it from the desktop (right-click, Properties; the Starfield that wakes and offers the fight;
   Boss Rush XP's phone gate), sees the screensaver they will fight, knows they play the cursor, checks the board, and
   presses Preview, or picks (Practice) first. A win ends on the grade stamp, the board, and a result card that is the
   same Display Properties with the result on its monitor.
   FIRST VIEWPORT: The dialog, its monitor the largest thing in it, beside the Leaderboard (under it on a phone); Preview
   is the default button, above the fold on a phone.
   FORM: brief-pinned (GAME2_BRIEF.md, Layar dan alur), no roll; code-led.
   FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and
   every shipping raster carrying its provenance */
/* Screen Saver XP: the portfolio's second game, a bullet hell for a phone as much as a desk (GAME2_BRIEF.md). The
   visitor is the mouse cursor, with Boss Rush XP's stickman riding it, against XP's own screensavers one after another:
   Starfield, Mystify, 3D Pipes, Marquee, and last Blank, which the front door shows as ??? until a run has reached it.
   The cursor fires on its own and only the tip of the arrow can be hit; passing close to danger fills the meter, and a
   full meter is Show Desktop.
   The front door is XP's Display Properties at its Screen Saver tab, a live demo of the picked screensaver on its
   monitor, with the Leaderboard beside it (worker/index.js, ?game=ssxp). The arena is 360 by 480 units on one canvas;
   the HUD, the dialogs and the front door are Luna DOM in a shadow root, so their classes and the portfolio's never
   meet. app.js loads this file the first time the game's window opens or the idle screensaver runs, as it loads game.js.
   window.ScreenSaverXP.create({ lang, owner, onContact, onWin, onReboot, onStatus, onRun, trails }) -> game: attach(host),
   setLang(l), newGame(), togglePause(), toggleSound(), isPaused(), isMuted(), help(), board(), can(item), focus(), destroy().
   onWin: a full run is won; the portfolio answers 'new' the first time (the pointer trails go on its desktop).
   onReboot(done): Blank.scr is beaten; the portfolio plays its Welcome screen, then calls done for the result.
   onRun(step): how far a full run got, for the portfolio's day counts: start, boss2 to boss4, final, win, practice,
   practice-done.
   trails: { on(), set(on) }, the portfolio's pointer trails for the switch in Settings; on() is null until they are won.
   can(item): whether the menu's 'pause', 'help' or 'board' would do anything now, so the portfolio greys the rest. */
(() => {
  'use strict';

  /* ------------------------------------------------------------ the stage's own styles, inside its shadow root */
  const CSS = `:host {
  --face: #ece9d8;
  --face-rule: #d8d2bd;
  --shade: #aca899;
  --dark: #444444;
  --muted: #5b5f6b;
  --sel: #316ac5;
  --tip: #ffffe1;
  --line: #7f9db9;
  --btn-line: #003c74;
  --tab-line: #919b9c;
  --ok-ink: #11703a;
  --start-deep: #237a23;
  --group-ink: #0046d5;
  --pane-ink: #215dc6;
  --paper: #ffffff;
  --paper-2: #f3f6fd;
  --desk-deep: #04163f;
  --desk-mid: #0d3a8f;
  --desk-hi: #1d56b8;
  --gold: #f7c948;
  --silver: #d4d7de;
  --orange-rule: #e8943a;
  --tab-hi: #ffc83c;
  --page: #fcfcfe;
  --places: #d3e5fa;
  --places-rule: #95bdee;
  --link: #0b5bd3;
  --cap: linear-gradient(180deg, #0997ff 0%, #0053ee 8%, #0050ee 40%, #0066ff 88%, #0066ff 93%, #005bff 95%, #003dd7 96%, #003dd7 100%);
  --cap-shadow: #0f1089;
  --cap-off: #7a96df;
  --paper-rule: #d8e1f3;
  --frame: inset -1px -1px #00138c, inset 1px 1px #0831d9, inset -2px -2px #001ea0, inset 2px 2px #166aee, inset -3px -3px #003bda, inset 3px 3px #0855dd;
  --caption-btn: radial-gradient(circle at 90% 90%, #0054e9 0%, #2263d5 55%, #4479e4 70%, #a3bbec 90%, #fff 100%);
  --caption-btn-hot: radial-gradient(circle at 90% 90%, #1c6cff 0%, #3a82f5 55%, #5f98f5 70%, #c0d4f8 90%, #fff 100%);
  --caption-btn-down: radial-gradient(circle at 10% 10%, #0042c4 0%, #0a4ccf 55%, #2c61d0 70%, #7b98d9 90%, #d9e3f7 100%);
  --btn-face: linear-gradient(180deg, #ffffff 0%, #ecebe6 86%, #d6d0c5 100%);
  --btn-down: linear-gradient(180deg, #cdcac3 0%, #e3e3db 8%, #e5e5de 94%, #f2f2f1 100%);
  --btn-hot: inset -1px 1px #fff0cf, inset 1px 2px #fdd889, inset -2px 2px #fbc761, inset 2px -2px #e5a01a;
  --btn-focus: inset -1px 1px #cee7ff, inset 1px 2px #98b8ea, inset -2px 2px #bcd4f6, inset 1px -1px #89ade4, inset 2px -2px #89ade4;
  --well: inset 0 0 0 1px var(--line);
  --progress: linear-gradient(180deg, #acedad 0%, #7be47d 25%, #4cda50 50%, #2ed330 60%, #42d845 80%, #76e278 100%);
  --taskbar: linear-gradient(180deg, #1f2f86 0%, #3165c4 3%, #3682e5 6%, #4490e6 10%, #3883e5 14%, #2b71e0 24%, #2157d6 50%, #245ddb 86%, #2158d4 92%, #1d4ec0 96%, #1941a5 100%);
  --tray: linear-gradient(180deg, #0c59b9 1%, #139ee9 6%, #18b5f2 10%, #139beb 14%, #1290e8 19%, #0d8dea 63%, #0d9ff1 81%, #0f9eed 88%, #119be9 91%, #1392e2 94%, #137ed7 97%, #095bc9 100%);
  --taskpane: linear-gradient(180deg, #7ba2e7, #6375d6);
  --pane-head: linear-gradient(90deg, #ffffff, #c6d3f7);
  --ui: "Noto Sans", sans-serif;
  --read: "Noto Sans", sans-serif;
  color-scheme: light;
}
/* the game fills its window's body, the stage in the middle of it on the night desk around the arena */
:host { position: relative; display: grid; place-items: center; width: 100%; height: 100%; overflow: hidden; background: radial-gradient(120% 90% at 18% 0%, var(--desk-hi), var(--desk-mid) 45%, var(--desk-deep) 85%) var(--desk-deep); color: #000; font: 12px/1.35 var(--ui); -webkit-text-size-adjust: 100%; }
*, *::before, *::after { box-sizing: border-box; }
button { font: inherit; color: inherit; }
::selection { background: var(--sel); color: #fff; }
/* Luna scrollbars, as the portfolio's style.css draws them: a pale blue rounded thumb with a ribbed grip */
::-webkit-scrollbar { width: 17px; height: 17px; }
::-webkit-scrollbar-track:vertical { background: linear-gradient(90deg, #eeede5, #fcfcfa 25%, #f7f6f1 75%, #eeede5); }
::-webkit-scrollbar-track:horizontal { background: linear-gradient(180deg, #eeede5, #fcfcfa 25%, #f7f6f1 75%, #eeede5); }
::-webkit-scrollbar-thumb { border: 1px solid #fff; border-radius: 3px; box-shadow: inset 0 0 0 1px #9eb7f2; background-repeat: no-repeat; background-position: center; }
::-webkit-scrollbar-thumb:vertical { background-color: #c1d3fb; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='8' height='8' shape-rendering='crispEdges'%3E%3Cpath d='M0 0h7v1H0zM0 2h7v1H0zM0 4h7v1H0zM0 6h7v1H0z' fill='%23eef4fe'/%3E%3Cpath d='M1 1h7v1H1zM1 3h7v1H1zM1 5h7v1H1zM1 7h7v1H1z' fill='%238cb0f8'/%3E%3C/svg%3E"), linear-gradient(90deg, #c9d8fc, #bdd0fb 50%, #b0c6f7); }
::-webkit-scrollbar-thumb:hover { box-shadow: inset 0 0 0 1px #7fa0ea; }
::-webkit-scrollbar-corner { background: var(--face); }
@supports (-moz-appearance: none) { * { scrollbar-color: #bdd0fb #f7f6f1; } }
[hidden] { display: none !important; }

/* the Luna title bar the game's own dialogs wear */
.title { flex: 0 0 30px; display: flex; align-items: center; gap: 5px; margin: 0 -3px; padding: 0 5px 0 7px; border-radius: 7px 7px 0 0; background: var(--cap); color: #fff; text-shadow: 1px 1px var(--cap-shadow); font: 700 14px/1 var(--ui); user-select: none; -webkit-user-select: none; }
.t-ico { display: flex; flex: none; }
.t-ico svg { width: 16px; height: 16px; }
.t-text { flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tb { position: relative; width: 21px; height: 21px; padding: 0; border: 1px solid #fff; border-radius: 3px; display: grid; place-items: center; background: var(--caption-btn); color: #fff; font: 700 12px/1 var(--ui); text-shadow: none; cursor: pointer; }
.tb:hover { background: var(--caption-btn-hot); }
.tb:active { background: var(--caption-btn-down); }
.tb:focus-visible { outline: 1px dotted #fff; outline-offset: -5px; }
@media (pointer: coarse) { .tb::after { content: ""; position: absolute; inset: -12px; } }

/* the stage: the arena, and the HUD around it (strips in portrait, task panes beside it in landscape) */
.stage { position: relative; flex: none; margin: auto; display: grid; background: #000; overflow: hidden; outline: none; touch-action: none; user-select: none; -webkit-user-select: none; -webkit-touch-callout: none; }
.stage.portrait { grid-template-columns: minmax(0, 1fr); grid-template-rows: 28px var(--ah) minmax(0, 1fr) 48px; grid-template-areas: "top" "arena" "thumb" "bar"; }
.stage.landscape { grid-template-columns: var(--pane) var(--aw) var(--pane); grid-template-rows: var(--ah); grid-template-areas: "left arena right"; }
.stage.portrait .pane, .stage.landscape .strip, .stage.landscape .bar, .stage.landscape .thumb { display: none; }
.arena { grid-area: arena; position: relative; justify-self: center; width: var(--aw); height: var(--ah); }
.arena canvas { display: block; width: 100%; height: 100%; }
.stage.fight .arena canvas { cursor: none; }

.strip { grid-area: top; display: flex; align-items: center; min-width: 0; padding: 0 12px; background: var(--face); border-bottom: 1px solid var(--face-rule); }
/* the thumb's pad under the arena on a phone: its own ground and a rim, so the arena's bottom edge shows */
.thumb { grid-area: thumb; display: grid; place-items: center; min-height: 0; overflow: hidden; background: var(--desk-deep); box-shadow: inset 0 1px rgba(124, 129, 140, .55); }
.thumb span { padding: 8px 12px; border: 1px dotted rgba(214, 226, 248, .35); border-radius: 4px; color: rgba(214, 226, 248, .65); font: 12px var(--ui); }
/* under 48px of room there is no pad: the row stays black, and the first fight's balloon says to drag anywhere */
.stage.nopad .thumb { visibility: hidden; }
.bar { grid-area: bar; display: flex; align-items: center; gap: 8px; min-width: 0; padding-left: 8px; background: var(--taskbar); color: #fff; }
.grow { flex: 1; }
.tray { align-self: stretch; display: flex; align-items: center; gap: 4px; padding: 0 8px 0 12px; background: var(--tray); border-left: 1px solid #0c59b9; box-shadow: inset 1px 0 #18bbff; }

.pane { display: flex; flex-direction: column; gap: 12px; min-height: 0; padding: 12px; background: var(--taskpane); overflow: auto; }
.pane-l { grid-area: left; }
.pane-r { grid-area: right; }
.panel { background: var(--paper-2); border-radius: 3px 3px 0 0; box-shadow: 0 1px 2px rgba(0, 0, 40, .25); }
.panel h2 { margin: 0; padding: 8px 12px; border-radius: 3px 3px 0 0; background: var(--pane-head); color: var(--pane-ink); font: 700 12px/1.3 var(--ui); }
.panel .pb { display: grid; gap: 8px; padding: 12px; }

/* HUD pieces: one set, moved between the strips and the panes when the layout turns */
.hud-boss { flex: 1; display: flex; align-items: center; gap: 8px; min-width: 0; }
.panel .hud-boss { flex-direction: column; align-items: stretch; gap: 4px; }
/* in the pane's column the bar keeps its own height instead of flexing to nothing */
.panel .pbar { flex: none; }
.hb-name { font: 700 12px var(--ui); white-space: nowrap; }
.hb-phase { color: var(--muted); font-size: 12px; white-space: nowrap; }
.pbar { position: relative; flex: 1; height: 16px; min-width: 60px; padding: 2px; border: 1px solid var(--dark); border-radius: 3px; background: #fff; }
/* a fill ends on a 1px Start Green Deep line, so how much is left reads against the white by more than its hue */
.pbar i { display: block; width: 100%; height: 100%; background: repeating-linear-gradient(90deg, transparent 0 8px, #fff 8px 10px), var(--progress); box-shadow: inset -1px 0 var(--start-deep); }
.pbar s { position: absolute; top: 1px; bottom: 1px; left: 50%; width: 1px; background: var(--dark); }

.hp { display: flex; gap: 2px; padding: 2px; background: #fff; box-shadow: var(--well); }
.hp i { position: relative; width: 11px; height: 16px; background: var(--face-rule); overflow: hidden; }
/* a full block is edged in Start Green Deep, so full and empty differ in lightness, not only in hue */
.hp i.on { background: var(--progress); box-shadow: inset 0 0 0 1px var(--start-deep); }
.hp i em { position: absolute; left: 0; right: 0; bottom: 0; height: 0; background: var(--progress); opacity: .5; }
.hp i.lost { animation: lost .5s ease-out; }
@keyframes lost { from { background: #ff3b30; } }

.hud-sd { display: flex; align-items: center; gap: 8px; }
.sd { position: relative; flex: none; width: 40px; height: 40px; padding: 0 0 8px; border: 1px solid var(--btn-line); border-radius: 3px; background: var(--btn-face); display: grid; place-items: center; cursor: pointer; }
.sd svg { width: 24px; height: 24px; }
.sd .meter { position: absolute; left: 4px; right: 4px; bottom: 4px; height: 5px; background: #fff; box-shadow: inset 0 0 0 1px var(--dark); }
.sd .meter i { display: block; width: 0; height: 100%; background: var(--progress); box-shadow: inset -1px 0 var(--start-deep); }
/* drawn at 40px so the phone's bar can be 48px tall; a finger still gets 44px */
@media (pointer: coarse) { .sd::after { content: ""; position: absolute; inset: -3px; } }
.sd.ready { box-shadow: var(--btn-hot); }
.sd:disabled { cursor: default; }
.sd:disabled svg { opacity: .5; filter: grayscale(1); }
.sd:not(:disabled):active { background: var(--btn-down); }
.sd:focus-visible { outline: 1px dotted #000; outline-offset: -5px; }
.sd-lbl { display: grid; gap: 4px; font-size: 12px; }
.sd-lbl kbd { justify-self: start; }
.stage.portrait .sd-lbl { display: none; }
/* a touch screen has no Space key to show */
@media (pointer: coarse) { .sd-lbl kbd { display: none; } }

.hud-clock { display: flex; align-items: baseline; justify-content: space-between; gap: 8px; font-variant-numeric: tabular-nums; }
.hud-clock .lbl { color: var(--muted); }
/* on a phone the clock sits on the taskbar's blue beside the tray: on the tray's lighter blue white is only 3.3:1 */
.bar > .hud-clock { padding: 0 4px; color: #fff; }
.bar > .hud-clock .lbl { display: none; }
.bar > .hud-clock b { font-weight: 400; }
.hud-stats { display: grid; grid-template-columns: 1fr auto; gap: 4px 8px; margin: 0; }
.hud-stats dt { color: var(--muted); }
.hud-stats dd { margin: 0; font-weight: 700; text-align: right; font-variant-numeric: tabular-nums; }
.hud-keys { display: grid; gap: 4px; color: var(--dark); font-size: 12px; }
.hud-keys p { margin: 0; }
/* a pane too short for the whole legend drops its last line, the reminder the balloons and the dialogs also give */
.stage.short .hud-keys p:last-child { display: none; }

.snd { flex: none; display: flex; align-items: center; gap: 4px; min-width: 32px; min-height: 32px; padding: 0 8px; border: 0; border-radius: 3px; background: transparent; cursor: pointer; }
.snd svg { width: 16px; height: 16px; flex: none; }
.snd:focus-visible { outline: 1px dotted currentColor; outline-offset: -3px; }
.tray .snd { justify-content: center; color: #fff; }
.tray .snd:hover { background: rgba(255, 255, 255, .16); }
.tray .snd-t { display: none; }
.panel .snd { justify-self: start; padding: 0 8px; border: 1px solid var(--btn-line); background: var(--btn-face); color: #000; }
.panel .snd:hover { box-shadow: var(--btn-hot); }
@media (pointer: coarse) { .snd { min-width: 44px; min-height: 44px; } }

kbd { display: inline-block; padding: 0 8px; line-height: 16px; border: 1px solid var(--tab-line); border-radius: 3px; background: var(--btn-face); color: #000; font: 12px var(--ui); white-space: nowrap; }

/* callouts over play: a selected label, as DESIGN.md's Announcement rule draws them */
.chips { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
/* the first fight's pointers: XP notification balloons, one at the core and one at the hotspot */
.tips { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.tip { position: absolute; left: 0; top: 0; width: max-content; max-width: 200px; padding: 8px 12px; border: 1px solid #000; border-radius: 7px; background: var(--tip); color: #000; font: 12px/1.35 var(--ui); box-shadow: 2px 3px 6px rgba(0, 0, 0, .35); opacity: 0; transition: opacity .25s ease-out; }
.tip b { display: block; margin-bottom: 4px; }
.tip.on { opacity: 1; }
.tip::before, .tip::after { content: ""; position: absolute; left: calc(var(--sx, 24px) - 7px); border: 7px solid transparent; }
.tip.up::before { top: -14px; border-bottom-color: #000; }
.tip.up::after { top: -12px; border-bottom-color: var(--tip); }
.tip.down::before { bottom: -14px; border-top-color: #000; }
.tip.down::after { bottom: -12px; border-top-color: var(--tip); }
@media (prefers-reduced-motion: reduce) { .tip { transition: none; } }
.chip { position: absolute; left: 50%; top: 40%; translate: -50% -50%; padding: 4px 12px; background: var(--sel); color: #fff; font: 700 16px/1.25 var(--ui); white-space: nowrap; outline: 1px dotted #fff; outline-offset: -3px; box-shadow: 0 6px 14px -6px rgba(0, 0, 60, .8); animation: chip var(--dur, 1.5s) ease-out forwards; }
/* the dotted rectangle is one device pixel wide at any density, as a selection is (DESIGN.md) */
@media (min-resolution: 2dppx) { .chip { outline-width: 0.5px; } }
.chip.big { top: 34%; padding: 8px 16px; font-size: 24px; }
.chip.low { top: 78%; font-size: 14px; }
@keyframes chip { 0% { opacity: 0; transform: scale(1.18); } 12% { opacity: 1; transform: scale(1); } 60% { opacity: 1; } 100% { opacity: 0; } }
@keyframes chip-still { 0%, 60% { opacity: 1; } 100% { opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .chip { animation-name: chip-still; } }

/* dialogs: Luna mini windows over the stage; one taller than the window scrolls inside itself */
.layer { position: absolute; inset: 0; z-index: 6; display: grid; grid-template-columns: minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); place-items: center; padding: 16px; background: rgba(4, 22, 63, .35); }
.mini { width: min(340px, 100%); max-height: 100%; display: flex; flex-direction: column; padding: 0 3px 3px; border-radius: 8px 8px 0 0; background: var(--face); box-shadow: var(--frame), 0 20px 34px -18px rgba(0, 0, 0, .7); }
.mini.wide { width: min(420px, 100%); }
.mini > .title { flex-basis: 26px; font-size: 12px; }
.mini > .title svg { width: 14px; height: 14px; }
.dlg { min-height: 0; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding: 16px; }
.dlg p { margin: 0; font: 14px/1.5 var(--read); text-wrap: pretty; }
.dlg .lead { font: 700 14px/1.3 var(--ui); }
.dlg .note { color: var(--dark); font-size: 12px; }
.dlg-row { display: flex; gap: 12px; align-items: flex-start; }
.dlg-row > svg { width: 32px; height: 32px; flex: none; }
.dlg-row > div:not(.rank) { display: grid; gap: 8px; min-width: 0; }
.btns { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; }
/* a dialog taller than the window scrolls under its buttons, which keep to its foot (-16px: a sticky box stops at the
   dialog's padding, and this band carries that padding itself) */
.dlg > .btns { position: sticky; bottom: -16px; z-index: 1; margin: -8px -16px -16px; padding: 8px 16px 16px; background: var(--face); }
.btn { min-width: 75px; min-height: 24px; padding: 3px 12px; border: 1px solid var(--btn-line); border-radius: 3px; background: var(--btn-face); color: #000; font: 12px var(--ui); display: inline-flex; align-items: center; justify-content: center; gap: 4px; white-space: nowrap; cursor: pointer; }
.btn:disabled, .btn:disabled:hover { color: var(--shade); cursor: default; box-shadow: none; }
.btn.default { box-shadow: var(--btn-focus); }
.btn:hover { box-shadow: var(--btn-hot); }
.btn:active { background: var(--btn-down); box-shadow: none; }
.btn:focus-visible { outline: 1px dotted #000; outline-offset: -4px; }
@media (pointer: coarse) { .btn { min-height: 44px; } }
.keys { display: grid; grid-template-columns: auto 1fr; gap: 8px 12px; align-items: baseline; margin: 0; padding: 12px; background: var(--paper); box-shadow: var(--well); }
.keys dt { margin: 0; }
.keys.stack { grid-template-columns: minmax(0, 1fr); gap: 4px; }
.keys.stack dt { font: 700 12px/1.3 var(--ui); }
.keys.stack dt:not(:first-child) { margin-top: 8px; }
.keys dd { margin: 0; font: 12px/1.4 var(--read); }
.stats { display: grid; grid-template-columns: 1fr auto; gap: 4px 16px; margin: 0; padding: 8px 12px; background: var(--paper); box-shadow: var(--well); }
.stats dt { color: var(--muted); }
.stats dd { margin: 0; font-weight: 700; text-align: right; font-variant-numeric: tabular-nums; }
.rank { flex: none; width: 56px; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 8px 0; border-radius: 3px; background: var(--muted); color: #fff; box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .25), inset 0 2px rgba(255, 255, 255, .28); animation: stamp .45s cubic-bezier(.2, .8, .3, 1) .2s both; }
.rank small { font: 12px var(--ui); }
.rank b { font: 700 32px/1 var(--ui); }
.rank[data-rank="S"] { background: var(--gold); color: #000; }
.rank[data-rank="A"] { background: var(--ok-ink); }
.rank[data-rank="B"] { background: var(--group-ink); }
@keyframes stamp { from { opacity: 0; transform: scale(1.7) rotate(-10deg); } 70% { opacity: 1; transform: scale(.94) rotate(1deg); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) { .rank { animation: none; } }
/* back on the win screen from the share dialog or the board, the stamp is already down */
.rank.still { animation: none; }
.lb-all { display: grid; gap: 8px; container-type: inline-size; }
.lb-all .lb-note { color: var(--muted); font-size: 12px; }
/* the portfolio's offer to talk, in an information bar with its one button */
.cta { display: flex; align-items: center; gap: 12px; padding: 8px 8px 8px 12px; border: 1px solid var(--shade); background: var(--tip); }
.cta p { flex: 1; min-width: 0; font-size: 12px; }
.cta .btn { flex: none; }
/* the first win's reward, under the result */
.gift { display: flex; align-items: center; gap: 4px; color: var(--group-ink); font-weight: 700; }
.gift svg { flex: none; }
.copy { display: grid; gap: 4px; color: var(--dark); }
.copy textarea { width: 100%; resize: none; padding: 4px 8px; border: 1px solid var(--line); font: 12px/1.3 var(--ui); }

.small { position: absolute; inset: 0; z-index: 10; display: grid; place-items: center; padding: 16px; }
/* a hint under the cursor can be longer than a callout, so it wraps */
.chip.low { width: max-content; max-width: calc(100% - 32px); white-space: normal; text-align: center; }

/* practice: XP Setup's band at the top of the arena, in the welcome screen's navy with the orange rule under it */
.les { position: absolute; left: 0; right: 0; top: 0; display: grid; gap: 4px; padding: 8px 12px 12px; background: #00309c; color: #fff; }
.les::after { content: ""; position: absolute; left: 0; right: 0; top: 100%; height: 2px; background: linear-gradient(90deg, rgba(232, 148, 58, 0), #e8943a 30%, #e8943a 70%, rgba(232, 148, 58, 0)); }
.les-h { display: flex; align-items: center; gap: 8px; }
.les-h b { flex: 1; min-width: 0; font: 700 14px/1.3 var(--ui); }
.les p { margin: 0; font: 12px/1.4 var(--ui); text-wrap: pretty; }
.les .les-e { color: #a6c4f7; }
.les .btn { min-width: 0; min-height: 24px; padding: 0 12px; }
@media (pointer: coarse) { .les .btn { min-height: 44px; } }

/* the front door: Display Properties at its Screen Saver tab, the Leaderboard beside it (under it on a phone), over the
   screensaver running in the window */
.front { position: absolute; inset: 0; z-index: 5; display: grid; place-items: start center; overflow-y: auto; padding: 16px; background: rgba(4, 22, 63, .6); }
/* while the front door shows, the window holds only the screensaver it previews, dimmed behind it; the fight's HUD waits */
.stage.demo :is(.strip, .bar, .pane, .thumb) { visibility: hidden; }
/* under reduced motion the demo holds still on one frame, and only the little monitor shows it */
@media (prefers-reduced-motion: reduce) { .stage.demo .arena { visibility: hidden; } }
/* a dialog the front door opens floats over it without a scrim, and the front door goes inactive behind, as XP left
   the window that opened a property sheet */
.layer.over { background: transparent; }
.front.inactive .mini > .title { background: var(--cap-off); color: var(--paper-rule); text-shadow: none; }
.front.inactive .mini > .title .tb { opacity: .6; }
.fd-wrap { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: center; gap: 16px; width: 100%; margin-block: auto; }
/* side by side the board takes what the dialog leaves; stacked on a phone it matches the dialog's width */
.fd-dp { flex: 0 1 380px; min-width: 0; max-height: none; }
.fd-lb { flex: 1 1 260px; min-width: 0; max-width: 380px; max-height: none; }
.dp-body { padding: 8px; }
/* XP's tab strip, holding the one tab that works (DESIGN.md), joined to its page */
.xtabs { display: flex; padding-left: 4px; }
.xtab { position: relative; z-index: 1; margin-bottom: -1px; padding: 4px 12px 5px; border: 1px solid var(--tab-line); border-bottom: 0; border-radius: 3px 3px 0 0; background: var(--page); font: 12px var(--ui); box-shadow: inset 0 1px var(--tab-hi), inset 0 3px var(--orange-rule); }
.xpage { display: grid; gap: 12px; padding: 12px; border: 1px solid var(--tab-line); background: var(--page); }
/* the tab's monitor: a beige case on a stand, its screen playing whatever the drop-down picks */
.mon { justify-self: center; display: grid; justify-items: center; }
.mon-case { position: relative; padding: 12px 12px 16px; border-radius: 8px; background: linear-gradient(180deg, #fff, var(--face) 16%, var(--face-rule)); box-shadow: inset 0 0 0 1px var(--shade), inset 1px 1px #fff; }
.mon-case::after { content: ""; position: absolute; right: 12px; bottom: 6px; width: 4px; height: 4px; border-radius: 50%; background: #4cda50; }
.mon-case canvas { display: block; width: 192px; height: 144px; border-radius: 3px; background: #000; box-shadow: 0 0 0 2px #1b1d22; }
.mon-neck { width: 32px; height: 12px; background: linear-gradient(90deg, var(--face-rule), var(--face) 50%, var(--face-rule)); box-shadow: inset 1px 0 var(--shade), inset -1px 0 var(--shade); }
.mon-foot { width: 96px; height: 8px; border-radius: 4px 4px 2px 2px; background: linear-gradient(180deg, var(--face), var(--face-rule)); box-shadow: inset 0 0 0 1px var(--shade); }
/* XP's etched group box, captioned in Group Caption Blue */
.grp { display: grid; gap: 8px; min-width: 0; margin: 0; padding: 8px 12px 12px; border: 1px solid var(--face-rule); border-radius: 3px; box-shadow: inset 1px 1px #fff; }
.grp legend { margin-left: -4px; padding: 0 4px; color: var(--group-ink); font: 12px var(--ui); }
.grp p { margin: 0; color: var(--dark); font: 12px/1.4 var(--ui); text-wrap: pretty; }
/* the drop-down takes the row; its buttons sit under it on the right, the default one last, as XP set them */
.grp-row { display: flex; flex-wrap: wrap; justify-content: flex-end; align-items: center; gap: 8px; }
.grp-row .btn { min-width: 0; }
/* XP's combo box: a white field with Luna's drop button inside its right edge; the native list still opens on a phone */
.grp-row select {
  flex: 1 1 100%; min-width: 0; min-height: 24px; padding: 2px 24px 2px 4px; border: 1px solid var(--line); border-radius: 0; color: #000; font: 12px var(--ui); cursor: pointer;
  -webkit-appearance: none; appearance: none;
  background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='5' shape-rendering='crispEdges'%3E%3Cpath d='M0 0h2v1H0zM7 0h2v1H7zM1 1h2v1H1zM6 1h2v1H6zM2 2h2v1H2zM5 2h2v1H5zM3 3h3v1H3zM4 4h1v1H4z' fill='%234d6185'/%3E%3C/svg%3E") no-repeat right 5px center,
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 17 20' preserveAspectRatio='none'%3E%3Cdefs%3E%3ClinearGradient id='g'%3E%3Cstop stop-color='%23c9d8fc'/%3E%3Cstop offset='.5' stop-color='%23bdd0fb'/%3E%3Cstop offset='1' stop-color='%23b0c6f7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='.5' y='.5' width='16' height='19' rx='2' fill='url(%23g)' stroke='%239eb7f2' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E") no-repeat right 1px center / 17px calc(100% - 2px),
    var(--paper);
}
.grp-row select:hover { border-color: #7fa0ea; }
.grp-row select:focus-visible { outline: 1px dotted #000; outline-offset: -4px; }
/* on a touch screen the field is 44px tall, so the drop button goes square to it and its arrow doubles */
@media (pointer: coarse) {
  .grp-row select {
    min-height: 44px; padding-right: 52px; font-size: 16px;
    background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='9' height='5' shape-rendering='crispEdges'%3E%3Cpath d='M0 0h2v1H0zM7 0h2v1H7zM1 1h2v1H1zM6 1h2v1H6zM2 2h2v1H2zM5 2h2v1H5zM3 3h3v1H3zM4 4h1v1H4z' fill='%234d6185'/%3E%3C/svg%3E") no-repeat right 13px center / 18px 10px,
      url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 17 20' preserveAspectRatio='none'%3E%3Cdefs%3E%3ClinearGradient id='g'%3E%3Cstop stop-color='%23c9d8fc'/%3E%3Cstop offset='.5' stop-color='%23bdd0fb'/%3E%3Cstop offset='1' stop-color='%23b0c6f7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='.5' y='.5' width='16' height='19' rx='2' fill='url(%23g)' stroke='%239eb7f2' vector-effect='non-scaling-stroke'/%3E%3C/svg%3E") no-repeat right 1px center / 42px calc(100% - 2px),
      var(--paper);
  }
}
.grp .best b { color: #000; font-variant-numeric: tabular-nums; }
/* a grade as a chip, in the colours of the win screen's stamp */
.gd { display: inline-grid; place-items: center; width: 20px; height: 16px; border-radius: 3px; font: 700 12px/1 var(--ui); vertical-align: -3px; }
.gd.gS { background: var(--gold); color: #000; }
.gd.gA { background: var(--ok-ink); color: #fff; }
.gd.gB { background: var(--group-ink); color: #fff; }
.gd.gC { background: var(--muted); color: #fff; }
/* the Leaderboard window: Boss Rush XP's board, the top three on a podium and the rest in a well */
.lb { gap: 8px; padding: 12px; }
.lb p { margin: 0; font: 12px/1.4 var(--ui); text-wrap: pretty; }
.lb .lb-note { color: var(--muted); }
.lb-podium { display: flex; align-items: flex-end; gap: 8px; margin: 0; padding: 8px 8px 0; list-style: none; border: 1px solid var(--places-rule); background: linear-gradient(180deg, #fff, var(--places)); }
.lb-place { flex: 1 1 0; min-width: 0; display: grid; justify-items: center; gap: 4px; font: 12px var(--ui); text-align: center; }
.lb-place.p1 { order: 2; }
.lb-place.p2 { order: 1; }
.lb-place.p3 { order: 3; }
.lb-ava { width: 28px; height: 28px; border: 2px solid #fff; border-radius: 3px; box-shadow: 0 0 0 1px var(--shade); }
.lb-q { width: 28px; height: 28px; display: grid; place-items: center; border: 1px dashed var(--shade); border-radius: 3px; background: #fff; color: var(--muted); font: 700 16px/1 var(--ui); }
.lb-name { max-width: 100%; padding: 0 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-weight: 700; }
.lb-place.me .lb-name { background: var(--sel); color: #fff; }
.lb-name small, .lb-ranks small { font-size: 12px; font-weight: 400; }
.lb-time { display: flex; align-items: center; gap: 4px; font-variant-numeric: tabular-nums; }
.lb-step { justify-self: stretch; display: grid; place-items: center; border: 1px solid var(--shade); border-bottom: 0; border-radius: 3px 3px 0 0; font: 700 16px/1 var(--ui); }
.lb-place.p1 .lb-step { height: 36px; background: var(--gold); }
.lb-place.p2 .lb-step { height: 28px; background: var(--silver); }
.lb-place.p3 .lb-step { height: 20px; background: var(--orange-rule); }
/* an open place's step fades to 60%, its number doesn't */
.lb-place.open .lb-step { border-color: rgba(172, 168, 153, .6); }
.lb-place.p1.open .lb-step { background: rgba(247, 201, 72, .6); }
.lb-place.p2.open .lb-step { background: rgba(212, 215, 222, .6); }
.lb-place.p3.open .lb-step { background: rgba(232, 148, 58, .6); }
.lb-ranks { display: grid; margin: 0; padding: 0; list-style: none; background: #fff; box-shadow: var(--well); font: 12px var(--ui); }
.lb-ranks li { display: grid; grid-template-columns: 24px minmax(0, 1fr) auto 20px; align-items: center; gap: 8px; height: 24px; padding: 0 8px; }
.lb-ranks li + li { border-top: 1px solid var(--places); }
.lb-ranks .n { text-align: right; color: var(--muted); font-variant-numeric: tabular-nums; }
.lb-ranks .nm { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.lb-ranks .t { font-variant-numeric: tabular-nums; }
.lb-ranks li.me, .lb-ranks li.me .n { background: var(--sel); color: #fff; }
.lb-ranks li.gap { display: block; height: 16px; line-height: 14px; text-align: center; color: var(--muted); }
.lb-empty { display: grid; justify-items: center; gap: 8px; text-align: center; }
.lb-empty .lb-podium { justify-self: stretch; }
.lb-empty h3 { margin: 0; color: var(--group-ink); font: 700 14px/1.3 var(--ui); }
.lb-empty > svg { width: 32px; height: 32px; }
.lb-cta { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; }
.lb-foot { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: baseline; gap: 4px 8px; color: var(--muted); font: 12px var(--ui); }
.lb-link { position: relative; padding: 0; border: 0; background: none; color: var(--link); font: inherit; text-decoration: underline; text-underline-offset: 2px; cursor: pointer; }
.lb-link:focus-visible { outline: 1px dotted #000; outline-offset: 1px; }
@media (pointer: coarse) { .lb-link::after { content: ""; position: absolute; inset: -14px -8px; } }
/* room under the board's last line for See all's touch area, so the window doesn't scroll by those few pixels */
@media (pointer: coarse) { .lb { padding-bottom: 16px; } }
.lb-ranks li.me .gd, .lb-place.me .gd { box-shadow: 0 0 0 1px #fff; }
.lb-bar { height: 16px; padding: 2px; border: 1px solid var(--dark); border-radius: 3px; background: #fff; }
.lb-bar i { display: block; width: 0; height: 100%; background: repeating-linear-gradient(90deg, transparent 0 8px, #fff 8px 10px), var(--progress); animation: lb-load 1.5s steps(14, end) forwards; }
@keyframes lb-load { to { width: 100%; } }
@media (prefers-reduced-motion: reduce) { .lb-bar i { width: 100%; animation: none; } }
.lb-table { width: 100%; table-layout: fixed; border-collapse: collapse; background: #fff; box-shadow: var(--well); font: 12px var(--ui); }
.lb-table th, .lb-table td { height: 24px; padding: 0 8px; text-align: left; }
.lb-table th { background: var(--face); border-bottom: 1px solid var(--face-rule); font-weight: 400; }
.lb-table tr + tr td { border-top: 1px solid var(--places); }
.lb-table .num { text-align: right; font-variant-numeric: tabular-nums; }
.lb-table tr.me td { background: var(--sel); color: #fff; }
/* the full board keeps inside its dialog: fixed columns, a long name cut with an ellipsis, no Time or Hits when narrow */
.lb-table .c-rank { width: 32px; }
.lb-table .c-time, .lb-table .c-score { width: 72px; }
.lb-table .c-hits { width: 40px; }
.lb-table .c-grade { width: 56px; }
.lb-table td.c-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@container (max-width: 359px) { .lb-table .c-time, .lb-table .c-hits { display: none; } }
.chk { display: flex; align-items: center; gap: 8px; font: 12px var(--ui); }
.chk input { width: 13px; height: 13px; margin: 0; accent-color: #21a121; }
@media (pointer: coarse) { .chk { min-height: 44px; } }
/* the player's name: XP's text box under its label, the rule or what went wrong under it */
.name-form { display: grid; gap: 8px; }
.field { display: grid; gap: 4px; min-width: 0; font: 12px var(--ui); }
.field input { width: 100%; min-height: 24px; padding: 2px 4px; border: 1px solid var(--line); border-radius: 0; background: var(--paper); color: #000; font: 12px var(--ui); }
.field input:focus-visible { outline: 1px solid var(--sel); outline-offset: 0; }
.field input:disabled { background: var(--face); color: var(--shade); }
@media (pointer: coarse) { .field input { min-height: 44px; font-size: 16px; } }
.name-row { display: flex; align-items: flex-end; gap: 8px; }
.name-row .field { flex: 1; }
.err { display: flex; align-items: flex-start; gap: 4px; }
.err svg { flex: none; }
/* Settings: whose name the runs are saved under, and the way to change it */
.name-now { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px; }
/* the win screen's place on the board, in a white well; empty until there is something to say */
.lb-run { display: grid; gap: 8px; justify-items: start; padding: 8px 12px; background: var(--paper); box-shadow: var(--well); }
.lb-run:empty { display: none; }
.dlg .lb-run p { font: 12px/1.4 var(--ui); }
.lb-run .name-form { justify-self: stretch; }
/* the share dialog: the card's preview, its room kept while it draws, and the ways to send it */
.card-frame { display: grid; place-items: center; aspect-ratio: 1200 / 630; padding: 1px; background: var(--paper); box-shadow: var(--well); }
.card-frame img { display: block; width: 100%; height: auto; }
.dlg .card-frame p { color: var(--muted); font-size: 12px; }
.share-row { display: flex; flex-wrap: wrap; gap: 8px; }
.dlg .share-msg { font-size: 12px; }
.share-msg:empty { display: none; }
.dlg .tipbox { padding: 4px 8px; border: 1px solid var(--shade); background: var(--tip); font-size: 12px; }
/* Preview: XP's zoom rectangle, drawn from the little monitor out to the arena */
.zoomr { position: absolute; z-index: 7; border: 2px solid #808080; mix-blend-mode: difference; pointer-events: none; }

/* Blank.scr: the monitor goes dark round the arena too; the arena and what the player reads stay lit */
.stage::after { content: ""; position: absolute; inset: 0; z-index: 1; background: rgba(0, 0, 0, .62); opacity: 0; pointer-events: none; transition: opacity 1.2s ease; }
.stage.blank::after { opacity: 1; }
.arena, .hud-boss, .hp, .hud-sd, .hud-clock { position: relative; z-index: 2; }
/* the lit pieces now sit on the dimmed bars, so their text turns light */
.stage.blank .hb-name, .stage.blank .hud-clock, .stage.blank .sd-lbl { color: #fff; }
.stage.blank .hb-phase, .stage.blank .hud-clock .lbl { color: #d6e2f8; }
/* so do the buttons that still work, the run's numbers, the key legend and the panels' heads; the panels stay dark */
.stage.blank :is(.snd, .hud-stats, .hud-keys, .panel h2) { position: relative; z-index: 2; }
.stage.blank .panel h2 { background: transparent; color: #fff; }
.stage.blank .hud-stats dd { color: #fff; }
.stage.blank .hud-stats dt, .stage.blank .hud-keys { color: #d6e2f8; }
@media (prefers-reduced-motion: reduce) { .stage::after { transition: none; } }`;
  const MARKUP = `<div class="stage portrait" id="stage" tabindex="-1">
  <div class="strip" id="top"></div>
  <aside class="pane pane-l" id="paneL"></aside>
  <div class="arena" id="arena"><canvas id="cv" role="img"></canvas><div class="chips" id="chips" aria-live="polite"></div><div class="tips" aria-live="polite"><div class="tip up" id="tipCore"></div><div class="tip down" id="tipCur"></div></div><div class="les" id="les" aria-live="polite" hidden><div class="les-h"><b id="lesName"></b><button class="btn" id="lesSkip" type="button"></button></div><p id="lesHow"></p><p class="les-e" id="lesEta"></p></div></div>
  <aside class="pane pane-r" id="paneR"></aside>
  <div class="thumb" id="thumb"><span id="thumbHint"></span></div>
  <div class="bar" id="bar"></div>
  <div class="front" id="front" hidden></div>
  <div class="layer" id="layer" hidden></div>
</div>
<div class="small" id="small" hidden></div>`;

  function create(opts = {}) {

    /* ------------------------------------------------------------ constants + helpers */
    const AW = 360, AH = 480;               // the arena in units (3:4)
    const TOP_H = 28, BAR_H = 48;           // the HUD strips above and below the arena in portrait, in CSS px
    const PAD_MIN = 48;                     // the thumb's pad under the arena shows only with this much room
    const MIN_SCALE = 0.8;                  // under this the bullets and the hotspot get too small to play fair
    const STEP = 1 / 120, TAU = Math.PI * 2;
    const MAX_SPEED = 520;                  // mouse and finger: the cursor chases the pointer no faster than this
    const KEY_SPEED = 250, KEY_SLOW = 110;
    const TOUCH_GAIN = 1.2;                 // a finger moves the cursor a little further than itself
    const HIT_R = 2.4, GRAZE_R = 16, LASER_R = 1.4;
    // short mercy after a hit, so a cursor that stands still keeps losing blocks
    const HP_MAX = 6, INV_TIME = 1.2, REFILL_TIME = 12, CANCEL_R = 48;
    const SHOT_EVERY = 0.1, SHOT_SPEED = 820;
    const GRAZE_FILL = 3.5, LASER_FILL = 1.2, SD_DMG = 20, SD_TIME = 0.45;
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
    // ?debug in the address: the Backquote key shows the frame counter, Preview starts from the picked boss, and
    // window.__ssxp drives the game from the console
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
        goalHead: 'Goal:', goal: 'Shoot whatever wears a green ring until the ring runs out, and keep the tip of the arrow away from bullets, lines, pipes and letters.',
        tips: { starfield: 'Shoot this core until its green ring runs out. The cursor fires on its own.', mystify: 'Shoot the corners with green rings. The lines hurt too, so stay off them.', pipes: 'Shoot the pipe heads with green rings. When a ring runs out, that pipe stops growing. Don’t touch the pipes.', marquee: 'Shoot the letters with green rings until they break. Get past each line through a gap. Every letter hurts.', blank: 'The screen went dark, but the ring is still there. Shoot it until it runs out. The No signal box hurts and stops your shots.' },
        tipCursor: 'Only this tip can be hit. Dodge the bullets.', tipCursorTouch: 'Only this tip can be hit. Drag anywhere to dodge.',
        premise: 'The computer was left alone too long, and the screensavers refuse to wake up. You are the cursor, and the stickman is along for the ride.',
        keysTouch: [['Drag', 'Drag a finger anywhere on the screen. The cursor moves with it and never hides under your thumb.'], ['Fire', 'The cursor fires on its own. Keep it under whatever wears a green ring.'], ['Graze', 'Pass close to anything that can hit you to fill the meter. Only the tip of the arrow can be hit.'], ['Show Desktop', 'Full meter: tap the Show Desktop button to sweep every bullet away.']],
        keysDesk: [['Mouse', 'Move the mouse. The cursor chases the pointer.'], ['← ↑ → ↓', 'Or the arrow keys and WASD. Hold Shift to move slowly.'], ['Space', 'Full meter: Show Desktop sweeps every bullet away. Grazing anything that can hit you fills the meter.'], ['P or Esc', 'Pause'], ['M', 'Sound on or off']],
        keysShort: [['Mouse', 'move'], ['← ↑ → ↓ / WASD', 'move'], ['Shift', 'slow'], ['Space', 'Show Desktop'], ['P', 'pause']],
        keysTouchShort: [['Drag', 'anywhere to move'], ['Tap', 'Show Desktop when the meter is full']],
        tipOnly: 'Only the tip of the arrow can be hit.',
        thumb: 'Drag anywhere',
        bossHead: 'Screensaver', phase: (n) => `Phase ${n}`,
        phase2: { starfield: 'Phase 2: warp', mystify: 'Phase 2: two polygons', pipes: 'Phase 2: screen full', marquee: 'Phase 2: both ways', blank: 'Phase 2: burn-in' },
        noSignal: 'No signal', corner: 'Corner!',
        practice: 'Practice', lesStep: (i, n) => `Step ${i} of ${n}`, skip: 'Skip',
        practiceEta: (n) => (n > 2 ? 'About 1 minute of practice remaining' : 'Less than a minute of practice remaining'),
        lesGood: 'Nice!', lesDodgeHit: 'Hit! Only the tip of the arrow counts.', lesGrazeHit: 'Too close! Pass beside the bullets.',
        // a lesson's how-to is one line, or [touch screen, desk] when the two are done differently
        les: {
          move: ['Move', ['Drag a finger anywhere on the screen. The cursor moves with it and never hides under your thumb.', 'Move the mouse, or use the arrow keys and WASD.']],
          aim: ['Aim', 'The cursor fires on its own. Keep it under the green ring until the ring runs out.'],
          dodge: ['Dodge', 'Only the tip of the arrow can be hit. Keep it clear of the bullets for 8 seconds.'],
          graze: ['Graze', 'Pass close to 10 bullets without touching the tip. Each close pass fills the Show Desktop meter.'],
          bomb: ['Show Desktop', ['The meter is full. Tap the Show Desktop button to sweep every bullet away.', 'The meter is full. Press Space for Show Desktop: it sweeps every bullet away.']],
        },
        drillDone: 'Practice complete!', drillText: 'You’ve tried every move. Start the run, or practice again.', drillFight: 'Start the run', drillAgain: 'Practice again',
        // the front door: Display Properties, its Settings dialog and the Leaderboard
        dp: 'Display Properties', dpTab: 'Screen Saver', dpGroup: 'Screen saver', dpSettings: 'Settings', dpPreview: 'Preview', dpPractice: '(Practice)',
        dpInfo: {
          practice: 'Five short lessons, about a minute. Nothing costs health here.',
          starfield: 'Boss 1 of 5. Stars stream out of one point, and that point is the core to shoot.',
          mystify: 'Boss 2 of 5. Polygons with laser sides bounce around the screen, and their corners wear the rings.',
          pipes: 'Boss 3 of 5. Pipes grow across the screen and stay as walls. Shoot the growing heads.',
          marquee: 'Boss 4 of 5. Giant lines of text come down. Slip through a gap or break a letter.',
          blank: 'The last boss. The screen goes dark. The ring and the bullets still show, and so does a No signal box that hurts to touch.',
          hidden: 'Something else is waiting after Marquee.scr.',
        },
        dpRunHead: 'Run', dpRun: 'Preview starts the run: all five screensavers in a row, about four minutes.', dpRunPractice: 'Preview starts the practice. It doesn’t count toward the leaderboard.',
        dpBest: 'Your best score on this device:', dpNoBest: 'No run finished on this device yet.',
        monLabel: (n) => `Preview of ${n}`, noSignalLabel: 'The monitor shows No signal',
        settings: 'Screen Saver XP Settings', ok: 'OK', soundOpt: 'Sound', trailsOpt: 'Pointer trails',
        board: 'Leaderboard', lbLoading: 'Checking the leaderboard…', lbOff: 'The leaderboard can’t be reached right now.',
        lbEmptyHead: 'No finished runs yet', lbEmptyText: 'Close all five screensavers to post the first run.', lbStart: 'Start the run', lbPractice: 'Practice first',
        lbYou: 'you', lbCount: (n) => `${n} ${n === 1 ? 'player' : 'players'}`, lbAll: 'See all',
        lbHow: 'Ranked by score: the time plus 10 seconds for every hit taken.', lbCols: ['#', 'Name', 'Time', 'Hits', 'Score', 'Grade'],
        // the player's name, the win screen's place on the board, and the result card (worded as in Boss Rush XP)
        nameTitle: 'New player', nameText: 'Choose the public name shown with your finished runs.', nameRule: 'Up to 12 letters, numbers, spaces, - or _.',
        nameLabel: 'Your name', namePlay: 'Play', nameChange: 'Change name', nameChangeText: 'Future saved runs will use this public name.',
        nameNow: 'Player name:', cancel: 'Cancel', save: 'Save', saving: 'Saving…',
        lbAsk: (r, n) => `This run ranks #${r} of ${n} on the leaderboard.`, lbSaved: (name, r, n) => `Saved as ${name}: #${r} of ${n}.`,
        lbKept: (r, n, t) => `Your best run (${t}) stays #${r} of ${n}.`, lbView: 'View leaderboard',
        lbErr: { format: 'Use 1 to 12 letters, numbers, spaces, - or _.', name: 'That name can’t be used. Try another one.', slow: 'Too many saves from here. Try again in a few minutes.', net: 'Couldn’t save. Try again.' },
        cta: 'Enjoyed exploring? Tell me about your website or app.', contact: 'Contact me',
        gift: 'Your reward: pointer trails on the desktop.',
        share: (r, t, n, who, url, pos) => `I beat Screen Saver XP${who ? ` on ${who}’s portfolio` : ''}: grade ${r}, ${t}, ${n} ${n === 1 ? 'hit' : 'hits'} taken${pos ? `, #${pos.rank} of ${pos.total} ${pos.total === 1 ? 'player' : 'players'}` : ''}. Can you do better? ${url}`,
        shareOpen: 'Share result…', shareTitle: 'Share your result', shareHint: 'Copy the image and text to share your result. The text includes a link to the game.',
        cardMaking: 'Drawing your result card…', cardFail: 'The result image couldn’t be created. You can still copy the result text.', cardNoRank: 'Save your run first to include your leaderboard rank.',
        copyImg: 'Copy image', imgCopied: 'Image copied!', imgFail: 'This browser couldn’t copy the image. Download it instead.', saveImg: 'Download image', imgSaved: (f) => `Downloading ${f}…`, copyText: 'Copy text', shareTo: 'Share to…',
        cardDone: 'Closed', cardPos: (r, n) => `#${r} of ${n}`, cardAsk: 'Can you beat it?', cardOwner: (o) => `${o}’s portfolio`, startBtn: 'start',
        cardAlt: (g, t, n, pos) => `Screen Saver XP result card: grade ${g}, ${t}, ${n} ${n === 1 ? 'hit' : 'hits'} taken${pos ? `, #${pos.rank} of ${pos.total} on the leaderboard` : ''}.`,
        // Marquee.scr's messages: system jokes, never lines about the owner (GAME2_BRIEF.md); the first always opens
        marquee: ['PLEASE WAIT...', 'ARE YOU SURE?', 'NOT RESPONDING...', 'PRESS ANY KEY!', 'ERROR: SUCCESS.', 'LOW DISK SPACE!', 'IT IS NOW SAFE TO TURN OFF YOUR COMPUTER.', 'YOUR TEXT HERE.', '404: CURSOR NOT FOUND', 'MOVE THE MOUSE TO CONTINUE...'],
        closed: (n) => `${n} closed`, ready: 'Show Desktop ready',
        paused: 'Paused', pausedText: 'The game is paused.', resume: 'Resume', restart: 'Restart',
        dead: 'Out of health: the cursor is not responding.', deadText: (n) => `${n} starts over. The time and the hits still count.`, retry: 'Try again', menu: 'Menu',
        runDone: (n) => `${n} ${n === 1 ? 'screensaver' : 'screensavers'} closed.`,
        flavor: 'The screen is back on. For now.',
        time: 'Fight time', hits: 'Hits taken', score: 'Score (time + 10 s per hit)', grazes: 'Grazes', bombs: 'Show Desktop used', losses: 'Losses',
        rank: 'Grade', target: (t) => `Target for a clean run against these bosses: about ${t} without a hit.`,
        copied: 'Copied', copyHand: 'Copy this text:', again: 'Play again',
        tooSmall: 'This window is too small to play. Maximize it, or make the browser window bigger.',
        tooShort: 'This screen is too small to play. Try a computer, or a phone with a taller screen.',
        rotate: 'Turn your phone upright to play.',
        run: 'Run', clock: 'Time', statHits: 'Hits', statGraze: 'Grazes', hp: 'Health', sd: 'Show Desktop', sdKey: 'Space', controls: 'Controls',
        sound: 'Sound', soundOn: 'Sound on', soundOff: 'Sound off',
        help: 'How to play', pauseBtn: 'Pause', sdBtn: 'Show Desktop: sweep every bullet away', arena: (n) => `${n}, with the cursor at the bottom`,
      },
      id: {
        goalHead: 'Tujuan:', goal: 'Tembak apa pun yang bercincin hijau sampai cincinnya habis, dan jaga ujung panah dari peluru, garis, pipa, dan huruf.',
        tips: { starfield: 'Tembak inti ini sampai cincin hijaunya habis. Kursor menembak sendiri.', mystify: 'Tembak sudut-sudut yang bercincin hijau. Garisnya juga melukai, jadi jangan disentuh.', pipes: 'Tembak kepala pipa yang bercincin hijau. Kalau cincinnya habis, pipa itu berhenti tumbuh. Jangan sentuh pipanya.', marquee: 'Tembak huruf yang bercincin hijau sampai pecah. Lolos dari tiap baris lewat celahnya. Semua huruf melukai.', blank: 'Layarnya gelap, tapi cincinnya masih ada. Tembak sampai habis. Kotak Tidak ada sinyal melukai dan menahan tembakan.' },
        tipCursor: 'Hanya ujung ini yang bisa kena. Hindari peluru.', tipCursorTouch: 'Hanya ujung ini yang bisa kena. Geser di mana saja untuk menghindar.',
        premise: 'Komputer ditinggal terlalu lama, dan screensaver menolak dibangunkan. Kamu adalah kursornya, dan stickman ikut menumpang.',
        keysTouch: [['Geser', 'Geser jari di bagian layar mana saja. Kursor ikut bergerak dan tidak tertutup jempol.'], ['Tembak', 'Kursor menembak sendiri. Jaga kursor di bawah apa pun yang bercincin hijau.'], ['Serempet', 'Lewat dekat apa pun yang bisa mengenaimu untuk mengisi meter. Hanya ujung panah yang bisa kena.'], ['Show Desktop', 'Meter penuh: ketuk tombol Show Desktop untuk menyapu semua peluru.']],
        keysDesk: [['Mouse', 'Gerakkan mouse. Kursor mengejar pointer.'], ['← ↑ → ↓', 'Atau tombol panah dan WASD. Tahan Shift untuk bergerak pelan.'], ['Spasi', 'Meter penuh: Show Desktop menyapu semua peluru. Menyerempet apa pun yang bisa mengenaimu akan mengisi meter.'], ['P atau Esc', 'Jeda'], ['M', 'Suara nyala atau mati']],
        keysShort: [['Mouse', 'gerak'], ['← ↑ → ↓ / WASD', 'gerak'], ['Shift', 'pelan'], ['Spasi', 'Show Desktop'], ['P', 'jeda']],
        keysTouchShort: [['Geser', 'di mana saja untuk bergerak'], ['Ketuk', 'Show Desktop saat meter penuh']],
        tipOnly: 'Hanya ujung panah yang bisa kena.',
        thumb: 'Geser di mana saja',
        bossHead: 'Screensaver', phase: (n) => `Fase ${n}`,
        phase2: { starfield: 'Fase 2: warp', mystify: 'Fase 2: dua segi empat', pipes: 'Fase 2: layar penuh', marquee: 'Fase 2: dua arah', blank: 'Fase 2: burn-in' },
        noSignal: 'Tidak ada sinyal', corner: 'Pojok!',
        practice: 'Latihan', lesStep: (i, n) => `Langkah ${i} dari ${n}`, skip: 'Lewati',
        practiceEta: (n) => (n > 2 ? 'Latihan selesai dalam sekitar 1 menit' : 'Latihan selesai dalam kurang dari 1 menit'),
        lesGood: 'Bagus!', lesDodgeHit: 'Kena! Yang dihitung hanya ujung panah.', lesGrazeHit: 'Terlalu dekat! Lewat di samping peluru.',
        les: {
          move: ['Gerak', ['Geser jari di bagian layar mana saja. Kursor ikut bergerak dan tidak tertutup jempol.', 'Gerakkan mouse, atau pakai tombol panah dan WASD.']],
          aim: ['Bidik', 'Kursor menembak sendiri. Jaga kursor di bawah cincin hijau sampai cincinnya habis.'],
          dodge: ['Menghindar', 'Hanya ujung panah yang bisa kena. Jaga ujungnya dari peluru selama 8 detik.'],
          graze: ['Serempet', 'Lewat dekat 10 peluru tanpa menyentuh ujung panah. Setiap serempetan mengisi meter Show Desktop.'],
          bomb: ['Show Desktop', ['Meter sudah penuh. Ketuk tombol Show Desktop untuk menyapu semua peluru.', 'Meter sudah penuh. Tekan Spasi untuk Show Desktop: semua peluru tersapu.']],
        },
        drillDone: 'Latihan selesai!', drillText: 'Kamu sudah mencoba semua gerakan. Mulai run, atau latihan lagi.', drillFight: 'Mulai run', drillAgain: 'Latihan lagi',
        dp: 'Properti Tampilan', dpTab: 'Screen Saver', dpGroup: 'Screen saver', dpSettings: 'Pengaturan', dpPreview: 'Pratinjau', dpPractice: '(Latihan)',
        dpInfo: {
          practice: 'Lima langkah singkat, sekitar satu menit. Nyawa tidak berkurang di sini.',
          starfield: 'Bos 1 dari 5. Bintang menyembur dari satu titik, dan titik itulah inti yang harus ditembak.',
          mystify: 'Bos 2 dari 5. Segi empat bersisi laser memantul ke sana kemari, dan sudut-sudutnya bercincin.',
          pipes: 'Bos 3 dari 5. Pipa tumbuh memenuhi layar dan tertinggal sebagai dinding. Tembak kepalanya yang sedang tumbuh.',
          marquee: 'Bos 4 dari 5. Baris teks raksasa turun. Lewati celahnya atau pecahkan hurufnya.',
          blank: 'Bos terakhir. Layar menjadi gelap. Cincin dan peluru masih terlihat, begitu juga kotak Tidak ada sinyal yang melukai bila tersentuh.',
          hidden: 'Ada yang lain menunggu setelah Marquee.scr.',
        },
        dpRunHead: 'Run', dpRun: 'Pratinjau memulai run: kelima screensaver berturut-turut, sekitar empat menit.', dpRunPractice: 'Pratinjau memulai latihan. Latihan tidak masuk papan peringkat.',
        dpBest: 'Skor terbaikmu di perangkat ini:', dpNoBest: 'Belum ada run yang selesai di perangkat ini.',
        monLabel: (n) => `Pratinjau ${n}`, noSignalLabel: 'Monitor menampilkan Tidak ada sinyal',
        settings: 'Pengaturan Screen Saver XP', ok: 'OK', soundOpt: 'Suara', trailsOpt: 'Jejak pointer',
        board: 'Papan peringkat', lbLoading: 'Mengecek papan peringkat…', lbOff: 'Papan peringkat sedang tidak bisa dihubungi.',
        lbEmptyHead: 'Belum ada run yang selesai', lbEmptyText: 'Tutup kelima screensaver untuk mencatat run pertama.', lbStart: 'Mulai run', lbPractice: 'Latihan dulu',
        lbYou: 'kamu', lbCount: (n) => `${n} pemain`, lbAll: 'Lihat semua',
        lbHow: 'Peringkat dihitung dari skor: waktu ditambah 10 detik untuk setiap hit yang diterima.', lbCols: ['#', 'Nama', 'Waktu', 'Hit', 'Skor', 'Grade'],
        nameTitle: 'Pemain baru', nameText: 'Pilih nama publik yang tampil bersama rekormu.', nameRule: 'Maksimal 12 huruf, angka, spasi, - atau _.',
        nameLabel: 'Namamu', namePlay: 'Main', nameChange: 'Ganti nama', nameChangeText: 'Run yang tersimpan setelah ini akan memakai nama publik ini.',
        nameNow: 'Nama pemain:', cancel: 'Batal', save: 'Simpan', saving: 'Menyimpan…',
        lbAsk: (r, n) => `Run ini masuk peringkat #${r} dari ${n} pemain.`, lbSaved: (name, r, n) => `Tersimpan sebagai ${name}: peringkat #${r} dari ${n}.`,
        lbKept: (r, n, t) => `Rekor terbaikmu (${t}) tetap peringkat #${r} dari ${n}.`, lbView: 'Lihat papan peringkat',
        lbErr: { format: 'Pakai 1 sampai 12 huruf, angka, spasi, - atau _.', name: 'Nama itu tidak bisa dipakai. Coba nama lain.', slow: 'Terlalu sering menyimpan dari sini. Coba lagi beberapa menit lagi.', net: 'Gagal menyimpan. Coba lagi.' },
        cta: 'Suka menjelajahi portofolio ini? Ceritakan rencana website atau aplikasimu.', contact: 'Hubungi saya',
        gift: 'Hadiahmu: jejak pointer di desktop.',
        share: (r, t, n, who, url, pos) => `Aku menamatkan Screen Saver XP${who ? ` di portofolio ${who}` : ''}: grade ${r}, waktu ${t}, kena ${n} hit${pos ? `, peringkat #${pos.rank} dari ${pos.total} pemain` : ''}. Bisa lebih baik? ${url}`,
        shareOpen: 'Bagikan hasil…', shareTitle: 'Bagikan hasil', shareHint: 'Salin gambar dan teks untuk membagikan hasilmu. Teksnya menyertakan tautan ke game.',
        cardMaking: 'Menggambar kartu hasil…', cardFail: 'Gambarnya gagal dibuat. Teksnya tetap bisa disalin.', cardNoRank: 'Simpan rekormu dulu agar peringkat ikut tampil di kartu.',
        copyImg: 'Salin gambar', imgCopied: 'Gambar tersalin!', imgFail: 'Browser ini tidak bisa menyalin gambar. Unduh saja gambarnya.', saveImg: 'Unduh gambar', imgSaved: (f) => `Mengunduh ${f}…`, copyText: 'Salin teks', shareTo: 'Bagikan ke…',
        cardDone: 'Ditutup', cardPos: (r, n) => `#${r} dari ${n}`, cardAsk: 'Bisa mengalahkan rekor ini?', cardOwner: (o) => `Portofolio ${o}`, startBtn: 'mulai',
        cardAlt: (g, t, n, pos) => `Kartu hasil Screen Saver XP: grade ${g}, waktu ${t}, kena ${n} hit${pos ? `, peringkat #${pos.rank} dari ${pos.total}` : ''}.`,
        marquee: ['HARAP TUNGGU...', 'YAKIN?', 'TIDAK MERESPONS...', 'TEKAN TOMBOL APA SAJA!', 'ERROR: BERHASIL.', 'RUANG DISK HAMPIR PENUH!', 'SEKARANG AMAN UNTUK MEMATIKAN KOMPUTER.', 'KETIK TEKS DI SINI.', '404: KURSOR TIDAK DITEMUKAN', 'GERAKKAN MOUSE UNTUK MELANJUTKAN...'],
        closed: (n) => `${n} ditutup`, ready: 'Show Desktop siap',
        paused: 'Dijeda', pausedText: 'Permainan dijeda.', resume: 'Lanjut', restart: 'Mulai ulang',
        dead: 'Nyawa habis: kursor tidak merespons.', deadText: (n) => `${n} diulang dari awal. Waktu dan hit tetap dihitung.`, retry: 'Coba lagi', menu: 'Menu',
        runDone: (n) => `${n} screensaver ditutup.`,
        flavor: 'Layar menyala lagi. Untuk sementara.',
        time: 'Waktu bertarung', hits: 'Kena hit', score: 'Skor (waktu + 10 dtk per hit)', grazes: 'Serempet', bombs: 'Show Desktop dipakai', losses: 'Kalah',
        rank: 'Grade', target: (t) => `Target run bersih untuk bos yang dilawan: sekitar ${t} tanpa kena hit.`,
        copied: 'Tersalin', copyHand: 'Salin teks ini:', again: 'Main lagi',
        tooSmall: 'Jendela ini terlalu kecil untuk bermain. Besarkan jendelanya, atau perbesar jendela browser.',
        tooShort: 'Layar ini terlalu kecil untuk bermain. Coba di komputer, atau di HP dengan layar yang lebih tinggi.',
        rotate: 'Putar HP ke posisi tegak untuk bermain.',
        run: 'Run', clock: 'Waktu', statHits: 'Hit', statGraze: 'Serempet', hp: 'Nyawa', sd: 'Show Desktop', sdKey: 'Spasi', controls: 'Kontrol',
        sound: 'Suara', soundOn: 'Suara nyala', soundOff: 'Suara mati',
        help: 'Cara bermain', pauseBtn: 'Jeda', sdBtn: 'Show Desktop: sapu semua peluru', arena: (n) => `${n}, dengan kursor di bagian bawah`,
      },
    };

    /* ------------------------------------------------------------ icons: Pixel Icon Library by HackerNoon (CC BY 4.0),
       drawn as the portfolio's icons.js draws them: the solid shape as a colour fill under the regular outline */
    const ICONS = {
      star: ['<path d="m16,8v-2h-1v-2h-1v-2h-1v-1h-2v1h-1v2h-1v2h-1v2H1v2h1v1h1v1h1v1h1v1h1v5h-1v4h2v-1h2v-1h2v-1h2v1h2v1h2v1h2v-4h-1v-5h1v-1h1v-1h1v-1h1v-1h1v-2h-7Zm4,3h-1v1h-1v1h-1v1h-1v5h1v1h-2v-1h-2v-1h-2v1h-2v1h-2v-1h1v-5h-1v-1h-1v-1h-1v-1h-1v-1h4v-1h1v-1h1v-2h1v-2h2v2h1v2h1v1h1v1h4v1Z"/>', '<polygon points="23 8 23 10 22 10 22 11 21 11 21 12 20 12 20 13 19 13 19 14 18 14 18 19 19 19 19 23 17 23 17 22 15 22 15 21 13 21 13 20 11 20 11 21 9 21 9 22 7 22 7 23 5 23 5 19 6 19 6 14 5 14 5 13 4 13 4 12 3 12 3 11 2 11 2 10 1 10 1 8 8 8 8 6 9 6 9 4 10 4 10 2 11 2 11 1 13 1 13 2 14 2 14 4 15 4 15 6 16 6 16 8 23 8"/>'],
      moon: ['<path d="m21,17v1h-2v1h-4v-1h-2v-1h-2v-1h-1v-2h-1v-2h-1v-4h1v-2h1v-2h1v-1h2v-1h2v-1h-5v1h-2v1h-2v1h-1v1h-1v2h-1v2h-1v6h1v2h1v2h1v1h1v1h2v1h2v1h6v-1h2v-1h2v-1h1v-1h1v-2h-1Zm-13,3v-1h-2v-2h-1v-2h-1v-6h1v-2h1v-2h2v1h-1v2h-1v4h1v2h1v2h1v1h1v1h1v1h2v1h2v1h-5v-1h-2Z"/>', '<polygon points="22 17 22 19 21 19 21 20 20 20 20 21 18 21 18 22 16 22 16 23 10 23 10 22 8 22 8 21 6 21 6 20 5 20 5 19 4 19 4 17 3 17 3 15 2 15 2 9 3 9 3 7 4 7 4 5 5 5 5 4 6 4 6 3 8 3 8 2 10 2 10 1 15 1 15 2 13 2 13 3 11 3 11 4 10 4 10 6 9 6 9 8 8 8 8 12 9 12 9 14 10 14 10 16 11 16 11 17 13 17 13 18 15 18 15 19 19 19 19 18 21 18 21 17 22 17"/>'],
      'exclamation-triangle': ['<polygon points="14 11 14 14 13 14 13 17 11 17 11 14 10 14 10 11 14 11"/><rect x="11" y="18" width="2" height="2"/><path d="m22,20v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-1h-2v1h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h1v1h20v-1h1v-2h-1Zm-19,1v-1h1v-2h1v-2h1v-2h1v-2h1v-2h1v-2h1v-2h1v-2h2v2h1v2h1v2h1v2h1v2h1v2h1v2h1v2h1v1H3Z"/>', '<path d="m22,20v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-2h-1v-1h-2v1h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h-1v2h1v1h20v-1h1v-2h-1Zm-12-9h4v3h-1v3h-2v-3h-1v-3Zm1,7h2v2h-2v-2Z"/>'],
      'window-restore': ['<polygon points="23 2 23 18 22 18 22 19 20 19 20 17 21 17 21 3 7 3 7 4 5 4 5 2 6 2 6 1 22 1 22 2 23 2"/><path d="M18,6V5H2V6H1V22H2v1H18V22h1V6ZM3,21V7H17V21Z"/>', '<polygon points="18 6 19 6 19 22 18 22 18 23 2 23 2 22 1 22 1 6 2 6 2 5 18 5 18 6"/><polygon points="23 2 23 18 22 18 22 19 20 19 20 17 21 17 21 3 7 3 7 4 5 4 5 2 6 2 6 1 22 1 22 2 23 2"/>'],
      'sound-on': ['<polygon points="17 15 17 14 16 14 16 13 17 13 17 11 16 11 16 10 17 10 17 9 18 9 18 10 19 10 19 14 18 14 18 15 17 15"/><polygon points="23 10 23 14 22 14 22 16 21 16 21 17 20 17 20 18 19 18 19 17 18 17 18 16 19 16 19 15 20 15 20 14 21 14 21 10 20 10 20 9 19 9 19 8 18 8 18 7 19 7 19 6 20 6 20 7 21 7 21 8 22 8 22 10 23 10"/><path d="m11,2v1h-1v1h-1v1h-1v1h-1v1h-1v1H1v8h5v1h1v1h1v1h1v1h1v1h1v1h3V2h-3Zm1,17h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1H3v-4h4v-1h1v-1h1v-1h1v-1h1v-1h1v14Z"/>', '<polygon points="14 2 14 22 11 22 11 21 10 21 10 20 9 20 9 19 8 19 8 18 7 18 7 17 6 17 6 16 1 16 1 8 6 8 6 7 7 7 7 6 8 6 8 5 9 5 9 4 10 4 10 3 11 3 11 2 14 2"/><polygon points="17 15 17 14 16 14 16 13 17 13 17 11 16 11 16 10 17 10 17 9 18 9 18 10 19 10 19 14 18 14 18 15 17 15"/><polygon points="23 10 23 14 22 14 22 16 21 16 21 17 20 17 20 18 19 18 19 17 18 17 18 16 19 16 19 15 20 15 20 14 21 14 21 10 20 10 20 9 19 9 19 8 18 8 18 7 19 7 19 6 20 6 20 7 21 7 21 8 22 8 22 10 23 10"/>'],
      'sound-mute': ['<polygon points="22 8 22 10 21 10 21 11 20 11 20 13 21 13 21 14 22 14 22 16 20 16 20 15 19 15 19 14 18 14 18 15 17 15 17 16 15 16 15 14 16 14 16 13 17 13 17 11 16 11 16 10 15 10 15 8 17 8 17 9 18 9 18 10 19 10 19 9 20 9 20 8 22 8"/><path d="m11,2v1h-1v1h-1v1h-1v1h-1v1h-1v1H1v8h5v1h1v1h1v1h1v1h1v1h1v1h3V2h-3ZM3,10h4v-1h1v-1h1v-1h1v-1h1v-1h1v14h-1v-1h-1v-1h-1v-1h-1v-1h-1v-1H3v-4Z"/>', '<polygon points="14 2 14 22 11 22 11 21 10 21 10 20 9 20 9 19 8 19 8 18 7 18 7 17 6 17 6 16 1 16 1 8 6 8 6 7 7 7 7 6 8 6 8 5 9 5 9 4 10 4 10 3 11 3 11 2 14 2"/><polygon points="22 8 22 10 21 10 21 11 20 11 20 13 21 13 21 14 22 14 22 16 20 16 20 15 19 15 19 14 18 14 18 15 17 15 17 16 15 16 15 14 16 14 16 13 17 13 17 11 16 11 16 10 15 10 15 8 17 8 17 9 18 9 18 10 19 10 19 9 20 9 20 8 22 8"/>'],
      pause: ['<path d="m9,1H2v1h-1v20h1v1h7v-1h1V2h-1v-1Zm-1,2v18H3V3h5Z"/><path d="m22,2v-1h-7v1h-1v20h1v1h7v-1h1V2h-1Zm-1,1v18h-5V3h5Z"/>', '<polygon points="23 2 23 22 22 22 22 23 15 23 15 22 14 22 14 2 15 2 15 1 22 1 22 2 23 2"/><polygon points="9 2 10 2 10 22 9 22 9 23 2 23 2 22 1 22 1 2 2 2 2 1 9 1 9 2"/>'],
      trophy: ['<path d="m18,4v-2H6v2H1v5h1v2h1v1h1v1h1v1h1v1h3v1h2v3h-4v3h10v-3h-4v-3h2v-1h3v-1h1v-1h1v-1h1v-1h1v-2h1v-5h-5Zm-10,9h-2v-1h-1v-1h-1v-2h-1v-3h2v1h1v2h1v3h1v1Zm0-4v-5h8v5h-1v3h-1v2h-4v-2h-1v-3h-1Zm12,0v2h-1v1h-1v1h-2v-1h1v-2h1v-3h1v-1h2v3h-1Z"/>', '<path d="m18,4v-2H6v2H1v5h1v2h1v1h1v1h1v1h1v1h3v1h2v3h-4v3h10v-3h-4v-3h2v-1h3v-1h1v-1h1v-1h1v-1h1v-2h1v-5h-5ZM5,12v-1h-1v-2h-1v-3h2v1h1v2h1v3h1v1h-2v-1h-1Zm16-3h-1v2h-1v1h-1v1h-2v-1h1v-2h1v-3h1v-1h2v3Z"/>'],
      'retro-pc': ['<rect x="11" y="14" width="7" height="2"/><rect x="6" y="14" width="2" height="2"/><polygon points="18 6 18 11 17 11 17 12 7 12 7 11 6 11 6 6 7 6 7 5 17 5 17 6 18 6"/><path d="M21,3V2H20V1H4V2H3V3H2V17H3v1H4v4H5v1H19V22h1V18h1V17h1V3ZM18,21H6V19H18Zm2-5H19v1H5V16H4V4H5V3H19V4h1Z"/>', '<rect x="4" y="21" width="16" height="2"/><path d="M21,3V2H20V1H4V2H3V3H2V17H3v1H4v1H20V18h1V17h1V3ZM8,16H6V14H8Zm10,0H11V14h7ZM6,12V11H5V5H6V4H18V5h1v6H18v1Z"/>'],
      user: ['<path d="m17,5v-2h-1v-1h-2v-1h-4v1h-2v1h-1v2h-1v4h1v2h1v1h2v1h4v-1h2v-1h1v-2h1v-4h-1Zm-2,4v1h-1v1h-4v-1h-1v-1h-1v-4h1v-1h1v-1h4v1h1v1h1v4h-1Z"/><path d="m21,19v-1h-1v-1h-1v-1h-2v-1H7v1h-2v1h-1v1h-1v1h-1v3h1v1h18v-1h1v-3h-1Zm-16,0v-1h2v-1h10v1h2v1h1v2H4v-2h1Z"/>', '<polygon points="7 9 6 9 6 5 7 5 7 3 8 3 8 2 10 2 10 1 14 1 14 2 16 2 16 3 17 3 17 5 18 5 18 9 17 9 17 11 16 11 16 12 14 12 14 13 10 13 10 12 8 12 8 11 7 11 7 9"/><polygon points="22 19 22 22 21 22 21 23 3 23 3 22 2 22 2 19 3 19 3 18 4 18 4 17 5 17 5 16 7 16 7 15 17 15 17 16 19 16 19 17 20 17 20 18 21 18 21 19 22 19"/>'],
      image: ['<polygon points="9 6 9 9 8 9 8 10 5 10 5 9 4 9 4 6 5 6 5 5 8 5 8 6 9 6"/><path d="m22,2v-1H2v1h-1v20h1v1h20v-1h1V2h-1Zm-5,12v1h1v1h1v1h1v1h1v3h-13v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v1h1Zm3,1v-1h-1v-1h-1v-1h-1v-1h-1v-1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1h-1v-1h-1v-1h-1v-1h-1v-1h-1V3h18v12h-1Zm-15,3v1h1v1h1v1H3v-4h1v1h1Z"/>', '<polygon points="23 20 23 22 22 22 22 23 2 23 2 22 1 22 1 15 2 15 2 16 3 16 3 17 4 17 4 18 5 18 5 19 6 19 6 20 7 20 7 21 8 21 8 20 9 20 9 19 10 19 10 18 11 18 11 17 12 17 12 16 13 16 13 15 14 15 14 14 15 14 15 13 16 13 16 14 17 14 17 15 18 15 18 16 19 16 19 17 20 17 20 18 21 18 21 19 22 19 22 20 23 20"/><path d="m22,2v-1H2v1h-1v10h1v1h1v1h1v1h1v1h1v1h1v1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v-1h1v1h1v1h1v1h1v1h1v1h1v1h1v1h1V2h-1Zm-13,4v3h-1v1h-3v-1h-1v-3h1v-1h3v1h1Z"/>'],
      'bullet-list': ['<rect x="2" y="5" width="3" height="3"/><rect x="2" y="11" width="3" height="3"/><rect x="2" y="17" width="3" height="3"/><rect x="8" y="18" width="14" height="1"/><rect x="8" y="6" width="14" height="1"/><rect x="8" y="12" width="14" height="1"/>', '<rect x="2" y="5" width="3" height="3"/><rect x="2" y="17" width="3" height="3"/><rect x="2" y="11" width="3" height="3"/><polygon points="23 6 23 7 22 7 22 8 10 8 10 7 9 7 9 6 10 6 10 5 22 5 22 6 23 6"/><polygon points="22 12 23 12 23 13 22 13 22 14 10 14 10 13 9 13 9 12 10 12 10 11 22 11 22 12"/><polygon points="22 18 23 18 23 19 22 19 22 20 10 20 10 19 9 19 9 18 10 18 10 17 22 17 22 18"/>'],
    };
    const ICON_FILL = { star: '#f7c948', moon: '#6aa8ff', 'exclamation-triangle': '#f7c948', 'window-restore': '#6aa8ff', 'sound-on': '#c9c6bd', 'sound-mute': '#c9c6bd', pause: '#c9c6bd', trophy: '#f7c948', 'retro-pc': '#7fd3dc', user: '#ff9f43', image: '#7fd3dc', 'bullet-list': '#b58fe8' };
    function ico(name, size) {
      const [line, body] = ICONS[name];
      return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><g fill="${ICON_FILL[name]}">${body}</g><g fill="#000">${line}</g></svg>`;
    }
    // the same icon on a canvas (the share card): its shapes read back out of the markup, drawn size px wide at x, y
    function icoDraw(c, name, x, y, size) {
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
      c.fillStyle = ICON_FILL[name]; c.fill(shapes(body));
      c.fillStyle = '#000'; c.fill(shapes(line));
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
      let actx = null, master = null, noise = null, muted = store.get('ssxp-mute') === '1', lastGraze = 0, quiet = false;
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
        graze() { if (!actx || actx.currentTime - lastGraze < 0.05) return; lastGraze = actx.currentTime; tone('triangle', 1900, 2600, 0.04, 0.035); },
        hit() { hiss(0.2, 0.2, 'bandpass', 1200, 260); tone('square', 220, 90, 0.18, 0.07); },
        phase() { tone('sine', 260, 1300, 0.55, 0.07); hiss(0.6, 0.06, 'highpass', 800, 5000); },
        bomb() { hiss(0.5, 0.14, 'lowpass', 4000, 180); tone('sine', 900, 200, 0.45, 0.06); },
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
    // the stage lives in a shadow root on a host of its own, so its Luna classes and the portfolio's never meet
    const host = document.createElement('div');
    host.className = 'ss-host';
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = `<style>${CSS}</style>${MARKUP}`;
    const $ = (q) => root.querySelector(q);
    const stage = $('#stage'), cv = $('#cv'), ctx = cv.getContext('2d');
    const topEl = $('#top'), barEl = $('#bar'), paneL = $('#paneL'), paneR = $('#paneR'), layer = $('#layer'), chipsEl = $('#chips');
    const smallEl = $('#small'), thumbHint = $('#thumbHint'), front = $('#front');
    const tipCore = $('#tipCore'), tipCur = $('#tipCur');
    const lesEl = $('#les'), lesName = $('#lesName'), lesHow = $('#lesHow'), lesEta = $('#lesEta'), lesSkip = $('#lesSkip');
    const make = (tag, cls, html = '') => { const e = document.createElement(tag); if (cls) e.className = cls; e.innerHTML = html; return e; };

    // one set of HUD pieces, moved between the portrait strips and the landscape task panes
    const hud = {
      boss: make('div', 'hud-boss', '<b class="hb-name"></b><span class="hb-phase"></span><div class="pbar" role="progressbar" aria-valuemin="0" aria-valuemax="100"><i></i><s></s></div>'),
      hp: make('div', 'hp', '<i><em></em></i>'.repeat(HP_MAX)),
      sd: make('div', 'hud-sd', `<button class="sd" type="button" disabled>${ico('window-restore', 24)}<span class="meter"><i></i></span></button><span class="sd-lbl"><b></b><kbd></kbd></span>`),
      clock: make('div', 'hud-clock', '<span class="lbl"></span><b>0:00</b>'),
      stats: make('dl', 'hud-stats', '<dt data-k="hits"></dt><dd data-v="hits">0</dd><dt data-k="graze"></dt><dd data-v="graze">0</dd>'),
      keys: make('div', 'hud-keys'),
      snd: make('button', 'snd'),
      // pausing without a keyboard: the window's menu bar is gone on a phone
      pause: make('button', 'snd', `${ico('pause', 16)}<span class="snd-t"></span>`),
    };
    hud.snd.type = 'button'; hud.pause.type = 'button';
    hud.hp.setAttribute('role', 'img');
    const tray = make('div', 'tray'), spacer = make('span', 'grow');
    const panel = () => { const p = make('section', 'panel', '<h2></h2><div class="pb"></div>'); p.h = p.firstElementChild; p.pb = p.lastElementChild; return p; };
    const panels = { boss: panel(), run: panel(), cursor: panel(), sd: panel(), keys: panel() };
    const sdBtn = hud.sd.querySelector('.sd'), sdMeter = sdBtn.querySelector('.meter i');
    const bossName = hud.boss.querySelector('.hb-name'), bossFill = hud.boss.querySelector('.pbar i'), bossBar = hud.boss.querySelector('.pbar'), bossPhase = hud.boss.querySelector('.hb-phase'), bossTick = hud.boss.querySelector('.pbar s');
    const hpBlocks = [...hud.hp.children], clockVal = hud.clock.querySelector('b');
    const statHits = hud.stats.querySelector('[data-v="hits"]'), statGraze = hud.stats.querySelector('[data-v="graze"]');

    // the portfolio's language, switched with it (setLang)
    let lang = opts.lang === 'id' ? 'id' : 'en';
    let s = STR[lang];

    /* ------------------------------------------------------------ state */
    const G = {
      mode: 'menu', paused: false, t: 0, fightTime: 0, hits: 0, grazes: 0, bombs: 0, deaths: 0, meter: 0, meterAtStart: 0,
      bossIdx: 0, startIdx: 0, bossT0: 0, bossH0: 0, splits: [], introT: 0, introLen: 1.8, taught: {}, endT: 0,
      warp: 0, shake: 0, zoom: null, sdT: { x: 22, y: AH + 20 }, dlg: null, practice: null, debug: false,
    };
    const P = { x: AW / 2 - 6, y: AH - 90, tx: AW / 2 - 6, ty: AH - 90, hp: HP_MAX, inv: 0, clean: 0, shotCd: 0, lean: 0, duck: 0, knock: 0, cheer: 0, press: 0, fall: 0 };
    const B = { def: null, on: false, x: AW / 2, y: 112, max: 480, hp: 480, phase: 1, inv: 0, pause: 0, pi: 0, p: null, t: 0, t2: 0, alpha: 0, flash: 0, dying: false, dieK: 0, m: null, p2At: null };
    const VP = { x: AW / 2, y: AH * 0.42 };   // where the stars come from while no boss is up
    const bullets = [], pool = [], shots = [], sparks = [], tele = [], stars = [];
    const keys = new Set();
    let input = coarse.matches ? 'touch' : 'mouse', dragId = null, laserCd = 0, tipsOn = false;
    for (let i = 0; i < 110; i++) stars.push({ a: rand(0, TAU), d: rand(0, 520), v: rand(0.6, 1.3) });

    function resetPlayer() { Object.assign(P, { x: AW / 2 - 6, y: AH - 90, tx: AW / 2 - 6, ty: AH - 90, hp: HP_MAX, inv: 1.2, clean: 0, shotCd: 0, lean: 0, duck: 0, knock: 0, cheer: 0, press: 0, fall: 0 }); }
    function resetBoss(def) {
      Object.assign(B, { def, on: true, x: AW / 2, y: 112, max: def.hp, hp: def.hp, phase: 1, inv: 1.8, pause: 2, pi: 0, p: null, t: 0, t2: 0, alpha: 0, flash: 0, dying: false, dieK: 0, m: null, p2At: null });
      def.init();
    }

    /* ------------------------------------------------------------ layout: the largest arena that fits, never under MIN_SCALE */
    // The window's body is the room. A wide one gets the 3:2 stage whole in its middle, the task panes beside the arena;
    // any other fills with the portrait stage, its strips across the full width and the thumb's pad under the arena.
    let S = 1, K = 1, DPR = Math.min(window.devicePixelRatio || 1, 2), lay = 'portrait', tooSmall = false;
    function layout() {
      const vw = host.clientWidth, vh = host.clientHeight;
      if (!vw || !vh) return;
      const land = vw >= vh * 1.2;
      const sc = land ? Math.min(vw / (AW * 2), vh / AH) : Math.min(vw / AW, (vh - TOP_H - BAR_H) / AH);
      if (sc < MIN_SCALE) {
        if (!tooSmall && (G.mode === 'fight' || G.mode === 'intro')) { G.paused = true; sfx.musicHold(true); }
        tooSmall = true; stage.hidden = true; showSmall();
        return;
      }
      const wasSmall = tooSmall;
      tooSmall = false; stage.hidden = false; smallEl.hidden = true;
      S = Math.floor(sc * 1000) / 1000;
      const sw = land ? Math.floor(AW * 2 * S) : vw, sh = land ? Math.floor(AH * S) : vh;
      lay = land ? 'landscape' : 'portrait';
      stage.classList.toggle('portrait', !land);
      stage.classList.toggle('landscape', land);
      stage.style.width = `${sw}px`;
      stage.style.height = `${sh}px`;
      stage.classList.toggle('nopad', !land && sh - TOP_H - BAR_H - AH * S < PAD_MIN);
      stage.style.setProperty('--aw', `${AW * S}px`);
      stage.style.setProperty('--ah', `${AH * S}px`);
      stage.style.setProperty('--pane', `${(AW / 2) * S}px`);
      DPR = Math.min(window.devicePixelRatio || 1, 2);
      const cw = Math.round(AW * S * DPR), ch = Math.round(AH * S * DPR);
      if (cv.width !== cw || cv.height !== ch || !sprites) { cv.width = cw; cv.height = ch; K = cw / AW; buildSprites(); }
      place();
      fitPane();
      practiceTop();
      if (wasSmall && G.paused && !G.dlg) pause(true);
    }
    // the clock keeps to the taskbar's own blue beside the tray, where white reads; in the panes, pause and sound sit with
    // the run, which leaves them in view in a short window
    function place() {
      if (lay === 'portrait') {
        topEl.append(hud.boss);
        tray.append(hud.pause, hud.snd);
        barEl.append(hud.sd, hud.hp, spacer, hud.clock, tray);
      } else {
        panels.boss.pb.append(hud.boss);
        panels.run.pb.append(hud.clock, hud.stats, hud.pause, hud.snd);
        panels.cursor.pb.append(hud.hp);
        panels.sd.pb.append(hud.sd);
        panels.keys.pb.append(hud.keys);
        paneL.append(panels.boss, panels.run);
        paneR.append(panels.cursor, panels.sd, panels.keys);
      }
    }
    // a phone on its side can't hold the arena, and one upright can have too short a screen; anywhere else the window is
    // too small, and can be made bigger
    // the right pane never scrolls: when the legend doesn't fit it loses its last line
    function fitPane() {
      stage.classList.remove('short');
      if (lay === 'landscape' && paneR.scrollHeight > paneR.clientHeight) stage.classList.add('short');
    }
    function showSmall() {
      const text = coarse.matches && host.clientWidth > host.clientHeight ? s.rotate : smallScreen.matches ? s.tooShort : s.tooSmall;
      smallEl.hidden = false;
      smallEl.innerHTML = `<div class="mini" role="alertdialog" aria-labelledby="smT"><div class="title"><span class="t-ico">${ico('exclamation-triangle', 16)}</span><span class="t-text" id="smT">Screen Saver XP</span></div><div class="dlg"><div class="dlg-row">${ico('exclamation-triangle', 32)}<div><p>${esc(text)}</p></div></div></div></div>`;
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
      b.kind = o.kind; b.r = o.r; b.len = o.len || 0; b.dist = 0; b.grow = 0.85; b.grazed = false; b.mode = null; b.k = 0; b.fade = 1; b.x0 = 0; b.y0 = 0;
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
      onBomb() { B.m.burn = null; B.m.arm = Math.max(B.m.arm, 0.6); },
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
      onBomb() { for (const p of B.m.pipes) p.flush = 0; },
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
    // Show Desktop minimises letters into its button, as it does the bullets
    function mqMin(ch, x, y, e, a) {
      const sc = 1 - e * 0.85;
      ctx.save();
      ctx.globalAlpha = a * (1 - e * 0.6);
      ctx.translate(lerp(x, G.sdT.x, e), lerp(y, G.sdT.y, e)); ctx.scale(sc, sc);
      ctx.fillText(ch, 0, MQ.cap);
      ctx.restore();
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
          if (ln.min) { ln.min.k += dt / SD_TIME; continue; }
          ln.off += ln.dir * ln.sp * dt * slow;
          if (live) ln.y += m.vy * dt;
        }
        m.lines = m.lines.filter((ln) => (ln.min ? ln.min.k < 1 : ln.y < AH + 8));
        for (const f of m.falls) {
          if (f.min) { f.min.k += dt / SD_TIME; continue; }
          f.vy = Math.min(460, f.vy + 700 * dt); f.y += f.vy * dt;
        }
        m.falls = m.falls.filter((f) => (f.min ? f.min.k < 1 : f.y < AH + 10));
        m.shards = m.shards.filter((p) => G.t - p.t0 < 0.7);
      },
      attack(dt) {
        const m = B.m;
        if ((m.spawnCd -= dt) <= 0) mqSpawn();
        for (const ln of m.lines) {
          // a line fires only while it is on screen and well above the cursor
          if (ln.min || ln.y < -MQ.cap / 2 || ln.y + MQ.cap > P.y - 70) continue;
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
          if (!m.lines.some((ln) => !ln.min && P.y > ln.y - 40 && P.y < ln.y + MQ.cap + 40)) {
            let best = null, bd = 90;
            for (const ln of m.lines) {
              if (ln.min || ln.y < 0 || ln.y + MQ.cap > P.y - 150) continue;
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
          if (l.gone || l.ln.min) { l.shake = 0; m.shaking.splice(i, 1); continue; }
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
          if (l.gone || ln.min) continue;
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
          if (ln.min || y < ln.y - 2 || y > ln.y + MQ.cap + MQ.desc) continue;
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
          if (ln.min || py < ln.y - MQ_PAD || py > ln.y + MQ.cap + MQ.desc + MQ_PAD) continue;
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
      onBomb() {
        const m = B.m;
        // Show Desktop minimises the text on screen too; a line still above the screen stays on its way
        for (const ln of m.lines) if (!ln.min && ln.y + MQ.cap > 0) ln.min = { k: 0 };
        for (const f of m.falls) if (!f.min) f.min = { k: 0 };
        if (!m.lines.some((ln) => !ln.min)) m.spawnCd = Math.min(m.spawnCd, 1);
      },
      draw() {
        const m = B.m;
        if (!m || B.alpha <= 0) return;
        const a = B.alpha, k = B.dying ? B.dieK : 0, cap = MQ.cap, blinkOn = Math.floor(G.t * 16) % 2 === 0;
        ctx.font = MQ.font; ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
        for (const ln of m.lines) {
          if (!ln.min && ln.y + cap + MQ.desc < 0) {
            if (B.dying) continue;
            ctx.globalAlpha = a * (0.45 + Math.sin(G.t * 10) * 0.25);
            ctx.setLineDash([4, 6]); ctx.strokeStyle = MQCOL[ln.ci]; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, 1.5); ctx.lineTo(AW, 1.5); ctx.stroke(); ctx.setLineDash([]);
            continue;
          }
          const e = ln.min ? Math.min(1, ln.min.k) ** 2 : 0, col = MQCOL[ln.ci];
          for (const l of ln.letters) {
            if (l.gone) continue;
            let x = mqX(ln, l), y = ln.y;
            if (x > AW || x + l.g.adv < 0) continue;
            ctx.fillStyle = (l.flash > 0 || ln.blink > 0) && blinkOn ? '#ffffff' : G.t - l.hitAt < 0.06 ? MQLIT[ln.ci] : col;
            if (e) { mqMin(l.g.ch, x, y, e, a); continue; }
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
          if (f.min) { mqMin(f.g.ch, f.x, f.y, Math.min(1, f.min.k) ** 2, a); continue; }
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
    /* ------------------------------------------------------------ practice: five short lessons in XP Setup's look
       As in Boss Rush XP: one lesson at a time, each finished by one thing done in the game, shown in Setup's band at
       the top of the arena with a Skip button (Enter at a desk). The sparring partner is the little monitor from
       Display Properties' Screen Saver tab, playing a preview; it never goes down, and nothing costs health here. */
    const LESSONS = ['move', 'aim', 'dodge', 'graze', 'bomb'];
    const MOVE_NEED = 700, DODGE_NEED = 8, GRAZE_NEED = 10;
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
        // it holds still for the first lesson, then drifts from side to side under the band
        const id = LESSONS[Math.min(pr.step, LESSONS.length - 1)];
        B.x = damp(B.x, id === 'move' ? AW / 2 : AW / 2 + Math.sin(m.t * 0.8) * 100, 2, dt);
        B.y = damp(B.y, pr.top + 64, 4, dt);
      },
      attack(dt) {
        const m = B.m, pr = G.practice;
        if (!pr || pr.good > 0 || (m.cd -= dt) > 0) return;
        const id = LESSONS[pr.step], x = B.x, y = B.y + 8;
        if (id === 'dodge') { m.cd = 0.9; const a = Math.atan2(P.y - y, P.x - x); for (let k = -1; k <= 1; k++) shoot(x, y, a + k * 0.22, 'q3', 90, 80, 170, 3.6); }
        else if (id === 'graze') { m.cd = 0.8; m.rot += 0.3; for (let k = 0; k < 10; k++) shoot(x, y, m.rot + (k * TAU) / 10, 'q0', 60, 40, 120, 3.6); }
        else if (id === 'bomb') { m.cd = 0.45; m.rot += 0.2; for (let k = 0; k < 16; k++) shoot(x, y, m.rot + (k * TAU) / 16, 'q3', 70, 60, 150, 3.6); }
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
      if (G.zoom && (G.zoom.t += dt) > 0.4) G.zoom = null;
      stepPlayer(dt);
      stepBoss(dt);
      stepBullets(dt);
      stepHazard(dt);
      stepShots(dt);
      stepSparks(dt);
      for (let i = tele.length - 1; i >= 0; i--) if ((tele[i].t -= dt) <= 0) tele.splice(i, 1);
      if (G.mode === 'intro') { if ((G.introT += dt) >= G.introLen) { G.mode = 'fight'; if (tipsOn) showTips(false); } }
      else if (G.mode === 'fight') { if (G.practice) stepPractice(dt); else G.fightTime += dt; }
      else if (G.mode === 'won') { if ((G.endT -= dt) <= 0) { if (G.bossIdx < BOSSES.length - 1) { G.bossIdx += 1; beginBoss(false); } else runOver(); } }
      else if (G.mode === 'dead') { if ((G.endT -= dt) <= 0) showDead(); }
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
        if (b.mode === 'min') {
          // Show Desktop: minimised into its button
          b.k += dt / SD_TIME;
          const e = Math.min(1, b.k) ** 2;
          b.x = lerp(b.x0, G.sdT.x, e); b.y = lerp(b.y0, G.sdT.y, e);
          if (b.k >= 1) drop(i);
          continue;
        }
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
        if (dist < b.r + HIT_R) { if (P.inv <= 0) hurt(); }
        else if (!b.grazed && P.inv <= 0 && dist < b.r + GRAZE_R) { b.grazed = true; graze(b.x, b.y, GRAZE_FILL); }
      }
    }
    // what the boss is made of (lasers, pipes, letters, the No signal box): a touch hurts, and passing close grazes, a
    // tick at most every 0.3 s
    function stepHazard(dt) {
      if (laserCd > 0) laserCd -= dt;
      if (G.mode !== 'fight' || !B.on || B.dying) return;
      const d = B.def.hazard(P.x, P.y);
      if (d < LASER_R + HIT_R) { if (P.inv <= 0) hurt(); }
      else if (d < GRAZE_R && P.inv <= 0 && laserCd <= 0) { laserCd = 0.3; graze(P.x, P.y - 4, LASER_FILL); }
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
    function graze(x, y, fill) {
      G.grazes += 1; P.duck = 0.18;
      sfx.graze();
      spark(lerp(x, P.x, 0.4), lerp(y, P.y, 0.4), '#fbc761', 3);
      const was = G.meter;
      G.meter = Math.min(100, G.meter + fill);
      if (was < 100 && G.meter >= 100 && !G.practice) { chip(s.ready, 'low', 1.3); sfx.ready(); }
      const pr = G.practice;
      if (pr && LESSONS[pr.step] === 'graze' && !pr.good && (pr.count += 1) >= GRAZE_NEED) lessonDone();
    }
    function debrisAll() { for (const b of bullets) if (b.mode !== 'min') { b.mode = 'debris'; b.fade = 0.8; } }
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
    // where the Show Desktop button sits, in arena units (below the arena in portrait, beside it in landscape)
    function sdTarget() {
      const r = sdBtn.getBoundingClientRect(), c = cv.getBoundingClientRect();
      if (!r.width || !c.width) return { x: 22, y: AH + 20 };
      return { x: (r.left + r.width / 2 - c.left) / S, y: (r.top + r.height / 2 - c.top) / S };
    }
    function bomb() {
      if (G.mode !== 'fight' || G.paused || G.meter < 100) return;
      G.meter = 0; G.bombs += 1;
      P.inv = Math.max(P.inv, 1); P.press = 0.3;
      G.sdT = sdTarget();
      for (const b of bullets) if (!b.mode) { b.mode = 'min'; b.x0 = b.x; b.y0 = b.y; b.k = 0; }
      tele.length = 0;
      if (B.def.stop) B.def.stop();
      if (B.def.onBomb) B.def.onBomb();
      B.pause = Math.max(B.pause, 0.8);
      damage(SD_DMG);
      G.zoom = { t: 0, x: G.sdT.x, y: G.sdT.y };
      sfx.bomb(); sfx.duck(0.4, 0.6);
      if (G.practice && LESSONS[G.practice.step] === 'bomb') lessonDone();
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
      drawBullets(); drawShots(); drawSparks(); drawZoom(); drawPlayer();
      if (G.debug) { ctx.setTransform(K, 0, 0, K, 0, 0); drawDebug(); }
      if (G.mode === 'demo' && !front.hidden) drawMonitor();
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
        const g = b.grow * (b.mode === 'min' ? 1 - Math.min(1, b.k) * 0.85 : 1), R = sp.R * g;
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
          const L = b.len * (b.mode === 'min' ? 1 - Math.min(1, b.k) : 1);
          ctx.moveTo(b.x - b.dx * L, b.y - b.dy * L); ctx.lineTo(b.x, b.y);
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
    // XP's zoom rectangle, run the minimise way: from the whole arena down to the Show Desktop button
    function drawZoom() {
      const z = G.zoom;
      if (!z) return;
      const steps = 9, cur = Math.min(steps, Math.floor(z.t / 0.035));
      ctx.save();
      ctx.globalCompositeOperation = 'difference'; ctx.strokeStyle = '#808080'; ctx.lineWidth = 2;
      for (let i = Math.max(0, cur - 2); i <= cur; i++) {
        const k = i / steps, w = lerp(AW - 4, 22, k), h = lerp(AH - 4, 16, k), cx = lerp(AW / 2, z.x, k), cy = lerp(AH / 2, z.y, k);
        ctx.strokeRect(cx - w / 2, cy - h / 2, w, h);
      }
      ctx.restore();
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

    /* ------------------------------------------------------------ HUD, balloons and callouts */
    const last = {};
    function put(key, v, fn) { if (last[key] !== v) { last[key] = v; fn(v); } }
    function hudSync() {
      put('bname', B.on ? B.def.name : BOSSES[G.startIdx].name, (v) => { bossName.textContent = v; cv.setAttribute('aria-label', s.arena(v)); });
      const pr = G.practice, frac = pr ? lessonProgress() : B.on ? Math.max(0, B.hp) / B.max : 1;
      put('boss', Math.ceil(frac * 200), (v) => { bossFill.style.width = `${v / 2}%`; bossBar.setAttribute('aria-valuenow', String(Math.round(v / 2))); });
      put('tick', !!pr, (v) => { bossTick.hidden = v; });
      put('phase', pr ? `p:${pr.step}` : B.on ? `${B.def.id}:${B.phase}` : '', () => { bossPhase.textContent = pr ? s.lesStep(Math.min(pr.step, LESSONS.length - 1) + 1, LESSONS.length) : B.on ? s.phase(B.phase) : ''; });
      const fill = Math.floor((P.clean / REFILL_TIME) * 20);
      put('hp', P.hp * 100 + fill, () => {
        hpBlocks.forEach((blk, i) => { blk.classList.toggle('on', i < P.hp); blk.firstElementChild.style.height = i === P.hp && P.hp < HP_MAX ? `${fill * 5}%` : '0'; });
        hud.hp.setAttribute('aria-label', `${s.hp}: ${P.hp} / ${HP_MAX}`);
      });
      put('meter', Math.floor(G.meter), (v) => { sdMeter.style.width = `${v}%`; });
      put('ready', G.meter >= 100 && G.mode === 'fight' && !G.paused, (v) => { sdBtn.disabled = !v; sdBtn.classList.toggle('ready', v); });
      put('mode', G.mode, (v) => { const f = v === 'fight' || v === 'intro'; stage.classList.toggle('fight', f); stage.classList.toggle('demo', v === 'demo'); hud.pause.hidden = !f; });
      put('blank', B.on && B.def === BLANK && !B.dying && (G.mode === 'intro' || G.mode === 'fight' || G.mode === 'dead'), (v) => { stage.classList.toggle('blank', v); });
      put('clock', Math.floor(G.fightTime), (v) => { clockVal.textContent = fmt(v); });
      put('hits', G.hits, (v) => { statHits.textContent = String(v); });
      put('graze', G.grazes, (v) => { statGraze.textContent = String(v); });
      if (tipsOn) placeTips();
    }
    // the first meeting with a boss points at what to shoot; the very first also points at the hotspot
    function showTips(on, withCursor) {
      tipsOn = on;
      if (on) {
        tipCore.innerHTML = `<b>${esc(B.def.name)}</b>${esc(s.tips[B.def.id])}`;
        tipCur.textContent = coarse.matches ? s.tipCursorTouch : s.tipCursor;
        tipCur.hidden = !withCursor;
        placeTips();
      }
      tipCore.classList.toggle('on', on); tipCur.classList.toggle('on', on);
    }
    // the boss's balloon hangs under what to shoot, stem up; the tip's balloon sits above and to the left, clear of the rider
    function placeTips() {
      const aw = AW * S, at = B.def.tipAt();
      let w = tipCore.offsetWidth, tx = at.x * S, left = clamp(tx - 28, 6, aw - w - 6);
      tipCore.style.transform = `translate(${Math.round(left)}px, ${Math.round((at.y + at.below) * S + 10)}px)`;
      tipCore.style.setProperty('--sx', `${Math.round(clamp(tx - left, 12, w - 12))}px`);
      if (tipCur.hidden) return;
      w = tipCur.offsetWidth; tx = P.x * S; left = clamp(tx - w + 18, 6, aw - w - 6);
      tipCur.style.transform = `translate(${Math.round(left)}px, ${Math.round(P.y * S - tipCur.offsetHeight - 12)}px)`;
      tipCur.style.setProperty('--sx', `${Math.round(clamp(tx - left, 12, w - 12))}px`);
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
      panels.boss.h.textContent = s.bossHead; panels.run.h.textContent = s.run; panels.cursor.h.textContent = s.hp;
      panels.sd.h.textContent = s.sd; panels.keys.h.textContent = s.controls;
      hud.clock.querySelector('.lbl').textContent = s.clock;
      hud.stats.querySelector('[data-k="hits"]').textContent = s.statHits;
      hud.stats.querySelector('[data-k="graze"]').textContent = s.statGraze;
      hud.sd.querySelector('.sd-lbl b').textContent = s.sd;
      hud.sd.querySelector('.sd-lbl kbd').textContent = s.sdKey;
      // the pane's legend: keycaps at a desk, the two touches on a touch screen
      hud.keys.innerHTML = (coarse.matches ? s.keysTouchShort.map(([k, v]) => `<p><b>${esc(k)}</b> ${esc(v)}</p>`) : s.keysShort.map(([k, v]) => `<p><kbd>${esc(k)}</kbd> ${esc(v)}</p>`)).join('') + `<p>${esc(s.tipOnly)}</p>`;
      sdBtn.setAttribute('aria-label', s.sdBtn); sdBtn.title = s.sdBtn;
      hud.pause.setAttribute('aria-label', s.pauseBtn); hud.pause.title = s.pauseBtn; hud.pause.lastElementChild.textContent = s.pauseBtn;
      thumbHint.textContent = s.thumb;
      fitPane();
      syncSound();
      for (const k of Object.keys(last)) delete last[k];
    }
    function syncSound() {
      const on = !sfx.muted;
      hud.snd.innerHTML = `${ico(on ? 'sound-on' : 'sound-mute', 16)}<span class="snd-t">${esc(on ? s.soundOn : s.soundOff)}</span>`;
      hud.snd.setAttribute('aria-pressed', String(on)); hud.snd.setAttribute('aria-label', s.sound); hud.snd.title = on ? s.soundOn : s.soundOff;
    }
    function toggleSound() { sfx.ensure(); sfx.setMuted(!sfx.muted); syncSound(); }

    /* ------------------------------------------------------------ dialogs */
    // kind names the dialog for whatever updates it in place; acts are its body's own buttons (data-act), onSubmit takes
    // Enter in its form, and rebuild draws it again as it is (a language switch)
    function openDlg({ title, icon, body, buttons, wide, onEsc, over, kind = '', acts = {}, onSubmit = null, rebuild = null }) {
      layer.hidden = false; layer.className = over ? 'layer over' : 'layer';
      if (over) front.classList.add('inactive');
      // over the scrolling front door the dialog centres in what the scrollbar leaves, as the windows under it do
      layer.style.right = over && !front.hidden ? `${front.offsetWidth - front.clientWidth}px` : '';
      layer.innerHTML = `<div class="mini${wide ? ' wide' : ''}" role="dialog" aria-modal="true" aria-labelledby="dlgT"><div class="title"><span class="t-ico">${ico(icon, 16)}</span><span class="t-text" id="dlgT">${esc(title)}</span></div><div class="dlg">${body}<div class="btns">${buttons.map((b, i) => `<button class="btn${b.def ? ' default' : ''}${b.cls ? ` ${b.cls}` : ''}" type="button" data-i="${i}">${esc(b.label)}</button>`).join('')}</div></div></div>`;
      G.dlg = { buttons, onEsc, kind, acts, onSubmit, rebuild };
      const def = layer.querySelector('.btn.default') || layer.querySelector('.btn');
      if (def) { try { def.focus({ preventScroll: true }); } catch (e) { def.focus(); } }
      // a dialog is modal: once the focus is in it, the front door, the HUD and the arena behind it take no Tab and no click
      setBehind(true);
    }
    function closeDlg() { layer.hidden = true; layer.className = 'layer'; layer.textContent = ''; G.dlg = null; setBehind(false); }
    const behind = [topEl, paneL, paneR, $('#arena'), $('#thumb'), barEl, front];
    function setBehind(on) { for (const el of behind) el.inert = on; }
    function focusStage() { try { stage.focus({ preventScroll: true }); } catch (e) { stage.focus(); } }
    // at a desk the controls are keys, drawn as keycaps; on a touch screen they are actions, named in bold over their line
    function keysList() {
      const touch = coarse.matches;
      return `<dl class="keys${touch ? ' stack' : ''}">${(touch ? s.keysTouch : s.keysDesk).map(([k, v]) => `<dt>${touch ? esc(k) : `<kbd>${esc(k)}</kbd>`}</dt><dd>${esc(v)}</dd>`).join('')}</dl>`;
    }
    function copyBox() { return `<div class="copy" hidden><label for="copyText">${esc(s.copyHand)}</label><textarea id="copyText" rows="4" readonly></textarea></div>`; }
    const goalLine = () => `<p><b>${esc(s.goalHead)}</b> ${esc(s.goal)}</p>`;

    /* ------------------------------------------------------------ the front door: Display Properties at its Screen Saver tab
       The drop-down picks what the little monitor shows: the practice, or a screensaver playing live with the stickman
       on a cursor that dodges on its own. That demo runs in the arena, dimmed behind the front door, and the monitor
       copies its upper part (under reduced motion it holds still, and only the monitor shows it). Preview always starts
       the full run from Starfield.scr, or the practice when that is picked (GAME2_BRIEF.md; with ?debug it starts from
       the picked boss). Blank.scr stays ??? behind the monitor's No signal box until a run has reached it. The
       Leaderboard beside it is the game's board on the portfolio's server. */
    const PICKS = [PRACTICE, ...BOSSES];
    const DEMO_Y = 250, MON_Y = 40, MON_H = 270;   // the demo cursor's line, and the band of the arena the monitor shows
    const RUN_GOAL = BOSSES.reduce((t, b) => t + b.target, 0);
    const gradeOf = (score, goal = RUN_GOAL) => (score <= goal * 1.125 ? 'S' : score <= goal * 1.5 ? 'A' : score <= goal * 2 ? 'B' : 'C');
    const blankMet = () => store.get('ssxp-met-blank') === '1';
    const monCv = document.createElement('canvas'), monCtx = monCv.getContext('2d');
    monCv.setAttribute('role', 'img');
    let pickI = 1;
    const pickName = (d) => (d === PRACTICE ? s.dpPractice : d === BLANK && !blankMet() ? '???' : d.name);
    function startDemo() {
      const d = PICKS[pickI];
      clearField(); resetPlayer();
      Object.assign(P, { inv: 0, x: AW / 2, tx: AW / 2, y: DEMO_Y, ty: DEMO_Y });
      G.mode = 'demo'; B.on = false;
      if (d === BLANK && !blankMet()) return;
      resetBoss(d);
      Object.assign(B, { inv: 0, pause: 0.6 });
      // under reduced motion the fight is run 2.5 s ahead here, unseen, and then holds still (frame)
      if (reduceMotion) for (let i = 0; i < 300; i++) update(STEP);
    }
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
    function drawMonitor() {
      const w = monCv.width, h = monCv.height;
      if (!w) return;
      monCtx.setTransform(1, 0, 0, 1, 0, 0);
      if (B.on) { monCtx.drawImage(cv, 0, MON_Y * K, AW * K, MON_H * K, 0, 0, w, h); return; }
      // Blank.scr, not met yet: the monitor's own On-Screen Display, as the portfolio's CRT draws it
      const k = w / 192, bw = 132 * k, bh = 32 * k, bx = (w - bw) / 2, by = (h - bh) / 2;
      monCtx.fillStyle = '#000'; monCtx.fillRect(0, 0, w, h);
      monCtx.shadowColor = 'rgba(9,151,255,.35)'; monCtx.shadowBlur = 10 * k;
      monCtx.fillStyle = '#00138c'; monCtx.fillRect(bx, by, bw, bh);
      monCtx.shadowColor = 'transparent'; monCtx.shadowBlur = 0;
      monCtx.strokeStyle = '#7a96df'; monCtx.lineWidth = k; monCtx.strokeRect(bx + k / 2, by + k / 2, bw - k, bh - k);
      monCtx.fillStyle = '#ffffff'; monCtx.font = `700 ${Math.round(12 * k)}px "Noto Sans", sans-serif`; monCtx.textAlign = 'center'; monCtx.textBaseline = 'middle';
      monCtx.fillText(s.noSignal, w / 2, h / 2 + k, bw - 16 * k);
    }
    const FRONT_DLG = { buttons: [], onEsc: null, kind: 'front', acts: {}, onSubmit: null };
    function showMenu() {
      closeDlg();
      G.practice = null; lesEl.hidden = true;
      if (sfx.tune !== 'menu') sfx.music('menu');
      sfx.quiet = true;
      G.paused = false; keys.clear(); dragId = null; G.lb = null;
      startDemo();
      showFront();
      loadFrontBoard();
    }
    // the dialog and the board, drawn afresh after the language changes; the demo keeps running under them
    function showFront() {
      front.hidden = false; front.classList.remove('inactive');
      front.innerHTML = `<div class="fd-wrap"><section class="mini fd-dp" role="dialog" aria-labelledby="dpT">`
        + `<div class="title"><span class="t-ico">${ico('retro-pc', 16)}</span><span class="t-text" id="dpT">${esc(s.dp)}</span><button class="tb" type="button" data-act="settings" aria-label="${esc(s.help)}" title="${esc(s.help)}">?</button></div>`
        + `<div class="dp-body"><div class="xtabs" role="tablist" aria-label="${esc(s.dp)}"><span class="xtab" role="tab" id="dpTab" aria-selected="true">${esc(s.dpTab)}</span></div>`
        + `<div class="xpage" role="tabpanel" aria-labelledby="dpTab"><div class="mon"><div class="mon-case" id="monSlot"></div><div class="mon-neck"></div><div class="mon-foot"></div></div>`
        + `<fieldset class="grp"><legend>${esc(s.dpGroup)}</legend><div class="grp-row"><select id="dpPick" aria-label="${esc(s.dpGroup)}">${PICKS.map((d, i) => `<option value="${i}"${i === pickI ? ' selected' : ''}>${esc(pickName(d))}</option>`).join('')}</select>`
        + `<button class="btn" type="button" data-act="settings">${esc(s.dpSettings)}</button><button class="btn default" type="button" data-act="preview">${esc(s.dpPreview)}</button></div><p id="dpInfo"></p></fieldset>`
        + `<fieldset class="grp"><legend>${esc(s.dpRunHead)}</legend><p id="dpRun"></p>${bestLine()}</fieldset></div></div></section>`
        + `<section class="mini fd-lb" aria-labelledby="lbT"><div class="title"><span class="t-ico">${ico('trophy', 16)}</span><span class="t-text" id="lbT">${esc(s.board)}</span></div><div class="dlg lb" aria-live="polite">${boardHTML()}</div></section></div>`;
      front.querySelector('#monSlot').append(monCv);
      monCv.width = Math.round(192 * DPR); monCv.height = Math.round(144 * DPR);
      frontInfo();
      front.querySelectorAll('canvas.lb-ava').forEach(paintAvatar);
      focusPreview();
    }
    function focusPreview() {
      G.dlg = FRONT_DLG;
      const def = front.querySelector('.btn.default');
      if (def) { try { def.focus({ preventScroll: true }); } catch (e) { def.focus(); } }
    }
    // a child dialog closes back onto the front door, which becomes active again
    function closeChild() { closeDlg(); front.classList.remove('inactive'); focusPreview(); }
    function frontInfo() {
      const d = PICKS[pickI], hidden = d === BLANK && !blankMet(), info = front.querySelector('#dpInfo'), run = front.querySelector('#dpRun');
      if (info) info.textContent = d === PRACTICE ? s.dpInfo.practice : hidden ? s.dpInfo.hidden : s.dpInfo[d.id];
      if (run) run.textContent = d === PRACTICE ? s.dpRunPractice : s.dpRun;
      monCv.setAttribute('aria-label', hidden ? s.noSignalLabel : s.monLabel(pickName(d)));
    }
    // the best full run on this device, shown in Display Properties even where the board can't be reached
    const best = () => { try { const b = JSON.parse(store.get('ssxp-best') || 'null'); return b && Number.isFinite(b.score) ? b : null; } catch (e) { return null; } };
    function bestLine() {
      const b = best();
      return b ? `<p class="best">${esc(s.dpBest)} <b>${fmt1(b.score)}</b> <span class="gd g${gradeOf(b.score)}">${gradeOf(b.score)}</span></p>` : `<p class="best">${esc(s.dpNoBest)}</p>`;
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
    // New player: asked over Display Properties before the first play. go runs once a valid name is in; change: opened
    // from Settings to change the name, and back to Settings after
    function askName(go, change) {
      const draft = nameDraft !== null ? nameDraft : playerName() || tidyName(store.get('brxp-name'));
      const leave = (then) => { nameDraft = null; nameErr = false; then(); };
      const back = () => leave(change ? showSettings : closeChild);
      const submit = () => {
        const f = layer.querySelector('#pName'), typed = f ? f.value : draft, n = tidyName(typed);
        if (!nameOk(n)) { nameDraft = typed; nameErr = true; askName(go, change); return; }
        setName(n);
        leave(go);
      };
      openDlg({
        title: change ? s.nameChange : s.nameTitle, icon: 'user', over: true, kind: 'name', rebuild: () => askName(go, change),
        body: `<form class="name-form" novalidate><p>${esc(change ? s.nameChangeText : s.nameText)}</p>`
          + `<div class="field"><label for="pName">${esc(s.nameLabel)}</label><input id="pName" maxlength="${NAME_MAX}" autocomplete="nickname" autocapitalize="words" spellcheck="false" enterkeyhint="go" value="${esc(draft)}" aria-describedby="pNameNote"${nameErr ? ' aria-invalid="true"' : ''}></div>`
          + (nameErr ? `<p class="note err" id="pNameNote">${ico('exclamation-triangle', 16)}<span>${esc(s.lbErr.format)}</span></p>` : `<p class="note" id="pNameNote">${esc(s.nameRule)}</p>`) + '</form>',
        buttons: [{ label: change ? s.save : s.namePlay, def: true, run: submit }, { label: s.cancel, run: back }],
        onEsc: back, onSubmit: submit,
      });
      const f = layer.querySelector('#pName');
      f.addEventListener('input', () => { nameDraft = f.value; });
      try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); }
      // a name already there (this game's, or Boss Rush XP's) is selected: Enter keeps it, typing replaces it
      if (nameErr || f.value) f.select();
    }
    // the front door's board: 'load', then 'ok' with the server's answer or 'off'
    let lbFront = { st: 'load', data: null }, boardAll = null;
    function loadFrontBoard() {
      const v = lbFront = { st: 'load', data: null };
      renderFrontBoard();
      boardCall(`pid=${playerId()}`).then((j) => {
        if (lbFront !== v) return;
        Object.assign(v, j.error ? { st: 'off' } : { st: 'ok', data: j });
        renderFrontBoard();
      });
    }
    function renderFrontBoard() {
      const box = !front.hidden && front.querySelector('.fd-lb .lb');
      if (!box) return;
      box.innerHTML = boardHTML();
      box.querySelectorAll('canvas.lb-ava').forEach(paintAvatar);
    }
    const scoreOf = (r) => r.time + r.hits * 10;
    function boardHTML() {
      const v = lbFront.st;
      if (v === 'load') return `<p class="lb-note">${esc(s.lbLoading)}</p><div class="lb-bar" aria-hidden="true"><i></i></div>`;
      if (v === 'off') {
        const b = best();
        return `<div class="lb-empty">${ico('exclamation-triangle', 32)}<p>${esc(s.lbOff)}</p>${b ? `<p class="lb-note">${esc(s.dpBest)} <b>${fmt1(b.score)}</b></p>` : ''}<button class="btn" type="button" data-act="retry">${esc(s.retry)}</button></div>`;
      }
      const d = v === 'ok' ? lbFront.data : null;
      const open = (n) => `<li class="lb-place p${n} open"><span class="lb-q">?</span><span class="lb-step">${n}</span></li>`;
      if (!d || !d.total) {
        return `<div class="lb-empty"><ol class="lb-podium" aria-hidden="true">${[1, 2, 3].map(open).join('')}</ol>`
          + `<h3>${esc(s.lbEmptyHead)}</h3><p>${esc(s.lbEmptyText)}</p><div class="lb-cta"><button class="btn" type="button" data-act="run">${esc(s.lbStart)}</button><button class="btn" type="button" data-act="practice">${esc(s.lbPractice)}</button></div></div>`;
      }
      const you = (r) => (r.me ? ` <small>${esc(s.lbYou)}</small>` : '');
      const chip = (r) => { const g = gradeOf(scoreOf(r)); return `<span class="gd g${g}" title="${esc(s.lbCols[5])}">${g}</span>`; };
      const place = (r, n) => (r ? `<li class="lb-place p${n}${r.me ? ' me' : ''}"><canvas class="lb-ava" aria-hidden="true"></canvas><span class="lb-name">${esc(r.name)}${you(r)}</span><span class="lb-time">${fmt1(scoreOf(r))} ${chip(r)}</span><span class="lb-step" aria-hidden="true">${n}</span></li>` : open(n));
      const row = (r) => `<li value="${r.rank}"${r.me ? ' class="me"' : ''}><span class="n" aria-hidden="true">${r.rank}</span><span class="nm">${esc(r.name)}${you(r)}</span><span class="t">${fmt1(scoreOf(r))}</span>${chip(r)}</li>`;
      // the player's own row under the top ten when it is further down
      const mine = d.me && !d.top.some((r) => r.me) ? `<li class="gap" aria-hidden="true">⋯</li>${row({ ...d.me, me: true })}` : '';
      const rest = d.top.slice(3).map(row).join('') + mine;
      return `<ol class="lb-podium">${[1, 2, 3].map((n) => place(d.top[n - 1], n)).join('')}</ol>`
        + (rest ? `<ol class="lb-ranks" start="4">${rest}</ol>` : '')
        + `<div class="lb-foot"><span>${esc(s.lbCount(d.total))}</span><button class="lb-link" type="button" data-act="all">${esc(s.lbAll)}</button></div>`;
    }
    // an account picture: the stickman's head and shoulders on a pale sky, as Boss Rush XP's board draws it
    function paintAvatar(c) {
      const n = Math.round(28 * Math.min(2, window.devicePixelRatio || 1)), x = c.getContext('2d');
      c.width = c.height = n;
      x.setTransform(n / 38, 0, 0, n / 38, 0, 0);
      const g = x.createLinearGradient(0, 0, 0, 38);
      g.addColorStop(0, '#c6d3f7'); g.addColorStop(1, '#f3f6fd');
      x.fillStyle = g; x.fillRect(0, 0, 38, 38);
      x.strokeStyle = '#111'; x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = 3.4;
      x.beginPath(); x.moveTo(19, 24); x.lineTo(19, 40); x.moveTo(19, 30); x.lineTo(7, 40); x.moveTo(19, 30); x.lineTo(31, 40); x.stroke();
      x.fillStyle = '#111'; x.beginPath(); x.arc(19, 16, 8.5, 0, TAU); x.fill();
      x.strokeStyle = '#e0301e'; x.lineWidth = 2.6;
      x.beginPath(); x.moveTo(10.5, 14); x.lineTo(27.5, 14); x.stroke();
      x.beginPath(); x.moveTo(27, 14.5); x.lineTo(32, 12); x.lineTo(35, 15.5); x.stroke();
      x.fillStyle = '#fff'; x.beginPath(); x.ellipse(22.8, 16.8, 1.3, 1.9, 0, 0, TAU); x.fill();
    }
    // the board as a table: the top ten with their times and hits, and the player's own row under them when it is further
    // down. From the front door it shows what the board already holds; from the win screen it asks again (back: where OK
    // returns to)
    function showBoardAll(back = closeChild) {
      const have = lbFront.st === 'ok' && back === closeChild;
      const bv = boardAll = { st: have ? 'ok' : 'load', data: have ? lbFront.data : null, back };
      renderBoardAll();
      if (bv.st !== 'load') return;
      boardCall(`pid=${playerId()}`).then((j) => {
        if (boardAll !== bv) return;
        Object.assign(bv, j.error ? { st: 'off' } : { st: 'ok', data: j });
        if (G.dlg && G.dlg.kind === 'board') renderBoardAll();
      });
    }
    function renderBoardAll() {
      const bv = boardAll, d = bv.data;
      const COLS = ['c-rank num', 'c-name', 'c-time num', 'c-hits num', 'c-score num', 'c-grade'];
      const cell = (r) => `<tr${r.me ? ' class="me"' : ''}><td class="${COLS[0]}">${r.rank}</td><td class="${COLS[1]}">${esc(r.name)}${r.me ? ` <small>${esc(s.lbYou)}</small>` : ''}</td><td class="${COLS[2]}">${fmt1(r.time)}</td><td class="${COLS[3]}">${r.hits}</td><td class="${COLS[4]}">${fmt1(scoreOf(r))}</td><td class="${COLS[5]}"><span class="gd g${gradeOf(scoreOf(r))}">${gradeOf(scoreOf(r))}</span></td></tr>`;
      let body;
      if (bv.st === 'load') body = `<p class="lb-note">${esc(s.lbLoading)}</p><div class="lb-bar" aria-hidden="true"><i></i></div>`;
      else if (bv.st === 'off') body = `<p>${esc(s.lbOff)}</p><div><button class="btn" type="button" data-act="retry">${esc(s.retry)}</button></div>`;
      else if (!d.total) body = `<p>${esc(s.lbEmptyHead)}. ${esc(s.lbEmptyText)}</p>`;
      else {
        const mine = d.me && !d.top.some((r) => r.me) ? `<tr><td colspan="6" class="num" aria-hidden="true">⋯</td></tr>${cell({ ...d.me, me: true })}` : '';
        body = `<table class="lb-table"><thead><tr>${s.lbCols.map((c, i) => `<th class="${COLS[i]}" scope="col">${esc(c)}</th>`).join('')}</tr></thead><tbody>${d.top.map(cell).join('')}${mine}</tbody></table>`
          + `<p class="note">${esc(s.lbCount(d.total))}. ${esc(s.lbHow)}</p>`;
      }
      openDlg({
        title: s.board, icon: 'trophy', wide: true, over: !front.hidden, kind: 'board', rebuild: renderBoardAll,
        body: `<div class="lb-all" aria-live="polite">${body}</div>`,
        buttons: [{ label: s.ok, def: true, run: bv.back }], onEsc: bv.back,
        acts: { retry: () => showBoardAll(bv.back) },
      });
    }
    // Settings: how to play, the sound, the pointer trails once they are won (a phone has no menu bar to switch them in),
    // and the player's name, as the screensaver's own settings dialog
    function showSettings() {
      const who = playerName(), tr = opts.trails ? opts.trails.on() : null;
      openDlg({
        title: s.settings, icon: 'retro-pc', wide: true, over: true, kind: 'settings', rebuild: showSettings,
        body: `${goalLine()}<p>${esc(s.premise)}</p>${keysList()}<label class="chk"><input type="checkbox" id="optSound"${sfx.muted ? '' : ' checked'}> ${esc(s.soundOpt)}</label>`
          + (tr === null ? '' : `<label class="chk"><input type="checkbox" id="optTrails"${tr ? ' checked' : ''}> ${esc(s.trailsOpt)}</label>`)
          + (who ? `<div class="name-now"><p class="note">${esc(s.nameNow)} <b>${esc(who)}</b></p><button class="btn" type="button" data-act="name">${esc(s.nameChange)}</button></div>` : ''),
        buttons: [{ label: s.ok, def: true, run: closeChild }],
        onEsc: closeChild,
        acts: { name: () => askName(showSettings, true) },
      });
      layer.querySelector('#optSound').addEventListener('change', (e) => { sfx.ensure(); sfx.setMuted(!e.target.checked); syncSound(); });
      const t = layer.querySelector('#optTrails');
      if (t) t.addEventListener('change', (e) => opts.trails.set(e.target.checked));
    }
    function frontAct(act) {
      if (act === 'settings') showSettings();
      else if (act === 'preview') go(PICKS[pickI] === PRACTICE);
      else if (act === 'run') go(false);
      else if (act === 'practice') go(true);
      else if (act === 'all') showBoardAll();
      else if (act === 'retry') loadFrontBoard();
    }
    function hideFront() { front.hidden = true; front.classList.remove('inactive'); front.textContent = '';
    }
    // Preview: the monitor's picture grows into the arena along XP's zoom rectangle as the run, or the practice, begins.
    // The first play asks for the player's name
    function go(practice) {
      if (!playerName()) { askName(() => { closeChild(); go(practice); }); return; }
      const from = monCv.getBoundingClientRect();
      hideFront();
      if (practice) startPractice(); else startGame(DEBUG ? Math.max(0, pickI - 1) : 0);
      zoomRect(from, cv.getBoundingClientRect());
    }
    function zoomRect(a, b) {
      if (reduceMotion || !a.width || !b.width || !stage.animate) return;
      const st = stage.getBoundingClientRect(), box = (r) => ({ left: `${r.left - st.left}px`, top: `${r.top - st.top}px`, width: `${r.width}px`, height: `${r.height}px` });
      for (let i = 0; i < 3; i++) {
        const z = document.createElement('div');
        z.className = 'zoomr'; stage.append(z);
        z.animate([box(a), box(b)], { duration: 320, delay: i * 40, easing: 'steps(8, end)', fill: 'both' }).onfinish = () => z.remove();
        // a hidden tab holds animations back; the rectangle goes anyway
        setTimeout(() => z.remove(), 900);
      }
    }
    function newRun() {
      Object.assign(G, { fightTime: 0, hits: 0, grazes: 0, bombs: 0, deaths: 0, meter: 0, splits: [] });
    }
    function clearField() {
      for (let i = bullets.length - 1; i >= 0; i--) drop(i);
      shots.length = 0; sparks.length = 0; tele.length = 0; G.zoom = null; G.shake = 0;
      chipsEl.textContent = '';
      if (tipsOn) showTips(false);
    }
    // how far a full run gets, told to the portfolio's day counts (onRun): its start, each later boss, Blank, the win,
    // and the practice begun and finished; a retry and a ?debug run from a later boss tell nothing
    const tell = (d) => { if (opts.onRun) opts.onRun(d); };
    // a boss begins with full health; a retry keeps the run's time and hits, and the meter it began with
    function beginBoss(retrying) {
      clearField(); resetBoss(BOSSES[G.bossIdx]); resetPlayer();
      if (!retrying) { G.bossT0 = G.fightTime; G.bossH0 = G.hits; G.meterAtStart = G.meter; }
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
      G.practice = { step: 0, good: 0, moved: 0, clean: 0, count: 0, lx: P.x, ly: P.y, top: 90 };
      Object.assign(G, { mode: 'fight', paused: false, meter: 0 });
      Object.assign(B, { inv: 0, pause: 0.6 });
      lesEl.hidden = false;
      lessonStart();
      focusStage();
    }
    // the band's height in arena units, so the monitor and the cursor keep under it
    function practiceTop() { if (G.practice && !lesEl.hidden) G.practice.top = lesEl.offsetHeight / S + 2; }
    function lessonStart() {
      const pr = G.practice, id = LESSONS[pr.step], [name, how] = s.les[id];
      Object.assign(pr, { good: 0, moved: 0, clean: 0, count: 0, lx: P.x, ly: P.y });
      debrisAll();
      if (id === 'aim') B.hp = B.max;
      if (id === 'bomb') G.meter = 100;
      lesName.textContent = name;
      lesHow.textContent = typeof how === 'string' ? how : how[coarse.matches ? 0 : 1];
      lesEta.textContent = s.practiceEta(LESSONS.length - pr.step);
      lesSkip.textContent = s.skip;
      if (coarse.matches) { lesSkip.removeAttribute('title'); lesSkip.removeAttribute('aria-keyshortcuts'); } else { lesSkip.title = 'Enter'; lesSkip.setAttribute('aria-keyshortcuts', 'Enter'); }
      practiceTop();
    }
    function stepPractice(dt) {
      const pr = G.practice, id = LESSONS[pr.step];
      if (pr.good > 0) { if ((pr.good -= dt) <= 0) nextLesson(); return; }
      if (id === 'move') { pr.moved += Math.hypot(P.x - pr.lx, P.y - pr.ly); if (pr.moved >= MOVE_NEED) lessonDone(); }
      else if (id === 'dodge' && P.inv <= 0 && (pr.clean += dt) >= DODGE_NEED) lessonDone();
      else if (id === 'bomb') G.meter = 100;
      pr.lx = P.x; pr.ly = P.y;
    }
    function lessonProgress() {
      const pr = G.practice, id = LESSONS[Math.min(pr.step, LESSONS.length - 1)];
      if (pr.good > 0 || pr.step >= LESSONS.length) return 1;
      return clamp(id === 'move' ? pr.moved / MOVE_NEED : id === 'aim' ? 1 - B.hp / B.max : id === 'dodge' ? pr.clean / DODGE_NEED : id === 'graze' ? pr.count / GRAZE_NEED : 0, 0, 1);
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
    // a hit costs nothing in practice; the dodging and grazing lessons say what went wrong
    function practiceHit() {
      const pr = G.practice, id = LESSONS[pr.step];
      P.inv = INV_TIME; P.knock = 1;
      sfx.hit(); spark(P.x, P.y, '#ff3b30', 6);
      for (const b of bullets) if (!b.mode && Math.hypot(b.x - P.x, b.y - P.y) < CANCEL_R) { b.mode = 'debris'; b.fade = 0.25; }
      if (id === 'dodge') { pr.clean = 0; chip(s.lesDodgeHit, 'low', 2.2); }
      else if (id === 'graze') chip(s.lesGrazeHit, 'low', 2.2);
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
        title: s.practice, icon: 'star', kind: 'drill', rebuild: practiceDlg, onEsc: showMenu,
        body: `<div class="dlg-row">${ico('star', 32)}<div><p class="lead">${esc(s.drillDone)}</p><p>${esc(s.drillText)}</p></div></div>`,
        buttons: [{ label: s.menu, run: showMenu }, { label: s.drillAgain, run: () => startPractice() }, { label: s.drillFight, def: true, run: () => startGame(0) }],
      });
    }
    function retry() { closeDlg(); G.meter = G.meterAtStart; beginBoss(true); }
    function pause(force) {
      if (G.mode !== 'fight' && G.mode !== 'intro') return;
      if (G.dlg && !force) return;
      G.paused = true; keys.clear(); dragId = null; sfx.musicHold(true);
      openDlg({
        title: s.paused, icon: 'pause', wide: true, rebuild: () => pause(true),
        body: `<p>${esc(s.pausedText)}</p>${goalLine()}${keysList()}`,
        buttons: [{ label: s.menu, run: showMenu }, { label: s.restart, run: () => (G.practice ? startPractice() : startGame(G.startIdx)) }, { label: s.resume, def: true, run: resume }],
        onEsc: resume,
      });
    }
    function resume() { closeDlg(); G.paused = false; sfx.musicHold(false); focusStage(); }
    const runBosses = () => BOSSES.slice(G.startIdx);
    // the last boss down. Past Blank.scr the tube is back on and the PC starts again: the portfolio plays its Welcome
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
      G.win = { list, goal, score, rank, full, gift, time: G.fightTime, hits: G.hits, seen: false };
      // only a run from the first boss to the last goes on the board (a ?debug run from a later one doesn't)
      G.lb = full ? { st: 'load', name: playerName(), auto: false, err: null, time: G.fightTime, hits: G.hits } : null;
      renderWin();
      if (G.lb) lbCheck();
    }
    // the win screen, drawn again as it was whenever the share dialog or the board closes back onto it
    function renderWin() {
      const w = G.win, row = (k, v) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`;
      const splits = G.splits.map((sp) => row(BOSSES.find((b) => b.id === sp.id).name, fmt1(sp.time))).join('');
      openDlg({
        title: 'Screen Saver XP', icon: 'star', wide: true, kind: 'win', rebuild: renderWin, onEsc: showMenu,
        body: `<div class="dlg-row"><div class="rank${w.seen ? ' still' : ''}" data-rank="${w.rank}"><small>${esc(s.rank)}</small><b>${w.rank}</b></div><div><p class="lead">${esc(s.runDone(w.list.length))}</p><p>${esc(s.flavor)}</p><p class="note">${esc(s.target(fmt(w.goal)))}</p>${w.gift ? `<p class="gift">${ico('star', 16)}${esc(s.gift)}</p>` : ''}</div></div>`
          + `<dl class="stats">${row(s.time, fmt1(w.time))}${splits}${row(s.hits, w.hits)}${row(s.score, fmt1(w.score))}${row(s.grazes, G.grazes)}${row(s.bombs, G.bombs)}${row(s.losses, G.deaths)}</dl>`
          + `<div class="lb-run" aria-live="polite">${lbRunHTML()}</div>`
          + (opts.onContact ? `<div class="cta"><p>${esc(s.cta)}</p><button class="btn" type="button" data-act="contact">${esc(s.contact)}</button></div>` : ''),
        buttons: [{ label: s.menu, run: showMenu }, { label: s.shareOpen, run: showShare }, { label: s.again, def: true, run: () => startGame(G.startIdx) }],
        acts: { contact: () => opts.onContact(), board: () => showBoardAll(renderWin), retry: lbCheck },
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
      const lb = G.lb, w = G.win;
      if (!lb) return '';
      const view = `<button class="btn" type="button" data-act="board">${ico('bullet-list', 16)}${esc(s.lbView)}</button>`;
      if (lb.st === 'load') return `<p>${esc(s.lbLoading)}</p>`;
      if (lb.st === 'off') return `<p>${esc(s.lbOff)}</p><button class="btn" type="button" data-act="retry">${esc(s.retry)}</button>`;
      if (lb.st === 'saved') return `<p><b>${esc(s.lbSaved(lb.me.name, lb.me.rank, lb.total))}</b></p>${view}`;
      if (lb.st === 'kept') return `<p>${esc(s.lbKept(lb.me.rank, lb.total, fmt1(scoreOf(lb.me))))}</p>${view}`;
      if (lb.st === 'none') return view;
      const busy = lb.st === 'saving' ? ' disabled' : '';
      return `<form class="name-form" novalidate><p><b>${esc(s.lbAsk(lb.rank, lb.total))}</b></p>`
        + `<div class="name-row"><div class="field"><label for="lbName">${esc(s.nameLabel)}</label><input id="lbName" maxlength="${NAME_MAX}" autocomplete="nickname" autocapitalize="words" spellcheck="false" enterkeyhint="done" value="${esc(lb.name)}"${busy}${lb.err ? ' aria-describedby="lbErr" aria-invalid="true"' : ''}></div>`
        + `<button class="btn" type="submit"${busy}>${esc(lb.st === 'saving' ? s.saving : s.save)}</button></div>`
        + (lb.err ? `<p class="err" id="lbErr">${ico('exclamation-triangle', 16)}<span>${esc(s.lbErr[lb.err])}</span></p>` : '') + '</form>';
    }
    // redraws the win screen's board part in place; arrived: an answer just came, so the name field (or the button that
    // replaced it) takes the focus, unless the player has already moved it somewhere else
    function renderLb(arrived) {
      const box = G.dlg && G.dlg.kind === 'win' && layer.querySelector('.lb-run');
      if (!box) return;
      // the focus as the stage's shadow root sees it: null when it is somewhere else on the page
      const a = root.activeElement, untouched = !a || box.contains(a) || (layer.contains(a) && a.classList.contains('default'));
      box.innerHTML = lbRunHTML();
      if (!arrived || !untouched) return;
      const f = box.querySelector('input:not(:disabled)') || (!a || box.contains(a) ? box.querySelector('.btn') : null);
      if (f) { try { f.focus({ preventScroll: true }); } catch (e) { f.focus(); } if (f.tagName === 'INPUT' && G.lb.err) f.select(); }
    }

    /* ---- sharing: the result card, and the text with the link to the game ---- */
    // the place on the board shows on the card and in the text once this run is the one saved there
    function boardPos() { const lb = G.lb; return lb && lb.st === 'saved' && lb.me ? { rank: lb.me.rank, total: lb.total } : null; }
    const shareText = () => s.share(G.win.rank, fmt1(G.win.time), G.win.hits, OWNER, gameUrl(), boardPos());
    const cardFile = () => `screen-saver-xp-${G.win.rank}-${fmt1(G.win.time).replace(':', '-')}.png`;
    function cardData() {
      const now = new Date();
      return {
        grade: G.win.rank, time: G.win.time, hits: G.win.hits, name: playerName(), pos: boardPos(), owner: OWNER,
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
      const btn = (act, label, def) => `<button class="btn${def ? ' default' : ''}" type="button" data-act="${act}">${esc(label)}</button>`;
      openDlg({
        title: s.shareTitle, icon: 'image', wide: true, kind: 'share', rebuild: showShare,
        body: `<div class="card-frame"><p>${esc(s.cardMaking)}</p></div><p>${esc(s.shareHint)}</p>`
          + (lb && (lb.st === 'ask' || lb.st === 'saving') ? `<p class="tipbox">${esc(s.cardNoRank)}</p>` : '')
          + `<div class="share-row">${canCopy ? btn('copyImg', s.copyImg, true) : ''}${btn('saveImg', s.saveImg, !canCopy)}${canShareFiles() ? btn('shareTo', s.shareTo) : ''}${btn('copyText', s.copyText)}</div>`
          + `<p class="share-msg" aria-live="polite"></p>${copyBox()}`,
        buttons: [{ label: s.ok, run: renderWin }], onEsc: renderWin,
        acts: { copyImg: copyImage, saveImg: saveImage, shareTo, copyText: copyShare },
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
    // a button says what just happened for a moment, then goes back to its own label
    function flash(b, text) {
      if (!b.isConnected) return;
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
        ta.remove(); b.focus({ preventScroll: true });
        return ok;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), () => done(fallback()));
      else done(fallback());
    }

    /* ------------------------------------------------------------ the result card
       A picture of a win to post anywhere, at the size link previews use (1200 × 630: drawn at half that and doubled).
       It is the front door once the run is won: Display Properties on the desktop, its monitor showing the result on the
       starfield it stopped, the five screensavers ticked off beside it and where to play under it; next to it the stickman
       cheers on his cursor. Boss Rush XP's card is its Start menu; this one keeps the same desktop and taskbar.
       d: grade, time, hits, name, pos ({ rank, total } or null), owner, link, clock */
    const CARD = { w: 600, h: 315, k: 2, bar: 30 };
    const GRADE_INK = { S: ['#f7c948', '#000'], A: ['#11703a', '#fff'], B: ['#0046d5', '#fff'], C: ['#5b5f6b', '#fff'] };
    const CARD_FONT = '"Noto Sans", sans-serif';
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
    const cardHash = (n) => { const v = Math.sin(n * 127.1) * 43758.5453; return v - Math.floor(v); };
    // a title bar button: the blue one with a sign, or the red Close with its cross
    function capBtn(c, x, y, n, close) {
      const g = c.createLinearGradient(0, y, 0, y + n);
      if (close) { g.addColorStop(0, '#f0906c'); g.addColorStop(0.5, '#d9542c'); g.addColorStop(1, '#bd3a12'); } else { g.addColorStop(0, '#4f8af0'); g.addColorStop(0.5, '#2663e0'); g.addColorStop(1, '#1b50c8'); }
      c.fillStyle = g; rrPath(c, x, y, n, n, 3); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 1; rrPath(c, x + 0.5, y + 0.5, n - 1, n - 1, 3); c.stroke();
      c.strokeStyle = '#fff'; c.lineWidth = 2; c.lineCap = 'square';
      if (close) { c.beginPath(); c.moveTo(x + 6, y + 6); c.lineTo(x + n - 6, y + n - 6); c.moveTo(x + n - 6, y + 6); c.lineTo(x + 6, y + n - 6); c.stroke(); }
      else { c.fillStyle = '#fff'; c.font = `bold 12px ${CARD_FONT}`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('?', x + n / 2, y + n / 2 + 1); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; }
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
      const tx = 382, room = CW - tx - 16;
      fitFont(c, 'Screen Saver XP', 'bold ', 24, 16, room);
      c.save(); c.shadowColor = 'rgba(0,20,70,.5)'; c.shadowBlur = 6; c.shadowOffsetY = 2;
      c.fillStyle = '#fff'; c.fillText('Screen Saver XP', tx, 52);
      c.restore();
      const rule = c.createLinearGradient(tx, 0, tx + 192, 0);
      rule.addColorStop(0, '#e8943a'); rule.addColorStop(1, 'rgba(232,148,58,0)');
      c.fillStyle = rule; c.fillRect(tx, 60, 192, 2);
      if (d.owner) { const o = s.cardOwner(d.owner); c.fillStyle = '#fff'; fitFont(c, o, '', 11, 9, room); c.fillText(o, tx + 1, 78); }

      // the stickman cheering on his cursor, a zoomed-in pointer with its soft shadow, and the hotspot at its tip
      const ax = 452, ay = 174, k = 3.8;
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

      // Display Properties: its Luna frame and title bar
      const wx = 14, wy = 14, ww = 352, wh = 262, cap = 26;
      c.save(); c.shadowColor = 'rgba(0,0,40,.45)'; c.shadowBlur = 10; c.shadowOffsetX = 3; c.shadowOffsetY = 3;
      c.fillStyle = '#0831d9'; rrPath(c, wx, wy, ww, wh, 8, true); c.fill();
      c.restore();
      c.fillStyle = '#166aee'; c.fillRect(wx + 1, wy + cap, ww - 2, wh - cap - 1);
      const cg = c.createLinearGradient(0, wy, 0, wy + cap);
      [[0, '#0997ff'], [0.08, '#0053ee'], [0.4, '#0050ee'], [0.88, '#0066ff'], [0.93, '#0066ff'], [0.95, '#005bff'], [0.96, '#003dd7'], [1, '#003dd7']].forEach(([at, col]) => cg.addColorStop(at, col));
      c.fillStyle = cg; rrPath(c, wx, wy, ww, cap, 8, true); c.fill();
      c.fillStyle = '#ece9d8'; c.fillRect(wx + 3, wy + cap, ww - 6, wh - cap - 3);
      icoDraw(c, 'retro-pc', wx + 7, wy + 5, 16);
      c.font = `bold 12px ${CARD_FONT}`;
      c.fillStyle = '#0f1089'; c.fillText(s.dp, wx + 30, wy + 18);
      c.fillStyle = '#fff'; c.fillText(s.dp, wx + 29, wy + 17);
      capBtn(c, wx + ww - 50, wy + 3, 21, false);
      capBtn(c, wx + ww - 26, wy + 3, 21, true);

      // its one tab, joined to its page
      const px = wx + 11, pw = ww - 22, ty = wy + cap + 8, th = 21, py = ty + th - 1, ph = 172;
      c.font = `12px ${CARD_FONT}`;
      const tw = Math.ceil(c.measureText(s.dpTab).width) + 24;
      c.fillStyle = '#fcfcfe'; c.fillRect(px, py, pw, ph);
      c.strokeStyle = '#919b9c'; c.lineWidth = 1; c.strokeRect(px + 0.5, py + 0.5, pw - 1, ph - 1);
      c.fillStyle = '#fcfcfe'; rrPath(c, px + 4, ty, tw, th + 1, 3, true); c.fill();
      c.beginPath(); c.moveTo(px + 4.5, py + 1); c.lineTo(px + 4.5, ty + 3); c.arcTo(px + 4.5, ty + 0.5, px + 7, ty + 0.5, 3); c.lineTo(px + 1.5 + tw, ty + 0.5); c.arcTo(px + 3.5 + tw, ty + 0.5, px + 3.5 + tw, ty + 3, 3); c.lineTo(px + 3.5 + tw, py + 1); c.stroke();
      c.fillStyle = '#e8943a'; c.fillRect(px + 6, ty + 1, tw - 4, 3);
      c.fillStyle = '#ffc83c'; c.fillRect(px + 6, ty + 1, tw - 4, 1);
      c.fillStyle = '#000'; c.fillText(s.dpTab, px + 16, ty + 15);

      // the monitor on its stand, the result on its screen over the starfield it stopped
      const mx = px + 12, my = py + 12, mw = 186, mh = 128, cx = mx + mw / 2;
      const face = c.createLinearGradient(0, my, 0, my + mh);
      face.addColorStop(0, '#fff'); face.addColorStop(0.16, '#ece9d8'); face.addColorStop(1, '#d8d2bd');
      c.fillStyle = face; rrPath(c, mx, my, mw, mh, 8); c.fill();
      c.strokeStyle = '#aca899'; rrPath(c, mx + 0.5, my + 0.5, mw - 1, mh - 1, 8); c.stroke();
      c.fillStyle = '#4cda50'; c.beginPath(); c.arc(mx + mw - 13, my + mh - 8, 2, 0, TAU); c.fill();
      const neck = c.createLinearGradient(cx - 16, 0, cx + 16, 0);
      neck.addColorStop(0, '#d8d2bd'); neck.addColorStop(0.5, '#ece9d8'); neck.addColorStop(1, '#d8d2bd');
      c.fillStyle = neck; c.fillRect(cx - 16, my + mh, 32, 10);
      c.fillStyle = '#aca899'; c.fillRect(cx - 16, my + mh, 1, 10); c.fillRect(cx + 15, my + mh, 1, 10);
      c.fillStyle = '#e2ddcb'; rrPath(c, cx - 48, my + mh + 10, 96, 8, 4); c.fill();
      c.strokeStyle = '#aca899'; rrPath(c, cx - 47.5, my + mh + 10.5, 95, 7, 4); c.stroke();
      const sx = mx + 11, sy = my + 11, sw = mw - 22, sh = mh - 26;
      c.fillStyle = '#1b1d22'; rrPath(c, sx - 2, sy - 2, sw + 4, sh + 4, 4); c.fill();
      c.save(); rrPath(c, sx, sy, sw, sh, 3); c.clip();
      c.fillStyle = '#000'; c.fillRect(sx, sy, sw, sh);
      for (let i = 0; i < 46; i++) {
        c.fillStyle = `rgba(255,255,255,${(0.2 + cardHash(i + 3) * 0.55).toFixed(2)})`;
        c.beginPath(); c.arc(sx + cardHash(i + 0.37) * sw, sy + cardHash(i + 9.1) * sh, 0.4 + cardHash(i + 5.7) * 0.8, 0, TAU); c.fill();
      }
      if (d.name) { c.fillStyle = '#fff'; fitFont(c, d.name, 'bold ', 12, 9, sw - 20); c.fillText(d.name, sx + 10, sy + 19); }
      const [bg, ink] = GRADE_INK[d.grade] || GRADE_INK.C, gx = sx + 10, gy = sy + 27;
      c.fillStyle = bg; rrPath(c, gx, gy, 40, 40, 3); c.fill();
      c.fillStyle = 'rgba(255,255,255,.28)'; c.fillRect(gx + 3, gy + 1.5, 34, 1.5);
      c.fillStyle = ink; c.textAlign = 'center'; c.font = `bold 30px ${CARD_FONT}`; c.fillText(d.grade, gx + 20, gy + 31);
      c.textAlign = 'left'; c.fillStyle = '#fff'; fitFont(c, fmt1(d.time), 'bold ', 24, 14, sw - 70); c.fillText(fmt1(d.time), gx + 50, gy + 25);
      c.fillStyle = '#a6c4f7'; fitFont(c, s.clock, '', 11, 8, sw - 70); c.fillText(s.clock, gx + 51, gy + 39);
      c.fillStyle = '#fff'; c.font = `11px ${CARD_FONT}`; c.fillText(`${s.statHits} ${d.hits}`, sx + 10, sy + sh - 10);
      if (d.pos) { c.textAlign = 'right'; c.font = `bold 11px ${CARD_FONT}`; c.fillText(s.cardPos(d.pos.rank, d.pos.total), sx + sw - 10, sy + sh - 10); c.textAlign = 'left'; }
      c.restore();

      // beside it the five screensavers, each ticked off, in an etched group box
      const gx0 = mx + mw + 12, gw = px + pw - 10 - gx0, gy0 = my + 4, gh = mh + 14;
      c.strokeStyle = '#d8d2bd'; rrPath(c, gx0 + 0.5, gy0 + 0.5, gw - 1, gh - 1, 3); c.stroke();
      c.strokeStyle = '#fff'; rrPath(c, gx0 + 1.5, gy0 + 1.5, gw - 3, gh - 3, 3); c.stroke();
      c.font = `12px ${CARD_FONT}`;
      const lw = c.measureText(s.cardDone).width;
      c.fillStyle = '#fcfcfe'; c.fillRect(gx0 + 6, gy0 - 2, lw + 8, 6);
      c.fillStyle = '#0046d5'; c.fillText(s.cardDone, gx0 + 10, gy0 + 4);
      BOSSES.forEach((b, i) => {
        const y = gy0 + 26 + i * 24, bx = gx0 + 16;
        c.fillStyle = '#3c8f33'; c.beginPath(); c.arc(bx, y - 4, 6, 0, TAU); c.fill();
        c.strokeStyle = '#fff'; c.lineWidth = 1.6; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(bx - 2.8, y - 3.8); c.lineTo(bx - 0.7, y - 1.7); c.lineTo(bx + 2.8, y - 6.2); c.stroke();
        c.lineWidth = 1; c.fillStyle = '#000'; fitFont(c, b.name, 'bold ', 11, 8, gw - 34); c.fillText(b.name, bx + 12, y);
      });

      // under the page, the challenge and where to take it up
      const fy = py + ph + 22;
      c.fillStyle = '#000'; c.font = `bold 12px ${CARD_FONT}`; c.fillText(s.cardAsk, px, fy);
      const askW = c.measureText(s.cardAsk).width;
      c.fillStyle = '#0b5bd3'; fitFont(c, d.link, '', 12, 9, pw - askW - 16);
      c.textAlign = 'right'; c.fillText(d.link, px + pw, fy);
      const lkW = c.measureText(d.link).width; c.fillRect(px + pw - lkW, fy + 2, lkW, 1);
      c.textAlign = 'left';
    }
    // the fonts are the page's own; Noto Sans may still be on its way when the first card is drawn
    async function makeCard(d) {
      if (document.fonts && document.fonts.load) {
        try { await Promise.race([Promise.all([document.fonts.load(`bold 24px "Noto Sans"`), document.fonts.load(`12px "Noto Sans"`), document.fonts.load(`italic bold 15px "Noto Sans"`)]), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* its fallback will do */ }
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
    // a result dialog (this, the practice's and the win screen) takes Escape as Menu, as XP took Esc as Cancel
    function showDead() {
      G.mode = 'result';
      openDlg({
        title: 'Screen Saver XP', icon: 'exclamation-triangle', kind: 'dead', rebuild: showDead, onEsc: showMenu,
        body: `<div class="dlg-row">${ico('exclamation-triangle', 32)}<div><p class="lead">${esc(s.dead)}</p><p>${esc(s.deadText(B.def.name))}</p></div></div>`,
        buttons: [{ label: s.menu, run: showMenu }, { label: s.retry, def: true, run: retry }],
      });
    }
    front.addEventListener('click', (e) => {
      const a = e.target.closest('[data-act]');
      if (a && !front.classList.contains('inactive')) frontAct(a.dataset.act);
    });
    layer.addEventListener('click', (e) => {
      if (!G.dlg) return;
      const a = e.target.closest('[data-act]');
      if (a && G.dlg.acts[a.dataset.act]) { G.dlg.acts[a.dataset.act](a); return; }
      const b = e.target.closest('.btn[data-i]');
      const d = b && G.dlg.buttons[+b.dataset.i];
      if (d) d.run(b);
    });
    layer.addEventListener('submit', (e) => { e.preventDefault(); if (G.dlg && G.dlg.onSubmit) G.dlg.onSubmit(); });
    // Tab goes round the dialog and never out of it, as a modal dialog's does
    layer.addEventListener('keydown', (e) => {
      if (e.key !== 'Tab' || !G.dlg) return;
      const f = [...layer.querySelectorAll('button, input, select, textarea, [href]')].filter((x) => !x.disabled && x.getClientRects().length);
      if (!f.length) return;
      const i = f.indexOf(root.activeElement);
      if (e.shiftKey ? i <= 0 : i === f.length - 1) { e.preventDefault(); f[e.shiftKey ? f.length - 1 : 0].focus(); }
    });

    front.addEventListener('change', (e) => {
      if (e.target.id !== 'dpPick') return;
      pickI = +e.target.value;
      startDemo(); frontInfo();
    });

    /* ------------------------------------------------------------ input */
    // a finger steers from wherever it lands: the cursor moves by the finger's movement, not to the finger
    let lastX = 0, lastY = 0;
    stage.addEventListener('pointerdown', (e) => {
      if (e.pointerType === 'mouse' || dragId !== null) return;
      if (e.target.closest('button, select, .layer, .front')) return;
      dragId = e.pointerId; lastX = e.clientX; lastY = e.clientY; input = 'touch';
      thumbHint.hidden = true;
      try { stage.setPointerCapture(e.pointerId); } catch (err) { /* capture unavailable */ }
      e.preventDefault();
    });
    stage.addEventListener('pointermove', (e) => {
      if (e.pointerId !== dragId) return;
      const g = TOUCH_GAIN / S;
      P.tx = clamp(P.tx + (e.clientX - lastX) * g, X_MIN, X_MAX);
      P.ty = clamp(P.ty + (e.clientY - lastY) * g, yTop(), Y_MAX);
      lastX = e.clientX; lastY = e.clientY;
    });
    const endDrag = (e) => { if (e.pointerId === dragId) dragId = null; };
    stage.addEventListener('pointerup', endDrag);
    stage.addEventListener('pointercancel', endDrag);
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
    sdBtn.addEventListener('click', () => { bomb(); focusStage(); });
    hud.snd.addEventListener('click', () => { toggleSound(); focusStage(); });
    hud.pause.addEventListener('click', () => pause());
    lesSkip.addEventListener('click', () => { skipLesson(); focusStage(); });
    // keys reach the game only while its stage (or something in it) has the focus, so typing elsewhere on the page never
    // moves the cursor
    stage.addEventListener('keydown', (e) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (G.dlg) { if (e.key === 'Escape' && G.dlg.onEsc) { e.preventDefault(); G.dlg.onEsc(); } return; }
      if (e.key === 'Escape' || e.code === 'KeyP') { e.preventDefault(); pause(); return; }
      if (e.key === 'Enter' && G.practice) { e.preventDefault(); skipLesson(); return; }
      if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) bomb(); return; }
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
    root.addEventListener('focusout', (e) => { if (!e.relatedTarget || !root.contains(e.relatedTarget)) away(); });
    // the window's body changes size when it is maximised, restored, resized or turned
    let relayoutRaf = 0;
    const relayout = () => { cancelAnimationFrame(relayoutRaf); relayoutRaf = requestAnimationFrame(layout); };
    const ro = new ResizeObserver(relayout);
    ro.observe(host);
    // a touch screen and a mouse get their own legend and balloon, so the texts are set again when that changes
    const onCoarse = () => { setTexts(); relayout(); };
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
      tellWhere();
    }
    // what the portfolio's status bar says: the screen the game is on
    const where = () => (G.mode === 'demo' ? s.dp : G.practice ? s.practice : ['intro', 'fight', 'won', 'dead'].includes(G.mode) && B.def ? B.def.name : 'Screen Saver XP');
    let whereNow = '';
    function tellWhere() { const w = where(); if (w !== whereNow) { whereNow = w; if (opts.onStatus) opts.onStatus(w); } }

    /* ------------------------------------------------------------ the game as the portfolio's window holds it */
    function focusGame() {
      const d = G.dlg && G.dlg !== FRONT_DLG && layer.querySelector('.btn.default');
      if (d) { try { d.focus({ preventScroll: true }); } catch (e) { d.focus(); } return; }
      if (!front.hidden) focusPreview(); else focusStage();
    }
    function destroy() {
      gone = true;
      cancelAnimationFrame(raf); cancelAnimationFrame(relayoutRaf);
      ro.disconnect();
      removeEventListener('pointermove', onMouse);
      removeEventListener('blur', away);
      document.removeEventListener('visibilitychange', onVis);
      if (coarse.removeEventListener) coarse.removeEventListener('change', onCoarse);
      if (cardMemo && cardMemo.url) URL.revokeObjectURL(cardMemo.url);
      sfx.close();
      host.remove();
    }
    const api = {
      // host: the window's body; the stage moves into a new one when the window is drawn again (a language switch)
      attach(el) { if (host.parentNode !== el) el.appendChild(host); layout(); },
      setLang(l) {
        lang = l === 'id' ? 'id' : 'en';
        setTexts();
        const child = G.dlg && G.dlg !== FRONT_DLG ? G.dlg : null;
        if (!front.hidden) showFront();
        if (child && child.rebuild) child.rebuild();
        if (tooSmall) showSmall();
        whereNow = ''; tellWhere();
      },
      // the menu's New game: a full run from Starfield.scr, asking a first-time player's name first
      newGame() { closeDlg(); go(false); },
      togglePause() { if (G.paused) resume(); else pause(); },
      toggleSound,
      isPaused: () => G.paused,
      isMuted: () => sfx.muted,
      // How to play: the Settings dialog over Display Properties, or the pause dialog (which says it) in a fight
      help() { if (!front.hidden && !front.classList.contains('inactive')) showSettings(); else pause(); },
      board() {
        if (!front.hidden) { if (!front.classList.contains('inactive')) showBoardAll(); return; }
        const back = G.dlg && { win: renderWin, dead: showDead, drill: practiceDlg }[G.dlg.kind];
        if (back) { showBoardAll(back); return; }
        if (G.mode === 'fight' || G.mode === 'intro') { pause(true); showBoardAll(() => pause(true)); }
      },
      // what the portfolio's Game and Help menus can do now; it greys the items that would do nothing
      can(item) {
        const fight = G.mode === 'fight' || G.mode === 'intro', door = !front.hidden && !front.classList.contains('inactive');
        if (item === 'pause') return fight;
        if (item === 'help') return door || (fight && !G.dlg);
        if (item === 'board') return door || fight || (!!G.dlg && ['win', 'dead', 'drill'].includes(G.dlg.kind));
        return true;
      },
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
