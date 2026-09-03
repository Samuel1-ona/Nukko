import Leaderboard from '../ui/Leaderboard.jsx';
import { Screen, ScreenHeader } from '../ui/kit.jsx';

export default function FullLeaderboard({ onBack, entries, loading, myUsername }) {
  return (
    <Screen intensity="medium">
      <ScreenHeader
        title="Standings"
        subtitle="Top scores across the galaxy"
        onBack={onBack}
      />
      <div style={{
        flex: '1 1 auto', overflowY: 'auto', marginTop: 14,
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 14px)',
        maskImage: 'linear-gradient(to bottom, transparent 0, #000 14px)',
      }}>
        <Leaderboard entries={entries} loading={loading} myUsername={myUsername} showDate />
      </div>
    </Screen>
  );
}
