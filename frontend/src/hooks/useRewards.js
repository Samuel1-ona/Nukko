import { useState, useEffect, useCallback, useRef } from 'react';
import { listRewards, revealReward, confirmClaim } from '../rewards/api.js';
import { rewardsConfigured } from '../rewards/client.js';

// A claim is deliberately two steps, so the pending state has to survive
// the app being backgrounded while MiniPay opens the cash link.
const PENDING_KEY = 'nk_pending_claim';

function readPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writePending(value) {
  try {
    if (value) localStorage.setItem(PENDING_KEY, JSON.stringify(value));
    else       localStorage.removeItem(PENDING_KEY);
  } catch { /* private mode — the claim still works, it just won't survive a reload */ }
}

export function useRewards(address) {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [pending, setPending] = useState(() => readPending());

  const addressRef = useRef(address);
  useEffect(() => { addressRef.current = address; }, [address]);

  const refresh = useCallback(async () => {
    if (!address || !rewardsConfigured) return;
    setLoading(true);
    try {
      setRewards(await listRewards(address));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => { refresh(); }, [refresh]);

  // Coming back from MiniPay: re-surface the confirmation prompt. Both
  // events are needed — iOS webviews fire pageshow, not always visibilitychange.
  useEffect(() => {
    const recheck = () => {
      if (document.visibilityState === 'visible') {
        const p = readPending();
        if (p) setPending(p);
        refresh();
      }
    };
    document.addEventListener('visibilitychange', recheck);
    window.addEventListener('pageshow', recheck);
    return () => {
      document.removeEventListener('visibilitychange', recheck);
      window.removeEventListener('pageshow', recheck);
    };
  }, [refresh]);

  /** Step 1 — reveal the link and open it. Nothing is marked claimed yet. */
  const claim = useCallback(async (reward) => {
    if (!addressRef.current) throw new Error('Wallet not connected');

    // Opened synchronously so the webview does not treat it as a popup;
    // the URL is filled in once the reveal returns.
    const tab = window.open('', '_blank');

    try {
      const { url } = await revealReward(reward.id, addressRef.current);

      // Persisted BEFORE navigating away, so a backgrounded app still knows
      // there is a claim awaiting confirmation.
      const record = { id: reward.id, label: reward.label, amount: reward.amount, token: reward.token, at: Date.now() };
      writePending(record);
      setPending(record);

      if (tab) tab.location.href = url;
      else     window.location.href = url;
    } catch (err) {
      tab?.close?.();
      throw err;
    }
  }, []);

  /** Step 2 — the player confirms they received it. */
  const confirm = useCallback(async () => {
    const p = readPending();
    if (!p || !addressRef.current) return;
    await confirmClaim(p.id, addressRef.current);
    writePending(null);
    setPending(null);
    refresh();
  }, [refresh]);

  /** "Not yet" — leave it unclaimed so it can be reopened later. */
  const dismissPending = useCallback(() => {
    writePending(null);
    setPending(null);
    refresh();
  }, [refresh]);

  const unclaimedCount = rewards.filter(r => !r.claimed_at).length;

  return { rewards, unclaimedCount, loading, error, refresh, claim, confirm, pending, dismissPending, configured: rewardsConfigured };
}
