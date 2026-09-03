import { useState, useEffect, useRef } from 'react';
import { FRUITS, drawFruitOnCtx } from '../../game/fruits.js';
import {
  BombIcon, ExpandIcon, ClockIcon,
  DragIcon, DropIcon, ArrowRightIcon, WarningIcon, RocketIcon, ChevronLeftIcon,
} from './Icons.jsx';
import { PrimaryButton } from './kit.jsx';
import { INK, DIM, FAINT, RULE, DISPLAY, BODY } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

// ── Planet rendered with the actual game engine ────────────────────────────
function PlanetCanvas({ idx, size = 72 }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    drawFruitOnCtx(ctx, size / 2, size / 2, size * 0.42, idx, 1);
  }, [idx, size]);
  return <canvas ref={ref} width={size} height={size} style={{ display: 'block' }} />;
}

// ── Per-slide visuals ──────────────────────────────────────────────────────

function VisualWelcome() {
  const stages = [0, 3, 6, 9, 13];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 6, padding: '8px 0' }}>
      {stages.map((idx, i) => {
        const base = 36;
        const grow = (i / (stages.length - 1)) * 52;
        const size = Math.round(base + grow);
        return (
          <div key={idx} style={{
            filter: `drop-shadow(0 0 ${6 + i * 3}px ${FRUITS[idx].color}88)`,
            animation: `nukko-bob ${1.8 + i * 0.3}s ease-in-out infinite`,
            animationDelay: `${i * 0.28}s`,
          }}>
            <PlanetCanvas idx={idx} size={size} />
          </div>
        );
      })}
    </div>
  );
}

function VisualDrop() {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28 }}>

      {/* Left: aim column */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0 }}>
        <div style={{ filter: `drop-shadow(0 0 10px rgba(${theme.secondaryRGB},0.53))` }}>
          <PlanetCanvas idx={4} size={60} />
        </div>
        {/* drop line */}
        <div style={{ width: 2, height: 44, background: `linear-gradient(to bottom, rgba(${theme.secondaryRGB},0.7), rgba(${theme.secondaryRGB},0))`, borderRadius: 1 }} />
        {/* landing ghost */}
        <div style={{ width: 50, height: 50, borderRadius: '50%', border: `2px dashed rgba(${theme.secondaryRGB},0.45)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <PlanetCanvas idx={4} size={40} />
        </div>
      </div>

      {/* Right: labels */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `rgba(${theme.secondaryRGB},0.15)`, border: `1px solid rgba(${theme.secondaryRGB},0.5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DragIcon size={14} color={theme.secondary} />
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: '"Nunito",system-ui', lineHeight: 1.3 }}>Drag to aim</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: `rgba(${theme.primaryRGB},0.15)`, border: `1px solid rgba(${theme.primaryRGB},0.5)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DropIcon size={14} color={theme.primary} />
          </div>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontFamily: '"Nunito",system-ui', lineHeight: 1.3 }}>Release to drop</span>
        </div>
      </div>
    </div>
  );
}

function VisualMerge() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
      <div style={{ filter: 'drop-shadow(0 0 8px #c9c4ba66)' }}>
        <PlanetCanvas idx={4} size={66} />
      </div>
      <span style={{ fontSize: 22, color: '#ffd700', fontWeight: 900, fontFamily: '"Space Mono",monospace', lineHeight: 1 }}>+</span>
      <div style={{ filter: 'drop-shadow(0 0 8px #c9c4ba66)' }}>
        <PlanetCanvas idx={4} size={66} />
      </div>
      <ArrowRightIcon size={20} color={FAINT} />
      <div style={{ position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: -10, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,215,0,0.28) 0%, transparent 70%)',
          animation: 'nukko-glow-pulse 1.4s ease-in-out infinite',
        }} />
        <div style={{ filter: 'drop-shadow(0 0 12px #d4a57488)' }}>
          <PlanetCanvas idx={5} size={82} />
        </div>
      </div>
    </div>
  );
}

function VisualDanger() {
  return (
    <div style={{ position: 'relative', width: 200, height: 130, margin: '0 auto' }}>
      {/* Pulsing danger background */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 48,
        background: 'rgba(255,40,40,0.08)',
        borderRadius: '8px 8px 0 0',
        animation: 'nukko-danger 1s ease-in-out infinite',
      }} />
      {/* Danger line */}
      <div style={{
        position: 'absolute', top: 46, left: 0, right: 0, height: 2,
        background: '#ff3b3b',
        boxShadow: '0 0 10px #ff3b3b, 0 0 20px rgba(255,59,59,0.4)',
      }} />
      <div style={{
        position: 'absolute', top: 30, left: '50%', transform: 'translateX(-50%)',
        fontSize: 9, fontWeight: 800, color: '#ff3b3b', letterSpacing: '0.12em',
        whiteSpace: 'nowrap', fontFamily: '"Space Mono",monospace',
        background: 'rgba(255,59,59,0.15)', border: '1px solid rgba(255,59,59,0.45)',
        borderRadius: 6, padding: '2px 8px',
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        <WarningIcon size={10} color="#ff3b3b" />
        DANGER ZONE
      </div>
      {/* Stacked planets near the line */}
      <div style={{
        position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: -4,
      }}>
        <PlanetCanvas idx={2} size={44} />
        <PlanetCanvas idx={3} size={54} />
        <PlanetCanvas idx={1} size={40} />
      </div>
    </div>
  );
}

function VisualPowerups() {
  const items = [
    { icon: <BombIcon size={26} color="#ffd700" />, label: 'Bomb', desc: 'Blasts away the top planets', color: '#ffd700' },
    { icon: <ExpandIcon size={26} color="#00d4ff" />, label: 'Expand', desc: 'Widens the vacuum', color: '#00d4ff' },
    { icon: <ClockIcon size={26} color="#a78bff" />, label: 'Time', desc: 'Adds precious seconds', color: '#a78bff' },
  ];
  return (
    <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
      {items.map(({ icon, label, desc, color }) => (
        <div key={label} style={{
          flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          padding: '10px 6px 12px',
          background: `${color}12`,
          border: `1px solid ${color}38`,
          borderRadius: 14,
        }}>
          <div style={{ filter: `drop-shadow(0 0 6px ${color}88)` }}>{icon}</div>
          <div style={{ fontSize: 11, fontWeight: 800, color, fontFamily: '"Nunito",system-ui' }}>{label}</div>
          <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.48)', textAlign: 'center', lineHeight: 1.35, fontFamily: '"Nunito",system-ui' }}>{desc}</div>
        </div>
      ))}
    </div>
  );
}

// ── Slide definitions ──────────────────────────────────────────────────────
const SLIDES = [
  {
    id: 'welcome',
    Visual: VisualWelcome,
    title: 'Welcome to Nukko',
    body: 'A cosmic puzzle where you drop planets, trigger merges, and evolve the universe one collision at a time.',
  },
  {
    id: 'drop',
    Visual: VisualDrop,
    title: 'Aim & Drop',
    body: 'Drag left or right to position your shot, then release to drop. The top-center preview shows your next planet — plan ahead!',
  },
  {
    id: 'merge',
    Visual: VisualMerge,
    title: 'Same + Same = Bigger',
    body: 'Two identical planets collide and evolve into the next stage. Chain rapid merges for a combo multiplier up to 8×!',
  },
  {
    id: 'danger',
    Visual: VisualDanger,
    title: 'Mind the Danger Zone',
    body: 'A planet resting above the red line collapses the stack and halves your clock. You get three of those — the fourth breach ends the run. Keep the stack low and chain merges to clear space fast.',
  },
  {
    id: 'powerups',
    Visual: VisualPowerups,
    title: 'Power-Ups',
    body: 'Tap any bottom-bar item to use or buy power-ups. They cost tokens but can save a run at the critical moment.',
  },
];

// ── Main component ─────────────────────────────────────────────────────────
export default function HowToPlay({ onDone }) {
  const { theme } = useTheme();
  const [step, setStep]     = useState(0);
  const [exiting, setExiting] = useState(false); // slide-exit direction
  const [dir, setDir]       = useState(1);        // 1 = forward, -1 = back

  const total = SLIDES.length;
  const { Visual, title, body } = SLIDES[step];
  const isLast = step === total - 1;

  function go(delta) {
    setDir(delta);
    setExiting(true);
    setTimeout(() => {
      setStep((s) => s + delta);
      setExiting(false);
    }, 180);
  }

  function finish() {
    onDone?.();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px 16px',
      background: 'rgba(4,0,10,0.78)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      animation: 'nukko-fade-in 0.22s ease-out',
    }}>
      {/* Card */}
      <div style={{
        width: '100%', maxWidth: 380,
        background: 'linear-gradient(170deg, #1c0838 0%, #0e0420 100%)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: `0 24px 80px rgba(0,0,0,0.7), 0 0 80px rgba(${theme.primaryRGB},0.18)`,
        animation: 'nukko-slide-up 0.28s cubic-bezier(.22,1,.36,1)',
      }}>

        {/* Top bar: progress dots + skip */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px 0',
        }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {SLIDES.map((_, i) => (
              <div key={i} style={{
                width: i === step ? 18 : 6, height: 6,
                borderRadius: 3,
                background: i === step
                  ? theme.primary
                  : i < step ? `rgba(${theme.primaryRGB},0.5)` : RULE,
                transition: 'width 0.25s ease, background 0.25s ease',
              }} />
            ))}
          </div>
          <button onClick={finish} className="nk-press-sm" style={{
            background: 'none', border: 'none', padding: '4px 0',
            fontSize: 11.5, fontWeight: 800, color: FAINT,
            fontFamily: BODY, cursor: 'pointer',
          }}>
            Skip
          </button>
        </div>

        {/* Visual area */}
        <div style={{
          minHeight: 148,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px 24px 4px',
          opacity: exiting ? 0 : 1,
          transform: exiting
            ? `translateX(${dir * -28}px)`
            : 'translateX(0)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}>
          <Visual />
        </div>

        {/* Text content */}
        <div style={{
          padding: '14px 24px 0',
          opacity: exiting ? 0 : 1,
          transform: exiting ? `translateX(${dir * -20}px)` : 'translateX(0)',
          transition: 'opacity 0.18s ease, transform 0.18s ease',
        }}>
          <div style={{
            fontSize: 22, fontWeight: 600, color: INK,
            fontFamily: DISPLAY, lineHeight: 1.2, marginBottom: 8,
          }}>
            {title}
          </div>
          <div style={{
            fontSize: 13.5, color: DIM,
            fontFamily: BODY, lineHeight: 1.65,
          }}>
            {body}
          </div>
        </div>

        {/* Navigation */}
        <div style={{
          display: 'flex', gap: 10, padding: '18px 24px 24px',
        }}>
          {/* Back button — hidden on first slide */}
          {step > 0 && (
            <button onClick={() => go(-1)} aria-label="Previous" className="nk-press" style={{
              flex: '0 0 48px', height: 48,
              background: 'transparent',
              border: `1px solid ${RULE}`,
              borderRadius: 12,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <ChevronLeftIcon size={16} color={DIM} />
            </button>
          )}

          {/* Next / Let's Play */}
          <PrimaryButton
            onClick={isLast ? finish : () => go(1)}
            height={48}
            style={{ flex: 1, width: 'auto' }}
            icon={isLast ? <RocketIcon size={15} color="#fff" /> : undefined}
          >
            {isLast ? "Let's Play" : 'Next'}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
