const GOLD  = '#ffd700';
const CYAN  = '#00d4ff';

function rewardLines(level) {
  const out = [];
  if (level.reward?.bombs)   out.push(`+${level.reward.bombs} bomb${level.reward.bombs > 1 ? 's' : ''}`);
  if (level.reward?.expands) out.push(`+${level.reward.expands} expand${level.reward.expands > 1 ? 's' : ''}`);
  if (level.reward?.cash)    out.push(`$${level.reward.cash.amount} ${level.reward.cash.token} cash link`);
  return out;
}

/**
 * Celebration for levels cleared in the last sync. `levels` only ever
 * contains rungs that were actually paid — a rung re-cleared after a
 * demotion pays nothing and never reaches here.
 */
export default function LevelUpModal({ levels, onClose }) {
  if (!levels?.length) return null;

  const top      = levels[levels.length - 1];
  const multiple = levels.length > 1;
  const hasCash  = levels.some(l => l.reward?.cash);

  return (
    <>
      <div onClick={onClose} aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(0,0,0,0.8)' }} />

      <div role="dialog" aria-modal="true" aria-label="Level cleared"
        style={{
          position: 'fixed', zIndex: 310,
          left: '50%', top: '50%', transform: 'translate(-50%, -50%)',
          width: 'min(340px, calc(100vw - 40px))',
          borderRadius: 24, padding: '26px 22px 20px',
          background: 'linear-gradient(160deg, #1b0838 0%, #0a0015 100%)',
          border: `1px solid ${GOLD}55`,
          boxShadow: `0 0 60px ${GOLD}22, 0 20px 60px rgba(0,0,0,0.6)`,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 40, lineHeight: 1, marginBottom: 10 }}>{hasCash ? '💵' : '🎉'}</div>

        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 10, fontWeight: 800,
          letterSpacing: '0.18em', textTransform: 'uppercase', color: CYAN, marginBottom: 6,
        }}>
          {multiple ? `${levels.length} levels cleared` : 'Level cleared'}
        </div>

        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 22, fontWeight: 900,
          color: '#fff', lineHeight: 1.2, marginBottom: 4,
        }}>
          {top.badge}
        </div>
        <div style={{
          fontFamily: '"Space Mono", monospace', fontSize: 11,
          color: 'rgba(255,255,255,0.45)', marginBottom: 18,
        }}>
          Level {top.level} of 12
        </div>

        {/* What was earned */}
        <div style={{
          borderRadius: 16, padding: '14px 16px', marginBottom: 18, textAlign: 'left',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
        }}>
          <div style={{
            fontFamily: '"Nunito", system-ui', fontSize: 9, fontWeight: 800,
            letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.4)', marginBottom: 10,
          }}>
            You earned
          </div>

          {levels.map(l => (
            <div key={l.level} style={{ marginBottom: 8 }}>
              {multiple && (
                <div style={{
                  fontFamily: '"Space Mono", monospace', fontSize: 9.5,
                  color: 'rgba(255,255,255,0.35)', marginBottom: 2,
                }}>
                  L{l.level} · {l.badge}
                </div>
              )}
              {rewardLines(l).map(line => (
                <div key={line} style={{
                  fontFamily: '"Nunito", system-ui', fontSize: 12.5, fontWeight: 700,
                  color: line.includes('cash link') ? GOLD : '#fff', lineHeight: 1.6,
                }}>
                  {line.includes('cash link') ? '💵 ' : '🎁 '}{line}
                </div>
              ))}
            </div>
          ))}

          {hasCash && (
            <div style={{
              marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)',
              fontFamily: '"Nunito", system-ui', fontSize: 10.5, lineHeight: 1.5,
              color: 'rgba(255,255,255,0.5)',
            }}>
              Your cash link is waiting in the Rewards tab.
            </div>
          )}
        </div>

        <button onClick={onClose}
          style={{
            width: '100%', padding: '13px', borderRadius: 14,
            background: `linear-gradient(135deg, ${GOLD}, #ffb700)`,
            border: 'none', color: '#08010f',
            fontFamily: '"Nunito", system-ui', fontSize: 13, fontWeight: 900,
            letterSpacing: '0.04em', cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
          }}
        >
          NICE
        </button>
      </div>
    </>
  );
}
