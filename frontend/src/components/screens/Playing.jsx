import { useEffect, useCallback, useRef, useState } from 'react';
import { RecordIcon, TrophyIcon } from '../ui/Icons.jsx';
import CosmicBackground from '../ui/CosmicBackground.jsx';
import BottomBar        from '../ui/BottomBar.jsx';
import PowerUpShop      from '../ui/PowerUpShop.jsx';
import TimeShop         from '../ui/TimeShop.jsx';
import Toast            from '../ui/Toast.jsx';
import PauseModal       from '../ui/PauseModal.jsx';
import { FRUITS, drawFruitOnCtx } from '../../game/fruits.js';
import { useTheme }     from '../../theme/ThemeContext.jsx';

// Real-time progress toward the milestone reward previews shown on the
// Milestones screen — reward amounts are the same preview figures shown
// there (not yet claimable anywhere); this tracker just mirrors the run's
// real score against them live, same as the leaderboard's "live" badges.
const MILESTONES = [
  { score: 5000,  reward: '0.02' },
  { score: 10000, reward: '0.05' },
  { score: 15000, reward: '0.10' },
];

function MilestoneTrack({ score }) {
  const { theme } = useTheme();
  const maxTrack = MILESTONES[MILESTONES.length - 1].score;
  const next = MILESTONES.find(m => score < m.score);
  const pct = Math.min(100, (score / maxTrack) * 100);
  return (
    <div style={{ marginTop: 10, marginBottom: 2 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6, gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <div style={{
            width: 6, height: 6, borderRadius: 99, background: '#00e676',
            boxShadow: '0 0 8px #00e676', animation: 'nukko-pulse 1.1s ease-in-out infinite',
          }} />
          <span style={{
            fontFamily: '"Nunito", system-ui', fontSize: 10, fontWeight: 800,
            color: '#00e676', letterSpacing: '0.05em',
          }}>LIVE</span>
        </div>
        <span style={{
          display: 'flex', alignItems: 'center', gap: 5,
          fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 700, color: '#ffd700',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          <TrophyIcon size={11} color="#ffd700" />
          {next ? `$${next.reward} USDT at ${next.score.toLocaleString()}` : 'All milestones reached'}
        </span>
      </div>
      <div style={{ position: 'relative', height: 5, borderRadius: 99, background: 'rgba(255,255,255,0.08)' }}>
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, borderRadius: 99,
          background: `linear-gradient(90deg,${theme.primary},${theme.secondary},#ffd700)`, transition: 'width .4s ease',
        }} />
        {MILESTONES.map(m => {
          const left = (m.score / maxTrack) * 100;
          const hit = score >= m.score;
          return (
            <div key={m.score} style={{
              position: 'absolute', left: `${left}%`, top: '50%', transform: 'translate(-50%,-50%)',
              width: 11, height: 11, borderRadius: 99,
              background: hit ? '#ffd700' : '#1a0440',
              border: `2px solid ${hit ? '#ffd700' : 'rgba(255,255,255,0.4)'}`,
              boxShadow: hit ? '0 0 8px #ffd700' : 'none', transition: 'all .3s ease',
            }} />
          );
        })}
      </div>
    </div>
  );
}

// ── Guest trial expired modal ──────────────────────────────────────────────

function GuestSpinner() {
  return (
    <div style={{
      width: 16, height: 16, borderRadius: '50%',
      border: '2px solid rgba(255,255,255,0.25)',
      borderTopColor: '#fff',
      animation: 'nukko-spin 0.65s linear infinite',
      flexShrink: 0,
    }} />
  );
}

function GuestTrialExpiredModal({ score, onConnectSocial, onConnectWallet, socialLoading, onRetryGuest }) {
  const { theme } = useTheme();
  const [walletLoading, setWalletLoading] = useState(false);

  const handleConnectWallet = async () => {
    setWalletLoading(true);
    try { await onConnectWallet?.(); } finally { setWalletLoading(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 20px',
      background: 'rgba(4,0,12,0.90)',
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      animation: 'nukko-fade-in 0.25s ease-out',
    }}>
      <div style={{
        width: '100%', maxWidth: 340,
        background: 'linear-gradient(160deg, #1a0930 0%, #0c0420 100%)',
        border: `1px solid rgba(${theme.primaryRGB},0.3)`,
        borderRadius: 28, overflow: 'hidden',
        boxShadow: `0 24px 80px rgba(0,0,0,0.75), 0 0 60px rgba(${theme.primaryRGB},0.14)`,
        animation: 'nukko-score-pop 0.28s cubic-bezier(.22,1,.36,1)',
      }}>
        {/* Gradient top bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${theme.primary}, ${theme.secondary}, ${theme.primary})` }} />

        <div style={{ padding: '28px 24px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* Icon */}
          <div style={{
            width: 56, height: 56, borderRadius: 18,
            background: `rgba(${theme.primaryRGB},0.15)`, border: `1px solid rgba(${theme.primaryRGB},0.35)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 16,
          }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <circle cx="13" cy="13" r="9.5" stroke="#a78bff" strokeWidth="1.5"/>
              <path d="M13 9v5l3 3" stroke="#a78bff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div style={{
            fontFamily: '"Nunito", system-ui', fontWeight: 900, fontSize: 22, color: '#fff',
            marginBottom: 4,
          }}>
            Trial Complete!
          </div>
          <div style={{
            fontFamily: '"Nunito", system-ui', fontSize: 13, color: 'rgba(255,255,255,0.42)',
            marginBottom: 20, textAlign: 'center',
          }}>
            Your 25-second trial is up
          </div>

          {/* Score */}
          <div style={{
            fontFamily: '"Space Mono", monospace', fontWeight: 700,
            fontSize: 52, color: '#ffd700', lineHeight: 1,
            fontVariantNumeric: 'tabular-nums', marginBottom: 4,
          }}>
            {Number(score).toLocaleString()}
          </div>
          <div style={{
            fontFamily: '"Nunito", system-ui', fontSize: 10, fontWeight: 700,
            color: 'rgba(255,215,0,0.4)', letterSpacing: '0.18em',
            textTransform: 'uppercase', marginBottom: 24,
          }}>
            points scored
          </div>

          {/* Unlock callout */}
          <div style={{
            width: '100%', padding: '14px 16px', borderRadius: 16,
            background: `rgba(${theme.primaryRGB},0.08)`, border: `1px solid rgba(${theme.primaryRGB},0.2)`,
            marginBottom: 24,
          }}>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 10, fontWeight: 800,
              color: '#a78bff', textTransform: 'uppercase', letterSpacing: '0.14em',
              marginBottom: 10,
            }}>
              Connect to unlock
            </div>
            {[
              '🏆  Submit score to the global leaderboard',
              '💎  Earn CELO rewards for every game',
              '⚡  Bomb & Expand power-ups',
            ].map(item => (
              <div key={item} style={{
                fontFamily: '"Nunito", system-ui', fontSize: 12,
                color: 'rgba(255,255,255,0.58)', marginBottom: 7, lineHeight: 1.3,
              }}>
                {item}
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div style={{ padding: '0 24px 28px', display: 'flex', flexDirection: 'column', gap: 8 }}>
          {/* Social login — primary */}
          <button
            onClick={onConnectSocial}
            disabled={socialLoading || walletLoading}
            style={{
              width: '100%', height: 54, borderRadius: 16,
              background: (socialLoading || walletLoading)
                ? `rgba(${theme.primaryRGB},0.35)`
                : theme.gradient,
              border: 'none', color: '#fff',
              fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 16,
              cursor: (socialLoading || walletLoading) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: `0 8px 28px rgba(${theme.primaryRGB},0.4)`,
            }}
          >
            {socialLoading ? <GuestSpinner /> : null}
            {socialLoading ? 'Connecting…' : 'Sign Up Free'}
          </button>

          {/* Connect wallet — ghost */}
          <button
            onClick={handleConnectWallet}
            disabled={socialLoading || walletLoading}
            style={{
              width: '100%', height: 46, borderRadius: 14,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.55)',
              fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 14,
              cursor: (socialLoading || walletLoading) ? 'not-allowed' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {walletLoading ? <GuestSpinner /> : null}
            {walletLoading ? 'Connecting…' : 'Connect Wallet'}
          </button>

          {/* Try again — text link */}
          <button
            onClick={onRetryGuest}
            disabled={socialLoading || walletLoading}
            style={{
              width: '100%', height: 36,
              background: 'none', border: 'none',
              color: (socialLoading || walletLoading) ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.28)',
              fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 12,
              cursor: (socialLoading || walletLoading) ? 'not-allowed' : 'pointer',
              letterSpacing: '0.02em',
            }}
          >
            Play Again (25-second trial)
          </button>
        </div>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────────

function PauseButtonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="1.5" width="3.5" height="11" rx="1" fill="rgba(255,255,255,0.8)"/>
      <rect x="8.5" y="1.5" width="3.5" height="11" rx="1" fill="rgba(255,255,255,0.8)"/>
    </svg>
  );
}

// Must match the H constant in useGame.js
const H_CANVAS = 480;

const SESSION_LABEL = {
  pending:   { dot: '#ffb400', text: 'Confirming…' },
  confirmed: { dot: '#2ecc71', text: 'Session active' },
  failed:    { dot: '#ff4646', text: 'Session failed' },
  idle:      null,
};

function fmt(s) {
  return [Math.floor(s / 60), s % 60]
    .map((n) => String(n).padStart(2, '0'))
    .join(':');
}

export default function Playing({
  canvasRef,
  nextIdx,
  nextNextIdx,
  sessionStatus,
  score,
  personalBest,
  remaining,
  containerWidth,
  packages,
  onPurchase,
  purchaseLoading,
  selectedToken,
  onSelectToken,
  balances,
  totalBombs,
  totalExpands,
  powerUpsEnabled,
  onUseBomb,
  onUseExpand,
  onBuyBombs,
  onBuyExpands,
  powerUpLoading,
  shop,
  onCloseShop,
  powerUpPackages,
  powerUpToken,
  onSelectPowerUpToken,
  onPurchasePowerUp,
  pauseTimer,
  resumeTimer,
  pauseEngine,
  resumeEngine,
  onGoHome,
  muted,
  onToggleMute,
  musicMuted,
  onToggleMusic,
  toast,
  movePointer,
  dropFruit,
  gameOver,
  isGuestMode,
  guestTrialExpired,
  onConnectWallet,
  onConnectSocial,
  socialLoading,
  onRetryGuest,
}) {
  const { theme } = useTheme();
  const [timeShopOpen,           setTimeShopOpen]           = useState(false);
  const [paused,                 setPaused]                 = useState(false);
  const [sessionFailDismissed,   setSessionFailDismissed]   = useState(false);

  // Any modal (shop, time, pause, or guest-expired overlay) freezes the timer
  const anyModalOpen = !!shop || timeShopOpen || paused || (isGuestMode && guestTrialExpired);
  useEffect(() => {
    if (anyModalOpen) pauseTimer?.();
    else              resumeTimer?.();
  }, [anyModalOpen, pauseTimer, resumeTimer]);

  // Pause also freezes the physics engine
  useEffect(() => {
    if (paused) pauseEngine?.();
    else        resumeEngine?.();
  }, [paused, pauseEngine, resumeEngine]);

  const handlePause  = () => !gameOver && setPaused(true);
  const handleResume = () => setPaused(false);

  const pointerActiveRef = useRef(false);
  const kbXRef           = useRef((containerWidth ?? 320) / 2);
  const canvasWrapperRef = useRef(null);

  // On mount, attempt to resume a paused engine.
  // For fresh game starts tickRef is still null so resumeEngine() is a no-op.
  // For continue-from-home, this runs AFTER the canvas element is in the DOM,
  // guaranteeing canvasRef.current is set before the first render tick.
  useEffect(() => {
    resumeEngine?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally mount-only

  // Draw "Next" preview
  useEffect(() => {
    const canvas = document.getElementById('next-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = '#050009';
    ctx.fillRect(0, 0, 64, 64);
    const r = Math.min(FRUITS[nextIdx].r, 22);
    drawFruitOnCtx(ctx, 32, 32, r, nextIdx, 1);
  }, [nextIdx]);

  const getX = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas?.getBoundingClientRect();
    if (!rect) return (containerWidth ?? 320) / 2;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const cssX = clientX - rect.left;
    // Account for CSS scaling (maxHeight shrinks canvas on small screens)
    const scaleX = rect.width > 0 ? (canvas.width / rect.width) : 1;
    return Math.max(0, Math.min(containerWidth ?? 320, cssX * scaleX));
  }, [canvasRef, containerWidth]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onPointerMove = (e) => { if (!gameOver) movePointer(getX(e)); };
    const onPointerDown = (e) => {
      if (!gameOver) { movePointer(getX(e)); pointerActiveRef.current = true; }
    };
    const onPointerUp = () => {
      if (!pointerActiveRef.current || gameOver) return;
      pointerActiveRef.current = false;
      dropFruit();
    };
    const onTouchMove = (e) => { e.preventDefault(); };

    canvas.addEventListener('pointermove', onPointerMove);
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup',   onPointerUp);
    canvas.addEventListener('touchmove',   onTouchMove, { passive: false });

    return () => {
      canvas.removeEventListener('pointermove', onPointerMove);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup',   onPointerUp);
      canvas.removeEventListener('touchmove',   onTouchMove);
    };
  }, [canvasRef, gameOver, movePointer, dropFruit, getX]);

  useEffect(() => {
    const STEP = 10;
    const onKeyDown = (e) => {
      if (gameOver) return;
      const cw = containerWidth ?? 320;
      if (e.key === 'ArrowLeft') {
        kbXRef.current = Math.max(0, kbXRef.current - STEP);
        movePointer(kbXRef.current);
      } else if (e.key === 'ArrowRight') {
        kbXRef.current = Math.min(cw, kbXRef.current + STEP);
        movePointer(kbXRef.current);
      } else if (e.key === ' ') {
        e.preventDefault();
        dropFruit();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameOver, movePointer, dropFruit, containerWidth]);

  const urgent = remaining <= 10;
  const sessionInfo = SESSION_LABEL[sessionStatus] ?? null;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#08010f' }}>
      <CosmicBackground intensity="medium">
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', pointerEvents: 'none' }} />

        <div style={{
          position: 'relative', height: '100%',
          display: 'flex', flexDirection: 'column',
          boxSizing: 'border-box',
        }}>

          {/* ── Top HUD ─────────────────────────────────────────────────────── */}
          <div style={{ padding: '14px 16px 10px', flexShrink: 0, position: 'relative' }}>

            {/* Pause button — top-right corner of HUD */}
            <button
              onClick={handlePause}
              disabled={gameOver}
              style={{
                position: 'absolute', top: 14, right: 16,
                width: 32, height: 32, borderRadius: 10,
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.14)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: gameOver ? 'not-allowed' : 'pointer',
                opacity: gameOver ? 0.35 : 1,
                WebkitTapHighlightColor: 'transparent',
                zIndex: 2,
              }}
            >
              <PauseButtonIcon />
            </button>

            {/* 3-column row: Timer | Next | Score */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: 8,
              paddingRight: 40,  /* leave room for pause button */
            }}>

              {/* Left: Timer pill */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '7px 13px', borderRadius: 99,
                background: urgent ? 'rgba(255,59,59,0.18)' : 'rgba(255,255,255,0.07)',
                border: `1px solid ${urgent ? 'rgba(255,59,59,0.5)' : 'rgba(255,255,255,0.11)'}`,
                animation: urgent ? 'nukko-pulse-bg 0.8s ease-in-out infinite' : 'none',
                width: 'fit-content',
              }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: urgent ? '#ff3b3b' : '#00d4ff',
                  flexShrink: 0,
                  boxShadow: urgent ? '0 0 6px #ff3b3b' : '0 0 6px #00d4ff',
                }} />
                <div style={{
                  fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 20,
                  color: urgent ? '#ff3b3b' : '#fff', letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {fmt(remaining)}
                </div>
              </div>

              {/* Center: NEXT preview */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{
                  fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 9,
                  color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.22em',
                }}>
                  Next
                </div>
                <div style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: 14, padding: 5,
                  boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
                }}>
                  <canvas
                    id="next-canvas"
                    width={64}
                    height={64}
                    style={{ display: 'block', borderRadius: 9 }}
                  />
                </div>
              </div>

              {/* Right: Score */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 9,
                  color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: '0.22em',
                }}>
                  Score
                </div>
                <div style={{
                  fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 26,
                  color: '#ffd700', letterSpacing: '-0.02em', lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {Number(score).toLocaleString()}
                </div>
                {personalBest > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3,
                    fontFamily: '"Nunito", system-ui', fontSize: 10,
                    color: score > personalBest ? '#00d4ff' : 'rgba(255,255,255,0.28)',
                    fontVariantNumeric: 'tabular-nums',
                    marginTop: 2,
                    transition: 'color 0.4s ease',
                  }}>
                    {score > personalBest && <RecordIcon size={10} color="#00d4ff" />}
                    PB {Number(personalBest).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <MilestoneTrack score={score} />

            {/* Session badge — compact, below HUD row */}
            {sessionInfo && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 11, fontWeight: 700, fontFamily: '"Nunito", system-ui',
                padding: '3px 10px', borderRadius: 20, marginTop: 8,
                background: `${sessionInfo.dot}18`,
                border: `1px solid ${sessionInfo.dot}44`,
                color: sessionInfo.dot,
              }}>
                <span style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: sessionInfo.dot, flexShrink: 0,
                }} />
                {sessionInfo.text}
              </div>
            )}
          </div>

          {/* ── Game canvas — fills remaining space ───────────────────────── */}
          <div
            ref={canvasWrapperRef}
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              position: 'relative',
              overflow: 'hidden',
              background: '#050009',
              borderTop: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <canvas
              ref={canvasRef}
              id="game-canvas"
              width={containerWidth ?? 320}
              height={H_CANVAS}
              style={{ display: 'block', cursor: 'none', touchAction: 'none', maxHeight: '100%', width: 'auto' }}
            />
            <Toast message={toast.message} visible={toast.visible} />
          </div>

          {/* ── Bottom action bar ─────────────────────────────────────────── */}
          {isGuestMode ? (
            /* Guest trial: no power-ups, show a connect nudge instead */
            <div style={{
              flexShrink: 0,
              borderTop: `1px solid rgba(${theme.primaryRGB},0.2)`,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(8,1,15,0.92) 100%)',
              padding: '12px 16px 22px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 12, fontWeight: 700,
                color: 'rgba(255,255,255,0.28)', textAlign: 'center', lineHeight: 1.4,
              }}>
                Connect wallet to unlock power-ups &amp; earn CELO
              </div>
            </div>
          ) : powerUpsEnabled ? (
            <div style={{
              flexShrink: 0,
              borderTop: `1px solid rgba(${theme.secondaryRGB},0.18)`,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(8,1,15,0.92) 100%)',
              padding: '10px 12px 22px',
            }}>
              <BottomBar
                totalBombs={totalBombs}
                totalExpands={totalExpands}
                onBombTap={onBuyBombs}
                onExpandTap={onBuyExpands}
                onTimeTap={() => setTimeShopOpen(true)}
                disabled={gameOver}
              />
            </div>
          ) : null}
        </div>
      </CosmicBackground>

      {/* Power-up shop modal */}
      {shop && powerUpsEnabled && (
        <PowerUpShop
          type={shop}
          packages={powerUpPackages}
          selectedToken={powerUpToken}
          onSelectToken={onSelectPowerUpToken}
          onPurchase={onPurchasePowerUp}
          loading={powerUpLoading}
          onClose={onCloseShop}
          balances={balances}
          count={shop === 'bomb' ? (totalBombs ?? 0) : (totalExpands ?? 0)}
          onUse={shop === 'bomb' ? onUseBomb : onUseExpand}
        />
      )}

      {/* Time shop modal */}
      {timeShopOpen && powerUpsEnabled && (
        <TimeShop
          packages={packages}
          selectedToken={selectedToken}
          onSelectToken={onSelectToken}
          onPurchase={(i) => { onPurchase(i); setTimeShopOpen(false); }}
          loading={purchaseLoading}
          onClose={() => setTimeShopOpen(false)}
          balances={balances}
        />
      )}

      {/* Pause modal */}
      {paused && (
        <PauseModal
          onResume={handleResume}
          onGoHome={() => { setPaused(false); onGoHome?.(); }}
          muted={muted}
          onToggleMute={onToggleMute}
          musicMuted={musicMuted}
          onToggleMusic={onToggleMusic}
        />
      )}

      {/* Guest trial expired overlay */}
      {isGuestMode && guestTrialExpired && (
        <GuestTrialExpiredModal
          score={score}
          onConnectSocial={onConnectSocial}
          onConnectWallet={onConnectWallet}
          socialLoading={socialLoading}
          onRetryGuest={onRetryGuest}
        />
      )}

      {/* Session-failed overlay — shown when the start-game tx failed */}
      {sessionStatus === 'failed' && !paused && !sessionFailDismissed && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 140,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '0 24px',
          background: 'rgba(4,0,12,0.82)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          animation: 'nukko-fade-in 0.2s ease-out',
        }}>
          <div style={{
            width: '100%', maxWidth: 320,
            background: 'linear-gradient(160deg, #200818 0%, #100410 100%)',
            border: '1px solid rgba(255,59,59,0.25)',
            borderRadius: 24,
            overflow: 'hidden',
            boxShadow: '0 24px 70px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,59,59,0.12)',
            animation: 'nukko-score-pop 0.22s cubic-bezier(.22,1,.36,1)',
          }}>
            {/* Red accent top bar */}
            <div style={{ height: 3, background: 'linear-gradient(90deg, #ff4646, #ff8a46, #ff4646)' }} />

            <div style={{ padding: '24px 20px 22px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
              {/* Icon */}
              <div style={{
                width: 48, height: 48, borderRadius: 16,
                background: 'rgba(255,59,59,0.12)', border: '1px solid rgba(255,59,59,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 2,
              }}>
                <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                  <circle cx="11" cy="11" r="9" stroke="#ff6060" strokeWidth="1.5"/>
                  <path d="M11 7v5" stroke="#ff6060" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="11" cy="15.5" r="1" fill="#ff6060"/>
                </svg>
              </div>

              <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 900, fontSize: 20, color: '#fff' }}>
                Session Failed
              </div>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 13, color: 'rgba(255,255,255,0.5)',
                textAlign: 'center', lineHeight: 1.55,
              }}>
                The on-chain session could not be started — your score <strong style={{ color: 'rgba(255,180,180,0.85)' }}>will not be recorded</strong> on the leaderboard.
              </div>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 12, color: 'rgba(255,180,60,0.75)',
                textAlign: 'center',
              }}>
                This usually means insufficient CELO for gas fees.
              </div>
            </div>

            <div style={{ padding: '0 20px 22px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              {/* Go home — primary */}
              <button onClick={onGoHome} style={{
                width: '100%', height: 52, borderRadius: 14,
                background: theme.gradient,
                border: 'none', color: '#fff',
                fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 15,
                cursor: 'pointer',
                boxShadow: `0 4px 20px rgba(${theme.primaryRGB},0.35)`,
              }}>
                Back to Home
              </button>
              {/* Keep playing — ghost */}
              <button
                onClick={() => setSessionFailDismissed(true)}
                style={{
                  width: '100%', height: 46, borderRadius: 14,
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.38)',
                  fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer',
                }}>
                Keep Playing (unranked)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
