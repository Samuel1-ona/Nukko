import { useState } from 'react';
import CosmicBackground from '../ui/CosmicBackground.jsx';
import Spinner          from '../ui/Spinner.jsx';
import { CheckIcon, CloseIcon } from '../ui/Icons.jsx';
import { PrimaryButton, GhostButton } from '../ui/kit.jsx';
import { INK, DIM, FAINT, RULE, DISPLAY, BODY } from '../../theme/tokens.js';
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
    : RULE;

  return (
    <div style={{ position: 'absolute', inset: 0, background: theme.bgGradient }}>
      <CosmicBackground intensity="medium" dimmed>
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          padding: '52px 24px 36px', boxSizing: 'border-box',
        }}>
          {/* Heading */}
          <div>
            <div style={{
              fontFamily: DISPLAY, fontWeight: 600,
              fontSize: 28, color: INK, lineHeight: 1.15,
            }}>What's your<br />cosmic name?</div>
            <div style={{
              marginTop: 10, fontFamily: BODY, fontSize: 14, color: DIM,
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
                  }}>
                    <CheckIcon size={11} color="#06210f" strokeWidth={3.2} />
                  </div>
                  <span style={{ color: '#00e676' }}>Cosmic name is yours!</span>
                </>
              )}
              {!checking && available === false && (
                <>
                  <div style={{
                    width: 18, height: 18, borderRadius: 99, background: '#ff3b3b',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <CloseIcon size={10} color="#fff" strokeWidth={3} />
                  </div>
                  <span style={{ color: '#ff3b3b' }}>Name already claimed</span>
                </>
              )}
            </div>

            <div style={{
              marginTop: 6, fontFamily: BODY, fontSize: 12, color: FAINT,
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
              <PrimaryButton onClick={handleSubmit} disabled={!canSubmit}>
                Set Name
              </PrimaryButton>
              <GhostButton onClick={onSkip} height={40} style={{ marginTop: 10, border: 'none', color: FAINT }}>
                Skip for now
              </GhostButton>
            </div>
          )}
        </div>
      </CosmicBackground>
    </div>
  );
}
