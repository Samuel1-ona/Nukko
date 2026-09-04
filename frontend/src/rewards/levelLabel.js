// The reward label is the only thing tying a payout row to a ladder rung.
// The server writes exactly one shape — `Nukko — Level 4 ASTEROID RIDER`
// (server/ladder/service.js, the single label writer) — and this reads it
// back.
//
// Anything else returns null on purpose: tournament prizes and one-off admin
// payouts live in the same inbox and must stay out of the ladder UI.

const MAX_LEVEL = 12;

export function levelFromRewardLabel(label) {
  const match = /\blevel\s+(\d+)\b/i.exec(label ?? '');
  if (!match) return null;
  const level = Number(match[1]);
  if (!Number.isInteger(level) || level < 1 || level > MAX_LEVEL) return null;
  return level;
}

// Unclaimed rewards keyed by the rung that paid them. Unclaimed only: a
// claimed reward has nothing left to offer on the ladder.
export function unclaimedByLevel(rewards = []) {
  const map = new Map();
  for (const r of rewards) {
    if (r.claimed_at) continue;
    const level = levelFromRewardLabel(r.label);
    if (level && !map.has(level)) map.set(level, r);
  }
  return map;
}
