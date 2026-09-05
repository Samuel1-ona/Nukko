import { INK, DIM, FAINT, MUTE, RULE, BODY, NUM, GOLD } from '../../theme/tokens.js';

const CYAN   = '#00d4ff';
const PURPLE = '#7b2fff';
const MAX_LEVEL = 12;

// Podium metals, matching the score board so a player reads both the same way.
const MEDALS = { 1: GOLD, 2: '#b9c7d6', 3: '#cf8a4e' };

const short = (a) => (a ? `${a.slice(0, 6)}…${a.slice(-4)}` : '');

// ── Occupancy: how crowded each rung is right now ────────────────────────────
// The cheaper of the two facts and arguably the more useful one. A player
// deciding whether the next rung is worth a week is asking a question about
// other people, and a count answers it without naming anyone.

function Occupancy({ distribution, myLevel, compact }) {
  const counts = Array.from({ length: MAX_LEVEL }, (_, i) => distribution?.[i + 1] ?? 0);
  const peak   = Math.max(1, ...counts);

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: compact ? 3 : 5, height: compact ? 34 : 52 }}>
      {counts.map((n, i) => {
        const level = i + 1;
        const mine  = level === myLevel;
        // A rung with nobody on it still shows a sliver, so it reads as an
        // empty rung rather than as a gap in the chart.
        const h = n === 0 ? 2 : Math.max(4, Math.round((n / peak) * (compact ? 24 : 38)));
        return (
          <div key={level} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
            {!compact && (
              <div style={{
                fontFamily: NUM, fontSize: 9, fontVariantNumeric: 'tabular-nums',
                color: n === 0 ? MUTE : (mine ? GOLD : DIM),
              }}>
                {n || ''}
              </div>
            )}
            <div style={{
              width: '100%', height: h, borderRadius: 2,
              background: mine ? GOLD : (n === 0 ? RULE : CYAN),
              opacity: mine ? 1 : (n === 0 ? 1 : 0.55),
            }} />
            <div style={{
              fontFamily: NUM, fontSize: compact ? 7.5 : 8.5, fontVariantNumeric: 'tabular-nums',
              color: mine ? GOLD : MUTE, fontWeight: mine ? 800 : 400,
            }}>
              {level}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── One player's row ─────────────────────────────────────────────────────────

function StandingRow({ entry, isMe, last }) {
  const medal = MEDALS[entry.rank];
  return (
    <div style={{
      position: 'relative', display: 'grid',
      gridTemplateColumns: '30px 1fr auto',
      alignItems: 'center', columnGap: 12,
      padding: '11px 4px 11px 12px',
      borderBottom: last ? 'none' : `1px solid ${RULE}`,
      background: isMe ? 'rgba(255,213,74,0.07)' : 'transparent',
    }}>
      {isMe && (
        <div style={{ position: 'absolute', left: 0, top: 6, bottom: 6, width: 2, background: GOLD, borderRadius: 2 }} />
      )}

      <div style={{
        fontFamily: NUM, fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        color: medal ?? MUTE, letterSpacing: '-0.02em',
      }}>
        {String(entry.rank).padStart(2, '0')}
      </div>

      <div style={{ minWidth: 0 }}>
        <div style={{
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          fontFamily: BODY, fontSize: 14, fontWeight: isMe ? 800 : 600,
          color: isMe ? '#fff' : 'rgba(233,224,246,0.82)',
        }}>
          {entry.username || short(entry.address)}
          {isMe && (
            <span style={{ marginLeft: 7, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', color: GOLD, verticalAlign: 'middle' }}>
              YOU
            </span>
          )}
        </div>
        <div style={{ fontFamily: BODY, fontSize: 9.5, letterSpacing: '0.1em', color: FAINT, marginTop: 1 }}>
          {entry.badge}
        </div>
      </div>

      <div style={{
        fontFamily: NUM, fontSize: 13, fontWeight: 700, fontVariantNumeric: 'tabular-nums',
        color: isMe ? GOLD : 'rgba(246,241,251,0.92)',
      }}>
        {entry.level}<span style={{ color: MUTE, fontSize: 10 }}>/{MAX_LEVEL}</span>
      </div>
    </div>
  );
}

/**
 * One component, two variants — `compact` for the strip above the rung map,
 * `full` for its own board in the standings screen. Two variants cannot
 * drift; two components would.
 *
 * The caller owns the fetch.
 */
export default function LadderStandings({
  standings = [], distribution = {}, players = 0,
  loading = false, myAddress, myLevel, compact = false,
}) {
  const me = myAddress?.toLowerCase();

  if (compact) {
    return (
      <div style={{ padding: '2px 0 12px' }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
          marginBottom: 7,
        }}>
          <span style={{ fontFamily: BODY, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.14em', color: FAINT }}>
            WHO IS WHERE
          </span>
          <span style={{ fontFamily: NUM, fontSize: 10, color: FAINT, fontVariantNumeric: 'tabular-nums' }}>
            {players ? `${players.toLocaleString()} climbing` : ''}
          </span>
        </div>
        <Occupancy distribution={distribution} myLevel={myLevel} compact />
      </div>
    );
  }

  return (
    <div>
      <div style={{
        borderRadius: 14, padding: '13px 14px 10px', marginBottom: 12,
        background: 'rgba(255,255,255,0.03)', border: `1px solid ${RULE}`,
      }}>
        <div style={{
          display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 9,
        }}>
          <span style={{ fontFamily: BODY, fontSize: 9.5, fontWeight: 800, letterSpacing: '0.14em', color: FAINT }}>
            PLAYERS PER RUNG
          </span>
          <span style={{ fontFamily: NUM, fontSize: 10.5, color: DIM, fontVariantNumeric: 'tabular-nums' }}>
            {players.toLocaleString()} climbing
          </span>
        </div>
        <Occupancy distribution={distribution} myLevel={myLevel} />
      </div>

      {loading && !standings.length && (
        <div style={{ padding: '18px 4px', fontFamily: BODY, fontSize: 12, color: FAINT }}>Loading…</div>
      )}

      {!loading && !standings.length && (
        <div style={{
          borderRadius: 14, padding: '18px 16px', textAlign: 'center',
          background: 'rgba(255,255,255,0.03)', border: `1px solid ${RULE}`,
          fontFamily: BODY, fontSize: 12, color: FAINT,
        }}>
          Nobody has climbed yet. Clear level 1 and you are top of this board.
        </div>
      )}

      {standings.map((e, i) => (
        <StandingRow
          key={e.address}
          entry={e}
          isMe={me && e.address?.toLowerCase() === me}
          last={i === standings.length - 1}
        />
      ))}
    </div>
  );
}
