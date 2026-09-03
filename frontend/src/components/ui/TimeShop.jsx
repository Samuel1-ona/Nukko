import { STABLECOIN_KEYS, STABLECOINS } from '../../blockchain/tokens.js';
import { ClockIcon } from './Icons.jsx';
import { Modal, ModalTitle, TokenTabs, PackageButton, GhostButton } from './kit.jsx';
import { FAINT, RULE, BODY } from '../../theme/tokens.js';

const TIER_LABELS = ['Orbit', 'Galaxy', 'Supernova'];
const ACCENT = '#a78bff';

function fmtBalance(raw, decimals) {
  const val = Number(raw ?? 0n) / 10 ** decimals;
  return val < 0.01 && val > 0 ? '<0.01' : val.toFixed(2);
}

export default function TimeShop({
  packages, selectedToken, onSelectToken, onPurchase, loading, onClose, balances = {},
}) {
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
          <ClockIcon size={18} color={ACCENT} />
          <ModalTitle>Buy more time</ModalTitle>
        </div>

        <p style={{
          fontFamily: BODY, fontSize: 11.5, color: FAINT,
          textAlign: 'center', lineHeight: 1.55, margin: 0,
        }}>
          Violet rings ripple across the field and the seconds land straight on your clock.
        </p>

        <div style={{ marginTop: 20 }}>
          <TokenTabs items={tokens} selected={selectedToken} onSelect={onSelectToken} disabled={loading} />
        </div>

        <div style={{ display: 'flex', gap: 9, marginTop: 14 }}>
          {packages.map((pkg, i) => (
            <PackageButton
              key={i}
              title={`+${pkg.seconds}s`}
              tier={TIER_LABELS[i] ?? ''}
              price={`$${pkg.priceUSD} ${selectedToken}`}
              accent={ACCENT}
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
