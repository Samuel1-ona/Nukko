import { useTheme } from '../../theme/ThemeContext.jsx';

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M3.5 2l9 5-9 5V2Z" fill="currentColor"/>
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M1.5 7.5L8 1.5l6.5 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.5 6v7a.5.5 0 0 0 .5.5h2.5v-3.5h3V13.5H12a.5.5 0 0 0 .5-.5V6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function SoundOnIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M2.5 6h2L8 3v11l-3.5-2.5H2.5A.5.5 0 0 1 2 11V7a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M11 5.5a3.5 3.5 0 0 1 0 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
      <path d="M12.5 7.5a1.5 1.5 0 0 1 0 2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function SoundOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M2.5 6h2L8 3v11l-3.5-2.5H2.5A.5.5 0 0 1 2 11V7a.5.5 0 0 1 .5-.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
      <path d="M11 6.5l4 4M15 6.5l-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function MusicOnIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M6 13V4.5l8-2V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="4" cy="13" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.4"/>
    </svg>
  );
}

function MusicOffIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 17 17" fill="none">
      <path d="M6 13V4.5l8-2V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="4" cy="13" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <circle cx="12" cy="11" r="2" stroke="currentColor" strokeWidth="1.4"/>
      <line x1="1.5" y1="2" x2="15.5" y2="15.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

// Reusable toggle row
function ToggleRow({ icon, offIcon, label, active, onToggle, accentColor }) {
  return (
    <button onClick={onToggle} style={{
      width: '100%', height: 54, borderRadius: 14,
      background: active ? `${accentColor}12` : 'rgba(255,255,255,0.05)',
      border: `1px solid ${active ? accentColor + '38' : 'rgba(255,255,255,0.1)'}`,
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '0 16px',
      fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 15,
      color: active ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.35)',
      cursor: 'pointer',
      transition: 'background 0.2s, border-color 0.2s, color 0.2s',
    }}>
      <span style={{ opacity: active ? 0.9 : 0.4, flexShrink: 0, color: active ? accentColor : 'currentColor' }}>
        {active ? icon : offIcon}
      </span>
      <span style={{ flex: 1, textAlign: 'left' }}>{label}</span>
      {/* Toggle pill */}
      <div style={{
        width: 44, height: 24, borderRadius: 12, flexShrink: 0,
        background: active ? `${accentColor}55` : 'rgba(255,255,255,0.12)',
        border: `1.5px solid ${active ? accentColor : 'rgba(255,255,255,0.15)'}`,
        position: 'relative', transition: 'background 0.2s, border-color 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: 3,
          left: active ? 19 : 3,
          width: 16, height: 16, borderRadius: '50%',
          background: active ? accentColor : 'rgba(255,255,255,0.3)',
          boxShadow: active ? `0 0 8px ${accentColor}90` : 'none',
          transition: 'left 0.2s ease, background 0.2s',
        }} />
      </div>
    </button>
  );
}

export default function PauseModal({ onResume, onGoHome, muted, onToggleMute, musicMuted, onToggleMusic }) {
  const { theme } = useTheme();
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 150,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '0 28px',
      background: 'rgba(4,0,14,0.78)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      animation: 'nukko-fade-in 0.18s ease-out',
    }}>
      <div style={{
        width: '100%', maxWidth: 340,
        background: 'linear-gradient(160deg, #1a0b32 0%, #0f0520 100%)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 24,
        boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(${theme.primaryRGB},0.15)`,
        animation: 'nukko-score-pop 0.22s cubic-bezier(.22,1,.36,1)',
        overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '28px 24px 20px', gap: 6,
          borderBottom: '1px solid rgba(255,255,255,0.07)',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: `rgba(${theme.primaryRGB},0.15)`,
            border: `1px solid rgba(${theme.primaryRGB},0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 4,
          }}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <rect x="3.5" y="2.5" width="4" height="13" rx="1.5" fill="rgba(167,139,255,0.9)"/>
              <rect x="10.5" y="2.5" width="4" height="13" rx="1.5" fill="rgba(167,139,255,0.9)"/>
            </svg>
          </div>
          <div style={{
            fontFamily: '"Nunito", system-ui', fontWeight: 900,
            fontSize: 22, color: '#fff', letterSpacing: '-0.01em',
          }}>
            Game Paused
          </div>
          <div style={{
            fontFamily: '"Nunito", system-ui', fontSize: 12,
            color: 'rgba(255,255,255,0.35)', letterSpacing: '0.03em',
          }}>
            Your progress is saved
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ padding: '16px 20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>

          {/* Resume */}
          <button onClick={onResume} style={{
            width: '100%', height: 54, borderRadius: 14,
            background: theme.gradient,
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 16, color: '#fff',
            cursor: 'pointer',
            boxShadow: `0 4px 20px rgba(${theme.primaryRGB},0.4)`,
          }}>
            <PlayIcon />
            Resume
          </button>

          {/* Sound Effects toggle */}
          <ToggleRow
            icon={<SoundOnIcon />}
            offIcon={<SoundOffIcon />}
            label="Sound Effects"
            active={!muted}
            onToggle={onToggleMute}
            accentColor="#00d4ff"
          />

          {/* Background Music toggle */}
          <ToggleRow
            icon={<MusicOnIcon />}
            offIcon={<MusicOffIcon />}
            label="Background Music"
            active={!musicMuted}
            onToggle={onToggleMusic}
            accentColor="#a78bff"
          />

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(255,255,255,0.07)', margin: '4px 0 2px' }} />

          {/* Back to Home */}
          <button onClick={onGoHome} style={{
            width: '100%', height: 54, borderRadius: 14,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.09)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 15,
            color: 'rgba(255,255,255,0.45)',
            cursor: 'pointer',
          }}>
            <HomeIcon />
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
