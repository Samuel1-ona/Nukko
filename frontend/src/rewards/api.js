import { rewardsDb, rewardsConfigured, GAME_SLUG } from './client.js';

// ─── Reading the inbox ───────────────────────────────────────
// cash_link_url is deliberately absent: anyone who can see that URL can
// spend the money, so it is only ever fetched for a single reward at
// claim time (see revealReward below — the one place it appears).

export async function listRewards(address) {
  if (!rewardsConfigured || !address) return [];

  const { data, error } = await rewardsDb
    .from('rewards')
    .select('id, label, amount, token, claimed_at, created_at')
    .eq('address', address.toLowerCase())
    .eq('game', GAME_SLUG)
    .order('created_at', { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

// ─── Claiming, step 1: reveal, touching nothing ──────────────
// Marking a reward claimed at the moment the link is revealed would strand
// any player who loses connection while MiniPay opens: the row would read
// as claimed with nothing received and no way to prove otherwise.
//
// An already-claimed reward is re-openable on purpose — a player who lost
// the tab gets the URL back rather than an error.

export async function revealReward(rewardId, address) {
  if (!rewardsConfigured) throw new Error('Rewards are not configured');

  const { data, error } = await rewardsDb
    .from('rewards')
    .select('cash_link_url, address, claimed_at')
    .eq('id', rewardId)
    .single();

  if (error) throw new Error(error.message);
  if (!data)  throw new Error('Reward not found');
  if (data.address !== address.toLowerCase()) throw new Error('Not your reward');

  return { url: data.cash_link_url, alreadyClaimed: Boolean(data.claimed_at) };
}

// ─── Claiming, step 2: only after the player confirms receipt ──

export async function confirmClaim(rewardId, address) {
  if (!rewardsConfigured) throw new Error('Rewards are not configured');

  const { error } = await rewardsDb
    .from('rewards')
    .update({ claimed_at: new Date().toISOString() })
    .eq('id', rewardId)
    .eq('address', address.toLowerCase());

  if (error) throw new Error(error.message);
}
