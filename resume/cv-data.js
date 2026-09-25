/*
  CV-only content for resume/cv.html, bilingual (en / id).
  Everything the site also shows (name, email, socials, the work log, languages, the client list) is read
  from shared/content.js, so the About page and the PDF never disagree.
  The rest comes from the owner's LinkedIn profile (export of 2026-09-25) and the owner's own lines on the site.
  Rebuild both PDFs into asset/cv/ with: node resume/build.mjs
*/
(function () {
  const PF = (window.PF = window.PF || {});

  PF.cv = {
    updated: { en: 'September 2026', id: 'September 2026' },

    // the site's letter and stats notes, plus LinkedIn's "interfaces and animations for web and mobile"
    summary: {
      en: 'Product designer in Indonesia, designing websites and apps since 2020 for teams in Canada, the Netherlands, the US and Indonesia. I design interfaces and animations for web and mobile, and build many of the sites myself in Webflow and Framer. My rule: a screen is finished when the person using it knows what to do next.',
      id: 'Product designer di Indonesia yang merancang website dan aplikasi sejak 2020 untuk tim di Kanada, Belanda, AS, dan Indonesia. Saya merancang antarmuka dan animasi untuk web dan mobile, dan membangun banyak website-nya sendiri di Webflow dan Framer. Aturan saya: layar baru selesai saat pemakainya tahu apa yang harus dilakukan berikutnya.',
    },

    // the work log's places, shortened for print; keys are the place strings in shared/content.js
    places: {
      'Jakarta, Indonesia': { en: 'Jakarta, Indonesia', id: 'Jakarta, Indonesia' },
      'Yogyakarta, Special Region of Yogyakarta': { en: 'Yogyakarta, Indonesia', id: 'Yogyakarta, Indonesia' },
      'Seattle, Washington, United States': { en: 'Seattle, United States', id: 'Seattle, Amerika Serikat' },
      'Heerenveen, Friesland': { en: 'Heerenveen, Netherlands', id: 'Heerenveen, Belanda' },
      'Toronto, Canada': { en: 'Toronto, Canada', id: 'Toronto, Kanada' },
      'Medan, North Sumatra, Indonesia': { en: 'Medan, Indonesia', id: 'Medan, Indonesia' },
    },

    // what a role involved, keyed "org from" as in the work log: the owner's LinkedIn descriptions, shortened
    duties: {
      'TeamUp Agency 2022/08': [
        { en: 'Designed to the brief in cross-functional teams and researched each design problem.', id: 'Merancang sesuai brief di tim lintas fungsi dan meriset masalah desain tiap project.' },
      ],
      'TeamUp Agency 2022/05': [
        { en: 'Delivered projects to the brief alongside the project manager, with responsive pages.', id: 'Menuntaskan project sesuai brief bersama project manager, dengan halaman responsif.' },
      ],
      'Omic 2022/08': [
        { en: 'Researched and designed an AI platform for therapy design and treatment optimization.', id: 'Meriset dan merancang platform AI untuk desain terapi dan optimasi pengobatan.' },
        { en: 'Released a dashboard and several features with the development team.', id: 'Merilis dashboard dan beberapa fitur bersama tim developer.' },
      ],
    },

    // LinkedIn's top skills and tools (Product Design, UX design, AI; Figma, Adobe Creative Suite, animations)
    // with the site's services and offers
    skills: [
      { group: { en: 'Design', id: 'Desain' }, items: [{ en: 'Product and UX design', id: 'Desain produk dan UX' }, { en: 'Website and mobile app design', id: 'Desain website dan aplikasi mobile' }, { en: 'Interaction design and prototyping', id: 'Desain interaksi dan prototipe' }, { en: 'UX research', id: 'Riset UX' }, { en: 'UI animation', id: 'Animasi UI' }, { en: 'Design systems', id: 'Design system' }, { en: 'AI products', id: 'Produk AI' }] },
      { group: { en: 'Build', id: 'Build' }, items: [{ en: 'Webflow and Framer sites I build myself', id: 'Website Webflow dan Framer yang saya bangun sendiri' }, { en: 'Figma handoff for developers', id: 'Handoff Figma' }] },
      { group: { en: 'Tools', id: 'Tools' }, items: ['Figma', 'Adobe Creative Suite', 'Webflow', 'Framer'] },
    ],

    education: [
      { school: 'Indonesia Creator Academy', study: { en: 'Graphic Design', id: 'Desain Grafis' }, years: '2020 – 2021' },
    ],
    certifications: ['IPC 2025'],

    labels: {
      en: {
        title: 'Resume', profile: 'Profile', experience: 'Experience', clients: 'Selected clients',
        skills: 'Skills', education: 'Education', languages: 'Languages', certification: 'Certification',
        present: 'Present', ft: 'Full-time', fl: 'Freelance', updated: 'Updated',
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      },
      id: {
        title: 'CV', profile: 'Profil', experience: 'Pengalaman', clients: 'Klien pilihan',
        skills: 'Keahlian', education: 'Pendidikan', languages: 'Bahasa', certification: 'Sertifikasi',
        present: 'Sekarang', ft: 'Full-time', fl: 'Freelance', updated: 'Diperbarui',
        months: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'],
      },
    },
  };
})();
