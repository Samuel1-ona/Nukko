import { useState, useEffect, useCallback } from 'react';
import { getLadderStandings } from '../supabase/db.js';

/**
 * Public ladder standings — who is furthest up, and how crowded each rung is.
 * Owned here rather than inside the component so the same data can feed both
 * the standings board and the compact strip above the rung map.
 */
export function useLadderStandings(limit = 25) {
  const [data,    setData]    = useState({ standings: [], distribution: {}, players: 0 });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setData(await getLadderStandings(limit));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => { refresh(); }, [refresh]);

  return { ...data, loading, error, refresh };
}
