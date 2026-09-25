-- Boss Rush XP leaderboard (worker/index.js): each player's best winning run
CREATE TABLE scores (
  pid TEXT PRIMARY KEY,          -- random id kept in the player's browser
  name TEXT NOT NULL,            -- 1 to 12 letters, digits, spaces, - or _
  time_ms INTEGER NOT NULL,      -- fight time
  hits INTEGER NOT NULL,         -- hits taken
  score_ms INTEGER NOT NULL,     -- time_ms plus 10 s per hit: the board's order, lower first
  at INTEGER NOT NULL            -- when this best was set (ms since 1970); the earlier one wins a tie
);
CREATE INDEX scores_order ON scores (score_ms, at);

-- saves per address in the current ten-minute window; k is a hash, never the address itself
CREATE TABLE throttle (
  k TEXT PRIMARY KEY,
  n INTEGER NOT NULL,
  until INTEGER NOT NULL         -- end of the window (s since 1970)
);
