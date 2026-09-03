import { CashIcon, GiftIcon, SparkleIcon } from './Icons.jsx';
import { Modal, ModalTitle, PrimaryButton, Rail } from './kit.jsx';
import { INK, DIM, FAINT, RULE, GOLD, BODY, NUM } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

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
  const { theme } = useTheme();
  if (!levels?.length) return null;

  const top      = levels[levels.length - 1];
  const multiple = levels.length > 1;
  const hasCash  = levels.some(l => l.reward?.cash);

  return (
    <Modal onClose={onClose} zIndex={300}>
      <div style={{ padding: '26px 22px 20px' }}>
        <div className="nk-motion" style={{
          display: 'flex', justifyContent: 'center', marginBottom: 14,
          animation: 'nk-breathe 3.2s ease-in-out infinite',
        }}>
          {hasCash ? <CashIcon size={38} color={GOLD} /> : <SparkleIcon size={38} color={GOLD} />}
        </div>

        <div style={{
          textAlign: 'center', fontFamily: BODY, fontSize: 9, fontWeight: 800,
          letterSpacing: '0.2em', textTransform: 'uppercase', color: theme.secondary,
          marginBottom: 7,
        }}>
          {multiple ? `${levels.length} levels cleared` : 'Level cleared'}
        </div>

        <ModalTitle>{top.badge}</ModalTitle>

        <div style={{
          marginTop: 5, textAlign: 'center',
          fontFamily: NUM, fontSize: 11, color: FAINT,
        }}>
          Level {top.level} of 12
        </div>

        <div style={{ marginTop: 20, marginBottom: 20 }}>
          <div style={{
            fontFamily: BODY, fontSize: 9, fontWeight: 800, letterSpacing: '0.2em',
            textTransform: 'uppercase', color: FAINT, marginBottom: 10,
          }}>
            You earned
          </div>

          <Rail accent={GOLD}>
            {levels.map(l => (
              <div key={l.level} style={{ marginBottom: 7 }}>
                {multiple && (
                  <div style={{ fontFamily: NUM, fontSize: 9.5, color: FAINT, marginBottom: 3 }}>
                    L{l.level} · {l.badge}
                  </div>
                )}
                {rewardLines(l).map(line => {
                  const cash = line.includes('cash link');
                  return (
                    <div key={line} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontFamily: BODY, fontSize: 12.5, fontWeight: 700,
                      color: cash ? GOLD : INK, lineHeight: 1.7,
                    }}>
                      {cash ? <CashIcon size={13} color={GOLD} /> : <GiftIcon size={13} color={INK} />}
                      <span>{line}</span>
                    </div>
                  );
                })}
              </div>
            ))}

            {hasCash && (
              <div style={{
                marginTop: 9, paddingTop: 9, borderTop: `1px solid ${RULE}`,
                fontFamily: BODY, fontSize: 11, lineHeight: 1.5, color: DIM,
              }}>
                Your cash link is waiting in the Rewards tab.
              </div>
            )}
          </Rail>
        </div>

        <PrimaryButton onClick={onClose} height={48}>Nice</PrimaryButton>
      </div>
    </Modal>
  );
}
