// The Nukko ladder: 12 levels, four weekly objectives each.
//
// Thresholds are CUMULATIVE, not per-level: level N+1 asks for higher
// absolute numbers than level N, so progress banked this week carries
// straight into the next card and a strong week can chain several levels
// in one pass. Counters are never reset on level-up.
//
// Calibrated against 3,000 real sessions (29 Jul – 1 Sep 2026):
//   median run 402 pts · p90 6,903 · median duration 109 s
//   engaged player week: 7 runs, 9,735 pts, 2 active days
//   best week ever observed: 34 runs, 6 active days
// Level 12 is deliberately ~2x the best week ever recorded.

export const MAX_LEVEL = 12;

// Objective metadata — shared with the UI so labels never drift.
export const OBJECTIVES = [
  { key: 'runs',       label: 'Runs completed', short: 'Runs',      source: 'on-chain ScoreSubmitted' },
  { key: 'points',     label: 'Points scored',  short: 'Points',    source: 'on-chain ScoreSubmitted' },
  { key: 'activeDays', label: 'Active days',    short: 'Days',      source: 'on-chain ScoreSubmitted' },
  { key: 'shopItems',  label: 'Shop items',     short: 'Shop',      source: 'receipt-verified purchases' },
];

export const OBJECTIVE_KEYS = OBJECTIVES.map(o => o.key);

// Cash milestones. `amount` is the expected/display value — the real
// amount and token always come from the pool row that gets drawn, since
// links are funded by hand in MiniPay.
export const CASH_LEVELS = [4, 8, 12];

export const LEVELS = [
  { level: 1,  badge: 'DUST DRIFTER',       runs: 3,  points: 1000,   activeDays: 1, shopItems: 0,  reward: { bombs: 1,  expands: 0,  cash: null } },
  { level: 2,  badge: 'PEBBLE PILOT',       runs: 5,  points: 2500,   activeDays: 1, shopItems: 0,  reward: { bombs: 0,  expands: 1,  cash: null } },
  { level: 3,  badge: 'METEOR SCOUT',       runs: 8,  points: 5000,   activeDays: 2, shopItems: 1,  reward: { bombs: 2,  expands: 0,  cash: null } },
  { level: 4,  badge: 'ASTEROID RIDER',     runs: 12, points: 9000,   activeDays: 2, shopItems: 2,  reward: { bombs: 0,  expands: 2,  cash: { amount: '0.50', token: 'USDT' } } },
  { level: 5,  badge: 'COMET CHASER',       runs: 16, points: 14000,  activeDays: 3, shopItems: 3,  reward: { bombs: 3,  expands: 0,  cash: null } },
  { level: 6,  badge: 'LUNAR WARDEN',       runs: 21, points: 20000,  activeDays: 3, shopItems: 4,  reward: { bombs: 0,  expands: 3,  cash: null } },
  { level: 7,  badge: 'ORBIT BREAKER',      runs: 27, points: 28000,  activeDays: 4, shopItems: 5,  reward: { bombs: 4,  expands: 2,  cash: null } },
  { level: 8,  badge: 'RING KEEPER',        runs: 34, points: 38000,  activeDays: 4, shopItems: 6,  reward: { bombs: 5,  expands: 5,  cash: { amount: '1.00', token: 'USDT' } } },
  { level: 9,  badge: 'STORM GIANT',        runs: 42, points: 50000,  activeDays: 5, shopItems: 8,  reward: { bombs: 6,  expands: 6,  cash: null } },
  { level: 10, badge: 'STARFORGE',          runs: 51, points: 64000,  activeDays: 5, shopItems: 9,  reward: { bombs: 8,  expands: 8,  cash: null } },
  { level: 11, badge: 'NEUTRON ORACLE',     runs: 60, points: 80000,  activeDays: 6, shopItems: 10, reward: { bombs: 10, expands: 10, cash: null } },
  { level: 12, badge: 'NUKKO SINGULARITY',  runs: 70, points: 100000, activeDays: 6, shopItems: 12, reward: { bombs: 15, expands: 15, cash: { amount: '2.00', token: 'USDT' } } },
];

export function levelConfig(level) {
  const cfg = LEVELS[level - 1];
  if (!cfg) throw new Error(`No such ladder level: ${level}`);
  return cfg;
}

// Targets for a level as a plain {objectiveKey: target} map.
export function targetsFor(level) {
  const cfg = levelConfig(level);
  return Object.fromEntries(OBJECTIVE_KEYS.map(k => [k, cfg[k]]));
}
