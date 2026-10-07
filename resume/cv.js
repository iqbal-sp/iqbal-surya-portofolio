/* Draws the one-page CV from PF.owner (shared/content.js) and PF.cv (cv-data.js). ?lang=en or ?lang=id */
(() => {
  'use strict';
  const PF = window.PF, o = PF.owner, cv = PF.cv;
  const lang = new URLSearchParams(location.search).get('lang') === 'id' ? 'id' : 'en';
  const t = (v) => PF.t(v, lang);
  const L = cv.labels[lang];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const month = (ym) => { const [y, m] = ym.split('/'); return `${L.months[Number(m) - 1]} ${y}`; };
  const sec = (key, body) => (body ? `<section class="sec sec-${key}"><h2>${esc(L[key])}</h2><div>${body}</div></section>` : '');
  const rows = (list) => (list.length ? `<dl class="rows">${list.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>` : '');

  document.documentElement.lang = lang;
  document.title = `${o.fullName}, ${t(o.role)}: ${L.title}`;

  // the email, then each profile by its name only, linked to its address (the owner's order, 2026-10-07)
  const order = ['dribbble', 'behance', 'upwork', 'linkedin'];
  const profiles = order.map((k) => o.socials.find((s) => s.key === k)).filter(Boolean);
  const contact = [`<li><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></li>`]
    .concat(profiles.map((s) => `<li><a class="link" href="${esc(s.url)}">${esc(s.label)}</a></li>`)).join('');

  // newest start first (the site's work log keeps its own order); roles that ended before 2022 are short
  // early jobs, so they print one line each under their own label in the rail, and every later role prints
  // in full: role and dates, then organisation, type and place, then what it involved
  const byStart = (a, b) => b.from.localeCompare(a.from) || (b.to || '9999').localeCompare(a.to || '9999');
  const early = (j) => j.to && j.to < '2022';
  const job = (j) => {
    const place = j.place ? t(cv.places[j.place] || j.place) : '';
    const duties = cv.duties[`${j.org} ${j.from}`] || [];
    const when = `<p class="when">${esc(month(j.from))} – ${j.to ? esc(month(j.to)) : `<b>${esc(L.present)}</b>`}</p>`;
    const org = [j.org, L[j.type], place].filter(Boolean).map(esc).join(' · ');
    if (early(j)) return `<article class="job brief"><h3>${esc(j.role)} <span>· ${org}</span></h3>${when}</article>`;
    return `<article class="job">
      <h3>${esc(j.role)}</h3>${when}
      <p class="org">${org}</p>
      ${duties.length ? `<ul>${duties.map((d) => `<li>${esc(t(d))}</li>`).join('')}</ul>` : ''}
    </article>`;
  };
  const log = o.worklog.slice().sort(byStart);
  const recent = log.filter((j) => !early(j)).map(job).join('');
  const earlier = log.filter(early).map(job).join('');
  const jobs = `<div class="jobs">${recent}</div>${earlier ? `<h3 class="sub">${esc(L.earlier)}</h3><div class="jobs">${earlier}</div>` : ''}`;

  // every list item wraps as a whole, split by commas (a middle dot left hanging at a line end looked like a
  // stray mark); languages close the skills with their levels
  const items = (list) => list.map((x) => `<span>${esc(x)}</span>`).join(', ');
  const clients = `<p>${items(PF.home.logos.list.map((c) => c.name))}</p>`;
  const skills = rows(cv.skills.map((s) => [esc(t(s.group)), items(s.items.map((x) => t(x)))])
    .concat([[esc(L.languages), items(o.languages.map((l) => `${t(l)} (${t(l.level).toLowerCase()})`))]]));
  const education = cv.education.map((e) => `<p><b>${esc(e.school)}</b>, ${esc(t(e.study))} · ${esc(e.years)}</p>`)
    .concat(cv.certifications.length ? [`<p>${esc(L.certification)}: ${esc(cv.certifications.join(', '))}</p>`] : []).join('');

  document.getElementById('cv').innerHTML = `
    <header class="head">
      <img class="photo" src="portrait.png" alt="" width="564" height="564">
      <div>
        <h1 class="name">${esc(o.fullName)}</h1>
        <p class="role">${esc(t(o.role))} · ${esc(t(o.base))}</p>
        <p class="avail">${esc(t(o.statusLong))}</p>
        <ul class="contact">${contact}</ul>
      </div>
    </header>
    ${sec('profile', `<p>${esc(t(cv.summary))}</p>`)}
    ${sec('experience', jobs)}
    ${sec('clients', clients)}
    ${sec('skills', skills)}
    ${sec('education', education)}
    <footer class="foot"><span>${esc(o.fullName)} · ${esc(L.title)}</span><span>${esc(L.updated)} ${esc(t(cv.updated))}</span></footer>`;
})();
