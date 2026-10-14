/* Option A — the desktop's sounds.

   PF.sfx: short sounds for what the desktop does, made here in Web Audio (no recordings, none of Windows' own): a
   window opening, closing, going down to the taskbar and coming back, the Start menu's click, a dialog's chord, and a
   chime as the desktop comes up after the loading screen and another as it shuts down. They are quiet, and all go
   through PF.volume (winamp.js), so the tray's speaker sets them and its Mute silences them.
   A browser lets a page sound only after the visitor has pressed something, so nothing plays before the first click,
   tap or key: the chime after a first visit's loading screen is heard only by a visitor who pressed a key or clicked
   while it ran (the self test answers a key), and on every Restart.
   The live wallpaper's trace sounds too when the pointer plucks it: a soft string (Karplus-Strong, a burst of noise
   ringing in a short delay line), its note picked from C major pentatonic by where along the trace it was plucked,
   low on the calm left to high on the swell, so any run of plucks stays in tune. While Winamp plays a song (a file
   or a YouTube video) the string keeps quiet, so it never plays over the music; the trace still moves when plucked.
     play(name)  name: open, close, min, restore, menu, dialog, startup, shutdown
     pluck(at, speed)  at: where along the trace (0 left .. 1 right), speed: how quick the cross was (0..1)
*/
(() => {
  'use strict';
  const PF = (window.PF = window.PF || {});
  const AC = window.AudioContext || window.webkitAudioContext;
  const LEVEL = 0.8;    // the sounds' own level under the site's volume: well under Winamp and the games
  let ctx = null, bus = null;

  // the first press anywhere makes the context, inside the press, as browsers require
  function unlock() {
    if (!AC) return;
    try {
      if (!ctx) {
        ctx = new AC();
        bus = ctx.createGain();
        bus.gain.value = LEVEL;
        bus.connect(PF.volume ? PF.volume.node(ctx) : ctx.destination);
      }
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; /* no sound is fine */ }
  }
  ['pointerdown', 'keydown', 'touchend'].forEach((k) => addEventListener(k, unlock, { capture: true, passive: true }));

  // one note: an oscillator through its own envelope, gliding to `to` when given
  function tone(t, f, dur, { type = 'triangle', gain = 0.15, attack = 0.006, to = 0, dest = bus } = {}) {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(f, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur * 0.6);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest);
    o.start(t); o.stop(t + dur + 0.02);
  }
  // a breath of noise through a band that sweeps from `from` to `to` Hz: the swish of a window moving
  let noiseBuf = null;
  function swish(t, dur, from, to, { gain = 0.32, q = 1.1, type = 'bandpass' } = {}) {
    if (!noiseBuf) {
      noiseBuf = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.5), ctx.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    s.buffer = noiseBuf;
    f.type = type; f.Q.value = q;
    f.frequency.setValueAtTime(from, t);
    f.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(gain, t + dur * 0.25);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus);
    s.start(t); s.stop(t + dur + 0.02);
  }
  // a soft chord rung through a gentle low-pass, each note a sine with a quieter triangle a few cents above it
  function chime(t, notes, step, dur, gain) {
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 2600; lp.connect(bus);
    notes.forEach((f, i) => {
      const at = t + i * step;
      tone(at, f, dur, { type: 'sine', gain, attack: 0.04, dest: lp });
      tone(at, f * 1.003, dur * 0.8, { type: 'triangle', gain: gain * 0.35, attack: 0.05, dest: lp });
    });
  }

  const SOUNDS = {
    open: (t) => { tone(t, 620, 0.13, { to: 980, gain: 0.14 }); tone(t + 0.035, 1310, 0.07, { type: 'sine', gain: 0.05 }); },
    close: (t) => { tone(t, 900, 0.11, { to: 520, gain: 0.12 }); },
    min: (t) => swish(t, 0.17, 2600, 480),
    restore: (t) => swish(t, 0.17, 480, 2600),
    menu: (t) => { swish(t, 0.03, 3200, 2800, { gain: 0.16, q: 0.7, type: 'highpass' }); tone(t, 1760, 0.035, { type: 'sine', gain: 0.04 }); },
    dialog: (t) => chime(t, [440, 554.37, 659.25], 0.012, 0.5, 0.09),
    startup: (t) => chime(t, [261.63, 392, 523.25, 659.25, 783.99], 0.09, 1.7, 0.075),
    shutdown: (t) => chime(t, [783.99, 659.25, 523.25, 392], 0.12, 1.3, 0.075),
  };

  // the plucked trace: C4 to A5 in C major pentatonic (the startup chime's key), each note's string made once
  const STRING = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25, 783.99, 880];
  const RING = 1.6;       // s each string rings for, about as long as the trace's kink takes to die away
  const strings = [];
  function string(i) {
    if (strings[i]) return strings[i];
    const sr = ctx.sampleRate, len = Math.round(sr * RING), n = Math.max(2, Math.round(sr / STRING[i]));
    const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0), line = new Float32Array(n);
    // the burst is smoothed first, so the attack is a soft thumb rather than a pick's click
    let prev = 0;
    for (let k = 0; k < n; k++) { prev = prev * 0.6 + (Math.random() * 2 - 1) * 0.4; line[k] = prev; }
    for (let k = 0; k < len; k++) {
      const j = k % n, nx = (j + 1) % n;
      d[k] = line[j];
      line[j] = 0.4985 * (line[j] + line[nx]);   // averaging dulls it a little each pass: the string's damping
    }
    for (let k = 0, f = Math.round(sr * 0.004); k < f; k++) d[k] *= k / f;   // no click at the start
    for (let k = 0, f = Math.round(sr * 0.25); k < f; k++) d[len - 1 - k] *= k / f;   // nor at the end
    return (strings[i] = buf);
  }

  const ok = () => ctx && ctx.state !== 'closed' && !document.hidden && !(PF.volume && !PF.volume.amount);
  const last = {};
  PF.sfx = {
    play(name) {
      const make = SOUNDS[name];
      if (!make || !ok()) return;
      // the same sound twice within a moment (two windows closing together) is heard once
      const now = performance.now();
      if (now - (last[name] ?? -Infinity) < 60) return;
      last[name] = now;
      try { make(ctx.currentTime + 0.01); } catch (e) { /* no sound is fine */ }
    },
    pluck(at, speed = 0.5) {
      if (!ok() || (PF.winamp && PF.winamp.playing())) return;
      try {
        const i = Math.round(Math.min(1, Math.max(0, at)) * (STRING.length - 1)), t = ctx.currentTime + 0.01;
        const s = ctx.createBufferSource(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
        s.buffer = string(i);
        lp.type = 'lowpass'; lp.frequency.value = 1800 + 1400 * speed; lp.Q.value = 0.5;
        g.gain.value = 0.16 + 0.14 * speed;   // a gentle cross is quieter than a quick one
        s.connect(lp); lp.connect(g); g.connect(bus);
        s.start(t);
      } catch (e) { /* no sound is fine */ }
    },
  };
})();
