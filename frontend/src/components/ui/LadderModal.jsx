import { useState, useEffect } from 'react';
import { CheckIcon, WarningIcon, CashIcon, GiftIcon } from './Icons.jsx';
import { Sheet } from './kit.jsx';
import { unclaimedByLevel } from '../../rewards/levelLabel.js';
import { INK, DIM, FAINT, RULE, BODY } from '../../theme/tokens.js';

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

// Power-ups only. Cash is never folded in here: a level that credits
// power-ups GIVES, and only a level with money PAYS. Appending the cash to
// this list makes it read as one more item in a row of consolation prizes,
// and putting "pays" on a level with no money reads as a broken promise.
function rewardText(reward) {
  if (!reward) return '';
  const parts = [];
  if (reward.bombs)   parts.push(`+${reward.bombs} bomb${reward.bombs > 1 ? 's' : ''}`);
  if (reward.expands) parts.push(`+${reward.expands} expand${reward.expands > 1 ? 's' : ''}`);
  return parts.join(' · ');
}

function cashText(reward) {
  return reward?.cash ? `$${reward.cash.amount} ${reward.cash.token}` : '';
}

// ── One objective with its progress bar ──────────────────────────────────────

function ObjectiveBar({ objective }) {
  const { key, value, target, met, fraction } = objective;
  const pct = Math.round(fraction * 100);

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5 }}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 700,
          color: met ? GREEN : 'rgba(255,255,255,0.72)',
        }}>
          {met && <CheckIcon size={11} color={GREEN} />}
          {OBJ_LABEL[key] ?? key}
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

function CurrentCard({ ladder, claims, onClaim, claimBusy }) {
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
            display: 'flex', alignItems: 'center', gap: 7,
            fontFamily: '"Nunito", system-ui', fontSize: 11.5, fontWeight: 800, color: RED, marginBottom: 3,
          }}>
            <WarningIcon size={13} color={RED} />
            <span>You will drop to level {ladder.level - 1} on Monday</span>
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
          <div style={{
            display: 'flex', alignItems: 'center', gap: 7,
            fontFamily: '"Nunito", system-ui', fontSize: 11.5, fontWeight: 800, color: GREEN,
          }}>
            <CheckIcon size={13} color={GREEN} />
            <span>Rank held — you are at the top of the ladder</span>
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

      {/* Anything already earned and still unclaimed, tagged to the rung that
          paid it — the player is usually standing past that rung by now. */}
      {[...(claims ?? new Map())].map(([lvl, reward]) => (
        <LevelCashClaim key={reward.id} level={lvl} reward={reward} onClaim={onClaim} busy={claimBusy === reward.id} />
      ))}

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
          {!ladder.currentCardPays
            ? 'Already earned'
            : ladder.reward?.cash ? 'Clearing this pays' : 'Clearing this gives'}
        </div>
        <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 700, color: '#fff' }}>
          {rewardText(ladder.reward)}
        </div>
        {ladder.reward?.cash && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6, marginTop: 6,
            fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 800, color: GOLD,
          }}>
            <CashIcon size={12} color={GOLD} />
            <span>{cashText(ladder.reward)} cash milestone</span>
          </div>
        )}
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

// ── A cash claim, shown against the level that actually paid it ──────────────
// A player has usually climbed past the milestone by the time they claim, so
// an untagged reward in a flat list reads as belonging to whatever rung they
// happen to be standing on.

function LevelCashClaim({ level, reward, onClaim, busy }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
      marginTop: 8, borderRadius: 12, padding: '10px 12px',
      background: `${GOLD}16`, border: `1px solid ${GOLD}55`,
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: BODY, fontSize: 9, fontWeight: 800,
          letterSpacing: '0.12em', textTransform: 'uppercase', color: GOLD,
        }}>
          Level {level} reward
        </div>
        <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, fontWeight: 700, color: '#fff', marginTop: 2 }}>
          ${reward.amount} {reward.token}
        </div>
      </div>
      <button
        onClick={() => onClaim(reward)}
        disabled={busy}
        className="nk-press-sm"
        style={{
          flexShrink: 0, padding: '8px 14px', borderRadius: 10,
          background: GOLD, border: `1px solid ${GOLD}`, color: '#08010f',
          fontFamily: BODY, fontSize: 11, fontWeight: 800,
          cursor: busy ? 'wait' : 'pointer', WebkitTapHighlightColor: 'transparent',
        }}
      >
        {busy ? '…' : 'Claim'}
      </button>
    </div>
  );
}

// ── The full 12-rung map ─────────────────────────────────────────────────────

const STATUS_STYLE = {
  current: { label: 'IN PROGRESS', color: CYAN,                   bg: `${CYAN}14`,  border: `${CYAN}44` },
  cleared: { label: 'CLEARED',     color: GREEN,                  bg: `${GREEN}10`, border: `${GREEN}33` },
  reclaim: { label: 'LOST — RE-EARN',     color: '#ffa94d',      bg: '#ffa94d10',  border: '#ffa94d33' },
  locked:  { label: 'LOCKED',      color: 'rgba(255,255,255,0.3)', bg: 'transparent', border: 'rgba(255,255,255,0.07)' },
};

function LevelRow({ level, claim, onClaim, claimBusy }) {
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
        display: 'flex', alignItems: 'center', gap: 6,
        fontFamily: '"Nunito", system-ui', fontSize: 10.5, fontWeight: 700,
        color: level.reward?.cash ? GOLD : 'rgba(255,255,255,0.55)',
      }}>
        {level.reward?.cash
          ? <CashIcon size={12} color={GOLD} />
          : <GiftIcon size={12} color="rgba(255,255,255,0.55)" />}
        <span>
          {[rewardText(level.reward), cashText(level.reward)].filter(Boolean).join(' + ')}
          {!level.paysReward && (
            <span style={{ color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}> · already earned</span>
          )}
        </span>
      </div>

      {claim && <LevelCashClaim level={level.level} reward={claim} onClaim={onClaim} busy={claimBusy === claim.id} />}
    </div>
  );
}

function LadderMapView({ levels, claims, onClaim, claimBusy }) {
  if (!levels) return null;
  return (
    <div style={{ padding: '14px 20px 4px' }}>
      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 10.5, color: 'rgba(255,255,255,0.45)',
        lineHeight: 1.6, marginBottom: 14,
      }}>
        Every rung is its own piece of work: the targets below count only what you do
        <em style={{ fontStyle: 'normal', color: 'rgba(255,255,255,0.7)' }}> after </em>
        you reach that level, and one clear moves you up one rung. Progress also resets
        every Monday 00:00 UTC.
      </div>
      {levels.map(l => (
        <LevelRow
          key={l.level}
          level={l}
          claim={claims?.get(l.level)}
          onClaim={onClaim}
          claimBusy={claimBusy}
        />
      ))}
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
        Cash milestones at levels 4, 8 and 12 pay a MiniPay cash link. A link is yours the moment you
        open it — you can reopen it here at any time until the money is taken.
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

export default function LadderModal({ isOpen, onClose, ladder, levels, rewards, error, onRetry }) {
  const [tab, setTab] = useState('week');
  const [retrying, setRetrying] = useState(false);

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

  const tabs = (
    <div style={{ display: 'flex', gap: 6 }}>
      {TABS.map(t => {
        const active = tab === t.key;
        return (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className="nk-press-sm"
            style={{
              position: 'relative', flex: 1, padding: '8px 6px', borderRadius: 10,
              background: 'transparent',
              border: `1px solid ${active ? PURPLE : RULE}`,
              color: active ? INK : FAINT,
              fontFamily: BODY, fontSize: 11, fontWeight: 800,
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
        );
      })}
    </div>
  );

  const mapLevels = levels ?? ladder?.levels ?? null;

  // Unclaimed cash keyed by the level that paid it. Only rewards whose label
  // names a rung appear here — tournament and admin payouts stay in the inbox.
  const claims     = unclaimedByLevel(rewards?.rewards);
  const [claimBusy, setClaimBusy] = useState(null);
  const [claimError, setClaimError] = useState(null);

  const onClaim = async (reward) => {
    setClaimBusy(reward.id);
    setClaimError(null);
    try { await rewards.claim(reward); }
    catch (err) { setClaimError(err.message); }
    finally { setClaimBusy(null); }
  };

  const retry = async () => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    try { await onRetry(); } finally { setRetrying(false); }
  };

  // Shown whenever a tab's data has not arrived. An error means the API is
  // unreachable (a dev build pointed at a server that is not running, or a
  // cold backend) — surface it with a way out instead of a forever-spinner.
  const placeholder = (label) => (
    <div style={{
      padding: '28px 20px', textAlign: 'center',
      fontFamily: BODY, fontSize: 12, color: FAINT, lineHeight: 1.6,
    }}>
      {error ? (
        <>
          <div style={{ color: RED, fontWeight: 700, marginBottom: 6 }}>Couldn’t reach the ladder</div>
          <div style={{ marginBottom: 12, wordBreak: 'break-word' }}>{error}</div>
          {onRetry && (
            <button
              onClick={retry}
              disabled={retrying}
              className="nk-press-sm"
              style={{
                padding: '8px 18px', borderRadius: 10, background: 'transparent',
                border: `1px solid ${PURPLE}`, color: INK,
                fontFamily: BODY, fontSize: 11, fontWeight: 800,
                opacity: retrying ? 0.5 : 1,
              }}
            >
              {retrying ? 'Retrying…' : 'Try again'}
            </button>
          )}
        </>
      ) : label}
    </div>
  );

  return (
    <Sheet
      title="The Ladder"
      subtitle="12 levels · resets Monday UTC"
      onClose={onClose}
      belowHeader={tabs}
    >
      {/* The week view needs the wallet's own sync; the map only needs the
          static curve. Each tab therefore waits on its own data, and a
          failed fetch says so instead of spinning forever. */}
      {claimError && tab !== 'rewards' && (
        <div style={{
          margin: '0 20px', borderRadius: 12, padding: '10px 12px',
          background: 'rgba(255,92,92,0.1)', border: `1px solid ${RED}44`,
          fontFamily: BODY, fontSize: 11, color: RED,
        }}>
          {claimError}
        </div>
      )}
      {tab === 'week'   && (ladder
        ? <CurrentCard ladder={ladder} claims={claims} onClaim={onClaim} claimBusy={claimBusy} />
        : placeholder('Loading your ladder…'))}
      {tab === 'ladder' && (mapLevels
        ? <LadderMapView levels={mapLevels} claims={claims} onClaim={onClaim} claimBusy={claimBusy} />
        : placeholder('Loading the ladder…'))}
      {tab === 'rewards' && rewards && <RewardsView rewards={rewards} />}
      <div style={{ height: 24 }} />
    </Sheet>
  );
}
