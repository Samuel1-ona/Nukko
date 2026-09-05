import { useState } from 'react';
import Leaderboard from '../ui/Leaderboard.jsx';
import LadderStandings from '../ui/LadderStandings.jsx';
import { Screen, ScreenHeader } from '../ui/kit.jsx';
import { INK, DIM, FAINT, RULE, BODY } from '../../theme/tokens.js';

const PURPLE = '#7b2fff';

// Two boards, not one list with a preamble. A score belongs to a run; a rung
// is where a player stands now, and stacking them reads as though the second
// were a footnote to the first.
const TABS = [
  {
    key: 'scores',
    label: 'TOP SCORES',
    title: 'Standings',
    subtitle: 'Top scores across the galaxy',
    note: null,
  },
  {
    key: 'ladder',
    label: 'THE LADDER',
    title: 'The Ladder',
    subtitle: 'Who is standing where, right now',
    // Free space to explain the rule players have just met, read at the exact
    // moment they are looking at who is ahead of them.
    note: 'Every rung starts you from zero — its targets count only what you do after you reach it, and one clear moves you up one rung. Progress resets Monday 00:00 UTC.',
  },
];

export default function FullLeaderboard({
  onBack, entries, loading, myUsername,
  myAddress, myLevel, ladder,
}) {
  // Defaults to the older board: the rank on the card that opens this screen
  // refers to scores, so opening on the ladder would contradict it.
  const [tab, setTab] = useState('scores');
  const active = TABS.find(t => t.key === tab) ?? TABS[0];

  return (
    <Screen intensity="medium">
      <ScreenHeader
        title={active.title}
        subtitle={active.subtitle}
        onBack={onBack}
      />

      <div style={{ display: 'flex', gap: 6, marginTop: 12, flex: '0 0 auto' }}>
        {TABS.map(t => {
          const on = t.key === tab;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="nk-press-sm"
              style={{
                flex: 1, padding: '9px 6px', borderRadius: 10,
                background: 'transparent',
                border: `1px solid ${on ? PURPLE : RULE}`,
                color: on ? INK : FAINT,
                fontFamily: BODY, fontSize: 10.5, fontWeight: 800, letterSpacing: '0.08em',
              }}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div style={{
        flex: '1 1 auto', overflowY: 'auto', marginTop: 14,
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 14px)',
        maskImage: 'linear-gradient(to bottom, transparent 0, #000 14px)',
      }}>
        {tab === 'scores' ? (
          <Leaderboard entries={entries} loading={loading} myUsername={myUsername} showDate />
        ) : (
          <LadderStandings
            standings={ladder?.standings}
            distribution={ladder?.distribution}
            players={ladder?.players}
            loading={ladder?.loading}
            myAddress={myAddress}
            myLevel={myLevel}
          />
        )}

        {active.note && (
          <div style={{
            marginTop: 14, padding: '0 4px 4px',
            fontFamily: BODY, fontSize: 10.5, lineHeight: 1.6, color: FAINT,
          }}>
            {active.note}
          </div>
        )}
      </div>
    </Screen>
  );
}
