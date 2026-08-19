import { useState } from 'react';
import CosmicBackground from '../ui/CosmicBackground.jsx';
import Spinner          from '../ui/Spinner.jsx';
import { useUsername }  from '../../hooks/useUsername.js';
import { useTheme }     from '../../theme/ThemeContext.jsx';

export default function SetUsername({ onSubmit, onSkip, checkUsernameAvailable }) {
  const { theme } = useTheme();
  const [value,      setValue]      = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { available, checking, check } = useUsername(checkUsernameAvailable);

  const handleChange = (e) => {
    const clean = e.target.value.replace(/[^a-zA-Z0-9_]/g, '');
    setValue(clean);
    check(clean);
  };

  const handleSubmit = async () => {
    if (!value || available !== true) return;
    setSubmitting(true);
    try { await onSubmit(value); } finally { setSubmitting(false); }
  };

  const valid     = /^[a-zA-Z0-9_]{1,20}$/.test(value);
  const canSubmit = valid && available === true && !submitting;

  const borderColor = available === true && valid ? 'rgba(0,230,118,0.6)'
    : available === false ? 'rgba(255,59,59,0.6)'
    : 'rgba(255,255,255,0.18)';

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium" dimmed>
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          padding: '52px 24px 36px', boxSizing: 'border-box',
        }}>
          {/* Heading */}
          <div>
            <div style={{
              fontFamily: '"Fredoka", "Nunito", sans-serif', fontWeight: 600,
              fontSize: 28, color: '#fff', lineHeight: 1.15,
            }}>What's your<br />cosmic name?</div>
            <div style={{
              marginTop: 10, fontFamily: '"Nunito", system-ui', fontSize: 14,
              color: 'rgba(255,255,255,0.6)',
            }}>You can change this once every 7 days.</div>
          </div>

          {/* Input */}
          <div style={{ marginTop: 32 }}>
            <div style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.06)',
              border: `1.5px solid ${borderColor}`,
              borderRadius: 16, padding: '14px 18px',
              transition: 'border-color .2s ease',
            }}>
              <input
                value={value}
                onChange={handleChange}
                placeholder="cosmonaut_42"
                maxLength={20}
                autoComplete="off"
                spellCheck={false}
                style={{
                  width: '100%', background: 'transparent', border: 'none', outline: 'none',
                  color: '#fff', fontFamily: '"Nunito", system-ui',
                  fontSize: 20, fontWeight: 600,
                }}
              />
            </div>

            {/* Availability indicator */}
            <div style={{
              marginTop: 12, display: 'flex', alignItems: 'center', gap: 8, minHeight: 22,
              fontFamily: '"Nunito", system-ui', fontSize: 14,
            }}>
              {checking && (
                <>
                  <Spinner inline />
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Checking…</span>
                </>
              )}
              {!checking && available === true && valid && (
                <>
                  <div style={{
                    width: 18, height: 18, borderRadius: 99, background: '#00e676',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#06210f',
                  }}>✓</div>
                  <span style={{ color: '#00e676' }}>Cosmic name is yours!</span>
                </>
              )}
              {!checking && available === false && (
                <>
                  <div style={{
                    width: 18, height: 18, borderRadius: 99, background: '#ff3b3b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, fontWeight: 700, color: '#fff',
                  }}>✕</div>
                  <span style={{ color: '#ff3b3b' }}>Name already claimed</span>
                </>
              )}
            </div>

            <div style={{
              marginTop: 6, fontFamily: '"Nunito", system-ui', fontSize: 12,
              color: 'rgba(255,255,255,0.35)',
            }}>
              Letters, numbers, underscores only · {value.length}/20
            </div>
          </div>

          <div style={{ flex: 1 }} />

          {/* Buttons */}
          {submitting ? (
            <Spinner text="Saving username on Celo…" />
          ) : (
            <div>
              <button onClick={handleSubmit} disabled={!canSubmit} style={{
                width: '100%', height: 56, borderRadius: 16,
                background: canSubmit
                  ? theme.gradient
                  : 'rgba(255,255,255,0.08)',
                border: 'none', color: canSubmit ? '#fff' : 'rgba(255,255,255,0.35)',
                fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 17,
                cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit
                  ? `0 10px 30px -8px rgba(${theme.primaryRGB},0.6), inset 0 1px 0 rgba(255,255,255,0.25)`
                  : 'none',
                transition: 'background .2s ease',
              }}>
                Set Name
              </button>

              <button onClick={onSkip} style={{
                width: '100%', marginTop: 14, padding: '12px', background: 'transparent',
                border: 'none', color: 'rgba(255,255,255,0.55)',
                fontFamily: '"Nunito", system-ui', fontSize: 14,
                cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 4,
              }}>
                Skip for now
              </button>
            </div>
          )}
        </div>
      </CosmicBackground>
    </div>
  );
}
