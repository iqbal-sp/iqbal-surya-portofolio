/*
  Portfolio content, bilingual (en / id).
  To add before launch: each case study's page (in shared/cases.js, after the owner's Figma; outcomes are
  written in words, the owner's case studies carry no metrics), PF.home.shorts (the owner's UI shots),
  owner.sideProjects, owner.cv.
*/
(function () {
  const PF = (window.PF = window.PF || {});

  PF.owner = {
    name: 'Iqbal Surya',
    fullName: 'Iqbal Surya Pratama',
    first: 'Iqbal',
    last: 'Surya',
    initials: 'IS',
    since: 2020,
    role: { en: 'Product Designer', id: 'Product Designer' },
    location: { en: 'Indonesia', id: 'Indonesia' },
    status: { en: 'Open for work', id: 'Terbuka untuk kerja' },
    statusLong: {
      en: 'Available for full-time roles and freelance projects',
      id: 'Tersedia untuk posisi full-time dan project freelance',
    },
    tagline: {
      en: 'I design websites and apps that look sharp and work properly.',
      id: 'Saya merancang website dan aplikasi yang tampil rapi dan berfungsi dengan baik.',
    },
    to: { en: 'friends, teams, and future clients', id: 'teman, tim, dan calon klien' },
    // the About card's intro, kept to three sentences: the card's facts already say where and since when,
    // and the hobbies have their own panel further down
    intro: {
      en: 'I design websites and apps with teams around the world, and I build many of the sites myself in Webflow and Framer. Building them taught me to put clarity first: the blueprint before the house. My workflow balances speed and quality, so what I make works as well as it looks.',
      id: 'Saya merancang website dan aplikasi bersama tim dari berbagai negara, dan membangun banyak website-nya sendiri di Webflow dan Framer. Dari situ saya belajar mengutamakan kejelasan: rancang cetak birunya dulu, baru bangun rumahnya. Alur kerja saya menyeimbangkan kecepatan dan kualitas, supaya yang saya buat berfungsi sebaik tampilannya.',
    },
    // the About card's facts: `since` above is the year the owner started designing UI (the print job before it
    // does not count); the region is the one on the owner's LinkedIn profile, the time zone the one the FAQ gives;
    // the languages are LinkedIn's (the CV also prints each one's level)
    base: { en: 'North Sumatra, Indonesia (GMT+7)', id: 'Sumatera Utara, Indonesia (GMT+7)' },
    languages: [
      { en: 'Indonesian', id: 'Indonesia', level: { en: 'Native or bilingual', id: 'Penutur asli' } },
      { en: 'English', id: 'Inggris', level: { en: 'Limited working proficiency', id: 'Kemampuan kerja terbatas' } },
    ],
    email: 'hello@iqbalsurya.com',
    photo: '../asset/iqba-surya.png',
    // The CV PDF per language, printed from resume/cv.html by `node resume/build.mjs`.
    // Empty = the Resume dialog offers to send it by email instead.
    cv: { en: '../asset/cv/Iqbal-Surya-Pratama-Resume.pdf', id: '../asset/cv/Iqbal-Surya-Pratama-CV.pdf' },
    socials: [
      { key: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/iqbal-surya-pratama-29b2811a3/', handle: 'Iqbal Surya Pratama' },
      { key: 'dribbble', label: 'Dribbble', url: 'https://dribbble.com/iqbalsp', handle: '@iqbalsp' },
      { key: 'behance', label: 'Behance', url: 'https://www.behance.net/iqbalsurya', handle: '@iqbalsurya' },
      { key: 'upwork', label: 'Upwork', url: 'https://www.upwork.com/freelancers/~018ed569cba0f751f6', handle: { en: 'Freelancer profile', id: 'Profil freelancer' } },
    ],

    // Work log in the order and with the titles of the owner's LinkedIn profile (export of 2026-09-25).
    // Type: 'ft' full-time, 'fl' freelance, as the owner confirmed on 2026-09-25 (LinkedIn's export has none).
    // Places LinkedIn leaves out are kept from the owner's earlier list.
    worklog: [
      { from: '2024/10', to: null, role: 'UI Designer', org: 'Natuno', type: 'ft', place: 'Jakarta, Indonesia' },
      { from: '2021/08', to: null, role: 'UI Designer', org: 'Upwork', type: 'fl', place: '' },
      { from: '2022/08', to: '2023/07', role: 'User Interface Designer', org: 'TeamUp Agency', type: 'ft', place: 'Yogyakarta, Special Region of Yogyakarta' },
      { from: '2022/05', to: '2022/08', role: 'User Interface Designer', org: 'TeamUp Agency', type: 'fl', place: 'Yogyakarta, Special Region of Yogyakarta' },
      { from: '2022/08', to: '2023/04', role: 'UI/UX Designer for Scientific Research', org: 'Omic', type: 'fl', place: 'Seattle, Washington, United States' },
      { from: '2021/10', to: '2021/12', role: 'UI Designer', org: 'Slab! Design Studio', type: 'fl', place: 'Yogyakarta, Special Region of Yogyakarta' },
      { from: '2021/10', to: '2021/11', role: 'UI Designer', org: 'TEQQED', type: 'fl', place: 'Heerenveen, Friesland' },
      { from: '2021/03', to: '2021/06', role: 'UI Designer', org: 'Drip Design', type: 'fl', place: 'Toronto, Canada' },
      { from: '2019/06', to: '2021/03', role: 'Designer', org: 'CV. Kresna Digital Printing', type: 'ft', place: 'Medan, North Sumatra, Indonesia' },
    ],
    sideProjects: [
      { name: 'Bestrfra.me', year: 2021, kind: { en: 'Website', id: 'Website' }, desc: { en: 'A frame-picking tool for photos, built to learn responsive layout.', id: 'Tool memilih bingkai foto, dibuat untuk belajar layout responsif.' }, url: '#' },
      { name: 'Pixel Kit 98', year: 2024, kind: { en: 'Figma UI kit', id: 'UI kit Figma' }, desc: { en: 'Windows 98 components rebuilt as a modern auto-layout kit.', id: 'Komponen Windows 98 yang dibangun ulang sebagai kit auto-layout modern.' }, url: '#' },
      { name: 'Kopi Log', year: 2025, kind: { en: 'Mobile app concept', id: 'Konsep aplikasi mobile' }, desc: { en: 'A brew journal for home baristas: beans, grind, and taste notes.', id: 'Jurnal seduh untuk barista rumahan: biji, gilingan, dan catatan rasa.' }, url: '#' },
      { name: 'Transit Jogja', year: 2023, kind: { en: 'Redesign exploration', id: 'Eksplorasi redesign' }, desc: { en: 'What if city bus info fit on one clear screen?', id: 'Bagaimana jika info bus kota muat di satu layar yang jelas?' }, url: '#' },
    ],
    // Off the clock: the owner's 9:16 photos (asset/about/*.png, 2026-09-25), served as <photo>-360/-480/-720.webp.
    // The label is the photo's name tag; pointing at or tapping the photo opens the note in an infotip.
    // Traveling's and book's notes are kept from the earlier panel; culinary's and coffee's are drafts for the owner to confirm.
    hobbies: [
      { photo: '../asset/about/traveling', label: { en: 'Traveling', id: 'Jalan-jalan' }, note: { en: 'New places, new problems to notice', id: 'Tempat baru, masalah baru untuk diamati' } },
      { photo: '../asset/about/culinary', label: { en: 'Culinary', id: 'Kuliner' }, note: { en: 'Food I haven’t tried yet', id: 'Makanan yang belum pernah saya coba' } },
      { photo: '../asset/about/coffee', label: { en: 'Coffee', id: 'Kopi' }, note: { en: 'Trying new beans and new cafés', id: 'Mencoba biji kopi dan kafe baru' } },
      { photo: '../asset/about/book', label: { en: 'Book', id: 'Buku' }, note: { en: 'Design, history, and the odd novel', id: 'Desain, sejarah, dan sesekali novel' } },
    ],
    // What visitors can tick in the "let's build" form
    offers: [
      { en: 'Website design', id: 'Desain website' },
      { en: 'Mobile app design', id: 'Desain aplikasi mobile' },
      { en: 'Interaction design', id: 'Desain interaksi' },
      { en: 'Webflow', id: 'Webflow' },
      { en: 'Framer', id: 'Framer' },
      { en: 'Design system', id: 'Design system' },
    ],
  };

  /*
    Home: a client-first landing page told as a 2004 TV-guide ad: now showing, the week's
    listing, a note from the host, tonight's features (the work), channels (logos), reviews,
    the episode guide (process), services, FAQ, and a closing call to action.
    Tonight's features carries the owner's five case studies (PF.home.work); the Portfolio window and
    the Case Study Player read the same five. PF.home.words holds the owner's clients' own words.
  */
  PF.home = {
    hero: {
      // kept short: the welcome dialog beside the photo does the explaining
      title: { en: 'Make your product the one people notice.', id: 'Jadikan produk Anda yang paling dilirik orang.' },
      sub: {
        en: 'I’m Iqbal, a product designer in Indonesia. I design websites and apps for founders and small teams, and build many of them myself in Webflow and Framer, so nothing gets lost between design and launch.',
        id: 'Saya Iqbal, product designer dari Indonesia. Saya merancang website dan aplikasi untuk founder dan tim kecil, dan membangun banyak di antaranya sendiri di Webflow dan Framer, supaya tidak ada yang hilang di antara desain dan peluncuran.',
      },
      // the owner's photo, opened in Paint; the original is photo-hero.jpg (2880 x 2000),
      // these are web-size copies (AVIF, WebP, and a JPEG fallback) at 1200 and 2000px wide
      photo: {
        file: 'iqbal-surya.jpg',
        base: '../asset/Home/photo-hero-',
        widths: [1200, 2000],
        width: 2880, height: 2000,
        // the detection boxes printed on the photo, in the original's pixels [left, top, right, bottom];
        // pointing at one selects it in Paint
        marks: [
          { box: [1275, 412, 1572, 708], label: { en: '1 human, not blurred', id: '1 manusia, tidak buram' } },
          { box: [1228, 1352, 1385, 1508], label: { en: 'white shoes, #FFFFFF', id: 'sepatu putih, #FFFFFF' } },
        ],
        alt: {
          en: 'Iqbal standing still on a zebra crossing, looking up at the camera, while people walk past him in a blur. A box labelled HUMAN frames his face.',
          id: 'Iqbal berdiri diam di zebra cross, menatap ke kamera, sementara orang-orang berjalan melewatinya dengan buram. Sebuah kotak berlabel HUMAN membingkai wajahnya.',
        },
      },
      // the TV-guide listing band under the hero: the project's four moments as tonight's time slots
      listing: { en: 'Your project’s prime time', id: 'Prime time project Anda' },
    },
    // real numbers, from the work log; not shown on Home at the moment, kept for reuse
    stats: [
      { group: { en: 'Experience:', id: 'Pengalaman:' }, value: { en: '5+ years', id: '5+ tahun' }, note: { en: 'designing websites and apps, since 2020', id: 'merancang website dan aplikasi, sejak 2020' } },
      { group: { en: 'Reach:', id: 'Jangkauan:' }, value: { en: '4 countries', id: '4 negara' }, note: { en: 'Canada, the Netherlands, the US, and Indonesia', id: 'Kanada, Belanda, Amerika Serikat, dan Indonesia' } },
      { group: { en: 'Teams:', id: 'Tim:' }, value: { en: '5 teams', id: '5 tim' }, note: { en: 'agencies, studios, and product teams, plus Upwork clients since 2021', id: 'agensi, studio, dan tim produk, ditambah klien Upwork sejak 2021' } },
    ],
    letter: [
      {
        en: 'I started designing in 2020 and began building my own sites soon after. Doing both taught me the rule I still work by: a screen isn’t finished when it looks right. It’s finished when the person using it knows what to do next.',
        id: 'Saya mulai merancang pada 2020 dan tak lama kemudian membangun website sendiri. Mengerjakan keduanya mengajarkan aturan yang masih saya pegang: sebuah layar belum selesai saat terlihat bagus. Layar itu selesai saat orang yang memakainya tahu apa yang harus dilakukan berikutnya.',
      },
      {
        en: 'Since then I’ve designed for agencies in Yogyakarta, a research team in Seattle, and studios in Toronto and the Netherlands. The products change; the problem rarely does. Something genuinely useful, hidden behind a page that doesn’t explain it. Fixing that is the job.',
        id: 'Sejak itu saya merancang untuk agensi di Yogyakarta, tim riset di Seattle, serta studio di Toronto dan Belanda. Produknya berganti; masalahnya jarang berubah. Sesuatu yang benar-benar berguna, tersembunyi di balik halaman yang tidak menjelaskannya. Memperbaiki itulah pekerjaan saya.',
      },
    ],
    // the owner's logos (asset/Home/Logo), grey on the dark band until the pointer is on them; a file drawn in
    // dark ink is found when it loads and turned light. w and h are each file's pixels, for its size on the
    // grid; zoom is an optical correction: up for the empty margin a file leaves round its mark, down for a
    // solid block of colour
    logos: {
      head: { en: 'Client channels', id: 'Kanal klien' },
      list: [
        { name: 'Aquaint', src: '../asset/Home/Logo/Aquaint.png', w: 888, h: 198 },
        { name: 'Hilvy', src: '../asset/Home/Logo/Hilvy.png', w: 173, h: 174, zoom: 0.8 },
        { name: 'LaunchPoint', src: '../asset/Home/Logo/lauchpoint.png', w: 810, h: 174 },
        { name: 'Panagenius', src: '../asset/Home/Logo/panagenius.png', w: 392, h: 174 },
        { name: 'Pituku', src: '../asset/Home/Logo/pituku.png', w: 264, h: 264, zoom: 1.25 },
        { name: 'RedSwitches', src: '../asset/Home/Logo/Redswitches.png', w: 1083, h: 174 },
        { name: 'SensorStack', src: '../asset/Home/Logo/Sensorstack.png', w: 797, h: 176 },
        { name: 'Softriver', src: '../asset/Home/Logo/Softriver.png', w: 1079, h: 174 },
        { name: 'The Consultant Agency (TCA)', src: '../asset/Home/Logo/TCA.png', w: 701, h: 174 },
      ],
    },
    promise: {
      head: { en: ['Most products', 'are better than', 'their screens.'], id: ['Kebanyakan produk', 'lebih baik dari', 'tampilannya.'] },
      text: {
        en: 'Your website and app are where people decide if you’re worth their time. I find the one thing that makes your product worth choosing, build every screen around it, and cut whatever gets in the way.',
        id: 'Website dan aplikasi Anda adalah tempat orang memutuskan apakah Anda layak mendapat waktu mereka. Saya menemukan satu hal yang membuat produk Anda layak dipilih, membangun setiap layar di sekitarnya, dan membuang apa pun yang menghalangi.',
      },
    },
    // the owner's five case studies as the owner set them in Figma (Work area, node 542:1646): a programme
    // code and number, the title, a logline and tags. The covers are the owner's Figma exports (cover - *.jpg,
    // Dither effect and 10px corners baked in) as 640 and 1280px web copies, so the page does not dither them again
    // ui: the case study's UI card that rises over the cover on hover, 460 × 345 (4:3): the owner's
    // asset/Home/UI/ui-*.png (1380 × 1035, 3x) as 920 and 1380px web copies
    work: {
      head: { en: 'Tonight’s features', id: 'Tayangan utama malam ini' },
      code: 'TF',
      dither: false,
      list: [
        {
          title: 'KROOL',
          img: { file: 'cover-krool', src: '../asset/Home/cover-krool-1280.webp', small: '../asset/Home/cover-krool-640.webp' },
          ui: { file: 'ui-krool', src: '../asset/Home/UI/ui-krool-920.webp', big: '../asset/Home/UI/ui-krool-1380.webp' },
          sub: {
            en: 'An AI-powered multi-channel communication and CRM platform that centralizes conversations, automates workflows, and enhances team collaboration.',
            id: 'Platform komunikasi multikanal dan CRM berbasis AI yang menyatukan percakapan, mengotomatiskan alur kerja, dan mempererat kolaborasi tim.',
          },
          tags: ['UI/UX', 'Dashboard', 'CRM', { en: 'Automation', id: 'Otomasi' }],
        },
        {
          title: 'Serenity SPA',
          img: { file: 'cover-serenity-spa', src: '../asset/Home/cover-serenity-spa-1280.webp', small: '../asset/Home/cover-serenity-spa-640.webp' },
          ui: { file: 'ui-serenity-spa', src: '../asset/Home/UI/ui-serenity-spa-920.webp', big: '../asset/Home/UI/ui-serenity-spa-1380.webp' },
          sub: {
            en: 'Experience holistic treatments, soothing therapies, and rejuvenating escapes designed to restore balance to your mind, body, and spirit.',
            id: 'Nikmati perawatan holistik, terapi yang menenangkan, dan waktu rehat yang menyegarkan, dirancang untuk memulihkan keseimbangan pikiran, tubuh, dan jiwa Anda.',
          },
          tags: ['UI/UX', 'Website', 'SPA', { en: 'Therapeutic', id: 'Terapi' }],
        },
        {
          title: 'FINDMENTOR',
          img: { file: 'cover-findmentor', src: '../asset/Home/cover-findmentor-1280.webp', small: '../asset/Home/cover-findmentor-640.webp' },
          ui: { file: 'ui-findmentor', src: '../asset/Home/UI/ui-findmentor-920.webp', big: '../asset/Home/UI/ui-findmentor-1380.webp' },
          sub: {
            en: 'The platform offers a smooth, goal-focused experience with tools for mentee learning, skill growth, and progress tracking.',
            id: 'Platform ini menawarkan pengalaman yang mulus dan berfokus pada tujuan, dengan alat untuk pembelajaran mentee, pengembangan keterampilan, dan pemantauan progres.',
          },
          tags: ['UI/UX', 'Dashboard', 'CRM', { en: 'Automation', id: 'Otomasi' }],
        },
        {
          title: 'Boxify',
          img: { file: 'cover-boxify', src: '../asset/Home/cover-boxify-1280.webp', small: '../asset/Home/cover-boxify-640.webp' },
          ui: { file: 'ui-boxify', src: '../asset/Home/UI/ui-boxify-920.webp', big: '../asset/Home/UI/ui-boxify-1380.webp' },
          sub: {
            en: 'Boxify offers mobile and web platforms for a seamless self-storage experience. With advanced features and a focus on user experience, it transforms storage into a secure, tech-driven process.',
            id: 'Boxify menghadirkan platform mobile dan web untuk pengalaman self-storage yang mulus. Dengan fitur canggih dan fokus pada pengalaman pengguna, Boxify mengubah penyimpanan barang menjadi proses yang aman dan berbasis teknologi.',
          },
          tags: ['UI/UX', 'Website', { en: 'Mobile App', id: 'Aplikasi Mobile' }, 'Self-storage'],
        },
        {
          title: 'SENSORSTACK',
          img: { file: 'cover-sensorstack', src: '../asset/Home/cover-sensorstack-1280.webp', small: '../asset/Home/cover-sensorstack-640.webp' },
          ui: { file: 'ui-sensorstack', src: '../asset/Home/UI/ui-sensorstack-920.webp', big: '../asset/Home/UI/ui-sensorstack-1380.webp' },
          sub: {
            en: 'How We Designed an IoT Monitoring Platform That Turns Complex Sensor Data Into Clear, Confident Decisions',
            id: 'Bagaimana kami merancang platform pemantauan IoT yang mengubah data sensor yang rumit menjadi keputusan yang jelas dan meyakinkan',
          },
          tags: ['UI/UX', 'Website', 'IoT', 'SaaS'],
        },
      ],
    },
    // the owner's app UI shots that have no case study (6 to 12, 4:3). Each opens in the Picture Viewer;
    // title and url are optional, a missing title reads "UI shot 01"
    shorts: {
      head: { en: 'Also on air', id: 'Juga tayang' },
      // the owner's UI shots, asset/Home/design-shoot/UI-nn.png, as web copies: small (640px) on the wall, src
      // (1280px) in the Picture Viewer. List a number in `ready` once its file is in; the rest stay grey slots
      list: ((ready) => ['01', '02', '03', '04', '05', '06', '07', '08', '09'].map((n) => {
        const on = ready.includes(n), p = `../asset/Home/design-shoot/UI-${n}`;
        return { file: `UI-${n}`, src: on ? `${p}-1280.webp` : null, small: on ? `${p}-640.webp` : null, title: null, url: null };
      }))(['01', '02', '03', '04', '05', '06', '07', '08', '09']),
    },
    // the owner's clients in their own words (the owner's Figma, 2026-09-25), quoted as written on both languages'
    // pages. A quote is a list of paragraphs
    words: {
      head: { en: 'What clients say', id: 'Kata klien' },
      lead: { en: 'Short notes from people I’ve designed with.', id: 'Catatan singkat dari orang-orang yang pernah bekerja dengan saya.' },
      list: [
        {
          name: 'Name Surname',
          role: 'Lead Creative Team - TCA',
          quote: ['Iqbal is an amazing person to work with. We loved his work because we were looking for something minimal yet functional and he delivered. From jump off, design, development to delivery, he was very concise on how the project should proceed. Aside from the design and development aspect of the project, his project management skills are top notch. He made sure that timelines and deadlines were met, making everything flow smoothly.'],
        },
        {
          name: 'Nina Lombardo',
          role: 'Creative Director - LaunchPoint',
          quote: ['Iqbal has been an incredible asset to our team. He consistently delivers high-quality, creative work and takes feedback with professionalism and a positive attitude. He not only listens, but also elevates ideas beyond what we imagined. He’s reliable, collaborative, and never fails to impress, always hitting deadlines and solving design challenges with creativity and ease. His work has raised the bar for our brand and made a lasting impact. Working with him has been nothing short of amazing. Truly so greatful for you'],
        },
        {
          name: 'Leon Hemphill',
          role: 'Businessman - Garrus',
          quote: ['Iqbal demonstrated honesty and talent, bringing valuable skills to our project. He was willing to take the lead while remaining open to feedback and adjustments.', 'Working with Iqbal was a wonderful experience, and I genuinely look forward to collaborating with him again.'],
        },
      ],
    },
    // the owner's five services (2026-09-25). Each shows the owner's picture when pointed at (asset/Home/service/,
    // 4444 x 4823, shown at that shape from 800 and 1600px PNG copies in service/png/); a service without its
    // picture yet would show a grey slot naming the file. The lines for Brand, Website strategy and Digital product
    // are drafts for the owner to confirm
    services: {
      head: { en: 'What I can help with', id: 'Yang bisa saya bantu' },
      // bump when the owner replaces the pictures, so browsers fetch the new copies
      picVersion: 3,
      list: [
        { name: { en: 'Brand strategy', id: 'Strategi brand' }, desc: { en: 'Positioning, voice and the visual direction your product needs before its first screen.', id: 'Positioning, gaya bahasa, dan arah visual yang dibutuhkan produk Anda sebelum layar pertamanya.' }, img: { file: 'brand strategy', src: '../asset/Home/service/png/brand-strategy' } },
        { name: { en: 'Website strategy', id: 'Strategi website' }, desc: { en: 'The one thing that makes you worth choosing, and every page mapped to it before design starts.', id: 'Satu hal yang membuat Anda layak dipilih, dan setiap halaman dipetakan ke sana sebelum desain dimulai.' }, img: { file: 'Web strategy', src: '../asset/Home/service/png/website-strategy' } },
        { name: { en: 'Website design', id: 'Desain website' }, desc: { en: 'Marketing sites and product pages that make the offer clear in seconds.', id: 'Website marketing dan halaman produk yang membuat penawaran Anda jelas dalam hitungan detik.' }, img: { file: 'Web Design', src: '../asset/Home/service/png/website-design' } },
        { name: { en: 'Digital product', id: 'Produk digital' }, desc: { en: 'Dashboards and web apps, from the first flow to the working screens.', id: 'Dasbor dan aplikasi web, dari alur pertama sampai layar yang siap dipakai.' }, img: { file: 'Digital product', src: '../asset/Home/service/png/digital-product' } },
        { name: { en: 'Mobile app design', id: 'Desain aplikasi mobile' }, desc: { en: 'iOS and Android apps, from the first flow to the final screens.', id: 'Aplikasi iOS dan Android, dari alur pertama sampai layar final.' }, img: { file: 'Mobile design', src: '../asset/Home/service/png/mobile-app' } },
      ],
    },
    // DRAFT for the owner to confirm: every step restates something the owner already says elsewhere
    // (FAQ: fixed quote, weekly call, video walkthroughs, shared Figma; services: prototypes; launch framed as a developer handoff, design-only).
    // Each slide carries an image slot; the files are generated later from the prompts in the hand-off notes.
    process: {
      head: { en: 'How a project runs', id: 'Bagaimana project berjalan' },
      lead: { en: 'Four moments you can plan around, from the first email to the week after launch.', id: 'Empat momen yang bisa Anda rencanakan, dari email pertama sampai seminggu setelah rilis.' },
      steps: [
        {
          when: { en: 'Before we start', id: 'Sebelum mulai' },
          title: { en: 'A fixed price before any work', id: 'Harga pasti sebelum kerja dimulai' },
          text: { en: 'Send a few lines about what you’re building. After a short call you get the scope, a fixed price, and a timeline with milestones, all in writing. Nothing starts until you’ve agreed to all three.', id: 'Kirim beberapa baris tentang apa yang Anda bangun. Setelah panggilan singkat, Anda menerima cakupan, harga tetap, dan timeline dengan milestone, semuanya tertulis. Tidak ada yang dimulai sebelum Anda setuju ketiganya.' },
          items: [{ icon: 'document', en: 'Written scope', id: 'Cakupan tertulis' }, { icon: 'cart', en: 'Fixed price', id: 'Harga tetap' }, { icon: 'flag', en: 'Timeline with milestones', id: 'Timeline dengan milestone' }],
          slot: { en: 'Fixed price', id: 'Harga pasti' },
          line: { en: 'Scope, price, and milestones in writing', id: 'Cakupan, harga, dan milestone tertulis' },
          genre: { en: 'News', id: 'Berita' },
          img: { file: 'process-1', src: null, alt: { en: 'A signed one-page scope on a desk next to a laptop', id: 'Satu halaman cakupan yang sudah ditandatangani di meja, di samping laptop' } },
        },
        {
          when: { en: 'Week one', id: 'Minggu pertama' },
          title: { en: 'One sentence the whole product hangs on', id: 'Satu kalimat yang menopang seluruh produk' },
          text: { en: 'Before any screen, I write down the one thing that makes your product worth choosing and map every page to it. You check that sentence first, because every design decision after it leans on it.', id: 'Sebelum ada layar, saya menuliskan satu hal yang membuat produk Anda layak dipilih, lalu memetakan setiap halaman ke sana. Anda memeriksa kalimat itu lebih dulu, karena setiap keputusan desain sesudahnya bersandar padanya.' },
          items: [{ icon: 'quote', en: 'The one-sentence offer', id: 'Penawaran dalam satu kalimat' }, { icon: 'grid', en: 'Content map', id: 'Peta konten' }, { icon: 'users', en: 'Key user flows', id: 'Alur pengguna utama' }],
          slot: { en: 'The one sentence', id: 'Satu kalimat' },
          line: { en: 'Every page mapped to why you’re worth choosing', id: 'Setiap halaman dipetakan ke alasan Anda layak dipilih' },
          genre: { en: 'Documentary', id: 'Dokumenter' },
          img: { file: 'process-2', src: null, alt: { en: 'A wall of sticky notes sorted around one sentence', id: 'Dinding sticky note yang disusun di sekitar satu kalimat' } },
        },
        {
          when: { en: 'Every week', id: 'Setiap minggu' },
          title: { en: 'Progress you can open in Figma', id: 'Progres yang bisa Anda buka di Figma' },
          text: { en: 'I design in a Figma file you can open and comment on anytime. Each week you get a short video walkthrough of what changed and one call, and key flows become clickable Figma prototypes that real people try before anyone argues about them.', id: 'Saya merancang di file Figma yang bisa Anda buka dan komentari kapan saja. Setiap minggu Anda mendapat video walkthrough singkat tentang apa yang berubah dan satu panggilan, dan alur utama menjadi prototipe Figma yang bisa diklik dan dicoba orang sungguhan sebelum ada yang memperdebatkannya.' },
          items: [{ icon: 'penNib', en: 'Shared Figma file', id: 'File Figma bersama' }, { icon: 'play', en: 'Weekly video walkthrough and call', id: 'Video walkthrough dan panggilan mingguan' }, { icon: 'laptop', en: 'Clickable Figma prototype', id: 'Prototipe Figma yang bisa diklik' }],
          slot: { en: 'Walkthrough', id: 'Walkthrough' },
          line: { en: 'An open Figma file, a short video, one call', id: 'File Figma terbuka, video singkat, satu panggilan' },
          genre: { en: 'Series', id: 'Serial' },
          img: { file: 'process-3', src: null, alt: { en: 'A phone showing a clickable prototype in someone’s hand', id: 'Ponsel yang menampilkan prototipe di tangan seseorang' } },
        },
        {
          when: { en: 'Launch', id: 'Peluncuran' },
          title: { en: 'A handoff developers can build from', id: 'Serah terima yang siap dibangun developer' },
          text: { en: 'Your developers get final Figma files with specs, components, and every state a screen can be in, organised so nothing is left to guess. I stay on while they build and review each screen against the design. After launch we look at real use and refine the design where it falls short.', id: 'Developer Anda menerima file Figma final berisi spesifikasi, komponen, dan setiap kondisi sebuah layar, tersusun rapi sehingga tidak ada yang perlu ditebak. Saya tetap mendampingi selama mereka membangun dan meninjau setiap layar terhadap desainnya. Setelah rilis, kita melihat pemakaian nyata dan menyempurnakan desain di bagian yang masih kurang.' },
          items: [{ icon: 'code', en: 'Developer-ready Figma files', id: 'File Figma siap developer' }, { icon: 'search', en: 'Design review during the build', id: 'Review desain selama build' }, { icon: 'paintBrush', en: 'Post-launch design fixes', id: 'Perbaikan desain setelah rilis' }],
          slot: { en: 'Clean handoff', id: 'Serah terima rapi' },
          line: { en: 'Specs and components, then design review during the build', id: 'Spesifikasi dan komponen, lalu review desain selama build' },
          genre: { en: 'Premiere', id: 'Premier' },
          img: { file: 'process-4', src: null, alt: { en: 'A Figma file with annotated specs next to the live product on launch day', id: 'File Figma berisi anotasi spesifikasi di samping produk yang sudah live di hari peluncuran' } },
        },
      ],
    },
    // process answers here (timeline, communication, pricing) are drafts for the owner to confirm
    faq: {
      head: { en: 'Before we work together', id: 'Sebelum kita bekerja sama' },
      lead: { en: 'The questions I hear most often, answered up front.', id: 'Pertanyaan yang paling sering saya dengar, dijawab di awal.' },
      list: [
        { q: { en: 'Who will I be working with?', id: 'Dengan siapa saya akan bekerja?' }, a: { en: 'Me, directly. I lead the work from the first call to launch, so the person who understands your product is the one designing it.', id: 'Langsung dengan saya. Saya memegang pekerjaan dari panggilan pertama sampai peluncuran, jadi orang yang memahami produk Anda adalah orang yang merancangnya.' } },
        { q: { en: 'Can you build it too?', id: 'Apakah Anda juga bisa membangunnya?' }, a: { en: 'Yes. I design and build websites in Webflow and Framer. For apps, I prepare specs and components developers can build from, and stay involved while they do.', id: 'Bisa. Saya merancang dan membangun website di Webflow dan Framer. Untuk aplikasi, saya menyiapkan spesifikasi dan komponen yang bisa dibangun developer, dan tetap terlibat selama prosesnya.' } },
        { q: { en: 'How long does a project take?', id: 'Berapa lama sebuah project?' }, a: { en: 'It depends on scope. You’ll get a timeline with milestones before we start, and you’ll see progress every week, not just at the end.', id: 'Tergantung cakupannya. Anda akan mendapat timeline dengan milestone sebelum mulai, dan melihat progres setiap minggu, bukan hanya di akhir.' } },
        { q: { en: 'How do we work together day to day?', id: 'Bagaimana kita bekerja sehari-hari?' }, a: { en: 'Async first, with a weekly call. You’ll get short video walkthroughs and a shared Figma file. I work from Indonesia (GMT+7), which overlaps with mornings in Europe and evenings in the Americas.', id: 'Utamakan async, dengan satu panggilan mingguan. Anda mendapat video walkthrough singkat dan file Figma bersama. Saya bekerja dari Indonesia (GMT+7), yang bertepatan dengan pagi di Eropa dan malam di Amerika.' } },
        { q: { en: 'What does it cost?', id: 'Berapa biayanya?' }, a: { en: 'Every project is quoted after a short call. You’ll get a fixed price and scope in writing before anything starts.', id: 'Setiap project diberi penawaran setelah panggilan singkat. Anda akan menerima harga dan cakupan tetap secara tertulis sebelum pekerjaan dimulai.' } },
        { q: { en: 'How do we get started?', id: 'Bagaimana memulainya?' }, a: { en: 'Send a short brief below: what you’re building, who it’s for, and when you need it. I’ll reply by email with questions or a proposal.', id: 'Kirim brief singkat di bawah: apa yang Anda bangun, untuk siapa, dan kapan dibutuhkan. Saya akan membalas lewat email dengan pertanyaan atau proposal.' } },
        { q: { en: 'Are you open to full-time roles?', id: 'Apakah Anda terbuka untuk posisi full-time?' }, a: { en: 'Yes. I’m open to full-time product design roles, remote or in Indonesia. My work history and CV are in About Me.', id: 'Ya. Saya terbuka untuk posisi product designer full-time, remote atau di Indonesia. Riwayat kerja dan CV saya ada di Tentang Saya.' }, about: true },
      ],
    },
    cta: {
      head: { en: ['Tell me what', 'you’re building.'], id: ['Ceritakan apa yang', 'sedang Anda bangun.'] },
      lead: { en: 'A few lines is enough. I’ll reply by email with questions or a proposal.', id: 'Beberapa baris saja cukup. Saya akan membalas lewat email dengan pertanyaan atau proposal.' },
    },
    timeZone: 'Asia/Jakarta',
  };

  // The Portfolio window and the Case Study Player show the same five as Tonight's features. A case's page, after the
  // owner's Figma, goes in shared/cases.js under the case's slug.
  PF.projects = PF.home.work.list.map((f, i) => ({
    slug: f.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
    no: i + 1,
    title: f.title,
    cover: f.img,
    sub: f.sub,
    tags: f.tags,
  }));
  PF.bySlug = (slug) => PF.projects.find((p) => p.slug === slug);

  // Language helper shared by both options
  PF.getLang = function () {
    try {
      const saved = localStorage.getItem('pf-lang');
      if (saved === 'en' || saved === 'id') return saved;
    } catch (e) { /* storage unavailable */ }
    return (navigator.language || 'en').toLowerCase().startsWith('id') ? 'id' : 'en';
  };
  PF.setLang = function (lang) {
    try { localStorage.setItem('pf-lang', lang); } catch (e) { /* storage unavailable */ }
  };
  // t(obj) -> string in current language
  PF.t = function (v, lang) {
    if (v == null) return '';
    if (typeof v === 'string' || typeof v === 'number') return String(v);
    return v[lang] != null ? v[lang] : v.en;
  };
})();
