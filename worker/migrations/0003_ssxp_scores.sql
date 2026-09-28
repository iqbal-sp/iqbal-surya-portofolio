-- Screen Saver XP leaderboard (worker/index.js, GAMES.ssxp): each player's best full run, kept apart from Boss Rush XP's
-- scores so that each game has its own board and a player keeps one best run in each
CREATE TABLE ssxp_scores (
  pid TEXT PRIMARY KEY,          -- random id kept in the player's browser (ssxp-pid)
  name TEXT NOT NULL,            -- 1 to 12 letters, digits, spaces, - or _
  time_ms INTEGER NOT NULL,      -- fight time over all five bosses
  hits INTEGER NOT NULL,         -- hits taken
  score_ms INTEGER NOT NULL,     -- time_ms plus 10 s per hit: the board's order, lower first
  at INTEGER NOT NULL            -- when this best was set (ms since 1970); the earlier one wins a tie
);
CREATE INDEX ssxp_scores_order ON ssxp_scores (score_ms, at);
