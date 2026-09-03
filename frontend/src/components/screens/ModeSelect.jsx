import { useState } from 'react';
import Planet from '../ui/Planet.jsx';
import { LockIcon, PlayIcon } from '../ui/Icons.jsx';
import { Screen, ScreenHeader, SectionHead, PrimaryButton, Reveal } from '../ui/kit.jsx';
import { INK, DIM, FAINT, RULE, DISPLAY, BODY, NUM } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

const MODES = [
  { id: 'merge',  name: 'Merge Cosmos',  desc: 'Drop, merge, evolve — the original',        stage: 9, live: true },
  { id: 'orbit',  name: 'Orbit Rush',    desc: 'Race the clock through asteroid fields',    stage: 4, live: false },
  { id: 'puzzle', name: 'Nebula Puzzle', desc: 'Match cosmic patterns before they collapse', stage: 8, live: false },
];

function ModeRow({ mode, shaking, selected, onSelect, delay }) {
  const { theme } = useTheme();
  const accent = mode.live ? (selected ? theme.primary : RULE) : RULE;

  return (
    <Reveal delay={delay}>
      <button
        onClick={onSelect}
        className="nk-press"
        style={{
          display: 'block', width: '100%', textAlign: 'left',
          padding: '14px 0 14px 16px', marginBottom: 4,
          background: 'none', border: 'none',
          borderLeft: `2px solid ${accent}`,
          opacity: mode.live ? 1 : 0.5,
          animation: shaking ? 'nukko-badge-shake 0.4s ease-in-out' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{
            flexShrink: 0,
            filter: mode.live ? 'none' : 'grayscale(0.85) brightness(0.6)',
          }}>
            <Planet stage={mode.stage} size={40} glow={mode.live} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{
                fontFamily: DISPLAY, fontWeight: 600, fontSize: 17, color: INK,
              }}>
                {mode.name}
              </span>
              {!mode.live && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  fontFamily: BODY, fontSize: 8.5, fontWeight: 800, letterSpacing: '0.14em',
                  color: FAINT,
                }}>
                  <LockIcon size={9} color={FAINT} /> SOON
                </span>
              )}
            </div>
            <div style={{ marginTop: 2, fontFamily: BODY, fontSize: 12, color: DIM }}>
              {mode.desc}
            </div>
          </div>

          {mode.live && selected && (
            <div style={{
              width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
              background: theme.primary,
              boxShadow: `0 0 8px ${theme.primary}`,
            }} />
          )}
        </div>
      </button>
    </Reveal>
  );
}

export default function ModeSelect({ onBack, onSelectMerge }) {
  const [toast, setToast] = useState(null);
  const [shake, setShake] = useState(null);
  // Only one mode ships today, but the screen is titled "Choose a mode" — so
  // the rows select and the button commits, rather than both doing the same job.
  const [selected, setSelected] = useState('merge');

  function tapLocked(id) {
    setShake(id);
    setToast('Coming soon');
    setTimeout(() => setShake(null), 420);
    setTimeout(() => setToast(null), 1800);
  }

  return (
    <Screen intensity="medium">
      <ScreenHeader
        title="Choose a mode"
        subtitle="More cosmic ways to play are on the way"
        onBack={onBack}
      />

      <div style={{ flex: '1 1 auto', overflowY: 'auto', marginTop: 22 }}>
        <SectionHead delay={60}>Modes</SectionHead>
        {MODES.map((m, i) => (
          <ModeRow
            key={m.id}
            mode={m}
            shaking={shake === m.id}
            selected={selected === m.id}
            delay={80 + i * 50}
            onSelect={() => (m.live ? setSelected(m.id) : tapLocked(m.id))}
          />
        ))}
      </div>

      <Reveal delay={240} style={{ flex: '0 0 auto', paddingTop: 12 }}>
        <PrimaryButton onClick={onSelectMerge} icon={<PlayIcon size={13} />}>
          Play {MODES.find(m => m.id === selected)?.name ?? 'Merge Cosmos'}
        </PrimaryButton>
      </Reveal>

      {toast && (
        <div style={{
          position: 'absolute', left: '50%', bottom: 92, transform: 'translateX(-50%)',
          padding: '9px 16px', borderRadius: 99,
          background: 'rgba(20,6,38,0.9)', border: `1px solid ${RULE}`,
          color: INK, fontFamily: BODY, fontWeight: 700, fontSize: 12.5,
          animation: 'nukko-toast .3s ease-out', whiteSpace: 'nowrap',
        }}>
          {toast}
        </div>
      )}
    </Screen>
  );
}
