// Injected-wallet helpers, deliberately free of import.meta.env so they can be
// unit-tested under plain node. Everything here takes what it needs as an
// argument rather than reaching for module-level config.

/**
 * Pick the injected provider to talk to.
 *
 * With several wallet extensions installed, `window.ethereum` is whichever one
 * won the race to inject, so a user clicking "MetaMask" could be handed Brave
 * or Coinbase. When wallets coexist they expose `window.ethereum.providers`.
 * MiniPay is always its own provider and must never be second-guessed.
 */
export function pickProvider(root, inMiniPay = false) {
  const eth = root?.ethereum;
  if (!eth) return null;
  if (inMiniPay) return eth;

  if (Array.isArray(eth.providers) && eth.providers.length) {
    return eth.providers.find(p => p.isMetaMask) ?? eth.providers[0];
  }
  return eth;
}

/**
 * Make sure the wallet is on the target chain.
 *
 * Without this, a MetaMask sitting on Ethereum fails at the first transaction
 * with viem's "current chain of the wallet does not match the target chain",
 * which reads like a bug in the game rather than a network to switch.
 *
 * @returns {'already'|'switched'|'added'|'skipped'}
 */
export async function ensureChain(provider, chainIdHex, addParams, { skip = false } = {}) {
  // MiniPay is Celo-only and does not implement the switch RPCs.
  if (skip) return 'skipped';

  let current;
  try {
    current = await provider.request({ method: 'eth_chainId' });
  } catch {
    return 'skipped'; // provider can't report a chain — let the tx layer surface it
  }
  if (current?.toLowerCase() === chainIdHex.toLowerCase()) return 'already';

  try {
    await provider.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: chainIdHex }],
    });
    return 'switched';
  } catch (err) {
    // 4902 = chain unknown to the wallet; add it, which also selects it.
    const code = err?.code ?? err?.data?.originalError?.code;
    if (code === 4902) {
      await provider.request({ method: 'wallet_addEthereumChain', params: [addParams] });
      return 'added';
    }
    if (code === 4001) throw new Error('Switch to the Celo network to play.');
    throw err;
  }
}
