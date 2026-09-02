import CosmicBackground from '../ui/CosmicBackground.jsx';
import BackChevron      from '../ui/BackChevron.jsx';
import Planet           from '../ui/Planet.jsx';
import { PLANET_DATA }  from '../ui/Planet.jsx';
import { useTheme }     from '../../theme/ThemeContext.jsx';

function stageFromScore(score) {
  if (!score || score < 100)  return 2;
  if (score < 500)   return 3;
  if (score < 2000)  return 4;
  if (score < 5000)  return 6;
  if (score < 10000) return 8;
  if (score < 20000) return 10;
  if (score < 50000) return 12;
  return 13;
}

function StatCard({ label, value, color, thumb }) {
  return (
    <div style={{
      borderRadius: 16, padding: '14px 16px', minHeight: 76, boxSizing: 'border-box',
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden',
    }}>
      {thumb && <div style={{ flexShrink: 0 }}>{thumb}</div>}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 10.5, color: 'rgba(255,255,255,0.5)',
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>{label}</div>
        <div style={{
          marginTop: 3, fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 17, color,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>{value}</div>
      </div>
    </div>
  );
}

export default function Profile({ profile, address, onBack, onEditName }) {
  const { theme } = useTheme();
  const username = profile?.username || 'Anonymous';
  const best     = profile?.personalBest ?? 0;
  const games    = profile?.gamesPlayed  ?? 0;
  const stage    = stageFromScore(best);
  const planet   = PLANET_DATA[stage - 1];
  const addr     = address || profile?.address || '';
  const shortAddr = addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : '—';

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '18px 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <BackChevron onClick={onBack} />
            <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 21, color: '#fff' }}>Profile</div>
          </div>

          <div style={{ marginTop: 26, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 96, height: 96, borderRadius: 99, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.25)', border: '1.5px solid rgba(255,255,255,0.14)',
            }}>
              <Planet stage={stage} size={78} glow />
            </div>
            <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 22, color: '#fff' }}>{username}</div>
            <div style={{ fontFamily: '"Space Mono", monospace', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{shortAddr}</div>
            <button onClick={onEditName} style={{
              marginTop: 4, padding: '8px 18px', borderRadius: 99,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.16)',
              color: '#fff', fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 12, cursor: 'pointer',
            }}>Edit name</button>
          </div>

          <div style={{ flex: 1, overflow: 'auto', marginTop: 28 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <StatCard label="Best score" value={best > 0 ? best.toLocaleString() : '–'} color="#ffd700" />
              <StatCard label="Games played" value={games > 0 ? games.toLocaleString() : '0'} color={theme.secondary} />
              <StatCard label="Best planet" value={planet?.name ?? `Stage ${stage}`} color={theme.primary} thumb={<Planet stage={stage} size={30} />} />
              <StatCard label="Wallet" value={shortAddr} color="rgba(255,255,255,0.75)" />
            </div>
          </div>
        </div>
      </CosmicBackground>
    </div>
  );
}
