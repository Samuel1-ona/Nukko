/**
 * Danger-line breach outcomes. Pure so the rule can be unit-tested without
 * standing up matter-js and a canvas — the rest of the collapse handling in
 * useGame is physics and FX, but *this* is the part that decides a run.
 */

/** Time slashes a run is allowed. The breach after the last one is fatal. */
export const COLLAPSE_LIMIT = 3;

/**
 * Decide what a confirmed breach does, given how many collapses the run has
 * already spent.
 *
 * @param {number} collapses  collapses already suffered this run
 * @param {number} [limit]    slashes allowed before a breach turns fatal
 * @returns {{fatal: boolean, collapses: number, breachesLeft: number}}
 *   `fatal` ends the run and leaves the board and clock untouched; otherwise
 *   `collapses` is the new count and `breachesLeft` is what remains after it.
 */
export function breachOutcome(collapses, limit = COLLAPSE_LIMIT) {
  const spent = Math.max(0, Math.floor(collapses) || 0);
  if (spent >= limit) {
    return { fatal: true, collapses: spent, breachesLeft: 0 };
  }
  const next = spent + 1;
  return { fatal: false, collapses: next, breachesLeft: limit - next };
}
