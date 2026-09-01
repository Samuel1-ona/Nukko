import { createPublicClient, http } from 'viem';
import { celo } from 'viem/chains';

// Forno is the public Celo endpoint and needs no key — override with
// CELO_RPC_URL (e.g. the Alchemy endpoint the frontend uses) in prod.
export const RPC_URL = process.env.CELO_RPC_URL || 'https://forno.celo.org';

export const publicClient = createPublicClient({
  chain: celo,
  transport: http(RPC_URL, { batch: true, retryCount: 3 }),
});

export const NUKKO_CONTRACT =
  (process.env.NUKKO_CONTRACT_ADDRESS || '0x8c7BA50a06ECF8a3d9930d8B537B6de00439B552').toLowerCase();

export const TREASURY =
  (process.env.TREASURY_ADDRESS || '0xAF3B714fDDa5A3b4311f78ccfe0873A990819A35').toLowerCase();

// Must match frontend/src/blockchain/tokens.js
export const STABLECOINS = {
  '0x765de816845861e75a25fca122bb6898b8b1282a': { symbol: 'USDm', decimals: 18 },
  '0xceba9300f2b948710d2653dd7b07f33a8b32118c': { symbol: 'USDC', decimals: 6 },
  '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e': { symbol: 'USDT', decimals: 6 },
};

// Cheapest thing in the shop is $0.10 — anything below that is not a purchase.
export const MIN_PURCHASE_USD = 0.10;
