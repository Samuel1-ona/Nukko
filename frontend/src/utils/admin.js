// Who may see the admin surface.
//
// This is a VISIBILITY check only. The server enforces access for real, by
// making the wallet sign a nonce it issued (server/routes/adminAuth.js) — so
// editing this list in a browser reveals a button that still cannot read or
// write anything.
const DEFAULT_ADMINS = '0xe1a0F916e859624D4edbadA23E4382D327EAf626';

export const ADMIN_WALLETS = (import.meta.env?.VITE_ADMIN_WALLETS || DEFAULT_ADMINS)
  .split(',')
  .map(a => a.trim().toLowerCase())
  .filter(Boolean);

export function isAdminWallet(address) {
  return Boolean(address) && ADMIN_WALLETS.includes(address.toLowerCase());
}
