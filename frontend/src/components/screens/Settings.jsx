import CosmicBackground from '../ui/CosmicBackground.jsx';
import BackChevron      from '../ui/BackChevron.jsx';
import Toggle           from '../ui/Toggle.jsx';
import { useTheme }     from '../../theme/ThemeContext.jsx';

function CheckIcon({ color }) {
  return (
    <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
      <path d="M2.5 7.2 5.8 10 11.5 3.5" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ThemeSwatch({ id, def, active, onSelect }) {
  return (
    <button onClick={() => onSelect(id)} style={{
      flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      padding: '14px 8px', borderRadius: 18, cursor: 'pointer',
      background: active ? `rgba(${def.primaryRGB},0.1)` : 'rgba(255,255,255,0.03)',
      border: `1.5px solid ${active ? def.primary : 'rgba(255,255,255,0.08)'}`,
      transition: 'background .15s ease, border-color .15s ease',
    }}>
      <div style={{
        position: 'relative', width: 40, height: 40, borderRadius: '50%',
        background: def.gradient,
        boxShadow: active ? `0 0 16px rgba(${def.primaryRGB},0.55)` : 'none',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {active && (
          <div style={{
            width: 18, height: 18, borderRadius: '50%', background: 'rgba(0,0,0,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckIcon color="#fff" />
          </div>
        )}
      </div>
      <div style={{
        fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 12,
        color: active ? '#fff' : 'rgba(255,255,255,0.65)',
      }}>{def.name}</div>
    </button>
  );
}

export default function Settings({ onBack, muted, onToggleMute, musicMuted, onToggleMusic, onDisconnect }) {
  const { theme, themeId, setTheme, themes } = useTheme();
  const rows = [
    { key: 'sound', label: 'Sound effects', value: !muted,       onChange: onToggleMute },
    { key: 'music', label: 'Music',         value: !musicMuted,  onChange: onToggleMusic },
  ];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '18px 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <BackChevron onClick={onBack} />
            <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 21, color: '#fff' }}>Settings</div>
          </div>

          {/* Theme picker */}
          <div style={{
            marginTop: 22, fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 800,
            letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)',
            marginBottom: 10,
          }}>Theme</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {Object.keys(themes).map((id) => (
              <ThemeSwatch key={id} id={id} def={themes[id]} active={id === themeId} onSelect={setTheme} />
            ))}
          </div>
          <div style={{
            marginTop: 8, fontFamily: '"Nunito", system-ui', fontSize: 11.5,
            color: 'rgba(255,255,255,0.45)', textAlign: 'center', lineHeight: 1.4,
          }}>{theme.tagline}</div>

          <div style={{
            marginTop: 22, borderRadius: 18, overflow: 'hidden',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {rows.map(({ key, label, value, onChange }, i) => (
              <div key={key} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px',
                borderBottom: i < rows.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}>
                <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 14, color: '#fff' }}>{label}</div>
                <Toggle value={value} onChange={onChange} />
              </div>
            ))}
          </div>

          <div style={{ flex: 1 }} />

          {onDisconnect && (
            <button onClick={onDisconnect} style={{
              width: '100%', height: 50, borderRadius: 14,
              background: 'rgba(255,59,59,0.12)', border: '1px solid rgba(255,59,59,0.4)',
              color: '#ff8a8a', fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 14, cursor: 'pointer',
            }}>Disconnect Wallet</button>
          )}
          <div style={{ textAlign: 'center', marginTop: 14, fontFamily: '"Nunito", system-ui', fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
            Nukko · Built on Celo
          </div>
        </div>
      </CosmicBackground>
    </div>
  );
}
