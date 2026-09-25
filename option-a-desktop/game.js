/* DIRECTION CONTRACT — Boss Rush XP's front door: "Duel di Desktop"
   THESIS: The title is the XP desktop the game is about: three giant game icons stand as the opponents and the
   whole menu lives in an XP Start menu; no catalog title (a logo over icon rows and a wall of controls).
   OWN-WORLD: Luna desktop blue under one spotlight; giant icons with white shadowed labels, Selection Blue when
   chosen; a Start menu (blue header, white programs, Places Blue column); cream XP balloons with stems; Tahoma.
   Motion is XP's own: instant selection, a 0.15s menu rise, a stepped zoom rectangle.
   STORY: The visitor sees whom they fight, picks Start the fight or presses Enter, and the chosen icon opens
   into its arena like a program; the win returns as that Start menu under their name, ready to share.
   FIRST VIEWPORT: logo top left; three icons across the right half, one selected; the stickman on the taskbar
   facing them; the Start menu open bottom left; a tray balloon: press Enter.
   FORM: Duel di Desktop, rank 7 of 7, seed 2283eb12.
   FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict,
   DESIGN.md, and every shipping raster carrying its provenance */
/* Boss Rush XP: the hidden game in Option A. It opens from the Recycle Bin (jangan-dibuka.exe) or with
   the Konami code. A stickman fights three built-in XP-era games in a row: Mines, Cards and Pinball, and then
   a final boss the title never mentions: the error they leave behind, which crashes to a blue screen halfway.
   Weapons drop in by parachute and last twenty seconds; a full meter unlocks the Ctrl+Alt+Del special.
   Health only comes back the hard way: clean hits refill it block by block, and coffee is a rare drop.
   Desktop only: app.js checks the screen before it loads this file. The arenas are drawn on one canvas
   in the games' own period colours; menus and messages are Luna mini windows in the DOM.
   Wins go on a public leaderboard served next to the portfolio (worker/index.js), when it can be reached.
   window.BossRushXP.create({ lang, onStatus }) -> game: attach(host), setLang(l), newGame(),
   togglePause(), toggleSound(), isPaused(), isMuted(), help(), achievements(), board(), destroy(). */
(() => {
  'use strict';

  /* ------------------------------------------------------------ constants + helpers */
  const W = 960, H = 540, FLOOR = 476, LEFT = 24, RIGHT = 936;
  const MIN_W = 1024, MIN_H = 560;
  const STEP = 1 / 120;
  const TAU = Math.PI * 2;
  const FONT = 'Tahoma, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  // the blue screen's own face
  const MONO = '"Lucida Console", "Courier New", monospace';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const DEBUG = /[?&]debug\b/.test(location.search);
  // runs gained a fourth boss: best times from three-boss runs stay behind under the old key
  const BEST_KEY = 'brxp-best4', MUTE_KEY = 'brxp-mute';

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const damp = (a, b, rate, dt) => lerp(a, b, 1 - Math.exp(-rate * dt));
  const approach = (v, to, d) => (v < to ? Math.min(to, v + d) : Math.max(to, v - d));
  const rand = (a, b) => a + Math.random() * (b - a);
  const sign = (v) => (v < 0 ? -1 : 1);
  const easeOut = (t) => 1 - (1 - t) * (1 - t);
  const easeInOut = (t) => (t < 0.5 ? 2 * t * t : 1 - ((-2 * t + 2) ** 2) / 2);
  const overlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const circleRect = (cx, cy, r, b) => {
    const nx = clamp(cx, b.x, b.x + b.w), ny = clamp(cy, b.y, b.y + b.h);
    return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
  };
  const shuffled = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const icon = (name, size) => (window.PXI ? window.PXI.svg(name, size) : '');
  const fmt = (sec) => { const s = Math.floor(sec); return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; };
  const seeded = (seed) => () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const tooSmall = () => innerWidth < MIN_W || innerHeight < MIN_H;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
  };
  function rr(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }
  function dot(ctx, x, y, r) { ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.fill(); }

  /* ------------------------------------------------------------ strings */
  const STR = {
    en: {
      tagline: 'One stickman against three built-in games.',
      howTo: 'How to play',
      keys: [['← →', 'Move'], ['↑ or Space', 'Jump; press again in the air to double jump. Thrown by a big hit: press just before landing to flip up'],
        ['A', 'Punch; tap up to four times for a combo, hold for a heavy punch. With a weapon: attack'], ['S', 'Kick; tap up to three times, hold for a flying kick. Mix A and S mid-combo for knees and elbows'],
        ['← → + A / S', 'Toward your back: a spinning backfist or a spinning back kick'], ['↓ + A / S', 'Uppercut or sweep. In the air: hammer slam or dive kick'], ['D', 'Dash through attacks. Just before a hit lands: perfect dodge'],
        ['F', 'Full blue bar: 8 seconds of shadow mode, every hit +1. F again: End Task'], ['P or Esc', 'Pause']],
      itemTip: 'Weapons drop in by parachute. Grab one before it vanishes; each lasts 20 seconds.',
      healTip: 'Health refills slowly: land hits without taking one and the next block fills back up. Coffee (+2) is rare: it only drops when you are down to two blocks, once a fight.',
      start: 'Start', resume: 'Resume', menu: 'Main menu', retry: 'Try again', again: 'Play again',
      startMenu: 'Boss Rush XP menu', startFight: 'Start the fight', startFightSub: 'Three games are waiting', practiceSub: '11 steps, about 2 minutes', exitGame: 'Exit the game',
      readyTitle: 'Ready to fight?', readyText: 'Press Enter, or pick Start the fight.', achToast: (n) => `Achievement: ${n}`,
      bossOf: (i, n) => `Boss ${i} of ${n}`,
      loading: 'Loading…',
      uninstall: (n) => `Uninstalling ${n}…`,
      names: ['Mines.exe', 'Cards.exe', 'Pinball.exe', 'Error.exe', 'Recycle Bin'],
      tips: ['Tip: kick a mine to send it back at the boss.', 'Tip: when the cards shuffle, keep your eye on the king.', 'Tip: hit the ball into the boss, or stand on a flipper to ride it up.', 'Tip: hit its red icons back at it, and press OK while it lies on the taskbar.'],
      finalBoss: 'Final boss', finalText: 'Stickman.exe has uninstalled too many system files.', statusFinal: (n) => `Final boss: ${n}`,
      errNotResp: '(Not Responding)',
      errMsg: { idle: 'Stickman.exe has performed an illegal operation.', cascade: 'Too many windows are open.', icons: 'Critical error!', freeze: 'This program is not responding.', slam: 'Click OK to continue.', text: '*** STOP: 0x0000B055', rain: 'Please wait…', die: 'Error.exe will now close.' },
      removed: 'has been removed.',
      paused: 'Paused', pausedText: 'The game is paused.',
      tooSmall: 'This window is too small to play. Make your browser window bigger to continue.',
      crashTitle: 'Stickman.exe',
      crash: 'Stickman.exe has encountered a problem and needs to close.',
      sorry: 'We are sorry for the inconvenience.',
      cause: (n) => `Error caused by: ${n}`,
      winTitle: 'Uninstall complete',
      winText: 'The built-in games are gone and the system is stable again. Time to get back to work.',
      time: 'Time', hits: 'Hits taken', best: 'Best time', newBest: 'New record!',
      rank: 'Grade', copy: 'Copy result', copied: 'Copied!', copyHand: 'Copy this text:',
      share: (r, t, n, who, url, pos) => `I beat Boss Rush XP${who ? ` on ${who}’s portfolio` : ''}: grade ${r}, ${t}, ${n} ${n === 1 ? 'hit' : 'hits'} taken${pos ? `, #${pos.rank} of ${pos.total} ${pos.total === 1 ? 'player' : 'players'}` : ''}. Can you do better? ${url}`,
      board: 'Leaderboard', lbLoading: 'Checking the leaderboard…', lbAsk: (r, n) => `This run takes #${r} of ${n} on the leaderboard.`,
      lbName: 'Your name', lbSave: 'Save', lbSaving: 'Saving…',
      lbSaved: (name, r, n) => `Saved as ${name}: #${r} of ${n}.`, lbKept: (r, n, t) => `Your best run (${t}) stays #${r} of ${n}.`,
      lbOff: 'The leaderboard can’t be reached right now.', lbView: 'View leaderboard',
      lbErr: { format: 'Use 1 to 12 letters, numbers, spaces, - or _.', name: 'That name can’t be used. Try another one.', slow: 'Too many saves from here. Try again in a few minutes.', net: 'Couldn’t save. Try again.' },
      lbCols: ['#', 'Name', 'Time', 'Hits', 'Grade'], lbCount: (n) => `${n} ${n === 1 ? 'player' : 'players'}`, lbHow: 'Ranked by time plus 10 seconds for every hit taken.',
      lbEmpty: 'Nobody has finished yet. Be the first!', lbYou: 'you',
      shareOpen: 'Share result…', shareTitle: 'Share your result', shareHint: 'Paste the picture into WhatsApp, LinkedIn or X, then add the text: it carries the link to the game.',
      cardMaking: 'Drawing your result card…', cardFail: 'The picture couldn’t be made. The text can still be copied.', cardNoRank: 'Save your name first to put your place on the card.',
      copyImg: 'Copy image', imgCopied: 'Image copied!', imgFail: 'This browser can’t copy pictures. Download it instead.', saveImg: 'Download image', imgSaved: (f) => `Downloading ${f}…`, copyText: 'Copy text', shareTo: 'Share to…',
      cardAll: 'All four bosses uninstalled', cardRank: 'Leaderboard', cardPos: (r, n) => `#${r} of ${n}`, cardAsk: 'Can you beat it?', cardOwner: (o) => `${o}’s portfolio`,
      cardAlt: (g, t, n, pos) => `Boss Rush XP result card: grade ${g}, ${t}, ${n} ${n === 1 ? 'hit' : 'hits'} taken${pos ? `, #${pos.rank} of ${pos.total} on the leaderboard` : ''}.`,
      cta: 'Enjoyed this little game? Let’s build something together.', contact: 'Contact me',
      gift: 'Reward: the stickman now lives on your taskbar.',
      practice: 'Practice', lesStep: (i, n) => `Step ${i} of ${n}:`, lesSkip: 'Enter: skip',
      practiceEta: (n) => `Practice will complete in approximately: ${n > 6 ? '2 minutes' : n > 3 ? '1 minute' : 'less than a minute'}`,
      lesGood: 'Nice!', lesDodgeHit: 'Hit! Press D just as the paper is about to touch you.', lesDodgeLate: 'Through it! Now a little later, for a perfect dodge.',
      les: {
        move: ['Move', 'Press [←] and [→] to walk.'],
        jump: ['Jump', 'Press [↑], then [↑] again in the air to double jump.'],
        punch: ['Punch', 'Walk up to the bin and press [A] four times for a combo.'],
        heavy: ['Heavy punch', 'Hold [A] until your fist glows, then let go.'],
        kick: ['Kick', 'Press [S] twice for a roundhouse.'],
        spin: ['Spinning attack', 'With your back to the bin, press the arrow toward it and [S] together.'],
        rise: ['Uppercut', 'Hold [↓] and press [A].'],
        dash: ['Dash', 'Press [D] to dash. While dashing, nothing can hit you.'],
        dodge: ['Perfect dodge', 'The bin throws paper. Press [D] just before it hits you.'],
        weapon: ['Weapons', 'Grab the keyboard that drops in, then attack with [A].'],
        special: ['Shadow mode', 'Press [F] for shadow mode, then [F] again for End Task.'],
      },
      drillDone: 'Practice complete!', drillText: 'You have the basics down. The built-in games are waiting to be uninstalled.', drillFight: 'Start the fight', drillAgain: 'Practice again',
      status: (i, n, name) => `Boss ${i}/${n}: ${name}`,
      statusMenu: 'Main menu',
      canvasLabel: 'Boss Rush XP. Arrow keys move, A punches, S kicks, D dashes, F starts shadow mode, P pauses.',
      fight: 'Fight!',
      stick: 'Stickman',
      items: { keyboard: 'Keyboard', mouse: 'Mouse', cd: 'CD', paint: 'Paint', coffee: 'Coffee' },
      gone: (n) => `${n} is gone`,
      ready: 'Shadow mode ready', shadowOn: 'Shadow mode', shadowHud: 'F: End Task', missed: 'Missed', techOk: 'Back flip!',
      shadowSay: 'Shadow mode: every hit lands harder for 8 seconds. Press F again for End Task.', shadowOver: 'Shadow mode is over.',
      phase2: 'Phase 2',
      combo: (n) => `${n} hits`,
      restoring: 'Restoring…', critical: 'Critical!', healed: (n) => `Health +${n}`,
      perfect: 'Perfect dodge!', perfects: 'Perfect dodges',
      achTitle: 'Achievements', achUnlocked: 'Achievement unlocked', achCount: (n, t) => `${n} of ${t} unlocked`, achOn: 'Unlocked', achOff: 'Locked',
      ach: {
        crash: ['Error Report', 'Crash Stickman.exe for the first time.'],
        endtask: ['End Task', 'Hit a boss with End Task in shadow mode.'],
        collector: ['Collector', 'Fight with all four weapons.'],
        combo: ['Hit Streak', 'Land a 10-hit combo.'],
        restore: ['System Restore', 'Win back health with clean hits.'],
        perfect: ['Close Call', 'Pull off a perfect dodge.'],
        sender: ['Return to Sender', 'Kick a mine back into Mines.exe.'],
        eagle: ['Eagle Eye', 'Find the king while the cards shuffle.'],
        jackpot: ['Jackpot', 'Hit Pinball.exe with its own ball.'],
        lastcup: ['Last Cup', 'Drink coffee with one block of health left.'],
        flawless: ['Flawless', 'Beat a boss without taking a hit.'],
        clickok: ['Click OK', 'Press the OK button on Error.exe.'],
        uninstall: ['Clean Desktop', 'Beat every boss.'],
        rankS: ['S Grade', 'Finish a run with an S grade.'],
      },
      ended: 'Task ended',
    },
    id: {
      tagline: 'Satu stickman melawan tiga game bawaan.',
      howTo: 'Cara bermain',
      keys: [['← →', 'Bergerak'], ['↑ atau Spasi', 'Lompat; tekan lagi di udara untuk lompat ganda. Terpental serangan besar: tekan tepat sebelum mendarat untuk salto'],
        ['A', 'Pukul; tekan sampai empat kali untuk kombo, tahan untuk pukulan berat. Dengan senjata: menyerang'], ['S', 'Tendang; tekan sampai tiga kali, tahan untuk tendangan terbang. Selingi A dan S di tengah kombo untuk lutut dan siku'],
        ['← → + A / S', 'Ke arah belakangmu: backfist berputar atau tendangan putar belakang'], ['↓ + A / S', 'Uppercut atau sapuan. Di udara: hantaman palu atau tendangan menukik'], ['D', 'Dash menembus serangan. Tepat sebelum kena: dodge sempurna'],
        ['F', 'Bar biru penuh: mode bayangan 8 detik, tiap serangan +1. F lagi: Akhiri tugas'], ['P atau Esc', 'Jeda']],
      itemTip: 'Senjata turun dengan parasut. Ambil sebelum hilang; tiap senjata bertahan 20 detik.',
      healTip: 'Nyawa pulih perlahan: serang tanpa terkena serangan dan blok berikutnya terisi lagi. Kopi (+2) langka: hanya jatuh saat nyawa tinggal dua, sekali per pertarungan.',
      start: 'Mulai', resume: 'Lanjut', menu: 'Menu utama', retry: 'Coba lagi', again: 'Main lagi',
      startMenu: 'Menu Boss Rush XP', startFight: 'Mulai pertarungan', startFightSub: 'Tiga game menunggu', practiceSub: '11 langkah, 2 menit', exitGame: 'Keluar dari game',
      readyTitle: 'Siap bertarung?', readyText: 'Tekan Enter, atau pilih Mulai pertarungan.', achToast: (n) => `Pencapaian: ${n}`,
      bossOf: (i, n) => `Bos ${i} dari ${n}`,
      loading: 'Memuat…',
      uninstall: (n) => `Menghapus ${n}…`,
      names: ['Ranjau.exe', 'Kartu.exe', 'Pinball.exe', 'Kesalahan.exe', 'Tempat Sampah'],
      tips: ['Tip: tendang ranjau untuk mengembalikannya ke bos.', 'Tip: saat kartu dikocok, jangan lepaskan pandangan dari sang raja.', 'Tip: pukul bola ke arah bos, atau berdiri di atas flipper untuk terlempar ke atas.', 'Tip: pukul balik ikon merahnya, dan tekan OK saat ia tergeletak di taskbar.'],
      finalBoss: 'Bos terakhir', finalText: 'Stickman.exe telah menghapus terlalu banyak file sistem.', statusFinal: (n) => `Bos terakhir: ${n}`,
      errNotResp: '(Tidak merespons)',
      errMsg: { idle: 'Stickman.exe telah melakukan operasi ilegal.', cascade: 'Terlalu banyak jendela terbuka.', icons: 'Kesalahan kritis!', freeze: 'Program ini tidak merespons.', slam: 'Klik OK untuk melanjutkan.', text: '*** STOP: 0x0000B055', rain: 'Harap tunggu…', die: 'Kesalahan.exe akan ditutup.' },
      removed: 'berhasil dihapus.',
      paused: 'Jeda', pausedText: 'Permainan sedang dijeda.',
      tooSmall: 'Jendela ini terlalu kecil untuk bermain. Perbesar jendela browser Anda untuk melanjutkan.',
      crashTitle: 'Stickman.exe',
      crash: 'Stickman.exe mengalami masalah dan harus ditutup.',
      sorry: 'Mohon maaf atas ketidaknyamanan ini.',
      cause: (n) => `Penyebab: ${n}`,
      winTitle: 'Penghapusan selesai',
      winText: 'Game bawaan sudah hilang dan sistem kembali stabil. Saatnya kembali bekerja.',
      time: 'Waktu', hits: 'Terkena serangan', best: 'Waktu terbaik', newBest: 'Rekor baru!',
      rank: 'Nilai', copy: 'Salin hasil', copied: 'Tersalin!', copyHand: 'Salin teks ini:',
      share: (r, t, n, who, url, pos) => `Aku menamatkan Boss Rush XP${who ? ` di portofolio ${who}` : ''}: nilai ${r}, waktu ${t}, terkena ${n} serangan${pos ? `, peringkat #${pos.rank} dari ${pos.total} pemain` : ''}. Bisa lebih baik? ${url}`,
      board: 'Papan peringkat', lbLoading: 'Mengecek papan peringkat…', lbAsk: (r, n) => `Waktu ini masuk peringkat #${r} dari ${n} pemain.`,
      lbName: 'Namamu', lbSave: 'Simpan', lbSaving: 'Menyimpan…',
      lbSaved: (name, r, n) => `Tersimpan sebagai ${name}: peringkat #${r} dari ${n}.`, lbKept: (r, n, t) => `Rekor terbaikmu (${t}) tetap peringkat #${r} dari ${n}.`,
      lbOff: 'Papan peringkat sedang tidak bisa dihubungi.', lbView: 'Lihat papan',
      lbErr: { format: 'Pakai 1–12 huruf, angka, spasi, - atau _.', name: 'Nama itu tidak bisa dipakai. Coba nama lain.', slow: 'Terlalu sering menyimpan dari sini. Coba lagi beberapa menit lagi.', net: 'Gagal menyimpan. Coba lagi.' },
      lbCols: ['#', 'Nama', 'Waktu', 'Kena', 'Nilai'], lbCount: (n) => `${n} pemain`, lbHow: 'Diurutkan dari waktu + 10 detik untuk tiap serangan yang kena.',
      lbEmpty: 'Belum ada yang menamatkan. Jadilah yang pertama!', lbYou: 'kamu',
      shareOpen: 'Bagikan hasil…', shareTitle: 'Bagikan hasil', shareHint: 'Tempel gambarnya di WhatsApp, LinkedIn, atau X, lalu tambahkan teksnya: di situ ada link ke game.',
      cardMaking: 'Menggambar kartu hasil…', cardFail: 'Gambarnya gagal dibuat. Teksnya tetap bisa disalin.', cardNoRank: 'Simpan namamu dulu agar peringkatmu ikut tampil di kartu.',
      copyImg: 'Salin gambar', imgCopied: 'Gambar tersalin!', imgFail: 'Browser ini tidak bisa menyalin gambar. Unduh saja gambarnya.', saveImg: 'Unduh gambar', imgSaved: (f) => `Mengunduh ${f}…`, copyText: 'Salin teks', shareTo: 'Bagikan ke…',
      cardAll: 'Keempat bos terhapus', cardRank: 'Peringkat', cardPos: (r, n) => `#${r} dari ${n}`, cardAsk: 'Bisa lebih cepat?', cardOwner: (o) => `Portofolio ${o}`,
      cardAlt: (g, t, n, pos) => `Kartu hasil Boss Rush XP: nilai ${g}, waktu ${t}, terkena ${n} serangan${pos ? `, peringkat #${pos.rank} dari ${pos.total}` : ''}.`,
      cta: 'Suka game kecil ini? Mari bangun sesuatu bersama.', contact: 'Hubungi saya',
      gift: 'Hadiah: stickman kini tinggal di taskbar Anda.',
      practice: 'Latihan', lesStep: (i, n) => `Langkah ${i} dari ${n}:`, lesSkip: 'Enter: lewati',
      practiceEta: (n) => `Latihan selesai dalam sekitar: ${n > 6 ? '2 menit' : n > 3 ? '1 menit' : 'kurang dari 1 menit'}`,
      lesGood: 'Bagus!', lesDodgeHit: 'Kena! Tekan D tepat saat kertas hampir menyentuhmu.', lesDodgeLate: 'Tembus! Sekarang sedikit lebih lambat untuk dodge sempurna.',
      les: {
        move: ['Bergerak', 'Tekan [←] dan [→] untuk berjalan.'],
        jump: ['Lompat', 'Tekan [↑], lalu [↑] lagi di udara untuk lompat ganda.'],
        punch: ['Pukul', 'Dekati tempat sampah, lalu tekan [A] empat kali untuk kombo.'],
        heavy: ['Pukulan berat', 'Tahan [A] sampai kepalan menyala, lalu lepaskan.'],
        kick: ['Tendang', 'Tekan [S] dua kali untuk tendangan putar.'],
        spin: ['Serangan putar', 'Membelakangi tempat sampah, tekan panah ke arahnya bersamaan dengan [S].'],
        rise: ['Uppercut', 'Tahan [↓], lalu tekan [A].'],
        dash: ['Dash', 'Tekan [D] untuk dash. Selama dash, tak ada yang bisa mengenaimu.'],
        dodge: ['Dodge sempurna', 'Tempat sampah melempar kertas. Tekan [D] tepat sebelum kertas mengenaimu.'],
        weapon: ['Senjata', 'Ambil keyboard yang jatuh, lalu serang dengan [A].'],
        special: ['Mode bayangan', 'Tekan [F] untuk mode bayangan, lalu [F] lagi untuk Akhiri tugas.'],
      },
      drillDone: 'Latihan selesai!', drillText: 'Dasarnya sudah kamu kuasai. Game-game bawaan menunggu untuk dihapus.', drillFight: 'Mulai pertarungan', drillAgain: 'Latihan lagi',
      status: (i, n, name) => `Bos ${i}/${n}: ${name}`,
      statusMenu: 'Menu utama',
      canvasLabel: 'Boss Rush XP. Tombol panah untuk bergerak, A memukul, S menendang, D dash, F mode bayangan, P jeda.',
      fight: 'Lawan!',
      stick: 'Stickman',
      items: { keyboard: 'Keyboard', mouse: 'Mouse', cd: 'CD', paint: 'Cat', coffee: 'Kopi' },
      gone: (n) => `${n} habis`,
      ready: 'Mode bayangan siap', shadowOn: 'Mode bayangan', shadowHud: 'F: Akhiri tugas', missed: 'Meleset', techOk: 'Salto!',
      shadowSay: 'Mode bayangan: setiap serangan lebih keras selama 8 detik. Tekan F lagi untuk Akhiri tugas.', shadowOver: 'Mode bayangan berakhir.',
      phase2: 'Fase 2',
      combo: (n) => `${n} pukulan`,
      restoring: 'Memulihkan…', critical: 'Kritis!', healed: (n) => `Nyawa +${n}`,
      perfect: 'Dodge sempurna!', perfects: 'Dodge sempurna',
      achTitle: 'Pencapaian', achUnlocked: 'Pencapaian terbuka', achCount: (n, t) => `${n} dari ${t} terbuka`, achOn: 'Terbuka', achOff: 'Terkunci',
      ach: {
        crash: ['Laporan kesalahan', 'Buat Stickman.exe berhenti bekerja untuk pertama kali.'],
        endtask: ['Akhiri tugas', 'Kenai bos dengan Akhiri tugas saat mode bayangan.'],
        collector: ['Kolektor', 'Bertarung dengan keempat senjata.'],
        combo: ['Beruntun', 'Buat kombo 10 pukulan.'],
        restore: ['Pemulihan sistem', 'Pulihkan nyawa lewat serangan bersih.'],
        perfect: ['Nyaris', 'Lakukan dodge sempurna.'],
        sender: ['Kembali ke pengirim', 'Tendang ranjau hingga mengenai Ranjau.exe.'],
        eagle: ['Mata elang', 'Temukan raja saat kartu dikocok.'],
        jackpot: ['Jackpot', 'Pukul bola hingga mengenai Pinball.exe.'],
        lastcup: ['Kopi terakhir', 'Minum kopi saat nyawa tinggal satu blok.'],
        flawless: ['Tanpa goresan', 'Kalahkan satu bos tanpa terkena serangan.'],
        clickok: ['Klik OK', 'Tekan tombol OK milik Kesalahan.exe.'],
        uninstall: ['Desktop bersih', 'Kalahkan semua bos.'],
        rankS: ['Nilai S', 'Tamatkan permainan dengan nilai S.'],
      },
      ended: 'Tugas diakhiri',
    },
  };
  const BOSS_ICON = ['flag', 'crown', 'sparkles', 'error'];
  // weapons: how long one lasts once picked up, and how long a pickup waits on the ground
  const WEAPON_TIME = 20, ITEM_LIFE = 9;
  // health comes back the hard way: RESTORE damage dealt without taking a hit refills one block (End Task
  // does not count), and coffee (+2) may drop only at COFFEE_AT blocks or fewer, once a fight, with a
  // COFFEE_CHANCE on each drop, and waits on the ground just COFFEE_LIFE seconds
  const RESTORE = 12, COFFEE_AT = 2, COFFEE_CHANCE = 0.5, COFFEE_LIFE = 5;
  // the grade on the win screen: fight time plus ten seconds per hit taken, against these ceilings (else C)
  const RANKS = [['S', 155], ['A', 230], ['B', 340]];
  // a perfect dodge: a dash that meets an attack within its first DODGE_WINDOW seconds. The boss and everything
  // it throws then run at SLOW_SCALE speed for SLOW_TIME seconds while he moves freely, the special meter gains
  // DODGE_METER, he stays safe DODGE_SAFE seconds past the dash, and the next one can't come for DODGE_CD seconds
  const DODGE_WINDOW = 0.1, SLOW_TIME = 1.1, SLOW_SCALE = 0.35, DODGE_METER = 20, DODGE_SAFE = 0.5, DODGE_CD = 2.5;
  // the other way pressed with an attack, or within TURN_WINDOW of turning, makes it a turning attack
  const TURN_WINDOW = 0.1;
  // a held punch or kick charges at least CHARGE_MIN and lets go by itself at CHARGE_MAX
  const CHARGE_MIN = 0.2, CHARGE_MAX = 1.2;
  // on a platform ↓ drops through only once held DROP_DELAY, so ↓ + A and ↓ + S still work up there
  const DROP_DELAY = 0.08;
  // shadow mode: SHADOW_TIME seconds in which every hit lands SHADOW_DMG harder while the bar runs down. Its
  // light is the cold blue of the perfect dodge, pushed toward cyan the way Shadow Fight 3 lights a full bar
  const SHADOW_TIME = 8, SHADOW_DMG = 1, SHADOW_C = '#7fd4ff', SHADOW_GLOW = 'rgba(70,180,255,.9)';
  // practice: one lesson per step, each finished by one game event (see Game.lesson)
  const LESSONS = [['move', 'moved'], ['jump', 'double'], ['punch', 'hit:upper'], ['heavy', 'hit:heavyP'], ['kick', 'hit:round'], ['spin', 'hit:spin'], ['rise', 'hit:rise'],
    ['dash', 'dash'], ['dodge', 'perfect'], ['weapon', 'weapon'], ['special', 'special']];
  // achievements, roughly easiest first; names and how-tos are in STR.ach. They are kept in this browser:
  // { got: { id: when }, arms: [weapon kinds ever picked up] }, and each one shows once as an XP balloon
  const ACHS = ['crash', 'endtask', 'collector', 'combo', 'restore', 'perfect', 'sender', 'eagle', 'jackpot', 'clickok', 'lastcup', 'flawless', 'uninstall', 'rankS'];
  const ACH_KEY = 'brxp-ach', TOAST_TIME = 3.4;
  function loadAch() {
    try {
      const o = JSON.parse(store.get(ACH_KEY) || '{}');
      return { got: o && typeof o.got === 'object' && o.got ? o.got : {}, arms: Array.isArray(o && o.arms) ? o.arms : [] };
    } catch (e) { return { got: {}, arms: [] }; }
  }
  const gradeOf = (time, hits) => (RANKS.find(([, max]) => time + hits * 10 <= max) || ['C'])[0];
  // the public leaderboard (worker/index.js) answers on the portfolio's own server; without it the game plays on.
  // A player is a random id kept in this browser, and a win is offered for saving only when it beats that id's
  // saved best. Names follow the server's rule: 1 to 12 letters, digits, spaces, - or _
  const BOARD_URL = '/api/scores', BOARD_WAIT = 8000, PID_KEY = 'brxp-pid', NAME_KEY = 'brxp-name', NAME_MAX = 12;
  let pidNow = null;
  function playerId() {
    if (pidNow) return pidNow;
    pidNow = store.get(PID_KEY);
    if (!/^[a-z0-9]{16,40}$/.test(pidNow || '')) {
      pidNow = Array.from(crypto.getRandomValues(new Uint8Array(12)), (b) => b.toString(16).padStart(2, '0')).join('');
      store.set(PID_KEY, pidNow);
    }
    return pidNow;
  }
  const tidyName = (v) => String(v || '').replace(/\s+/g, ' ').trim();
  const nameOk = (n) => n.length <= NAME_MAX && /^[A-Za-z0-9 _-]+$/.test(n) && /[A-Za-z0-9]/.test(n);
  // one request: the server's answer, or { error } with its code ('net' when it can't be reached in time)
  async function boardCall(query, body) {
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), BOARD_WAIT);
    try {
      const r = await fetch(BOARD_URL + query, body ? { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body), signal: ctl.signal } : { signal: ctl.signal });
      const j = await r.json();
      return r.ok && j && !j.error ? j : { error: (j && j.error) || 'net' };
    } catch (e) { return { error: 'net' }; } finally { clearTimeout(timer); }
  }
  const ITEM_KINDS = ['keyboard', 'mouse', 'cd', 'paint'];
  const PAINTS = ['#e0301e', '#1f55c9', '#1fb85a', '#b58fe8', '#ffc83c'];
  const TRAIL = { keyboard: '#9fd0ff', mouse: '#ffffff', cd: '#e6d6ff', paint: '#ffb08a' };

  /* ------------------------------------------------------------ music: an original loop for each boss */
  // Tracker notation: a bar is 16 sixteenth steps, one token each. A note (A4, C#5, Bb2) starts on its step,
  // '-' holds the note before it for one more step, '.' is silence. A drum step combines k (kick), s (snare),
  // h (closed hat), o (open hat) and t (a clock tick). In phase two the loop runs 10% faster, and the chords
  // come in as an arpeggio (every `arp` steps) with, where `hats` is set, a hat on every empty step.
  const SONGS = {
    // A minor, ticking and tense
    mines: {
      bpm: 132, arp: 1, hats: true, leadTone: ['square', 0.06, 2400], bassTone: ['triangle', 0.16],
      chords: ['A4 C5 E5', 'F4 A4 C5', 'G4 B4 D5', 'E4 G#4 B4', 'D4 F4 A4', 'A4 C5 E5', 'F4 A4 C5', 'E4 G#4 B4'],
      melody: [
        'A4 . C5 . E5 . . . D5 . C5 . B4 . C5 .', 'A4 . . . F4 . . . A4 . C5 . F5 . E5 .',
        'D5 . . . B4 . G4 . B4 . D5 . G5 . F5 .', 'E5 - - - - - . . G#4 . B4 . D5 . B4 .',
        'F5 . E5 . D5 . A4 . F5 . E5 . D5 . A4 .', 'E5 . D5 . C5 . A4 . E5 . D5 . C5 . E5 .',
        'F5 . E5 . C5 . A4 . C5 . F5 . A5 . G5 .', 'G#5 - - - E5 - - - B4 . D5 . E5 . G#4 .',
      ],
      bassline: [
        'A2 . A2 . A3 . A2 . A2 . A2 . A3 . A2 .', 'F2 . F2 . F3 . F2 . F2 . F2 . F3 . F2 .',
        'G2 . G2 . G3 . G2 . G2 . G2 . G3 . G2 .', 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . G#2 .',
        'D2 . D2 . D3 . D2 . D2 . D2 . D3 . D2 .', 'A2 . A2 . A3 . A2 . A2 . A2 . A3 . A2 .',
        'F2 . F2 . F3 . F2 . F2 . F2 . F3 . F2 .', 'E2 . E2 . E3 . E2 . E2 . E2 . E3 . G#2 .',
      ],
      drums: ['kt . h . st . h . kt . h . st . h h'],
    },
    // D minor, a swung card-table walk
    cards: {
      bpm: 112, swing: 0.55, kit: 0.7, arp: 2, hats: false, leadTone: ['square', 0.05, 1500], bassTone: ['triangle', 0.18],
      chords: ['D4 F4 A4 C5', 'G4 B4 D5 F5', 'C4 E4 G4 B4', 'A4 C#5 E5 G5', 'G4 Bb4 D5 F5', 'C4 E4 G4 Bb4', 'F4 A4 C5 E5', 'A4 C#5 E5 G5'],
      melody: [
        'F4 - A4 - C5 - . . D5 - C5 - A4 - . .', 'B4 - . . D5 - F5 - E5 - D5 - B4 - G4 -',
        'E5 - - - - - G4 - B4 - C5 - - - . .', 'C#5 - . . E5 - G5 - F5 - E5 - C#5 - A4 -',
        'D5 - . . Bb4 - D5 - F5 - - - D5 - . .', 'E5 - . . G5 - E5 - C5 - Bb4 - G4 - . .',
        'A4 - C5 - E5 - F5 - - - E5 - C5 - A4 -', 'G4 - . . A4 - C#5 - E5 - G5 - - - . .',
      ],
      bassline: [
        'D3 - - . C3 - - . A2 - - . F2 - - .', 'G2 - - . B2 - - . D3 - - . B2 - - .',
        'C3 - - . B2 - - . A2 - - . G2 - - .', 'A2 - - . C#3 - - . E3 - - . A2 - - .',
        'G2 - - . Bb2 - - . D3 - - . Bb2 - - .', 'C3 - - . E3 - - . G3 - - . E3 - - .',
        'F3 - - . E3 - - . C3 - - . Bb2 - - .', 'A2 - - . C#3 - - . E3 - - . C#3 - - .',
      ],
      drums: ['kh . . . sh . h . kh . . . sh . h .'],
    },
    // C major, bright and driving
    pinball: {
      bpm: 150, arp: 1, hats: true, leadTone: ['square', 0.055, 3400], bassTone: ['square', 0.07, 700],
      chords: ['C5 E5 G5', 'Bb4 D5 F5', 'F4 A4 C5', 'G4 B4 D5', 'A4 C5 E5', 'F4 A4 C5', 'D4 F4 A4', 'G4 B4 D5'],
      melody: [
        'G4 . C5 . E5 . G5 - - . E5 . G5 . . .', 'F5 - - . D5 . Bb4 . D5 . F5 - - . D5 .',
        'C5 - - . A4 . C5 . F5 . A5 - - . G5 .', 'G5 - - - D5 - - - B4 . D5 . G5 . F5 .',
        'E5 . . E5 . . A5 . G5 . E5 . C5 . E5 .', 'F5 . . F5 . . A5 . G5 . F5 . C5 . A4 .',
        'D5 . . D5 . . F5 . A5 . F5 . D5 . F5 .', 'G5 - - - B5 - - - D5 . G5 . F5 . D5 .',
      ],
      bassline: [
        'C2 . C3 . C2 . C3 . C2 . C3 . C2 . C3 .', 'Bb1 . Bb2 . Bb1 . Bb2 . Bb1 . Bb2 . Bb1 . Bb2 .',
        'F2 . F3 . F2 . F3 . F2 . F3 . F2 . F3 .', 'G2 . G3 . G2 . G3 . G2 . G3 . G2 . B2 .',
        'A2 . A3 . A2 . A3 . A2 . A3 . A2 . A3 .', 'F2 . F3 . F2 . F3 . F2 . F3 . F2 . F3 .',
        'D2 . D3 . D2 . D3 . D2 . D3 . D2 . D3 .', 'G2 . G3 . G2 . G3 . G2 . G3 . G2 . B2 .',
      ],
      drums: ['kh . h . sh . h . kh . kh . sh . o .'],
    },
    // E minor, the system alarm: the final boss on the desktop
    desktop: {
      bpm: 140, arp: 1, hats: true, leadTone: ['square', 0.055, 2600], bassTone: ['square', 0.07, 800],
      chords: ['E4 G4 B4', 'C4 E4 G4', 'D4 F#4 A4', 'B3 D#4 F#4', 'E4 G4 B4', 'C4 E4 G4', 'A3 C4 E4', 'B3 D#4 F#4'],
      melody: [
        'B4 . E5 . B4 . E5 . G5 - - . F#5 . E5 .', 'C5 . E5 . C5 . E5 . G5 - - . E5 . C5 .',
        'D5 . F#5 . D5 . F#5 . A5 - - . F#5 . D5 .', 'D#5 - - - F#5 - - - B5 - - - A5 . F#5 .',
        'E5 . . . G5 . . . B5 . A5 . G5 . F#5 .', 'E5 . . . G5 . . . C5 . E5 . G5 . E5 .',
        'A4 . C5 . E5 . A5 - - . G5 . E5 . C5 .', 'B4 - - - D#5 - - - F#5 - - - B5 - - -',
      ],
      bassline: [
        'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 .', 'C2 . C2 . C3 . C2 . C2 . C2 . C3 . C2 .',
        'D2 . D2 . D3 . D2 . D2 . D2 . D3 . D2 .', 'B1 . B1 . B2 . B1 . B1 . B1 . B2 . D#2 .',
        'E2 . E2 . E3 . E2 . E2 . E2 . E3 . E2 .', 'C2 . C2 . C3 . C2 . C2 . C2 . C3 . C2 .',
        'A1 . A1 . A2 . A1 . A1 . A1 . A2 . A1 .', 'B1 . B1 . B2 . B1 . B1 . B1 . B2 . D#2 .',
      ],
      drums: ['kh . h . sh . h . kh . kh . sh . h h'],
    },
    // the same key crashed: a chugging bass and a line that slides down chromatically
    bsod: {
      bpm: 150, arp: 1, hats: true, leadTone: ['square', 0.05, 2200], bassTone: ['square', 0.08, 600],
      chords: ['E4 G4 B4', 'E4 G4 B4', 'C4 E4 G4', 'B3 D#4 F#4', 'E4 G4 B4', 'E4 G4 B4', 'C4 E4 G4', 'B3 D#4 F#4'],
      melody: [
        'E5 - - - D#5 - - - D5 - - - C#5 - - -', 'C5 - - - B4 - - - G4 . B4 . E5 . G5 .',
        'G5 . . G5 . . E5 . C5 . E5 . G5 . C6 .', 'B5 - - - A5 - - - F#5 - - - D#5 - - -',
        'B4 . E5 . G5 . B5 . A5 . G5 . F#5 . E5 .', 'E5 - - - - - . . B4 . E5 . F#5 . G5 .',
        'E5 . G5 . C6 - - . B5 . G5 . E5 . C5 .', 'D#5 . F#5 . B5 - - - A5 - - - F#5 - D#5 -',
      ],
      bassline: [
        'E2 E2 . E2 E2 . E2 . E2 E2 . E2 G2 . F#2 .', 'E2 E2 . E2 E2 . E2 . E2 E2 . E2 D2 . D#2 .',
        'C2 C2 . C2 C2 . C2 . C2 C2 . C2 E2 . D2 .', 'B1 B1 . B1 B1 . B1 . B1 B1 . B1 D#2 . F#2 .',
        'E2 E2 . E2 E2 . E2 . E2 E2 . E2 G2 . F#2 .', 'E2 E2 . E2 E2 . E2 . E2 E2 . E2 D2 . D#2 .',
        'C2 C2 . C2 C2 . C2 . C2 C2 . C2 E2 . D2 .', 'B1 B1 . B1 B1 . B1 . B1 B1 . B1 D#2 . F#2 .',
      ],
      drums: ['k . h k s . h . k k h . s . o .'],
    },
    // practice: a calm C major walk, Setup-screen easy
    practice: {
      bpm: 96, kit: 0.6, arp: 2, hats: false, leadTone: ['triangle', 0.09], bassTone: ['triangle', 0.15],
      chords: ['C4 E4 G4', 'A3 C4 E4', 'F3 A3 C4', 'G3 B3 D4', 'C4 E4 G4', 'A3 C4 E4', 'D4 F4 A4', 'G3 B3 D4'],
      melody: [
        'E5 - - . G5 - - . C6 - - - B5 - A5 -', 'A5 - - . E5 - - . C5 - - - E5 - - -',
        'F5 - - . A5 - - . C6 - - - A5 - - -', 'G5 - - - F5 - E5 - D5 - - - . . . .',
        'C5 - E5 - G5 - C6 - - - G5 - E5 - - -', 'A4 - C5 - E5 - A5 - - - E5 - C5 - - -',
        'D5 - F5 - A5 - D6 - - - A5 - F5 - - -', 'B4 - D5 - G5 - - - F5 - - - D5 - - -',
      ],
      bassline: [
        'C3 - - - - - - . G2 - - - - - - .', 'A2 - - - - - - . E2 - - - - - - .',
        'F2 - - - - - - . C3 - - - - - - .', 'G2 - - - - - - . D3 - - - - - - .',
        'C3 - - - - - - . G2 - - - - - - .', 'A2 - - - - - - . E2 - - - - - - .',
        'D3 - - - - - - . A2 - - - - - - .', 'G2 - - - - - - . B2 - - - D3 - - .',
      ],
      drums: ['kh . . . h . . . sh . . . h . . .'],
    },
    // the last boss is gone: two bars, once
    fanfare: {
      bpm: 140, once: true, leadTone: ['square', 0.07, 3400], bassTone: ['triangle', 0.18],
      chords: ['C4 E4 G4', 'C4 E4 G4'],
      melody: ['G4 . C5 . E5 . G5 - - - E5 . G5 - - -', 'C6 - - - - - - - - - - - . . . .'],
      bassline: ['C3 . . . C3 . . . G2 . . . G2 . . .', 'C2 - - - - - - - - - - - . . . .'],
      drums: ['kh . h . sh . h . kh . h . sh . s s', 'ko . . . . . . . . . . . . . . .'],
    },
  };
  const SEMI = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  function hz(n) {
    const m = /^([A-G])([#b]?)(\d)$/.exec(n);
    if (!m) throw new Error(`Boss Rush XP: bad note "${n}"`);
    return 440 * 2 ** ((SEMI[m[1]] + (m[2] === '#' ? 1 : m[2] ? -1 : 0) + (+m[3] + 1) * 12 - 69) / 12);
  }
  const tokens = (bar) => {
    const t = bar.trim().split(/\s+/);
    if (t.length !== 16) throw new Error(`Boss Rush XP: a bar needs 16 steps, got ${t.length}: ${bar}`);
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
  for (const [name, s] of Object.entries(SONGS)) {
    const lead = track(s.melody), bass = track(s.bassline);
    const drums = s.drums.flatMap(tokens).map((d) => { if (d !== '.' && /[^kshot]/.test(d)) throw new Error(`Boss Rush XP: bad drum "${d}"`); return d === '.' ? '' : d; });
    if (bass.length !== lead.length || s.chords.length * 16 !== lead.length) throw new Error(`Boss Rush XP: ${name} voices differ in length`);
    TUNES[name] = { ...s, lead, bass, drums, steps: lead.length, chords: s.chords.map((c) => c.split(' ').map(hz)) };
  }

  /* ------------------------------------------------------------ sound: small synthesized effects, no files */
  function Sound() {
    let ctx = null, master = null, noise = null, muted = store.get(MUTE_KEY) === '1';
    // music state: the tune playing, its own fade bus, and a step clock scheduled a little ahead
    let tune = null, bus = null, duckBus = null, muff = null, timer = 0, stepI = 0, nextT = 0, level = 1, want = null, held = false;
    const MUSIC = 0.5; // the music sits under the effects
    function ensure() {
      if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = muted ? 0 : 0.26; master.connect(ctx.destination);
      duckBus = ctx.createGain(); muff = ctx.createBiquadFilter(); muff.type = 'lowpass'; muff.frequency.value = 20000;
      duckBus.connect(muff); muff.connect(master);
      noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
      const d = noise.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
      // a tune asked for before the first key press starts now
      if (want) cue(want);
    }
    // move a gain smoothly from wherever it is now
    function glide(p, v, tc, at = ctx.currentTime) {
      if (p.cancelAndHoldAtTime) p.cancelAndHoldAtTime(at); else { p.cancelScheduledValues(at); p.setValueAtTime(p.value, at); }
      p.setTargetAtTime(v, at, tc);
    }
    function voice(type, f, t, dur, vol, cut) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t);
      g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol, t + 0.006);
      g.gain.setTargetAtTime(vol * 0.55, t + 0.02, dur * 0.35); g.gain.setTargetAtTime(0.0001, t + dur, 0.025);
      if (cut) { const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = cut; o.connect(lp); lp.connect(g); } else o.connect(g);
      g.connect(bus); o.start(t); o.stop(t + dur + 0.2);
    }
    function drum(kind, t, k) {
      if (kind === 'k' || kind === 't') {
        const o = ctx.createOscillator(), g = ctx.createGain(), kick = kind === 'k', end = kick ? 0.16 : 0.025;
        o.type = kick ? 'sine' : 'square'; o.frequency.setValueAtTime(kick ? 140 : 1250, t);
        if (kick) o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
        g.gain.setValueAtTime((kick ? 0.45 : 0.035) * k, t); g.gain.exponentialRampToValueAtTime(0.001, t + end);
        o.connect(g); g.connect(bus); o.start(t); o.stop(t + end + 0.02);
        return;
      }
      // the snare and the hats are filtered noise; the snare also gets a short body
      const [type, f, dur, vol] = { s: ['bandpass', 1800, 0.12, 0.2], h: ['highpass', 7000, 0.035, 0.08], o: ['highpass', 6000, 0.16, 0.07] }[kind];
      const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noise; fl.type = type; fl.frequency.value = f;
      g.gain.setValueAtTime(vol * k, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      s.connect(fl); fl.connect(g); g.connect(bus); s.start(t, Math.random() * 0.8); s.stop(t + dur + 0.02);
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
      if (u.arp && s % u.arp === 0) { const ch = u.chords[Math.floor(i / 16)]; voice('square', ch[(s / u.arp) % ch.length], t, sd * u.arp * 0.5, 0.028, 1800); }
    }
    // schedule every step that starts in the next fifth of a second
    function pump() {
      if (!ctx || !tune || held) return;
      const sd = 60 / tune.bpm / 4 / (level > 1 ? 1.1 : 1);
      // the page was throttled and the clock ran past: pick up from now instead of playing a burst
      if (nextT < ctx.currentTime - 0.1) nextT = ctx.currentTime + 0.05;
      while (nextT < ctx.currentTime + 0.2) {
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
      bus = ctx.createGain(); bus.gain.value = MUSIC; bus.connect(duckBus);
      nextT = ctx.currentTime + 0.06;
      if (!timer) timer = setInterval(pump, 50);
      pump();
    }
    // a move's sounds are all pitched by this much, set afresh each time, so the same strike twice never sounds identical
    let pv = 1;
    function tone(type, f0, f1, dur, vol, delay = 0) {
      if (!ctx || muted) return;
      const t = ctx.currentTime + delay, o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(f0 * pv, t);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(1, f1 * pv), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + dur + 0.02);
    }
    function hiss(dur, vol, type, f0, f1, delay = 0) {
      if (!ctx || muted) return;
      const t = ctx.currentTime + delay, s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noise;
      f.type = type; f.frequency.setValueAtTime(f0 * pv, t); f.frequency.exponentialRampToValueAtTime(Math.max(20, f1 * pv), t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
      s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * (0.95 - dur)); s.stop(t + dur + 0.02);
    }
    // air cut by a limb or a weapon: noise that swells to its loudest `at` seconds from now (when the strike lands),
    // its pitch following the path fs; a narrow q whistles like a cable
    function whoosh(dur, vol, fs, q, at = 0, peak = 0.5) {
      if (!ctx || muted) return;
      const t = ctx.currentTime + Math.max(0, at - dur * peak), s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      s.buffer = noise; f.type = 'bandpass'; f.Q.value = q;
      f.frequency.setValueAtTime(fs[0] * pv, t);
      for (let i = 1; i < fs.length; i++) f.frequency.exponentialRampToValueAtTime(fs[i] * pv, t + (dur * i) / (fs.length - 1));
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + dur * peak); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * (0.95 - dur)); s.stop(t + dur + 0.02);
    }
    // keycaps rattling loose from a keyboard swing
    function keyTicks(n, d0) {
      for (let i = 0; i < n; i++) { const f = rand(1800, 2800); tone('square', f, f, 0.014, 0.07, d0 + i * 0.04 + rand(0, 0.015)); }
    }
    const FX = {
      swing: () => hiss(0.08, 0.22, 'bandpass', 2600, 900),
      hit: () => { hiss(0.08, 0.55, 'lowpass', 3200, 400); tone('square', 190, 70, 0.1, 0.3); },
      heavy: () => { hiss(0.14, 0.75, 'lowpass', 2200, 200); tone('sine', 150, 45, 0.2, 0.7); },
      clack: () => { hiss(0.07, 0.55, 'highpass', 2400, 1200); tone('square', 150, 80, 0.08, 0.25); },
      // End Task falling on the boss; a paint bucket heaved underarm, sloshing
      drop: () => { tone('triangle', 2400, 700, 0.18, 0.08); whoosh(0.16, 0.36, [3400, 900], 1.2, 0.04); },
      lob: () => { whoosh(0.2, 0.3, [900, 450], 1, 0.08); hiss(0.16, 0.14, 'lowpass', 700, 250, 0.02); },
      jump: () => tone('square', 330, 660, 0.08, 0.1),
      land: () => hiss(0.06, 0.25, 'lowpass', 700, 200),
      skid: () => hiss(0.16, 0.22, 'bandpass', 1300, 500),
      dash: () => hiss(0.16, 0.3, 'highpass', 700, 3200),
      hurt: () => { tone('square', 520, 110, 0.28, 0.28); hiss(0.12, 0.4, 'lowpass', 1500, 300); },
      boom: () => { hiss(0.5, 0.85, 'lowpass', 1600, 60); tone('sine', 95, 30, 0.45, 0.7); },
      tick: () => tone('square', 1250, 1250, 0.03, 0.12),
      card: () => tone('triangle', 2300, 1300, 0.05, 0.2),
      flip: () => { tone('square', 210, 90, 0.07, 0.25); hiss(0.05, 0.3, 'bandpass', 1500, 800); },
      bumper: () => { tone('sine', 880, 875, 0.22, 0.3); tone('sine', 1320, 1310, 0.16, 0.18); },
      ball: () => tone('sine', 640, 380, 0.08, 0.25),
      zap: () => { tone('sawtooth', 900, 180, 0.3, 0.16); hiss(0.25, 0.3, 'highpass', 3000, 1200); },
      tilt: () => { tone('sawtooth', 120, 100, 0.5, 0.22); tone('square', 60, 58, 0.5, 0.18); },
      jackpot: () => [784, 988, 1175, 1568].forEach((f, i) => tone('square', f, f, 0.1, 0.16, i * 0.07)),
      pickup: () => { tone('square', 520, 1040, 0.09, 0.14); tone('triangle', 1560, 1560, 0.08, 0.12, 0.08); },
      vanish: () => { hiss(0.14, 0.2, 'highpass', 1800, 4000); tone('sine', 420, 180, 0.16, 0.12); },
      broke: () => { hiss(0.12, 0.3, 'bandpass', 1200, 300); tone('square', 300, 110, 0.18, 0.14); },
      cd: () => tone('triangle', 900, 1400, 0.14, 0.14),
      catch: () => tone('sine', 1200, 1500, 0.05, 0.14),
      splat: () => { hiss(0.2, 0.5, 'lowpass', 1000, 150); tone('sine', 170, 60, 0.16, 0.3); },
      sip: () => { tone('sine', 320, 620, 0.1, 0.14); tone('sine', 360, 700, 0.1, 0.12, 0.13); },
      perfect: () => { tone('sine', 1568, 2093, 0.16, 0.13); tone('triangle', 784, 1568, 0.2, 0.09, 0.02); hiss(0.3, 0.2, 'bandpass', 5000, 900); tone('sine', 880, 220, 0.4, 0.1, 0.06); },
      unslow: () => tone('sine', 260, 820, 0.16, 0.07),
      // a held attack winding up; shadow mode coming on (a low sweep under the three key clicks); and running out
      charge: () => { tone('sine', 220, 660, 0.5, 0.08); hiss(0.4, 0.08, 'bandpass', 600, 2400); },
      shadow: () => { tone('sawtooth', 110, 440, 0.35, 0.1); tone('sine', 1320, 1760, 0.3, 0.07, 0.12); hiss(0.4, 0.14, 'lowpass', 400, 2600); },
      unshadow: () => tone('sine', 700, 240, 0.3, 0.08),
      glitch: () => { for (let i = 0; i < 6; i++) { hiss(0.06, 0.35, 'bandpass', rand(500, 3200), rand(200, 1800), i * 0.09); tone('square', rand(90, 420), rand(60, 300), 0.05, 0.12, i * 0.09); } tone('sawtooth', 220, 40, 0.8, 0.12, 0.55); },
      ding: () => { tone('sine', 1047, 1047, 0.45, 0.13); tone('sine', 2093, 2093, 0.3, 0.05); tone('triangle', 784, 784, 0.35, 0.06, 0.01); },
      unlock: () => { tone('sine', 1319, 1319, 0.1, 0.12); tone('sine', 1760, 1760, 0.26, 0.12, 0.09); },
      heal: () => { [660, 880, 1109, 1319].forEach((f, i) => tone('sine', f, f, 0.22, 0.13, i * 0.06)); hiss(0.3, 0.07, 'highpass', 5000, 8000, 0.12); },
      ready: () => [880, 1175, 1568].forEach((f, i) => tone('triangle', f, f, 0.14, 0.14, i * 0.07)),
      deny: () => tone('square', 170, 150, 0.09, 0.14),
      keys: () => [0, 0.1, 0.2].forEach((d) => { tone('square', 1900, 1700, 0.02, 0.14, d); hiss(0.03, 0.2, 'highpass', 3000, 2000, d); }),
      winpop: () => tone('square', 660, 990, 0.08, 0.12),
      click: () => tone('square', 1500, 1400, 0.025, 0.16),
      alarm: () => [880, 660, 880, 660].forEach((f, i) => tone('square', f, f, 0.1, 0.13, i * 0.12)),
      ui: () => tone('square', 660, 990, 0.05, 0.1),
      down: () => [523, 392, 330, 262].forEach((f, i) => tone('square', f, f, 0.14, 0.18, i * 0.11)),
      crash: () => { tone('square', 300, 300, 0.12, 0.22); tone('square', 196, 196, 0.34, 0.22, 0.14); },
    };
    // each move sounds its own way: s as it starts, timed so its whoosh peaks as the strike lands, and h on a hit.
    // Hands cut short and high, legs long and low; a strike going down falls in pitch, one going up rises
    const MOVE_FX = {
      jab: { s: (at) => whoosh(0.06, 0.3, [3600, 1800], 1.5, at), h: () => { hiss(0.03, 0.5, 'bandpass', 2600, 1800); tone('sine', 300, 150, 0.06, 0.38); } },
      cross: { s: (at) => whoosh(0.1, 0.38, [2200, 800], 1.1, at),
        h: () => { hiss(0.05, 0.5, 'bandpass', 2000, 900); tone('square', 210, 80, 0.08, 0.2); tone('sine', 170, 70, 0.08, 0.3); } },
      // the overhand is loud early and falls away; the uppercut stays low, then swells as it rises
      overhand: { s: (at) => whoosh(0.13, 0.38, [3000, 1200, 500], 0.9, at, 0.35), h: () => { hiss(0.06, 0.5, 'bandpass', 1800, 600); tone('triangle', 260, 55, 0.14, 0.4); } },
      upper: { s: (at) => whoosh(0.13, 0.38, [500, 900, 3000], 1.6, at, 0.7),
        h: () => { tone('triangle', 240, 520, 0.08, 0.22); hiss(0.05, 0.5, 'bandpass', 2400, 1200); tone('sine', 130, 50, 0.14, 0.45); } },
      elbow: { s: (at) => whoosh(0.045, 0.4, [2600, 1900], 2.5, at),
        h: () => { hiss(0.025, 0.55, 'highpass', 3200, 2400); tone('square', 900, 300, 0.035, 0.12); tone('sine', 240, 110, 0.06, 0.25); } },
      knee: { s: (at) => whoosh(0.07, 0.45, [500, 950], 1.6, at),
        h: () => { tone('sine', 110, 48, 0.16, 0.55); hiss(0.08, 0.5, 'lowpass', 900, 150); tone('square', 150, 70, 0.06, 0.12); } },
      lowKick: { s: (at) => whoosh(0.1, 0.45, [1500, 500], 1.2, at, 0.6), h: () => { hiss(0.04, 0.6, 'highpass', 2200, 1600); tone('sine', 260, 150, 0.05, 0.3); } },
      rush: { s: (at) => whoosh(0.18, 0.3, [900, 3200], 0.9, at),
        h: () => { hiss(0.08, 0.6, 'lowpass', 3000, 300); tone('square', 180, 60, 0.12, 0.25); tone('sine', 140, 50, 0.14, 0.4); } },
      kick: { s: (at) => whoosh(0.12, 0.4, [1600, 700], 1.1, at, 0.6), h: () => { hiss(0.08, 0.6, 'lowpass', 1800, 250); tone('sine', 140, 52, 0.14, 0.5); } },
      round: { s: (at) => whoosh(0.16, 0.3, [700, 2000, 800], 1.1, at, 0.6),
        h: () => { hiss(0.06, 0.6, 'bandpass', 1700, 900); hiss(0.02, 0.3, 'highpass', 3000, 2500); tone('sine', 160, 60, 0.12, 0.45); } },
      // the leg rising, then the chop
      axe: { s: (at) => { whoosh(0.12, 0.2, [500, 1500], 1.2, 0.06); whoosh(0.08, 0.45, [2400, 500], 1.2, at, 0.6); },
        h: () => { tone('sine', 120, 38, 0.24, 0.65); hiss(0.12, 0.65, 'lowpass', 2000, 150); hiss(0.03, 0.35, 'highpass', 2600, 1600); } },
      sweep: { s: (at) => { whoosh(0.22, 0.42, [300, 1000, 350], 1.2, at, 0.45); hiss(0.14, 0.12, 'lowpass', 1200, 300, 0.05); },
        h: () => { tone('sine', 200, 90, 0.08, 0.35); hiss(0.06, 0.45, 'bandpass', 1200, 700); } },
      spinFist: { s: (at) => whoosh(0.15, 0.26, [800, 2600, 1000], 1.3, at, 0.6), h: () => { hiss(0.05, 0.55, 'highpass', 2400, 1400); tone('sine', 230, 90, 0.09, 0.35); } },
      spinKick: { s: (at) => whoosh(0.24, 0.34, [450, 2200, 600], 1, at, 0.62),
        h: () => { hiss(0.08, 0.7, 'bandpass', 1500, 700); hiss(0.03, 0.4, 'highpass', 3200, 2200); tone('sine', 130, 40, 0.24, 0.65); } },
      rise: { s: (at) => { whoosh(0.26, 0.3, [500, 1200, 3200], 1, at, 0.4); tone('square', 300, 900, 0.14, 0.05, at); },
        h: () => { tone('square', 330, 880, 0.1, 0.12); hiss(0.05, 0.5, 'bandpass', 2600, 1400); tone('sine', 150, 45, 0.16, 0.45); } },
      // fists up, then a falling whistle; the landing is the quake's
      slam: { s: (at) => { whoosh(0.08, 0.14, [800, 1600], 1.4, 0.04); tone('sine', 1300, 500, 0.24, 0.06, at); whoosh(0.24, 0.26, [2600, 900], 1.3, at + 0.12); },
        h: () => { tone('sine', 150, 50, 0.12, 0.45); tone('sine', 130, 45, 0.14, 0.45, 0.03); tone('square', 100, 50, 0.1, 0.15); hiss(0.1, 0.55, 'lowpass', 2400, 200); } },
      quake: { s: () => { tone('sine', 110, 32, 0.34, 0.65); tone('triangle', 55, 40, 0.3, 0.3, 0.03); hiss(0.3, 0.7, 'lowpass', 1400, 80); hiss(0.04, 0.35, 'highpass', 1800, 900); },
        h: () => { hiss(0.08, 0.5, 'lowpass', 1200, 150); tone('sine', 90, 40, 0.2, 0.5); hiss(0.2, 0.35, 'bandpass', 300, 120); } },
      heavyP: { s: (at) => { whoosh(0.2, 0.4, [2000, 700, 300], 0.9, at, 0.35); tone('sine', 90, 55, 0.18, 0.25); },
        h: () => { tone('sine', 110, 30, 0.34, 0.8); tone('square', 90, 35, 0.24, 0.2); hiss(0.14, 0.7, 'lowpass', 3000, 150); hiss(0.05, 0.45, 'highpass', 2000, 1200); } },
      flyK: { s: (at) => { whoosh(0.3, 0.34, [700, 2600, 1300], 0.9, at, 0.3); tone('sine', 80, 60, 0.2, 0.2); },
        h: () => { hiss(0.1, 0.8, 'bandpass', 1500, 650); tone('sine', 150, 40, 0.26, 0.7); hiss(0.4, 0.5, 'lowpass', 900, 60); hiss(0.03, 0.3, 'highpass', 3200, 2400); } },
      slide: { s: () => { hiss(0.34, 0.2, 'bandpass', 1400, 400); whoosh(0.14, 0.2, [900, 1800], 1.2); },
        h: () => { hiss(0.09, 0.6, 'bandpass', 900, 500); tone('triangle', 230, 110, 0.07, 0.45); hiss(0.12, 0.2, 'lowpass', 700, 250, 0.02); } },
      // in the air the whoosh is breathier (a wide band): the first punch snaps up, the second drops, landing as a slap
      apunch: { s: (at) => whoosh(0.08, 0.3, [1800, 3600], 0.8, at), h: () => { hiss(0.03, 0.55, 'bandpass', 3200, 2200); tone('triangle', 360, 200, 0.05, 0.42); } },
      apunch2: { s: (at) => whoosh(0.09, 0.3, [3200, 1300], 0.8, at), h: () => { hiss(0.03, 0.45, 'highpass', 2800, 2000); tone('sine', 240, 120, 0.06, 0.34); } },
      akick: { s: (at) => whoosh(0.12, 0.4, [1500, 600], 1.1, at, 0.55), h: () => { hiss(0.06, 0.55, 'bandpass', 1800, 900); tone('sine', 180, 75, 0.1, 0.4); } },
      // the scissor: one leg, then the other
      akick2: { s: (at) => { whoosh(0.05, 0.26, [1800, 900], 1.3, 0.02); whoosh(0.07, 0.34, [2400, 1000], 1.3, at + 0.03); },
        h: () => { hiss(0.05, 0.7, 'bandpass', 1400, 800); tone('triangle', 200, 90, 0.08, 0.45); } },
      // the dive kick whistles down and boings off
      dive: { s: () => { tone('triangle', 1500, 600, 0.2, 0.05); whoosh(0.2, 0.26, [3000, 800], 1.4, 0.06, 0.3); },
        h: () => { tone('sine', 170, 60, 0.12, 0.45); hiss(0.05, 0.55, 'bandpass', 1900, 1000); tone('square', 300, 600, 0.08, 0.08, 0.04); } },
      // the keyboard swings heavy and sheds keys; the mouse cable whistles and the mouse clicks (twice on ms1's double hit)
      kb1: { s: (at) => { whoosh(0.22, 0.36, [1100, 500, 250], 0.8, at, 0.6); keyTicks(2, 0.03); },
        h: () => { hiss(0.07, 0.55, 'highpass', 2400, 1200); tone('square', 150, 80, 0.08, 0.25); keyTicks(3, 0.04); } },
      kb2: { s: (at) => whoosh(0.18, 0.34, [400, 1300, 500], 0.8, at, 0.55), h: () => { hiss(0.06, 0.5, 'highpass', 2000, 1000); tone('square', 120, 60, 0.1, 0.28); keyTicks(2, 0.04); } },
      kbAir: { s: (at) => whoosh(0.2, 0.36, [1600, 400], 0.8, at, 0.6),
        h: () => { hiss(0.08, 0.6, 'highpass', 2200, 900); tone('sine', 120, 45, 0.16, 0.5); tone('square', 150, 70, 0.08, 0.2); keyTicks(3, 0.04); } },
      ms1: { s: (at) => whoosh(0.1, 0.3, [1500, 4200], 2.5, at, 0.7), h: () => { tone('square', 2100, 1900, 0.018, 0.2); hiss(0.015, 0.25, 'highpass', 4000, 3000); tone('sine', 300, 180, 0.03, 0.35); } },
      ms2: { s: (at) => whoosh(0.16, 0.3, [900, 3000, 1400], 2.2, at, 0.55),
        h: () => { [0, 0.055, 0.11].forEach((d) => tone('square', 2000, 1800, 0.018, 0.14, d)); tone('sine', 220, 90, 0.1, 0.3); } },
      // swung from the air the cable lashes down, and the mouse right-clicks
      msAir: { s: (at) => whoosh(0.1, 0.3, [4400, 1600], 2.5, at, 0.4),
        h: () => { tone('square', 1500, 1350, 0.022, 0.2); hiss(0.015, 0.25, 'highpass', 3500, 2500); tone('sine', 260, 150, 0.04, 0.35); } },
      cd: { h: () => { tone('sine', 2400, 2300, 0.08, 0.14); tone('sine', 3600, 3500, 0.05, 0.07); hiss(0.03, 0.4, 'bandpass', 2600, 1600); tone('sine', 260, 140, 0.05, 0.36); } },
      // thrown on his back; the kip-up's legs whip and plant; the back flip out of it
      down: { s: () => { tone('sine', 120, 50, 0.16, 0.4); hiss(0.14, 0.5, 'lowpass', 1100, 150); hiss(0.03, 0.2, 'bandpass', 1600, 1000); } },
      getup: { s: () => { whoosh(0.12, 0.35, [700, 1800], 1.3, 0.24, 0.6); hiss(0.05, 0.28, 'lowpass', 800, 200, 0.3); } },
      tech: { s: () => { whoosh(0.24, 0.24, [600, 1800, 700], 1.1, 0.12); tone('square', 330, 660, 0.08, 0.08); } },
      // End Task: the leap, then the landing, where the boss hangs like a frozen program winding down before the bolt
      endtask: { s: () => { whoosh(0.3, 0.3, [500, 2400], 1, 0.15); tone('square', 330, 990, 0.14, 0.08); },
        h: () => { tone('sine', 150, 40, 0.3, 0.7); hiss(0.12, 0.6, 'lowpass', 2600, 150); tone('sawtooth', 220, 110, 0.26, 0.06); } },
    };
    return {
      ensure,
      play(name) { if (FX[name]) FX[name](); },
      // a move's own sound as it starts (at: seconds until its strike lands) and when it lands. thud: a dazed boss or a
      // heavy prop takes even a light strike with weight; shadow: shadow mode rings over every hit
      move(k, at = 0) { const f = MOVE_FX[k]; if (ctx && !muted && f && f.s) { pv = rand(0.93, 1.07); f.s(at); pv = 1; } },
      strike(k, thud, shadow) {
        if (!ctx || muted) return;
        pv = rand(0.95, 1.05);
        const f = MOVE_FX[k];
        if (f && f.h) f.h(); else FX.hit();
        if (thud) tone('sine', 120, 45, 0.14, 0.35);
        if (shadow) { tone('sine', 1760, 1320, 0.16, 0.06); tone('triangle', 2640, 1980, 0.1, 0.03, 0.012); }
        pv = 1;
      },
      get muted() { return muted; },
      setMuted(m) { muted = m; store.set(MUTE_KEY, m ? '1' : '0'); if (master) master.gain.value = m ? 0 : 0.26; },
      // music: a tune by name from the top (null stops), phase two's faster level, a pause, and a dip under a big moment
      music(name) { want = name || null; if (ctx) cue(want); },
      musicLevel(n) { level = n; },
      musicHold(on) {
        held = on;
        if (!ctx || !bus) return;
        glide(bus.gain, on ? 0.0001 : MUSIC, on ? 0.04 : 0.12);
        if (!on) { nextT = ctx.currentTime + 0.05; pump(); }
      },
      duck(k, d) {
        if (!ctx) return;
        glide(duckBus.gain, k, 0.05);
        duckBus.gain.setTargetAtTime(1, ctx.currentTime + d, 0.25);
      },
      // the music goes muffled for d seconds, as if heard from under water; 0 lifts it now
      muffle(d) {
        if (!ctx) return;
        glide(muff.frequency, d > 0 ? 700 : 20000, d > 0 ? 0.04 : 0.1);
        if (d > 0) muff.frequency.setTargetAtTime(20000, ctx.currentTime + d, 0.12);
      },
      close() { clearInterval(timer); timer = 0; tune = null; want = null; if (ctx) ctx.close(); ctx = null; },
    };
  }

  /* ------------------------------------------------------------ input */
  // arrows move and jump; the left hand rests on A S D F
  const KEYS = {
    ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'jump', Space: 'jump', ArrowDown: 'down',
    KeyA: 'punch', KeyS: 'kick', KeyD: 'dash', ShiftLeft: 'dash', ShiftRight: 'dash', KeyF: 'special',
    KeyP: 'pause', Escape: 'pause', Enter: 'confirm', NumpadEnter: 'confirm', F2: 'new', KeyM: 'mute',
  };
  class Input {
    constructor() { this.now = 0; this.clear(); }
    clear() { this.held = Object.create(null); this.hits = Object.create(null); }
    press(a) { if (!this.held[a]) this.hits[a] = this.now; this.held[a] = true; }
    release(a) { this.held[a] = false; }
    // a press counts if it happened within the buffer window; taking it uses it up
    take(a, win = 0.12) {
      const t = this.hits[a];
      if (t === undefined || this.now - t > win) return false;
      delete this.hits[a];
      return true;
    }
    // any fresh press still waiting to be used
    pending() {
      for (const a in this.hits) if (this.now - this.hits[a] <= 0.12) return true;
      return false;
    }
  }

  /* ------------------------------------------------------------ effects: particles, shake, flash */
  class FX {
    constructor() { this.p = []; this.shakeT = 0; this.shakeD = 1; this.shakeM = 0; this.flashT = 0; this.flashD = 1; this.flashC = '#fff'; }
    shake(m, d = 0.25) {
      if (reduceMotion) return;
      const now = this.shakeT ? this.shakeM * (this.shakeT / this.shakeD) : 0;
      if (m >= now) { this.shakeM = m; this.shakeT = d; this.shakeD = d; }
    }
    flash(c, d = 0.08) { if (reduceMotion) return; this.flashC = c; this.flashT = d; this.flashD = d; }
    add(o) { this.p.push(o); return o; }
    sparks(x, y, dir, n = 8, c = '#fff') {
      for (let i = 0; i < n; i++) {
        const a = dir === 0 ? rand(0, TAU) : (dir > 0 ? 0 : Math.PI) + rand(-0.9, 0.9), s = rand(260, 640);
        this.add({ k: 'line', x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, g: 0, life: rand(0.12, 0.24), t: 0, c, w: rand(2, 3.5) });
      }
    }
    dust(x, y, n = 6) {
      for (let i = 0; i < n; i++) this.add({ k: 'dot', x: x + rand(-10, 10), y: y - 2, vx: rand(-110, 110), vy: rand(-90, -10), g: 80, life: rand(0.25, 0.45), t: 0, r: rand(2, 5), c: 'rgba(255,255,255,.75)' });
    }
    debris(x, y, n, colors, spread = 1) {
      for (let i = 0; i < n; i++) this.add({ k: 'rect', x, y, vx: rand(-320, 320) * spread, vy: rand(-560, -140), g: 1400, life: rand(0.6, 1.1), t: 0, s: rand(4, 10), rot: rand(0, 6), vr: rand(-12, 12), c: colors[i % colors.length] });
    }
    // keycaps knocked loose by a keyboard hit
    keys(x, y, n = 6) {
      const L = 'ASDFQWERZXCV';
      for (let i = 0; i < n; i++) this.add({ k: 'key', x, y, vx: rand(-260, 260), vy: rand(-470, -160), g: 1300, life: rand(0.6, 0.9), t: 0, rot: rand(-0.5, 0.5), vr: rand(-9, 9), s: L[Math.floor(rand(0, L.length))] });
    }
    drops(x, y, n, c) {
      for (let i = 0; i < n; i++) this.add({ k: 'dot', x, y, vx: rand(-300, 300), vy: rand(-420, -60), g: 1300, life: rand(0.4, 0.7), t: 0, r: rand(2.5, 5), c });
    }
    // green crosses float up off him when health comes back
    heal(x, y) {
      for (let i = 0; i < 10; i++) this.add({ k: 'plus', x: x + rand(-26, 26), y: y - rand(8, 84), vx: rand(-14, 14), vy: rand(-120, -50), g: 0, life: rand(0.6, 1), t: 0, s: rand(3.5, 6), c: i % 3 ? '#4cda50' : '#1fb85a' });
    }
    // a jagged impact star that lives for a couple of frames
    star(x, y, c = '#fff', r = 24) { this.add({ k: 'star', x, y, life: 0.1, t: 0, c, r, rot: rand(0, TAU) }); }
    ring(x, y, r0, r1, life, c, w = 4) { this.add({ k: 'ring', x, y, r0, r1, life, t: 0, c, w }); }
    // the hammer's landing: a flat ring that runs out along the floor as far as its hit reaches
    quake(x, y) { this.add({ k: 'flat', x, y, life: 0.3, t: 0 }); }
    // a number that pops off a hit (damage, health), and an announcement that rises as a selected label (see chip)
    text(x, y, s, c = '#fff', size = 18) { this.add({ k: 'text', x, y, vx: 0, vy: -70, g: 0, life: 0.9, t: 0, s, c, size }); }
    chip(x, y, s, dim) { this.add({ k: 'chip', x, y, vx: 0, vy: -40, g: 0, life: 1.15, t: 0, s, dim: !!dim }); }
    tick(dt) { this.shakeT = Math.max(0, this.shakeT - dt); this.flashT = Math.max(0, this.flashT - dt); }
    update(dt) {
      for (const q of this.p) {
        q.t += dt;
        if (q.vx === undefined) continue;
        q.vy += q.g * dt; q.x += q.vx * dt; q.y += q.vy * dt;
        if (q.vr) q.rot += q.vr * dt;
        if (q.k === 'line') { q.vx *= 0.9; q.vy *= 0.9; }
      }
      this.p = this.p.filter((q) => q.t < q.life);
    }
    offset() {
      if (!this.shakeT) return [0, 0];
      const m = this.shakeM * (this.shakeT / this.shakeD);
      return [rand(-m, m), rand(-m, m)];
    }
    draw(ctx) {
      for (const q of this.p) {
        const k = q.t / q.life, a = 1 - k;
        ctx.globalAlpha = a;
        if (q.k === 'line') {
          ctx.strokeStyle = q.c; ctx.lineWidth = q.w; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(q.x, q.y); ctx.lineTo(q.x - q.vx * 0.035, q.y - q.vy * 0.035); ctx.stroke();
        } else if (q.k === 'dot') {
          ctx.fillStyle = q.c; dot(ctx, q.x, q.y, q.r * (1 - k * 0.5));
        } else if (q.k === 'rect') {
          ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.fillStyle = q.c; ctx.fillRect(-q.s / 2, -q.s / 2, q.s, q.s); ctx.restore();
        } else if (q.k === 'key') {
          ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot);
          ctx.fillStyle = '#fbfaf6'; ctx.strokeStyle = '#6d6a60'; ctx.lineWidth = 1; rr(ctx, -6, -6, 12, 12, 2); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#222'; ctx.font = `bold 8px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(q.s, 0, 0.5);
          ctx.restore();
        } else if (q.k === 'star') {
          ctx.globalAlpha = 1; ctx.fillStyle = q.c; ctx.beginPath();
          for (let j = 0; j < 12; j++) { const r = (j % 2 ? 0.36 : 1) * q.r * (1 + k * 0.5), b = q.rot + (j * Math.PI) / 6; ctx.lineTo(q.x + Math.cos(b) * r, q.y + Math.sin(b) * r); }
          ctx.closePath(); ctx.fill();
        } else if (q.k === 'ring') {
          ctx.strokeStyle = q.c; ctx.lineWidth = q.w * a + 1;
          ctx.beginPath(); ctx.arc(q.x, q.y, lerp(q.r0, q.r1, easeOut(k)), 0, TAU); ctx.stroke();
        } else if (q.k === 'flat') {
          const r = lerp(12, 88, easeOut(k));
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 4 * a + 1;
          ctx.beginPath(); ctx.ellipse(q.x, q.y - 2, r, r * 0.16, 0, 0, TAU); ctx.stroke();
        } else if (q.k === 'plus') {
          const s = q.s * (1 - k * 0.3), w = s * 0.7;
          ctx.fillStyle = '#fff'; ctx.fillRect(q.x - s - 1.5, q.y - w / 2 - 1.5, s * 2 + 3, w + 3); ctx.fillRect(q.x - w / 2 - 1.5, q.y - s - 1.5, w + 3, s * 2 + 3);
          ctx.fillStyle = q.c; ctx.fillRect(q.x - s, q.y - w / 2, s * 2, w); ctx.fillRect(q.x - w / 2, q.y - s, w, s * 2);
        } else if (q.k === 'text') {
          // title-bar lettering: a navy edge and a soft shadow, so it reads on every arena
          ctx.font = `bold ${q.size}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.save(); ctx.shadowColor = 'rgba(0,10,40,.6)'; ctx.shadowBlur = 4; ctx.shadowOffsetY = 2;
          ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.strokeStyle = '#00138c'; ctx.strokeText(q.s, q.x, q.y);
          ctx.restore();
          ctx.fillStyle = q.c; ctx.fillText(q.s, q.x, q.y);
        } else if (q.k === 'chip') {
          // it holds, then fades over its last third
          ctx.globalAlpha = Math.min(1, (1 - k) * 3);
          chip(ctx, q.x, q.y, q.s, 13 * Math.max(1, UI.f * 0.85), q.dim);
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ------------------------------------------------------------ the stickman */
  // Poses are drawn as 11 joints [hip, neck, head, elbow F, hand F, elbow B, hand B, knee F, foot F, knee B, foot B],
  // x forward and y up from the feet, facing right (left is a mirror). At load every pose becomes a rig: the hip
  // plus ten bones as (angle, length). Blending angles keeps each limb its length and swings it through an arc,
  // which is most of what makes the motion read as smooth.
  const POSE = {
    idle: [0, -32, 2, -60, 3, -72, 10, -49, 17, -59, -6, -48, 4, -55, 8, -16, 13, 0, -5, -16, -11, 0],
    land: [0, -25, 3, -52, 4, -64, 12, -42, 18, -51, -6, -40, 3, -47, 10, -12, 15, 0, -8, -12, -12, 0],
    jump: [0, -40, 1, -68, 2, -80, 11, -60, 16, -71, -10, -60, -15, -72, 10, -30, 5, -17, -4, -26, -12, -14],
    fall: [0, -36, 1, -64, 2, -76, 13, -58, 24, -62, -12, -57, -22, -62, 6, -19, 8, -2, -6, -20, -10, -4],
    // strikes follow Shadow Fight's rhythm: a coil that almost stops, the snap, a lean past the target, back to guard
    jabW: [-1, -32, -1, -60, 0, -72, 3, -47, 6, -59, -6, -48, 3, -57, 8, -17, 11, -1, -8, -16, -13, 0],
    jab: [3, -32, 8, -60, 10, -71, 21, -60, 34, -61, 2, -48, 9, -57, 12, -17, 15, 0, -5, -16, -9, 0],
    jabF: [4, -32, 10, -59, 12, -71, 24, -59, 36, -59, 4, -47, 11, -57, 14, -17, 16, 0, -5, -17, -8, 0],
    jabR: [1, -32, 4, -60, 5, -72, 9, -48, 15, -59, -3, -49, 6, -57, 10, -17, 14, -1, -5, -16, -11, 0],
    crossW: [-2, -32, -4, -60, -4, -72, 7, -54, 17, -62, -15, -52, -4, -58, 6, -17, 9, 0, -8, -16, -14, 0],
    cross: [4, -31, 11, -58, 13, -70, 8, -45, 15, -56, 24, -60, 37, -60, 14, -17, 16, 0, -6, -17, -9, 0],
    crossF: [5, -31, 13, -57, 16, -69, 10, -44, 16, -55, 27, -58, 39, -58, 16, -17, 18, 0, -6, -17, -8, 0],
    crossR: [1, -32, 4, -60, 5, -72, 10, -48, 17, -59, -3, -49, 6, -58, 10, -17, 14, -1, -5, -16, -11, 0],
    upperW: [-2, -24, 9, -50, 16, -60, 8, -37, 16, -27, 5, -37, 12, -48, 14, -17, 11, 0, -11, -9, -25, -1],
    upper: [2, -40, 0, -68, -2, -80, 2, -81, 3, -94, -12, -61, -24, -58, 5, -23, 4, -6, -2, -23, -10, -8],
    upperF: [2, -42, -2, -70, -5, -81, -1, -83, -2, -96, -15, -65, -28, -64, 3, -25, -2, -8, -3, -25, -14, -12],
    rushW: [-2, -27, 2, -54, 5, -66, -8, -46, -1, -35, 10, -46, 17, -56, 9, -13, 16, 0, -11, -12, -17, 0],
    rush: [6, -38, 26, -54, 37, -60, 40, -58, 54, -60, 18, -44, 8, -38, 12, -22, 4, -8, -8, -30, -24, -26],
    kickW: [-2, -34, -7, -62, -8, -74, 0, -50, 6, -62, -17, -53, -23, -42, 15, -37, 11, -20, -5, -17, -7, 0],
    kick: [-3, -34, -11, -61, -13, -73, -7, -48, -4, -60, -23, -55, -34, -49, 14, -34, 31, -34, -5, -17, -6, 0],
    kickF: [-4, -34, -14, -61, -17, -72, -11, -47, -9, -60, -27, -56, -38, -52, 13, -36, 30, -39, -6, -17, -6, 0],
    kickR: [-2, -34, -6, -62, -7, -74, 0, -50, 5, -62, -16, -53, -22, -42, 15, -40, 9, -24, -5, -17, -7, 0],
    roundW: [0, -34, -6, -62, -7, -74, -1, -49, 1, -61, -15, -52, -24, -44, 15, -26, 1, -18, -2, -17, -3, 0],
    round: [-2, -34, -13, -60, -16, -72, -11, -47, -11, -59, -26, -56, -39, -56, 11, -46, 24, -57, -4, -17, -4, 0],
    roundF: [-3, -34, -16, -59, -20, -71, -15, -46, -17, -58, -29, -57, -42, -58, 5, -50, 11, -66, -5, -17, -4, 0],
    roundR: [0, -34, -5, -62, -6, -74, 1, -49, 4, -62, -14, -52, -22, -43, 17, -29, 6, -15, -3, -17, -4, 0],
    sweepW: [0, -20, 5, -46, 7, -58, 13, -37, 19, -45, -3, -35, 5, -40, 15, -12, 14, 0, -10, -8, -14, 0],
    sweep: [-4, -16, -10, -40, -12, -52, 2, -30, 8, -20, -18, -24, -22, -10, 12, -8, 32, -3, -12, -6, -16, 0],
    slide: [0, -12, -22, -26, -32, -32, -14, -14, -24, -4, -28, -16, -36, -4, 16, -9, 33, -5, 10, -17, 22, -4],
    apunch: [2, -40, 6, -68, 8, -80, 20, -66, 35, -66, -6, -60, 2, -66, 10, -30, 6, -17, -4, -27, -10, -14],
    akick: [0, -40, -10, -64, -13, -76, 0, -60, 10, -66, -20, -58, -28, -64, 15, -36, 33, -32, -2, -26, -10, -16],
    dive: [0, -46, -9, -72, -12, -84, 2, -66, 12, -72, -16, -66, -24, -74, 12, -30, 24, -14, -4, -32, -10, -18],
    dash: [4, -30, 16, -54, 21, -65, 6, -46, -8, -40, 4, -46, -10, -44, 14, -15, 22, 0, -12, -18, -24, -8],
    airdash: [0, -38, 24, -44, 35, -47, 34, -40, 46, -41, 18, -36, 8, -34, -14, -42, -30, -40, -12, -32, -27, -28],
    skid: [-3, -29, -12, -55, -16, -66, 0, -46, 9, -52, -24, -46, -30, -54, 11, -15, 22, 0, -7, -15, -11, 0],
    hurt: [-2, -33, -10, -59, -14, -70, -4, -50, -10, -40, -16, -54, -26, -52, 6, -17, 9, 0, -8, -16, -12, 0],
    dead: [0, -6, -28, -6, -40, -8, -18, -4, -8, -2, -20, -8, -30, -3, 12, -8, 26, -3, 12, -4, 27, -1],
    win: [0, -34, 0, -62, 1, -74, 9, -74, 15, -88, -9, -74, -15, -88, 7, -17, 10, 0, -7, -17, -10, 0],
    win2: [0, -34, 1, -62, 2, -74, 12, -70, 15, -86, -7, -50, -3, -39, 8, -17, 12, 0, -6, -17, -10, 0],
    wave: [0, -33, 0, -61, 1, -73, 10, -69, 14, -83, -3, -48, -3, -35, 4, -16, 6, 0, -4, -16, -7, 0],
    throwW: [-2, -33, -5, -61, -6, -73, -16, -58, -26, -66, 6, -50, 14, -56, 8, -17, 13, 0, -7, -16, -13, 0],
    throw: [3, -32, 9, -59, 12, -71, 22, -60, 36, -58, -2, -49, -10, -40, 13, -15, 18, 0, -6, -15, -14, 0],
    lob: [2, -33, 7, -60, 10, -72, 18, -70, 28, -80, -4, -49, -10, -40, 12, -16, 17, 0, -6, -16, -13, 0],
    kbW: [-2, -34, -5, -62, -4, -74, -7, -76, -15, -87, -12, -73, -18, -85, 8, -17, 13, 0, -8, -16, -13, 0],
    kb1: [4, -28, 13, -54, 18, -65, 25, -47, 38, -42, 22, -45, 35, -39, 15, -13, 20, 0, -6, -13, -13, 0],
    kb2: [1, -32, 5, -60, 7, -72, 18, -60, 32, -64, 14, -56, 28, -60, 10, -16, 15, 0, -7, -16, -12, 0],
    msW: [-1, -33, -3, -61, -3, -73, -4, -74, -14, -82, -10, -50, -2, -42, 8, -16, 13, 0, -6, -16, -12, 0],
    ms1: [2, -32, 7, -59, 10, -71, 19, -57, 32, -52, -3, -49, -8, -40, 12, -15, 17, 0, -6, -15, -13, 0],
    ms2: [1, -35, 4, -63, 6, -75, 12, -73, 16, -88, -6, -52, -10, -42, 9, -18, 13, -1, -6, -17, -10, 0],
    powerW: [0, -22, 2, -49, 3, -61, 10, -42, 2, -52, -6, -41, 6, -50, 12, -11, 18, 0, -12, -11, -18, 0],
    power: [0, -31, 0, -59, 0, -71, 13, -66, 26, -76, -13, -66, -26, -76, 10, -16, 19, 0, -10, -16, -19, 0],
    // turning attacks: the limb stays tucked while he swings round, then whips out on the new side
    bfW: [0, -34, -2, -62, -3, -74, 10, -56, -2, -55, -7, -49, 1, -59, 5, -17, 7, 0, -4, -17, -7, 0],
    bf: [3, -32, 6, -60, 8, -72, 19, -62, 31, -65, -1, -48, 10, -55, 12, -17, 15, 0, -5, -16, -10, 0],
    skW: [-1, -34, -5, -62, -5, -74, -3, -49, -1, -61, -11, -50, -7, -38, 16, -29, 2, -19, -3, -17, -3, 0],
    sk: [-4, -34, -20, -58, -24, -69, -22, -44, -25, -56, -33, -56, -45, -54, 13, -36, 30, -36, -6, -17, -5, 0],
    skR: [-2, -34, -8, -62, -9, -74, -4, -49, -2, -61, -18, -53, -24, -42, 15, -32, 5, -18, -4, -17, -5, 0],
    riseW: [-2, -23, 12, -48, 20, -57, 11, -34, 17, -23, 10, -34, 16, -45, 14, -17, 11, 0, -12, -9, -27, -1],
    rise: [0, -42, -2, -70, -3, -82, -1, -83, 0, -96, -12, -61, -24, -57, 2, -25, 2, -8, -3, -25, -12, -10],
    slamW: [0, -44, -5, -72, -8, -83, -10, -84, -17, -94, -7, -85, -12, -96, 15, -35, 6, -20, 9, -29, -3, -18],
    slam: [0, -48, 1, -76, 4, -88, 2, -63, 3, -50, 0, -63, 0, -50, 17, -43, 6, -29, 13, -36, -2, -27],
    quake: [0, -20, 21, -39, 31, -45, 23, -26, 23, -13, 19, -26, 17, -13, 17, -17, 14, 0, -13, -9, -30, -6],
    chP: [-4, -30, -6, -58, -5, -70, -18, -51, -7, -45, 4, -49, 15, -56, 8, -17, 10, 0, -14, -16, -22, 0],
    heavyP: [8, -28, 18, -55, 21, -66, 31, -55, 44, -56, 13, -42, 19, -53, 21, -17, 23, 0, -7, -18, -22, -12],
    chK: [-2, -34, -10, -61, -11, -73, -3, -49, -2, -62, -20, -52, -26, -41, 13, -44, 12, -27, -5, -17, -7, 0],
    flyK: [0, -40, -15, -64, -19, -75, -8, -52, -9, -64, -28, -64, -41, -62, 18, -40, 34, -39, 8, -25, -7, -17],
    hurtBig: [-4, -36, -20, -59, -30, -66, -10, -67, -6, -79, -15, -71, -18, -83, 10, -26, 18, -11, 5, -21, 5, -4],
    kip1: [-20, -14, -46, -3, -58, -2, -57, 4, -62, 16, -58, 2, -65, 13, -31, -28, -47, -23, -28, -29, -45, -27],
    kip2: [-2, -29, 8, -55, 13, -66, 20, -50, 33, -50, 19, -48, 31, -45, 13, -20, 10, -3, -9, -13, -20, 0],
    tuck: [0, -40, 14, -64, 23, -73, 26, -57, 24, -45, 24, -55, 20, -43, 13, -51, 7, -35, 15, -48, 6, -34],
    // the stance follows the weapon: a keyboard rests on the shoulder, a mouse hangs from a low hand
    kbIdle: [0, -33, 2, -61, 3, -73, 9, -72, 3, -83, -1, -47, 8, -56, 8, -17, 13, -1, -5, -16, -11, 0],
    msIdle: [0, -33, 2, -61, 3, -73, 6, -48, 18, -43, -4, -49, 4, -57, 8, -17, 13, -1, -5, -16, -11, 0],
    etRise: [0, -44, -1, -72, -2, -84, 0, -85, -1, -98, -2, -85, -4, -98, 1, -27, -1, -10, -2, -27, -10, -12],
    // the longer strings: an overhand from above, an elbow, a knee, a low kick, an axe kick, and air follow-ups
    ohW: [-2, -32, -4, -60, -5, -72, -11, -72, -5, -83, -9, -48, -1, -57, 7, -18, 10, -1, -9, -16, -14, 0],
    oh: [4, -31, 13, -58, 17, -69, 25, -64, 37, -60, 7, -46, 14, -56, 15, -17, 17, -1, -6, -17, -9, 0],
    ohF: [5, -31, 16, -57, 22, -67, 30, -57, 39, -48, 10, -45, 17, -55, 16, -18, 17, -1, -5, -17, -8, 0],
    elW: [-1, -32, -2, -60, -2, -72, -14, -54, -4, -62, -7, -48, 1, -57, 8, -17, 11, -1, -7, -16, -13, 0],
    el: [4, -31, 11, -59, 13, -70, 24, -60, 12, -59, 6, -46, 13, -56, 14, -17, 16, 0, -5, -17, -9, 0],
    knW: [0, -34, 3, -61, 5, -73, 16, -65, 28, -63, 16, -63, 28, -59, 6, -17, 6, 0, -5, -17, -7, 0],
    kn: [2, -34, -3, -62, -3, -74, 9, -55, 7, -43, 7, -52, 2, -41, 18, -40, 13, -24, 0, -17, 0, 0],
    lkW: [-2, -34, -4, -62, -5, -74, 2, -50, 7, -62, -13, -52, -17, -40, 14, -28, 4, -15, -5, -17, -7, 0],
    lk: [-3, -34, -10, -61, -11, -73, -5, -49, -3, -61, -21, -55, -31, -47, 11, -24, 27, -17, -5, -17, -6, 0],
    axW: [-2, -34, -12, -60, -15, -72, 0, -56, 12, -60, -24, -54, -35, -47, 0, -52, 2, -69, -4, -17, -4, 0],
    ax: [0, -34, 3, -62, 5, -74, 10, -50, 19, -58, -7, -53, -10, -41, 15, -25, 16, -8, -3, -17, -5, 0],
    apunch2: [0, -40, 3, -68, 4, -80, 1, -55, 7, -65, 16, -69, 29, -69, 13, -29, 8, -13, 6, -24, -3, -9],
    akick2: [0, -40, -7, -67, -10, -79, 0, -55, 2, -68, -18, -60, -29, -54, 9, -25, -4, -14, 17, -42, 34, -43],
  };
  const BONES = [[0, 1], [1, 2], [1, 3], [3, 4], [1, 5], [5, 6], [0, 7], [7, 8], [0, 9], [9, 10]];
  const wrapA = (d) => d - TAU * Math.round(d / TAU);
  function toRig(p, o = new Array(22)) {
    o[0] = p[0]; o[1] = p[1];
    for (let i = 0; i < 10; i++) {
      const [a, b] = BONES[i], dx = p[b * 2] - p[a * 2], dy = p[b * 2 + 1] - p[a * 2 + 1];
      o[2 + i * 2] = Math.atan2(dy, dx); o[3 + i * 2] = Math.hypot(dx, dy);
    }
    return o;
  }
  function toPts(r, o = new Array(22)) {
    o[0] = r[0]; o[1] = r[1];
    for (let i = 0; i < 10; i++) {
      const [a, b] = BONES[i], ang = r[2 + i * 2], len = r[3 + i * 2];
      o[b * 2] = o[a * 2] + Math.cos(ang) * len; o[b * 2 + 1] = o[a * 2 + 1] + Math.sin(ang) * len;
    }
    return o;
  }
  function mixRig(a, b, k, o) {
    o[0] = lerp(a[0], b[0], k); o[1] = lerp(a[1], b[1], k);
    for (let i = 2; i < 22; i += 2) { o[i] = a[i] + wrapA(b[i] - a[i]) * k; o[i + 1] = lerp(a[i + 1], b[i + 1], k); }
    return o;
  }
  const RIG = {};
  Object.keys(POSE).forEach((k) => { RIG[k] = toRig(POSE[k]); });
  const EASE = { lin: (t) => t, out: easeOut, io: easeInOut, snap: (t) => 1 - (1 - t) ** 3 };
  // a clip is a list of keys [time, pose, easing into that key]; sampling it gives the rig at time t
  function sampleClip(clip, t, o) {
    if (t <= clip[0][0]) return mixRig(RIG[clip[0][1]], RIG[clip[0][1]], 0, o);
    for (let i = 1; i < clip.length; i++) {
      const [t1, p1, e] = clip[i];
      if (t <= t1) { const [t0, p0] = clip[i - 1]; return mixRig(RIG[p0], RIG[p1], EASE[e || 'out']((t - t0) / (t1 - t0 || 1)), o); }
    }
    const last = clip[clip.length - 1][1];
    return mixRig(RIG[last], RIG[last], 0, o);
  }
  // frame data in seconds. box = [forward offset, y from the feet, width, height]; tip is the joint
  // (or 'w', the weapon's end) whose path draws the swoosh; next: the strike each button leads to mid-string
  // turn: he swings round to the side he faces now; charge: `on` still held after the hit winds up that act
  // vary: [rig angle, radians] nudged each time the move starts, so two jabs in a row never match
  const MOVES = {
    jab: { dur: 0.22, hit: [0.045, 0.11], dmg: 1, box: [12, -66, 40, 22], lunge: 70, next: { punch: 'cross', kick: 'knee' }, on: 'punch', charge: 'chP', tip: 4,
      vary: [[6, 0.12], [8, 0.12], [2, 0.04]], clip: [[0, 'jabW'], [0.045, 'jab', 'snap'], [0.1, 'jabF'], [0.15, 'jabR', 'out'], [0.22, 'idle', 'io']] },
    cross: { dur: 0.25, hit: [0.05, 0.12], dmg: 1, box: [12, -66, 44, 22], lunge: 100, next: { punch: 'overhand', kick: 'lowKick' }, on: 'punch', charge: 'chP', tip: 6,
      vary: [[10, 0.12], [12, 0.12], [2, 0.04]], clip: [[0, 'crossW'], [0.05, 'cross', 'snap'], [0.11, 'crossF'], [0.17, 'crossR', 'out'], [0.25, 'idle', 'io']] },
    overhand: { dur: 0.32, hit: [0.08, 0.16], dmg: 1, box: [10, -84, 44, 40], lunge: 110, next: { punch: 'upper', kick: 'round' }, tip: 4,
      vary: [[6, 0.1], [8, 0.1], [2, 0.05]], clip: [[0, 'ohW', 'out'], [0.06, 'ohW'], [0.09, 'oh', 'snap'], [0.15, 'ohF'], [0.22, 'jabR', 'out'], [0.32, 'idle', 'io']] },
    upper: { dur: 0.42, hit: [0.08, 0.2], dmg: 2, box: [2, -112, 38, 64], lunge: 40, hop: -300, heavy: true, tip: 4,
      vary: [[2, 0.05], [10, 0.2]], clip: [[0, 'upperW', 'out'], [0.05, 'upperW'], [0.08, 'upper', 'snap'], [0.2, 'upperF'], [0.42, 'idle', 'io']] },
    // the other button mid-string: a knee, an elbow or a low kick, each leading back into a string
    elbow: { dur: 0.26, hit: [0.05, 0.12], dmg: 1, box: [8, -72, 30, 28], lunge: 110, next: { punch: 'overhand', kick: 'round' }, tip: 3,
      vary: [[6, 0.1], [2, 0.04]], clip: [[0, 'elW'], [0.05, 'el', 'snap'], [0.12, 'el'], [0.26, 'idle', 'io']] },
    knee: { dur: 0.3, hit: [0.06, 0.15], dmg: 2, box: [4, -62, 30, 36], lunge: 90, next: { punch: 'cross', kick: 'round' }, heavy: true, tip: 7,
      vary: [[14, 0.12], [2, 0.04]], clip: [[0, 'knW', 'out'], [0.06, 'kn', 'snap'], [0.15, 'kn'], [0.3, 'idle', 'io']] },
    lowKick: { dur: 0.3, hit: [0.06, 0.15], dmg: 1, box: [10, -34, 46, 30], lunge: 50, next: { punch: 'overhand', kick: 'round' }, tip: 8,
      vary: [[14, 0.12], [16, 0.12]], clip: [[0, 'lkW', 'out'], [0.06, 'lk', 'snap'], [0.15, 'lk'], [0.3, 'idle', 'io']] },
    rush: { dur: 0.4, hit: [0.07, 0.22], dmg: 2, box: [14, -72, 50, 34], lunge: 560, lungeT: 0.14, heavy: true, tip: 4,
      clip: [[0, 'rushW'], [0.07, 'rush', 'snap'], [0.24, 'rush'], [0.4, 'idle', 'io']] },
    kick: { dur: 0.36, hit: [0.09, 0.19], dmg: 2, box: [10, -56, 48, 56], lunge: 50, next: { kick: 'round', punch: 'elbow' }, on: 'kick', charge: 'chK', heavy: true, tip: 8,
      vary: [[14, 0.22], [16, 0.22], [2, 0.05]], clip: [[0, 'kickW', 'out'], [0.06, 'kickW'], [0.09, 'kick', 'snap'], [0.17, 'kickF'], [0.26, 'kickR', 'out'], [0.36, 'idle', 'io']] },
    round: { dur: 0.44, hit: [0.1, 0.22], dmg: 2, box: [6, -88, 56, 44], lunge: 60, next: { kick: 'axe', punch: 'upper' }, heavy: true, tip: 8,
      vary: [[14, 0.2], [16, 0.2], [2, 0.05]], clip: [[0, 'roundW', 'out'], [0.07, 'roundW'], [0.1, 'round', 'snap'], [0.18, 'roundF'], [0.3, 'roundR', 'out'], [0.44, 'idle', 'io']] },
    // the kick string's finisher: the leg goes straight up, then chops down in front of him
    axe: { dur: 0.5, hit: [0.16, 0.27], dmg: 2, box: [6, -96, 50, 96], lunge: 50, heavy: true, tip: 8,
      vary: [[2, 0.05]], clip: [[0, 'kickW', 'out'], [0.1, 'axW', 'io'], [0.14, 'axW'], [0.18, 'ax', 'snap'], [0.28, 'ax'], [0.5, 'idle', 'io']] },
    // the sweep spins him a full turn on the floor, the leg arriving in front as the hit starts
    sweep: { dur: 0.4, hit: [0.08, 0.2], dmg: 2, box: [2, -26, 62, 26], heavy: true, spin: 0.09, tip: 8,
      clip: [[0, 'sweepW'], [0.08, 'sweep', 'snap'], [0.24, 'sweep'], [0.4, 'idle', 'io']] },
    spinFist: { dur: 0.34, hit: [0.09, 0.16], dmg: 2, box: [10, -70, 46, 26], lunge: 60, turn: 0.1, tip: 4,
      clip: [[0, 'bfW', 'out'], [0.08, 'bfW'], [0.1, 'bf', 'snap'], [0.18, 'bf'], [0.34, 'idle', 'io']] },
    spinKick: { dur: 0.48, hit: [0.14, 0.25], dmg: 3, box: [8, -70, 58, 42], lunge: 80, turn: 0.13, heavy: true, tip: 8,
      clip: [[0, 'skW', 'out'], [0.1, 'skW'], [0.14, 'sk', 'snap'], [0.26, 'sk'], [0.36, 'skR', 'out'], [0.48, 'idle', 'io']] },
    rise: { dur: 0.52, hit: [0.1, 0.26], dmg: 2, box: [-6, -150, 44, 130], hop: -640, heavy: true, tip: 4,
      clip: [[0, 'riseW', 'out'], [0.08, 'riseW'], [0.11, 'rise', 'snap'], [0.3, 'rise'], [0.52, 'fall', 'io']] },
    // the hammer drop hangs a beat with the fists up, falls until the floor, then the landing sends out a wave
    slam: { dur: 3, hit: [0.08, 3], dmg: 2, box: [-18, -58, 36, 58], air: true, heavy: true, clip: [[0, 'slamW', 'out']] },
    quake: { dur: 0.34, hit: [0, 0.1], dmg: 2, box: [-84, -24, 168, 24], heavy: true, clip: [[0, 'quake'], [0.16, 'quake'], [0.34, 'idle', 'io']] },
    chP: { dur: 9, clip: [[0, 'chP', 'out']] },
    heavyP: { dur: 0.5, hit: [0.06, 0.16], dmg: 3, box: [12, -72, 56, 32], lunge: 420, lungeT: 0.1, heavy: true, big: true, tip: 4,
      clip: [[0, 'chP'], [0.06, 'heavyP', 'snap'], [0.2, 'heavyP'], [0.5, 'idle', 'io']] },
    chK: { dur: 9, clip: [[0, 'chK', 'out']] },
    flyK: { dur: 0.6, hit: [0.04, 0.4], dmg: 3, box: [6, -62, 54, 32], air: true, heavy: true, big: true, tip: 8,
      clip: [[0, 'chK'], [0.05, 'flyK', 'snap'], [0.4, 'flyK'], [0.6, 'fall', 'io']] },
    slide: { dur: 0.46, hit: [0.03, 0.36], dmg: 2, box: [8, -26, 42, 26], heavy: true, tip: 8,
      clip: [[0, 'slide', 'out'], [0.36, 'slide'], [0.46, 'idle', 'io']] },
    apunch: { dur: 0.26, hit: [0.04, 0.14], dmg: 1, box: [10, -76, 42, 24], air: true, next: { punch: 'apunch2', kick: 'akick' }, tip: 4,
      vary: [[6, 0.12], [8, 0.12]], clip: [[0, 'jabW'], [0.04, 'apunch', 'snap'], [0.16, 'apunch'], [0.26, 'fall', 'io']] },
    apunch2: { dur: 0.26, hit: [0.04, 0.14], dmg: 1, box: [10, -76, 42, 24], air: true, next: { kick: 'akick' }, tip: 6,
      vary: [[10, 0.12], [12, 0.12]], clip: [[0, 'apunch'], [0.04, 'apunch2', 'snap'], [0.16, 'apunch2'], [0.26, 'fall', 'io']] },
    akick: { dur: 0.38, hit: [0.06, 0.24], dmg: 2, box: [8, -52, 46, 28], air: true, next: { kick: 'akick2' }, heavy: true, tip: 8,
      vary: [[14, 0.15], [16, 0.15]], clip: [[0, 'jump'], [0.06, 'akick', 'snap'], [0.26, 'akick'], [0.38, 'fall', 'io']] },
    // the other leg's kick: a scissor in the air
    akick2: { dur: 0.34, hit: [0.05, 0.2], dmg: 1, box: [8, -52, 46, 28], air: true, tip: 10,
      vary: [[18, 0.12], [20, 0.12]], clip: [[0, 'akick'], [0.05, 'akick2', 'snap'], [0.22, 'akick2'], [0.34, 'fall', 'io']] },
    dive: { dur: 0.8, hit: [0.04, 0.8], dmg: 2, box: [-2, -34, 40, 38], air: true, heavy: true, tip: 8,
      clip: [[0, 'jump'], [0.06, 'dive', 'snap']] },
    kb1: { dur: 0.48, hit: [0.14, 0.26], dmg: 3, box: [-4, -112, 84, 112], lunge: 60, next: { punch: 'kb2' }, heavy: true, weapon: true, tip: 'w',
      clip: [[0, 'kbW', 'out'], [0.14, 'kb1', 'snap'], [0.3, 'kb1'], [0.48, 'idle', 'io']] },
    kb2: { dur: 0.44, hit: [0.09, 0.2], dmg: 2, box: [-6, -92, 92, 64], lunge: 80, heavy: true, weapon: true, tip: 'w',
      clip: [[0, 'kb1'], [0.09, 'kb2', 'snap'], [0.24, 'kb2'], [0.44, 'idle', 'io']] },
    kbAir: { dur: 0.42, hit: [0.1, 0.26], dmg: 3, box: [-20, -110, 100, 110], air: true, heavy: true, weapon: true, tip: 'w',
      clip: [[0, 'kbW', 'out'], [0.1, 'kb1', 'snap'], [0.3, 'kb1'], [0.42, 'fall', 'io']] },
    ms1: { dur: 0.32, hit: [0.07, 0.17], dmg: 1, multi: true, box: [8, -80, 100, 34], next: { punch: 'ms2' }, weapon: true, tip: 'w',
      clip: [[0, 'msW', 'out'], [0.07, 'ms1', 'snap'], [0.2, 'ms1'], [0.32, 'idle', 'io']] },
    ms2: { dur: 0.36, hit: [0.07, 0.19], dmg: 1, box: [-6, -150, 96, 96], weapon: true, tip: 'w',
      clip: [[0, 'ms1'], [0.07, 'ms2', 'snap'], [0.22, 'ms2'], [0.36, 'idle', 'io']] },
    msAir: { dur: 0.32, hit: [0.07, 0.17], dmg: 1, multi: true, box: [8, -80, 100, 34], air: true, weapon: true, tip: 'w',
      clip: [[0, 'msW', 'out'], [0.07, 'ms1', 'snap'], [0.2, 'ms1'], [0.32, 'fall', 'io']] },
    toss: { dur: 0.3, release: 0.08, mobile: true, clip: [[0, 'throwW', 'out'], [0.08, 'throw', 'snap'], [0.18, 'throw'], [0.3, 'idle', 'io']] },
    lob: { dur: 0.36, release: 0.12, mobile: true, clip: [[0, 'throwW', 'out'], [0.12, 'lob', 'snap'], [0.24, 'lob'], [0.36, 'idle', 'io']] },
    dash: { dur: 0.18 }, hurt: { dur: 0.34 }, land: { dur: 0.1 }, skid: { dur: 0.16 }, wave: { dur: 1.7 },
    // knocked down: he lies a moment and kips up; ↑ just before landing flips him onto his feet instead
    down: { dur: 0.34, then: 'getup', clip: [[0, 'dead']] },
    getup: { dur: 0.4, clip: [[0, 'dead'], [0.14, 'kip1', 'io'], [0.26, 'kip2', 'snap'], [0.4, 'idle', 'io']] },
    tech: { dur: 0.3, clip: [[0, 'tuck', 'snap'], [0.2, 'tuck'], [0.3, 'land', 'out']] },
    shadowUp: { dur: 0.42, clip: [[0, 'powerW', 'out'], [0.14, 'power', 'snap'], [0.3, 'power'], [0.42, 'idle', 'io']] },
    endtask: { dur: 3, air: true },
    // hits from thrown weapons and End Task, for the bosses' damage tables
    cd: { dmg: 1 }, paint: { dmg: 1, heavy: true }, blast: { dmg: 8, heavy: true },
  };
  // no hit lands during these: shadow mode coming on, End Task, and a knockdown until he is up
  const SAFE_ACTS = ['shadowUp', 'endtask', 'down', 'getup', 'tech'];
  const TMP = new Array(22).fill(0), TMPR = new Array(22).fill(0), TMPR2 = new Array(22).fill(0);

  // two-bone IK: the middle joint for a limb from a to b; bend picks the side
  function ik(ax, ay, bx, by, l1, l2, bend) {
    let dx = bx - ax, dy = by - ay, d = Math.hypot(dx, dy);
    if (d < 0.001) return [ax, ay + l1];
    const max = l1 + l2 - 0.001;
    if (d > max) { dx *= max / d; dy *= max / d; d = max; }
    const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    return [ax + (dx * a) / d - (dy / d) * h * bend, ay + (dy * a) / d + (dx / d) * h * bend];
  }
  // the run cycle: feet trace a loop, knees and elbows follow by IK; lean grows with speed
  function runPose(ph, o, lean) {
    const hipY = -31 - Math.abs(Math.cos(ph)) * 2.5;
    o[0] = 1; o[1] = hipY; o[2] = 2 + 6 * lean; o[3] = hipY - 27; o[4] = 3 + 8 * lean; o[5] = hipY - 39;
    for (let s = 0; s < 2; s++) {
      const p = ph + s * Math.PI;
      const fx = 1 + 15 * Math.sin(p), fy = -Math.max(0, Math.cos(p)) * 13;
      const [kx, ky] = ik(o[0], o[1], fx, fy, 17, 17, -1);
      const i = s === 0 ? 14 : 18;
      o[i] = kx; o[i + 1] = ky; o[i + 2] = fx; o[i + 3] = fy;
      const hx = o[2] + 2 - (6 + 10 * lean) * Math.sin(p), hy = hipY - 16 - Math.max(0, -Math.sin(p)) * 6;
      const [ex, ey] = ik(o[2], o[3], hx, hy, 14, 14, 1);
      const j = s === 0 ? 6 : 10;
      o[j] = ex; o[j + 1] = ey; o[j + 2] = hx; o[j + 3] = hy;
    }
    return o;
  }

  class Stick {
    constructor() {
      this.rig = RIG.idle.slice(); this.pts = POSE.idle.slice();
      this.band = [[0, 0], [0, 0], [0, 0]]; this.trail = []; this.ghosts = [];
      this.mouse = { x: 0, y: 0, vx: 0, vy: 0 };
      this.reset(170);
    }
    reset(x) {
      Object.assign(this, {
        x, y: FLOOR, vx: 0, vy: 0, face: 1, ground: true, coyote: 0, jumps: 1, airDash: true, jumpCut: false,
        hp: 6, hpMax: 6, inv: 0, act: null, dashCd: 0, dropT: 0, sq: 0, spin: 0, spinDir: 1, t: 0, runPh: 0, dead: false, won: false,
        hurtFlash: 0, carry: 0, weapon: null, cdOut: false, lobCd: 0, meter: 0, idleT: 0, fallT: 0, ghostT: 0, winPose: 'win',
        restore: 0, restoreShow: 0, healT: 0, healFrom: 0, hitT: 0, hitN: 1, dodgeT: 0,
        // yaw: how far he is turned about the vertical (drawn as cos(yaw) across); lean: thrown back by a big hit
        yaw: 0, turnT: 9, downT: 0, spinT: 0.34, lean: 0, shadowK: 0,
      });
      this.rig = RIG.idle.slice(); toPts(this.rig, this.pts);
      this.trail.length = 0; this.ghosts.length = 0;
      Object.assign(this.mouse, { x, y: FLOOR - 40, vx: 0, vy: 0 });
      this.band.forEach((b, i) => { b[0] = x - i * 8; b[1] = FLOOR - 75; });
    }
    // a slide keeps him low enough for cards and balls to fly over
    get box() {
      if (this.act && this.act.k === 'slide') return { x: this.x - 16, y: this.y - 30, w: 32, h: 30 };
      return { x: this.x - 12, y: this.y - 74, w: 24, h: 74 };
    }
    hitbox() {
      const a = this.act, m = a && MOVES[a.k];
      if (!m || !m.hit || a.t < m.hit[0] || a.t > m.hit[1]) return null;
      const [ox, oy, w, h] = m.box;
      return { x: this.face > 0 ? this.x + ox : this.x - ox - w, y: this.y + oy, w, h };
    }
    start(k, g) {
      const m = MOVES[k];
      this.act = { k, t: 0, hits: new Set(), queued: null, hold: m.charge && g.input.held[m.on] ? m.on : null };
      // strikes alternate high and low by a random amount, so the same move twice never looks the same
      if (m.vary) { this.varSign = -(this.varSign || 1); this.act.v = this.varSign * rand(0.35, 1); }
      this.spin = 0; this.trail.length = 0;
      // a turning attack starts drawn the old way round and swings through side-on to the new side
      if (m.turn) this.yaw = Math.PI;
      g.snd.move(k, m.hit ? m.hit[0] : 0);
    }
    // the charge lets go: a lunging straight, or a flying kick that leaves the ground
    unleash(g) {
      const kick = this.act.k === 'chK';
      this.start(kick ? 'flyK' : 'heavyP', g);
      if (kick) { this.vy = -380; this.ground = false; }
      g.fx.ring(this.x + this.face * 22, this.y - (kick ? 40 : 58), 6, 44, 0.2, '#ffd89a', 3);
    }
    // ↑ just before landing from a big hit: a backflip onto his feet instead of the floor
    recover(g) {
      this.start('tech', g);
      Object.assign(this, { vy: -300, spin: 0.001, spinDir: -1, spinT: 0.26 });
      g.fx.dust(this.x, this.y, 6); g.fx.chip(this.x, this.y - 104, g.s.techOk);
    }
    // the hammer lands: he crouches with his fists on the floor and a wave runs out both ways
    quake(g) {
      this.start('quake', g);
      g.fx.dust(this.x - 14, this.y, 8); g.fx.dust(this.x + 14, this.y, 8); g.fx.quake(this.x, this.y);
      g.fx.shake(7, 0.2);
    }
    // End Task: a leap to above the boss, a beat with the fists raised (← → steer it), then straight down
    finisher(a, dt, g) {
      const b = g.boss, live = b && !b.dying && !b.gone;
      if (!a.phase) {
        const tg = live ? b.anchor() : { x: this.x, y: FLOOR - 200, r: 40 }, T = 0.34;
        const top = clamp(Math.min(tg.y - tg.r - 40, this.y - 120), 60, FLOOR - 120);
        Object.assign(a, { phase: 'rise', T, vx: clamp((tg.x - this.x) / T, -1500, 1500) });
        this.vy = (2 * (top - this.y)) / T; a.g = -this.vy / T; this.ground = false;
        if (Math.abs(a.vx) > 1) this.face = sign(a.vx);
      }
      // aim assist, as for kicked mines and balls: the leap follows the boss across, and the drop leans toward it
      // when it is near; a boss that jumps away or rises above him still makes it miss
      const t = live ? b.anchor() : null;
      if (a.phase === 'rise') {
        if (t) a.vx = clamp((t.x - this.x) / Math.max(0.06, a.T - a.t), -1500, 1500);
        this.vx = a.vx; this.vy += a.g * dt;
        if (a.t >= a.T) { a.phase = 'hang'; a.h = a.t; this.vy = 0; }
      } else if (a.phase === 'hang') {
        const mv = (g.input.held.right ? 1 : 0) - (g.input.held.left ? 1 : 0);
        this.vx = mv * 320; this.vy = 0;
        if (a.t - a.h >= 0.14) { a.phase = 'drop'; a.dvx = t && Math.abs(t.x - this.x) < 150 ? clamp((t.x - this.x) / 0.1, -1100, 1100) : 0; g.snd.play('drop'); }
      } else {
        this.vx = a.dvx; this.vy = 1800;
        if (t && circleRect(t.x, t.y, t.r, { x: this.x - 26, y: this.y - 70, w: 52, h: 80 })) g.endTaskHit();
      }
    }
    weaponMove(g) {
      const k = this.weapon.kind;
      if (k === 'keyboard') return this.ground ? 'kb1' : 'kbAir';
      if (k === 'mouse') return this.ground ? 'ms1' : 'msAir';
      if (k === 'cd') return this.cdOut ? (this.ground ? 'jab' : 'apunch') : 'toss';
      return this.lobCd > 0 ? (this.ground ? 'jab' : 'apunch') : 'lob';
    }
    launch(vx, vy, g) {
      Object.assign(this, { vx, vy, ground: false, jumps: 1, airDash: true, act: null, jumpCut: false, spin: 0.001, spinDir: 1 });
      g.fx.dust(this.x, this.y, 6);
    }
    // lasting: the attack has been live for a while (a beam already burning), so meeting it is no dodge;
    // big: a slam, a blast or a beam, which throws him off his feet
    hurt(dmg, fromX, g, lasting, big) {
      if (this.dead || this.won) return false;
      // every dash goes through attacks; one that meets an arriving attack in its first moments is a perfect dodge
      if (this.act && this.act.k === 'dash') {
        if (this.act.t <= DODGE_WINDOW && !lasting && !this.act.perfect && this.inv <= 0 && g.dodgeCd <= 0) { this.act.perfect = true; g.perfectDodge(); }
        else if (!this.act.perfect) g.lesson('through');
        return false;
      }
      if (this.inv > 0 || this.dodgeT > 0 || g.god || (this.act && SAFE_ACTS.includes(this.act.k))) return false;
      if (!g.practice) this.hp = Math.max(0, this.hp - dmg);
      // the hit also wipes whatever health was on its way back
      Object.assign(this, { hitN: dmg + (this.restore > 0 ? 1 : 0), hitT: 0.45, restore: 0, restoreShow: 0 });
      if (!g.practice) { g.run.hits += 1; g.fightHits += 1; }
      g.lesson('hurt');
      g.gainMeter(8);
      const dir = this.x === fromX ? -this.face : sign(this.x - fromX);
      // knocked back; caught in the air, he tumbles. A big hit throws him on his back (see the landing)
      Object.assign(this, { vx: dir * (big ? 360 : 300), vy: big ? -520 : -380, face: -dir, jumpCut: false, inv: 1.2, hurtFlash: 0.15, spin: this.ground || big ? 0 : 0.001, spinDir: -1, yaw: 0 });
      this.ground = false;
      this.act = { k: 'hurt', t: 0, hits: new Set(), big: !!big };
      g.fx.shake(8, 0.3); g.fx.flash('rgba(255,60,40,.3)', 0.12); g.hitstop(0.08); g.snd.play('hurt');
      g.fx.sparks(this.x, this.y - 42, 0, 10, '#ff5a3c');
      if (this.hp <= 0) { this.dead = true; this.act = null; this.spin = 0; this.vy = -560; this.vx = dir * 240; g.playerDown(); }
      return true;
    }
    // the attack landed: hang in the air a little, and a dive kick bounces off
    connected() {
      const a = this.act;
      if (!a) return;
      if (a.k === 'dive') { Object.assign(this, { act: null, vy: -660, jumps: 1, airDash: true, spin: 0.001, spinDir: 1 }); return; }
      if (!this.ground && this.vy > -160) this.vy = -160;
    }
    update(dt, g) {
      const inp = g.input;
      this.t += dt;
      this.inv = Math.max(0, this.inv - dt); this.dashCd -= dt; this.coyote -= dt; this.dropT -= dt; this.carry -= dt; this.lobCd -= dt;
      this.sq = Math.max(0, this.sq - dt * 6); this.hurtFlash = Math.max(0, this.hurtFlash - dt);
      this.healT = Math.max(0, this.healT - dt); this.hitT = Math.max(0, this.hitT - dt); this.dodgeT = Math.max(0, this.dodgeT - dt);
      this.restoreShow = damp(this.restoreShow, this.restore, 14, dt);
      if (this.spin) { this.spin += dt / this.spinT; if (this.spin >= 1) { this.spin = 0; this.spinT = 0.34; } }
      this.fallT = this.ground ? 0 : this.fallT + dt;

      if (this.dead || this.won) {
        this.vy = Math.min(this.vy + 2300 * dt, 1150); this.x += this.vx * dt; this.y += this.vy * dt;
        this.vx = approach(this.vx, 0, (this.dead ? 500 : 2000) * dt);
        this.x = clamp(this.x, LEFT + 20, RIGHT - 20);
        if (this.y >= FLOOR) { this.y = FLOOR; this.vy = this.vy > 200 ? -this.vy * 0.3 : 0; }
        this.finish(dt);
        return;
      }
      if (inp.take('special', 0.1)) g.trySpecial();
      this.turnT += dt;

      let a = this.act, m = a && MOVES[a.k];
      if (a) {
        const prev = a.t;
        a.t += dt;
        if (m.hop && prev < m.hit[0] && a.t >= m.hit[0] && this.ground) { this.vy = m.hop; this.ground = false; }
        if (m.release && prev < m.release && a.t >= m.release) g.release(a.k);
        // the mouse double-clicks: a second hit on the same target
        if (m.multi && !a.again && a.t >= m.hit[0] + 0.07) { a.again = true; a.hits.clear(); }
        // mid-string either button picks the next strike, so the punch and kick strings cross over; with ↓ held the
        // press is left for the ↓ move once this one ends
        if (m.next && !a.queued && a.t > m.hit[0] * 0.5 && !inp.held.down) {
          for (const b of ['punch', 'kick']) if (m.next[b] && inp.take(b, 0.2)) { a.queued = m.next[b]; break; }
        }
        if (a.hold && !inp.held[a.hold]) a.hold = null;
        if (a.hold && m.charge && !a.queued && this.ground && a.t >= m.hit[1] + 0.03) {
          // the button is still down once the hit is over: wind up the heavy version
          const key = a.hold;
          this.start(m.charge, g); this.act.hold = key; a = this.act; m = MOVES[a.k];
          g.snd.play('charge');
        } else if (a.k === 'chP' || a.k === 'chK') {
          // let go early and it still fires, once the minimum charge is in
          if (!a.hold) a.fire = true;
          if ((a.fire && a.t >= CHARGE_MIN) || a.t >= CHARGE_MAX) { this.unleash(g); a = this.act; m = MOVES[a.k]; }
        } else if (a.t >= m.dur && !(a.big && !this.ground)) {
          // a queued strike only follows if it suits where he is now (a ground move needs the floor, an air move the air)
          const next = (a.queued && !!MOVES[a.queued].air === !this.ground ? a.queued : null) || m.then || null;
          this.act = a = null; m = null;
          if (next) { this.start(next, g); a = this.act; m = MOVES[next]; }
        }
      }
      const mv = (inp.held.right ? 1 : 0) - (inp.held.left ? 1 : 0);
      if (a && a.k === 'wave' && (mv || inp.pending())) { this.act = a = null; m = null; }
      const endT = m ? (m.hit ? m.hit[1] : m.release ? m.release + 0.06 : Infinity) : 0;
      const recovering = !!(a && a.t > endT && a.k !== 'dive' && a.k !== 'slide');
      // a charge can be dropped for a jump or a dash
      const free = !a || recovering || a.k === 'skid' || a.k === 'chP' || a.k === 'chK';

      if (free && (this.ground || this.coyote > 0 || this.jumps > 0) && inp.take('jump', 0.12)) {
        if (this.ground || this.coyote > 0) { this.vy = -770; g.fx.dust(this.x, this.y, 5); } else { this.jumps -= 1; this.vy = -680; this.spin = 0.001; this.spinDir = 1; g.lesson('double'); }
        this.ground = false; this.coyote = 0; this.jumpCut = true; this.act = a = null; m = null;
        if (mv) this.face = mv;
        g.snd.play('jump');
      }
      if (free && this.dashCd <= 0 && (this.ground || this.airDash) && inp.take('dash', 0.1)) {
        if (mv) this.face = mv;
        if (!this.ground) this.airDash = false;
        this.dashCd = 0.42; this.start('dash', g); a = this.act; m = MOVES.dash; g.lesson('dash');
        g.snd.play('dash'); g.fx.dust(this.x, this.y, 4);
      }
      if (!a || a.k === 'skid') {
        // running into an attack changes it: a lunging punch, or a slide under whatever is coming
        const running = this.ground && Math.abs(this.vx) > 230 && mv === sign(this.vx);
        // the other way from where he faces, or just after turning (a skid included): he spins round into it
        const back = this.ground && mv !== 0 && (mv !== this.face || this.turnT < TURN_WINDOW), low = inp.held.down;
        if (inp.take('punch', 0.14)) {
          if (mv) this.face = mv;
          if (low) this.start(this.ground ? 'rise' : 'slam', g);
          else if (back) this.start('spinFist', g);
          else if (this.weapon) this.start(this.weaponMove(g), g);
          else this.start(!this.ground ? 'apunch' : running ? 'rush' : 'jab', g);
        } else if (inp.take('kick', 0.14)) {
          if (mv) this.face = mv;
          if (!this.ground) this.start(low ? 'dive' : 'akick', g);
          else this.start(low ? 'sweep' : back ? 'spinKick' : running ? 'slide' : 'kick', g);
        }
        a = this.act; m = a && MOVES[a.k];
      }
      // on a platform ↓ drops through only once held a moment, so ↓ + A and ↓ + S still fire up there
      this.downT = inp.held.down ? this.downT + dt : 0;
      if (!a && this.ground && this.y < FLOOR - 1 && this.downT >= DROP_DELAY) { this.dropT = 0.22; this.ground = false; this.y += 2; this.downT = -9; }

      if (a && a.k === 'endtask') this.finisher(a, dt, g);
      else if (a && a.k === 'dash') { this.vx = this.face * (a.t < 0.13 ? 760 : 380); this.vy = 0; }
      else if (a && a.k === 'slide') this.vx = this.face * lerp(600, 140, Math.min(1, a.t / m.dur));
      else if (a && a.k === 'dive') { this.vx = this.face * 360; this.vy = 920; }
      else if (a && a.k === 'slam') {
        if (a.t < 0.08) { this.vx *= 0.8; this.vy = Math.min(this.vy, 0) * 0.5; } else { this.vx = approach(this.vx, 0, 2000 * dt); this.vy = 1300; }
      } else if (a && a.k === 'flyK' && a.t < 0.4) this.vx = this.face * 620;
      else if (a && ['hurt', 'skid', 'land', 'down', 'getup', 'tech'].includes(a.k)) { if (this.ground) this.vx = approach(this.vx, 0, (a.k === 'skid' ? 2400 : 1800) * dt); }
      else if (a && !m.air && !m.mobile && a.k !== 'wave') this.vx = a.t < (m.lungeT || 0.07) ? this.face * (m.lunge || 0) : approach(this.vx, 0, 2600 * dt);
      else if (!a && this.ground && mv && Math.abs(this.vx) > 230 && sign(this.vx) !== mv) {
        // turning around at a run: plant a foot and skid
        this.start('skid', g); g.fx.dust(this.x + this.face * 10, this.y, 6); g.snd.play('skid');
      } else {
        const acc = this.ground ? (mv ? (g.slip ? 1400 : 3400) : (g.slip ? 500 : 3900)) : 2300 * (a && a.k !== 'wave' ? 0.55 : 1);
        // a flipper launch keeps its momentum until the player steers
        if (!(this.carry > 0 && !mv && !this.ground)) this.vx = approach(this.vx, mv * 295, acc * dt);
        // a plain turn eases through side-on instead of flipping in one frame
        if (!a && mv && mv !== this.face) { this.face = mv; this.turnT = 0; this.yaw = Math.PI; }
      }
      this.vx += g.windX * dt;

      if (!(a && ['dash', 'dive', 'slam', 'endtask'].includes(a.k))) {
        if (this.jumpCut && !inp.held.jump && this.vy < -300) { this.vy = -300; this.jumpCut = false; }
        if (this.vy >= 0) this.jumpCut = false;
        let gr = 2300 * (this.vy > 0 ? 1.12 : 1);
        if (inp.held.down && !this.ground && !a) gr *= 1.5;
        this.vy = Math.min(this.vy + gr * dt, 1150);
      }

      const oldY = this.y;
      this.x += this.vx * dt; this.y += this.vy * dt;
      if (this.x < LEFT + 12) { this.x = LEFT + 12; if (this.vx < 0) this.vx = 0; }
      if (this.x > RIGHT - 12) { this.x = RIGHT - 12; if (this.vx > 0) this.vx = 0; }
      let land = false;
      if (this.y >= FLOOR) { this.y = FLOOR; land = true; }
      else if (this.vy >= 0 && this.dropT <= 0) {
        for (const pl of g.plats()) {
          if (oldY <= pl.y + 1 && this.y >= pl.y && this.x > pl.x1 - 8 && this.x < pl.x2 + 8) { this.y = pl.y; land = true; break; }
        }
      }
      if (land) {
        if (!this.ground) {
          const hard = this.vy > 520;
          this.spin = 0;
          if (a && a.k === 'dive') {
            this.act = a = null;
            g.fx.dust(this.x - 12, this.y, 6); g.fx.dust(this.x + 12, this.y, 6); g.fx.shake(3, 0.12); g.snd.play('land');
            this.start('land', g);
          } else if (a && a.k === 'slam') { this.act = a = null; this.quake(g); }
          else if (a && a.k === 'endtask') { this.act = a = null; this.quake(g); g.endTaskMissed(); }
          else if (a && a.k === 'hurt' && a.big) {
            this.act = a = null;
            if (inp.take('jump', 0.3)) this.recover(g);
            else { this.start('down', g); g.fx.dust(this.x - 18, this.y, 7); g.fx.dust(this.x + 8, this.y, 4); g.fx.shake(5, 0.2); }
          } else if (this.vy > 250) { this.sq = hard ? 1 : 0.6; g.fx.dust(this.x, this.y, hard ? 6 : 3); g.snd.play('land'); }
          if (this.act && MOVES[this.act.k].air) this.act = null;
        }
        this.vy = 0; this.ground = true; this.jumps = 1; this.airDash = true; this.coyote = 0.09;
      } else if (this.ground) { this.ground = false; this.coyote = 0.09; }

      // left alone for a while, he waves at whoever is watching
      const waving = this.act && this.act.k === 'wave';
      if (!waving) { if (!this.act && this.ground && !mv && Math.abs(this.vx) < 10) this.idleT += dt; else this.idleT = 0; }
      if (this.idleT > 6.5) { this.idleT = -2.5; this.start('wave', g); }
      this.finish(dt);
    }
    // the title and intro screens: no input, just life
    idle(dt, g) {
      this.t += dt;
      const a = this.act;
      if (a) { a.t += dt; if (a.t >= MOVES[a.k].dur) this.act = null; }
      else { this.idleT += dt; if (this.idleT > 4.5) { this.idleT = -1.5; this.start('wave', g); } }
      this.finish(dt);
    }
    finish(dt) {
      // turning attacks swing him round, the sweep spins a full turn, any other turn settles back to square
      const a = this.act, m = a && MOVES[a.k];
      if (m && m.turn) this.yaw = Math.PI * (1 - easeOut(Math.min(1, a.t / m.turn)));
      else if (m && m.spin) this.yaw = a.t < m.spin ? (TAU * a.t) / m.spin : 0;
      else this.yaw = Math.max(0, this.yaw - (dt * Math.PI) / 0.09);
      this.lean = a && a.k === 'hurt' && a.big ? -1.25 * Math.min(1, a.t / 0.36) : 0;
      this.pickPose(dt);
      this.updateBand(dt);
      this.updateMouse(dt);
      this.updateTrail(dt);
      this.updateGhosts(dt);
    }
    pickPose(dt) {
      if (this.dead) { this.blend(RIG.dead, 10, dt); return; }
      if (this.won) { this.blend(RIG[this.winPose], 8, dt); return; }
      const a = this.act;
      let target, rate = 30;
      if (a) {
        const m = MOVES[a.k];
        if (a.k === 'endtask') { target = RIG[a.phase === 'rise' || !a.phase ? 'etRise' : a.hit ? 'slam' : 'slamW']; rate = 36; }
        else if (a.k === 'hurt' && a.big) { target = RIG.hurtBig; rate = 24; }
        else if (m.clip) {
          target = sampleClip(m.clip, a.t, TMPR); rate = 42;
          // the move's own nudge, at full strength while the hit is live and fading on both sides of it
          if (m.vary && a.v) {
            const [h0, h1] = m.hit, w = a.t < h0 ? a.t / h0 : a.t <= h1 ? 1 : Math.max(0, 1 - (a.t - h1) / (m.dur - h1));
            for (const [i, amp] of m.vary) target[i] += a.v * amp * w;
          }
        }
        else if (a.k === 'dash') { target = RIG[this.ground ? 'dash' : 'airdash']; rate = 40; }
        else if (a.k === 'wave') {
          mixRig(RIG.wave, RIG.wave, 0, TMPR);
          const k = Math.min(1, a.t / 0.25) * Math.min(1, (m.dur - a.t) / 0.25);
          TMPR[8] += Math.sin(a.t * 13) * 0.55;
          target = mixRig(RIG.idle, TMPR, Math.max(0, k), TMPR2); rate = 16;
        } else target = RIG[a.k] || RIG.idle;
      } else if (!this.ground) {
        if (this.vy < -80) target = RIG.jump;
        else {
          target = mixRig(RIG.fall, RIG.fall, 0, TMPR);
          // a long fall: arms wheel for balance
          if (this.fallT > 0.35) { const f = Math.sin(this.t * 17) * 0.45; TMPR[6] += f; TMPR[8] += f * 1.2; TMPR[10] -= f; TMPR[12] -= f * 1.2; }
        }
        rate = 14;
      } else if (this.sq > 0.35) target = RIG.land;
      else if (Math.abs(this.vx) > 40) {
        const sp = Math.abs(this.vx) / 295;
        this.runPh += dt * sp * 13;
        target = toRig(runPose(this.runPh, TMP, Math.min(1, sp)), TMPR); rate = 24;
      } else {
        // a boxer's bounce: the upper body bobs while the feet stay planted, in the stance his weapon calls for
        const w = this.weapon && this.weapon.kind, base = POSE[w === 'keyboard' ? 'kbIdle' : w === 'mouse' ? 'msIdle' : 'idle'];
        const b = Math.sin(this.t * 5.2) * 1.4;
        for (let i = 0; i < 22; i++) TMP[i] = base[i] + (i % 2 && i < 14 ? b : 0);
        target = toRig(TMP, TMPR); rate = 14;
      }
      this.blend(target, rate, dt);
    }
    blend(target, rate, dt) {
      const k = 1 - Math.exp(-rate * dt), r = this.rig;
      r[0] += (target[0] - r[0]) * k; r[1] += (target[1] - r[1]) * k;
      for (let i = 2; i < 22; i += 2) { r[i] += wrapA(target[i] - r[i]) * k; r[i + 1] += (target[i + 1] - r[i + 1]) * k; }
      toPts(r, this.pts);
    }
    // the red headband trails behind the head like a short rope
    updateBand(dt) {
      const P = this.pts, f = this.face * Math.cos(this.yaw);
      const hx = this.x + P[4] * f, hy = this.y + P[5];
      this.band[0][0] = hx - f * 7; this.band[0][1] = hy - 3;
      for (let i = 1; i < 3; i++) {
        const [px, py] = this.band[i - 1], b = this.band[i];
        b[0] = damp(b[0], px - f * 8 - this.vx * 0.012, 30, dt);
        b[1] = damp(b[1], py + 2 - this.vy * 0.008 + Math.sin(this.t * 14 + i) * 1.4, 30, dt);
        const dx = b[0] - px, dy = b[1] - py, d = Math.hypot(dx, dy) || 1;
        if (d > 10) { b[0] = px + (dx / d) * 10; b[1] = py + (dy / d) * 10; }
      }
    }
    // the mouse swings on its cable like a flail: a spring that snaps out when he lashes
    updateMouse(dt) {
      const w = this.weapon, m = this.mouse;
      if (!w || w.kind !== 'mouse') return;
      const P = this.pts, a = this.act, ang = this.rig[8], mv = a && MOVES[a.k];
      const lash = !!(mv && mv.weapon && a.t > mv.hit[0] - 0.04 && a.t < mv.hit[1] + 0.03);
      const hx = this.x + P[8] * this.face * Math.cos(this.yaw), hy = this.y + P[9], reach = lash ? 100 : 22;
      const tx = hx + Math.cos(ang) * reach * this.face, ty = hy + Math.sin(ang) * reach + (lash ? 0 : 16);
      const k = lash ? 1600 : 520;
      m.vx += ((tx - m.x) * k - m.vx * 20) * dt; m.vy += ((ty - m.y) * k - m.vy * 20) * dt;
      m.x += m.vx * dt; m.y += m.vy * dt;
      const dx = m.x - hx, dy = m.y - hy, d = Math.hypot(dx, dy);
      if (d > 112) { m.x = hx + (dx / d) * 112; m.y = hy + (dy / d) * 112; }
    }
    tip(m) {
      const P = this.pts, cy = Math.cos(this.yaw);
      if (m.tip !== 'w') return [P[m.tip * 2] * cy, P[m.tip * 2 + 1]];
      if (this.weapon && this.weapon.kind === 'mouse') return [(this.mouse.x - this.x) * this.face, this.mouse.y - this.y];
      const ang = this.rig[8], len = this.weapon && this.weapon.kind === 'keyboard' ? 48 : 14;
      return [(P[8] + Math.cos(ang) * len) * cy, P[9] + Math.sin(ang) * len];
    }
    // the swoosh: the striking fist, foot or weapon leaves a short fading ribbon
    updateTrail(dt) {
      for (const q of this.trail) q.age += dt;
      while (this.trail.length && this.trail[0].age > 0.09) this.trail.shift();
      const a = this.act, m = a && MOVES[a.k];
      if (!m || !m.hit || m.tip === undefined || a.t < m.hit[0] - 0.03 || a.t > m.hit[1] + 0.03) return;
      const [lx, ly] = this.tip(m);
      const c = m.weapon && this.weapon ? TRAIL[this.weapon.kind] : this.shadowK > 0.5 ? SHADOW_C : '#ffffff';
      this.trail.push({ x: this.x + lx * this.face, y: this.y + ly, age: 0, w: m.weapon ? 8 : m.heavy ? 6 : 4.5, c });
    }
    // afterimages while he dashes, lunges or leaps; in shadow mode every move leaves them
    updateGhosts(dt) {
      for (const gh of this.ghosts) gh.t += dt;
      this.ghosts = this.ghosts.filter((gh) => gh.t < (gh.life || 0.22));
      const a = this.act, fast = a && ['dash', 'rush', 'slide', 'shadowUp', 'endtask', 'heavyP', 'flyK'].includes(a.k);
      if (!fast && !(this.shadowK > 0.5 && (a || !this.ground || Math.abs(this.vx) > 60))) return;
      this.ghostT -= dt;
      if (this.ghostT <= 0) {
        this.ghostT = 0.035;
        this.ghosts.push({ pts: this.pts.slice(), x: this.x, y: this.y, face: this.face, cy: Math.cos(this.yaw), t: 0, c: this.shadowK > 0.5 ? SHADOW_C : undefined });
      }
    }
    // the charge: light gathers at the fist (the foot for a kick), growing the longer he holds; a ring says it is full
    drawCharge(ctx, a, cy) {
      const P = this.pts, j = a.k === 'chP' ? 8 : 16, k = Math.min(1, a.t / 0.6);
      const x = this.x + P[j] * this.face * cy, y = this.y + P[j + 1], r = 12 + 22 * k + Math.sin(this.t * 30) * 2;
      const gr = ctx.createRadialGradient(x, y, 1, x, y, r);
      gr.addColorStop(0, `rgba(255,248,214,${0.75 + 0.2 * k})`); gr.addColorStop(0.4, `rgba(255,176,48,${0.45 + 0.35 * k})`); gr.addColorStop(1, 'rgba(255,140,20,0)');
      ctx.fillStyle = gr; dot(ctx, x, y, r);
      if (k >= 1) { ctx.strokeStyle = 'rgba(255,150,30,.7)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * 0.8, 0, TAU); ctx.stroke(); }
    }
    draw(ctx) {
      for (const gh of this.ghosts) { ctx.globalAlpha = 0.45 * (1 - gh.t / (gh.life || 0.22)); this.body(ctx, gh.pts, gh.x, gh.y, gh.face, 1, 1, 0, gh.c || '#6aa8ff', false, gh.cy); }
      ctx.globalAlpha = 1;
      this.drawTrail(ctx);
      const a = this.act, cy = Math.cos(this.yaw), power = a && a.k === 'shadowUp', charging = a && (a.k === 'chP' || a.k === 'chK');
      if (power) {
        // shadow mode coming on: a cold light swells around him
        const k = Math.min(1, a.t / 0.2), r = 62 + Math.sin(this.t * 20) * 4;
        const gr = ctx.createRadialGradient(this.x, this.y - 40, 8, this.x, this.y - 40, r);
        gr.addColorStop(0, `rgba(170,215,255,${0.6 * k})`); gr.addColorStop(1, 'rgba(60,130,255,0)');
        ctx.fillStyle = gr; dot(ctx, this.x, this.y - 40, r);
      }
      if (this.healT > 0) {
        // health coming back: a soft green glow that swells and fades
        const k = this.healT / 0.9, r = 48 + (1 - k) * 18;
        const gr = ctx.createRadialGradient(this.x, this.y - 40, 6, this.x, this.y - 40, r);
        gr.addColorStop(0, `rgba(160,255,160,${0.55 * k})`); gr.addColorStop(1, 'rgba(40,200,60,0)');
        ctx.fillStyle = gr; dot(ctx, this.x, this.y - 40, r);
      }
      if (charging) this.drawCharge(ctx, a, cy);
      const blink = this.inv > 0 && !this.dead && !power && Math.floor(this.inv * 14) % 2 === 0;
      ctx.globalAlpha = blink ? 0.35 : 1;
      const sx = 1 + this.sq * 0.14, sy = 1 - this.sq * 0.16, rot = this.spin ? this.spin * TAU * this.face * this.spinDir : this.lean * this.face;
      const tint = this.hurtFlash > 0 ? '#e0301e' : this.healT > 0.72 ? '#1fb85a' : null;
      // a full charge makes him shake with it
      const shake = charging && a.t > 0.5 ? Math.sin(this.t * 90) * 1.2 : 0;
      this.body(ctx, this.pts, this.x + shake, this.y, this.face, sx, sy, rot, tint, true, cy);
      if (!this.spin && !this.lean && !this.dead) this.drawBand(ctx);
      ctx.globalAlpha = 1;
    }
    body(ctx, P, x, y, face, sx, sy, rot, tint, full, cy = 1) {
      // turned partway round, the figure narrows across: the joints move in, the line widths stay
      if (cy !== 1) P = P.map((v, i) => (i % 2 ? v : v * cy));
      ctx.save();
      ctx.translate(x, y);
      if (rot) { ctx.translate(0, -34); ctx.rotate(rot); ctx.translate(0, 34); }
      ctx.scale(face * sx, sy);
      const seg = (idx) => { ctx.beginPath(); ctx.moveTo(P[idx[0]], P[idx[0] + 1]); for (let i = 1; i < idx.length; i++) ctx.lineTo(P[idx[i]], P[idx[i] + 1]); ctx.stroke(); };
      const backArm = [2, 10, 12], backLeg = [0, 18, 20], torso = [0, 2], frontLeg = [0, 14, 16], frontArm = [2, 6, 8];
      const sh = full ? this.shadowK : 0, dark = sh > 0.5;
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (full) {
        // a white halo keeps the figure readable on every arena; in shadow mode it burns cyan
        const halo = dark ? 'rgba(160,226,255,.95)' : 'rgba(255,255,255,.9)';
        if (sh > 0) { ctx.shadowColor = SHADOW_GLOW; ctx.shadowBlur = 14 * sh; }
        ctx.strokeStyle = halo; ctx.lineWidth = 9;
        [backArm, backLeg, torso, frontLeg, frontArm].forEach(seg);
        ctx.fillStyle = halo; dot(ctx, P[4], P[5], 11.5); dot(ctx, P[8], P[9], 5.8); dot(ctx, P[12], P[13], 5.6);
        ctx.shadowBlur = 0;
      }
      ctx.lineWidth = 5;
      const back = tint || (dark ? '#33477f' : '#4a4a4a'), front = tint || (dark ? '#0d1b4d' : '#111');
      ctx.strokeStyle = back; seg(backArm); seg(backLeg);
      ctx.fillStyle = back; dot(ctx, P[12], P[13], 3.2);
      ctx.strokeStyle = front; seg(torso); seg(frontLeg); seg(frontArm);
      ctx.fillStyle = front; dot(ctx, P[4], P[5], 8.5); dot(ctx, P[8], P[9], 3.5);
      if (full && !this.dead) {
        // one eye shows which way he looks; it glows while shadow mode comes on and lasts
        ctx.fillStyle = dark || (this.act && this.act.k === 'shadowUp') ? '#bff4ff' : '#fff';
        ctx.beginPath(); ctx.ellipse(P[4] + 3.8 * cy, P[5] - 1.2, 1.6 * Math.max(0.3, Math.abs(cy)), 2.3, 0, 0, TAU); ctx.fill();
      }
      if (full && this.weapon) this.drawWeapon(ctx, P, x, y, face, sx, sy, cy);
      ctx.restore();
    }
    drawWeapon(ctx, P, x, y, face, sx, sy, cy) {
      const w = this.weapon, ang = this.rig[8], ga = ctx.globalAlpha;
      if (w.t < 4 && Math.floor(w.t * 8) % 2) ctx.globalAlpha = ga * 0.4;
      if (w.kind === 'keyboard') { ctx.save(); ctx.translate(P[8], P[9]); ctx.scale(cy, 1); ctx.rotate(ang); drawKeyboard(ctx, 1); ctx.restore(); }
      else if (w.kind === 'mouse') {
        const lx = (this.mouse.x - x) / (face * sx), ly = (this.mouse.y - y) / sy;
        ctx.strokeStyle = '#333'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.moveTo(P[8], P[9]); ctx.quadraticCurveTo((P[8] + lx) / 2, Math.max(P[9], ly) + 10, lx, ly); ctx.stroke();
        drawMouse(ctx, lx, ly, Math.atan2(ly - P[9], lx - P[8]));
      } else if (w.kind === 'cd') { if (!this.cdOut) drawDisc(ctx, P[8] + 2, P[9] - 3, 8, this.t * 5); }
      else drawBucket(ctx, P[8], P[9] + 9, 1, w.color);
      ctx.globalAlpha = ga;
    }
    drawBand(ctx) {
      const P = this.pts, hx = this.x + P[4] * this.face * Math.cos(this.yaw), hy = this.y + P[5];
      ctx.strokeStyle = '#e0301e'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(hx - 8.5, hy - 2.5); ctx.lineTo(hx + 8.5, hy - 2.5); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(this.band[0][0], this.band[0][1]);
      for (let i = 1; i < 3; i++) ctx.lineTo(this.band[i][0], this.band[i][1]);
      ctx.stroke();
    }
    drawTrail(ctx) {
      const T = this.trail;
      if (T.length < 2) return;
      ctx.lineCap = 'round';
      for (let i = 1; i < T.length; i++) {
        const a = T[i - 1], b = T[i], k = i / (T.length - 1);
        ctx.globalAlpha = 0.6 * k * Math.max(0, 1 - b.age / 0.09);
        ctx.strokeStyle = b.c; ctx.lineWidth = b.w * (0.35 + k * 0.9);
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }
  }

  /* ------------------------------------------------------------ period drawing kit */
  // Minesweeper's raised and sunken edges
  function bevel(ctx, x, y, w, h, b, light, dark, face, sunk) {
    ctx.fillStyle = face; ctx.fillRect(x, y, w, h);
    ctx.fillStyle = sunk ? dark : light;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w - b, y + b); ctx.lineTo(x + b, y + b); ctx.lineTo(x + b, y + h - b); ctx.lineTo(x, y + h); ctx.closePath(); ctx.fill();
    ctx.fillStyle = sunk ? light : dark;
    ctx.beginPath(); ctx.moveTo(x + w, y + h); ctx.lineTo(x, y + h); ctx.lineTo(x + b, y + h - b); ctx.lineTo(x + w - b, y + h - b); ctx.lineTo(x + w - b, y + b); ctx.lineTo(x + w, y); ctx.closePath(); ctx.fill();
  }
  const NUMC = { 1: '#0000ff', 2: '#008000', 3: '#ff0000' };
  function mineIcon(ctx, x, y, r, lit) {
    if (lit) { ctx.fillStyle = 'rgba(255,50,20,.55)'; dot(ctx, x, y, r * 1.75); }
    ctx.strokeStyle = '#000'; ctx.lineWidth = r * 0.3; ctx.lineCap = 'butt';
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 4, c = Math.cos(a) * r * 1.4, s = Math.sin(a) * r * 1.4;
      ctx.beginPath(); ctx.moveTo(x - c, y - s); ctx.lineTo(x + c, y + s); ctx.stroke();
    }
    ctx.fillStyle = '#000'; dot(ctx, x, y, r);
    ctx.fillStyle = '#fff'; ctx.fillRect(x - r * 0.5, y - r * 0.5, r * 0.36, r * 0.36);
  }
  function flagIcon(ctx, x, y, s) {
    ctx.fillStyle = '#000';
    ctx.fillRect(x - 1.5 * s, y - 22 * s, 3 * s, 20 * s);
    ctx.fillRect(x - 8 * s, y - 4 * s, 16 * s, 2.5 * s); ctx.fillRect(x - 11 * s, y - 2 * s, 22 * s, 2.5 * s);
    ctx.fillStyle = '#ff0000';
    ctx.beginPath(); ctx.moveTo(x + 1.5 * s, y - 24 * s); ctx.lineTo(x - 13 * s, y - 17 * s); ctx.lineTo(x + 1.5 * s, y - 10 * s); ctx.closePath(); ctx.fill();
  }
  // the Minesweeper face: a yellow smiley on a raised square button
  function smileyButton(ctx, x, y, s, face, pressed, t = 0) {
    const h = s / 2;
    ctx.fillStyle = '#7b7b7b'; ctx.fillRect(x - h - 2, y - h - 2, s + 4, s + 4);
    bevel(ctx, x - h, y - h, s, s, s * 0.07, '#ffffff', '#7b7b7b', '#c0c0c0', pressed);
    const r = s * 0.34, cy = y + (pressed ? s * 0.03 : 0), cx = x + (pressed ? s * 0.03 : 0);
    ctx.fillStyle = '#ffe417'; ctx.strokeStyle = '#000'; ctx.lineWidth = Math.max(2, r * 0.09);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, TAU); ctx.fill(); ctx.stroke();
    const ex = r * 0.34, ey = cy - r * 0.2;
    ctx.fillStyle = '#000'; ctx.strokeStyle = '#000'; ctx.lineCap = 'round'; ctx.lineWidth = Math.max(2, r * 0.1);
    if (face === 'cool') {
      ctx.beginPath(); ctx.moveTo(cx - r * 0.78, ey - r * 0.08); ctx.lineTo(cx + r * 0.78, ey - r * 0.08); ctx.stroke();
      rr(ctx, cx - r * 0.66, ey - r * 0.12, r * 0.56, r * 0.3, r * 0.1); ctx.fill();
      rr(ctx, cx + r * 0.1, ey - r * 0.12, r * 0.56, r * 0.3, r * 0.1); ctx.fill();
    } else if (face === 'dead') {
      for (const sx of [-1, 1]) {
        const e = cx + sx * ex, d = r * 0.12;
        ctx.beginPath(); ctx.moveTo(e - d, ey - d); ctx.lineTo(e + d, ey + d); ctx.moveTo(e + d, ey - d); ctx.lineTo(e - d, ey + d); ctx.stroke();
      }
    } else if (face === 'hurt') {
      for (const sx of [-1, 1]) {
        const e = cx + sx * ex, d = r * 0.12;
        ctx.beginPath(); ctx.moveTo(e - sx * d, ey - d); ctx.lineTo(e + sx * d, ey); ctx.lineTo(e - sx * d, ey + d); ctx.stroke();
      }
    } else if (face === 'dizzy') {
      ctx.lineWidth = Math.max(1.5, r * 0.07);
      for (const sx of [-1, 1]) { ctx.beginPath(); ctx.arc(cx + sx * ex, ey, r * 0.13, t * 9, t * 9 + 5); ctx.stroke(); }
    } else {
      dot(ctx, cx - ex, ey, r * 0.11); dot(ctx, cx + ex, ey, r * 0.11);
    }
    ctx.lineWidth = Math.max(2, r * 0.1);
    if (face === 'oh') dot(ctx, cx, cy + r * 0.4, r * 0.17);
    else if (face === 'dead') { ctx.beginPath(); ctx.arc(cx, cy + r * 0.66, r * 0.38, Math.PI * 1.2, Math.PI * 1.8); ctx.stroke(); }
    else if (face === 'hurt' || face === 'dizzy') {
      ctx.beginPath(); ctx.moveTo(cx - r * 0.3, cy + r * 0.42);
      for (let i = 1; i <= 4; i++) ctx.lineTo(cx - r * 0.3 + i * r * 0.15, cy + r * 0.42 + (i % 2 ? -r * 0.07 : 0));
      ctx.stroke();
    } else { ctx.beginPath(); ctx.arc(cx, cy + r * 0.02, r * 0.52, Math.PI * 0.22, Math.PI * 0.78); ctx.stroke(); }
  }
  function stars(ctx, x, y, t, n = 3) {
    for (let i = 0; i < n; i++) {
      const a = t * 5 + (i * TAU) / n, sx = x + Math.cos(a) * 26, sy = y + Math.sin(a) * 7;
      ctx.fillStyle = '#ffe417'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let j = 0; j < 10; j++) { const r = j % 2 ? 2.6 : 6.5, b = (j * Math.PI) / 5 - Math.PI / 2; ctx.lineTo(sx + Math.cos(b) * r, sy + Math.sin(b) * r); }
      ctx.closePath(); ctx.fill(); ctx.stroke();
    }
  }
  // seven-segment digits, the red counters from Minesweeper
  const SEG = [0x3f, 0x06, 0x5b, 0x4f, 0x66, 0x6d, 0x7d, 0x07, 0x7f, 0x6f];
  function seg7(ctx, x, y, w, h, n, on, off) {
    const t = Math.max(2, w * 0.2), bits = SEG[n], hh = h / 2;
    const segs = [[x + t, y, w - 2 * t, t], [x + w - t, y + t, t, hh - 1.5 * t], [x + w - t, y + hh + t / 2, t, hh - 1.5 * t], [x + t, y + h - t, w - 2 * t, t], [x, y + hh + t / 2, t, hh - 1.5 * t], [x, y + t, t, hh - 1.5 * t], [x + t, y + hh - t / 2, w - 2 * t, t]];
    segs.forEach((s, i) => { ctx.fillStyle = bits & (1 << i) ? on : off; ctx.fillRect(s[0], s[1], s[2], s[3]); });
  }
  // the pinball table's dot-matrix display: text rasterised once, drawn as dots
  const dotCache = new Map();
  function dotBits(str) {
    if (dotCache.has(str)) return dotCache.get(str);
    const c = document.createElement('canvas'), x = c.getContext('2d');
    x.font = `bold 11px ${FONT}`;
    const w = Math.ceil(x.measureText(str).width) + 2;
    c.width = w; c.height = 13;
    x.font = `bold 11px ${FONT}`; x.fillStyle = '#fff'; x.textBaseline = 'top'; x.fillText(str, 1, 1);
    const d = x.getImageData(0, 0, w, 13).data, bits = [];
    for (let j = 0; j < 13; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) bits.push(i, j);
    const r = { w, h: 13, bits };
    dotCache.set(str, r);
    return r;
  }
  function dotText(ctx, str, cx, cy, pitch, color) {
    const b = dotBits(str), x0 = cx - (b.w * pitch) / 2, y0 = cy - (b.h * pitch) / 2;
    ctx.fillStyle = color; ctx.beginPath();
    for (let i = 0; i < b.bits.length; i += 2) {
      const x = x0 + b.bits[i] * pitch, y = y0 + b.bits[i + 1] * pitch;
      ctx.moveTo(x + pitch * 0.4, y); ctx.arc(x, y, pitch * 0.4, 0, TAU);
    }
    ctx.fill();
  }
  // playing-card suits as paths, so they look the same on every system
  function suit(x, kind, cx, cy, s, color) {
    x.fillStyle = color; x.beginPath();
    if (kind === 'd') { x.moveTo(cx, cy - s); x.lineTo(cx + s * 0.72, cy); x.lineTo(cx, cy + s); x.lineTo(cx - s * 0.72, cy); x.closePath(); }
    else if (kind === 'h') {
      x.moveTo(cx, cy + s * 0.9);
      x.bezierCurveTo(cx - s * 1.35, cy - s * 0.1, cx - s * 0.55, cy - s * 1.1, cx, cy - s * 0.38);
      x.bezierCurveTo(cx + s * 0.55, cy - s * 1.1, cx + s * 1.35, cy - s * 0.1, cx, cy + s * 0.9);
    } else if (kind === 's') {
      x.moveTo(cx, cy - s * 0.95);
      x.bezierCurveTo(cx + s * 1.35, cy + s * 0.05, cx + s * 0.5, cy + s * 0.95, cx, cy + s * 0.3);
      x.bezierCurveTo(cx - s * 0.5, cy + s * 0.95, cx - s * 1.35, cy + s * 0.05, cx, cy - s * 0.95);
      x.moveTo(cx, cy + s * 0.2); x.lineTo(cx + s * 0.35, cy + s); x.lineTo(cx - s * 0.35, cy + s); x.closePath();
    } else {
      x.arc(cx, cy - s * 0.45, s * 0.42, 0, TAU); x.moveTo(cx, cy);
      x.arc(cx - s * 0.46, cy + s * 0.12, s * 0.42, 0, TAU); x.moveTo(cx, cy);
      x.arc(cx + s * 0.46, cy + s * 0.12, s * 0.42, 0, TAU);
      x.moveTo(cx, cy); x.lineTo(cx + s * 0.32, cy + s); x.lineTo(cx - s * 0.32, cy + s); x.closePath();
    }
    x.fill();
  }
  const RED = '#c8102e';
  function sprite(w, h, draw) {
    const s = 3, c = document.createElement('canvas');
    c.width = w * s; c.height = h * s;
    const x = c.getContext('2d');
    x.scale(s, s); draw(x, w, h);
    return c;
  }
  function cardBase(x, w, h) {
    rr(x, 1, 1, w - 2, h - 2, Math.min(8, w * 0.09));
    x.fillStyle = '#fff'; x.fill(); x.lineWidth = 1.5; x.strokeStyle = '#1b1b1b'; x.stroke();
  }
  function cardBack(x, w, h) {
    cardBase(x, w, h);
    const m = w * 0.08;
    rr(x, m, m, w - 2 * m, h - 2 * m, 4); x.fillStyle = '#1f55c9'; x.fill();
    x.save(); x.clip();
    x.strokeStyle = '#5b8def'; x.lineWidth = 1.2;
    for (let i = -h; i < w + h; i += 8) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + h, h); x.moveTo(i + h, 0); x.lineTo(i, h); x.stroke(); }
    x.restore();
    x.strokeStyle = '#fff'; x.lineWidth = 1.5; rr(x, m + 3, m + 3, w - 2 * m - 6, h - 2 * m - 6, 3); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(w / 2, h / 2 - w * 0.2); x.lineTo(w / 2 + w * 0.14, h / 2); x.lineTo(w / 2, h / 2 + w * 0.2); x.lineTo(w / 2 - w * 0.14, h / 2); x.closePath(); x.fill();
    x.fillStyle = '#1f55c9'; x.beginPath(); x.moveTo(w / 2, h / 2 - w * 0.1); x.lineTo(w / 2 + w * 0.07, h / 2); x.lineTo(w / 2, h / 2 + w * 0.1); x.lineTo(w / 2 - w * 0.07, h / 2); x.closePath(); x.fill();
  }
  function cornerIndex(x, w, h, label, kind, color) {
    for (const flip of [false, true]) {
      x.save();
      if (flip) { x.translate(w, h); x.rotate(Math.PI); }
      x.fillStyle = color; x.font = `bold ${Math.round(w * 0.17)}px ${FONT}`; x.textAlign = 'center'; x.textBaseline = 'top';
      x.fillText(label, w * 0.13, w * 0.07);
      suit(x, kind, w * 0.13, w * 0.34, w * 0.065, color);
      x.restore();
    }
  }
  let SPR = null;
  function sprites() {
    if (SPR) return SPR;
    SPR = {};
    SPR.back = sprite(96, 134, cardBack);
    SPR.small = sprite(34, 48, cardBack);
    SPR.king = sprite(96, 134, (x, w, h) => {
      cardBase(x, w, h);
      cornerIndex(x, w, h, 'K', 'h', RED);
      x.strokeStyle = RED; x.lineWidth = 1; x.strokeRect(20.5, 16.5, 55, 101);
      x.save(); x.beginPath(); x.rect(21, 17, 54, 100); x.clip();
      x.fillStyle = RED; x.beginPath(); x.moveTo(24, 118); x.lineTo(30, 76); x.lineTo(66, 76); x.lineTo(72, 118); x.closePath(); x.fill();
      x.fillStyle = '#1f55c9'; x.fillRect(42, 76, 12, 42);
      x.fillStyle = '#f7c948'; x.fillRect(40, 76, 2, 42); x.fillRect(54, 76, 2, 42); x.fillRect(28, 94, 40, 3);
      x.fillStyle = '#fff'; rr(x, 30, 70, 36, 10, 5); x.fill();
      x.fillStyle = '#111'; for (let i = 0; i < 5; i++) x.fillRect(33 + i * 7, 73, 2, 3);
      x.fillStyle = '#5a3a1a'; x.fillRect(34, 46, 6, 16); x.fillRect(56, 46, 6, 16);
      x.fillStyle = '#ffe0bd'; x.beginPath(); x.ellipse(48, 55, 12, 14, 0, 0, TAU); x.fill();
      x.fillStyle = '#e9e9e9'; x.beginPath(); x.moveTo(37, 60); x.quadraticCurveTo(48, 82, 59, 60); x.quadraticCurveTo(48, 66, 37, 60); x.fill();
      x.strokeStyle = '#bbb'; x.lineWidth = 1; x.stroke();
      x.fillStyle = '#f7c948'; x.beginPath(); x.moveTo(35, 44); x.lineTo(35, 30); x.lineTo(41, 37); x.lineTo(48, 27); x.lineTo(55, 37); x.lineTo(61, 30); x.lineTo(61, 44); x.closePath(); x.fill();
      x.strokeStyle = '#a07a12'; x.stroke();
      x.fillStyle = RED; dot(x, 48, 38, 2.2); x.fillStyle = '#1f55c9'; dot(x, 40, 40, 1.6); dot(x, 56, 40, 1.6);
      x.restore();
    });
    SPR.joker = sprite(96, 134, (x, w, h) => {
      cardBase(x, w, h);
      cornerIndex(x, w, h, 'J', 's', '#7b3fe4');
      const cols = ['#7b3fe4', '#1fb85a', '#e0301e'];
      [[-22, -4], [0, -12], [22, -4]].forEach(([dx, dy], i) => {
        x.fillStyle = cols[i]; x.beginPath(); x.moveTo(48 - 16 + i * 8, 58); x.quadraticCurveTo(48 + dx * 0.6, 40 + dy, 48 + dx, 30 + dy); x.quadraticCurveTo(48 + dx * 0.2, 48, 48 - 8 + i * 8 + 8, 58); x.closePath(); x.fill();
        x.fillStyle = '#f7c948'; dot(x, 48 + dx, 30 + dy, 3.4);
      });
      x.fillStyle = '#fff'; x.strokeStyle = '#1b1b1b'; x.lineWidth = 1.2;
      x.beginPath(); x.arc(48, 70, 17, 0, TAU); x.fill(); x.stroke();
      x.fillStyle = '#ff8fb8'; dot(x, 38, 75, 3.5); dot(x, 58, 75, 3.5);
      x.fillStyle = '#111'; dot(x, 42, 66, 2.3); dot(x, 54, 66, 2.3);
      x.strokeStyle = RED; x.lineWidth = 2.4; x.beginPath(); x.arc(48, 72, 9, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
      x.fillStyle = '#7b3fe4'; x.font = `bold 9px ${FONT}`; x.textAlign = 'center'; x.fillText('JOKER', 48, 104);
    });
    SPR.aces = ['s', 'h', 'c', 'd'].map((kind) => sprite(56, 78, (x, w, h) => {
      cardBase(x, w, h);
      const col = kind === 'h' || kind === 'd' ? RED : '#111';
      cornerIndex(x, w, h, 'A', kind, col);
      suit(x, kind, w / 2, h / 2, 12, col);
    }));
    return SPR;
  }
  function drawBumper(ctx, x, y, r, lit) {
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(x, y + r * 0.92, r * 0.9, r * 0.24, 0, 0, TAU); ctx.fill();
    ctx.fillStyle = lit ? '#fff7b0' : '#e0233c'; dot(ctx, x, y, r);
    ctx.fillStyle = lit ? '#fff' : '#fbeff0'; dot(ctx, x, y, r * 0.74);
    ctx.fillStyle = lit ? '#ffd23f' : '#2350d8'; dot(ctx, x, y, r * 0.5);
    ctx.fillStyle = '#fff'; ctx.beginPath();
    for (let j = 0; j < 10; j++) { const rr2 = j % 2 ? r * 0.12 : r * 0.3, b = (j * Math.PI) / 5 - Math.PI / 2; ctx.lineTo(x + Math.cos(b) * rr2, y + Math.sin(b) * rr2); }
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, r * 0.86, Math.PI * 1.1, Math.PI * 1.45); ctx.stroke();
  }
  // the pinball boss: a big bumper with chase lights and eyes that follow you
  function pinballFace(ctx, x, y, r, t, lookX, lookY, mouth, flash) {
    const cols = ['#ffd23f', '#ff5a3c', '#5bd6ff'];
    for (let i = 0; i < 14; i++) {
      const a = (i / 14) * TAU + t * 0.4, on = (Math.floor(t * 10) + i) % 3 === 0;
      ctx.fillStyle = on ? cols[i % 3] : 'rgba(255,255,255,.15)';
      dot(ctx, x + Math.cos(a) * (r + 13), y + Math.sin(a) * (r + 13), 4.5);
    }
    ctx.fillStyle = '#e0233c'; dot(ctx, x, y, r);
    ctx.fillStyle = '#fbeff0'; dot(ctx, x, y, r * 0.8);
    const g = ctx.createRadialGradient(x - r * 0.2, y - r * 0.3, r * 0.1, x, y, r * 0.66);
    g.addColorStop(0, '#5b8def'); g.addColorStop(1, '#1c3fae');
    ctx.fillStyle = g; dot(ctx, x, y, r * 0.66);
    const ang = Math.atan2(lookY - y, lookX - x);
    for (const sx of [-1, 1]) {
      const ex = x + sx * r * 0.28, ey = y - r * 0.12;
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(ex, ey, r * 0.17, r * 0.21, 0, 0, TAU); ctx.fill();
      ctx.fillStyle = '#0d1740'; dot(ctx, ex + Math.cos(ang) * r * 0.07, ey + Math.sin(ang) * r * 0.09, r * 0.09);
      ctx.strokeStyle = '#0d1740'; ctx.lineWidth = r * 0.07; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(ex - sx * r * 0.2, ey - r * 0.36); ctx.lineTo(ex + sx * r * 0.14, ey - r * 0.24); ctx.stroke();
    }
    ctx.fillStyle = '#0d1740'; rr(ctx, x - r * 0.3, y + r * 0.24, r * 0.6, r * 0.08 + mouth * r * 0.22, r * 0.05); ctx.fill();
    if (flash > 0) { ctx.globalAlpha = Math.min(1, flash * 7); ctx.fillStyle = '#fff'; dot(ctx, x, y, r); ctx.globalAlpha = 1; }
  }
  function drawFlipper(ctx, px, py, a, side, len) {
    const dir = side < 0 ? a : Math.PI - a, c = Math.cos(dir), s = Math.sin(dir);
    const tx = px + c * len, ty = py + s * len, nx = -s, ny = c;
    ctx.fillStyle = '#f2f4fb'; ctx.strokeStyle = '#e0233c'; ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(px + nx * 12, py + ny * 12); ctx.lineTo(tx + nx * 6, ty + ny * 6);
    ctx.arc(tx, ty, 6, Math.atan2(ny, nx), Math.atan2(-ny, -nx), side > 0);
    ctx.lineTo(px - nx * 12, py - ny * 12);
    ctx.arc(px, py, 12, Math.atan2(-ny, -nx), Math.atan2(ny, nx), side > 0);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#9aa4b8'; dot(ctx, px, py, 4);
  }
  function drawBall(ctx, x, y, r, charge) {
    if (charge > 0) { ctx.fillStyle = 'rgba(255,190,40,.45)'; dot(ctx, x, y, r * 1.7); }
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    g.addColorStop(0, '#ffffff'); g.addColorStop(0.35, charge > 0 ? '#ffe28a' : '#c9d0de'); g.addColorStop(1, charge > 0 ? '#c46a00' : '#3a4252');
    ctx.fillStyle = g; dot(ctx, x, y, r);
  }

  /* ---- weapons, pickups and the special's props ---- */
  // weapons are drawn from their grip at the origin, pointing along +x
  function drawKeyboard(ctx, s) {
    ctx.save(); ctx.scale(s, s);
    ctx.fillStyle = '#e6e3da'; ctx.strokeStyle = '#6d6a60'; ctx.lineWidth = 1.2;
    rr(ctx, -4, -8, 52, 16, 3); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#fbfaf6';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 10; c++) ctx.fillRect(-1 + c * 4.8 + (r === 1 ? 1.4 : 0), -6 + r * 4, 3.6, 3.1);
    ctx.fillRect(10, 5.4, 20, 1.6);
    ctx.fillStyle = '#1fb85a'; ctx.fillRect(42, -6.6, 2.4, 1.2);
    ctx.restore();
  }
  // the mouse hangs from its cable: ang is the cable's direction as it arrives
  function drawMouse(ctx, x, y, ang) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang - Math.PI / 2);
    ctx.fillStyle = '#f4f3ee'; ctx.strokeStyle = '#555'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.ellipse(0, 8, 6.5, 9, 0, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -1); ctx.lineTo(0, 7); ctx.moveTo(-6, 6); ctx.quadraticCurveTo(0, 8, 6, 6); ctx.stroke();
    ctx.fillStyle = '#888'; ctx.fillRect(-1, 2, 2, 3);
    ctx.restore();
  }
  function drawDisc(ctx, x, y, r, spin) {
    const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
    g.addColorStop(0, '#f2f2f7'); g.addColorStop(0.3, '#c9f0ff'); g.addColorStop(0.5, '#ffd6f5'); g.addColorStop(0.7, '#fff6c8'); g.addColorStop(1, '#c8c8d8');
    ctx.fillStyle = g; dot(ctx, x, y, r);
    ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = r * 0.18;
    ctx.beginPath(); ctx.arc(x, y, r * 0.66, spin, spin + 1.3); ctx.stroke();
    ctx.strokeStyle = '#8a8aa0'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#dcdce6'; dot(ctx, x, y, r * 0.3);
    ctx.fillStyle = '#555'; dot(ctx, x, y, r * 0.12);
  }
  function drawBucket(ctx, x, y, s, color) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = '#555'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.arc(0, -2, 7, Math.PI, 0); ctx.stroke();
    ctx.fillStyle = '#b8c0cf'; ctx.beginPath(); ctx.moveTo(-7, -2); ctx.lineTo(7, -2); ctx.lineTo(5.5, 11); ctx.lineTo(-5.5, 11); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = color; ctx.beginPath(); ctx.ellipse(0, -2, 7, 2.2, 0, 0, TAU); ctx.fill();
    ctx.fillRect(-4.6, -2, 2.4, 6.5); dot(ctx, -3.4, 4.6, 1.4);
    ctx.restore();
  }
  function drawMug(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 1.4;
    for (let i = 0; i < 2; i++) { const sx = -3 + i * 6, o = Math.sin(t * 4 + i) * 2; ctx.beginPath(); ctx.moveTo(sx, -10); ctx.quadraticCurveTo(sx + o + 2, -15, sx + o, -20); ctx.stroke(); }
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#555'; ctx.lineWidth = 1.2;
    rr(ctx, -7, -8, 14, 16, 2); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(8, 0, 4, -Math.PI / 2, Math.PI / 2); ctx.stroke();
    ctx.fillStyle = '#6b3e1f'; ctx.fillRect(-5.5, -6.5, 11, 3);
    ctx.fillStyle = '#e0301e'; dot(ctx, 0, 2.5, 2.4);
    ctx.restore();
  }
  // one pickup at rest, centred on x, y
  function drawItem(ctx, kind, x, y, t, color) {
    if (kind === 'keyboard') { ctx.save(); ctx.translate(x - 22, y); drawKeyboard(ctx, 1); ctx.restore(); }
    else if (kind === 'mouse') {
      ctx.strokeStyle = '#333'; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x - 16, y + 8); ctx.quadraticCurveTo(x - 12, y - 12, x - 1, y - 8); ctx.stroke();
      drawMouse(ctx, x, y - 9, Math.PI / 2 - 0.35);
    } else if (kind === 'cd') drawDisc(ctx, x, y, 12, t * 3);
    else if (kind === 'paint') drawBucket(ctx, x, y - 4, 1.3, color);
    else drawMug(ctx, x, y - 1, 1.2, t);
  }
  // weapons come down under Luna blue; the rare coffee under green
  function parachute(ctx, x, y, t, green) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(t * 3) * 0.12);
    ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-21, -38); ctx.lineTo(-5, -12); ctx.moveTo(21, -38); ctx.lineTo(5, -12); ctx.moveTo(0, -42); ctx.lineTo(0, -12); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-25, -38); ctx.quadraticCurveTo(0, -76, 25, -38); ctx.quadraticCurveTo(12, -45, 0, -41); ctx.quadraticCurveTo(-12, -45, -25, -38); ctx.closePath();
    const c = green ? '#1fb85a' : '#3c81f3', g = ctx.createLinearGradient(-25, 0, 25, 0);
    g.addColorStop(0, c); g.addColorStop(0.5, '#ffffff'); g.addColorStop(1, c);
    ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = green ? '#137a3a' : '#1e52b7'; ctx.stroke();
    ctx.restore();
  }
  // XP's notification balloon: cream, black hairline, round corners, its tail pointing down at the real taskbar
  /* ---- the game's tooltip family, all XP's own: balloons (notifications, with a stem to the tray), tooltips
     (a name, cream and square), chips (an announcement, drawn as a selected desktop label) and labels (numbers,
     white on a navy edge like title-bar text) ---- */
  // XP's balloon tip: cream, a black hairline, 7px corners and a soft shadow; its stem drops from the bottom edge,
  // 40 from the right, to whatever it points at (the tray, under the window)
  function balloon(ctx, x, y, w, h) {
    const r = 7, s0 = x + w - 64, s1 = x + w - 40;
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(s1, y + h); ctx.lineTo(s1, y + h + 22); ctx.lineTo(s0, y + h);
    ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r); ctx.closePath();
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,.3)'; ctx.shadowBlur = 7; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#ffffe1'; ctx.fill();
    ctx.restore();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.stroke();
  }
  // a whole notification: the balloon, its icon beside a bold title, and the text under the title. No close box:
  // a balloon on the canvas can't be clicked, and it goes by itself. Returns the height it took. icon(ctx, cx, cy)
  // draws a 16px icon
  function notice(ctx, x, y, w, title, text, icon) {
    ctx.font = `11px ${FONT}`;
    const lines = text ? wrapText(ctx, text, w - 50) : [], h = 32 + lines.length * 14;
    balloon(ctx, x, y, w, h);
    if (icon) icon(ctx, x + 18, y + 17);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic'; ctx.fillStyle = '#000';
    ctx.font = `bold 12px ${FONT}`; ctx.fillText(title, x + 32, y + 21);
    ctx.font = `11px ${FONT}`; lines.forEach((l, i) => ctx.fillText(l, x + 32, y + 38 + i * 14));
    return h;
  }
  // canvas chrome text never drops under 11 CSS px: when the stage is drawn smaller than 960 wide, balloons,
  // tooltips and chips grow by UI.f (set by Game.fit) so their text keeps its size on screen
  const UI = { f: 1 };
  function noticeH(ctx, w, text) { ctx.font = `11px ${FONT}`; return 32 + (text ? wrapText(ctx, text, w - 50).length : 0) * 14; }
  // XP's information icon: a blue disc with a white i
  function infoIcon(ctx, x, y) {
    const g = ctx.createRadialGradient(x - 3, y - 3, 1, x, y, 8);
    g.addColorStop(0, '#6aa8ff'); g.addColorStop(1, '#0046d5');
    ctx.fillStyle = g; dot(ctx, x, y, 8);
    ctx.fillStyle = '#fff'; ctx.fillRect(x - 1.5, y - 1.5, 3, 6.5); ctx.fillRect(x - 1.5, y - 5.5, 3, 2.5);
  }
  // the stickman's own little head: the tray icon, and the balloon's icon when he is the one talking
  function stickHead(ctx, x, y, r) {
    ctx.fillStyle = '#fff'; dot(ctx, x, y, r + 1.5);
    ctx.fillStyle = '#111'; dot(ctx, x, y, r);
    ctx.strokeStyle = '#e0301e'; ctx.lineWidth = Math.max(1.5, r * 0.4); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - r, y - r * 0.3); ctx.lineTo(x + r, y - r * 0.3); ctx.lineTo(x + r * 1.8, y + r * 0.2); ctx.stroke();
  }
  // an announcement ("Special ready", "12 hits", "Fight!"): white bold on Selection Blue inside XP's dotted focus
  // rectangle, the way a selected file name reads on the desktop. dim is XP's selection in a window that lost focus
  function chip(ctx, cx, cy, text, px, dim) {
    ctx.font = `bold ${px}px ${FONT}`;
    const w = Math.round(ctx.measureText(text).width + px * 1.1), h = Math.round(px * 1.55), x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    ctx.save();
    ctx.shadowColor = 'rgba(0,20,70,.45)'; ctx.shadowBlur = px * 0.5; ctx.shadowOffsetY = px * 0.15;
    ctx.fillStyle = dim ? '#ece9d8' : '#316ac5'; ctx.fillRect(x, y, w, h);
    ctx.restore();
    // one device pixel, whatever the chip's size or the stage's scale
    const m = ctx.getTransform ? ctx.getTransform() : null, u = m && m.a ? 1 / Math.hypot(m.a, m.b) : 1, i = 2.5 * u;
    ctx.setLineDash([u, u]); ctx.strokeStyle = dim ? 'rgba(0,0,0,.55)' : 'rgba(255,255,255,.9)'; ctx.lineWidth = u;
    ctx.strokeRect(x + i, y + i, w - 2 * i, h - 2 * i); ctx.setLineDash([]);
    ctx.fillStyle = dim ? '#000' : '#fff'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, cx, cy + px * 0.05);
  }
  // a desktop icon's name: white with a soft black shadow, or once selected, white on Selection Blue in the
  // dotted focus rectangle
  function deskLabel(ctx, cx, cy, text, px, selected) {
    ctx.font = `${px}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    if (selected) {
      const w = Math.round(ctx.measureText(text).width + 10), h = Math.round(px * 1.5), x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
      ctx.fillStyle = '#316ac5'; ctx.fillRect(x, y, w, h);
      ctx.setLineDash([1, 1]); ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); ctx.setLineDash([]);
      ctx.fillStyle = '#fff'; ctx.fillText(text, cx, cy + 0.5);
      return;
    }
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.9)'; ctx.shadowBlur = 2; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#fff'; ctx.fillText(text, cx, cy); ctx.restore();
  }
  // the title's three opponents as giant desktop icons; pointing and double-clicking reach 62 either side of
  // each, from 66 above its centre to 88 below
  const FOES = [{ x: 574, y: 258 }, { x: 712, y: 258 }, { x: 850, y: 258 }];
  // the Start menu's account picture: the stickman's head and shoulders on a pale sky, framed as XP framed them
  function drawAvatar(c) {
    if (c && c.getContext) avatar(c.getContext('2d'), 0, 0, c.width);
  }
  function avatar(x, ox, oy, size) {
    x.save(); x.translate(ox, oy); x.scale(size / 38, size / 38);
    x.beginPath(); x.rect(0, 0, 38, 38); x.clip();
    const g = x.createLinearGradient(0, 0, 0, 38); g.addColorStop(0, '#c6d3f7'); g.addColorStop(1, '#f3f6fd');
    x.fillStyle = g; x.fillRect(0, 0, 38, 38);
    x.strokeStyle = '#111'; x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = 3.4;
    x.beginPath(); x.moveTo(19, 24); x.lineTo(19, 40); x.moveTo(19, 30); x.lineTo(7, 40); x.moveTo(19, 30); x.lineTo(31, 40); x.stroke();
    x.fillStyle = '#111'; dot(x, 19, 16, 8.5);
    x.strokeStyle = '#e0301e'; x.lineWidth = 2.6;
    x.beginPath(); x.moveTo(10.5, 14); x.lineTo(27.5, 14); x.stroke();
    x.beginPath(); x.moveTo(27, 14.5); x.lineTo(32, 12); x.lineTo(35, 15.5); x.stroke();
    x.fillStyle = '#fff'; x.beginPath(); x.ellipse(22.8, 16.8, 1.3, 1.9, 0, 0, TAU); x.fill();
    x.restore();
  }
  // an achievement medal: a Luna-blue ribbon over a gold disc with a star
  function medal(ctx, x, y) {
    ctx.save(); ctx.translate(x, y);
    ctx.fillStyle = '#1f55c9'; ctx.beginPath(); ctx.moveTo(-9, -14); ctx.lineTo(-2, -14); ctx.lineTo(3, -2); ctx.lineTo(-4, -2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#3c81f3'; ctx.beginPath(); ctx.moveTo(9, -14); ctx.lineTo(2, -14); ctx.lineTo(-3, -2); ctx.lineTo(4, -2); ctx.closePath(); ctx.fill();
    const g = ctx.createRadialGradient(-3, 3, 1, 0, 6, 10);
    g.addColorStop(0, '#fff3b0'); g.addColorStop(0.6, '#ffc83c'); g.addColorStop(1, '#d99a12');
    ctx.fillStyle = g; dot(ctx, 0, 6, 9);
    ctx.strokeStyle = '#a8740a'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(0, 6, 9, 0, TAU); ctx.stroke();
    ctx.fillStyle = '#fff8d6'; ctx.beginPath();
    for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.2 : 5, a = -Math.PI / 2 + (i * Math.PI) / 5; ctx.lineTo(Math.cos(a) * r, 6 + Math.sin(a) * r); }
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function wrapText(ctx, text, maxW) {
    const out = [];
    let line = '';
    for (const word of text.split(' ')) {
      const t = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(t).width > maxW) { out.push(line); line = word; } else line = t;
    }
    if (line) out.push(line);
    return out;
  }
  // an XP tooltip: cream, a black hairline, square corners and the menu's soft shadow
  // maxW: longer text wraps to lines of at most that width, as XP's multiline tooltips did
  function tag(ctx, x, y, text, maxW) {
    const f = UI.f;
    ctx.font = `11px ${FONT}`;
    const lines = maxW ? wrapText(ctx, text, maxW) : [text];
    const w = Math.round(Math.max(...lines.map((l) => ctx.measureText(l).width)) + 10), h = 4 + lines.length * 13;
    const l = clamp(x - (w * f) / 2, 6, W - w * f - 6);
    ctx.save(); ctx.translate(l, y); ctx.scale(f, f);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.28)'; ctx.shadowBlur = 5; ctx.shadowOffsetX = 2; ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#ffffe1'; ctx.fillRect(0.5, 0.5, w, h);
    ctx.restore();
    ctx.strokeStyle = '#000'; ctx.lineWidth = 1; ctx.strokeRect(0.5, 0.5, w, h);
    ctx.fillStyle = '#000'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    lines.forEach((ln, i) => ctx.fillText(ln, w / 2 + 0.5, 9 + i * 13));
    ctx.restore();
  }
  function keycap(ctx, x, y, w, label, s = 1) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(ctx, -w / 2 + 1, -11, w, 28, 5); ctx.fill();
    const g = ctx.createLinearGradient(0, -14, 0, 14); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d9d6cc');
    ctx.fillStyle = g; ctx.strokeStyle = '#6d6a60'; ctx.lineWidth = 1.2; rr(ctx, -w / 2, -14, w, 28, 5); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#222'; ctx.font = `bold 13px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(label, 0, 1);
    ctx.restore();
  }
  // a Luna window drawn on the canvas: the frame of the final boss's message box
  function lunaWin(ctx, x, y, w, h, title) {
    ctx.fillStyle = 'rgba(0,20,70,.4)'; rr(ctx, x + 4, y + 8, w, h, 8); ctx.fill();
    ctx.fillStyle = '#0831d9';
    ctx.beginPath(); ctx.moveTo(x, y + h); ctx.lineTo(x, y + 8); ctx.arcTo(x, y, x + 8, y, 8); ctx.lineTo(x + w - 8, y); ctx.arcTo(x + w, y, x + w, y + 8, 8); ctx.lineTo(x + w, y + h); ctx.closePath(); ctx.fill();
    const g = ctx.createLinearGradient(0, y, 0, y + 28);
    g.addColorStop(0, '#0997ff'); g.addColorStop(0.08, '#0053ee'); g.addColorStop(0.4, '#0050ee'); g.addColorStop(0.88, '#0066ff'); g.addColorStop(0.95, '#005bff'); g.addColorStop(1, '#003dd7');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(x + 1, y + 28); ctx.lineTo(x + 1, y + 8); ctx.arcTo(x + 1, y + 1, x + 8, y + 1, 7); ctx.lineTo(x + w - 8, y + 1); ctx.arcTo(x + w - 1, y + 1, x + w - 1, y + 8, 7); ctx.lineTo(x + w - 1, y + 28); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ece9d8'; ctx.fillRect(x + 3, y + 28, w - 6, h - 31);
    ctx.fillStyle = '#fff'; ctx.fillRect(x + 8, y + 8, 14, 11); ctx.fillStyle = '#1f55c9'; ctx.fillRect(x + 9.5, y + 9.5, 11, 6);
    ctx.font = `bold 12px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = '#0f1089'; ctx.fillText(title, x + 29, y + 15.5);
    ctx.fillStyle = '#fff'; ctx.fillText(title, x + 28, y + 14.5);
    const cx = x + w - 25, cy = y + 4;
    const cg = ctx.createRadialGradient(cx + 18, cy + 18, 2, cx + 10, cy + 10, 16);
    cg.addColorStop(0, '#cc4600'); cg.addColorStop(0.55, '#dc6527'); cg.addColorStop(0.9, '#ffccb2');
    ctx.fillStyle = cg; rr(ctx, cx, cy, 21, 21, 3); ctx.fill(); ctx.strokeStyle = '#fff'; ctx.lineWidth = 1; ctx.stroke();
    ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx + 6, cy + 6); ctx.lineTo(cx + 15, cy + 15); ctx.moveTo(cx + 15, cy + 6); ctx.lineTo(cx + 6, cy + 15); ctx.stroke();
  }
  // XP's critical-stop icon: a red disc with a white X
  function errorIcon(ctx, x, y, r) {
    const g = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
    g.addColorStop(0, '#ff9a8a'); g.addColorStop(0.55, '#e0301e'); g.addColorStop(1, '#a3150b');
    ctx.fillStyle = g; dot(ctx, x, y, r);
    ctx.strokeStyle = '#7a0d05'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r, 0, TAU); ctx.stroke();
    const k = r * 0.4;
    ctx.strokeStyle = '#fff'; ctx.lineWidth = Math.max(2, r * 0.26); ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(x - k, y - k); ctx.lineTo(x + k, y + k); ctx.moveTo(x + k, y - k); ctx.lineTo(x - k, y + k); ctx.stroke();
  }
  // a small Luna message box drawn from its centre: the error pop-ups of the final boss
  function miniWin(ctx, cx, cy, w, h) {
    const x = cx - w / 2, y = cy - h / 2;
    ctx.fillStyle = 'rgba(0,20,70,.35)'; rr(ctx, x + 2, y + 4, w, h, 4); ctx.fill();
    ctx.fillStyle = '#0831d9'; rr(ctx, x, y, w, h, 4); ctx.fill();
    const g = ctx.createLinearGradient(0, y, 0, y + 14);
    g.addColorStop(0, '#0997ff'); g.addColorStop(0.2, '#0053ee'); g.addColorStop(1, '#0066ff');
    ctx.fillStyle = g; ctx.fillRect(x + 1, y + 1, w - 2, 13);
    ctx.fillStyle = '#ece9d8'; ctx.fillRect(x + 2, y + 14, w - 4, h - 16);
    ctx.fillStyle = '#dc6527'; rr(ctx, x + w - 13, y + 2, 11, 10, 2); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.4; ctx.lineCap = 'butt';
    ctx.beginPath(); ctx.moveTo(x + w - 10, y + 4.5); ctx.lineTo(x + w - 5, y + 9.5); ctx.moveTo(x + w - 5, y + 4.5); ctx.lineTo(x + w - 10, y + 9.5); ctx.stroke();
    errorIcon(ctx, x + 15, y + 29, 8);
    ctx.fillStyle = '#8f8b7a'; ctx.fillRect(x + 28, y + 23, w - 38, 3); ctx.fillRect(x + 28, y + 30, w - 50, 3);
    ctx.fillStyle = '#f4f3ee'; ctx.strokeStyle = '#003c74'; ctx.lineWidth = 1; rr(ctx, x + w / 2 - 14, y + h - 15, 28, 11, 2); ctx.fill(); ctx.stroke();
  }
  // the final boss itself: a whole XP error message box, drawn from its centre. o: title, text, bsod (the
  // client area crashed to white-on-blue), ghost (Not Responding white-out), ok (the button's state), flash
  function errorBox(ctx, cx, cy, w, h, o) {
    const x = cx - w / 2, y = cy - h / 2;
    lunaWin(ctx, x, y, w, h, o.title);
    if (o.bsod) { ctx.fillStyle = '#0000aa'; ctx.fillRect(x + 3, y + 28, w - 6, h - 31); }
    errorIcon(ctx, x + 30, y + 58, 16);
    ctx.fillStyle = o.bsod ? '#fff' : '#000'; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ctx.font = o.bsod ? `12px ${MONO}` : `11px ${FONT}`;
    wrapText(ctx, o.text, w - 70).slice(0, 3).forEach((l, i) => ctx.fillText(l, x + 56, y + 50 + i * 14));
    pushButton(ctx, x + w - 72, y + h - 30, 60, 22, 'OK', o.ok);
    if (o.ghost > 0.01) { ctx.fillStyle = `rgba(255,255,255,${o.ghost})`; ctx.fillRect(x, y, w, h); }
    if (o.flash > 0) { ctx.globalAlpha = Math.min(0.8, o.flash * 7); ctx.fillStyle = '#fff'; ctx.fillRect(x, y, w, h); ctx.globalAlpha = 1; }
  }
  // XP's busy cursor
  function hourglass(ctx, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(-9, -14); ctx.lineTo(9, -14); ctx.lineTo(9, -11); ctx.lineTo(2, -1); ctx.lineTo(2, 1); ctx.lineTo(9, 11); ctx.lineTo(9, 14); ctx.lineTo(-9, 14); ctx.lineTo(-9, 11); ctx.lineTo(-2, 1); ctx.lineTo(-2, -1); ctx.lineTo(-9, -11); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#d8a93a';
    ctx.beginPath(); ctx.moveTo(-5, -10); ctx.lineTo(5, -10); ctx.lineTo(0, -3); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-6, 12); ctx.lineTo(6, 12); ctx.lineTo(0, 6); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  // an XP push button: 'def' (the default ring), 'hot' (orange glow) or 'down'
  function pushButton(ctx, x, y, w, h, label, state) {
    const g = ctx.createLinearGradient(0, y, 0, y + h);
    if (state === 'down') { g.addColorStop(0, '#cdcac3'); g.addColorStop(1, '#f2f2f1'); }
    else { g.addColorStop(0, '#ffffff'); g.addColorStop(0.86, '#ecebe6'); g.addColorStop(1, '#d6d0c5'); }
    ctx.fillStyle = g; rr(ctx, x, y, w, h, 3); ctx.fill();
    ctx.strokeStyle = '#003c74'; ctx.lineWidth = 1; rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 3); ctx.stroke();
    if (state !== 'down') { ctx.strokeStyle = state === 'hot' ? '#e5a01a' : '#98b8ea'; ctx.lineWidth = 2; rr(ctx, x + 2, y + 2, w - 4, h - 4, 2); ctx.stroke(); }
    ctx.fillStyle = '#000'; ctx.font = `11px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(label, x + w / 2, y + h / 2 + (state === 'down' ? 1 : 0));
  }
  function bolt(ctx, pts, a) {
    ctx.save(); ctx.globalAlpha = Math.max(0, a); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const [w, c] of [[18, 'rgba(60,130,255,.35)'], [8, 'rgba(160,205,255,.85)'], [3, '#fff']]) {
      ctx.strokeStyle = c; ctx.lineWidth = w;
      ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
    }
    ctx.restore();
  }

  /* ------------------------------------------------------------ arena backgrounds (drawn once per size) */
  // the XP taskbar both desktops stand on: the title's (its start button down under the open Start menu, its
  // label drawn per frame in the visitor's language) and the final boss's (always 'start', as XP shipped it)
  function taskbar(ctx, down, label) {
    const tb = ctx.createLinearGradient(0, FLOOR, 0, H);
    tb.addColorStop(0, '#3168d5'); tb.addColorStop(0.08, '#4993e6'); tb.addColorStop(0.2, '#2157d7'); tb.addColorStop(0.9, '#2663e0'); tb.addColorStop(1, '#1941a5');
    ctx.fillStyle = tb; ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(0, FLOOR, W, 2);
    const sb = ctx.createLinearGradient(0, FLOOR + 6, 0, H - 6);
    if (down) { sb.addColorStop(0, '#2f7a28'); sb.addColorStop(0.5, '#237a23'); sb.addColorStop(1, '#3c8f33'); }
    else { sb.addColorStop(0, '#5eac56'); sb.addColorStop(0.5, '#3c8f33'); sb.addColorStop(1, '#2f7a28'); }
    ctx.fillStyle = sb; ctx.beginPath(); ctx.moveTo(0, FLOOR + 6); ctx.lineTo(118, FLOOR + 6); ctx.quadraticCurveTo(146, (FLOOR + H) / 2, 118, H - 6); ctx.lineTo(0, H - 6); ctx.closePath(); ctx.fill();
    // pressed, the pill sinks under a soft inner shadow
    if (down) { ctx.save(); ctx.clip(); ctx.shadowColor = 'rgba(0,0,0,.45)'; ctx.shadowBlur = 8; ctx.shadowOffsetY = 3; ctx.strokeStyle = 'rgba(0,0,0,.5)'; ctx.lineWidth = 6; ctx.stroke(); ctx.restore(); }
    if (label) startLabel(ctx, label, down);
    const tray = ctx.createLinearGradient(0, FLOOR, 0, H);
    tray.addColorStop(0, '#0c59b9'); tray.addColorStop(0.1, '#18b5f2'); tray.addColorStop(0.2, '#0f9deb'); tray.addColorStop(1, '#095bc9');
    ctx.fillStyle = tray; ctx.fillRect(W - 150, FLOOR + 2, 150, H - FLOOR - 2);
    ctx.fillStyle = '#1042af'; ctx.fillRect(W - 151, FLOOR + 2, 1, H - FLOOR - 2);
  }
  function startLabel(ctx, label, down) {
    const y = (FLOOR + H) / 2 + (down ? 2 : 1);
    ctx.font = `italic bold 22px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillText(label, 35, y + 1);
    ctx.fillStyle = '#fff'; ctx.fillText(label, 34, y);
  }
  const ARENA = {
    // the title: the desktop the three games live on, lit where they stand, darker toward its edges
    title(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, FLOOR);
      g.addColorStop(0, '#2a5fbf'); g.addColorStop(0.6, '#3b73d1'); g.addColorStop(1, '#5a8fe0');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, FLOOR);
      const light = ctx.createRadialGradient(712, 250, 20, 712, 250, 380);
      light.addColorStop(0, 'rgba(255,255,255,.28)'); light.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = light; ctx.fillRect(0, 0, W, FLOOR);
      const edge = ctx.createRadialGradient(W / 2, FLOOR / 2, 250, W / 2, FLOOR / 2, 640);
      edge.addColorStop(0, 'rgba(0,20,70,0)'); edge.addColorStop(1, 'rgba(0,20,70,.32)');
      ctx.fillStyle = edge; ctx.fillRect(0, 0, W, FLOOR);
      taskbar(ctx, true);
    },
    mines(ctx) {
      ctx.fillStyle = '#b5b5b5'; ctx.fillRect(0, 0, W, H);
      const rnd = seeded(11);
      for (let r = 0; r < 15; r++) {
        for (let c = 0; c < 30; c++) {
          const x = c * 32, y = r * 32 - 4;
          if (y > FLOOR) continue;
          if (r > 1 && rnd() < 0.08) {
            ctx.fillStyle = '#b0b0b0'; ctx.fillRect(x, y, 32, 32);
            ctx.strokeStyle = '#9d9d9d'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, 31, 31);
            const n = 1 + Math.floor(rnd() * 3);
            if (rnd() < 0.6) { ctx.globalAlpha = 0.2; ctx.fillStyle = NUMC[n]; ctx.font = `bold 20px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n, x + 16, y + 17); ctx.globalAlpha = 1; }
          } else {
            bevel(ctx, x, y, 32, 32, 3, '#d3d3d3', '#9b9b9b', '#bdbdbd');
            if (rnd() < 0.012) { ctx.globalAlpha = 0.3; flagIcon(ctx, x + 17, y + 27, 0.8); ctx.globalAlpha = 1; }
          }
        }
      }
      const v = ctx.createRadialGradient(W / 2, H / 2, 200, W / 2, H / 2, 620);
      v.addColorStop(0, 'rgba(40,40,60,0)'); v.addColorStop(1, 'rgba(40,40,60,.35)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#8a8a8a'; ctx.fillRect(0, FLOOR + 32, W, H - FLOOR - 32);
      for (let c = 0; c < 30; c++) bevel(ctx, c * 32, FLOOR + 32, 32, 32, 3, '#a9a9a9', '#6e6e6e', '#8f8f8f');
    },
    cards(ctx) {
      const g = ctx.createRadialGradient(W / 2, 250, 60, W / 2, 250, 700);
      g.addColorStop(0, '#1d9a48'); g.addColorStop(0.55, '#0f7a33'); g.addColorStop(1, '#064f1d');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const rnd = seeded(5);
      for (let i = 0; i < 1600; i++) { ctx.fillStyle = rnd() < 0.5 ? 'rgba(0,0,0,.06)' : 'rgba(255,255,255,.04)'; ctx.fillRect(rnd() * W, rnd() * H, 1.5, 1.5); }
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        rr(ctx, 546 + i * 80, 66, 56, 78, 6); ctx.stroke();
        ctx.globalAlpha = 0.25; suit(ctx, ['s', 'h', 'c', 'd'][i], 574 + i * 80, 105, 11, '#fff'); ctx.globalAlpha = 1;
      }
      const spr = sprites();
      for (let i = 0; i < 3; i++) ctx.drawImage(spr.back, 40 + i * 2, 66 - i * 2, 56, 78);
      ctx.fillStyle = '#054019'; ctx.fillRect(0, FLOOR, W, H - FLOOR);
      ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(0, FLOOR, W, 2);
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, FLOOR + 2, W, 6);
    },
    pinball(ctx) {
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, '#060b24'); g.addColorStop(0.55, '#10265e'); g.addColorStop(1, '#0a1433');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const neb = ctx.createRadialGradient(760, 170, 20, 760, 170, 300);
      neb.addColorStop(0, 'rgba(140,90,230,.25)'); neb.addColorStop(1, 'rgba(140,90,230,0)');
      ctx.fillStyle = neb; ctx.fillRect(0, 0, W, H);
      const rnd = seeded(3);
      for (let i = 0; i < 120; i++) { ctx.fillStyle = `rgba(255,255,255,${0.25 + rnd() * 0.7})`; dot(ctx, rnd() * W, rnd() * FLOOR, 0.5 + rnd() * 1.2); }
      const pl = ctx.createRadialGradient(90, 560, 40, 130, 600, 330);
      pl.addColorStop(0, 'rgba(90,130,255,.55)'); pl.addColorStop(0.7, 'rgba(40,60,160,.35)'); pl.addColorStop(1, 'rgba(40,60,160,0)');
      ctx.fillStyle = pl; ctx.fillRect(0, 200, 520, H - 200);
      ctx.strokeStyle = 'rgba(160,190,255,.3)'; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(130, 470, 330, 60, -0.18, Math.PI * 1.02, Math.PI * 1.98); ctx.stroke();
      ctx.save();
      ctx.shadowColor = 'rgba(120,160,255,.9)'; ctx.shadowBlur = 10;
      ctx.strokeStyle = '#9fb6ff'; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(LEFT, FLOOR); ctx.lineTo(LEFT, 300); ctx.quadraticCurveTo(LEFT, 62, 260, 60); ctx.lineTo(700, 60); ctx.quadraticCurveTo(RIGHT, 62, RIGHT, 300); ctx.lineTo(RIGHT, FLOOR); ctx.stroke();
      ctx.restore();
      for (let i = 0; i < 5; i++) { ctx.fillStyle = '#9fb6ff'; rr(ctx, 356 + i * 62, 70, 6, 30, 3); ctx.fill(); }
      ctx.fillStyle = 'rgba(255,140,40,.3)';
      for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) {
        const cx = sx < 0 ? 96 : W - 96, cy = 330 - i * 34;
        ctx.beginPath(); ctx.moveTo(cx - 14, cy + 8); ctx.lineTo(cx, cy - 6); ctx.lineTo(cx + 14, cy + 8); ctx.lineTo(cx + 14, cy + 14); ctx.lineTo(cx, cy); ctx.lineTo(cx - 14, cy + 14); ctx.closePath(); ctx.fill();
      }
      const ap = ctx.createLinearGradient(0, FLOOR, 0, H);
      ap.addColorStop(0, '#2a3156'); ap.addColorStop(1, '#11152b');
      ctx.fillStyle = ap; ctx.fillRect(0, FLOOR, W, H - FLOOR);
      ctx.fillStyle = 'rgba(159,182,255,.7)'; ctx.fillRect(0, FLOOR, W, 2);
      ctx.fillStyle = '#0b0602'; rr(ctx, W / 2 - 158, FLOOR + 10, 316, 50, 4); ctx.fill();
      ctx.strokeStyle = '#3a2a1a'; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = '#2a1506';
      for (let y = FLOOR + 15; y < FLOOR + 57; y += 3) for (let x = W / 2 - 154; x < W / 2 + 155; x += 3) ctx.fillRect(x - 0.6, y - 0.6, 1.2, 1.2);
    },
  };
  // the final boss's desktop: Luna blue, the three uninstalled games greyed on the left, the taskbar for a floor
  ARENA.desktop = (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, FLOOR);
    g.addColorStop(0, '#2a5fbf'); g.addColorStop(0.6, '#3b73d1'); g.addColorStop(1, '#5a8fe0');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, FLOOR);
    const light = ctx.createRadialGradient(240, 40, 10, 240, 40, 560);
    light.addColorStop(0, 'rgba(255,255,255,.2)'); light.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = light; ctx.fillRect(0, 0, W, FLOOR);
    ctx.globalAlpha = 0.3;
    smileyButton(ctx, 60, 76, 40, 'dead', false);
    ctx.drawImage(sprites().back, 44, 128, 32, 46);
    pinballFace(ctx, 60, 222, 18, 0, 60, 260, 0, 0);
    ctx.globalAlpha = 1;
    taskbar(ctx, false, 'start');
  };
  // halfway through, the classic stop screen; its text stays English, as XP's always did
  ARENA.bsod = (ctx) => {
    ctx.fillStyle = '#0000aa'; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.font = `15px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    ['A problem has been detected and Stickman.exe has been shut down to prevent', 'damage to your portfolio.', '', 'TOO_MANY_BUILT_IN_GAMES_UNINSTALLED', '',
      'If this is the first time you have seen this stop error screen,', 'restart your stickman. If this screen appears again, keep fighting.', '',
      'Technical information:', '', '*** STOP: 0x0000B055 (0x00000003, 0x0000000D, 0x00000000, 0x00000042)']
      .forEach((l, i) => ctx.fillText(l, 24, 40 + i * 22));
    ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.fillRect(0, FLOOR, W, 2);
    ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = `14px ${MONO}`; ctx.fillText('Beginning dump of physical memory', 24, FLOOR + 26);
  };
  // practice looks like XP Setup: Luna blue, dark bands top and bottom, a column for the list of steps
  ARENA.practice = (ctx) => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#2d62cf'); g.addColorStop(0.55, '#3d75dc'); g.addColorStop(1, '#2d62cf');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const glow = ctx.createRadialGradient(620, 240, 20, 620, 240, 460);
    glow.addColorStop(0, 'rgba(255,255,255,.16)'); glow.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = glow; ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = '#0c2f8e'; ctx.fillRect(0, 0, W, 72);
    const rule = ctx.createLinearGradient(0, 0, W, 0);
    rule.addColorStop(0, 'rgba(232,148,58,0)'); rule.addColorStop(0.3, '#e8943a'); rule.addColorStop(0.7, '#e8943a'); rule.addColorStop(1, 'rgba(232,148,58,0)');
    ctx.fillStyle = rule; ctx.fillRect(0, 72, W, 2);
    ctx.fillStyle = 'rgba(8,30,110,.42)'; rr(ctx, 18, 88, 214, 364, 10); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1; rr(ctx, 18.5, 88.5, 213, 363, 10); ctx.stroke();
    ctx.fillStyle = '#0c2f8e'; ctx.fillRect(0, FLOOR, W, H - FLOOR);
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(0, FLOOR, W, 2);
  };
  function paintArena(name, k) {
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(W * k)); c.height = Math.max(1, Math.round(H * k));
    const x = c.getContext('2d');
    x.scale(c.width / W, c.height / H);
    ARENA[name](x);
    return c;
  }

  /* ------------------------------------------------------------ the result card */
  // A picture of a win to post anywhere, at the size link previews use (1200 × 630: drawn at half that and
  // doubled). It is the title's Start menu once the fight is won: the player's name for the account, the result
  // as its programs, the four bosses it uninstalled as its places, and a footer saying where to play; beside it
  // the stickman celebrates on the emptied desktop.
  // d: grade, time, hits, perfect, name ('' until it is on the board), pos ({ rank, total } or null), host,
  // owner, clock
  const CARD = { w: 600, h: 315, k: 2, bar: 30 };
  const GRADE_INK = { S: ['#f7c948', '#000'], A: ['#11703a', '#fff'], B: ['#0046d5', '#fff'], C: ['#5b5f6b', '#fff'] };
  // the text's size shrinks, down to min, until it fits in maxW; the font is left set on ctx
  function fitFont(ctx, text, style, size, min, maxW) {
    let n = size;
    for (;;) { ctx.font = `${style}${n}px ${FONT}`; if (n <= min || ctx.measureText(text).width <= maxW) return n; n -= 0.5; }
  }
  // a long address breaks after its dots, slashes and dashes
  function splitUrl(ctx, url, maxW) {
    const out = [''];
    for (const part of url.match(/[^./-]+[./-]*/g) || [url]) {
      const t = out[out.length - 1] + part;
      if (out[out.length - 1] && ctx.measureText(t).width > maxW) out.push(part); else out[out.length - 1] = t;
    }
    return out;
  }
  function drawCard(ctx, d, s) {
    const CW = CARD.w, CH = CARD.h, bar = CARD.bar, floor = CH - bar;
    ctx.textBaseline = 'alphabetic'; ctx.textAlign = 'left';
    // the emptied desktop, lit from the top right, the game's name on it as wallpaper type
    const sky = ctx.createLinearGradient(0, 0, 0, floor);
    sky.addColorStop(0, '#2a5fbf'); sky.addColorStop(0.6, '#3b73d1'); sky.addColorStop(1, '#5a8fe0');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, CW, floor);
    const light = ctx.createRadialGradient(470, 40, 10, 470, 40, 320);
    light.addColorStop(0, 'rgba(255,255,255,.26)'); light.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = light; ctx.fillRect(0, 0, CW, floor);
    fitFont(ctx, 'BOSS RUSH XP', 'bold ', 24, 16, 236);
    ctx.save(); ctx.shadowColor = 'rgba(0,20,70,.5)'; ctx.shadowBlur = 6; ctx.shadowOffsetY = 2;
    ctx.fillStyle = '#fff'; ctx.fillText('BOSS RUSH XP', 348, 52);
    ctx.restore();
    const rule = ctx.createLinearGradient(348, 0, 540, 0);
    rule.addColorStop(0, '#e8943a'); rule.addColorStop(1, 'rgba(232,148,58,0)');
    ctx.fillStyle = rule; ctx.fillRect(348, 60, 192, 2);
    if (d.owner) { const o = s.cardOwner(d.owner); ctx.fillStyle = 'rgba(255,255,255,.9)'; fitFont(ctx, o, '', 11, 9, 236); ctx.fillText(o, 349, 78); }

    // the taskbar: start down under its open menu, the game's task, the tray with the stickman's icon and the clock
    const tb = ctx.createLinearGradient(0, floor, 0, CH);
    tb.addColorStop(0, '#3168d5'); tb.addColorStop(0.08, '#4993e6'); tb.addColorStop(0.2, '#2157d7'); tb.addColorStop(0.9, '#2663e0'); tb.addColorStop(1, '#1941a5');
    ctx.fillStyle = tb; ctx.fillRect(0, floor, CW, bar);
    ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(0, floor, CW, 1);
    const sb = ctx.createLinearGradient(0, floor + 1, 0, CH);
    sb.addColorStop(0, '#2f7a28'); sb.addColorStop(0.5, '#237a23'); sb.addColorStop(1, '#3c8f33');
    ctx.fillStyle = sb; ctx.beginPath(); ctx.moveTo(0, floor + 1); ctx.lineTo(66, floor + 1); ctx.quadraticCurveTo(84, floor + bar / 2, 66, CH); ctx.lineTo(0, CH); ctx.closePath(); ctx.fill();
    const start = s.start.toLowerCase();
    ctx.textBaseline = 'middle'; ctx.font = `italic bold 15px ${FONT}`;
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillText(start, 15, floor + bar / 2 + 2);
    ctx.fillStyle = '#fff'; ctx.fillText(start, 14, floor + bar / 2 + 1);
    ctx.fillStyle = '#1e52b7'; rr(ctx, 86, floor + 4, 124, bar - 7, 3); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 1; rr(ctx, 86.5, floor + 4.5, 123, bar - 8, 3); ctx.stroke();
    ctx.save(); ctx.translate(99, floor + bar / 2 - 0.5); ctx.scale(0.5, 0.5); medal(ctx, 0, -1); ctx.restore();
    ctx.fillStyle = '#fff'; ctx.font = `bold 11px ${FONT}`; ctx.fillText('Boss Rush XP', 111, floor + bar / 2 + 0.5);
    const tray = ctx.createLinearGradient(0, floor, 0, CH);
    tray.addColorStop(0, '#0c59b9'); tray.addColorStop(0.1, '#18b5f2'); tray.addColorStop(0.2, '#0f9deb'); tray.addColorStop(1, '#095bc9');
    ctx.fillStyle = tray; ctx.fillRect(512, floor + 1, CW - 512, bar - 1);
    ctx.fillStyle = '#1042af'; ctx.fillRect(511, floor + 1, 1, bar - 1);
    stickHead(ctx, 530, floor + bar / 2, 5);
    ctx.textAlign = 'right'; ctx.fillStyle = '#fff'; ctx.font = `11px ${FONT}`; ctx.fillText(d.clock, CW - 9, floor + bar / 2 + 0.5);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';

    // the Start menu, standing on the taskbar
    const mx = 14, my = 18, mw = 316, mb = floor, col = 178, fh = 33;
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,40,.45)'; ctx.shadowBlur = 10; ctx.shadowOffsetX = 3; ctx.shadowOffsetY = 3;
    ctx.fillStyle = '#0f4fc6'; ctx.beginPath(); ctx.moveTo(mx - 1, mb); ctx.lineTo(mx - 1, my + 7); ctx.arcTo(mx - 1, my - 1, mx + 7, my - 1, 8); ctx.lineTo(mx + mw - 7, my - 1); ctx.arcTo(mx + mw + 1, my - 1, mx + mw + 1, my + 7, 8); ctx.lineTo(mx + mw + 1, mb); ctx.closePath(); ctx.fill();
    ctx.restore();
    // its header: the account picture and the player's name
    const hg = ctx.createLinearGradient(0, my, 0, my + 50);
    [[0, '#1868ce'], [0.12, '#0e60cb'], [0.32, '#1164cf'], [0.47, '#1b6cd3'], [0.6, '#2476dc'], [0.77, '#3482e3'], [0.9, '#428ee9'], [1, '#4791eb']].forEach(([k, c]) => hg.addColorStop(k, c));
    ctx.fillStyle = hg; ctx.beginPath(); ctx.moveTo(mx, my + 50); ctx.lineTo(mx, my + 7); ctx.arcTo(mx, my, mx + 7, my, 7); ctx.lineTo(mx + mw - 7, my); ctx.arcTo(mx + mw, my, mx + mw, my + 7, 7); ctx.lineTo(mx + mw, my + 50); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.shadowColor = 'rgba(0,0,40,.45)'; ctx.shadowBlur = 2; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#d8e4f8'; ctx.fillRect(mx + 9, my + 7, 38, 38);
    ctx.restore();
    avatar(ctx, mx + 10, my + 8, 36);
    ctx.save(); ctx.shadowColor = 'rgba(0,0,40,.55)'; ctx.shadowBlur = 1; ctx.shadowOffsetX = 1; ctx.shadowOffsetY = 1;
    ctx.fillStyle = '#fff'; const who = d.name || s.stick; fitFont(ctx, who, 'bold ', 18, 12, mw - 70); ctx.fillText(who, mx + 57, my + 32);
    ctx.restore();
    const orule = ctx.createLinearGradient(mx, 0, mx + mw, 0);
    orule.addColorStop(0, 'rgba(232,148,58,0)'); orule.addColorStop(0.3, '#e8943a'); orule.addColorStop(0.7, '#e8943a'); orule.addColorStop(1, 'rgba(232,148,58,0)');
    ctx.fillStyle = orule; ctx.fillRect(mx, my + 50, mw, 2);
    // its two columns: the result as programs on white, the uninstalled bosses as places on Places Blue
    const top = my + 52, foot = mb - fh;
    ctx.fillStyle = '#fff'; ctx.fillRect(mx, top, col, foot - top);
    ctx.fillStyle = '#d3e5fa'; ctx.fillRect(mx + col, top, mw - col, foot - top);
    ctx.fillStyle = '#95bdee'; ctx.fillRect(mx + col, top, 1, foot - top);
    const [bg, ink] = GRADE_INK[d.grade] || GRADE_INK.C;
    const program = (y, iconFn, value, px, label) => {
      iconFn(mx + 28, y + 25);
      ctx.fillStyle = '#000'; ctx.textAlign = 'left'; fitFont(ctx, value, 'bold ', px, 11, col - 62); ctx.fillText(value, mx + 54, y + 25);
      ctx.fillStyle = '#5b5f6b'; fitFont(ctx, label, '', 11, 8, col - 62); ctx.fillText(label, mx + 54, y + 40);
    };
    // the grade leads: the menu's big pinned program, its tile in the grade's colour, the letter in Tahoma
    const gy = top + 6;
    ctx.fillStyle = bg; rr(ctx, mx + 10, gy, 56, 56, 4); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; rr(ctx, mx + 10.5, gy + 0.5, 55, 55, 4); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.28)'; ctx.fillRect(mx + 13, gy + 1.5, 50, 1.5);
    ctx.fillStyle = ink; ctx.textAlign = 'center'; ctx.font = `bold 40px ${FONT}`; ctx.fillText(d.grade, mx + 38, gy + 43);
    ctx.textAlign = 'left'; ctx.fillStyle = '#000'; const gt = `${s.rank} ${d.grade}`; fitFont(ctx, gt, 'bold ', 22, 14, col - 86); ctx.fillText(gt, mx + 76, gy + 27);
    ctx.fillStyle = '#5b5f6b'; fitFont(ctx, s.cardAll, '', 11, 8, col - 84); ctx.fillText(s.cardAll, mx + 76, gy + 44);
    program(top + 68, (x, y) => hourglass(ctx, x, y - 2, 0.95), fmt(d.time), 22, s.time);
    // the place on the board under a medal; before it is saved, the hits taken under the game's own health blocks
    if (d.pos) program(top + 112, (x, y) => medal(ctx, x, y - 6), s.cardPos(d.pos.rank, d.pos.total), 18, s.cardRank);
    else program(top + 112, (x, y) => hitIcon(ctx, x, y - 2), String(d.hits), 18, s.hits);
    const sep = ctx.createLinearGradient(mx + 8, 0, mx + col - 8, 0);
    sep.addColorStop(0, 'rgba(208,208,191,0)'); sep.addColorStop(0.2, '#d0d0bf'); sep.addColorStop(0.8, '#d0d0bf'); sep.addColorStop(1, 'rgba(208,208,191,0)');
    ctx.fillStyle = sep; ctx.fillRect(mx + 8, top + 162, col - 16, 1);
    const extra = d.pos ? `${s.hits}: ${d.hits}` : `${s.perfects}: ${d.perfect}`;
    ctx.fillStyle = '#5b5f6b'; fitFont(ctx, extra, '', 11, 8, col - 20); ctx.fillText(extra, mx + 12, top + 177);
    const bosses = [
      (x, y) => smileyButton(ctx, x, y, 19, 'dead', false),
      (x, y) => { ctx.save(); ctx.translate(x, y); ctx.rotate(-0.08); ctx.drawImage(sprites().king, -8, -11, 16, 22); ctx.restore(); },
      (x, y) => { ctx.save(); ctx.translate(x, y); ctx.scale(0.27, 0.27); pinballFace(ctx, 0, 0, 26, 0, -40, 60, 0, 0); ctx.restore(); },
      (x, y) => errorIcon(ctx, x, y, 9),
    ];
    bosses.forEach((draw, i) => {
      const y = top + 22 + i * 36, x = mx + col + 20;
      draw(x, y);
      ctx.fillStyle = '#00136b'; ctx.textAlign = 'left'; fitFont(ctx, s.names[i], 'bold ', 11, 8, mw - col - 52); ctx.fillText(s.names[i], x + 17, y + 4);
      const cx = mx + mw - 13;
      ctx.fillStyle = '#3c8f33'; dot(ctx, cx, y, 5);
      ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); ctx.moveTo(cx - 2.4, y + 0.2); ctx.lineTo(cx - 0.6, y + 2); ctx.lineTo(cx + 2.4, y - 1.8); ctx.stroke();
    });
    // its footer: the challenge and where to play
    const fg = ctx.createLinearGradient(0, foot, 0, mb);
    [[0, '#4282d6'], [0.03, '#3b85e0'], [0.17, '#418ae3'], [0.26, '#3786e4'], [0.39, '#2e7ee1'], [0.49, '#2374df'], [0.62, '#196edb'], [0.75, '#1468d8'], [0.83, '#0e5dd2'], [0.88, '#1464cf'], [1, '#1b5bc4']].forEach(([k, c]) => fg.addColorStop(k, c));
    ctx.fillStyle = fg; ctx.fillRect(mx, foot, mw, fh);
    ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.font = `bold 12px ${FONT}`; ctx.fillText(s.cardAsk, mx + 10, foot + 21);
    const askW = ctx.measureText(s.cardAsk).width, url = `${d.host}/#/game`, room = mw - 30 - askW;
    const px = fitFont(ctx, url, '', 12, 9, room), urls = ctx.measureText(url).width > room ? splitUrl(ctx, url, room) : [url];
    ctx.textAlign = 'right';
    urls.forEach((l, i) => {
      const y = urls.length > 1 ? foot + 15 + i * (px + 2) : foot + 21, w = ctx.measureText(l).width;
      ctx.fillText(l, mx + mw - 10, y); ctx.fillRect(mx + mw - 10 - w, y + 2, w, 1);
    });
    ctx.textAlign = 'left';

    // the stickman, arms up on the taskbar beside the menu
    const sx = 466, sc = 1.55, P = POSE.win.slice();
    ctx.fillStyle = 'rgba(0,0,0,.22)'; ctx.beginPath(); ctx.ellipse(sx, floor + 1, 25, 3.5, 0, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(sx, floor); ctx.scale(sc, sc);
    new Stick().body(ctx, P, 0, 0, -1, 1, 1, 0, null, true);
    const hx = -P[4], hy = P[5];
    ctx.strokeStyle = '#e0301e'; ctx.lineCap = 'round'; ctx.lineJoin = 'round'; ctx.lineWidth = 3.5;
    ctx.beginPath(); ctx.moveTo(hx - 8.5, hy - 2.5); ctx.lineTo(hx + 8.5, hy - 2.5); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx + 8, hy - 2); ctx.lineTo(hx + 17, hy + 1); ctx.lineTo(hx + 26, hy - 3); ctx.stroke();
    ctx.restore();
  }
  // hits taken: a strip of the game's own health blocks with the last one knocked out
  function hitIcon(ctx, x, y) {
    ctx.fillStyle = '#fff'; rr(ctx, x - 12, y - 6, 24, 12, 2); ctx.fill();
    ctx.strokeStyle = '#444'; ctx.lineWidth = 1; rr(ctx, x - 11.5, y - 5.5, 23, 11, 2); ctx.stroke();
    ctx.fillStyle = '#4cda50'; for (let i = 0; i < 3; i++) ctx.fillRect(x - 10 + i * 5, y - 4, 4, 8);
    ctx.fillStyle = '#e0301e'; ctx.fillRect(x + 5, y - 4, 4, 8);
  }
  // the fonts are the page's own; Space Grotesk may still be on its way when the first card is drawn
  async function makeCard(d, s) {
    if (document.fonts && document.fonts.load) {
      try { await Promise.race([document.fonts.load(`bold 58px "Space Grotesk"`), new Promise((r) => setTimeout(r, 1500))]); } catch (e) { /* its fallback will do */ }
    }
    const c = document.createElement('canvas');
    c.width = CARD.w * CARD.k; c.height = CARD.h * CARD.k;
    const ctx = c.getContext('2d');
    ctx.scale(CARD.k, CARD.k);
    drawCard(ctx, d, s);
    const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
    if (!blob) throw new Error('the card could not be encoded');
    return blob;
  }

  /* ------------------------------------------------------------ ambient life on each arena, drawn every frame */
  const hash = (n) => { const s = Math.sin(n * 127.1) * 43758.5453; return s - Math.floor(s); };
  // the pinball playfield's top arch as points, pulled a little inside the rail, for its chase lights
  const ARCH = (() => {
    const pts = [], q = (a, c, b, t) => (1 - t) ** 2 * a + 2 * (1 - t) * t * c + t * t * b;
    const add = (x, y) => pts.push([W / 2 + (x - W / 2) * 0.965, 320 + (y - 320) * 0.93]);
    for (let i = 0; i <= 8; i++) add(q(LEFT, LEFT, 260, i / 8), q(300, 62, 60, i / 8));
    for (let i = 1; i < 10; i++) add(260 + (440 * i) / 10, 60);
    for (let i = 0; i <= 8; i++) add(q(700, RIGHT, RIGHT, i / 8), q(60, 62, 300, i / 8));
    return pts;
  })();
  const AMBIENT = {
    // the list of steps is drawn by the game itself (Game.drawSteps), over this
    practice() {},
    desktop(ctx, t) {
      const d = new Date(), hh = String(d.getHours()).padStart(2, '0'), mm = String(d.getMinutes()).padStart(2, '0');
      ctx.fillStyle = '#fff'; ctx.font = `13px ${FONT}`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(`${hh}:${mm}`, W - 16, (FLOOR + H) / 2);
      if (Math.floor(t * 2) % 2 === 0) {
        const x = W - 124, y = (FLOOR + H) / 2;
        ctx.fillStyle = '#ffd24a'; ctx.strokeStyle = '#6b4a00'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x, y - 8); ctx.lineTo(x + 9, y + 7); ctx.lineTo(x - 9, y + 7); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#000'; ctx.fillRect(x - 1, y - 3, 2, 6); ctx.fillRect(x - 1, y + 4, 2, 2);
      }
    },
    bsod(ctx, t) {
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = `14px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.fillText(`Dumping physical memory to disk: ${String(Math.floor((t * 6) % 100)).padStart(2, ' ')}`, 24, FLOOR + 48);
      if (Math.floor(t * 2.5) % 2 === 0) ctx.fillRect(28 + ctx.measureText('Beginning dump of physical memory').width, FLOOR + 15, 8, 14);
    },
    // the title's desktop holds still: one light, no sparkles (the icons and the stickman carry the motion)
    title() {},
    mines(ctx, t) {
      // now and then a square in the background gets clicked
      for (let i = 0; i < 3; i++) {
        const n = Math.floor(t * 1.2) * 3 + i, k = (t * 1.2) % 1;
        const c = Math.floor(hash(n) * 30), r = 2 + Math.floor(hash(n + 99) * 11);
        ctx.fillStyle = `rgba(255,255,255,${0.35 * (1 - k)})`; ctx.fillRect(c * 32 + 3, r * 32 - 1, 26, 26);
      }
    },
    cards(ctx, t) {
      // faint suits drift up through the felt
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 12; i++) {
        const x = hash(i + 5) * W, y = H - ((t * (10 + hash(i) * 12) + hash(i + 50) * (H + 80)) % (H + 80)), s = 7 + hash(i + 9) * 9;
        suit(ctx, ['s', 'h', 'c', 'd'][i % 4], x, y, s, '#fff');
      }
      ctx.globalAlpha = 1;
    },
    pinball(ctx, t) {
      for (let i = 0; i < 24; i++) {
        const a = 0.5 + 0.5 * Math.sin(t * (1.5 + hash(i) * 2) + i);
        ctx.fillStyle = `rgba(255,255,255,${0.2 + 0.7 * a})`; dot(ctx, hash(i + 3) * W, hash(i + 11) * (FLOOR - 120), 0.6 + a * 1.1);
      }
      const k = (t % 6) / 1.2;
      if (k < 1) {
        const x = 200 + hash(Math.floor(t / 6)) * 500 + k * 260, y = 90 + k * 110;
        const g = ctx.createLinearGradient(x - 70, y - 30, x, y); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,255,255,.85)');
        ctx.strokeStyle = g; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(x - 70, y - 30); ctx.lineTo(x, y); ctx.stroke();
      }
      ARCH.forEach(([x, y], i) => {
        const on = (i + Math.floor(t * 12)) % 6 === 0;
        ctx.fillStyle = on ? '#ffd23f' : 'rgba(255,210,63,.18)'; dot(ctx, x, y, on ? 3 : 2);
      });
    },
  };

  /* ------------------------------------------------------------ bosses */
  class Boss {
    constructor(g, hp, idx, arena) {
      Object.assign(this, {
        g, hpMax: hp, hp, idx, arena, t: 0, st: 0, step: 0, state: 'enter', last: '', flash: 0, hurtT: 0, phase: 1,
        dying: false, gone: false, done: false, dazed: false, paintT: 0, paintC: PAINTS[0], jolt: 0,
      });
      this.plats = [];
    }
    go(s) { this.state = s; this.st = 0; this.step = 0; }
    choose(table) {
      const opts = table.filter(([n]) => n !== this.last);
      let r = Math.random() * opts.reduce((s, o) => s + o[1], 0);
      for (const [n, w] of opts) { r -= w; if (r <= 0) { this.last = n; return n; } }
      this.last = opts[0][0];
      return this.last;
    }
    take(n, special) {
      if (this.dying || this.state === 'enter') return false;
      if (this.paintT > 0) n += 1;   // wet paint: every hit lands harder
      if (this.g.shadow && !special) n += SHADOW_DMG;   // and so does every hit in shadow mode
      this.hp = Math.max(0, this.hp - n); this.flash = 0.12; this.hurtT = 0.22; this.jolt = 0.16;
      this.g.dealt(n, special);
      if (this.phase === 1 && this.hp <= this.hpMax / 2 && this.hp > 0) { this.phase = 2; this.g.phaseTwo(); if (this.onPhaseTwo) this.onPhaseTwo(); }
      if (this.hp <= 0) { this.dying = true; this.dazed = false; this.go('die'); this.clear(); this.g.bossDying(); }
      return true;
    }
    // a hazard (a mine, a card) struck the boss for extra damage
    bigHit(n, x, y) {
      if (!this.take(n)) return;
      const g = this.g;
      g.hitstop(0.12); g.fx.shake(10, 0.3); g.fx.ring(x, y, 10, 80, 0.3, '#fff', 5);
      g.fx.text(x, y - 40, `-${n}`, '#ffe417', 22); g.snd.play('heavy');
    }
    update(dt) {
      this.t += dt; this.st += dt;
      this.flash = Math.max(0, this.flash - dt); this.hurtT = Math.max(0, this.hurtT - dt);
      this.paintT = Math.max(0, this.paintT - dt); this.jolt = Math.max(0, this.jolt - dt);
    }
    // a short shudder when hit
    joltX() { return this.jolt > 0 ? Math.sin(this.jolt * 95) * 5 * (this.jolt / 0.16) : 0; }
    get progress() { return 1 - this.hp / this.hpMax; }
    // the special: every hazard goes, and the boss drops whatever it was doing
    stagger() { this.clear(); if (!this.dying) { this.dazed = false; this.recover(); } }
    recover() { this.go('idle'); }
    anchor() { return { x: this.x, y: this.y, r: 56 }; }
    drawBack() {}
    drawFront() {}
    clear() {}
  }

  /* ---- 1. Mines: the smiley button tosses mines, reveals the floor and slams down ---- */
  class Mines extends Boss {
    constructor(g) {
      super(g, 42, 0, 'mines');
      Object.assign(this, { x: W / 2, y: -90, baseY: 226, face: 'smile', press: 0, vy: 0, chained: false, waveDur: 1.25, tickN: 3 });
      this.mines = []; this.waves = []; this.flags = []; this.pillars = [];
      this.tiles = Array.from({ length: 30 }, () => ({ st: 'up', t: 0, dur: 1, pop: 0 }));
      this.plats = [{ x1: 176, x2: 336, y: 348 }, { x1: 624, x2: 784, y: 348 }];
    }
    body() { return { x: this.x - 50, y: this.y - 50, w: 100, h: 100 }; }
    update(dt) {
      super.update(dt);
      const g = this.g, p = g.player, p2 = this.phase === 2;
      this.press = Math.max(0, this.press - dt * 3);
      switch (this.state) {
        case 'enter':
          this.y = lerp(-90, this.baseY, easeOut(Math.min(1, this.st / 1.1)));
          if (this.st > 1.2) this.go('idle');
          break;
        case 'idle': {
          this.face = p2 ? 'cool' : 'smile';
          this.x = approach(this.x, clamp(p.x + (p.x < W / 2 ? 190 : -190), 110, W - 110), (p2 ? 200 : 150) * dt);
          this.y = damp(this.y, this.baseY + Math.sin(this.t * 2.2) * 8, 4, dt);
          if (this.st > (p2 ? 0.55 : 0.85)) this.go(this.choose(p2 ? [['toss', 3], ['sweep', 3], ['slam', 3], ['flags', 2]] : [['toss', 4], ['sweep', 3], ['slam', 3]]));
          break;
        }
        case 'toss': {
          this.face = 'oh';
          this.y = damp(this.y, this.baseY - 30, 6, dt);
          const n = p2 ? 5 : 3, t0 = 0.5, gap = 0.13;
          while (this.step < n && this.st >= t0 + this.step * gap) { this.throwMine(this.step, n); this.step += 1; }
          if (this.st > t0 + n * gap + 0.5) this.go('idle');
          break;
        }
        case 'sweep':
          this.face = 'oh';
          if (this.step === 0) {
            this.x = approach(this.x, clamp(p.x, 180, W - 180), 320 * dt);
            this.y = damp(this.y, 168, 5, dt);
            if (this.st > 0.5) { this.step = 1; this.st = 0; this.reveal(); }
          } else if (this.st > this.waveDur + 0.45) {
            if (p2 && this.step === 1) { this.step = 2; this.st = 0; this.reveal(); } else this.go('idle');
          }
          break;
        case 'slam': this.slam(dt, p, p2); break;
        case 'flags':
          this.face = 'oh';
          this.y = damp(this.y, 160, 5, dt);
          if (this.step === 0 && this.st > 0.35) { this.step = 1; this.dropFlags(); }
          if (this.st > 2.2) this.go('idle');
          break;
        case 'die': this.dieUpdate(dt); break;
      }
      if (this.hurtT > 0 && !this.dying && !this.dazed) this.face = 'hurt';
      this.updateMines(dt, p);
      this.updateTiles(dt, p);
      this.updateWaves(dt, p);
      this.updateFlags(dt, p);
    }
    slam(dt, p, p2) {
      this.face = this.dazed ? 'dizzy' : 'oh';
      if (this.step === 0) {
        this.x = approach(this.x, clamp(p.x, 70, W - 70), (p2 ? 520 : 400) * dt);
        this.y = damp(this.y, 118, 6, dt);
        if (this.st > (p2 ? 0.55 : 0.75)) { this.step = 1; this.st = 0; }
      } else if (this.step === 1) {
        this.y = 118 + Math.sin(this.st * 70) * 1.5;
        if (this.st > (this.chained ? 0.12 : 0.2)) { this.step = 2; this.st = 0; this.vy = 200; }
      } else if (this.step === 2) {
        this.vy += 5200 * dt; this.y += this.vy * dt; this.press = 1;
        if (overlap(this.body(), p.box)) this.g.hurt(1, this.x, false, true);
        if (this.y >= FLOOR - 50) {
          this.y = FLOOR - 50; this.landSlam();
          this.step = 3; this.st = 0; this.dazed = !p2 || this.chained;
        }
      } else if (this.step === 3) {
        if (!this.dazed) { if (this.st > 0.28) { this.chained = true; this.step = 4; this.st = 0; } }
        else if (this.st > 1.4) { this.dazed = false; this.step = 5; this.st = 0; }
      } else if (this.step === 4) {
        this.y = damp(this.y, 130, 9, dt);
        this.x = approach(this.x, clamp(p.x, 70, W - 70), 560 * dt);
        if (this.st > 0.42) { this.step = 1; this.st = 0; }
      } else {
        this.y = damp(this.y, this.baseY, 5, dt);
        if (this.st > 0.6) { this.chained = false; this.go('idle'); }
      }
    }
    landSlam() {
      const g = this.g;
      g.fx.shake(12, 0.35); g.snd.play('heavy'); g.snd.play('boom');
      g.fx.dust(this.x - 44, FLOOR, 8); g.fx.dust(this.x + 44, FLOOR, 8);
      this.waves.push({ x: this.x - 46, dir: -1 }, { x: this.x + 46, dir: 1 });
    }
    updateWaves(dt, p) {
      const sp = this.phase === 2 ? 540 : 440;
      for (const w of this.waves) {
        w.x += w.dir * sp * dt;
        if (Math.abs(p.x - w.x) < 18 && p.y > FLOOR - 22) this.g.hurt(1, w.x - w.dir * 30);
        if (w.x < -40 || w.x > W + 40) w.gone = true;
      }
      this.waves = this.waves.filter((w) => !w.gone);
    }
    throwMine(i, n) {
      const p = this.g.player;
      const tx = clamp(p.x + (i - (n - 1) / 2) * 92 + rand(-18, 18), LEFT + 30, RIGHT - 30);
      const T = rand(0.72, 0.9), G = 1500, sx = this.x + rand(-20, 20), sy = this.y + 24;
      this.mines.push({ x: sx, y: sy, vx: (tx - sx) / T, vy: (FLOOR - 12 - sy - 0.5 * G * T * T) / T, r: 12, st: 'fly', fuse: this.phase === 2 ? 0.9 : 1.1, b: 0, t: 0 });
      this.g.snd.play('swing');
    }
    updateMines(dt, p) {
      const g = this.g;
      for (const m of this.mines) {
        m.t += dt;
        if (m.st === 'armed') { m.fuse -= dt; if (m.fuse <= 0) this.explode(m); continue; }
        const oy = m.y;
        m.vy += (m.st === 'kick' ? 1100 : 1500) * dt; m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.st === 'kick') {
          g.fx.add({ k: 'dot', x: m.x, y: m.y, vx: 0, vy: 0, g: 0, life: 0.18, t: 0, r: 6, c: 'rgba(255,150,40,.8)' });
          if (!this.dying && circleRect(m.x, m.y, m.r + 8, this.body())) { this.explode(m); this.bigHit(4, m.x, m.y); g.achieve('sender'); continue; }
          if (m.x < LEFT || m.x > RIGHT || m.y > FLOOR - m.r || m.y < -60) this.explode(m);
          continue;
        }
        if (m.x < LEFT + m.r || m.x > RIGHT - m.r) { m.x = clamp(m.x, LEFT + m.r, RIGHT - m.r); m.vx *= -0.5; }
        let fy = FLOOR;
        for (const pl of this.plats) if (m.x > pl.x1 && m.x < pl.x2 && oy + m.r <= pl.y + 1 && m.y + m.r >= pl.y) fy = pl.y;
        if (m.y + m.r >= fy) {
          m.y = fy - m.r; m.b += 1;
          if (m.b >= 2 || Math.abs(m.vy) < 180) { m.st = 'armed'; m.vx = 0; m.vy = 0; g.snd.play('tick'); }
          else { m.vy = -Math.abs(m.vy) * 0.4; m.vx *= 0.55; }
        }
        if (m.st === 'fly' && circleRect(m.x, m.y, m.r - 2, p.box) && g.hurt(1, m.x, false, true)) this.explode(m);
      }
      this.mines = this.mines.filter((m) => !m.gone);
    }
    explode(m) {
      if (m.gone) return;
      m.gone = true;
      const g = this.g;
      g.fx.ring(m.x, m.y, 6, 64, 0.34, '#ff9a2a', 7); g.fx.ring(m.x, m.y, 4, 38, 0.22, '#fff6b0', 4);
      g.fx.debris(m.x, m.y, 10, ['#111', '#444', '#ff9a2a']); g.fx.sparks(m.x, m.y, 0, 10, '#ffd060');
      g.fx.shake(m.st === 'kick' ? 9 : 6, 0.25); g.snd.play('boom');
      if (m.st !== 'kick' && circleRect(m.x, m.y, 60, g.player.box)) g.hurt(1, m.x, false, true);
    }
    reveal() {
      const p = this.g.player, pi = clamp(Math.floor(p.x / 32), 0, 29);
      this.waveDur = this.phase === 2 ? 1.0 : 1.25;
      const safe = new Set(), win = (c) => { for (let i = c - 1; i <= c + 1; i++) if (i >= 0 && i < 30) safe.add(i); };
      let c1 = pi, c2 = pi, guard = 0;
      while ((Math.abs(c1 - pi) < 3 || Math.abs(c1 - pi) > 9) && guard++ < 60) c1 = Math.floor(rand(1, 29));
      guard = 0;
      while (Math.abs(c2 - c1) < 8 && guard++ < 60) c2 = Math.floor(rand(1, 29));
      win(c1); win(c2);
      this.tiles.forEach((tl, i) => { tl.st = safe.has(i) ? 'safe' : 'num'; tl.t = 0; tl.dur = this.waveDur; });
      this.press = 1; this.tickN = 3;
      this.g.snd.play('flip'); this.g.snd.play('tick');
    }
    updateTiles(dt, p) {
      let boom = false;
      this.tiles.forEach((tl, i) => {
        tl.pop = Math.max(0, tl.pop - dt);
        if (tl.st === 'up') return;
        tl.t += dt;
        if (tl.st === 'num' && tl.t >= tl.dur) {
          tl.st = 'boom'; tl.t = 0; boom = true;
          this.pillars.push({ x: i * 32, t: 0 });
          this.g.fx.debris(i * 32 + 16, FLOOR - 4, 2, ['#c0c0c0', '#7b7b7b', '#ff9a2a']);
        } else if ((tl.st === 'safe' && tl.t >= tl.dur + 0.4) || (tl.st === 'boom' && tl.t >= 0.4)) { tl.st = 'up'; tl.pop = 0.12; }
      });
      const any = this.tiles.find((tl) => tl.st === 'num');
      if (any) {
        const n = clamp(3 - Math.floor(any.t / (any.dur / 3)), 1, 3);
        if (n < this.tickN) { this.tickN = n; this.g.snd.play('tick'); }
      }
      if (boom) { this.g.fx.shake(9, 0.3); this.g.snd.play('boom'); }
      for (const pl of this.pillars) {
        pl.t += dt;
        const h = 124 * Math.min(1, pl.t / 0.07);
        if (pl.t < 0.3 && overlap({ x: pl.x + 4, y: FLOOR - h, w: 24, h }, p.box)) this.g.hurt(1, pl.x + 16, false, true);
      }
      this.pillars = this.pillars.filter((pl) => pl.t < 0.42);
    }
    dropFlags() {
      const p = this.g.player, xs = [clamp(p.x, 60, W - 60)];
      let guard = 0;
      while (xs.length < 5 && guard++ < 300) { const x = rand(60, W - 60); if (xs.every((q) => Math.abs(q - x) > 110)) xs.push(x); }
      this.flags = xs.map((x, i) => ({ x, y: -50, t: -i * 0.12, st: 'mark', vy: 0 }));
      this.g.snd.play('tick');
    }
    updateFlags(dt, p) {
      for (const f of this.flags) {
        f.t += dt;
        if (f.st === 'mark' && f.t > 0.75) { f.st = 'fall'; f.vy = 600; }
        else if (f.st === 'fall') {
          f.vy += 3000 * dt; f.y += f.vy * dt;
          if (overlap({ x: f.x - 13, y: f.y - 46, w: 26, h: 46 }, p.box)) this.g.hurt(1, f.x);
          if (f.y >= FLOOR) { f.y = FLOOR; f.st = 'stuck'; f.t = 0; this.g.fx.dust(f.x, FLOOR, 4); this.g.snd.play('land'); }
        } else if (f.st === 'stuck' && f.t > 0.9) f.gone = true;
      }
      this.flags = this.flags.filter((f) => !f.gone);
    }
    hitBy(hb, act, p) {
      for (const m of this.mines) {
        if (m.gone || m.st === 'kick' || act.hits.has(m) || !circleRect(m.x, m.y, m.r + 5, hb)) continue;
        act.hits.add(m);
        const pw = { kick: [700, -430], akick: [700, -430], round: [640, -620], upper: [240, -780], dive: [420, -520], sweep: [640, -300], slide: [560, -260], rush: [720, -380], kb1: [760, -460], kb2: [760, -460], kbAir: [760, -460], ms1: [600, -380], ms2: [300, -760], msAir: [600, -380],
          spinKick: [760, -520], spinFist: [620, -400], rise: [200, -980], slam: [300, -640], quake: [260, -820], heavyP: [820, -440], flyK: [800, -480],
          overhand: [620, -480], elbow: [560, -360], knee: [420, -700], lowKick: [640, -260], axe: [360, -520], akick2: [700, -430] }[act.k] || [580, -340];
        m.st = 'kick'; m.vx = p.face * pw[0]; m.vy = pw[1];
        // aim assist: when the boss is in front, arc the mine into it
        const dx = this.x - m.x;
        if (sign(dx) === p.face && Math.abs(dx) > 30) { const T = Math.abs(dx) / Math.abs(m.vx); m.vy = clamp((this.y - m.y - 0.5 * 1100 * T * T) / T, -950, 200); }
        return { x: m.x, y: m.y, heavy: true, color: '#ffb040' };
      }
      if (this.dying || this.state === 'enter' || act.hits.has(this) || !overlap(hb, this.body())) return null;
      act.hits.add(this);
      const mv = MOVES[act.k];
      this.take(mv.dmg + (this.dazed ? 1 : 0));
      return { x: clamp(hb.x + hb.w / 2, this.x - 50, this.x + 50), y: clamp(hb.y + hb.h / 2, this.y - 50, this.y + 50), heavy: !!mv.heavy || this.dazed };
    }
    recover() { this.chained = false; this.press = 0; this.go('idle'); }
    anchor() { return { x: this.x, y: this.y, r: 52 }; }
    clear() {
      this.mines = []; this.waves = []; this.flags = []; this.pillars = [];
      this.tiles.forEach((tl) => { tl.st = 'up'; });
    }
    dieUpdate(dt) {
      this.face = 'dead';
      const g = this.g;
      if (this.step === 0) { this.step = 1; this.vy = -320; }
      if (this.step === 1) {
        this.vy += 2600 * dt; this.y += this.vy * dt;
        if (this.y >= FLOOR - 50) {
          this.y = FLOOR - 50;
          if (this.vy > 300) { this.vy = -this.vy * 0.35; g.fx.dust(this.x, FLOOR, 6); g.fx.shake(6, 0.2); g.snd.play('land'); } else this.vy = 0;
        }
        if (this.st > 1.3) {
          this.step = 2; this.st = 0; this.gone = true;
          g.fx.debris(this.x, this.y, 26, ['#c0c0c0', '#ffffff', '#7b7b7b', '#ffe417', '#000'], 1.4);
          g.fx.ring(this.x, this.y, 10, 120, 0.45, '#fff', 6); g.fx.sparks(this.x, this.y, 0, 16, '#ffe417');
          g.fx.shake(12, 0.4); g.snd.play('boom');
        }
      } else if (this.st > 0.6) this.done = true;
    }
    drawBack(ctx) {
      for (const pl of this.plats) for (let x = pl.x1; x < pl.x2; x += 32) bevel(ctx, x, pl.y, 32, 32, 4, '#ffffff', '#7b7b7b', '#c0c0c0');
      this.tiles.forEach((tl, i) => {
        const x = i * 32;
        let bump = tl.pop * 60;
        for (const w of this.waves) bump = Math.max(bump, 16 * Math.max(0, 1 - Math.abs(x + 16 - w.x) / 44));
        const y = FLOOR - bump;
        if (tl.st === 'up') { bevel(ctx, x, y, 32, 32, 4, '#ffffff', '#7b7b7b', '#c0c0c0'); return; }
        const late = tl.st === 'num' && tl.dur - tl.t < 0.3 && Math.floor(tl.t * 16) % 2 === 0;
        ctx.fillStyle = tl.st === 'boom' ? '#ff0000' : late ? '#ffb4a8' : '#c0c0c0';
        ctx.fillRect(x, y, 32, 32);
        ctx.strokeStyle = '#7b7b7b'; ctx.lineWidth = 1; ctx.strokeRect(x + 0.5, y + 0.5, 31, 31);
        if (tl.st === 'num') {
          const n = clamp(3 - Math.floor(tl.t / (tl.dur / 3)), 1, 3);
          ctx.fillStyle = NUMC[n]; ctx.font = `bold 22px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.fillText(n, x + 16, y + 17);
        } else if (tl.st === 'boom') mineIcon(ctx, x + 16, y + 16, 8, false);
      });
      for (const f of this.flags) {
        if (f.st !== 'mark' || f.t < 0 || Math.floor(f.t * 10) % 2) continue;
        ctx.strokeStyle = '#ff0000'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(f.x - 12, FLOOR - 2); ctx.lineTo(f.x + 12, FLOOR - 2); ctx.lineTo(f.x, FLOOR - 18); ctx.closePath(); ctx.stroke();
        ctx.setLineDash([]);
      }
    }
    draw(ctx) {
      if (this.gone) return;
      const sh = clamp(1 - (FLOOR - (this.y + 50)) / 420, 0.25, 1);
      ctx.fillStyle = `rgba(0,0,0,${0.28 * sh})`; ctx.beginPath(); ctx.ellipse(this.x, FLOOR - 1, 48 * sh, 7 * sh, 0, 0, TAU); ctx.fill();
      const bx = this.x + this.joltX() + (this.state === 'slam' && this.step === 1 ? rand(-2, 2) : 0);
      smileyButton(ctx, bx, this.y, 100, this.face, this.press > 0.3, this.t);
      if (this.flash > 0) { ctx.globalAlpha = Math.min(0.8, this.flash * 7); ctx.fillStyle = '#fff'; ctx.fillRect(bx - 50, this.y - 50, 100, 100); ctx.globalAlpha = 1; }
      if (this.dazed) stars(ctx, this.x, this.y - 64, this.t);
    }
    drawFront(ctx) {
      for (const m of this.mines) {
        const lit = m.st === 'armed' && Math.floor(m.fuse * (m.fuse < 0.4 ? 20 : 9)) % 2 === 0;
        mineIcon(ctx, m.x, m.y, m.r, lit || m.st === 'kick');
      }
      for (const pl of this.pillars) {
        const h = 124 * Math.min(1, pl.t / 0.07), a = pl.t > 0.3 ? 1 - (pl.t - 0.3) / 0.12 : 1;
        const g = ctx.createLinearGradient(0, FLOOR, 0, FLOOR - h);
        g.addColorStop(0, '#fff7c0'); g.addColorStop(0.35, '#ffb23c'); g.addColorStop(0.75, '#ff5a1f'); g.addColorStop(1, 'rgba(255,60,20,0)');
        ctx.globalAlpha = Math.max(0, a); ctx.fillStyle = g;
        const j = rand(-2, 2);
        rr(ctx, pl.x + 3 + j, FLOOR - h, 26, h, 10); ctx.fill();
        ctx.globalAlpha = 1;
      }
      for (const f of this.flags) if (f.st !== 'mark') { ctx.globalAlpha = f.st === 'stuck' ? Math.max(0, 1 - f.t / 0.9) : 1; flagIcon(ctx, f.x, f.y, 1.8); ctx.globalAlpha = 1; }
    }
  }

  /* ---- 2. Cards: the king throws, deals, bounces the winning cascade and shuffles himself ---- */
  class Cards extends Boss {
    constructor(g) {
      super(g, 48, 1, 'cards');
      Object.assign(this, { x: W / 2, y: -140, baseY: 232, rot: 0, flipA: 0, face: 'calm', vx: 0, vy: 0, lastLaunch: -9 });
      this.proj = []; this.bouncers = []; this.drops = []; this.bursts = []; this.decoy = null;
      this.plats = [{ x1: 150, x2: 300, y: 344 }, { x1: 660, x2: 810, y: 344 }];
      this.trail = document.createElement('canvas');
      this.trail.width = W * 1.5; this.trail.height = H * 1.5;
      this.tctx = this.trail.getContext('2d'); this.tctx.scale(1.5, 1.5);
      this.steps = 0; this.trailUsed = false;
      sprites();
    }
    body() { const w = Math.max(24, 96 * Math.abs(Math.cos(this.flipA))); return { x: this.x - w / 2, y: this.y - 67, w, h: 134 }; }
    update(dt) {
      super.update(dt);
      const g = this.g, p = g.player, p2 = this.phase === 2;
      this.steps += 1;
      switch (this.state) {
        case 'enter': {
          const k = Math.min(1, this.st / 1.2);
          this.y = lerp(-140, this.baseY, easeOut(k)); this.flipA = (1 - easeOut(k)) * TAU * 2;
          if (this.st > 1.3) { this.flipA = 0; this.go('idle'); }
          break;
        }
        case 'idle': {
          this.face = 'calm';
          const side = p.x < W / 2 ? 1 : -1;
          this.x = approach(this.x, clamp(p.x + side * 230, 100, W - 100), (p2 ? 230 : 170) * dt);
          this.y = damp(this.y, this.baseY + Math.sin(this.t * 2) * 10, 4, dt);
          this.rot = damp(this.rot, Math.sin(this.t * 1.6) * 0.06, 6, dt);
          this.flipA = damp(this.flipA, 0, 10, dt);
          if (this.st > (p2 ? 0.6 : 0.9)) this.go(this.choose(p2 ? [['throw', 3], ['cascade', 3], ['deal', 2], ['shuffle', 3]] : [['throw', 4], ['cascade', 3], ['deal', 3]]));
          break;
        }
        case 'throw': {
          this.face = 'angry';
          const n = p2 ? 5 : 3, t0 = 0.4, gap = 0.11, dir = sign(p.x - this.x);
          this.rot = damp(this.rot, this.st < t0 ? -0.3 * dir : 0.18 * dir, 12, dt);
          while (this.step < n && this.st >= t0 + this.step * gap) { this.throwCard(this.step, n); this.step += 1; }
          if (this.st > t0 + n * gap + 0.3) this.go('low');
          break;
        }
        case 'cascade': {
          this.face = 'angry';
          const n = p2 ? 12 : 8, gap = p2 ? 0.2 : 0.27;
          this.x = approach(this.x, 110, 520 * dt); this.y = damp(this.y, 132, 6, dt);
          this.rot = damp(this.rot, Math.sin(this.t * 8) * 0.12, 8, dt);
          if (this.st > 0.55) while (this.step < n && this.st >= 0.55 + this.step * gap) { this.launch(this.step); this.step += 1; }
          if (this.step >= n && (this.bouncers.length === 0 || this.st > 0.55 + n * gap + 3.4)) this.go('low');
          break;
        }
        case 'deal':
          this.face = 'angry';
          this.x = approach(this.x, W / 2, 500 * dt); this.y = damp(this.y, 128, 6, dt);
          if (this.step === 0 && this.st > 0.45) { this.step = 1; this.planDeal(); }
          if (this.st > 2.7) this.go('low');
          break;
        case 'low': {
          const hold = p2 ? 1.3 : 1.6;
          this.face = this.st < hold ? 'dizzy' : 'calm';
          this.dazed = this.st > 0.3 && this.st < hold;
          this.y = damp(this.y, 356, 5, dt);
          this.rot = damp(this.rot, Math.sin(this.t * 5) * 0.09, 8, dt);
          this.flipA = damp(this.flipA, 0, 10, dt);
          if (this.st > hold + 0.2) { this.dazed = false; this.go('idle'); }
          break;
        }
        case 'shuffle': this.shuffleUpdate(dt, p, p2); break;
        case 'reveal':
          this.face = 'angry';
          this.flipA = damp(this.flipA, 0, 12, dt);
          if (this.st > 0.6) this.go('idle');
          break;
        case 'die': this.dieUpdate(dt); break;
      }
      if (this.hurtT > 0 && !this.dying && !this.dazed) this.face = 'hurt';
      this.updateProj(dt, p);
      this.updateBouncers(dt, p);
      this.updateDrops(dt, p);
      this.updateBursts(dt);
      this.updateTrail();
    }
    throwCard(i, n) {
      const p = this.g.player;
      const ang = Math.atan2(p.y - 40 - this.y, p.x - this.x) + (i - (n - 1) / 2) * 0.22;
      const sp = this.phase === 2 ? 540 : 470;
      this.proj.push({ x: this.x, y: this.y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, a: 0 });
      this.g.snd.play('card');
    }
    updateProj(dt, p) {
      for (const c of this.proj) {
        c.x += c.vx * dt; c.y += c.vy * dt; c.a += 14 * dt;
        if (circleRect(c.x, c.y, 13, p.box) && this.g.hurt(1, c.x)) c.gone = true;
        if (c.y > FLOOR - 4) { c.gone = true; this.g.fx.dust(c.x, FLOOR, 3); }
        if (c.x < -50 || c.x > W + 50 || c.y < -50) c.gone = true;
      }
      this.proj = this.proj.filter((c) => !c.gone);
    }
    launch(i) {
      const slot = i % 4, dir = Math.random() < 0.72 ? -1 : 1;
      this.bouncers.push({ x: 574 + slot * 80, y: 105, vx: dir * rand(170, 300), vy: rand(-260, -40), suit: slot });
      this.lastLaunch = this.t;
      this.g.snd.play('card');
    }
    updateBouncers(dt, p) {
      for (const c of this.bouncers) {
        c.vy += 1300 * dt; c.x += c.vx * dt; c.y += c.vy * dt;
        if (c.y + 39 > FLOOR) { c.y = FLOOR - 39; c.vy = -Math.max(260, Math.abs(c.vy) * 0.8); }
        if (overlap({ x: c.x - 22, y: c.y - 33, w: 44, h: 66 }, p.box)) this.g.hurt(1, c.x);
        if (c.x < -60 || c.x > W + 60) c.gone = true;
      }
      this.bouncers = this.bouncers.filter((c) => !c.gone);
    }
    // the cascade leaves the famous trail of cards; it fades so the arena stays readable
    updateTrail() {
      const t = this.tctx;
      if (this.steps % 3 === 0) {
        const spr = sprites();
        for (const c of this.bouncers) t.drawImage(spr.aces[c.suit], c.x - 28, c.y - 39, 56, 78);
        if (this.state === 'die' && !this.gone) { t.save(); t.translate(this.x, this.y); t.rotate(this.rot); t.drawImage(spr.king, -48, -67, 96, 134); t.restore(); }
        if (this.bouncers.length || this.state === 'die') this.trailUsed = true;
      }
      if (this.steps % 6 === 0 && this.trailUsed) {
        t.globalCompositeOperation = 'destination-out'; t.fillStyle = 'rgba(0,0,0,.09)'; t.fillRect(0, 0, W, H); t.globalCompositeOperation = 'source-over';
        if (!this.bouncers.length && this.state !== 'die' && this.t - this.lastLaunch > 3) { t.clearRect(0, 0, W, H); this.trailUsed = false; }
      }
    }
    planDeal() {
      const p = this.g.player, cw = 80, pc = clamp(Math.floor(p.x / cw), 0, 11);
      let gap = pc + (Math.random() < 0.5 ? -2 : 2);
      if (gap < 0 || gap > 11) gap = pc + (gap < 0 ? 2 : -2);
      const spare = this.phase === 2 ? 0 : 1;
      const cand = shuffled([...Array(12).keys()].filter((c) => c !== pc && Math.abs(c - gap) > spare));
      const cols = [pc].concat(cand).slice(0, this.phase === 2 ? 9 : 7);
      this.drops = cols.map((c, i) => ({ x: c * cw + cw / 2, y: -90, st: 'mark', t: -i * 0.05, vy: 0, suit: Math.floor(rand(0, 4)) }));
      this.g.snd.play('card');
    }
    updateDrops(dt, p) {
      for (const d of this.drops) {
        d.t += dt;
        if (d.st === 'mark' && d.t > 0.8) { d.st = 'fall'; d.vy = 900; }
        else if (d.st === 'fall') {
          d.vy += 2400 * dt; d.y += d.vy * dt;
          if (overlap({ x: d.x - 22, y: d.y - 35, w: 44, h: 70 }, p.box)) this.g.hurt(1, d.x);
          if (d.y + 39 >= FLOOR) { d.y = FLOOR - 39; d.st = 'lie'; d.t = 0; this.g.fx.dust(d.x, FLOOR, 5); this.g.snd.play('card'); this.g.fx.shake(3, 0.12); }
        } else if (d.st === 'lie' && d.t > 0.6) d.gone = true;
      }
      this.drops = this.drops.filter((d) => !d.gone);
    }
    burstFake(c) {
      this.bursts.push({ x: c.x, y: c.y, t: 0 });
      this.g.snd.play('flip');
    }
    updateBursts(dt) {
      for (const b of this.bursts) {
        b.t += dt;
        if (b.t >= 0.3 && !b.fired) {
          b.fired = true;
          for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU + 0.3; this.proj.push({ x: b.x, y: b.y, vx: Math.cos(a) * 330, vy: Math.sin(a) * 330, a: 0 }); }
          this.g.fx.debris(b.x, b.y, 12, ['#fff', '#7b3fe4', '#1fb85a', RED]); this.g.fx.ring(b.x, b.y, 10, 70, 0.3, '#fff', 4);
          this.g.snd.play('boom');
        }
      }
      this.bursts = this.bursts.filter((b) => b.t < 0.45);
    }
    shuffleUpdate(dt, p, p2) {
      const d = this.decoy, Y = 318;
      if (this.step === 0) {
        this.face = 'calm';
        this.x = approach(this.x, W / 2, 520 * dt); this.y = damp(this.y, Y, 6, dt); this.rot = damp(this.rot, 0, 10, dt);
        if (this.st > 0.55) {
          this.step = 1; this.st = 0;
          this.decoy = { cards: [W / 2 - 250, W / 2, W / 2 + 250].map((tx, i) => ({ x: this.x, y: Y, tx, real: i === 1, flipA: 0 })), swaps: 0, need: p2 ? 7 : 6, sw: null };
          this.g.snd.play('card');
        }
      } else if (this.step === 1) {
        d.cards.forEach((c) => { c.x = damp(c.x, c.tx, 8, dt); c.flipA = clamp((this.st - 0.75) / 0.3, 0, 1) * Math.PI; });
        if (this.st > 1.15) { this.step = 2; this.st = 0; }
      } else if (this.step === 2) {
        const dur = p2 ? 0.3 : 0.36;
        if (!d.sw) {
          const i = Math.floor(rand(0, 3)), j = (i + 1 + Math.floor(rand(0, 2))) % 3;
          d.sw = { i, j, t: 0, xi: d.cards[i].x, xj: d.cards[j].x };
          this.g.snd.play('card');
        }
        d.sw.t += dt;
        const k = Math.min(1, d.sw.t / dur), e = easeInOut(k), a = d.cards[d.sw.i], b = d.cards[d.sw.j];
        a.x = lerp(d.sw.xi, d.sw.xj, e); b.x = lerp(d.sw.xj, d.sw.xi, e);
        a.y = Y - Math.sin(k * Math.PI) * 56; b.y = Y + Math.sin(k * Math.PI) * 34;
        if (k >= 1) { d.sw = null; d.swaps += 1; if (d.swaps >= d.need) { this.step = 3; this.st = 0; } }
      } else if (this.step === 3) {
        d.cards.forEach((c, i) => { c.y = Y + Math.sin(this.t * 3 + i * 2) * 6; });
        if (this.st > 4.2) this.endShuffle(false);
      }
      if (this.decoy) { const r = this.decoy.cards.find((c) => c.real); this.x = r.x; this.y = r.y; }
    }
    endShuffle(found) {
      const d = this.decoy;
      if (!d) return;
      d.cards.forEach((c) => { if (!c.real) this.burstFake(c); });
      const r = d.cards.find((c) => c.real);
      this.x = r.x; this.y = r.y; this.flipA = Math.PI; this.rot = 0;
      this.decoy = null;
      this.go(found ? 'low' : 'reveal');
      if (found) { this.st = 0.3; this.dazed = true; }
    }
    hitBy(hb, act, p) {
      const hitCard = (list, w, h) => {
        for (const c of list) {
          if (act.hits.has(c) || !overlap(hb, { x: c.x - w / 2, y: c.y - h / 2, w, h })) continue;
          act.hits.add(c); c.gone = true;
          this.g.fx.debris(c.x, c.y, 8, ['#fff', '#1f55c9', RED]); this.g.snd.play('card');
          return { x: c.x, y: c.y, heavy: false, color: '#fff' };
        }
        return null;
      };
      const r = hitCard(this.proj, 30, 30) || hitCard(this.bouncers, 50, 70);
      if (r) return r;
      if (this.decoy) {
        if (this.step !== 3) return null;
        for (const c of this.decoy.cards) {
          if (act.hits.has(c) || !overlap(hb, { x: c.x - 48, y: c.y - 67, w: 96, h: 134 })) continue;
          act.hits.add(c);
          if (c.real) { this.endShuffle(true); this.g.achieve('eagle'); act.hits.add(this); this.take(MOVES[act.k].dmg + 2); return { x: c.x, y: c.y, heavy: true, color: '#ffe417' }; }
          c.joker = true;
          this.endShuffle(false);
          return { x: c.x, y: c.y, heavy: false, color: '#b58fe8' };
        }
        return null;
      }
      if (this.dying || this.state === 'enter' || act.hits.has(this) || !overlap(hb, this.body())) return null;
      act.hits.add(this);
      const mv = MOVES[act.k];
      this.take(mv.dmg + (this.dazed ? 1 : 0));
      return { x: clamp(hb.x + hb.w / 2, this.x - 48, this.x + 48), y: clamp(hb.y + hb.h / 2, this.y - 67, this.y + 67), heavy: !!mv.heavy || this.dazed };
    }
    recover() { this.flipA = 0; this.rot = 0; this.go('idle'); }
    anchor() { return { x: this.x, y: this.y, r: 66 }; }
    clear() { this.proj = []; this.bouncers = []; this.drops = []; this.bursts = []; this.decoy = null; }
    dieUpdate(dt) {
      this.face = 'dead';
      if (this.step === 0) { this.step = 1; this.flipA = 0; this.vx = this.x < W / 2 ? 360 : -360; this.vy = -460; }
      this.vy += 1300 * dt; this.x += this.vx * dt; this.y += this.vy * dt; this.rot += dt * 2.4 * sign(this.vx);
      if (this.y + 67 > FLOOR) { this.y = FLOOR - 67; this.vy = -Math.abs(this.vy) * 0.82; this.g.snd.play('card'); }
      if (!this.gone && (this.x < -80 || this.x > W + 80)) { this.gone = true; this.st = 0; }
      if (this.gone && this.st > 0.8) this.done = true;
    }
    drawCard(ctx, x, y, rot, flipA, kind, flash) {
      const spr = sprites(), c = Math.cos(flipA), face = c >= 0;
      ctx.save();
      ctx.translate(x, y); ctx.rotate(rot); ctx.scale(Math.max(0.03, Math.abs(c)), 1);
      ctx.drawImage(face ? spr[kind] : spr.back, -48, -67, 96, 134);
      if (face && kind === 'king') this.kingFace(ctx);
      if (flash > 0) { ctx.globalAlpha = Math.min(0.8, flash * 7); ctx.fillStyle = '#fff'; rr(ctx, -47, -66, 94, 132, 7); ctx.fill(); ctx.globalAlpha = 1; }
      ctx.restore();
    }
    kingFace(ctx) {
      const f = this.face;
      ctx.strokeStyle = '#1b1b1b'; ctx.fillStyle = '#1b1b1b'; ctx.lineCap = 'round'; ctx.lineWidth = 1.8;
      if (f === 'dead') {
        for (const sx of [-5, 5]) { ctx.beginPath(); ctx.moveTo(sx - 2.5, -16.5); ctx.lineTo(sx + 2.5, -11.5); ctx.moveTo(sx + 2.5, -16.5); ctx.lineTo(sx - 2.5, -11.5); ctx.stroke(); }
      } else if (f === 'dizzy') {
        for (const sx of [-5, 5]) { ctx.beginPath(); ctx.arc(sx, -14, 2.4, this.t * 9, this.t * 9 + 5); ctx.stroke(); }
      } else if (f === 'hurt') {
        for (const sx of [-5, 5]) { ctx.beginPath(); ctx.moveTo(sx - 2.5, -14); ctx.lineTo(sx + 2.5, -14); ctx.stroke(); }
      } else {
        dot(ctx, -5, -14, 1.7); dot(ctx, 5, -14, 1.7);
      }
      if (f === 'angry') { ctx.beginPath(); ctx.moveTo(-9, -20); ctx.lineTo(-2, -17); ctx.moveTo(9, -20); ctx.lineTo(2, -17); ctx.stroke(); }
      else if (f === 'calm') { ctx.beginPath(); ctx.moveTo(-8, -19); ctx.lineTo(-2, -19); ctx.moveTo(8, -19); ctx.lineTo(2, -19); ctx.stroke(); }
    }
    drawBack(ctx) {
      for (const pl of this.plats) {
        rr(ctx, pl.x1, pl.y, pl.x2 - pl.x1, 16, 4); ctx.fillStyle = '#fff'; ctx.fill(); ctx.strokeStyle = '#1b1b1b'; ctx.lineWidth = 1.2; ctx.stroke();
        rr(ctx, pl.x1 + 4, pl.y + 3, pl.x2 - pl.x1 - 8, 10, 2); ctx.fillStyle = '#1f55c9'; ctx.fill();
        ctx.save(); ctx.clip(); ctx.strokeStyle = '#5b8def'; ctx.lineWidth = 1;
        for (let x = pl.x1 - 10; x < pl.x2 + 10; x += 7) { ctx.beginPath(); ctx.moveTo(x, pl.y); ctx.lineTo(x + 16, pl.y + 16); ctx.stroke(); }
        ctx.restore();
      }
      if (this.trailUsed) ctx.drawImage(this.trail, 0, 0, W, H);
      for (const d of this.drops) {
        if (d.st !== 'mark' || d.t < 0 || Math.floor(d.t * 10) % 2) continue;
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2; ctx.setLineDash([6, 4]);
        rr(ctx, d.x - 28, FLOOR - 78, 56, 78, 6); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    draw(ctx) {
      if (this.gone) return;
      if (this.decoy) {
        for (const c of this.decoy.cards) this.drawCard(ctx, c.x, c.y, 0, c.flipA, c.real ? 'king' : 'joker', 0);
        return;
      }
      const sh = clamp(1 - (FLOOR - (this.y + 67)) / 420, 0.25, 1);
      ctx.fillStyle = `rgba(0,0,0,${0.25 * sh})`; ctx.beginPath(); ctx.ellipse(this.x, FLOOR - 1, 44 * sh, 7 * sh, 0, 0, TAU); ctx.fill();
      this.drawCard(ctx, this.x + this.joltX(), this.y, this.rot, this.flipA, 'king', this.flash);
      if (this.dazed) stars(ctx, this.x, this.y - 84, this.t);
    }
    drawFront(ctx) {
      const spr = sprites();
      for (const b of this.bursts) {
        const s = 1 + b.t * 0.8;
        ctx.globalAlpha = Math.max(0, 1 - b.t / 0.45);
        ctx.save(); ctx.translate(b.x, b.y); ctx.scale(s, s); ctx.drawImage(spr.joker, -48, -67, 96, 134); ctx.restore();
        ctx.globalAlpha = 1;
      }
      for (const c of this.bouncers) ctx.drawImage(spr.aces[c.suit], c.x - 28, c.y - 39, 56, 78);
      for (const d of this.drops) {
        if (d.st === 'mark') continue;
        ctx.globalAlpha = d.st === 'lie' ? Math.max(0, 1 - d.t / 0.6) : 1;
        ctx.drawImage(spr.aces[d.suit], d.x - 28, d.y - 39, 56, 78);
        ctx.globalAlpha = 1;
      }
      for (const c of this.proj) { ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.a); ctx.drawImage(spr.small, -17, -24, 34, 48); ctx.restore(); }
    }
  }

  /* ---- 3. Pinball: knock the ball into the bumper boss; beams, tilt and multiball ---- */
  class Pinball extends Boss {
    constructor(g) {
      super(g, 42, 2, 'pinball');
      Object.assign(this, { x: W / 2, y: -90, baseY: 132, r: 50, mouth: 0, tiltDir: 0, ph: 0 });
      this.balls = []; this.beams = [];
      this.bumpers = [{ x: 184, y: 262, r: 30, lit: 0 }, { x: 776, y: 262, r: 30, lit: 0 }];
      this.flips = [{ side: -1, px: 44, a: 0.14, up: 0, cd: 0, stand: 0 }, { side: 1, px: 916, a: 0.14, up: 0, cd: 0, stand: 0 }];
      this.dmd = { text: 'PINBALL.EXE', t: 0 };
    }
    say(text, dur) { this.dmd = { text, t: dur }; }
    update(dt) {
      super.update(dt);
      const g = this.g, p = g.player, p2 = this.phase === 2;
      this.mouth = Math.max(0, this.mouth - dt * 2.5);
      if (this.dmd.t > 0) { this.dmd.t -= dt; if (this.dmd.t <= 0) this.dmd = { text: 'PINBALL.EXE', t: 0 }; }
      if (this.state !== 'enter' && !this.dying) {
        this.ph += dt * (p2 ? 0.8 : 0.5);
        this.x = W / 2 + Math.sin(this.ph) * 200;
        this.y = this.baseY + Math.sin(this.t * 1.3) * 6;
      }
      switch (this.state) {
        case 'enter':
          this.y = lerp(-90, this.baseY, easeOut(Math.min(1, this.st / 1.1)));
          if (this.st > 1.2) { this.go('idle'); this.spit(0); }
          break;
        case 'idle':
          if (this.st > (p2 ? 0.9 : 1.3)) {
            let next = this.choose(p2 ? [['spit', 3], ['lanes', 3], ['tilt', 2], ['multi', 2]] : [['spit', 4], ['lanes', 3]]);
            if ((next === 'spit' || next === 'multi') && this.balls.length >= (p2 ? 4 : 2)) next = 'lanes';
            this.go(next);
          }
          break;
        case 'spit':
          this.mouth = Math.max(this.mouth, Math.min(1, this.st * 3));
          if (this.step === 0 && this.st > 0.5) { this.step = 1; this.spit(0); }
          if (this.st > 0.9) this.go('idle');
          break;
        case 'multi':
          this.mouth = Math.max(this.mouth, Math.min(1, this.st * 3));
          if (this.step === 0 && this.st > 0.55) { this.step = 1; [-190, 0, 190].forEach((o) => this.spit(o)); }
          if (this.st > 1.1) this.go('idle');
          break;
        case 'lanes':
          if (this.step === 0) { this.step = 1; this.planBeams(); }
          if (this.st > 1.5) this.go('idle');
          break;
        case 'tilt': {
          if (this.step === 0) { this.step = 1; this.tiltDir = Math.random() < 0.5 ? -1 : 1; this.say('TILT', 2.4); g.snd.play('tilt'); g.fx.shake(6, 0.3); }
          const k = this.st < 0.3 ? this.st / 0.3 : this.st > 2.1 ? Math.max(0, (2.4 - this.st) / 0.3) : 1;
          g.tilt = this.tiltDir * 0.03 * k; g.windX = this.tiltDir * 700 * k; g.slip = k > 0;
          const low = this.flips[this.tiltDir < 0 ? 0 : 1];
          if (this.st > 0.5 && low.cd <= 0) low.force = true;
          if (this.st > 2.4) { g.tilt = 0; g.windX = 0; g.slip = false; this.go('idle'); }
          break;
        }
        case 'die': this.dieUpdate(dt); break;
      }
      this.bumpers.forEach((b) => { b.lit = Math.max(0, b.lit - dt); });
      this.updateBalls(dt, p);
      this.updateFlips(dt, p);
      this.updateBeams(dt, p);
    }
    spit(offset) {
      if (this.balls.length >= (this.phase === 2 ? 4 : 2)) return;
      const p = this.g.player, T = 0.95, tx = clamp(p.x + offset, 90, W - 90), ty = FLOOR - 40;
      const sx = this.x, sy = this.y + this.r * 0.6;
      this.balls.push({ x: sx, y: sy, vx: (tx - sx) / T, vy: (ty - sy - 0.5 * 900 * T * T) / T, r: 13, charge: 0, t: 0, hurtCd: 0.2, fade: 0 });
      this.mouth = 1;
      this.g.snd.play('ball');
    }
    bounce(b, cx, cy, r, kick) {
      const dx = b.x - cx, dy = b.y - cy, d = Math.hypot(dx, dy) || 1;
      if (d >= b.r + r) return false;
      const nx = dx / d, ny = dy / d;
      b.x = cx + nx * (b.r + r + 0.5); b.y = cy + ny * (b.r + r + 0.5);
      const vn = b.vx * nx + b.vy * ny;
      if (vn < 0) { b.vx -= 2 * vn * nx; b.vy -= 2 * vn * ny; }
      const sp = Math.hypot(b.vx, b.vy) || 1, want = Math.max(kick, sp * 0.9);
      b.vx = (b.vx / sp) * want; b.vy = (b.vy / sp) * want;
      return true;
    }
    updateBalls(dt, p) {
      const g = this.g;
      for (const b of this.balls) {
        b.t += dt; b.charge = Math.max(0, b.charge - dt); b.hurtCd = Math.max(0, b.hurtCd - dt);
        if (b.t > 15 || this.dying) b.fade += dt;
        b.vx += g.windX * dt; b.vy += 900 * dt;
        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 1300) { b.vx *= 1300 / sp; b.vy *= 1300 / sp; }
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.x < LEFT + b.r) { b.x = LEFT + b.r; b.vx = Math.abs(b.vx) * 0.85; }
        if (b.x > RIGHT - b.r) { b.x = RIGHT - b.r; b.vx = -Math.abs(b.vx) * 0.85; }
        if (b.y < 62 + b.r) { b.y = 62 + b.r; b.vy = Math.abs(b.vy) * 0.8; }
        if (b.y > FLOOR - b.r) { b.y = FLOOR - b.r; b.vy = Math.abs(b.vy) > 140 ? -Math.abs(b.vy) * 0.6 : 0; b.vx *= 0.995; }
        for (const bp of this.bumpers) {
          if (this.bounce(b, bp.x, bp.y, bp.r, 700)) { bp.lit = 0.18; g.snd.play('bumper'); g.fx.ring(bp.x, bp.y, bp.r, bp.r + 20, 0.2, '#fff3a0', 3); }
        }
        if (!this.dying && this.state !== 'enter' && Math.hypot(b.x - this.x, b.y - this.y) < b.r + this.r) {
          if (b.charge > 0) {
            b.charge = 0;
            this.bigHit(3, b.x, b.y); g.achieve('jackpot');
            if (!this.dying) { this.say('JACKPOT', 1.2); g.snd.play('jackpot'); }
          }
          this.bounce(b, this.x, this.y, this.r, 520);
          if (b.vy < 150) b.vy = 150;
        }
        for (const f of this.flips) if (this.inZone(f, b.x) && b.y > FLOOR - 70) f.want = true;
        if (b.charge <= 0 && b.hurtCd <= 0 && !b.fade && Math.hypot(b.vx, b.vy) > 220 && circleRect(b.x, b.y, b.r - 2, p.box)) {
          if (g.hurt(1, b.x)) { b.vx = -b.vx * 0.6; b.hurtCd = 0.5; }
        }
        if (b.charge > 0 && Math.random() < 0.6) g.fx.add({ k: 'dot', x: b.x, y: b.y, vx: 0, vy: 0, g: 0, life: 0.2, t: 0, r: 7, c: 'rgba(255,190,40,.7)' });
      }
      this.balls = this.balls.filter((b) => b.fade < 0.4);
    }
    inZone(f, x) { return f.side < 0 ? x < f.px + 104 : x > f.px - 104; }
    updateFlips(dt, p) {
      for (const f of this.flips) {
        f.cd -= dt;
        const inZone = this.inZone(f, p.x);
        f.stand = inZone && p.ground && !p.dead ? f.stand + dt : 0;
        if ((f.want || f.force || f.stand > 0.35) && f.cd <= 0 && !f.up) {
          f.up = 0.0001; f.cd = 0.55; f.stand = 0; f.launched = false;
          this.g.snd.play('flip');
        }
        f.want = false; f.force = false;
        if (f.up > 0) {
          f.up += dt;
          const tUp = 0.06, hold = 0.14, down = 0.22;
          f.a = f.up < tUp ? lerp(0.14, -0.62, f.up / tUp) : f.up < tUp + hold ? -0.62 : lerp(-0.62, 0.14, Math.min(1, (f.up - tUp - hold) / down));
          if (f.up < tUp + 0.03) {
            if (inZone && p.y > FLOOR - 30 && !p.dead && !f.launched) {
              // the flipper throws you at the boss: aimed where it will be at the top of the arc
              f.launched = true;
              const T = 0.52, tx = W / 2 + Math.sin(this.ph + T * (this.phase === 2 ? 0.8 : 0.5)) * 200, dir = sign(tx - p.x);
              p.launch(clamp((tx - dir * 36 - p.x) / T, -1000, 1000), -1200, this.g);
              p.face = dir; p.carry = 0.6;
            }
            for (const b of this.balls) if (this.inZone(f, b.x) && b.y > FLOOR - 90) { b.vy = -rand(860, 1000); b.vx = -f.side * rand(150, 300); }
          }
          if (f.up > tUp + hold + down) { f.up = 0; f.a = 0.14; }
        }
      }
    }
    planBeams() {
      const p = this.g.player, n = this.phase === 2 ? 5 : 3, xs = [clamp(p.x, 60, W - 60)];
      let guard = 0;
      while (xs.length < n && guard++ < 300) { const x = rand(60, W - 60); if (xs.every((q) => Math.abs(q - x) > 120)) xs.push(x); }
      this.beams = xs.map((x) => ({ x, t: 0, fired: false }));
      this.g.snd.play('tick');
    }
    updateBeams(dt, p) {
      for (const b of this.beams) {
        b.t += dt;
        if (b.t > 0.85 && b.t < 1.3) {
          if (!b.fired) { b.fired = true; this.g.snd.play('zap'); this.g.fx.shake(4, 0.2); }
          if (overlap({ x: b.x - 20, y: 60, w: 40, h: FLOOR - 60 }, p.box)) this.g.hurt(1, b.x, b.t > 1, true);
        }
      }
      this.beams = this.beams.filter((b) => b.t < 1.4);
    }
    hitBy(hb, act, p) {
      for (const b of this.balls) {
        if (b.fade || act.hits.has(b) || !circleRect(b.x, b.y, b.r + 6, hb)) continue;
        act.hits.add(b);
        const pw = { upper: [140, -1000], kick: [620, -720], akick: [620, -640], dive: [300, -780], round: [560, -800], rush: [640, -700], sweep: [520, -620], slide: [420, -600], kb1: [700, -760], kb2: [700, -760], kbAir: [700, -760], ms2: [200, -950],
          spinKick: [660, -760], spinFist: [520, -700], rise: [160, -1000], slam: [300, -700], quake: [240, -900], heavyP: [720, -700], flyK: [700, -720],
          overhand: [560, -760], elbow: [480, -660], knee: [300, -950], lowKick: [560, -560], axe: [320, -700], akick2: [620, -640] }[act.k] || [480, -680];
        b.vx = p.face * pw[0]; b.vy = pw[1]; b.charge = 2.6; b.hurtCd = 0.3;
        // aim assist: a shot sent the boss's way flies to where the boss will be when it gets there
        const dx0 = this.x - b.x;
        if (this.state !== 'enter' && !this.dying && (sign(dx0) === p.face || Math.abs(dx0) < 120)) {
          const T = clamp(0.35 + Math.abs(dx0) / 1400, 0.4, 0.8);
          const tx = W / 2 + Math.sin(this.ph + T * (this.phase === 2 ? 0.8 : 0.5)) * 200;
          b.vx = (tx - b.x) / T; b.vy = (this.baseY - b.y - 0.5 * 900 * T * T) / T;
        }
        return { x: b.x, y: b.y, heavy: true, color: '#ffd24a' };
      }
      if (this.dying || this.state === 'enter' || act.hits.has(this) || !circleRect(this.x, this.y, this.r, hb)) return null;
      act.hits.add(this);
      const mv = MOVES[act.k];
      this.take(mv.dmg);
      return { x: clamp(hb.x + hb.w / 2, this.x - 40, this.x + 40), y: clamp(hb.y + hb.h / 2, this.y - 40, this.y + 40), heavy: !!mv.heavy };
    }
    anchor() { return { x: this.x, y: this.y, r: this.r + 6 }; }
    clear() {
      this.beams = [];
      this.balls.forEach((b) => { b.fade = b.fade || 0.001; });
      const g = this.g; g.tilt = 0; g.windX = 0; g.slip = false;
    }
    dieUpdate() {
      const g = this.g;
      this.mouth = 1;
      if (this.step === 0) { this.step = 1; this.say('UNINSTALLED', 5); }
      this.x += rand(-2, 2);
      if (this.step === 1 && this.st > 1.2) {
        this.step = 2; this.st = 0; this.gone = true;
        g.fx.debris(this.x, this.y, 30, ['#e0233c', '#fff', '#2350d8', '#ffd23f', '#5bd6ff'], 1.5);
        g.fx.ring(this.x, this.y, 10, 140, 0.5, '#fff', 6); g.fx.sparks(this.x, this.y, 0, 18, '#ffd23f');
        g.fx.shake(14, 0.45); g.snd.play('boom');
      } else if (this.step === 2 && this.st > 0.8) this.done = true;
    }
    drawBack(ctx) {
      const on = this.dmd.t > 0 && Math.floor(this.dmd.t * 6) % 2 === 0 && this.dmd.text !== 'UNINSTALLED';
      dotText(ctx, this.dmd.text, W / 2, FLOOR + 35, 3, on ? '#ffe0a0' : '#ff8c1a');
      for (const b of this.beams) {
        if (b.t > 0.85) continue;
        const blink = Math.floor(b.t * 12) % 2 === 0;
        ctx.fillStyle = blink ? '#5bd6ff' : 'rgba(91,214,255,.3)';
        ctx.beginPath(); ctx.moveTo(b.x - 12, 72); ctx.lineTo(b.x + 12, 72); ctx.lineTo(b.x, 90); ctx.closePath(); ctx.fill();
        ctx.strokeStyle = 'rgba(91,214,255,.35)'; ctx.lineWidth = 2; ctx.setLineDash([6, 8]);
        ctx.beginPath(); ctx.moveTo(b.x, 96); ctx.lineTo(b.x, FLOOR); ctx.stroke(); ctx.setLineDash([]);
      }
      for (const b of this.bumpers) drawBumper(ctx, b.x, b.y, b.r, b.lit > 0);
      for (const f of this.flips) {
        const ready = f.stand > 0 && Math.floor(this.t * 8) % 2 === 0;
        if (ready) { ctx.fillStyle = 'rgba(255,210,63,.35)'; ctx.fillRect(f.side < 0 ? LEFT : RIGHT - 110, FLOOR - 4, 110, 4); }
        drawFlipper(ctx, f.px, FLOOR - 8, f.a, f.side, 110);
      }
    }
    draw(ctx) {
      if (this.gone) return;
      const p = this.g.player;
      pinballFace(ctx, this.x + this.joltX(), this.y, this.r, this.t, p.x, p.y - 40, this.mouth, this.flash);
    }
    drawFront(ctx) {
      for (const b of this.balls) { ctx.globalAlpha = 1 - b.fade / 0.4; drawBall(ctx, b.x, b.y, b.r, b.charge); ctx.globalAlpha = 1; }
      for (const b of this.beams) {
        if (b.t < 0.85) continue;
        const k = clamp((b.t - 0.85) / 0.45, 0, 1), w = 40 * (1 - k * 0.6);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const gr = ctx.createLinearGradient(b.x - w, 0, b.x + w, 0);
        gr.addColorStop(0, 'rgba(91,214,255,0)'); gr.addColorStop(0.5, 'rgba(220,250,255,.95)'); gr.addColorStop(1, 'rgba(91,214,255,0)');
        ctx.fillStyle = gr; ctx.fillRect(b.x - w, 60, w * 2, FLOOR - 60);
        ctx.restore();
      }
    }
  }

  /* ---- 4. Error.exe: what is left of the system once three of its games are gone ---- */
  // On the desktop it rains error pop-ups that sit a moment on the taskbar as ledges, throws critical icons (hit
  // them back), freezes into a Not Responding beam (low: jump it; high: slide under it) and slams down onto the
  // taskbar, where its OK button can be pressed. Halfway it crashes to a blue screen: stop codes sweep across as
  // bars of text and hourglasses fall.
  const STOPS = ['IRQL_NOT_LESS_OR_EQUAL', 'PAGE_FAULT_IN_NONPAGED_AREA', 'KMODE_EXCEPTION_NOT_HANDLED', 'INACCESSIBLE_BOOT_DEVICE', 'STOP: 0x0000007B', 'STOP: 0x000000D1', 'STOP: 0x0000B055'];
  class SysError extends Boss {
    constructor(g) {
      super(g, 50, 3, 'desktop');
      Object.assign(this, { x: W / 2, y: -140, baseY: 190, w: 210, h: 128, vy: 0, tilt: 0, lastX: W / 2, okT: 0, ghost: 0, glitch: 0, msg: 'idle', chained: false, side: 1 });
      this.pops = []; this.icons = []; this.beams = []; this.lines = []; this.glasses = [];
    }
    body() { return { x: this.x - this.w / 2, y: this.y - this.h / 2, w: this.w, h: this.h }; }
    okRect() { return { x: this.x + this.w / 2 - 72, y: this.y + this.h / 2 - 30, w: 60, h: 22 }; }
    update(dt) {
      super.update(dt);
      const g = this.g, p = g.player, p2 = this.phase === 2;
      this.okT = Math.max(0, this.okT - dt);
      this.ghost = damp(this.ghost, this.state === 'freeze' || this.dying ? 0.45 : 0, 8, dt);
      // it leans into its motion like a window being dragged
      this.tilt = damp(this.tilt, clamp((this.x - this.lastX) / Math.max(dt, 1e-4) / 3000, -0.08, 0.08), 8, dt);
      this.lastX = this.x;
      switch (this.state) {
        case 'enter':
          this.y = lerp(-140, this.baseY, easeOut(Math.min(1, this.st / 1.1)));
          if (this.st > 1.2) { this.go('idle'); g.snd.play('ding'); }
          break;
        case 'idle':
          this.msg = 'idle';
          this.x = approach(this.x, clamp(p.x + (p.x < W / 2 ? 210 : -210), 130, W - 130), (p2 ? 220 : 160) * dt);
          this.y = damp(this.y, this.baseY + Math.sin(this.t * 2) * 8, 4, dt);
          if (this.st > (p2 ? 0.7 : 0.85)) {
            this.go(this.choose(p2 ? [['cascade', 2], ['icons', 3], ['freeze', 2], ['slam', 3], ['text', 3], ['rain', 2]] : [['cascade', 3], ['icons', 4], ['freeze', 3], ['slam', 3]]));
          }
          break;
        case 'cascade': {
          this.msg = 'cascade';
          this.y = damp(this.y, this.baseY - 24, 5, dt);
          const n = p2 ? 6 : 4;
          if (this.step === 0 && this.st > 0.3) { this.step = 1; this.cascade(n); }
          if (this.st > 1.7 + n * 0.14) this.go('idle');
          break;
        }
        case 'icons': {
          this.msg = 'icons';
          this.y = damp(this.y, this.baseY - 10, 5, dt);
          const n = p2 ? 5 : 3, gap = p2 ? 0.2 : 0.26;
          if (this.step === 0 && this.st > 0.05) { this.step = 1; g.snd.play('ding'); }
          while (this.step > 0 && this.step <= n && this.st >= 0.45 + (this.step - 1) * gap) { this.fireIcon(); this.step += 1; }
          if (this.st > 0.45 + n * gap + 0.5) this.go('idle');
          break;
        }
        case 'freeze':
          this.msg = 'freeze';
          this.y = damp(this.y, this.baseY - 30, 5, dt);
          if (this.step === 0 && this.st > 0.25) { this.step = 1; this.planBeam(Math.random() < 0.5); }
          // on the blue screen a second line follows at the other height
          if (p2 && this.step === 1 && this.st > 1.05) { this.step = 2; this.planBeam(!this.beams.length || !this.beams[this.beams.length - 1].low); }
          if (this.st > (p2 ? 2.4 : 1.7)) this.go('idle');
          break;
        case 'slam': this.slam(dt, p, p2); break;
        case 'text': {
          this.msg = 'text';
          this.y = damp(this.y, this.baseY - 40, 5, dt);
          const n = 4, gap = 0.75;
          if (this.step === 0) { this.step = 1; this.side = Math.random() < 0.5 ? -1 : 1; }
          while (this.step <= n && this.st >= 0.5 + (this.step - 1) * gap) { this.textLine(); this.step += 1; }
          if (this.st > 0.5 + n * gap + 1.8) this.go('idle');
          break;
        }
        case 'rain':
          this.msg = 'rain';
          this.y = damp(this.y, this.baseY - 30, 5, dt);
          if (this.step === 0 && this.st > 0.3) { this.step = 1; this.hourglasses(8); }
          if (this.st > 2.6) this.go('idle');
          break;
        case 'crash':
          // halfway down the system falls over: the screen tears, then lands on a blue screen
          this.msg = 'text';
          this.y = damp(this.y, this.baseY, 4, dt);
          if (this.st > 1.2) this.bluescreen();
          break;
        case 'die': this.dieUpdate(dt); break;
      }
      this.updatePops(dt, p);
      this.updateIcons(dt, p);
      this.updateBeams(dt, p);
      this.updateLines(dt, p);
      this.updateGlasses(dt, p);
      // landed pop-ups are ledges while they last
      this.plats = this.pops.filter((q) => q.st === 'land').map((q) => ({ x1: q.x - q.w / 2, x2: q.x + q.w / 2, y: FLOOR - q.h }));
      this.glitch = Math.max(0, this.glitch - dt);
    }
    // error pop-ups hang in a cascade over him, drop one by one, and sit a moment on the taskbar
    cascade(n) {
      const p = this.g.player, gap = 92, x0 = clamp(p.x - ((n - 1) / 2) * gap, 70, W - 70 - (n - 1) * gap);
      for (let i = 0; i < n; i++) this.pops.push({ x: x0 + i * gap, y: 96 + i * 16, w: 84, h: 56, st: 'hang', t: -i * 0.14, vy: 0 });
      this.g.snd.play('winpop');
    }
    updatePops(dt, p) {
      const g = this.g;
      for (const q of this.pops) {
        q.t += dt;
        if (q.st === 'hang') { if (q.t > 0.7) { q.st = 'fall'; q.vy = 150; } }
        else if (q.st === 'fall') {
          q.vy += 2600 * dt; q.y += q.vy * dt;
          if (overlap({ x: q.x - q.w / 2, y: q.y - q.h / 2, w: q.w, h: q.h }, p.box)) g.hurt(1, q.x);
          if (q.y + q.h / 2 >= FLOOR) {
            q.y = FLOOR - q.h / 2; q.st = 'land'; q.t = 0;
            g.fx.dust(q.x - 30, FLOOR, 4); g.fx.dust(q.x + 30, FLOOR, 4); g.fx.shake(3, 0.12); g.snd.play('land');
          }
        } else if (q.st === 'land' && q.t > (this.phase === 2 ? 1.8 : 2.4)) this.closePop(q);
      }
      this.pops = this.pops.filter((q) => !q.gone);
    }
    closePop(q) {
      const g = this.g;
      q.gone = true;
      g.fx.debris(q.x, q.y, 8, ['#0053ee', '#ece9d8', '#e0301e']); g.fx.ring(q.x, q.y, 6, 34, 0.25, '#fff', 3); g.snd.play('click');
    }
    fireIcon() {
      const p = this.g.player, sx = this.x - this.w / 2 + 30, sy = this.y + 6, tx = p.x, ty = p.y - 40;
      const d = Math.hypot(tx - sx, ty - sy) || 1, sp = this.phase === 2 ? 470 : 390;
      this.icons.push({ x: sx, y: sy, vx: ((tx - sx) / d) * sp, vy: ((ty - sy) / d) * sp, r: 13, st: 'fly', t: 0, spin: 0 });
      this.g.snd.play('swing');
    }
    updateIcons(dt, p) {
      const g = this.g;
      for (const c of this.icons) {
        c.t += dt; c.x += c.vx * dt; c.y += c.vy * dt; c.spin += dt * (c.st === 'back' ? 16 : 6);
        if (c.st === 'back') {
          // hit back, it homes into the window that threw it
          const dx = this.x - c.x, dy = this.y - c.y, d = Math.hypot(dx, dy) || 1;
          c.vx = damp(c.vx, (dx / d) * 820, 6, dt); c.vy = damp(c.vy, (dy / d) * 820, 6, dt);
          if (!this.dying && overlap(this.body(), { x: c.x - c.r, y: c.y - c.r, w: c.r * 2, h: c.r * 2 })) { c.gone = true; this.bigHit(3, c.x, c.y); continue; }
        } else if (circleRect(c.x, c.y, c.r - 2, p.box) && g.hurt(1, c.x)) c.gone = true;
        if (c.y >= FLOOR - c.r && c.st === 'fly') { c.gone = true; g.fx.sparks(c.x, FLOOR - 4, 0, 6, '#ff8a7a'); }
        if (c.x < LEFT - 40 || c.x > RIGHT + 40 || c.y < -80 || c.t > 5) c.gone = true;
      }
      this.icons = this.icons.filter((c) => !c.gone);
    }
    // Not Responding: a line across the arena, low (jump it) or high (slide under it)
    planBeam(low) { this.beams.push({ low, y: low ? FLOOR - 13 : FLOOR - 58, h: low ? 24 : 22, t: 0, fired: false }); this.g.snd.play('tick'); }
    updateBeams(dt, p) {
      const g = this.g;
      for (const b of this.beams) {
        b.t += dt;
        if (b.t > 0.85 && b.t < 1.15) {
          if (!b.fired) { b.fired = true; g.snd.play('zap'); g.fx.shake(4, 0.15); }
          if (overlap({ x: LEFT, y: b.y - b.h / 2, w: RIGHT - LEFT, h: b.h }, p.box)) g.hurt(1, this.x, b.t > 0.97, true);
        }
      }
      this.beams = this.beams.filter((b) => b.t < 1.25);
    }
    slam(dt, p, p2) {
      this.msg = 'slam';
      if (this.step === 0) {
        this.x = approach(this.x, clamp(p.x, 120, W - 120), (p2 ? 520 : 420) * dt);
        this.y = damp(this.y, 150, 6, dt);
        if (this.st > (p2 ? 0.55 : 0.75)) { this.step = 1; this.st = 0; }
      } else if (this.step === 1) {
        this.y = 150 + Math.sin(this.st * 70) * 1.5;
        if (this.st > (this.chained ? 0.12 : 0.22)) { this.step = 2; this.st = 0; this.vy = 200; }
      } else if (this.step === 2) {
        this.vy += 5200 * dt; this.y += this.vy * dt;
        if (overlap(this.body(), p.box)) this.g.hurt(1, this.x, false, true);
        if (this.y + this.h / 2 >= FLOOR) {
          this.y = FLOOR - this.h / 2; this.land();
          this.step = 3; this.st = 0; this.dazed = !p2 || this.chained;
        }
      } else if (this.step === 3) {
        if (!this.dazed) { if (this.st > 0.3) { this.chained = true; this.step = 4; this.st = 0; } }
        else if (this.st > (p2 ? 1.3 : 1.6)) { this.dazed = false; this.step = 5; this.st = 0; }
      } else if (this.step === 4) {
        this.y = damp(this.y, 150, 9, dt);
        this.x = approach(this.x, clamp(p.x, 120, W - 120), 560 * dt);
        if (this.st > 0.42) { this.step = 1; this.st = 0; }
      } else {
        this.y = damp(this.y, this.baseY, 5, dt);
        if (this.st > 0.6) { this.chained = false; this.go('idle'); }
      }
    }
    land() {
      const g = this.g;
      g.fx.shake(12, 0.35); g.snd.play('heavy'); g.snd.play('boom');
      g.fx.dust(this.x - 80, FLOOR, 8); g.fx.dust(this.x + 80, FLOOR, 8);
    }
    // a stop code sweeps across as a bar of text, low or high: jump it or slide under it
    textLine() {
      const low = Math.random() < 0.5, dir = this.side;
      this.lines.push({ low, dir, x: dir > 0 ? LEFT - 110 : RIGHT + 110, y: low ? FLOOR - 12 : FLOOR - 58, w: 210, h: 20, t: -0.5, text: STOPS[Math.floor(Math.random() * STOPS.length)] });
      this.g.snd.play('tick');
    }
    updateLines(dt, p) {
      for (const l of this.lines) {
        l.t += dt;
        if (l.t < 0) continue;
        l.x += l.dir * 460 * dt;
        if (overlap({ x: l.x - l.w / 2, y: l.y - l.h / 2, w: l.w, h: l.h }, p.box)) this.g.hurt(1, l.x);
        if ((l.dir > 0 && l.x - l.w / 2 > RIGHT + 20) || (l.dir < 0 && l.x + l.w / 2 < LEFT - 20)) l.gone = true;
      }
      this.lines = this.lines.filter((l) => !l.gone);
    }
    // Please wait: hourglasses fall where the floor blinks, the first where he stands
    hourglasses(n) {
      const p = this.g.player, xs = [clamp(p.x, 60, W - 60)];
      let guard = 0;
      while (xs.length < n && guard++ < 300) { const x = rand(60, W - 60); if (xs.every((q) => Math.abs(q - x) > 70)) xs.push(x); }
      this.glasses = xs.map((x, i) => ({ x, y: -40, vy: 0, st: 'mark', t: -i * 0.12 }));
      this.g.snd.play('tick');
    }
    updateGlasses(dt, p) {
      const g = this.g;
      for (const h of this.glasses) {
        h.t += dt;
        if (h.st === 'mark' && h.t > 0.65) { h.st = 'fall'; h.vy = 300; }
        else if (h.st === 'fall') {
          h.vy += 2400 * dt; h.y += h.vy * dt;
          if (overlap({ x: h.x - 11, y: h.y - 16, w: 22, h: 32 }, p.box)) g.hurt(1, h.x);
          if (h.y + 16 >= FLOOR) { h.y = FLOOR - 16; this.shatter(h); }
        }
      }
      this.glasses = this.glasses.filter((h) => !h.gone);
    }
    shatter(h) {
      h.gone = true;
      this.g.fx.debris(h.x, h.y, 8, ['#ffe39a', '#d8a93a', '#ffffff', '#6d6a60'], 0.6); this.g.snd.play('clack');
    }
    onPhaseTwo() {
      this.clear(); this.dazed = false; this.chained = false;
      this.go('crash'); this.glitch = 1.2;
      this.g.snd.music(null); this.g.snd.play('glitch');
    }
    bluescreen() {
      const g = this.g;
      this.arena = 'bsod'; this.glitch = 0;
      g.fx.flash('#0000aa', 0.35); g.fx.shake(10, 0.4);
      g.snd.music('bsod'); g.snd.musicLevel(2);
      this.go('idle');
    }
    hitBy(hb, act, p) {
      // pop-ups still in the air close when hit; the ones on the taskbar are ledges and are left alone
      for (const q of this.pops) {
        if (q.st === 'land' || act.hits.has(q) || !overlap(hb, { x: q.x - q.w / 2, y: q.y - q.h / 2, w: q.w, h: q.h })) continue;
        act.hits.add(q); this.closePop(q);
        return { x: q.x, y: q.y, heavy: false, color: '#9fd0ff' };
      }
      for (const c of this.icons) {
        if (c.st !== 'fly' || act.hits.has(c) || !circleRect(c.x, c.y, c.r + 6, hb)) continue;
        act.hits.add(c); Object.assign(c, { st: 'back', vx: p.face * 700, vy: -320, t: 0 });
        return { x: c.x, y: c.y, heavy: true, color: '#ff8a7a' };
      }
      for (const h of this.glasses) {
        if (h.st !== 'fall' || act.hits.has(h) || !overlap(hb, { x: h.x - 11, y: h.y - 16, w: 22, h: 32 })) continue;
        act.hits.add(h); this.shatter(h);
        return { x: h.x, y: h.y, heavy: false, color: '#ffe39a' };
      }
      if (this.dying || this.state === 'enter' || act.hits.has(this) || !overlap(hb, this.body())) return null;
      act.hits.add(this);
      // lying on the taskbar, its OK button can be pressed
      const mv = MOVES[act.k], ok = this.dazed && overlap(hb, this.okRect());
      if (ok) { this.okT = 0.3; this.g.snd.play('click'); this.g.achieve('clickok'); }
      this.take(mv.dmg + (this.dazed ? 1 : 0) + (ok ? 1 : 0));
      const r = this.okRect();
      return ok ? { x: r.x + r.w / 2, y: r.y + r.h / 2, heavy: true, color: '#fbc761' }
        : { x: clamp(hb.x + hb.w / 2, this.x - this.w / 2, this.x + this.w / 2), y: clamp(hb.y + hb.h / 2, this.y - this.h / 2, this.y + this.h / 2), heavy: !!mv.heavy || this.dazed };
    }
    recover() {
      this.chained = false;
      if (this.phase === 2 && this.arena !== 'bsod') this.bluescreen(); else this.go('idle');
    }
    anchor() { return { x: this.x, y: this.y, r: 70 }; }
    clear() { this.pops = []; this.icons = []; this.beams = []; this.lines = []; this.glasses = []; this.plats = []; }
    dieUpdate(dt) {
      const g = this.g;
      this.dazed = false; this.msg = 'die';
      if (this.step === 0) {
        this.x += rand(-2.5, 2.5);
        this.y = damp(this.y, Math.min(this.y, FLOOR - this.h / 2), 3, dt);
        if (this.st > 1.3) {
          this.step = 1; this.st = 0; this.gone = true;
          g.fx.debris(this.x, this.y, 30, ['#0053ee', '#ece9d8', '#e0301e', '#ffffff', '#0997ff'], 1.5);
          g.fx.ring(this.x, this.y, 10, 150, 0.5, '#fff', 6); g.fx.sparks(this.x, this.y, 0, 18, '#ff8a7a');
          g.fx.shake(14, 0.45); g.snd.play('boom');
          // with the error gone the system comes back: the blue screen gives way to the desktop
          if (this.arena === 'bsod') { this.arena = 'desktop'; g.fx.flash('#ffffff', 0.4); }
        }
      } else if (this.st > 0.9) this.done = true;
    }
    drawBack(ctx) {
      // ledges, and the warnings for what is about to land or sweep through
      for (const q of this.pops) if (q.st === 'land') { ctx.globalAlpha = q.t > (this.phase === 2 ? 1.5 : 2.1) && Math.floor(q.t * 12) % 2 ? 0.4 : 1; miniWin(ctx, q.x, q.y, q.w, q.h); ctx.globalAlpha = 1; }
      for (const q of this.pops) if (q.st !== 'land') { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(q.x, FLOOR - 1, q.w * 0.45, 5, 0, 0, TAU); ctx.fill(); }
      for (const b of this.beams) {
        if (b.t > 0.85 || Math.floor(b.t * 10) % 2) continue;
        ctx.strokeStyle = 'rgba(220,245,255,.9)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
        ctx.beginPath(); ctx.moveTo(LEFT, b.y); ctx.lineTo(RIGHT, b.y); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#dff6ff';
        for (const [x, d] of [[LEFT + 4, 1], [RIGHT - 4, -1]]) { ctx.beginPath(); ctx.moveTo(x, b.y - 9); ctx.lineTo(x + d * 14, b.y); ctx.lineTo(x, b.y + 9); ctx.closePath(); ctx.fill(); }
      }
      for (const l of this.lines) {
        if (l.t >= 0 || Math.floor(l.t * 12) % 2) continue;
        const x = l.dir > 0 ? LEFT + 6 : RIGHT - 6;
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(x, l.y - 10); ctx.lineTo(x + l.dir * 18, l.y); ctx.lineTo(x, l.y + 10); ctx.closePath(); ctx.fill();
      }
      for (const h of this.glasses) {
        if (h.st !== 'mark' || h.t < 0 || Math.floor(h.t * 10) % 2) continue;
        ctx.strokeStyle = '#ffe39a'; ctx.lineWidth = 2; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(h.x - 11, FLOOR - 2); ctx.lineTo(h.x + 11, FLOOR - 2); ctx.lineTo(h.x, FLOOR - 16); ctx.closePath(); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    draw(ctx) {
      if (this.gone) return;
      const s = this.g.s, sh = clamp(1 - (FLOOR - (this.y + this.h / 2)) / 420, 0.25, 1);
      ctx.fillStyle = `rgba(0,0,0,${0.28 * sh})`; ctx.beginPath(); ctx.ellipse(this.x, FLOOR - 1, 100 * sh, 8 * sh, 0, 0, TAU); ctx.fill();
      const x = this.x + this.joltX() + (this.state === 'slam' && this.step === 1 ? rand(-2, 2) : 0) + (this.state === 'crash' || this.dying ? rand(-3, 3) : 0);
      ctx.save(); ctx.translate(x, this.y); ctx.rotate(this.tilt);
      errorBox(ctx, 0, 0, this.w, this.h, {
        title: this.state === 'freeze' || this.dying ? s.errNotResp : s.names[3], text: s.errMsg[this.msg], bsod: this.arena === 'bsod', ghost: this.ghost, flash: this.flash,
        ok: this.okT > 0 ? 'down' : this.dazed && Math.floor(this.t * 6) % 2 === 0 ? 'hot' : 'def',
      });
      ctx.restore();
      if (this.dazed) stars(ctx, this.x, this.y - this.h / 2 - 14, this.t);
    }
    drawFront(ctx) {
      for (const q of this.pops) if (q.st !== 'land') miniWin(ctx, q.x, q.y, q.w, q.h);
      for (const c of this.icons) {
        if (c.st === 'back') { ctx.fillStyle = 'rgba(255,255,255,.35)'; dot(ctx, c.x, c.y, c.r + 6); }
        ctx.save(); ctx.translate(c.x, c.y); ctx.rotate(c.spin); errorIcon(ctx, 0, 0, c.r); ctx.restore();
      }
      for (const b of this.beams) {
        if (b.t < 0.85) continue;
        const k = clamp((b.t - 0.85) / 0.3, 0, 1), h = b.h * (1 - k * 0.5);
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const gr = ctx.createLinearGradient(0, b.y - h, 0, b.y + h);
        gr.addColorStop(0, 'rgba(160,220,255,0)'); gr.addColorStop(0.5, 'rgba(235,250,255,.95)'); gr.addColorStop(1, 'rgba(160,220,255,0)');
        ctx.fillStyle = gr; ctx.fillRect(LEFT, b.y - h, RIGHT - LEFT, h * 2);
        ctx.restore();
      }
      for (const l of this.lines) {
        if (l.t < 0) continue;
        ctx.fillStyle = '#fff'; ctx.fillRect(l.x - l.w / 2, l.y - l.h / 2, l.w, l.h);
        ctx.fillStyle = '#0000aa'; ctx.font = `bold 13px ${MONO}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(l.text, l.x, l.y + 1);
      }
      for (const h of this.glasses) if (h.st === 'fall') hourglass(ctx, h.x, h.y, 1);
      if (this.glitch > 0) this.drawGlitch(ctx);
    }
    // the crash: bands of blue screen and torn stripes flicker over the desktop
    drawGlitch(ctx) {
      const n = 5 + Math.floor(Math.random() * 7);
      for (let i = 0; i < n; i++) {
        const y = rand(0, H), h = rand(4, 46), blue = Math.random() < 0.65;
        ctx.fillStyle = blue ? '#0000aa' : `rgba(255,255,255,${rand(0.3, 0.8)})`;
        ctx.fillRect(rand(-60, 60), y, W + 120, h);
        if (blue && h > 16) { ctx.fillStyle = '#fff'; ctx.font = `13px ${MONO}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(STOPS[i % STOPS.length], rand(20, W - 300), y + h / 2); }
      }
    }
  }

  /* ---- practice: the recycle bin on a spring, a sparring partner that never goes down ---- */
  class Dummy extends Boss {
    constructor(g) {
      super(g, 9999, 4, 'practice');
      Object.assign(this, { x: 700, y: FLOOR - 70, ang: 0, angV: 0, cool: 0.6 });
      this.papers = [];
      this.go('idle');
    }
    body() { return { x: this.x - 34, y: FLOOR - 118, w: 68, h: 100 }; }
    // every hit shows its number and rocks the bin; its health never runs down
    take(n, special) {
      const shown = n + (this.paintT > 0 ? 1 : 0), hit = super.take(n, special);
      this.hp = this.hpMax;
      if (hit) this.g.fx.text(this.x + rand(-14, 14), FLOOR - 142, String(shown), '#fff', 17);
      return hit;
    }
    update(dt) {
      super.update(dt);
      // the spring pulls it upright again
      this.angV += (-this.ang * 90 - this.angV * 6) * dt; this.ang = clamp(this.ang + this.angV * dt, -0.5, 0.5);
      if (this.state === 'throw' && (this.cool -= dt) <= 0 && this.papers.length < 2) { this.cool = 1.9; this.toss(); }
      this.updatePapers(dt, this.g.player);
    }
    // crumpled paper lobbed at him, slow enough to time a dodge against
    toss() {
      const p = this.g.player, d = sign(p.x - this.x), sx = this.x + d * 20, sy = FLOOR - 118, T = 1.05;
      this.papers.push({ x: sx, y: sy, vx: (p.x - sx) / T, vy: (FLOOR - 40 - sy - 0.5 * 700 * T * T) / T, r: 10, spin: 0 });
      this.angV += d * 2.5;
      this.g.snd.play('swing');
    }
    updatePapers(dt, p) {
      const g = this.g;
      for (const q of this.papers) {
        q.vy += 700 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.spin += dt * 8;
        if (circleRect(q.x, q.y, q.r - 1, p.box) && g.hurt(1, q.x)) { q.gone = true; g.fx.debris(q.x, q.y, 6, ['#ffffff', '#d9d6cc'], 0.5); }
        else if (q.y > FLOOR - q.r) { q.gone = true; g.fx.dust(q.x, FLOOR, 3); }
      }
      this.papers = this.papers.filter((q) => !q.gone);
    }
    hitBy(hb, act, p) {
      for (const q of this.papers) {
        if (act.hits.has(q) || !circleRect(q.x, q.y, q.r + 4, hb)) continue;
        act.hits.add(q); q.gone = true; this.g.fx.debris(q.x, q.y, 6, ['#ffffff', '#d9d6cc'], 0.6);
        return { x: q.x, y: q.y, heavy: false, color: '#fff' };
      }
      if (act.hits.has(this) || !overlap(hb, this.body())) return null;
      act.hits.add(this);
      const mv = MOVES[act.k];
      this.take(mv.dmg);
      this.angV += p.face * (mv.heavy ? 5 : 3);
      this.g.fx.debris(this.x, FLOOR - 112, mv.heavy ? 6 : 3, ['#ffffff', '#e8e4d8', '#c9c4b4'], 0.7);
      return { x: clamp(hb.x + hb.w / 2, this.x - 34, this.x + 34), y: clamp(hb.y + hb.h / 2, FLOOR - 118, FLOOR - 20), heavy: !!mv.heavy };
    }
    // the special's lightning rocks it hard, and it goes back to whatever it was doing
    stagger() { this.clear(); this.angV += 6; }
    anchor() { return { x: this.x, y: FLOOR - 70, r: 50 }; }
    clear() { this.papers = []; }
    draw(ctx) {
      const x = this.x + this.joltX();
      ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.beginPath(); ctx.ellipse(x, FLOOR - 1, 40, 6, 0, 0, TAU); ctx.fill();
      // the stand: a base plate and a coiled spring
      ctx.fillStyle = '#6d6a60'; rr(ctx, x - 30, FLOOR - 8, 60, 8, 3); ctx.fill();
      ctx.strokeStyle = '#a9a594'; ctx.lineWidth = 3; ctx.lineJoin = 'round'; ctx.beginPath(); ctx.moveTo(x, FLOOR - 8);
      for (let i = 1; i <= 5; i++) ctx.lineTo(x + (i % 2 ? -9 : 9) + this.ang * 8 * i, FLOOR - 8 - i * 2.8);
      ctx.stroke();
      ctx.save(); ctx.translate(x, FLOOR - 22); ctx.rotate(this.ang);
      // the bin: a mesh basket, wider at the rim, with paper piled over the top
      const g = ctx.createLinearGradient(-38, 0, 38, 0);
      g.addColorStop(0, '#9fb0c8'); g.addColorStop(0.45, '#e4ebf5'); g.addColorStop(1, '#8a9bb5');
      ctx.fillStyle = '#ffffff';
      for (const [px, py, r] of [[-18, -96, 12], [4, -101, 13], [22, -94, 11], [-4, -92, 10]]) dot(ctx, px, py, r);
      ctx.strokeStyle = '#c9c4b4'; ctx.lineWidth = 1;
      for (const [px, py, r] of [[-18, -96, 12], [4, -101, 13], [22, -94, 11]]) { ctx.beginPath(); ctx.arc(px, py, r * 0.6, 0.4, 2.2); ctx.stroke(); }
      ctx.fillStyle = g; ctx.strokeStyle = '#4f5e75'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-38, -92); ctx.lineTo(38, -92); ctx.lineTo(28, 0); ctx.lineTo(-28, 0); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(79,94,117,.45)'; ctx.lineWidth = 1.2;
      for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.moveTo(i * 10.5, -88); ctx.lineTo(i * 7.6, -4); ctx.stroke(); }
      ctx.fillStyle = '#c3cede'; ctx.strokeStyle = '#4f5e75'; ctx.lineWidth = 2; rr(ctx, -41, -98, 82, 9, 4); ctx.fill(); ctx.stroke();
      // a practice target on its front
      [[17, '#e0301e'], [12, '#ffffff'], [7, '#e0301e'], [3, '#ffffff']].forEach(([r, c]) => { ctx.fillStyle = c; dot(ctx, 0, -46, r); });
      ctx.restore();
      if (this.flash > 0) { ctx.globalAlpha = Math.min(0.7, this.flash * 6); ctx.fillStyle = '#fff'; ctx.save(); ctx.translate(x, FLOOR - 22); ctx.rotate(this.ang); ctx.beginPath(); ctx.moveTo(-38, -92); ctx.lineTo(38, -92); ctx.lineTo(28, 0); ctx.lineTo(-28, 0); ctx.closePath(); ctx.fill(); ctx.restore(); ctx.globalAlpha = 1; }
    }
    drawFront(ctx) {
      for (const q of this.papers) {
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.spin);
        ctx.fillStyle = '#fbfaf6'; ctx.strokeStyle = '#8f8b7a'; ctx.lineWidth = 1.2;
        ctx.beginPath(); for (let i = 0; i < 9; i++) { const a = (i / 9) * TAU, r = q.r * (i % 2 ? 0.78 : 1); ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); } ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(1, 1); ctx.lineTo(4, -3); ctx.stroke();
        ctx.restore();
      }
    }
  }
  const BOSSES = [Mines, Cards, Pinball, SysError];

  /* ------------------------------------------------------------ the game */
  class Game {
    constructor(opts) {
      this.lang = opts.lang === 'id' ? 'id' : 'en';
      this.s = STR[this.lang];
      this.onStatus = opts.onStatus || (() => {});
      // the portfolio around the game: whose it is (for the shared result) and how to reach its contact window
      this.owner = opts.owner || ''; this.onContact = opts.onContact || null;
      // told when the run is won; answers 'new' the first time, when the stickman moves onto the real taskbar
      this.onWin = opts.onWin || null;
      // the Start menu's Exit (the portfolio closes the game's window); no Exit without it
      this.onExit = opts.onExit || null;
      this.input = new Input(); this.fx = new FX(); this.snd = Sound(); this.player = new Stick();
      Object.assign(this, {
        state: 'title', st: 0, boss: null, bossIdx: 0, paused: false, stop: 0, windX: 0, tilt: 0, slip: false, acc: 0, last: 0, k: 1,
        bg: null, god: false, gone: false, detached: 0, small: false, clock: 0, special: null, banner: null, bolt: null, itemCd: 6, paintI: 0,
        slow: 0, dodgeCd: 0, fightHits: 0, toast: null, practice: null, hoverFoe: -1, hudA: 1,
        // the leaderboard: this win's place on it (see lbCheck), and what the board dialog shows (loadBoard)
        lb: null, boardView: null,
      });
      this.items = []; this.shots = []; this.decals = [];
      this.combo = { n: 0, t: 0, pop: 0 };
      this.run = { time: 0, hits: 0, meterAt: 0, perfect: 0 };
      this.ach = loadAch(); this.toasts = [];
      this.build();
      this.loop = this.loop.bind(this);
      this.raf = requestAnimationFrame(this.loop);
      this.toTitle();
      if (DEBUG) window.__brxp = this;
    }
    build() {
      const root = document.createElement('div');
      root.className = 'gm-stage';
      root.innerHTML = '<canvas class="gm-canvas" tabindex="0" role="application"></canvas><div class="gm-layer"></div><p class="sr-only" aria-live="polite"></p>';
      this.root = root;
      this.canvas = root.querySelector('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.layer = root.querySelector('.gm-layer');
      this.live = root.querySelector('.sr-only');
      this.canvas.setAttribute('aria-label', this.s.canvasLabel);
      this.canvas.addEventListener('keydown', (e) => this.key(e, true));
      this.canvas.addEventListener('keyup', (e) => this.key(e, false));
      this.canvas.addEventListener('blur', () => { this.input.clear(); this.pause(); });
      this.canvas.addEventListener('pointerdown', () => this.snd.ensure());
      this.canvas.addEventListener('pointermove', (e) => this.point(e));
      this.canvas.addEventListener('pointerleave', () => { this.hoverFoe = -1; });
      this.canvas.addEventListener('dblclick', (e) => { if (this.point(e) >= 0) this.openFight(); });
      this.ro = new ResizeObserver(() => this.fit());
      this.ro.observe(root);
      this.onResize = () => this.checkSize();
      this.onVis = () => { if (document.hidden) this.pause(); };
      window.addEventListener('resize', this.onResize);
      document.addEventListener('visibilitychange', this.onVis);
    }
    attach(host) {
      if (this.root.parentNode !== host) host.appendChild(this.root);
      this.fit();
    }
    fit() {
      const r = this.root.getBoundingClientRect();
      if (!r.width || !r.height) return;
      const s = Math.min(r.width / W, r.height / H), cw = Math.floor(W * s), ch = Math.floor(H * s);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.style.width = cw + 'px'; this.canvas.style.height = ch + 'px';
      this.layer.style.width = cw + 'px'; this.layer.style.height = ch + 'px';
      this.layer.style.setProperty('--gm-k', (cw / W).toFixed(3));
      UI.f = Math.max(1, W / cw);
      this.layer.classList.toggle('gm-small', cw < 900);
      this.layer.style.setProperty('--gm-floor', Math.round(((H - FLOOR) * cw) / W) + 'px');
      const bw = Math.max(1, Math.round(cw * dpr)), bh = Math.max(1, Math.round(ch * dpr));
      if (this.canvas.width !== bw || this.canvas.height !== bh) { this.canvas.width = bw; this.canvas.height = bh; }
      this.k = bw / W; this.bg = null;
      this.render();
    }
    key(e, down) {
      if (DEBUG && down && !e.repeat && this.debugKey(e.code)) { e.preventDefault(); return; }
      const act = KEYS[e.code] || (e.key === ' ' ? 'jump' : null);
      if (!act || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      if (!down) { this.input.release(act); return; }
      this.snd.ensure();
      if (e.repeat) return;
      if (act === 'pause') { this.togglePause(); return; }
      if (act === 'mute') { this.toggleSound(); return; }
      if (act === 'new') { this.newGame(); return; }
      if (this.state === 'title' && (act === 'confirm' || act === 'jump' || act === 'punch')) { this.openFight(); return; }
      if (this.state === 'opening') return;
      if (act === 'confirm' && this.practice && this.state === 'fight') { this.skipLesson(); return; }
      this.input.press(act);
    }
    // ?debug in the address: 1 2 3 4 jump to a boss, G god mode, H ends the boss, I drops an item, U fills the special,
    // K takes one block of health away (never the last)
    debugKey(code) {
      const n = { Digit1: 0, Digit2: 1, Digit3: 2, Digit4: 3 }[code];
      if (n !== undefined) { this.startBoss(n); return true; }
      if (code === 'KeyG') { this.god = !this.god; return true; }
      if (code === 'KeyH' && this.boss) { this.boss.take(this.boss.hp); return true; }
      if (code === 'KeyI' && this.state === 'fight') { this.items = []; this.spawnItem(); return true; }
      if (code === 'KeyU') { this.gainMeter(100); return true; }
      if (code === 'KeyK' && this.player.hp > 1) { Object.assign(this.player, { hp: this.player.hp - 1, restore: 0, restoreShow: 0 }); return true; }
      return false;
    }

    /* ---- flow ---- */
    status(text) { this.statusText = text; this.onStatus(text); }
    say(text) { this.live.textContent = text; }
    clearField() {
      this.items = []; this.shots = []; this.decals = [];
      Object.assign(this, { special: null, shadow: null, banner: null, bolt: null, windX: 0, tilt: 0, slip: false, doneAt: 0, stop: 0, slow: 0, dodgeCd: 0 });
      this.combo = { n: 0, t: 0, pop: 0 };
      this.fx.p = [];
    }
    toTitle() {
      this.closeDialog();
      this.clearField();
      Object.assign(this, { state: 'title', st: 0, boss: null, paused: false, practice: null, lb: null });
      this.snd.music(null);
      this.player.reset(430); this.player.face = 1; this.hoverFoe = -1;
      this.status(this.s.statusMenu);
      this.showTitle();
    }
    newGame() { this.run = { time: 0, hits: 0, meterAt: 0, perfect: 0 }; this.lb = null; this.startBoss(0); }
    // the special meter carries from one boss to the next; a retry starts with what the boss started with
    startBoss(i, carry) {
      this.closeDialog();
      const meter = carry ? this.player.meter : this.run.meterAt || 0;
      this.clearField();
      Object.assign(this, { paused: false, bossIdx: i, state: 'intro', st: 0, itemCd: rand(5, 7), coffeeDone: false, fightHits: 0, practice: null });
      this.boss = new BOSSES[i](this);
      this.snd.music(this.boss.arena);
      this.input.clear();
      this.player.reset(170);
      this.player.meter = meter; this.run.meterAt = meter;
      this.status(this.bossLabel(i));
      this.say(i < 3 ? `${this.s.bossOf(i + 1, 3)}: ${this.s.names[i]}` : this.bossLabel(i));
      this.showIntro();
      this.canvas.focus({ preventScroll: true });
    }
    /* ---- practice: a recycle bin to spar with and eleven short lessons, Setup-style ---- */
    startPractice() {
      this.closeDialog();
      this.clearField();
      Object.assign(this, { paused: false, bossIdx: 4, state: 'fight', st: 0, itemCd: 99, coffeeDone: true, fightHits: 0 });
      this.practice = { step: 0, good: 0, msg: '', msgGood: false, msgT: 0, moved: 0, lastX: 420 };
      this.boss = new Dummy(this);
      this.input.clear();
      this.player.reset(420); this.player.meter = 0;
      this.snd.music('practice');
      this.status(this.s.practice);
      this.lessonStart();
      this.canvas.focus({ preventScroll: true });
    }
    // a game event; if it is the one the lesson in hand waits for, the lesson is done
    lesson(kind) {
      const pr = this.practice, les = pr && LESSONS[pr.step];
      if (!les || pr.good > 0 || this.state !== 'fight') return;
      if (kind === les[1]) {
        pr.good = 0.9;
        this.practiceMsg(this.s.lesGood, true); this.snd.play('ready');
        this.fx.ring(this.player.x, this.player.y - 40, 8, 70, 0.4, '#9dffa0', 4);
      } else if (les[0] === 'dodge' && (kind === 'hurt' || kind === 'through')) this.practiceMsg(kind === 'hurt' ? this.s.lesDodgeHit : this.s.lesDodgeLate);
    }
    updatePractice(dt) {
      const pr = this.practice, p = this.player;
      pr.msgT = Math.max(0, pr.msgT - dt);
      if (pr.good > 0 && (pr.good -= dt) <= 0) { this.nextLesson(); return; }
      const id = LESSONS[pr.step][0];
      if (id === 'move') { pr.moved += Math.abs(p.x - pr.lastX); if (pr.moved > 320) this.lesson('moved'); }
      pr.lastX = p.x;
      // the weapon lesson keeps a keyboard coming until one is in his hands; the special lesson keeps the bar full
      if (id === 'weapon' && !p.weapon && !this.items.length) this.dropPracticeItem();
      if (id === 'special' && !pr.good && p.meter < 100 && !this.special && !this.shadow) this.gainMeter(100);
    }
    nextLesson() {
      const pr = this.practice;
      Object.assign(pr, { step: pr.step + 1, good: 0, moved: 0 });
      if (pr.step >= LESSONS.length) this.practiceDone(); else this.lessonStart();
    }
    lessonStart() {
      const pr = this.practice, id = LESSONS[pr.step][0], b = this.boss, [name, how] = this.s.les[id];
      if (id === 'dodge') { b.go('throw'); b.cool = 0.8; } else if (b.state === 'throw') { b.go('idle'); b.clear(); }
      if (id === 'weapon') this.dropPracticeItem();
      this.say(`${this.s.lesStep(pr.step + 1, LESSONS.length)} ${name}. ${how.replace(/[[\]]/g, '')}`);
    }
    skipLesson() {
      if (!this.practice || this.practice.good > 0) return;
      this.snd.play('click'); this.nextLesson();
    }
    practiceMsg(text, good) { Object.assign(this.practice, { msg: text, msgGood: !!good, msgT: good ? 0.9 : 2.2 }); }
    // a keyboard comes down near him, on the side away from the edge
    dropPracticeItem() {
      const p = this.player, x = clamp(p.x + (p.x < W / 2 ? 170 : -170), 280, W - 80);
      this.items.push({ kind: 'keyboard', x, y: -40, ty: FLOOR, st: 'fall', t: 0, life: 999, color: PAINTS[1] });
      this.snd.play('winpop');
    }
    practiceDone() {
      this.state = 'drilled'; this.st = 0;
      this.boss.go('idle'); this.boss.clear();
      this.snd.music('fanfare');
      this.say(this.s.drillDone);
      this.showPracticeDone();
    }
    // "Boss 2/3: Cards.exe"; after the three games, "Final boss: Error.exe"
    bossLabel(i) { const s = this.s; return i < 3 ? s.status(i + 1, 3, s.names[i]) : s.statusFinal(s.names[i]); }
    bossDying() {
      this.state = 'bossdown'; this.st = 0;
      for (const it of this.items) this.fx.dust(it.x, it.y, 5);
      this.items = [];
      this.hitstop(0.25); this.fx.flash('#fff', 0.18); this.fx.shake(10, 0.5); this.snd.play('down'); this.snd.music(null); this.endSlow(); this.shadowOff(false);
      if (!this.fightHits) this.achieve('flawless');
    }
    playerDown() { this.state = 'dying'; this.st = 0; this.endSlow(); this.shadowOff(false); this.snd.music(null); this.snd.play('crash'); this.achieve('crash'); }
    victory() {
      this.state = 'won'; this.st = 0;
      const p = this.player;
      p.won = true; p.winPose = Math.random() < 0.5 ? 'win' : 'win2'; p.weapon = null;
      const best = +store.get(BEST_KEY) || 0, isBest = !best || this.run.time < best;
      if (isBest) store.set(BEST_KEY, this.run.time.toFixed(2));
      this.achieve('uninstall');
      if (this.rank() === 'S') this.achieve('rankS');
      this.snd.music('fanfare');
      this.say(this.s.winTitle);
      const gift = this.onWin ? this.onWin() === 'new' : false;
      this.lb = { st: 'load', name: store.get(NAME_KEY) || '' };
      this.showWin(isBest, isBest ? this.run.time : best, gift);
      this.lbCheck();
    }
    hitstop(t) { this.stop = Math.max(this.stop, t); }
    hurt(dmg, fromX, lasting, big) { return this.player.hurt(dmg, fromX, this, lasting, big); }
    plats() { return this.boss ? this.boss.plats : []; }
    // damage dealt feeds the combo counter and the special meter, and clean damage brings health back
    dealt(n, special) {
      if (!special) { this.gainMeter(n * 5.5); this.restoreHP(n); }
      this.combo = { n: this.combo.t > 0 ? this.combo.n + 1 : 1, t: 1.4, pop: 0.18 };
      if (this.combo.n >= 10) this.achieve('combo');
    }
    // every RESTORE damage in a row without taking a hit refills one block; a hit resets it (Stick.hurt)
    restoreHP(n) {
      const p = this.player;
      if (p.dead || p.hp >= p.hpMax) { p.restore = 0; return; }
      p.restore += n;
      if (p.restore >= RESTORE) { p.restore -= RESTORE; p.restoreShow = 0; this.heal(1); this.achieve('restore'); }
    }
    heal(n) {
      const p = this.player, was = p.hp;
      p.hp = Math.min(p.hpMax, p.hp + n);
      if (p.hp >= p.hpMax) { p.restore = 0; p.restoreShow = 0; }
      if (p.hp === was) return;
      Object.assign(p, { healT: 0.9, healFrom: was });
      this.fx.heal(p.x, p.y); this.fx.ring(p.x, p.y - 40, 10, 64, 0.4, '#9dffa0', 4);
      this.fx.text(p.x, p.y - 96, `+${p.hp - was}`, '#9dffa0', 20);
      this.snd.play('heal');
      this.say(this.s.healed(p.hp - was));
    }
    gainMeter(v) {
      if (this.shadow) return;
      const p = this.player, was = p.meter;
      p.meter = Math.min(100, p.meter + v);
      if (was < 100 && p.meter >= 100) { this.snd.play('ready'); this.fx.chip(p.x, p.y - 110, this.s.ready); }
    }
    /* ---- achievements ---- */
    // saved at once; the balloon waits its turn
    achieve(id) {
      if (this.practice || this.ach.got[id] || !this.s.ach[id]) return;
      this.ach.got[id] = Date.now();
      this.saveAch();
      this.toasts.push(id);
    }
    saveAch() { store.set(ACH_KEY, JSON.stringify(this.ach)); }
    achCount() { return ACHS.filter((id) => this.ach.got[id]).length; }
    // one balloon at a time, and none while the boss-removed balloon has the corner
    updateToasts(dt) {
      if (this.state === 'bossdown') return;
      if (!this.toast && this.toasts.length) {
        this.toast = { id: this.toasts.shift(), t: 0 };
        this.snd.play('unlock');
        this.say(`${this.s.achUnlocked}: ${this.s.ach[this.toast.id][0]}`);
      }
      if (this.toast && (this.toast.t += dt) > TOAST_TIME) this.toast = null;
    }
    // a dash that met an attack in its first moments: a beat of stillness, then the boss slows while he does not
    perfectDodge() {
      const p = this.player, s = this.s;
      Object.assign(this, { slow: SLOW_TIME, dodgeCd: DODGE_CD });
      this.run.perfect = (this.run.perfect || 0) + 1;
      p.dodgeT = DODGE_SAFE;
      // the dash's afterimages turn cold and linger
      for (const gh of p.ghosts) Object.assign(gh, { c: '#9fe8ff', life: 0.45 });
      p.ghosts.push({ pts: p.pts.slice(), x: p.x, y: p.y, face: p.face, t: 0, c: '#9fe8ff', life: 0.5 });
      this.hitstop(0.08); this.gainMeter(DODGE_METER); this.achieve('perfect'); this.lesson('perfect');
      this.fx.ring(p.x, p.y - 40, 8, 96, 0.42, '#9fe8ff', 5); this.fx.star(p.x, p.y - 40, '#e6f8ff', 34);
      this.fx.chip(p.x, p.y - 130, s.perfect);
      this.snd.play('perfect'); this.snd.muffle(SLOW_TIME);
      this.say(s.perfect);
    }
    // the slow runs out (heard as time coming back), or something bigger cuts it short
    endSlow(ranOut) {
      if (!this.slow && !ranOut) return;
      this.slow = 0;
      if (ranOut) this.snd.play('unslow'); else this.snd.muffle(0);
    }
    phaseTwo() {
      this.banner = { t: 0 };
      this.hitstop(0.25); this.fx.flash('rgba(255,255,255,.55)', 0.14); this.fx.shake(8, 0.4); this.snd.play('alarm'); this.snd.musicLevel(2);
      this.say(`${this.s.names[this.bossIdx]}: ${this.s.phase2}`);
    }

    /* ---- weapons and pickups ---- */
    spawnItem() {
      const p = this.player, b = this.boss;
      // coffee is the rare lifeline: only when he is down to his last blocks, once a fight, and not every time
      const heal = !this.coffeeDone && p.hp <= COFFEE_AT && Math.random() < COFFEE_CHANCE;
      const kinds = ITEM_KINDS.filter((k) => !p.weapon || k !== p.weapon.kind);
      const kind = heal ? 'coffee' : kinds[Math.floor(Math.random() * kinds.length)];
      // nothing lands on the boss; the coffee also lands well away from him, so reaching it is a run
      const bad = (q) => (b && Math.abs(q - b.x) < 150) || (heal && Math.abs(q - p.x) < 320);
      let x = rand(120, W - 120), guard = 0;
      while (bad(x) && guard++ < 40) x = rand(120, W - 120);
      if (heal) this.coffeeDone = true;
      const pl = this.plats().find((q) => x > q.x1 + 10 && x < q.x2 - 10);
      this.items.push({
        kind, x, y: -40, ty: pl && Math.random() < 0.6 ? pl.y : FLOOR, st: 'fall', t: 0, life: heal ? COFFEE_LIFE : ITEM_LIFE,
        color: PAINTS[Math.floor(Math.random() * PAINTS.length)],
      });
      this.snd.play('winpop');
    }
    updateItems(dt) {
      const p = this.player, b = this.boss;
      if (!this.items.length && !p.dead) {
        this.itemCd -= dt;
        if (!this.practice && this.itemCd <= 0 && (!p.weapon || p.weapon.t < 5) && b && b.state !== 'enter' && !b.dying) this.spawnItem();
      }
      for (const it of this.items) {
        it.t += dt;
        if (it.st === 'fall') {
          it.y += 150 * dt; it.x += Math.cos(it.t * 3) * 14 * dt;
          if (it.y >= it.ty) { it.y = it.ty; it.st = 'rest'; it.t = 0; this.fx.dust(it.x, it.y, 4); }
        } else if (it.t > it.life) {
          // nobody took it in time: it vanishes, and another one comes later
          it.gone = true; this.itemCd = rand(6, 9);
          this.fx.ring(it.x, it.y - 12, 6, 30, 0.25, '#fff', 2); this.fx.dust(it.x, it.y, 6); this.snd.play('vanish');
        }
        if (!it.gone && !p.dead && overlap(p.box, { x: it.x - 18, y: it.y - 34, w: 36, h: 36 })) this.pickUp(it);
      }
      this.items = this.items.filter((it) => !it.gone);
    }
    pickUp(it) {
      const p = this.player, name = this.s.items[it.kind];
      it.gone = true; this.itemCd = rand(8, 12);
      if (it.kind === 'coffee') {
        // heal() says it for the screen reader
        this.fx.ring(it.x, it.y - 14, 8, 40, 0.3, '#9dffa0', 3); this.snd.play('sip');
        if (p.hp === 1) this.achieve('lastcup');
        this.heal(2); this.gainMeter(10);
        return;
      }
      this.snd.play('pickup'); this.fx.ring(it.x, it.y - 14, 8, 40, 0.3, '#ffe417', 3);
      this.shots = this.shots.filter((s) => s.kind !== 'cd');
      p.weapon = { kind: it.kind, t: WEAPON_TIME, color: it.color }; p.cdOut = false;
      if (!this.practice && !this.ach.arms.includes(it.kind)) { this.ach.arms.push(it.kind); this.saveAch(); }
      if (ITEM_KINDS.every((k) => this.ach.arms.includes(k))) this.achieve('collector');
      this.fx.chip(p.x, p.y - 104, name);
      this.say(name);
    }
    updateWeapon(dt) {
      const w = this.player.weapon;
      if (w) { w.t -= dt; if (w.t <= 0) this.weaponGone(); }
    }
    weaponGone() {
      const p = this.player, w = p.weapon;
      if (!w) return;
      p.weapon = null; p.cdOut = false;
      this.shots = this.shots.filter((s) => s.kind !== 'cd');
      this.fx.debris(p.x + p.face * 20, p.y - 50, 8, ['#fff', '#c0c0c0', '#6aa8ff']); this.snd.play('broke');
      this.fx.chip(p.x, p.y - 104, this.s.gone(this.s.items[w.kind]), true);
      this.itemCd = Math.min(this.itemCd, rand(4, 7));
    }
    // thrown weapons: the CD flies out and comes back, the paint lobs and splashes
    release(k) {
      const p = this.player, b = this.boss;
      if (!p.weapon) return;
      const hx = p.x + p.face * 26, hy = p.y - 58;
      if (k === 'toss') {
        this.shots.push({ kind: 'cd', x: hx, y: hy, vx: p.face * 780, dir: p.face, t: 0, back: false, hits: new Set(), spin: 0 });
        p.cdOut = true; this.snd.play('cd');
        return;
      }
      const c = PAINTS[this.paintI++ % PAINTS.length];
      let vx = p.face * 430, vy = -520;
      if (b && !b.dying && b.state !== 'enter' && sign(b.x - hx) === p.face && Math.abs(b.x - hx) < 560) {
        const a = b.anchor(), T = clamp(Math.abs(a.x - hx) / 700, 0.35, 0.7);
        vx = (a.x - hx) / T; vy = (a.y - hy - 0.5 * 1400 * T * T) / T;
      }
      p.weapon.color = c; p.lobCd = 1.2;
      this.shots.push({ kind: 'paint', x: hx, y: hy - 8, vx, vy, t: 0, c });
      this.snd.play('lob');
    }
    updateShots(dt) {
      const p = this.player, b = this.boss;
      for (const s of this.shots) {
        s.t += dt;
        if (s.kind === 'cd') {
          s.spin += dt * 28;
          if (!s.back) {
            s.vx -= s.dir * 1500 * dt; s.x += s.vx * dt;
            if (sign(s.vx) !== s.dir || s.x < LEFT + 10 || s.x > RIGHT - 10) { s.back = true; s.hits = new Set(); }
          } else {
            const dx = p.x - s.x, dy = p.y - 52 - s.y, d = Math.hypot(dx, dy) || 1, sp = Math.min(950, 320 + s.t * 480);
            s.x += (dx / d) * sp * dt; s.y += (dy / d) * sp * dt;
            if (d < 26 || s.t > 4) { s.gone = true; p.cdOut = false; this.snd.play('catch'); }
          }
          if (Math.random() < 0.5) this.fx.add({ k: 'dot', x: s.x, y: s.y, vx: 0, vy: 0, g: 0, life: 0.18, t: 0, r: 4, c: ['rgba(201,240,255,.7)', 'rgba(255,214,245,.7)', 'rgba(255,246,200,.7)'][Math.floor(Math.random() * 3)] });
          this.shotHit(s, { x: s.x - 13, y: s.y - 13, w: 26, h: 26 }, 'cd', s.back ? -s.dir : s.dir);
        } else {
          const oy = s.y;
          s.vy += 1400 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
          if (Math.random() < 0.4) this.fx.add({ k: 'dot', x: s.x, y: s.y, vx: 0, vy: 30, g: 400, life: 0.3, t: 0, r: 2.5, c: s.c });
          const a = b && !b.dying ? b.anchor() : null;
          const onBoss = !!(a && Math.hypot(s.x - a.x, s.y - a.y) < a.r);
          let fy = FLOOR;
          for (const pl of this.plats()) if (s.x > pl.x1 && s.x < pl.x2 && oy <= pl.y && s.y >= pl.y) fy = pl.y;
          if (onBoss || s.y >= fy - 4 || s.x < LEFT || s.x > RIGHT) this.splash(s, Math.min(s.y, fy - 4), !onBoss && s.y >= fy - 4);
        }
      }
      this.shots = this.shots.filter((s) => !s.gone);
    }
    shotHit(s, box, k, dir) {
      const b = this.boss;
      if (!b || b.dying) return;
      const res = b.hitBy(box, { k, t: 0, hits: s.hits }, { face: dir, x: s.x });
      if (!res) return;
      this.fx.sparks(res.x, res.y, dir, 8, res.color || '#e6d6ff'); this.fx.star(res.x, res.y, '#fff', 18);
      this.snd.strike(k); this.hitstop(0.03);
    }
    splash(s, y, onFloor) {
      s.gone = true;
      const b = this.boss;
      if (b && !b.dying) {
        const hp0 = b.hp;
        b.hitBy({ x: s.x - 70, y: y - 60, w: 140, h: 100 }, { k: 'paint', t: 0, hits: new Set() }, { face: sign(s.vx), x: s.x });
        if (b.hp < hp0 && !b.dying) { b.paintT = 5; b.paintC = s.c; }
      }
      this.fx.drops(s.x, y, 16, s.c); this.fx.ring(s.x, y, 6, 46, 0.25, s.c, 4);
      if (onFloor) this.decals.push({ x: s.x, y: y + 4, c: s.c, t: 0, r: rand(22, 32), seed: rand(0, 10) });
      this.snd.play('splat'); this.fx.shake(3, 0.12);
    }

    // the special, played the Shadow Fight 3 way: F on a full bar (Ctrl+Alt+Del) turns him into a shadow for
    // SHADOW_TIME seconds while the bar runs down; F again leaps into End Task, which has to land on the boss
    trySpecial() {
      const p = this.player, b = this.boss;
      // a second F while the mode is still coming on is ignored, so a double tap can't spend the mode at once
      if (this.state !== 'fight' || this.special || (p.act && p.act.k === 'shadowUp')) return;
      const busy = p.dead || (p.act && ['hurt', 'down', 'getup', 'tech', 'endtask'].includes(p.act.k));
      if (busy || !b || b.dying || b.state === 'enter' || (!this.shadow && p.meter < 100)) { this.snd.play('deny'); return; }
      if (this.shadow) { this.endTask(); return; }
      this.shadow = { t: 0 };
      p.start('shadowUp', this); Object.assign(p, { vx: 0, spin: 0 }); p.trail.length = 0;
      this.hitstop(0.06); this.fx.flash('rgba(20,40,120,.35)', 0.14); this.fx.ring(p.x, p.y - 40, 10, 110, 0.4, SHADOW_C, 5);
      this.fx.chip(p.x, p.y - 118, this.s.shadowOn);
      this.snd.play('keys'); this.snd.play('shadow'); this.snd.duck(0.5, 0.6);
      this.say(this.s.shadowSay);
    }
    // the bar runs down with the mode; End Task in the air gets to finish first
    updateShadow(dt) {
      const p = this.player, sh = this.shadow;
      sh.t += dt;
      p.meter = Math.max(0, 100 * (1 - sh.t / SHADOW_TIME));
      if (sh.t >= SHADOW_TIME && !(p.act && p.act.k === 'endtask')) this.shadowOff(true);
    }
    shadowOff(ranOut) {
      if (!this.shadow) return;
      this.shadow = null; this.player.meter = 0;
      if (ranOut) { this.snd.play('unshadow'); this.say(this.s.shadowOver); }
    }
    endTask() {
      const p = this.player;
      p.start('endtask', this); Object.assign(p, { spin: 0, jumpCut: false }); p.trail.length = 0;
      this.fx.dust(p.x, p.y, 8);
    }
    // End Task came down on the boss: it stops responding for a beat, then the task is ended (updateSpecial)
    endTaskHit() {
      const p = this.player;
      if (!p.act || p.act.k !== 'endtask' || p.act.hit) return;
      p.act.hit = true; this.endSlow();
      this.special = { t: 0 };
      this.fx.shake(10, 0.3); this.fx.star(p.x, p.y - 12, '#fff', 44); this.snd.strike('endtask'); this.snd.duck(0.3, 0.8);
    }
    // it came down on nothing: the mode is spent all the same
    endTaskMissed() {
      const p = this.player;
      this.fx.chip(p.x, p.y - 110, this.s.missed, true);
      this.shadowOff(false); this.snd.play('unshadow'); this.say(this.s.missed);
    }
    updateSpecial(dt) {
      const sp = this.special, p = this.player, b = this.boss;
      sp.t += dt;
      p.t += dt; p.finish(dt);
      if (sp.t < 0.26) return;
      this.special = null;
      this.achieve('endtask'); this.lesson('special');
      const a = b.anchor(), pts = [];
      for (let i = 0; i <= 9; i++) { const k = i / 9; pts.push([lerp(a.x + rand(-70, 70), a.x, k) + (i && i < 9 ? rand(-20, 20) : 0), lerp(24, a.y, k)]); }
      this.bolt = { pts, t: 0 };
      this.shadowOff(false);
      b.stagger();
      b.take(MOVES.blast.dmg, true);
      this.fx.flash('#dff0ff', 0.2); this.fx.shake(14, 0.45); this.hitstop(0.12);
      this.fx.ring(a.x, a.y, 10, 150, 0.45, '#9fd0ff', 7); this.fx.sparks(a.x, a.y, 0, 22, '#cfe6ff'); this.fx.star(a.x, a.y, '#fff', 64);
      this.fx.chip(a.x, a.y - a.r - 26, this.s.ended);
      this.snd.play('zap'); this.snd.play('boom');
      this.say(this.s.ended);
      // he springs back off the boss
      p.act = null;
      Object.assign(p, { vy: -620, vx: -p.face * 160, spin: 0.001, spinDir: -1, spinT: 0.4, inv: Math.max(p.inv, 0.6), jumps: 1, airDash: true, ground: false });
    }

    /* ---- pause ---- */
    canPause() { return ['intro', 'fight', 'bossdown'].includes(this.state); }
    pause() {
      if (this.paused || !this.canPause()) return;
      this.paused = true; this.input.clear(); this.snd.musicHold(true);
      this.showPause();
    }
    resume() {
      if (!this.paused || tooSmall()) return;
      this.paused = false; this.last = 0; this.acc = 0; this.snd.musicHold(false);
      this.closeDialog();
      this.canvas.focus({ preventScroll: true });
    }
    togglePause() { if (this.paused) this.resume(); else this.pause(); }
    checkSize() {
      const small = tooSmall();
      if (small === this.small) return;
      this.small = small;
      if (this.paused && this.dlgKind === 'pause') this.showPause();
      else if (small) this.pause();
    }

    /* ---- dialogs: Luna mini windows over the canvas ---- */
    // o.menu: the title's Start menu instead of a window (o.body is its whole markup, o.label names it)
    dialog(o) {
      this.closeDialog();
      const el = document.createElement(o.menu ? 'nav' : 'section');
      if (o.menu) {
        el.className = 'gm-start'; el.setAttribute('aria-label', o.label); el.innerHTML = o.body;
      } else {
        el.className = 'gm-dlg' + (o.wide ? ` ${o.wide === true ? 'wide' : o.wide}` : '');
        el.setAttribute('role', o.live ? 'status' : 'alertdialog');
        el.setAttribute('aria-labelledby', 'gm-dlg-t');
        const btns = (o.buttons || []).map((b, i) => `<button class="btn${b.def ? ' default' : ''}" data-i="${i}"${b.disabled ? ' disabled' : ''}>${esc(b.label)}</button>`).join('');
        el.innerHTML = `<div class="mw-title"><span class="t-ico">${icon(o.icon, 16)}</span><span class="t-text" id="gm-dlg-t">${esc(o.title)}</span></div><div class="dlg">${o.body}${btns ? `<div class="btns">${btns}</div>` : ''}</div>`;
      }
      // footer buttons carry data-i; buttons inside the body name an entry of o.actions with data-act
      el.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-i], button[data-act]');
        if (!b) return;
        this.snd.ensure(); this.snd.play('ui');
        if (b.dataset.act) o.actions[b.dataset.act](b); else o.buttons[+b.dataset.i].run(b);
      });
      el.addEventListener('keydown', (e) => { const fn = o.keys && o.keys[e.code]; if (fn) { e.preventDefault(); e.stopPropagation(); fn(); } });
      this.layer.appendChild(el);
      this.dlg = el; this.dlgKind = o.kind; this.dlgRebuild = o.rebuild;
      if (!o.live) { const d = el.querySelector('.btn.default:not(:disabled)') || el.querySelector('.btn:not(:disabled)') || (o.menu && el.querySelector('button')); if (d) d.focus({ preventScroll: true }); }
      return el;
    }
    closeDialog() { if (this.dlg) this.dlg.remove(); this.dlg = null; this.dlgKind = null; this.dlgRebuild = null; }
    keysHTML() { return `<div class="gm-keys">${this.s.keys.map(([k, d]) => `<kbd>${esc(k)}</kbd><span>${esc(d)}</span>`).join('')}</div><p class="note">${esc(this.s.itemTip)}</p><p class="note">${esc(this.s.healTip)}</p>`; }
    // the whole game menu as an XP Start menu over the title's start button: the player's name for the account
    // (their leaderboard name once they have one), the two ways in as pinned programs, the rest on the right
    showTitle() {
      const s = this.s, best = +store.get(BEST_KEY) || 0, back = () => this.showTitle();
      const item = (act, ico, label, sub, pin, after = '') => `<li><button class="sm-item${pin ? ' pin' : ''}" type="button" data-act="${act}">${icon(ico, pin ? 32 : 24)}<span>${esc(label)}${sub ? `<small>${esc(sub)}</small>` : ''}</span>${after}</button></li>`;
      const el = this.dialog({
        kind: 'title', menu: true, label: s.startMenu, rebuild: back,
        body: `<div class="sm-head"><canvas width="76" height="76" aria-hidden="true"></canvas><span>${esc(store.get(NAME_KEY) || s.stick)}</span></div>
          <div class="sm-cols"><ul class="sm-list">${item('play', 'play', s.startFight, s.startFightSub, true)}${item('practice', 'gradCap', s.practice, s.practiceSub, true)}<li class="sm-sep" role="separator"></li>${item('help', 'questionCircle', s.howTo)}</ul>
          <ul class="sm-list places">${item('ach', 'trophy', s.achTitle, '', false, `<em>${this.achCount()}/${ACHS.length}</em>`)}${item('board', 'list', s.board)}${best ? `<li class="sm-stat">${icon('clock', 24)}<span>${esc(s.best)}<b>${fmt(best)}</b></span></li>` : ''}</ul></div>
          ${this.onExit ? `<div class="sm-foot"><ul class="sm-list">${item('exit', 'computerOff', s.exitGame)}</ul></div>` : ''}`,
        actions: {
          play: () => this.openFight(), practice: () => this.startPractice(), help: () => this.showHelp(back),
          ach: () => this.showAchievements(back), board: () => this.loadBoard(back), exit: () => this.onExit(),
        },
      });
      drawAvatar(el.querySelector('.sm-head canvas'));
      // XP's menus: up and down walk the items, left and right cross between the two columns
      el.addEventListener('keydown', (e) => {
        const items = [...el.querySelectorAll('.sm-item')], i = items.indexOf(document.activeElement);
        if (i < 0) return;
        let j = -1;
        if (e.key === 'ArrowDown') j = (i + 1) % items.length;
        else if (e.key === 'ArrowUp') j = (i - 1 + items.length) % items.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') j = items.indexOf(el.querySelector(items[i].closest('.places') ? '.sm-cols > .sm-list:not(.places) .sm-item' : '.places .sm-item'));
        if (j < 0) return;
        e.preventDefault(); items[j].focus();
      });
    }
    showAchievements(back) {
      const s = this.s, done = back || (() => this.resume()), got = this.ach.got;
      const items = ACHS.map((id) => {
        const [name, how] = s.ach[id], on = !!got[id];
        const more = id === 'collector' && !on ? ` (${this.ach.arms.length}/4)` : '';
        return `<li${on ? ' class="on"' : ''}><span class="gm-medal" aria-hidden="true">${icon('trophy', 24)}</span><span><b>${esc(name)}</b>${esc(how + more)}<span class="sr-only"> (${esc(on ? s.achOn : s.achOff)})</span></span></li>`;
      }).join('');
      this.dialog({
        kind: 'ach', wide: true, title: s.achTitle, icon: 'trophy', rebuild: () => this.showAchievements(back),
        body: `<p>${esc(s.achCount(this.achCount(), ACHS.length))}</p><ul class="gm-ach">${items}</ul>`,
        buttons: [{ label: 'OK', def: true, run: done }],
        keys: { Escape: done },
      });
    }
    showIntro() {
      const s = this.s, i = this.bossIdx;
      this.dialog({
        kind: 'intro', live: true, title: s.names[i], icon: BOSS_ICON[i],
        body: `<p><b>${esc(i < 3 ? s.bossOf(i + 1, 3) : s.finalBoss)}</b></p>${i < 3 ? '' : `<p>${esc(s.finalText)}</p>`}<p>${esc(s.tips[i])}</p><div class="gm-bar" aria-hidden="true"><i></i></div>`,
      });
    }
    showHelp(back) {
      const s = this.s, done = back || (() => this.resume());
      this.dialog({
        kind: 'help', wide: 'keys', title: s.howTo, icon: 'questionCircle', rebuild: () => this.showHelp(back),
        body: this.keysHTML(), buttons: [{ label: back ? 'OK' : s.resume, def: true, run: done }],
        keys: { Escape: done },
      });
    }
    showPause() {
      const s = this.s, small = tooSmall();
      this.dialog({
        kind: 'pause', title: s.paused, icon: small ? 'warning' : 'clock', rebuild: () => this.showPause(),
        body: `<div class="dlg-row">${icon(small ? 'warning' : 'clock', 32)}<div><p>${esc(small ? s.tooSmall : s.pausedText)}</p></div></div>`,
        buttons: [{ label: s.resume, def: true, disabled: small, run: () => this.resume() }, { label: s.menu, run: () => this.toTitle() }],
        keys: { Escape: () => this.resume(), KeyP: () => this.resume() },
      });
    }
    showCrash() {
      const s = this.s;
      this.dialog({
        kind: 'crash', title: s.crashTitle, icon: 'error', rebuild: () => this.showCrash(),
        body: `<div class="dlg-row">${icon('error', 32)}<div><p><b>${esc(s.crash)}</b></p><p>${esc(s.sorry)}</p><p class="note">${esc(s.cause(s.names[this.bossIdx]))}</p></div></div>`,
        buttons: [{ label: s.retry, def: true, run: () => this.startBoss(this.bossIdx) }, { label: s.menu, run: () => this.toTitle() }],
      });
    }
    showWin(isBest, best, gift) {
      const s = this.s, r = this.rank();
      const cta = this.onContact ? `<div class="gm-cta"><p>${esc(s.cta)}</p><button class="btn" data-act="contact">${esc(s.contact)}</button></div>` : '';
      const el = this.dialog({
        kind: 'win', wide: true, title: 'Boss Rush XP', icon: 'trophy', rebuild: () => this.showWin(isBest, best, gift),
        // a new record is the time above it: the best-time row only shows when it differs
        body: `<div class="dlg-row"><div class="gm-rank" data-rank="${r}"><small>${esc(s.rank)}</small><b>${r}</b></div><div><p><b>${esc(s.winTitle)}</b></p><p class="gm-flavor">${esc(s.winText)}</p>
          <dl class="gm-stats"><dt>${esc(s.time)}</dt><dd>${fmt(this.run.time)}</dd><dt>${esc(s.hits)}</dt><dd>${this.run.hits}</dd><dt>${esc(s.perfects)}</dt><dd>${this.run.perfect || 0}</dd><dt>${esc(s.achTitle)}</dt><dd>${this.achCount()}/${ACHS.length}</dd>${isBest ? '' : `<dt>${esc(s.best)}</dt><dd>${fmt(best)}</dd>`}</dl>
          ${isBest ? `<p class="gm-new">${esc(s.newBest)}</p>` : ''}${gift ? `<p class="gm-gift">${icon('trophy', 16)}${esc(s.gift)}</p>` : ''}</div></div>
          <div class="gm-lb" aria-live="polite">${this.lbHTML()}</div>${cta}`,
        buttons: [{ label: s.shareOpen, run: () => this.showShare(() => this.showWin(isBest, best, gift)) }, { label: s.again, def: true, run: () => this.newGame() }, { label: s.menu, run: () => this.toTitle() }],
        actions: { contact: () => this.onContact(), board: () => this.loadBoard(() => this.showWin(isBest, best, gift)), lbRetry: () => this.lbCheck() },
      });
      // the name field: Enter saves, and what is typed survives a language switch
      el.addEventListener('submit', (e) => { e.preventDefault(); this.lbSave(); });
      el.addEventListener('input', (e) => { if (e.target.id === 'gm-lb-name' && this.lb) this.lb.name = e.target.value; });
    }
    /* ---- the leaderboard ---- */
    // where this win stands: a run that beats the player's saved best is offered for saving under a name ('ask'),
    // one that doesn't shows where the saved best stands ('kept'); 'none' when the server won't rank it at all
    lbCheck() {
      const lb = this.lb, run = this.run;
      if (!lb) return;
      Object.assign(lb, { st: 'load', err: null });
      this.renderLb();
      boardCall(`?pid=${playerId()}&time=${run.time.toFixed(2)}&hits=${run.hits}`).then((j) => {
        if (this.lb !== lb) return;
        if (j.error) lb.st = 'off';
        else if (j.would) Object.assign(lb, { st: 'ask', rank: j.would.rank, total: j.would.total });
        else if (j.me) Object.assign(lb, { st: 'kept', me: j.me, total: j.total });
        else lb.st = 'none';
        this.renderLb(true);
      });
    }
    lbSave() {
      const lb = this.lb, field = this.dlg && this.dlg.querySelector('#gm-lb-name');
      if (!lb || lb.st !== 'ask') return;
      lb.name = tidyName(field ? field.value : lb.name);
      if (!lb.name || !nameOk(lb.name)) { lb.err = 'format'; this.renderLb(true); return; }
      Object.assign(lb, { st: 'saving', err: null });
      this.renderLb();
      boardCall('', { pid: playerId(), name: lb.name, time: +this.run.time.toFixed(2), hits: this.run.hits }).then((j) => {
        if (this.lb !== lb) return;
        if (j.error) { Object.assign(lb, { st: 'ask', err: j.error === 'name' || j.error === 'slow' ? j.error : 'net' }); this.renderLb(true); return; }
        store.set(NAME_KEY, lb.name);
        Object.assign(lb, { st: j.saved ? 'saved' : 'kept', me: j.me, total: j.total });
        this.snd.play('ding');
        this.renderLb(true);
      });
    }
    lbHTML() {
      const s = this.s, lb = this.lb;
      if (!lb) return '';
      const view = `<button class="btn" data-act="board">${icon('list', 16)}${esc(s.lbView)}</button>`;
      if (lb.st === 'load') return `<p>${esc(s.lbLoading)}</p>`;
      if (lb.st === 'off') return `<p>${esc(s.lbOff)}</p><button class="btn" data-act="lbRetry">${esc(s.retry)}</button>`;
      if (lb.st === 'saved') return `<p><b>${esc(s.lbSaved(lb.me.name, lb.me.rank, lb.total))}</b></p>${view}`;
      if (lb.st === 'kept') return `<p>${esc(s.lbKept(lb.me.rank, lb.total, fmt(lb.me.time)))}</p>${view}`;
      if (lb.st === 'none') return view;
      const busy = lb.st === 'saving' ? ' disabled' : '';
      return `<form class="gm-lb-form" novalidate><p><b>${esc(s.lbAsk(lb.rank, lb.total))}</b></p>
        <div class="gm-lb-row"><label for="gm-lb-name">${esc(s.lbName)}</label><input id="gm-lb-name" maxlength="${NAME_MAX}" autocomplete="nickname" spellcheck="false" value="${esc(lb.name)}"${busy}${lb.err ? ' aria-describedby="gm-lb-err" aria-invalid="true"' : ''}>
        <button class="btn" type="submit"${busy}>${esc(lb.st === 'saving' ? s.lbSaving : s.lbSave)}</button></div>
        ${lb.err ? `<p class="gm-lb-err" id="gm-lb-err">${icon('warning', 16)}${esc(s.lbErr[lb.err])}</p>` : ''}</form>`;
    }
    // redraws the win screen's leaderboard part in place; arrived: an answer just came, so the name field (or the
    // button that replaced it) takes the focus, unless the player has already moved it somewhere else
    renderLb(arrived) {
      const box = this.dlgKind === 'win' && this.dlg && this.dlg.querySelector('.gm-lb');
      if (!box) return;
      const a = document.activeElement, untouched = !a || a === document.body || box.contains(a) || (this.dlg.contains(a) && a.classList.contains('default'));
      box.innerHTML = this.lbHTML();
      if (!arrived || !untouched) return;
      const f = box.querySelector('input:not(:disabled)') || (box.contains(a) || a === document.body ? box.querySelector('.btn') : null);
      if (f) { f.focus({ preventScroll: true }); if (f.tagName === 'INPUT' && this.lb.err) f.select(); }
    }
    // the board dialog: the top ten, and the player's own row under them when it is further down
    loadBoard(back) {
      const bv = this.boardView = { st: 'load', back };
      this.showBoard();
      boardCall(`?pid=${playerId()}`).then((j) => {
        if (this.boardView !== bv) return;
        Object.assign(bv, j.error ? { st: 'off' } : { st: 'ok', data: j });
        const box = this.dlgKind === 'board' && this.dlg.querySelector('.gm-board-body');
        if (box) box.innerHTML = this.boardHTML();
      });
    }
    showBoard() {
      const s = this.s, bv = this.boardView, done = bv.back || (() => this.resume());
      this.dialog({
        kind: 'board', wide: true, title: s.board, icon: 'list', rebuild: () => this.showBoard(),
        body: `<div class="gm-board-body" aria-live="polite">${this.boardHTML()}</div>`,
        buttons: [{ label: 'OK', def: true, run: done }],
        keys: { Escape: done },
        actions: { boardRetry: () => this.loadBoard(bv.back) },
      });
    }
    boardHTML() {
      const s = this.s, bv = this.boardView;
      if (bv.st === 'load') return `<p>${esc(s.lbLoading)}</p>`;
      if (bv.st === 'off') return `<p>${esc(s.lbOff)}</p><button class="btn" data-act="boardRetry">${esc(s.retry)}</button>`;
      const d = bv.data;
      if (!d.total) return `<p>${esc(s.lbEmpty)}</p>`;
      const row = (r) => `<tr${r.me ? ' class="me"' : ''}><td class="num">${r.rank}</td><td>${esc(r.name)}${r.me ? `<span class="sr-only"> (${esc(s.lbYou)})</span>` : ''}</td><td class="num">${fmt(r.time)}</td><td class="num">${r.hits}</td><td class="grade">${gradeOf(r.time, r.hits)}</td></tr>`;
      const mine = d.me && !d.top.some((r) => r.me) ? `<tr class="gap" aria-hidden="true"><td colspan="5">⋯</td></tr>${row({ ...d.me, me: true })}` : '';
      return `<table class="gm-board"><thead><tr>${s.lbCols.map((c) => `<th scope="col"><span>${esc(c)}</span></th>`).join('')}</tr></thead><tbody>${d.top.map(row).join('')}${mine}</tbody></table>
        <p class="gm-board-note">${esc(s.lbCount(d.total))}. ${esc(s.lbHow)}</p>`;
    }
    showPracticeDone() {
      const s = this.s;
      this.dialog({
        kind: 'drill', title: s.practice, icon: 'trophy', rebuild: () => this.showPracticeDone(),
        body: `<div class="dlg-row">${icon('trophy', 32)}<div><p><b>${esc(s.drillDone)}</b></p><p>${esc(s.drillText)}</p></div></div>`,
        buttons: [{ label: s.drillFight, def: true, run: () => this.newGame() }, { label: s.drillAgain, run: () => this.startPractice() }, { label: s.menu, run: () => this.toTitle() }],
      });
    }
    // fight time plus a ten-second penalty for every hit taken, graded against RANKS
    rank() { return gradeOf(this.run.time, this.run.hits); }
    // the shared result names the player's place on the board once it is known
    // the player's place on the board, once it is known
    boardPos() {
      const lb = this.lb;
      return lb && lb.me && (lb.st === 'saved' || lb.st === 'kept') ? { rank: lb.me.rank, total: lb.total, name: lb.me.name } : null;
    }
    // the link to the game: this page without its query (?preview, ?debug, anything a link brought along)
    gameUrl() { return `${String(location.href).split(/[?#]/)[0]}#/game`; }
    shareText() {
      return this.s.share(this.rank(), fmt(this.run.time), this.run.hits, this.owner, this.gameUrl(), this.boardPos());
    }
    // a button says what just happened for a moment, then goes back to its own label
    flash(btn, text) {
      if (!btn.isConnected) return;
      const label = btn.dataset.label || (btn.dataset.label = btn.textContent);
      btn.textContent = text; clearTimeout(btn.flashT);
      btn.flashT = setTimeout(() => { btn.textContent = label; }, 1800);
    }
    /* ---- the result card and the share dialog ---- */
    cardData() {
      const pos = this.boardPos(), now = new Date();
      let host = '';
      try { host = new URL(this.gameUrl()).host; } catch (e) { host = ''; }
      return {
        grade: this.rank(), time: this.run.time, hits: this.run.hits, perfect: this.run.perfect || 0,
        name: pos ? pos.name : '', pos: pos && { rank: pos.rank, total: pos.total }, host, owner: this.owner,
        clock: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
      };
    }
    // the card for this win as it stands, drawn once and again only when what it shows changes (a name and a
    // place arrive once the run is saved; the language can switch). Resolves to { blob, url }
    card() {
      const d = this.cardData(), key = JSON.stringify({ ...d, clock: 0, lang: this.lang });
      if (this.cardMemo && this.cardMemo.key === key) return this.cardMemo.p;
      if (this.cardMemo && this.cardMemo.url) URL.revokeObjectURL(this.cardMemo.url);
      const memo = this.cardMemo = { key, url: null };
      memo.p = makeCard(d, this.s).then((blob) => { memo.blob = blob; memo.url = URL.createObjectURL(blob); return memo; });
      memo.p.catch(() => { if (this.cardMemo === memo) this.cardMemo = null; });
      return memo.p;
    }
    cardFile() { return `boss-rush-xp-${this.rank()}-${fmt(this.run.time).replace(':', '-')}.png`; }
    canShareFiles() {
      try { return !!(navigator.canShare && navigator.canShare({ files: [new File([''], 'card.png', { type: 'image/png' })] })); } catch (e) { return false; }
    }
    showShare(back) {
      const s = this.s, lb = this.lb, canCopy = !!(window.ClipboardItem && navigator.clipboard && navigator.clipboard.write);
      const btn = (act, label, def) => `<button class="btn${def ? ' default' : ''}" data-act="${act}">${esc(label)}</button>`;
      const el = this.dialog({
        kind: 'share', wide: true, title: s.shareTitle, icon: 'image', rebuild: () => this.showShare(back),
        body: `<div class="gm-card-frame"><p class="gm-card-wait">${esc(s.cardMaking)}</p></div>
          <p>${esc(s.shareHint)}</p>${lb && (lb.st === 'ask' || lb.st === 'saving') ? `<p class="gm-share-note">${esc(s.cardNoRank)}</p>` : ''}
          <div class="gm-share-row">${canCopy ? btn('copyImg', s.copyImg, true) : ''}${btn('saveImg', s.saveImg, !canCopy)}${this.canShareFiles() ? btn('shareTo', s.shareTo) : ''}${btn('copyText', s.copyText)}</div>
          <p class="gm-share-msg" aria-live="polite"></p>
          <label class="gm-share" hidden>${esc(s.copyHand)}<textarea readonly rows="3"></textarea></label>`,
        buttons: [{ label: 'OK', run: back }],
        keys: { Escape: back },
        actions: { copyImg: (b) => this.copyImage(b), saveImg: () => this.saveImage(), shareTo: () => this.shareTo(), copyText: (b) => this.copyResult(b) },
      });
      const pos = this.boardPos(), alt = s.cardAlt(this.rank(), fmt(this.run.time), this.run.hits, pos);
      this.card().then((m) => {
        const frame = this.dlg === el && el.querySelector('.gm-card-frame');
        if (frame) frame.innerHTML = `<img class="gm-card" src="${m.url}" width="1200" height="630" alt="${esc(alt)}">`;
      }, () => {
        const wait = this.dlg === el && el.querySelector('.gm-card-wait');
        if (wait) wait.textContent = s.cardFail;
      });
    }
    shareMsg(text) {
      const m = this.dlgKind === 'share' && this.dlg.querySelector('.gm-share-msg');
      if (m) m.textContent = text;
    }
    // the picture goes on the clipboard, ready to paste into a chat or a post; the item is made while the click
    // still counts as the player's own (Safari wants that), with the picture itself possibly still on its way
    copyImage(btn) {
      const s = this.s;
      try {
        const item = new ClipboardItem({ 'image/png': this.card().then((m) => m.blob) });
        navigator.clipboard.write([item]).then(() => { this.flash(btn, s.imgCopied); this.shareMsg(''); this.say(s.imgCopied); }, () => this.shareMsg(s.imgFail));
      } catch (e) { this.shareMsg(s.imgFail); }
    }
    saveImage() {
      this.card().then((m) => {
        const a = document.createElement('a');
        a.href = m.url; a.download = this.cardFile(); a.hidden = true;
        document.body.appendChild(a); a.click(); a.remove();
        this.shareMsg(this.s.imgSaved(a.download));
      }, () => this.shareMsg(this.s.cardFail));
    }
    // the system's own share sheet, where the browser has one for pictures (Safari, Edge, Chrome on Windows)
    shareTo() {
      this.card().then((m) => navigator.share({ files: [new File([m.blob], this.cardFile(), { type: 'image/png' })], text: this.shareText() }))
        .catch(() => { /* the sheet was closed: nothing to do */ });
    }
    // the clipboard where it is allowed, the old copy command where not, and failing both the text to copy by hand
    copyResult(btn) {
      const s = this.s, text = this.shareText();
      const done = (ok) => {
        this.say(ok ? s.copied : s.copyHand);
        if (!btn.isConnected) return;
        if (ok) { this.flash(btn, s.copied); return; }
        const box = this.dlg && this.dlg.querySelector('.gm-share');
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
        ta.remove(); btn.focus({ preventScroll: true });
        return ok;
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), () => done(fallback()));
      else done(fallback());
    }

    /* ---- public ---- */
    setLang(l) {
      this.lang = l === 'id' ? 'id' : 'en';
      this.s = STR[this.lang];
      this.canvas.setAttribute('aria-label', this.s.canvasLabel);
      if (this.dlgRebuild) this.dlgRebuild();
      this.status(this.state === 'title' ? this.s.statusMenu : this.practice ? this.s.practice : this.bossLabel(this.bossIdx));
    }
    toggleSound() { this.snd.setMuted(!this.snd.muted); }
    isMuted() { return this.snd.muted; }
    isPaused() { return this.paused; }
    achievements() {
      if (this.state === 'title') { this.showAchievements(() => this.showTitle()); return; }
      if (this.canPause()) { this.pause(); this.showAchievements(); return; }
      this.showAchievements(this.dlgRebuild || (() => this.closeDialog()));
    }
    board() {
      if (this.state === 'title') { this.loadBoard(() => this.showTitle()); return; }
      if (this.canPause()) { this.pause(); this.loadBoard(); return; }
      this.loadBoard(this.dlgKind === 'board' ? this.boardView.back : this.dlgRebuild || (() => this.closeDialog()));
    }
    help() {
      if (this.state === 'title') { this.showTitle(); return; }
      if (this.canPause()) { this.pause(); this.showHelp(); return; }
      this.showHelp(this.dlgRebuild);
    }
    // keyboard focus goes to the open dialog's default button, or to the canvas while playing
    focus() {
      const d = this.dlg && !this.dlg.matches('[role="status"]') && (this.dlg.querySelector('.btn.default:not(:disabled)') || this.dlg.querySelector('.btn:not(:disabled)'));
      (d || this.canvas).focus({ preventScroll: true });
    }
    destroy() {
      if (this.gone) return;
      this.gone = true;
      cancelAnimationFrame(this.raf);
      this.ro.disconnect();
      window.removeEventListener('resize', this.onResize);
      document.removeEventListener('visibilitychange', this.onVis);
      this.snd.close();
      if (this.cardMemo && this.cardMemo.url) URL.revokeObjectURL(this.cardMemo.url);
      this.root.remove();
      if (window.__brxp === this) delete window.__brxp;
    }

    /* ---- loop ---- */
    loop(ts) {
      if (this.gone) return;
      this.raf = requestAnimationFrame(this.loop);
      // app.js swaps the window body on a language change and puts this stage straight back;
      // a stage that stays detached means the window closed without telling us
      if (!this.root.isConnected) { if (++this.detached > 3) this.destroy(); return; }
      this.detached = 0;
      const dt = this.last ? Math.min(0.05, (ts - this.last) / 1000) : 0;
      this.last = ts;
      if (this.canvas.offsetParent === null) { this.pause(); return; }
      const small = tooSmall();
      if (small !== this.small) this.checkSize();
      else if (small && !this.paused && this.canPause()) this.pause();
      if (this.paused) { if (!this.lastPaint || ts - this.lastPaint > 250) { this.render(); this.lastPaint = ts; } return; }
      this.input.now += dt;
      this.acc += dt;
      let n = 0;
      while (this.acc >= STEP && n < 8) { this.acc -= STEP; n += 1; this.update(STEP); }
      if (n === 8) this.acc = 0;
      this.render();
    }
    update(dt) {
      this.fx.tick(dt);
      if (this.stop > 0) { this.stop -= dt; return; }
      this.updateToasts(dt);
      this.st += dt; this.clock += dt;
      this.fx.update(dt);
      if (this.combo.t > 0) this.combo.t -= dt;
      this.combo.pop = Math.max(0, this.combo.pop - dt);
      if (this.banner && (this.banner.t += dt) > 1.6) this.banner = null;
      if (this.bolt && (this.bolt.t += dt) > 0.45) this.bolt = null;
      for (const d of this.decals) d.t += dt;
      this.decals = this.decals.filter((d) => d.t < 7);
      this.player.shadowK = damp(this.player.shadowK, this.shadow ? 1 : 0, 12, dt);
      // the HUD thins out while he is up among its plates (End Task's leap, a high double jump)
      this.hudA = damp(this.hudA, this.player.y - 100 < 72 ? 0.35 : 1, 14, dt);
      if (this.special) { this.updateSpecial(dt); return; }
      const p = this.player, b = this.boss;
      switch (this.state) {
        case 'title':
          p.idle(dt, this);
          break;
        case 'opening':
          p.idle(dt, this);
          if (this.st > 0.24) this.newGame();
          break;
        case 'intro':
          if (this.st > 0.9) b.update(dt);
          p.idle(dt, this);
          if (this.st > (this.bossIdx === 3 ? 2.6 : 1.7)) { this.state = 'fight'; this.st = 0; this.closeDialog(); this.input.clear(); p.act = null; p.idleT = 0; }
          break;
        case 'fight':
          if (!this.practice) this.run.time += dt;
          this.dodgeCd -= dt;
          p.update(dt, this);
          if (this.shadow) this.updateShadow(dt);
          if (this.special) break;
          // after a perfect dodge the boss and everything it throws run slow; he does not
          b.update(this.slow > 0 ? dt * SLOW_SCALE : dt);
          if (this.slow > 0 && (this.slow -= dt) <= 0) this.endSlow(true);
          this.updateWeapon(dt);
          this.updateItems(dt);
          this.updateShots(dt);
          this.collide();
          if (this.practice) this.updatePractice(dt);
          break;
        case 'bossdown':
          p.update(dt, this);
          b.update(dt);
          this.updateShots(dt);
          if (b.done && !this.doneAt) { this.doneAt = this.st; this.say(`${this.s.names[this.bossIdx]} ${this.s.removed}`); }
          if (this.doneAt && this.st - this.doneAt > 2.3) {
            this.doneAt = 0;
            if (this.bossIdx < BOSSES.length - 1) this.startBoss(this.bossIdx + 1, true); else this.victory();
          }
          break;
        case 'dying':
          p.update(dt, this);
          b.update(dt);
          if (this.st > 1.5) { this.state = 'over'; this.st = 0; this.showCrash(); }
          break;
        case 'won':
          p.update(dt, this);
          break;
        case 'drilled':
          p.update(dt, this);
          b.update(dt);
          break;
        default:
          break;
      }
    }
    collide() {
      const p = this.player, b = this.boss;
      if (!b || p.dead) return;
      const hb = p.hitbox();
      if (!hb) return;
      const res = b.hitBy(hb, p.act, p);
      if (!res) return;
      const mv = MOVES[p.act.k], w = mv.weapon && p.weapon ? p.weapon.kind : null;
      // a charged hit holds the freeze longest and shakes hardest
      this.hitstop(mv.big ? 0.11 : res.heavy ? 0.085 : 0.05);
      this.fx.shake(mv.big ? 8 : res.heavy ? 5 : 2.5, 0.12);
      this.fx.sparks(res.x, res.y, p.face, res.heavy ? 12 : 8, res.color || (w ? TRAIL[w] : this.shadow ? SHADOW_C : '#fff'));
      this.fx.star(res.x, res.y, '#fff', mv.big ? 38 : res.heavy ? 30 : 20);
      this.fx.ring(res.x, res.y, 4, res.heavy ? 34 : 22, 0.16, '#fff', 3);
      if (w === 'keyboard') this.fx.keys(res.x, res.y, 6);
      else if (w === 'mouse') this.fx.ring(res.x, res.y, 2, 16, 0.12, '#fff', 2);
      this.snd.strike(p.act.k, res.heavy && !mv.heavy, !!this.shadow);
      this.lesson(`hit:${p.act.k}`);
      if (mv.turn) this.lesson('hit:spin');
      if (w) this.lesson('weapon');
      p.connected();
    }

    /* ---- drawing ---- */
    render() {
      const ctx = this.ctx, k = this.k, arena = this.boss ? this.boss.arena : 'title';
      if (!this.bg || this.bg.key !== arena + k) this.bg = { key: arena + k, c: paintArena(arena, k) };
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.setTransform(k, 0, 0, k, 0, 0);
      const [ox, oy] = this.fx.offset();
      ctx.save();
      ctx.translate(ox, oy);
      if (this.tilt) { ctx.translate(W / 2, FLOOR); ctx.rotate(this.tilt); ctx.translate(-W / 2, -FLOOR); }
      ctx.drawImage(this.bg.c, 0, 0, W, H);
      AMBIENT[arena](ctx, this.clock);
      if (this.practice) this.drawSteps(ctx);
      const b = this.boss;
      if (b && b.phase === 2 && !b.dying) this.drawRage(ctx, b);
      if (b) b.drawBack(ctx);
      this.drawDecals(ctx);
      this.drawItems(ctx);
      if (b && (this.state !== 'intro' || this.st > 0.9)) {
        b.draw(ctx);
        if (b.paintT > 0 && !b.gone) this.drawPaint(ctx, b);
        if (this.special && !b.gone) this.drawFrozen(ctx, b);
      }
      this.drawShadow(ctx);
      if (this.state === 'title' || this.state === 'opening') {
        // on the title he stands half again his size: one fighter against the three giant icons
        ctx.save(); ctx.translate(this.player.x, FLOOR); ctx.scale(1.45, 1.45); ctx.translate(-this.player.x, -FLOOR);
        this.player.draw(ctx); ctx.restore();
      } else this.player.draw(ctx);
      this.drawShots(ctx);
      if (b) b.drawFront(ctx);
      this.fx.draw(ctx);
      if (this.bolt) bolt(ctx, this.bolt.pts, 1 - this.bolt.t / 0.45);
      ctx.restore();
      if (this.fx.flashT > 0) {
        ctx.globalAlpha = this.fx.flashT / this.fx.flashD; ctx.fillStyle = this.fx.flashC; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1;
      }
      if (this.slow > 0) this.drawSlow(ctx);
      if (this.state === 'title' || this.state === 'opening') this.drawTitle(ctx);
      else this.drawHUD(ctx);
      if (this.state === 'opening') this.drawZoom(ctx);
      if (this.practice && this.state === 'fight') this.drawLesson(ctx);
      if (this.shadow && this.shadow.t < 0.6) this.drawChord(ctx);
      if (this.state === 'fight' && this.st < 0.9 && !this.practice) this.drawCue(ctx);
      if (this.banner) this.drawBanner(ctx);
      if (this.state === 'bossdown' && this.doneAt) this.drawBalloon(ctx);
      // a balloon caught by a boss going down waits, hidden, and finishes after
      if (this.toast && this.state !== 'bossdown') this.drawToast(ctx);
      if (this.state === 'dying' || this.state === 'over') { ctx.fillStyle = `rgba(0,0,20,${Math.min(0.55, this.st * 0.4 + (this.state === 'over' ? 0.55 : 0))})`; ctx.fillRect(0, 0, W, H); }
      if (this.paused) { ctx.fillStyle = 'rgba(0,0,20,.45)'; ctx.fillRect(0, 0, W, H); }
    }
    // practice, left column: Setup's list of steps, ticked off as he goes, with Setup's famous estimate
    drawSteps(ctx) {
      const pr = this.practice, s = this.s;
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = `bold 11px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.65)'; ctx.fillText(s.practice.toUpperCase(), 38, 110);
      LESSONS.forEach(([id], i) => {
        const y = 134 + i * 26, done = i < pr.step || (i === pr.step && pr.good > 0), now = i === pr.step && !done;
        if (done) {
          ctx.fillStyle = '#3cb043'; dot(ctx, 44, y, 8);
          ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(43, y + 3); ctx.lineTo(48, y - 3); ctx.stroke();
        } else if (now) { ctx.fillStyle = '#e8943a'; ctx.beginPath(); ctx.moveTo(38, y - 7); ctx.lineTo(51, y); ctx.lineTo(38, y + 7); ctx.closePath(); ctx.fill(); }
        else { ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(44, y, 6, 0, TAU); ctx.stroke(); }
        ctx.font = `${now ? 'bold ' : ''}13px ${FONT}`;
        ctx.fillStyle = now ? '#fff' : done ? 'rgba(255,255,255,.78)' : 'rgba(255,255,255,.45)';
        ctx.fillText(s.les[id][0], 62, y);
      });
      if (pr.step >= LESSONS.length) return;
      ctx.font = `11px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.62)';
      wrapText(ctx, s.practiceEta(LESSONS.length - pr.step), 180).forEach((l, i) => ctx.fillText(l, 38, 136 + LESSONS.length * 26 + i * 14));
    }
    // practice, top band: this step's name and how-to with its keys as keycaps; feedback under the band
    drawLesson(ctx) {
      const pr = this.practice, s = this.s, n = Math.min(pr.step, LESSONS.length - 1), [name, how] = s.les[LESSONS[n][0]], x0 = 292;
      const lead = s.lesStep(n + 1, LESSONS.length);
      ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.font = `bold 13px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillText(lead, x0, 22);
      ctx.fillStyle = '#fff'; ctx.fillText(name, x0 + ctx.measureText(lead).width + 6, 22);
      ctx.font = `11px ${FONT}`; ctx.textAlign = 'right'; ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillText(s.lesSkip, W - 16, 22);
      let x = x0;
      for (const part of how.split(/(\[[^\]]+\])/)) {
        if (!part) continue;
        if (part[0] === '[') {
          const label = part.slice(1, -1), sc = 0.78;
          ctx.font = `bold 13px ${FONT}`;
          const kw = Math.max(28, ctx.measureText(label).width + 18);
          keycap(ctx, x + (kw * sc) / 2, 50, kw, label, sc); x += kw * sc + 5;
        } else {
          ctx.font = `14px ${FONT}`; ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
          ctx.fillText(part, x, 50); x += ctx.measureText(part).width;
        }
      }
      if (pr.msgT > 0) {
        ctx.globalAlpha = Math.min(1, pr.msgT * 4); ctx.font = `bold 15px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.lineWidth = 4; ctx.lineJoin = 'round'; ctx.strokeStyle = 'rgba(0,20,70,.75)'; ctx.strokeText(pr.msg, 596, 100);
        ctx.fillStyle = pr.msgGood ? '#9dffa0' : '#ffe39a'; ctx.fillText(pr.msg, 596, 100);
        ctx.globalAlpha = 1;
      }
    }
    // the slow after a perfect dodge: cold edges that come in at once and fade over the last quarter second
    drawSlow(ctx) {
      const k = Math.min(1, this.slow / 0.25), g = ctx.createRadialGradient(W / 2, H / 2, 120, W / 2, H / 2, 600);
      g.addColorStop(0, 'rgba(120,200,255,0)'); g.addColorStop(1, `rgba(30,100,210,${0.5 * k})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = `rgba(160,220,255,${0.1 * k})`; ctx.fillRect(0, 0, W, H);
    }
    // phase two: the arena's edges pulse in the boss's colour
    drawRage(ctx, b) {
      const a = 0.12 + 0.07 * Math.sin(this.clock * 4), c = { mines: '255,40,20', cards: '120,30,170', pinball: '255,50,110', desktop: '255,70,40', bsod: '255,255,255' }[b.arena];
      const g = ctx.createRadialGradient(W / 2, H / 2, 220, W / 2, H / 2, 620);
      g.addColorStop(0, `rgba(${c},0)`); g.addColorStop(1, `rgba(${c},${a})`);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    drawDecals(ctx) {
      for (const d of this.decals) {
        ctx.globalAlpha = Math.min(1, (7 - d.t) / 1.5) * 0.85; ctx.fillStyle = d.c;
        ctx.beginPath(); ctx.ellipse(d.x, d.y - 1, d.r, d.r * 0.22, 0, 0, TAU); ctx.fill();
        for (let i = 0; i < 5; i++) { const a = d.seed + i * 1.3; dot(ctx, d.x + Math.cos(a) * d.r * 1.15, d.y - 1 + Math.sin(a) * 2, 2 + (i % 3)); }
      }
      ctx.globalAlpha = 1;
    }
    drawItems(ctx) {
      for (const it of this.items) {
        // the last seconds on the ground: it blinks, faster at the very end
        if (it.st === 'rest' && it.t > it.life - 2.5 && Math.floor(it.t * (it.t > it.life - 1 ? 16 : 8)) % 2 === 0) continue;
        const cof = it.kind === 'coffee', y = it.y - 14 + (it.st === 'rest' ? Math.sin(it.t * 4) * 2 : 0), pulse = 0.5 + 0.5 * Math.sin(it.t * 6);
        if (it.st === 'fall') parachute(ctx, it.x, y, it.t, cof);
        ctx.fillStyle = cof ? `rgba(76,218,80,${0.22 + 0.16 * pulse})` : `rgba(255,228,23,${0.16 + 0.12 * pulse})`; dot(ctx, it.x, y, 22 + pulse * 3);
        drawItem(ctx, it.kind, it.x, y, it.t, it.color);
        if (it.st === 'rest') tag(ctx, it.x, y - 46, cof ? `${this.s.items.coffee} +2` : this.s.items[it.kind]);
      }
    }
    drawShots(ctx) {
      for (const s of this.shots) {
        if (s.kind === 'cd') drawDisc(ctx, s.x, s.y, 11, s.spin);
        else { ctx.fillStyle = s.c; dot(ctx, s.x, s.y, 7); ctx.fillStyle = 'rgba(255,255,255,.55)'; dot(ctx, s.x - 2, s.y - 2.5, 2.2); }
      }
    }
    drawShadow(ctx) {
      const p = this.player;
      if (p.dead) return;
      let gy = FLOOR;
      for (const pl of this.plats()) if (p.x > pl.x1 - 8 && p.x < pl.x2 + 8 && pl.y >= p.y - 1 && pl.y < gy) gy = pl.y;
      const k = clamp(1 - (gy - p.y) / 320, 0.25, 1);
      ctx.fillStyle = `rgba(0,0,0,${0.24 * k})`; ctx.beginPath(); ctx.ellipse(p.x, gy - 1, 17 * k, 4.5 * k, 0, 0, TAU); ctx.fill();
    }
    // wet paint on the boss: drips that keep running while it lasts
    drawPaint(ctx, b) {
      const a = b.anchor(), k = Math.min(1, b.paintT / 1.2);
      ctx.globalAlpha = 0.85 * k; ctx.fillStyle = b.paintC;
      for (let i = 0; i < 5; i++) {
        const ang = -Math.PI / 2 + (i - 2) * 0.5, x = a.x + Math.cos(ang) * a.r * 0.7, y = a.y + Math.sin(ang) * a.r * 0.55;
        const len = 8 + ((this.clock * 10 + i * 7) % 18);
        ctx.beginPath(); ctx.ellipse(x, y, 7, 4, 0, 0, TAU); ctx.fill();
        ctx.fillRect(x - 1.6, y, 3.2, len); dot(ctx, x, y + len, 2.6);
      }
      ctx.globalAlpha = 1;
    }
    // End Task came down on it: the boss goes pale at once, as XP drew a window that stopped responding
    drawFrozen(ctx, b) {
      const a = b.anchor(), k = clamp(this.special.t / 0.1, 0, 1);
      ctx.fillStyle = `rgba(255,255,255,${0.5 * k})`; dot(ctx, a.x, a.y, a.r + 8);
    }
    // shadow mode coming on: Ctrl, Alt and Del go down one after another at the top, then fade
    drawChord(ctx) {
      const t = this.shadow.t;
      let x = W / 2 - 112;
      ctx.save(); ctx.globalAlpha = clamp((0.6 - t) / 0.15, 0, 1);
      [['Ctrl', 60], ['Alt', 50], ['Del', 50]].forEach(([label, w], i) => {
        const k = clamp((t - i * 0.07) / 0.1, 0, 1);
        if (k > 0) keycap(ctx, x + w / 2, 112 - (1 - easeOut(k)) * 20 + (t - i * 0.07 < 0.14 ? 3 : 0), w, label, 0.6 + 0.4 * easeOut(k));
        x += w + 26;
        if (i < 2 && k > 0) {
          ctx.font = `bold 20px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.lineWidth = 3.5; ctx.lineJoin = 'round'; ctx.strokeStyle = '#00138c'; ctx.strokeText('+', x - 13, 113);
          ctx.fillStyle = '#fff'; ctx.fillText('+', x - 13, 113);
        }
      });
      ctx.restore();
    }
    // the title (the contract at the top): the desktop the three games live on. The name as the wallpaper's type,
    // the three opponents as giant icons (the first one selected, as it is first up) with their tips as XP
    // tooltips under the pointer, the stickman on the taskbar facing them, and a tray balloon. The Start menu
    // over the start button is DOM (showTitle)
    drawTitle(ctx) {
      const s = this.s, t = this.clock, p = this.player;
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.font = `bold 66px ${FONT}`;
      ctx.save(); ctx.shadowColor = 'rgba(0,20,70,.55)'; ctx.shadowBlur = 16; ctx.shadowOffsetY = 5;
      ctx.fillStyle = '#fff'; ctx.fillText('BOSS RUSH XP', 42, 102);
      ctx.restore();
      const rule = ctx.createLinearGradient(44, 0, 520, 0);
      rule.addColorStop(0, '#e8943a'); rule.addColorStop(1, 'rgba(232,148,58,0)');
      ctx.fillStyle = rule; ctx.fillRect(44, 118, 476, 2);
      ctx.font = `16px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.fillText(s.tagline, 45, 145);
      const draw = [
        (c, x, y) => smileyButton(c, x, y, 92, 'cool', false),
        (c, x, y) => { c.save(); c.translate(x, y); c.rotate(-0.06); c.drawImage(sprites().king, -34, -48, 68, 96); c.restore(); },
        (c, x, y) => pinballFace(c, x, y, 30, t, p.x, p.y - 60, 0, 0),
      ];
      FOES.forEach((f, i) => {
        const y = f.y + Math.sin(t * 2 + i * 1.7) * 3;
        if (i === 0) this.tinted(ctx, draw[i], f.x, y, 132); else draw[i](ctx, f.x, y);
        deskLabel(ctx, f.x, f.y + 80, s.names[i], 14, i === 0);
      });
      if (this.hoverFoe >= 0 && this.state === 'title') { const f = FOES[this.hoverFoe]; tag(ctx, f.x, f.y + 96, s.tips[this.hoverFoe], 190); }
      // the start button's label, and the tray: the stickman's icon and the clock
      startLabel(ctx, s.start.toLowerCase(), true);
      stickHead(ctx, 878, (FLOOR + H) / 2, 7);
      const d = new Date();
      ctx.fillStyle = '#fff'; ctx.font = `13px ${FONT}`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(`${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`, W - 14, (FLOOR + H) / 2);
      // the tray's balloon, a moment after the desktop settles; its stem finds the stickman's icon
      const a = clamp((this.st - 0.8) / 0.25, 0, 1);
      if (a > 0 && this.state === 'title') {
        const w = 262, h = noticeH(ctx, w, s.readyText);
        ctx.globalAlpha = a;
        ctx.save(); ctx.translate(878, FLOOR + 10); ctx.scale(UI.f, UI.f);
        notice(ctx, 40 - w, -22 - h, w, s.readyTitle, s.readyText, (c, x, y) => stickHead(c, x, y, 6));
        ctx.restore();
        ctx.globalAlpha = 1;
      }
    }
    // XP tints a selected desktop icon with Selection Blue: the icon is drawn off screen and tinted there
    tinted(ctx, draw, cx, cy, size) {
      const k = this.k, n = Math.max(1, Math.ceil(size * k)), c = this.tintC || (this.tintC = document.createElement('canvas'));
      if (c.width !== n || c.height !== n) { c.width = n; c.height = n; }
      const x = c.getContext('2d');
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-over'; x.clearRect(0, 0, n, n);
      x.setTransform(k, 0, 0, k, (size / 2 - cx) * k, (size / 2 - cy) * k);
      draw(x, cx, cy);
      x.setTransform(1, 0, 0, 1, 0, 0); x.globalCompositeOperation = 'source-atop';
      x.fillStyle = 'rgba(49,106,197,.4)'; x.fillRect(0, 0, n, n);
      x.globalCompositeOperation = 'source-over';
      ctx.drawImage(c, cx - size / 2, cy - size / 2, size, size);
    }
    // from the title the first opponent opens like a program: XP's zoom rectangle runs from its icon out to the
    // whole arena in ten steps, then the fight's intro begins (straight in under reduced motion)
    openFight() {
      if (this.state !== 'title') return;
      if (reduceMotion) { this.newGame(); return; }
      this.closeDialog(); this.hoverFoe = -1;
      Object.assign(this, { state: 'opening', st: 0 });
      this.snd.play('ui');
    }
    drawZoom(ctx) {
      const f = FOES[0], k = Math.min(10, Math.floor(this.st / 0.022)) / 10;
      const x = lerp(f.x - 62, 0, k), y = lerp(f.y - 66, 0, k), w = lerp(124, W, k), h = lerp(154, H, k);
      ctx.save(); ctx.globalCompositeOperation = 'difference'; ctx.strokeStyle = '#9a9a9a'; ctx.lineWidth = 2;
      ctx.strokeRect(x + 1, y + 1, w - 2, h - 2); ctx.restore();
    }
    // which of the title's giant icons is under the pointer (-1 for none)
    point(e) {
      if (this.state !== 'title') { this.hoverFoe = -1; return -1; }
      const r = this.canvas.getBoundingClientRect(), x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
      this.hoverFoe = FOES.findIndex((f) => Math.abs(x - f.x) < 62 && y > f.y - 66 && y < f.y + 88);
      return this.hoverFoe;
    }
    drawHUD(ctx) {
      const s = this.s, p = this.player, b = this.boss;
      ctx.globalAlpha = this.hudA;
      const plate = (x, y, w, h) => {
        ctx.fillStyle = 'rgba(0,20,70,.3)'; rr(ctx, x + 1, y + 3, w, h, 4); ctx.fill();
        const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#fbfaf5'); g.addColorStop(1, '#e3dfcc');
        ctx.fillStyle = g; rr(ctx, x, y, w, h, 4); ctx.fill();
        ctx.strokeStyle = '#8f8b7a'; ctx.lineWidth = 1; rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 4); ctx.stroke();
      };
      const blocks = (x, y, w, h, frac, n, top, mid, bot) => {
        ctx.fillStyle = '#fff'; rr(ctx, x, y, w, h, 3); ctx.fill();
        ctx.strokeStyle = '#444'; ctx.lineWidth = 1; rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 3); ctx.stroke();
        const g = ctx.createLinearGradient(0, y, 0, y + h);
        g.addColorStop(0, top || '#acedad'); g.addColorStop(0.5, mid || '#4cda50'); g.addColorStop(1, bot || '#76e278');
        ctx.fillStyle = g;
        const bw = (w - 2) / n - 2, lit = Math.floor(frac * n + 0.001);
        for (let i = 0; i < lit; i++) ctx.fillRect(x + 2 + i * (bw + 2), y + 2, bw, h - 4);
      };
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      plate(12, 10, 196, 58);
      ctx.fillStyle = '#000'; ctx.font = `bold 12px ${FONT}`; ctx.fillText(s.stick, 21, 26);
      // health: green blocks, red once coffee territory starts; the first empty block fills as clean hits restore it
      const n = p.hpMax, crit = p.hp > 0 && p.hp <= COFFEE_AT, cw = 178 / n - 2, cell = (i) => 22 + i * (cw + 2);
      if (crit) blocks(20, 31, 180, 12, p.hp / n, n, '#ffc2b8', Math.sin(this.clock * 8) > 0 ? '#ff5a3c' : '#e0301e', '#f08a7a');
      else blocks(20, 31, 180, 12, p.hp / n, n);
      if (p.hp < n && p.restoreShow > 0.05) {
        // a paler green than a whole block, with a glinting front edge that shows it is still filling
        const x = cell(p.hp), w = cw * clamp(p.restoreShow / RESTORE, 0, 1), rg = ctx.createLinearGradient(0, 33, 0, 41);
        rg.addColorStop(0, '#dcf9dd'); rg.addColorStop(0.5, '#8fe392'); rg.addColorStop(1, '#b3eeb5');
        ctx.fillStyle = rg; ctx.fillRect(x, 33, w, 8);
        ctx.fillStyle = `rgba(23,128,27,${0.55 + 0.45 * Math.sin(this.clock * 10)})`; ctx.fillRect(x + w - 1.5, 33, 1.5, 8);
      }
      if (p.healT > 0) { ctx.fillStyle = `rgba(255,255,255,${p.healT / 0.9})`; for (let i = p.healFrom; i < p.hp; i++) ctx.fillRect(cell(i), 33, cw, 8); }
      // what a hit just took (the block, and any health on its way back) flashes pale and fades out
      if (p.hitT > 0) { ctx.fillStyle = `rgba(255,226,140,${p.hitT / 0.45})`; for (let i = p.hp; i < Math.min(n, p.hp + p.hitN); i++) ctx.fillRect(cell(i), 33, cw, 8); }
      // in shadow mode the note says what F does now; otherwise it tells health coming back, or health running out
      const note = this.shadow ? [s.shadowHud, '#0b4f9c'] : p.hp < n && p.restore > 0 ? [s.restoring, '#17801b'] : crit && Math.sin(this.clock * 8) > -0.4 ? [s.critical, '#c8102e'] : null;
      if (note) { ctx.font = `bold 10px ${FONT}`; ctx.textAlign = 'right'; ctx.fillStyle = note[1]; ctx.fillText(note[0], 200, 26); ctx.textAlign = 'left'; }
      // the special meter: Luna blue while it fills, the orange hover glow once F is ready, and in shadow mode
      // the cyan of the mode, running down while F waits to fire End Task
      const full = p.meter >= 100, pulse = Math.floor(this.clock * 6) % 2 === 0, sh = !!this.shadow;
      ctx.fillStyle = sh ? (pulse ? '#bfefff' : SHADOW_C) : full && pulse ? '#fbc761' : '#fff'; rr(ctx, 20, 48, 14, 14, 3); ctx.fill();
      ctx.strokeStyle = sh ? '#2a8fd0' : full ? '#e5a01a' : '#6d6a60'; ctx.lineWidth = 1; rr(ctx, 20.5, 48.5, 13, 13, 3); ctx.stroke();
      ctx.fillStyle = '#000'; ctx.font = `bold 10px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('F', 27, 55.5);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      if (sh) blocks(38, 49, 162, 12, p.meter / 100, 16, '#dff6ff', SHADOW_C, '#3aa0dd');
      else if (full) blocks(38, 49, 162, 12, 1, 16, '#fff0cf', pulse ? '#fbc761' : '#e5a01a', '#fdd889');
      else blocks(38, 49, 162, 12, p.meter / 100, 16, '#9fc1ff', '#3c81f3', '#1e52b7');
      if (p.weapon) {
        const w = p.weapon;
        plate(214, 10, 54, 58);
        if (!(w.t < 4 && Math.floor(w.t * 8) % 2)) drawItem(ctx, w.kind, 241, 36, this.clock, w.color);
        ctx.fillStyle = '#fff'; ctx.fillRect(220, 58, 42, 5); ctx.strokeStyle = '#6d6a60'; ctx.strokeRect(220.5, 58.5, 41, 4);
        ctx.fillStyle = w.t < 4 ? '#e0301e' : '#3c81f3'; ctx.fillRect(221, 59, 40 * clamp(w.t / WEAPON_TIME, 0, 1), 3);
      }
      if (b && !this.practice) {
        const pct = Math.round(b.progress * 100);
        plate(W / 2 - 200, 10, 400, 40);
        ctx.fillStyle = '#000'; ctx.font = `bold 12px ${FONT}`; ctx.fillText(s.uninstall(s.names[b.idx]), W / 2 - 191, 26);
        ctx.textAlign = 'right'; ctx.fillText(`${pct}%`, W / 2 + 191, 26); ctx.textAlign = 'left';
        blocks(W / 2 - 192, 31, 384, 12, b.progress, 38);
      }
      if (!this.practice) {
        const bx = RIGHT - 70, by = 12;
        bevel(ctx, bx - 3, by - 3, 70, 38, 2, '#7b7b7b', '#ffffff', '#c0c0c0');
        ctx.fillStyle = '#000'; ctx.fillRect(bx, by, 64, 32);
        const secs = Math.min(999, Math.floor(this.run.time));
        [Math.floor(secs / 100), Math.floor(secs / 10) % 10, secs % 10].forEach((d, i) => seg7(ctx, bx + 4 + i * 20, by + 4, 16, 24, d, '#ff1a1a', '#3b0000'));
      }
      if (this.combo.n >= 2 && this.combo.t > 0) {
        const sc = 1 + this.combo.pop * 2.2, text = s.combo(this.combo.n);
        ctx.font = `bold 16px ${FONT}`;
        const half = (ctx.measureText(text).width + 17.6) / 2;
        ctx.save();
        // in practice the step list has that corner, so the count sits just right of it
        ctx.translate((this.practice ? 252 : 14) + half, 94); ctx.scale(sc, sc); ctx.globalAlpha = Math.min(1, this.combo.t * 3);
        chip(ctx, 0, 0, text, 16);
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }
    drawCue(ctx) {
      const k = this.st / 0.9, sc = 1 + Math.max(0, 0.35 - k) * 1.4;
      ctx.save();
      ctx.globalAlpha = k > 0.6 ? Math.max(0, 1 - (k - 0.6) / 0.4) : 1;
      ctx.translate(W / 2, H / 2 - 20); ctx.scale(sc, sc);
      chip(ctx, 0, 0, this.s.fight, 60);
      ctx.restore();
    }
    // phase two: a Luna band sweeps across with the news
    drawBanner(ctx) {
      const t = this.banner.t, s = this.s;
      const x = (1 - easeOut(clamp(t / 0.25, 0, 1))) * -W + clamp((t - 1.3) / 0.3, 0, 1) * W, y = H / 2 - 52, h = 86;
      const g = ctx.createLinearGradient(0, y, 0, y + h);
      g.addColorStop(0, '#4f86ec'); g.addColorStop(0.16, '#2a62d8'); g.addColorStop(0.6, '#1d51c4'); g.addColorStop(1, '#17429f');
      ctx.fillStyle = g; ctx.fillRect(x, y, W, h);
      const rule = (ry, c) => { const r = ctx.createLinearGradient(x, 0, x + W, 0); r.addColorStop(0, 'rgba(0,0,0,0)'); r.addColorStop(0.5, c); r.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = r; ctx.fillRect(x, ry, W, 2); };
      rule(y, 'rgba(255,255,255,.8)'); rule(y + h - 2, '#e8943a');
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = `bold 44px ${FONT}`; ctx.fillStyle = 'rgba(0,20,70,.4)'; ctx.fillText(s.phase2, x + W / 2 + 2, y + 38);
      ctx.fillStyle = '#fff'; ctx.fillText(s.phase2, x + W / 2, y + 36);
      ctx.font = `bold 13px ${FONT}`; ctx.fillStyle = 'rgba(255,255,255,.86)'; ctx.fillText(s.names[this.bossIdx], x + W / 2, y + 68);
    }
    // XP's notification balloon, pointing down at the real taskbar under the window
    drawBalloon(ctx) {
      const t = this.st - this.doneAt, a = Math.min(1, t * 5) * Math.min(1, Math.max(0, (2.3 - t) * 4));
      const w = 290, h = noticeH(ctx, w, this.s.removed);
      ctx.globalAlpha = a;
      ctx.save(); ctx.translate(W - 20, H - 12); ctx.scale(UI.f, UI.f);
      notice(ctx, -w, -22 - h, w, this.s.names[this.bossIdx], this.s.removed, infoIcon);
      ctx.restore();
      ctx.globalAlpha = 1;
    }
    // an achievement balloon in the same corner, its medal for the icon; see-through while the fight is behind it
    drawToast(ctx) {
      const q = this.toast, s = this.s, [name, how] = s.ach[q.id];
      const f = UI.f, w = 290, h = noticeH(ctx, w, how), x = W - 20 - w * f, y = H - 12 - (h + 22) * f, p = this.player, b = this.boss;
      const an = b && !b.gone && this.state === 'fight' ? b.anchor() : null;
      const behind = (this.state === 'fight' && p.x > x - 30 && p.x < x + w + 30 && p.y > y - 10)
        || (an && an.x + an.r > x && an.x - an.r < x + w && an.y + an.r > y);
      ctx.globalAlpha = Math.min(1, q.t * 5) * Math.min(1, Math.max(0, (TOAST_TIME - q.t) * 3)) * (behind ? 0.35 : 1);
      ctx.save(); ctx.translate(W - 20, H - 12); ctx.scale(f, f);
      notice(ctx, -w, -22 - h, w, s.achToast(name), how, (c, cx, cy) => { c.save(); c.translate(cx, cy - 1); c.scale(0.62, 0.62); medal(c, 0, 0); c.restore(); });
      ctx.restore();
      ctx.globalAlpha = 1;
    }
  }

  window.BossRushXP = { create: (opts) => new Game(opts || {}), minWidth: MIN_W, minHeight: MIN_H };
})();
