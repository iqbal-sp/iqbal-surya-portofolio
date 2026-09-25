-- Home's New Message (worker/index.js, message()): every message sent from the page, also when Resend refuses it
CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  at INTEGER NOT NULL,           -- when it arrived (ms since 1970)
  sender TEXT NOT NULL,          -- the address the visitor typed in From, to reply to
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  lang TEXT NOT NULL,            -- en or id, the page's language
  mailed INTEGER NOT NULL DEFAULT 0  -- 1 once Resend took it
);

-- what visitors do (worker/index.js, count()): one count per day, event and detail, nothing about the visitor
CREATE TABLE events (
  day TEXT NOT NULL,             -- YYYY-MM-DD (UTC)
  name TEXT NOT NULL,            -- case, window, cv, send, copy, start, social
  detail TEXT NOT NULL,          -- the case's slug, the window, open | save | request … ('' when none)
  n INTEGER NOT NULL,
  PRIMARY KEY (day, name, detail)
);
