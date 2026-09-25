/* Draws the one-page CV from PF.owner (shared/content.js) and PF.cv (cv-data.js). ?lang=en or ?lang=id */
(() => {
  'use strict';
  const PF = window.PF, o = PF.owner, cv = PF.cv;
  const lang = new URLSearchParams(location.search).get('lang') === 'id' ? 'id' : 'en';
  const t = (v) => PF.t(v, lang);
  const L = cv.labels[lang];
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const month = (ym) => { const [y, m] = ym.split('/'); return `${L.months[Number(m) - 1]} ${y}`; };
  const bare = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  const sec = (key, body) => (body ? `<section class="sec sec-${key}"><h2>${esc(L[key])}</h2><div>${body}</div></section>` : '');
  const rows = (list) => (list.length ? `<dl class="rows">${list.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>` : '');

  document.documentElement.lang = lang;
  document.title = `${o.fullName}, ${t(o.role)}: ${L.title}`;

  // an Upwork address is a long id, so it prints as its label; the others print as their address
  const contact = [`<li><a href="mailto:${esc(o.email)}">${esc(o.email)}</a></li>`]
    .concat(o.socials.map((s) => `<li><a href="${esc(s.url)}">${esc(s.key === 'upwork' ? `Upwork: ${t(s.handle)}` : bare(s.url))}</a></li>`)).join('');

  const jobs = o.worklog.map((j) => {
    const place = j.place ? t(cv.places[j.place] || j.place) : '';
    const duties = cv.duties[`${j.org} ${j.from}`] || [];
    const when = `<p class="when">${esc(month(j.from))} – ${j.to ? esc(month(j.to)) : `<b>${esc(L.present)}</b>`}</p>`;
    const org = [j.org, L[j.type], place].filter(Boolean).map(esc).join(' · ');
    if (j.to && !duties.length) return `<article class="job brief"><h3>${esc(j.role)} <span>· ${org}</span></h3>${when}</article>`;
    return `<article class="job">
      <h3>${esc(j.role)}</h3>${when}
      <p class="org">${org}</p>
      ${duties.length ? `<ul>${duties.map((d) => `<li>${esc(t(d))}</li>`).join('')}</ul>` : ''}
    </article>`;
  }).join('');

  const clients = `<p>${PF.home.logos.list.map((c) => esc(c.name)).join(', ')}</p>`;
  // a skill can carry its own comma, so the items are split by middle dots, and each item wraps as a whole;
  // languages close the list with their levels
  const items = (list) => list.map((x) => `<span>${esc(x)}</span>`).join(' · ');
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
