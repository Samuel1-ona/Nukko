import { useEffect, useCallback, useRef, useState } from 'react';
import { RecordIcon, TrophyIcon, GemIcon, BoltIcon, PauseIcon } from '../ui/Icons.jsx';
import { HudPanel } from '../ui/kit.jsx';
import { INK, DIM, FAINT, RULE, GOLD, GREEN, RED, DISPLAY, BODY, NUM } from '../../theme/tokens.js';
import CosmicBackground from '../ui/CosmicBackground.jsx';
import BottomBar        from '../ui/BottomBar.jsx';
import PowerUpShop      from '../ui/PowerUpShop.jsx';
import TimeShop         from '../ui/TimeShop.jsx';
import Toast            from '../ui/Toast.jsx';
import PauseModal       from '../ui/PauseModal.jsx';
import DiscoveryOverlay from '../ui/DiscoveryOverlay.jsx';
import { FRUITS, drawFruitOnCtx } from '../../game/fruits.js';
import { useTheme }     from '../../theme/ThemeContext.jsx';

// Chain tiers — colour escalates with depth so a big cascade is legible at a
// glance without reading the number.
const CHAIN_TIERS = [
  { at: 2, color: '#ffffff' },
  { at: 3, color: '#00d4ff' },
  { at: 4, color: '#ffd700' },
  { at: 5, color: '#ff8a4a' },
  { at: 6, color: '#ff3ba0' },
];

function chainColor(count) {
  let c = CHAIN_TIERS[0].color;
  for (const t of CHAIN_TIERS) if (count >= t.at) c = t.color;
  return c;
}

/**
 * Remaining collapse budget. Three breaches of the danger line cost time; the
 * fourth ends the run, so the count has to be on screen — a fail state the
 * player cannot see is one they can only learn by losing to it.
 */
function BreachPips({ used, limit }) {
  const left = Math.max(0, limit - used);
  const critical = left === 0;
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 3 }}
      title={critical ? 'Next breach ends the run' : `${left} breach${left === 1 ? '' : 'es'} left`}
    >
      {Array.from({ length: limit }, (_, i) => {
        const spent = i < used;
        return (
          <span
            key={i}
            className={critical ? 'nk-motion' : undefined}
            style={{
              width: 5, height: 9, borderRadius: 1.5,
              background: spent ? 'rgba(233,224,246,0.14)' : RED,
              boxShadow: spent ? 'none' : `0 0 6px ${RED}99`,
              animation: critical ? 'nukko-danger 0.9s ease-in-out infinite' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * Live chain meter. Chains used to be an invisible 450ms accident — you cannot
 * build mastery around a window you can't see, so this draws the remaining time
 * as a draining bar and names the multiplier you're currently riding.
 */
function ChainMeter({ chain }) {
  const [pct, setPct] = useState(0);
  const active = chain.count >= 2 && pct > 0;

  useEffect(() => {
    if (chain.count < 2) { setPct(0); return; }
    let raf;
    const startedAt = Date.now();
    const total = Math.max(1, chain.expiresAt - startedAt);
    const tick = () => {
      const left = chain.expiresAt - Date.now();
      const p = Math.max(0, Math.min(1, left / total));
      setPct(p);
      if (p > 0) raf = requestAnimationFrame(tick);
    };
    tick();
    return () => cancelAnimationFrame(raf);
  }, [chain.key, chain.count, chain.expiresAt]);

  const color = chainColor(chain.count);
  const multiplier = (1 + (chain.count - 1) * 0.4).toFixed(1);

  return (
    <div style={{ marginTop: 10, marginBottom: 2, height: 26 }}>
      {active ? (
        <>
          <div style={{
            display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
            marginBottom: 5, gap: 8,
          }}>
            <span key={chain.key} style={{
              display: 'inline-flex', alignItems: 'baseline', gap: 5,
              fontFamily: DISPLAY, fontSize: 14, fontWeight: 600,
              letterSpacing: '0.08em', color,
              textShadow: `0 0 14px ${color}`,
              animation: 'nukko-pop .25s ease-out',
            }}>
              CHAIN
              <span style={{ fontFamily: NUM, fontSize: 15, fontWeight: 700 }}>×{multiplier}</span>
            </span>
            <span style={{
              fontFamily: BODY, fontSize: 8.5, fontWeight: 800,
              letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT,
            }}>{chain.count} linked</span>
          </div>
          {/* Segmented drain — a bar of cells reads as a gauge, not a loader */}
          <div style={{ display: 'flex', gap: 2, height: 5 }}>
            {Array.from({ length: 12 }, (_, i) => {
              const lit = pct * 12 > i;
              return (
                <div key={i} style={{
                  flex: 1, borderRadius: 1,
                  background: lit ? color : 'rgba(0,0,0,0.45)',
                  boxShadow: lit ? `0 0 8px ${color}` : 'none',
                }} />
              );
            })}
          </div>
        </>
      ) : (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%',
          fontFamily: BODY, fontSize: 9, fontWeight: 800,
          letterSpacing: '0.18em', textTransform: 'uppercase',
          color: 'rgba(233,224,246,0.16)',
        }}>
          merge fast to chain
        </div>
      )}
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
              { Icon: TrophyIcon, color: '#ffd700', label: 'Submit score to the global leaderboard' },
              { Icon: GemIcon,    color: '#00d4ff', label: 'Earn CELO rewards for every game' },
              { Icon: BoltIcon,   color: '#ffd700', label: 'Bomb & Expand power-ups' },
            ].map(({ Icon, color, label }) => (
              <div key={label} style={{
                display: 'flex', alignItems: 'center', gap: 9,
                fontFamily: '"Nunito", system-ui', fontSize: 12,
                color: 'rgba(255,255,255,0.58)', marginBottom: 7, lineHeight: 1.3,
              }}>
                <Icon size={14} color={color} />
                <span>{label}</span>
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
  holdIdx,
  canHold,
  onSwapHold,
  chain,
  timeDelta,
  discovery,
  onDiscoveryDone,
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
  collapsesUsed = 0,
  collapseLimit = 3,
  finalBreach = false,
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

  const handlePause  = () => !gameOver && !finalBreach && setPaused(true);
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

  // Draw the queue previews + hold slot. Two-deep lookahead plus a bank is what
  // turns a reactive drop into a plan.
  useEffect(() => {
    const paint = (id, idx, size, maxR, alpha = 1) => {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = '#050009';
      ctx.fillRect(0, 0, size, size);
      if (idx === null || idx === undefined) return;
      drawFruitOnCtx(ctx, size / 2, size / 2, Math.min(FRUITS[idx].r, maxR), idx, alpha);
    };
    paint('next-canvas',  nextIdx,     46, 16);
    paint('next2-canvas', nextNextIdx, 26,  9, 0.75);
    paint('hold-canvas',  holdIdx,     26,  9, canHold ? 1 : 0.4);
  }, [nextIdx, nextNextIdx, holdIdx, canHold]);

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
      } else if (e.key === 'ArrowUp' || e.key === 'Shift') {
        e.preventDefault();
        onSwapHold?.();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [gameOver, movePointer, dropFruit, onSwapHold, containerWidth]);

  const urgent = remaining <= 10;
  // timeDelta persists in engine state until the next one, so gate the visuals
  // on a short-lived flag — otherwise a single collapse would leave the timer
  // pill tinted red for the rest of the run.
  const [deltaLive, setDeltaLive] = useState(false);
  useEffect(() => {
    if (!timeDelta) { setDeltaLive(false); return; }
    setDeltaLive(true);
    const t = setTimeout(() => setDeltaLive(false), 1300);
    return () => clearTimeout(t);
  }, [timeDelta?.key]);
  const penalty = deltaLive && !!timeDelta && timeDelta.amount < 0;
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
          <div style={{ padding: '16px 16px 10px', flexShrink: 0, position: 'relative' }}>

            {/* Pause button — top-right corner of HUD */}
            <button
              onClick={handlePause}
              disabled={gameOver || finalBreach}
              className="nk-press-sm"
              style={{
                position: 'absolute', top: 14, right: 16,
                width: 32, height: 32, borderRadius: '50%', padding: 0,
                background: 'transparent',
                border: `1px solid ${RULE}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: (gameOver || finalBreach) ? 'not-allowed' : 'pointer',
                opacity: (gameOver || finalBreach) ? 0.35 : 1,
                zIndex: 2,
              }}
            >
              <PauseIcon size={13} color={DIM} />
            </button>

            {/* 3-column row: Timer | Next | Score */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr',
              alignItems: 'center',
              gap: 8,
              paddingRight: 44,  /* leave room for pause button */
            }}>

              {/* Left: Timer pill + signed time-change pulse.
                  A collapse steals half the clock, so the pill itself has to
                  react — a floating number alone is too easy to miss. */}
              <div style={{ position: 'relative', width: 'fit-content' }}>
                <div
                  key={penalty ? `hit-${timeDelta.key}` : 'idle'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '6px 11px', borderRadius: 9,
                    background: penalty
                      ? 'rgba(255,59,59,0.32)'
                      : urgent ? 'rgba(255,59,59,0.15)' : 'rgba(0,0,0,0.4)',
                    border: `1px solid ${(penalty || urgent) ? 'rgba(255,59,59,0.7)' : RULE}`,
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                    animation: penalty
                      ? 'nukko-time-hit 0.7s ease-out'
                      : urgent ? 'nukko-pulse-bg 0.8s ease-in-out infinite' : 'none',
                  }}
                >
                  <div style={{
                    width: 5, height: 5, borderRadius: '50%',
                    background: (penalty || urgent) ? '#ff3b3b' : theme.secondary,
                    flexShrink: 0,
                    boxShadow: `0 0 6px ${(penalty || urgent) ? '#ff3b3b' : theme.secondary}`,
                  }} />
                  <div style={{
                    fontFamily: NUM, fontWeight: 700, fontSize: 18,
                    color: (penalty || urgent) ? '#ff3b3b' : INK, letterSpacing: '-0.03em',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    {fmt(remaining)}
                  </div>
                </div>

                {/* Signed pulse: green when a big merge buys time, red when a
                    collapse takes it. Same slot so the clock is the one place
                    the player learns to watch. */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 5, marginTop: 5, paddingLeft: 2,
                }}>
                  <BreachPips used={collapsesUsed} limit={collapseLimit} />
                  <span style={{
                    fontFamily: BODY, fontSize: 7.5, fontWeight: 800,
                    letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: collapsesUsed >= collapseLimit ? RED : FAINT,
                  }}>
                    {collapsesUsed >= collapseLimit ? 'Final' : 'Breaches'}
                  </span>
                </div>

                {timeDelta && deltaLive && (
                  <div key={timeDelta.key} style={{
                    position: 'absolute', left: '50%', top: penalty ? -10 : -6,
                    transform: 'translateX(-50%)',
                    fontFamily: NUM, fontWeight: 700,
                    fontSize: penalty ? 19 : 15,
                    color: penalty ? '#ff3b3b' : GREEN,
                    textShadow: penalty
                      ? '0 0 16px rgba(255,59,59,1)'
                      : '0 0 12px rgba(0,230,118,0.9)',
                    animation: 'nukko-rise 1.2s ease-out forwards',
                    pointerEvents: 'none', whiteSpace: 'nowrap',
                  }}>
                    {penalty ? `−${Math.abs(timeDelta.amount)}s` : `+${timeDelta.amount}s`}
                  </div>
                )}
              </div>

              {/* Center: HOLD · NEXT · AFTER */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5 }}>
                {/* Hold slot */}
                <button
                  onClick={onSwapHold}
                  disabled={!canHold || gameOver}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                    background: 'none', border: 'none', padding: 0,
                    cursor: (canHold && !gameOver) ? 'pointer' : 'not-allowed',
                    opacity: (canHold && !gameOver) ? 1 : 0.45,
                    WebkitTapHighlightColor: 'transparent',
                  }}
                >
                  <div style={{
                    fontFamily: BODY, fontWeight: 800, fontSize: 8,
                    color: canHold ? theme.secondary : FAINT,
                    textTransform: 'uppercase', letterSpacing: '0.18em',
                  }}>Hold</div>
                  <HudPanel
                    notch={6}
                    accent={canHold ? `rgba(${theme.secondaryRGB},0.5)` : RULE}
                    style={{ width: 'auto' }}
                    innerStyle={{ padding: 3 }}
                  >
                    <canvas id="hold-canvas" width={26} height={26} style={{ display: 'block' }} />
                  </HudPanel>
                </button>

                {/* Next */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{
                    fontFamily: BODY, fontWeight: 800, fontSize: 9,
                    color: DIM, textTransform: 'uppercase', letterSpacing: '0.22em',
                  }}>
                    Next
                  </div>
                  <HudPanel
                    notch={9}
                    accent="rgba(233,224,246,0.34)"
                    style={{ width: 'auto', boxShadow: `0 4px 18px rgba(0,0,0,0.5)` }}
                    innerStyle={{ padding: 4 }}
                  >
                    <canvas id="next-canvas" width={46} height={46} style={{ display: 'block' }} />
                  </HudPanel>
                </div>

                {/* Second lookahead */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                  <div style={{
                    fontFamily: BODY, fontWeight: 800, fontSize: 8,
                    color: 'rgba(233,224,246,0.24)', textTransform: 'uppercase', letterSpacing: '0.18em',
                  }}>After</div>
                  <HudPanel
                    notch={6}
                    accent={RULE}
                    style={{ width: 'auto' }}
                    innerStyle={{ padding: 3 }}
                  >
                    <canvas id="next2-canvas" width={26} height={26} style={{ display: 'block' }} />
                  </HudPanel>
                </div>
              </div>

              {/* Right: Score */}
              <div style={{ textAlign: 'right' }}>
                <div style={{
                  fontFamily: BODY, fontWeight: 800, fontSize: 9,
                  color: DIM, textTransform: 'uppercase', letterSpacing: '0.22em',
                }}>
                  Score
                </div>
                <div style={{
                  fontFamily: NUM, fontWeight: 700, fontSize: 23,
                  color: GOLD, letterSpacing: '-0.03em', lineHeight: 1,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {Number(score).toLocaleString()}
                </div>
                {personalBest > 0 && (
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 3,
                    fontFamily: NUM, fontSize: 10,
                    color: score > personalBest ? theme.secondary : 'rgba(233,224,246,0.26)',
                    fontVariantNumeric: 'tabular-nums',
                    marginTop: 2,
                    transition: 'color 0.4s ease',
                  }}>
                    {score > personalBest && <RecordIcon size={10} color={theme.secondary} />}
                    PB {Number(personalBest).toLocaleString()}
                  </div>
                )}
              </div>
            </div>

            <ChainMeter chain={chain ?? { count: 0, expiresAt: 0, key: 0 }} />

            {/* Session badge — compact, below HUD row */}
            {sessionInfo && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                fontSize: 9, fontWeight: 800, fontFamily: BODY,
                letterSpacing: '0.14em', textTransform: 'uppercase',
                padding: '4px 10px', borderRadius: 7, marginTop: 8,
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
            <DiscoveryOverlay discovery={discovery} onDone={onDiscoveryDone} />
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
                fontFamily: BODY, fontSize: 12, fontWeight: 700,
                color: FAINT, textAlign: 'center', lineHeight: 1.4,
              }}>
                Connect wallet to unlock power-ups &amp; earn CELO
              </div>
            </div>
          ) : powerUpsEnabled ? (
            <div style={{
              flexShrink: 0,
              borderTop: `1px solid ${RULE}`,
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(8,1,15,0.94) 100%)',
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
