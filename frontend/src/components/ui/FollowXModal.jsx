import { XLogoIcon } from './Icons.jsx';
import { X_HANDLE, openXProfile } from '../../utils/social.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

/**
 * Occasional "follow us on X" prompt. Frequency gating lives in
 * utils/social.js — this component only renders and handles the two actions.
 */
export default function FollowXModal({ onClose, onFollowed }) {
  const { theme } = useTheme();
  const handleFollow = () => {
    openXProfile();
    onFollowed?.();
    onClose();
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 150,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '0 28px',
        background: 'rgba(4,0,14,0.78)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'nukko-fade-in 0.18s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 340,
          background: 'linear-gradient(160deg, #1a0b32 0%, #0f0520 100%)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 24,
          boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(${theme.primaryRGB},0.15)`,
          animation: 'nukko-score-pop 0.22s cubic-bezier(.22,1,.36,1)',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '28px 24px 18px', gap: 6,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 16,
            background: `rgba(${theme.primaryRGB},0.15)`,
            border: `1px solid rgba(${theme.primaryRGB},0.3)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 4,
          }}>
            <XLogoIcon size={18} color="#fff" />
          </div>
          <div style={{
            fontFamily: '"Nunito", system-ui', fontWeight: 800,
            fontSize: 19, color: '#fff', textAlign: 'center',
          }}>
            Join the Cosmos Crew!
          </div>
          <div style={{
            fontFamily: '"Nunito", system-ui', fontSize: 13, lineHeight: 1.55,
            color: 'rgba(255,255,255,0.55)', textAlign: 'center',
          }}>
            Follow <span style={{ color: theme.secondary, fontWeight: 700 }}>{X_HANDLE}</span> on X
            for updates, events and cosmic drops 🪐
          </div>
        </div>

        {/* ── Actions ── */}
        <div style={{ padding: '4px 20px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handleFollow}
            style={{
              height: 52, borderRadius: 16, border: 'none',
              background: theme.gradient,
              color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 15,
              boxShadow: `0 10px 30px -8px rgba(${theme.primaryRGB},0.6), inset 0 1px 0 rgba(255,255,255,0.25)`,
            }}
          >
            <XLogoIcon size={14} />
            Follow {X_HANDLE}
          </button>
          <button
            onClick={onClose}
            style={{
              height: 40, borderRadius: 12,
              background: 'none', border: 'none', cursor: 'pointer',
              fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 13,
              color: 'rgba(255,255,255,0.35)',
            }}
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}
