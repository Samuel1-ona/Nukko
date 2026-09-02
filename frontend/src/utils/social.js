// Nukko's social links + X (Twitter) share helpers.

export const X_HANDLE      = '@playnukko';
export const X_PROFILE_URL = 'https://x.com/playnukko';
export const GAME_URL      = 'https://www.nukko.xyz';

// Webview-safe open: MiniPay / in-app browsers sometimes return null from
// window.open, in which case navigating the current view is the fallback.
function openUrl(url) {
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) window.location.href = url;
}

export function openXProfile() {
  openUrl(X_PROFILE_URL);
}

// Fun, rotating score-brag templates. {score} and {planet} are filled in;
// every post tags the official account.
const POST_TEMPLATES = [
  (score, planet) =>
    `Just scored ${score} in NUKKO and evolved my way to ${planet} 🪐 Drop. Merge. Evolve. Can you out-stack me? 🚀 ${X_HANDLE}`,
  (score, planet) =>
    `${score} points of planetary chaos 🌌 I reached ${planet} in NUKKO — your move, cosmos 😤 ${X_HANDLE}`,
  (score, planet) =>
    `My cosmic empire just hit ${score} pts in NUKKO 🚀 Made it all the way to ${planet}! Beat that if you can 🪐 ${X_HANDLE}`,
  (score, planet) =>
    `POV: you just watched me merge planets into ${planet} for ${score} pts in NUKKO 🌠 Think you're built for the cosmos? ${X_HANDLE}`,
];

export function buildScorePost(score, planetName, rank) {
  const scoreStr = Number(score).toLocaleString();
  const planet   = planetName || 'the stars';
  const template = POST_TEMPLATES[Math.floor(Math.random() * POST_TEMPLATES.length)];
  let text = template(scoreStr, planet);
  if (rank) text += `\n\nRanked #${rank} in the cosmos ⭐`;
  return text;
}

// ── Follow-prompt gating ──────────────────────────────────────────────────────
// The occasional "follow us on X" modal: only after the player has finished a
// couple of games, at most once every few days, and never again once they
// tap Follow.

const PROMPT_LAST_KEY = 'nukko:x_prompt_last';
const PROMPT_DONE_KEY = 'nukko:x_follow_done';
const GAMES_KEY       = 'nukko:games_finished';
const PROMPT_INTERVAL = 3 * 24 * 60 * 60 * 1000; // 3 days between prompts
const MIN_GAMES       = 2;                       // let them enjoy the game first

function lsGet(key)      { try { return localStorage.getItem(key); } catch { return null; } }
function lsSet(key, val) { try { localStorage.setItem(key, val); } catch { /* private mode */ } }

export function recordGameFinished() {
  lsSet(GAMES_KEY, String((parseInt(lsGet(GAMES_KEY) ?? '0', 10) || 0) + 1));
}

export function shouldShowFollowPrompt() {
  if (lsGet(PROMPT_DONE_KEY)) return false;
  if ((parseInt(lsGet(GAMES_KEY) ?? '0', 10) || 0) < MIN_GAMES) return false;
  const last = parseInt(lsGet(PROMPT_LAST_KEY) ?? '0', 10) || 0;
  return Date.now() - last >= PROMPT_INTERVAL;
}

export function markFollowPromptShown() { lsSet(PROMPT_LAST_KEY, String(Date.now())); }
export function markFollowPromptDone()  { lsSet(PROMPT_DONE_KEY, '1'); }
