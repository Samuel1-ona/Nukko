import { useState, useEffect, useCallback, useRef } from 'react';
import { api } from '../supabase/client.js';

/**
 * Ladder state. There is no "report my progress" call by design — the
 * server derives every counter from on-chain events and receipt-verified
 * purchases, so this hook only ever reads or asks for a sync.
 */
export function useLadder(address) {
  const [state,   setState]   = useState(null);
  const [levels,  setLevels]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  // Levels cleared by the most recent sync — drives the celebration.
  const [celebrate, setCelebrate] = useState(null);

  const knownGrants  = useRef(new Set());
  const initialised  = useRef(false);

  useEffect(() => {
    let cancelled = false;
    api('/api/ladder/levels')
      .then(d => { if (!cancelled) setLevels(d); })
      .catch(() => { /* the map view degrades to the state payload's own copy */ });
    return () => { cancelled = true; };
  }, []);

  // Authoritative pass: rolls the week over, climbs, pays out. Idempotent,
  // so it is safe on every home-screen mount and after every run.
  const sync = useCallback(async ({ silent = false, fresh = false } = {}) => {
    if (!address) return null;
    if (!silent) setLoading(true);
    try {
      const view = await api(`/api/ladder/${address}/sync${fresh ? '?fresh=1' : ''}`, { method: 'POST' });

      // Only celebrate levels that were actually *paid* this pass. A grant
      // row is the proof of payment: a rung re-cleared after a demotion
      // creates no grant, pays nothing, and must not imply otherwise.
      const newlyPaid = (view.grants ?? [])
        .map(g => g.level)
        .filter(l => !knownGrants.current.has(l));

      (view.grants ?? []).forEach(g => knownGrants.current.add(g.level));

      // The first sync of a session is a baseline, never a celebration —
      // otherwise every level ever earned would fire on app open.
      if (initialised.current && newlyPaid.length) {
        setCelebrate(newlyPaid.map(l => view.levels.find(x => x.level === l)).filter(Boolean));
      }
      initialised.current = true;

      setState(view);
      setError(null);
      return view;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Read-only variant for display surfaces.
  const refresh = useCallback(async () => {
    if (!address) return;
    setLoading(true);
    try {
      const view = await api(`/api/ladder/${address}`);
      (view.grants ?? []).forEach(g => knownGrants.current.add(g.level));
      initialised.current = true;
      setState(view);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    if (!address) { setState(null); knownGrants.current = new Set(); initialised.current = false; return; }
    sync({ silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  return {
    ladder: state,
    levels: levels?.levels ?? state?.levels ?? null,
    objectiveMeta: levels?.objectives ?? null,
    loading, error,
    sync, refresh,
    celebrate,
    clearCelebration: () => setCelebrate(null),
  };
}
