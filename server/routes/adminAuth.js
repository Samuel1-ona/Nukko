// Admin authentication by wallet signature.
//
// The admin page is gated on ONE address. A client-side check of
// `address === ADMIN` would be worthless — anyone can curl the API — so the
// caller must prove control of the wallet: the server issues a nonce, the
// wallet signs it, and the server verifies the signature before handing back
// a short-lived session token.

import { randomBytes } from 'node:crypto';
import { publicClient } from '../chain/client.js';

// Only these addresses may open the admin surface.
export const ADMIN_WALLETS = (
  process.env.ADMIN_WALLETS || '0xe1a0F916e859624D4edbadA23E4382D327EAf626'
)
  .split(',')
  .map(a => a.trim().toLowerCase())
  .filter(Boolean);

// Optional break-glass for when the wallet is unavailable. Unset by default:
// while it is unset, the wallet signature is the ONLY way in.
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || null;

const NONCE_TTL_MS   = 5 * 60_000;
const SESSION_TTL_MS = 2 * 60 * 60_000;

const nonces   = new Map();  // nonce -> expiry
const sessions = new Map();  // token -> { address, expiry }

function sweep(map) {
  const now = Date.now();
  for (const [k, v] of map) {
    if ((typeof v === 'number' ? v : v.expiry) < now) map.delete(k);
  }
}

export function isAdminWallet(address) {
  return Boolean(address) && ADMIN_WALLETS.includes(address.toLowerCase());
}

export function issueNonce() {
  sweep(nonces);
  const nonce = randomBytes(16).toString('hex');
  nonces.set(nonce, Date.now() + NONCE_TTL_MS);
  return {
    nonce,
    // Signed verbatim. Human-readable so the wallet prompt says what it is for.
    message:
      `Nukko admin sign-in\n\n` +
      `This signature proves you control this wallet.\n` +
      `It costs nothing and sends no transaction.\n\n` +
      `Nonce: ${nonce}`,
    expiresIn: NONCE_TTL_MS / 1000,
  };
}

/**
 * Verify a signed nonce and open a session.
 * @returns {{ ok: true, token: string, expiresIn: number } | { ok: false, error: string }}
 */
export async function verifySignature({ address, nonce, signature, message }) {
  if (!address || !nonce || !signature) return { ok: false, error: 'address, nonce and signature are required' };

  if (!isAdminWallet(address)) {
    // Same message either way — never reveal which addresses are admins.
    return { ok: false, error: 'This wallet does not have admin access' };
  }

  sweep(nonces);
  if (!nonces.has(nonce)) return { ok: false, error: 'Nonce expired or already used — try again' };

  // Rebuild the expected message rather than trusting the client's copy, so a
  // caller cannot get a signature over text of their own choosing accepted.
  const expected = `Nukko admin sign-in\n\n` +
    `This signature proves you control this wallet.\n` +
    `It costs nothing and sends no transaction.\n\n` +
    `Nonce: ${nonce}`;

  if (message && message !== expected) return { ok: false, error: 'Message mismatch' };

  let valid = false;
  try {
    // Goes through publicClient so smart-contract wallets (ERC-1271) verify
    // as well as plain EOAs — MiniPay accounts are not always EOAs.
    valid = await publicClient.verifyMessage({ address, message: expected, signature });
  } catch (err) {
    return { ok: false, error: `Signature check failed: ${err.shortMessage || err.message}` };
  }

  if (!valid) return { ok: false, error: 'Invalid signature' };

  // Single use: consume the nonce so a captured signature cannot be replayed.
  nonces.delete(nonce);

  sweep(sessions);
  const token = randomBytes(32).toString('hex');
  sessions.set(token, { address: address.toLowerCase(), expiry: Date.now() + SESSION_TTL_MS });

  return { ok: true, token, expiresIn: SESSION_TTL_MS / 1000, address };
}

/** Express middleware — accepts a signature session, or the break-glass token if configured. */
export function requireAdmin(req, res, next) {
  const header = req.get('authorization') || '';
  const token  = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  sweep(sessions);
  const session = sessions.get(token);
  if (session) {
    req.adminAddress = session.address;
    return next();
  }

  if (ADMIN_TOKEN && token === ADMIN_TOKEN) {
    req.adminAddress = 'break-glass-token';
    return next();
  }

  return res.status(401).json({ error: 'Session expired — sign in again' });
}
