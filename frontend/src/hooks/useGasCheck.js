import { useState, useEffect, useRef, useCallback } from 'react';
import { publicClient } from '../blockchain/config.js';

// Minimum CELO balance (in wei) needed to submit at least one transaction.
// Celo gas is very cheap (~0.1 Gwei), but we require 0.005 CELO as a buffer
// for start-game + submit-score + any power-up purchases.
const MIN_BALANCE = 5_000_000_000_000_000n; // 0.005 CELO in wei

const POLL_INTERVAL = 5_000;  // re-check every 5 s while the modal is open
const MAX_INTERVAL  = 60_000; // ceiling once the RPC starts refusing us

// The RPC is a shared, rate-limited endpoint: the key ships in the client
// bundle, so every player draws on the same budget. Retrying a 429 at the
// same cadence is what turns a brief limit into a sustained one, so each
// consecutive failure doubles the wait and any success resets it.
const backoffFor = (failures) =>
  Math.min(MAX_INTERVAL, POLL_INTERVAL * 2 ** failures);

// MiniPay pays gas via fee abstraction (USDT/USDC/USDm) — CELO is hidden from
// users entirely. Never check or gate on CELO balance inside MiniPay.
export function useGasCheck(address, miniPay = false) {
  const [hasGas,   setHasGas]   = useState(true);  // optimistic until first check
  const [balance,  setBalance]  = useState(null);   // BigInt | null
  const [checking, setChecking] = useState(false);
  const timerRef    = useRef(null);
  const failuresRef = useRef(0);

  const checkBalance = useCallback(async () => {
    if (!address || miniPay) return;
    setChecking(true);
    try {
      const bal = await publicClient.getBalance({ address });
      failuresRef.current = 0;
      setBalance(bal);
      setHasGas(bal >= MIN_BALANCE);
    } catch {
      // Rate limit or network error — keep current state and slow down.
      failuresRef.current += 1;
    } finally {
      setChecking(false);
    }
  }, [address, miniPay]);

  useEffect(() => {
    // MiniPay: fee abstraction handles gas — no CELO check needed
    if (!address || miniPay) return;

    let cancelled = false;

    // A self-rescheduling timeout rather than setInterval, so the delay can
    // grow with consecutive failures instead of being fixed at creation.
    const tick = async () => {
      await checkBalance();
      if (cancelled) return;
      timerRef.current = setTimeout(tick, backoffFor(failuresRef.current));
    };
    tick();

    return () => { cancelled = true; clearTimeout(timerRef.current); };
  }, [address, miniPay, checkBalance]);

  // Once hasGas flips to true, stop polling
  useEffect(() => {
    if (hasGas) clearTimeout(timerRef.current);
  }, [hasGas]);

  // Format balance as human-readable CELO string
  const balanceDisplay = balance !== null
    ? `${(Number(balance) / 1e18).toFixed(4)} CELO`
    : null;

  return { hasGas, balance, balanceDisplay, checking, recheckNow: checkBalance };
}
