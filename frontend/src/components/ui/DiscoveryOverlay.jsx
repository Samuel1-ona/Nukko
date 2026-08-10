import { useEffect } from 'react';
import Planet, { PLANET_DATA } from './Planet.jsx';
import { useTheme } from '../../theme/ThemeContext.jsx';

/**
 * Fires the first time a player ever merges into a given planet stage.
 * Non-blocking and pointer-transparent — it plays over live gameplay rather
 * than interrupting it, because stopping the run to celebrate would fight the
 * flow state the discovery is rewarding.
 */
export default function DiscoveryOverlay({ discovery, onDone }) {
  useEffect(() => {
    if (!discovery) return;
    const t = setTimeout(() => onDone?.(), 2200);
    return () => clearTimeout(t);
  }, [discovery, onDone]);

  const { theme } = useTheme();
  if (!discovery) return null;

  const planet = PLANET_DATA[discovery.stage - 1];
  if (!planet) return null;

  return (
    <div
      key={discovery.key}
      style={{
        position: 'absolute', inset: 0, zIndex: 90,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        pointerEvents: 'none',
      }}
    >
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at center, rgba(10,0,21,0.72) 0%, rgba(10,0,21,0.25) 70%, transparent 100%)',
        animation: 'nukko-fade-in 0.3s ease-out',
      }} />

      {/* Expanding rings */}
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          position: 'absolute', width: 60, height: 60, borderRadius: '50%',
          border: `2px solid ${theme.secondary}`,
          boxShadow: `0 0 30px ${theme.secondary}80`,
          animation: `nukko-milestone-ring 1.8s ease-out ${i * 0.22}s forwards`,
        }} />
      ))}

      <div style={{
        position: 'relative', textAlign: 'center',
        animation: 'nukko-milestone-pop 0.55s cubic-bezier(.3,1.5,.4,1) both',
      }}>
        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 800,
          letterSpacing: '0.22em', textTransform: 'uppercase',
          color: theme.secondary, marginBottom: 10,
          textShadow: `0 0 18px ${theme.secondary}`,
        }}>
          New Discovery
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
          <Planet stage={planet.stage} size={96} glow />
        </div>

        <div style={{
          fontFamily: '"Nunito", system-ui', fontWeight: 900, fontSize: 26, color: '#fff',
          textShadow: '0 2px 20px rgba(0,0,0,0.8)',
        }}>
          {planet.name}
        </div>
        <div style={{
          marginTop: 6, fontFamily: '"Space Mono", monospace', fontSize: 12,
          color: 'rgba(255,255,255,0.7)',
        }}>
          Stage {planet.stage} of {PLANET_DATA.length} · added to Codex
        </div>
      </div>
    </div>
  );
}
