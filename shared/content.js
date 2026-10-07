/*
  Portfolio content, bilingual (en / id).
  To add before launch: each case study's page (in shared/cases.js, after the owner's Figma; outcomes are
  written in words, the owner's case studies carry no metrics), PF.home.shorts (the owner's UI shots),
  owner.cv.
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
    status: { en: 'Open for work', id: "Terbuka untuk peluang kerja" },
    statusLong: {
      en: 'Available for full-time roles and freelance projects',
      id: "Tersedia untuk posisi full-time dan proyek freelance",
    },
    tagline: {
      en: "I design websites and apps with clear structure and a distinct visual style.",
      id: "Saya merancang website dan aplikasi dengan struktur yang jelas dan gaya visual yang khas.",
    },
    to: { en: 'friends, teams, and future clients', id: 'teman, tim, dan calon klien' },
    // the About card's intro, kept to three sentences: the card's facts already say where and since when,
    // and the hobbies have their own panel further down
    intro: {
      en: "I’m a product designer based in Indonesia, working across websites, dashboards, and mobile apps. My work brings together clear user flows and detailed interface design, from early wireframes to Figma prototypes. I also build websites in Webflow and Framer, and have worked with agencies, product teams, and freelance clients internationally.",
      id: "Saya product designer di Indonesia yang merancang website, dashboard, dan aplikasi mobile. Pekerjaan saya mencakup alur pengguna dan detail antarmuka, dari wireframe awal hingga prototipe Figma. Saya juga membangun website di Webflow dan Framer, serta memiliki pengalaman bersama agensi, tim produk, dan klien freelance dari berbagai negara.",
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
    // the portfolio's own address, which the CV prints first so a forwarded copy leads back here
    site: 'https://iqbalsurya.com',
    // the dithered portrait (asset/iqba-surya.png, 564 × 564) as WebP copies 128 to 384px wide: photo is the one a
    // single-size picture uses (the Start menu's 42px), and photoSet lets a larger frame pick its own
    photo: '../asset/iqba-surya-192.webp',
    photoSet: [128, 192, 256, 384].map((w) => `../asset/iqba-surya-${w}.webp ${w}w`).join(', '),
    // The CV PDF per language, printed from resume/cv.html by `node resume/build.mjs`.
    // Empty = the Resume dialog offers to send it by email instead.
    cv: { en: '../asset/cv/Iqbal-Surya-Pratama-Resume.pdf?v=4', id: "../asset/cv/Iqbal-Surya-Pratama-CV.pdf?v=4" },
    socials: [
      { key: 'linkedin', label: 'LinkedIn', url: 'https://www.linkedin.com/in/iqbal-surya-pratama-29b2811a3/', handle: 'Iqbal Surya Pratama' },
      { key: 'dribbble', label: 'Dribbble', url: 'https://dribbble.com/iqbalsp', handle: '@iqbalsp' },
      { key: 'behance', label: 'Behance', url: 'https://www.behance.net/iqbalsurya', handle: '@iqbalsurya' },
      { key: 'upwork', label: 'Upwork', url: 'https://www.upwork.com/freelancers/~018ed569cba0f751f6', handle: { en: 'Freelancer profile', id: 'Profil freelancer' } },
    ],

    // Work log in the order and with the titles of the owner's LinkedIn profile (export of 2026-10-06).
    // Type: 'ft' full-time, 'fl' freelance, as the owner confirmed on 2026-09-25 (LinkedIn's export has none);
    // a row without a type (BCA) prints without one until the owner says which it was.
    // Places LinkedIn leaves out are kept from the owner's earlier list.
    worklog: [
      { from: '2024/10', to: '2026/10', role: 'UI Designer', org: 'Natuno', type: 'ft', place: 'Jakarta, Indonesia' },
      { from: '2021/08', to: '2026/10', role: 'UI Designer', org: 'Upwork', type: 'fl', place: '' },
      { from: '2025/10', to: '2026/09', role: 'Product Designer', org: 'PT Bank Central Asia Tbk (BCA)', place: 'Central Jakarta, Indonesia' },
      { from: '2022/08', to: '2023/07', role: 'User Interface Designer', org: 'TeamUp Agency', type: 'ft', place: 'Yogyakarta, Special Region of Yogyakarta' },
      { from: '2022/05', to: '2022/08', role: 'User Interface Designer', org: 'TeamUp Agency', type: 'fl', place: 'Yogyakarta, Special Region of Yogyakarta' },
      { from: '2022/08', to: '2023/04', role: 'UI/UX Designer for Scientific Research', org: 'Omic', type: 'fl', place: 'Seattle, Washington, United States' },
      { from: '2021/10', to: '2021/12', role: 'UI Designer', org: 'Slab! Design Studio', type: 'fl', place: 'Yogyakarta, Special Region of Yogyakarta' },
      { from: '2021/10', to: '2021/11', role: 'UI Designer', org: 'TEQQED', type: 'fl', place: 'Heerenveen, Friesland' },
      { from: '2021/03', to: '2021/06', role: 'UI Designer', org: 'Drip Design', type: 'fl', place: 'Toronto, Canada' },
      { from: '2019/06', to: '2021/03', role: 'Designer', org: 'CV. Kresna Digital Printing', type: 'ft', place: 'Medan, North Sumatra, Indonesia' },
    ],
    sideProjects: [
      {
        name: 'BestFrame', kind: { en: 'Figma components', id: 'Komponen Figma' },
        desc: {
          en: 'A growing collection of free Figma components, exploring spacing, hierarchy, and the details of everyday UI. Created with Syamil.',
          id: 'Kumpulan komponen Figma gratis untuk mengeksplorasi jarak, hierarki, dan detail antarmuka sehari-hari. Dibuat bersama Syamil.',
        },
        image: '../asset/about/projects/bestframe.webp',
        imageAlt: { en: 'The BestFrame logo above a phone wallet component with a bank card', id: 'Logo BestFrame di atas komponen dompet di layar ponsel dengan kartu bank' },
        url: 'https://bestfra.me/',
      },
      {
        name: 'OMI Money', kind: { en: 'Personal finance app', id: 'Aplikasi keuangan pribadi' },
        desc: {
          en: 'A personal finance app for setting a budget and keeping income, expenses, and balance in view.',
          id: 'Aplikasi keuangan pribadi untuk mengatur anggaran serta melihat pemasukan, pengeluaran, dan saldo dalam satu tempat.',
        },
        image: '../asset/about/projects/omi-money.webp',
        imageAlt: { en: 'OMI Money screens: a projected end-of-month balance chart, a list of expenses and an Add transaction form', id: 'Layar OMI Money: grafik proyeksi saldo akhir bulan, daftar pengeluaran, dan formulir tambah transaksi' },
        url: 'https://omi-money.vercel.app/',
      },
      {
        name: 'Tempa 3D', kind: { en: '3D CAD · in development', id: 'CAD 3D · dalam pengembangan' },
        desc: {
          en: 'A desktop CAD project for shaping functional parts. The app is still in development and the repository is not public. Want to see it? Request access by email.',
          id: 'Proyek CAD desktop untuk membentuk komponen fungsional. Aplikasinya masih dikembangkan dan repositorinya belum publik. Ingin melihatnya? Minta akses lewat email.',
        },
        image: '../asset/about/projects/tempa-3d.webp',
        imageAlt: { en: 'The Tempa logo: a blue hexagonal cube beside the word Tempa on a dark grid', id: 'Logo Tempa: kubus segi enam biru di samping tulisan Tempa pada latar gelap berpetak' },
        url: {
          en: 'mailto:hello@iqbalsurya.com?subject=Tempa%203D%20access%20request',
          id: 'mailto:hello@iqbalsurya.com?subject=Permintaan%20akses%20Tempa%203D',
        },
        cta: { en: 'Request access', id: 'Minta akses' },
        external: false,
      },
    ],
    // Off the clock: the owner's 9:16 photos (asset/about/*.png, 2026-09-25), served as <photo>-360/-480/-720.webp.
    // The label is the photo's name tag; pointing at or tapping the photo opens the note in an infotip.
    hobbies: [
      { photo: '../asset/about/traveling', label: { en: 'Traveling', id: 'Jalan-jalan' }, note: { en: "Getting out and exploring somewhere new.", id: "Jalan-jalan dan menjelajahi tempat baru." } },
      { photo: '../asset/about/culinary', label: { en: "Food", id: 'Kuliner' }, note: { en: "Trying something I haven’t tasted before.", id: "Mencoba makanan yang belum pernah saya cicipi." } },
      { photo: '../asset/about/coffee', label: { en: 'Coffee', id: 'Kopi' }, note: { en: "A coffee break, away from my desk.", id: "Rehat sejenak dengan kopi, jauh dari meja kerja." } },
      { photo: '../asset/about/book', label: { en: "Books", id: 'Buku' }, note: { en: "Taking a break from screens with a few pages.", id: "Rehat dari layar dengan beberapa halaman buku." } },
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
    Tonight's features carries the owner's four case studies (PF.home.work); the Portfolio window and
    the Case Study Player read the same four. PF.home.words holds the owner's clients' own words.
  */
  PF.home = {
    hero: {
      // kept short: the welcome dialog beside the photo does the explaining
      title: { en: "Websites and apps with character.", id: "Website dan aplikasi yang punya karakter." },
      sub: {
        en: "I’m Iqbal, a product designer in Indonesia. I bring clear user flows and detailed UI design to websites, dashboards, and mobile apps. I also build websites in Webflow and Framer.",
        id: "Saya Iqbal, product designer di Indonesia. Saya merancang website, dashboard, dan aplikasi mobile dengan alur yang jelas dan detail UI yang matang. Saya juga membangun website di Webflow dan Framer.",
      },
      // the owner's photo, opened in Paint; the original is photo-hero.jpg (2880 x 2000),
      // these are web-size copies (AVIF, WebP, and a JPEG fallback) at 1200, 1600 and 2000px wide
      photo: {
        file: 'iqbal-surya.jpg',
        base: '../asset/Home/photo-hero-',
        widths: [1200, 1600, 2000],
        width: 2880, height: 2000,
        // the detection boxes printed on the photo, in the original's pixels [left, top, right, bottom];
        // pointing at one selects it in Paint
        marks: [
          { box: [1275, 412, 1572, 708], label: { en: '1 human, not blurred', id: '1 manusia, tidak buram' }, short: { en: '1 human', id: '1 manusia' } },
          { box: [1228, 1352, 1385, 1508], label: { en: 'white shoes, #FFFFFF', id: 'sepatu putih, #FFFFFF' } },
        ],
        alt: {
          en: 'Iqbal standing still on a zebra crossing, looking up at the camera, while people walk past him in a blur. A box labelled HUMAN frames his face.',
          id: 'Iqbal berdiri diam di zebra cross, menatap ke kamera, sementara orang-orang berjalan melewatinya dengan buram. Sebuah kotak berlabel HUMAN membingkai wajahnya.',
        },
      },
      // the TV-guide listing band under the hero: the project's four moments as tonight's time slots
    },
    // real numbers, from the work log; not shown on Home at the moment, kept for reuse
    stats: [
      { group: { en: 'Experience:', id: 'Pengalaman:' }, value: { en: '5+ years', id: '5+ tahun' }, note: { en: 'designing websites and apps, since 2020', id: 'merancang website dan aplikasi, sejak 2020' } },
      { group: { en: 'Reach:', id: 'Jangkauan:' }, value: { en: '4 countries', id: '4 negara' }, note: { en: 'Canada, the Netherlands, the US, and Indonesia', id: 'Kanada, Belanda, Amerika Serikat, dan Indonesia' } },
      { group: { en: 'Teams:', id: 'Tim:' }, value: { en: "Agency + freelance", id: "Agensi + freelance" }, note: { en: "agency, studio, and product work, alongside freelance projects", id: "pekerjaan di agensi, studio, dan tim produk, serta proyek freelance" } },
    ],
    letter: [
      {
        en: "I’ve been designing interfaces since 2020, across websites, dashboards, and mobile apps. I pay attention to how a screen looks and how someone moves through it: the information they need, the choices they have, and what happens next.",
        id: "Saya merancang antarmuka sejak 2020, mulai dari website dan dashboard hingga aplikasi mobile. Saya memperhatikan tampilan layar sekaligus cara orang menggunakannya: informasi yang mereka butuhkan, pilihan yang tersedia, dan langkah berikutnya.",
      },
      {
        en: "My experience spans agency work, product teams, and freelance projects for international clients. Some of that work is private. The selection here brings together client work and design explorations that reflect the kind of design I want to do more of.",
        id: "Pengalaman saya mencakup pekerjaan di agensi, tim produk, dan proyek freelance untuk klien dari berbagai negara. Sebagian pekerjaan itu bersifat privat. Karya di sini mencakup proyek klien dan eksplorasi desain yang mewakili jenis pekerjaan yang ingin saya tekuni lebih jauh.",
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
      head: { en: ["A distinct look.","A clear way","through."], id: ["Tampilan khas.", "Alur yang", "jelas."] },
      text: {
        en: "I work on the structure as well as the visual details. That means planning the pages or user flows, building a consistent interface, and making the main actions easy to find. The design should feel like your product and give people a clear place to start.",
        id: "Saya mengerjakan struktur dan detail visualnya. Mulai dari menyusun halaman atau alur pengguna, merancang antarmuka yang konsisten, hingga memastikan tindakan utama mudah ditemukan. Desainnya perlu terasa sesuai dengan produk Anda dan memberi pengguna titik awal yang jelas.",
      },
    },
    // the owner's four case studies as the owner set them in Figma (Work area, node 542:1646): a programme
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
            en: "A CRM design study bringing conversations, leads, and team tasks into a shared workspace.",
            id: "Studi desain CRM yang menyatukan percakapan, informasi prospek, dan tugas tim dalam satu ruang kerja.",
          },
          tags: ['UI/UX', 'Dashboard', 'CRM', { en: 'Automation', id: 'Otomasi' }],
        },
        {
          title: 'Serenity SPA',
          img: { file: 'cover-serenity-spa', src: '../asset/Home/cover-serenity-spa-1280.webp', small: '../asset/Home/cover-serenity-spa-640.webp' },
          ui: { file: 'ui-serenity-spa', src: '../asset/Home/UI/ui-serenity-spa-920.webp', big: '../asset/Home/UI/ui-serenity-spa-1380.webp' },
          sub: {
            en: "A calmer way to explore treatments, compare details, and find the next step to book.",
            id: "Cara yang lebih tenang untuk menjelajahi perawatan, melihat detailnya, dan menemukan langkah untuk memesan.",
          },
          tags: ['UI/UX', 'Website', 'SPA', { en: 'Concept', id: "Konsep" }],
        },
        {
          title: 'FINDMENTOR',
          img: { file: 'cover-findmentor', src: '../asset/Home/cover-findmentor-1280.webp', small: '../asset/Home/cover-findmentor-640.webp' },
          ui: { file: 'ui-findmentor', src: '../asset/Home/UI/ui-findmentor-920.webp', big: '../asset/Home/UI/ui-findmentor-1380.webp' },
          sub: {
            en: "A mentorship interface connecting mentor discovery with sessions, assignments, and learning progress.",
            id: "Desain antarmuka mentoring yang menghubungkan pencarian mentor, sesi, tugas, dan progres belajar.",
          },
          tags: ['UI/UX', 'Dashboard', { en: 'Mentorship', id: "Mentoring" }, { en: 'Education', id: "Pendidikan" }],
        },
        {
          title: 'SENSORSTACK',
          img: { file: 'cover-sensorstack', src: '../asset/Home/cover-sensorstack-1280.webp', small: '../asset/Home/cover-sensorstack-640.webp' },
          ui: { file: 'ui-sensorstack', src: '../asset/Home/UI/ui-sensorstack-920.webp', big: '../asset/Home/UI/ui-sensorstack-1380.webp' },
          sub: {
            en: "A client website redesign for an IoT monitoring platform, using sensor data and dashboard previews to explain the product.",
            id: "Desain ulang website klien untuk platform pemantauan IoT, dengan data sensor dan pratinjau dashboard untuk menjelaskan produknya.",
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
    // pages. A quote is a list of paragraphs. A named client opens the row (owner's request, 2026-09-25); TCA's reviewer,
    // once unnamed, is AJ Aoas, Creative Director on that project (2026-10-07)
    words: {
      head: { en: 'What clients say', id: 'Kata klien' },
      lead: { en: 'Short notes from people I’ve designed with.', id: 'Catatan singkat dari orang-orang yang pernah bekerja dengan saya.' },
      list: [
        {
          name: 'Nina Lombardo',
          role: 'Creative Director - LaunchPoint',
          quote: ['Iqbal has been an incredible asset to our team. He consistently delivers high-quality, creative work and takes feedback with professionalism and a positive attitude. He not only listens, but also elevates ideas beyond what we imagined. He’s reliable, collaborative, and never fails to impress, always hitting deadlines and solving design challenges with creativity and ease. His work has raised the bar for our brand and made a lasting impact. Working with him has been nothing short of amazing. Truly so grateful for you'],
        },
        {
          name: 'Leon Hemphill',
          role: 'Businessman - Garrus',
          quote: ['Iqbal demonstrated honesty and talent, bringing valuable skills to our project. He was willing to take the lead while remaining open to feedback and adjustments.', 'Working with Iqbal was a wonderful experience, and I genuinely look forward to collaborating with him again.'],
        },
        {
          name: 'Derrice',
          role: 'Founder - Hilvy',
          quote: ['Working with Iqbal and his team has been fantastic. The designs are slick and modern, and it really reminds me what it’s like to work with a true designer!'],
        },
        {
          name: 'AJ Aoas',
          role: 'Creative Director - TCA',
          quote: ['Iqbal is an amazing person to work with. We loved his work because we were looking for something minimal yet functional and he delivered. From jump off, design, development to delivery, he was very concise on how the project should proceed. Aside from the design and development aspect of the project, his project management skills are top notch. He made sure that timelines and deadlines were met, making everything flow smoothly.'],
        },
      ],
    },
    // the owner's five services (2026-09-25). Each shows the owner's picture when pointed at (asset/Home/service/,
    // 3051 x 3311, shown at that shape from 800, 1100 and 1600px WebP copies in service/webp/); a service without its
    // picture yet would show a grey slot naming the file. The lines for Brand, Website strategy and Digital product
    // are drafts for the owner to confirm
    services: {
      head: { en: 'What I can help with', id: 'Yang bisa saya bantu' },
      // bump when the owner replaces the pictures, so browsers fetch the new copies
      picVersion: 6,
      list: [
        { name: { en: "Visual direction", id: "Arah visual" }, desc: { en: "Colours, typography, and interface styling that carry your brand into the website or app.", id: "Warna, tipografi, dan gaya antarmuka yang membawa identitas brand Anda ke website atau aplikasi." }, img: { file: 'brand strategy', src: '../asset/Home/service/webp/brand-strategy' } },
        { name: { en: "Website structure", id: "Struktur website" }, desc: { en: "Page layouts and wireframes that organise your content around what visitors need to know and do.", id: "Tata letak halaman dan wireframe yang menyusun konten sesuai informasi dan tindakan yang dibutuhkan pengunjung." }, img: { file: 'Web strategy', src: '../asset/Home/service/webp/website-strategy' } },
        { name: { en: 'Website design', id: 'Desain website' }, desc: { en: "Responsive marketing sites and product pages, with Webflow or Framer builds available as part of the scope.", id: "Website pemasaran dan halaman produk yang responsif. Pembangunan di Webflow atau Framer dapat masuk dalam cakupan proyek." }, img: { file: 'Web Design', src: '../asset/Home/service/webp/website-design' } },
        { name: { en: "Product UI/UX", id: "UI/UX produk" }, desc: { en: "User flows, dashboards, and web app interfaces, with reusable components and clickable Figma prototypes.", id: "Alur pengguna, dashboard, dan antarmuka aplikasi web, dengan komponen yang bisa digunakan ulang dan prototipe Figma yang bisa diklik." }, img: { file: 'Digital product', src: '../asset/Home/service/webp/digital-product' } },
        { name: { en: 'Mobile app design', id: 'Desain aplikasi mobile' }, desc: { en: "iOS and Android interface design, from the main user flows to detailed screens and prototypes.", id: "Desain antarmuka iOS dan Android, dari alur pengguna utama hingga detail layar dan prototipe." }, img: { file: 'Mobile design', src: '../asset/Home/service/webp/mobile-app' } },
      ],
    },
    // Process deliverables depend on the agreed scope.
    // Each slide's picture is a still of the 3D desk on the TV (option-a-desktop/desk3d/, rendered to asset/Home/process/
    // by prototype/process-desk/tools/stills.mjs); where the desk can run, it plays over the still.
    process: {
      head: { en: 'How a project runs', id: "Alur pengerjaan proyek" },
      lead: { en: "From the first brief to final files or a website build. We agree on the scope and deliverables before starting.", id: "Dari brief awal hingga file desain final atau website. Kita menyepakati cakupan dan hasil pekerjaan sebelum mulai." },
      steps: [
        {
          when: { en: 'Before we start', id: 'Sebelum mulai' },
          title: { en: "Agree on the work", id: "Sepakati pekerjaan yang dibutuhkan" },
          text: { en: "Tell me what you’re building, who it’s for, and what you need help with. We’ll define the deliverables, discuss the budget, and agree on a timeline that fits the scope.", id: "Ceritakan apa yang Anda buat, siapa penggunanya, dan bantuan yang Anda butuhkan. Kita akan menentukan hasil pekerjaan, membahas anggaran, dan menyepakati jadwal sesuai cakupan proyek." },
          items: [{ icon: 'document', en: 'Written scope', id: 'Cakupan tertulis' }, { icon: 'cart', en: "Budget and pricing", id: "Anggaran dan biaya" }, { icon: 'flag', en: "Project timeline", id: "Jadwal proyek" }],
          slot: { en: "The brief", id: "Brief awal" },
          line: { en: "Scope, budget, and timeline", id: "Cakupan, anggaran, dan jadwal" },
          genre: { en: 'News', id: 'Berita' },
          img: { file: 'process-1', src: '../asset/Home/process/ep1', alt: { en: 'A scope document on a dark clipboard, just signed, with a slim pen above it and a green tab on its edge', id: 'Dokumen cakupan di papan klip gelap yang baru ditandatangani, dengan pena ramping di atasnya dan tab hijau di tepinya' } },
        },
        {
          when: { en: "Structure", id: "Struktur" },
          title: { en: "Map out the pages and flows", id: "Susun halaman dan alur pengguna" },
          text: { en: "I organise the content and main user flows, then use wireframes to work through the layout. We review the structure before moving into detailed interface design.", id: "Saya menyusun konten dan alur pengguna utama, lalu membuat wireframe untuk merencanakan tata letaknya. Kita meninjau struktur ini sebelum masuk ke detail desain antarmuka." },
          items: [{ icon: 'quote', en: "Page structure", id: "Struktur halaman" }, { icon: 'grid', en: 'Content map', id: 'Peta konten' }, { icon: 'users', en: 'Key user flows', id: 'Alur pengguna utama' }],
          slot: { en: "The structure", id: "Struktur" },
          line: { en: "Content, wireframes, and key user flows", id: "Konten, wireframe, dan alur pengguna utama" },
          genre: { en: 'Documentary', id: 'Dokumenter' },
          img: { file: 'process-2', src: '../asset/Home/process/ep2', alt: { en: 'A page model in layers: white layout panels settling onto a metal plate along guide lines, one panel in green', id: 'Model halaman berlapis: panel tata letak putih turun ke pelat logam mengikuti garis pemandu, satu panel berwarna hijau' } },
        },
        {
          when: { en: "Design and review", id: "Desain dan review" },
          title: { en: "Review the design in Figma", id: "Tinjau desain di Figma" },
          text: { en: "The interface takes shape in Figma, where we can review screens and work through feedback. For app flows, clickable prototypes show how the screens connect. We agree on a review schedule that suits the project.", id: "Saya merancang antarmuka di Figma agar kita bisa meninjau layar dan membahas masukan. Untuk alur aplikasi, prototipe yang bisa diklik memperlihatkan hubungan antar layar. Jadwal review kita sepakati sesuai kebutuhan proyek." },
          items: [{ icon: 'penNib', en: 'Shared Figma file', id: 'File Figma bersama' }, { icon: 'play', en: "Design reviews", id: "Review desain" }, { icon: 'laptop', en: 'Clickable Figma prototype', id: 'Prototipe Figma yang bisa diklik' }],
          slot: { en: "The design", id: "Desain" },
          line: { en: "Screens, prototypes, and feedback in Figma", id: "Layar, prototipe, dan masukan di Figma" },
          genre: { en: 'Series', id: 'Serial' },
          img: { file: 'process-3', src: '../asset/Home/process/ep3', alt: { en: 'A phone on a stand showing a prototype, a pointer on its green button, a comment beside it and the next screens behind', id: 'Ponsel di stand menampilkan prototipe, kursor di tombol hijaunya, komentar di sampingnya, dan layar berikutnya di belakang' } },
        },
        {
          when: { en: "Handoff or build", id: "Serah terima atau pembangunan" },
          title: { en: "Prepare the design for its next step", id: "Siapkan desain untuk tahap berikutnya" },
          text: { en: "For a design project, I organise the final Figma files and components for your team. If a Webflow or Framer build is part of the scope, I build the website too. Build reviews and further support can be included in our agreement.", id: "Untuk proyek desain, saya merapikan file Figma final dan komponen agar siap diserahkan ke tim Anda. Jika pembangunan website di Webflow atau Framer termasuk dalam cakupan, saya juga membangunnya. Review saat pembangunan dan dukungan lanjutan bisa kita sertakan dalam kesepakatan." },
          items: [{ icon: 'code', en: "Organised design files", id: "File desain yang tertata" }, { icon: 'search', en: "Components and design notes", id: "Komponen dan catatan desain" }, { icon: 'paintBrush', en: "Website build, if included", id: "Pembangunan website, jika disepakati" }],
          slot: { en: "The handoff", id: "Serah terima" },
          line: { en: "Final design files or a Webflow / Framer website", id: "File desain final atau website Webflow / Framer" },
          genre: { en: 'Premiere', id: 'Premier' },
          img: { file: 'process-4', src: '../asset/Home/process/ep4', alt: { en: 'A key with a green tag on a leather notebook, under a spotlight', id: 'Kunci berlabel hijau di atas buku kulit, di bawah sorot lampu' } },
        },
      ],
    },
    // Timeline, communication, and pricing depend on the agreed scope.
    faq: {
      head: { en: 'Before we work together', id: 'Sebelum kita bekerja sama' },
      lead: { en: "A few practical details about working together.", id: "Beberapa hal praktis tentang bekerja bersama saya." },
      list: [
        { q: { en: 'Who will I be working with?', id: 'Dengan siapa saya akan bekerja?' }, a: { en: "You’ll discuss the design with me directly. I work with your team and, when a project needs other collaborators, we’ll clarify who is involved and what each person is responsible for.", id: "Anda akan membahas desain langsung dengan saya. Saya bekerja bersama tim Anda. Jika proyek membutuhkan kolaborator lain, kita akan memperjelas siapa yang terlibat dan tanggung jawab masing-masing." } },
        { q: { en: 'Can you build it too?', id: "Bisa sekaligus membangun website-nya?" }, a: { en: "Yes, for websites in Webflow and Framer. For web and mobile apps, my focus is UI/UX design, prototypes, and files for your developers. We’ll agree on the build or handoff scope at the start.", id: "Bisa, untuk website di Webflow dan Framer. Untuk aplikasi web dan mobile, fokus saya pada desain UI/UX, prototipe, dan file untuk developer Anda. Cakupan pembangunan atau serah terima kita sepakati di awal." } },
        { q: { en: 'How long does a project take?', id: "Berapa lama pengerjaan proyeknya?" }, a: { en: "That depends on the number of pages or flows, the content available, and whether a website build is included. Share what you need and your deadline so we can discuss a realistic timeline.", id: "Tergantung jumlah halaman atau alur, kesiapan konten, dan apakah pembangunan website termasuk dalam pekerjaan. Ceritakan kebutuhan dan tenggat Anda agar kita bisa membahas jadwal yang realistis." } },
        { q: { en: 'How do we work together day to day?', id: "Bagaimana komunikasi selama proyek?" }, a: { en: "We review the design in Figma and use messages or calls to work through feedback. I’m based in Indonesia (GMT+7). We’ll agree on meeting times and a review schedule that work for both of us.", id: "Kita meninjau desain di Figma dan membahas masukan lewat pesan atau panggilan. Saya berada di Indonesia (GMT+7). Waktu pertemuan dan jadwal review akan kita sesuaikan agar cocok untuk kedua pihak." } },
        { q: { en: 'What does it cost?', id: 'Berapa biayanya?' }, a: { en: "Pricing depends on the scope, deliverables, and whether you need design, a website build, or both. Send a short brief and we can discuss a budget and pricing arrangement before starting.", id: "Biaya bergantung pada cakupan, hasil pekerjaan, serta kebutuhan desain, pembangunan website, atau keduanya. Kirim brief singkat agar kita bisa membahas anggaran dan skema biaya sebelum mulai." } },
        { q: { en: 'How do we get started?', id: 'Bagaimana memulainya?' }, a: { en: "Send a short brief below: what you’re building, who it’s for, and when you need it. Links or references are helpful too. I’ll reply by email to discuss the next step.", id: "Kirim brief singkat lewat formulir di bawah: apa yang Anda buat, siapa penggunanya, dan kapan dibutuhkan. Tautan atau referensi juga membantu. Saya akan membalas lewat email untuk membahas langkah berikutnya." } },
        { q: { en: 'Are you open to full-time roles?', id: 'Apakah Anda terbuka untuk posisi full-time?' }, a: { en: 'Yes. I’m open to full-time product design roles, remote or in Indonesia. My work history and CV are in About Me.', id: "Ya. Saya terbuka untuk posisi product designer full-time, baik remote maupun di Indonesia. Riwayat kerja dan CV saya ada di Tentang Saya." }, about: true },
      ],
    },
    // the close hands the hero's promise back as an invitation. The head is set in poster lines where the page is
    // wide enough, and runs as one sentence on a phone
    cta: {
      head: { en: ["Have a website","or app in mind?","Let’s talk."], id: ["Punya ide website", "atau aplikasi?", "Mari diskusi."] },
      lead: { en: "Tell me what you need and when you need it. A short brief is enough to start the conversation.", id: "Ceritakan apa yang Anda butuhkan dan kapan dibutuhkan. Brief singkat sudah cukup untuk memulai diskusi." },
      // the owner's photo, printed on the steel beside the message; the original is close-photo.jpg (2959 x 3699, 4:5),
      // these are web-size copies (AVIF, WebP, and a JPEG fallback) at 600 and 1200px wide
      photo: {
        base: '../asset/Home/close-photo-',
        widths: [600, 1200],
        width: 2959, height: 3699,
        alt: {
          en: 'Iqbal leaning back on a green couch, hands behind the head and eyes closed, with a bowl of snacks and a stack of video tapes on the table.',
          id: 'Iqbal bersandar di sofa hijau, kedua tangan di belakang kepala dan mata terpejam, dengan semangkuk camilan dan setumpuk kaset video di meja.',
        },
      },
    },
    timeZone: 'Asia/Jakarta',
  };

  // The Portfolio window and the Case Study Player show the same four as Tonight's features. A case's page, after the
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
