-- ============================================================
-- Nukko — inventory can only ever go DOWN from the client
--
-- TARGET: this game's GAMEPLAY Supabase project (SUPABASE_URL).
--
-- PATCH /api/inventory/:wallet took absolute values, unauthenticated, and
-- wrote them straight to the row. One request granted unlimited power-ups —
-- or drained another player's. The shop is the only revenue this game has,
-- and the ladder now requires 150 purchases for a full climb, so that hole
-- undercuts both the cash reward budget and the ladder's spend objective.
--
-- Phase 0 of the fix: the client may only ever REPORT CONSUMPTION. Granting
-- is the exclusive job of credit_inventory(), which only the server calls,
-- after an on-chain payment or a ladder milestone.
--
-- Consumption is still unauthenticated, so a caller who knows an address can
-- still destroy that player's items. Nobody gains anything by doing so, and
-- closing it needs player authentication — a separate phase. This closes the
-- part that costs money.
-- ============================================================

-- LEAST() against the stored value is what makes an increase impossible, and
-- doing it inside the UPDATE makes it atomic: two consumptions racing cannot
-- both read the same balance and each write it back. GREATEST(0, ...) floors
-- it, so a negative body cannot drive a balance below zero either.
--
-- A NULL argument leaves that column alone, so a partial update stays partial.
-- So does a NEGATIVE one: `NULL >= 0` and `-1 >= 0` both fail the CASE, which
-- means neither can be used to zero a balance. The route filters negatives too
-- — this holds the line for any other caller, now or later.
CREATE OR REPLACE FUNCTION consume_inventory(
  p_wallet       TEXT,
  p_free_bombs   INTEGER DEFAULT NULL,
  p_free_expands INTEGER DEFAULT NULL,
  p_paid_bombs   INTEGER DEFAULT NULL,
  p_paid_expands INTEGER DEFAULT NULL
)
RETURNS SETOF player_inventory
LANGUAGE sql AS $$
  UPDATE player_inventory SET
    free_bombs_left   = GREATEST(0, CASE WHEN p_free_bombs   >= 0 THEN LEAST(free_bombs_left,   p_free_bombs)   ELSE free_bombs_left   END),
    free_expands_left = GREATEST(0, CASE WHEN p_free_expands >= 0 THEN LEAST(free_expands_left, p_free_expands) ELSE free_expands_left END),
    paid_bombs        = GREATEST(0, CASE WHEN p_paid_bombs   >= 0 THEN LEAST(paid_bombs,        p_paid_bombs)   ELSE paid_bombs        END),
    paid_expands      = GREATEST(0, CASE WHEN p_paid_expands >= 0 THEN LEAST(paid_expands,      p_paid_expands) ELSE paid_expands      END),
    updated_at        = NOW()
  WHERE wallet_address = p_wallet
  RETURNING *;
$$;

-- ─── Close the direct-write policies ─────────────────────────
-- These allowed any holder of the gameplay anon key to write inventory
-- directly, bypassing the server entirely. That key is not in the client
-- bundle today, which is the only reason this was not a second open door —
-- it would become one the moment a browser-side client was added.
--
-- Reads stay open: the leaderboard and profile surfaces rely on them, and an
-- inventory count is not a secret. Writes now belong to the service role, so
-- credit_inventory() and consume_inventory() are the only ways in.
DROP POLICY IF EXISTS "Anyone can update inventory" ON player_inventory;
DROP POLICY IF EXISTS "Anyone can create inventory" ON player_inventory;
