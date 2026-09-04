-- ============================================================
-- Nukko — per-level progress windows
--
-- TARGET: this game's GAMEPLAY Supabase project (SUPABASE_URL).
--
-- Before this migration a level inherited everything banked on the
-- level below it: counters were measured from the start of the week, so
-- the purchase that cleared level 1 also counted toward level 2 and the
-- ladder read as one long week rather than 12 separate pieces of work.
--
-- After it, progress is measured from the LATEST of the week start and
-- the moment the player arrived on their current level. The week start
-- stays in that maximum on purpose — counters must still reset every
-- Monday even for a player who never changes level, which is what keeps
-- the weekly demotion rule meaningful.
-- ============================================================

-- Stamped on every arrival at a level: an advance AND a demotion.
-- Existing rows default to NOW(), which puts every current player at the
-- start of their current card — the same fresh start a new arrival gets,
-- and the reason nobody is instantly paid for progress banked under the
-- old cumulative rule.
ALTER TABLE player_ladder
  ADD COLUMN IF NOT EXISTS level_started_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ─── Counters over an explicit window ────────────────────────
-- The 2-arg form could only ever measure a whole week, because it
-- derived its upper bound from its lower one. A per-level window opens
-- mid-week and must still close at the week's end, so the bounds are now
-- passed independently.
CREATE OR REPLACE FUNCTION ladder_counters(
  p_wallet TEXT,
  p_since  TIMESTAMPTZ,
  p_until  TIMESTAMPTZ
)
RETURNS TABLE (runs INTEGER, points BIGINT, active_days INTEGER, shop_items INTEGER)
LANGUAGE sql STABLE AS $$
  SELECT
    (SELECT COUNT(*)::INTEGER
       FROM chain_events e
      WHERE e.wallet_address = p_wallet
        AND e.event_type = 'score_submitted'
        AND e.block_time >= p_since
        AND e.block_time <  p_until),
    (SELECT COALESCE(SUM(e.score), 0)::BIGINT
       FROM chain_events e
      WHERE e.wallet_address = p_wallet
        AND e.event_type = 'score_submitted'
        AND e.block_time >= p_since
        AND e.block_time <  p_until),
    (SELECT COUNT(DISTINCT (e.block_time AT TIME ZONE 'UTC')::DATE)::INTEGER
       FROM chain_events e
      WHERE e.wallet_address = p_wallet
        AND e.event_type = 'score_submitted'
        AND e.block_time >= p_since
        AND e.block_time <  p_until),
    (SELECT COUNT(*)::INTEGER
       FROM purchases p
      WHERE p.wallet_address = p_wallet
        AND p.verified_at IS NOT NULL
        AND p.created_at >= p_since
        AND p.created_at <  p_until);
$$;

-- The 2-arg form is kept so a server still running the previous deploy
-- keeps working through the rollout. It now delegates.
CREATE OR REPLACE FUNCTION ladder_counters(p_wallet TEXT, p_week_start TIMESTAMPTZ)
RETURNS TABLE (runs INTEGER, points BIGINT, active_days INTEGER, shop_items INTEGER)
LANGUAGE sql STABLE AS $$
  SELECT * FROM ladder_counters(p_wallet, p_week_start, p_week_start + INTERVAL '7 days');
$$;

-- ─── Fundable pool levels ────────────────────────────────────
-- The pool was pinned to the three public cash milestones. Exercising a
-- payout end to end then meant grinding to level 4, so a whitelisted address
-- can be paid at a test level instead (server/ladder/levels.js). The server
-- still decides which levels are fundable — this only stops the constraint
-- from rejecting a level the server has armed.
ALTER TABLE cash_link_pool DROP CONSTRAINT IF EXISTS cash_link_pool_level_check;
ALTER TABLE cash_link_pool ADD  CONSTRAINT cash_link_pool_level_check
  CHECK (level BETWEEN 1 AND 12);
