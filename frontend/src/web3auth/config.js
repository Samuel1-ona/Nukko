import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, WEB3AUTH_NETWORK } from '@web3auth/base';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';

// sapphire_mainnet → strict domain whitelist (configure at https://dashboard.web3auth.io)
// sapphire_devnet  → permissive, localhost allowed — use for local dev
const web3AuthNetwork =
  import.meta.env.VITE_WEB3AUTH_NETWORK === 'sapphire_mainnet'
    ? WEB3AUTH_NETWORK.SAPPHIRE_MAINNET
    : WEB3AUTH_NETWORK.SAPPHIRE_DEVNET;

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.EIP155,
  chainId: '0xa4ec', // Celo Mainnet (42220 decimal)
  rpcTarget: import.meta.env.VITE_RPC_URL ?? 'https://forno.celo.org',
  displayName: 'Celo Mainnet',
  blockExplorer: 'https://explorer.celo.org',
  ticker: 'CELO',
  tickerName: 'Celo',
};

const privateKeyProvider = new EthereumPrivateKeyProvider({
  config: { chainConfig },
});

// Singleton — initModal() is called lazily on first social connect.
// The clientId guard in useWallet.js ensures this module is never imported
// when the env var is missing, so the constructor always receives a real ID.
export const web3auth = new Web3Auth({
  clientId: import.meta.env.VITE_WEB3AUTH_CLIENT_ID,
  web3AuthNetwork,
  privateKeyProvider,
  uiConfig: {
    appName: 'Nukko',
    loginMethodsOrder: ['google', 'twitter', 'email_passwordless'],
    defaultLanguage: 'en',
    modalZIndex: '99999',
    theme: {
      primary: '#ff2e9e',
    },
  },
});
