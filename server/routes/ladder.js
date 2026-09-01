import { Router } from 'express';
import { LEVELS, OBJECTIVES, MAX_LEVEL } from '../ladder/levels.js';
import { syncLadder } from '../ladder/service.js';

export function ladderRoutes(supabase) {
  const r = Router();

  // Static curve — the UI renders the 12-rung map from this so the
  // thresholds can never drift between client and server.
  r.get('/api/ladder/levels', (_req, res) => {
    res.json({ maxLevel: MAX_LEVEL, objectives: OBJECTIVES, levels: LEVELS });
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
