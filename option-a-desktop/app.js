/* Option A — Desktop XP. Window manager, desktop, start menu, and the four window types. */
(() => {
  'use strict';
  const PF = window.PF;
  const PX = window.PXI;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const I = (name, size = 32) => PX.svg(name, size);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // phone mode (style.css, SMALL SCREENS): narrow, or a phone turned sideways
  const mqMobile = window.matchMedia('(max-width: 720px), (max-height: 500px) and (pointer: coarse)');
  const isMobile = () => mqMobile.matches;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let lang = PF.getLang();
  const t = (v) => PF.t(v, lang);
  /* ------------------------------------------------------------ strings */
  const UI = {
    en: {
      start: 'Start', about: 'About Me', work: 'Portfolio', resume: 'Resume', resumeFile: 'Resume.pdf', contact: 'Contact',
      network: 'Network', recycle: 'Recycle Bin', language: 'Language', shutdown: 'Shut Down…', openFolder: 'Open folder',
      minimize: 'Minimize', maximize: 'Maximize', close: 'Close',
      photoAlt: 'Portrait of Iqbal Surya',
      openPortfolio: 'View portfolio', downloadCV: 'Download CV', contactMe: 'Contact me',
      history: 'Career history',
      to: 'To', worklog: 'Work log', worklogLead: 'Where I’ve been, and who I’ve built things with.', present: 'Present', ft: 'Full-time', fl: 'Freelance', projects: 'Personal projects', projectsLead: 'Things I make when nobody’s asking: experiments, small tools, and ideas I wanted to test.', diskLabel: 'Side projects', offClock: 'Off the clock', offClockText: 'Traveling, food, coffee, and books. Travel reminds me who I am designing for, and reading keeps my ideas fresh.', myPictures: 'My Pictures', build: 'Let’s build something together.', buildLead: 'Need a website or app that looks sharp and works properly? Tick what you need and send me a note.', need: 'What do you need?', sendMsg: 'Send a message', reachDirect: 'Or reach me directly', emailLabel: 'Email', mailSubject: 'Project inquiry', mailBody: (list) => `Hi Iqbal,\n\n${list ? `I’d like help with: ${list}.\n\n` : ''}A bit about the project:\n`, factWhere: 'Based in', factExp: 'Experience', factLang: 'Languages', sinceYear: (y) => `UI design since ${y}`, also: 'Also',
      footer: '© 2026 Iqbal Surya', creditsTitle: 'About this portfolio', creditsVer: 'Version 2026 · Made in Indonesia', creditsIcons: 'Icons: Pixel Icon Library by HackerNoon, licensed under CC BY 4.0. Recoloured here as two-tone icons.',
      file: 'File', view: 'View', help: 'Help', play: 'Play', up: 'Up',
      address: 'Address', myDocs: 'My Documents', thumbnails: 'Thumbnails', details: 'Details', open: 'Open',
      arrangeNo: 'Arrange by Number', arrangeName: 'Arrange by Name', aboutPortfolio: 'About this portfolio',
      objects: (n) => `${n} object(s)`, caseStudies: 'Case studies', caseTasks: 'Case study tasks', otherPlaces: 'Other Places', myComputer: 'My Computer',
      colNo: 'No.', colName: 'Name', colTags: 'Keywords', typeCase: 'Case study',
      openCase: 'Open case study', player: 'Case Study Player', chapters: 'Chapters', notYet: 'Not published',
      askAbout: (x) => `Ask me about ${x}`, askSubject: (x) => `${x} case study`, askBody: (x) => `Hi Iqbal,\n\nI saw ${x} in your portfolio and would like to hear more about it.\n\n`,
      writeup: 'I haven’t published the full write-up for this project yet. Ask me about it and I’ll reply by email.',
      lblCase: 'Case', lblLink: 'Link', sizes: ['Small', 'Medium', 'Large'],
      fullCase: 'Full case study', picSoon: (x) => `${x} (picture to come)`,
      overview: 'Overview', nowReading: 'Now reading',
      prevCase: 'Previous case', nextCase: 'Next case', nextSection: 'Next section', stop: 'Back to portfolio',
      textSize: 'Text size', readPos: 'Reading position',
      switchCase: 'Choose a case study', copyLink: 'Copy link to this case', linkCopied: 'Link copied',
      coverAlt: (x) => `${x}: cover`,
      sendEmail: 'Send an email', copyEmail: 'Copy address', copyHint: 'Paste it into any mail app', copied: 'Copied!',
      availability: 'Availability', openProfile: (n) => `Open ${n} profile`, newTab: 'opens in a new tab',
      cvDownload: 'Download CV (PDF)', cvHint: 'One page, updated 2026', cvByMail: 'Request my CV', cvByMailHint: 'Latest version, sent by email',
      fileDownload: 'File Download', dlText: 'You have chosen to download a file from this location.', from: 'from',
      dlQ: 'What would you like to do with this file?', dlOpen: 'Open this file from its current location', dlSave: 'Save this file to disk',
      ok: 'OK', cancel: 'Cancel', cvAsk: 'I send my CV by email, so you always get the latest version.', cvAskBtn: 'Request CV', cvSubject: 'CV request', cvBody: 'Hi Iqbal,\n\nCould you send me your latest CV?\n\n',
      shutTitle: 'Shut Down', shutQ: 'What do you want the computer to do?', shutDown: 'Shut down', restart: 'Restart',
      safe: "It's now safe to turn off your computer.", clickRestart: 'Click anywhere to start again',
      binFrom: 'Original location', binDeleted: 'Date deleted', binNote: 'Ideas that did not make it',
      binItems: [['portfolio_v7_FINAL_final2.fig', 'C:\\Work', '12/03/2025'], ['logo-option-23.png', 'C:\\Work\\Logos', '02/11/2024'], ['idea-at-3am.txt', 'C:\\Notes', '21/06/2024'], ['lorem-ipsum-forever.doc', 'C:\\Drafts', '09/01/2023']],
      home: 'Home', startProject: 'Start a project', watchWork: 'Watch the work',
      nowShowing: 'Now showing', detected: 'Detected',
      shotName: (n) => `UI shot ${n}`, openShot: (name) => `Open ${name}`, noSignal: 'No signal',
      viewer: 'Picture Viewer', prevPic: 'Previous picture', nextPic: 'Next picture', slideShow: 'Start slide show', stopShow: 'Stop slide show', openLink: 'Open link', picOf: (i, n) => `${i} of ${n}`,
      youGet: 'What you get:', epLabel: (n) => `EP ${n}`, epKey: (n) => `Episode ${n}`, prevEp: 'Previous episode', nextEp: 'Next episode',
      remote: 'Episode remote', channel: (n) => `CH ${String(n).padStart(2, '0')}`,
      helpTitle: 'Help Topics', helpTab: 'Contents', helpPick: 'Select a topic to read it.', openAbout: 'Open About Me',
      newMessage: 'New Message', send: 'Send', toLabel: 'To:', subject: 'Subject:', message: 'Message', msgPlaceholder: 'Hi Iqbal, I’d like to talk about…', subjectOther: 'Something else', subjectPrefix: 'Project inquiry', sendMeMsg: 'Send me a message', sendHint: 'I reply to the address in From.',
      fromLabel: 'From:', fromPlaceholder: 'you@company.com', sending: 'Sending…', sentTitle: 'Message sent', sentNote: (a) => `I’ll reply to ${a}.`,
      mailAppTitle: 'Opening your email app', mailAppNote: 'Nothing opened? Copy my address and paste your message into any email.',
      showAtStart: 'Show Home each time the portfolio starts',
      copyAddr: 'Copy', copiedAddr: 'Copied', copiedNote: 'Email address copied', watchAgain: 'Watch again from the top',
      gameMenu: 'Game', gameNew: 'New game', gamePause: 'Pause', gameSound: 'Sound', gameAch: 'Achievements', gameBoard: 'Leaderboard', gamePet: 'Stickman on the taskbar', gameExit: 'Exit', gameHow: 'How to play',
      gameLoading: 'Starting Boss Rush XP…', gameFailed: 'Boss Rush XP could not start. Close this window and try again.',
      gameKeys: '← → move · ↑ jump · A punch · S kick · W guard · D dash · F special · P pause',
      gateHead: 'Boss Rush XP needs a bigger screen.', gateText: 'A phone screen is too small for it, and it is played with a keyboard. Open this page on a laptop or desktop computer.',
      gateBoard: 'Leaderboard', gateCols: ['#', 'Name', 'Time'], gateLoading: 'Loading…',
      gateBoardText: (n) => `${n} ${n === 1 ? 'player has' : 'players have'} beaten it. Open this page on a computer to take them on.`, gateBoardEmpty: 'Nobody has beaten it yet. Be the first, on a computer.',
      binExe: ['do-not-open.exe', 'C:\\Program Files\\Games', '01/04/2026'],
    },
    id: {
      start: 'Mulai', about: 'Tentang Saya', work: 'Portofolio', resume: 'CV', resumeFile: 'CV.pdf', contact: 'Kontak',
      network: 'Jaringan', recycle: 'Tempat Sampah', language: 'Bahasa', shutdown: 'Matikan…', openFolder: 'Buka folder',
      minimize: 'Kecilkan', maximize: 'Besarkan', close: 'Tutup',
      photoAlt: 'Potret Iqbal Surya',
      openPortfolio: 'Lihat portofolio', downloadCV: 'Unduh CV', contactMe: 'Hubungi saya',
      history: 'Riwayat karier',
      to: 'Untuk', worklog: 'Catatan kerja', worklogLead: 'Tempat saya pernah bekerja, dan tim yang pernah membangun produk bersama saya.', present: 'Sekarang', ft: 'Full-time', fl: 'Freelance', projects: 'Project pribadi', projectsLead: 'Hal-hal yang saya buat tanpa diminta: eksperimen, tools kecil, dan ide yang ingin saya uji.', diskLabel: 'Project pribadi', offClock: 'Di luar jam kerja', offClockText: 'Jalan-jalan, kuliner, kopi, dan buku. Jalan-jalan mengingatkan saya untuk siapa saya mendesain, dan membaca menjaga ide saya tetap segar.', myPictures: 'My Pictures', build: 'Mari bangun sesuatu bersama.', buildLead: 'Butuh website atau aplikasi yang tampil rapi dan berfungsi dengan baik? Centang yang Anda butuhkan, lalu kirim pesan.', need: 'Apa yang Anda butuhkan?', sendMsg: 'Kirim pesan', reachDirect: 'Atau hubungi saya langsung', emailLabel: 'Email', mailSubject: 'Tanya project', mailBody: (list) => `Halo Iqbal,\n\n${list ? `Saya butuh bantuan untuk: ${list}.\n\n` : ''}Sedikit tentang project-nya:\n`, factWhere: 'Domisili', factExp: 'Pengalaman', factLang: 'Bahasa', sinceYear: (y) => `Desain UI sejak ${y}`, also: 'Lainnya',
      footer: '© 2026 Iqbal Surya', creditsTitle: 'Tentang portofolio ini', creditsVer: 'Versi 2026 · Dibuat di Indonesia', creditsIcons: 'Ikon: Pixel Icon Library oleh HackerNoon, berlisensi CC BY 4.0. Di sini diwarnai ulang menjadi ikon dua warna.',
      file: 'Berkas', view: 'Tampilan', help: 'Bantuan', play: 'Putar', up: 'Naik',
      address: 'Alamat', myDocs: 'Dokumen Saya', thumbnails: 'Gambar mini', details: 'Rincian', open: 'Buka',
      arrangeNo: 'Urutkan menurut Nomor', arrangeName: 'Urutkan menurut Nama', aboutPortfolio: 'Tentang portofolio ini',
      objects: (n) => `${n} objek`, caseStudies: 'Studi kasus', caseTasks: 'Tugas studi kasus', otherPlaces: 'Tempat Lain', myComputer: 'Komputer Saya',
      colNo: 'No.', colName: 'Nama', colTags: 'Kata kunci', typeCase: 'Studi kasus',
      openCase: 'Buka studi kasus', player: 'Pemutar Studi Kasus', chapters: 'Bab', notYet: 'Belum terbit',
      askAbout: (x) => `Tanya saya soal ${x}`, askSubject: (x) => `Studi kasus ${x}`, askBody: (x) => `Halo Iqbal,\n\nSaya melihat ${x} di portofolio Anda dan ingin tahu lebih banyak.\n\n`,
      writeup: 'Saya belum menerbitkan tulisan lengkap untuk project ini. Tanyakan saja, saya akan membalas lewat email.',
      lblCase: 'Kasus', lblLink: 'Tautan', sizes: ['Kecil', 'Sedang', 'Besar'],
      fullCase: 'Studi kasus lengkap', picSoon: (x) => `${x} (gambar menyusul)`,
      overview: 'Ringkasan', nowReading: 'Sedang dibaca',
      prevCase: 'Kasus sebelumnya', nextCase: 'Kasus berikutnya', nextSection: 'Bagian berikutnya', stop: 'Kembali ke portofolio',
      textSize: 'Ukuran teks', readPos: 'Posisi baca',
      switchCase: 'Pilih studi kasus', copyLink: 'Salin tautan kasus ini', linkCopied: 'Tautan tersalin',
      coverAlt: (x) => `${x}: sampul`,
      sendEmail: 'Kirim email', copyEmail: 'Salin alamat', copyHint: 'Tempel di aplikasi email mana pun', copied: 'Tersalin!',
      availability: 'Ketersediaan', openProfile: (n) => `Buka profil ${n}`, newTab: 'buka di tab baru',
      cvDownload: 'Unduh CV (PDF)', cvHint: 'Satu halaman, diperbarui 2026', cvByMail: 'Minta CV saya', cvByMailHint: 'Versi terbaru, dikirim lewat email',
      fileDownload: 'Unduh Berkas', dlText: 'Anda memilih untuk mengunduh berkas dari lokasi ini.', from: 'dari',
      dlQ: 'Apa yang ingin Anda lakukan dengan berkas ini?', dlOpen: 'Buka berkas dari lokasinya', dlSave: 'Simpan berkas ke disk',
      ok: 'OK', cancel: 'Batal', cvAsk: 'CV saya kirim lewat email, supaya Anda selalu mendapat versi terbaru.', cvAskBtn: 'Minta CV', cvSubject: 'Permintaan CV', cvBody: 'Halo Iqbal,\n\nBoleh kirimkan CV terbaru Anda?\n\n',
      shutTitle: 'Matikan', shutQ: 'Apa yang ingin dilakukan komputer?', shutDown: 'Matikan', restart: 'Mulai ulang',
      safe: 'Sekarang aman untuk mematikan komputer Anda.', clickRestart: 'Klik di mana saja untuk memulai lagi',
      binFrom: 'Lokasi asal', binDeleted: 'Tanggal dihapus', binNote: 'Ide yang tidak lolos',
      binItems: [['portofolio_v7_FINAL_final2.fig', 'C:\\Kerja', '12/03/2025'], ['logo-opsi-23.png', 'C:\\Kerja\\Logo', '02/11/2024'], ['ide-jam-3-pagi.txt', 'C:\\Catatan', '21/06/2024'], ['lorem-ipsum-selamanya.doc', 'C:\\Draf', '09/01/2023']],
      home: 'Beranda', startProject: 'Mulai project', watchWork: 'Tonton karyanya',
      nowShowing: 'Sedang tayang', detected: 'Terdeteksi',
      shotName: (n) => `Shot UI ${n}`, openShot: (name) => `Buka ${name}`, noSignal: 'Tidak ada sinyal',
      viewer: 'Penampil Gambar', prevPic: 'Gambar sebelumnya', nextPic: 'Gambar berikutnya', slideShow: 'Mulai tayangan slide', stopShow: 'Hentikan tayangan slide', openLink: 'Buka tautan', picOf: (i, n) => `${i} dari ${n}`,
      youGet: 'Yang Anda dapat:', epLabel: (n) => `EP ${n}`, epKey: (n) => `Episode ${n}`, prevEp: 'Episode sebelumnya', nextEp: 'Episode berikutnya',
      remote: 'Remote episode', channel: (n) => `CH ${String(n).padStart(2, '0')}`,
      helpTitle: 'Topik Bantuan', helpTab: 'Isi', helpPick: 'Pilih topik untuk membacanya.', openAbout: 'Buka Tentang Saya',
      newMessage: 'Pesan Baru', send: 'Kirim', toLabel: 'Kepada:', subject: 'Subjek:', message: 'Pesan', msgPlaceholder: 'Halo Iqbal, saya ingin membicarakan…', subjectOther: 'Hal lain', subjectPrefix: 'Tanya project', sendMeMsg: 'Kirim saya pesan', sendHint: 'Saya membalas ke alamat di kolom Dari.',
      fromLabel: 'Dari:', fromPlaceholder: 'anda@perusahaan.com', sending: 'Mengirim…', sentTitle: 'Pesan terkirim', sentNote: (a) => `Saya akan membalas ke ${a}.`,
      mailAppTitle: 'Membuka aplikasi email', mailAppNote: 'Tidak ada yang terbuka? Salin alamat saya, lalu tempel pesan Anda di email mana pun.',
      showAtStart: 'Tampilkan Beranda setiap kali portofolio dibuka',
      copyAddr: 'Salin', copiedAddr: 'Tersalin', copiedNote: 'Alamat email tersalin', watchAgain: 'Tonton lagi dari awal',
      gameMenu: 'Permainan', gameNew: 'Permainan baru', gamePause: 'Jeda', gameSound: 'Suara', gameAch: 'Pencapaian', gameBoard: 'Papan peringkat', gamePet: 'Stickman di taskbar', gameExit: 'Keluar', gameHow: 'Cara bermain',
      gameLoading: 'Memulai Boss Rush XP…', gameFailed: 'Boss Rush XP gagal dimulai. Tutup jendela ini, lalu coba lagi.',
      gameKeys: '← → gerak · ↑ lompat · A pukul · S tendang · W tangkis · D dash · F spesial · P jeda',
      gateHead: 'Boss Rush XP butuh layar yang lebih besar.', gateText: 'Layar ponsel terlalu kecil untuk game ini, yang dimainkan dengan keyboard. Buka halaman ini di laptop atau komputer.',
      gateBoard: 'Papan peringkat', gateCols: ['#', 'Nama', 'Waktu'], gateLoading: 'Memuat…',
      gateBoardText: (n) => `${n} pemain sudah menamatkannya. Buka halaman ini di komputer untuk menantang mereka.`, gateBoardEmpty: 'Belum ada yang menamatkannya. Jadilah yang pertama, di komputer.',
      binExe: ['jangan-dibuka.exe', 'C:\\Program Files\\Game', '01/04/2026'],
    },
  };
  const u = (k, ...a) => {
    const v = UI[lang][k] !== undefined ? UI[lang][k] : UI.en[k];
    return typeof v === 'function' ? v(...a) : v;
  };

  /* ------------------------------------------------------------ glyphs */
  // Luna caption glyphs, drawn white by the button's colour
  const GLYPH = {
    min: '<svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true"><rect x="2" y="7" width="6" height="3"/></svg>',
    max: '<svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true"><path fill-rule="evenodd" d="M1 1h9v9H1zM2.5 3.5v5h6v-5z"/></svg>',
    restore: '<svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true"><path fill-rule="evenodd" d="M3 1h7v6H8V3H3zM1 4h7v6H1zM2.5 5.8v2.7h4V5.8z"/></svg>',
    close: '<svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true"><path d="M2 2l7 7M9 2l-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="square"/></svg>',
    arrow: '<svg width="4" height="7" viewBox="0 0 4 7" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 0h1v7H0zM1 1h1v5H1zM2 2h1v3H2zM3 3h1v1H3z" fill="currentColor"/></svg>',
    bullet: '<svg width="6" height="6" viewBox="0 0 6 6" shape-rendering="crispEdges" aria-hidden="true"><path d="M1 0h4v6H1zM0 1h6v4H0z" fill="currentColor"/></svg>',
    down: '<svg width="7" height="4" viewBox="0 0 7 4" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 0h7v1H0zM1 1h5v1H1zM2 2h3v1H2zM3 3h1v1H3z" fill="currentColor"/></svg>',
    sortDown: '<svg width="7" height="4" viewBox="0 0 7 4" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 0h7v1H0zM1 1h5v1H1zM2 2h3v1H2zM3 3h1v1H3z" fill="currentColor"/></svg>',
    sortUp: '<svg width="7" height="4" viewBox="0 0 7 4" shape-rendering="crispEdges" aria-hidden="true"><path d="M3 0h1v1H3zM2 1h3v1H2zM1 2h5v1H1zM0 3h7v1H0z" fill="currentColor"/></svg>',
  };

  /* ------------------------------------------------------------ helpers */
  function clockText() {
    const d = new Date();
    const mm = String(d.getMinutes()).padStart(2, '0');
    if (lang === 'id') return `${String(d.getHours()).padStart(2, '0')}.${mm}`;
    const h = d.getHours();
    return `${h % 12 || 12}:${mm} ${h >= 12 ? 'PM' : 'AM'}`;
  }
  const words = (s) => String(s).trim().split(/\s+/).length;
  const fmtTime = (sec) => `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(Math.round(sec % 60)).padStart(2, '0')}`;
  function toast(msg, anchor) {
    const el = document.createElement('div');
    el.className = 'toast'; el.setAttribute('role', 'status'); el.textContent = msg;
    document.body.appendChild(el);
    const r = anchor ? anchor.getBoundingClientRect() : { left: innerWidth / 2, top: innerHeight / 2, width: 0 };
    el.style.left = clamp(r.left, 4, innerWidth - el.offsetWidth - 4) + 'px';
    el.style.top = Math.max(4, r.top - 28) + 'px';
    setTimeout(() => el.remove(), 1600);
  }
  // Counts what visitors do (a case opened, the CV, a message sent) through /api/event (worker/index.js):
  // one number per day and event, with no cookie and nothing about the visitor. The page never waits on it
  function track(e, d = '') {
    try { navigator.sendBeacon('/api/event', new Blob([JSON.stringify({ e, d })], { type: 'application/json' })); } catch (err) { /* counting is optional */ }
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {
      const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false; try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
      ta.remove(); return ok;
    }
  }

  /* ------------------------------------------------------------ window manager */
  const desktopEl = $('#desktop');
  const layer = $('#windows');
  const tasksEl = $('#tasks');
  const zr = $('#zoomRect');
  const wins = new Map();
  let zTop = 20;
  let activeId = null;

  const rectOf = (el) => { if (!el) return null; const r = el.getBoundingClientRect(); return r.width ? { x: r.left, y: r.top, w: r.width, h: r.height } : null; };
  function zoom(from, to, done) {
    if (reduceMotion || !from || !to) { if (done) done(); return; }
    const steps = 7; let i = 0;
    zr.style.display = 'block';
    const frame = () => {
      i += 1; const k = i / steps;
      zr.style.left = from.x + (to.x - from.x) * k + 'px';
      zr.style.top = from.y + (to.y - from.y) * k + 'px';
      zr.style.width = from.w + (to.w - from.w) * k + 'px';
      zr.style.height = from.h + (to.h - from.h) * k + 'px';
      if (i < steps) setTimeout(frame, 22); else { zr.style.display = 'none'; if (done) done(); }
    };
    frame();
  }

  function geometryFor(id) {
    const W = desktopEl.clientWidth, H = desktopEl.clientHeight;
    const left = W > 900 ? 100 : 12;
    // Home is the landing page: large, centred in the space right of the icons, with desktop still showing around it
    if (id === 'home') { const w = clamp(W - left - 48, 460, 1180); return { x: left + Math.round((W - left - w) / 2), y: 12, w, h: Math.min(H - 24, 960) }; }
    if (id === 'about') return { x: left, y: 12, w: clamp(Math.round(W * 0.56), 460, 800), h: Math.min(H - 24, 900) };
    // the Portfolio: wide enough for three covers across beside the task pane, cascaded to the right over Home
    if (id === 'work') {
      const w = clamp(W - left - 96, 480, 920), h = clamp(H - 64, 360, 720);
      return { x: Math.max(left, W - w - 40), y: Math.max(12, Math.round((H - h) / 2) - 8), w, h };
    }
    if (id === 'player') {
      // a desktop not laid out yet (a tab opened in the background) measures 0, so the skin keeps a usable size
      const w = clamp(W - left - 30, 480, 1280), h = clamp(H - 20, 360, 900);
      return { x: Math.max(left, Math.round((W - w) / 2) + 36), y: Math.max(8, Math.round((H - h) / 2)), w, h };
    }
    if (id === 'contact') { const w = Math.min(580, W - 40), h = Math.min(492, H - 40); return { x: Math.round((W - w) / 2) + 70, y: Math.round((H - h) / 2) - 16, w, h }; }
    if (id === 'recycle') return { x: Math.round(W / 2 - 260), y: Math.round(H / 2 - 170), w: 520, h: 300 };
    // the Picture Viewer: a 4:3 picture plus its caption and toolbar, centred a little right of the icons
    if (id === 'viewer') { const w = clamp(W - 24, 320, 760), h = clamp(Math.round((w - 40) * 0.75) + 150, 300, H - 24); return { x: Math.max(left, Math.round((W - w) / 2) + 40), y: Math.max(8, Math.round((H - h) / 2)), w, h }; }
    // the game keeps its 16:9 canvas whole: the window takes the largest canvas that fits, plus its chrome
    if (id === 'game') {
      const s = clamp(Math.min((W - left - 42) / 960, (H - 24 - 82) / 540), 0.5, 1.35);
      const w = Math.round(960 * s + 6), h = Math.round(540 * s + 82);
      return { x: left + Math.max(0, Math.round((W - left - w) / 2)), y: Math.max(8, Math.round((H - h) / 2)), w, h };
    }
    return { x: Math.round(W / 2 - 210), y: Math.round(H / 2 - 130), w: 420, h: 0 };
  }

  const DEFS = {
    home: {
      icon: 'home', title: () => `${u('home')} - ${PF.owner.fullName}`, task: () => u('home'),
      build: buildHome, route: () => '', onOpen: homeIntro, after: (w) => { homeArm(w); homePeek(w); homeDither(w); homeLogos(w); },
      // the services menu opens on the first service whose picture is in
      initial: () => ({ ep: 0, svc: Math.max(0, PF.home.services.list.findIndex((s) => s.img.src)), faq: 0, subj: 0, msg: '' }),
    },
    about: { icon: 'computer', title: () => `${u('about')} - ${PF.owner.name}`, task: () => u('about'), build: buildAbout, route: () => '#/about' },
    work: { icon: 'folder', title: () => u('work'), build: buildWork, route: () => '#/work', initial: () => ({ view: 'thumbs', sort: 'no', dir: 1, sel: PF.projects[0].slug }), onOpen: (w) => { const f = $('.files', w.el); if (f && !isMobile()) f.focus({ preventScroll: true }); } },
    player: {
      icon: 'play',
      title: (w) => `${PF.bySlug(w.state.slug).title} - ${u('player')}`,
      task: (w) => PF.bySlug(w.state.slug).title,
      build: buildPlayer, route: (w) => '#/work/' + w.state.slug, after: afterPlayer, skinned: true,
      initial: () => ({ slug: PF.projects[0].slug, size: 1 }),
      onClose: (w) => { if (w.plRO) w.plRO.disconnect(); w.plRO = null; },
    },
    contact: { icon: 'envelope', title: () => u('contact'), build: buildContact, skinned: true, route: () => '#/contact', initial: () => ({ cat: 'email' }) },
    resume: { icon: 'resume', title: () => (hasCV() ? u('fileDownload') : u('resumeFile')), build: buildResume, dialog: true },
    recycle: { icon: 'recycle', title: () => u('recycle'), build: buildRecycle },
    credits: { icon: 'computer', title: () => u('creditsTitle'), build: buildCredits, dialog: true },
    shutdown: { icon: 'computerOff', title: () => u('shutTitle'), build: buildShutdown, dialog: true },
    game: {
      icon: 'trophy', title: () => 'Boss Rush XP', build: buildGame, after: afterGame, route: () => '#/game',
      onOpen: (w) => { if (w.game) w.game.focus(); },
      onClose: (w) => { if (w.game) w.game.destroy(); w.game = null; },
    },
    gamegate: { icon: 'warning', title: () => 'Boss Rush XP', build: buildGameGate, after: gateBoardLoad, dialog: true },
    viewer: {
      icon: 'image', title: (w) => `${shotFile(PF.home.shorts.list[w.state.i])} - ${u('viewer')}`, task: () => u('viewer'),
      build: buildViewer, initial: () => ({ i: 0 }),
      onClose: (w) => { clearInterval(w.showTimer); w.showTimer = null; },
    },
  };

  function titleHTML(w) {
    const d = w.def;
    const btns = d.dialog ? '' :
      `<button class="tb min" data-wact="min" aria-label="${esc(u('minimize'))}">${GLYPH.min}</button><button class="tb max" data-wact="max" aria-label="${esc(u('maximize'))}">${w.max ? GLYPH.restore : GLYPH.max}</button>`;
    return `<header class="title" data-drag><span class="t-ico">${I(d.icon, 16)}</span><span class="t-text" id="win-${w.id}-t">${esc(d.title(w))}</span><span class="t-btns">${btns}<button class="tb close" data-wact="close" aria-label="${esc(u('close'))}">${GLYPH.close}</button></span></header>`;
  }

  function renderWin(w, keepScroll) {
    const saved = {};
    if (keepScroll) $$('[data-keep]', w.el).forEach((n) => { saved[n.dataset.keep] = [n.scrollTop, n.scrollLeft]; });
    const resize = !w.def.dialog && !w.def.skinned ? '<div class="resize" aria-hidden="true"></div>' : '';
    w.el.innerHTML = (w.def.skinned ? '' : titleHTML(w)) + w.def.build(w) + resize;
    if (w.def.skinned) w.el.setAttribute('aria-label', w.def.title(w));
    if (keepScroll) $$('[data-keep]', w.el).forEach((n) => { const s = saved[n.dataset.keep]; if (s) { n.scrollTop = s[0]; n.scrollLeft = s[1]; } });
    if (w.def.after) w.def.after(w);
  }

  function placeWin(w, g) {
    w.el.style.left = g.x + 'px';
    w.el.style.top = g.y + 'px';
    w.el.style.width = g.w + 'px';
    if (g.h) w.el.style.height = g.h + 'px';
  }

  function openWin(id, opts = {}) {
    closeStart();
    const def = DEFS[id];
    let w = wins.get(id);
    if (w) {
      if (opts.state) { Object.assign(w.state, opts.state); renderWin(w, false); }
      if (w.min) restoreWin(w, opts.from); else focusWin(w);
      if (opts.push !== false) syncRoute(w, true);
      return w;
    }
    const el = document.createElement('section');
    el.className = 'win' + (def.skinned ? ' skinned' : '') + (def.dialog ? ' dialog' : '');
    el.dataset.id = id;
    el.setAttribute('role', 'dialog');
    el.setAttribute('tabindex', '-1');
    if (!def.skinned) el.setAttribute('aria-labelledby', `win-${id}-t`);
    w = { id, el, def, state: Object.assign(def.initial ? def.initial() : {}, opts.state || {}), min: false, max: false };
    // a dialog remembers the control that opened it, to hand the focus back when it closes
    if (def.dialog) w.opener = document.activeElement;
    wins.set(id, w);
    if (['about', 'work', 'contact', 'resume', 'game'].includes(id)) track('window', id);
    const g = geometryFor(id);
    placeWin(w, g);
    el.style.zIndex = ++zTop;
    layer.appendChild(el);
    renderWin(w, false);
    if (def.dialog) {
      const W = desktopEl.clientWidth, H = desktopEl.clientHeight;
      el.style.left = Math.round((W - el.offsetWidth) / 2) + 'px';
      el.style.top = Math.round((H - el.offsetHeight) / 2.4) + 'px';
    }
    renderTasks();
    const target = rectOf(el);
    el.style.visibility = 'hidden';
    zoom(opts.from, target, () => {
      el.style.visibility = '';
      focusWin(w, true);
      if (def.onOpen) def.onOpen(w);
    });
    if (opts.push !== false) syncRoute(w, !!opts.pushHistory);
    return w;
  }

  function focusWin(w, fromOpen) {
    if (!w || w.min) return;
    if (activeId !== w.id) w.el.style.zIndex = ++zTop;
    activeId = w.id;
    wins.forEach((x) => x.el.classList.toggle('active', x.id === w.id));
    renderTasks();
    if (fromOpen && !w.el.contains(document.activeElement)) w.el.focus({ preventScroll: true });
    syncRoute(w, false);
  }

  function topVisible() {
    let best = null;
    wins.forEach((x) => { if (!x.min && (!best || +x.el.style.zIndex > +best.el.style.zIndex)) best = x; });
    return best;
  }

  function closeWin(w) {
    if (w.def.onClose) w.def.onClose(w);
    const r = rectOf(w.el);
    w.el.remove();
    wins.delete(w.id);
    if (activeId === w.id) activeId = null;
    const next = topVisible();
    if (next) focusWin(next); else { renderTasks(); history.replaceState(null, '', location.pathname + location.search); }
    if (w.opener && w.opener.isConnected) w.opener.focus({ preventScroll: true });
    zoom(r, null);
  }

  function minimizeWin(w) {
    const from = rectOf(w.el);
    const btn = $(`[data-task="${w.id}"]`, tasksEl);
    w.min = true;
    w.el.hidden = true;
    if (activeId === w.id) activeId = null;
    zoom(from, rectOf(btn), () => {});
    const next = topVisible();
    if (next) focusWin(next); else renderTasks();
  }

  function restoreWin(w, from) {
    const btn = $(`[data-task="${w.id}"]`, tasksEl);
    w.min = false;
    w.el.hidden = false;
    const to = rectOf(w.el);
    w.el.style.visibility = 'hidden';
    zoom(from || rectOf(btn), to, () => { w.el.style.visibility = ''; focusWin(w, true); });
  }

  function toggleMax(w) {
    if (isMobile()) return;
    w.max = !w.max;
    w.el.classList.toggle('max', w.max);
    const b = $('[data-wact="max"]', w.el);
    if (b) b.innerHTML = w.max ? GLYPH.restore : GLYPH.max;
  }

  function renderTasks() {
    tasksEl.innerHTML = Array.from(wins.values()).filter((w) => !w.def.dialog).map((w) => {
      const label = w.def.task ? w.def.task(w) : w.def.title(w);
      return `<button class="task" data-task="${w.id}" aria-pressed="${w.id === activeId && !w.min}" title="${esc(w.def.title(w))}">${I(w.def.icon, 16)}<span>${esc(label)}</span></button>`;
    }).join('');
  }

  function syncRoute(w, push) {
    if (!w.def.route) return;
    const target = w.def.route(w);
    if (location.hash === target) return;
    // an empty route (Home) means the bare address, without a hash
    history[push ? 'pushState' : 'replaceState'](null, '', target || location.pathname + location.search);
  }

  /* drag + resize */
  function startDrag(w, e) {
    if (isMobile() || w.max) return;
    const r = w.el.getBoundingClientRect();
    const d = desktopEl.getBoundingClientRect();
    const ox = e.clientX - r.left, oy = e.clientY - r.top;
    const move = (ev) => {
      const x = clamp(ev.clientX - d.left - ox, -r.width + 90, d.width - 90);
      const y = clamp(ev.clientY - d.top - oy, 0, d.height - 24);
      w.el.style.left = x + 'px';
      w.el.style.top = y + 'px';
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
  function startResize(w, e) {
    if (isMobile() || w.max) return;
    e.preventDefault();
    const r = w.el.getBoundingClientRect();
    const sx = e.clientX, sy = e.clientY;
    const move = (ev) => {
      w.el.style.width = Math.max(300, r.width + ev.clientX - sx) + 'px';
      w.el.style.height = Math.max(200, r.height + ev.clientY - sy) + 'px';
    };
    const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }

  /* ------------------------------------------------------------ desktop icons */
  const DESK = [
    { id: 'home', icon: 'home', label: () => u('home') },
    { id: 'about', icon: 'computer', label: () => u('about') },
    { id: 'work', icon: 'folder', label: () => u('work') },
    { id: 'resume', icon: 'resume', label: () => u('resumeFile') },
    { id: 'contact', icon: 'envelope', label: () => u('contact') },
    { id: 'network', icon: 'globe', label: () => u('network') },
    { id: 'recycle', icon: 'recycle', label: () => u('recycle') },
  ];
  function renderDesk() {
    $('#deskIcons').innerHTML = DESK.map((d) => `<li><button class="dicon" data-desk="${d.id}">${I(d.icon, 32)}<span class="lbl">${esc(d.label())}</span></button></li>`).join('');
  }
  function openDesk(id, from) {
    if (id === 'network') openWin('contact', { from, state: { cat: 'linkedin' } });
    else openWin(id, { from, pushHistory: true });
  }

  /* ------------------------------------------------------------ start menu */
  const startBtn = $('#startBtn');
  const startMenu = $('#startMenu');
  const socialIcon = { linkedin: 'linkedin', dribbble: 'dribbble', behance: 'behance', upwork: 'upwork' };
  function renderStartBtn() { startBtn.innerHTML = `<span>${esc(u('start'))}</span>`; }
  function renderStart() {
    const o = PF.owner;
    const item = (attrs, icon, label, size = 24, sub = false) => `<button class="sm-item" role="menuitem" ${attrs}>${I(icon, size)}<span>${esc(label)}</span>${sub ? `<span class="arrow">${GLYPH.arrow}</span>` : ''}</button>`;
    startMenu.innerHTML = `
      <div class="sm-head" aria-hidden="true"><img src="${esc(o.photo)}" alt="" width="42" height="42"><span>${esc(o.fullName)}</span></div>
      <div class="sm-cols">
        <ul class="sm-list" role="none">
          <li role="none">${item('data-sm="home"', 'home', u('home'))}</li>
          <li role="none">${item('data-sm="about"', 'computer', u('about'))}</li>
          <li role="none" class="has-sub">${item('data-sub aria-haspopup="menu"', 'folder', u('work'), 24, true)}
            <ul class="sm-sub" role="menu">${PF.projects.map((p) => `<li role="none">${item(`data-sm="case" data-slug="${p.slug}"`, 'image', p.title, 16)}</li>`).join('')}
              <li class="sm-sep" role="separator"></li><li role="none">${item('data-sm="work"', 'folder', u('openFolder'), 16)}</li></ul></li>
          <li role="none">${item('data-sm="resume"', 'resume', u('resume'))}</li>
          <li role="none">${item('data-sm="contact"', 'envelope', u('contact'))}</li>
        </ul>
        <ul class="sm-list places" role="none">
          <li role="none" class="has-sub">${item('data-sub aria-haspopup="menu"', 'globe', u('network'), 24, true)}
            <ul class="sm-sub" role="menu">${o.socials.map((s) => `<li role="none"><a class="sm-item" role="menuitem" href="${esc(s.url)}" target="_blank" rel="noopener">${I(socialIcon[s.key] || 'globe', 16)}<span>${esc(s.label)}</span></a></li>`).join('')}</ul></li>
          <li role="none" class="has-sub">${item('data-sub aria-haspopup="menu"', 'translate', u('language'), 24, true)}
            <ul class="sm-sub" role="menu">
              <li role="none"><button class="sm-item" role="menuitemradio" aria-checked="${lang === 'en'}" data-sm="lang" data-lang="en"><span class="mk">${lang === 'en' ? GLYPH.bullet : ''}</span><span>English</span></button></li>
              <li role="none"><button class="sm-item" role="menuitemradio" aria-checked="${lang === 'id'}" data-sm="lang" data-lang="id"><span class="mk">${lang === 'id' ? GLYPH.bullet : ''}</span><span>Bahasa Indonesia</span></button></li>
            </ul></li>
          <li class="sm-sep" role="separator"></li>
          <li role="none">${item('data-sm="credits"', 'computer', u('aboutPortfolio'), 24)}</li>
        </ul>
      </div>
      <div class="sm-foot"><ul class="sm-list" role="none"><li role="none">${item('data-sm="shutdown"', 'computerOff', u('shutdown'))}</li></ul></div>`;
  }
  function openStart() {
    closeMenu();
    renderStart();
    startMenu.hidden = false;
    startBtn.setAttribute('aria-expanded', 'true');
    const first = $('.sm-item', startMenu);
    if (first) first.focus({ preventScroll: true });
  }
  function closeStart() {
    if (startMenu.hidden) return;
    startMenu.hidden = true;
    startBtn.setAttribute('aria-expanded', 'false');
  }
  startMenu.addEventListener('mouseover', (e) => {
    const li = e.target.closest('.sm-list > li');
    if (!li) return;
    $$('.sm-list > li.open', startMenu).forEach((x) => { if (x !== li) x.classList.remove('open'); });
    if (li.classList.contains('has-sub')) li.classList.add('open');
  });
  startMenu.addEventListener('keydown', (e) => {
    const items = $$('.sm-item', startMenu).filter((b) => b.offsetParent !== null);
    const i = items.indexOf(document.activeElement);
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const n = items[(i + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length];
      if (n) n.focus();
    } else if (e.key === 'ArrowRight') {
      const li = document.activeElement.closest('li.has-sub');
      if (li) { li.classList.add('open'); const f = $('.sm-sub .sm-item', li); if (f) f.focus(); }
    } else if (e.key === 'ArrowLeft') {
      const li = document.activeElement.closest('.sm-sub');
      if (li) { const p = li.parentElement; p.classList.remove('open'); $('.sm-item', p).focus(); }
    } else if (e.key === 'Escape') { closeStart(); startBtn.focus(); }
  });

  /* ------------------------------------------------------------ dropdown menus */
  let menuState = null;
  function openMenu(anchor, items) {
    closeMenu();
    const m = document.createElement('div');
    m.className = 'menu';
    m.setAttribute('role', 'menu');
    m.innerHTML = items.map((it, i) => (it === '-' ? '<div class="hr" role="separator"></div>' : `<button role="menuitem" data-i="${i}"><span class="mk">${it.checked ? GLYPH.bullet : ''}</span><span>${esc(it.label)}</span></button>`)).join('');
    document.body.appendChild(m);
    const r = anchor.getBoundingClientRect();
    m.style.left = clamp(r.left, 2, innerWidth - m.offsetWidth - 2) + 'px';
    m.style.top = r.bottom + 'px';
    anchor.setAttribute('aria-expanded', 'true');
    m.addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (!b) return; const it = items[+b.dataset.i]; closeMenu(); it.run(); });
    m.addEventListener('keydown', (e) => {
      const bs = $$('button', m); const i = bs.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); bs[(i + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length].focus(); }
      if (e.key === 'Escape') { closeMenu(); anchor.focus(); }
    });
    menuState = { m, anchor };
    const f = $('button', m); if (f) f.focus({ preventScroll: true });
  }
  function closeMenu() {
    if (!menuState) return;
    menuState.m.remove();
    menuState.anchor.setAttribute('aria-expanded', 'false');
    menuState = null;
  }
  function menuItems(w, key) {
    if (w.id === 'game') {
      const gm = w.game;
      if (key === 'game') return [
        { label: u('gameNew'), run: () => gm && gm.newGame() },
        { label: u('gamePause'), checked: !!(gm && gm.isPaused()), run: () => gm && gm.togglePause() }, '-',
        { label: u('gameSound'), checked: !!(gm && !gm.isMuted()), run: () => gm && gm.toggleSound() }, '-',
        { label: u('gameAch'), run: () => gm && gm.achievements() }, { label: u('gameBoard'), run: () => gm && gm.board() }, '-',
        ...(petState() ? [{ label: u('gamePet'), checked: petWanted, run: togglePet }, '-'] : []),
        { label: u('gameExit'), run: () => closeWin(w) },
      ];
      if (key === 'help') return [{ label: u('gameHow'), run: () => gm && gm.help() }, '-', { label: u('aboutPortfolio'), run: () => openWin('credits') }];
    }
    if (key === 'help') return [{ label: u('about'), run: () => openWin('about', { pushHistory: true }) }, { label: u('aboutPortfolio'), run: () => openWin('credits') }, { label: u('contact'), run: () => openWin('contact') }];
    if (w.id === 'work') {
      const st = w.state;
      if (key === 'file') return [{ label: u('open'), run: () => st.sel && openCase(st.sel, null) }, '-', { label: u('close'), run: () => closeWin(w) }];
      if (key === 'view') return [
        { label: u('thumbnails'), checked: st.view === 'thumbs', run: () => { st.view = 'thumbs'; renderWin(w); } },
        { label: u('details'), checked: st.view === 'details', run: () => { st.view = 'details'; renderWin(w); } }, '-',
        { label: u('arrangeNo'), checked: st.sort === 'no', run: () => { st.sort = 'no'; st.dir = 1; renderWin(w); } },
        { label: u('arrangeName'), checked: st.sort === 'name', run: () => { st.sort = 'name'; st.dir = 1; renderWin(w); } },
      ];
    }
    return [];
  }
  const menuBtn = (key, label) => `<button data-menu="${key}" aria-haspopup="menu" aria-expanded="false"><u>${esc(label[0])}</u>${esc(label.slice(1))}</button>`;

  /* ------------------------------------------------------------ HOME */
  // A client-first landing page. Its structure follows bymonolog.com's homepage (positioning, proof, a
  // personal letter, teams, the promise, selected work, client words, services, process, FAQ, the ask);
  // its telling stays in this desktop: Tahoma headlines on a white page carry the pitch, Luna bands mark the
  // turns, and each proof section is an XP program. Image slots are grey placeholders until real ones exist.
  const HOME_KEY = 'pf-a-home';
  const homeAtStartup = () => { try { return localStorage.getItem(HOME_KEY) !== '0'; } catch (e) { return true; } };
  const homeOffers = () => PF.owner.offers.map((x) => t(x)).concat(u('subjectOther'));
  // Caption buttons are drawn faded: these are pictures of windows inside a page, not windows you can close.
  const CAP_HELP = '<svg width="11" height="11" viewBox="0 0 11 11" aria-hidden="true"><path d="M3.3 3.9a2.2 2.2 0 1 1 3.2 1.9c-.7.4-1 .8-1 1.5" fill="none" stroke="#fff" stroke-width="1.8"/><rect x="4.6" y="8.3" width="1.9" height="1.9"/></svg>';
  const capBtns = (kind) => {
    const gs = kind === 'help' ? [CAP_HELP, GLYPH.close] : kind === 'close' ? [GLYPH.close] : [GLYPH.min, GLYPH.max, GLYPH.close];
    return `<span class="mw-btns" aria-hidden="true">${gs.map((g, i) => `<span class="mb${i === gs.length - 1 ? ' x' : ''}">${g}</span>`).join('')}</span>`;
  };
  const miniTitle = (icon, text, id, off, caps) => `<div class="mw-title${off ? ' off' : ''}"><span class="t-ico">${I(icon, 16)}</span><span class="t-text"${id ? ` id="${id}"` : ''}>${esc(text)}</span>${capBtns(caps)}</div>`;

  // Prime Time: Home told as a 2004 Media Center TV-guide ad. The owner's photo plays on a TV, a torn
  // newsprint listing lays out the project's week, the work runs as tonight's features in Media Center,
  // and a remote flips through the episodes of a project.

  // an image slot: the real picture once the owner adds it, a grey placeholder naming the file until then
  function slotHTML(img, cls, ext = 'jpg', label) {
    if (img.src) return `<img class="${cls}" src="${esc(img.src)}" alt="${esc(img.alt ? t(img.alt) : '')}" loading="lazy" decoding="async">`;
    return `<span class="ph slot ${cls}" role="img" aria-label="${esc(label || (img.alt ? t(img.alt) : ''))}"><span class="ph-tag">${I('image', 16)}<span>${esc(img.file)}.${ext}</span></span></span>`;
  }

  // the hero's CRT: the photo fills the tube with object-fit: cover; pointing at a detection box printed on the
  // photo draws a dashed box over it and the lower third names it
  const TV_FOCUS = [0.5, 0.42];
  function tvFit(img) {
    const r = img.getBoundingClientRect(), { width: W, height: H } = PF.home.hero.photo;
    const k = Math.max(r.width / W, r.height / H);
    return { r, k, ox: (r.width - W * k) * TV_FOCUS[0], oy: (r.height - H * k) * TV_FOCUS[1] };
  }
  function tvPoint(img, e) {
    const f = tvFit(img);
    const x = (e.clientX - f.r.left - f.ox) / f.k, y = (e.clientY - f.r.top - f.oy) / f.k;
    tvSelect(img.closest('.pt-crt'), PF.home.hero.photo.marks.find(({ box: [l, t0, rt, b] }) => x >= l && x <= rt && y >= t0 && y <= b));
  }
  function tvSelect(tv, m) {
    const sel = tv && $('.pt-sel', tv), img = tv && $('.pt-photo', tv), line = tv && $('.tv-title', tv);
    if (!sel || !img) return;
    sel.hidden = !m;
    if (line) line.textContent = m ? `${u('detected')}: ${t(m.label)}` : PF.owner.fullName;
    if (!m) return;
    const f = tvFit(img), [l, t0, rt, b] = m.box;
    Object.assign(sel.style, { left: `${f.ox + l * f.k}px`, top: `${f.oy + t0 * f.k}px`, width: `${(rt - l) * f.k}px`, height: `${(b - t0) * f.k}px` });
  }
  // how far the owner's day has run in WIB, for the lower third's progress bar
  function dayShare() {
    try {
      const [h, m] = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: PF.home.timeZone }).split(':').map(Number);
      return ((h * 60 + m) / 1440) * 100;
    } catch (e) { return 50; }
  }
  // the monitor is the case pages' CRT (its chin and stand from the player below, its case in style.css), made big;
  // its tube shows the photo under the Media Center lower third
  function heroCrtHTML() {
    const P = PF.home.hero.photo, sizes = '(min-width: 1100px) 760px, 86vw';
    const srcset = (f) => P.widths.map((w) => `${esc(P.base)}${w}.${f} ${w}w`).join(', ');
    return `<figure class="pt-crt cs-crt">
      <div class="crt-case">
        <div class="crt-bezel">
          <div class="crt-glass">
            <picture>${['avif', 'webp'].map((f) => `<source type="image/${f}" srcset="${srcset(f)}" sizes="${sizes}">`).join('')}<img class="pt-photo" src="${esc(P.base)}${P.widths[0]}.jpg" srcset="${srcset('jpg')}" sizes="${sizes}" width="${P.width}" height="${P.height}" alt="${esc(t(P.alt))}" fetchpriority="high" decoding="async" style="object-position:${TV_FOCUS[0] * 100}% ${TV_FOCUS[1] * 100}%"></picture>
            <span class="pt-sel" aria-hidden="true" hidden></span>
            <div class="tv-lower">
              <b class="tv-now">${esc(u('nowShowing'))}</b>
              <span class="tv-title">${esc(PF.owner.fullName)}</span>
              <i class="tv-bar" aria-hidden="true"><i class="hm-day" style="width:${dayShare().toFixed(1)}%"></i></i>
            </div>
          </div>
        </div>
        ${CRT_CHIN}
      </div>
      ${crtStand()}
    </figure>`;
  }
  // the close's print: the owner's portrait in AVIF, WebP and a JPEG fallback. From 760px the print runs as tall as
  // the message beside it, so the photo is cropped round the face (home.css sets where)
  function closePhotoHTML() {
    const P = PF.home.cta.photo, sizes = '(min-width: 1100px) 480px, (min-width: 760px) 40vw, 336px';
    const srcset = (f) => P.widths.map((w) => `${esc(P.base)}${w}.${f} ${w}w`).join(', ');
    return `<picture class="cl-pic">${['avif', 'webp'].map((f) => `<source type="image/${f}" srcset="${srcset(f)}" sizes="${sizes}">`).join('')}<img class="cl-photo" src="${esc(P.base)}${P.widths[0]}.jpg" srcset="${srcset('jpg')}" sizes="${sizes}" width="${P.width}" height="${P.height}" alt="${esc(t(P.alt))}" loading="lazy" decoding="async"></picture>`;
  }

  // Tonight's features: the owner's five case studies as programme rows, each cover beside its programme
  // info (code and number, title, logline, tags). A row opens its case study in the player: the title is the
  // link, and its hit area spreads over the whole row. The UI shots below run on a control-room multiviewer and
  // open in the Picture Viewer.
  function featureHTML(f, i, n) {
    const W = PF.home.work, no = (k) => String(k).padStart(2, '0');
    const p = PF.projects.find((x) => x.title === f.title);
    const title = p ? `<a class="ft-link" href="#/work/${esc(p.slug)}" data-act="home-case" data-slug="${esc(p.slug)}">${esc(f.title)}</a>` : esc(f.title);
    const pic = f.img.src
      ? `<img src="${esc(f.img.src)}" alt="" loading="lazy" decoding="async"${W.dither ? ' data-dither' : ''}${f.img.pos ? ` style="object-position:${f.img.pos}"` : ''}>`
      : slotHTML(f.img, 'ft-ph');
    const ui = f.ui.src
      ? `<img class="ft-ui-pic" src="${esc(f.ui.src)}" srcset="${esc(f.ui.src)} 920w, ${esc(f.ui.big)} 1380w" sizes="460px" alt="" loading="lazy" decoding="async">`
      : slotHTML(f.ui, 'ft-ui-pic', 'png');
    return `<li class="ft-show">
      <div class="ft-cover" aria-hidden="true">${pic}<span class="ft-ui">${ui}</span></div>
      <div class="ft-prog">
        <p class="ft-code" aria-hidden="true"><span>${esc(W.code)}</span><span class="ft-no">${no(i + 1)} / ${no(n)}</span></p>
        <h3 class="ft-title">${title}</h3>
        <p class="ft-sub">${esc(t(f.sub))}</p>
        <ul class="ft-tags">${f.tags.map((x) => `<li>${esc(t(x))}</li>`).join('')}</ul>
      </div>
    </li>`;
  }
  // the covers carry the Figma cover's Dither effect: an ordered 16×16 Bayer pattern at eight levels a
  // channel, in colour. It is worked at the screen's own pixels on a canvas laid over the picture, again
  // whenever the cover changes size; the <img> stays underneath for a picture the page may not read
  let ditherLUT = null;
  function ditherTables() {
    if (ditherLUT) return ditherLUT;
    // the Figma effect's matrix: each quadrant of the 2^n pattern repeats the one below it, offset 0, 2, 3, 1
    const at = (n, x, y) => (n === 1 ? 0 : 4 * at(n / 2, x % (n / 2), y % (n / 2)) + [[0, 2], [3, 1]][(y / (n / 2)) | 0][(x / (n / 2)) | 0]);
    const bayer = Uint8Array.from({ length: 256 }, (_, i) => at(16, i & 15, i >> 4));
    const lut = new Uint8Array(65536);
    for (let m = 0; m < 256; m++) {
      const off = ((m + 0.5) / 256 - 0.5) / 7;
      for (let v = 0; v < 256; v++) lut[(m << 8) | v] = Math.round(Math.min(1, Math.max(0, Math.round((v / 255 + off) * 7) / 7)) * 255);
    }
    return (ditherLUT = { bayer, lut });
  }
  function ditherCover(img) {
    const box = img.parentElement, r = box.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = Math.round(r.width * dpr), H = Math.round(r.height * dpr);
    if (!W || !H || !img.naturalWidth) return;
    let cv = $('.ft-dither', box);
    if (cv && cv.width === W && cv.height === H) return;
    if (!cv) { cv = document.createElement('canvas'); cv.className = 'ft-dither'; box.append(cv); }
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d', { willReadFrequently: true });
    // the picture's own object-fit: cover, at its object-position
    const [fx, fy] = getComputedStyle(img).objectPosition.split(' ').map((s) => parseFloat(s) / 100);
    const k = Math.max(W / img.naturalWidth, H / img.naturalHeight), dw = img.naturalWidth * k, dh = img.naturalHeight * k;
    g.drawImage(img, (W - dw) * fx, (H - dh) * fy, dw, dh);
    try {
      const d = g.getImageData(0, 0, W, H), p = d.data, { bayer, lut } = ditherTables();
      for (let y = 0, o = 0; y < H; y++) {
        const row = (y & 15) << 4;
        for (let x = 0; x < W; x++, o += 4) {
          const b = bayer[row | (x & 15)] << 8;
          p[o] = lut[b | p[o]]; p[o + 1] = lut[b | p[o + 1]]; p[o + 2] = lut[b | p[o + 2]];
        }
      }
      g.putImageData(d, 0, 0);
    } catch (e) { cv.remove(); } // opened from disk, the canvas may not read the picture: it stays plain
  }
  // the stage's own dither (#bcDither in index.html) draws one dot a screen pixel: its 16-dot tile is 16 screen
  // pixels on any display, and follows the window to a screen of another density
  function fitBandDither() {
    const tile = document.getElementById('bcDitherTile'), dpr = window.devicePixelRatio || 1;
    if (!tile) return;
    tile.setAttribute('width', 16 / dpr);
    tile.setAttribute('height', 16 / dpr);
    matchMedia(`(resolution: ${dpr}dppx)`).addEventListener('change', fitBandDither, { once: true });
  }
  fitBandDither();
  function homeDither(w) {
    if (w.ditherRO) w.ditherRO.disconnect();
    const imgs = $$('.ft-cover img[data-dither]', w.el);
    imgs.forEach((im) => { if (im.complete) ditherCover(im); else im.addEventListener('load', () => ditherCover(im), { once: true }); });
    if (!imgs.length || !window.ResizeObserver) return;
    let tm = 0;
    w.ditherRO = new ResizeObserver(() => { clearTimeout(tm); tm = setTimeout(() => imgs.forEach((im) => { if (im.complete) ditherCover(im); }), 150); });
    imgs.forEach((im) => w.ditherRO.observe(im.parentElement));
  }
  const shotName = (s, i) => (s.title ? t(s.title) : u('shotName', String(i + 1).padStart(2, '0')));
  const shotFile = (s) => `${s.file}.png`;
  // a multiviewer wall has no ragged last row: the cells it has no shot for show No signal, counted for
  // whichever column count (2 or 3) the wall has at the current width
  function wallHTML() {
    const L = PF.home.shorts.list, n = L.length, cols = [2, 3];
    const cells = L.map((s, i) => `<li style="--k:${i}"><button class="mv-feed" data-act="open-shot" data-i="${i}" aria-label="${esc(u('openShot', shotName(s, i)))}">
        <span class="mv-pic">${slotHTML({ file: s.file, src: s.small || s.src }, 'mv-img', 'png', shotName(s, i))}</span>
        <span class="mv-umd"><i class="mv-tally"></i><span>${esc(shotName(s, i))}</span></span>
      </button></li>`);
    const gaps = cols.map((c) => Math.ceil(n / c) * c - n);
    for (let k = 0; k < Math.max(...gaps); k++) {
      const on = cols.filter((c, j) => k < gaps[j]).map((c) => `ns-${c}`).join(' ');
      cells.push(`<li class="mv-off ${on}" style="--k:${n + k}" aria-hidden="true"><span class="mv-pic"><span>${esc(u('noSignal'))}</span></span><span class="mv-umd"><i class="mv-tally"></i></span></li>`);
    }
    return `<div class="mv-mon"><ol class="mv-wall">${cells.join('')}</ol></div>`;
  }

  // the channel grid: every logo takes the same area whatever its shape (--k scales a square's side to its
  // height), and like the multiviewer the grid never ends on a ragged row: blank cells fill the last one
  // for whichever column count (2 or 3) is in force
  function channelsHTML() {
    const L = PF.home.logos.list, n = L.length, cols = [2, 3];
    const cells = L.map((l, i) => {
      const style = `--k:${(1 / Math.sqrt(l.w / l.h)).toFixed(3)}${l.zoom ? `;--zoom:${l.zoom}` : ''}`;
      return `<li><span class="ch-no">${esc(u('channel', i + 1))}</span><span class="ch-art"><img class="ch-logo" src="${esc(l.src)}" alt="${esc(l.name)}" width="${l.w}" height="${l.h}" style="${style}" loading="lazy" decoding="async"></span></li>`;
    });
    const gaps = cols.map((c) => Math.ceil(n / c) * c - n);
    for (let k = 0; k < Math.max(...gaps); k++) cells.push(`<li class="ch-off ${cols.filter((c, j) => k < gaps[j]).map((c) => `ns-${c}`).join(' ')}" aria-hidden="true"></li>`);
    return `<ol class="ch-grid">${cells.join('')}</ol>`;
  }
  // a logo drawn in dark ink for a light ground would vanish on the band, so each one is read once it has
  // loaded: when most of what it draws is dark, it takes the .ink filters that turn it light. Swapping a
  // file for its light or dark version needs no change here
  function logoInk(img) {
    try {
      const w = 64, h = Math.max(1, Math.round((64 * img.naturalHeight) / img.naturalWidth));
      const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
      const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(img, 0, 0, w, h);
      const p = g.getImageData(0, 0, w, h).data;
      let seen = 0, dark = 0;
      for (let o = 0; o < p.length; o += 4) if (p[o + 3] > 128) { seen++; if (0.2126 * p[o] + 0.7152 * p[o + 1] + 0.0722 * p[o + 2] < 64) dark++; }
      img.classList.toggle('ink', seen > 0 && dark / seen > 0.4);
    } catch (e) { /* opened from disk, the canvas may not read the picture */ }
  }
  function homeLogos(w) {
    $$('.ch-logo', w.el).forEach((im) => { if (im.complete && im.naturalWidth) logoInk(im); else im.addEventListener('load', () => logoInk(im), { once: true }); });
  }

  // the Picture Viewer: XP's own program for a picture file, with its previous/next/slide-show toolbar
  function buildViewer(w) {
    const L = PF.home.shorts.list, i = w.state.i, s = L[i], name = shotName(s, i), on = !!w.showTimer;
    const b = (act, icon, label, extra = '') => `<button class="pv-b" data-act="${act}" ${extra} aria-label="${esc(label)}" title="${esc(label)}">${I(icon, 16)}</button>`;
    return `<div class="win-body pview">
      <figure class="pv-stage">${s.src ? `<img class="pv-img" src="${esc(s.src)}" alt="${esc(name)}">` : slotHTML({ file: s.file, src: null }, 'pv-img', 'png', name)}
        <figcaption class="pv-cap"><b>${esc(name)}</b><span>${esc(u('picOf', i + 1, L.length))}</span></figcaption></figure>
      <div class="pv-bar" role="toolbar" aria-label="${esc(u('viewer'))}">
        ${b('pv-step', 'left', u('prevPic'), 'data-d="-1"')}${b('pv-step', 'right', u('nextPic'), 'data-d="1"')}<i class="pv-sep"></i>${b('pv-show', 'play', u(on ? 'stopShow' : 'slideShow'), `aria-pressed="${on}"`)}
        ${s.url ? `<i class="pv-sep"></i><a class="pv-b" href="${esc(s.url)}" target="_blank" rel="noopener" aria-label="${esc(u('openLink'))}" title="${esc(u('openLink'))}">${I('link', 16)}</a>` : ''}
      </div>
    </div>`;
  }
  function viewerGo(w, i) {
    const n = PF.home.shorts.list.length;
    w.state.i = ((i % n) + n) % n;
    const f = document.activeElement, inBar = f && f.closest && f.closest('.pv-bar') && w.el.contains(f);
    const key = inBar ? `[data-act="${f.dataset.act}"]${f.dataset.d ? `[data-d="${f.dataset.d}"]` : ''}` : null;
    renderWin(w, false);
    renderTasks();
    if (key) { const nb = $(key, w.el); if (nb) nb.focus(); }
  }
  function viewerShow(w) {
    if (w.showTimer) { clearInterval(w.showTimer); w.showTimer = null; } else w.showTimer = setInterval(() => viewerGo(w, w.state.i + 1), 3000);
    viewerGo(w, w.state.i);
  }

  // the episode guide: each episode's still plays on a silver flat-panel TV; the remote steps through them
  function episodeScreenHTML(i) {
    const s = PF.home.process.steps[i];
    return `${slotHTML(s.img, 'pe-img')}<span class="pe-lower"><b class="tv-now">${esc(u('epLabel', i + 1))}</b><span>${esc(t(s.when))} · ${esc(t(s.genre))}</span></span>`;
  }
  function episodeCopyHTML(i) {
    const s = PF.home.process.steps[i];
    return `<h3 class="pe-title">${esc(t(s.title))}</h3>
      <p class="pe-text">${esc(t(s.text))}</p>
      <p class="pe-get">${esc(u('youGet'))}</p>
      <ul class="pe-items">${s.items.map((x) => `<li>${I(x.icon || 'check', 24)}<span>${esc(t(x))}</span></li>`).join('')}</ul>`;
  }
  // the remote: a silver 2004 media remote on its side, and every key on it works. The round keys in a dark
  // well step episodes, the rubber keys pick one
  function remoteHTML(i) {
    const steps = PF.home.process.steps;
    return `<div class="pt-remote" role="group" aria-label="${esc(u('remote'))}">
      <div class="rm-well rm-pad">
        <button class="rm-key rm-prev" data-act="home-ep-step" data-d="-1" aria-label="${esc(u('prevEp'))}">${I('left', 16, { mono: true })}</button>
        <button class="rm-key rm-go" data-act="home-ep-step" data-d="1" aria-label="${esc(u('nextEp'))}">${I('right', 16, { mono: true })}</button>
      </div>
      <div class="rm-well rm-nums">${steps.map((s, j) => `<button class="rm-num" data-act="home-ep" data-i="${j}" aria-pressed="${j === i}" aria-label="${esc(u('epKey', j + 1))}: ${esc(t(s.title))}">${j + 1}</button>`).join('')}</div>
    </div>`;
  }
  // What clients say runs past the window's edge: a mouse drags the row sideways (touch, trackpads and the
  // arrow keys scroll it themselves). Dragging stops the quotes from being selected as text
  function rvDrag(row, e) {
    if (row.scrollWidth <= row.clientWidth) return;
    e.preventDefault();
    const x0 = e.clientX, s0 = row.scrollLeft;
    const move = (ev) => { row.classList.add('drag'); row.scrollLeft = s0 - (ev.clientX - x0); };
    const up = () => { row.classList.remove('drag'); window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up); };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  }
  function homeEpisode(w, i, focusKey) {
    const n = PF.home.process.steps.length;
    w.state.ep = ((i % n) + n) % n;
    const screen = $('.pe-screen', w.el), copy = $('.pe-now', w.el); if (!screen || !copy) return;
    screen.innerHTML = episodeScreenHTML(w.state.ep);
    copy.innerHTML = episodeCopyHTML(w.state.ep);
    $$('.rm-num', w.el).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === w.state.ep)));
    $$('.pt-slot', w.el).forEach((b) => b.setAttribute('aria-current', String(+b.dataset.i === w.state.ep)));
    if (!reduceMotion) { screen.classList.remove('flick'); void screen.offsetWidth; screen.classList.add('flick'); }
    if (focusKey) { const k = $(`.rm-num[data-i="${w.state.ep}"]`, w.el); if (k) k.focus({ preventScroll: true }); }
  }

  function servicePaneHTML(i) {
    const s = PF.home.services.list[i];
    // the pointed-at service shows its picture alone, at the owner's own shape (800 and 1600px WebP copies); a
    // picture not supplied yet is a grey slot naming the owner's file. Its line stays in the data, not on the page.
    // Lazy: the menu sits far down Home, so its picture waits until the visitor gets near it
    const v = `?v=${PF.home.services.picVersion || 1}`;
    const pic = s.img.src
      ? `<img class="mm-img" src="${esc(s.img.src)}-800.webp${v}" srcset="${esc(s.img.src)}-800.webp${v} 800w, ${esc(s.img.src)}-1600.webp${v} 1600w" sizes="(min-width: 1100px) 44vw, (min-width: 760px) 42vw, 92vw" width="800" height="868" alt="" loading="lazy" decoding="async">`
      : slotHTML(s.img, 'mm-img', 'png', t(s.name));
    return `<figure class="mm-fig">${pic}</figure>`;
  }
  function homeService(w, i) {
    if (!w || w.state.svc === i) return;
    w.state.svc = i;
    $$('.mm-item', w.el).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === i)));
    const pane = $('.mm-pane', w.el); if (pane) { pane.innerHTML = servicePaneHTML(i); if (!reduceMotion) { pane.classList.remove('swap'); void pane.offsetWidth; pane.classList.add('swap'); } }
  }

  function faqHTML(st) {
    return PF.home.faq.list.map((f, i) => {
      const open = i === st.faq;
      return `<button class="faq-q" id="faq-q-${i}" data-act="home-faq" data-i="${i}" aria-expanded="${open}" aria-controls="faq-a-${i}" style="--r:${i + 1}">${I(open ? 'bookOpen' : 'book', 16)}<span>${esc(t(f.q))}</span></button>
        <div class="faq-a" id="faq-a-${i}" role="region" aria-labelledby="faq-q-${i}"${open ? '' : ' hidden'}><h3>${esc(t(f.q))}</h3><p>${esc(t(f.a))}</p>${f.about ? `<button class="btn" data-act="home-about">${I('computer', 16)}<span>${esc(u('openAbout'))}</span></button>` : ''}</div>`;
    }).join('') + `<p class="faq-empty"${st.faq < 0 ? '' : ' hidden'}>${esc(u('helpPick'))}</p>`;
  }
  function buildHome(w) {
    const o = PF.owner, H = PF.home, st = w.state;
    return `<div class="win-body sunk" data-keep="home"><article class="home">

      <header class="pt-hero" id="hm-top" aria-labelledby="hm-title">
        <div class="pt-copy">
          <h1 class="pt-h1" id="hm-title">${esc(t(H.hero.title))}</h1>
          <p class="pt-intro">${esc(t(H.hero.sub))}</p>
          <div class="pt-acts">
            <button class="btn lg rec" data-act="home-start"><i class="rec-dot" aria-hidden="true"></i><span>${esc(u('startProject'))}</span></button>
            <button class="pt-link" data-act="home-go" data-to="hm-work">${I('play', 16)}<span>${esc(u('watchWork'))}</span></button>
          </div>
        </div>
        ${heroCrtHTML()}
      </header>

      <section class="pt-listing" aria-labelledby="pt-list-h">
        <div class="pl-paper">
          <h2 class="pl-h" id="pt-list-h">${esc(t(H.hero.listing))}</h2>
          <ol class="pl-slots">${H.process.steps.map((s, i) => `<li><button class="pt-slot" data-act="home-ep" data-i="${i}" data-go="1" aria-current="${i === st.ep}"><span class="sl-when">${esc(t(s.when))}</span><span class="sl-main"><b>${esc(t(s.slot))}</b><span>${esc(t(s.line))}</span></span><span class="sl-genre" aria-hidden="true">${esc(t(s.genre))}</span></button></li>`).join('')}</ol>
        </div>
        <span class="pl-fringe" aria-hidden="true"></span>
      </section>

      <section class="pt-letter" aria-labelledby="pt-letter-h">
        <div class="lt-head">
          <h2 class="pt-h2" id="pt-letter-h">${esc(t(H.promise.head).join(' '))}</h2>
          <p class="lt-stand">${esc(t(H.promise.text))}</p>
        </div>
        <div class="lt-body">
          ${H.letter.map((p) => `<p>${esc(t(p))}</p>`).join('')}
          <p class="lt-sign"><span class="lt-ava"><img src="${esc(o.photo)}" alt="${esc(u('photoAlt'))}" width="564" height="564" loading="lazy"></span><span><b>${esc(o.fullName)}</b><small>${esc(t(o.role))}, ${esc(t(o.location))}</small></span></p>
        </div>
      </section>

      <section class="pt-features" id="hm-work" aria-labelledby="hm-work-h">
        <div class="ft-row">
          <h2 class="ft-mark" id="hm-work-h">${esc(t(H.work.head))}</h2>
          <ol class="ft-shows">${H.work.list.map((f, i, L) => featureHTML(f, i, L.length)).join('')}</ol>
        </div>
        <div class="ft-row ft-air" role="group" aria-labelledby="hm-shorts-h">
          <h3 class="ft-mark" id="hm-shorts-h">${esc(t(H.shorts.head))}</h3>
          ${wallHTML()}
        </div>
      </section>

      <section class="pt-channels" aria-labelledby="pt-ch-h">
        <div class="ft-row">
          <h2 class="ft-mark" id="pt-ch-h">${esc(t(H.logos.head))}</h2>
          ${channelsHTML()}
        </div>
      </section>

      <section class="pt-reviews" aria-labelledby="hm-words-h">
        <h2 class="rv-head" id="hm-words-h">${esc(t(H.words.head))}</h2>
        <ul class="rv-row" role="list" tabindex="0" aria-labelledby="hm-words-h">${H.words.list.map((r) => `<li class="rv"><figure lang="en"><blockquote>${r.quote.map((p) => `<p>${esc(p)}</p>`).join('')}</blockquote><figcaption>${r.name ? `<b>${esc(r.name)}</b>` : ''}<span>${esc(r.role)}</span></figcaption></figure></li>`).join('')}</ul>
      </section>
      <hr class="pt-divider">

      <section class="pt-episodes" id="hm-eps" aria-labelledby="hm-proc-h">
        <h2 class="pt-h2" id="hm-proc-h">${esc(t(H.process.head))}</h2>
        <div class="pe-main">
          <div class="pe-set">
            <figure class="pe-tv"><div class="tv-bezel"><div class="pe-screen" aria-live="polite">${episodeScreenHTML(st.ep)}</div><span class="tv-led" aria-hidden="true"></span></div></figure>
            ${remoteHTML(st.ep)}
          </div>
          <div class="pe-copy"><div class="pe-now" aria-live="polite">${episodeCopyHTML(st.ep)}</div>${H.process.steps.map((s, j) => `<div class="pe-ghost" aria-hidden="true">${episodeCopyHTML(j)}</div>`).join('')}</div>
        </div>
      </section>

      <section class="pt-services" aria-labelledby="hm-svc-h">
        <h2 class="ft-mark" id="hm-svc-h">${esc(t(H.services.head))}</h2>
        <div class="mm-body">
          <ul class="mm-list">${H.services.list.map((x, i) => `<li><button class="mm-item" data-act="home-svc" data-i="${i}" aria-pressed="${i === st.svc}" aria-controls="mm-pane"><span class="mm-no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="mm-t">${esc(t(x.name))}</span>${I('right', 16, { mono: true })}</button></li>`).join('')}</ul>
          <div class="mm-pane" id="mm-pane" aria-live="polite">${servicePaneHTML(st.svc)}</div>
        </div>
      </section>

      <section class="pt-faq" aria-labelledby="hm-faq-h">
        <div class="sec-copy"><h2 class="pt-h2" id="hm-faq-h">${esc(t(H.faq.head))}</h2></div>
        <section class="mw hm-help" aria-labelledby="hm-help-t">
          ${miniTitle('questionCircle', u('helpTitle'), 'hm-help-t', false, 'help')}
          <div class="help-tabs" aria-hidden="true"><span class="tab on">${esc(u('helpTab'))}</span></div>
          <div class="help-main">${faqHTML(st)}</div>
        </section>
      </section>

      <section class="hm-cta hm-close" id="hm-cta" aria-labelledby="hm-cta-h">
        <div class="cl-grid">
          <h2 class="cta-h" id="hm-cta-h">${t(H.cta.head).map((l) => `<span>${esc(l)}</span>`).join(' ')}</h2>
          <figure class="cl-print">
            ${closePhotoHTML()}
            <figcaption><b>${esc(o.fullName)}</b><span>${esc(t(o.role))} · ${esc(t(o.location))}, GMT+7</span></figcaption>
          </figure>
          <div class="cl-ask">
            <p class="cl-lead">${esc(t(H.cta.lead))}</p>
            <form class="mw hm-mail" data-form="home-mail" aria-labelledby="hm-mail-t">
              ${miniTitle('envelope', u('newMessage'), 'hm-mail-t')}
              <div class="mail-head">
                <label for="hm-from">${esc(u('fromLabel'))}</label><input id="hm-from" class="field" type="email" name="from" autocomplete="email" required maxlength="200" placeholder="${esc(u('fromPlaceholder'))}" value="${esc(st.from || '')}">
                <label for="hm-subj">${esc(u('subject'))}</label><select id="hm-subj" class="field" data-change="home-subj">${homeOffers().map((x, i) => `<option value="${i}"${i === st.subj ? ' selected' : ''}>${esc(u('subjectPrefix'))}: ${esc(x)}</option>`).join('')}</select>
              </div>
              <label class="sr-only" for="hm-msg">${esc(u('message'))}</label>
              <textarea id="hm-msg" class="field mail-body" rows="7" required maxlength="5000" placeholder="${esc(u('msgPlaceholder'))}">${esc(st.msg)}</textarea>
              <span class="mail-trap" aria-hidden="true"><input name="website" tabindex="-1" autocomplete="off"></span>
              <div class="mail-send"><button type="submit" class="btn lg default">${I('envelope', 16)}<span>${esc(u('sendMeMsg'))}</span></button><small id="hm-send-note">${esc(u('sendHint'))}</small></div>
              <span class="sr-only" aria-live="polite" id="hm-copy-note"></span>
            </form>
          </div>
          <ul class="cl-links">
            ${o.socials.map((x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener" aria-label="${esc(u('openProfile', x.label))}">${I(socialIcon[x.key] || 'globe', 24)}<span>${esc(x.label)}</span></a></li>`).join('')}
          </ul>
        </div>
        <div class="cl-fine">
          <label class="chk ft-start"><input type="checkbox" data-change="home-startup"${homeAtStartup() ? ' checked' : ''}><span>${esc(u('showAtStart'))}</span></label>
          <button type="button" class="cl-top" data-act="home-go" data-to="hm-top">${I('top', 24)}<span>${esc(u('watchAgain'))}</span></button>
        </div>
      </section>

    </article></div>
    <div class="statusbar"><span>${I('home', 16)}${esc(u('home'))}</span><span><span class="long">${esc(t(o.statusLong))}</span><span class="short">${esc(t(o.status))}</span></span></div>`;
  }
  // the CRT powers on once, the first time Home opens: the lamp lights, a bright line opens into the picture, then
  // the lower third rises. Home may open behind the splash, so it waits until the splash has gone
  function homeIntro(w) {
    if (reduceMotion || homeIntro.done) return;
    homeIntro.done = true;
    (PF.bootDone || ((fn) => fn()))(() => {
      const crt = $('.pt-crt', w.el);
      if (crt) { crt.classList.add('power'); setTimeout(() => crt.classList.remove('power'), 1600); }
    });
  }
  // the moments that play when their section first scrolls into view, once per visit. Home is re-rendered
  // (language, resize), so the watchers are re-armed after every render; what has played stays played
  const homeFx = { wall: false, squeeze: false };
  // On a touch screen a programme row's UI card comes up while its cover crosses the middle fifth of the window,
  // the touch stand-in for pointing at it (home.css, .peek); under reduced motion it just appears
  function homePeek(w) {
    if (!window.IntersectionObserver || !matchMedia('(hover: none)').matches) return;
    const io = new IntersectionObserver((es) => es.forEach((x) => x.target.closest('.ft-show').classList.toggle('peek', x.isIntersecting)),
      { root: $('.win-body', w.el), rootMargin: '-40% 0px -40% 0px' });
    $$('.ft-show .ft-cover', w.el).forEach((c) => { if ($('.ft-ui', c)) io.observe(c); });
    w.fxIO.push(io);
  }
  function homeArm(w) {
    if (w.fxIO) w.fxIO.forEach((io) => io.disconnect());
    w.fxIO = [];
    if (reduceMotion || !window.IntersectionObserver) return;
    // measured against the window's own scroller: only what shows inside the window counts as in view
    const root = $('.win-body', w.el);
    const once = (key, el, threshold, run) => {
      if (homeFx[key] || !el) return;
      const io = new IntersectionObserver((es) => {
        if (!es.some((x) => x.isIntersecting && x.intersectionRatio >= threshold)) return;
        io.disconnect(); homeFx[key] = true; run(el);
      }, { root, threshold });
      io.observe(el); w.fxIO.push(io);
    };
    // the multiviewer locks onto its feeds
    once('wall', $('.mv-wall', w.el), 0.3, (wall) => wall.classList.add('lock'));
  }
  function homeFaq(w, i) {
    w.state.faq = w.state.faq === i ? -1 : i;
    const main = $('.help-main', w.el); if (!main) return;
    main.innerHTML = faqHTML(w.state);
    const q = $(`#faq-q-${i}`, main); if (q) q.focus({ preventScroll: true });
  }
  function homeTick() {
    const w = wins.get('home'); if (!w) return;
    $$('.hm-day', w.el).forEach((n) => { n.style.width = `${dayShare().toFixed(1)}%`; });
  }
  // What became of the message, as XP's notification balloon over the Send button: sent (it goes by itself), or
  // handed to the visitor's email app, which a page can't see open, so that one stays with the Copy button until
  // closed. Screen readers hear it as a status
  function mailBalloon(f, sent, from) {
    const old = $('.mail-bal', f); if (old) old.remove();
    clearTimeout(f.balTimer);
    const b = document.createElement('div');
    b.className = 'mail-bal'; b.setAttribute('role', 'status');
    b.innerHTML = `<b>${I(sent ? 'check' : 'envelope', 16)}<span>${esc(u(sent ? 'sentTitle' : 'mailAppTitle'))}</span></b><p>${esc(sent ? u('sentNote', from) : u('mailAppNote'))}</p>`
      + (sent ? '' : `<button type="button" class="btn mail-copy" data-act="home-copy">${I('copy', 16)}<span>${esc(u('copyAddr'))}</span></button>`)
      + `<button type="button" class="pet-x" data-act="mail-bal-x" aria-label="${esc(u('close'))}"></button>`;
    $('.mail-send', f).appendChild(b);
    if (sent) f.balTimer = setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 300); }, 8000);
  }

  // The message goes straight to the owner's inbox through /api/message (worker/index.js). Where that can't
  // send (not set up, offline, a local preview) the visitor's email app opens with the same message
  async function homeSend(w) {
    const f = $('.hm-mail', w.el), note = $('#hm-send-note', w.el), btn = $('button[type="submit"]', f);
    if (!f || (btn && btn.disabled)) return;
    const offers = homeOffers();
    const subject = `${u('subjectPrefix')}: ${offers[w.state.subj] || offers[0]}`;
    const from = $('#hm-from', f).value.trim(), message = $('#hm-msg', f).value.trim();
    const say = (text) => { if (note) note.textContent = text; };
    btn.disabled = true; say(u('sending'));
    let res = null;
    try {
      res = await fetch('/api/message', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ from, subject, message, lang, website: f.elements.website.value }),
      });
    } catch (e) { res = null; }
    btn.disabled = false;
    say(u('sendHint'));
    if (res && res.ok) {
      $('#hm-msg', f).value = ''; w.state.msg = '';
      mailBalloon(f, true, from); track('send', 'api');
      return;
    }
    mailBalloon(f, false); track('send', 'mailto');
    location.href = `mailto:${PF.owner.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  }

  /* ------------------------------------------------------------ ABOUT */
  // A document in five parts: the letter, the work log, side projects, off the clock, and an order form.
  function floppySVG(label, vol) {
    return `<svg class="floppy-art" viewBox="0 0 120 124" aria-hidden="true" focusable="false">
      <path d="M5 2h101l12 12v104a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" fill="#1b2744"/>
      <path d="M5 2h101l12 12v104a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z" fill="none" stroke="#0b1226" stroke-width="2"/>
      <rect x="28" y="2" width="62" height="40" fill="#c7cad1"/><rect x="28" y="2" width="62" height="3" fill="#e9ebef"/>
      <rect x="70" y="9" width="12" height="27" fill="#1b2744"/>
      <rect x="13" y="54" width="94" height="62" rx="2" fill="#f7f4ea"/>
      <rect x="13" y="54" width="94" height="9" fill="#d8471f"/>
      <g fill="#b9b6ab"><rect x="19" y="84" width="82" height="1"/><rect x="19" y="97" width="82" height="1"/><rect x="19" y="110" width="82" height="1"/></g>
      <text class="fl-t1" x="19" y="82.6">${esc(label)}</text>
      <text class="fl-t2" x="19" y="95.6">${esc(vol)}</text>
      <rect x="6" y="112" width="6" height="6" fill="#0b1226"/>
    </svg>`;
  }
  function buildAbout() {
    const o = PF.owner;
    const log = o.worklog.map((j) => `
      <li class="${j.to ? '' : 'now'}"><span class="wl-date">${esc(j.from)} – ${j.to ? esc(j.to) : `<b>${esc(u('present'))}</b>`}</span>
        <div class="wl-main"><h3>${esc(j.role)}</h3><p>${esc(j.org)}${j.type ? ` · ${esc(u(j.type))}` : ''}</p>${j.place ? `<p class="wl-place">${esc(j.place)}</p>` : ''}</div></li>`).join('');
    const projects = o.sideProjects.map((p, i) => `
      <li><span class="pj-no">${String(i + 1).padStart(2, '0')}</span>
        <div><h3>${p.url && p.url !== '#' ? `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.name)}</a>` : esc(p.name)}</h3><p class="pj-meta">${p.year} · ${esc(t(p.kind))}</p><p>${esc(t(p.desc))}</p></div></li>`).join('');
    // each photo is a My Pictures thumbnail: its name tag rests on the lower right and opens into an infotip
    const hobbies = o.hobbies.map((h, i) => `<li class="hb"><button type="button" class="hb-pic" data-act="hobby" aria-expanded="false" aria-controls="hb-tip-${i}"><img class="hb-img" src="${esc(h.photo)}-360.webp" srcset="${[360, 480, 720].map((x) => `${esc(h.photo)}-${x}.webp ${x}w`).join(', ')}" sizes="auto, (max-width: 720px) calc(50vw - 60px), 140px" width="360" height="640" alt="" loading="lazy" decoding="async"><span class="hb-tag">${esc(t(h.label))}</span></button>
      <div class="hb-tip" id="hb-tip-${i}"><h3>${esc(t(h.label))}</h3><p>${esc(t(h.note))}</p></div></li>`).join('');
    const offers = o.offers.map((x) => `<label class="chk"><input type="checkbox" name="need" value="${esc(t(x))}"><span>${esc(t(x))}</span></label>`).join('');
    const links = o.socials.map((x) => `<li><a href="${esc(x.url)}" target="_blank" rel="noopener">${I(socialIcon[x.key] || 'globe', 24)}<span><b>${esc(x.label)}</b><small>${esc(t(x.handle))}</small></span></a></li>`).join('');
    // the profile card reads like the top of a CV: who, the three facts a recruiter checks first, the intro, then the CV itself
    const facts = [[u('factExp'), u('sinceYear', o.since)], [u('factLang'), o.languages.map((x) => t(x)).join(', ')], [u('factWhere'), t(o.base)]]
      .map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
    return `<div class="win-body sunk" data-keep="about"><article class="doc">
      <header class="sp-hero">
        <div class="sp-id">
          <figure class="ad-photo"><img src="${esc(o.photo)}" alt="${esc(u('photoAlt'))}" width="564" height="564"></figure>
          <div class="sp-name">
            <h2>${esc(o.fullName)}</h2>
            <p class="ad-role">${esc(t(o.role))}</p>
            <p class="sp-status">${esc(t(o.status))}</p>
          </div>
        </div>
        <dl class="sp-facts">${facts}</dl>
        <p class="ad-lede">${esc(t(o.intro))}</p>
        <div class="ad-actions">
          <button class="btn lg default" data-act="resume">${I('resume', 16)}<span>${esc(u(hasCV() ? 'downloadCV' : 'cvAskBtn'))}</span></button>
          <button class="btn lg" data-act="open-work">${I('folder', 16)}<span>${esc(u('openPortfolio'))}</span></button>
          <button class="btn lg" data-act="to-build">${I('envelope', 16)}<span>${esc(u('sendMsg'))}</span></button>
        </div>
      </header>

      <section class="panel sp-sec"><h2>${esc(u('worklog'))}</h2><div class="pb">
        <p class="lead">${esc(u('worklogLead'))}</p>
        <ol class="wlog">${log}</ol>
      </div></section>

      <div class="sp-row">
        <section class="panel"><h2>${esc(u('projects'))}</h2><div class="pb pj-pb">
          <div class="floppy" aria-hidden="true">${floppySVG(u('diskLabel'), `Vol. ${o.sideProjects.length}`)}</div>
          <div class="pj-list"><p class="lead">${esc(u('projectsLead'))}</p><ol class="pj">${projects}</ol></div>
        </div></section>
        <section class="panel"><h2>${esc(u('offClock'))}</h2><div class="pb oc">
          <p class="lead">${esc(u('offClockText'))}</p>
          <div class="cpl">
            <div class="cpl-t">${I('image', 16)}<span>${esc(u('myPictures'))}</span></div>
            <ul class="cpl-grid">${hobbies}</ul>
          </div>
        </div></section>
      </div>

      <section class="order build" id="about-build" aria-labelledby="bd-h">
        <div class="bd-main">
          <h2 id="bd-h">${esc(u('build'))}</h2>
          <p class="bd-lead">${esc(u('buildLead'))}</p>
          <fieldset class="bd-need"><legend>${esc(u('need'))}</legend><div class="bd-grid">${offers}</div></fieldset>
          <div class="bd-send"><button class="btn lg default" type="button" data-act="send-brief">${I('envelope', 16)}<span>${esc(u('sendMsg'))}</span></button></div>
        </div>
        <aside class="bd-side" aria-labelledby="bd-side-h">
          <h3 id="bd-side-h">${esc(u('reachDirect'))}</h3>
          <ul class="bd-links">
            <li><a href="mailto:${esc(o.email)}">${I('envelope', 24)}<span><b>${esc(u('emailLabel'))}</b><small>${esc(o.email)}</small></span></a></li>
            ${links}
          </ul>
        </aside>
      </section>
      <p class="ad-foot">${esc(u('footer'))}</p>
    </article></div>
    <div class="statusbar"><span>${I('computer', 16)}${esc(u('about'))}</span><span><span class="long">${esc(t(o.statusLong))}</span><span class="short">${esc(t(o.status))}</span></span></div>`;
  }

  /* ------------------------------------------------------------ EXPLORER */
  const tagsText = (p) => p.tags.map((x) => t(x)).join(', ');
  const caseNo = (p) => String(p.no).padStart(2, '0');
  // a case's cover, drawn from the 640 or the 1280 copy by its size on screen; a grey slot naming the file until it exists
  function coverImg(p, sizes, alt = '') {
    const c = p.cover;
    if (!c.src) return slotHTML(c, 'cover-ph', 'jpg', alt);
    const set = c.small ? ` srcset="${esc(c.small)} 640w, ${esc(c.src)} 1280w" sizes="${sizes}"` : '';
    return `<img class="cv" src="${esc(c.src)}"${set} width="1280" height="840" alt="${esc(alt)}" loading="lazy" decoding="async">`;
  }
  function sortedProjects(st) {
    const list = PF.projects.slice();
    const key = st.sort, dir = st.dir || 1;
    const val = (p) => (key === 'name' ? p.title.toLowerCase() : key === 'tags' ? tagsText(p).toLowerCase() : p.no);
    list.sort((a, b) => { const A = val(a), B = val(b); return (A > B ? 1 : A < B ? -1 : 0) * dir || a.no - b.no; });
    return list;
  }
  // XP's task pane beside the folder: what to do with the selected case, the other places, and its details
  const paneLink = (act, icon, label, slug) => `<li><button type="button" data-act="${act}"${slug ? ` data-slug="${slug}"` : ''}>${I(icon, 16)}<span>${esc(label)}</span></button></li>`;
  const paneDetails = (p) => `<span class="tp-pic">${coverImg(p, '192px')}</span><p class="tp-name">${esc(p.title)}</p><p class="tp-type">${esc(u('typeCase'))}</p><p>${esc(t(p.sub))}</p><p class="tp-kw">${esc(u('colTags'))}: ${esc(tagsText(p))}</p>`;
  function paneHTML(p) {
    return `<section class="panel tp-tasks"><h2>${esc(u('caseTasks'))}</h2><ul class="pb tp-links">${paneLink('open-case', 'play', u('openCase'), p.slug)}${paneLink('ask-case', 'questionCircle', u('askAbout', p.title), p.slug)}</ul></section>
      <section class="panel"><h2>${esc(u('otherPlaces'))}</h2><ul class="pb tp-links">${paneLink('open-about', 'computer', u('about'))}${paneLink('resume', 'resume', u('resumeFile'))}${paneLink('contact', 'envelope', u('contact'))}</ul></section>
      <section class="panel tp-details"><h2>${esc(u('details'))}</h2><div class="pb" aria-live="polite">${paneDetails(p)}</div></section>`;
  }
  function buildWork(w) {
    const st = w.state;
    const list = sortedProjects(st);
    const sel = PF.bySlug(st.sel) || list[0];
    st.sel = sel.slug;
    const files = st.view === 'thumbs'
      ? `<div class="thumbs">${list.map((p) => `<button class="thumb" role="option" id="opt-${p.slug}" data-slug="${p.slug}" aria-selected="${p === sel}" tabindex="-1"><span class="frame">${coverImg(p, '(max-width: 720px) 92vw, 280px')}</span><span class="name">${esc(p.title)}</span><span class="kw">${esc(tagsText(p))}</span></button>`).join('')}</div>`
      : (() => {
        const col = (key, label, cls) => `<th scope="col"${cls ? ` class="${cls}"` : ''}><button data-sort="${key}"><span>${esc(label)}</span>${st.sort === key ? (st.dir < 0 ? GLYPH.sortDown : GLYPH.sortUp) : ''}</button></th>`;
        return `<table class="details"><thead><tr>${col('no', u('colNo'), 'num')}${col('name', u('colName'))}${col('tags', u('colTags'))}</tr></thead><tbody>
          ${list.map((p) => `<tr id="opt-${p.slug}" data-slug="${p.slug}" aria-selected="${p === sel}"><td class="num">${caseNo(p)}</td><td class="nm">${I('image', 16)}<span>${esc(p.title)}</span></td><td>${esc(tagsText(p))}</td></tr>`).join('')}</tbody></table>`;
      })();
    return `
      <div class="menubar" role="menubar">${menuBtn('file', u('file'))}${menuBtn('view', u('view'))}${menuBtn('help', u('help'))}</div>
      <div class="toolbar">
        <button class="tbtn" disabled>${I('up', 24)}<span>${esc(u('up'))}</span></button>
        <span class="tsep"></span>
        <button class="tbtn" data-view="thumbs" aria-pressed="${st.view === 'thumbs'}">${I('grid', 24)}<span>${esc(u('thumbnails'))}</span></button>
        <button class="tbtn" data-view="details" aria-pressed="${st.view === 'details'}">${I('list', 24)}<span>${esc(u('details'))}</span></button>
      </div>
      <div class="addr"><span>${esc(u('address'))}</span><div class="field">${I('folder', 16)}<span>C:\\${esc(u('myDocs'))}\\${esc(u('work'))}</span></div></div>
      <div class="xp-main">
        <aside class="xp-pane">${paneHTML(sel)}</aside>
        <div class="files" tabindex="0" data-keep="files" ${st.view === 'thumbs' ? `role="listbox" aria-label="${esc(u('work'))}" aria-activedescendant="opt-${sel.slug}"` : ''}>${files}</div>
      </div>
      <div class="statusbar"><span>${esc(u('objects', list.length))}</span><span>${esc(u('caseStudies'))}</span><span>${I('computer', 16)}${esc(u('myComputer'))}</span></div>`;
  }
  function selectFile(w, slug) {
    if (w.state.sel === slug) return;
    const p = PF.bySlug(slug);
    if (!p) return;
    w.state.sel = slug;
    $$('[data-slug][aria-selected]', w.el).forEach((n) => n.setAttribute('aria-selected', String(n.dataset.slug === slug)));
    // the task links keep their place (and any keyboard focus); only their case and the details change
    $$('.tp-tasks [data-slug]', w.el).forEach((b) => { b.dataset.slug = slug; });
    const ask = $('.tp-tasks [data-act="ask-case"] span', w.el); if (ask) ask.textContent = u('askAbout', p.title);
    const d = $('.tp-details .pb', w.el); if (d) d.innerHTML = paneDetails(p);
    const f = $('.files[role="listbox"]', w.el); if (f) f.setAttribute('aria-activedescendant', 'opt-' + slug);
    const n = $(`#opt-${slug}`, w.el); if (n) n.scrollIntoView({ block: 'nearest' });
  }
  function filesKey(w, e) {
    const list = sortedProjects(w.state).map((p) => p.slug);
    let i = list.indexOf(w.state.sel);
    let cols = 1;
    if (w.state.view === 'thumbs') { const g = $('.thumbs', w.el); if (g) cols = getComputedStyle(g).gridTemplateColumns.split(' ').length; }
    const k = e.key;
    if (k === 'Enter' && w.state.sel) { e.preventDefault(); openCase(w.state.sel, rectOf($(`#opt-${w.state.sel}`, w.el)), true); return; }
    let d = 0;
    if (k === 'ArrowRight') d = 1; else if (k === 'ArrowLeft') d = -1; else if (k === 'ArrowDown') d = cols; else if (k === 'ArrowUp') d = -cols; else if (k === 'Home') { d = -99; } else if (k === 'End') { d = 99; } else return;
    e.preventDefault();
    i = i < 0 ? 0 : clamp(i + d, 0, list.length - 1);
    selectFile(w, list[i]);
  }

  /* ------------------------------------------------------------ CASE STUDY PLAYER */
  // A case plays its page from shared/cases.js after its overview (the hero), one chapter per section of the owner's
  // Figma page. A case without a page plays the overview and keeps the write-up's place as a chapter not published yet.
  const casePage = (p) => (PF.cases && PF.cases[p.slug]) || null;
  // a screen on the page: the owner's screenshot once it has a src, until then a grey slot naming its file and size
  function picBody(c, x) {
    if (x.src) return `<img class="cs-img" src="${esc(x.src)}" width="${x.w}" height="${x.h}" alt="${esc(t(x.alt))}" loading="lazy" decoding="async">`;
    return `<span class="cs-ph cs-img" style="aspect-ratio: ${x.w} / ${x.h}" role="img" aria-label="${esc(u('picSoon', t(x.alt)))}"><span class="cs-ph-tag"><b>${esc(c.dir.split('/').pop())}/${esc(x.file)}</b><small>${x.w} × ${x.h}</small></span></span>`;
  }
  // a CRT with no screen yet shows its own On-Screen Display, the way a monitor says it has no input, naming the file
  const crtBody = (c, x) => (x.src ? picBody(c, x)
    : `<span class="crt-osd" role="img" aria-label="${esc(u('picSoon', t(x.alt)))}"><span class="osd-box"><b>${esc(u('noSignal'))}</b><span>${esc(c.dir.split('/').pop())}/${esc(x.file)}</span><small>${x.w} × ${x.h}</small></span></span>`);
  const CRT_CHIN = '<span class="crt-chin" aria-hidden="true"><span class="crt-grille"></span><span class="crt-badge"></span><span class="crt-keys"><i></i><i></i><i></i><i></i></span><span class="crt-lamp"></span><span class="crt-power"></span></span>';
  // the stand is one drawing in the case's plastic and light, so it reads as one moulding: the neck widens down from
  // under the case, shaded where the case overhangs it, and stands in a swivel ring on the base, whose front edge shows
  let standSeq = 0;
  function crtStand() {
    const k = 'crt' + ++standSeq, neck = 'M116 0h88l16 34H100z';
    return `<svg class="crt-stand" viewBox="0 0 320 56" aria-hidden="true" focusable="false"><defs>
      <linearGradient id="${k}n"><stop offset="0" stop-color="#d8d2bd"/><stop offset=".2" stop-color="#fff"/><stop offset=".55" stop-color="#ece9d8"/><stop offset=".85" stop-color="#d8d2bd"/><stop offset="1" stop-color="#aca899"/></linearGradient>
      <linearGradient id="${k}o" x2="0" y2="1"><stop offset="0" stop-color="#141414" stop-opacity=".4"/><stop offset=".45" stop-color="#141414" stop-opacity="0"/></linearGradient>
      <linearGradient id="${k}t" x1=".2" x2=".8" y2="1"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#ece9d8"/></linearGradient>
      <linearGradient id="${k}s" x2="0" y2="1"><stop offset="0" stop-color="#d8d2bd"/><stop offset="1" stop-color="#aca899"/></linearGradient></defs>
      <path d="M20 34a140 12 0 0 0 280 0v8a140 12 0 0 1-280 0z" fill="url(#${k}s)"/><ellipse cx="160" cy="34" rx="140" ry="12" fill="url(#${k}t)"/>
      <path d="${neck}" fill="url(#${k}n)"/><path d="${neck}" fill="url(#${k}o)"/>
      <ellipse cx="160" cy="36" rx="67" ry="6.5" fill="#d8d2bd"/><ellipse cx="160" cy="34" rx="66" ry="6" fill="url(#${k}t)"/></svg>`;
  }
  const isPhone = (x) => x.h > x.w * 1.6;
  // a block's pictures: one screen, with a dialog that may open over it, or a row of screens side by side
  function figHTML(c, b) {
    if (b.pics) return `<div class="cs-row${b.pics.every(isPhone) ? ' phones' : ''}">${b.pics.map((x) => `<figure class="cs-pic">${casePic(c, x)}</figure>`).join('')}</div>`;
    const cls = ['cs-pic', 'pic-' + b.pic.frame, isPhone(b.pic) ? 'phone' : '', b.pop ? 'has-pop' : '', b.apart ? 'apart' : ''].filter(Boolean).join(' ');
    return `<figure class="${cls}">${casePic(c, b.pic)}${b.pop ? `<span class="cs-pop">${casePic(c, b.pop)}</span>` : ''}</figure>`;
  }
  // every screen sits in something from the XP years: a big one on a CRT monitor, the rest in an XP window of the app
  // (Home's mini window: a tool window or a dialog carries only its close button)
  function casePic(c, x) {
    if (x.frame === 'crt') return `<span class="cs-crt"><span class="crt-case"><span class="crt-bezel"><span class="crt-glass">${crtBody(c, x)}</span></span>${CRT_CHIN}</span>${crtStand()}</span>`;
    // a window is never wider than its screen at 1x (its frame is 6px), so a small card is not blown up; a phone
    // screen stays at 280px so a whole one fits on the screen
    const w = isPhone(x) ? Math.min(x.w, 280) : x.w;
    return `<span class="cs-win" style="max-width: ${w + 6}px"><span class="mw-title" aria-hidden="true"><span class="t-text">${esc(t(x.title))}</span>${capBtns(x.frame === 'win' ? '' : 'close')}</span><span class="cs-win-body">${picBody(c, x)}</span></span>`;
  }
  // the overview is the page's hero: the case's name, logline and tags over its big screen on a CRT; a case without a
  // page shows its cover behind the words instead
  function heroHTML(p, c) {
    const text = `<div class="cs-hero-text"><h2>${esc(p.title)}</h2><p>${esc(t(p.sub))}</p><ul class="cs-chips">${p.tags.map((g) => `<li>${esc(t(g))}</li>`).join('')}</ul></div>`;
    if (c && c.hero) return `<div class="cs-hero has-crt">${text}<figure class="cs-hero-crt">${casePic(c, c.hero)}</figure></div>`;
    return `<div class="cs-hero on-cover"><span class="cs-hero-pic">${coverImg(p, '(max-width: 720px) 100vw, 1100px', u('coverAlt', p.title))}</span>${text}</div>`;
  }
  const tagHTML = (ch) => `<p class="cs-tag">${esc(t(ch.label))}</p>`;
  const paras = (list) => [].concat(list).map((x) => `<p>${esc(t(x))}</p>`).join('');
  // the page's blocks; style.css sets each on the page's grid where the owner's Figma puts it
  const BLOCKS = {
    intro: (b, ch) => `<div class="cs-intro${b.under ? ' under' : ''}">${tagHTML(ch)}<h3 class="cs-title">${esc(t(b.title))}</h3>${b.text ? `<div class="cs-lede">${paras(b.text)}</div>` : ''}</div>`,
    quote: (b, ch) => `<div class="cs-quote">${tagHTML(ch)}<blockquote><p>${esc(t(b.text))}</p></blockquote></div>`,
    pic: (b, ch, c) => figHTML(c, b),
    row: (b, ch, c) => figHTML(c, b),
    trio: (b, ch, c) => `<div class="cs-trio">${b.pics.map((x, i) => `<figure class="cs-pic t${i + 1}">${casePic(c, x)}</figure>`).join('')}</div>`,
    feature: (b, ch, c) => `<div class="cs-feat"><p class="cs-flabel">${esc(t(b.label))}</p><h3 class="cs-ftitle">${esc(t(b.title))}</h3><p class="cs-body">${esc(t(b.text))}</p>${figHTML(c, b)}</div>`,
  };
  // a chapter's running time on the LCD: its words, and a few seconds for each picture
  const blockWords = (b) => [b.title, b.text].flat().filter(Boolean).reduce((a, x) => a + words(t(x)), 0) + 12 * ((b.pic ? 1 : 0) + (b.pop ? 1 : 0) + (b.pics ? b.pics.length : 0));
  function sectionsFor(p) {
    const c = casePage(p);
    const over = { id: 'overview', tone: 'hero', label: u('overview'), ready: true, words: words(t(p.sub)) + 30, html: heroHTML(p, c) };
    if (!c) {
      over.html += `<div class="pl-pending"><p>${esc(u('writeup'))}</p><button type="button" class="pl-ask" data-act="ask-case" data-slug="${p.slug}">${esc(u('askAbout', p.title))}</button></div>`;
      return [over, { id: 'writeup', label: u('fullCase'), ready: false, words: 0, html: '' }];
    }
    const secs = c.chapters.map((ch) => ({
      id: ch.id, tone: ch.tone, label: t(ch.label), ready: true,
      words: ch.blocks.reduce((a, b) => a + blockWords(b), 0),
      html: ch.blocks.map((b) => BLOCKS[b.type](b, ch, c)).join(''),
    }));
    return [over, ...secs];
  }
  // The player is a skin drawn after Windows Media Player 7: a caption plate, the chapter list and the screen in a
  // tray, and a deck with the chapter timeline, the transport keys, an LCD and a text-size wedge.
  function buildPlayer(w) {
    const p = PF.bySlug(w.state.slug);
    const all = sectionsFor(p), secs = all.filter((s) => s.ready);
    const no = (i) => String(i + 1).padStart(2, '0');
    w.all = all;
    w.secs = secs;
    w.total = secs.reduce((a, s) => a + s.words * 0.3, 0);
    const cap = (wact, glyph, label) => `<button type="button" class="pl-cb" data-wact="${wact}" aria-label="${esc(label)}" title="${esc(label)}">${glyph}</button>`;
    const key = (act, icon, label, cls = '') => `<button type="button" class="pl-key${cls}" data-act="${act}" aria-label="${esc(label)}" title="${esc(label)}">${icon}</button>`;
    const tool = (act, icon, label, print) => `<span class="pl-tool"><button type="button" class="orb" data-act="${act}" aria-label="${esc(label)}" title="${esc(label)}">${I(icon, 16)}</button><small aria-hidden="true">${esc(print)}</small></span>`;
    return `
      <div class="skin">
        <header class="pl-cap" data-drag>
          <span class="pl-badge" aria-hidden="true">${I('play', 16)}</span>
          <span class="pl-cap-t">${esc(u('player'))}</span>
          <span class="pl-caps"><button type="button" class="pl-cb" data-act="open-about" aria-label="${esc(u('about'))}" title="${esc(u('about'))}">?</button>${cap('min', GLYPH.min, u('minimize'))}${cap('max', w.max ? GLYPH.restore : GLYPH.max, u('maximize'))}${cap('close', GLYPH.close, u('close'))}</span>
        </header>
        <div class="skin-body">
          <aside class="pl-side">
            <label class="pl-select"><span class="sr-only">${esc(u('switchCase'))}</span>
              <select data-change="switch-case">${PF.projects.map((q, i) => `<option value="${q.slug}" ${q === p ? 'selected' : ''}>${no(i)} · ${esc(q.title)}</option>`).join('')}</select><span class="dd" aria-hidden="true">${GLYPH.down}</span></label>
            <p class="pl-print" aria-hidden="true">${esc(u('chapters'))}</p>
            <nav class="skin-nav" aria-label="${esc(u('chapters'))}">${all.map((s, i) => (s.ready
              ? `<button data-sec="${s.id}" aria-current="${s === secs[0]}"><span class="no">${no(i)}</span><span class="nm">${esc(s.label)}</span><small>${fmtTime(s.words * 0.3)}</small></button>`
              : `<span class="off"><span class="no">${no(i)}</span><span class="nm">${esc(s.label)}</span><small>${esc(u('notYet'))}</small></span>`)).join('')}</nav>
            <div class="pl-tools">${tool('copy-link', 'link', u('copyLink'), u('lblLink'))}${tool('resume', 'resume', u('downloadCV'), u('resume'))}${tool('contact', 'envelope', u('contactMe'), u('contact'))}</div>
          </aside>
          <div class="screen">
            <div class="screen-view" tabindex="0" data-keep="screen" data-case="${p.slug}" role="region" aria-label="${esc(p.title)}" style="${plStyle(w.state.size)}">${secs.map((s) => `<section class="cs-ch${s.tone ? ' ' + s.tone : ''}" data-sec="${s.id}" aria-label="${esc(s.label)}">${s.html}</section>`).join('')}</div>
          </div>
        </div>
        <div class="pl-deck">
          <div class="pl-tl"><div class="tl-track" aria-hidden="true"></div><input class="range seek" type="range" min="0" max="1000" value="0" aria-label="${esc(u('readPos'))}"></div>
          <div class="pl-keys">
            <span class="pl-kgrp">${key('next-sec', I('play', 24), u('nextSection'), ' big')}<small aria-hidden="true">${esc(u('play'))}</small></span>
            <span class="pl-kgrp"><span class="pl-well">${key('stop', I('folderOpen', 16), u('stop'))}</span><small aria-hidden="true">${esc(u('work'))}</small></span>
            <span class="pl-kgrp"><span class="pl-well">${key('prev-case', I('prev', 16), u('prevCase'))}${key('next-case', I('next', 16), u('nextCase'))}</span><small aria-hidden="true">${esc(u('lblCase'))}</small></span>
          </div>
          <div class="lcd">
            <span class="lcd-clock" aria-hidden="true">${segClock()}</span>
            <span class="lcd-text"><b class="lcd-title">${esc(p.title)}</b><span class="lcd-now" aria-live="polite"><span class="sr-only">${esc(u('nowReading'))}: </span><span class="lcd-sec">${esc(secs[0].label)}</span></span></span>
          </div>
          <label class="pl-vol"><span class="pl-vrow"><b aria-hidden="true">A</b><span class="pl-wedge"><input class="range tsize" type="range" min="0" max="2" step="1" value="${w.state.size}" aria-label="${esc(u('textSize'))}" aria-valuetext="${esc(u('sizes')[w.state.size])}"><i aria-hidden="true"></i><i aria-hidden="true"></i><i aria-hidden="true"></i></span><b class="lg" aria-hidden="true">A</b></span><small aria-hidden="true">${esc(u('textSize'))}</small></label>
          <span class="skin-logo" aria-hidden="true">iqbal·player</span>
        </div>
      </div>`;
  }
  // the LCD clock: each digit is seven drawn segments (a to g) on a 12 by 22 cell, the lit ones full LCD green
  const SEG_ON = { 0: 'abcdef', 1: 'bc', 2: 'abdeg', 3: 'abcdg', 4: 'bcfg', 5: 'acdfg', 6: 'acdefg', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  const SEG_PTS = (() => {
    const W = 12, H = 22, s = 2.4, g = 0.6, h = s / 2;
    const hz = (y) => `${h + g},${y + h} ${s + g},${y} ${W - s - g},${y} ${W - h - g},${y + h} ${W - s - g},${y + s} ${s + g},${y + s}`;
    const vt = (x, y0, y1) => `${x + h},${y0} ${x + s},${y0 + h} ${x + s},${y1 - h} ${x + h},${y1} ${x},${y1 - h} ${x},${y0 + h}`;
    return { a: hz(0), g: hz(H / 2 - h), d: hz(H - s), f: vt(0, h + g, H / 2 - g), b: vt(W - s, h + g, H / 2 - g), e: vt(0, H / 2 + g, H - h - g), c: vt(W - s, H / 2 + g, H - h - g) };
  })();
  const segDigit = () => `<svg class="seg" viewBox="-3 -1 16 24"><g transform="skewX(-6)">${'abcdefg'.split('').map((k) => `<polygon data-s="${k}" points="${SEG_PTS[k]}"/>`).join('')}</g></svg>`;
  const segClock = () => `${segDigit()}${segDigit()}<svg class="seg-colon" viewBox="-1 -1 5 24"><rect x="1.6" y="6" width="2.4" height="2.4"/><rect x="0.6" y="14" width="2.4" height="2.4"/></svg>${segDigit()}${segDigit()}`;
  function segSet(el, text) {
    const d = text.replace(':', '').slice(-4).split('');
    $$('svg.seg', el).forEach((svg, i) => { const on = SEG_ON[d[i]] || ''; $$('polygon', svg).forEach((q) => q.classList.toggle('on', on.includes(q.dataset.s))); });
  }
  // The deck reads the case's real layout. On the timeline a published chapter takes its share of the screen's height
  // and an unpublished one a fixed hatched slot; knots pin each chapter's marker to the scroll that shows its top.
  const TL_OFF = 0.05;
  const pct = (x) => `${(x * 100).toFixed(3)}%`;
  const tlTrack = (k, p) => { for (let i = 0; i < k.length - 1; i++) { const a = k[i], b = k[i + 1]; if (p <= b.p) return b.p > a.p ? a.t + ((p - a.p) / (b.p - a.p)) * (b.t - a.t) : a.t; } return 1; };
  const tlProg = (k, x) => { for (let i = 0; i < k.length - 1; i++) { const a = k[i], b = k[i + 1]; if (x <= b.t) return b.t > a.t ? a.p + ((x - a.t) / (b.t - a.t)) * (b.p - a.p) : a.p; } return 1; };
  function plMeasure(w) {
    const v = $('.screen-view', w.el), track = $('.tl-track', w.el);
    if (!v || !track || !w.all) return;
    const max = Math.max(1, v.scrollHeight - v.clientHeight);
    const vTop = v.getBoundingClientRect().top - v.scrollTop;
    const topOf = (el) => el.getBoundingClientRect().top - vTop;
    const secs = w.all.map((s) => ({ s, el: s.ready ? $(`section[data-sec="${s.id}"]`, v) : null }));
    const hSum = secs.reduce((a, x) => a + (x.el ? x.el.offsetHeight : 0), 0) || 1;
    const share = 1 - secs.filter((x) => !x.el).length * TL_OFF;
    let at = 0;
    const segs = secs.map((x) => { const len = x.el ? (x.el.offsetHeight / hSum) * share : TL_OFF; const g = { ...x, start: at, end: at + len }; at += len; return g; });
    const pAt = (i) => { for (let j = i; j < segs.length; j++) if (segs[j].el) return clamp(topOf(segs[j].el) / max, 0, 1); return 1; };
    w.knots = segs.map((g, i) => ({ t: g.start, p: pAt(i) })).concat({ t: 1, p: 1 });
    track.innerHTML = segs.map((g) => `<span class="tl-seg${g.el ? '' : ' off'}" style="left:${pct(g.start)};width:calc(${pct(g.end - g.start)} - 2px)"></span>`).join('')
      + '<span class="tl-fill"></span>' + segs.slice(1).map((g) => `<span class="tl-mark${g.el ? '' : ' off'}" style="left:${pct(g.start)}"></span>`).join('');
  }
  function afterPlayer(w) {
    plMeasure(w);
    updatePlayer(w);
    if (w.plRO) w.plRO.disconnect();
    const v = $('.screen-view', w.el);
    if (!v || !window.ResizeObserver) return;
    // text size, window size and late pictures all move the chapters, so the deck measures again
    let raf = 0;
    w.plRO = new ResizeObserver(() => { cancelAnimationFrame(raf); raf = requestAnimationFrame(() => { plMeasure(w); updatePlayer(w); }); });
    w.plRO.observe(v);
    $$('section[data-sec]', v).forEach((s) => w.plRO.observe(s));
  }
  function updatePlayer(w) {
    const v = $('.screen-view', w.el);
    if (!v) return;
    const max = Math.max(1, v.scrollHeight - v.clientHeight);
    const prog = clamp(v.scrollTop / max, 0, 1);
    const secs = $$('section[data-sec]', v);
    let cur = secs[0];
    const probe = v.scrollTop + v.clientHeight * 0.3;
    secs.forEach((s) => { if (s.offsetTop <= probe) cur = s; });
    if (prog > 0.995) cur = secs[secs.length - 1];
    const id = cur ? cur.dataset.sec : 'overview';
    $$('.skin-nav button', w.el).forEach((b) => b.setAttribute('aria-current', String(b.dataset.sec === id)));
    const meta = w.secs.find((s) => s.id === id);
    const lab = $('.lcd-sec', w.el); if (lab && meta && lab.textContent !== meta.label) lab.textContent = meta.label;
    const clock = $('.lcd-clock', w.el); if (clock) segSet(clock, fmtTime(prog * w.total));
    const at = w.knots ? tlTrack(w.knots, prog) : prog;
    const fill = $('.tl-fill', w.el); if (fill) fill.style.width = pct(at);
    const seek = $('.seek', w.el); if (seek && document.activeElement !== seek) seek.value = Math.round(at * 1000);
    if (w.curSec !== id) { const b = $(`.skin-nav button[data-sec="${id}"]`, w.el); if (b && b.parentNode.scrollWidth > b.parentNode.clientWidth) b.scrollIntoView({ block: 'nearest', inline: 'nearest' }); }
    w.curSec = id;
  }
  function scrollToSec(w, id) {
    const v = $('.screen-view', w.el);
    const s = v && $(`section[data-sec="${id}"]`, v);
    if (s) v.scrollTo({ top: s.offsetTop, behavior: reduceMotion ? 'auto' : 'smooth' });
  }
  function nextSection(w) {
    const ids = w.secs.map((s) => s.id);
    const i = ids.indexOf(w.curSec || 'overview');
    if (i >= ids.length - 1) stepCase(w, 1); else scrollToSec(w, ids[i + 1]);
  }
  // the reader's three text sizes (S, M, L), each a set of steps on the type scale: body, lede and quote
  const PL_VARS = ['--pl-size', '--pl-lede', '--pl-quote'];
  const PL_SIZES = [[14, 16, 20], [16, 18, 24], [18, 20, 28]];
  const plStyle = (s) => PL_VARS.map((k, j) => `${k}:${PL_SIZES[s][j]}px`).join(';');
  function setTextSize(w, s) {
    w.state.size = s;
    const v = $('.screen-view', w.el);
    if (v) PL_VARS.forEach((k, j) => v.style.setProperty(k, `${PL_SIZES[s][j]}px`));
    const r = $('.tsize', w.el); if (r) { r.value = s; r.setAttribute('aria-valuetext', u('sizes')[s]); }
  }
  function switchCase(w, slug) {
    track('case', slug);
    w.state.slug = slug;
    renderWin(w, false);
    renderTasks();
    syncRoute(w, true);
  }
  function stepCase(w, d) {
    const i = PF.projects.findIndex((p) => p.slug === w.state.slug);
    switchCase(w, PF.projects[(i + d + PF.projects.length) % PF.projects.length].slug);
  }
  function openCase(slug, from, push) {
    const w = wins.get('player');
    if (w) { if (w.state.slug !== slug) switchCase(w, slug); if (w.min) restoreWin(w, from); else focusWin(w); return; }
    track('case', slug);
    openWin('player', { from, state: { slug }, pushHistory: push !== false });
  }

  /* ------------------------------------------------------------ CONTACT (Y2K skin) */
  const CATS = [
    { key: 'email', icon: 'envelope', label: 'Email' },
    { key: 'linkedin', icon: 'linkedin', label: 'LinkedIn' },
    { key: 'dribbble', icon: 'dribbble', label: 'Dribbble' },
    { key: 'behance', icon: 'behance', label: 'Behance' },
    { key: 'upwork', icon: 'upwork', label: 'Upwork' },
    { key: 'cv', icon: 'resume', label: 'CV' },
  ];
  function buildContact(w) {
    const o = PF.owner;
    const cat = CATS.find((c) => c.key === w.state.cat) || CATS[0];
    // one action row: the icon in its socket, the label over its detail, and a key on the right that says what the row does
    const row = (tag, attrs, icon, label, detail, go) => `<li><${tag} class="nero-act" ${attrs}><span class="nero-sock">${I(icon, 32)}</span><span class="nero-txt">${esc(label)}<small>${esc(detail)}</small></span><span class="nero-go" aria-hidden="true">${go}</span></${tag}></li>`;
    // the key: an arrow runs the action here, a window opens a new tab, and the copy key swaps its arrow for a check once copied
    const goArrow = GLYPH.arrow, goNew = GLYPH.max;
    const newTab = `<span class="sr-only"> (${esc(u('newTab'))})</span>`;
    let acts = '';
    if (cat.key === 'email') {
      acts = row('a', `href="mailto:${esc(o.email)}"`, 'envelope', u('sendEmail'), o.email, goArrow)
        + row('button', 'data-act="copy-email"', 'copy', u('copyEmail'), u('copyHint'), goArrow + I('check', 16))
        + `<li class="nero-note"><span class="nero-sock">${I('clock', 32)}</span><span class="nero-txt"><span class="nero-lamp">${esc(u('availability'))}</span><small>${esc(t(o.statusLong))}</small></span></li>`;
    } else if (cat.key === 'cv') {
      acts = row('button', 'data-act="resume"', 'resume', u(hasCV() ? 'cvDownload' : 'cvByMail'), u(hasCV() ? 'cvHint' : 'cvByMailHint'), goArrow);
    } else {
      const s = o.socials.find((x) => x.key === cat.key);
      acts = row('a', `href="${esc(s.url)}" target="_blank" rel="noopener"`, cat.icon, u('openProfile', s.label), s.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, ''), goNew).replace('</small></span>', `</small>${newTab}</span>`);
    }
    return `<div class="nero">
      <div class="nero-top" data-drag>
        <span class="nero-logo" aria-hidden="true">${esc(o.first.toLowerCase())}</span>
        <label class="nero-pick">${I(cat.icon, 16)}<span class="sr-only">${esc(u('contact'))}</span>
          <select data-change="contact-cat">${CATS.map((c) => `<option value="${c.key}" ${c.key === cat.key ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}</select><span class="dd" aria-hidden="true">${GLYPH.arrow}</span></label>
        <span class="nero-ctrl"><button class="q" data-act="open-about" aria-label="${esc(u('about'))}" title="${esc(u('about'))}">?</button><button data-wact="min" aria-label="${esc(u('minimize'))}" title="${esc(u('minimize'))}">${GLYPH.min}</button><button class="x" data-wact="close" aria-label="${esc(u('close'))}" title="${esc(u('close'))}">${GLYPH.close}</button></span>
      </div>
      <div class="nero-body">
        <div class="nero-cats" role="tablist" aria-label="${esc(u('contact'))}">${CATS.map((c) => `<button class="nero-cat" role="tab" id="nero-tab-${c.key}" aria-selected="${c.key === cat.key}" aria-controls="nero-panel" tabindex="${c.key === cat.key ? 0 : -1}" data-cat="${c.key}">${I(c.icon, 40)}<span>${esc(c.label)}</span></button>`).join('')}</div>
        <ul class="nero-actions" id="nero-panel" role="tabpanel" aria-labelledby="nero-tab-${cat.key}">${acts}</ul>
      </div>
      <div class="nero-bottom">
        <span class="nero-readout"><small aria-hidden="true">${esc(u('toLabel'))}</small><span class="url">${esc(o.email)}</span></span>
        <span class="nero-round">
          <span class="nero-key"><button data-act="copy-email" aria-label="${esc(u('copyEmail'))}" title="${esc(u('copyEmail'))}">${I('copy', 24)}</button><small aria-hidden="true">${esc(u('copyAddr'))}</small></span>
          <span class="nero-key"><a class="hot" href="mailto:${esc(o.email)}" aria-label="${esc(u('sendEmail'))}" title="${esc(u('sendEmail'))}">${I('envelope', 24)}</a><small aria-hidden="true">${esc(u('send'))}</small></span>
        </span>
      </div>
    </div>`;
  }

  /* ------------------------------------------------------------ DIALOGS */
  // the CV is one PDF per language (owner.cv.en / owner.cv.id), so the file follows the language switch
  const cvHref = () => t(PF.owner.cv);
  const hasCV = () => !!cvHref() && !cvHref().startsWith('#');
  const cvName = () => (hasCV() ? decodeURIComponent(cvHref().split('/').pop()) : `Resume_${PF.owner.first}_${PF.owner.last}.pdf`);
  function buildResume() {
    if (!hasCV()) {
      return `<div class="win-body"><div class="dlg">
      <div class="dlg-row">${I('envelope', 32)}<div><p><b>${esc(cvName())}</b></p><p>${esc(u('cvAsk'))}</p></div></div>
      <div class="btns"><button class="btn default" data-act="cv-mail">${esc(u('cvAskBtn'))}</button><button class="btn" data-wact="close">${esc(u('cancel'))}</button></div>
    </div></div>`;
    }
    return `<div class="win-body"><div class="dlg">
      <div class="dlg-row">${I('resume', 32)}<div><p>${esc(u('dlText'))}</p><p><b>${esc(cvName())}</b> ${esc(u('from'))} ${esc(location.host || 'localhost')}</p></div></div>
      <div><p>${esc(u('dlQ'))}</p>
        <label class="radio"><input type="radio" name="dl" value="open"><span>${esc(u('dlOpen'))}</span></label>
        <label class="radio"><input type="radio" name="dl" value="save" checked><span>${esc(u('dlSave'))}</span></label></div>
      <div class="btns"><button class="btn default" data-act="dl-ok">${esc(u('ok'))}</button><button class="btn" data-wact="close">${esc(u('cancel'))}</button></div>
    </div></div>`;
  }
  function buildCredits() {
    return `<div class="win-body"><div class="dlg credits">
      <div class="dlg-row">${I('computer', 32)}<div><p><b>${esc(PF.owner.name)} - Portfolio XP</b></p><p>${esc(u('creditsVer'))}</p></div></div>
      <p class="credit-line"><a href="https://pixeliconlibrary.com" target="_blank" rel="noopener">Pixel Icon Library</a> · <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noopener">CC BY 4.0</a><br>${esc(u('creditsIcons'))}</p>
      <div class="btns"><button class="btn default" data-wact="close">${esc(u('ok'))}</button></div>
    </div></div>`;
  }
  function buildShutdown() {
    return `<div class="win-body"><div class="dlg">
      <div class="dlg-row">${I('computerOff', 32)}<div><p>${esc(u('shutQ'))}</p>
        <label class="radio"><input type="radio" name="sd" value="off" checked><span>${esc(u('shutDown'))}</span></label>
        <label class="radio"><input type="radio" name="sd" value="restart"><span>${esc(u('restart'))}</span></label></div></div>
      <div class="btns"><button class="btn default" data-act="sd-ok">${esc(u('ok'))}</button><button class="btn" data-wact="close">${esc(u('cancel'))}</button></div>
    </div></div>`;
  }
  function buildRecycle() {
    const items = u('binItems'), [exe, exeFrom, exeDate] = u('binExe');
    return `<div class="win-body sunk"><table class="bin-list"><thead><tr><th><span>${esc(u('colName'))}</span></th><th><span>${esc(u('binFrom'))}</span></th><th><span>${esc(u('binDeleted'))}</span></th></tr></thead>
      <tbody><tr class="bin-exe"><td><button class="bin-run" data-act="open-game">${I('trophy', 16)}<span>${esc(exe)}</span></button></td><td>${esc(exeFrom)}</td><td>${esc(exeDate)}</td></tr>
      ${items.map(([n, f, d]) => `<tr><td>${I(n.endsWith('.png') ? 'image' : 'document', 16)}<span>${esc(n)}</span></td><td>${esc(f)}</td><td>${esc(d)}</td></tr>`).join('')}</tbody></table></div>
      <div class="statusbar"><span>${esc(u('objects', items.length + 1))}</span><span>${esc(u('binNote'))}</span></div>`;
  }

  /* ------------------------------------------------------------ Boss Rush XP (the hidden game) */
  // A stickman boss rush, opened from jangan-dibuka.exe in the Recycle Bin or with the Konami code.
  // Phones alone are turned away: a screen whose short side is under 600px (every iPhone, a folded Z Fold, a
  // Surface Duo). A small window anywhere else is the game's to handle. game.js is only fetched on first open.
  const PHONE_SIDE = 600;
  const canPlayGame = () => Math.min(screen.width, screen.height) >= PHONE_SIDE;
  let gameScript = null;
  function loadGame() {
    if (window.BossRushXP) return Promise.resolve(window.BossRushXP);
    if (!gameScript) {
      gameScript = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'game.js?v=30';
        s.onload = () => resolve(window.BossRushXP);
        s.onerror = () => { gameScript = null; s.remove(); reject(new Error('game.js did not load')); };
        document.head.appendChild(s);
      });
    }
    return gameScript;
  }
  function openGame(from, push = true) {
    if (!canPlayGame()) { openWin('gamegate', { from }); return; }
    openWin('game', { from, push, pushHistory: push });
  }
  function buildGame() {
    return `<div class="menubar" role="menubar">${menuBtn('game', u('gameMenu'))}${menuBtn('help', u('help'))}</div>
      <div class="win-body game-body" data-game></div>
      <div class="statusbar"><span class="gm-where">Boss Rush XP</span><span>${esc(u('gameKeys'))}</span></div>`;
  }
  // the game outlives re-renders (a language switch rebuilds the window body): its stage moves into the new body
  function afterGame(w) {
    const host = $('[data-game]', w.el);
    if (w.game) { w.game.attach(host); w.game.setLang(lang); return; }
    host.innerHTML = `<p class="gm-note">${esc(u('gameLoading'))}</p>`;
    loadGame().then((G) => {
      if (wins.get('game') !== w || w.game) return;
      const h = $('[data-game]', w.el);
      h.innerHTML = '';
      w.game = G.create({
        lang, owner: PF.owner.fullName, onContact: () => openWin('contact'), onWin: petWon, onExit: () => closeWin(w),
        onStatus: (text) => { const s = $('.gm-where', w.el); if (s) s.textContent = text; },
      });
      w.game.attach(h);
    }).catch(() => { const h = $('[data-game]', w.el); if (h) h.innerHTML = `<p class="gm-note">${esc(u('gameFailed'))}</p>`; });
  }
  /* ------------------------------------------------------------ the stickman on the taskbar */
  // Winning the game installs him: 'on' from then on, 'off' once the visitor hides him (the game's menu brings
  // him back). pet.js is only fetched once he has been earned.
  const PET_KEY = 'brxp-pet';
  const petState = () => { try { return localStorage.getItem(PET_KEY); } catch (e) { return null; } };
  const setPetState = (v) => { try { localStorage.setItem(PET_KEY, v); } catch (e) { /* storage off: he stays for this visit */ } };
  let pet = null, petScript = null, petWanted = false;
  function loadPet() {
    if (window.DesktopPet) return Promise.resolve(window.DesktopPet);
    if (!petScript) {
      petScript = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'pet.js?v=3';
        s.onload = () => resolve(window.DesktopPet);
        s.onerror = () => { petScript = null; s.remove(); reject(new Error('pet.js did not load')); };
        document.head.appendChild(s);
      });
    }
    return petScript;
  }
  function showPet(fresh) {
    petWanted = true;
    if (pet) return;
    loadPet().then((P) => {
      if (pet || !petWanted) return;
      pet = P.create({ lang, fresh, onPlay: (from) => openGame(from), onHide: hidePet });
    }).catch(() => { /* no stickman this visit */ });
  }
  function hidePet() {
    petWanted = false; setPetState('off');
    if (pet) { pet.destroy(); pet = null; }
  }
  function togglePet() { if (petWanted) hidePet(); else { setPetState('on'); showPet(false); } }
  // the game calls this when it is won: the first win installs him ('new'); after that it says how he stands
  function petWon() {
    const st = petState();
    if (st === 'on' || st === 'off') return st;
    setPetState('on'); showPet(true);
    return 'new';
  }
  function buildGameGate(w) {
    return `<div class="win-body"><div class="dlg">
      <div class="dlg-row">${I('warning', 32)}<div><p><b>${esc(u('gateHead'))}</b></p><p>${esc(u('gateText'))}</p></div></div>
      ${gateBoardHTML(w.state.board)}
      <div class="btns"><button class="btn default" data-wact="close">${esc(u('ok'))}</button></div>
    </div></div>`;
  }
  // The gate also shows the top five of the game's leaderboard (worker/index.js), so a visitor who can't play
  // here, often on a phone from a shared link, still sees what there is to beat. No server, no board.
  function gateBoardHTML(b) {
    if (b === 'off') return '';
    // not asked yet (gateBoardLoad asks right after this first render) or on its way
    if (!b || b === 'load') return `<div class="gate-board load"><p><b>${esc(u('gateBoard'))}</b></p><p>${esc(u('gateLoading'))}</p></div>`;
    if (!b.total) return `<div class="gate-board"><p><b>${esc(u('gateBoard'))}</b></p><p>${esc(u('gateBoardEmpty'))}</p></div>`;
    const mmss = (t) => `${String(Math.floor(t / 60)).padStart(2, '0')}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
    const rows = b.top.map((r) => `<tr><td class="num">${r.rank}</td><td>${esc(r.name)}</td><td class="num">${mmss(r.time)}</td></tr>`).join('');
    return `<div class="gate-board"><p><b>${esc(u('gateBoard'))}</b></p>
      <table class="gm-board"><thead><tr>${u('gateCols').map((c) => `<th scope="col"><span>${esc(c)}</span></th>`).join('')}</tr></thead><tbody>${rows}</tbody></table>
      <p>${esc(u('gateBoardText', b.total))}</p></div>`;
  }
  function gateBoardLoad(w) {
    if (w.state.board !== undefined) return;
    w.state.board = 'load';
    const ctl = new AbortController(), timer = setTimeout(() => ctl.abort(), 8000);
    fetch('/api/scores?top=5', { signal: ctl.signal }).then((r) => (r.ok ? r.json() : null)).catch(() => null).then((j) => {
      clearTimeout(timer);
      if (wins.get('gamegate') !== w) return;
      w.state.board = j && Array.isArray(j.top) ? j : 'off';
      const box = $('.gate-board', w.el);
      if (box) box.outerHTML = gateBoardHTML(w.state.board);
    });
  }

  /* ------------------------------------------------------------ actions */
  const winOf = (el) => { const n = el.closest('.win'); return n ? wins.get(n.dataset.id) : null; };
  const ACTIONS = {
    'open-work': (a) => openWin('work', { from: rectOf(a), pushHistory: true }),
    'open-about': (a) => openWin('about', { from: rectOf(a), pushHistory: true }),
    'home-about': (a) => openWin('about', { from: rectOf(a), pushHistory: true }),
    'home-start': (a, w) => {
      track('start');
      const f = w && $('.hm-mail', w.el); if (!f) return;
      f.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      const m = $('#hm-msg', f); if (m) m.focus({ preventScroll: true });
    },
    'mail-bal-x': (a) => { const b = a.closest('.mail-bal'); if (b) b.remove(); },
    'home-copy': (a, w) => {
      track('copy', 'email');
      const note = w && $('#hm-copy-note', w.el), label = $('span', a);
      const done = () => {
        if (label) label.textContent = u('copiedAddr');
        if (note) note.textContent = u('copiedNote');
        clearTimeout(a.copyTimer); a.copyTimer = setTimeout(() => { if (label) label.textContent = u('copyAddr'); if (note) note.textContent = ''; }, 1800);
      };
      // without the clipboard API the address goes through a hidden field, the old way; if that fails too, the
      // address is still printed under the form to copy by hand
      const fallback = () => {
        const field = document.createElement('input');
        field.value = PF.owner.email; field.readOnly = true; field.style.cssText = 'position: fixed; opacity: 0; pointer-events: none;';
        document.body.appendChild(field); field.select();
        try { if (document.execCommand('copy')) done(); } catch (err) { /* nothing left to try */ }
        field.remove();
      };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(PF.owner.email).then(done, fallback); else fallback();
    },
    'home-go': (a, w) => { const s = w && $('#' + a.dataset.to, w.el); if (s) s.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); },
    // a programme row opens its case study; the player zooms out of the row's cover
    'home-case': (a) => { const row = a.closest('.ft-show'); openCase(a.dataset.slug, rectOf(row && $('.ft-cover', row)) || rectOf(a), true); },
    // a listing slot opens its episode; the remote's keys switch episodes where they are
    'home-ep': (a, w) => {
      if (!w) return;
      homeEpisode(w, +a.dataset.i, !a.dataset.go);
      if (a.dataset.go) { const s = $('#hm-eps', w.el); if (s) s.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); }
    },
    'home-ep-step': (a, w) => { if (w) { homeEpisode(w, w.state.ep + (+a.dataset.d)); a.focus({ preventScroll: true }); } },
    'home-svc': (a, w) => homeService(w, +a.dataset.i),
    'home-faq': (a, w) => homeFaq(w, +a.dataset.i),
    'to-build': (a, w) => { const f = w && $('#about-build', w.el); if (!f) return; f.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' }); const c = $('input[name="need"]', f); if (c) c.focus({ preventScroll: true }); },
    'send-brief': (a, w) => {
      const list = w ? $$('input[name="need"]:checked', w.el).map((c) => c.value).join(', ') : '';
      location.href = `mailto:${PF.owner.email}?subject=${encodeURIComponent(u('mailSubject'))}&body=${encodeURIComponent(u('mailBody', list))}`;
    },
    // a click or tap keeps a photo's infotip open, one photo at a time, the way XP selects a thumbnail
    hobby: (a, w) => {
      const open = a.getAttribute('aria-expanded') !== 'true';
      $$('.hb-pic[aria-expanded="true"]', w ? w.el : document).forEach((b) => b.setAttribute('aria-expanded', 'false'));
      a.setAttribute('aria-expanded', String(open));
      delete a.parentElement.dataset.hush;
    },
    resume: (a) => openWin('resume', { from: rectOf(a) }),
    contact: (a) => openWin('contact', { from: rectOf(a) }),
    'open-game': (a) => openGame(rectOf(a)),
    'open-case': (a) => openCase(a.dataset.slug, rectOf(a), true),
    'ask-case': (a) => {
      const p = PF.bySlug(a.dataset.slug); if (!p) return;
      location.href = `mailto:${PF.owner.email}?subject=${encodeURIComponent(u('askSubject', p.title))}&body=${encodeURIComponent(u('askBody', p.title))}`;
    },
    'open-shot': (a) => openWin('viewer', { from: rectOf(a), state: { i: +a.dataset.i } }),
    'pv-step': (a, w) => viewerGo(w, w.state.i + +a.dataset.d),
    'pv-show': (a, w) => viewerShow(w),
    'next-sec': (a, w) => nextSection(w),
    stop: (a, w) => { const r = rectOf(w.el); closeWin(w); openWin('work', { from: r, pushHistory: true }); },
    'prev-case': (a, w) => stepCase(w, -1),
    'next-case': (a, w) => stepCase(w, 1),
    // the site's /work/<slug> address carries the case's own link preview (worker/index.js); a local preview has no
    // worker, so there it copies the desktop's own address for the case
    'copy-link': async (a, w) => {
      const url = /\/option-a-desktop\//.test(location.pathname) ? location.href.split('#')[0] + '#/work/' + w.state.slug : `${location.origin}/work/${w.state.slug}`;
      const ok = await copyText(url); toast(ok ? u('linkCopied') : url, a);
    },
    'copy-email': async (a) => {
      track('copy', 'email'); const ok = await copyText(PF.owner.email); toast(ok ? u('copied') : PF.owner.email, a);
      // the contact skin's copy keys turn green with a check for as long as the toast shows
      const nero = ok && a.closest('.nero');
      if (nero) { $$('[data-act="copy-email"]', nero).forEach((b) => b.classList.add('done')); setTimeout(() => $$('[data-act="copy-email"]', nero).forEach((b) => b.classList.remove('done')), 1600); }
    },
    'dl-ok': (a, w) => {
      // "Open" shows the PDF in a new tab; "Save" downloads it under its own file name
      const how = ($('input[name="dl"]:checked', w.el) || {}).value === 'open' ? 'open' : 'save';
      track('cv', how);
      if (how === 'open') window.open(cvHref(), '_blank', 'noopener');
      else { const l = document.createElement('a'); l.href = cvHref(); l.download = cvName(); document.body.appendChild(l); l.click(); l.remove(); }
      closeWin(w);
    },
    'cv-mail': (a, w) => {
      track('cv', 'request');
      location.href = `mailto:${PF.owner.email}?subject=${encodeURIComponent(u('cvSubject'))}&body=${encodeURIComponent(u('cvBody'))}`;
      closeWin(w);
    },
    'sd-ok': (a, w) => {
      const v = ($('input[name="sd"]:checked', w.el) || {}).value;
      closeWin(w);
      if (v === 'restart') restart();
      else shutdownScreen();
    },
  };

  /* ------------------------------------------------------------ global events */
  document.addEventListener('pointerdown', (e) => {
    if (menuState && !menuState.m.contains(e.target) && !e.target.closest('[data-menu]')) closeMenu();
    if (!startMenu.hidden && !startMenu.contains(e.target) && !startBtn.contains(e.target)) closeStart();
    const winEl = e.target.closest('.win');
    if (!winEl) { $$('.dicon.sel').forEach((n) => n.classList.remove('sel')); return; }
    const w = wins.get(winEl.dataset.id);
    if (!w) return;
    if (activeId !== w.id) focusWin(w);
    if (e.button !== 0) return;
    if (e.target.closest('.resize')) { startResize(w, e); return; }
    const rv = e.target.closest('.rv-row');
    if (rv && e.pointerType === 'mouse') { rvDrag(rv, e); return; }
    const drag = e.target.closest('[data-drag]');
    if (drag && !e.target.closest('button, select, a, input, label')) startDrag(w, e);
  });

  document.addEventListener('click', (e) => {
    const ln = e.target.closest && e.target.closest('a[href^="http"]'); if (!ln) return;
    const s = PF.owner.socials.find((x) => x.url === ln.href); if (s) track('social', s.key);
  }, true);

  document.addEventListener('dblclick', (e) => {
    const title = e.target.closest('.title, .pl-cap');
    if (!title || e.target.closest('button')) return;
    const w = winOf(title); if (w && !w.def.dialog) toggleMax(w);
  });

  document.addEventListener('click', (e) => {
    const wact = e.target.closest('[data-wact]');
    if (wact) {
      const w = winOf(wact); if (!w) return;
      const k = wact.dataset.wact;
      if (k === 'close') closeWin(w); else if (k === 'min') minimizeWin(w); else if (k === 'max') toggleMax(w);
      return;
    }
    const act = e.target.closest('[data-act]');
    if (act) {
      const fn = ACTIONS[act.dataset.act];
      if (fn) { e.preventDefault(); fn(act, winOf(act), e); }
      return;
    }
    const desk = e.target.closest('[data-desk]');
    if (desk) { openDesk(desk.dataset.desk, rectOf($('.px', desk))); return; }
    const task = e.target.closest('[data-task]');
    if (task) {
      const w = wins.get(task.dataset.task); if (!w) return;
      if (w.min) restoreWin(w); else if (activeId === w.id) minimizeWin(w); else focusWin(w);
      return;
    }
    if (e.target.closest('#startBtn')) { if (startMenu.hidden) openStart(); else closeStart(); return; }
    const sm = e.target.closest('[data-sm]');
    if (sm) {
      const k = sm.dataset.sm, from = rectOf(sm);
      closeStart();
      if (k === 'case') openCase(sm.dataset.slug, from, true);
      else if (k === 'lang') setLang(sm.dataset.lang);
      else if (k === 'shutdown' || k === 'credits') openWin(k, { from });
      else openWin(k, { from, pushHistory: true });
      return;
    }
    const sub = e.target.closest('[data-sub]');
    if (sub) { const li = sub.closest('li'); li.classList.toggle('open'); return; }
    const menu = e.target.closest('[data-menu]');
    if (menu) {
      const w = winOf(menu);
      if (menuState && menuState.anchor === menu) { closeMenu(); return; }
      if (w) openMenu(menu, menuItems(w, menu.dataset.menu));
      return;
    }
    const view = e.target.closest('[data-view]');
    if (view) { const w = winOf(view); w.state.view = view.dataset.view; renderWin(w, false); $('.files', w.el).focus({ preventScroll: true }); return; }
    const sort = e.target.closest('[data-sort]');
    if (sort) { const w = winOf(sort); const k = sort.dataset.sort; if (w.state.sort === k) w.state.dir = -(w.state.dir || 1); else { w.state.sort = k; w.state.dir = 1; } renderWin(w, true); return; }
    const file = e.target.closest('.files [data-slug]');
    if (file) { const w = winOf(file); selectFile(w, file.dataset.slug); openCase(file.dataset.slug, rectOf(file), true); return; }
    const sec = e.target.closest('.skin-nav [data-sec]');
    if (sec) { scrollToSec(winOf(sec), sec.dataset.sec); return; }
    const cat = e.target.closest('[data-cat]');
    if (cat) { const w = winOf(cat); w.state.cat = cat.dataset.cat; renderWin(w, false); const b = $(`[data-cat="${w.state.cat}"]`, w.el); if (b) b.focus(); return; }
    if (e.target.id === 'langBtn' || e.target.closest('#langBtn')) { setLang(lang === 'en' ? 'id' : 'en'); }
  });

  // pointing at an item previews it: Explorer's hover-select, and Home's Media Center services menu
  document.addEventListener('mouseover', (e) => {
    const f = e.target.closest('.files [data-slug]');
    if (f) { const w = winOf(f); if (w) selectFile(w, f.dataset.slug); return; }
    const mi = e.target.closest('.mm-item[data-i]');
    if (mi) { homeService(winOf(mi), +mi.dataset.i); return; }
    // the reviews row offers a grab hand only while it has more to show than the window holds
    const rv = e.target.closest('.rv-row');
    if (rv) rv.classList.toggle('grab', rv.scrollWidth > rv.clientWidth);
  });
  document.addEventListener('mouseout', (e) => {
    const img = e.target.closest('.pt-photo');
    if (img) tvSelect(img.closest('.pt-crt'), null);
  });
  document.addEventListener('mousemove', (e) => {
    const img = e.target.closest && e.target.closest('.pt-photo'); if (!img) return;
    tvPoint(img, e);
  });
  document.addEventListener('focusin', (e) => {
    if (!e.target.closest) return;
    const mi = e.target.closest('.mm-item[data-i]'); if (mi) homeService(winOf(mi), +mi.dataset.i);
  });
  document.addEventListener('animationend', (e) => { if (e.target.classList && e.target.classList.contains('pe-screen')) e.target.classList.remove('flick'); });
  document.addEventListener('submit', (e) => {
    const f = e.target.closest('form[data-form="home-mail"]');
    if (!f) return;
    e.preventDefault();
    const w = winOf(f); if (w) homeSend(w);
  });

  // the Konami code opens the hidden game from anywhere, except while typing or playing
  const KONAMI = 'arrowup,arrowup,arrowdown,arrowdown,arrowleft,arrowright,arrowleft,arrowright,b,a';
  const konamiKeys = [];
  document.addEventListener('keydown', (e) => {
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable], .gm-stage')) return;
    konamiKeys.push((e.key || '').toLowerCase());
    if (konamiKeys.length > 10) konamiKeys.shift();
    if (konamiKeys.join(',') === KONAMI) { konamiKeys.length = 0; openGame(null); }
  });

  document.addEventListener('keydown', (e) => {
    if (e.target.classList && e.target.classList.contains('files')) { const w = winOf(e.target); if (w) filesKey(w, e); return; }
    if (e.key === 'Escape') {
      closeMenu(); closeStart();
      // a dialog with the focus answers Escape as Cancel, as XP's did (File Download, Shut Down, credits)
      const dlg = e.target.closest && e.target.closest('.win.dialog');
      if (dlg) { const w = winOf(dlg); if (w) closeWin(w); }
    }
    // Home: up and down walk the Media Center services menu
    if ((e.key === 'ArrowDown' || e.key === 'ArrowUp') && e.target.closest && e.target.closest('.mm-list')) {
      const all = $$('.mm-item', e.target.closest('.mm-list')), nx = all[all.indexOf(e.target.closest('.mm-item')) + (e.key === 'ArrowDown' ? 1 : -1)];
      if (nx) { e.preventDefault(); nx.focus(); }
      return;
    }
    // Home: arrows on the remote switch episodes; in the Picture Viewer they step through the pictures
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && e.target.closest) {
      const d = e.key === 'ArrowRight' ? 1 : -1;
      // the contact skin's tabs: arrows move to the next category, like any tab strip
      if (e.target.closest('.nero-cats')) { const i = CATS.findIndex((c) => c.key === e.target.dataset.cat); if (i > -1) { e.preventDefault(); $(`[data-cat="${CATS[(i + d + CATS.length) % CATS.length].key}"]`, e.target.parentNode).click(); } return; }
      if (e.target.closest('.pt-remote')) { const w = winOf(e.target); if (w) { e.preventDefault(); homeEpisode(w, w.state.ep + d, true); } return; }
      const vw = winOf(e.target);
      if (vw && vw.id === 'viewer') { e.preventDefault(); viewerGo(vw, vw.state.i + d); return; }
    }
  });

  let rafPending = false;
  document.addEventListener('scroll', (e) => {
    if (!e.target.classList || !e.target.classList.contains('screen-view')) return;
    const w = winOf(e.target);
    if (!w || rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => { rafPending = false; updatePlayer(w); });
  }, true);

  document.addEventListener('error', (e) => { if (e.target.classList && e.target.classList.contains('hb-img')) e.target.remove(); }, true);
  // About's photo infotips: Escape tucks one away without moving the pointer or the focus, until they leave it;
  // a click anywhere else closes the one kept open
  const hbClose = () => $$('.hb-pic[aria-expanded="true"]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
  const hbUnhush = (e) => { const h = e.target.closest && e.target.closest('.hb'); if (h && !h.contains(e.relatedTarget)) delete h.dataset.hush; };
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { hbClose(); $$('.hb:hover, .hb:focus-within').forEach((h) => { h.dataset.hush = '1'; }); } });
  document.addEventListener('mouseout', hbUnhush);
  document.addEventListener('focusout', hbUnhush);
  document.addEventListener('click', (e) => { if (e.target.closest && !e.target.closest('.hb')) hbClose(); });
  document.addEventListener('input', (e) => {
    const w = winOf(e.target); if (!w) return;
    if (e.target.classList.contains('seek')) {
      const v = $('.screen-view', w.el), x = +e.target.value / 1000;
      v.scrollTop = (w.knots ? tlProg(w.knots, x) : x) * (v.scrollHeight - v.clientHeight);
    } else if (e.target.classList.contains('tsize')) setTextSize(w, +e.target.value);
    else if (e.target.id === 'hm-msg') w.state.msg = e.target.value; // survives a language switch
    else if (e.target.id === 'hm-from') w.state.from = e.target.value;
  });
  document.addEventListener('change', (e) => {
    const k = e.target.dataset && e.target.dataset.change; if (!k) return;
    const w = winOf(e.target); if (!w) return;
    if (k === 'switch-case') switchCase(w, e.target.value);
    if (k === 'contact-cat') { w.state.cat = e.target.value; renderWin(w, false); }
    if (k === 'home-subj') w.state.subj = +e.target.value;
    if (k === 'home-startup') { try { if (e.target.checked) localStorage.removeItem(HOME_KEY); else localStorage.setItem(HOME_KEY, '0'); } catch (err) { /* storage unavailable */ } }
  });

  /* ------------------------------------------------------------ language, tray, clock */
  const langBtn = $('#langBtn');
  function updateTray() {
    langBtn.textContent = lang.toUpperCase();
    langBtn.setAttribute('aria-label', lang === 'en' ? 'Language: English. Switch to Bahasa Indonesia' : 'Bahasa: Indonesia. Ganti ke English');
    langBtn.title = lang === 'en' ? 'English → Bahasa Indonesia' : 'Bahasa Indonesia → English';
    $('.tray .speaker').innerHTML = I('sound', 16);
    $('#clock').textContent = clockText();
  }
  function setLang(l) {
    if (l === lang) return;
    lang = l;
    PF.setLang(l);
    document.documentElement.lang = l;
    renderDesk(); renderStartBtn(); updateTray();
    if (!startMenu.hidden) renderStart();
    wins.forEach((w) => renderWin(w, true));
    renderTasks();
    if (pet) pet.setLang(l);
  }
  setInterval(() => { $('#clock').textContent = clockText(); homeTick(); }, 15000);

  /* ------------------------------------------------------------ welcome screen, shutdown, routing */
  // boot.js runs the welcome screen; the desktop opens behind it, so the screen can wait for Home's first view
  const bootScreen = PF.boot || { home() {}, replay() {} };
  const afterBoot = PF.bootDone || ((fn) => fn());
  function shutdownScreen() {
    const s = document.createElement('div');
    s.className = 'shutdown-screen';
    s.innerHTML = `<div>${esc(u('safe'))}<small>${esc(u('clickRestart'))}</small></div>`;
    document.body.appendChild(s);
    s.addEventListener('click', () => { s.remove(); restart(); }, { once: true });
  }
  function restart() {
    Array.from(wins.values()).forEach((w) => { w.el.remove(); });
    wins.clear(); activeId = null; renderTasks();
    bootScreen.replay();
    openDefault();
  }
  function parseHash() {
    const h = location.hash.replace(/^#\/?/, '');
    if (!h) return null;
    const [a, b] = h.split('/');
    if (a === 'work' && b && PF.bySlug(b)) return { id: 'player', slug: b };
    if (a === 'work') return { id: 'work' };
    if (a === 'about') return { id: 'about' };
    if (a === 'contact') return { id: 'contact' };
    if (a === 'home') return { id: 'home' };
    if (a === 'game') return { id: 'game' };
    return null;
  }
  function applyRoute(r) {
    if (!r) return;
    if (r.id === 'player') openCase(r.slug, null, false);
    else if (r.id === 'game') openGame(null, false);
    else openWin(r.id, { push: false });
  }
  // Only Home opens at startup (unless the visitor unticked "Show this screen…"); a shared link opens its window on top of it.
  function openDefault() {
    const r = parseHash();
    const home = homeAtStartup() || (r && r.id === 'home') ? openWin('home', { push: false }) : null;
    bootScreen.home(home && home.el);
    if (r && r.id !== 'home') applyRoute(r);
    // the desktop sat out of reach under the welcome screen: the front window takes the focus once it has gone
    afterBoot(() => { const w = topVisible(); if (w) focusWin(w, true); });
  }
  // the bare address is Home
  window.addEventListener('popstate', () => applyRoute(parseHash() || { id: 'home' }));
  // A smaller desktop keeps every window reachable: none is larger than the desktop, and a title bar stays in reach
  window.addEventListener('resize', () => {
    if (isMobile()) return;
    const W = desktopEl.clientWidth, H = desktopEl.clientHeight;
    wins.forEach((w) => {
      let x = parseFloat(w.el.style.left) || 0, y = parseFloat(w.el.style.top) || 0;
      // a window that no longer fits shrinks to the desktop and moves fully onto it
      if (w.el.offsetWidth > W - x) { w.el.style.width = Math.min(w.el.offsetWidth, W) + 'px'; x = clamp(x, 0, W - w.el.offsetWidth); }
      if (w.el.style.height && w.el.offsetHeight > H - y) { w.el.style.height = Math.min(w.el.offsetHeight, H) + 'px'; y = clamp(y, 0, H - w.el.offsetHeight); }
      w.el.style.left = clamp(x, -w.el.offsetWidth + 90, W - 90) + 'px';
      w.el.style.top = clamp(y, 0, H - 24) + 'px';
    });
  });
  // Phone mode fills the screen with the window and ignores its place; a window opened there was placed for a
  // phone (Home 460px wide at x -36 on a 375px screen). Leaving phone mode (a window widened past 720px) gives
  // every window the place it would have taken on this desktop
  mqMobile.addEventListener('change', () => {
    if (isMobile()) return;
    const W = desktopEl.clientWidth, H = desktopEl.clientHeight;
    wins.forEach((w) => {
      placeWin(w, geometryFor(w.id));
      if (w.def.dialog) {
        w.el.style.left = Math.round((W - w.el.offsetWidth) / 2) + 'px';
        w.el.style.top = Math.round((H - w.el.offsetHeight) / 2.4) + 'px';
      }
    });
  });

  /* ------------------------------------------------------------ init */
  document.documentElement.lang = lang;
  renderDesk();
  renderStartBtn();
  updateTray();
  openDefault();
  if (petState() === 'on') showPet(false);
})();
