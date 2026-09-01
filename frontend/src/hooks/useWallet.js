import { useState, useEffect, useCallback, useRef } from 'react';
import { createWalletClient, custom } from 'viem';
import { CHAIN, publicClient } from '../blockchain/config.js';
import { isMiniPay } from '../utils/miniPay.js';
import { pickProvider as pick, ensureChain } from '../utils/wallet.js';

const CHAIN_ID_HEX = `0x${CHAIN.id.toString(16)}`; // 0xa4ec — Celo mainnet
const RECONNECT_KEY = 'nk_wallet_connected';

// Public endpoint only — never hand a keyed RPC to the user's wallet.
const PUBLIC_RPC = 'https://forno.celo.org';

const CELO_ADD_PARAMS = {
  chainId:           CHAIN_ID_HEX,
  chainName:         'Celo',
  nativeCurrency:    { name: 'CELO', symbol: 'CELO', decimals: 18 },
  rpcUrls:           [PUBLIC_RPC],
  blockExplorerUrls: ['https://celoscan.io'],
};

const pickProvider    = () => pick(typeof window !== 'undefined' ? window : null, isMiniPay());
const ensureCeloChain = (provider) =>
  ensureChain(provider, CHAIN_ID_HEX, CELO_ADD_PARAMS, { skip: isMiniPay() });

export function useWallet() {
  const [address,       setAddress]       = useState(null);
  const [walletClient,  setWalletClient]  = useState(null);
  const [error,         setError]         = useState(null);
  const [socialLoading, setSocialLoading] = useState(false);
  const [connecting,    setConnecting]    = useState(false);

  const inMiniPay   = isMiniPay();
  const providerRef = useRef(null);
  // Listeners fire outside React's render cycle, so they read the address
  // from a ref rather than a closure that may be a render behind.
  const addressRef  = useRef(null);
  useEffect(() => { addressRef.current = address; }, [address]);

  // One place that builds the client, so the account is never left off.
  const buildClient = useCallback((provider, account) => createWalletClient({
    account,                      // REQUIRED: without it every sendTransaction
    chain:     CHAIN,             // throws AccountNotFoundError, which broke
    transport: custom(provider),  // all stablecoin purchases outside MiniPay.
  }), []);

  // ── Connect via injected wallet (MiniPay / MetaMask) ─────────────────────
  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const provider = pickProvider();
      if (!provider) throw new Error('No wallet found. Open in MiniPay or install MetaMask.');
      providerRef.current = provider;

      // Always eth_requestAccounts — including in MiniPay, where it is granted
      // silently (no dialog) but establishes the session permission that the
      // payment layer checks on stablecoin transfers. A silent eth_accounts
      // read returns the address WITHOUT that grant, and purchases then fail
      // with "Permission denied [-32604]" even though gameplay txs still pass.
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      const addr = accounts?.[0];
      if (!addr) throw new Error('Wallet not connected');

      await ensureCeloChain(provider);

      setAddress(addr);
      setWalletClient(buildClient(provider, addr));
      setError(null);
      try { localStorage.setItem(RECONNECT_KEY, '1'); } catch { /* private mode */ }
    } catch (err) {
      // A dismissed wallet prompt is not an error worth shouting about.
      if (err?.code === 4001) setError('Connection cancelled.');
      else setError(err.message);
    } finally {
      setConnecting(false);
    }
  }, [buildClient]);

  // ── Connect via Web3Auth social login ─────────────────────────────────────
  // Web3Auth is dynamically imported so it is never bundled for MiniPay users.
  const connectWithSocial = useCallback(async () => {
    // Guard: VITE_WEB3AUTH_CLIENT_ID must be set in .env / Vercel env vars
    if (!import.meta.env.VITE_WEB3AUTH_CLIENT_ID) {
      setError('Social login is not configured yet. Add VITE_WEB3AUTH_CLIENT_ID to your environment.');
      return;
    }

    setSocialLoading(true);
    setError(null);
    try {
      const { web3auth } = await import('../web3auth/config.js');

      // initModal is idempotent — safe to call multiple times
      if (web3auth.status === 'not_ready') {
        await web3auth.initModal();
      }

      // connect() opens the Web3Auth modal; returns null if user closes it
      const provider = await web3auth.connect();
      if (!provider) return; // user dismissed modal

      const accounts = await provider.request({ method: 'eth_accounts' });
      const addr = accounts?.[0];
      if (!addr) throw new Error('Social login returned no account');

      providerRef.current = provider;
      setAddress(addr);
      setWalletClient(buildClient(provider, addr));
    } catch (err) {
      // Ignore user-close events; surface real errors
      if (!err.message?.includes('closed') && !err.message?.includes('User closed')) {
        setError(err.message ?? 'Social login failed');
      }
    } finally {
      setSocialLoading(false);
    }
  }, [buildClient]);

  // ── Auto-connect inside MiniPay ───────────────────────────────────────────
  // Wallet is already injected. The 1s delay lets MiniPay finish injecting
  // before we request the session grant.
  useEffect(() => {
    if (!inMiniPay) return;
    const timer = setTimeout(connect, 1000);
    return () => clearTimeout(timer);
  }, [inMiniPay, connect]);

  // ── Silent reconnect for returning browser users ──────────────────────────
  // Only when they connected before AND the wallet still has us authorised, so
  // this never raises a prompt on a first visit.
  useEffect(() => {
    if (inMiniPay) return;
    let cancelled = false;

    (async () => {
      try {
        if (localStorage.getItem(RECONNECT_KEY) !== '1') return;
        const provider = pickProvider();
        if (!provider) return;

        const accounts = await provider.request({ method: 'eth_accounts' });
        const addr = accounts?.[0];
        if (!addr || cancelled) return;

        providerRef.current = provider;
        setAddress(addr);
        setWalletClient(buildClient(provider, addr));
      } catch { /* stay disconnected — the connect button still works */ }
    })();

    return () => { cancelled = true; };
  }, [inMiniPay, buildClient]);

  // ── Track account and network changes ─────────────────────────────────────
  // Without these the app keeps signing as an account the user already left,
  // and writes land on whatever chain the wallet moved to.
  useEffect(() => {
    const provider = providerRef.current ?? pickProvider();
    if (!provider?.on) return;

    const onAccountsChanged = (accounts) => {
      const next = accounts?.[0];
      if (!next) {
        setAddress(null);
        setWalletClient(null);
        try { localStorage.removeItem(RECONNECT_KEY); } catch { /* ignore */ }
        return;
      }
      setAddress(next);
      setWalletClient(buildClient(provider, next));
    };

    const onChainChanged = (chainId) => {
      if (chainId?.toLowerCase() !== CHAIN_ID_HEX) {
        setError('Wrong network — switch back to Celo to keep playing.');
        return;
      }
      setError(null);
      // Rebuild so viem's cached chain state matches the wallet's.
      const addr = addressRef.current;
      if (addr) setWalletClient(buildClient(provider, addr));
    };

    provider.on('accountsChanged', onAccountsChanged);
    provider.on('chainChanged', onChainChanged);
    return () => {
      provider.removeListener?.('accountsChanged', onAccountsChanged);
      provider.removeListener?.('chainChanged', onChainChanged);
    };
  }, [buildClient]);

  return {
    address,
    walletClient,
    publicClient,
    isMiniPay: inMiniPay,
    connect,
    connecting,
    connectWithSocial,
    socialLoading,
    error,
  };
}
