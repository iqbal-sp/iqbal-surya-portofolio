/*
  Case study pages, bilingual (en / id), keyed by a case's slug in PF.projects (content.js). Each page follows the
  owner's page for that case in Figma (file "Work area iqbal"), section by section, and the Case Study Player plays
  its sections as chapters; Serenity SPA has only its design, so its page is read from that. A case without a page
  here plays its overview only.

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
    // Figma node 574:12566, "Krool Detail Page". The hero's title, logline and tags are the case's own (content.js).
    krool: {
      dir: 'asset/Work/krool',
      hero: crt('01-hero-dashboard', '574:12567', {
        en: 'KROOL’s dashboard: conversation numbers, lead activity by region and the team’s tasks',
        id: 'Dasbor KROOL: angka percakapan, aktivitas prospek per wilayah, dan tugas tim',
      }),
      chapters: [
        {
          id: 'about', tone: 'tint', label: { en: "Overview", id: "Ringkasan" },
          blocks: [
            {
              type: 'intro',
              title: { en: "A design study for a shared CRM workspace", id: "Studi desain untuk ruang kerja CRM" },
              text: [
                {
                  en: "KROOL is a design study for a multi-channel CRM. It explores how an interface can bring customer conversations, lead information, and team activity into one workspace.",
                  id: "KROOL adalah studi desain CRM multikanal. Konsep ini mengeksplorasi cara menyatukan percakapan pelanggan, informasi prospek, dan aktivitas tim dalam satu ruang kerja.",
                },
                {
                  en: "The screens cover a dashboard, inbox, sales pipeline, calendar, and analytics. AI-assisted features are part of the concept; this showcase presents the interface design.",
                  id: "Desainnya mencakup dashboard, kotak masuk, pipeline penjualan, kalender, dan analitik. Fitur berbantuan AI merupakan bagian dari konsep. Karya yang ditampilkan di sini berfokus pada desain antarmukanya.",
                },
              ],
            },
            {
              type: 'pic',
              pic: win('KROOL - Inbox', '02-inbox-chat', '574:12617', {
                en: 'KROOL’s inbox: the conversation list beside an open chat with a lead',
                id: 'Kotak masuk KROOL: daftar percakapan di samping chat yang terbuka dengan seorang prospek',
              }),
            },
          ],
        },
        {
          id: 'challenge', tone: 'tint', label: { en: "Design focus", id: "Fokus desain" },
          blocks: [
            {
              type: 'quote',
              text: {
                en: "The design question: how can a team move between a conversation, the contact behind it, and the next follow-up without losing context?",
                id: "Pertanyaan desainnya: bagaimana tim berpindah dari percakapan ke informasi kontak dan tindak lanjut berikutnya tanpa kehilangan konteks?",
              },
            },
            {
              type: 'pic',
              pic: bare('03-contact-detail', '641:60988', {
                en: 'KROOL’s inbox with a lead’s contact details, tags and linked deal beside the chat',
                id: 'Kotak masuk KROOL dengan detail kontak prospek, tag, dan deal terkait di samping chat',
              }),
            },
          ],
        },
        {
          id: 'solution', label: { en: "Approach", id: "Pendekatan" },
          blocks: [
            {
              type: 'intro', under: true,
              title: { en: "Keep the conversation and its context together", id: "Satukan percakapan dan konteksnya" },
              text: [{
                en: "The inbox places the conversation list, open chat, and contact details side by side. The dashboard groups activity by channel and region, while the pipeline gives leads their own cards and stages. These views explore different ways to navigate the same customer information.",
                id: "Kotak masuk menempatkan daftar percakapan, chat yang terbuka, dan detail kontak berdampingan. Dashboard mengelompokkan aktivitas berdasarkan kanal dan wilayah, sementara pipeline menampilkan prospek sebagai kartu dalam tahapan penjualan. Tampilan ini mengeksplorasi beberapa cara menavigasi informasi pelanggan yang sama.",
              }],
            },
            {
              type: 'trio',
              pics: [
                pic('tool', 'Volume per Channel', '04-volume-per-channel', 563, 258, '574:12755', {
                  en: 'Volume per Channel: conversations from WhatsApp, Instagram, LinkedIn, Intercom and Zendesk as bars',
                  id: 'Volume per Channel: percakapan dari WhatsApp, Instagram, LinkedIn, Intercom, dan Zendesk dalam diagram batang',
                }),
                pic('tool', 'Leads Conversation Activity', '05-leads-activity', 355, 187, '574:12950', {
                  en: 'Leads Conversation Activity: conversations over time, split by region',
                  id: 'Leads Conversation Activity: jumlah percakapan dari waktu ke waktu, dibagi per wilayah',
                }),
                pic('tool', 'Lead Heatmap', '06-lead-heatmap', 566, 309, '574:12789', {
                  en: 'Lead Heatmap: requests by weekday from January to June, busiest mid-to-late week',
                  id: 'Lead Heatmap: permintaan per hari dari Januari sampai Juni, paling ramai di pertengahan hingga akhir minggu',
                }),
              ],
            },
          ],
        },
        {
          // from the dashboard on, the Figma's "showcase apps" section: one story, the product's screens
          id: 'showcase', label: { en: "Interface details", id: "Detail antarmuka" },
          blocks: [
            { type: 'intro', title: { en: "Inside the CRM workspace", id: "Di dalam ruang kerja CRM" } },
            {
              type: 'pic',
              pic: crt('08-dashboard', '574:13983', {
                en: 'KROOL’s dashboard, with conversation activity and the team’s tasks',
                id: 'Dasbor KROOL, dengan aktivitas percakapan dan tugas tim',
              }),
            },
            {
              type: 'feature', label: { en: 'Calendar', id: "Kalender" },
              title: { en: "Plan the next follow-up", id: "Rencanakan tindak lanjut berikutnya" },
              text: {
                en: "The calendar lays out follow-ups and tasks across the month. It gives scheduling a dedicated view alongside the inbox and pipeline.",
                id: "Kalender menampilkan tindak lanjut dan tugas selama sebulan. Penjadwalan mendapat tampilan tersendiri di samping kotak masuk dan pipeline.",
              },
              pic: win('KROOL - Calendar', '09-calendar', '574:13554', {
                en: 'KROOL’s calendar: a month of follow-ups and tasks',
                id: 'Kalender KROOL: tindak lanjut dan tugas selama satu bulan',
              }),
            },
            {
              type: 'feature', label: { en: 'Inbox', id: "Kotak masuk" },
              title: { en: "Read the chat with the contact in view", id: "Baca chat sambil melihat informasi kontak" },
              text: {
                en: "The inbox groups conversations in a list and keeps the selected chat beside the contact’s details. Tags and linked deals provide context without opening another screen.",
                id: "Kotak masuk mengelompokkan percakapan dalam daftar, dengan chat yang dipilih di samping detail kontak. Tag dan transaksi terkait memberi konteks tanpa perlu membuka layar lain.",
              },
              pic: win('KROOL - Inbox', '10-inbox', '574:13674', {
                en: 'KROOL’s unified inbox: conversations, the open chat and the contact’s details',
                id: 'Kotak masuk terpadu KROOL: daftar percakapan, chat yang terbuka, dan detail kontak',
              }),
              pop: pic('dialog', 'Teammate', '11-teammate-card', 380, 256, '574:14009', {
                en: 'A teammate’s profile card in KROOL: role, team, conversations owned and tasks assigned, with Call and Send Email',
                id: 'Kartu profil anggota tim di KROOL: peran, tim, percakapan yang dipegang, dan tugas, dengan tombol Call dan Send Email',
              }),
            },
            {
              type: 'feature', label: { en: 'Analytics', id: "Analitik" },
              title: { en: "Compare activity across channels", id: "Bandingkan aktivitas antar kanal" },
              text: {
                en: "The analytics layout brings together pipeline conversion, channel volume, a lead heatmap, and revenue by lead source. Each chart has its own space within the shared dashboard structure.",
                id: "Tampilan analitik menyatukan konversi pipeline, volume percakapan per kanal, heatmap prospek, dan pendapatan berdasarkan sumber prospek. Setiap grafik memiliki ruang tersendiri dalam struktur dashboard yang sama.",
              },
              pic: win('KROOL - Analytics', '12-analytics', '574:14057', {
                en: 'KROOL’s analytics: pipeline conversion, volume per channel, lead heatmap and revenue by lead source',
                id: 'Analitik KROOL: konversi pipeline, volume per kanal, lead heatmap, dan pendapatan per sumber prospek',
              }),
            },
          ],
        },
      ],
    },
    // Figma file "Sensorstock.ai" (o6kneYuABLITrPvlHJjLWP), the website the owner redesigned (design only): twelve pages on
    // desktop (page HiFi, 2058:34) and mobile. Every screen is a page of it; the hero and the three cards are the owner's
    // shots from "Work area iqbal", so their nodes (577:…) point there.
    sensorstack: {
      dir: 'asset/Work/sensorstack',
      hero: crt('01-hero-website', '577:37637', {
        en: 'SensorStack’s home page on a laptop: Smart Monitoring Made Simple, over a preview of the monitoring dashboard',
        id: 'Beranda SensorStack di laptop: Smart Monitoring Made Simple, di atas pratinjau dashboard pemantauan',
      }),
      chapters: [
        {
          id: 'about', tone: 'tint', label: { en: "Overview", id: "Ringkasan" },
          blocks: [
            {
              type: 'intro',
              title: { en: "A website redesign for SensorStack", id: "Desain ulang website SensorStack" },
              text: [
                {
                  en: "SensorStack offers wireless IoT sensors and a dashboard for monitoring equipment, energy use, and conditions such as temperature and humidity. The website has its own page for each of four industries: facilities management, commercial property, industrial and manufacturing, and food and beverage.",
                  id: "SensorStack menawarkan sensor IoT nirkabel dan dashboard untuk memantau peralatan, pemakaian energi, serta kondisi seperti suhu dan kelembapan. Websitenya memiliki halaman tersendiri untuk empat industri: pengelolaan fasilitas, properti komersial, industri dan manufaktur, serta makanan dan minuman.",
                },
                {
                  en: "I redesigned the website between March and May 2025. I began with greyscale wireframes for every page, then designed twelve pages in desktop and mobile versions. The site is live at sensorstack.ai.",
                  id: "Saya mendesain ulang website ini antara Maret dan Mei 2025. Saya memulai dari wireframe abu-abu untuk setiap halaman, lalu merancang dua belas halaman dalam versi desktop dan mobile. Website ini sudah bisa dikunjungi di sensorstack.ai.",
                },
              ],
            },
            {
              type: 'pic',
              pic: pic('win', 'SensorStack - Home', '02-industry-list', 1440, 918, '20488:626', {
                en: 'The home page’s list of industries: Industrial & Manufacturing open, with a short description and Learn More, beside a photo of a factory floor; Facilities Management, Food & Beverage, ESG & Waste Management, Energy & Sustainability and Commercial Real Estate below it',
                id: 'Daftar industri di beranda: Industrial & Manufacturing terbuka, dengan deskripsi singkat dan tautan Learn More, di samping foto lantai pabrik; di bawahnya Facilities Management, Food & Beverage, ESG & Waste Management, Energy & Sustainability, dan Commercial Real Estate',
              }),
            },
          ],
        },
        {
          id: 'challenge', tone: 'tint', label: { en: "Design focus", id: "Fokus desain" },
          blocks: [
            {
              type: 'quote',
              text: {
                en: "The design question: how can one website introduce the same sensors and dashboard to four industries, each with its own problems?",
                id: "Pertanyaan desainnya: bagaimana satu website memperkenalkan sensor dan dashboard yang sama kepada empat industri dengan masalah yang berbeda?",
              },
            },
            {
              // the four industry pages side by side, their tops level (20488:1681, 20488:960, 20488:4852, 20488:5376)
              type: 'pic',
              pic: bare('03-industry-pages', '20488:1681', {
                en: 'The four industry pages side by side, each opening on a headline beside a photo, then a row of logos and that industry’s problems',
                id: 'Empat halaman industri berdampingan, masing-masing dibuka dengan judul di samping foto, lalu deretan logo dan masalah industri tersebut',
              }),
            },
          ],
        },
        {
          id: 'solution', label: { en: "Approach", id: "Pendekatan" },
          blocks: [
            {
              type: 'intro', under: true,
              title: { en: "Give every industry page the same opening", id: "Awali setiap halaman industri dengan cara yang sama" },
              text: [
                {
                  en: "Each industry page opens with a headline beside a photo, a row of logos, and then that industry’s problems with a cost figure. The sections after that change with the industry, and every page ends on the same demo request form.",
                  id: "Setiap halaman industri dibuka dengan judul di samping foto, deretan logo, lalu masalah industri tersebut beserta angka biayanya. Bagian setelahnya menyesuaikan industrinya, dan setiap halaman ditutup dengan formulir permintaan demo yang sama.",
                },
                {
                  en: "The product appears in small pieces of its interface. On the home page each feature gets its own piece, such as an energy curve, an integration chip, or an alert card. The industry pages place alert and status cards in the same style on photos of equipment and the people who run it.",
                  id: "Produk ditampilkan lewat potongan kecil antarmukanya. Di beranda, setiap fitur mendapat potongannya sendiri, seperti kurva energi, chip integrasi, atau kartu peringatan. Halaman industri menempatkan kartu peringatan dan status dengan gaya yang sama pada foto peralatan dan orang yang mengoperasikannya.",
                },
              ],
            },
            {
              type: 'trio',
              pics: [
                pic('tool', 'Integrations', '04-integrations', 660, 542, '577:37737', {
                  en: 'The home page’s integrations card: Seamless Integration, Cost-Effective and No Complex Setup around a chip',
                  id: 'Kartu integrasi di beranda: Seamless Integration, Cost-Effective, dan No Complex Setup mengelilingi sebuah chip',
                }),
                pic('tool', 'Energy', '05-energy', 434, 267, '577:37802', {
                  en: 'The home page’s energy card: energy use over the week, falling toward Friday',
                  id: 'Kartu energi di beranda: pemakaian energi selama seminggu, menurun menjelang hari Jumat',
                }),
                pic('tool', 'Alerts', '06-alerts', 670, 450, '577:37752', {
                  en: 'Alerts: a low temperature alert issued in the freezer room, over an earlier one for extreme temperature swings in the same room',
                  id: 'Peringatan: suhu rendah di ruang freezer, di atas peringatan sebelumnya tentang suhu yang naik turun ekstrem di ruang yang sama',
                }),
              ],
            },
          ],
        },
        {
          id: 'pages', label: { en: 'Pages', id: "Halaman" },
          blocks: [
            {
              type: 'intro', under: true,
              title: { en: "Twelve pages under five menus", id: "Dua belas halaman dalam lima menu" },
              text: [{
                en: "The menu sorts the pages under Solutions, Industries, Technology, Resources, and Company, beside Login and Request Demo. The industry and solution pages each follow a template of their own, and the other pages reuse the same navigation bar, cards, demo form, and footer.",
                id: "Menu mengelompokkan halaman ke dalam Solutions, Industries, Technology, Resources, dan Company, di samping Login dan Request Demo. Halaman industri dan halaman solusi masing-masing punya template sendiri, sedangkan halaman lainnya memakai bilah navigasi, kartu, formulir demo, dan footer yang sama.",
              }],
            },
            {
              type: 'feature', label: { en: 'Industries', id: "Industri" },
              title: { en: "Start with the industry’s problems", id: "Mulai dari masalah industrinya" },
              text: {
                en: "On the facilities page, the problems sit in an accordion beside a photo with a cost card: HVAC inefficiency, pipe leaks, and faults caught too late. The other industry pages bring their own problems and figures.",
                id: "Di halaman fasilitas, masalahnya tersusun dalam akordeon di samping foto dengan kartu biaya: HVAC yang boros, kebocoran pipa, dan gangguan yang terlambat ditangani. Halaman industri lainnya memuat masalah dan angkanya sendiri.",
              },
              pic: pic('win', 'SensorStack - Facilities Management', '07-industry-problems', 1440, 765, '20488:1730', {
                en: 'The Hidden Challenges in Facility Management: a photo of rooftop ductwork with a card for the money wasted each year, beside three problems, the first one open',
                id: 'The Hidden Challenges in Facility Management: foto saluran udara di atap dengan kartu biaya yang terbuang setiap tahun, di samping tiga masalah, yang pertama terbuka',
              }),
            },
            {
              type: 'feature', label: { en: 'Solutions', id: "Solusi" },
              title: { en: "One solution per page", id: "Satu solusi di setiap halaman" },
              text: {
                en: "The three solution pages cover operational efficiency, waste management, and energy use. Each opens with its headline above a large picture, then takes its features one at a time with photos and checklists.",
                id: "Tiga halaman solusi membahas efisiensi operasional, pengelolaan sampah, dan pemakaian energi. Setiap halaman dibuka dengan judul di atas gambar besar, lalu membahas fiturnya satu per satu dengan foto dan daftar periksa.",
              },
              pic: pic('win', 'SensorStack - Smart Waste Management', '08-solution-hero', 1440, 1255, '20488:2436', {
                en: 'Smart Waste Management for a Greener Future: the headline and Schedule a Demo above a photo of an overflowing waste container with an operational cost card',
                id: 'Smart Waste Management for a Greener Future: judul dan tombol Schedule a Demo di atas foto kontainer sampah yang penuh, dengan kartu biaya operasional',
              }),
            },
            {
              type: 'feature', label: { en: 'Resources and technology', id: "Sumber daya dan teknologi" },
              title: { en: "Customer stories and supported systems", id: "Kisah pelanggan dan sistem yang didukung" },
              text: {
                en: "Case studies and articles share one card style, a photo above the title. The integrations page shows the industry protocols SensorStack connects to: Modbus, BACnet, and LonWorks.",
                id: "Studi kasus dan artikel memakai gaya kartu yang sama, foto di atas judul. Halaman integrasi menampilkan protokol industri yang terhubung dengan SensorStack: Modbus, BACnet, dan LonWorks.",
              },
              pics: [
                pic('win', 'SensorStack - Case Studies', '09-case-studies', 1440, 942, '20488:3136', {
                  en: 'Case Studies: two customer stories as photo cards, from food and beverage manufacturing and from residential real estate',
                  id: 'Case Studies: dua kisah pelanggan dalam kartu berfoto, dari manufaktur makanan dan minuman serta properti hunian',
                }),
                pic('win', 'SensorStack - Integrations', '10-integrations', 1440, 619, '20488:4268', {
                  en: 'Industry-Standard Protocols for Effortless Integration: the Modbus, BACnet and LonWorks logos in three tiles',
                  id: 'Industry-Standard Protocols for Effortless Integration: logo Modbus, BACnet, dan LonWorks dalam tiga kotak',
                }),
              ],
            },
            {
              type: 'feature', label: { en: 'Company', id: "Perusahaan" },
              title: { en: "Open roles and a contact form", id: "Lowongan dan formulir kontak" },
              text: {
                en: "Careers lists open positions with a filter for each team, and each role shows its location and work time beside Apply Job. Contact puts the message form next to the support email and phone number.",
                id: "Careers menampilkan lowongan dengan filter per tim, dan setiap posisi memuat lokasi serta waktu kerjanya di samping tombol Apply Job. Contact menempatkan formulir pesan di sebelah email dukungan dan nomor telepon.",
              },
              pics: [
                pic('win', 'SensorStack - Careers', '11-careers', 1440, 921, '20488:4756', {
                  en: 'Available Positions: team filters above four roles, each with its location, work time and Apply Job',
                  id: 'Available Positions: filter tim di atas empat posisi, masing-masing dengan lokasi, waktu kerja, dan tombol Apply Job',
                }),
                pic('win', 'SensorStack - Contact', '12-contact', 1440, 1296, '20488:4388', {
                  en: 'Get in Touch with SensorStack: the message form beside the support email, phone number and website address',
                  id: 'Get in Touch with SensorStack: formulir pesan di samping email dukungan, nomor telepon, dan alamat website',
                }),
              ],
            },
          ],
        },
        {
          id: 'mobile', label: { en: 'Mobile', id: "Mobile" },
          blocks: [
            {
              type: 'intro',
              title: { en: "The same pages on a phone", id: "Halaman yang sama di ponsel" },
              text: [{
                en: "Each of the twelve pages has a mobile version. The menus fold into one button and the sections stack into a single column. The home page’s industry list opens one industry at a time with its photo inside, and the industry pages move their photo above the headline.",
                id: "Kedua belas halaman memiliki versi mobile. Menu diringkas menjadi satu tombol dan setiap bagian tersusun dalam satu kolom. Daftar industri di beranda membuka satu industri dalam satu waktu beserta fotonya, dan halaman industri memindahkan fotonya ke atas judul.",
              }],
            },
            {
              type: 'row',
              pics: [
                pic('tool', 'Home', '13-m-home', 375, 812, '20564:7921', {
                  en: 'The home page on a phone: Smart Monitoring Made Simple under a bar with the logo and a menu button, above the dashboard preview',
                  id: 'Beranda di ponsel: Smart Monitoring Made Simple di bawah bilah berisi logo dan tombol menu, di atas pratinjau dashboard',
                }),
                pic('tool', 'Industries', '14-m-industries', 375, 812, '20564:8132', {
                  en: 'The list of industries on a phone: Industrial & Manufacturing open, with its description, Learn More and its photo inside, above the next industries',
                  id: 'Daftar industri di ponsel: Industrial & Manufacturing terbuka, dengan deskripsi, tautan Learn More, dan fotonya di dalam, di atas industri berikutnya',
                }),
                pic('tool', 'Food & Beverage', '15-m-food', 375, 812, '20574:11895', {
                  en: 'The food and beverage page on a phone: a photo of a bottling line above Cut Waste, Optimize Operations and Request a Demo',
                  id: 'Halaman makanan dan minuman di ponsel: foto lini pembotolan di atas Cut Waste, Optimize Operations, dan tombol Request a Demo',
                }),
              ],
            },
          ],
        },
      ],
    },
    // Figma node 577:38365, "Findmentor Detail Page". The hero's title, logline and tags are the case's own (content.js).
    // Most of its pictures are cards of the app rather than whole screens, so their slots take the cards' own sizes.
    findmentor: {
      dir: 'asset/Work/findmentor',
      hero: crt('01-hero-dashboard', '577:38368', {
        en: 'FindMentor’s mentee dashboard: assignments in progress, upcoming sessions, recommended mentors and recent activity',
        id: 'Dasbor mentee FindMentor: tugas yang sedang berjalan, sesi mendatang, mentor yang direkomendasikan, dan aktivitas terbaru',
      }),
      chapters: [
        {
          id: 'about', tone: 'tint', label: { en: "Overview", id: "Ringkasan" },
          blocks: [
            {
              type: 'intro',
              title: { en: "Designing the mentorship workspace", id: "Merancang ruang kerja mentoring" },
              text: [
                {
                  en: "FindMentor brings mentor discovery, scheduled sessions, and learning tasks into a connected interface.",
                  id: "FindMentor menghubungkan pencarian mentor, jadwal sesi, dan tugas belajar dalam satu antarmuka.",
                },
                {
                  en: "The design covers separate mentor and mentee dashboards, with views for exploring mentors, booking sessions, reviewing assignments, and checking progress.",
                  id: "Desainnya mencakup dashboard terpisah untuk mentor dan mentee, dengan tampilan untuk mencari mentor, memesan sesi, meninjau tugas, dan melihat progres.",
                },
              ],
            },
            {
              type: 'pic',
              pic: win('FindMentor - Explore', '02-explore', '577:38410', {
                en: 'FindMentor’s Find Your Perfect Mentor screen: mentor cards by category, each with role, experience and rating',
                id: 'Layar Find Your Perfect Mentor di FindMentor: kartu mentor per kategori, masing-masing dengan peran, pengalaman, dan rating',
              }),
            },
          ],
        },
        {
          id: 'challenge', tone: 'tint', label: { en: "Design focus", id: "Fokus desain" },
          blocks: [
            {
              type: 'quote',
              text: {
                en: "The design question: how can a mentee move from finding a mentor to managing sessions and assignments, while keeping their progress in view?",
                id: "Pertanyaan desainnya: bagaimana mentee beralih dari mencari mentor ke mengelola sesi dan tugas, sambil tetap melihat progres belajarnya?",
              },
            },
            {
              type: 'pic',
              pic: bare('03-mentor-dashboard', '577:38635', {
                en: 'A mentor’s dashboard in FindMentor: mentoring time statistics, the week’s sessions, mentorship insights and recent bookings',
                id: 'Dasbor mentor di FindMentor: statistik waktu mentoring, sesi minggu ini, mentorship insights, dan booking terbaru',
              }),
            },
          ],
        },
        {
          id: 'solution', label: { en: "Approach", id: "Pendekatan" },
          blocks: [
            {
              type: 'intro', under: true,
              title: { en: "Connect sessions, assignments, and progress", id: "Hubungkan sesi, tugas, dan progres" },
              text: [{
                en: "The mentee dashboard places active assignments and upcoming sessions near recommended mentors. Session history and recordings sit alongside progress views, linking the work between meetings with the guidance received in them.",
                id: "Dashboard mentee menempatkan tugas aktif dan sesi mendatang dekat dengan rekomendasi mentor. Riwayat sesi dan rekaman tersedia bersama tampilan progres, sehingga pekerjaan di antara pertemuan terhubung dengan arahan dari mentor.",
              }],
            },
            {
              type: 'trio',
              pics: [
                pic('tool', 'Mentor Profile', '04-mentor-profile', 568, 533, '577:38642', {
                  en: 'A mentor’s profile in FindMentor, with a Send Message button and the history of past sessions to open',
                  id: 'Profil mentor di FindMentor, dengan tombol Send Message dan riwayat sesi yang sudah berlangsung untuk dibuka',
                }),
                pic('tool', 'Past Session', '05-past-session', 292, 220, '577:38797', {
                  en: 'A past session, Building a Personal Brand That Stands Out, with Watch Again and Rewrite Summary',
                  id: 'Sesi yang sudah berlangsung, Building a Personal Brand That Stands Out, dengan tombol Watch Again dan Rewrite Summary',
                }),
                pic('tool', 'Session Recordings', '06-session-recordings', 469, 333, '577:38751', {
                  en: 'Session recordings listed with their dates, the first opened to its timestamped topics',
                  id: 'Daftar rekaman sesi beserta tanggalnya, dengan rekaman pertama terbuka menampilkan topik bertanda waktu',
                }),
              ],
            },
          ],
        },
        {
          // from the dashboard on, the Figma's "showcase apps" section: one story, the product's screens
          id: 'showcase', label: { en: "Interface details", id: "Detail antarmuka" },
          blocks: [
            { type: 'intro', title: { en: "The mentorship interface in detail", id: "Detail antarmuka mentoring" } },
            {
              type: 'pic',
              pic: crt('08-dashboard', '577:39043', {
                en: 'FindMentor’s mentee dashboard with assignments, sessions, recommended mentors and a learning streak',
                id: 'Dasbor mentee FindMentor dengan tugas, sesi, mentor yang direkomendasikan, dan streak belajar',
              }),
            },
            {
              // the owner's labels, matched to each feature (2026-09-25); the Figma still says Calendar, Inbox and Analytics
              type: 'feature', label: { en: 'Goals', id: "Target" },
              title: { en: "Break a goal into tasks", id: "Uraikan target menjadi tugas" },
              text: {
                en: "The goal view pairs a due date and completion bar with a task list. Assignments connect that goal to a mentor and a deadline.",
                id: "Tampilan target memasangkan tenggat dan indikator penyelesaian dengan daftar tugas. Tugas-tugas menghubungkan target tersebut dengan mentor dan jadwal pengerjaan.",
              },
              pic: pic('win', 'FindMentor - Goals', '09-goals', 838, 560, '577:38951', {
                en: 'A goal in FindMentor, Draft Your Unique Personal Brand Statement, with its due date, completion bar and task list',
                id: 'Sebuah tujuan di FindMentor, Draft Your Unique Personal Brand Statement, dengan tenggat, bar penyelesaian, dan daftar tugasnya',
              }),
            },
            {
              type: 'feature', label: { en: 'Booking', id: "Pemesanan" },
              title: { en: "Choose a session time", id: "Pilih waktu sesi" },
              text: {
                en: "The booking view presents session duration and available times by day, with a clear confirmation action once a time is selected.",
                id: "Tampilan pemesanan menampilkan durasi sesi dan waktu yang tersedia per hari. Setelah memilih waktu, pengguna bisa mengonfirmasi pemesanan lewat tombol yang jelas.",
              },
              pic: pic('win', 'FindMentor - Book Session', '10-book-session', 488, 484, '577:38991', {
                en: 'Book Session: pick a duration and one of the open times for today and the next two days, then Book Now',
                id: 'Book Session: pilih durasi dan salah satu waktu kosong untuk hari ini dan dua hari berikutnya, lalu Book Now',
              }),
              pop: pic('dialog', 'Mentorship Insights', '11-mentorship-insights', 372, 305, '577:39058', {
                en: 'Mentorship Insights: each mentee with the assignments they have left and their progress',
                id: 'Mentorship Insights: setiap mentee dengan sisa tugas dan progresnya',
              }),
            },
            {
              type: 'feature', label: { en: 'Feedback', id: "Masukan" },
              title: { en: "Keep assignments and guidance together", id: "Satukan tugas dan arahan mentor" },
              text: {
                en: "Assignment details show the mentor, deadline, and tasks in one card. Session summaries and recordings provide a separate place to revisit earlier guidance.",
                id: "Detail tugas menampilkan mentor, tenggat, dan daftar pekerjaan dalam satu kartu. Ringkasan dan rekaman sesi menyediakan tempat terpisah untuk melihat kembali arahan sebelumnya.",
              },
              // the Figma shows the card's top 545 of its 740
              pic: pic('win', 'FindMentor - Assignment', '12-assignment', 539, 545, '577:39126', {
                en: 'An assignment in FindMentor: its completion, mentor, due date and time, and its task list',
                id: 'Sebuah tugas di FindMentor: penyelesaian, mentor, tenggat dan waktunya, serta daftar tugasnya',
              }),
            },
          ],
        },
      ],
    },
    // Figma node 577:39891, the owner's Behance page for Boxify. It carries no challenge statement, so the page tells
    // the Behance's own story: overview, sitemap and wireframe, website, mobile app. Its four percentages are left out:
    // the owner's case studies carry no metrics. Phone screens are 393 by 852, as the app's frames are.
    boxify: {
      dir: 'asset/Work/boxify',
      hero: crt('01-hero-website', '577:40311', {
        en: 'Boxify’s website home page: Your flexible self-storage solutions, with a storage location search and Search Assistance',
        id: 'Beranda website Boxify: Your flexible self-storage solutions, dengan pencarian lokasi penyimpanan dan Search Assistance',
      }),
      chapters: [
        {
          id: 'about', tone: 'tint', label: { en: "Overview", id: "Ringkasan" },
          blocks: [
            {
              type: 'intro',
              title: { en: "Designing the self-storage experience", id: "Merancang pengalaman penyimpanan barang" },
              text: [{
                en: "Boxify is a website and mobile app design for self-storage. The screens cover finding a unit, comparing its details, making a booking, and managing a booked space.",
                id: "Boxify adalah desain website dan aplikasi mobile untuk penyewaan unit penyimpanan barang. Layarnya mencakup pencarian unit, perbandingan detail, pemesanan, dan pengelolaan ruang yang sudah dipesan.",
              }],
            },
            {
              type: 'row',
              pics: [
                pic('tool', 'Onboarding 1', '02-onboarding-1', 393, 852, '577:41090', {
                  en: 'Onboarding: Effortless Storage Solutions, with Get Started, Sign In and Explore as a Guest',
                  id: 'Onboarding: Effortless Storage Solutions, dengan tombol Get Started, Sign In, dan Explore as a Guest',
                }),
                pic('tool', 'Onboarding 2', '03-onboarding-2', 393, 852, '577:41144', {
                  en: 'Onboarding: Control at Your Fingertips', id: 'Onboarding: Control at Your Fingertips',
                }),
                pic('tool', 'Onboarding 3', '04-onboarding-3', 393, 852, '577:41198', {
                  en: 'Onboarding: Secure and Reliable', id: 'Onboarding: Secure and Reliable',
                }),
              ],
            },
          ],
        },
        {
          id: 'process', tone: 'tint', label: { en: 'Process', id: "Proses" },
          blocks: [
            {
              // the Behance shows the sitemap and the wireframes without words; this text reads them
              type: 'intro',
              title: { en: 'Sitemap and wireframe', id: "Sitemap dan wireframe" },
              text: [{
                en: "The sitemap maps the app’s five tabs: Home, Find, My Box, Notification, and Profile. Find leads from a map or list to unit details and booking. My Box holds active units, conditions, and booking history. Greyscale website wireframes establish page structure before the detailed design.",
                id: "Sitemap memetakan lima tab aplikasi: Home, Find, My Box, Notification, dan Profile. Find mengarahkan pengguna dari peta atau daftar ke detail unit dan pemesanan. My Box memuat unit aktif, kondisi unit, dan riwayat pemesanan. Wireframe website dalam skala abu-abu menetapkan struktur halaman sebelum desain detail.",
              }],
            },
            {
              type: 'pic',
              pic: pic('win', 'Boxify - Sitemap', '05-sitemap', 1554, 702, '577:40046', {
                en: 'Boxify’s sitemap: Sign In / Sign Up, then Home, Find, My Box, Notification and Profile, and the screens under each',
                id: 'Sitemap Boxify: Sign In / Sign Up, lalu Home, Find, My Box, Notification, dan Profile, beserta layar di bawah masing-masing',
              }),
            },
            {
              type: 'pic', apart: true,
              pic: pic('win', 'Boxify - Wireframe', '06-wireframe', 1182, 1022, '577:40159', {
                en: 'Greyscale wireframes of Boxify’s website: a storage room’s page, the home page, why choose self-storage, and the storage order history',
                id: 'Wireframe abu-abu website Boxify: halaman ruang penyimpanan, beranda, alasan memilih self-storage, dan riwayat pesanan',
              }),
            },
          ],
        },
        {
          id: 'website', label: { en: 'Website', id: "Website" },
          blocks: [
            {
              // the heading is the website's own headline
              type: 'intro', under: true,
              title: { en: "Compare units before booking", id: "Bandingkan unit sebelum memesan" },
              text: [{
                en: "The website presents storage locations and unit sizes with pricing and feature details. A booking form collects the customer’s information and start date.",
                id: "Website menampilkan lokasi dan ukuran unit penyimpanan, lengkap dengan harga dan detail fasilitasnya. Formulir pemesanan meminta informasi pelanggan dan tanggal mulai sewa.",
              }],
            },
            {
              type: 'trio',
              pics: [
                pic('tool', 'Storage Options', '07-storage-options', 571, 343, '577:40811', {
                  en: 'Downtown Secure Storage: three unit sizes, each with its price per week, and Show More Option',
                  id: 'Downtown Secure Storage: tiga ukuran unit, masing-masing dengan harga per minggu, dan tombol Show More Option',
                }),
                pic('tool', 'Book Storage Room', '08-book-storage-room', 572, 544, '577:40974', {
                  en: 'Book Storage Room: first and last name, email, phone, address and start date, then Order Storage Now',
                  id: 'Book Storage Room: nama depan dan belakang, email, telepon, alamat, dan tanggal mulai, lalu Order Storage Now',
                }),
                pic('tool', 'Unit Overview', '09-unit-overview', 571, 210, '577:40887', {
                  en: 'An 8 m² heated storage room: what it is for, the items it suits, and its price',
                  id: 'Ruang penyimpanan berpemanas 8 m²: kegunaannya, barang yang cocok, dan harganya',
                }),
              ],
            },
          ],
        },
        {
          id: 'app', label: { en: 'Mobile app', id: "Aplikasi mobile" },
          blocks: [
            {
              // the heading is the website's own line for the app
              type: 'intro',
              title: { en: "Manage a booked unit on mobile", id: "Kelola unit yang dipesan lewat ponsel" },
              text: [{
                en: "The mobile design connects unit discovery and booking with views for active storage units. The showcase includes interface concepts for unit conditions, access, camera views, and an AR preview.",
                id: "Desain mobile menghubungkan pencarian dan pemesanan dengan tampilan unit penyimpanan aktif. Karya ini mencakup konsep antarmuka untuk kondisi unit, akses, kamera, dan pratinjau AR.",
              }],
            },
            {
              type: 'pic',
              pic: pic('tool', 'Home', '10-home', 393, 852, '577:39921', {
                en: 'Boxify’s app home: a search for boxes, quick links for inventory, moving, insurance and packing, a seasonal offer and the active units',
                id: 'Beranda aplikasi Boxify: pencarian box, tautan cepat untuk inventaris, pindahan, asuransi, dan pengemasan, penawaran musiman, serta unit aktif',
              }),
              pop: pic('dialog', 'Unit Features', '11-unit-features', 297, 203, '577:41003', {
                en: 'A unit’s features: around-the-clock protection, personalized unit security, smart access, storage conditions and easy access',
                id: 'Fitur unit: perlindungan sepanjang waktu, keamanan unit pribadi, akses pintar, kondisi penyimpanan, dan akses yang mudah',
              }),
            },
            {
              type: 'feature', label: { en: 'Storage needs', id: "Kebutuhan penyimpanan" },
              title: { en: "Start with the storage needs", id: "Mulai dari kebutuhan penyimpanan" },
              text: {
                en: "The flow asks whether storage is for personal or business use, then presents room sizes and matching units. Each size includes a description of what it can hold.",
                id: "Alur ini menanyakan apakah penyimpanan dibutuhkan untuk keperluan pribadi atau bisnis, lalu menampilkan ukuran ruang dan unit yang sesuai. Setiap ukuran disertai penjelasan tentang barang yang dapat ditampung.",
              },
              pics: [
                pic('tool', 'Storage Type', '12-storage-type', 393, 852, '577:41380', {
                  en: 'The first question: storage for personal use or for a business', id: 'Pertanyaan pertama: penyimpanan untuk pribadi atau untuk bisnis',
                }),
                pic('tool', 'Room Size', '13-room-size', 393, 852, '577:41499', {
                  en: 'The kind of room: small, medium, large or climate-controlled, each with what it fits',
                  id: 'Jenis ruang: kecil, sedang, besar, atau dengan pengatur suhu, masing-masing dengan kapasitasnya',
                }),
                pic('tool', 'Available Rooms', '14-available-rooms', 393, 852, '577:41280', {
                  en: 'Choose Available Room: rooms that match the answers, with their location and price',
                  id: 'Choose Available Room: ruang yang cocok dengan jawaban, lengkap dengan lokasi dan harganya',
                }),
              ],
            },
            {
              type: 'feature', label: { en: 'Find', id: "Pencarian" },
              title: { en: "Find and compare storage units", id: "Cari dan bandingkan unit penyimpanan" },
              text: {
                en: "The list shows unit photos, locations, availability, and prices. Filters narrow the options by size, availability, and price, with a map providing another way to explore locations.",
                id: "Daftar menampilkan foto unit, lokasi, ketersediaan, dan harga. Filter mempersempit pilihan berdasarkan ukuran, ketersediaan, dan harga. Peta menyediakan cara lain untuk menjelajahi lokasi.",
              },
              pic: pic('tool', 'Find', '15-find', 393, 852, '577:41565', {
                en: 'Find: storage rooms with their photo, availability, location and monthly price, filtered by room size, availability and price',
                id: 'Find: ruang penyimpanan dengan foto, ketersediaan, lokasi, dan harga bulanan, disaring menurut ukuran ruang, ketersediaan, dan harga',
              }),
              pop: pic('dialog', 'Locations Near You', '16-locations-map', 596, 376, '577:41566', {
                en: 'Storage Locations Near You: storage centres on a map beside their list',
                id: 'Storage Locations Near You: pusat penyimpanan di peta di samping daftarnya',
              }),
            },
            {
              type: 'feature', label: { en: 'Booking', id: "Pemesanan" },
              title: { en: "Move from unit details to booking", id: "Dari detail unit ke pemesanan" },
              text: {
                en: "A unit’s detail view leads into a form for the booking purpose, payment cycle, start date, and payment method. A confirmation screen closes the flow.",
                id: "Detail unit mengarahkan pengguna ke formulir untuk tujuan sewa, periode pembayaran, tanggal mulai, dan metode pembayaran. Layar konfirmasi menutup alur pemesanan.",
              },
              pics: [
                pic('tool', 'Detail', '17-detail', 393, 852, '577:41784', {
                  en: 'A storage centre’s detail: photos, size, rooms, box capacity and its features',
                  id: 'Detail pusat penyimpanan: foto, ukuran, jumlah ruang, kapasitas box, dan fiturnya',
                }),
                pic('tool', 'Booking Unit', '18-booking-unit', 393, 852, '577:41960', {
                  en: 'Booking Unit: purpose, payment cycle, start date, phone number and payment method, then Book Now',
                  id: 'Booking Unit: tujuan, siklus pembayaran, tanggal mulai, nomor telepon, dan metode pembayaran, lalu Book Now',
                }),
                pic('tool', 'Confirmed', '19-booking-confirmed', 393, 852, '577:42068', {
                  en: 'Booking Confirmed, with View My Box and Return to Home', id: 'Booking Confirmed, dengan tombol View My Box dan Return to Home',
                }),
              ],
            },
            {
              // the title and text are the app's own, from its second onboarding screen
              type: 'feature', label: { en: 'My Box', id: 'My Box' },
              title: { en: "Explore access and monitoring views", id: "Eksplorasi tampilan akses dan pemantauan" },
              text: {
                en: "The design includes camera selection, an AR room preview, and fingerprint or PIN access prompts. These screens show the proposed interface for managing a unit.",
                id: "Desain ini mencakup pilihan kamera, pratinjau ruang dengan AR, serta layar akses sidik jari atau PIN. Layar-layar ini memperlihatkan usulan antarmuka untuk mengelola unit.",
              },
              pics: [
                pic('tool', 'AR View', '20-ar-view', 393, 852, '577:42140', {
                  en: 'AR View: a room seen through the phone, with a chair marked in it', id: 'AR View: sebuah ruang dilihat lewat ponsel, dengan sebuah kursi ditandai di dalamnya',
                }),
                pic('tool', 'Camera', '21-camera', 393, 852, '577:42190', {
                  en: 'A unit’s live camera, switching between Camera 1, 2 and 3', id: 'Kamera langsung sebuah unit, bisa berpindah antara Camera 1, 2, dan 3',
                }),
              ],
            },
            {
              type: 'row',
              pics: [
                pic('dialog', 'Unlock', '22-unlock', 501, 320, '577:42121', {
                  en: 'Unlock Using Fingerprint, with Use Pin Instead', id: 'Unlock Using Fingerprint, dengan pilihan Use Pin Instead',
                }),
                pic('dialog', 'Enter PIN', '23-enter-pin', 501, 320, '577:42127', {
                  en: 'Enter PIN: six boxes for the PIN, with Use Fingerprint', id: 'Enter PIN: enam kotak untuk PIN, dengan pilihan Use Fingerprint',
                }),
              ],
            },
          ],
        },
      ],
    },
    // Figma file "Serenity SPA Webflow" (UzwDb65Mrm4TLzciDlaRTP), page HiFi (2058:34): an independent design study.
    // Sample guests, team, prices and testimonials in the mockups are never presented as real-world evidence.
    'serenity-spa': {
      dir: 'asset/Work/serenity-spa',
      hero: crt('01-hero-home', '18414:80', {
        en: 'Serenity SPA’s home page: Luxury Wellness & Tranquility, Redefined, over a photo of a head massage by candlelight, under a menu bar with Book a Treatment',
        id: 'Beranda Serenity SPA: Luxury Wellness & Tranquility, Redefined, di atas foto pijat kepala dengan cahaya lilin, di bawah bilah menu dengan tombol Book a Treatment',
      }),
      chapters: [
        {
          id: 'about', tone: 'tint', label: { en: "Overview", id: "Ringkasan" },
          blocks: [
            {
              type: 'intro',
              title: { en: 'A quieter path to booking', id: "Jalur tenang menuju pemesanan" },
              text: [
                {
                  en: 'Serenity SPA explores how someone could browse treatments at an easy pace, understand what each one offers, and find a clear next step when ready to book.',
                  id: "Serenity SPA mengeksplorasi cara agar orang bisa melihat pilihan perawatan tanpa terburu-buru, memahami tiap layanan, lalu menemukan langkah untuk memesan saat sudah siap.",
                },
                {
                  en: 'The concept spans seven pages in desktop and mobile layouts, with greyscale wireframes and a shared style guide. The people, prices, and testimonials in the mockups are sample content, not claims about a real spa.',
                  id: "Konsep ini mencakup tujuh halaman dalam tata letak desktop dan mobile, lengkap dengan wireframe abu-abu dan panduan gaya. Orang, harga, dan testimoni dalam mockup adalah contoh konten, bukan klaim tentang spa yang nyata.",
                },
              ],
            },
            {
              type: 'pic',
              pic: pic('win', 'Serenity SPA - Home', '02-home-services', 1440, 891, '18217:31', {
                en: 'The home page’s services section: Therapeutic Massages beside a photo of a massage table, with a short description, a smaller photo and Learn More',
                id: 'Section layanan di beranda: Therapeutic Massages di samping foto meja pijat, dengan deskripsi singkat, foto yang lebih kecil, dan tombol Learn More',
              }),
            },
          ],
        },
        {
          id: 'challenge', tone: 'tint', label: { en: "Design focus", id: "Fokus desain" },
          blocks: [
            {
              type: 'quote',
              text: {
                en: "How can a spa website invite unhurried browsing and still make booking easy to find?",
                id: "Bagaimana website spa bisa terasa santai dijelajahi, tetapi tetap memudahkan orang untuk memesan?",
              },
            },
            {
              // The available export is an About-page mockup with Book a Treatment in the navigation.
              type: 'pic',
              pic: bare('03-about-mockup', null, {
                en: 'An angled laptop mockup of the About page, with a large spa photograph and Book a Treatment visible in the top navigation',
                id: 'Mockup laptop miring yang menampilkan halaman About, dengan foto spa besar dan tombol Book a Treatment terlihat di navigasi atas',
              }),
            },
          ],
        },
        {
          id: 'solution', label: { en: "Approach", id: "Pendekatan" },
          blocks: [
            {
              type: 'intro', under: true,
              title: { en: "Calm, with direction", id: "Tenang dan terarah" },
              text: [
                {
                  en: "Large, softly lit photographs set a slower pace. Deep green and off-white give the pages their rhythm; pale lime draws attention to actions. Playfair Display headings bring an editorial feel to the treatment content.",
                  id: "Foto besar dengan cahaya lembut memberi tempo yang lebih pelan. Hijau tua dan putih gading mengatur ritme halaman; hijau limau muda menandai tombol tindakan. Judul dengan Playfair Display memberi nuansa editorial pada konten perawatan.",
                },
                {
                  en: "The path to booking stays visible without taking over the page. Book a Treatment remains in the navigation, while a Book Now section closes six of the seven pages. On the service and treatment pages, booking actions sit close to the details people need to make a choice.",
                  id: "Cara memesan tetap terlihat tanpa mendominasi halaman. Tombol Book a Treatment tersedia di navigasi, sementara bagian Book Now menutup enam dari tujuh halaman. Pada halaman layanan dan perawatan, tombol memesan ditempatkan dekat informasi yang membantu orang memilih.",
                },
              ],
            },
            {
              type: 'pic',
              pic: pic('win', 'Serenity SPA - Style Guide', '04-type-scale', 1440, 895, '18335:752', {
                en: 'The style guide’s headings in Playfair Display, from Heading 1 at 88px down to Heading 6 at 24px, each with its line height',
                id: 'Judul-judul di style guide dengan Playfair Display, dari Heading 1 berukuran 88px sampai Heading 6 berukuran 24px, masing-masing dengan tinggi barisnya',
              }),
              pop: pic('dialog', 'Color palette', '05-color-palette', 744, 244, '18335:889', {
                en: 'The colour palette: Heading Color #000000, Primary Color #253828, Btn Color #D8F089 and Section Bg Color #F5F7F4',
                id: 'Palet warna: Heading Color #000000, Primary Color #253828, Btn Color #D8F089, dan Section Bg Color #F5F7F4',
              }),
            },
          ],
        },
        {
          id: 'pages', label: { en: 'Pages', id: "Halaman" },
          blocks: [
            {
              type: 'intro', under: true,
              title: { en: 'A page for each question', id: "Satu halaman, satu kebutuhan" },
              text: [{
                en: 'The Home page introduces the atmosphere and a first look at the services. From there, each page answers a different question: what is available, what a treatment includes, who is behind the spa concept, or how to get in touch.',
                id: "Beranda memperkenalkan suasana spa dan gambaran awal layanannya. Setelah itu, setiap halaman menjawab pertanyaan yang berbeda: pilihan perawatan, isi layanan, sosok di balik konsep spa, atau cara menghubunginya.",
              }],
            },
            {
              type: 'feature', label: { en: 'Services', id: "Layanan" },
              title: { en: "Explore treatments", id: "Jelajahi perawatan" },
              text: {
                en: 'Five treatments appear as staggered cards. A photo and short description introduce each option before the visitor opens its detail page.',
                id: "Lima perawatan ditampilkan dalam susunan kartu berselang-seling. Foto dan deskripsi singkat memperkenalkan tiap pilihan sebelum pengunjung membuka halaman detailnya.",
              },
              pic: pic('win', 'Serenity SPA - Services', '06-services', 1440, 1448, '18239:24', {
                en: 'The services grid: Therapeutic Massages, its photo filling the card behind Learn More, then Facial & Skin Treatments and Aromatherapy & Essential Oils',
                id: 'Grid layanan: Therapeutic Massages dengan fotonya memenuhi kartu di balik tombol Learn More, lalu Facial & Skin Treatments dan Aromatherapy & Essential Oils',
              }),
            },
            {
              type: 'feature', label: { en: 'Service page', id: "Halaman layanan" },
              title: { en: "Details beside price", id: "Detail dan harga" },
              text: {
                en: 'The service detail pairs its description with a price list and Book Now, so the offer and the next action can be read together. Related services follow below for anyone still comparing.',
                id: "Detail layanan menempatkan penjelasan di samping daftar harga dan tombol Book Now, sehingga informasi layanan dan langkah berikutnya bisa dibaca bersama. Layanan terkait muncul di bawah bagi pengunjung yang masih membandingkan.",
              },
              pic: pic('win', 'Serenity SPA - Therapeutic Massages', '07-service-page', 1440, 960, '18261:145', {
                en: 'A service page: the price list for four massages with Book Now, beside Learn About Services and Why choose our signature massage?',
                id: 'Halaman layanan: daftar harga empat jenis pijat dengan tombol Book Now, di samping Learn About Services dan Why choose our signature massage?',
              }),
            },
            {
              type: 'feature', label: { en: 'Treatment', id: "Perawatan" },
              title: { en: "Inside each treatment", id: "Isi perawatan" },
              text: {
                en: 'An accordion breaks down what the signature treatment includes. The booking action sits beside it; two priced add-ons follow after the main treatment is clear.',
                id: "Panel yang bisa dibuka-tutup merinci isi perawatan unggulan. Tombol memesan berada di sampingnya; dua layanan tambahan beserta harganya menyusul setelah perawatan utamanya dijelaskan.",
              },
              pic: pic('win', 'Serenity SPA - Treatments & Therapies', '08-treatment', 1440, 955, '18300:2793', {
                en: 'What’s Included in the Treatments?: Full-Body Therapeutic Massage open with its photo, above Luxury Facial & Skin Rejuvenation and Hydrotherapy & Detox Ritual',
                id: 'What’s Included in the Treatments?: Full-Body Therapeutic Massage terbuka dengan fotonya, di atas Luxury Facial & Skin Rejuvenation dan Hydrotherapy & Detox Ritual',
              }),
            },
            {
              type: 'feature', label: { en: 'About', id: "Tentang spa" },
              title: { en: "A sense of place", id: "Mengenal suasana" },
              text: {
                en: 'The About page uses layered portraits and spa photography to make the place feel tangible. A separate sample team section leaves room to introduce practitioners in a real version of the site.',
                id: "Halaman About memakai foto berlapis dan suasana spa agar tempatnya terasa lebih nyata. Bagian contoh tim memberi ruang untuk memperkenalkan terapis jika website ini dipakai oleh spa sungguhan.",
              },
              pic: pic('win', 'Serenity SPA - About', '09-about', 1440, 960, '18261:60', {
                en: 'The About page’s layered photographs beneath Rejuvenate Your Body, Refresh Your Mind, Restore Your Spirit',
                id: 'Foto berlapis di halaman About di bawah judul Rejuvenate Your Body, Refresh Your Mind, Restore Your Spirit',
              }),
            },
            {
              type: 'feature', label: { en: 'Blog', id: 'Blog' },
              title: { en: "Beyond the services", id: "Lebih dari layanan" },
              text: {
                en: 'The blog offers another way to explore the spa concept. Category tabs sit above article cards that pair a photograph with a title and date.',
                id: "Blog memberi jalur lain untuk mengenal konsep spa. Tab kategori berada di atas kartu artikel yang memasangkan foto dengan judul dan tanggal.",
              },
              pic: pic('win', 'Serenity SPA - Blog', '10-blog', 1440, 960, '18333:73', {
                en: 'Our Blog: category tabs above a grid of posts, each with a photo, title and date',
                id: 'Our Blog: tab kategori di atas grid artikel, masing-masing dengan foto, judul, dan tanggal',
              }),
            },
            {
              type: 'feature', label: { en: 'Contact', id: "Kontak" },
              title: { en: "Room for questions", id: "Ruang untuk bertanya" },
              text: {
                en: 'The Contact page opens with a message form. An FAQ accordion and contact details below give visitors a way to ask or check details before they commit to a treatment.',
                id: "Halaman Contact dibuka dengan formulir pesan. Panel FAQ dan informasi kontak di bawahnya memberi pengunjung tempat untuk bertanya atau memeriksa detail sebelum memilih perawatan.",
              },
              pic: pic('win', 'Serenity SPA - Contact', '11-contact', 1440, 800, '18284:243', {
                en: 'Get in Touch beside the Send us a message form: full name, email address, phone number and message, then Submit Now',
                id: 'Get in Touch di samping formulir Send us a message: nama lengkap, alamat email, nomor telepon, dan pesan, lalu tombol Submit Now',
              }),
            },
          ],
        },
        {
          id: 'mobile', label: { en: 'Mobile', id: "Mobile" },
          blocks: [
            {
              type: 'intro',
              title: { en: "Clear on small screens", id: "Jelas di layar kecil" },
              text: [{
                en: 'The mobile layouts stack the content into one column and collapse the navigation into a menu button. Treatment cards become a vertical list; on the therapy page, Book a Treatment appears before the accordion.',
                id: "Di tampilan mobile, konten disusun dalam satu kolom dan navigasi diringkas menjadi tombol menu. Kartu perawatan menjadi daftar vertikal; di halaman terapi, Book a Treatment muncul sebelum panel rincian.",
              }],
            },
            {
              type: 'row',
              pics: [
                pic('tool', 'Home', '12-m-home', 393, 852, '18311:75', {
                  en: 'The home page on a phone: Luxury Wellness & Tranquility, Redefined over the photo, with the menu bar under it',
                  id: 'Beranda di ponsel: Luxury Wellness & Tranquility, Redefined di atas foto, dengan bilah menu di bawahnya',
                }),
                pic('tool', 'Services', '13-m-services', 393, 852, '18320:3167', {
                  en: 'The services on a phone: cards in one column, each with a photo, a description and Learn More',
                  id: 'Layanan di ponsel: kartu dalam satu kolom, masing-masing dengan foto, deskripsi, dan tombol Learn More',
                }),
                pic('tool', 'Treatments & Therapies', '15-m-treatment', 393, 852, '18320:4023', {
                  en: 'What’s Included in the Treatments? on a phone: Book a Treatment above the accordion',
                  id: 'What’s Included in the Treatments? di ponsel: tombol Book a Treatment di atas akordeon',
                }),
              ],
            },
          ],
        },
        {
          id: 'outcome', label: { en: 'The result', id: 'Hasilnya' },
          blocks: [
            {
              type: 'intro',
              title: { en: 'One connected journey', id: 'Alur yang menyatu' },
              text: [
                {
                  en: 'The design links atmosphere, treatment browsing, service details, and contact through the same navigation and visual cues. Its desktop and mobile layouts show how those priorities shift with the available space.',
                  id: 'Desain ini menghubungkan suasana spa, pilihan perawatan, detail layanan, dan kontak melalui navigasi dan penanda visual yang sama. Tata letak desktop dan mobile menunjukkan bagaimana prioritasnya berubah mengikuti ruang layar.',
                },
                {
                  en: 'The interface and layouts are shown here. The people, prices, and testimonials are illustrative; a real spa would need its own content. No booking flow was built or measured.',
                  id: 'Yang ditampilkan di sini adalah desain antarmuka dan tata letaknya. Orang, harga, dan testimoni masih berupa contoh; spa sungguhan perlu memakai kontennya sendiri. Alur pemesanan belum dibangun atau diukur.',
                },
              ],
            },
          ],
        },
      ],
    },
  };
  const serenity = PF.cases['serenity-spa'];
  const attachSerenityImage = (image) => {
    if (image) image.src = `../${serenity.dir}/${image.file}.webp?v=3`;
  };
  attachSerenityImage(serenity.hero);
  serenity.chapters.forEach((chapter) => chapter.blocks.forEach((block) => {
    attachSerenityImage(block.pic);
    attachSerenityImage(block.pop);
    (block.pics || []).forEach(attachSerenityImage);
  }));
})();
