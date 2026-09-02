import CosmicBackground from '../ui/CosmicBackground.jsx';
import BackChevron      from '../ui/BackChevron.jsx';
import Leaderboard      from '../ui/Leaderboard.jsx';

export default function FullLeaderboard({ onBack, entries, loading, myUsername }) {
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '18px 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <BackChevron onClick={onBack} />
            <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 21, color: '#fff' }}>
              Cosmic Leaderboard
            </div>
          </div>
          <div style={{ marginTop: 6, marginLeft: 54, fontFamily: '"Nunito", system-ui', fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>
            Top scores across the galaxy
          </div>

          <div style={{ flex: 1, overflow: 'auto', marginTop: 18 }}>
            <Leaderboard entries={entries} loading={loading} myUsername={myUsername} />
          </div>
        </div>
      </CosmicBackground>
    </div>
  );
}
