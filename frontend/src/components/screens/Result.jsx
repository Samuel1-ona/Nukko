import { useMemo } from 'react';
import CosmicBackground from '../ui/CosmicBackground.jsx';
import Planet           from '../ui/Planet.jsx';
import Leaderboard      from '../ui/Leaderboard.jsx';
import BackChevron      from '../ui/BackChevron.jsx';
import { PLANET_DATA }  from '../ui/Planet.jsx';
import { buildScorePost, GAME_URL } from '../../utils/social.js';
import { useTheme }     from '../../theme/ThemeContext.jsx';

function Confetti() {
  const items = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    x: 5 + Math.random() * 90,
    color: ['#ffd700', '#ff2e9e', '#00d4ff', '#ff6b8a', '#a78bff'][i % 5],
    delay: Math.random() * 0.5,
    dur: 2.8 + Math.random() * 1.5,
    size: 4 + Math.random() * 5,
    rot: Math.random() * 720,
  })), []);
  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {items.map((it, i) => (
        <div key={i} style={{
          position: 'absolute', left: `${it.x}%`, top: '-20px',
          width: it.size, height: it.size, borderRadius: i % 3 === 0 ? '50%' : 2,
          background: it.color,
          animation: `nukko-confetti ${it.dur}s ease-in ${it.delay}s forwards`,
        }} />
      ))}
    </div>
  );
}

function StarIcon({ size = 12, color = '#ffd700' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <path d="M6 1l1.12 3.09H10.5L7.84 6.2l1.07 3.09L6 7.56l-2.91 1.73L4.16 6.2 1.5 4.09h3.38L6 1z"
        fill={color} />
    </svg>
  );
}

function ShareIcon({ size = 18, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="14" cy="4" r="2" stroke={color} strokeWidth="1.4" />
      <circle cx="4"  cy="9" r="2" stroke={color} strokeWidth="1.4" />
      <circle cx="14" cy="14" r="2" stroke={color} strokeWidth="1.4" />
      <path d="M6 10.3l6 2.4M12 5.3L6 7.7" stroke={color} strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

// MiniPay's webview blocks external navigation, so no X intent link here —
// the native share sheet (or clipboard) carries the @playnukko brag instead.
function handleShare(score, planetName, rank) {
  const text = buildScorePost(score, planetName, rank);
  if (navigator.share) {
    navigator.share({ title: 'Nukko', text, url: GAME_URL }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(`${text}\n\n${GAME_URL}`).catch(() => {});
  }
}

function stageFromScore(score) {
  if (!score || score < 100)  return 2;
  if (score < 500)   return 3;
  if (score < 2000)  return 5;
  if (score < 5000)  return 7;
  if (score < 10000) return 9;
  if (score < 20000) return 11;
  if (score < 50000) return 12;
  return 13;
}

export default function Result({
  score,
  personalBest,
  isNewRecord,
  rank,
  leaderboard,
  leaderboardLoading,
  onPlayAgain,
  onGoHome,
}) {
  const { theme } = useTheme();
  const highestStage = stageFromScore(score);
  const planet = PLANET_DATA[highestStage - 1];

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        {isNewRecord && <Confetti />}

        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          padding: '18px 18px 18px', boxSizing: 'border-box', overflowY: 'auto',
        }}>

          {/* ── Header — back to Home ────────────────────────────────────── */}
          {onGoHome && (
            <div style={{ marginBottom: 12 }}>
              <BackChevron onClick={onGoHome} />
            </div>
          )}

          {/* ── Score headline ───────────────────────────────────────────── */}
          <div style={{ textAlign: 'center', animation: 'nukko-score-pop 0.5s ease-out' }}>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 11, letterSpacing: '0.22em',
              color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase',
            }}>
              Final Score
            </div>

            <div style={{
              marginTop: 4, fontFamily: '"Space Mono", monospace',
              fontWeight: 700, fontSize: 52, lineHeight: 1,
              background: 'linear-gradient(135deg, #fff 10%, #ffd700 55%, #ff6b8a 90%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text', letterSpacing: '-0.03em',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {Number(score).toLocaleString()}
            </div>

            {isNewRecord && (
              <div style={{
                display: 'inline-flex', marginTop: 10, alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 99,
                background: 'linear-gradient(90deg, rgba(255,215,0,0.2), rgba(167,139,255,0.2))',
                border: '1px solid rgba(255,215,0,0.4)',
                fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 13, color: '#ffd700',
              }}>
                <StarIcon size={12} color="#ffd700" />
                New Personal Best!
              </div>
            )}

            {rank && (
              <div style={{
                marginTop: 10, fontFamily: '"Nunito", system-ui', fontSize: 13,
                color: 'rgba(255,255,255,0.6)',
              }}>
                Ranked{' '}
                <span style={{ color: '#ffd700', fontWeight: 800 }}>#{rank}</span>
                {' '}in the cosmos
              </div>
            )}
          </div>

          {/* ── Planet reached card ─────────────────────────────────────── */}
          <div style={{
            marginTop: 18, borderRadius: 18, padding: '16px',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.1)',
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <Planet stage={highestStage} size={52} glow />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: '"Nunito", system-ui', fontSize: 10,
                color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.15em',
              }}>
                You reached
              </div>
              <div style={{
                marginTop: 2, fontFamily: '"Nunito", system-ui',
                fontWeight: 800, fontSize: 20, color: '#fff',
              }}>
                {planet?.name ?? `Stage ${highestStage}`}
              </div>
              <div style={{
                marginTop: 2, fontFamily: '"Nunito", system-ui', fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
              }}>
                Stage {highestStage} of 14
              </div>
            </div>
            {personalBest > 0 && (
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontFamily: '"Space Mono", monospace', fontWeight: 700,
                  fontSize: 16, color: 'rgba(255,255,255,0.5)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {Number(personalBest).toLocaleString()}
                </div>
                <div style={{
                  fontFamily: '"Nunito", system-ui', fontSize: 10,
                  color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: '0.1em',
                }}>
                  Best
                </div>
              </div>
            )}
          </div>

          {/* ── Mini leaderboard ────────────────────────────────────────── */}
          {leaderboard.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div style={{
                marginBottom: 8, fontFamily: '"Nunito", system-ui', fontSize: 13,
                fontWeight: 700, color: 'rgba(255,255,255,0.7)',
              }}>
                Top Scores
              </div>
              <Leaderboard
                entries={leaderboard.slice(0, 5)}
                loading={leaderboardLoading}
              />
            </div>
          )}

          <div style={{ flex: 1, minHeight: 16 }} />

          {/* ── Actions ─────────────────────────────────────────────────── */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 8 }}>
            {/* Share — native share sheet with the @playnukko brag text */}
            <button
              onClick={() => handleShare(score, planet?.name, rank)}
              style={{
                height: 56, paddingInline: 18, borderRadius: 16, flexShrink: 0,
                background: 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.14)',
                color: '#fff', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                fontFamily: '"Nunito", system-ui', fontWeight: 700, fontSize: 13,
              }}
            >
              <ShareIcon size={18} />
              Share
            </button>

            {/* Play again */}
            <button
              onClick={onPlayAgain}
              style={{
                flex: 1, height: 56, borderRadius: 16,
                background: theme.gradient,
                border: 'none', color: '#fff',
                fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 17,
                cursor: 'pointer',
                boxShadow: `0 10px 30px -8px rgba(${theme.primaryRGB},0.6), inset 0 1px 0 rgba(255,255,255,0.25)`,
              }}
            >
              Play Again
            </button>
          </div>

        </div>
      </CosmicBackground>
    </div>
  );
}
