-- ============================================================
-- Nukko — public ladder standings
--
-- TARGET: this game's GAMEPLAY Supabase project (SUPABASE_URL).
--
-- A player could see their own rung and eleven abstractions. A rung nobody
-- appears to be standing on reads as a wall rather than as somewhere to get
-- to, so the ladder now shows who is where.
-- ============================================================

-- Counted IN THE DATABASE, never by paging the table back to the server:
-- PostgREST caps rows at 1000 by default, so a client-side count would go
-- silently wrong at exactly the moment the game got popular. There are
-- already 14k+ ladder rows.
--
-- Over CURRENT level, not highest ever reached — the question a player is
-- asking is "who is up there now", and that is what makes a rung look worth
-- a week of climbing.
CREATE OR REPLACE FUNCTION ladder_distribution()
RETURNS TABLE (level INTEGER, players INTEGER)
LANGUAGE sql STABLE AS $$
  SELECT pl.level, COUNT(*)::INTEGER
    FROM player_ladder pl
   GROUP BY pl.level
   ORDER BY pl.level;
$$;

-- The standings query orders by exactly these columns.
CREATE INDEX IF NOT EXISTS idx_player_ladder_standings
  ON player_ladder (level DESC, highest_level DESC, level_started_at ASC);
