/*
  Case study pages, bilingual (en / id), keyed by a case's slug in PF.projects (content.js). Each page follows the
  owner's page for that case in Figma (file "Work area iqbal"), section by section, and the Case Study Player plays
  its sections as chapters; Serenity SPA has only its design, so its page is read from that. A case without a page
  here plays its overview only.
  A case with screens instead of chapters is a programme page (app.js, progSections): the owner's way from
  2026-10-15, pictures first and few words, on the broadcast stage of Home's Tonight's features. about is two or three
  sentences, facts the known facts (type, role, year, scope; null until the owner gives it), palette its colours (hex,
  and the part each plays; its signature colour first) and type its typefaces, then screens the pictures in
  order, one a row or several side by side.

  Pictures are the owner's plain UI screenshots, no device around them: each sits on a CRT monitor (frame 'crt',
  4:3) or in an XP window of the app ('win', a 'tool' window or a 'dialog', titled by title). The design focus's
  picture is the exception ('bare'): the owner's device shot on a transparent ground, with no frame, running edge to
  edge across its section and flush with its foot. Its slot is the part the Figma shows at 1029 (the Feature Section
  and the 40px under it, 1029 by 580). They go in
  asset/Work/<slug>/ under each slot's file name; until a slot has a src, the player shows a grey slot tagged with
  that file name and the size to export. On a local preview it already shows the owner's export saved there under
  that name (.png or .jpg, with or without Figma's @2x), so each screen is checked in place before its web copies
  are made and src is set. node is the Figma frame the screen comes from.
*/
(function () {
  const PF = (window.PF = window.PF || {});
  const pic = (frame, title, file, w, h, node, alt) => ({ frame, title, file, w, h, node, alt, src: null });
  const crt = (file, node, alt) => pic('crt', null, file, 1024, 768, node, alt);
  const win = (title, file, node, alt) => pic('win', title, file, 1440, 900, node, alt);
  const bare = (file, node, alt) => pic('bare', null, file, 1029, 580, node, alt);

  PF.cases = {
    // Figma file "Krool - CRM Dashboard" (L1c3sNmg11MZQnqMRGVPYR, page Design, 20001:2781), told as a programme page
    // (owner's choice, 2026-10-15): the case's own title and tags (content.js), a short About and the facts known so
    // far, its colours, then its screens, each a feed with its caption. A fact still null waits for the owner: a local
    // preview marks it, the site leaves it out. Every screen is a frame of the Krool file, exported at 2x; no device
    // mockups (owner's call, 2026-10-15)
    krool: {
      dir: 'asset/Work/krool',
      about: {
        en: 'KROOL is a design study for a multi-channel CRM. It brings customer conversations, lead information, and team activity into one workspace, across a dashboard, inbox, sales pipeline, calendar, analytics, and automations, with an AI assistant at hand on every screen.',
        id: 'KROOL adalah studi desain CRM multikanal. Konsep ini menyatukan percakapan pelanggan, informasi prospek, dan aktivitas tim dalam satu ruang kerja, mulai dari dashboard, kotak masuk, pipeline penjualan, kalender, analitik, hingga otomasi, dengan asisten AI yang siap dipakai di setiap layar.',
      },
      facts: {
        type: { en: 'Design study', id: 'Studi desain' },
        role: { en: 'UI/UX and creative direction', id: 'UI/UX dan creative direction' },
        year: '2025',
        scope: { en: 'Dashboard, inbox, pipeline, calendar, analytics, automation, AI assistant', id: 'Dashboard, kotak masuk, pipeline, kalender, analitik, otomasi, asisten AI' },
      },
      // its colours and typefaces as the Krool file sets them (read from its Dashboard, Analytics, Pipeline and
      // Automation frames, 2026-10-15): the most-used fills and text colours, and the faces of its text and its logo
      palette: [
        { hex: '#FF6600', role: { en: 'Accent', id: 'Aksen' } },
        { hex: '#1A1A1A', role: { en: 'Text', id: 'Teks' } },
        { hex: '#667085', role: { en: 'Secondary text', id: 'Teks sekunder' } },
        { hex: '#F5F3EF', role: { en: 'Background', id: 'Latar' } },
        { hex: '#FFFFFF', role: { en: 'Cards', id: 'Kartu' } },
        { hex: '#8070CF', role: { en: 'Chart', id: 'Grafik' } },
        { hex: '#8FD14F', role: { en: 'Chart', id: 'Grafik' } },
        { hex: '#58A6FB', role: { en: 'Chart', id: 'Grafik' } },
      ],
      type: [{ name: 'Pretendard', role: { en: 'Interface', id: 'Antarmuka' } }, { name: 'JetBrains Mono', role: { en: 'Logo', id: 'Logo' } }],
      // one screen a row, or several side by side (an array); name gives the screen its file name over it. Big screens
      // only, nothing laid over them (owner's calls, 2026-10-15)
      screens: [
        {
          name: { en: 'Dashboard', id: 'Dasbor' },
          pic: pic('win', 'KROOL - Dashboard', '13-dashboard', 1440, 1072, '22105:507', {
            en: 'KROOL’s dashboard: conversation numbers, lead activity by region and the team’s tasks, beside the AI assistant’s panel',
            id: 'Dasbor KROOL: angka percakapan, aktivitas prospek per wilayah, dan tugas tim, di samping panel asisten AI',
          }),
        },
        {
          name: { en: 'Inbox', id: 'Kotak masuk' },
          pic: pic('win', 'KROOL - Inbox', '14-inbox', 1440, 900, '22132:2135', {
            en: 'KROOL’s inbox: the conversation list beside an open chat with a lead, with Summarize and AI Draft under it',
            id: 'Kotak masuk KROOL: daftar percakapan di samping chat yang terbuka dengan seorang prospek, dengan tombol Summarize dan AI Draft di bawahnya',
          }),
        },
        {
          name: { en: 'Contact details', id: 'Detail kontak' },
          pic: pic('win', 'KROOL - Inbox', '20-contact-details', 1440, 900, '22350:5404', {
            en: 'KROOL’s inbox with a lead’s contact details, tags, linked deal, stage and task beside the chat',
            id: 'Kotak masuk KROOL dengan detail kontak prospek, tag, deal terkait, tahapan, dan tugas di samping chat',
          }),
        },
        {
          name: { en: 'Pipeline', id: 'Pipeline' },
          pic: pic('win', 'KROOL - Pipeline', '15-pipeline', 1440, 900, '22151:981', {
            en: 'KROOL’s pipeline: leads as scored cards across New, Contacted, Demo Booked, Negotiation and Closed Won',
            id: 'Pipeline KROOL: prospek sebagai kartu bernilai skor di kolom New, Contacted, Demo Booked, Negotiation, dan Closed Won',
          }),
        },
        {
          name: { en: 'Calendar', id: 'Kalender' },
          pic: pic('win', 'KROOL - Calendar', '16-calendar', 1440, 900, '22350:4834', {
            en: 'KROOL’s calendar: a month of follow-ups and tasks, one open on a lead',
            id: 'Kalender KROOL: tindak lanjut dan tugas selama satu bulan, salah satunya terbuka untuk seorang prospek',
          }),
        },
        {
          name: { en: 'Analytics', id: 'Analitik' },
          pic: pic('win', 'KROOL - Analytics', '17-analytics', 1440, 900, '22350:6350', {
            en: 'KROOL’s analytics: pipeline conversion, volume per channel, a lead heatmap and revenue by lead source',
            id: 'Analitik KROOL: konversi pipeline, volume per kanal, lead heatmap, dan pendapatan per sumber prospek',
          }),
        },
        {
          name: { en: 'Automation', id: 'Otomasi' },
          pic: pic('win', 'KROOL - Automation', '18-automation', 1440, 900, '22136:2236', {
            en: 'KROOL’s automation builder: conditions on channel, time, tag and the AI’s confidence and sentiment, branching into actions',
            id: 'Pembuat otomasi KROOL: kondisi berdasarkan kanal, waktu, tag, serta keyakinan dan sentimen AI, yang bercabang ke tindakan',
          }),
        },
        {
          name: { en: 'AI assistant', id: 'Asisten AI' },
          pic: pic('win', 'KROOL - AI assistant', '19-ai-find-leads', 1440, 900, '22191:1406', {
            en: 'KROOL’s AI assistant answering Find leads from Australia with a table of leads, their channels and stages',
            id: 'Asisten AI KROOL menjawab Find leads from Australia dengan tabel prospek, kanal, dan tahapannya',
          }),
        },
      ],
    },
    // Figma file "Sensorstock.ai" (o6kneYuABLITrPvlHJjLWP), the website the owner redesigned (design only): twelve pages on
    // desktop (page HiFi, 2058:34) and mobile. Every screen is a desktop page of it, the home page whole among them; no
    // phones and no device mockups (owner's calls, 2026-10-15)
    sensorstack: {
      dir: 'asset/Work/sensorstack',
      about: {
        en: 'SensorStack offers wireless IoT sensors and a dashboard for monitoring equipment, energy use, and conditions such as temperature and humidity. I redesigned its website between March and May 2025, from greyscale wireframes to twelve pages in desktop and mobile versions, with a page for each industry it serves. The site is live at sensorstack.ai.',
        id: 'SensorStack menawarkan sensor IoT nirkabel dan dashboard untuk memantau peralatan, pemakaian energi, serta kondisi seperti suhu dan kelembapan. Saya mendesain ulang websitenya antara Maret dan Mei 2025, dari wireframe abu-abu hingga dua belas halaman dalam versi desktop dan mobile, dengan halaman tersendiri untuk tiap industri yang dilayani. Website ini sudah bisa dikunjungi di sensorstack.ai.',
      },
      facts: {
        type: { en: 'Client website redesign', id: 'Desain ulang website klien' },
        role: null,
        year: '2025',
        scope: { en: '12 pages, desktop and mobile, from wireframes', id: '12 halaman, desktop dan mobile, dari wireframe' },
      },
      // its colours and typefaces as the Sensorstock.ai file sets them (read from its Home, Facilities, Operation
      // Efficiency and Contact pages, 2026-10-15): Inter for headings and text, Overused Grotesk for the navigation,
      // buttons and form labels
      palette: [
        { hex: '#4E55DB', role: { en: 'Accent', id: 'Aksen' } },
        { hex: '#021720', role: { en: 'Navigation', id: 'Navigasi' } },
        { hex: '#000000', role: { en: 'Headings', id: 'Judul' } },
        { hex: '#77707E', role: { en: 'Secondary text', id: 'Teks sekunder' } },
        { hex: '#DB4310', role: { en: 'Alerts', id: 'Peringatan' } },
        { hex: '#F4F3FF', role: { en: 'Highlight', id: 'Sorotan' } },
        { hex: '#F5F6F8', role: { en: 'Sections', id: 'Section' } },
        { hex: '#FFFFFF', role: { en: 'Background', id: 'Latar' } },
      ],
      type: [{ name: 'Inter', role: { en: 'Headings and text', id: 'Judul dan teks' } }, { name: 'Overused Grotesk', role: { en: 'Navigation and buttons', id: 'Navigasi dan tombol' } }],
      screens: [
        {
          // the whole home page, scrolled through in a screen's frame (scroll), exported at 2x and kept to 2200px wide
          name: { en: 'Home, the whole page', id: 'Beranda, satu halaman penuh' },
          scroll: true,
          pic: pic('win', 'SensorStack - Home', '16-home-full', 1440, 7723, '20488:403', {
            en: 'SensorStack’s whole home page: Smart Monitoring Made Simple, the dashboard, the industries, the platform’s features, customer results and the demo request',
            id: 'Seluruh halaman beranda SensorStack: Smart Monitoring Made Simple, dashboard, daftar industri, fitur platform, hasil pelanggan, dan permintaan demo',
          }),
        },
        {
          name: { en: 'Facilities management', id: 'Pengelolaan fasilitas' },
          pic: pic('win', 'SensorStack - Facilities Management', '07-industry-problems', 1440, 765, '20488:1730', {
            en: 'The Hidden Challenges in Facility Management: a photo of rooftop ductwork with a card for the money wasted each year, beside three problems, the first one open',
            id: 'The Hidden Challenges in Facility Management: foto saluran udara di atap dengan kartu biaya yang terbuang setiap tahun, di samping tiga masalah, yang pertama terbuka',
          }),
        },
        {
          name: { en: 'Smart waste management', id: 'Pengelolaan sampah pintar' },
          pic: pic('win', 'SensorStack - Smart Waste Management', '08-solution-hero', 1440, 1255, '20488:2436', {
            en: 'Smart Waste Management for a Greener Future: the headline and Schedule a Demo above a photo of an overflowing waste container with an operational cost card',
            id: 'Smart Waste Management for a Greener Future: judul dan tombol Schedule a Demo di atas foto kontainer sampah yang penuh, dengan kartu biaya operasional',
          }),
        },
        {
          name: { en: 'Case studies', id: 'Studi kasus' },
          pic: pic('win', 'SensorStack - Case Studies', '09-case-studies', 1440, 942, '20488:3136', {
            en: 'Case Studies: two customer stories as photo cards, from food and beverage manufacturing and from residential real estate',
            id: 'Case Studies: dua kisah pelanggan dalam kartu berfoto, dari manufaktur makanan dan minuman serta properti hunian',
          }),
        },
        {
          name: { en: 'Integrations', id: 'Integrasi' },
          pic: pic('win', 'SensorStack - Integrations', '10-integrations', 1440, 619, '20488:4268', {
            en: 'Industry-Standard Protocols for Effortless Integration: the Modbus, BACnet and LonWorks logos in three tiles',
            id: 'Industry-Standard Protocols for Effortless Integration: logo Modbus, BACnet, dan LonWorks dalam tiga kotak',
          }),
        },
        {
          name: { en: 'Careers', id: 'Karier' },
          pic: pic('win', 'SensorStack - Careers', '11-careers', 1440, 921, '20488:4756', {
            en: 'Available Positions: team filters above four roles, each with its location, work time and Apply Job',
            id: 'Available Positions: filter tim di atas empat posisi, masing-masing dengan lokasi, waktu kerja, dan tombol Apply Job',
          }),
        },
        {
          name: { en: 'Contact', id: 'Kontak' },
          pic: pic('win', 'SensorStack - Contact', '12-contact', 1440, 1296, '20488:4388', {
            en: 'Get in Touch with SensorStack: the message form beside the support email, phone number and website address',
            id: 'Get in Touch with SensorStack: formulir pesan di samping email dukungan, nomor telepon, dan alamat website',
          }),
        },
      ],
    },
    // Figma "Work area iqbal", FINDMENTOR's frames (577:…). A programme page since 2026-10-15: its big screens only, so the
    // Figma file "FindMentor" (2zIhf6Kgua4RF9BFkTKb8e, page Design, 20:7): the mentee's side, then the mentor's. Every
    // screen is a frame of it, exported at 2x; no device mockups (owner's call, 2026-10-15)
    findmentor: {
      dir: 'asset/Work/findmentor',
      about: {
        en: 'FindMentor is a mentorship interface that brings mentor discovery, scheduled sessions, and learning tasks into one place. The design covers separate dashboards for mentors and mentees, with views for exploring mentors, booking sessions, reviewing assignments, and tracking progress.',
        id: 'FindMentor adalah desain antarmuka mentoring yang menyatukan pencarian mentor, jadwal sesi, dan tugas belajar dalam satu tempat. Desainnya mencakup dasbor terpisah untuk mentor dan mentee, dengan tampilan untuk mencari mentor, memesan sesi, meninjau tugas, dan memantau progres.',
      },
      facts: {
        type: { en: 'Interface design', id: 'Desain antarmuka' },
        role: null,
        year: null,
        scope: { en: 'Mentee and mentor dashboards, mentor search, booking, assignments, messages', id: 'Dasbor mentee dan mentor, pencarian mentor, pemesanan sesi, tugas, pesan' },
      },
      // its colours and typeface as the FindMentor file sets them (read from its Dashboard, Explore, Assignment and
      // mentor frames, 2026-10-15)
      palette: [
        { hex: '#004D43', role: { en: 'Primary', id: 'Utama' } },
        { hex: '#E2FC63', role: { en: 'Highlight', id: 'Sorotan' } },
        { hex: '#27EAA6', role: { en: 'Accent', id: 'Aksen' } },
        { hex: '#8F93FF', role: { en: 'Chart', id: 'Grafik' } },
        { hex: '#1A1A1A', role: { en: 'Text', id: 'Teks' } },
        { hex: '#475467', role: { en: 'Secondary text', id: 'Teks sekunder' } },
        { hex: '#F2F4F7', role: { en: 'Background', id: 'Latar' } },
        { hex: '#FFFFFF', role: { en: 'Cards', id: 'Kartu' } },
      ],
      type: [{ name: 'Poppins', role: { en: 'Headings and text', id: 'Judul dan teks' } }],
      screens: [
        {
          name: { en: 'Mentee dashboard', id: 'Dasbor mentee' },
          pic: pic('win', 'FindMentor - Dashboard', '13-dashboard', 1440, 1024, '2330:4278', {
            en: 'The mentee’s dashboard: assignments in progress, upcoming sessions, recommended mentors and recent activity',
            id: 'Dasbor mentee: tugas yang sedang berjalan, sesi mendatang, mentor yang disarankan, dan aktivitas terbaru',
          }),
        },
        {
          name: { en: 'Find a mentor', id: 'Cari mentor' },
          pic: pic('win', 'FindMentor - Explore', '14-explore', 1440, 1024, '2345:9615', {
            en: 'Find Your Perfect Mentor: mentor cards by category, each with a rating, role, experience and mentees',
            id: 'Find Your Perfect Mentor: kartu mentor per kategori, masing-masing dengan rating, peran, pengalaman, dan jumlah mentee',
          }),
        },
        {
          name: { en: 'Mentor details', id: 'Detail mentor' },
          pic: pic('win', 'FindMentor - Explore', '15-mentor-detail', 1440, 1024, '2349:1140', {
            en: 'A mentor’s details over the list: expertise, description, experience and Book Mentor',
            id: 'Detail mentor di atas daftar: keahlian, deskripsi, pengalaman, dan tombol Book Mentor',
          }),
        },
        {
          name: { en: 'My mentors', id: 'Mentor saya' },
          pic: pic('win', 'FindMentor - My Mentors', '16-my-mentors', 1440, 1024, '2363:3573', {
            en: 'My Mentors: the mentee’s mentors as cards above recommended mentors',
            id: 'My Mentors: mentor milik mentee sebagai kartu di atas mentor yang disarankan',
          }),
        },
        {
          name: { en: 'Mentor profile', id: 'Profil mentor' },
          pic: pic('win', 'FindMentor - My Mentors', '17-mentor-profile', 1440, 1616, '2363:4093', {
            en: 'A mentor’s profile: overview, expertise, experience and reviews beside the session booking',
            id: 'Profil mentor: ringkasan, keahlian, pengalaman, dan ulasan di samping pemesanan sesi',
          }),
        },
        {
          name: { en: 'Assignments', id: 'Tugas' },
          pic: pic('win', 'FindMentor - Assignment', '18-assignments', 1440, 1024, '2378:9822', {
            en: 'Assignments: the open ones with their progress above the completed ones',
            id: 'Tugas: yang masih berjalan beserta progresnya di atas yang sudah selesai',
          }),
        },
        {
          name: { en: 'Assignment details', id: 'Detail tugas' },
          pic: pic('win', 'FindMentor - Assignment', '19-assignment-detail', 1440, 1091, '2381:11463', {
            en: 'An assignment opened: its brief, task list and resources, with Upload File and Mark as Done',
            id: 'Tugas yang dibuka: ringkasan, daftar tugas, dan bahan, dengan tombol Upload File dan Mark as Done',
          }),
        },
        {
          name: { en: 'Messages', id: 'Pesan' },
          pic: pic('win', 'FindMentor - Messages', '20-messages', 1440, 1024, '2381:12389', {
            en: 'Messages: conversations beside a chat with a mentor, an assignment pinned at its top',
            id: 'Pesan: daftar percakapan di samping chat dengan mentor, dengan tugas yang disematkan di atasnya',
          }),
        },
        {
          name: { en: 'Mentor dashboard', id: 'Dasbor mentor' },
          pic: pic('win', 'FindMentor - Dashboard', '21-mentor-dashboard', 1440, 1024, '2399:3565', {
            en: 'The mentor’s dashboard: sessions, rating and hours, mentoring statistics, the week’s schedule and mentee insights',
            id: 'Dasbor mentor: sesi, rating, jam mentoring, statistik, jadwal minggu ini, dan insight mentee',
          }),
        },
        {
          name: { en: 'My mentees', id: 'Mentee saya' },
          pic: pic('win', 'FindMentor - Mentee', '22-my-mentees', 1440, 1024, '2499:10015', {
            en: 'My Mentees: recent activity, all mentees and invitation requests',
            id: 'My Mentees: aktivitas terbaru, semua mentee, dan permintaan undangan',
          }),
        },
        {
          name: { en: 'Mentee details', id: 'Detail mentee' },
          pic: pic('win', 'FindMentor - Mentee', '23-mentee-detail', 1440, 1024, '2419:7553', {
            en: 'A mentee’s page for the mentor: overview, interests, assignments and session attendance',
            id: 'Halaman mentee untuk mentor: ringkasan, minat, tugas, dan kehadiran sesi',
          }),
        },
        {
          name: { en: 'Mentor public profile', id: 'Profil publik mentor' },
          pic: pic('win', 'FindMentor - Profile', '24-mentor-public-profile', 1440, 1545, '2499:17234', {
            en: 'The mentor’s own profile: sessions, rating and hours, description, expertise, experience and reviews',
            id: 'Profil milik mentor: sesi, rating, jam mentoring, deskripsi, keahlian, pengalaman, dan ulasan',
          }),
        },
      ],
    },
    // Figma file "Serenity SPA Webflow" (UzwDb65Mrm4TLzciDlaRTP, page HiFi, 2058:34): every screen is a frame of it at
    // 2x, the home page whole among them; no device mockups (owner's call, 2026-10-15)
    'serenity-spa': {
      dir: 'asset/Work/serenity-spa',
      about: {
        en: 'Serenity SPA is a website concept for a spa: a calmer way to browse treatments, see what each one includes, and find a clear next step to book. It spans seven pages in desktop and mobile layouts, with greyscale wireframes and a shared style guide. The people, prices, and testimonials are sample content.',
        id: 'Serenity SPA adalah konsep website untuk spa: cara yang lebih tenang untuk menjelajahi perawatan, melihat isi tiap perawatan, dan menemukan langkah yang jelas untuk memesan. Konsep ini mencakup tujuh halaman dalam tata letak desktop dan mobile, dengan wireframe abu-abu dan panduan gaya bersama. Orang, harga, dan testimoni di dalamnya masih berupa contoh.',
      },
      facts: {
        type: { en: 'Website concept', id: 'Konsep website' },
        role: null,
        year: null,
        scope: { en: '7 pages, desktop and mobile, style guide', id: '7 halaman, desktop dan mobile, panduan gaya' },
      },
      // its colours as its own palette card (05) names them, and its typeface as the Figma file's pages set every
      // word in it (Playfair Display, read from the HiFi page, 2026-10-15)
      palette: [
        { hex: '#253828', role: { en: 'Primary', id: 'Utama' } },
        { hex: '#D8F089', role: { en: 'Buttons', id: 'Tombol' } },
        { hex: '#000000', role: { en: 'Headings', id: 'Judul' } },
        { hex: '#F5F7F4', role: { en: 'Sections', id: 'Section' } },
      ],
      type: [{ name: 'Playfair Display', role: { en: 'Headings and text', id: 'Judul dan teks' } }],
      screens: [
        {
          name: { en: 'Home', id: 'Beranda' },
          pic: crt('01-hero-home', '18414:80', {
            en: 'Serenity SPA’s home page: Luxury Wellness & Tranquility, Redefined, over a photo of a head massage by candlelight, under a menu bar with Book a Treatment',
            id: 'Beranda Serenity SPA: Luxury Wellness & Tranquility, Redefined, di atas foto pijat kepala dengan cahaya lilin, di bawah bilah menu dengan tombol Book a Treatment',
          }),
        },
        {
          // the whole Home page, scrolled through in a screen's frame (scroll), exported at 2x and kept to 2200px wide
          name: { en: 'Home, the whole page', id: 'Beranda, satu halaman penuh' },
          scroll: true,
          pic: pic('win', 'Serenity SPA - Home', '16-home-full', 1440, 6499, '18217:2', {
            en: 'Serenity SPA’s whole home page: the hero, services, the about strip, treatments, testimonials and the booking call to action',
            id: 'Seluruh halaman beranda Serenity SPA: hero, layanan, strip tentang, perawatan, testimoni, dan ajakan memesan',
          }),
        },
        {
          name: { en: 'Type scale', id: 'Skala tipografi' },
          pic: pic('win', 'Serenity SPA - Style Guide', '04-type-scale', 1440, 895, '18335:752', {
            en: 'The style guide’s headings in Playfair Display, from Heading 1 at 88px down to Heading 6 at 24px, each with its line height',
            id: 'Judul-judul di style guide dengan Playfair Display, dari Heading 1 berukuran 88px sampai Heading 6 berukuran 24px, masing-masing dengan tinggi barisnya',
          }),
        },
        {
          name: { en: 'Services', id: 'Layanan' },
          pic: pic('win', 'Serenity SPA - Services', '06-services', 1440, 1448, '18239:24', {
            en: 'The services grid: Therapeutic Massages, its photo filling the card behind Learn More, then Facial & Skin Treatments and Aromatherapy & Essential Oils',
            id: 'Grid layanan: Therapeutic Massages dengan fotonya memenuhi kartu di balik tombol Learn More, lalu Facial & Skin Treatments dan Aromatherapy & Essential Oils',
          }),
        },
        {
          name: { en: 'Service page', id: 'Halaman layanan' },
          pic: pic('win', 'Serenity SPA - Therapeutic Massages', '07-service-page', 1440, 960, '18261:145', {
            en: 'A service page: the price list for four massages with Book Now, beside Learn About Services and Why choose our signature massage?',
            id: 'Halaman layanan: daftar harga empat jenis pijat dengan tombol Book Now, di samping Learn About Services dan Why choose our signature massage?',
          }),
        },
        {
          name: { en: 'Treatment', id: 'Perawatan' },
          pic: pic('win', 'Serenity SPA - Treatments & Therapies', '08-treatment', 1440, 955, '18300:2793', {
            en: 'What’s Included in the Treatments?: Full-Body Therapeutic Massage open with its photo, above Luxury Facial & Skin Rejuvenation and Hydrotherapy & Detox Ritual',
            id: 'What’s Included in the Treatments?: Full-Body Therapeutic Massage terbuka dengan fotonya, di atas Luxury Facial & Skin Rejuvenation dan Hydrotherapy & Detox Ritual',
          }),
        },
        {
          name: { en: 'About', id: 'Tentang' },
          pic: pic('win', 'Serenity SPA - About', '09-about', 1440, 960, '18261:60', {
            en: 'The About page’s layered photographs beneath Rejuvenate Your Body, Refresh Your Mind, Restore Your Spirit',
            id: 'Foto berlapis di halaman About di bawah judul Rejuvenate Your Body, Refresh Your Mind, Restore Your Spirit',
          }),
        },
        {
          name: { en: 'Blog', id: 'Blog' },
          pic: pic('win', 'Serenity SPA - Blog', '10-blog', 1440, 960, '18333:73', {
            en: 'Our Blog: category tabs above a grid of posts, each with a photo, title and date',
            id: 'Our Blog: tab kategori di atas grid artikel, masing-masing dengan foto, judul, dan tanggal',
          }),
        },
        {
          name: { en: 'Contact', id: 'Kontak' },
          pic: pic('win', 'Serenity SPA - Contact', '11-contact', 1440, 800, '18284:243', {
            en: 'Get in Touch beside the Send us a message form: full name, email address, phone number and message, then Submit Now',
            id: 'Get in Touch di samping formulir Send us a message: nama lengkap, alamat email, nomor telepon, dan pesan, lalu tombol Submit Now',
          }),
        },
        [
          {
            name: { en: 'Mobile home', id: 'Beranda mobile' },
            pic: pic('tool', 'Home', '12-m-home', 393, 852, '18311:75', {
              en: 'The home page on a phone: Luxury Wellness & Tranquility, Redefined over the photo, with the menu bar under it',
              id: 'Beranda di ponsel: Luxury Wellness & Tranquility, Redefined di atas foto, dengan bilah menu di bawahnya',
            }),
          },
          {
            name: { en: 'Mobile services', id: 'Layanan mobile' },
            pic: pic('tool', 'Services', '13-m-services', 393, 852, '18320:3167', {
              en: 'The services on a phone: cards in one column, each with a photo, a description and Learn More',
              id: 'Layanan di ponsel: kartu dalam satu kolom, masing-masing dengan foto, deskripsi, dan tombol Learn More',
            }),
          },
          {
            name: { en: 'Mobile treatment', id: 'Perawatan mobile' },
            pic: pic('tool', 'Treatments & Therapies', '15-m-treatment', 393, 852, '18320:4023', {
              en: 'What’s Included in the Treatments? on a phone: Book a Treatment above the accordion',
              id: 'What’s Included in the Treatments? di ponsel: tombol Book a Treatment di atas akordeon',
            }),
          },
        ],
        [
          {
            name: { en: 'Mobile service page', id: 'Halaman layanan mobile' },
            pic: pic('tool', 'Therapeutic Massages', '20-m-detail-service', 393, 852, '18320:3622', {
              en: 'A service page on a phone: Therapeutic Massages over its photo, with a short description',
              id: 'Halaman layanan di ponsel: Therapeutic Massages di atas fotonya, dengan deskripsi singkat',
            }),
          },
          {
            name: { en: 'Mobile blog', id: 'Blog mobile' },
            pic: pic('tool', 'Blog', '21-m-blog', 393, 852, '18333:259', {
              en: 'The blog on a phone: Latest Wellness Insights & Self-Care Tips above the category tabs',
              id: 'Blog di ponsel: Latest Wellness Insights & Self-Care Tips di atas tab kategori',
            }),
          },
          {
            name: { en: 'Mobile contact', id: 'Kontak mobile' },
            pic: pic('tool', 'Contact', '22-m-contact', 393, 852, '18320:4260', {
              en: 'Contact on a phone: Get in Touch above the Send us a message form',
              id: 'Kontak di ponsel: Get in Touch di atas formulir Send us a message',
            }),
          },
        ],
      ],
    },
  };
  // WebP copies of the owner's 2x exports, approved for the site on 2026-10-06 (at most 2x a slot's width; the exports
  // stay out of git and the upload). Serenity SPA's copies are at their third version
  const VER = { krool: 1, sensorstack: 1, findmentor: 1, 'serenity-spa': 3 };
  Object.keys(VER).forEach((slug) => {
    const c = PF.cases[slug];
    const attach = (o) => {
      if (!o || typeof o !== 'object') return;
      if (Array.isArray(o)) { o.forEach(attach); return; }
      if ('file' in o && 'w' in o && 'src' in o) { o.src = `../${c.dir}/${o.file}.webp?v=${VER[slug]}`; return; }
      Object.values(o).forEach(attach);
    };
    attach(c);
  });
})();
