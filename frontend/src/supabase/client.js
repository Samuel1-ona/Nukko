// An empty VITE_API_URL is meaningful: it means "same origin", which is how
// dev runs (vite proxies /api). Only a genuinely unset value falls back.
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

const RETRIES     = 3;
const RETRY_DELAY = 3000; // ms — long enough to ride out a Render cold start

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function api(path, options = {}) {
  const isWrite = options.method && options.method !== 'GET';
  let lastErr;

  for (let attempt = 0; attempt <= (isWrite ? RETRIES : 0); attempt++) {
    try {
      const res = await fetch(`${API_URL}${path}`, {
        ...options,
        // Merged AFTER the spread, or a caller passing its own headers (the
        // admin routes send Authorization) replaces the whole object and drops
        // Content-Type. express.json() then skips the body, every field reads
        // as undefined, and the route rejects a request that was actually fine.
        headers: { 'Content-Type': 'application/json', ...options.headers },
        // keepalive lets small write requests finish even if the page
        // navigates away (e.g. game-over screen change mid-request)
        keepalive: isWrite,
      });
      // A 404 from a stale deployment returns an HTML error page, and
      // res.json() then fails with "Unexpected token '<'", which hides the
      // real problem. Read the body once and decide what it actually is.
      const raw = await res.text();
      let data;
      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        const hint = res.status === 404
          ? `${path} does not exist on the API server (${API_URL}) — it is probably running an older deploy`
          : `${API_URL} returned ${res.status} ${res.statusText || ''}`.trim();
        throw new Error(hint);
      }

      if (!res.ok) {
        // Retry server errors (cold start / transient); client errors are final
        if (res.status >= 500 && attempt < RETRIES && isWrite) {
          lastErr = new Error(data.error || `API error ${res.status}`);
          await sleep(RETRY_DELAY * (attempt + 1));
          continue;
        }
        throw new Error(data.error || `API error ${res.status}`);
      }
      return data;
    } catch (err) {
      lastErr = err;
      if (!isWrite || attempt >= RETRIES) throw err;
      await sleep(RETRY_DELAY * (attempt + 1));
    }
  }
  throw lastErr;
}
