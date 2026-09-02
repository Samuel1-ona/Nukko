// Receipt-verifies purchases before they can count toward the ladder.
//
// POST /api/purchases accepts a client-supplied tx_hash, so an unverified
// row proves nothing. A row only becomes a ladder-countable "shop item"
// once its receipt shows a real stablecoin transfer from that player to
// the treasury, at or above the cheapest package price.

import { parseAbiItem, decodeEventLog, formatUnits } from 'viem';
import { publicClient, TREASURY, STABLECOINS, MIN_PURCHASE_USD } from './client.js';

const TRANSFER = parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)');

// Public RPCs drop requests when a sweep bursts at them, which surfaces as a
// missing receipt for a transaction that is perfectly fine. Pacing the sweep
// costs a few seconds and avoids re-queueing good purchases every run.
const RPC_PACING_MS = 120;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

/**
 * @returns {{ ok: true, amount: string, token: string } | { ok: false, reason: string, retry?: boolean }}
 */
export async function verifyPurchaseTx(txHash, walletAddress) {
  if (!/^0x[0-9a-fA-F]{64}$/.test(txHash ?? '')) {
    return { ok: false, reason: 'malformed tx hash' };
  }

  let receipt;
  try {
    receipt = await publicClient.getTransactionReceipt({ hash: txHash });
  } catch {
    // Not mined yet, or the RPC hiccuped — retry on a later pass rather
    // than permanently condemning a purchase the player really made.
    return { ok: false, reason: 'receipt not found', retry: true };
  }

  if (receipt.status !== 'success') return { ok: false, reason: 'transaction reverted' };

  const wallet = walletAddress.toLowerCase();

  for (const log of receipt.logs) {
    const token = STABLECOINS[log.address.toLowerCase()];
    if (!token) continue;

    let decoded;
    try {
      decoded = decodeEventLog({ abi: [TRANSFER], data: log.data, topics: log.topics });
    } catch {
      continue; // not a Transfer (approvals etc.)
    }

    const { from, to, value } = decoded.args;
    if (to.toLowerCase() !== TREASURY) continue;
    if (from.toLowerCase() !== wallet) continue;

    const amount = formatUnits(value, token.decimals);
    if (Number(amount) + 1e-9 < MIN_PURCHASE_USD) {
      return { ok: false, reason: `amount ${amount} below minimum` };
    }
    return { ok: true, amount, token: token.symbol };
  }

  return { ok: false, reason: 'no matching treasury transfer in receipt' };
}

/**
 * Verify purchases that have not been checked yet. Scoped to one wallet
 * before a ladder sync; unscoped when run as a sweep.
 */
export async function verifyPendingPurchases(supabase, { wallet, limit = 50 } = {}) {
  let q = supabase
    .from('purchases')
    .select('id, wallet_address, tx_hash')
    .is('verified_at', null)
    .is('verify_failed', null)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (wallet) q = q.eq('wallet_address', wallet.toLowerCase());

  const { data: rows, error } = await q;
  if (error) throw new Error(`purchase verify query failed: ${error.message}`);

  let verified = 0, rejected = 0, pending = 0;

  for (const [i, row] of (rows ?? []).entries()) {
    if (i > 0) await sleep(RPC_PACING_MS);
    const result = await verifyPurchaseTx(row.tx_hash, row.wallet_address);

    if (result.ok) {
      await supabase.from('purchases').update({
        verified_at:     new Date().toISOString(),
        verified_amount: result.amount,
        verified_token:  result.token,
      }).eq('id', row.id);
      verified++;
    } else if (result.retry) {
      pending++;
    } else {
      await supabase.from('purchases').update({ verify_failed: result.reason }).eq('id', row.id);
      rejected++;
    }
  }

  return { checked: rows?.length ?? 0, verified, rejected, pending };
}
