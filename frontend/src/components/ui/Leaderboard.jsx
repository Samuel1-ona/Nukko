import { useTheme } from '../../theme/ThemeContext.jsx';

// Podium metals. Everything below third place is deliberately quiet — the
// point of a standings table is that the top is easy to find.
const MEDALS = {
  1: '#ffd54a',
  2: '#b9c7d6',
  3: '#cf8a4e',
};

function Row({ entry, isMe, showDate, last }) {
  const medal = MEDALS[entry.rank];
  return (
    <div style={{
      position: 'relative',
      display: 'grid',
      gridTemplateColumns: showDate ? '30px 1fr auto 62px' : '30px 1fr auto',
      alignItems: 'center',
      columnGap: 12,
      padding: '11px 4px 11px 12px',
      borderBottom: last ? 'none' : '1px solid rgba(190,170,225,0.09)',
      background: isMe ? 'rgba(255,213,74,0.07)' : 'transparent',
    }}>
      {isMe && (
        <div style={{
          position: 'absolute', left: 0, top: 6, bottom: 6, width: 2,
          background: '#ffd54a', borderRadius: 2,
        }} />
      )}

      <div style={{
        fontFamily: '"Space Mono", monospace', fontSize: 12, fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        color: medal ?? 'rgba(233,224,246,0.32)',
        letterSpacing: '-0.02em',
      }}>
        {String(entry.rank).padStart(2, '0')}
      </div>

      <div style={{
        minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        fontFamily: '"Nunito", system-ui',
        fontSize: 14, fontWeight: isMe ? 800 : 600,
        color: isMe ? '#fff' : 'rgba(233,224,246,0.82)',
      }}>
        {entry.username || 'anon'}
        {isMe && (
          <span style={{
            marginLeft: 7, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em',
            color: '#ffd54a', verticalAlign: 'middle',
          }}>YOU</span>
        )}
      </div>

      <div style={{
        fontFamily: '"Space Mono", monospace', fontVariantNumeric: 'tabular-nums',
        fontSize: 13, fontWeight: 700,
        color: isMe ? '#ffd54a' : 'rgba(246,241,251,0.92)',
      }}>
        {Number(entry.score).toLocaleString()}
      </div>

      {showDate && (
        <div style={{
          textAlign: 'right',
          fontFamily: '"Nunito", system-ui', fontSize: 10.5,
          color: 'rgba(233,224,246,0.3)',
        }}>
          {entry.date}
        </div>
      )}
    </div>
  );
}

function Empty({ children }) {
  return (
    <div style={{
      padding: '22px 12px', textAlign: 'center',
      fontFamily: '"Nunito", system-ui', fontSize: 12.5,
      color: 'rgba(233,224,246,0.38)', lineHeight: 1.5,
    }}>
      {children}
    </div>
  );
}

export default function Leaderboard({ entries = [], loading, myUsername, showDate = false }) {
  const { theme } = useTheme();

  if (loading && entries.length === 0) {
    // Skeleton rows rather than a spinner — the table's shape is the loader.
    return (
      <div>
        {[0, 1, 2, 3].map(i => (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '11px 4px 11px 12px',
            borderBottom: i < 3 ? '1px solid rgba(190,170,225,0.09)' : 'none',
          }}>
            <div style={{ width: 18, height: 9, borderRadius: 3, background: 'rgba(233,224,246,0.09)' }} />
            <div style={{
              flex: 1, height: 9, borderRadius: 3,
              background: 'rgba(233,224,246,0.07)', maxWidth: 60 + i * 34,
            }} />
            <div style={{ width: 44, height: 9, borderRadius: 3, background: 'rgba(233,224,246,0.09)' }} />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <Empty>
        Nobody has posted a score yet.<br />
        <span style={{ color: theme.secondary, fontWeight: 700 }}>Play one run and the top spot is yours.</span>
      </Empty>
    );
  }

  return (
    <div>
      {entries.map((e, i) => (
        <Row
          key={e.rank ?? `${e.username}-${i}`}
          entry={e}
          isMe={Boolean(myUsername) && e.username === myUsername}
          showDate={showDate}
          last={i === entries.length - 1}
        />
      ))}
    </div>
  );
}
