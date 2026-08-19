import { useState, useCallback, useEffect, useRef } from 'react';
import {
  xpForRun, levelFromXp, dailyChallenges, todayKey,
  nextStreak, isStreakBroken, CHALLENGE_XP,
} from '../game/progression.js';

// Local-only progression store. Deliberately localStorage rather than Supabase
// or on-chain: this is cosmetic/mastery state with no economic value, so it
// doesn't justify touching the backend or paying gas. Keyed per wallet so two
// accounts on one device don't share a codex.

const KEY_PREFIX = 'nk_progress_';

function storageKey(address) {
  return `${KEY_PREFIX}${address ? address.toLowerCase() : 'guest'}`;
}

function emptyState() {
  return {
    discovered: [],      // stage numbers, 1-14
    mergesByStage: {},   // lifetime merge counts per stage
    firstSeenAt: {},     // stage → ISO date
    xp: 0,
    runs: 0,
    streak: 0,
    lastPlayedDay: null,
    challengeDay: null,
    challengesDone: [],  // challenge ids completed today
  };
}

function load(address) {
  try {
    const raw = localStorage.getItem(storageKey(address));
    if (!raw) return emptyState();
    return { ...emptyState(), ...JSON.parse(raw) };
  } catch {
    return emptyState();
  }
}

function save(address, state) {
  try {
    localStorage.setItem(storageKey(address), JSON.stringify(state));
  } catch { /* quota / private mode — progression is best-effort */ }
}

export function useProgress(address) {
  const [state, setState] = useState(() => load(address));
  // Discoveries made during the current run, surfaced to the celebration overlay
  const [discovery, setDiscovery] = useState(null); // { stage, key }
  const runDiscoveriesRef = useRef([]);
  const stateRef = useRef(state);
  useEffect(() => { stateRef.current = state; }, [state]);

  // Re-load when the wallet changes (connect / disconnect / switch)
  useEffect(() => { setState(load(address)); }, [address]);

  // Persist on every change
  useEffect(() => { save(address, state); }, [address, state]);

  // Roll challenges over at midnight / on a new day
  useEffect(() => {
    const today = todayKey();
    if (state.challengeDay !== today) {
      setState(s => ({ ...s, challengeDay: today, challengesDone: [] }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.challengeDay]);

  const challenges = dailyChallenges(state.challengeDay ?? todayKey());

  /**
   * Called from the engine on every merge. Fires a discovery when new.
   *
   * Side effects (the run-discovery log and the celebration overlay) run
   * OUTSIDE the setState updater. React may invoke an updater more than once
   * for the same update — under StrictMode it always does — so an updater has
   * to stay pure or discoveries get double-counted in the XP award.
   */
  const recordMerge = useCallback((stage) => {
    const alreadyKnown = stateRef.current.discovered.includes(stage);
    const alreadyLogged = runDiscoveriesRef.current.includes(stage);
    if (!alreadyKnown && !alreadyLogged) {
      runDiscoveriesRef.current.push(stage);
      setDiscovery({ stage, key: Date.now() });
    }

    setState((s) => {
      const next = {
        ...s,
        mergesByStage: { ...s.mergesByStage, [stage]: (s.mergesByStage[stage] ?? 0) + 1 },
      };
      if (!s.discovered.includes(stage)) {
        next.discovered  = [...s.discovered, stage].sort((a, b) => a - b);
        next.firstSeenAt = { ...s.firstSeenAt, [stage]: new Date().toISOString() };
      }
      return next;
    });
  }, []);

  const clearDiscovery = useCallback(() => setDiscovery(null), []);

  const beginRun = useCallback(() => {
    runDiscoveriesRef.current = [];
    setDiscovery(null);
  }, []);

  /**
   * Settle a finished run: award XP, resolve challenges, advance the streak.
   * Returns a summary the Result screen renders.
   */
  const finishRun = useCallback((runStats) => {
    const discoveries = runDiscoveriesRef.current.length;
    const run = { ...runStats, discoveries };
    const today = todayKey();

    const prev = stateRef.current;
    const newlyDone = challenges
      .filter(c => !prev.challengesDone.includes(c.id))
      .filter(c => { try { return c.test(run); } catch { return false; } })
      .map(c => c.id);

    const gainedXp = xpForRun(run) + newlyDone.length * CHALLENGE_XP;
    const levelBefore = levelFromXp(prev.xp);
    const levelAfter  = levelFromXp(prev.xp + gainedXp);

    setState((s) => ({
      ...s,
      xp: s.xp + gainedXp,
      runs: s.runs + 1,
      streak: nextStreak(s.streak, s.lastPlayedDay, today),
      lastPlayedDay: today,
      challengeDay: today,
      challengesDone: [...new Set([...s.challengesDone, ...newlyDone])],
    }));

    return {
      gainedXp,
      discoveries,
      discoveredStages: [...runDiscoveriesRef.current],
      challengesCompleted: newlyDone,
      leveledUp: levelAfter > levelBefore,
      newLevel: levelAfter,
    };
  }, [challenges]);

  return {
    progress: state,
    challenges,
    challengesDone: state.challengesDone,
    streakBroken: isStreakBroken(state.lastPlayedDay),
    discovery,
    clearDiscovery,
    recordMerge,
    beginRun,
    finishRun,
  };
}
