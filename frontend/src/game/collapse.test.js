import { test } from 'node:test';
import assert from 'node:assert/strict';
import { breachOutcome, COLLAPSE_LIMIT } from './collapse.js';

test('a run is allowed exactly three time slashes', () => {
  assert.equal(COLLAPSE_LIMIT, 3);
});

test('the first three breaches cost time and are survivable', () => {
  assert.deepEqual(breachOutcome(0), { fatal: false, collapses: 1, breachesLeft: 2 });
  assert.deepEqual(breachOutcome(1), { fatal: false, collapses: 2, breachesLeft: 1 });
  assert.deepEqual(breachOutcome(2), { fatal: false, collapses: 3, breachesLeft: 0 });
});

test('the fourth breach ends the run and spends nothing', () => {
  const out = breachOutcome(3);
  assert.equal(out.fatal, true);
  assert.equal(out.breachesLeft, 0);
  // The count must not climb past the limit — a fatal breach is not a collapse,
  // so run stats (and the noCollapse/survive challenges) stay coherent.
  assert.equal(out.collapses, 3);
});

test('a count already past the limit stays fatal', () => {
  for (const n of [4, 9, 100]) {
    assert.equal(breachOutcome(n).fatal, true, `${n} collapses should be fatal`);
  }
});

test('the limit is configurable and respected', () => {
  assert.deepEqual(breachOutcome(0, 1), { fatal: false, collapses: 1, breachesLeft: 0 });
  assert.equal(breachOutcome(1, 1).fatal, true);
  assert.equal(breachOutcome(0, 0).fatal, true, 'a zero budget is fatal immediately');
});

test('malformed counts are treated as a fresh run, not as fatal', () => {
  for (const v of [null, undefined, NaN, -3, '']) {
    assert.deepEqual(
      breachOutcome(v),
      { fatal: false, collapses: 1, breachesLeft: 2 },
      `${String(v)} should behave like 0 collapses`,
    );
  }
});
