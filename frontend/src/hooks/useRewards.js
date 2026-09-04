import { useState, useEffect, useCallback, useRef } from 'react';
import { listRewards, revealReward, confirmClaim } from '../rewards/api.js';
import { rewardsConfigured } from '../rewards/client.js';

// A claim is marked the moment the link is handed over, not when the player
// comes back and says so. The claimed flag was never what gated access to the
// money — the LINK is, and it is saved locally and re-revealable from the
// inbox precisely so a claimed reward can be reopened. Recording it on return
// meant a player who dismissed the prompt, closed the app, or never came back
// kept being offered a CLAIM button for money already taken.
const PENDING_KEY = 'nk_pending_claim';

// id → cash link, so a claimed reward can always be reopened offline.
const LINKS_KEY = 'nk_claim_links';

function readLinks() {
  try { return JSON.parse(localStorage.getItem(LINKS_KEY) ?? '{}'); }
  catch { return {}; }
}

function saveLink(id, url) {
  try { localStorage.setItem(LINKS_KEY, JSON.stringify({ ...readLinks(), [id]: url })); }
  catch { /* private mode — the link is still revealable from the inbox */ }
}

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

  /**
   * The one claim path every surface uses. Order matters: the link is saved
   * locally BEFORE anything that can fail, so the player can never lose access
   * to money that has been handed to them.
   */
  const claim = useCallback(async (reward) => {
    if (!addressRef.current) throw new Error('Wallet not connected');

    // Opened synchronously so the webview does not treat it as a popup;
    // the URL is filled in once the reveal returns.
    const tab = window.open('', '_blank');

    try {
      const { url } = await revealReward(reward.id, addressRef.current);

      // 1. Local first — survives an offline claim, a crash, a closed tab.
      saveLink(reward.id, url);

      const record = { id: reward.id, label: reward.label, amount: reward.amount, token: reward.token, url, at: Date.now() };

      // 2. Mark it claimed now. A failure here is recoverable: the pending
      //    record is the retry, and the reward stays reopenable either way.
      let claimed = true;
      try {
        await confirmClaim(reward.id, addressRef.current);
      } catch {
        claimed = false;
      }

      // 3. Persisted BEFORE navigating away, so a backgrounded app still knows
      //    a claim is in flight and whether the write landed.
      writePending({ ...record, claimed });
      setPending({ ...record, claimed });
      refresh();

      if (tab) tab.location.href = url;
      else     window.location.href = url;
    } catch (err) {
      tab?.close?.();
      throw err;
    }
  }, [refresh]);

  /** "Yes, I got it" — an idempotent retry for a claim written while offline. */
  const confirm = useCallback(async () => {
    const p = readPending();
    if (!p || !addressRef.current) return;
    if (!p.claimed) await confirmClaim(p.id, addressRef.current);
    writePending(null);
    setPending(null);
    refresh();
  }, [refresh]);

  /** "No" — reopen the link rather than putting the reward back in a queue. */
  const reopenPending = useCallback(() => {
    const p = readPending();
    const url = p?.url ?? readLinks()[p?.id];
    if (!url) return;
    const tab = window.open(url, '_blank');
    if (!tab) window.location.href = url;
  }, []);

  /** Close the prompt. The claim itself is already recorded. */
  const dismissPending = useCallback(() => {
    writePending(null);
    setPending(null);
    refresh();
  }, [refresh]);

  const unclaimedCount = rewards.filter(r => !r.claimed_at).length;

  return { rewards, unclaimedCount, loading, error, refresh, claim, confirm, pending, reopenPending, dismissPending, configured: rewardsConfigured };
}
