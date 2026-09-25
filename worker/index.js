/* Boss Rush XP leaderboard: a Cloudflare Worker in front of the static portfolio (deploy steps: DEPLOY.md).
   Every file of the site is served straight from the assets upload; /api/* and the desktop's short address
   (site() below) reach this code.
   One D1 table keeps each player's best winning run, where a player is a random id kept in their browser.
   The board is ordered by the game's own grade points: fight time plus ten seconds for every hit taken,
   lower first, and a tie goes to whoever got there first.
   A browser game can always be cheated by someone determined enough. This only turns away the impossible
   (MIN_TIME), the rude (rude()) and the hasty (POSTS); anything else is deleted by hand (DEPLOY.md).

   GET  /api/scores?top=10&pid=…&time=…&hits=…
        -> { total, top: [{ rank, name, time, hits, me }], me: { rank, name, time, hits } | null,
             would: { rank, total } | null }
        top: the best rows (1 to 10); me: this player's saved best; would: the rank a winning run of
        time seconds and hits hits would take, given only when it beats the player's saved best
        (me is left out then, the run supersedes it)
   POST /api/scores  { pid, name, time, hits }  (application/json)
        -> { saved, total, top, me }  saved is false when the player's saved best is already better
        errors: 400/413/415 bad, 403 origin, 422 time | name, 429 slow

   The same Worker carries two small things for the portfolio itself:
   POST /api/message  { from, subject, message, lang, website }  (application/json)
        Home's New Message, sent to the owner's inbox through Resend (message() below)
        -> { sent: true }   errors: 503 offline (no RESEND_API_KEY yet), 502 mail, 400/413/415 bad,
        403 origin, 422 from | message, 429 slow; the page opens the visitor's email app on any of them
   POST /api/event  { e, d }  (application/json, sent with sendBeacon)
        one more of what visitors do today (count() below) -> 204
   GET  /work/<slug>  the desktop with that case study's link preview (casePage() below); /sitemap.xml lists them */

import { CASES } from './cases.js';

const TOP = 10;
// nobody wins in under a minute: a bot that never gets hit and never stops attacking needs about 107 s
const MIN_TIME = 60, MAX_TIME = 6 * 3600, MAX_HITS = 999, HIT_COST = 10;
// saves one address may make per window (seconds): a real run takes minutes, and an office shares one address
const POSTS = { limit: 20, window: 600 };
const NAME_MAX = 12, BODY_MAX = 1024;
const PID = /^[a-z0-9]{16,40}$/;

// The desktop lives in option-a-desktop/ in the repo but is served at the bare address: / is its page, its own
// files (app.js, style.css …) are found beside it, and old /option-a-desktop/ links move to the short address.
// A redirect keeps the #/… part, so a shared window link still opens its window.
const DESK = '/option-a-desktop';
async function site(request, env, url) {
  const p = url.pathname;
  const one = p.match(/^\/work\/([a-z0-9-]+)\/?$/);
  if (one) return casePage(request, env, url, one[1]);
  if (p === '/sitemap.xml') return sitemap();
  if (p === DESK || p.startsWith(DESK + '/')) return Response.redirect(url.origin + (p.slice(DESK.length).replace(/^\/index\.html$/, '/') || '/') + url.search, 301);
  if (p === '/' || p === '/index.html') {
    if (p === '/index.html') return Response.redirect(url.origin + '/' + url.search, 301);
    return env.ASSETS.fetch(new Request(url.origin + DESK + '/' + url.search, request));
  }
  const res = await env.ASSETS.fetch(request);
  if (res.status !== 404) return res;
  return env.ASSETS.fetch(new Request(url.origin + DESK + p + url.search, request));
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/api/')) return site(request, env, url);
    if (url.pathname === '/api/message' || url.pathname === '/api/event') {
      if (request.method !== 'POST') return json({ error: 'method' }, 405, { allow: 'POST' });
      try { return url.pathname === '/api/message' ? await message(env, request, url) : await count(env.DB, request, url); } catch (e) {
        console.error(url.pathname, (e && e.stack) || e);
        return json({ error: 'server' }, 500);
      }
    }
    if (url.pathname !== '/api/scores') return json({ error: 'not_found' }, 404);
    try {
      if (request.method === 'GET') return json(await board(env.DB, url.searchParams));
      if (request.method === 'POST') return await submit(env.DB, request, url);
      return json({ error: 'method' }, 405, { allow: 'GET, POST' });
    } catch (e) {
      // D1 down or over its daily quota: the game carries on without the board
      console.error('scores', (e && e.stack) || e);
      return json({ error: 'server' }, 500);
    }
  },
};

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers },
  });
}

const pidOf = (v) => (typeof v === 'string' && PID.test(v) ? v : null);
// a run as the game reports it: seconds (two decimals) and hits taken; ok is false when it can't be real
function runOf(time, hits) {
  const t = typeof time === 'string' && time.trim() ? Number(time) : time;
  const h = typeof hits === 'string' && hits.trim() ? Number(hits) : hits;
  if (typeof t !== 'number' || !Number.isFinite(t) || t < 0 || !Number.isInteger(h) || h < 0 || h > MAX_HITS) return null;
  const ms = Math.round(t * 1000);
  return { ms, hits: h, score: ms + h * HIT_COST * 1000, ok: t >= MIN_TIME && t <= MAX_TIME };
}

async function board(db, q) {
  const n = Math.min(TOP, Math.max(1, parseInt(q.get('top'), 10) || TOP));
  const run = q.has('time') ? runOf(q.get('time'), q.get('hits')) : null;
  return standing(db, pidOf(q.get('pid')), run, n);
}

async function standing(db, pid, run, n = TOP) {
  const [top, count, mine] = await db.batch([
    db.prepare('SELECT pid, name, time_ms, hits FROM scores ORDER BY score_ms, at LIMIT ?').bind(n),
    db.prepare('SELECT COUNT(*) AS n FROM scores'),
    db.prepare('SELECT name, time_ms, hits, score_ms, at FROM scores WHERE pid = ?').bind(pid || ''),
  ]);
  const total = count.results[0].n, row = mine.results[0] || null;
  const out = {
    total,
    top: top.results.map((r, i) => ({ rank: i + 1, name: r.name, time: r.time_ms / 1000, hits: r.hits, me: !!pid && r.pid === pid })),
    me: null, would: null,
  };
  if (run && run.ok && (!row || run.score < row.score_ms)) {
    // saved runs as good as this one keep their place: they got there first
    const ahead = await db.prepare('SELECT COUNT(*) AS n FROM scores WHERE score_ms <= ? AND pid <> ?').bind(run.score, pid || '').first('n');
    out.would = { rank: ahead + 1, total: total + (row ? 0 : 1) };
  } else if (row) {
    const ahead = await db.prepare('SELECT COUNT(*) AS n FROM scores WHERE score_ms < ?1 OR (score_ms = ?1 AND at < ?2)').bind(row.score_ms, row.at).first('n');
    out.me = { rank: ahead + 1, name: row.name, time: row.time_ms / 1000, hits: row.hits };
  }
  return out;
}

async function submit(db, request, url) {
  if (!/^application\/json\b/i.test(request.headers.get('content-type') || '')) return json({ error: 'bad' }, 415);
  // only the portfolio's own pages save runs (a script can still, which is what MIN_TIME and POSTS are for)
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return json({ error: 'origin' }, 403);
  const text = await request.text();
  if (text.length > BODY_MAX) return json({ error: 'bad' }, 413);
  let body = null;
  try { body = JSON.parse(text); } catch (e) { body = null; }
  const pid = pidOf(body && body.pid), run = body && typeof body === 'object' ? runOf(body.time, body.hits) : null;
  if (!pid || !run) return json({ error: 'bad' }, 400);
  if (!(await allowed(db, request))) return json({ error: 'slow' }, 429);
  if (!run.ok) return json({ error: 'time' }, 422);
  const name = cleanName(body.name);
  if (!name) return json({ error: 'name' }, 422);
  // the player's row changes only when this run beats it
  const res = await db.prepare(`INSERT INTO scores (pid, name, time_ms, hits, score_ms, at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
    ON CONFLICT (pid) DO UPDATE SET name = excluded.name, time_ms = excluded.time_ms, hits = excluded.hits, score_ms = excluded.score_ms, at = excluded.at
    WHERE excluded.score_ms < scores.score_ms`).bind(pid, name, run.ms, run.hits, run.score, Date.now()).run();
  return json({ saved: res.meta.changes > 0, ...(await standing(db, pid, null)) });
}

// one counter per address and window; the address itself is never stored, only a hash of it. The game's saves,
// the messages and the event counts each keep their own counter (tag)
async function allowed(db, request, rule = POSTS, tag = '') {
  const k = await hash(tag + (request.headers.get('cf-connecting-ip') || 'local')), now = Math.floor(Date.now() / 1000);
  const res = await db.batch([
    db.prepare('DELETE FROM throttle WHERE until <= ?').bind(now),
    db.prepare(`INSERT INTO throttle (k, n, until) VALUES (?1, 1, ?2)
      ON CONFLICT (k) DO UPDATE SET n = n + 1`).bind(k, now + rule.window),
    db.prepare('SELECT n FROM throttle WHERE k = ?').bind(k),
  ]);
  return res[2].results[0].n <= rule.limit;
}
async function hash(s) {
  const d = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode('brxp:' + s)));
  return Array.from(d.slice(0, 16), (b) => b.toString(16).padStart(2, '0')).join('');
}

/* ---- names: public on a portfolio, so short, plain and polite ---- */
// 1 to 12 letters, digits, spaces, - or _ (the game checks the same before sending)
function cleanName(v) {
  if (typeof v !== 'string') return null;
  const s = v.normalize('NFKC').replace(/\s+/g, ' ').trim();
  if (!s || s.length > NAME_MAX || !/^[A-Za-z0-9 _-]+$/.test(s) || !/[A-Za-z0-9]/.test(s) || rude(s)) return null;
  return s;
}
// Insults and slurs in English and Indonesian, matched after undoing digit swaps (4 for a, 0 for o …),
// gaps and stretched letters. PARTS are caught anywhere in a name; WORDS only as a whole word, because
// they hide inside innocent ones (Nazir, Pantai, Asuransi, Sentot, Pukis, Therapist). No list is complete,
// and a few innocent names get caught (Scunthorpe); the rest is deleted by hand.
const LEET = { 0: 'o', 1: 'i', 2: 'z', 3: 'e', 4: 'a', 5: 's', 6: 'g', 7: 't', 8: 'b', 9: 'g' };
const PARTS = [
  'fuck', 'shit', 'cunt', 'bitch', 'whore', 'slut', 'nigger', 'nigga', 'faggot', 'retard', 'pussy', 'penis', 'vagina',
  'porn', 'dildo', 'jizz', 'wank', 'twat', 'hitler', 'molest', 'pedophil', 'pedofil',
  'kontol', 'kntl', 'memek', 'ngentot', 'ngewe', 'jancok', 'jancuk', 'dancok', 'bangsat', 'bgst', 'bajingan', 'keparat',
  'pepek', 'lonte', 'lacur', 'anjing', 'anjg', 'goblok', 'goblog', 'tolol', 'jembut', 'bencong', 'bokep', 'bispak',
  'jablay', 'pukimak', 'kimak', 'kanjut', 'colmek', 'ngaceng', 'toket', 'pantek', 'sundal',
];
const WORDS = [
  'ass', 'arse', 'fag', 'fk', 'fck', 'fuk', 'fuq', 'sex', 'cum', 'dick', 'cock', 'tits', 'boob', 'boobs', 'anal', 'nazi',
  'kkk', 'rape', 'rapist', 'pedo', 'coon', 'spic', 'chink', 'gook', 'kike', 'paki', 'milf', 'horny', 'nude', 'nudes', 'xxx',
  'asu', 'tai', 'taik', 'cok', 'babi', 'bego', 'homo', 'banci', 'coli', 'sange', 'entot', 'ewe', 'itil', 'tetek',
  'puki', 'perek', 'mmk', 'gblk', 'tll', 'anj', 'jmbt',
];
const squeeze = (s) => s.replace(/(.)\1+/g, '$1');
function rude(name) {
  const words = name.toLowerCase().replace(/[0-9]/g, (d) => LEET[d]).split(/[ _-]+/).filter(Boolean);
  const flat = words.join('');
  if (PARTS.some((p) => flat.includes(p) || squeeze(flat).includes(p))) return true;
  return [...words, flat].some((w) => WORDS.includes(w) || WORDS.includes(squeeze(w)));
}

/* ---- a link to one case study ---- */
// iqbalsurya.com/work/krool is the desktop page with that case's own title, text and picture in its head, so a link
// preview (LinkedIn, WhatsApp, Slack) and a search result show the case and not Home. In the browser the page moves
// to the desktop's own address for the case (/#/work/krool), which opens its player and skips the welcome screen.
const SITE = 'https://iqbalsurya.com';
const attr = (v) => String(v).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
async function casePage(request, env, url, slug) {
  const c = CASES.find((x) => x.slug === slug);
  if (!c) return Response.redirect(url.origin + '/#/work', 302);
  const res = await env.ASSETS.fetch(new Request(url.origin + DESK + '/', request));
  if (!res.ok) return res;
  const page = `${SITE}/work/${slug}`, title = `${c.title} - Iqbal Surya Pratama, product designer`;
  const meta = (html, key, value) => html.replace(new RegExp(`(<meta (?:name|property)="${key}" content=")[^"]*"`), `$1${attr(value)}"`);
  let html = await res.text();
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${attr(title)}</title>`)
    .replace(/(<link rel="canonical" href=")[^"]*"/, `$1${page}"`);
  for (const [k, v] of [['description', c.text], ['og:type', 'article'], ['og:url', page], ['og:title', title], ['og:description', c.text],
    ['og:image', `${SITE}/asset/share/case-${slug}-1200x630.jpg?v=1`], ['og:image:alt', `${c.title}, a case study by Iqbal Surya Pratama`]]) html = meta(html, k, v);
  // the page's files are named from the desktop's own folder, which is the bare address here
  html = html.replace('<meta charset="utf-8">', `<meta charset="utf-8">\n  <base href="/">\n  <script>history.replaceState(null, '', '/' + location.search + '#/work/${slug}');</script>`);
  return new Response(html, { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300' } });
}
function sitemap() {
  const urls = ['/', ...CASES.map((c) => `/work/${c.slug}`)].map((u) => `  <url><loc>${SITE}${u}</loc></url>`).join('\n');
  return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' } });
}

/* ---- Home's New Message ---- */
// Resend delivers it (DEPLOY.md, "Pesan dari form"): RESEND_API_KEY is a secret, MESSAGE_TO and MESSAGE_FROM are
// vars in wrangler.jsonc. Every message is kept in D1 as well, so one Resend refuses is not lost.
const MSG = { limit: 5, window: 3600, from: 200, subject: 150, body: 5000 };
const EMAIL = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;
async function message(env, request, url) {
  if (!env.RESEND_API_KEY || !env.MESSAGE_TO) return json({ error: 'offline' }, 503);
  const body = await jsonBody(request, url, 8 * 1024);
  if (body instanceof Response) return body;
  // a bot filled in the field people never see: tell it all went well and keep nothing
  if (body.website) return json({ sent: true });
  const line = (v, max) => (typeof v === 'string' ? v.replace(/[\r\n\t]+/g, ' ').trim().slice(0, max) : '');
  const from = line(body.from, MSG.from), subject = line(body.subject, MSG.subject) || 'New message';
  const text = typeof body.message === 'string' ? body.message.trim() : '';
  if (!EMAIL.test(from)) return json({ error: 'from' }, 422);
  if (!text || text.length > MSG.body) return json({ error: 'message' }, 422);
  if (!(await allowed(env.DB, request, MSG, 'msg:'))) return json({ error: 'slow' }, 429);
  const lang = body.lang === 'id' ? 'id' : 'en';
  const id = await env.DB.prepare('INSERT INTO messages (at, sender, subject, body, lang) VALUES (?1, ?2, ?3, ?4, ?5) RETURNING id')
    .bind(Date.now(), from, subject, text, lang).first('id');
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.MESSAGE_FROM || 'Portfolio <portfolio@iqbalsurya.com>', to: [env.MESSAGE_TO], reply_to: from,
      subject: `[iqbalsurya.com] ${subject}`,
      text: `${text}\n\n---\nFrom: ${from}\nSent from the New Message window on iqbalsurya.com (${lang === 'id' ? 'Bahasa Indonesia' : 'English'}).`,
    }),
  });
  if (!res.ok) { console.error('resend', res.status, await res.text()); return json({ error: 'mail' }, 502); }
  await env.DB.prepare('UPDATE messages SET mailed = 1 WHERE id = ?').bind(id).run();
  return json({ sent: true });
}

/* ---- what visitors do ---- */
// A count per day, event and detail (DEPLOY.md, "Apa yang dilakukan pengunjung"). Nothing about the visitor is
// kept; only the listed events and details are counted, so the table can't be filled with anything else.
const EVENTS = {
  case: /^[a-z0-9-]{1,40}$/, window: /^(about|work|contact|resume|game)$/, cv: /^(open|save|request)$/,
  send: /^(api|mailto)$/, copy: /^email$/, start: /^$/, social: /^(linkedin|dribbble|behance|upwork)$/,
};
const EVENT_RATE = { limit: 120, window: 600 };
async function count(db, request, url) {
  const body = await jsonBody(request, url, 256);
  if (body instanceof Response) return body;
  const e = body.e, d = typeof body.d === 'string' ? body.d : '';
  if (!Object.hasOwn(EVENTS, e) || !EVENTS[e].test(d)) return json({ error: 'bad' }, 400);
  if (!(await allowed(db, request, EVENT_RATE, 'ev:'))) return json({ error: 'slow' }, 429);
  await db.prepare(`INSERT INTO events (day, name, detail, n) VALUES (?1, ?2, ?3, 1)
    ON CONFLICT (day, name, detail) DO UPDATE SET n = n + 1`).bind(new Date().toISOString().slice(0, 10), e, d).run();
  return new Response(null, { status: 204 });
}

// a small JSON body from the portfolio's own pages, or the Response that turns it away
async function jsonBody(request, url, max) {
  if (!/^application\/json\b/i.test(request.headers.get('content-type') || '')) return json({ error: 'bad' }, 415);
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return json({ error: 'origin' }, 403);
  const text = await request.text();
  if (text.length > max) return json({ error: 'bad' }, 413);
  try { const v = JSON.parse(text); if (v && typeof v === 'object' && !Array.isArray(v)) return v; } catch (e) { /* bad below */ }
  return json({ error: 'bad' }, 400);
}
