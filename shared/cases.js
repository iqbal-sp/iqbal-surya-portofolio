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
    // preview marks it, the site leaves it out. The device shot that opens it (01) is the owner's from "Work area iqbal"
    // (node 574:12567); every other screen is a frame of the Krool file, exported at 2x (2026-10-15)
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
          name: { en: 'Dashboard on a tablet', id: 'Dasbor di tablet' },
          pic: crt('01-hero-dashboard', '574:12567', {
            en: 'KROOL’s dashboard: conversation numbers, lead activity by region and the team’s tasks',
            id: 'Dasbor KROOL: angka percakapan, aktivitas prospek per wilayah, dan tugas tim',
          }),
        },
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
    // desktop (page HiFi, 2058:34) and mobile. Every screen is a page of it; the hero is the owner's shot from "Work area
    // iqbal", so its node (577:…) points there. A programme page since 2026-10-15; the three cards (04-06) went with KROOL's
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
      // its colours as colour bars, picked from its screens, and its typefaces as read off them (the owner checks)
      palette: [
        { hex: '#4D55DB', role: { en: 'Accent', id: 'Aksen' } },
        { hex: '#021720', role: { en: 'Navigation', id: 'Navigasi' } },
        { hex: '#000000', role: { en: 'Headings', id: 'Judul' } },
        { hex: '#F7F6FD', role: { en: 'Highlight', id: 'Sorotan' } },
        { hex: '#FFFFFF', role: { en: 'Background', id: 'Latar' } },
      ],
      type: [{ name: 'Inter', role: { en: 'Headings and text', id: 'Judul dan teks' } }],
      screens: [
        {
          name: { en: 'Home page on a laptop', id: 'Beranda di laptop' },
          pic: crt('01-hero-website', '577:37637', {
            en: 'SensorStack’s home page on a laptop: Smart Monitoring Made Simple, over a preview of the monitoring dashboard',
            id: 'Beranda SensorStack di laptop: Smart Monitoring Made Simple, di atas pratinjau dashboard pemantauan',
          }),
        },
        {
          name: { en: 'Industry list', id: 'Daftar industri' },
          pic: pic('win', 'SensorStack - Home', '02-industry-list', 1440, 918, '20488:626', {
            en: 'The home page’s list of industries: Industrial & Manufacturing open, with a short description and Learn More, beside a photo of a factory floor; Facilities Management, Food & Beverage, ESG & Waste Management, Energy & Sustainability and Commercial Real Estate below it',
            id: 'Daftar industri di beranda: Industrial & Manufacturing terbuka, dengan deskripsi singkat dan tautan Learn More, di samping foto lantai pabrik; di bawahnya Facilities Management, Food & Beverage, ESG & Waste Management, Energy & Sustainability, dan Commercial Real Estate',
          }),
        },
        {
          name: { en: 'Industry pages', id: 'Halaman industri' },
          pic: bare('03-industry-pages', '20488:1681', {
            en: 'The four industry pages side by side, each opening on a headline beside a photo, then a row of logos and that industry’s problems',
            id: 'Empat halaman industri berdampingan, masing-masing dibuka dengan judul di samping foto, lalu deretan logo dan masalah industri tersebut',
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
        [
          {
            name: { en: 'Mobile home', id: 'Beranda mobile' },
            pic: pic('tool', 'Home', '13-m-home', 375, 812, '20564:7921', {
              en: 'The home page on a phone: Smart Monitoring Made Simple under a bar with the logo and a menu button, above the dashboard preview',
              id: 'Beranda di ponsel: Smart Monitoring Made Simple di bawah bilah berisi logo dan tombol menu, di atas pratinjau dashboard',
            }),
          },
          {
            name: { en: 'Mobile industries', id: 'Industri mobile' },
            pic: pic('tool', 'Industries', '14-m-industries', 375, 812, '20564:8132', {
              en: 'The list of industries on a phone: Industrial & Manufacturing open, with its description, Learn More and its photo inside, above the next industries',
              id: 'Daftar industri di ponsel: Industrial & Manufacturing terbuka, dengan deskripsi, tautan Learn More, dan fotonya di dalam, di atas industri berikutnya',
            }),
          },
          {
            name: { en: 'Mobile food and beverage', id: 'Makanan dan minuman mobile' },
            pic: pic('tool', 'Food & Beverage', '15-m-food', 375, 812, '20574:11895', {
              en: 'The food and beverage page on a phone: a photo of a bottling line above Cut Waste, Optimize Operations and Request a Demo',
              id: 'Halaman makanan dan minuman di ponsel: foto lini pembotolan di atas Cut Waste, Optimize Operations, dan tombol Request a Demo',
            }),
          },
        ],
      ],
    },
    // Figma "Work area iqbal", FINDMENTOR's frames (577:…). A programme page since 2026-10-15: its big screens only, so the
    // cards and small windows (04-06, 10-12) went with KROOL's
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
        scope: { en: 'Mentor and mentee dashboards, mentor search, booking, assignments', id: 'Dasbor mentor dan mentee, pencarian mentor, pemesanan sesi, tugas' },
      },
      // its colours as colour bars, picked from its screens, and its typefaces as read off them (the owner checks)
      palette: [
        { hex: '#1A746F', role: { en: 'Background', id: 'Latar' } },
        { hex: '#458987', role: { en: 'Panels', id: 'Panel' } },
        { hex: '#7277CC', role: { en: 'Selected', id: 'Terpilih' } },
        { hex: '#E5FF62', role: { en: 'Rating', id: 'Rating' } },
        { hex: '#FFFFFF', role: { en: 'Text', id: 'Teks' } },
      ],
      type: [{ name: 'Poppins', role: { en: 'Headings and text', id: 'Judul dan teks' } }],
      screens: [
        {
          name: { en: 'Mentee dashboard', id: 'Dasbor mentee' },
          pic: crt('01-hero-dashboard', '574:12567', {
            en: 'KROOL’s dashboard: conversation numbers, lead activity by region and the team’s tasks',
            id: 'Dasbor KROOL: angka percakapan, aktivitas prospek per wilayah, dan tugas tim',
          }),
        },
        {
          name: { en: 'Find a mentor', id: 'Cari mentor' },
          pic: win('FindMentor - Explore', '02-explore', '577:38410', {
            en: 'FindMentor’s Find Your Perfect Mentor screen: mentor cards by category, each with role, experience and rating',
            id: 'Layar Find Your Perfect Mentor di FindMentor: kartu mentor per kategori, masing-masing dengan peran, pengalaman, dan rating',
          }),
        },
        {
          name: { en: 'Mentor dashboard', id: 'Dasbor mentor' },
          pic: bare('03-mentor-dashboard', '577:38635', {
            en: 'A mentor’s dashboard in FindMentor: mentoring time statistics, the week’s sessions, mentorship insights and recent bookings',
            id: 'Dasbor mentor di FindMentor: statistik waktu mentoring, sesi minggu ini, mentorship insights, dan booking terbaru',
          }),
        },
        {
          name: { en: 'Dashboard', id: 'Dasbor' },
          pic: crt('08-dashboard', '574:13983', {
            en: 'KROOL’s dashboard, with conversation activity and the team’s tasks',
            id: 'Dasbor KROOL, dengan aktivitas percakapan dan tugas tim',
          }),
        },
        {
          name: { en: 'Goals', id: 'Target' },
          pic: pic('win', 'FindMentor - Goals', '09-goals', 838, 660, '577:38951', {
            en: 'A goal in FindMentor, Draft Your Unique Personal Brand Statement, with its due date, completion bar and task list',
            id: 'Sebuah tujuan di FindMentor, Draft Your Unique Personal Brand Statement, dengan tenggat, bar penyelesaian, dan daftar tugasnya',
          }),
        },
      ],
    },
    // Serenity SPA, read from its design (no Figma page of the owner's). A programme page since 2026-10-15; the colour
    // palette card (05) went with KROOL's small cards
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
          name: { en: 'Services on the home page', id: 'Layanan di beranda' },
          pic: pic('win', 'Serenity SPA - Home', '02-home-services', 1440, 891, '18217:31', {
            en: 'The home page’s services section: Therapeutic Massages beside a photo of a massage table, with a short description, a smaller photo and Learn More',
            id: 'Section layanan di beranda: Therapeutic Massages di samping foto meja pijat, dengan deskripsi singkat, foto yang lebih kecil, dan tombol Learn More',
          }),
        },
        {
          name: { en: 'About on a laptop', id: 'Tentang di laptop' },
          pic: bare('03-about-mockup', null, {
            en: 'An angled laptop mockup of the About page, with a large spa photograph and Book a Treatment visible in the top navigation',
            id: 'Mockup laptop miring yang menampilkan halaman About, dengan foto spa besar dan tombol Book a Treatment terlihat di navigasi atas',
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
      ],
    },
  };
  // WebP copies of the owner's 2x exports, approved for the site on 2026-10-06 (at most 2x a slot's width; the exports
  // stay out of git and the upload). FINDMENTOR's 09 was exported on a wider ground, so its slot keeps its width and
  // takes the export's height. Serenity SPA's copies are at their third version
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
