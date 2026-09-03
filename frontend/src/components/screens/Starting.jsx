import NukkoMascot from '../ui/NukkoMascot.jsx';
import { Screen } from '../ui/kit.jsx';
import { INK, DIM, RULE, DISPLAY, BODY } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

export default function Starting() {
  const { theme } = useTheme();
  return (
    <Screen intensity="medium" padded={false}>
      <div style={{
        height: '100%', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        {/* Orbit rings echo the home screen's system spinning up */}
        <div className="nk-motion" style={{
          position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            position: 'absolute', width: 240, height: 240, borderRadius: '50%',
            border: `1px solid rgba(${theme.primaryRGB},0.35)`,
            animation: 'nk-spin 9s linear infinite',
          }} />
          <div style={{
            position: 'absolute', width: 320, height: 320, borderRadius: '50%',
            border: `1px solid rgba(${theme.secondaryRGB},0.22)`,
            animation: 'nk-spin-rev 16s linear infinite',
          }} />
          <NukkoMascot size={150} pose="spinning" />
        </div>

        <div className="nk-rise" style={{
          marginTop: 74, fontFamily: DISPLAY, fontWeight: 600, fontSize: 22,
          color: INK, textAlign: 'center', animationDelay: '80ms',
        }}>
          Launching your session
        </div>

        <div className="nk-rise" style={{
          marginTop: 10, fontFamily: BODY, fontSize: 13, color: DIM,
          textAlign: 'center', maxWidth: 280, animationDelay: '160ms',
        }}>
          Igniting cosmic engines. Stand by.
        </div>

        <div className="nk-motion" style={{ display: 'flex', gap: 6, marginTop: 26 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 5, height: 5, borderRadius: 99, background: INK,
              animation: `nukko-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
            }} />
          ))}
        </div>
      </div>
    </Screen>
  );
}
