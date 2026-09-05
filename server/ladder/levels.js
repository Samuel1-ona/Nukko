// The Nukko ladder: 12 levels, four weekly objectives each.
//
// Thresholds are ABSOLUTE PER LEVEL, not cumulative: each rung's targets
// count only what the player does AFTER arriving on it (see the progress
// window in rules.js). Nothing carries over from the rung below, and one
// clear moves the player exactly one rung.
//
// The window also closes at the end of the ladder week, so every rung is a
// one-week sprint: clear it or Monday costs a level and the rung restarts.
//
// The curve (owner's call, Sep 2026) is built on volume:
//   runs      N x 10  →  10, 20, 30 … 120   (780 games to clear all twelve)
//   shopItems N x 2   →   2,  4,  6 …  24   (156 purchases, $15.60 at $0.10)
//   points    runs x 400 — the observed median run is 402, so points land
//             naturally for anyone who plays the games rather than forming
//             a second grind on top of them.
//   activeDays unchanged: the returning-player check, not a volume lever.
//
// Calibrated against 3,000 real sessions (29 Jul – 1 Sep 2026):
//   median run 402 pts · p90 6,903 · median duration 109 s
//   engaged player week: 7 runs, 9,735 pts, 2 active days
//   best week ever observed: 34 runs, 6 active days
//
// Level 12 therefore asks 120 games and 24 purchases INSIDE ONE WEEK to
// hold rank — far beyond any week yet observed, which is deliberate.
//
// Every level carries a shop objective: the ladder has no free tier.
// Counters count PURCHASES, not items — a $0.90 ten-pack is one buy, so the
// cheapest route through the ladder is 156 single $0.10 buys.

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
  { level: 1,   badge: 'DUST DRIFTER',        runs: 10,   points: 4000,   activeDays: 1, shopItems: 2,   reward: { bombs: 1,  expands: 0,  cash: null } },
  { level: 2,   badge: 'PEBBLE PILOT',        runs: 20,   points: 8000,   activeDays: 1, shopItems: 4,   reward: { bombs: 0,  expands: 1,  cash: null } },
  { level: 3,   badge: 'METEOR SCOUT',        runs: 30,   points: 12000,  activeDays: 2, shopItems: 6,   reward: { bombs: 2,  expands: 0,  cash: null } },
  { level: 4,   badge: 'ASTEROID RIDER',      runs: 40,   points: 16000,  activeDays: 2, shopItems: 8,   reward: { bombs: 0,  expands: 2,  cash: { amount: '4.00', token: 'USDT' } } },
  { level: 5,   badge: 'COMET CHASER',        runs: 50,   points: 20000,  activeDays: 3, shopItems: 11,  reward: { bombs: 3,  expands: 0,  cash: null } },
  { level: 6,   badge: 'LUNAR WARDEN',        runs: 60,   points: 24000,  activeDays: 3, shopItems: 12,  reward: { bombs: 0,  expands: 3,  cash: null } },
  { level: 7,   badge: 'ORBIT BREAKER',       runs: 70,   points: 28000,  activeDays: 4, shopItems: 13,  reward: { bombs: 4,  expands: 2,  cash: null } },
  { level: 8,   badge: 'RING KEEPER',         runs: 80,   points: 32000,  activeDays: 4, shopItems: 14,  reward: { bombs: 5,  expands: 5,  cash: { amount: '10.00', token: 'USDT' } } },
  { level: 9,   badge: 'STORM GIANT',         runs: 90,   points: 36000,  activeDays: 5, shopItems: 17,  reward: { bombs: 6,  expands: 6,  cash: null } },
  { level: 10,  badge: 'STARFORGE',           runs: 100,  points: 40000,  activeDays: 5, shopItems: 19,  reward: { bombs: 8,  expands: 8,  cash: null } },
  { level: 11,  badge: 'NEUTRON ORACLE',      runs: 110,  points: 44000,  activeDays: 6, shopItems: 21,  reward: { bombs: 10, expands: 10, cash: null } },
  { level: 12,  badge: 'NUKKO SINGULARITY',   runs: 120,  points: 48000,  activeDays: 6, shopItems: 23,  reward: { bombs: 15, expands: 15, cash: { amount: '16.00', token: 'USDT' } } },
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

// ─── Cash milestones ─────────────────────────────────────────
// The public curve: these are the rungs the ladder promises money at, and
// the only ones every player sees advertised.
export const CASH_MILESTONES = new Set(CASH_LEVELS);

// Levels that pay ONLY the test whitelist. Reaching level 4 legitimately
// costs a week of play, which is too slow to exercise a payout end to end.
//
// Kept deliberately separate from CASH_MILESTONES: that set drives what the
// ladder advertises, and a test level must never promise every player money
// it will not pay them.
export const TEST_CASH_LEVELS = new Set([1]);

// Env-driven with no seeded address, so unsetting the variable reverts the
// behaviour, the fundable pool levels and the admin portal in one move — no
// code change, no redeploy of anything but the env.
export const TEST_CASH_ADDRESSES = new Set(
  (process.env.TEST_CASH_ADDRESSES ?? '')
    .split(',').map(a => a.trim().toLowerCase()).filter(Boolean),
);

// Every grant decision goes through here — never a bare set lookup — so the
// whitelist cannot be bypassed by a call site that forgot about it.
export function isCashMilestone(level, address) {
  if (CASH_MILESTONES.has(level)) return true;
  if (!TEST_CASH_LEVELS.has(level)) return false;
  return TEST_CASH_ADDRESSES.has(String(address ?? '').toLowerCase());
}

// Levels the pool and the admin portal accept. Widens to the test levels
// only while the whitelist is armed.
export function poolLevels() {
  const levels = [...CASH_MILESTONES];
  if (TEST_CASH_ADDRESSES.size) levels.push(...TEST_CASH_LEVELS);
  return [...new Set(levels)].sort((a, b) => a - b);
}

// ─── Cash reward economics ───────────────────────────────────
//
// THE RULE: a milestone pays twice what the climb to it costs in the shop.
// To receive $4, a player must have been required to spend $2 getting there.
// The purchases objective on each card is what forces that spend — it is the
// price of the milestone's reward, deliberately, not incidentally.
//
//   purchases required between milestone N-1 and N
//     = (payout at N / 2) / UNIT_PRICE_USD
//
// Each milestone pays only for the STRETCH since the previous one, never for
// the cumulative total. Paying 2x of everything spent so far would hand a
// full-ladder climber 3x, because the earlier milestones already bought that
// ground.
//
//   levels 1-4   20 buys  $2.00  ->  pays $4
//   levels 5-8   50 buys  $5.00  ->  pays $10
//   levels 9-12  80 buys  $8.00  ->  pays $16
//   full climb  150 buys $15.00  ->  pays $30   (exactly 2x, end to end)
//
// UNIT_PRICE_USD is the CHEAPEST route to one purchase credit, not the
// average: counters count PURCHASES, not items, so a $0.90 ten-pack logs the
// same single credit as a $0.10 single. Players who buy bundles spend more per
// credit, which puts the real multiple BELOW 2x. The rule is a ceiling on
// generosity, not a target.
export const UNIT_PRICE_USD = 0.10;

// Purchases required across a stretch of levels, inclusive.
export function buysBetween(fromLevel, toLevel) {
  return LEVELS
    .filter(l => l.level >= fromLevel && l.level <= toLevel)
    .reduce((a, l) => a + l.shopItems, 0);
}

// ─── Funding: a fixed-slot race, reloaded every season ───────
//
// Cash is NOT promised to everyone who reaches a milestone. A set number of
// links is funded per milestone and handed out in the order players clear the
// level — fewer slots higher up, more money each.
//
// Reload this same shape every season (a month). Funding it once ever leaves a
// latecomer opening a ladder whose prizes are all gone, which is worse than
// never having offered them: a visible closed door. Same budget each season,
// and every cohort gets a live race.
//
// Budget check — the house should net at least $1 per participating player:
//   budget <= N x (average shop spend per player - $1)
// $138 needs ~138 players at $2 average spend, or ~69 at $3. That average is
// across EVERYONE who plays, including the many who never reach a milestone,
// and anyone who reaches level 4 has already been made to buy 20 items.
export const MILESTONE_SLOTS = { 4: 10, 8: 5, 12: 3 };

export const SEASON_BUDGET_USD = Object.entries(MILESTONE_SLOTS)
  .reduce((a, [lv, slots]) => a + slots * Number(levelConfig(Number(lv)).reward.cash.amount), 0);
