import { useState } from 'react';
import CosmicBackground from '../ui/CosmicBackground.jsx';
import NukkoWordmark    from '../ui/NukkoWordmark.jsx';
import Planet           from '../ui/Planet.jsx';
import Leaderboard      from '../ui/Leaderboard.jsx';
import { XLogoIcon, SettingsIcon, RankingIcon, TrophyIcon, ProfileIcon } from '../ui/Icons.jsx';
import { openXProfile, X_HANDLE } from '../../utils/social.js';
import { useTheme }     from '../../theme/ThemeContext.jsx';

function MenuTile({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: '14px 6px', borderRadius: 18,
      background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
      cursor: 'pointer',
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.06)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {icon}
      </div>
      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 10.5, fontWeight: 700,
        color: '#fff', textAlign: 'center',
      }}>{label}</div>
    </button>
  );
}

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

export default function Home({ profile, address: walletAddress, isMiniPay, leaderboard, leaderboardLoading, onOpenModes, onOpenLegal, onOpenFAQ, onOpenSettings, onOpenProfile, onOpenMilestones, onOpenLeaderboard, hasPausedGame, pausedScore, pausedRemaining, onContinueGame }) {
  const { theme } = useTheme();
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
            <button
              onClick={onOpenSettings}
              style={{
                width: 40, height: 40, borderRadius: 99,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
              }}
            >
              <SettingsIcon size={20} color="#fff" />
            </button>
          </div>

          {/* ── Scrollable body ─────────────────────────────────────────── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px 8px' }}>

            {/* Player card — tappable, opens Profile */}
            <div onClick={onOpenProfile} style={{
              cursor: 'pointer',
              borderRadius: 22, padding: '18px 18px 16px',
              background: `linear-gradient(145deg, rgba(${theme.primaryRGB},0.32) 0%, rgba(${theme.secondaryRGB},0.14) 100%)`,
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
                      onClick={(e) => { e.stopPropagation(); copyAddress(); }}
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
                <StatPill label="Games" value={games > 0 ? games.toLocaleString() : '0'} accent={theme.secondary} />
                <StatPill label="Stage" value={`S${stage}`} accent="#a78bff" />
              </div>
            </div>

            {/* Menu tiles */}
            <div style={{ marginTop: 14, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              <MenuTile icon={<RankingIcon size={18} color={theme.secondary} />} label="Leaderboard" onClick={onOpenLeaderboard} />
              <MenuTile icon={<TrophyIcon size={18} color="#ffd700" />} label="Milestones" onClick={onOpenMilestones} />
              <MenuTile icon={<ProfileIcon size={18} color={theme.primary} />} label="Profile" onClick={onOpenProfile} />
            </div>

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
              <button onClick={onOpenLeaderboard} style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 700, color: theme.secondary,
              }}>
                See all
              </button>
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
                  background: `rgba(${theme.primaryRGB},0.12)`,
                  border: `1px solid rgba(${theme.primaryRGB},0.3)`,
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
                    background: theme.gradient,
                    border: 'none', color: '#fff',
                    fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 18,
                    cursor: 'pointer',
                    boxShadow: `0 12px 36px -8px rgba(${theme.primaryRGB},0.6), inset 0 1px 0 rgba(255,255,255,0.25)`,
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
                  onClick={onOpenModes}
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
                  onClick={onOpenModes}
                  style={{
                    pointerEvents: 'all',
                    width: '100%', height: 58, borderRadius: 18,
                    background: theme.gradient,
                    border: 'none', color: '#fff',
                    fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 18,
                    cursor: 'pointer',
                    boxShadow: `0 12px 36px -8px rgba(${theme.primaryRGB},0.6), inset 0 1px 0 rgba(255,255,255,0.25)`,
                    animation: 'nukko-glow-pulse 2.4s ease-in-out infinite',
                    letterSpacing: '0.02em',
                  }}
                >
                  Play Now
                </button>
              </>
            )}

            {/* Follow on X */}
            <div style={{
              display: 'flex', justifyContent: 'center',
              marginTop: 12, pointerEvents: 'all',
            }}>
              <button
                onClick={openXProfile}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  padding: '7px 16px', borderRadius: 99,
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
                  fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 12,
                }}
              >
                <XLogoIcon size={13} color="rgba(255,255,255,0.75)" />
                Follow {X_HANDLE}
              </button>
            </div>

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
              ].map(({ key, label, action }, i) => (
                <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {i > 0 && <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>}
                  <button
                    onClick={action}
                    style={{
                      background: 'none', border: 'none', padding: '2px 4px',
                      fontFamily: 'inherit', fontSize: 'inherit',
                      color: 'rgba(255,255,255,0.28)', cursor: 'pointer',
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
