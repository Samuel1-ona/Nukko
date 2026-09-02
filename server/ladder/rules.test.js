import { test } from 'node:test';
import assert from 'node:assert/strict';

import { LEVELS, MAX_LEVEL, OBJECTIVE_KEYS, CASH_LEVELS } from './levels.js';
import {
  weekKey, weeksBetween, meetsObjective, clearsLevel, objectiveProgress,
  climb, applyRollover, atRiskOfDemotion, weeklyLoad,
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

test('levels 1 and 2 require no spending, and only one objective ever costs money', () => {
  assert.equal(LEVELS[0].shopItems, 0);
  assert.equal(LEVELS[1].shopItems, 0);
  const paid = OBJECTIVE_KEYS.filter(k => LEVELS.some(l => k === 'shopItems' && l[k] > 0));
  assert.deepEqual(paid, ['shopItems']);
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
  // Observed best week ever: 34 runs. L12 is ~2x that by design, but it
  // must still fit in a day a dedicated player actually has.
  assert.ok(load.runsPerDay <= 12,    `level 12 asks ${load.runsPerDay.toFixed(1)} runs/day`);
  assert.ok(load.minutesPerDay <= 30, `level 12 asks ${load.minutesPerDay.toFixed(1)} min/day`);
  // And the points target must not silently demand far more runs than the
  // runs objective does: cap the implied per-run score at ~1.6x the
  // engaged-player median of 1,082.
  assert.ok(load.pointsPerRun <= 1750, `level 12 implies ${load.pointsPerRun} pts/run`);
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
  assert.equal(meetsObjective(0, 0), true);
  const progress = objectiveProgress(counters(), 1); // level 1 has shopItems: 0
  const shop = progress.find(p => p.key === 'shopItems');
  assert.equal(shop.target, 0);
  assert.equal(shop.met, true);
  assert.equal(shop.fraction, 1);
  assert.ok(progress.every(p => Number.isFinite(p.fraction)));
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

test('climb: chains multiple levels in a single pass', () => {
  const cfg = LEVELS[4]; // level 5 targets
  const r = climb(1, counters({
    runs: cfg.runs, points: cfg.points, activeDays: cfg.activeDays, shopItems: cfg.shopItems,
  }));
  assert.equal(r.level, 6);
  assert.equal(r.levelsGained, 5);
  assert.deepEqual(r.clearedLevels, [1, 2, 3, 4, 5]);
  assert.equal(r.held, false);
});

test('climb: never exceeds level 12', () => {
  const r = climb(1, ALL);
  assert.equal(r.level, MAX_LEVEL);
  assert.equal(r.levelsGained, 11);
  assert.deepEqual(r.clearedLevels, [1,2,3,4,5,6,7,8,9,10,11,12]);
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

test('climb: cumulative thresholds mean counters are never consumed', () => {
  // Clearing level 1 must not deduct from the counters used for level 2.
  const cfg = LEVELS[1]; // level 2
  const c = counters({
    runs: cfg.runs, points: cfg.points, activeDays: cfg.activeDays, shopItems: cfg.shopItems,
  });
  const r = climb(1, c);
  assert.equal(r.level, 3);
  assert.deepEqual(c, counters({
    runs: cfg.runs, points: cfg.points, activeDays: cfg.activeDays, shopItems: cfg.shopItems,
  }), 'climb mutated the counters it was given');
});
