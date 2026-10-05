/* The games' leaderboards: a Cloudflare Worker in front of the static portfolio (deploy steps: DEPLOY.md).
   Every file of the site is served straight from the assets upload; /api/* and the desktop's short address
   (site() below) reach this code.
   Each game (GAMES below: Boss Rush XP and Screen Saver XP) has its own D1 table keeping each player's best
   winning run, where a player is a random id kept in their browser.
   A board is ordered by the games' own grade points: fight time plus ten seconds for every hit taken,
   lower first, and a tie goes to whoever got there first.
   A browser game can always be cheated by someone determined enough. This only turns away the impossible
   (each game's min), the rude (rude()) and the hasty (POSTS); anything else is deleted by hand (DEPLOY.md).

   GET  /api/scores?game=ssxp&top=10&pid=…&time=…&hits=…
        -> { total, top: [{ rank, name, time, hits, me }], me: { rank, name, time, hits } | null,
             would: { rank, total } | null }
        game: brxp (Boss Rush XP, also when there is no game) or ssxp (Screen Saver XP)
        top: the best rows (1 to 10); me: this player's saved best; would: the rank a winning run of
        time seconds and hits hits would take, given only when it beats the player's saved best
        (me is left out then, the run supersedes it)
   POST /api/scores?game=ssxp  { pid, name, time, hits }  (application/json)
        -> { saved, total, top, me }  saved is false when the player's saved best is already better
        errors: 400/413/415 bad (an unknown game too), 403 origin, 422 time | name, 429 slow

   The same Worker carries a few small things for the portfolio itself:
   POST /api/message  { from, subject, message, lang, website }  (application/json)
        Home's New Message, sent to the owner's inbox through Resend or held back from it (message() below)
        -> { sent: true }, held or not   errors: 503 offline (no RESEND_API_KEY yet), 502 mail, 400/413/415 bad,
        403 origin, 422 from | message; the page opens the visitor's email app on any of them
   GET|POST /api/message/act?id=…&t=…&do=release|block
        the links in the owner's emails: the GET asks, its button POSTs (act() below)
   every morning (the cron in wrangler.jsonc): the messages held since the last one, in one email (digest() below)
   POST /api/event  { e, d }  (application/json, sent with sendBeacon)
        one more of what visitors do today (count() below) -> 204
   GET  /work/<slug>  the desktop with that case study's link preview (casePage() below); /sitemap.xml lists them */

import { CASES } from './cases.js';

const TOP = 10;
// each game's board: its table (worker/migrations), the least time a winning run can take (min, in seconds) and the
// tag of its saves' counter (allowed()). Table names come from here only, never from a request
const GAMES = {
  // Boss Rush XP: nobody wins in under a minute, a bot that never gets hit and never stops attacking needs about 107 s
  brxp: { table: 'scores', min: 60, tag: '' },
  // Screen Saver XP: nobody wins in under two minutes. The five bosses hold 2,500 health, 125 s of fire even if
  // every shot lands, and a bot that never gets hit and always aims at the ring needs about 240 s. Less health for
  // the bosses means a lower min
  ssxp: { table: 'ssxp_scores', min: 120, tag: 'ssxp:' },
};
// the game a request names, Boss Rush XP when it names none (its page never does), null when it names another
const gameOf = (q) => { const g = q.get('game'); return g === null ? GAMES.brxp : Object.hasOwn(GAMES, g) ? GAMES[g] : null; };
const MAX_TIME = 6 * 3600, MAX_HITS = 999, HIT_COST = 10;
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

// http:// and www move to https://iqbalsurya.com with the same path (308 keeps a POST's body), workers.dev stays.
// The Worker's answers carry HSTS for a year, this host only: mail and Resend use subdomains that never serve the site
const HOST = 'iqbalsurya.com';
const HSTS = 'max-age=31536000';
function moved(request, url) {
  if (url.hostname !== HOST && url.hostname !== 'www.' + HOST) return null;
  if (url.protocol === 'https:' && url.hostname === HOST) return null;
  return Response.redirect(`https://${HOST}${url.pathname}${url.search}`, request.method === 'GET' || request.method === 'HEAD' ? 301 : 308);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const away = moved(request, url);
    if (away) return away;
    const res = await answer(request, env, url);
    if (url.hostname !== HOST) return res;
    const out = new Response(res.body, res);
    out.headers.set('strict-transport-security', HSTS);
    return out;
  },
  // every morning (the cron in wrangler.jsonc): the messages held since the last one, in one email to the owner
  async scheduled(controller, env, ctx) {
    ctx.waitUntil(digest(env).catch((e) => console.error('digest', (e && e.stack) || e)));
  },
};

async function answer(request, env, url) {
  if (!url.pathname.startsWith('/api/')) return site(request, env, url);
  if (url.pathname === '/api/message' || url.pathname === '/api/event') {
    if (request.method !== 'POST') return json({ error: 'method' }, 405, { allow: 'POST' });
    try { return url.pathname === '/api/message' ? await message(env, request, url) : await count(env.DB, request, url); } catch (e) {
      console.error(url.pathname, (e && e.stack) || e);
      return json({ error: 'server' }, 500);
    }
  }
  if (url.pathname === '/api/message/act') {
    try { return await act(env, request, url); } catch (e) {
      console.error(url.pathname, (e && e.stack) || e);
      return ownerPage('Ada yang gagal', 'Coba buka tautannya lagi beberapa menit lagi.', 500);
    }
  }
  if (url.pathname !== '/api/scores') return json({ error: 'not_found' }, 404);
  const game = gameOf(url.searchParams);
  if (!game) return json({ error: 'bad' }, 400);
  try {
    if (request.method === 'GET') return json(await board(env.DB, game, url.searchParams));
    if (request.method === 'POST') return await submit(env.DB, game, request, url);
    return json({ error: 'method' }, 405, { allow: 'GET, POST' });
  } catch (e) {
    // D1 down or over its daily quota: the game carries on without the board
    console.error('scores', (e && e.stack) || e);
    return json({ error: 'server' }, 500);
  }
}

function json(body, status = 200, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', 'x-content-type-options': 'nosniff', ...headers },
  });
}

const pidOf = (v) => (typeof v === 'string' && PID.test(v) ? v : null);
// a run as the game reports it: seconds (two decimals) and hits taken; ok is false when it can't be real
function runOf(game, time, hits) {
  const t = typeof time === 'string' && time.trim() ? Number(time) : time;
  const h = typeof hits === 'string' && hits.trim() ? Number(hits) : hits;
  if (typeof t !== 'number' || !Number.isFinite(t) || t < 0 || !Number.isInteger(h) || h < 0 || h > MAX_HITS) return null;
  const ms = Math.round(t * 1000);
  return { ms, hits: h, score: ms + h * HIT_COST * 1000, ok: t >= game.min && t <= MAX_TIME };
}

async function board(db, game, q) {
  const n = Math.min(TOP, Math.max(1, parseInt(q.get('top'), 10) || TOP));
  const run = q.has('time') ? runOf(game, q.get('time'), q.get('hits')) : null;
  return standing(db, game, pidOf(q.get('pid')), run, n);
}

async function standing(db, game, pid, run, n = TOP) {
  const T = game.table;
  const [top, count, mine] = await db.batch([
    db.prepare(`SELECT pid, name, time_ms, hits FROM ${T} ORDER BY score_ms, at LIMIT ?`).bind(n),
    db.prepare(`SELECT COUNT(*) AS n FROM ${T}`),
    db.prepare(`SELECT name, time_ms, hits, score_ms, at FROM ${T} WHERE pid = ?`).bind(pid || ''),
  ]);
  const total = count.results[0].n, row = mine.results[0] || null;
  const out = {
    total,
    top: top.results.map((r, i) => ({ rank: i + 1, name: r.name, time: r.time_ms / 1000, hits: r.hits, me: !!pid && r.pid === pid })),
    me: null, would: null,
  };
  if (run && run.ok && (!row || run.score < row.score_ms)) {
    // saved runs as good as this one keep their place: they got there first
    const ahead = await db.prepare(`SELECT COUNT(*) AS n FROM ${T} WHERE score_ms <= ? AND pid <> ?`).bind(run.score, pid || '').first('n');
    out.would = { rank: ahead + 1, total: total + (row ? 0 : 1) };
  } else if (row) {
    const ahead = await db.prepare(`SELECT COUNT(*) AS n FROM ${T} WHERE score_ms < ?1 OR (score_ms = ?1 AND at < ?2)`).bind(row.score_ms, row.at).first('n');
    out.me = { rank: ahead + 1, name: row.name, time: row.time_ms / 1000, hits: row.hits };
  }
  return out;
}

async function submit(db, game, request, url) {
  if (!/^application\/json\b/i.test(request.headers.get('content-type') || '')) return json({ error: 'bad' }, 415);
  // only the portfolio's own pages save runs (a script can still, which is what each game's min and POSTS are for)
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return json({ error: 'origin' }, 403);
  const text = await request.text();
  if (text.length > BODY_MAX) return json({ error: 'bad' }, 413);
  let body = null;
  try { body = JSON.parse(text); } catch (e) { body = null; }
  const pid = pidOf(body && body.pid), run = body && typeof body === 'object' ? runOf(game, body.time, body.hits) : null;
  if (!pid || !run) return json({ error: 'bad' }, 400);
  if (!(await allowed(db, request, POSTS, game.tag))) return json({ error: 'slow' }, 429);
  if (!run.ok) return json({ error: 'time' }, 422);
  const name = cleanName(body.name);
  if (!name) return json({ error: 'name' }, 422);
  // the player's row changes only when this run beats it
  const res = await db.prepare(`INSERT INTO ${game.table} (pid, name, time_ms, hits, score_ms, at) VALUES (?1, ?2, ?3, ?4, ?5, ?6)
    ON CONFLICT (pid) DO UPDATE SET name = excluded.name, time_ms = excluded.time_ms, hits = excluded.hits, score_ms = excluded.score_ms, at = excluded.at
    WHERE excluded.score_ms < ${game.table}.score_ms`).bind(pid, name, run.ms, run.hits, run.score, Date.now()).run();
  return json({ saved: res.meta.changes > 0, ...(await standing(db, game, pid, null)) });
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
// A message that looks like someone fooling around is held: kept in D1 but not mailed, while the page still says it
// was sent, so the sender learns nothing to work around (holdFor()). One email each morning lists what was held, with
// links that release a message to the inbox or block its network (digest(), act()). Past MSG.limit an hour from one
// address the sender is a script: the page is told the same and nothing is kept.
const HOUR = 3600 * 1000, DAY = 24 * HOUR;
const MSG = { limit: 20, window: 3600, from: 200, subject: 150, body: 5000 };
// held past 3 an hour or 10 a day from one network, under 3 words, or with 3 links or more (a real brief may carry its
// own site and one it likes); a block holds a network for 7 days, and a message keeps its network for 30
const HOLD = { hour: 3, day: 10, words: 3, links: 3, block: 7 * DAY, keep: 30 * DAY };
const EMAIL = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;
const LINK = /(?:https?:\/\/|www\.)\S+/gi;
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
  // An address no reply can reach sends the message back to the form: a slip on a big provider's name, whose fix the
  // page offers (sure: the visitor saw the fix and sent the address as typed all the same), or a domain without mail
  const fix = body.sure === true ? null : slip(from);
  if (fix) return json({ error: 'from', suggest: fix }, 422);
  if (!(await takesMail(from.slice(from.lastIndexOf('@') + 1).toLowerCase()))) return json({ error: 'from' }, 422);
  if (!(await allowed(env.DB, request, MSG, 'msg:'))) return json({ sent: true });
  const now = Date.now(), net = await netOf(request);
  const m = { at: now, sender: from, subject, body: text, lang: body.lang === 'id' ? 'id' : 'en', net, token: newToken() };
  m.held = await holdFor(env.DB, m);
  m.id = await env.DB.prepare(`INSERT INTO messages (at, sender, subject, body, lang, held, net, token)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8) RETURNING id`).bind(now, from, subject, text, m.lang, m.held, net, m.token).first('id');
  if (m.held) return json({ sent: true });
  if (!(await deliver(env, m))) return json({ error: 'mail' }, 502);
  await env.DB.prepare('UPDATE messages SET mailed = 1 WHERE id = ?').bind(m.id).run();
  return json({ sent: true });
}

// Why a message is held (a key of REASON), or null when it goes to the inbox. Every message counts toward its
// network's hour and day, held ones too, so a network that keeps on sending stays held. Rude words count in the
// sender's address as well as in the message
async function holdFor(db, m) {
  const q = (sql, ...v) => db.prepare(sql).bind(...v);
  const [blocked, day, hour, same] = (await db.batch([
    q('SELECT COUNT(*) AS n FROM blocked WHERE net = ? AND until > ?', m.net, m.at),
    q('SELECT COUNT(*) AS n FROM messages WHERE net = ? AND at > ?', m.net, m.at - DAY),
    q('SELECT COUNT(*) AS n FROM messages WHERE net = ? AND at > ?', m.net, m.at - HOUR),
    q('SELECT COUNT(*) AS n FROM messages WHERE body = ? AND at > ?', m.body, m.at - DAY),
  ])).map((r) => r.results[0].n);
  if (blocked) return 'blocked';
  if (day >= HOLD.day) return 'day';
  if (hour >= HOLD.hour) return 'hour';
  if (same) return 'same';
  if (rudeText(m.body) || rudeText(m.sender, false)) return 'rude';
  if ((m.body.match(LINK) || []).length >= HOLD.links) return 'links';
  if (m.body.split(/\s+/).length < HOLD.words) return 'short';
  return null;
}
// each reason as the owner reads it, in the digest and on the links' pages
const REASON = {
  blocked: 'jaringan pengirimnya sedang diblokir',
  day: `sudah ada ${HOLD.day} pesan dari jaringan yang sama dalam 24 jam`,
  hour: `sudah ada ${HOLD.hour} pesan dari jaringan yang sama dalam 1 jam`,
  same: 'isinya sama dengan pesan lain dalam 24 jam',
  rude: 'ada kata kasar di pesan atau alamat emailnya',
  links: `ada ${HOLD.links} link atau lebih`,
  short: `kurang dari ${HOLD.words} kata`,
};
// The names' rude words (rude() above), looked for one word at a time: run together, a sentence would find them
// across its words. A number alone is a price or a date, so 455 stays 455 and not 4ss. A few words that are rude in
// a name are plain in a brief: cum laude, E. coli, nude tones, blue tits, a budget of xxx. In an address only the
// PARTS count (words = false), since the short WORDS are also people's names (Dick, Tai); an address that only looks
// rude (a Thai Porn…) waits in the digest like any held message
const PLAIN = ['cum', 'coli', 'nude', 'nudes', 'tits', 'xxx'];
function rudeText(text, words = true) {
  return text.normalize('NFKC').toLowerCase().split(/[^\p{L}\p{N}]+/u).some((w) => {
    if (!/\p{L}/u.test(w)) return false;
    const s = w.replace(/[0-9]/g, (d) => LEET[d]), q = squeeze(s);
    return PARTS.some((p) => s.includes(p) || q.includes(p)) || (words && [s, q].some((x) => WORDS.includes(x) && !PLAIN.includes(x)));
  });
}
// The sender's network, hashed like allowed()'s addresses: an IPv4 address, or the first half (the /64) of an IPv6
// one, which a phone or a home connection keeps while the second half changes
async function netOf(request) {
  const ip = request.headers.get('cf-connecting-ip') || 'local';
  if (!ip.includes(':') || ip.includes('.')) return hash('net:' + ip.slice(ip.lastIndexOf(':') + 1));
  const [head, tail] = ip.split('::'), a = head ? head.split(':') : [], b = tail ? tail.split(':') : [];
  const all = tail === undefined ? a : [...a, ...Array(Math.max(0, 8 - a.length - b.length)).fill('0'), ...b];
  return hash('net:' + all.slice(0, 4).map((g) => (parseInt(g, 16) || 0).toString(16)).join(':') + '::/64');
}
const newToken = () => Array.from(crypto.getRandomValues(new Uint8Array(16)), (b) => b.toString(16).padStart(2, '0')).join('');

// A slip of one letter in a big provider's name (gmai.com, gmial.com, yaho.com), as the address with the provider's
// name instead, or null. Some of those names belong to strangers who keep the mail sent there. The real providers a
// letter away (mail.com, ymail.com, yahoo.co.in …) are left as typed
const PROVIDERS = ['gmail.com', 'yahoo.com', 'yahoo.co.id', 'hotmail.com', 'outlook.com', 'icloud.com'];
const NEIGHBOURS = ['mail.com', 'email.com', 'ymail.com', 'yahoo.co.in', 'yahoo.co.il'];
function slip(address) {
  const at = address.lastIndexOf('@'), domain = address.slice(at + 1).toLowerCase();
  if (PROVIDERS.includes(domain) || NEIGHBOURS.includes(domain)) return null;
  const near = PROVIDERS.find((p) => oneOff(domain, p));
  return near ? address.slice(0, at + 1) + near : null;
}
// a and b one edit apart: a letter changed, added or dropped, or two neighbouring letters swapped
function oneOff(a, b) {
  if (a === b || Math.abs(a.length - b.length) > 1) return false;
  let i = 0;
  while (i < a.length && a[i] === b[i]) i++;
  if (a.length === b.length) return a.slice(i + 1) === b.slice(i + 1) || (a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2));
  return a.length < b.length ? a.slice(i) === b.slice(i + 1) : a.slice(i + 1) === b.slice(i);
}
// Whether mail can reach a domain, asked of Cloudflare's DNS over HTTPS: it has a mail server (MX) other than the null
// MX of a domain that refuses mail (example.com). A domain that doesn't exist (asdf.asdf) or has no mail server
// (test.com, gmial.com) can't take a reply. When DNS doesn't answer within 2 s, the address gets the benefit of the
// doubt: the question races a timer, which also holds when a fetch hangs and ignores its abort signal (local workerd)
async function takesMail(domain) {
  const ask = fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`, { headers: { accept: 'application/dns-json' } })
    .then((res) => (res.ok ? res.json() : null)).catch(() => null);
  let timer = 0;
  const late = new Promise((resolve) => { timer = setTimeout(resolve, 2000, null); });
  const dns = await Promise.race([ask, late]);
  clearTimeout(timer);
  // 0: an answer, 3: no such domain; no answer in time, or a failing server's status, can't tell
  if (!dns || (dns.Status !== 0 && dns.Status !== 3)) return true;
  return (dns.Answer || []).some((r) => r.type === 15 && !/^0\s+\.?$/.test(String(r.data).trim()));
}

// one email to the owner through Resend: false, and a line in the log, when Resend refuses it
async function resend(env, mail) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({ from: env.MESSAGE_FROM || 'Portfolio <portfolio@iqbalsurya.com>', to: [env.MESSAGE_TO], ...mail }),
  });
  if (!res.ok) console.error('resend', res.status, await res.text());
  return res.ok;
}
// a message as it reaches the inbox: Reply answers the sender, and the foot carries the link that blocks their network.
// The link is on the site's own HTTPS address, as in the digest, whatever address the message came through
function deliver(env, m) {
  const foot = [
    `Dari: ${m.sender}`,
    `Dikirim dari jendela New Message di iqbalsurya.com (${m.lang === 'id' ? 'Bahasa Indonesia' : 'English'}).`,
    m.held ? `Pesan ini sempat ditahan: ${REASON[m.held]}.` : '',
    m.net ? `Blokir pengirim ini (${HOLD.block / DAY} hari): ${actLink(SITE, m, 'block')}` : '',
  ];
  return resend(env, { reply_to: m.sender, subject: `[iqbalsurya.com] ${m.subject}`, text: `${m.body}\n\n---\n${foot.filter(Boolean).join('\n')}` });
}
const actLink = (origin, m, what) => `${origin}/api/message/act?id=${m.id}&t=${m.token}&do=${what}`;

// The Release and Block links in the owner's emails. Opening one only shows what it will do, with a button that posts
// back to the same address: mail apps and their link scanners open links by themselves, and that must not release or
// block anything. Each message has its own random token, so a link can't be guessed.
async function act(env, request, url) {
  if (request.method !== 'GET' && request.method !== 'POST') return new Response(null, { status: 405, headers: { allow: 'GET, POST' } });
  const q = url.searchParams, what = q.get('do'), id = Number(q.get('id')), t = q.get('t') || '';
  const m = (what === 'release' || what === 'block') && Number.isSafeInteger(id) && id > 0 && /^[0-9a-f]{32}$/.test(t)
    ? await env.DB.prepare('SELECT id, at, sender, subject, body, lang, held, net, token, mailed FROM messages WHERE id = ? AND token = ?').bind(id, t).first()
    : null;
  if (!m) return ownerPage('Tautan tidak berlaku', 'Pesan untuk tautan ini tidak ditemukan. Mungkin tautannya terpotong saat disalin.', 404);
  const post = request.method === 'POST', now = Date.now();
  const inbox = () => ownerPage('Sudah di inbox', `Pesan dari ${m.sender} sudah ada di inbox kamu.`, 200, quote(m));
  if (what === 'release') {
    if (m.mailed) return inbox();
    if (!post) return ownerPage('Loloskan pesan ini ke inbox?', 'Pesan ini dikirim ke inbox seperti pesan biasa, dan Reply langsung ke pengirimnya.', 200, quote(m) + button('Loloskan ke inbox'));
    // claimed before it is sent, so a second press can't send it twice
    const claim = await env.DB.prepare('UPDATE messages SET mailed = 1 WHERE id = ? AND mailed = 0').bind(m.id).run();
    if (!claim.meta.changes) return inbox();
    const sent = await deliver(env, m).catch((e) => { console.error('resend', (e && e.stack) || e); return false; });
    if (!sent) {
      await env.DB.prepare('UPDATE messages SET mailed = 0 WHERE id = ?').bind(m.id).run();
      return ownerPage('Belum terkirim', 'Resend menolak pesannya. Coba lagi beberapa menit lagi.', 502, quote(m) + button('Coba lagi'));
    }
    return ownerPage('Pesan diloloskan', `Pesan dari ${m.sender} sudah dikirim ke inbox kamu. Balas dari sana seperti biasa.`);
  }
  if (!m.net) return ownerPage('Sudah terlalu lama', `Jaringan pengirim hanya disimpan ${HOLD.keep / DAY} hari, jadi pesan ini tidak bisa dipakai untuk memblokir lagi.`, 410, quote(m));
  const days = HOLD.block / DAY;
  if (!post) {
    const until = await env.DB.prepare('SELECT until FROM blocked WHERE net = ? AND until > ?').bind(m.net, now).first('until');
    const note = until ? ` Jaringan ini sudah diblokir sampai ${when(until)}; tombol di bawah memperpanjangnya.` : '';
    return ownerPage('Blokir pengirim ini?', `Selama ${days} hari, pesan dari jaringan yang sama ditahan dan hanya muncul di ringkasan pagi, apa pun alamat email yang dipakai. Pengirimnya tetap melihat "Pesan terkirim".${note}`, 200, quote(m) + button(`Blokir ${days} hari`));
  }
  const end = now + HOLD.block;
  await env.DB.prepare('INSERT INTO blocked (net, until) VALUES (?1, ?2) ON CONFLICT (net) DO UPDATE SET until = excluded.until').bind(m.net, end).run();
  return ownerPage('Pengirim diblokir', `Sampai ${when(end)}, pesan dari jaringan ini ditahan dan hanya muncul di ringkasan pagi.`);
}
// the small pages behind those links, read by the owner only, often on a phone from the mail app
function ownerPage(title, text, status = 200, more = '') {
  return new Response(`<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${attr(title)}</title>
<style>
  body { margin: 0; padding: 24px 16px; background: #eef0f4; color: #1d2230; font: 16px/1.5 system-ui, -apple-system, "Segoe UI", sans-serif; }
  main { max-width: 560px; margin: 0 auto; padding: 24px; background: #fff; border: 1px solid #d9dde5; border-radius: 8px; }
  h1 { margin: 0 0 8px; font-size: 20px; line-height: 1.3; }
  p { margin: 0 0 16px; }
  blockquote { margin: 0 0 16px; padding: 12px 16px; background: #eef0f4; border-radius: 6px; white-space: pre-wrap; overflow-wrap: anywhere; }
  small { display: block; margin-bottom: 4px; color: #545b6e; font-size: 14px; }
  form { margin: 0; }
  button { font: inherit; font-weight: 600; color: #fff; background: #245edb; border: 0; border-radius: 6px; padding: 12px 20px; cursor: pointer; }
</style>
</head>
<body><main><h1>${attr(title)}</h1><p>${attr(text)}</p>${more}</main></body>
</html>
`, { status, headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'referrer-policy': 'no-referrer', 'x-robots-tag': 'noindex' } });
}
const quote = (m) => `<blockquote><small>${attr(when(m.at))} · ${attr(m.sender)}${m.held ? ` · ditahan: ${attr(REASON[m.held])}` : ''}</small>${attr(cut(m.body, 1000))}</blockquote>`;
const button = (label) => `<form method="post"><button type="submit">${attr(label)}</button></form>`;
const cut = (s, max) => (s.length > max ? s.slice(0, max).trimEnd() + '…' : s);
// a time as the owner reads it: in Indonesian, on North Sumatra's clock (WIB)
const when = (ms) => new Date(ms).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

// The morning email: the messages held since the last one, oldest first (the first LIST of them, then how many more),
// each with its Release link and, while its network is known and not blocked already, its Block link. It goes out
// only when something was held. The same run forgets the networks older than HOLD.keep and the blocks that ended.
const LIST = 30;
async function digest(env) {
  const db = env.DB, now = Date.now();
  await db.batch([
    db.prepare('UPDATE messages SET net = NULL WHERE net IS NOT NULL AND at < ?').bind(now - HOLD.keep),
    db.prepare('DELETE FROM blocked WHERE until <= ?').bind(now),
  ]);
  if (!env.RESEND_API_KEY || !env.MESSAGE_TO) return;
  const waiting = 'held IS NOT NULL AND mailed = 0 AND listed = 0';
  const [rows, all] = await db.batch([
    db.prepare(`SELECT id, at, sender, body, held, net, token FROM messages WHERE ${waiting} ORDER BY at LIMIT ?`).bind(LIST),
    db.prepare(`SELECT COUNT(*) AS n, MAX(id) AS last FROM messages WHERE ${waiting}`),
  ]);
  const list = rows.results, { n, last } = all.results[0];
  if (!n) return;
  const links = (m) => [['Loloskan ke inbox', actLink(SITE, m, 'release')],
    m.net && m.held !== 'blocked' ? [`Blokir ${HOLD.block / DAY} hari`, actLink(SITE, m, 'block')] : null].filter(Boolean);
  const head = `${n} pesan ditahan sejak ringkasan sebelumnya. Pengirimnya melihat "Pesan terkirim", tapi pesannya belum masuk inbox.`;
  const more = n > list.length ? `Ada ${n - list.length} pesan lain yang tidak dimuat di sini. Lihat DEPLOY.md, bagian "Pesan yang ditahan".` : '';
  const text = [head, ...list.map((m, i) => [
    `${i + 1}. ${when(m.at)} · ${m.sender}`,
    `   Ditahan: ${REASON[m.held]}`,
    `   ${cut(m.body.replace(/\s+/g, ' '), 300)}`,
    ...links(m).map(([label, href]) => `   ${label}: ${href}`),
  ].join('\n')), more].filter(Boolean).join('\n\n');
  const html = `<div style="max-width:600px;font:16px/1.5 system-ui,-apple-system,'Segoe UI',sans-serif;color:#1d2230">
<p style="margin:0 0 16px">${attr(head)}</p>
${list.map((m) => `<div style="margin:0 0 12px;padding:12px 16px;border:1px solid #d9dde5;border-radius:8px">
<p style="margin:0 0 4px;font-size:14px;color:#545b6e">${attr(when(m.at))} · ${attr(m.sender)} · ditahan: ${attr(REASON[m.held])}</p>
<p style="margin:0 0 8px;white-space:pre-wrap;overflow-wrap:anywhere">${attr(cut(m.body, 300))}</p>
<p style="margin:0">${links(m).map(([label, href]) => `<a href="${attr(href)}" style="color:#245edb;font-weight:600">${attr(label)}</a>`).join(' &nbsp;·&nbsp; ')}</p>
</div>`).join('\n')}
${more ? `<p style="margin:16px 0 0">${attr(more)}</p>` : ''}
</div>`;
  if (await resend(env, { subject: `[iqbalsurya.com] ${n} pesan ditahan`, text, html })) {
    await db.prepare(`UPDATE messages SET listed = 1 WHERE ${waiting} AND id <= ?`).bind(last).run();
  }
}

/* ---- what visitors do ---- */
// A count per day, event and detail (DEPLOY.md, "Apa yang dilakukan pengunjung"). Nothing about the visitor is
// kept; only the listed events and details are counted, so the table can't be filled with anything else.
const EVENTS = {
  case: /^[a-z0-9-]{1,40}$/, window: /^(about|work|contact|resume|game|recycle|gamegate|screensaver)$/, cv: /^(open|save|request)$/,
  send: /^(api|mailto)$/, copy: /^email$/, start: /^$/, social: /^(linkedin|dribbble|behance|upwork)$/,
  // the games: where each was opened from (ss: Screen Saver XP, br: Boss Rush XP), the nudges toward them that
  // showed, and how far a Screen Saver XP run got
  door: /^(ss:(display|idle|gate|link|menu)|br:(bin|balloon|konami|pet|link|menu))$/, hint: /^(bin|idle|offer)$/,
  run: /^ss:(start|boss[2-4]|final|win|practice|practice-done)$/,
  // the loading screen (boot.js): a part that failed to load, and one it went on without, once a session each
  boot: /^(fail|skip):(fonts|content|cases|icons|app|wall|home|wall3d)$/,
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
