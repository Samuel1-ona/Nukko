import { useState, useEffect, useCallback } from 'react';
import { api } from '../../supabase/client.js';
import { isMiniPay } from '../../utils/miniPay.js';

const PURPLE = '#7b2fff';
const GOLD   = '#ffd700';
const GREEN  = '#2ecc71';
const RED    = '#ff5c5c';
const SESSION_KEY = 'nk_admin_session';

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    return s.expiry > Date.now() ? s : null;
  } catch { return null; }
}

/**
 * Sign the server's nonce. MiniPay and injected wallets both understand
 * personal_sign; the viem client is preferred when one is connected.
 */
async function signMessage(walletClient, address, message) {
  if (walletClient?.signMessage) {
    return walletClient.signMessage({ account: address, message });
  }
  if (window.ethereum?.request) {
    return window.ethereum.request({ method: 'personal_sign', params: [message, address] });
  }
  throw new Error('No wallet available to sign with');
}

const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '');
const date  = (d) => (d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }) : '');

const label = { fontFamily: '"Nunito", system-ui', fontSize: 9, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' };
const input = { width: '100%', padding: '10px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontFamily: '"Space Mono", monospace', fontSize: 12, outline: 'none' };
const card  = { borderRadius: 16, padding: '14px 16px', marginBottom: 12, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' };

function Button({ children, onClick, disabled, tone = 'primary', small }) {
  const bg = tone === 'primary' ? `linear-gradient(135deg, ${PURPLE}, #a855f7)` : 'rgba(255,255,255,0.06)';
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding: small ? '7px 12px' : '11px 16px', borderRadius: 10,
        background: disabled ? 'rgba(255,255,255,0.06)' : bg,
        border: tone === 'primary' ? 'none' : '1px solid rgba(255,255,255,0.14)',
        color: tone === 'primary' && !disabled ? '#fff' : 'rgba(255,255,255,0.65)',
        fontFamily: '"Nunito", system-ui', fontSize: small ? 10.5 : 12, fontWeight: 800,
        cursor: disabled ? 'not-allowed' : 'pointer', WebkitTapHighlightColor: 'transparent',
      }}
    >
      {children}
    </button>
  );
}

export default function Admin({ onExit, address, walletClient, onConnect }) {
  const [session, setSession] = useState(() => readSession());
  const [authed,  setAuthed]  = useState(false);
  const [signing, setSigning] = useState(false);
  const [pool,    setPool]    = useState(null);
  // What the SERVER says it will accept. A hardcoded list here funds a level
  // the server rejects the moment the cash whitelist changes underneath it.
  const [fundable, setFundable] = useState([]);
  const [grants,  setGrants]  = useState(null);
  const [summary, setSummary] = useState(null);
  const [msg,     setMsg]     = useState(null);
  const [err,     setErr]     = useState(null);
  const [busy,    setBusy]    = useState(false);

  // Add-links form
  const [level,  setLevel]  = useState(4);
  const [amount, setAmount] = useState('0.50');
  const [tok,    setTok]    = useState('USDT');
  const [links,  setLinks]  = useState('');

  const auth = useCallback((path, options = {}) => api(path, {
    ...options,
    headers: { Authorization: `Bearer ${session?.token}`, ...options.headers },
  }), [session]);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const [p, g, s] = await Promise.all([
        auth('/api/admin/pool'),
        auth('/api/admin/grants'),
        auth('/api/admin/summary'),
      ]);
      setPool(p.pool); setFundable(p.fundable ?? []); setGrants(g); setSummary(s);
      setAuthed(true);
    } catch (e) {
      setAuthed(false);
      setErr(e.message);
    }
  }, [auth]);

  useEffect(() => { if (session?.token) load(); /* eslint-disable-next-line */ }, [session]);

  // ── Sign in: prove control of the admin wallet ─────────────
  const signIn = async () => {
    setSigning(true); setErr(null);
    try {
      const { nonce, message } = await api('/api/admin/nonce');
      const signature = await signMessage(walletClient, address, message);

      const res = await api('/api/admin/verify', {
        method: 'POST',
        body: JSON.stringify({ address, nonce, signature, message }),
      });

      const next = { token: res.token, expiry: Date.now() + res.expiresIn * 1000 };
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
      setSession(next);
    } catch (e) {
      setErr(e.message?.includes('User rejected') ? 'Signature rejected' : e.message);
    } finally {
      setSigning(false);
    }
  };

  const signOut = () => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setAuthed(false);
  };

  const addLinks = async () => {
    setBusy(true); setMsg(null); setErr(null);
    try {
      const list = links.split('\n').map(s => s.trim()).filter(Boolean);
      const res = await auth('/api/admin/cash-links', {
        method: 'POST',
        body: JSON.stringify({ level: Number(level), amount, token: tok, links: list }),
      });
      setMsg(`Added ${res.added} link${res.added === 1 ? '' : 's'} to level ${level}${res.duplicates ? ` · ${res.duplicates} duplicate(s) skipped` : ''}`);
      setLinks('');
      load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  const settle = async (id) => {
    setBusy(true); setMsg(null); setErr(null);
    try {
      const res = await auth(`/api/admin/grants/${id}/settle`, { method: 'POST' });
      setMsg(res.ok ? 'Settled — cash link issued' : `Not settled: ${res.reason ?? 'unknown'}`);
      load();
    } catch (e) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };

  // ── Wallet gate ────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ position: 'absolute', inset: 0, background: '#0a0015', padding: 24, overflowY: 'auto' }}>
        <div style={{ maxWidth: 420, margin: '60px auto 0' }}>
          <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 900, fontSize: 20, color: '#fff', marginBottom: 6 }}>
            Nukko Admin
          </div>
          <div style={{ ...label, marginBottom: 22 }}>Cash link pool &amp; payouts</div>

          <div style={{ ...card, marginBottom: 16 }}>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 11.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.7,
            }}>
              This page is restricted to one wallet. Signing proves you control it —
              it costs nothing and sends no transaction.
            </div>
          </div>

          {address && (
            <div style={{ ...card, marginBottom: 16 }}>
              <div style={{ ...label, marginBottom: 4 }}>Connected</div>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: '#fff' }}>
                {short(address)}
              </div>
            </div>
          )}

          {err && (
            <div style={{ ...card, borderColor: `${RED}44`, background: `${RED}10`, marginBottom: 16,
                          fontFamily: '"Nunito", system-ui', fontSize: 11.5, color: RED }}>
              {err}
            </div>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {!address ? (
              <Button onClick={onConnect}>Connect wallet</Button>
            ) : (
              <Button onClick={signIn} disabled={signing}>
                {signing ? 'Check your wallet…' : 'Sign in'}
              </Button>
            )}
            <Button onClick={onExit} tone="ghost">Back to game</Button>
          </div>

          {isMiniPay() && (
            <div style={{
              marginTop: 14, fontFamily: '"Nunito", system-ui', fontSize: 10.5,
              color: 'rgba(255,255,255,0.35)', lineHeight: 1.6,
            }}>
              In MiniPay, approve the signature prompt when it appears.
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Dashboard ──────────────────────────────────────────────
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015', overflowY: 'auto' }}>
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 18px 60px' }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 900, fontSize: 18, color: '#fff' }}>
              Nukko Admin
            </div>
            <div style={label}>Cash link pool &amp; payouts</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <Button onClick={signOut} tone="ghost" small>Sign out</Button>
            <Button onClick={onExit} tone="ghost" small>Back to game</Button>
          </div>
        </div>

        {msg && <div style={{ ...card, borderColor: `${GREEN}44`, background: `${GREEN}10`, fontFamily: '"Nunito", system-ui', fontSize: 11.5, color: GREEN }}>{msg}</div>}
        {err && <div style={{ ...card, borderColor: `${RED}44`,   background: `${RED}10`,   fontFamily: '"Nunito", system-ui', fontSize: 11.5, color: RED }}>{err}</div>}

        {/* ── Pool ─────────────────────────────────────────── */}
        <div style={{ ...label, marginBottom: 8 }}>Pool remaining</div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
          {(pool ?? []).map(p => (
            <div key={p.level} style={{ ...card, flex: 1, marginBottom: 0, textAlign: 'center' }}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 22, fontWeight: 700, color: p.available === 0 ? RED : GOLD }}>
                {p.available}
              </div>
              <div style={{ ...label, fontSize: 8.5 }}>L{p.level} available</div>
              <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 9.5, color: 'rgba(255,255,255,0.35)', marginTop: 4 }}>
                {p.assigned} used · ${p.expected?.amount} {p.expected?.token}
              </div>
            </div>
          ))}
        </div>

        {/* ── Add links ────────────────────────────────────── */}
        <div style={card}>
          <div style={{ ...label, marginBottom: 10 }}>Load cash links</div>
          <div style={{
            fontFamily: '"Nunito", system-ui', fontSize: 10.5, color: 'rgba(255,255,255,0.45)',
            lineHeight: 1.6, marginBottom: 12,
          }}>
            Create the links by hand in MiniPay first, then paste them here — one per line. The game never
            generates a link, so it can never pay out money that was not already funded. Links are never
            shown again once loaded.
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
            <div style={{ flex: 1 }}>
              <div style={{ ...label, marginBottom: 5 }}>Level</div>
              <select value={level} onChange={e => setLevel(e.target.value)} style={input}>
                {fundable.map((lv) => {
                  const badge = (pool ?? []).find(p => p.level === lv)?.badge;
                  return <option key={lv} value={lv}>{badge ? `${lv} — ${badge}` : lv}</option>;
                })}
              </select>
            </div>
            <div style={{ width: 90 }}>
              <div style={{ ...label, marginBottom: 5 }}>Amount</div>
              <input value={amount} onChange={e => setAmount(e.target.value)} style={input} />
            </div>
            <div style={{ width: 90 }}>
              <div style={{ ...label, marginBottom: 5 }}>Token</div>
              <select value={tok} onChange={e => setTok(e.target.value)} style={input}>
                <option>USDT</option><option>USDC</option><option>USDm</option>
              </select>
            </div>
          </div>

          <div style={{ ...label, marginBottom: 5 }}>Cash link URLs — one per line</div>
          <textarea value={links} onChange={e => setLinks(e.target.value)} rows={5}
            placeholder={'https://…\nhttps://…'}
            style={{ ...input, resize: 'vertical', marginBottom: 10 }} />

          <Button onClick={addLinks} disabled={busy || !links.trim()}>
            {busy ? 'Adding…' : 'Add to pool'}
          </Button>
        </div>

        {/* ── Owed ─────────────────────────────────────────── */}
        <div style={{ ...label, marginTop: 20, marginBottom: 8 }}>
          Owed — reached a milestone, not yet paid ({grants?.owed?.length ?? 0})
        </div>
        {!grants?.owed?.length && (
          <div style={{ ...card, fontFamily: '"Nunito", system-ui', fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>
            Nothing owed.
          </div>
        )}
        {(grants?.owed ?? []).map(g => (
          <div key={g.id} style={{ ...card, borderColor: `${RED}33`, background: `${RED}0d`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: '#fff' }}>{short(g.wallet)}</div>
              <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>
                L{g.level} {g.badge} · ${g.expected?.amount} {g.expected?.token} · {date(g.grantedAt)}
              </div>
            </div>
            <Button onClick={() => settle(g.id)} disabled={busy} small>Settle</Button>
          </div>
        ))}

        {/* ── Paid ─────────────────────────────────────────── */}
        <div style={{ ...label, marginTop: 20, marginBottom: 8 }}>
          Paid ({grants?.paid?.length ?? 0})
        </div>
        {!grants?.paid?.length && (
          <div style={{ ...card, fontFamily: '"Nunito", system-ui', fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>
            No cash milestones paid yet.
          </div>
        )}
        {(grants?.paid ?? []).map(g => (
          <div key={g.id} style={{ ...card, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
              {short(g.wallet)}
            </div>
            <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 10, color: GREEN }}>
              L{g.level} · ${g.expected?.amount} {g.expected?.token} · paid {date(g.settledAt)}
            </div>
          </div>
        ))}

        {/* ── Population ───────────────────────────────────── */}
        <div style={{ ...label, marginTop: 20, marginBottom: 8 }}>
          Ladder population ({summary?.totalPlayers ?? 0} players)
        </div>
        <div style={card}>
          {(summary?.byLevel ?? []).map(l => (
            <div key={l.level} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
              <span style={{ fontFamily: '"Nunito", system-ui', fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>
                L{l.level} {l.badge}
              </span>
              <span style={{ fontFamily: '"Space Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>
                {l.players} here · {l.everReached} ever
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
