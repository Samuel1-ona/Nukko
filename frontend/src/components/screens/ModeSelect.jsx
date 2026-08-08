import { useState } from 'react';
import CosmicBackground from '../ui/CosmicBackground.jsx';
import BackChevron      from '../ui/BackChevron.jsx';
import Planet            from '../ui/Planet.jsx';
import { LockIcon }      from '../ui/Icons.jsx';
import { useTheme }      from '../../theme/ThemeContext.jsx';

const MODES = [
  { id: 'merge',  name: 'Merge Cosmos',  desc: 'Drop, merge, evolve — the original', stage: 9, live: true },
  { id: 'orbit',  name: 'Orbit Rush',    desc: 'Race the clock through asteroid fields', stage: 4, live: false },
  { id: 'puzzle', name: 'Nebula Puzzle', desc: 'Match cosmic patterns before they collapse', stage: 8, live: false },
];

export default function ModeSelect({ onBack, onSelectMerge }) {
  const { theme } = useTheme();
  const [toast, setToast] = useState(null);
  const [shake, setShake] = useState(null);

  function tapLocked(id) {
    setShake(id);
    setToast('Coming soon');
    setTimeout(() => setShake(null), 420);
    setTimeout(() => setToast(null), 1800);
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '18px 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <BackChevron onClick={onBack} />
            <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 21, color: '#fff' }}>
              Choose a mode
            </div>
          </div>
          <div style={{
            marginTop: 6, marginLeft: 54, fontFamily: '"Nunito", system-ui', fontSize: 13,
            color: 'rgba(255,255,255,0.6)',
          }}>
            More cosmic ways to play are on the way
          </div>

          <div style={{ flex: 1, overflow: 'auto', marginTop: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {MODES.map(m => (
              <div key={m.id}
                onClick={() => m.live ? onSelectMerge() : tapLocked(m.id)}
                style={{
                  position: 'relative', borderRadius: 22, padding: '18px 18px',
                  display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer',
                  background: m.live
                    ? `linear-gradient(135deg, rgba(${theme.primaryRGB},0.22), rgba(${theme.secondaryRGB},0.14))`
                    : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${m.live ? `rgba(${theme.primaryRGB},0.45)` : 'rgba(255,255,255,0.08)'}`,
                  opacity: m.live ? 1 : 0.68,
                  animation: shake === m.id ? 'nukko-badge-shake 0.4s ease-in-out' : 'none',
                  boxShadow: m.live ? `0 12px 30px -12px rgba(${theme.primaryRGB},0.5)` : 'none',
                }}>
                <div style={{
                  width: 62, height: 62, borderRadius: 16, flexShrink: 0,
                  background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  filter: m.live ? 'none' : 'grayscale(0.7) brightness(0.7)',
                }}>
                  <Planet stage={m.stage} size={44} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 17, color: '#fff' }}>{m.name}</div>
                    {m.live ? (
                      <span style={{
                        fontFamily: '"Space Mono", monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.14em',
                        color: '#00e676', background: 'rgba(0,230,118,0.14)', border: '1px solid rgba(0,230,118,0.4)',
                        padding: '2px 7px', borderRadius: 99,
                      }}>LIVE</span>
                    ) : (
                      <span style={{
                        fontFamily: '"Space Mono", monospace', fontSize: 9, fontWeight: 700, letterSpacing: '0.1em',
                        color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
                        padding: '2px 7px', borderRadius: 99, display: 'inline-flex', alignItems: 'center', gap: 4,
                      }}><LockIcon size={10} color="rgba(255,255,255,0.7)" /> SOON</span>
                    )}
                  </div>
                  <div style={{ marginTop: 4, fontFamily: '"Nunito", system-ui', fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {toast && (
          <div style={{
            position: 'absolute', left: '50%', bottom: 40, transform: 'translateX(-50%)',
            padding: '10px 18px', borderRadius: 99,
            background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
            color: '#fff', fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 13,
            backdropFilter: 'blur(8px)', animation: 'nukko-toast .3s ease-out', whiteSpace: 'nowrap',
          }}>{toast}</div>
        )}
      </CosmicBackground>
    </div>
  );
}
