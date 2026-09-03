import { createPublicClient, http, fallback } from 'viem';
import { celo } from 'viem/chains';

export const CHAIN = celo;

// Public Celo endpoint, kept as a backstop behind the keyed provider.
// Every read on this client gates the home screen — getProfile is the only
// thing that moves a connected player off the connect screen — so a rate
// limited, expired, or throttled key must not be able to take the app down.
const PUBLIC_RPC = 'https://forno.celo.org';

const endpoints = [import.meta.env.VITE_RPC_URL, PUBLIC_RPC].filter(Boolean);

// Singleton read-only client — safe to import anywhere
export const publicClient = createPublicClient({
  chain: CHAIN,
  transport: fallback(
    endpoints.map((url, i) => http(url, {
      // No retries on the keyed endpoint: a 429 or an expired key will not
      // recover on a second attempt, and viem treats 429 as retryable, so
      // retrying there only adds seconds before the working fallback is used.
      retryCount: i === 0 ? 0 : 2,
      timeout: 10_000,
    })),
    // Strict order: keyed provider first, public fallback second.
    { rank: false },
  ),
});
