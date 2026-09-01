-- ============================================================
-- Nukko — 12-level weekly progression ladder
--
-- TARGET: this game's GAMEPLAY Supabase project (SUPABASE_URL).
-- The shared rewards project has its own migration under
-- supabase/rewards-migrations/.
--
-- Design notes:
--  * Counters are never written by anyone — they are DERIVED on
--    read by ladder_counters() from chain_events (on-chain, signed)
--    and receipt-verified purchases. There is no "report progress"
--    write path, so the ladder cannot be farmed by a crafted request.
--  * These tables carry money-bearing data (cash link URLs), so RLS
--    is ON with NO policies: anon/authenticated get nothing, and only
--    the server's service-role key (which bypasses RLS) can touch them.
-- ============================================================

-- ─── On-chain event ledger (source of truth for 3 of 4 counters) ───
-- Populated only by the server-side indexer reading GameStarted /
-- ScoreSubmitted logs from the Nukko contract.
CREATE TABLE IF NOT EXISTS chain_events (
  id             BIGSERIAL PRIMARY KEY,
  event_type     TEXT NOT NULL CHECK (event_type IN ('game_started', 'score_submitted')),
  wallet_address TEXT NOT NULL,
  score          BIGINT,
  block_number   BIGINT NOT NULL,
  log_index      INTEGER NOT NULL,
  tx_hash        TEXT NOT NULL,
  block_time     TIMESTAMPTZ NOT NULL,
  UNIQUE (tx_hash, log_index)
);

CREATE INDEX IF NOT EXISTS idx_chain_events_wallet_time
  ON chain_events (wallet_address, event_type, block_time DESC);

-- Indexer high-water mark (single row).
CREATE TABLE IF NOT EXISTS indexer_state (
  id          INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_block  BIGINT NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Purchase verification ───────────────────────────────────
-- A purchase only counts toward the ladder once its receipt has been
-- checked on-chain: real transfer, to the treasury, from this player,
-- in a supported stablecoin, at or above the cheapest package price.
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS verified_at     TIMESTAMPTZ;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS verified_amount TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS verified_token  TEXT;
ALTER TABLE purchases ADD COLUMN IF NOT EXISTS verify_failed   TEXT;

CREATE INDEX IF NOT EXISTS idx_purchases_verified
  ON purchases (wallet_address, verified_at)
  WHERE verified_at IS NOT NULL;

-- ─── Ladder position ─────────────────────────────────────────
-- highest_level is a ratchet: demotion never lowers it, because the
-- badge a player earned stays theirs.
CREATE TABLE IF NOT EXISTS player_ladder (
  wallet_address          TEXT PRIMARY KEY REFERENCES players(wallet_address),
  level                   INTEGER NOT NULL DEFAULT 1 CHECK (level BETWEEN 1 AND 12),
  highest_level           INTEGER NOT NULL DEFAULT 1 CHECK (highest_level BETWEEN 1 AND 12),
  week_start              DATE NOT NULL,
  levels_gained_this_week INTEGER NOT NULL DEFAULT 0,
  held_rank_this_week     BOOLEAN NOT NULL DEFAULT FALSE,
  last_demotion           INTEGER NOT NULL DEFAULT 0,
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Grants — one row per (player, level), first clear only ───
-- The UNIQUE index is what makes double payouts impossible under
-- concurrency. Application logic is not trusted for this.
CREATE TABLE IF NOT EXISTS ladder_grants (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL REFERENCES players(wallet_address),
  level          INTEGER NOT NULL CHECK (level BETWEEN 1 AND 12),
  bombs          INTEGER NOT NULL DEFAULT 0,
  expands        INTEGER NOT NULL DEFAULT 0,
  is_cash        BOOLEAN NOT NULL DEFAULT FALSE,
  -- Cash grants are written PENDING first and only cleared once the
  -- payout row exists. A crash therefore leaves an admin-settleable
  -- row rather than silently vanishing the player's entitlement.
  cash_pending   BOOLEAN NOT NULL DEFAULT FALSE,
  cash_link_id   UUID,
  reward_row_id  UUID,   -- id in the SHARED rewards project (no FK: different database)
  granted_at     TIMESTAMPTZ DEFAULT NOW(),
  settled_at     TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS ladder_grants_player_level
  ON ladder_grants (wallet_address, level);

CREATE INDEX IF NOT EXISTS idx_grants_owed
  ON ladder_grants (level, granted_at)
  WHERE is_cash AND cash_pending;

-- ─── Pre-funded cash link pool ───────────────────────────────
-- Links are created BY HAND in MiniPay and loaded here in advance, so
-- a bug can never pay out money that was not already funded.
CREATE TABLE IF NOT EXISTS cash_link_pool (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level         INTEGER NOT NULL CHECK (level IN (4, 8, 12)),
  cash_link_url TEXT NOT NULL UNIQUE,
  amount        TEXT NOT NULL,
  token         TEXT NOT NULL DEFAULT 'USDT',
  assigned_to   TEXT,
  assigned_at   TIMESTAMPTZ,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pool_available
  ON cash_link_pool (level, created_at)
  WHERE assigned_to IS NULL;

-- ─── Counters: all four in one round trip ────────────────────
-- Every counter reads an event the player cannot fabricate:
--   runs / points / active_days → on-chain ScoreSubmitted
--   shop_items                  → receipt-verified purchases
CREATE OR REPLACE FUNCTION ladder_counters(p_wallet TEXT, p_week_start TIMESTAMPTZ)
RETURNS TABLE (runs INTEGER, points BIGINT, active_days INTEGER, shop_items INTEGER)
LANGUAGE sql STABLE AS $$
  SELECT
    (SELECT COUNT(*)::INTEGER
       FROM chain_events e
      WHERE e.wallet_address = p_wallet
        AND e.event_type = 'score_submitted'
        AND e.block_time >= p_week_start
        AND e.block_time <  p_week_start + INTERVAL '7 days'),
    (SELECT COALESCE(SUM(e.score), 0)::BIGINT
       FROM chain_events e
      WHERE e.wallet_address = p_wallet
        AND e.event_type = 'score_submitted'
        AND e.block_time >= p_week_start
        AND e.block_time <  p_week_start + INTERVAL '7 days'),
    (SELECT COUNT(DISTINCT (e.block_time AT TIME ZONE 'UTC')::DATE)::INTEGER
       FROM chain_events e
      WHERE e.wallet_address = p_wallet
        AND e.event_type = 'score_submitted'
        AND e.block_time >= p_week_start
        AND e.block_time <  p_week_start + INTERVAL '7 days'),
    (SELECT COUNT(*)::INTEGER
       FROM purchases p
      WHERE p.wallet_address = p_wallet
        AND p.verified_at IS NOT NULL
        AND p.created_at >= p_week_start
        AND p.created_at <  p_week_start + INTERVAL '7 days');
$$;

-- ─── Atomic cash link draw ───────────────────────────────────
-- SKIP LOCKED is essential: two players clearing the same milestone in
-- the same instant must take DIFFERENT links, never block or collide.
CREATE OR REPLACE FUNCTION draw_cash_link(p_level INTEGER, p_wallet TEXT)
RETURNS TABLE (id UUID, cash_link_url TEXT, amount TEXT, token TEXT)
LANGUAGE plpgsql AS $$
DECLARE
  v_id UUID;
BEGIN
  SELECT cl.id INTO v_id
    FROM cash_link_pool cl
   WHERE cl.level = p_level
     AND cl.assigned_to IS NULL
   ORDER BY cl.created_at
   LIMIT 1
     FOR UPDATE SKIP LOCKED;

  IF v_id IS NULL THEN
    RETURN;  -- pool empty: caller records the debt as cash_pending
  END IF;

  UPDATE cash_link_pool
     SET assigned_to = p_wallet, assigned_at = NOW()
   WHERE cash_link_pool.id = v_id;

  RETURN QUERY
    SELECT cl.id, cl.cash_link_url, cl.amount, cl.token
      FROM cash_link_pool cl
     WHERE cl.id = v_id;
END;
$$;

-- Release a drawn link back to the pool when the payout write fails —
-- otherwise it is marked assigned and can never be spent.
CREATE OR REPLACE FUNCTION release_cash_link(p_id UUID)
RETURNS VOID
LANGUAGE sql AS $$
  UPDATE cash_link_pool
     SET assigned_to = NULL, assigned_at = NULL
   WHERE id = p_id;
$$;

-- ─── Row Level Security ──────────────────────────────────────
-- Enabled with NO policies on purpose. The browser must never read the
-- pool (cash links are bearer tokens) nor write ladder state.
ALTER TABLE chain_events    ENABLE ROW LEVEL SECURITY;
ALTER TABLE indexer_state   ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_ladder   ENABLE ROW LEVEL SECURITY;
ALTER TABLE ladder_grants   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_link_pool  ENABLE ROW LEVEL SECURITY;

-- ─── Atomic inventory credit for level rewards ───────────────
-- Level rewards land in the paid_* buckets so they are never wiped by
-- the free-allowance logic.
CREATE OR REPLACE FUNCTION credit_inventory(p_wallet TEXT, p_bombs INTEGER, p_expands INTEGER)
RETURNS VOID
LANGUAGE sql AS $$
  INSERT INTO player_inventory (wallet_address, paid_bombs, paid_expands)
       VALUES (p_wallet, p_bombs, p_expands)
  ON CONFLICT (wallet_address) DO UPDATE
          SET paid_bombs   = player_inventory.paid_bombs   + p_bombs,
              paid_expands = player_inventory.paid_expands + p_expands,
              updated_at   = NOW();
$$;
