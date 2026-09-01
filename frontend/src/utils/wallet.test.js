import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickProvider, ensureChain } from './wallet.js';

const CELO = '0xa4ec';
const ADD  = { chainId: CELO, chainName: 'Celo' };

const provider = (chainId, { switchError, onCall } = {}) => ({
  calls: [],
  isMetaMask: true,
  async request({ method, params }) {
    this.calls.push(method);
    onCall?.(method, params);
    if (method === 'eth_chainId') {
      if (chainId === 'throw') throw new Error('no chain');
      return chainId;
    }
    if (method === 'wallet_switchEthereumChain' && switchError) throw switchError;
    return null;
  },
});

// ─── pickProvider ────────────────────────────────────────────

test('picks MetaMask out of several coexisting wallets', () => {
  const mm = { isMetaMask: true, tag: 'mm' };
  const cb = { isCoinbaseWallet: true, tag: 'cb' };
  const root = { ethereum: { providers: [cb, mm], tag: 'first-injected' } };
  assert.equal(pickProvider(root).tag, 'mm');
});

test('falls back to the first provider when MetaMask is absent', () => {
  const cb = { isCoinbaseWallet: true, tag: 'cb' };
  const root = { ethereum: { providers: [cb], tag: 'x' } };
  assert.equal(pickProvider(root).tag, 'cb');
});

test('uses window.ethereum directly when only one wallet is present', () => {
  const root = { ethereum: { isMetaMask: true, tag: 'solo' } };
  assert.equal(pickProvider(root).tag, 'solo');
});

test('never second-guesses MiniPay, even with a providers array', () => {
  const root = { ethereum: { isMiniPay: true, tag: 'minipay', providers: [{ isMetaMask: true, tag: 'mm' }] } };
  assert.equal(pickProvider(root, true).tag, 'minipay');
});

test('returns null when no wallet is injected', () => {
  assert.equal(pickProvider({}), null);
  assert.equal(pickProvider(null), null);
});

// ─── ensureChain ─────────────────────────────────────────────

test('does nothing when already on Celo', async () => {
  const p = provider(CELO);
  assert.equal(await ensureChain(p, CELO, ADD), 'already');
  assert.deepEqual(p.calls, ['eth_chainId']);
});

test('is case-insensitive about the chain id', async () => {
  assert.equal(await ensureChain(provider('0xA4EC'), CELO, ADD), 'already');
});

test('switches when the wallet is on the wrong chain', async () => {
  const p = provider('0x1'); // Ethereum mainnet
  assert.equal(await ensureChain(p, CELO, ADD), 'switched');
  assert.ok(p.calls.includes('wallet_switchEthereumChain'));
});

test('adds the chain when the wallet does not know Celo (4902)', async () => {
  const p = provider('0x1', { switchError: Object.assign(new Error('Unrecognized'), { code: 4902 }) });
  assert.equal(await ensureChain(p, CELO, ADD), 'added');
  assert.ok(p.calls.includes('wallet_addEthereumChain'));
});

test('handles 4902 nested in MetaMask\'s wrapped error shape', async () => {
  const err = Object.assign(new Error('Unrecognized chain'), { data: { originalError: { code: 4902 } } });
  const p = provider('0x1', { switchError: err });
  assert.equal(await ensureChain(p, CELO, ADD), 'added');
});

test('a rejected switch gives an instruction, not a raw wallet error', async () => {
  const p = provider('0x1', { switchError: Object.assign(new Error('User rejected'), { code: 4001 }) });
  await assert.rejects(() => ensureChain(p, CELO, ADD), /Switch to the Celo network to play/);
});

test('an unknown switch failure propagates rather than being swallowed', async () => {
  const p = provider('0x1', { switchError: Object.assign(new Error('boom'), { code: -32000 }) });
  await assert.rejects(() => ensureChain(p, CELO, ADD), /boom/);
});

test('skips entirely inside MiniPay, which has no switch RPCs', async () => {
  const p = provider('0x1');
  assert.equal(await ensureChain(p, CELO, ADD, { skip: true }), 'skipped');
  assert.deepEqual(p.calls, []);
});

test('a provider that cannot report its chain is left alone', async () => {
  const p = provider('throw');
  assert.equal(await ensureChain(p, CELO, ADD), 'skipped');
});
