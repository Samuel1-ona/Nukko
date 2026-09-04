// Admin surface: load pre-funded cash links, watch the pool drain, and
// settle debts left behind when a milestone was cleared with an empty pool.
//
// Cash link URLs are bearer tokens: they go IN through this API and are
// never returned by it. Nothing here ever selects cash_link_url.

import { Router } from 'express';
import { LEVELS, poolLevels } from '../ladder/levels.js';
import { levelConfig } from '../ladder/rules.js';
import { requireAdmin, issueNonce, verifySignature } from './adminAuth.js';

export function adminRoutes(supabase, { settleCashGrant }) {
  const r = Router();

  // ─── Sign-in (public: these two are the way IN) ────────────
  r.get('/api/admin/nonce', (_req, res) => res.json(issueNonce()));

  r.post('/api/admin/verify', async (req, res) => {
    const result = await verifySignature(req.body ?? {});
    if (!result.ok) return res.status(401).json({ error: result.error });
    res.json(result);
  });

  // Everything below requires a verified signature session.
  r.use('/api/admin', requireAdmin);

  r.get('/api/admin/ping', (req, res) => res.json({ ok: true, address: req.adminAddress }));

  // ─── Load cash links into the pool ─────────────────────────
  // Links are created BY HAND in MiniPay and pasted here in advance. The
  // game never generates one, so it can never pay out unfunded money.
  r.post('/api/admin/cash-links', async (req, res) => {
    const { level, token = 'USDT', amount, links } = req.body ?? {};

    // Validated against what the server will actually pay out, not a fixed
    // list — the two drift the moment the test whitelist is armed or disarmed.
    const fundable = poolLevels();
    if (!fundable.includes(Number(level))) {
      return res.status(400).json({ error: `level must be one of ${fundable.join(', ')}` });
    }
    if (!Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ error: 'links must be a non-empty array of URLs' });
    }
    if (!amount || !/^\d+(\.\d{1,6})?$/.test(String(amount))) {
      return res.status(400).json({ error: 'amount must be a decimal string, e.g. "1.00"' });
    }

    const urls = [...new Set(
      links.map(l => (typeof l === 'string' ? l : l?.url)).map(u => u?.trim()).filter(Boolean),
    )];
    if (!urls.length) return res.status(400).json({ error: 'no usable links' });
    if (urls.some(u => !/^https?:\/\//i.test(u))) {
      return res.status(400).json({ error: 'every link must be an http(s) URL' });
    }

    const { data, error } = await supabase
      .from('cash_link_pool')
      .upsert(
        urls.map(u => ({ level: Number(level), cash_link_url: u, amount: String(amount), token })),
        { onConflict: 'cash_link_url', ignoreDuplicates: true },
      )
      .select('id');

    if (error) return res.status(500).json({ error: error.message });

    // Report counts only — never the URLs back.
    res.json({ ok: true, submitted: urls.length, added: data?.length ?? 0, duplicates: urls.length - (data?.length ?? 0) });
  });

  // ─── Pool status ───────────────────────────────────────────
  r.get('/api/admin/pool', async (_req, res) => {
    const { data, error } = await supabase
      .from('cash_link_pool')
      .select('level, amount, token, assigned_to');
    if (error) return res.status(500).json({ error: error.message });

    const byLevel = poolLevels().map((level) => {
      const rows = (data ?? []).filter(r => r.level === level);
      return {
        level,
        badge:     levelConfig(level).badge,
        expected:  levelConfig(level).reward.cash,
        available: rows.filter(r => !r.assigned_to).length,
        assigned:  rows.filter(r =>  r.assigned_to).length,
        total:     rows.length,
      };
    });
    // `fundable` is what the client renders its level picker from. A hardcoded
    // list on the client funds a level the server rejects the moment the
    // whitelist changes underneath it.
    res.json({ pool: byLevel, fundable: poolLevels() });
  });

  // ─── Who reached a cash milestone: owed vs paid ─────────────
  r.get('/api/admin/grants', async (_req, res) => {
    const { data, error } = await supabase
      .from('ladder_grants')
      .select('id, wallet_address, level, cash_pending, granted_at, settled_at')
      .eq('is_cash', true)
      .order('granted_at', { ascending: false });
    if (error) return res.status(500).json({ error: error.message });

    const rows = (data ?? []).map(g => ({
      id: g.id, wallet: g.wallet_address, level: g.level,
      badge: levelConfig(g.level).badge,
      expected: levelConfig(g.level).reward.cash,
      grantedAt: g.granted_at, settledAt: g.settled_at,
    }));

    res.json({
      owed: rows.filter(r => !r.settledAt),
      paid: rows.filter(r =>  r.settledAt),
    });
  });

  // Retry a debt once the pool has been refilled.
  r.post('/api/admin/grants/:id/settle', async (req, res) => {
    const { data: grant, error } = await supabase
      .from('ladder_grants')
      .select('id, wallet_address, level, cash_pending, is_cash')
      .eq('id', req.params.id).single();

    if (error || !grant)     return res.status(404).json({ error: 'grant not found' });
    if (!grant.is_cash)      return res.status(400).json({ error: 'not a cash grant' });
    if (!grant.cash_pending) return res.json({ ok: true, alreadySettled: true });

    const result = await settleCashGrant(supabase, grant.wallet_address, grant.level, grant.id);
    res.json({ ok: result.paid, ...result });
  });

  // ─── Ladder population, for sanity-checking the curve ──────
  r.get('/api/admin/summary', async (_req, res) => {
    const { data, error } = await supabase
      .from('player_ladder')
      .select('level, highest_level');
    if (error) return res.status(500).json({ error: error.message });

    const byLevel = LEVELS.map(l => ({
      level: l.level,
      badge: l.badge,
      players:   (data ?? []).filter(p => p.level === l.level).length,
      everReached: (data ?? []).filter(p => p.highest_level >= l.level).length,
    }));
    res.json({ totalPlayers: data?.length ?? 0, byLevel });
  });

  return r;
}
