/* Option A — Desktop XP. Window manager, desktop, start menu, and the four window types. */
(() => {
  'use strict';
  const PF = window.PF;
  const PX = window.PXI;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // title case for the labels that were once set in capitals: every word capitalised, bar the small joining words after the first
  const SMALL = new Set('a an and as at but by for in nor of on or the to with atau bagi dalam dan dari dengan di ke pada untuk yang'.split(' '));
  const titleCase = (s) => String(s).split(' ').map((w, i) => (i && SMALL.has(w.toLowerCase()) ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1))).join(' ');
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
      network: 'Network', accessories: 'Accessories', recycle: 'Recycle Bin', language: 'Language', shutdown: 'Shut Down…', openFolder: 'Open folder',
      minimize: 'Minimize', maximize: 'Maximize', close: 'Close',
      photoAlt: 'Portrait of Iqbal Surya',
      openPortfolio: 'View selected work', downloadCV: 'Download resume', contactMe: 'Contact me',
      history: 'Career history',
      to: 'To', worklog: 'Experience', worklogLead: 'My experience across agencies, product teams, and freelance work.', present: 'Present', ft: 'Full-time', fl: 'Freelance', projects: 'Personal projects', projectsLead: 'Things I have made and explored outside client work.', visitProject: 'Visit project', diskLabel: 'Side projects', offClock: 'Off the clock', offClockText: 'Outside work, I enjoy traveling, trying different food, and taking a break with coffee or a book.', myPictures: 'My Pictures', build: 'Have a project in mind?', buildLead: 'Have a website or app to design? Select what you need help with and send me a short brief.', need: 'What can I help with?', sendMsg: 'Write a project brief', reachDirect: 'Or reach me directly', emailLabel: 'Email', mailSubject: 'Project inquiry', mailBody: (list) => `Hi Iqbal,\n\n${list ? `I’d like help with: ${list}.\n\n` : ''}A bit about the project:\n`, factWhere: 'Based in', factExp: 'Experience', factLang: 'Languages', sinceYear: (y) => `UI design since ${y}`, also: 'Also',
      footer: '© 2026 Iqbal Surya', creditsTitle: 'About this portfolio', creditsVer: 'Version 2026 · Made in Indonesia', creditsIcons: 'Icons: Pixel Icon Library by HackerNoon, licensed under CC BY 4.0. Recoloured here as two-tone icons.',
      file: 'File', view: 'View', help: 'Help', play: 'Play', up: 'Up',
      address: 'Address', myDocs: 'My Documents', thumbnails: 'Thumbnails', details: 'Details', open: 'Open',
      arrangeNo: 'Arrange by Number', arrangeName: 'Arrange by Name', aboutPortfolio: 'About this portfolio',
      objects: (n) => `${n} object(s)`, caseStudies: 'Projects', caseTasks: 'Project actions', otherPlaces: 'Other Places', myComputer: 'My Computer',
      colNo: 'No.', colName: 'Name', colTags: 'Keywords', typeCase: 'Project',
      openCase: 'Open project', player: 'Project Player', chapters: 'Chapters', notYet: 'Not published',
      askAbout: (x) => `Ask me about ${x}`, askSubject: (x) => `About ${x}`, askBody: (x) => `Hi Iqbal,\n\nI saw ${x} in your portfolio and would like to hear more about it.\n\n`,
      writeup: 'The full project write-up is not available here yet. Email me if you’d like to discuss the work.',
      lblCase: 'Project', lblLink: 'Link', sizes: ['Small', 'Medium', 'Large'],
      fullCase: 'Project details', picSoon: (x) => `${x} (image not available yet)`, draftRatio: (s) => `Ratio differs from the slot (${s})`,
      overview: 'Overview', nowReading: 'Now reading',
      prevCase: 'Previous case', nextCase: 'Next case', nextSection: 'Next section', stop: 'Back to selected work',
      textSize: 'Text size', readPos: 'Reading position',
      switchCase: 'Choose a project', copyLink: 'Copy link to this project', linkCopied: 'Link copied',
      coverAlt: (x) => `${x}: cover`,
      sendEmail: 'Send an email', copyEmail: 'Copy address', copyHint: 'Use this address in your email app', copied: 'Copied!',
      availability: 'Availability', openProfile: (n) => `Open ${n} profile`, newTab: 'opens in a new tab',
      cvDownload: 'Download resume (PDF)', cvHint: 'One page · September 2026', cvByMail: 'Request my resume', cvByMailHint: 'Latest version, sent by email',
      fileDownload: 'File Download', dlText: 'Iqbal’s resume is available as a PDF.', from: 'from',
      dlQ: 'Open it in a new tab or download a copy.', dlOpen: 'Open PDF', dlSave: 'Download PDF',
      ok: 'OK', cancel: 'Cancel', cvAsk: 'Email me to request my latest resume.', cvAskBtn: 'Request resume', cvSubject: 'Resume request', cvBody: 'Hi Iqbal,\n\nCould you send me your latest resume?\n\n',
      shutTitle: 'Shut Down', shutQ: 'What do you want the computer to do?', shutDown: 'Shut down', restart: 'Restart',
      safe: "It's now safe to turn off your computer.", clickRestart: 'Click anywhere to start again',
      binFrom: 'Original location', binDeleted: 'Date deleted', binNote: 'Ideas that did not make it',
      binItems: [['portfolio_v7_FINAL_final2.fig', 'C:\\Work', '12/03/2025'], ['logo-option-23.png', 'C:\\Work\\Logos', '02/11/2024'], ['idea-at-3am.txt', 'C:\\Notes', '21/06/2024'], ['lorem-ipsum-forever.doc', 'C:\\Drafts', '09/01/2023']],
      home: 'Home', startProject: 'Start a project', watchWork: 'View the work',
      nowShowing: 'Now showing', detected: 'Detected',
      shotName: (n) => `UI shot ${n}`, openShot: (name) => `Open ${name}`, noSignal: 'No signal',
      viewer: 'Picture Viewer', prevPic: 'Previous picture', nextPic: 'Next picture', slideShow: 'Start slide show', stopShow: 'Stop slide show', openLink: 'Open link', picOf: (i, n) => `${i} of ${n}`,
      youGet: 'What you get:', epLabel: (n) => `EP ${n}`, epKey: (n) => `Episode ${n}`, prevEp: 'Previous episode', nextEp: 'Next episode',
      remote: 'Episode remote', channel: (n) => `CH ${String(n).padStart(2, '0')}`,
      helpTitle: 'Help Topics', helpTab: 'Contents', helpPick: 'Select a topic to read it.', openAbout: 'Open About Me',
      newMessage: 'Project inquiry', send: 'Send', toLabel: 'To:', subject: 'Subject:', message: 'Message', msgPlaceholder: 'Tell me about your website or app, the help you need, and your deadline.', subjectOther: 'Something else', subjectPrefix: 'Project inquiry', sendMeMsg: 'Send project inquiry', sendHint: 'Use an email address where I can reply.',
      fromLabel: 'From:', fromPlaceholder: 'you@company.com', sending: 'Sending…', sentTitle: 'Message sent', sentNote: (a) => `Thanks. I’ll reply to ${a}.`,
      fromFixTitle: (a) => `Did you mean ${a}?`, fromFixNote: (a) => `${a} looks like a typo. If it’s right, send it again.`, fromFixUse: 'Use this address',
      fromBadTitle: 'Check your email address', fromBadNote: (a) => `${a} can’t receive email, so my reply wouldn’t reach you. Check the spelling.`,
      mailAppTitle: 'Send the draft from your email app', mailAppNote: 'The website couldn’t send this message. Send the draft from your email app, or copy my address and email me directly.',
      showAtStart: 'Show Home each time the portfolio starts',
      copyAddr: 'Copy', copiedAddr: 'Copied', copiedNote: 'Email address copied', watchAgain: 'Back to the top',
      gameMenu: 'Game', gameNew: 'New game', gamePause: 'Pause', gameSound: 'Sound', gameAch: 'Achievements', gameBoard: 'Leaderboard', gamePet: 'Stickman on the taskbar', gameExit: 'Exit', gameHow: 'How to play',
      gameLoading: 'Loading Boss Rush XP…', gameFailed: 'Boss Rush XP couldn’t load. Close the game window and try again.',
      gameKeys: '← → move · ↑ jump · A punch · S kick · W guard · D dash · F special · P pause',
      saverLoading: 'Loading Screen Saver XP…', saverFailed: 'Screen Saver XP couldn’t load. Close its window and try again.',
      saverSound: 'Sound', saverStart: 'Start game', saverPause: 'Pause', saverResume: 'Resume', saverGo: 'Start/Pause', saverTrails: 'Pointer trails',
      desktop: 'Desktop', properties: 'Properties', gateSaver: 'Play Screen Saver XP', gateSaverText: 'Screen Saver XP plays on a phone, with one finger.',
      binHint: 'Recycle Bin isn’t empty', binHintText: 'Click here to see what’s in it.',
      saverOffer: 'The screensaver fought back', saverOfferText: 'Click here to take it on in Screen Saver XP.',
      gateHead: 'Play Boss Rush XP on a computer.', gateText: 'This game uses a keyboard and needs more screen space. Open the portfolio on a laptop or desktop to play.',
      gateBoard: 'Leaderboard', gateCols: ['#', 'Name', 'Time'], gateLoading: 'Loading…',
      gateBoardText: (n) => `${n} ${n === 1 ? 'player has' : 'players have'} beaten it. Open this page on a computer to take them on.`, gateBoardEmpty: 'Nobody has beaten it yet. Be the first, on a computer.',
      binExe: ['do-not-open.exe', 'C:\\Program Files\\Games', '01/04/2026'],
    },
    id: {
      start: 'Mulai', about: 'Tentang Saya', work: 'Portofolio', resume: 'CV', resumeFile: 'CV.pdf', contact: 'Kontak',
      network: 'Jaringan', accessories: 'Aksesori', recycle: 'Tempat Sampah', language: 'Bahasa', shutdown: 'Matikan…', openFolder: 'Buka folder',
      minimize: 'Kecilkan', maximize: 'Besarkan', close: 'Tutup',
      photoAlt: 'Potret Iqbal Surya',
      openPortfolio: "Lihat karya pilihan", downloadCV: 'Unduh CV', contactMe: 'Hubungi saya',
      history: 'Riwayat karier',
      to: 'Untuk', worklog: "Pengalaman", worklogLead: "Pengalaman saya di agensi, tim produk, dan proyek freelance.", present: "Saat ini", ft: 'Full-time', fl: 'Freelance', projects: "Proyek pribadi", projectsLead: "Karya dan eksplorasi saya di luar proyek klien.", visitProject: 'Kunjungi proyek', diskLabel: "Proyek pribadi", offClock: 'Di luar jam kerja', offClockText: "Di luar pekerjaan, saya suka jalan-jalan, mencoba makanan baru, dan bersantai dengan kopi atau buku.", myPictures: "Foto Saya", build: "Punya rencana website atau aplikasi?", buildLead: "Butuh bantuan mendesain website atau aplikasi? Pilih kebutuhan Anda, lalu kirim brief singkat.", need: "Apa yang bisa saya bantu?", sendMsg: "Tulis brief proyek", reachDirect: 'Atau hubungi saya langsung', emailLabel: 'Email', mailSubject: "Diskusi proyek", mailBody: (list) => `Halo Iqbal,\n\n${list ? `Saya butuh bantuan untuk: ${list}.\n\n` : ''}Tentang proyeknya:\n`, factWhere: 'Domisili', factExp: 'Pengalaman', factLang: 'Bahasa', sinceYear: (y) => `Desain UI sejak ${y}`, also: 'Lainnya',
      footer: '© 2026 Iqbal Surya', creditsTitle: 'Tentang portofolio ini', creditsVer: 'Versi 2026 · Dibuat di Indonesia', creditsIcons: 'Ikon: Pixel Icon Library oleh HackerNoon, berlisensi CC BY 4.0. Di sini diwarnai ulang menjadi ikon dua warna.',
      file: 'Berkas', view: 'Tampilan', help: 'Bantuan', play: 'Putar', up: 'Naik',
      address: 'Alamat', myDocs: 'Dokumen Saya', thumbnails: 'Gambar mini', details: 'Rincian', open: 'Buka',
      arrangeNo: 'Urutkan menurut Nomor', arrangeName: 'Urutkan menurut Nama', aboutPortfolio: 'Tentang portofolio ini',
      objects: (n) => `${n} objek`, caseStudies: 'Proyek', caseTasks: "Aksi proyek", otherPlaces: 'Tempat Lain', myComputer: 'Komputer Saya',
      colNo: 'No.', colName: 'Nama', colTags: 'Kata kunci', typeCase: 'Proyek',
      openCase: 'Buka proyek', player: 'Pemutar Proyek', chapters: 'Bab', notYet: "Belum diterbitkan",
      askAbout: (x) => `Tanya saya soal ${x}`, askSubject: (x) => `Tentang ${x}`, askBody: (x) => `Halo Iqbal,\n\nSaya melihat ${x} di portofolio Anda dan ingin tahu lebih banyak tentang proyeknya.\n\n`,
      writeup: "Uraian lengkap proyek ini belum tersedia di sini. Kirim email jika Anda ingin membahas pekerjaannya.",
      lblCase: "Proyek", lblLink: 'Tautan', sizes: ['Kecil', 'Sedang', 'Besar'],
      fullCase: "Detail proyek", picSoon: (x) => `${x} (gambar menyusul)`, draftRatio: (s) => `Rasio beda dengan slot (${s})`,
      overview: 'Ringkasan', nowReading: 'Sedang dibaca',
      prevCase: "Proyek sebelumnya", nextCase: "Proyek berikutnya", nextSection: 'Bagian berikutnya', stop: "Kembali ke karya pilihan",
      textSize: 'Ukuran teks', readPos: 'Posisi baca',
      switchCase: 'Pilih proyek', copyLink: "Salin tautan proyek ini", linkCopied: 'Tautan tersalin',
      coverAlt: (x) => `${x}: sampul`,
      sendEmail: 'Kirim email', copyEmail: 'Salin alamat', copyHint: "Gunakan alamat ini di aplikasi email Anda", copied: 'Tersalin!',
      availability: 'Ketersediaan', openProfile: (n) => `Buka profil ${n}`, newTab: "dibuka di tab baru",
      cvDownload: 'Unduh CV (PDF)', cvHint: "Satu halaman · September 2026", cvByMail: "Minta CV", cvByMailHint: 'Versi terbaru, dikirim lewat email',
      fileDownload: 'Unduh Berkas', dlText: "CV Iqbal tersedia dalam format PDF.", from: 'dari',
      dlQ: "Buka di tab baru atau unduh salinannya.", dlOpen: "Buka PDF", dlSave: "Unduh PDF",
      ok: 'OK', cancel: 'Batal', cvAsk: "Kirim email untuk meminta CV terbaru saya.", cvAskBtn: 'Minta CV', cvSubject: 'Permintaan CV', cvBody: 'Halo Iqbal,\n\nBoleh kirimkan CV terbaru Anda?\n\n',
      shutTitle: 'Matikan', shutQ: "Apa yang ingin Anda lakukan dengan komputer ini?", shutDown: 'Matikan', restart: 'Mulai ulang',
      safe: 'Sekarang aman untuk mematikan komputer Anda.', clickRestart: 'Klik di mana saja untuk memulai lagi',
      binFrom: 'Lokasi asal', binDeleted: 'Tanggal dihapus', binNote: 'Ide yang tidak lolos',
      binItems: [['portofolio_v7_FINAL_final2.fig', 'C:\\Kerja', '12/03/2025'], ['logo-opsi-23.png', 'C:\\Kerja\\Logo', '02/11/2024'], ['ide-jam-3-pagi.txt', 'C:\\Catatan', '21/06/2024'], ['lorem-ipsum-selamanya.doc', 'C:\\Draf', '09/01/2023']],
      home: 'Beranda', startProject: "Mulai proyek", watchWork: "Lihat karyanya",
      nowShowing: 'Sedang tayang', detected: 'Terdeteksi',
      shotName: (n) => `Shot UI ${n}`, openShot: (name) => `Buka ${name}`, noSignal: 'Tidak ada sinyal',
      viewer: 'Penampil Gambar', prevPic: 'Gambar sebelumnya', nextPic: 'Gambar berikutnya', slideShow: 'Mulai tayangan slide', stopShow: 'Hentikan tayangan slide', openLink: 'Buka tautan', picOf: (i, n) => `${i} dari ${n}`,
      youGet: "Hasil yang Anda dapat:", epLabel: (n) => `EP ${n}`, epKey: (n) => `Episode ${n}`, prevEp: 'Episode sebelumnya', nextEp: 'Episode berikutnya',
      remote: "Kontrol episode", channel: (n) => `CH ${String(n).padStart(2, '0')}`,
      helpTitle: 'Topik Bantuan', helpTab: 'Isi', helpPick: "Pilih topik yang ingin Anda baca.", openAbout: 'Buka Tentang Saya',
      newMessage: "Diskusi proyek", send: 'Kirim', toLabel: 'Kepada:', subject: 'Subjek:', message: 'Pesan', msgPlaceholder: "Ceritakan website atau aplikasi Anda, bantuan yang dibutuhkan, dan tenggatnya.", subjectOther: 'Hal lain', subjectPrefix: "Diskusi proyek", sendMeMsg: "Kirim brief proyek", sendHint: "Gunakan alamat email yang bisa saya hubungi.",
      fromLabel: 'Dari:', fromPlaceholder: 'anda@perusahaan.com', sending: 'Mengirim…', sentTitle: 'Pesan terkirim', sentNote: (a) => `Saya akan membalas ke ${a}.`,
      fromFixTitle: (a) => `Maksudnya ${a}?`, fromFixNote: (a) => `${a} sepertinya salah ketik. Kalau sudah benar, kirim sekali lagi.`, fromFixUse: 'Pakai alamat ini',
      fromBadTitle: 'Periksa alamat email Anda', fromBadNote: (a) => `${a} tidak bisa menerima email, jadi balasan saya tidak akan sampai. Periksa lagi ejaannya.`,
      mailAppTitle: "Kirim draf lewat aplikasi email Anda", mailAppNote: "Website ini belum berhasil mengirim pesan Anda. Kirim drafnya lewat aplikasi email, atau salin alamat saya dan kirim email langsung.",
      showAtStart: 'Tampilkan Beranda setiap kali portofolio dibuka',
      copyAddr: 'Salin', copiedAddr: 'Tersalin', copiedNote: 'Alamat email tersalin', watchAgain: "Kembali ke atas",
      gameMenu: 'Permainan', gameNew: 'Permainan baru', gamePause: 'Jeda', gameSound: 'Suara', gameAch: 'Pencapaian', gameBoard: 'Papan peringkat', gamePet: 'Stickman di taskbar', gameExit: 'Keluar', gameHow: 'Cara bermain',
      gameLoading: "Memuat Boss Rush XP…", gameFailed: "Boss Rush XP gagal dimuat. Tutup jendela game, lalu coba lagi.",
      gameKeys: '← → gerak · ↑ lompat · A pukul · S tendang · W tangkis · D dash · F spesial · P jeda',
      saverLoading: 'Memuat Screen Saver XP…', saverFailed: 'Screen Saver XP gagal dimuat. Tutup jendelanya, lalu coba lagi.',
      saverSound: 'Suara', saverStart: 'Mulai main', saverPause: 'Jeda', saverResume: 'Lanjut', saverGo: 'Mulai/Jeda', saverTrails: 'Jejak pointer',
      desktop: 'Desktop', properties: 'Properti', gateSaver: 'Main Screen Saver XP', gateSaverText: 'Screen Saver XP bisa dimainkan di HP, cukup dengan satu jari.',
      binHint: 'Tempat Sampah tidak kosong', binHintText: 'Klik di sini untuk melihat isinya.',
      saverOffer: 'Screensaver-nya melawan', saverOfferText: 'Klik di sini untuk menantangnya di Screen Saver XP.',
      gateHead: "Mainkan Boss Rush XP di komputer.", gateText: "Game ini menggunakan keyboard dan membutuhkan ruang layar lebih luas. Buka portofolio di laptop atau komputer untuk bermain.",
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
    // Screen Saver XP's device keeps its screen whole the same way: the arena (0.8 to 1.35) under the HUD's 28px row,
    // 12px of plastic round it and the 176px panel of keys beside it
    if (id === 'screensaver') {
      const s = clamp(Math.min((W - left - 24 - 200) / 360, (H - 24 - 52) / 480), 0.8, 1.35);
      const w = Math.round(360 * s) + 200, h = Math.round(480 * s) + 52;
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
    screensaver: {
      icon: 'moon', title: () => 'Screen Saver XP', build: buildSaver, after: afterSaver, route: () => '#/screensaver', skinned: true,
      onOpen: (w) => { if (w.game) w.game.focus(); },
      onClose: (w) => { if (w.game) w.game.destroy(); w.game = null; trailsNoteNow(); },
      onMin: trailsNoteNow,
    },
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
    if (['about', 'work', 'contact', 'resume', 'game', 'recycle', 'gamegate', 'screensaver'].includes(id)) track('window', id);
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
    if (w.def.onMin) w.def.onMin(w);
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
  // the two games sit in Accessories at the foot of the programs column, as XP kept its small programs there; the
  // menu never calls them games (owner's decision, 2026-09-29)
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
          <li class="sm-sep" role="separator"></li>
          <li role="none" class="has-sub">${item('data-sub aria-haspopup="menu"', 'grid', u('accessories'), 24, true)}
            <ul class="sm-sub" role="menu">
              <li role="none">${item('data-sm="brxp"', 'trophy', 'Boss Rush XP', 16)}</li>
              <li role="none">${item('data-sm="ssxp"', 'moon', 'Screen Saver XP', 16)}</li>
            </ul></li>
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
    m.innerHTML = items.map((it, i) => (it === '-' ? '<div class="hr" role="separator"></div>' : `<button role="menuitem" data-i="${i}"${it.off ? ' disabled' : ''}><span class="mk">${it.checked ? GLYPH.bullet : ''}</span><span>${esc(it.label)}</span></button>`)).join('');
    document.body.appendChild(m);
    const r = anchor.getBoundingClientRect();
    m.style.left = clamp(r.left, 2, innerWidth - m.offsetWidth - 2) + 'px';
    m.style.top = r.bottom + 'px';
    anchor.setAttribute('aria-expanded', 'true');
    m.addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (!b || b.disabled) return; const it = items[+b.dataset.i]; closeMenu(); it.run(); });
    m.addEventListener('keydown', (e) => {
      const bs = $$('button:not(:disabled)', m); const i = bs.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); bs[(i + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length].focus(); }
      if (e.key === 'Escape') { closeMenu(); anchor.focus(); }
    });
    menuState = { m, anchor };
    const f = $('button:not(:disabled)', m); if (f) f.focus({ preventScroll: true });
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
  // its telling stays in this desktop: Noto Sans headlines on a white page carry the pitch, Luna bands mark the
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

  // Prime Time: Home told as a 2004 Media Center TV-guide ad. The owner's photo plays on a TV, the work
  // runs as tonight's features in Media Center,
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
              <b class="tv-now">${esc(titleCase(u('nowShowing')))}</b>
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
    // the cover's frame is 441px wide on a wide desktop, about 590 or 660 where the rows narrow or stack, and the
    // window less its margins on a phone: a 1x screen takes the 640px copy, a 2x or 3x one the 1280px.
    // While the loading screen is up, the covers and their UI cards wait in data-src (freeHeld() lets them go): the
    // rows sit far down Home, and the browser would otherwise fetch them beside the pictures the screen waits for
    const at = document.documentElement.classList.contains('booting') ? 'data-' : '';
    const set = f.img.small ? ` ${at}srcset="${esc(f.img.small)} 640w, ${esc(f.img.src)} 1280w" sizes="(max-width: 720px) calc(100vw - 64px), (max-width: 860px) 660px, (max-width: 1300px) 590px, 441px"` : '';
    const pic = f.img.src
      ? `<img ${at}src="${esc(f.img.src)}"${set} alt="" loading="lazy" decoding="async"${W.dither ? ' data-dither' : ''}${f.img.pos ? ` style="object-position:${f.img.pos}"` : ''}>`
      : slotHTML(f.img, 'ft-ph');
    const ui = f.ui.src
      ? `<img class="ft-ui-pic" ${at}src="${esc(f.ui.src)}" ${at}srcset="${esc(f.ui.src)} 920w, ${esc(f.ui.big)} 1380w" sizes="(max-width: 720px) calc(87.5vw - 120px), 460px" alt="" loading="lazy" decoding="async">`
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
  // the pictures Home held while the loading screen was up (featureHTML): with inView only those inside the window's
  // visible part, which the screen then waits for; without it, all of them
  function freeHeld(el, inView) {
    const view = inView ? ($('.win-body', el) || el).getBoundingClientRect() : null;
    $$('img[data-src]', el).forEach((img) => {
      const r = view && img.getBoundingClientRect();
      if (r && !(r.bottom > view.top && r.top < view.bottom)) return;
      if (img.dataset.srcset) img.srcset = img.dataset.srcset;
      img.src = img.dataset.src;
      img.removeAttribute('data-src'); img.removeAttribute('data-srcset');
    });
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
      cells.push(`<li class="mv-off ${on}" style="--k:${n + k}" aria-hidden="true"><span class="mv-pic"><span>${esc(titleCase(u('noSignal')))}</span></span><span class="mv-umd"><i class="mv-tally"></i></span></li>`);
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

  // the episode guide: each episode's still plays on a silver flat-panel TV; the remote steps through them. The
  // stills are frames of the 3D desk (desk3d/), at its dither dot: 340 dots wide for the full TV, 170 for a
  // phone's. Where the desk can run, desk3d/episode.js draws it over the still
  function episodeScreenHTML(i) {
    const s = PF.home.process.steps[i], im = s.img;
    const pic = im.src
      ? `<picture><source media="(max-width: 520px)" srcset="${esc(im.src)}-170.png"><img class="pe-img pe-still" src="${esc(im.src)}-340.png" width="340" height="200" alt="${esc(t(im.alt))}" loading="lazy" decoding="async"></picture>`
      : slotHTML(im, 'pe-img');
    return `${pic}<span class="pe-lower"><b class="tv-now">${esc(u('epLabel', i + 1))}</b><span>${esc(t(s.when))} · ${esc(t(s.genre))}</span></span>`;
  }
  function episodeCopyHTML(i) {
    const s = PF.home.process.steps[i];
    return `<div class="pe-about"><h3 class="pe-title">${esc(t(s.title))}</h3>
      <p class="pe-text">${esc(t(s.text))}</p></div>
      <div class="pe-gets"><p class="pe-get">${esc(u('youGet'))}</p>
      <ul class="pe-items">${s.items.map((x) => `<li>${I(x.icon || 'check', 24)}<span>${esc(t(x))}</span></li>`).join('')}</ul></div>`;
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
    // the desk's canvas stays through the change, so its camera can travel to the new episode
    const desk = $(':scope > .desk3d', screen);
    screen.innerHTML = episodeScreenHTML(w.state.ep);
    if (desk) screen.prepend(desk);
    if (PF.desk3d) PF.desk3d.go(w.state.ep);
    copy.innerHTML = episodeCopyHTML(w.state.ep);
    $$('.rm-num', w.el).forEach((b) => b.setAttribute('aria-pressed', String(+b.dataset.i === w.state.ep)));
    if (!reduceMotion) {
      screen.classList.remove('flick'); void screen.offsetWidth; screen.classList.add('flick');
      // the set's own on-screen display puts the channel number up for a moment (home.css, .pe-osd)
      screen.insertAdjacentHTML('beforeend', `<span class="pe-osd" aria-hidden="true">${String(w.state.ep + 1).padStart(2, '0')}</span>`);
    }
    if (focusKey) { const k = $(`.rm-num[data-i="${w.state.ep}"]`, w.el); if (k) k.focus({ preventScroll: true }); }
  }

  // a key worked from the keyboard goes down on the remote too, as a click would press it
  function keyHit(k) {
    if (!k || reduceMotion) return;
    k.classList.remove('hit'); void k.offsetWidth; k.classList.add('hit');
  }

  function servicePaneHTML(i) {
    const s = PF.home.services.list[i];
    // the pointed-at service shows its picture alone, at the owner's own shape (800, 1100 and 1600px WebP copies); a
    // picture not supplied yet is a grey slot naming the owner's file. Its line stays in the data, not on the page.
    // Lazy: the menu sits far down Home, so its picture waits until the visitor gets near it. The frame is about 430px
    // beside the menu, about 740 where it stacks under it, and the window less its margins on a phone, so a 2x laptop
    // and a 3x phone both take the 1100px copy
    const v = `?v=${PF.home.services.picVersion || 1}`;
    const pic = s.img.src
      ? `<img class="mm-img" src="${esc(s.img.src)}-800.webp${v}" srcset="${[800, 1100, 1600].map((x) => `${esc(s.img.src)}-${x}.webp${v} ${x}w`).join(', ')}" sizes="(max-width: 720px) calc(100vw - 64px), (max-width: 990px) 740px, 430px" width="800" height="868" alt="" loading="lazy" decoding="async">`
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
            <button type="button" class="page-key rec" data-act="home-start"><i class="rec-dot" aria-hidden="true"></i><span>${esc(u('startProject'))}</span></button>
            <button type="button" class="page-key silver" data-act="home-go" data-to="hm-work">${I('play', 16)}<span>${esc(u('watchWork'))}</span></button>
          </div>
        </div>
        ${heroCrtHTML()}
      </header>

      <section class="pt-letter" aria-labelledby="pt-letter-h">
        <div class="lt-head">
          <h2 class="pt-h2" id="pt-letter-h">${(([first, ...rest]) => `<span class="lt-l1">${esc(first)}</span> ${esc(rest.join(' '))}`)(t(H.promise.head))}</h2>
          <p class="lt-stand">${esc(t(H.promise.text))}</p>
        </div>
        <div class="lt-body">
          ${H.letter.map((p) => `<p>${esc(t(p))}</p>`).join('')}
          <p class="lt-sign"><span class="lt-ava"><img src="${esc(o.photo)}" srcset="${esc(o.photoSet)}" sizes="64px" alt="${esc(u('photoAlt'))}" width="564" height="564" loading="lazy"></span><span><b>${esc(o.fullName)}</b><small>${esc(t(o.role))}, ${esc(t(o.location))}</small></span></p>
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
        <h2 class="rv-head" id="hm-words-h">${esc(titleCase(t(H.words.head)))}</h2>
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
          <ul class="mm-list">${H.services.list.map((x, i) => `<li><button class="mm-item" data-act="home-svc" data-i="${i}" aria-pressed="${i === st.svc}" aria-controls="mm-pane"><span class="mm-no" aria-hidden="true">${String(i + 1).padStart(2, '0')}</span><span class="mm-t">${esc(t(x.name))}</span>${I('right', 24, { mono: true })}</button></li>`).join('')}</ul>
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
  const homeFx = { wall: false, squeeze: false, risen: new Set() };
  const HOME_RISE = '#pt-letter-h, #hm-work-h, #pt-ch-h, #hm-words-h, #hm-proc-h, #hm-svc-h, #hm-faq-h, #hm-cta-h';
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
    // each section's heading rises 8px into place as it comes into view, once a visit (home.css, .rise). The headings
    // are counted in page order, which a re-render keeps, so one that has risen is not hidden again
    const parts = $$(HOME_RISE, w.el).filter((el, k) => !homeFx.risen.has(k) && (el.dataset.rise = k, el.classList.add('rise'), true));
    if (!parts.length) return;
    const io = new IntersectionObserver((es) => {
      es.filter((x) => x.isIntersecting).forEach((x, n) => {
        io.unobserve(x.target); homeFx.risen.add(+x.target.dataset.rise);
        x.target.style.setProperty('--rise-d', `${Math.min(n, 4) * 60}ms`);
        x.target.classList.add('risen');
      });
    }, { root, rootMargin: '0px 0px -8% 0px' });
    parts.forEach((el) => io.observe(el)); w.fxIO.push(io);
  }
  function homeFaq(w, i) {
    w.state.faq = w.state.faq === i ? -1 : i;
    const main = $('.help-main', w.el); if (!main) return;
    main.innerHTML = faqHTML(w.state);
    // the picked topic's highlight sweeps in and its answer settles (home.css, .help-main.swap)
    if (!reduceMotion) main.classList.add('swap');
    const q = $(`#faq-q-${i}`, main); if (q) q.focus({ preventScroll: true });
  }
  function homeTick() {
    const w = wins.get('home'); if (!w) return;
    $$('.hm-day', w.el).forEach((n) => { n.style.width = `${dayShare().toFixed(1)}%`; });
  }
  // What became of the message, as XP's notification balloon over the Send button: sent (it goes by itself); handed
  // to the visitor's email app, which a page can't see open, so that one stays with the Copy button until closed; or
  // sent back because no reply could reach the address: a slip the balloon offers to fix (fix) or a domain that takes
  // no mail (bad), which stay until the address changes. Screen readers hear it as a status
  function mailBalloon(f, kind, from, fix) {
    const old = $('.mail-bal', f); if (old) old.remove();
    clearTimeout(f.balTimer);
    const b = document.createElement('div');
    b.className = 'mail-bal'; b.dataset.kind = kind; b.setAttribute('role', 'status');
    const key = (act, icon, label, more = '') => `<button type="button" class="btn mail-copy" data-act="${act}"${more}>${I(icon, 16)}<span>${esc(label)}</span></button>`;
    const [icon, title, note, button] = {
      sent: ['check', u('sentTitle'), u('sentNote', from), ''],
      mail: ['envelope', u('mailAppTitle'), u('mailAppNote'), key('home-copy', 'copy', u('copyAddr'))],
      fix: ['warning', u('fromFixTitle', fix), u('fromFixNote', from), key('home-fix', 'check', u('fromFixUse'), ` data-to="${esc(fix)}"`)],
      bad: ['warning', u('fromBadTitle'), u('fromBadNote', from), ''],
    }[kind];
    b.innerHTML = `<b>${I(icon, 16)}<span>${esc(title)}</span></b><p>${esc(note)}</p>${button}`
      + `<button type="button" class="pet-x" data-act="mail-bal-x" aria-label="${esc(u('close'))}"></button>`;
    $('.mail-send', f).appendChild(b);
    if (kind === 'sent') f.balTimer = setTimeout(() => { b.classList.add('out'); setTimeout(() => b.remove(), 300); }, 8000);
  }

  // The message goes straight to the owner's inbox through /api/message (worker/index.js). Where that can't
  // send (not set up, offline, a local preview) the visitor's email app opens with the same message; an address no
  // reply can reach comes back to the form instead
  async function homeSend(w) {
    const f = $('.hm-mail', w.el), note = $('#hm-send-note', w.el), btn = $('button[type="submit"]', f);
    if (!f || (btn && btn.disabled)) return;
    const offers = homeOffers();
    const subject = `${u('subjectPrefix')}: ${offers[w.state.subj] || offers[0]}`;
    const field = $('#hm-from', f), from = field.value.trim(), message = $('#hm-msg', f).value.trim();
    const say = (text) => { if (note) note.textContent = text; };
    // the button itself says it is sending, in full ink, its dots running, at the width it had, so the hint beside it
    // stays put; a screen reader hears it through the form's live note
    const label = $('span', btn), was = label.textContent, live = $('#hm-copy-note', f);
    btn.style.minWidth = `${btn.offsetWidth}px`;
    label.innerHTML = `${esc(u('sending').replace(/…$/, ''))}<i class="dots" aria-hidden="true"><i>.</i><i>.</i><i>.</i></i>`;
    btn.disabled = true; btn.classList.add('busy'); btn.setAttribute('aria-busy', 'true'); field.removeAttribute('aria-invalid');
    if (live) live.textContent = u('sending');
    let res = null;
    try {
      res = await fetch('/api/message', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        // sure: the balloon offered a fix for this very address, and the visitor sent it as typed all the same
        body: JSON.stringify({ from, subject, message, lang, website: f.elements.website.value, sure: w.state.fromAsked === from }),
      });
    } catch (e) { res = null; }
    btn.disabled = false; btn.classList.remove('busy'); btn.removeAttribute('aria-busy'); label.textContent = was; btn.style.minWidth = '';
    if (live) live.textContent = '';
    say(u('sendHint'));
    if (res && res.ok) {
      $('#hm-msg', f).value = ''; w.state.msg = '';
      mailBalloon(f, 'sent', from); track('send', 'api');
      return;
    }
    // no reply could reach the address (worker/index.js, message()): the message waits in the form, and the balloon
    // offers the fix for a slip (suggest) or asks for another look at the address
    const why = res && res.status === 422 ? await res.json().catch(() => null) : null;
    if (why && why.error === 'from') {
      field.setAttribute('aria-invalid', 'true');
      if (why.suggest) { w.state.fromAsked = from; mailBalloon(f, 'fix', from, why.suggest); } else { mailBalloon(f, 'bad', from); field.focus(); }
      return;
    }
    mailBalloon(f, 'mail'); track('send', 'mailto');
    location.href = `mailto:${PF.owner.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
  }

  /* ------------------------------------------------------------ ABOUT */
  // A document in five parts: the letter, the work log, side projects, off the clock, and an order form.
  // The side projects disk: a 3.5" HD floppy in the site's own materials. Navy plastic lit from the top left, the Silver
  // shutter brushed and sheened like the hero's steel, the label's text on its ruled lines, the write-protect slider
  // bottom left and the HD hole bottom right, cut through so the page shows.
  const FLOPPY_GRAIN = [[3.9, 30, 58, 1], [5.1, 44, 44, 0], [6.6, 28, 40, 1], [7.4, 61, 29, 0], [9.2, 33, 51, 1], [10.7, 28, 23, 0],
    [11.9, 50, 40, 1], [13.6, 36, 30, 0], [15.1, 28, 62, 1], [16.8, 57, 33, 0], [18.3, 31, 38, 1], [19.9, 44, 46, 0], [21.4, 28, 27, 1],
    [22.8, 62, 28, 0], [24.5, 35, 47, 1], [26.1, 28, 34, 0], [27.4, 51, 39, 1], [29.2, 30, 60, 0], [30.9, 46, 25, 1], [32.3, 28, 44, 0],
    [33.8, 58, 32, 1], [35.6, 32, 41, 0], [37.2, 28, 62, 1], [38.9, 48, 42, 0]]
    .map(([y, x, w, lit]) => `<rect x="${x}" y="${y}" width="${Math.min(w, 90 - x)}" height=".3" fill="${lit ? '#fff' : '#2e3442'}" opacity="${lit ? .38 : .14}"/>`).join('');
  function floppySVG(label, vol) {
    const body = 'M5 2h101l12 12v104a4 4 0 0 1-4 4H5a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z';
    const shutter = 'M28 2h62v38.6a1.4 1.4 0 0 1-1.4 1.4H29.4a1.4 1.4 0 0 1-1.4-1.4z';
    return `<svg class="floppy-art" viewBox="0 0 120 124" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id="fl-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#28375f"/><stop offset=".45" stop-color="#1b2744"/><stop offset="1" stop-color="#131b32"/></linearGradient>
        <linearGradient id="fl-gloss" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset=".35" stop-color="#fff" stop-opacity=".02"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <linearGradient id="fl-foot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#040a18" stop-opacity="0"/><stop offset="1" stop-color="#040a18" stop-opacity=".4"/></linearGradient>
        <linearGradient id="fl-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#050a16" stop-opacity=".45"/><stop offset="1" stop-color="#050a16" stop-opacity="0"/></linearGradient>
        <linearGradient id="fl-lip" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050a16" stop-opacity=".55"/><stop offset="1" stop-color="#050a16" stop-opacity="0"/></linearGradient>
        <linearGradient id="fl-metal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f3f4f7"/><stop offset=".4" stop-color="#d4d7de"/><stop offset="1" stop-color="#b3b8c2"/></linearGradient>
        <linearGradient id="fl-sheen" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity="0"/><stop offset=".3" stop-color="#fff" stop-opacity=".4"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".68" stop-color="#282c3c" stop-opacity=".1"/><stop offset=".9" stop-color="#fff" stop-opacity=".28"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
        <linearGradient id="fl-paper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fbf9f2"/><stop offset="1" stop-color="#f2eee2"/></linearGradient>
        <clipPath id="fl-cut"><path clip-rule="evenodd" d="${body}M109 112v5.5h5.5V112z"/></clipPath>
      </defs>
      <g clip-path="url(#fl-cut)">
        <path d="${body}" fill="url(#fl-body)"/>
        <path d="${body}" fill="url(#fl-gloss)"/>
        <rect x="1" y="100" width="118" height="22" fill="url(#fl-foot)"/>
        <path d="M5 2.6h100.8l11.6 11.6" fill="none" stroke="#fff" stroke-opacity=".22" stroke-width=".9"/>
        <path d="M1.6 6v112" fill="none" stroke="#fff" stroke-opacity=".08" stroke-width=".9"/>
        <rect x="12" y="2" width="16" height="39" fill="#050a16" opacity=".16"/>
        <rect x="12" y="2" width="3" height="39" fill="url(#fl-wall)"/>
        <rect x="12" y="40.5" width="16" height=".5" fill="#fff" opacity=".1"/>
        <path d="M7 7.5l3.2 5.2H3.8z" fill="#3a4b7b"/>
        <rect x="28" y="42" width="62" height="2.2" fill="url(#fl-lip)"/>
        <path d="${shutter}" fill="url(#fl-metal)"/>
        ${FLOPPY_GRAIN}
        <path d="${shutter}" fill="url(#fl-sheen)"/>
        <rect x="28" y="2" width="62" height="1" fill="#fff" opacity=".9"/>
        <rect x="28" y="3" width="62" height="1.6" fill="#fff" opacity=".35"/>
        <path d="M28.3 2v38.6" stroke="#fff" stroke-opacity=".5" stroke-width=".6"/>
        <path d="M89.7 2v38.6M29.4 41.7h59.2" fill="none" stroke="#6f747e" stroke-opacity=".7" stroke-width=".6"/>
        <rect x="70" y="9" width="12" height="27" rx="1.4" fill="#0f172d"/>
        <rect x="70" y="9" width="12" height="4" rx="1.4" fill="url(#fl-lip)"/>
        <rect x="70" y="9" width="1.1" height="27" fill="#050a16" opacity=".4"/>
        <path d="M71.2 35.7h9.6" stroke="#fff" stroke-opacity=".75" stroke-width=".6"/>
        <rect x="14" y="116" width="94" height="1" fill="#050a16" opacity=".4"/>
        <rect x="107" y="55" width=".9" height="61.6" fill="#050a16" opacity=".35"/>
        <rect x="13" y="54" width="94" height="62" rx="2" fill="url(#fl-paper)" stroke="#141008" stroke-opacity=".14" stroke-width=".5"/>
        <path d="M13 56a2 2 0 0 1 2-2h90a2 2 0 0 1 2 2v7H13z" fill="#d4441d"/>
        <rect x="13" y="62.5" width="94" height=".5" fill="#9c2f10" opacity=".55"/>
        <text class="fl-hd" x="19" y="60.8">HD</text>
        <text class="fl-hd" x="101" y="60.8" text-anchor="end">1.44 MB</text>
        <g fill="#b9b6ab"><rect x="19" y="84" width="82" height="1"/><rect x="19" y="97" width="82" height="1"/><rect x="19" y="110" width="82" height="1"/></g>
        <text class="fl-t1" x="19" y="82.6">${esc(label)}</text>
        <text class="fl-t2" x="19" y="95.6">${esc(vol)}</text>
        <rect x="5.5" y="112" width="5.5" height="5.5" fill="#18213b"/>
        <rect x="5.5" y="112" width="5.5" height="1.6" fill="#050a16" opacity=".7"/>
        <rect x="5.5" y="112" width="1.1" height="5.5" fill="#050a16" opacity=".5"/>
      </g>
      <path d="${body}" fill="none" stroke="#0b1226" stroke-width="1.2"/>
      <path d="M109 112h5.5v5.5H109zM5.5 112H11v5.5H5.5z" fill="none" stroke="#0b1226" stroke-width=".6"/>
    </svg>`;
  }
  function buildAbout() {
    const o = PF.owner;
    const log = o.worklog.map((j) => `
      <li class="${j.to ? '' : 'now'}"><span class="wl-date">${esc(j.from)} – ${j.to ? esc(j.to) : `<b>${esc(u('present'))}</b>`}</span>
        <div class="wl-main"><h3>${esc(j.role)}</h3><p>${esc(j.org)}${j.type ? ` · ${esc(u(j.type))}` : ''}</p>${j.place ? `<p class="wl-place">${esc(j.place)}</p>` : ''}</div></li>`).join('');
    const projects = o.sideProjects.map((p, i) => `
      <li><a class="pj-card" href="${esc(t(p.url))}"${p.external === false ? '' : ' target="_blank" rel="noopener noreferrer"'} aria-label="${esc(p.name)} — ${esc(t(p.desc))}${p.external === false ? '' : ` (${esc(u('newTab'))})`}">
        <span class="pj-image"><img src="${esc(p.image)}" alt="${esc(t(p.imageAlt))}" loading="lazy" decoding="async"></span>
        <div class="pj-info"><span class="pj-meta">${String(i + 1).padStart(2, '0')} / ${esc(t(p.kind))}</span><h3 class="pj-name">${esc(p.name)}</h3><span class="pj-desc">${esc(t(p.desc))}</span><span class="pj-visit">${esc(p.cta ? t(p.cta) : u('visitProject'))} ${p.external === false ? '→' : '↗'}</span></div>
      </a></li>`).join('');
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
          <figure class="ad-photo"><img src="${esc(o.photo)}" srcset="${esc(o.photoSet)}" sizes="(max-width: 720px) 80px, 120px" alt="${esc(u('photoAlt'))}" width="564" height="564"></figure>
          <div class="sp-name">
            <h2>${esc(o.fullName)}</h2>
            <p class="ad-role">${esc(t(o.role))}</p>
            <p class="sp-status">${esc(t(o.status))}</p>
          </div>
        </div>
        <dl class="sp-facts">${facts}</dl>
        <p class="ad-lede">${esc(t(o.intro))}</p>
        <div class="ad-actions">
          <button type="button" class="page-key rec" data-act="resume">${I('resume', 16)}<span>${esc(u(hasCV() ? 'downloadCV' : 'cvAskBtn'))}</span></button>
          <button type="button" class="page-key silver" data-act="open-work">${I('folder', 16)}<span>${esc(u('openPortfolio'))}</span></button>
        </div>
      </header>

      <section class="panel sp-sec"><h2>${esc(u('worklog'))}</h2><div class="pb">
        <p class="lead">${esc(u('worklogLead'))}</p>
        <ol class="wlog">${log}</ol>
      </div></section>

      <div class="sp-row">
        <section class="panel"><h2>${esc(u('projects'))}</h2><div class="pb">
          <p class="lead">${esc(u('projectsLead'))}</p>
          <ul class="pj">${projects}</ul>
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
          <div class="bd-send"><button class="page-key rec" type="button" data-act="send-brief">${I('envelope', 16)}<span>${esc(u('sendMsg'))}</span></button></div>
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
  // On a local preview an empty slot shows the owner's export as soon as it is saved in the case's folder under the
  // slot's file name (Figma's PNG or JPG, with or without its @2x suffix), so each screen is judged in place and
  // replaced by exporting it again. The site itself shows a slot's src only: the web copies, made once approved.
  const DRAFTS = /^(localhost|127\.0\.0\.1|\[::1\])$/.test(location.hostname);
  const DRAFT_EXT = ['@2x.png', '.png', '@2x.jpg', '.jpg'];
  // the export waits hidden in front of the grey slot, with the name tag that names its file on hover
  const draftHTML = (c, x) => (DRAFTS
    ? `<img class="cs-img" data-draft="../${esc(c.dir)}/${esc(x.file)}" width="${x.w}" height="${x.h}" alt="${esc(t(x.alt))}" decoding="async" hidden><span class="cs-draft-tag" aria-hidden="true" hidden></span>`
    : '');
  // each name the export may carry is tried in turn, the sharper @2x first when both were exported; the first that
  // loads takes the slot's place, and when none does the grey slot stands again. A newer check drops an older one.
  function draftLoad(img, stamp) {
    const tag = img.nextElementSibling, slot = tag.nextElementSibling;
    const w = +img.getAttribute('width'), h = +img.getAttribute('height');
    const tries = DRAFT_EXT;
    img.dataset.scan = stamp;
    const next = (i) => {
      if (img.dataset.scan !== String(stamp)) return;
      if (i === tries.length) { img.hidden = tag.hidden = true; slot.hidden = false; return; }
      const probe = new Image();
      probe.onload = () => {
        if (img.dataset.scan !== String(stamp)) return;
        const nw = probe.naturalWidth, nh = probe.naturalHeight, off = Math.abs(nw / nh / (w / h) - 1) > 0.01;
        // the loaded probe takes the picture's place: the local server says no-cache, so a new src would fetch again
        for (const a of img.attributes) if (a.name !== 'src' && a.name !== 'hidden') probe.setAttribute(a.name, a.value);
        img.replaceWith(probe);
        // the tag gives the file to export again, its size and its scale; it stays up on a picture of another shape
        tag.classList.toggle('off', off);
        tag.innerHTML = `<b>${esc(probe.dataset.draft.split('/').slice(-2).join('/') + tries[i])}</b><small>${nw} × ${nh} · ${+(nw / w).toFixed(1)}x</small>${off ? `<small class="dt-off">${I('warning', 16)}<span>${esc(u('draftRatio', `${w} × ${h}`))}</span></small>` : ''}`;
        tag.hidden = false;
        slot.hidden = true;
      };
      probe.onerror = () => next(i + 1);
      probe.src = `${img.dataset.draft}${tries[i]}?r=${stamp}`;
    };
    next(0);
  }
  function draftScan(root) {
    const stamp = Date.now();
    $$('img[data-draft]', root).forEach((img) => draftLoad(img, stamp));
  }
  // coming back to the page from the export (Figma, Finder) checks the open case again: a new or replaced file shows
  // without a reload, and the page keeps its place. A page out of sight waits, so a background tab asks for nothing.
  let draftAt = 0;
  function draftAgain() {
    const w = wins.get('player');
    if (!w || document.hidden || Date.now() - draftAt < 500) return;
    draftAt = Date.now();
    draftScan(w.el);
  }
  if (DRAFTS) { window.addEventListener('focus', draftAgain); document.addEventListener('visibilitychange', draftAgain); }
  // a screen on the page: the owner's screenshot once it has a src, until then a grey slot naming its file and size
  function picBody(c, x) {
    if (x.src) return `<img class="cs-img" src="${esc(x.src)}" width="${x.w}" height="${x.h}" alt="${esc(t(x.alt))}" loading="lazy" decoding="async">`;
    return `${draftHTML(c, x)}<span class="cs-ph cs-img" style="aspect-ratio: ${x.w} / ${x.h}" role="img" aria-label="${esc(u('picSoon', t(x.alt)))}"><span class="cs-ph-tag"><b>${esc(c.dir.split('/').pop())}/${esc(x.file)}</b><small>${x.w} × ${x.h}</small></span></span>`;
  }
  // a CRT with no screen yet shows its own On-Screen Display, the way a monitor says it has no input, naming the file
  const crtBody = (c, x) => (x.src ? picBody(c, x)
    : `${draftHTML(c, x)}<span class="crt-osd" role="img" aria-label="${esc(u('picSoon', t(x.alt)))}"><span class="osd-box"><b>${esc(u('noSignal'))}</b><span>${esc(c.dir.split('/').pop())}/${esc(x.file)}</span><small>${x.w} × ${x.h}</small></span></span>`);
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
  // (Home's mini window: a tool window or a dialog carries only its close button); the design focus's shot goes bare
  function casePic(c, x) {
    if (x.frame === 'bare') return picBody(c, x);
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
  const tagHTML = (ch) => `<p class="cs-tag">${esc(titleCase(t(ch.label)))}</p>`;
  const paras = (list) => [].concat(list).map((x) => `<p>${esc(t(x))}</p>`).join('');
  // the page's blocks; style.css sets each on the page's grid where the owner's Figma puts it
  const BLOCKS = {
    intro: (b, ch) => {
      const title = `<h3 class="cs-title">${esc(t(b.title))}</h3>`, lede = b.text ? `<div class="cs-lede">${paras(b.text)}</div>` : '';
      // the solution's tag sits under its heading and its text beside the tag, so the two share a row of their own
      return b.under ? `<div class="cs-intro under">${title}<div class="cs-under">${tagHTML(ch)}${lede}</div></div>`
        : `<div class="cs-intro">${tagHTML(ch)}${title}${lede}</div>`;
    },
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
  // The player is a skin drawn after Windows Media Player 7: a caption plate, the chapter list and the LCD in a tray
  // beside the screen, and a deck with the chapter timeline, the transport keys and a text-size wedge.
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
    // the LCD stands in the tray over the tools; a phone's tray lists nothing, so its deck has the same LCD and
    // style.css shows one of the two
    const lcd = `<div class="lcd"><span class="lcd-clock" aria-hidden="true">${segClock()}</span><span class="lcd-text"><b class="lcd-title">${esc(p.title)}</b><span class="lcd-now" aria-live="polite"><span class="sr-only">${esc(u('nowReading'))}: </span><span class="lcd-sec">${esc(secs[0].label)}</span></span></span></div>`;
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
            ${lcd}
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
          ${lcd}
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
    if (DRAFTS && !document.hidden) draftScan(w.el);
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
    $$('.lcd-sec', w.el).forEach((lab) => { if (meta && lab.textContent !== meta.label) lab.textContent = meta.label; });
    $$('.lcd-clock', w.el).forEach((clock) => segSet(clock, fmtTime(prog * w.total)));
    const at = w.knots ? tlTrack(w.knots, prog) : prog;
    const fill = $('.tl-fill', w.el); if (fill) fill.style.width = pct(at);
    const seek = $('.seek', w.el); if (seek && document.activeElement !== seek) seek.value = Math.round(at * 1000);
    if (w.curSec !== id) { const b = $(`.skin-nav button[data-sec="${id}"]`, w.el); if (b) navShow(b); }
    w.curSec = id;
  }
  // the chapter being read comes into view when a short window cuts the tray's list off. Only the list scrolls, never
  // the desktop behind a window that hangs off the screen (a phone lists no chapters)
  function navShow(b) {
    const n = b.parentNode, nr = n.getBoundingClientRect(), r = b.getBoundingClientRect();
    const dy = r.top < nr.top ? r.top - nr.top : r.bottom > nr.bottom ? r.bottom - nr.bottom : 0;
    if (dy) n.scrollBy(0, dy);
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
    { key: 'cv', icon: 'resume', label: { en: 'Resume', id: 'CV' } },
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
          <select data-change="contact-cat">${CATS.map((c) => `<option value="${c.key}" ${c.key === cat.key ? 'selected' : ''}>${esc(t(c.label))}</option>`).join('')}</select><span class="dd" aria-hidden="true">${GLYPH.arrow}</span></label>
        <span class="nero-ctrl"><button class="q" data-act="open-about" aria-label="${esc(u('about'))}" title="${esc(u('about'))}">?</button><button data-wact="min" aria-label="${esc(u('minimize'))}" title="${esc(u('minimize'))}">${GLYPH.min}</button><button class="x" data-wact="close" aria-label="${esc(u('close'))}" title="${esc(u('close'))}">${GLYPH.close}</button></span>
      </div>
      <div class="nero-body">
        <div class="nero-cats" role="tablist" aria-label="${esc(u('contact'))}">${CATS.map((c) => `<button class="nero-cat" role="tab" id="nero-tab-${c.key}" aria-selected="${c.key === cat.key}" aria-controls="nero-panel" tabindex="${c.key === cat.key ? 0 : -1}" data-cat="${c.key}">${I(c.icon, 40)}<span>${esc(t(c.label))}</span></button>`).join('')}</div>
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
  const cvName = () => (hasCV() ? decodeURIComponent(cvHref().split(/[?#]/)[0].split('/').pop()) : `Resume_${PF.owner.first}_${PF.owner.last}.pdf`);
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
        s.src = 'game.js?v=34';
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
        s.src = 'pet.js?v=6';
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
      pet = P.create({ lang, fresh, onPlay: (from) => { track('door', 'br:pet'); openGame(from); }, onHide: hidePet });
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
      <p>${esc(u('gateSaverText'))}</p>
      <div class="btns"><button class="btn default" data-act="gate-saver">${esc(u('gateSaver'))}</button><button class="btn" data-wact="close">${esc(u('ok'))}</button></div>
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

  /* ------------------------------------------------------------ Screen Saver XP (the second game) */
  // A bullet hell against XP's own screensavers that plays on a phone as well as at a desk (GAME2_BRIEF.md). Its window
  // opens from the desktop's right-click menu (Properties), from the screensaver's offer once it wakes, from Boss Rush
  // XP's phone gate, from Start > Accessories, and at #/screensaver. screensaver.js is only fetched on first open, or
  // when the idle screensaver first runs.
  let saverScript = null;
  function loadSaver() {
    if (window.ScreenSaverXP) return Promise.resolve(window.ScreenSaverXP);
    if (!saverScript) {
      saverScript = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'screensaver.js?v=3';
        s.onload = () => resolve(window.ScreenSaverXP);
        s.onerror = () => { saverScript = null; s.remove(); reject(new Error('screensaver.js did not load')); };
        document.head.appendChild(s);
      });
    }
    return saverScript;
  }
  function openSaver(from, push = true) { openWin('screensaver', { from, push, pushHistory: push }); }
  // The window is a device, drawn after the owner's reference (2026-09-30): warm grey plastic, the screen on the left
  // (screensaver.js draws it) and a panel on the right with the window's keys, the game's mark, sound and start/pause,
  // and the game's name printed at its foot. In a narrow window the keys go under the screen (style.css).
  const SAVER_GLYPH = {
    sound: '<svg width="20" height="16" viewBox="0 0 20 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M1 5h3v6H1zM4 4h2v8H4zM6 2h2v12H6zM8 0h2v16H8zM12 5h2v6h-2zM15 2h2v2h-2zM17 4h2v8h-2zM15 12h2v2h-2z" fill="currentColor"/></svg>',
    mute: '<svg width="20" height="16" viewBox="0 0 20 16" shape-rendering="crispEdges" aria-hidden="true"><path d="M1 5h3v6H1zM4 4h2v8H4zM6 2h2v12H6zM8 0h2v16H8zM12 5h2v2h-2zM16 5h2v2h-2zM14 7h2v2h-2zM12 9h2v2h-2zM16 9h2v2h-2z" fill="currentColor"/></svg>',
    go: '<svg width="26" height="14" viewBox="0 0 26 14" shape-rendering="crispEdges" aria-hidden="true"><path d="M0 0h2v14H0zM2 1h2v12H2zM4 2h2v10H4zM6 3h2v8H6zM8 4h2v6H8zM10 5h2v4h-2zM16 0h3v14h-3zM22 0h3v14h-3z" fill="currentColor"/></svg>',
  };
  function buildSaver(w) {
    const cap = (wact, glyph, label) => `<button type="button" class="dev-cb" data-wact="${wact}" aria-label="${esc(label)}" title="${esc(label)}">${glyph}</button>`;
    const key = (act, cls, glyph, label, print, k) => `<span class="dev-kg"><button type="button" class="${cls}" data-act="${act}" aria-label="${esc(label)}" title="${esc(label)}">${glyph}</button><small aria-hidden="true">${esc(print)} <span>${k}</span></small></span>`;
    return `<div class="dev">
      <div class="dev-scr" data-saver></div>
      <div class="dev-panel">
        <div class="dev-top" data-drag><span class="dev-mark" aria-hidden="true">${I('moon', 24)}<i></i></span><span class="dev-caps">${cap('min', GLYPH.min, u('minimize'))}${cap('max', w.max ? GLYPH.restore : GLYPH.max, u('maximize'))}${cap('close', GLYPH.close, u('close'))}</span></div>
        <div class="dev-keys">${key('saver-sound', 'dev-k', SAVER_GLYPH.sound, u('saverSound'), u('saverSound'), 'M')}${key('saver-go', 'dev-go', SAVER_GLYPH.go, u('saverStart'), u('saverGo'), 'P')}</div>
        <div class="dev-bot"><span class="dev-print" aria-hidden="true">Screen Saver XP</span></div>
      </div>
    </div>`;
  }
  // the keys show what the game says they do now: the sound on or off, and what start/pause will do
  function saverKeys(w, k) {
    if (!k) return;
    const snd = $('.dev-k', w.el), gok = $('.dev-go', w.el);
    if (snd) { snd.innerHTML = k.muted ? SAVER_GLYPH.mute : SAVER_GLYPH.sound; snd.setAttribute('aria-pressed', String(!k.muted)); }
    if (gok) {
      const label = k.go === 'pause' ? u('saverPause') : k.go === 'resume' ? u('saverResume') : k.go === 'ok' && k.label ? k.label : u('saverStart');
      gok.setAttribute('aria-label', label); gok.title = label;
    }
  }
  // the game outlives re-renders (a language switch rebuilds the window body): its stage moves into the new body
  function afterSaver(w) {
    const host = $('[data-saver]', w.el);
    // a key pressed with the mouse or a finger leaves the focus in the game, so a fight doesn't pause for it
    $('.dev-keys', w.el).addEventListener('pointerdown', (e) => { if (e.target.closest('button')) e.preventDefault(); });
    if (w.game) { w.game.attach(host); w.game.setLang(lang); saverKeys(w, w.keysNow); return; }
    // a tall screen that isn't a phone's (a tablet held upright) plays the portrait stage in a maximised window
    if (!w.max && !isMobile() && desktopEl.clientHeight > desktopEl.clientWidth) toggleMax(w);
    host.innerHTML = `<p class="gm-note">${esc(u('saverLoading'))}</p>`;
    loadSaver().then((S) => {
      if (wins.get('screensaver') !== w || w.game) return;
      const h = $('[data-saver]', w.el);
      h.innerHTML = '';
      w.game = S.create({
        lang, owner: PF.owner.fullName, onContact: () => openWin('contact'), onWin: trailsWon,
        // Blank.scr beaten: the PC starts again, and the result waits until the Welcome screen has gone
        onReboot: (done) => { bootScreen.replay(); bootScreen.home(null); afterBoot(done); },
        onRun: (d) => track('run', `ss:${d}`),
        onKeys: (k) => { w.keysNow = k; saverKeys(w, k); },
        // a finger may start its drag anywhere on the device, not only on the screen
        touchArea: w.el,
      });
      w.game.attach(h);
      if (activeId === w.id) w.game.focus();
    }).catch(() => { const h = $('[data-saver]', w.el); if (h) h.innerHTML = `<p class="gm-note">${esc(u('saverFailed'))}</p>`; });
  }

  /* ---- the desktop's own right-click menu: Properties opens Screen Saver XP; Pointer trails, once won, switches them ---- */
  // Only the bare desktop opens it (not a window, an icon or the taskbar): a right-click, a long press on a touch
  // screen, or Shift+F10 or the Menu key while nothing else has the focus
  let deskMenu = null, pressT = 0, pressAt = null;
  const onDesk = (t) => !!(t && t.closest && t.closest('#desktop') && !t.closest('.win, .dicon'));
  function openDeskMenu(x, y) {
    closeMenu(); closeStart(); closeDeskMenu();
    const m = deskMenu = document.createElement('div');
    m.className = 'menu'; m.setAttribute('role', 'menu'); m.setAttribute('aria-label', u('desktop'));
    m.innerHTML = `<button role="menuitem" data-dm="props"><span class="mk"></span><span>${esc(u('properties'))}</span></button>`
      + (trailsState() ? `<div class="hr" role="separator"></div><button role="menuitemcheckbox" aria-checked="${trailsWanted}" data-dm="trails"><span class="mk">${trailsWanted ? GLYPH.bullet : ''}</span><span>${esc(u('saverTrails'))}</span></button>` : '');
    document.body.appendChild(m);
    m.style.left = clamp(x, 2, innerWidth - m.offsetWidth - 2) + 'px';
    m.style.top = clamp(y, 2, innerHeight - m.offsetHeight - 2) + 'px';
    m.addEventListener('click', (e) => {
      const b = e.target.closest('button');
      if (!b) return;
      const r = rectOf(m);
      closeDeskMenu();
      if (b.dataset.dm === 'trails') toggleTrails(); else { track('door', 'ss:display'); openSaver(r); }
    });
    m.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' || e.key === 'Tab') { e.preventDefault(); closeDeskMenu(); return; }
      const bs = $$('button', m), i = bs.indexOf(document.activeElement);
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); bs[(i + (e.key === 'ArrowDown' ? 1 : -1) + bs.length) % bs.length].focus(); }
    });
    $('button', m).focus({ preventScroll: true });
    document.addEventListener('pointerdown', deskMenuOutside, true);
  }
  function deskMenuOutside(e) { if (deskMenu && !deskMenu.contains(e.target)) closeDeskMenu(); }
  function closeDeskMenu() {
    if (!deskMenu) return;
    deskMenu.remove(); deskMenu = null;
    document.removeEventListener('pointerdown', deskMenuOutside, true);
  }
  desktopEl.addEventListener('contextmenu', (e) => {
    clearTimeout(pressT); pressAt = null;
    if (!onDesk(e.target)) return;
    e.preventDefault(); openDeskMenu(e.clientX, e.clientY);
  });
  desktopEl.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' || !onDesk(e.target)) return;
    pressAt = { x: e.clientX, y: e.clientY, id: e.pointerId };
    clearTimeout(pressT);
    pressT = setTimeout(() => { if (pressAt) openDeskMenu(pressAt.x, pressAt.y); pressAt = null; }, 550);
  });
  desktopEl.addEventListener('pointermove', (e) => {
    if (pressAt && e.pointerId === pressAt.id && Math.hypot(e.clientX - pressAt.x, e.clientY - pressAt.y) > 10) { clearTimeout(pressT); pressAt = null; }
  });
  ['pointerup', 'pointercancel'].forEach((k) => desktopEl.addEventListener(k, () => { clearTimeout(pressT); pressAt = null; }));
  // from the keyboard it opens in the middle of the desktop, and the browser's own menu, which the same key can bring
  // next, stays shut over it
  document.addEventListener('keydown', (e) => {
    if (e.defaultPrevented || !(e.key === 'ContextMenu' || (e.key === 'F10' && e.shiftKey))) return;
    const f = document.activeElement;
    if (f && f !== document.body && !onDesk(f)) return;
    e.preventDefault();
    const r = desktopEl.getBoundingClientRect();
    openDeskMenu(r.left + r.width / 2, r.top + r.height / 2);
  });
  document.addEventListener('contextmenu', (e) => { if (deskMenu && deskMenu.contains(e.target)) e.preventDefault(); });

  /* ---- the screensaver: XP's Starfield after the desktop has sat still, twice a visit at most ---- */
  // Only on a desktop-sized screen with a mouse or trackpad (the stickman's test in pet.js), never under reduced motion:
  // after 20 s without input, with windows open or not (the owner's call, 2026-09-29).
  const roomy = matchMedia('(min-width: 721px) and (any-pointer: fine)');
  const IDLE_WAIT = 20000, IDLE_MAX = 2;
  // read every second, so it comes within a second of the wait
  let idleTick = 0, idleRuns = 0, idleLast = performance.now(), saverUp = null;
  function idleArm() {
    clearInterval(idleTick); idleTick = 0;
    if (reduceMotion || idleRuns >= IDLE_MAX || saverUp || !roomy.matches) return;
    idleTick = setInterval(idleCheck, 1000);
  }
  function idleCheck() {
    if (performance.now() - idleLast < IDLE_WAIT || idleBlocked()) return;
    clearInterval(idleTick); idleTick = 0;
    idleRuns += 1;
    loadSaver().then((S) => {
      if (saverUp || idleBlocked()) { idleRuns -= 1; idleArm(); return; }
      if (PF.wall3d) PF.wall3d.pause();
      saverUp = S.idle({ onWake: idleWake });
      track('hint', 'idle');
    }).catch(() => { idleArm(); });
  }
  function idleBlocked() {
    const a = document.activeElement;
    return document.hidden || !document.hasFocus() || document.documentElement.classList.contains('booting') || !!$('.shutdown-screen')
      || !!(a && a.closest && a.closest('input, textarea, select, [contenteditable]'))
      || !startMenu.hidden || !!menuState || !!deskMenu || !!noteNow || !!$('.pet-note')
      || Array.from(wins.values()).some((x) => x.def.dialog || (!x.min && (x.id === 'game' || x.id === 'screensaver')) || (x.id === 'viewer' && x.showTimer));
  }
  function idleWake() {
    saverUp = null; idleLast = performance.now();
    if (PF.wall3d) PF.wall3d.play();
    // the offer follows every screensaver, for players too (the owner's call, 2026-09-29)
    showNote('offer');
    idleArm();
  }
  // any input starts the wait again
  const idleInput = () => { if (!saverUp) idleLast = performance.now(); };
  ['pointermove', 'pointerdown', 'keydown', 'wheel', 'touchstart', 'scroll'].forEach((k) => window.addEventListener(k, idleInput, { capture: true, passive: true }));
  document.addEventListener('visibilitychange', idleArm);
  roomy.addEventListener('change', idleArm);

  /* ---- the tray's balloons: the Recycle Bin hint and the screensaver's offer, never both at once ---- */
  // an XP balloon over the tray: its body is one button, beside its close box; it goes by itself after 12 s
  let noteNow = null;
  function showNote(kind) {
    // one balloon at a time, the stickman's and the trails' install notes included
    if (noteNow || $('.pet-note')) return false;
    const [title, text, icon] = kind === 'bin' ? [u('binHint'), u('binHintText'), 'recycle'] : [u('saverOffer'), u('saverOfferText'), 'moon'];
    const n = noteNow = document.createElement('div');
    n.className = 'pet-note tray-note'; n.setAttribute('role', 'status');
    n.innerHTML = `<button type="button" class="pet-x" aria-label="${esc(u('close'))}"></button><button type="button" class="note-go"><b>${I(icon, 16)}${esc(title)}</b><span>${esc(text)}</span></button>`;
    document.body.appendChild(n);
    const drop = () => { clearTimeout(n.timer); n.remove(); if (noteNow === n) noteNow = null; };
    n.querySelector('.pet-x').addEventListener('click', drop);
    n.querySelector('.note-go').addEventListener('click', () => {
      const r = rectOf(n); drop();
      if (kind === 'bin') openBinHint(r); else { track('door', 'ss:idle'); openSaver(r); }
    });
    n.timer = setTimeout(drop, 12000);
    track('hint', kind === 'bin' ? 'bin' : 'offer');
    return true;
  }
  // Boss Rush XP's way in stays the Recycle Bin, but nobody was clicking it: this balloon points there, once per browser,
  // for a visitor who hasn't opened the game, after two windows or 90 seconds on the site (GAME2_BRIEF.md). Clicked, the
  // Recycle Bin opens with jangan-dibuka.exe selected
  const HINT_KEY = 'brxp-hint';
  let hintT = 0, hintWins = 0;
  const brxpSeen = () => { try { return Object.keys(localStorage).some((k) => k.startsWith('brxp-')); } catch (e) { return true; } };
  function hintTry() {
    clearTimeout(hintT);
    if (brxpSeen() || wins.has('game') || wins.has('gamegate')) return;
    if (wins.has('recycle')) { try { localStorage.setItem(HINT_KEY, '1'); } catch (e) { /* it may show next visit */ } return; }
    // it waits while anything else is up, and while a game is being played
    if (noteNow || saverUp || $('.pet-note') || !startMenu.hidden || menuState || deskMenu || Array.from(wins.values()).some((x) => x.def.dialog || (!x.min && (x.id === 'game' || x.id === 'screensaver')))) { hintT = setTimeout(hintTry, 5000); return; }
    if (showNote('bin')) { try { localStorage.setItem(HINT_KEY, '1'); } catch (e) { /* it may show again next visit */ } }
  }
  function openBinHint(from) {
    const w = openWin('recycle', { from });
    // the exe run from here is the balloon's door, not the Recycle Bin's own
    w.fromHint = true;
    // once the zoom has put the window on screen, the exe takes the focus, which is how the list shows it selected
    const pick = (n) => {
      if (w.el.style.visibility === 'hidden' && n < 50) { setTimeout(() => pick(n + 1), 40); return; }
      const b = $('.bin-run', w.el); if (b) b.focus({ preventScroll: true });
    };
    setTimeout(() => pick(0), 40);
  }

  /* ---- pointer trails: the reward for beating Screen Saver XP ---- */
  // 'on' from the first full win, 'off' once the visitor switches them off (the game's menu, or its Settings on a phone);
  // trails.js is only fetched once they have been earned, and they never run under reduced motion
  const TRAILS_KEY = 'ssxp-trails';
  const trailsState = () => { try { return localStorage.getItem(TRAILS_KEY); } catch (e) { return null; } };
  const setTrailsState = (v) => { try { localStorage.setItem(TRAILS_KEY, v); } catch (e) { /* storage off: they stay for this visit */ } };
  let trails = null, trailsScript = null, trailsWanted = false;
  function loadTrails() {
    if (window.PointerTrails) return Promise.resolve(window.PointerTrails);
    if (!trailsScript) {
      trailsScript = new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = 'trails.js?v=3';
        s.onload = () => resolve(window.PointerTrails);
        s.onerror = () => { trailsScript = null; s.remove(); reject(new Error('trails.js did not load')); };
        document.head.appendChild(s);
      });
    }
    return trailsScript;
  }
  function showTrails(fresh) {
    trailsWanted = true;
    if (trails || reduceMotion) return;
    loadTrails().then((T) => {
      if (trails || !trailsWanted) return;
      trails = T.create({ lang, fresh });
    }).catch(() => { /* no trails this visit */ });
  }
  function hideTrails() {
    trailsWanted = false; setTrailsState('off');
    if (trails) { trails.destroy(); trails = null; }
  }
  function toggleTrails() { if (trailsWanted) hideTrails(); else { setTrailsState('on'); showTrails(false); } }
  // the game calls this when a full run is won: the first win installs them ('new'); after that it says how they stand.
  // On a small screen the tray's note would cover the win screen, so it waits until the game's window closes or goes
  // down to the taskbar (trailsNoteNow)
  let trailsNote = false;
  function trailsWon() {
    const st = trailsState();
    if (st === 'on' || st === 'off') return st;
    trailsNote = isMobile();
    setTrailsState('on'); showTrails(!trailsNote);
    return reduceMotion ? 'on' : 'new';
  }
  function trailsNoteNow() {
    if (!trailsNote) return;
    trailsNote = false;
    if (trails && trails.notify) trails.notify();
  }

  /* ------------------------------------------------------------ actions */
  const winOf = (el) => { const n = el.closest('.win'); return n ? wins.get(n.dataset.id) : null; };
  const ACTIONS = {
    'open-work': (a) => openWin('work', { from: rectOf(a), pushHistory: true }),
    'gate-saver': (a, w) => { const r = rectOf(a); if (w) closeWin(w); track('door', 'ss:gate'); openSaver(r); },
    'saver-sound': (a, w) => { if (w && w.game) { w.game.toggleSound(); w.game.focus(); } },
    'saver-go': (a, w) => { if (w && w.game) { w.game.primary(); w.game.focus(); } },
    'open-about': (a) => openWin('about', { from: rectOf(a), pushHistory: true }),
    'home-about': (a) => openWin('about', { from: rectOf(a), pushHistory: true }),
    'home-start': (a, w) => {
      track('start');
      const f = w && $('.hm-mail', w.el); if (!f) return;
      f.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      const m = $('#hm-msg', f); if (m) m.focus({ preventScroll: true });
    },
    'mail-bal-x': (a) => { const b = a.closest('.mail-bal'); if (b) b.remove(); },
    // the balloon's fix for a slip in the address: it takes the field's place, and Send is next
    'home-fix': (a, w) => {
      const f = w && $('.hm-mail', w.el), field = f && $('#hm-from', f); if (!field) return;
      field.value = w.state.from = a.dataset.to;
      field.removeAttribute('aria-invalid');
      a.closest('.mail-bal').remove();
      $('button[type="submit"]', f).focus();
    },
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
    // the remote's keys switch episodes where they are
    'home-ep': (a, w) => {
      if (!w) return;
      homeEpisode(w, +a.dataset.i, true);
    },
    'home-ep-step': (a, w) => { if (w) { homeEpisode(w, w.state.ep + (+a.dataset.d)); a.focus({ preventScroll: true }); } },
    'home-svc': (a, w) => homeService(w, +a.dataset.i),
    'home-faq': (a, w) => homeFaq(w, +a.dataset.i),
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
    'open-game': (a, w) => { track('door', w && w.fromHint ? 'br:balloon' : 'br:bin'); openGame(rectOf(a)); },
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
      else if (k === 'brxp') { track('door', 'br:menu'); openGame(from); }
      else if (k === 'ssxp') { track('door', 'ss:menu'); openSaver(from); }
      else if (k === 'lang') setLang(sm.dataset.lang);
      else if (k === 'shutdown' || k === 'credits') openWin(k, { from });
      else openWin(k, { from, pushHistory: true });
      return;
    }
    const sub = e.target.closest('[data-sub]');
    if (sub) {
      const li = sub.closest('li');
      // pointing at a submenu has already opened it, and a tap is a pointing and a click at once, so a click from a
      // mouse or a finger opens it and leaves it open; Enter and Space (a click with no pointer) still open and close it
      if (e.detail) { $$('.has-sub.open', startMenu).forEach((x) => { if (x !== li) x.classList.remove('open'); }); li.classList.add('open'); }
      else li.classList.toggle('open');
      return;
    }
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
  document.addEventListener('animationend', (e) => {
    const c = e.target.classList; if (!c) return;
    if (c.contains('pe-screen')) c.remove('flick');
    else if (c.contains('pe-osd')) e.target.remove();
    else c.remove('hit', 'nudge');
  });
  // a required field left empty shakes its head as the browser points at it (home.css, .nudge)
  document.addEventListener('invalid', (e) => {
    const f = e.target; if (reduceMotion || !f.closest || !f.closest('.hm-mail')) return;
    f.classList.remove('nudge'); void f.offsetWidth; f.classList.add('nudge');
  }, true);
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
    if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable], .gm-stage, .ss-host')) return;
    konamiKeys.push((e.key || '').toLowerCase());
    if (konamiKeys.length > 10) konamiKeys.shift();
    if (konamiKeys.join(',') === KONAMI) { konamiKeys.length = 0; track('door', 'br:konami'); openGame(null); }
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
      if (e.target.closest('.pt-remote')) { const w = winOf(e.target); if (w) { e.preventDefault(); homeEpisode(w, w.state.ep + d, true); const k = $(d < 0 ? '.rm-prev' : '.rm-go', w.el); keyHit(k && k.offsetParent ? k : $('.rm-num[aria-pressed="true"]', w.el)); } return; }
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
    else if (e.target.id === 'hm-from') {
      w.state.from = e.target.value;
      // a new address answers the balloon about the old one
      e.target.removeAttribute('aria-invalid');
      const bal = $('.mail-bal[data-kind="fix"], .mail-bal[data-kind="bad"]', w.el); if (bal) bal.remove();
    }
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
    if (trails) trails.setLang(l);
    if (noteNow) { clearTimeout(noteNow.timer); noteNow.remove(); noteNow = null; }
    closeDeskMenu();
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
    if (a === 'screensaver') return { id: 'screensaver' };
    return null;
  }
  function applyRoute(r) {
    if (!r) return;
    if (r.id === 'player') openCase(r.slug, null, false);
    else if (r.id === 'game') openGame(null, false);
    else if (r.id === 'screensaver') openSaver(null, false);
    else openWin(r.id, { push: false });
  }
  // Only Home opens at startup (unless the visitor unticked "Show this screen…"); a shared link opens its window on top of it.
  function openDefault() {
    const r = parseHash();
    const home = homeAtStartup() || (r && r.id === 'home') ? openWin('home', { push: false }) : null;
    // a cover Home held for the loading screen and already in the window's view is fetched now, so the screen waits
    // for it; the rest follow once the screen has gone
    if (home) freeHeld(home.el, true);
    bootScreen.home(home && home.el);
    if (r && r.id !== 'home') applyRoute(r);
    // the desktop sat out of reach under the welcome screen: the front window takes the focus once it has gone
    afterBoot(() => { freeHeld(layer); const w = topVisible(); if (w) focusWin(w, true); });
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
  { const r = parseHash(); if (r && (r.id === 'game' || r.id === 'screensaver')) track('door', r.id === 'game' ? 'br:link' : 'ss:link'); }
  openDefault();
  if (petState() === 'on') showPet(false);
  if (trailsState() === 'on') showTrails(false);
  // once the Welcome screen has gone: the screensaver's wait starts, and the Recycle Bin's hint comes after 90 seconds, or
  // sooner once two windows have been opened
  afterBoot(() => {
    idleArm();
    hintT = setTimeout(hintTry, 90000);
    new MutationObserver((ms) => {
      for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('win') && !n.classList.contains('dialog') && ++hintWins === 2) setTimeout(hintTry, 1500);
    }).observe(layer, { childList: true });
  });
})();
