import { STABLECOIN_KEYS, STABLECOINS } from '../../blockchain/tokens.js';
import { BombIcon, ExpandIcon } from './Icons.jsx';
import { Modal, ModalTitle, TokenTabs, PackageButton, PrimaryButton, GhostButton } from './kit.jsx';
import { DIM, FAINT, RULE, GOLD, BODY } from '../../theme/tokens.js';

function fmtBalance(raw, decimals) {
  const val = Number(raw ?? 0n) / 10 ** decimals;
  return val < 0.01 && val > 0 ? '<0.01' : val.toFixed(2);
}

const TIER_LABELS = ['Starter', 'Pro', 'Max'];

export default function PowerUpShop({
  type, packages, selectedToken, onSelectToken, onPurchase,
  loading, onClose, balances = {}, count = 0, onUse,
}) {
  const isBomb  = type === 'bomb';
  const label   = isBomb ? 'Bombs' : 'Expands';
  const unitLbl = isBomb ? 'bomb'  : 'expand';
  const color   = isBomb ? GOLD : '#00d4ff';

  const effectDesc = isBomb
    ? 'Vaporizes planets near the danger line. A gold shockwave detonates across the field and you pocket a flat +200 pts.'
    : 'Fires a cyan energy beam across the field and stretches both walls outward. Cyan wall glow persists for ~4 seconds.';

  const tokens = STABLECOIN_KEYS.map(key => ({
    key, label: key, sub: fmtBalance(balances[key], STABLECOINS[key].decimals),
  }));

  return (
    <Modal onClose={onClose} align="bottom">
      <div style={{ padding: '10px 20px 30px' }}>
        <div style={{
          width: 38, height: 4, borderRadius: 2, background: RULE, margin: '0 auto 18px',
        }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, marginBottom: 8 }}>
          {isBomb ? <BombIcon size={18} color={color} /> : <ExpandIcon size={18} color={color} />}
          <ModalTitle>{label}</ModalTitle>
        </div>

        <p style={{
          fontFamily: BODY, fontSize: 11.5, color: FAINT,
          textAlign: 'center', lineHeight: 1.55, margin: 0,
        }}>
          {effectDesc}
        </p>

        {/* Stock and the immediate action, if any is held */}
        {count > 0 ? (
          <div style={{ marginTop: 18 }}>
            <PrimaryButton onClick={() => { onUse?.(); onClose(); }} disabled={loading} height={48}>
              Use one now
            </PrimaryButton>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginTop: 16 }}>
              <div style={{ flex: 1, height: 1, background: RULE }} />
              <span style={{
                fontFamily: BODY, fontSize: 9, fontWeight: 800, letterSpacing: '0.18em',
                textTransform: 'uppercase', color: FAINT,
              }}>
                {count} in stock · or buy more
              </span>
              <div style={{ flex: 1, height: 1, background: RULE }} />
            </div>
          </div>
        ) : (
          <div style={{
            marginTop: 18, paddingTop: 14, borderTop: `1px solid ${RULE}`,
            fontFamily: BODY, fontSize: 12, color: DIM, textAlign: 'center',
          }}>
            No {unitLbl}s left — pick a pack below.
          </div>
        )}

        <div style={{ marginTop: 18 }}>
          <TokenTabs items={tokens} selected={selectedToken} onSelect={onSelectToken} disabled={loading} />
        </div>

        <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
          {packages.map((pkg, i) => (
            <PackageButton
              key={i}
              title={`${pkg.qty} ${unitLbl}${pkg.qty > 1 ? 's' : ''}`}
              tier={TIER_LABELS[i] ?? ''}
              price={`$${pkg.priceUSD} ${selectedToken}`}
              accent={color}
              highlight={i === 1}
              onClick={() => onPurchase(i)}
              disabled={loading}
            />
          ))}
        </div>

        <GhostButton onClick={loading ? undefined : onClose} height={42} style={{ marginTop: 14 }}>
          Close
        </GhostButton>
      </div>
    </Modal>
  );
}
