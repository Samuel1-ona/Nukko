import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

import { ladderRoutes } from './routes/ladder.js';
import { adminRoutes } from './routes/admin.js';
import { settleCashGrant } from './ladder/service.js';
import { startIndexer } from './chain/indexer.js';

const app = express();
app.use(cors());
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// ─── Ladder ──────────────────────────────────────────────────
// Mounted below the existing gameplay routes. The ladder never trusts a
// client-reported counter: it derives them from on-chain events and
// receipt-verified purchases (see server/chain/).
app.use(ladderRoutes(supabase));
app.use(adminRoutes(supabase, { settleCashGrant }));

// ─── Players ─────────────────────────────────────────────────

app.post('/api/players', async (req, res) => {
  const addr = req.body.wallet?.toLowerCase();
  if (!addr) return res.status(400).json({ error: 'wallet is required' });

  const { data: existing } = await supabase
    .from('players')
    .select('*')
    .eq('wallet_address', addr)
    .single();

  if (existing) {
    await supabase
      .from('players')
      .update({ last_seen: new Date().toISOString() })
      .eq('wallet_address', addr);
    return res.json(existing);
  }

  const { data, error } = await supabase
    .from('players')
    .insert({ wallet_address: addr })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.patch('/api/players/:wallet/username', async (req, res) => {
  const addr = req.params.wallet.toLowerCase();
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'username is required' });

  const { error } = await supabase
    .from('players')
    .update({ username })
    .eq('wallet_address', addr);

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── Inventory ───────────────────────────────────────────────

const DEFAULT_INV = {
  free_bombs_left: 3,
  free_expands_left: 3,
  paid_bombs: 0,
  paid_expands: 0,
};

app.get('/api/inventory/:wallet', async (req, res) => {
  const addr = req.params.wallet.toLowerCase();

  const { data } = await supabase
    .from('player_inventory')
    .select('*')
    .eq('wallet_address', addr)
    .single();

  if (data) return res.json(data);

  // Ensure player row exists before creating inventory (foreign key)
  const { data: player } = await supabase
    .from('players')
    .select('wallet_address')
    .eq('wallet_address', addr)
    .single();

  if (!player) {
    await supabase.from('players').insert({ wallet_address: addr });
  }

  const { data: created, error } = await supabase
    .from('player_inventory')
    .insert({ wallet_address: addr, ...DEFAULT_INV })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.json(created);
});

// Reports CONSUMPTION only. This used to take absolute values and write them
// straight to the row, unauthenticated — one request minted unlimited
// power-ups. Granting is now exclusively credit_inventory(), called by the
// server after an on-chain payment or a ladder milestone.
//
// consume_inventory() clamps every field to LEAST(stored, requested) inside
// the UPDATE, so a larger number is silently ignored rather than rejected:
// a client that has drifted high cannot raise its balance, and one that has
// drifted low still settles at the lower figure, which is the safe direction.
// The authoritative row comes back so the client can reconcile against it.
app.patch('/api/inventory/:wallet', async (req, res) => {
  const addr = req.params.wallet.toLowerCase();

  // Anything that is not a non-negative integer is treated as "not supplied"
  // rather than trusted — a NULL leaves that column untouched.
  const count = (v) =>
    Number.isInteger(v) && v >= 0 ? v : null;

  const { data, error } = await supabase.rpc('consume_inventory', {
    p_wallet:       addr,
    p_free_bombs:   count(req.body.free_bombs_left),
    p_free_expands: count(req.body.free_expands_left),
    p_paid_bombs:   count(req.body.paid_bombs),
    p_paid_expands: count(req.body.paid_expands),
  });

  if (error) return res.status(500).json({ error: error.message });

  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return res.status(404).json({ error: 'no inventory for that wallet' });
  res.json(row);
});

// ─── Purchases ───────────────────────────────────────────────

app.post('/api/purchases', async (req, res) => {
  const { wallet, txHash, itemType, packageIndex, token, amount } = req.body;
  if (!wallet || !txHash) return res.status(400).json({ error: 'wallet and txHash are required' });

  const addr = wallet.toLowerCase();
  const { data: player } = await supabase.from('players').select('wallet_address').eq('wallet_address', addr).single();
  if (!player) await supabase.from('players').insert({ wallet_address: addr });

  // Upsert keyed on tx_hash so client retries can never duplicate a purchase
  const { error } = await supabase
    .from('purchases')
    .upsert({
      wallet_address: addr,
      tx_hash: txHash,
      item_type: itemType,
      package_index: packageIndex,
      token,
      amount,
    }, { onConflict: 'tx_hash', ignoreDuplicates: true });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.get('/api/purchases/:wallet', async (req, res) => {
  const addr = req.params.wallet.toLowerCase();
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);

  const { data, error } = await supabase
    .from('purchases')
    .select('*')
    .eq('wallet_address', addr)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

// ─── Game Sessions ───────────────────────────────────────────

app.post('/api/sessions', async (req, res) => {
  const { wallet, score, durationSeconds, merges, powerUpsUsed } = req.body;
  if (!wallet) return res.status(400).json({ error: 'wallet is required' });

  const addr = wallet.toLowerCase();
  const { data: player } = await supabase.from('players').select('wallet_address').eq('wallet_address', addr).single();
  if (!player) await supabase.from('players').insert({ wallet_address: addr });

  const { error } = await supabase
    .from('game_sessions')
    .insert({
      wallet_address: addr,
      score: score ?? 0,
      duration_seconds: durationSeconds,
      merges: merges ?? 0,
      power_ups_used: powerUpsUsed ?? {},
    });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

app.get('/api/sessions/:wallet', async (req, res) => {
  const addr = req.params.wallet.toLowerCase();
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);

  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('wallet_address', addr)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

// ─── Leaderboard ─────────────────────────────────────────────

app.get('/api/leaderboard', async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);

  const { data, error } = await supabase
    .from('leaderboard_cache')
    .select('*')
    .order('score', { ascending: false })
    .limit(limit);

  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

app.post('/api/leaderboard', async (req, res) => {
  const { wallet, username, score } = req.body;
  if (!wallet || score === undefined) return res.status(400).json({ error: 'wallet and score are required' });

  const { error } = await supabase
    .from('leaderboard_cache')
    .insert({
      wallet_address: wallet.toLowerCase(),
      username: username ?? null,
      score,
    });

  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// ─── Health ──────────────────────────────────────────────────

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Start ───────────────────────────────────────────────────

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Nukko server running on :${PORT}`);
  // Keeps chain_events current so ladder counters are never stale. Each
  // sync is incremental and skips if one is already in flight.
  startIndexer(supabase);
});
