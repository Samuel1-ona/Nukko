import CosmicBackground from '../ui/CosmicBackground.jsx';
import NukkoMascot      from '../ui/NukkoMascot.jsx';
import { useTheme }     from '../../theme/ThemeContext.jsx';

export default function Submitting({ score }) {
  const { theme } = useTheme();
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        <div style={{
          position: 'relative', height: '100%', display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          gap: 0, padding: '32px 24px',
        }}>

          {/* Mascot with ripple rings */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                position: 'absolute',
                left: '50%', top: '50%',
                width: 150 + i * 44, height: 150 + i * 44,
                transform: 'translate(-50%,-50%)',
                borderRadius: '50%',
                border: `1px solid rgba(${i === 0 ? theme.secondaryRGB : i === 1 ? theme.primaryRGB : '167,139,255'},${0.45 - i * 0.1})`,
                animation: `nukko-ripple 2.2s ease-out ${i * 0.45}s infinite`,
              }} />
            ))}
            <div style={{ animation: 'nukko-bob 2.4s ease-in-out infinite' }}>
              <NukkoMascot size={130} pose="thinking" />
            </div>
          </div>

          {/* Score display */}
          {score > 0 && (
            <div style={{
              marginTop: 52, textAlign: 'center',
              animation: 'nukko-score-pop 0.5s ease-out',
            }}>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 11,
                color: 'rgba(255,255,255,0.4)', letterSpacing: '0.18em',
                textTransform: 'uppercase',
              }}>
                Your Score
              </div>
              <div style={{
                marginTop: 4,
                fontFamily: '"Space Mono", monospace',
                fontWeight: 700, fontSize: 42, color: '#ffd700',
                letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
              }}>
                {Number(score).toLocaleString()}
              </div>
            </div>
          )}

          <div style={{
            marginTop: score > 0 ? 20 : 56,
            fontFamily: '"Nunito", system-ui',
            fontWeight: 700, fontSize: 20, color: '#fff', textAlign: 'center',
            lineHeight: 1.3,
          }}>
            Logging your score<br />to the stars…
          </div>

          <div style={{
            marginTop: 8, fontFamily: '"Nunito", system-ui', fontSize: 13,
            color: 'rgba(255,255,255,0.45)', textAlign: 'center',
          }}>
            Beaming data across the cosmos
          </div>

          {/* Progress dots */}
          <div style={{ display: 'flex', gap: 6, marginTop: 22 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: 6, height: 6, borderRadius: '50%',
                background: 'rgba(255,255,255,0.5)',
                animation: `nukko-pulse 1.4s ease-in-out ${i * 0.22}s infinite`,
              }} />
            ))}
          </div>

        </div>
      </CosmicBackground>
    </div>
  );
}
