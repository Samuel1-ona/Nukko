import { useState, useEffect, useRef, useMemo } from 'react';
import CosmicBackground from '../ui/CosmicBackground.jsx';
import NukkoWordmark    from '../ui/NukkoWordmark.jsx';
import Orrery           from '../ui/Orrery.jsx';
import Planet, { PLANET_DATA } from '../ui/Planet.jsx';
import Leaderboard      from '../ui/Leaderboard.jsx';
import { isAdminWallet } from '../../utils/admin.js';
import {
  XLogoIcon, SettingsIcon, PlayIcon, FlameIcon, LadderIcon, CheckIcon,
} from '../ui/Icons.jsx';
import { openXProfile, X_HANDLE } from '../../utils/social.js';
import { useTheme } from '../../theme/ThemeContext.jsx';
import { levelProgress, titleForLevel } from '../../game/progression.js';
import {
  HudPanel, HudCell, ModuleTile, Segmented, ProgressRing, GhostButton,
} from '../ui/kit.jsx';
import { INK, DIM, FAINT, RULE, GOLD, DISPLAY, BODY, NUM } from '../../theme/tokens.js';

function prefersReducedMotion() {
  return typeof window !== 'undefined'
    && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}

/** Counts a number up on mount. The best score should feel earned, not printed. */
function useCountUp(target, ms = 1100) {
  const [value, setValue] = useState(prefersReducedMotion() ? target : 0);

  useEffect(() => {
    if (!target || prefersReducedMotion()) { setValue(target ?? 0); return; }
    let raf, start;
    const step = (t) => {
      start ??= t;
      const p = Math.min(1, (t - start) / ms);
      setValue(Math.round(target * (1 - Math.pow(1 - p, 5))));   // ease-out-quint
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);

    // Wallet browsers background aggressively, and a backgrounded tab freezes
    // requestAnimationFrame mid-count. Both guards below snap to the real
    // number so the player never returns to a score that is quietly wrong.
    const settle = setTimeout(() => setValue(target), ms + 300);
    const onVisible = () => { if (document.visibilityState === 'visible') setValue(target); };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(settle);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [target, ms]);

  return value;
}

/** Measures a node so the orrery can size itself to the actual phone viewport. */
function useMeasuredHeight(ref) {
  const [h, setH] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setH(e.contentRect.height));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return h;
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

function fmt(s) {
  return [Math.floor(s / 60), s % 60].map(n => String(n).padStart(2, '0')).join(':');
}

/** The arcade control. Chunky, notched, one hue, light travelling across it. */
function PlayButton({ label, onClick, theme }) {
  const notch = 13;
  const clip = `polygon(0 0, calc(100% - ${notch}px) 0, 100% ${notch}px, 100% 100%, ${notch}px 100%, 0 calc(100% - ${notch}px))`;
  return (
    <button
      onClick={onClick}
      className="nk-press"
      style={{
        position: 'relative', overflow: 'hidden',
        width: '100%', height: 62, border: 'none', padding: 0,
        clipPath: clip,
        background: `linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 42%, rgba(0,0,0,0.2) 100%), ${theme.primary}`,
        boxShadow: `inset 0 -3px 0 rgba(0,0,0,0.32), inset 0 2px 0 rgba(255,255,255,0.3)`,
        color: '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      }}
    >
      <PlayIcon size={15} />
      <span style={{
        fontFamily: DISPLAY, fontWeight: 600, fontSize: 21, letterSpacing: '0.16em',
        textTransform: 'uppercase',
      }}>
        {label}
      </span>
      <span className="nk-motion" style={{
        position: 'absolute', top: 0, bottom: 0, left: 0, width: 64,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
        animation: 'nk-sweep 6.5s ease-in-out infinite',
        pointerEvents: 'none',
      }} />
    </button>
  );
}

/* ── Screen ─────────────────────────────────────────────────────────────── */

export default function Home({
  profile, address: walletAddress, isMiniPay, leaderboard = [], leaderboardLoading,
  onOpenModes, onOpenLegal, onOpenFAQ, onOpenSettings, onOpenProfile, onOpenCodex,
  onOpenLeaderboard, hasPausedGame, pausedScore, pausedRemaining, onContinueGame,
  progress, challenges, challengesDone, streakBroken, ladder, unclaimedRewards = 0,
  onOpenLadder,
}) {
  const { theme } = useTheme();

  const username = profile?.username || 'Anonymous';
  const best     = profile?.personalBest ?? 0;
  const games    = profile?.gamesPlayed  ?? 0;
  const stage    = stageFromScore(best);
  const rank     = levelProgress(progress?.xp ?? 0);
  const streak   = streakBroken ? 0 : (progress?.streak ?? 0);
  const discovered = progress?.discovered ?? [];
  const isNewPlayer = games === 0 && best === 0;

  const standing = useMemo(() => {
    const i = leaderboard.findIndex(e => e.username && e.username === username);
    return i === -1 ? null : (leaderboard[i].rank ?? i + 1);
  }, [leaderboard, username]);

  const shownBest = useCountUp(best);
  const doneCount = challenges?.filter(c => challengesDone?.includes(c.id)).length ?? 0;

  // One block of text at a time, rather than every section stacked open.
  const [panel, setPanel] = useState('today');

  const rootRef = useRef(null);
  const boxH    = useMeasuredHeight(rootRef);
  const orrerySize = Math.round(Math.max(160, Math.min(276, (boxH || 800) * 0.345)));
  const orreryBand = Math.round(orrerySize * 0.66);

  const ladderPct = ladder?.objectives?.length
    ? ladder.objectives.reduce((a, o) => a + o.fraction, 0) / ladder.objectives.length
    : 0;

  const legalLinks = [
    { key: 'terms',   label: 'Terms',   action: () => onOpenLegal?.('terms')   },
    { key: 'privacy', label: 'Privacy', action: () => onOpenLegal?.('privacy') },
    { key: 'faq',     label: 'FAQ',     action: () => onOpenFAQ?.()            },
    { key: 'about',   label: 'About',   action: () => onOpenLegal?.('about')   },
    // Owner-only. Server-enforced — this just saves typing #admin.
    ...(isAdminWallet(walletAddress)
      ? [{ key: 'admin', label: 'Admin', action: () => { window.location.hash = 'admin'; } }]
      : []),
  ];

  return (
    <div ref={rootRef} style={{ position: 'absolute', inset: 0, background: theme.bgGradient }}>
      <CosmicBackground intensity="lush">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>

          {/* ── Header ───────────────────────────────────────────────── */}
          <div className="nk-rise" style={{
            flex: '0 0 auto',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 16px 0',
          }}>
            <NukkoWordmark size={21} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={onOpenProfile}
                aria-label="Your profile"
                className="nk-press-sm"
                style={{
                  width: 32, height: 32, borderRadius: '50%', padding: 0,
                  background: 'rgba(0,0,0,0.3)', border: `1px solid ${RULE}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <Planet stage={stage} size={22} />
              </button>
              <button
                onClick={onOpenSettings}
                aria-label="Settings"
                className="nk-press-sm"
                style={{
                  width: 32, height: 32, borderRadius: '50%', padding: 0,
                  background: 'transparent', border: `1px solid ${RULE}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <SettingsIcon size={15} color={DIM} />
              </button>
            </div>
          </div>

          {/* ── Deck ─────────────────────────────────────────────────── */}
          <div style={{ flex: '0 0 auto', padding: '0 16px' }}>

            <div className="nk-rise" style={{
              position: 'relative', height: orreryBand,
              margin: '2px 0 4px', animationDelay: '60ms',
            }}>
              <div style={{
                position: 'absolute', left: '50%', top: '50%',
                transform: 'translate(-50%, -50%)',
              }}>
                <Orrery stage={stage} discovered={discovered} size={orrerySize} />
              </div>
            </div>

            {/* Name + level badge — two elements, not three lines of prose */}
            <div className="nk-rise" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9,
              animationDelay: '140ms',
            }}>
              <span style={{
                fontFamily: DISPLAY, fontWeight: 600, fontSize: 23, color: INK,
                lineHeight: 1.15, maxWidth: '62%',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {username}
              </span>
              <button
                onClick={onOpenProfile}
                className="nk-press-sm"
                title={titleForLevel(rank.level)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '3px 9px 3px 5px', borderRadius: 99, flexShrink: 0,
                  background: `rgba(${theme.secondaryRGB},0.13)`,
                  border: `1px solid rgba(${theme.secondaryRGB},0.4)`,
                }}
              >
                <ProgressRing size={16} stroke={2} pct={rank.pct} color={theme.secondary} />
                <span style={{
                  fontFamily: NUM, fontSize: 11, fontWeight: 700, color: theme.secondary,
                }}>
                  LV {rank.level}
                </span>
              </button>
            </div>

            {isNewPlayer && (
              <div className="nk-rise" style={{
                marginTop: 5, textAlign: 'center', animationDelay: '170ms',
                fontFamily: BODY, fontSize: 12, fontWeight: 700,
                color: 'rgba(246,241,251,0.8)',
                textShadow: '0 1px 6px rgba(8,1,15,0.7)',
              }}>
                Same meets same. Watch them grow.
              </div>
            )}

            {/* Instrument housing — three tappable readouts */}
            <div className="nk-rise" style={{ marginTop: 13, animationDelay: '200ms' }}>
              <HudPanel>
                <div style={{ display: 'flex' }}>
                  <HudCell label="Best" value={shownBest > 0 ? shownBest.toLocaleString() : '—'} accent={GOLD} onClick={onOpenProfile} />
                  <HudCell label="Rank" value={standing ? `#${standing}` : '—'} accent={standing ? theme.secondary : undefined} onClick={onOpenLeaderboard} />
                  <HudCell label="Codex" value={`${discovered.length}/${PLANET_DATA.length}`} onClick={onOpenCodex} last />
                </div>
              </HudPanel>
            </div>

            {/* Launch */}
            <div className="nk-rise" style={{ marginTop: 12, animationDelay: '250ms' }}>
              {hasPausedGame ? (
                <>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                    marginBottom: 8, fontFamily: NUM, fontSize: 11.5, fontWeight: 700,
                  }}>
                    <span style={{
                      fontFamily: BODY, fontSize: 9, fontWeight: 800,
                      letterSpacing: '0.16em', textTransform: 'uppercase', color: theme.secondary,
                    }}>
                      In progress
                    </span>
                    <span style={{ color: GOLD }}>{Number(pausedScore).toLocaleString()}</span>
                    <span style={{ color: FAINT }}>{fmt(pausedRemaining ?? 0)}</span>
                  </div>
                  <PlayButton label="Resume" onClick={onContinueGame} theme={theme} />
                  <GhostButton onClick={onOpenModes} height={36} style={{ marginTop: 8 }}>
                    New run
                  </GhostButton>
                </>
              ) : (
                <PlayButton label={isNewPlayer ? 'Start' : 'Play'} onClick={onOpenModes} theme={theme} />
              )}
            </div>

          </div>

          {/* ── Switchable compartment: one block of text at a time ──── */}
          <div style={{ flex: '1 1 auto', minHeight: 0, display: 'flex', flexDirection: 'column', padding: '13px 16px 0' }}>
            <HudPanel
              style={{ minHeight: 0, maxHeight: '100%' }}
              innerStyle={{ display: 'flex', flexDirection: 'column', minHeight: 0, maxHeight: '100%' }}
            >
              <div className="nk-rise" style={{ flex: '0 0 auto', padding: '9px 10px 0', animationDelay: '350ms' }}>
                <Segmented
                  value={panel}
                  onChange={setPanel}
                  options={[
                    { key: 'today', label: `Today ${doneCount}/${challenges?.length ?? 0}` },
                    { key: 'ranks', label: 'Ranks' },
                  ]}
                />
              </div>

              <div
                className="nk-rise"
                style={{
                  flex: '1 1 auto', minHeight: 0, overflowY: 'auto',
                  padding: '4px 12px 10px', animationDelay: '390ms',
                  WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 10px, #000 calc(100% - 10px), transparent 100%)',
                  maskImage: 'linear-gradient(to bottom, transparent 0, #000 10px, #000 calc(100% - 10px), transparent 100%)',
                }}
              >
              {panel === 'today' ? (
                challenges?.length > 0 ? (
                  challenges.map((c, i) => {
                    const done = challengesDone?.includes(c.id);
                    return (
                      <div key={c.id} style={{
                        display: 'flex', alignItems: 'center', gap: 10, padding: '9px 2px',
                        borderBottom: i < challenges.length - 1 ? `1px solid ${RULE}` : 'none',
                      }}>
                        <div style={{
                          width: 17, height: 17, borderRadius: 5, flexShrink: 0,
                          background: done ? '#00e676' : 'rgba(0,0,0,0.3)',
                          border: `1px solid ${done ? '#00e676' : RULE}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {done && <CheckIcon size={10} color="#06210f" strokeWidth={3.4} />}
                        </div>
                        <span style={{
                          fontFamily: BODY, fontSize: 12.5, fontWeight: 600,
                          color: done ? FAINT : 'rgba(233,224,246,0.88)',
                          textDecoration: done ? 'line-through' : 'none',
                        }}>
                          {c.label}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ padding: '18px 0', textAlign: 'center', fontFamily: BODY, fontSize: 12, color: FAINT }}>
                    No challenges today.
                  </div>
                )
              ) : (
                <>
                  <Leaderboard
                    entries={leaderboard.slice(0, 5)}
                    loading={leaderboardLoading}
                    myUsername={username}
                  />
                  {leaderboard.length > 5 && (
                    <button onClick={onOpenLeaderboard} className="nk-press-sm" style={{
                      width: '100%', marginTop: 10, padding: '8px 0',
                      background: 'none', border: 'none',
                      fontFamily: BODY, fontSize: 11, fontWeight: 800,
                      letterSpacing: '0.14em', textTransform: 'uppercase', color: DIM,
                    }}>
                      See all
                    </button>
                  )}
                </>
              )}
                <div style={{ height: 4 }} />
              </div>
            </HudPanel>
            <div style={{ flex: '1 1 auto', minHeight: 0 }} />
          </div>

          {/* ── Bottom rack: two modules, then fine print ────────────── */}
          <div className="nk-rise" style={{
            flex: '0 0 auto', padding: '10px 16px 0',
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9,
            animationDelay: '430ms',
          }}>
            <ModuleTile
              icon={<LadderIcon size={15} color={ladder?.atRisk ? '#ff5c5c' : theme.secondary} />}
              value={ladder ? `${ladder.level}/${ladder.maxLevel}` : '—'}
              label="Ladder"
              accent={ladder?.atRisk ? '#ff5c5c' : theme.secondary}
              ring={ladder ? ladderPct : undefined}
              badge={unclaimedRewards}
              onClick={onOpenLadder}
            />
            <ModuleTile
              icon={<FlameIcon
                size={15}
                color={streak > 0 ? '#ff8a3d' : 'rgba(233,224,246,0.26)'}
                core={streak > 0 ? '#ffd54a' : 'rgba(233,224,246,0.4)'}
              />}
              value={streak > 0 ? `${streak}` : '—'}
              label="Day streak"
              accent={streak > 0 ? '#ff8a3d' : undefined}
              onClick={onOpenLadder}
            />
          </div>

          <div className="nk-rise" style={{
            flex: '0 0 auto', padding: '12px 16px 14px', animationDelay: '470ms',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5,
              fontFamily: BODY, fontSize: 9.5,
            }}>
              <button
                onClick={openXProfile}
                aria-label={`Follow ${X_HANDLE}`}
                className="nk-press-sm"
                style={{
                  width: 26, height: 26, borderRadius: '50%', padding: 0, marginRight: 4,
                  background: 'transparent', border: `1px solid ${RULE}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <XLogoIcon size={11} color={DIM} />
              </button>
              {legalLinks.map(({ key, label, action }, i) => (
                <span key={key} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  {i > 0 && <span style={{ color: 'rgba(233,224,246,0.16)' }}>·</span>}
                  <button
                    onClick={action}
                    style={{
                      background: 'none', border: 'none', padding: '2px 1px',
                      fontFamily: 'inherit', fontSize: 'inherit',
                      fontWeight: key === 'admin' ? 800 : 600,
                      color: key === 'admin' ? GOLD : 'rgba(233,224,246,0.26)',
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
