import NukkoMascot from '../ui/NukkoMascot.jsx';
import { Screen } from '../ui/kit.jsx';
import { INK, DIM, FAINT, GOLD, DISPLAY, BODY, NUM } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

export default function Submitting({ score }) {
  const { theme } = useTheme();
  return (
    <Screen intensity="medium" padded={false}>
      <div style={{
        position: 'relative', height: '100%', display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '32px 24px',
      }}>
        {/* Ripples outward — the score leaving for the chain */}
        <div className="nk-motion" style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: 150 + i * 44, height: 150 + i * 44,
              transform: 'translate(-50%,-50%)', borderRadius: '50%',
              border: `1px solid rgba(${i === 1 ? theme.primaryRGB : theme.secondaryRGB},${0.4 - i * 0.1})`,
              animation: `nukko-ripple 2.2s ease-out ${i * 0.45}s infinite`,
            }} />
          ))}
          <div style={{ animation: 'nk-breathe 2.8s ease-in-out infinite' }}>
            <NukkoMascot size={126} pose="thinking" />
          </div>
        </div>

        {score > 0 && (
          <div className="nk-rise" style={{
            marginTop: 52, textAlign: 'center', animationDelay: '60ms',
          }}>
            <div style={{
              fontFamily: BODY, fontSize: 8.5, fontWeight: 800, color: FAINT,
              letterSpacing: '0.16em', textTransform: 'uppercase',
            }}>
              Your score
            </div>
            <div style={{
              marginTop: 5, fontFamily: NUM, fontWeight: 700, fontSize: 42,
              color: GOLD, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums',
            }}>
              {Number(score).toLocaleString()}
            </div>
          </div>
        )}

        <div className="nk-rise" style={{
          marginTop: score > 0 ? 24 : 58,
          fontFamily: DISPLAY, fontWeight: 600, fontSize: 20, color: INK,
          textAlign: 'center', lineHeight: 1.3, animationDelay: '140ms',
        }}>
          Logging your score<br />to the stars
        </div>

        <div className="nk-rise" style={{
          marginTop: 8, fontFamily: BODY, fontSize: 13, color: DIM,
          textAlign: 'center', animationDelay: '200ms',
        }}>
          Beaming data across the cosmos
        </div>

        <div className="nk-motion" style={{ display: 'flex', gap: 6, marginTop: 24 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: '50%', background: DIM,
              animation: `nukko-pulse 1.4s ease-in-out ${i * 0.22}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </Screen>
  );
}
