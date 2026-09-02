// Pure ladder arithmetic — no database, no I/O, no clock of its own.
// Everything here is a function of its arguments so the demotion maths
// and the multi-level chaining can be unit-tested directly.

import { LEVELS, MAX_LEVEL, OBJECTIVE_KEYS, levelConfig, targetsFor } from './levels.js';

const DAY_MS  = 86_400_000;
const WEEK_MS = 7 * DAY_MS;

// ─── Week anchoring ──────────────────────────────────────────
// Anchored to Monday 00:00 UTC. Never local time: players in different
// timezones must roll over at the same instant.

export function weekStartOf(date = new Date()) {
  const d = new Date(date);
  const mondayOffset = (d.getUTCDay() + 6) % 7; // Sun=6, Mon=0
  return new Date(Date.UTC(
    d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - mondayOffset,
  ));
}

// 'YYYY-MM-DD' — the storage form (a DATE column).
export function weekKey(date = new Date()) {
  return weekStartOf(date).toISOString().slice(0, 10);
}

// Whole weeks between two Monday-anchored week keys. Negative if b < a.
export function weeksBetween(aKey, bKey) {
  const a = new Date(`${aKey}T00:00:00Z`).getTime();
  const b = new Date(`${bKey}T00:00:00Z`).getTime();
  return Math.round((b - a) / WEEK_MS);
}

// ─── Objectives ──────────────────────────────────────────────

// A zero target is already met — and never divides by zero downstream.
export function meetsObjective(value, target) {
  if (target <= 0) return true;
  return (value ?? 0) >= target;
}

export function clearsLevel(counters, level) {
  const targets = targetsFor(level);
  return OBJECTIVE_KEYS.every(k => meetsObjective(counters[k], targets[k]));
}

// Per-objective progress for the UI. `fraction` is clamped to 0..1 and is
// 1 for a zero target (already met), so no caller can divide by zero.
export function objectiveProgress(counters, level) {
  const cfg = levelConfig(level);
  return OBJECTIVE_KEYS.map((key) => {
    const target = cfg[key];
    const value  = counters[key] ?? 0;
    const met    = meetsObjective(value, target);
    return {
      key,
      value,
      target,
      met,
      fraction: target <= 0 ? 1 : Math.min(1, value / target),
    };
  });
}

// ─── Climb ───────────────────────────────────────────────────
// Clearing card N grants level N's reward and moves the player to N+1.
// Card 12 cleared is a HOLD: there is no level 13, so the player stays
// at 12 and is protected from Monday's drop.

export function climb(startLevel, counters) {
  let level = startLevel;
  const clearedLevels = [];
  let held = false;

  while (clearsLevel(counters, level)) {
    clearedLevels.push(level);
    if (level === MAX_LEVEL) { held = true; break; }
    level += 1;
  }

  return {
    level,
    levelsGained: level - startLevel,
    held,
    clearedLevels,
  };
}

// ─── Rollover ────────────────────────────────────────────────
// Applied lazily on read, never by a cron job: compare the stored week
// against the current one and settle every week that has passed in a
// single pass.
//
// A player who gained no level last week drops one. Any advance at all —
// or holding rank at 12 — protects them. Each additional whole week of
// absence costs another level. Floored at 1.

export function applyRollover(state, currentWeek) {
  const elapsed = weeksBetween(state.weekStart, currentWeek);

  if (elapsed <= 0) {
    return { ...state, demotion: 0, rolled: false };
  }

  const wasProtected = state.levelsGainedThisWeek > 0 || state.heldRankThisWeek === true;
  const drop         = (wasProtected ? 0 : 1) + (elapsed - 1);
  const level        = Math.max(1, state.level - drop);

  return {
    level,
    highestLevel: state.highestLevel,   // ratchet: demotion never lowers it
    weekStart: currentWeek,
    levelsGainedThisWeek: 0,
    heldRankThisWeek: false,
    demotion: state.level - level,      // what was actually applied, after the floor
    rolled: true,
  };
}

// True when Monday will cost this player a level unless they advance.
export function atRiskOfDemotion(state) {
  return state.level > 1
    && state.levelsGainedThisWeek === 0
    && !state.heldRankThisWeek;
}

// ─── Load model (used by the curve sanity tests) ──────────────
// 109 s is the observed median session duration, bonus time included.
export const MEDIAN_RUN_SECONDS = 109;

export function weeklyLoad(level) {
  const cfg = levelConfig(level);
  return {
    runsPerDay:    cfg.runs / 7,
    minutesPerDay: (cfg.runs * MEDIAN_RUN_SECONDS) / 7 / 60,
    pointsPerDay:  cfg.points / 7,
    pointsPerRun:  cfg.points / cfg.runs,
  };
}

export { LEVELS, MAX_LEVEL, OBJECTIVE_KEYS, levelConfig, targetsFor };
