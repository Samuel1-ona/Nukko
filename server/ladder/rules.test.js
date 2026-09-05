import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LEVELS, MAX_LEVEL, OBJECTIVE_KEYS, CASH_LEVELS,
         CASH_MILESTONES, TEST_CASH_LEVELS, isCashMilestone, poolLevels,
         UNIT_PRICE_USD, buysBetween, MILESTONE_SLOTS, SEASON_BUDGET_USD } from './levels.js';
import {
  weekKey, weeksBetween, meetsObjective, clearsLevel, objectiveProgress,
  climb, applyRollover, atRiskOfDemotion, weeklyLoad,
  progressWindowStart, progressWindowEnd,
} from './rules.js';

// Counters that clear any level in the table.
const ALL = { runs: 9999, points: 9_999_999, activeDays: 7, shopItems: 999 };
const counters = (o = {}) => ({ runs: 0, points: 0, activeDays: 0, shopItems: 0, ...o });
const ladder = (o = {}) => ({
  level: 5, highestLevel: 5, weekStart: '2026-08-24',
  levelsGainedThisWeek: 0, heldRankThisWeek: false, ...o,
});

// ─── The curve ───────────────────────────────────────────────

test('there are exactly 12 levels, numbered 1..12', () => {
  assert.equal(LEVELS.length, MAX_LEVEL);
  LEVELS.forEach((l, i) => assert.equal(l.level, i + 1));
});

test('every target is monotonically non-decreasing across levels 1→12', () => {
  for (const key of OBJECTIVE_KEYS) {
    for (let i = 1; i < LEVELS.length; i++) {
      assert.ok(
        LEVELS[i][key] >= LEVELS[i - 1][key],
        `${key} decreased at level ${LEVELS[i].level}: ${LEVELS[i - 1][key]} → ${LEVELS[i][key]}`,
      );
    }
  }
});

test('every level is strictly harder than the one before it', () => {
  for (let i = 1; i < LEVELS.length; i++) {
    const harder = OBJECTIVE_KEYS.some(k => LEVELS[i][k] > LEVELS[i - 1][k]);
    assert.ok(harder, `level ${LEVELS[i].level} is not harder than ${LEVELS[i - 1].level}`);
  }
});

test('every level carries a shop objective — the ladder has no free tier', () => {
  // Owner's decision, Sep 2026, overriding the original free-entry rule:
  // clearing level 1 costs $0.10, so nobody progresses without spending.
  for (const l of LEVELS) {
    assert.ok(l.shopItems >= 1, `level ${l.level} has no shop objective`);
  }
  assert.equal(LEVELS[0].shopItems, 2);
  assert.equal(LEVELS[11].shopItems, 23);
});

test('spending is confined to a single objective', () => {
  // The other three must stay reachable by playing alone, or the ladder would
  // be measuring wallet size in more than one place.
  const spendKeys = OBJECTIVE_KEYS.filter(k => k === 'shopItems');
  assert.deepEqual(spendKeys, ['shopItems']);
});

test('weekly shop cost matches the intended schedule at the cheapest tier', () => {
  // Counters count PURCHASES, not items, so the cheapest route is N single
  // $0.10 buys. This asserts the owner's cost-per-week column.
  const expected = { 1: '0.20', 4: '0.80', 8: '1.40', 12: '2.30' };
  for (const [level, cost] of Object.entries(expected)) {
    const actual = (LEVELS[level - 1].shopItems * 0.10).toFixed(2);
    assert.equal(actual, cost, `level ${level} weekly shop cost`);
  }
});

test('every level has a badge and an in-game reward; cash only at 4, 8 and 12', () => {
  for (const l of LEVELS) {
    assert.ok(l.badge?.length, `level ${l.level} has no badge`);
    assert.ok(l.reward.bombs + l.reward.expands > 0, `level ${l.level} pays no item`);
  }
  assert.deepEqual(LEVELS.filter(l => l.reward.cash).map(l => l.level), CASH_LEVELS);
});

test('badges are unique', () => {
  assert.equal(new Set(LEVELS.map(l => l.badge)).size, LEVELS.length);
});

test('level 12 weekly load stays under a reachable ceiling', () => {
  const load = weeklyLoad(12);
  // The volume curve puts level 12 at 120 games INSIDE ONE WEEK — roughly
  // 3.5x the best week ever observed (34 runs). That is the owner's intent,
  // so the ceiling is a tripwire against a further edit rather than a claim
  // that the rung is comfortable: ~17 runs and ~31 minutes a day.
  assert.ok(load.runsPerDay <= 18,    `level 12 asks ${load.runsPerDay.toFixed(1)} runs/day`);
  assert.ok(load.minutesPerDay <= 35, `level 12 asks ${load.minutesPerDay.toFixed(1)} min/day`);
  // And the points target must not silently demand far more runs than the
  // runs objective does: cap the implied per-run score at ~1.6x the
  // engaged-player median of 1,082.
  assert.ok(load.pointsPerRun <= 1750, `level 12 implies ${load.pointsPerRun} pts/run`);
});

test('the curve is the volume schedule the owner specified', () => {
  // Games rise by ten a rung, purchases by two. These totals ARE the
  // requirement — change them only on purpose.
  LEVELS.forEach((l, i) => {
    assert.equal(l.runs,      (i + 1) * 10, `level ${l.level} games`);
    // Purchases are NOT a difficulty dial — they are the price of the next
    // milestone's payout. See the invariant test below.
    // Points track the observed median run (402) so they land for anyone
    // who actually plays the games, instead of forming a second grind.
    assert.equal(l.points, l.runs * 400, `level ${l.level} points`);
  });

  const total = k => LEVELS.reduce((a, l) => a + l[k], 0);
  assert.equal(total('runs'), 780, 'games to clear all twelve rungs');
  assert.equal(total('runs') - LEVELS[11].runs, 660, 'games to reach level 12');
  assert.equal(total('shopItems'), 150, 'purchases to clear all twelve rungs');
  assert.equal((total('shopItems') * UNIT_PRICE_USD).toFixed(2), '15.00', 'minimum spend');
});

// ─── Objectives ──────────────────────────────────────────────

test('a level clears only when ALL four objectives are met', () => {
  const level = 5;
  const cfg   = LEVELS[level - 1];
  const exact = counters({
    runs: cfg.runs, points: cfg.points, activeDays: cfg.activeDays, shopItems: cfg.shopItems,
  });
  assert.ok(clearsLevel(exact, level), 'exact targets should clear');

  // Each objective, one short, must fail on its own.
  for (const key of OBJECTIVE_KEYS) {
    const short = { ...exact, [key]: exact[key] - 1 };
    assert.equal(clearsLevel(short, level), false, `${key} one short still cleared level ${level}`);
  }
});

test('a zero target counts as already met and never divides by zero', () => {
  // No level currently sets a zero target — every one asks for at least one
  // shop buy — but the guard has to hold for whatever the curve becomes next.
  assert.equal(meetsObjective(0, 0), true);
  assert.equal(meetsObjective(0, -1), true);

  const progress = objectiveProgress(counters(), 1);
  assert.ok(progress.every(p => Number.isFinite(p.fraction)), 'a fraction went NaN/Infinity');
  assert.ok(progress.every(p => p.fraction >= 0 && p.fraction <= 1));
});

test('an unmet objective at zero progress reports 0, not NaN', () => {
  const progress = objectiveProgress(counters(), 1);
  const shop = progress.find(p => p.key === 'shopItems');
  assert.equal(shop.target, 2);
  assert.equal(shop.met, false);
  assert.equal(shop.fraction, 0);
});

test('progress fractions are clamped to 0..1', () => {
  const p = objectiveProgress(ALL, 3);
  assert.ok(p.every(x => x.fraction >= 0 && x.fraction <= 1));
});

// ─── Week anchoring ──────────────────────────────────────────

test('weeks are anchored to Monday 00:00 UTC', () => {
  assert.equal(weekKey('2026-09-01T16:18:51Z'), '2026-08-31'); // Tuesday → Monday
  assert.equal(weekKey('2026-08-31T00:00:00Z'), '2026-08-31'); // Monday midnight → itself
  assert.equal(weekKey('2026-09-06T23:59:59Z'), '2026-08-31'); // Sunday night → same week
  assert.equal(weekKey('2026-09-07T00:00:00Z'), '2026-09-07'); // next Monday → rolls
});

test('a Sunday 23:59 UTC and the Monday 00:00 after it are different weeks', () => {
  assert.equal(weeksBetween(weekKey('2026-09-06T23:59:00Z'), weekKey('2026-09-07T00:01:00Z')), 1);
});

// ─── Rollover ────────────────────────────────────────────────

test('rollover: same week is a no-op', () => {
  const s = ladder({ weekStart: '2026-08-31' });
  const r = applyRollover(s, '2026-08-31');
  assert.equal(r.rolled, false);
  assert.equal(r.demotion, 0);
  assert.equal(r.level, 5);
});

test('rollover: no advance last week drops one level', () => {
  const r = applyRollover(ladder({ level: 5, levelsGainedThisWeek: 0 }), '2026-08-31');
  assert.equal(r.level, 4);
  assert.equal(r.demotion, 1);
});

test('rollover: any advance protects, even a single level', () => {
  const r = applyRollover(ladder({ level: 5, levelsGainedThisWeek: 1 }), '2026-08-31');
  assert.equal(r.level, 5);
  assert.equal(r.demotion, 0);
});

test('rollover: holding rank at 12 protects', () => {
  const r = applyRollover(
    ladder({ level: 12, levelsGainedThisWeek: 0, heldRankThisWeek: true }), '2026-08-31',
  );
  assert.equal(r.level, 12);
  assert.equal(r.demotion, 0);
});

test('rollover: N whole weeks away costs N levels', () => {
  for (let n = 1; n <= 4; n++) {
    const away = new Date(Date.UTC(2026, 6, 27) + n * 7 * 86_400_000).toISOString().slice(0, 10);
    const r = applyRollover(ladder({ level: 10, weekStart: '2026-07-27' }), away);
    assert.equal(r.demotion, n, `${n} weeks away should cost ${n}`);
    assert.equal(r.level, 10 - n);
  }
});

test('rollover: a protected week still costs the extra weeks of absence', () => {
  // Advanced during the week of Jul 27, then vanished for 3 more weeks.
  const r = applyRollover(
    ladder({ level: 10, weekStart: '2026-07-27', levelsGainedThisWeek: 2 }), '2026-08-24',
  );
  assert.equal(r.demotion, 3); // 0 for the protected week + 3 absent weeks
  assert.equal(r.level, 7);
});

test('rollover: demotion floors at level 1 and reports what was applied', () => {
  const r = applyRollover(ladder({ level: 2, weekStart: '2026-07-06' }), '2026-08-31');
  assert.equal(r.level, 1);
  assert.equal(r.demotion, 1); // dropped 1, not the 8 weeks elapsed
  assert.ok(r.level >= 1);
});

test('rollover: a level-1 player cannot be demoted below 1', () => {
  const r = applyRollover(ladder({ level: 1, weekStart: '2026-07-06' }), '2026-08-31');
  assert.equal(r.level, 1);
  assert.equal(r.demotion, 0);
});

test('rollover: highest_level is never lowered by demotion', () => {
  const r = applyRollover(ladder({ level: 9, highestLevel: 9, weekStart: '2026-08-17' }), '2026-08-31');
  assert.ok(r.level < 9);
  assert.equal(r.highestLevel, 9);
});

test('rollover: counters-gained resets so the new week starts clean', () => {
  const r = applyRollover(ladder({ levelsGainedThisWeek: 3, heldRankThisWeek: true }), '2026-08-31');
  assert.equal(r.levelsGainedThisWeek, 0);
  assert.equal(r.heldRankThisWeek, false);
});

test('atRiskOfDemotion flags exactly the players Monday will cost', () => {
  assert.equal(atRiskOfDemotion(ladder({ level: 5, levelsGainedThisWeek: 0 })), true);
  assert.equal(atRiskOfDemotion(ladder({ level: 5, levelsGainedThisWeek: 1 })), false);
  assert.equal(atRiskOfDemotion(ladder({ level: 12, heldRankThisWeek: true })), false);
  assert.equal(atRiskOfDemotion(ladder({ level: 1 })), false); // nothing below 1 to lose
});

// ─── Climb ───────────────────────────────────────────────────

test('climb: no progress means no movement', () => {
  const r = climb(3, counters());
  assert.equal(r.level, 3);
  assert.equal(r.levelsGained, 0);
  assert.deepEqual(r.clearedLevels, []);
  assert.equal(r.held, false);
});

test('climb: a level-5-sized week still only moves one rung', () => {
  // This used to chain 1→6 in a single pass. It cannot any more: the level-2
  // window opens the instant level 1 is cleared, so the counters that cleared
  // level 1 are not evidence about level 2 and must not be spent as if they were.
  const cfg = LEVELS[4]; // level 5 targets
  const r = climb(1, counters({
    runs: cfg.runs, points: cfg.points, activeDays: cfg.activeDays, shopItems: cfg.shopItems,
  }));
  assert.equal(r.level, 2);
  assert.equal(r.levelsGained, 1);
  assert.deepEqual(r.clearedLevels, [1]);
  assert.equal(r.held, false);
});

test('climb: never exceeds level 12', () => {
  const r = climb(1, ALL);
  assert.equal(r.level, 2);
  assert.equal(r.levelsGained, 1);
  assert.deepEqual(r.clearedLevels, [1]);
  // Reaching 12 now takes eleven separate passes, each with its own window.
  let level = 1;
  for (let i = 0; i < 20 && level < MAX_LEVEL; i++) level = climb(level, ALL).level;
  assert.equal(level, MAX_LEVEL);
});

test('climb: level 12 reports held rather than advancing', () => {
  const r = climb(12, ALL);
  assert.equal(r.level, 12);
  assert.equal(r.levelsGained, 0);
  assert.equal(r.held, true);
  assert.deepEqual(r.clearedLevels, [12]);
});

test('climb: at 12 without clearing the card, nothing is held', () => {
  const r = climb(12, counters({ runs: 1 }));
  assert.equal(r.held, false);
  assert.deepEqual(r.clearedLevels, []);
});

test('climb never mutates the counters it was given', () => {
  const cfg = LEVELS[1]; // level 2
  const c = counters({
    runs: cfg.runs, points: cfg.points, activeDays: cfg.activeDays, shopItems: cfg.shopItems,
  });
  const r = climb(1, c);
  assert.equal(r.level, 2);
  assert.deepEqual(c, counters({
    runs: cfg.runs, points: cfg.points, activeDays: cfg.activeDays, shopItems: cfg.shopItems,
  }), 'climb mutated the counters it was given');
});


// ─── Per-level progress windows ──────────────────────────────
// The window is what makes a level start from zero. These tests model the
// counter the way ladder_counters() does — an event counts when it was
// recorded at or after the window opens and before the week ends — so the
// arithmetic is exercised without a database.

const MONDAY = '2026-08-31';                       // a real Monday, 00:00 UTC
const at = (dayOffset, hour = 12) =>
  new Date(Date.UTC(2026, 7, 31 + dayOffset, hour)).toISOString();

// Events the player has produced this week: one entry per scored run, plus
// the verified purchases. Counted exactly like the SQL does.
function countersOver(events, since, until) {
  const inWindow = events.filter(e => e.at >= since && e.at < until);
  const runs     = inWindow.filter(e => e.kind === 'run');
  return {
    runs:       runs.length,
    points:     runs.reduce((a, e) => a + e.score, 0),
    activeDays: new Set(runs.map(e => e.at.slice(0, 10))).size,
    shopItems:  inWindow.filter(e => e.kind === 'buy').length,
  };
}

test('the window opens at the week start until a level is entered later', () => {
  assert.equal(progressWindowStart(MONDAY, null), `${MONDAY}T00:00:00.000Z`);
  // A stamp from a previous week must never widen the window backwards.
  assert.equal(progressWindowStart(MONDAY, at(-3)), `${MONDAY}T00:00:00.000Z`);
  // A stamp inside the week wins: that is the fresh start.
  assert.equal(progressWindowStart(MONDAY, at(2)), at(2));
});

test('the window always closes at the end of the ladder week', () => {
  assert.equal(progressWindowEnd(MONDAY), '2026-09-07T00:00:00.000Z');
  // Entering a level on Friday must not buy two extra days.
  assert.equal(progressWindowEnd(MONDAY), progressWindowEnd(MONDAY, at(4)));
});

test('a level never inherits what was banked on the level below it', () => {
  // The exact bug being fixed: one purchase and one run cleared level 1, and
  // under the old week-anchored window they counted toward level 2 as well.
  const events = [
    { kind: 'buy', at: at(0, 8) },
    { kind: 'buy', at: at(0, 9) },
    ...Array.from({ length: 10 }, (_, i) => ({ kind: 'run', at: at(0, 10), score: 500 })),
  ];
  const until = progressWindowEnd(MONDAY);

  const card1 = countersOver(events, progressWindowStart(MONDAY, null), until);
  assert.ok(clearsLevel(card1, 1));

  // Cleared on Monday morning → the level-2 window opens after it.
  const card2 = countersOver(events, progressWindowStart(MONDAY, at(0, 13)), until);
  assert.deepEqual(card2, { runs: 0, points: 0, activeDays: 0, shopItems: 0 });
});

test('climb clears at most one level per pass, however big the week', () => {
  // Counters that clear every card in the table still only move one rung:
  // arriving on the next level reopens the window, so the snapshot that
  // cleared this level says nothing about the next one.
  const step = climb(1, ALL);
  assert.equal(step.level, 2);
  assert.equal(step.levelsGained, 1);
  assert.deepEqual(step.clearedLevels, [1]);
});

test('a full climb reads each card against its own targets, starting empty', () => {
  // Walks 1→12 the way a real player does: each card starts empty, is cleared
  // by its own targets alone, and the week rolls over when the card needs more
  // days than the week has left. Gaining a level protects against demotion, so
  // the climb continues across the boundary.
  let level      = 1;
  let weekStart  = MONDAY;
  let dayInWeek  = 0;
  let openedAt   = progressWindowStart(weekStart, null);
  let events     = [];
  let weeks      = 1;

  const rollWeek = () => {
    weeks     += 1;
    weekStart  = new Date(new Date(`${weekStart}T00:00:00Z`).getTime() + 7 * 86_400_000)
                   .toISOString().slice(0, 10);
    dayInWeek  = 0;
    events     = [];                       // counters are week-anchored too
    openedAt   = progressWindowStart(weekStart, null);
  };

  const dayAt = (offset) =>
    new Date(new Date(`${weekStart}T00:00:00Z`).getTime() + offset * 86_400_000);
  const stamp = (offset, hour) =>
    new Date(dayAt(offset).getTime() + hour * 3_600_000).toISOString();

  while (level <= MAX_LEVEL) {
    const cfg  = LEVELS[level - 1];
    const days = Math.max(1, cfg.activeDays);

    // Not enough week left for this card's active days — wait for Monday.
    if (dayInWeek + days > 7) rollWeek();

    const until   = progressWindowEnd(weekStart);
    const opening = countersOver(events, openedAt, until);
    assert.deepEqual(
      opening, { runs: 0, points: 0, activeDays: 0, shopItems: 0 },
      `level ${level} did not start from zero`,
    );
    assert.ok(!clearsLevel(opening, level), `level ${level} cleared itself on arrival`);

    // Play exactly this card's own requirement — no more.
    for (let i = 0; i < cfg.shopItems; i++) events.push({ kind: 'buy', at: stamp(dayInWeek, 1) });
    for (let i = 0; i < cfg.runs; i++) {
      events.push({
        kind: 'run',
        at: stamp(dayInWeek + (i % days), 2),
        score: Math.ceil(cfg.points / cfg.runs),
      });
    }

    const filled = countersOver(events, openedAt, until);
    assert.ok(clearsLevel(filled, level), `level ${level} was not cleared by its own targets`);

    const step = climb(level, filled);
    assert.deepEqual(step.clearedLevels, [level]);
    if (level === MAX_LEVEL) { assert.ok(step.held); break; }
    assert.equal(step.levelsGained, 1);

    // Arrival on the next card reopens the window at that instant.
    dayInWeek += days;
    openedAt   = stamp(dayInWeek, 0);
    level      = step.level;
  }

  assert.equal(level, MAX_LEVEL);
  // Pins the consequence of absolute per-level targets: the ladder is no
  // longer a one-week sprint. Change this number only on purpose.
  assert.equal(weeks, 8, `a clean 1→12 climb now spans ${weeks} weeks`);
});

test('the active-days curve is what bounds a single week', () => {
  // With per-level windows the active-day targets no longer overlap: they add
  // up. Twelve rungs ask for more distinct days than a week contains, so the
  // ladder cannot be cleared end to end between two Mondays — by design, but
  // worth failing loudly if someone rescales the curve without meaning to.
  const totalDays = LEVELS.reduce((a, l) => a + Math.max(1, l.activeDays), 0);
  assert.ok(totalDays > 7, 'the whole ladder now fits in one week');
  assert.equal(totalDays, 42);
});

test('a demotion reopens the window, so the lost level is re-earned in full', () => {
  const rolled = applyRollover(
    ladder({ level: 5, weekStart: '2026-08-24', levelsGainedThisWeek: 0 }),
    MONDAY,
  );
  assert.equal(rolled.level, 4);

  // The service stamps level_started_at on that arrival; progress from the
  // week they were demoted out of cannot reach across into the new card.
  const events = [{ kind: 'run', at: at(-2), score: 50_000 }, { kind: 'buy', at: at(-2) }];
  const counters = countersOver(
    events,
    progressWindowStart(MONDAY, at(0, 0)),
    progressWindowEnd(MONDAY),
  );
  assert.deepEqual(counters, { runs: 0, points: 0, activeDays: 0, shopItems: 0 });
});

test('the week boundary resets a card even when the level never changed', () => {
  // Keeping the week start in the maximum is what makes this true, and it is
  // what keeps the Monday demotion rule meaningful.
  const enteredLastWeek = at(-4);
  const events = [{ kind: 'run', at: at(-2), score: 9000 }];

  const lastWeek = countersOver(events, progressWindowStart('2026-08-24', enteredLastWeek), progressWindowEnd('2026-08-24'));
  assert.equal(lastWeek.runs, 1);

  const thisWeek = countersOver(events, progressWindowStart(MONDAY, enteredLastWeek), progressWindowEnd(MONDAY));
  assert.equal(thisWeek.runs, 0);
});


// ─── The cash payout test whitelist ──────────────────────────

test('with the whitelist unset, only the public milestones pay', () => {
  // The default shipped state. TEST_CASH_ADDRESSES is read at import time and
  // is empty in the test environment.
  for (const level of [4, 8, 12]) {
    assert.ok(isCashMilestone(level, '0xanyone'), `level ${level} should pay everybody`);
  }
  for (const level of TEST_CASH_LEVELS) {
    assert.ok(!isCashMilestone(level, '0xanyone'), `test level ${level} paid an unlisted address`);
  }
  assert.deepEqual(poolLevels(), [...CASH_MILESTONES].sort((a, b) => a - b));
});

test('a test level is never advertised as a public milestone', () => {
  // CASH_MILESTONES drives what the ladder promises. A test level leaking into
  // it would promise every player money that will not be paid.
  for (const level of TEST_CASH_LEVELS) {
    assert.ok(!CASH_MILESTONES.has(level), `test level ${level} leaked into the public curve`);
    assert.ok(!CASH_LEVELS.includes(level), `test level ${level} leaked into CASH_LEVELS`);
  }
});


// ─── Cash reward economics ───────────────────────────────────
// These numbers are economics, not a difficulty dial, and nothing else in the
// codebase notices when someone edits one. Assert the rule directly.

const STRETCHES = [
  { from: 1, to: 4,  payout: 4  },
  { from: 5, to: 8,  payout: 10 },
  { from: 9, to: 12, payout: 16 },
];

test('each stretch forces exactly half of the payout it leads to', () => {
  // THE RULE: a milestone pays twice what the climb to it cost in the shop.
  for (const { from, to, payout } of STRETCHES) {
    const spend = buysBetween(from, to) * UNIT_PRICE_USD;
    assert.ok(
      Math.abs(spend - payout / 2) < 1e-9,
      `levels ${from}-${to} force $${spend.toFixed(2)} but lead to a $${payout} payout`,
    );
  }
});

test('a milestone pays for its own stretch only, never the cumulative total', () => {
  // Paying 2x of everything spent so far would hand a full-ladder climber 3x,
  // because the earlier milestones already bought that ground.
  const totalSpend  = buysBetween(1, MAX_LEVEL) * UNIT_PRICE_USD;
  const totalPayout = STRETCHES.reduce((a, s) => a + s.payout, 0);
  assert.equal(totalSpend.toFixed(2), '15.00');
  assert.equal(totalPayout, 30);
  assert.ok(Math.abs(totalPayout - totalSpend * 2) < 1e-9, 'end to end must be exactly 2x');
});

test('the stretch payouts are the amounts actually on the cards', () => {
  // The invariant above is worthless if the curve pays something else.
  for (const { to, payout } of STRETCHES) {
    const cash = LEVELS[to - 1].reward.cash;
    assert.ok(cash, `level ${to} is a milestone but carries no cash`);
    assert.equal(Number(cash.amount), payout, `level ${to} payout`);
  }
  assert.deepEqual(LEVELS.filter(l => l.reward.cash).map(l => l.level), CASH_LEVELS);
});

test('purchase targets never decrease as levels rise', () => {
  // A stretch can total correctly while containing a rung that asks for less
  // than the one below it, which reads as a bug to every player who sees it.
  for (let i = 1; i < LEVELS.length; i++) {
    assert.ok(
      LEVELS[i].shopItems >= LEVELS[i - 1].shopItems,
      `level ${LEVELS[i].level} asks ${LEVELS[i].shopItems} after ${LEVELS[i - 1].shopItems}`,
    );
  }
});

test('the season budget is the slot count times the payouts', () => {
  assert.deepEqual(MILESTONE_SLOTS, { 4: 10, 8: 5, 12: 3 });
  assert.equal(SEASON_BUDGET_USD.toFixed(2), '138.00');
  // Break-even at $1 net per participating player.
  assert.equal(Math.ceil(SEASON_BUDGET_USD / 1), 138, 'players needed at $2 average spend');
});

test('the unit price is the cheapest route to a credit, not the average', () => {
  // Counters count PURCHASES, not items: a $0.90 ten-pack logs the same single
  // credit as a $0.10 single, so the cheapest single sets the floor. Anyone
  // buying bundles spends more per credit and lands below 2x — the rule is a
  // ceiling on generosity, not a target.
  assert.equal(UNIT_PRICE_USD, 0.10);
});
