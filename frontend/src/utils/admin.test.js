import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isAdminWallet, ADMIN_WALLETS } from './admin.js';

const OWNER = '0xe1a0F916e859624D4edbadA23E4382D327EAf626';

test('the owner wallet is an admin', () => {
  assert.equal(isAdminWallet(OWNER), true);
});

test('address comparison ignores checksum casing', () => {
  assert.equal(isAdminWallet(OWNER.toLowerCase()), true);
  assert.equal(isAdminWallet(OWNER.toUpperCase().replace('0X', '0x')), true);
});

test('no other wallet is an admin', () => {
  assert.equal(isAdminWallet('0x91a529efa72e2dec9bc111ef86f926771efedbce'), false);
  assert.equal(isAdminWallet('0x0000000000000000000000000000000000000000'), false);
});

test('missing or malformed addresses are not admins', () => {
  for (const v of [null, undefined, '', 0, false]) {
    assert.equal(isAdminWallet(v), false, `${String(v)} should not be an admin`);
  }
});

test('the allowlist is exactly one wallet by default', () => {
  assert.deepEqual(ADMIN_WALLETS, [OWNER.toLowerCase()]);
});
