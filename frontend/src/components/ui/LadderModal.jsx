import { useState, useEffect } from 'react';

const PURPLE = '#7b2fff';
const CYAN   = '#00d4ff';
const GOLD   = '#ffd700';
const GREEN  = '#2ecc71';
const RED    = '#ff5c5c';

const num = (n) => Number(n ?? 0).toLocaleString('en-US');

const OBJ_LABEL = {
  runs:       'Runs completed',
  points:     'Points scored',
  activeDays: 'Active days',
  shopItems:  'Shop items bought',
};

function timeLeft(iso) {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'resetting…';
  const d = Math.floor(ms / 86_400_000);
  const h = Math.floor((ms % 86_400_000) / 3_600_000);
  if (d > 0) return `${d}d ${h}h`;
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m`;
}

function rewardText(reward) {
  if (!reward) return '';
  const parts = [];
  if (reward.bombs)   parts.push(`+${reward.bombs} bomb${reward.bombs > 1 ? 's' : ''}`);
  if (reward.expands) parts.push(`+${reward.expands} expand${reward.expands > 1 ? 's' : ''}`);
  if (reward.cash)    parts.push(`$${reward.cash.amount} ${reward.cash.token}`);
  return parts.join(' · ');
}

// ── One objective with its progress bar ──────────────────────────────────────

function ObjectiveBar({ objective }) {
  const { key, value, target, met, fraction } = objective;
  const pct = Math.round(fraction * 100);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{
          fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 700,
          color: met ? GREEN : 'rgba(255,255,255,0.72)',
        }}>
          {met ? '✓ ' : ''}{OBJ_LABEL[key] ?? key}
        </span>
        <span style={{
          fontFamily: '"Space Mono", monospace', fontSize: 11, fontWeight: 700,
          color: met ? GREEN : 'rgba(255,255,255,0.5)', fontVariantNumeric: 'tabular-nums',
        }}>
          {target === 0 ? 'none needed' : `${num(Math.min(value, target))} / ${num(target)}`}
        </span>
      </div>
      <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 3,
          background: met ? GREEN : `linear-gradient(90deg, ${PURPLE}, ${CYAN})`,
          transition: 'width 400ms ease',
        }} />
      </div>
    </div>
  );
}

// ── This week's card ─────────────────────────────────────────────────────────

function CurrentCard({ ladder }) {
  const resets = timeLeft(ladder.weekEndsAt);

  return (
    <div style={{ padding: '16px 20px 4px' }}>
      {/* Badge header */}
      <div style={{
        borderRadius: 20, padding: '16px 18px', marginBottom: 14,
        background: `linear-gradient(145deg, ${PURPLE}44 0%, ${CYAN}1f 100%)`,
        border: '1px solid rgba(255,255,255,0.12)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 9, fontWeight: 800,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
            }}>
              Level {ladder.level} of {ladder.maxLevel}
            </div>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 20, fontWeight: 900,
              color: '#fff', lineHeight: 1.2, letterSpacing: '-0.01em',
            }}>
              {ladder.badge}
            </div>
          </div>
          <div style={{
            flexShrink: 0, textAlign: 'right',
            fontFamily: '"Space Mono", monospace', fontSize: 11, color: 'rgba(255,255,255,0.5)',
          }}>
            <div style={{ fontSize: 9, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.7 }}>
              Week ends
            </div>
            <div style={{ color: CYAN, fontWeight: 700 }}>{resets}</div>
          </div>
        </div>
      </div>

      {/* Demotion warning — the explicit "Monday will cost you" notice */}
      {ladder.atRisk && (
        <div style={{
          borderRadius: 14, padding: '11px 14px', marginBottom: 14,
          background: 'rgba(255,92,92,0.1)', border: `1px solid ${RED}55`,
        }}>
          <div style={{
            fontFamily: '"Nunito", system-ui', fontSize: 11.5, fontWeight: 800, color: RED, marginBottom: 3,
          }}>
            ⚠ You will drop to level {ladder.level - 1} on Monday
          </div>
          <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 11, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>
            You have not gained a level this week. Clearing this card — even once — protects your rank.
          </div>
        </div>
      )}

      {ladder.atMax && ladder.held && (
        <div style={{
          borderRadius: 14, padding: '11px 14px', marginBottom: 14,
          background: 'rgba(46,204,113,0.1)', border: `1px solid ${GREEN}55`,
        }}>
          <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 11.5, fontWeight: 800, color: GREEN }}>
            ✓ Rank held — you are at the top of the ladder
          </div>
        </div>
      )}

      {/* Objectives */}
      <div style={{
        borderRadius: 16, padding: '14px 16px 4px', marginBottom: 12,
        background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 9, fontWeight: 800, marginBottom: 12,
          letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
        }}>
          All four to clear · resets Monday
        </div>
        {(ladder.objectives ?? []).map(o => <ObjectiveBar key={o.key} objective={o} />)}
      </div>

      {/* Payout */}
      <div style={{
        borderRadius: 16, padding: '12px 16px', marginBottom: 8,
        background: ladder.currentCardPays ? `${GOLD}12` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${ladder.currentCardPays ? GOLD + '3a' : 'rgba(255,255,255,0.07)'}`,
      }}>
        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 9, fontWeight: 800,
          letterSpacing: '0.14em', textTransform: 'uppercase',
          color: ladder.currentCardPays ? GOLD : 'rgba(255,255,255,0.35)', marginBottom: 4,
        }}>
          {ladder.currentCardPays ? 'Clearing this pays' : 'Already earned'}
        </div>
        <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 700, color: '#fff' }}>
          {rewardText(ladder.reward)}
        </div>
        {!ladder.currentCardPays && (
          <div style={{ marginTop: 4, fontFamily: '"Nunito", system-ui', fontSize: 10.5, color: 'rgba(255,255,255,0.45)', lineHeight: 1.5 }}>
            You earned this rung in an earlier week. Re-clearing it restores your rank but pays nothing —
            rewards are for reaching a level the first time.
          </div>
        )}
      </div>
    </div>
  );
}

// ── The full 12-rung map ─────────────────────────────────────────────────────

const STATUS_STYLE = {
  current: { label: 'IN PROGRESS', color: CYAN,                   bg: `${CYAN}14`,  border: `${CYAN}44` },
  cleared: { label: 'CLEARED',     color: GREEN,                  bg: `${GREEN}10`, border: `${GREEN}33` },
  reclaim: { label: 'LOST — PAYS NOTHING', color: '#ffa94d',      bg: '#ffa94d10',  border: '#ffa94d33' },
  locked:  { label: 'LOCKED',      color: 'rgba(255,255,255,0.3)', bg: 'transparent', border: 'rgba(255,255,255,0.07)' },
};

function LevelRow({ level }) {
  const s = STATUS_STYLE[level.status] ?? STATUS_STYLE.locked;

  return (
    <div style={{
      borderRadius: 14, padding: '11px 14px', marginBottom: 8,
      background: s.bg, border: `1px solid ${s.border}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, minWidth: 0 }}>
          <span style={{
            fontFamily: '"Space Mono", monospace', fontSize: 12, fontWeight: 700, color: s.color,
          }}>
            {String(level.level).padStart(2, '0')}
          </span>
          <span style={{
            fontFamily: '"Nunito", system-ui', fontSize: 12.5, fontWeight: 800,
            color: level.status === 'locked' ? 'rgba(255,255,255,0.5)' : '#fff',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {level.badge}
          </span>
        </div>
        <span style={{
          flexShrink: 0, fontFamily: '"Nunito", system-ui', fontSize: 8, fontWeight: 800,
          letterSpacing: '0.12em', color: s.color,
        }}>
          {s.label}
        </span>
      </div>

      <div style={{
        fontFamily: '"Space Mono", monospace', fontSize: 10, color: 'rgba(255,255,255,0.42)',
        marginBottom: 4, fontVariantNumeric: 'tabular-nums',
      }}>
        {level.runs} runs · {num(level.points)} pts · {level.activeDays} day{level.activeDays > 1 ? 's' : ''}
        {level.shopItems > 0 ? ` · ${level.shopItems} shop` : ''}
      </div>

      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 10.5, fontWeight: 700,
        color: level.reward?.cash ? GOLD : 'rgba(255,255,255,0.55)',
      }}>
        {level.reward?.cash ? '💵 ' : '🎁 '}{rewardText(level.reward)}
        {!level.paysReward && (
          <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}> · already paid</span>
        )}
      </div>
    </div>
  );
}

function LadderMapView({ levels }) {
  if (!levels) return null;
  return (
    <div style={{ padding: '14px 20px 4px' }}>
      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 10.5, color: 'rgba(255,255,255,0.45)',
        lineHeight: 1.6, marginBottom: 14,
      }}>
        Targets are cumulative and reset every Monday 00:00 UTC. A strong week can clear several
        rungs at once — nothing is deducted when you level up.
      </div>
      {levels.map(l => <LevelRow key={l.level} level={l} />)}
    </div>
  );
}

// ── Rewards inbox ────────────────────────────────────────────────────────────

function RewardsView({ rewards }) {
  const { rewards: list, loading, claim, configured, error } = rewards;
  const [busy, setBusy] = useState(null);
  const [failed, setFailed] = useState(null);

  if (!configured) {
    return (
      <div style={{ padding: '24px 20px', fontFamily: '"Nunito", system-ui', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
        Rewards are not configured on this build.
      </div>
    );
  }

  const onClaim = async (r) => {
    setBusy(r.id); setFailed(null);
    try { await claim(r); }
    catch (err) { setFailed(err.message); }
    finally { setBusy(null); }
  };

  return (
    <div style={{ padding: '14px 20px 4px' }}>
      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 10.5, color: 'rgba(255,255,255,0.45)',
        lineHeight: 1.6, marginBottom: 14,
      }}>
        Cash milestones at levels 4, 8 and 12 pay a MiniPay cash link. Opening a link does not mark it
        claimed — confirm only once the money has landed.
      </div>

      {loading && !list.length && (
        <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Loading…</div>
      )}

      {!loading && !list.length && (
        <div style={{
          borderRadius: 14, padding: '18px 16px', textAlign: 'center',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
          fontFamily: '"Nunito", system-ui', fontSize: 12, color: 'rgba(255,255,255,0.45)',
        }}>
          No rewards yet — reach level 4 for your first cash milestone.
        </div>
      )}

      {(error || failed) && (
        <div style={{
          borderRadius: 12, padding: '10px 12px', marginBottom: 10,
          background: 'rgba(255,92,92,0.1)', border: `1px solid ${RED}44`,
          fontFamily: '"Nunito", system-ui', fontSize: 11, color: RED,
        }}>
          {failed || error}
        </div>
      )}

      {list.map((r) => (
        <div key={r.id} style={{
          borderRadius: 14, padding: '12px 14px', marginBottom: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          background: r.claimed_at ? 'rgba(255,255,255,0.03)' : `${GOLD}12`,
          border: `1px solid ${r.claimed_at ? 'rgba(255,255,255,0.07)' : GOLD + '3a'}`,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 800, color: '#fff',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {r.label}
            </div>
            <div style={{
              fontFamily: '"Space Mono", monospace', fontSize: 11, fontWeight: 700,
              color: r.claimed_at ? 'rgba(255,255,255,0.4)' : GOLD, marginTop: 2,
            }}>
              ${r.amount} {r.token}
            </div>
          </div>
          <button
            onClick={() => onClaim(r)}
            disabled={busy === r.id}
            style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 10,
              background: r.claimed_at ? 'rgba(255,255,255,0.06)' : GOLD,
              border: `1px solid ${r.claimed_at ? 'rgba(255,255,255,0.12)' : GOLD}`,
              color: r.claimed_at ? 'rgba(255,255,255,0.6)' : '#08010f',
              fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 800,
              cursor: busy === r.id ? 'wait' : 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {busy === r.id ? '…' : r.claimed_at ? 'Reopen' : 'Claim'}
          </button>
        </div>
      ))}
    </div>
  );
}

// ── Main modal ───────────────────────────────────────────────────────────────

const TABS = [
  { key: 'week',    label: 'This week' },
  { key: 'ladder',  label: 'All 12' },
  { key: 'rewards', label: 'Rewards' },
];

export default function LadderModal({ isOpen, onClose, ladder, levels, rewards }) {
  const [tab, setTab] = useState('week');

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unclaimed = rewards?.unclaimedCount ?? 0;

  return (
    <>
      <div onClick={onClose} aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 210, background: 'rgba(0,0,0,0.72)' }} />

      <div role="dialog" aria-modal="true" aria-label="Ladder"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 220,
          display: 'flex', flexDirection: 'column',
          height: '90dvh', maxHeight: '90dvh',
          background: 'linear-gradient(180deg, #110526 0%, #0a0015 100%)',
          border: '1px solid rgba(123,47,255,0.35)', borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -12px 48px rgba(123,47,255,0.25)',
          animation: 'legalSlideUp 280ms cubic-bezier(0.22,1,0.36,1) both',
        }}
      >
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 12px', flexShrink: 0,
        }}>
          <div>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontWeight: 900, fontSize: 16, color: '#fff', lineHeight: 1,
            }}>
              The Ladder
            </div>
            <div style={{
              marginTop: 3, fontFamily: '"Nunito", system-ui', fontSize: 10,
              color: 'rgba(255,255,255,0.35)', letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              12 levels · resets Monday UTC
            </div>
          </div>
          <button onClick={onClose} aria-label="Close"
            style={{
              width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: 16, lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: 6, padding: '0 20px 12px', flexShrink: 0,
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              style={{
                position: 'relative',
                flex: 1, padding: '8px 6px', borderRadius: 10,
                background: tab === t.key ? 'rgba(123,47,255,0.22)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${tab === t.key ? PURPLE + '77' : 'rgba(255,255,255,0.08)'}`,
                color: tab === t.key ? '#fff' : 'rgba(255,255,255,0.5)',
                fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 800,
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              }}
            >
              {t.label}
              {t.key === 'rewards' && unclaimed > 0 && (
                <span style={{
                  position: 'absolute', top: 2, right: 4,
                  minWidth: 15, height: 15, borderRadius: '50%', background: GOLD,
                  color: '#08010f', fontSize: 9, fontWeight: 900, lineHeight: '15px',
                }}>
                  {unclaimed}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {!ladder && tab !== 'rewards' && (
            <div style={{
              padding: '28px 20px', textAlign: 'center',
              fontFamily: '"Nunito", system-ui', fontSize: 12, color: 'rgba(255,255,255,0.4)',
            }}>
              Loading your ladder…
            </div>
          )}
          {ladder && tab === 'week'   && <CurrentCard ladder={ladder} />}
          {tab === 'ladder' && <LadderMapView levels={levels ?? ladder?.levels} />}
          {tab === 'rewards' && rewards && <RewardsView rewards={rewards} />}
          <div style={{ height: 24 }} />
        </div>
      </div>
    </>
  );
}
