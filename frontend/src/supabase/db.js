import { api } from './client.js';

// ─── Players ─────────────────────────────────────────────────

export async function getOrCreatePlayer(walletAddress) {
  return api('/api/players', {
    method: 'POST',
    body: JSON.stringify({ wallet: walletAddress }),
  });
}

export async function updatePlayerUsername(walletAddress, username) {
  return api(`/api/players/${walletAddress}/username`, {
    method: 'PATCH',
    body: JSON.stringify({ username }),
  });
}

// ─── Inventory ───────────────────────────────────────────────

export async function getInventory(walletAddress) {
  return api(`/api/inventory/${walletAddress}`);
}

export async function updateInventory(walletAddress, fields) {
  return api(`/api/inventory/${walletAddress}`, {
    method: 'PATCH',
    body: JSON.stringify(fields),
  });
}

export async function getLadderStandings(limit = 25) {
  return api(`/api/ladder/leaderboard?limit=${limit}`);
}

// ─── Purchases ───────────────────────────────────────────────

export async function recordPurchase({ walletAddress, txHash, itemType, packageIndex, token, amount }) {
  return api('/api/purchases', {
    method: 'POST',
    body: JSON.stringify({ wallet: walletAddress, txHash, itemType, packageIndex, token, amount }),
  });
}

export async function getPurchaseHistory(walletAddress, limit = 50) {
  return api(`/api/purchases/${walletAddress}?limit=${limit}`);
}

// ─── Game Sessions ───────────────────────────────────────────

export async function saveGameSession({ walletAddress, score, durationSeconds, merges, powerUpsUsed }) {
  return api('/api/sessions', {
    method: 'POST',
    body: JSON.stringify({ wallet: walletAddress, score, durationSeconds, merges, powerUpsUsed }),
  });
}

export async function getPlayerSessions(walletAddress, limit = 20) {
  return api(`/api/sessions/${walletAddress}?limit=${limit}`);
}

// ─── Leaderboard ─────────────────────────────────────────────

export async function getLeaderboard(limit = 50) {
  return api(`/api/leaderboard?limit=${limit}`);
}

export async function addLeaderboardEntry({ walletAddress, username, score }) {
  return api('/api/leaderboard', {
    method: 'POST',
    body: JSON.stringify({ wallet: walletAddress, username, score }),
  });
}
