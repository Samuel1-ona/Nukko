import { STABLECOIN_KEYS, STABLECOINS } from '../../blockchain/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

const LABELS = ['Orbit', 'Galaxy', 'Supernova'];

function fmtBalance(raw, decimals) {
  const val = Number(raw ?? 0n) / 10 ** decimals;
  return val < 0.01 && val > 0 ? '<0.01' : val.toFixed(2);
}

export default function TimerPackages({ packages, onPurchase, loading, selectedToken, onSelectToken, balances = {} }) {
  const { theme } = useTheme();
  return (
    <div>
      {/* Token selector */}
      {onSelectToken && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginBottom: 8 }}>
          {STABLECOIN_KEYS.map((key) => (
            <button
              key={key}
              onClick={() => onSelectToken(key)}
              disabled={loading}
              style={{
                padding: '3px 10px', borderRadius: 99,
                background: selectedToken === key ? 'rgba(0,212,255,0.15)' : 'transparent',
                border: `1px solid ${selectedToken === key ? 'rgba(0,212,255,0.5)' : 'rgba(255,255,255,0.15)'}`,
                color: selectedToken === key ? '#00d4ff' : 'rgba(255,255,255,0.45)',
                fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                transition: 'all .15s ease',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              }}
            >
              <span>{key}</span>
              {balances[key] !== undefined && STABLECOINS[key] && (
                <span style={{ fontSize: 9, color: selectedToken === key ? 'rgba(255,215,0,0.65)' : 'rgba(255,255,255,0.35)', fontWeight: 400 }}>
                  {fmtBalance(balances[key], STABLECOINS[key].decimals)}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Boost buttons */}
      <div style={{ display: 'flex', gap: 8 }}>
        {packages.map((pkg, i) => {
          const isHighlight = i === 1;
          return (
            <button
              key={i}
              onClick={() => onPurchase(i)}
              disabled={loading}
              style={{
                flex: 1, padding: '10px 6px',
                background: isHighlight
                  ? `linear-gradient(135deg, rgba(${theme.primaryRGB},0.5), rgba(${theme.secondaryRGB},0.4))`
                  : 'rgba(255,255,255,0.06)',
                border: `1px solid ${isHighlight ? `rgba(${theme.secondaryRGB},0.5)` : 'rgba(255,255,255,0.1)'}`,
                borderRadius: 14,
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.5 : 1,
                minHeight: 60,
                transition: 'opacity .15s ease',
              }}
            >
              <div style={{ fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 18, color: '#fff', lineHeight: 1 }}>
                +{pkg.seconds}s
              </div>
              <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 10, color: 'rgba(255,255,255,0.6)', fontWeight: 600 }}>
                {LABELS[i] ?? ''}
              </div>
              <div style={{ fontFamily: '"Nunito", system-ui', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                {pkg.priceUSD} {selectedToken ?? 'cUSD'}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
