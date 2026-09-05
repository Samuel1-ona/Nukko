import { Router } from 'express';
import { LEVELS, OBJECTIVES, MAX_LEVEL, levelConfig } from '../ladder/levels.js';
import { syncLadder } from '../ladder/service.js';

export function ladderRoutes(supabase) {
  const r = Router();

  // Static curve — the UI renders the 12-rung map from this so the
  // thresholds can never drift between client and server.
  r.get('/api/ladder/levels', (_req, res) => {
    res.json({ maxLevel: MAX_LEVEL, objectives: OBJECTIVES, levels: LEVELS });
  });

  // Public standings: who is furthest up, and how crowded each rung is.
  //
  // MUST be registered before '/api/ladder/:wallet' below — Express matches in
  // order, so the parameterised route would otherwise swallow "leaderboard"
  // and try to sync a wallet by that name.
  r.get('/api/ladder/leaderboard', async (req, res) => {
    const limit = Math.min(Math.max(parseInt(req.query.limit) || 25, 1), 100);

    try {
      const [list, dist] = await Promise.all([
        supabase
          .from('player_ladder')
          // Named columns, never select('*'): this is a public endpoint and
          // the table carries per-player ladder state that is nobody's
          // business. Level and name are already public on the score board.
          .select('wallet_address, level, highest_level, players(username)')
          .order('level',            { ascending: false })
          .order('highest_level',    { ascending: false })
          // The third key is what stops the order shuffling between requests
          // for everyone tied on a rung, which looks broken to a player who
          // has not moved. Ties go to whoever got there first.
          .order('level_started_at', { ascending: true })
          .limit(limit),
        supabase.rpc('ladder_distribution'),
      ]);

      if (list.error) throw new Error(list.error.message);
      if (dist.error) throw new Error(dist.error.message);

      const distribution = {};
      let players = 0;
      for (const row of dist.data ?? []) {
        distribution[row.level] = row.players;
        players += row.players;
      }

      res.json({
        standings: (list.data ?? []).map((row, i) => ({
          rank:         i + 1,
          address:      row.wallet_address,
          username:     row.players?.username ?? null,
          level:        row.level,
          highestLevel: row.highest_level,
          badge:        levelConfig(row.level).badge,
        })),
        distribution,
        players,
      });
    } catch (err) {
      console.error('[ladder] standings failed:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // Read-only display variant: applies the rollover in memory so the UI
  // never shows a stale level, but writes nothing and pays nothing.
  r.get('/api/ladder/:wallet', async (req, res) => {
    try {
      const view = await syncLadder(supabase, req.params.wallet, { write: false });
      res.json(view);
    } catch (err) {
      console.error('[ladder] read failed:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  // The one authoritative endpoint. Idempotent: safe to call on every
  // home-screen mount and after every run.
  r.post('/api/ladder/:wallet/sync', async (req, res) => {
    try {
      const view = await syncLadder(supabase, req.params.wallet, {
        write: true,
        fresh: req.query.fresh === '1',
      });
      res.json(view);
    } catch (err) {
      console.error('[ladder] sync failed:', err.message);
      res.status(500).json({ error: err.message });
    }
  });

  return r;
}
