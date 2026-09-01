import { useState } from 'react';
import CosmicBackground from '../ui/CosmicBackground.jsx';
import NukkoWordmark    from '../ui/NukkoWordmark.jsx';
import Planet           from '../ui/Planet.jsx';
import Leaderboard      from '../ui/Leaderboard.jsx';
import { isAdminWallet } from '../../utils/admin.js';

function stageFromScore(score) {
  if (!score || score < 100)  return 2;
  if (score < 500)   return 3;
  if (score < 2000)  return 4;
  if (score < 5000)  return 6;
  if (score < 10000) return 8;
  if (score < 20000) return 10;
  if (score < 50000) return 12;
  return 13;
}

// ── Ladder entry point ───────────────────────────────────────────────────────

function LadderCard({ ladder, unclaimedRewards, onOpen }) {
  if (!ladder) return null;

  // How far through this week's card the player is, averaged across the four
  // objectives — enough to show momentum without repeating the whole panel.
  const objectives = ladder.objectives ?? [];
  const pct = objectives.length
    ? Math.round((objectives.reduce((a, o) => a + o.fraction, 0) / objectives.length) * 100)
    : 0;
  const metCount = objectives.filter(o => o.met).length;

  return (
    <button
      onClick={onOpen}
      style={{
        width: '100%', marginTop: 14, padding: '14px 16px', borderRadius: 18,
        background: ladder.atRisk
          ? 'linear-gradient(145deg, rgba(255,92,92,0.16) 0%, rgba(123,47,255,0.12) 100%)'
          : 'linear-gradient(145deg, rgba(123,47,255,0.24) 0%, rgba(0,212,255,0.10) 100%)',
        border: `1px solid ${ladder.atRisk ? 'rgba(255,92,92,0.4)' : 'rgba(255,255,255,0.12)'}`,
        cursor: 'pointer', textAlign: 'left',
        WebkitTapHighlightColor: 'transparent', position: 'relative',
      }}
    >
      {unclaimedRewards > 0 && (
        <div style={{
          position: 'absolute', top: 10, right: 12,
          padding: '3px 8px', borderRadius: 8, background: '#ffd700',
          fontFamily: '"Nunito", system-ui', fontSize: 9, fontWeight: 900, color: '#08010f',
        }}>
          {unclaimedRewards} REWARD{unclaimedRewards > 1 ? 'S' : ''}
        </div>
      )}

      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 9, fontWeight: 800,
        letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.42)',
      }}>
        Level {ladder.level} of {ladder.maxLevel}
      </div>
      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 16, fontWeight: 900,
        color: '#fff', lineHeight: 1.3, marginBottom: 8,
      }}>
        {ladder.badge}
      </div>

      <div style={{ height: 6, borderRadius: 3, background: 'rgba(0,0,0,0.28)', overflow: 'hidden', marginBottom: 7 }}>
        <div style={{
          width: `${pct}%`, height: '100%', borderRadius: 3,
          background: 'linear-gradient(90deg, #7b2fff, #00d4ff)',
          transition: 'width 400ms ease',
        }} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontFamily: '"Nunito", system-ui', fontSize: 10.5, fontWeight: 700,
          color: ladder.atRisk ? '#ff5c5c' : 'rgba(255,255,255,0.55)',
        }}>
          {ladder.atRisk ? '⚠ Drops on Monday unless you clear it' : `${metCount}/4 objectives met`}
        </span>
        <span style={{
          fontFamily: '"Nunito", system-ui', fontSize: 10.5, fontWeight: 800, color: '#00d4ff',
        }}>
          View →
        </span>
      </div>
    </button>
  );
}

function StatPill({ label, value, accent }) {
  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
      padding: '10px 8px', borderRadius: 14,
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.08)',
    }}>
      <div style={{
        fontFamily: '"Space Mono", monospace', fontWeight: 700,
        fontSize: 18, color: accent ?? '#fff',
        fontVariantNumeric: 'tabular-nums', lineHeight: 1,
      }}>
        {value}
      </div>
      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 9,
        color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.12em',
      }}>
        {label}
      </div>
    </div>
  );
}

function fmt(s) {
  return [Math.floor(s / 60), s % 60].map(n => String(n).padStart(2, '0')).join(':');
}

export default function Home({ profile, address: walletAddress, isMiniPay, leaderboard, leaderboardLoading, onStartGame, onOpenLegal, onOpenFAQ, hasPausedGame, pausedScore, pausedRemaining, onContinueGame, ladder, unclaimedRewards = 0, onOpenLadder }) {
  const username  = profile?.username || 'Anonymous';
  const best      = profile?.personalBest ?? 0;
  const games     = profile?.gamesPlayed  ?? 0;
  const stage     = stageFromScore(best);
  // Prefer direct wallet address over profile.address — profile may not include it
  const addr      = walletAddress || profile?.address || '';
  const shortAddr = addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '';
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!addr) return;
    navigator.clipboard?.writeText(addr).catch(() => {
      const el = document.createElement('textarea');
      el.value = addr; document.body.appendChild(el);
      el.select(); document.execCommand('copy');
      document.body.removeChild(el);
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* ── Header bar ─────────────────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '20px 20px 0',
          }}>
            <NukkoWordmark size={28} />
          </div>

          {/* ── Scrollable body ─────────────────────────────────────────── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 8px' }}>

            {/* Player card */}
            <div style={{
              borderRadius: 22, padding: '18px 18px 16px',
              background: 'linear-gradient(145deg, rgba(123,47,255,0.32) 0%, rgba(0,212,255,0.14) 100%)',
              border: '1px solid rgba(255,255,255,0.12)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.14)',
            }}>
              {/* Avatar + name row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 56, height: 56, borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.25)',
                  border: '1.5px solid rgba(255,255,255,0.14)',
                }}>
                  <Planet stage={stage} size={42} glow />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: '"Nunito", system-ui', fontWeight: 800,
                    fontSize: 19, color: '#fff', lineHeight: 1.2,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {username}
                  </div>
                  {shortAddr && !isMiniPay && (
                    <button
                      onClick={copyAddress}
                      style={{
                        marginTop: 4, padding: '3px 8px',
                        borderRadius: 8,
                        background: 'rgba(255,255,255,0.06)',
                        border: `1px solid ${copied ? 'rgba(46,204,113,0.5)' : 'rgba(255,255,255,0.1)'}`,
                        cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <span style={{
                        fontFamily: '"Space Mono", monospace', fontSize: 11, fontWeight: 700,
                        color: copied ? '#2ecc71' : 'rgba(255,255,255,0.5)',
                      }}>
                        {copied ? 'Copied!' : shortAddr}
                      </span>
                      <svg width="11" height="11" viewBox="0 0 15 15" fill="none">
                        {copied ? (
                          <polyline points="2,8 6,12 13,4" stroke="#2ecc71" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                        ) : (
                          <>
                            <rect x="4" y="4" width="8" height="8" rx="1.5" stroke="rgba(255,255,255,0.4)" strokeWidth="1.4"/>
                            <path d="M3 10V3a1 1 0 0 1 1-1h7" stroke="rgba(255,255,255,0.3)" strokeWidth="1.4" strokeLinecap="round"/>
                          </>
                        )}
                      </svg>
                    </button>
                  )}
                </div>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 8 }}>
                <StatPill label="Best" value={best > 0 ? best.toLocaleString() : '–'} accent="#ffd700" />
                <StatPill label="Games" value={games > 0 ? games.toLocaleString() : '0'} accent="#00d4ff" />
                <StatPill label="Stage" value={`S${stage}`} accent="#a78bff" />
              </div>
            </div>

            {/* ── Ladder card ─────────────────────────────────────────── */}
            <LadderCard
              ladder={ladder}
              unclaimedRewards={unclaimedRewards}
              onOpen={onOpenLadder}
            />

            {/* Leaderboard */}
            <div style={{
              marginTop: 20, marginBottom: 10,
              display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            }}>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontWeight: 800,
                fontSize: 15, color: '#fff', letterSpacing: '0.02em',
              }}>
                Cosmic Leaderboard
              </div>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 11,
                color: 'rgba(255,255,255,0.35)',
              }}>
                live · 30s
              </div>
            </div>

            <Leaderboard
              entries={leaderboard}
              loading={leaderboardLoading}
              myUsername={username}
            />

            {/* bottom spacer so content doesn't hide behind CTA */}
            <div style={{ height: 100 }} />
          </div>

          {/* ── Sticky bottom CTA ───────────────────────────────────────── */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '12px 16px 28px',
            background: 'linear-gradient(to top, #0a0015 60%, transparent)',
            pointerEvents: 'none',
          }}>

            {hasPausedGame ? (
              /* ── Paused-game banner + Continue ─────────────────────── */
              <div style={{ pointerEvents: 'all', display: 'flex', flexDirection: 'column', gap: 8 }}>

                {/* Info strip */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 14,
                  background: 'rgba(123,47,255,0.12)',
                  border: '1px solid rgba(123,47,255,0.3)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#a78bff', boxShadow: '0 0 6px #a78bff', animation: 'nukko-pulse 0.9s ease-in-out infinite alternate' }} />
                    <span style={{ fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 12, color: '#a78bff' }}>
                      Game paused
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 13, color: '#ffd700' }}>
                        {Number(pausedScore).toLocaleString()}
                      </div>
                      <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>score</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 13, color: '#00d4ff' }}>
                        {fmt(pausedRemaining ?? 0)}
                      </div>
                      <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 9, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>left</div>
                    </div>
                  </div>
                </div>

                {/* Continue button — primary */}
                <button
                  onClick={onContinueGame}
                  style={{
                    width: '100%', height: 58, borderRadius: 18,
                    background: 'linear-gradient(135deg, #7b2fff 0%, #00d4ff 100%)',
                    border: 'none', color: '#fff',
                    fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 18,
                    cursor: 'pointer',
                    boxShadow: '0 12px 36px -8px rgba(123,47,255,0.6), inset 0 1px 0 rgba(255,255,255,0.25)',
                    animation: 'nukko-glow-pulse 2.4s ease-in-out infinite',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
                  }}
                >
                  {/* Play icon */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M4 2.5l10 5.5-10 5.5V2.5Z" fill="white"/>
                  </svg>
                  Continue Game
                </button>

                {/* New game — ghost secondary */}
                <button
                  onClick={onStartGame}
                  style={{
                    width: '100%', height: 42, borderRadius: 14,
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.35)',
                    fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 13,
                    cursor: 'pointer',
                    letterSpacing: '0.02em',
                  }}
                >
                  Start New Game
                </button>
              </div>
            ) : (
              /* ── Normal Play Now ────────────────────────────────────── */
              <>
                <button
                  onClick={onStartGame}
                  style={{
                    pointerEvents: 'all',
                    width: '100%', height: 58, borderRadius: 18,
                    background: 'linear-gradient(135deg, #7b2fff 0%, #00d4ff 100%)',
                    border: 'none', color: '#fff',
                    fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 18,
                    cursor: 'pointer',
                    boxShadow: '0 12px 36px -8px rgba(123,47,255,0.6), inset 0 1px 0 rgba(255,255,255,0.25)',
                    animation: 'nukko-glow-pulse 2.4s ease-in-out infinite',
                    letterSpacing: '0.02em',
                  }}
                >
                  Play Now
                </button>
              </>
            )}

            {/* Legal footer */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              marginTop: 10, pointerEvents: 'all',
              fontFamily: '"Nunito", system-ui', fontSize: 10,
            }}>
              {[
                { key: 'terms',   label: 'Terms',   action: () => onOpenLegal?.('terms')   },
                { key: 'privacy', label: 'Privacy', action: () => onOpenLegal?.('privacy') },
                { key: 'faq',     label: 'FAQ',     action: () => onOpenFAQ?.()            },
                { key: 'about',   label: 'About',   action: () => onOpenLegal?.('about')   },
                // Owner-only. Server-enforced — this just saves typing #admin.
                ...(isAdminWallet(walletAddress)
                  ? [{ key: 'admin', label: 'Admin', action: () => { window.location.hash = 'admin'; } }]
                  : []),
              ].map(({ key, label, action }, i) => (
                <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>}
                  <button
                    onClick={action}
                    style={{
                      background: 'none', border: 'none', padding: '2px 4px',
                      fontFamily: 'inherit', fontSize: 'inherit',
                      color: key === 'admin' ? 'rgba(255,215,0,0.75)' : 'rgba(255,255,255,0.28)',
                      fontWeight: key === 'admin' ? 800 : 'inherit',
                      cursor: 'pointer',
                      textDecoration: 'underline', textUnderlineOffset: 2,
                    }}
                  >
                    {label}
                  </button>
                </span>
              ))}
            </div>
          </div>

        </div>
      </CosmicBackground>
    </div>
  );
}
