import CosmicBackground from '../ui/CosmicBackground.jsx';
import NukkoMascot      from '../ui/NukkoMascot.jsx';
import { useTheme }     from '../../theme/ThemeContext.jsx';

export default function Starting() {
  const { theme } = useTheme();
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          {/* Spinning mascot with orbit rings */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              position: 'absolute',
              width: 240, height: 240,
              borderRadius: '50%',
              border: '1.5px dashed rgba(255,215,0,0.4)',
              animation: 'nukko-rotate 8s linear infinite',
            }} />
            <div style={{
              position: 'absolute',
              width: 320, height: 320,
              borderRadius: '50%',
              border: `1px dashed rgba(${theme.secondaryRGB},0.3)`,
              animation: 'nukko-rotate-rev 14s linear infinite',
            }} />
            <NukkoMascot size={160} pose="spinning" />
          </div>

          <div style={{
            marginTop: 70, fontFamily: '"Fredoka", "Nunito", sans-serif',
            fontWeight: 500, fontSize: 22, color: '#fff', textAlign: 'center',
          }}>
            Launching your session…
          </div>

          <div style={{
            marginTop: 12, fontFamily: '"Nunito", system-ui', fontSize: 13,
            color: 'rgba(255,255,255,0.5)', textAlign: 'center', maxWidth: 280,
          }}>
            Igniting cosmic engines. Stand by.
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 24 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: 99, background: '#fff',
                animation: `nukko-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
        </div>
      </CosmicBackground>
    </div>
  );
}
