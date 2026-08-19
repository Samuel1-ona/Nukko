// Pure progression maths + content tables. No React, no storage, no network —
// everything here is deterministic so it can be unit-tested and reused.

import { PLANET_DATA } from '../components/ui/Planet.jsx';

export const TOTAL_STAGES = PLANET_DATA.length; // 14

// ── Rank ─────────────────────────────────────────────────────────────────────
// XP curve is xp = 50 * (level - 1)^2, so levels come fast early and stretch
// out later. Rank is *status only* — it grants no gameplay advantage, because
// the moment time-invested becomes power the leaderboard stops measuring skill.
export function levelFromXp(xp) {
  return Math.floor(Math.sqrt(Math.max(0, xp) / 50)) + 1;
}

export function xpForLevel(level) {
  return 50 * Math.pow(Math.max(1, level) - 1, 2);
}

/** Progress through the current level, 0..1, plus the raw xp bounds. */
export function levelProgress(xp) {
  const level = levelFromXp(xp);
  const floor = xpForLevel(level);
  const next  = xpForLevel(level + 1);
  return {
    level,
    floor,
    next,
    into: xp - floor,
    needed: next - floor,
    pct: Math.min(1, (xp - floor) / Math.max(1, next - floor)),
  };
}

const TITLES = [
  { level: 1,  title: 'Dust Drifter' },
  { level: 3,  title: 'Pebble Hauler' },
  { level: 6,  title: 'Comet Chaser' },
  { level: 10, title: 'Moon Shepherd' },
  { level: 15, title: 'Ring Warden' },
  { level: 21, title: 'Giant Tamer' },
  { level: 28, title: 'Dwarf Kindler' },
  { level: 36, title: 'Star Forger' },
  { level: 45, title: 'Pulsar Rider' },
  { level: 55, title: 'Void Walker' },
  { level: 70, title: 'Singularity' },
];

export function titleForLevel(level) {
  let out = TITLES[0].title;
  for (const t of TITLES) if (level >= t.level) out = t.title;
  return out;
}

/** XP earned from a finished run. */
export function xpForRun({ score = 0, merges = 0, discoveries = 0 }) {
  return Math.floor(score / 100) + merges * 2 + discoveries * 50;
}

// ── Daily challenges ─────────────────────────────────────────────────────────
// Drawn deterministically from the date so every player gets the same three on
// the same day — that makes them shareable and comparable without a backend.
export const CHALLENGE_POOL = [
  { id: 'score6k',    label: 'Score 6,000 in one run',      test: (r) => r.score >= 6000 },
  { id: 'score10k',   label: 'Score 10,000 in one run',     test: (r) => r.score >= 10000 },
  { id: 'chain3',     label: 'Reach a ×3 chain',            test: (r) => r.maxChain >= 3 },
  { id: 'chain4',     label: 'Reach a ×4 chain',            test: (r) => r.maxChain >= 4 },
  { id: 'merges30',   label: 'Merge 30 times in one run',   test: (r) => r.merges >= 30 },
  { id: 'merges50',   label: 'Merge 50 times in one run',   test: (r) => r.merges >= 50 },
  { id: 'noCollapse', label: 'Finish a run with no collapse', test: (r) => r.collapses === 0 && r.merges >= 5 },
  { id: 'ocean2',     label: 'Make 2 Ocean Planets',        test: (r) => (r.mergesByStage?.[8] ?? 0) >= 2 },
  { id: 'ringed1',    label: 'Make a Ringed Planet',        test: (r) => (r.mergesByStage?.[9] ?? 0) >= 1 },
  { id: 'gas1',       label: 'Make a Gas Giant',            test: (r) => (r.mergesByStage?.[10] ?? 0) >= 1 },
  { id: 'moon5',      label: 'Make 5 Moons',                test: (r) => (r.mergesByStage?.[5] ?? 0) >= 5 },
  { id: 'discover',   label: 'Discover a new planet',       test: (r) => r.discoveries >= 1 },
  { id: 'survive',    label: 'Survive a collapse and keep going', test: (r) => r.collapses >= 1 && r.merges >= 10 },
];

export const CHALLENGE_XP = 40;

export function todayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Three challenges for a given day, identical for every player. */
export function dailyChallenges(dayKey = todayKey()) {
  const picked = [];
  let h = hashString(dayKey);
  while (picked.length < 3) {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    const c = CHALLENGE_POOL[h % CHALLENGE_POOL.length];
    if (!picked.some(p => p.id === c.id)) picked.push(c);
  }
  return picked;
}

// ── Streaks ──────────────────────────────────────────────────────────────────
export function nextStreak(prevStreak, lastDay, today = todayKey()) {
  if (!lastDay) return 1;
  if (lastDay === today) return Math.max(1, prevStreak);
  const y = new Date(today + 'T00:00:00');
  y.setDate(y.getDate() - 1);
  const yesterday = todayKey(y);
  return lastDay === yesterday ? prevStreak + 1 : 1;
}

/** True when the stored streak is already broken as of today. */
export function isStreakBroken(lastDay, today = todayKey()) {
  if (!lastDay) return false;
  if (lastDay === today) return false;
  const y = new Date(today + 'T00:00:00');
  y.setDate(y.getDate() - 1);
  return lastDay !== todayKey(y);
}
