-- Home's New Message kept out of the inbox (worker/index.js, message(), holdFor(), act(), digest()): a held message
-- is saved like any other but not mailed, and the next morning's digest lists it with its Release and Block links
ALTER TABLE messages ADD COLUMN held TEXT;       -- why it was held: blocked, day, hour, same, rude, links or short (NULL: straight to the inbox)
ALTER TABLE messages ADD COLUMN net TEXT;        -- a hash of the sender's network, never the address itself; emptied after 30 days
ALTER TABLE messages ADD COLUMN token TEXT;      -- random, in the Release and Block links of the owner's emails
ALTER TABLE messages ADD COLUMN listed INTEGER NOT NULL DEFAULT 0;  -- 1 once a morning digest listed it
CREATE INDEX messages_net ON messages (net, at);
CREATE INDEX messages_at ON messages (at);

-- networks whose messages are held for a while (the Block link)
CREATE TABLE blocked (
  net TEXT PRIMARY KEY,          -- the same hash as messages.net
  until INTEGER NOT NULL         -- when the block ends (ms since 1970)
);
