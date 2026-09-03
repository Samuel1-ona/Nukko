import Toggle from '../ui/Toggle.jsx';
import { CheckIcon } from '../ui/Icons.jsx';
import { Screen, ScreenHeader, SectionHead, GhostButton, Reveal } from '../ui/kit.jsx';
import { INK, DIM, FAINT, RULE, BODY, DISPLAY } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

/** Colour sample for a theme. The swatch IS the content, so it keeps its fill. */
function ThemeSwatch({ id, def, active, onSelect }) {
  return (
    <button
      onClick={() => onSelect(id)}
      className="nk-press"
      style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 9,
        padding: '4px 0 0', background: 'none', border: 'none',
      }}
    >
      <div style={{
        position: 'relative', width: 44, height: 44, borderRadius: '50%',
        background: def.gradient,
        outline: active ? `2px solid ${def.primary}` : `1px solid ${RULE}`,
        outlineOffset: 3,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'outline-color 160ms ease',
      }}>
        {active && (
          <div style={{
            width: 20, height: 20, borderRadius: '50%', background: 'rgba(0,0,0,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <CheckIcon size={11} color="#fff" strokeWidth={3} />
          </div>
        )}
      </div>
      <div style={{
        fontFamily: BODY, fontWeight: 800, fontSize: 11.5,
        color: active ? INK : FAINT,
      }}>
        {def.name}
      </div>
    </button>
  );
}

export default function Settings({ onBack, muted, onToggleMute, musicMuted, onToggleMusic, onDisconnect }) {
  const { theme, themeId, setTheme, themes } = useTheme();
  const rows = [
    { key: 'sound', label: 'Sound effects', value: !muted,      onChange: onToggleMute },
    { key: 'music', label: 'Music',         value: !musicMuted, onChange: onToggleMusic },
  ];

  return (
    <Screen intensity="low">
      <ScreenHeader title="Settings" onBack={onBack} />

      <div style={{
        flex: '1 1 auto', overflowY: 'auto', marginTop: 22,
        display: 'flex', flexDirection: 'column',
      }}>
        <SectionHead delay={60}>Theme</SectionHead>
        <Reveal delay={80} style={{ marginBottom: 8 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {Object.keys(themes).map(id => (
              <ThemeSwatch key={id} id={id} def={themes[id]} active={id === themeId} onSelect={setTheme} />
            ))}
          </div>
          <div style={{
            marginTop: 12, fontFamily: BODY, fontSize: 11.5,
            color: DIM, textAlign: 'center', lineHeight: 1.45,
          }}>
            {theme.tagline}
          </div>
        </Reveal>

        <div style={{ height: 22 }} />

        <SectionHead delay={140}>Audio</SectionHead>
        <Reveal delay={160}>
          {rows.map(({ key, label, value, onChange }, i) => (
            <div key={key} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '13px 0',
              borderBottom: i < rows.length - 1 ? `1px solid ${RULE}` : 'none',
            }}>
              <div style={{ fontFamily: BODY, fontSize: 13.5, fontWeight: 600, color: INK }}>{label}</div>
              <Toggle value={value} onChange={onChange} />
            </div>
          ))}
        </Reveal>

        <div style={{ flex: 1, minHeight: 26 }} />

        {onDisconnect && (
          <>
            <SectionHead delay={210}>Wallet</SectionHead>
            <Reveal delay={230}>
              <GhostButton onClick={onDisconnect} tone="danger">Disconnect wallet</GhostButton>
            </Reveal>
          </>
        )}

        <div style={{
          textAlign: 'center', marginTop: 22,
          fontFamily: BODY, fontSize: 10, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'rgba(233,224,246,0.22)',
        }}>
          Nukko · Built on Celo
        </div>
      </div>
    </Screen>
  );
}
