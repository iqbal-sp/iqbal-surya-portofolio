/*
  Case study pages, bilingual (en / id), keyed by a case's slug in PF.projects (content.js). Each page follows the
  owner's page for that case in Figma (file "Work area iqbal"), section by section, and the Case Study Player plays
  its sections as chapters; Serenity SPA has only its design, so its page is read from that. A case without a page
  here plays its overview only.

  Pictures are the owner's plain UI screenshots, no device around them: each sits on a CRT monitor (frame 'crt',
  4:3) or in an XP window of the app ('win', a 'tool' window or a 'dialog', titled by title). They go in
  asset/Work/<slug>/ under each slot's file name; until a slot has a src, the player shows a grey slot tagged with
  that file name and the size to export. node is the Figma frame the screen comes from.
*/
(function () {
  const PF = (window.PF = window.PF || {});
  const pic = (frame, title, file, w, h, node, alt) => ({ frame, title, file, w, h, node, alt, src: null });
  const crt = (file, node, alt) => pic('crt', null, file, 1024, 768, node, alt);
  const win = (title, file, node, alt) => pic('win', title, file, 1440, 900, node, alt);

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
          id: 'about', tone: 'tint', label: { en: 'About project', id: 'Tentang project' },
          blocks: [
            {
              type: 'intro',
              title: { en: 'Turning Conversations Into Conversions', id: 'Mengubah Percakapan Menjadi Konversi' },
              text: [
                {
                  en: 'An AI-powered multi-channel communication and CRM platform that centralizes conversations, automates workflows, and enhances team collaboration.',
                  id: 'Platform komunikasi multikanal dan CRM berbasis AI yang menyatukan percakapan, mengotomatiskan alur kerja, dan mempererat kolaborasi tim.',
                },
                {
                  en: 'Featuring customizable dashboards, lead scoring, and prompt-based commands, it streamlines sales, support, and marketing operations for maximum efficiency.',
                  id: 'Dengan dasbor yang bisa diatur sendiri, penilaian prospek, dan perintah berbasis prompt, platform ini merampingkan operasional penjualan, dukungan, dan pemasaran agar seefisien mungkin.',
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
          id: 'challenge', tone: 'tint', label: { en: 'Challenge', id: 'Tantangan' },
          blocks: [
            {
              type: 'quote',
              text: {
                en: 'Coordinating customer interactions across various platforms can be chaotic, leading to fragmented conversations, excessive manual tasks, and a lack of transparency among team members, resulting in delays, lost opportunities, and ineffective teamwork',
                id: 'Mengoordinasikan interaksi pelanggan di berbagai platform bisa kacau: percakapan jadi terpecah-pecah, tugas manual menumpuk, dan anggota tim kurang transparan satu sama lain, sehingga muncul keterlambatan, peluang yang hilang, dan kerja tim yang tidak efektif',
              },
            },
            {
              type: 'pic',
              pic: win('KROOL - Contact Detail', '03-inbox-contact', '574:12746', {
                en: 'KROOL’s inbox with a lead’s contact details, tags and linked deal beside the chat',
                id: 'Kotak masuk KROOL dengan detail kontak prospek, tag, dan deal terkait di samping chat',
              }),
            },
          ],
        },
        {
          id: 'solution', label: { en: 'Solution', id: 'Solusi' },
          blocks: [
            {
              type: 'intro', under: true,
              title: { en: 'From Chaos To Clarity', id: 'Dari Kekacauan Menjadi Kejelasan' },
              text: [{
                en: 'Our solution serves as a control center for all customer interactions. One dashboard for all channels, powered by AI to ensure no messages are missed, every prospect is automatically assessed, and every repetitive task is executed without manual intervention.',
                id: 'Solusi kami menjadi pusat kendali untuk semua interaksi pelanggan. Satu dasbor untuk semua kanal, didukung AI agar tidak ada pesan yang terlewat, setiap prospek dinilai otomatis, dan setiap tugas berulang berjalan tanpa campur tangan manual.',
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
            {
              type: 'pic', apart: true,
              pic: win('KROOL - Pipeline', '07-pipeline', '574:13084', {
                en: 'KROOL’s pipeline: lead cards in the New, Contacted, Demo Booked and Negotiation columns',
                id: 'Pipeline KROOL: kartu prospek di kolom New, Contacted, Demo Booked, dan Negotiation',
              }),
            },
          ],
        },
        {
          // from the dashboard on, the Figma's "showcase apps" section: one story, the product's screens
          id: 'showcase', label: { en: 'UI showcase', id: 'Showcase UI' },
          blocks: [
            { type: 'intro', title: { en: 'One Dashboard, Endless Possibilities', id: 'Satu Dasbor, Kemungkinan Tanpa Batas' } },
            {
              type: 'pic',
              pic: crt('08-dashboard', '574:13983', {
                en: 'KROOL’s dashboard, with conversation activity and the team’s tasks',
                id: 'Dasbor KROOL, dengan aktivitas percakapan dan tugas tim',
              }),
            },
            {
              type: 'feature', label: { en: 'Calendar', id: 'Kalender' },
              title: { en: 'Keep your team in sync, let the ideas link', id: 'Jaga tim tetap selaras, biarkan ide saling terhubung' },
              text: {
                en: 'Simplify your team’s workflow by managing schedules, deadlines, and events with an intuitive, integrated calendar designed for seamless collaboration.',
                id: 'Sederhanakan alur kerja tim dengan mengelola jadwal, tenggat, dan acara di kalender terintegrasi yang intuitif, dirancang untuk kolaborasi yang lancar.',
              },
              pic: win('KROOL - Calendar', '09-calendar', '574:13554', {
                en: 'KROOL’s calendar: a month of follow-ups and tasks',
                id: 'Kalender KROOL: tindak lanjut dan tugas selama satu bulan',
              }),
            },
            {
              type: 'feature', label: { en: 'Inbox', id: 'Kotak masuk' },
              title: { en: 'One powerful view for every conversation', id: 'Satu tampilan andal untuk setiap percakapan' },
              text: {
                en: 'Our unified inbox ensures you stay connected by consolidating messages from email, chat, social networks, and more into a single, easy-to-manage stream.',
                id: 'Kotak masuk terpadu kami membuat Anda tetap terhubung dengan menyatukan pesan dari email, chat, media sosial, dan lainnya ke dalam satu aliran yang mudah dikelola.',
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
              type: 'feature', label: { en: 'Analytics', id: 'Analitik' },
              title: { en: 'Turn data into actionable growth', id: 'Ubah data menjadi langkah untuk bertumbuh' },
              text: {
                en: 'Our analytics hub lets you track performance across all platforms, uncover new trends, and discover growth opportunities effortlessly.',
                id: 'Pusat analitik kami memudahkan Anda memantau kinerja di semua platform, menemukan tren baru, dan melihat peluang pertumbuhan tanpa repot.',
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
    // Figma node 577:37604 (named "Finova Detail Page" in the file). The hero's title, logline and tags are the case's
    // own (content.js). Its Figma sets the pictures in a laptop and tablets; the frames here take their place.
    sensorstack: {
      dir: 'asset/Work/sensorstack',
      hero: crt('01-hero-website', '577:37637', {
        en: 'SensorStack’s website: the Smart Monitoring Made Simple landing page over a preview of the live dashboard',
        id: 'Website SensorStack: halaman depan Smart Monitoring Made Simple di atas pratinjau dasbor langsung',
      }),
      chapters: [
        {
          id: 'about', tone: 'tint', label: { en: 'About project', id: 'Tentang project' },
          blocks: [
            {
              type: 'intro',
              title: { en: 'See It Before It Breaks', id: 'Lihat Gejalanya Sebelum Rusak' },
              text: [{
                en: 'SensorStack is a wireless IoT monitoring platform built for operations teams and facility leaders alike. It unifies door, temperature, and energy sensors across every location into one clear dashboard, giving plant managers instant alerts and executives the savings story. Simple to install, powerful in insight, and built to stop downtime before it starts.',
                id: 'SensorStack adalah platform pemantauan IoT nirkabel untuk tim operasional sekaligus pimpinan fasilitas. Platform ini menyatukan sensor pintu, suhu, dan energi dari semua lokasi ke dalam satu dasbor yang jelas, memberi manajer pabrik peringatan seketika dan memberi para eksekutif gambaran penghematannya. Mudah dipasang, kaya wawasan, dan dibuat untuk menghentikan downtime sebelum terjadi.',
              }],
            },
            {
              type: 'pic',
              pic: pic('tool', 'F1-C', '02-sensor-f1-c', 946, 334, '577:37647', {
                en: 'Sensor F1-C over two days: temperature, door and current on one chart, under a dotted limit line',
                id: 'Sensor F1-C selama dua hari: suhu, pintu, dan arus listrik dalam satu grafik, di bawah garis batas bertitik',
              }),
            },
          ],
        },
        {
          id: 'challenge', tone: 'tint', label: { en: 'Challenge', id: 'Tantangan' },
          blocks: [
            {
              type: 'quote',
              text: {
                en: 'One of the biggest challenges was turning thousands of raw sensor readings into something a plant manager could read at a glance. Making real-time alerts and multi-site data feel calm and actionable for every skill level required thoughtful design and development.',
                id: 'Salah satu tantangan terbesarnya adalah mengubah ribuan pembacaan sensor mentah menjadi sesuatu yang bisa dibaca manajer pabrik dalam sekali lihat. Membuat peringatan real-time dan data dari banyak lokasi terasa tenang dan bisa langsung ditindaklanjuti oleh pengguna dari semua tingkat keahlian butuh desain dan pengembangan yang matang.',
              },
            },
            {
              type: 'pic',
              pic: win('SensorStack - Dashboard', '03-dashboard', '577:37728', {
                en: 'SensorStack’s dashboard: door and temperature sensors by site, with a live chart for each cooler and freezer',
                id: 'Dasbor SensorStack: sensor pintu dan suhu per lokasi, dengan grafik langsung untuk setiap cooler dan freezer',
              }),
            },
          ],
        },
        {
          id: 'solution', label: { en: 'Solution', id: 'Solusi' },
          blocks: [
            {
              type: 'intro', under: true,
              title: { en: 'Built For Uptime, Designed For Clarity', id: 'Dibuat untuk Uptime, Dirancang untuk Kejelasan' },
              text: [
                {
                  en: 'A major challenge was designing a dashboard that combines live sensor streams, alerts, and energy analytics in one layout, making complex equipment data easy to read for users of all skill levels.',
                  id: 'Tantangan besarnya adalah merancang dasbor yang menggabungkan aliran data sensor langsung, peringatan, dan analitik energi dalam satu tata letak, sehingga data peralatan yang rumit mudah dibaca oleh pengguna dari semua tingkat keahlian.',
                },
                {
                  en: 'By prioritizing clarity and smart hierarchy, the dashboard surfaces what matters first (door status, temperature drift, and power draw) so teams can act fast, no matter their tech background.',
                  id: 'Dengan mengutamakan kejelasan dan hierarki yang cermat, dasbor menampilkan hal terpenting lebih dulu (status pintu, pergeseran suhu, dan pemakaian daya) agar tim bisa bertindak cepat, apa pun latar belakang teknisnya.',
                },
              ],
            },
            {
              type: 'trio',
              pics: [
                pic('tool', 'Integrations', '04-integrations', 660, 542, '577:37737', {
                  en: 'How SensorStack connects: Seamless Integration, Cost-Effective and No Complex Setup around a chip',
                  id: 'Cara SensorStack terhubung: Seamless Integration, Cost-Effective, dan No Complex Setup mengelilingi sebuah chip',
                }),
                pic('tool', 'Energy', '05-energy', 434, 267, '577:37802', {
                  en: 'Energy use over the week, falling toward Friday',
                  id: 'Pemakaian energi selama seminggu, menurun menjelang hari Jumat',
                }),
                pic('tool', 'Alerts', '06-alerts', 670, 450, '577:37752', {
                  en: 'Alerts: a low temperature alert issued in the freezer room, over an earlier one for extreme temperature swings in the same room',
                  id: 'Peringatan: suhu rendah di ruang freezer, di atas peringatan sebelumnya tentang suhu yang naik turun ekstrem di ruang yang sama',
                }),
              ],
            },
            {
              type: 'pic', apart: true,
              pic: win('SensorStack - Cooler C1', '07-cooler-c1', '577:37816', {
                en: 'Cooler C1: its door sensor reads Closed, its temperature updates live, and a chart tracks temperature, door and current',
                id: 'Cooler C1: sensor pintunya terbaca Closed, suhunya diperbarui langsung, dan grafik memantau suhu, pintu, serta arus listrik',
              }),
            },
          ],
        },
        {
          // from the dashboard on, the Figma's "showcase apps" section: one story, the product's screens
          id: 'showcase', label: { en: 'UI showcase', id: 'Showcase UI' },
          blocks: [
            { type: 'intro', title: { en: 'Built To Catch Failures Before They Cost You', id: 'Dibuat untuk Menangkap Kerusakan Sebelum Merugikan Anda' } },
            {
              type: 'pic',
              pic: crt('08-website', '577:37958', {
                en: 'SensorStack’s website: Smart Monitoring Made Simple, with the live dashboard below it',
                id: 'Website SensorStack: Smart Monitoring Made Simple, dengan dasbor langsung di bawahnya',
              }),
            },
            {
              type: 'feature', label: { en: 'Analytics', id: 'Analitik' },
              title: { en: 'Watch every sensor, spot every signal', id: 'Pantau setiap sensor, tangkap setiap sinyal' },
              text: {
                en: 'SensorStack’s dashboard pulls door status, temperature, and current draw from every site into a single live view, so your team stops walking the floor and starts making decisions.',
                id: 'Dasbor SensorStack menarik status pintu, suhu, dan arus listrik dari setiap lokasi ke dalam satu tampilan langsung, sehingga tim Anda tidak perlu lagi berkeliling dan bisa langsung mengambil keputusan.',
              },
              pic: win('SensorStack - Analytics', '09-analytics', '577:37955', {
                en: 'SensorStack’s analytics screen',
                id: 'Layar analitik SensorStack',
              }),
            },
            {
              type: 'feature', label: { en: 'API Connection', id: 'Koneksi API' },
              title: { en: 'Plug it in, power it up', id: 'Pasang, lalu nyalakan' },
              text: {
                en: 'Pre-programmed wireless sensors and a plug-and-play data collector connect to your existing systems. No rewiring, no heavy IT lift, just actionable data from day one.',
                id: 'Sensor nirkabel yang sudah terprogram dan pengumpul data plug-and-play langsung terhubung ke sistem yang sudah Anda punya. Tanpa kabel ulang, tanpa beban IT yang berat, hanya data yang bisa langsung dipakai sejak hari pertama.',
              },
              pic: win('SensorStack - API Connection', '10-api-connection', '577:37956', {
                en: 'SensorStack’s API connection screen',
                id: 'Layar koneksi API SensorStack',
              }),
              // the Figma keeps an empty 440 by 440 frame here, as KROOL's page does for its teammate card
              pop: pic('dialog', 'SensorStack', '11-api-card', 440, 440, '577:37971', {
                en: 'A SensorStack card for the API connection',
                id: 'Kartu SensorStack untuk koneksi API',
              }),
            },
            {
              type: 'feature', label: { en: 'R-Management', id: 'R-Management' },
              title: { en: 'Catch the fault before it halts', id: 'Tangkap gangguan sebelum semuanya berhenti' },
              text: {
                en: 'SensorStack flags every out-of-spec reading the moment it happens, surfacing freezer drift, open doors, and failing compressors before they ever cost you product.',
                id: 'SensorStack menandai setiap pembacaan di luar batas saat itu juga, memunculkan suhu freezer yang bergeser, pintu yang terbuka, dan kompresor yang mulai gagal sebelum semuanya merugikan produk Anda.',
              },
              pic: win('SensorStack - R-Management', '12-r-management', '577:37986', {
                en: 'SensorStack’s R-Management screen',
                id: 'Layar R-Management SensorStack',
              }),
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
          id: 'about', tone: 'tint', label: { en: 'About project', id: 'Tentang project' },
          blocks: [
            {
              type: 'intro',
              title: { en: 'Connect With A Mentor, Shape Your Tomorrow', id: 'Terhubung dengan Mentor, Bentuk Masa Depan Anda' },
              text: [
                {
                  en: 'FindMentor is a mentorship platform designed specifically to help mentees progress toward their professional and personal goals through structured guidance.',
                  id: 'FindMentor adalah platform mentoring yang dirancang khusus untuk membantu mentee mencapai tujuan profesional dan pribadinya lewat bimbingan yang terstruktur.',
                },
                {
                  en: 'The platform provides a seamless, goal-oriented user experience with features that support mentee learning, skill development, and consistent progress tracking.',
                  id: 'Platform ini memberikan pengalaman pengguna yang lancar dan berorientasi pada tujuan, dengan fitur yang mendukung pembelajaran mentee, pengembangan keterampilan, dan pemantauan progres yang konsisten.',
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
          id: 'challenge', tone: 'tint', label: { en: 'Challenge', id: 'Tantangan' },
          blocks: [
            {
              type: 'quote',
              text: {
                en: 'Finding a compatible mentor and managing the mentorship process can be overwhelming for mentees. Many struggle to identify mentors that align with their goals, track progress effectively, and stay engaged throughout their learning journey.',
                id: 'Menemukan mentor yang cocok dan mengelola proses mentoring bisa terasa berat bagi mentee. Banyak yang kesulitan menemukan mentor yang sejalan dengan tujuan mereka, memantau progres dengan efektif, dan tetap terlibat sepanjang perjalanan belajar mereka.',
              },
            },
            {
              type: 'pic',
              pic: win('FindMentor - Mentor Dashboard', '03-mentor-dashboard', '577:38635', {
                en: 'A mentor’s dashboard in FindMentor: mentoring time statistics, the week’s sessions, mentorship insights and recent bookings',
                id: 'Dasbor mentor di FindMentor: statistik waktu mentoring, sesi minggu ini, mentorship insights, dan booking terbaru',
              }),
            },
          ],
        },
        {
          id: 'solution', label: { en: 'Solution', id: 'Solusi' },
          blocks: [
            {
              type: 'intro', under: true,
              title: { en: 'Findmentor As A Solution', id: 'Findmentor Sebagai Solusi' },
              text: [{
                en: 'FindMentor simplifies mentorship by providing AI-driven mentor matching, a streamlined dashboard for tracking assignments and goals, and real-time progress analytics. It empowers mentees to stay organized, achieve their objectives & build meaningful relationships with mentors efficiently.',
                id: 'FindMentor menyederhanakan mentoring lewat pencocokan mentor berbasis AI, dasbor yang ringkas untuk memantau tugas dan tujuan, serta analitik progres real-time. Platform ini membantu mentee tetap teratur, mencapai targetnya, dan membangun hubungan yang bermakna dengan mentor secara efisien.',
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
            {
              type: 'pic', apart: true,
              pic: pic('win', 'FindMentor - Progress', '07-progress', 1204, 564, '577:38822', {
                en: 'FindMentor’s progress view: assignments left, attended sessions, completion rate, assignment submissions, attendance and recent activity by day',
                id: 'Tampilan progres FindMentor: sisa tugas, sesi yang dihadiri, tingkat penyelesaian, pengumpulan tugas, kehadiran, dan aktivitas terbaru per hari',
              }),
            },
          ],
        },
        {
          // from the dashboard on, the Figma's "showcase apps" section: one story, the product's screens
          id: 'showcase', label: { en: 'UI showcase', id: 'Showcase UI' },
          blocks: [
            { type: 'intro', title: { en: 'Guidance That Scales With Your Ambition', id: 'Bimbingan yang Tumbuh Bersama Ambisi Anda' } },
            {
              type: 'pic',
              pic: crt('08-dashboard', '577:39043', {
                en: 'FindMentor’s mentee dashboard with assignments, sessions, recommended mentors and a learning streak',
                id: 'Dasbor mentee FindMentor dengan tugas, sesi, mentor yang direkomendasikan, dan streak belajar',
              }),
            },
            {
              // the owner's labels, matched to each feature (2026-09-25); the Figma still says Calendar, Inbox and Analytics
              type: 'feature', label: { en: 'Goals', id: 'Tujuan' },
              title: { en: 'Set Goals, Track Progress, and Achieve Greatness!', id: 'Tetapkan Tujuan, Pantau Progres, dan Raih Pencapaian!' },
              text: {
                en: 'Set, prioritize, and track your goals effortlessly. Manage assignments with deadlines, monitor milestones, and celebrate achievements with tools designed to keep you on the path to success.',
                id: 'Tetapkan, prioritaskan, dan pantau tujuan Anda dengan mudah. Kelola tugas beserta tenggatnya, pantau tonggak pencapaian, dan rayakan keberhasilan dengan alat yang dirancang untuk menjaga Anda tetap di jalur menuju sukses.',
              },
              pic: pic('win', 'FindMentor - Goals', '09-goals', 838, 560, '577:38951', {
                en: 'A goal in FindMentor, Draft Your Unique Personal Brand Statement, with its due date, completion bar and task list',
                id: 'Sebuah tujuan di FindMentor, Draft Your Unique Personal Brand Statement, dengan tenggat, bar penyelesaian, dan daftar tugasnya',
              }),
            },
            {
              type: 'feature', label: { en: 'Booking', id: 'Jadwal sesi' },
              title: { en: 'Schedule Easily, Learn Freely!', id: 'Jadwalkan dengan Mudah, Belajar dengan Leluasa!' },
              text: {
                en: 'Easily schedule mentoring sessions with an intuitive booking system. Adjusts for time zones automatically, ensuring a seamless experience for global users.',
                id: 'Jadwalkan sesi mentoring dengan mudah lewat sistem booking yang intuitif. Zona waktu menyesuaikan secara otomatis, sehingga pengalaman tetap lancar bagi pengguna di seluruh dunia.',
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
              type: 'feature', label: { en: 'Feedback', id: 'Masukan' },
              title: { en: 'Capture Insights, Track Growth!', id: 'Tangkap Wawasan, Pantau Pertumbuhan!' },
              text: {
                en: 'Capture and review mentor feedback with ease. Keep track of session highlights, action items, and guidance to ensure continuous improvement.',
                id: 'Tangkap dan tinjau masukan mentor dengan mudah. Catat sorotan sesi, poin tindakan, dan arahan untuk memastikan perbaikan yang berkelanjutan.',
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
          id: 'about', tone: 'tint', label: { en: 'About project', id: 'Tentang project' },
          blocks: [
            {
              type: 'intro',
              title: { en: 'Helping you find space when you need it most', id: 'Membantu Anda menemukan ruang saat paling dibutuhkan' },
              text: [{
                en: 'Boxify combines innovative mobile and web platforms to deliver a seamless self-storage experience tailored for modern individuals and businesses. With advanced features, flexible services, and a focus on user experience, Boxify transforms storage into a user-friendly, secure, and tech-driven process.',
                id: 'Boxify memadukan platform mobile dan web yang inovatif untuk menghadirkan pengalaman self-storage yang mulus, dirancang untuk individu dan bisnis modern. Dengan fitur canggih, layanan yang fleksibel, dan fokus pada pengalaman pengguna, Boxify mengubah penyimpanan barang menjadi proses yang mudah digunakan, aman, dan berbasis teknologi.',
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
          id: 'process', tone: 'tint', label: { en: 'Process', id: 'Proses' },
          blocks: [
            {
              // the Behance shows the sitemap and the wireframes without words; this text reads them
              type: 'intro',
              title: { en: 'Sitemap and wireframe', id: 'Sitemap dan wireframe' },
              text: [{
                en: 'The sitemap follows the app from Sign In / Sign Up to its five tabs: Home, Find, My Box, Notification and Profile. In Find, a map or a list leads to each unit’s detail: its price, size, security and cameras, an AR preview and the booking button. My Box keeps the units already booked, with the time left, the humidity and temperature, and the booking history. The wireframes set out the website’s pages in greyscale.',
                id: 'Sitemap memetakan aplikasi dari Sign In / Sign Up ke lima tabnya: Home, Find, My Box, Notification, dan Profile. Di Find, peta atau daftar mengantar ke detail setiap unit: harga, ukuran, keamanan dan kamera, pratinjau AR, serta tombol pemesanan. My Box menyimpan unit yang sudah dipesan, lengkap dengan sisa waktu, kelembapan dan suhu, serta riwayat pemesanan. Wireframe menyusun halaman-halaman website dalam skala abu-abu.',
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
          id: 'website', label: { en: 'Website', id: 'Website' },
          blocks: [
            {
              // the heading is the website's own headline
              type: 'intro', under: true,
              title: { en: 'Your flexible self-storage solutions', id: 'Solusi self-storage yang fleksibel untuk Anda' },
              text: [{
                en: 'We are designing a new website for a platform to enhance the user experience in booking rooms.',
                id: 'Kami merancang website baru untuk sebuah platform, agar pengalaman pengguna saat memesan ruang penyimpanan jadi lebih baik.',
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
          id: 'app', label: { en: 'Mobile app', id: 'Aplikasi mobile' },
          blocks: [
            {
              // the heading is the website's own line for the app
              type: 'intro',
              title: { en: 'Take control of your private storage', id: 'Kendalikan penyimpanan pribadi Anda' },
              text: [{
                en: 'Features that make it easy for users to access and obtain information about the rooms they want to book and their own rooms. Monitor everything in one convenient place.',
                id: 'Fitur-fitur yang memudahkan pengguna mengakses dan mendapatkan informasi tentang ruang yang ingin mereka pesan maupun ruang milik mereka sendiri. Pantau semuanya dari satu tempat yang praktis.',
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
              type: 'feature', label: { en: 'Storage needs', id: 'Kebutuhan penyimpanan' },
              title: { en: 'Simplify your storage journey', id: 'Sederhanakan perjalanan penyimpanan Anda' },
              text: {
                en: 'From finding the perfect unit to secure access and effortless management, we make storing your belongings seamless, safe, and stress-free.',
                id: 'Dari menemukan unit yang pas hingga akses yang aman dan pengelolaan yang mudah, kami membuat penyimpanan barang Anda lancar, aman, dan bebas repot.',
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
              type: 'feature', label: { en: 'Find', id: 'Cari' },
              title: { en: 'Find the nearest room unit to you', id: 'Temukan unit ruang terdekat dari Anda' },
              text: {
                en: 'Easily discover room units at affordable prices within the Boxify app and tailor the space to your needs.',
                id: 'Temukan unit ruang dengan harga terjangkau di aplikasi Boxify dengan mudah, lalu sesuaikan ruangnya dengan kebutuhan Anda.',
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
              type: 'feature', label: { en: 'Booking', id: 'Pemesanan' },
              title: { en: 'Book your space in minutes', id: 'Pesan ruang Anda dalam hitungan menit' },
              text: {
                en: 'Find, select, and secure your storage unit anytime, anywhere, all from the palm of your hand.',
                id: 'Temukan, pilih, dan amankan unit penyimpanan Anda kapan saja, di mana saja, cukup dari genggaman tangan.',
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
              title: { en: 'Control at your fingertips', id: 'Kendali di ujung jari Anda' },
              text: {
                en: 'Book, access, and monitor your storage unit effortlessly with our intuitive mobile app.',
                id: 'Pesan, akses, dan pantau unit penyimpanan Anda dengan mudah lewat aplikasi mobile kami yang intuitif.',
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
    // Figma file "Serenity SPA Webflow", page HiFi (2058:34). The owner has only the design, a Webflow template: seven
    // pages, each for desktop and mobile, and a style guide. So the text only describes what the design shows, and each
    // page's feature is titled with that page's own headline. A crop takes the top of its node unless its alt says.
    'serenity-spa': {
      dir: 'asset/Work/serenity-spa',
      hero: crt('01-hero-home', '18414:80', {
        en: 'Serenity SPA’s home page: Luxury Wellness & Tranquility, Redefined, over a photo of a head massage by candlelight',
        id: 'Beranda Serenity SPA: Luxury Wellness & Tranquility, Redefined, di atas foto pijat kepala dengan cahaya lilin',
      }),
      chapters: [
        {
          id: 'about', tone: 'tint', label: { en: 'About project', id: 'Tentang project' },
          blocks: [
            {
              type: 'intro',
              title: { en: 'A spa website template for Webflow', id: 'Template website spa untuk Webflow' },
              text: [{
                en: 'Serenity SPA is a website template for spas, designed for Webflow. Each of its seven pages (Home, About, Services, a service page, Treatments & Therapies, Blog and Contact) comes in a desktop and a mobile version, and a style guide page sets out the type and colours they share.',
                id: 'Serenity SPA adalah template website untuk spa, dirancang untuk Webflow. Ketujuh halamannya (Home, About, Services, halaman layanan, Treatments & Therapies, Blog, dan Contact) masing-masing punya versi desktop dan mobile, dan halaman style guide memuat huruf serta warna yang dipakai bersama.',
              }],
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
          id: 'style', tone: 'tint', label: { en: 'Style guide', id: 'Panduan gaya' },
          blocks: [
            {
              // the title is the style guide's own phrase, "the core design elements used throughout the template"
              type: 'intro',
              title: { en: 'The core design elements', id: 'Elemen desain inti' },
              text: [{
                en: 'The template sets its headings and body text in Playfair Display, with six heading sizes from 88px down to 24px. Its palette has four colours: black for headings, a deep green as the primary colour (#253828), a pale lime for buttons (#D8F089) and an off-white for section backgrounds (#F5F7F4).',
                id: 'Template ini memakai Playfair Display untuk judul dan teks isi, dengan enam ukuran judul dari 88px sampai 24px. Paletnya berisi empat warna: hitam untuk judul, hijau tua sebagai warna utama (#253828), hijau limau pucat untuk tombol (#D8F089), dan putih keabuan untuk latar section (#F5F7F4).',
              }],
            },
            {
              type: 'pic',
              pic: pic('win', 'Serenity SPA - Style Guide', '03-type-scale', 1440, 895, '18335:752', {
                en: 'The style guide’s headings in Playfair Display, from Heading 1 at 88px down to Heading 6 at 24px, each with its line height',
                id: 'Judul-judul di style guide dengan Playfair Display, dari Heading 1 berukuran 88px sampai Heading 6 berukuran 24px, masing-masing dengan tinggi barisnya',
              }),
              pop: pic('dialog', 'Color palette', '04-color-palette', 700, 240, '18335:889', {
                en: 'The colour palette: Heading Color #000000, Primary Color #253828, Btn Color #D8F089 and Section Bg Color #F5F7F4',
                id: 'Palet warna: Heading Color #000000, Primary Color #253828, Btn Color #D8F089, dan Section Bg Color #F5F7F4',
              }),
            },
          ],
        },
        {
          id: 'pages', label: { en: 'Pages', id: 'Halaman' },
          blocks: [
            {
              type: 'intro', under: true,
              title: { en: 'Seven pages', id: 'Tujuh halaman' },
              text: [{
                en: 'Every page opens on a large headline and closes on the same footer, with a Book Now banner above it on every page but Contact.',
                id: 'Setiap halaman dibuka dengan judul besar dan ditutup dengan footer yang sama, dengan banner Book Now di atasnya di semua halaman kecuali Contact.',
              }],
            },
            {
              type: 'feature', label: { en: 'Services', id: 'Layanan' },
              title: { en: 'Our Signature Services', id: 'Layanan unggulan kami' },
              text: {
                en: 'The services page sets the five treatments in a staggered grid of cards, each with a photo and a short description.',
                id: 'Halaman layanan menata kelima perawatan dalam grid kartu yang berselang-seling, masing-masing dengan foto dan deskripsi singkat.',
              },
              pic: pic('win', 'Serenity SPA - Services', '05-services', 1440, 1448, '18239:24', {
                en: 'The services grid: Therapeutic Massages, its photo filling the card behind Learn More, then Facial & Skin Treatments and Aromatherapy & Essential Oils',
                id: 'Grid layanan: Therapeutic Massages dengan fotonya memenuhi kartu di balik tombol Learn More, lalu Facial & Skin Treatments dan Aromatherapy & Essential Oils',
              }),
            },
            {
              type: 'feature', label: { en: 'Service page', id: 'Halaman layanan' },
              title: { en: 'Therapeutic Massages', id: 'Pijat terapeutik' },
              text: {
                en: 'Each service has its own page: a price list with Book Now sits beside the description, and three other services follow it.',
                id: 'Setiap layanan punya halamannya sendiri: daftar harga dengan tombol Book Now ada di samping deskripsi, lalu tiga layanan lain menyusul di bawahnya.',
              },
              pic: pic('win', 'Serenity SPA - Therapeutic Massages', '06-service-page', 1440, 960, '18261:145', {
                en: 'A service page: the price list for four massages with Book Now, beside Learn About Services and Why choose our signature massage?',
                id: 'Halaman layanan: daftar harga empat jenis pijat dengan tombol Book Now, di samping Learn About Services dan Why choose our signature massage?',
              }),
            },
            {
              type: 'feature', label: { en: 'Treatment', id: 'Perawatan' },
              title: { en: 'Signature Serenity Experience', id: 'Signature Serenity Experience' },
              text: {
                en: 'The signature treatment’s page lists what it includes in an accordion beside Book a Treatment, then offers two add-ons with their prices.',
                id: 'Halaman perawatan unggulan memuat isi perawatannya dalam akordeon di samping tombol Book a Treatment, lalu menawarkan dua tambahan beserta harganya.',
              },
              pic: pic('win', 'Serenity SPA - Treatments & Therapies', '07-treatment', 1440, 955, '18300:2793', {
                en: 'What’s Included in the Treatments?: Full-Body Therapeutic Massage open with its photo, above Luxury Facial & Skin Rejuvenation and Hydrotherapy & Detox Ritual',
                id: 'What’s Included in the Treatments?: Full-Body Therapeutic Massage terbuka dengan fotonya, di atas Luxury Facial & Skin Rejuvenation dan Hydrotherapy & Detox Ritual',
              }),
            },
            {
              type: 'feature', label: { en: 'About', id: 'Tentang' },
              title: { en: 'A Sanctuary of Serenity and Wellness', id: 'Tempat yang tenang untuk kebugaran' },
              text: {
                en: 'The about page introduces the spa, its services and why to choose it, then the team: three people, each with a portrait, a name and a role.',
                id: 'Halaman tentang memperkenalkan spa, layanannya, dan alasan memilihnya, lalu timnya: tiga orang, masing-masing dengan foto, nama, dan perannya.',
              },
              pic: pic('win', 'Serenity SPA - About', '08-about', 1440, 800, '18261:4', {
                en: 'The about page’s opening: A Sanctuary of Serenity and Wellness over a photo of a bathtub, with a second photo, of a woman in a robe, set into it',
                id: 'Pembuka halaman tentang: A Sanctuary of Serenity and Wellness di atas foto bak mandi, dengan foto kedua, seorang perempuan berjubah mandi, di tengahnya',
              }),
            },
            {
              type: 'feature', label: { en: 'Blog', id: 'Blog' },
              title: { en: 'Latest Wellness Insights & Self-Care Tips', id: 'Wawasan kebugaran dan tips perawatan diri terbaru' },
              text: {
                en: 'The blog sorts its posts by category, and each card carries a photo, a title, a short excerpt and the date.',
                id: 'Blog memilah artikelnya menurut kategori, dan setiap kartu memuat foto, judul, kutipan singkat, dan tanggal.',
              },
              pic: pic('win', 'Serenity SPA - Blog', '09-blog', 1440, 880, '18333:73', {
                en: 'Our Blog: category tabs above a grid of posts, each with a photo, a title, an excerpt and a date',
                id: 'Our Blog: tab kategori di atas grid artikel, masing-masing dengan foto, judul, kutipan, dan tanggal',
              }),
            },
            {
              type: 'feature', label: { en: 'Contact', id: 'Kontak' },
              title: { en: 'Get in Touch', id: 'Hubungi kami' },
              text: {
                en: 'The contact page opens with the message form, then answers common questions in an accordion and lists the email addresses and the phone number.',
                id: 'Halaman kontak dibuka dengan formulir pesan, lalu menjawab pertanyaan umum dalam akordeon dan mencantumkan alamat email serta nomor telepon.',
              },
              pic: pic('win', 'Serenity SPA - Contact', '10-contact', 1440, 800, '18284:243', {
                en: 'Get in Touch beside the Send us a message form: full name, email address, phone number and message, then Submit Now',
                id: 'Get in Touch di samping formulir Send us a message: nama lengkap, alamat email, nomor telepon, dan pesan, lalu tombol Submit Now',
              }),
            },
          ],
        },
        {
          id: 'mobile', label: { en: 'Mobile', id: 'Mobile' },
          blocks: [
            {
              type: 'intro',
              title: { en: 'The same pages at 393px', id: 'Halaman yang sama di lebar 393px' },
              text: [{
                en: 'On a phone the menu folds into one button, the sections stack into a single column, and the service page moves its price list under the text.',
                id: 'Di ponsel, menu dilipat menjadi satu tombol, section-section ditumpuk dalam satu kolom, dan halaman layanan memindahkan daftar harganya ke bawah teks.',
              }],
            },
            {
              type: 'row',
              pics: [
                pic('tool', 'Home', '11-m-home', 393, 852, '18311:75', {
                  en: 'The home page on a phone: Luxury Wellness & Tranquility, Redefined over the photo, with the menu bar under it',
                  id: 'Beranda di ponsel: Luxury Wellness & Tranquility, Redefined di atas foto, dengan bilah menu di bawahnya',
                }),
                pic('tool', 'Services', '12-m-services', 393, 852, '18320:3167', {
                  en: 'The services on a phone: cards in one column, each with a photo, a description and Learn More',
                  id: 'Layanan di ponsel: kartu dalam satu kolom, masing-masing dengan foto, deskripsi, dan tombol Learn More',
                }),
                pic('tool', 'Therapeutic Massages', '13-m-service', 393, 852, '18320:3765', {
                  en: 'A service page on a phone: the price list under the text, with Book Now',
                  id: 'Halaman layanan di ponsel: daftar harga di bawah teks, dengan tombol Book Now',
                }),
              ],
            },
            {
              type: 'row',
              pics: [
                pic('tool', 'Treatments & Therapies', '14-m-treatment', 393, 852, '18320:4023', {
                  en: 'What’s Included in the Treatments? on a phone: Book a Treatment above the accordion',
                  id: 'What’s Included in the Treatments? di ponsel: tombol Book a Treatment di atas akordeon',
                }),
                pic('tool', 'Blog', '15-m-blog', 393, 852, '18333:419', {
                  en: 'The blog on a phone: category tabs, then the posts in one column',
                  id: 'Blog di ponsel: tab kategori, lalu artikel dalam satu kolom',
                }),
                pic('tool', 'Contact', '16-m-contact', 393, 852, '18320:4261', {
                  en: 'Get in Touch on a phone, with the message form under the headline',
                  id: 'Get in Touch di ponsel, dengan formulir pesan di bawah judul',
                }),
              ],
            },
          ],
        },
      ],
    },
  };
})();
