import { useMemo } from 'react';
import Planet, { PLANET_DATA } from '../ui/Planet.jsx';
import Leaderboard from '../ui/Leaderboard.jsx';
import { StarIcon, CheckIcon, PlayIcon, ChevronLeftIcon } from '../ui/Icons.jsx';
import { Screen, SectionHead, PrimaryButton, Rail, Reveal } from '../ui/kit.jsx';
import { INK, DIM, FAINT, RULE, GOLD, GREEN, DISPLAY, BODY, NUM } from '../../theme/tokens.js';
import { buildScorePost, GAME_URL } from '../../utils/social.js';
import { useTheme } from '../../theme/ThemeContext.jsx';

function Confetti() {
  const items = useMemo(() => Array.from({ length: 28 }, (_, i) => ({
    x: 5 + Math.random() * 90,
    color: ['#ffd54a', '#ff2e9e', '#00d4ff', '#ff6b8a', '#a78bff'][i % 5],
    delay: Math.random() * 0.5,
    dur: 2.8 + Math.random() * 1.5,
    size: 4 + Math.random() * 5,
  })), []);
  return (
    <div className="nk-motion" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
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

function ShareIcon({ size = 17, color = INK }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={{ display: 'block', flexShrink: 0 }}>
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
  score, personalBest, isNewRecord, rank, leaderboard = [], leaderboardLoading,
  onPlayAgain, onGoHome, runSummary, progress, myUsername,
}) {
  const { theme } = useTheme();
  const highestStage = stageFromScore(score);
  const planet = PLANET_DATA[highestStage - 1];
  const codexFound = progress?.discovered?.length ?? 0;
  const codexTotal = PLANET_DATA.length;

  // Near-miss framing — the single strongest retry trigger available. Only
  // shown when the gap is small enough to read as "I nearly had it".
  const gapToBest = personalBest > 0 ? personalBest - score : 0;
  const nearMiss  = !isNewRecord && gapToBest > 0 && gapToBest <= Math.max(600, personalBest * 0.12);

  return (
    <Screen intensity="medium">
      {isNewRecord && <Confetti />}

      <div style={{ flex: '1 1 auto', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>

        {onGoHome && (
          <Reveal style={{ flex: '0 0 auto', marginBottom: 6 }}>
            <button
              onClick={onGoHome}
              aria-label="Back to home"
              className="nk-press-sm"
              style={{
                width: 32, height: 32, borderRadius: '50%', padding: 0,
                background: 'transparent', border: `1px solid ${RULE}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <ChevronLeftIcon size={15} color={DIM} />
            </button>
          </Reveal>
        )}

        {/* ── Score headline. Solid gold, not a gradient — a metric should
               read as a number, not as decoration. ─────────────────────── */}
        <Reveal delay={40} style={{ textAlign: 'center', marginTop: 10, flex: '0 0 auto' }}>
          <div style={{
            fontFamily: BODY, fontSize: 9, fontWeight: 800, letterSpacing: '0.2em',
            color: FAINT, textTransform: 'uppercase',
          }}>
            Final score
          </div>
          <div style={{
            marginTop: 6, fontFamily: NUM, fontWeight: 700, fontSize: 54, lineHeight: 1,
            color: GOLD, letterSpacing: '-0.04em', fontVariantNumeric: 'tabular-nums',
          }}>
            {Number(score).toLocaleString()}
          </div>

          {isNewRecord && (
            <div style={{
              display: 'inline-flex', marginTop: 12, alignItems: 'center', gap: 6,
              padding: '5px 12px', borderRadius: 99,
              border: `1px solid rgba(255,213,74,0.45)`,
              fontFamily: BODY, fontWeight: 800, fontSize: 12, color: GOLD,
            }}>
              <StarIcon size={11} color={GOLD} />
              New personal best
            </div>
          )}

          {nearMiss && (
            <div style={{
              marginTop: 12, fontFamily: BODY, fontSize: 13,
              fontWeight: 700, color: theme.secondary,
            }}>
              {gapToBest.toLocaleString()} short of your best
            </div>
          )}

          {rank && !isNewRecord && !nearMiss && (
            <div style={{ marginTop: 12, fontFamily: BODY, fontSize: 12.5, color: DIM }}>
              Ranked <span style={{ color: GOLD, fontWeight: 800 }}>#{rank}</span> in the cosmos
            </div>
          )}
        </Reveal>

        {/* ── What the run earned ───────────────────────────────────────── */}
        {runSummary && (
          <div style={{ marginTop: 26, flex: '0 0 auto' }}>
            <SectionHead delay={110} action={`+${runSummary.gainedXp} XP`}>Earned</SectionHead>
            <Reveal delay={130}>
              <Rail accent={theme.secondary}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {runSummary.leveledUp && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      fontFamily: BODY, fontSize: 12.5, fontWeight: 800, color: GOLD,
                    }}>
                      <StarIcon size={12} color={GOLD} />
                      <span>Rank up — you are now Rank {runSummary.newLevel}</span>
                    </div>
                  )}
                  {runSummary.discoveredStages?.map(stage => (
                    <div key={stage} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      fontFamily: BODY, fontSize: 12.5, color: INK,
                    }}>
                      <Planet stage={stage} size={18} />
                      <span><strong>New discovery</strong> — {PLANET_DATA[stage - 1]?.name}</span>
                    </div>
                  ))}
                  {runSummary.challengesCompleted?.length > 0 && (
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 7,
                      fontFamily: BODY, fontSize: 12.5, color: GREEN, fontWeight: 700,
                    }}>
                      <CheckIcon size={12} color={GREEN} />
                      <span>
                        {runSummary.challengesCompleted.length} daily challenge
                        {runSummary.challengesCompleted.length > 1 ? 's' : ''} complete
                      </span>
                    </div>
                  )}
                  {!runSummary.leveledUp
                    && !runSummary.discoveredStages?.length
                    && !runSummary.challengesCompleted?.length && (
                    <div style={{ fontFamily: BODY, fontSize: 12.5, color: DIM }}>
                      {runSummary.gainedXp} experience toward your next level.
                    </div>
                  )}
                </div>
              </Rail>
            </Reveal>
          </div>
        )}

        {/* ── Furthest planet this run ──────────────────────────────────── */}
        <div style={{ marginTop: 22, flex: '0 0 auto' }}>
          <SectionHead delay={170}>You reached</SectionHead>
          <Reveal delay={190}>
            <Rail accent={theme.primary}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
                <Planet stage={highestStage} size={44} glow />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 18, color: INK }}>
                    {planet?.name ?? `Stage ${highestStage}`}
                  </div>
                  <div style={{ marginTop: 1, fontFamily: BODY, fontSize: 11.5, color: DIM }}>
                    Stage {highestStage} of {codexTotal} · {codexFound} catalogued
                  </div>
                </div>
                {personalBest > 0 && (
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <div style={{
                      fontFamily: NUM, fontWeight: 700, fontSize: 15, color: DIM,
                      fontVariantNumeric: 'tabular-nums',
                    }}>
                      {Number(personalBest).toLocaleString()}
                    </div>
                    <div style={{
                      fontFamily: BODY, fontSize: 8.5, fontWeight: 800, color: FAINT,
                      textTransform: 'uppercase', letterSpacing: '0.14em',
                    }}>
                      Best
                    </div>
                  </div>
                )}
              </div>
            </Rail>
          </Reveal>
        </div>

        {/* ── Standings ────────────────────────────────────────────────── */}
        {leaderboard.length > 0 && (
          <div style={{ marginTop: 22, flex: '0 0 auto' }}>
            <SectionHead delay={230}>Standings</SectionHead>
            <Reveal delay={250}>
              <Leaderboard
                entries={leaderboard.slice(0, 5)}
                loading={leaderboardLoading}
                myUsername={myUsername}
              />
            </Reveal>
          </div>
        )}

        <div style={{ flex: 1, minHeight: 20 }} />
      </div>

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <Reveal delay={290} style={{ flex: '0 0 auto', paddingTop: 12 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => handleShare(score, planet?.name, rank)}
            className="nk-press"
            style={{
              height: 54, paddingInline: 18, borderRadius: 14, flexShrink: 0,
              background: 'transparent', border: `1px solid ${RULE}`,
              color: DIM, display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: BODY, fontWeight: 700, fontSize: 13,
            }}
          >
            <ShareIcon size={16} color={DIM} />
            Share
          </button>
          <PrimaryButton onClick={onPlayAgain} icon={<PlayIcon size={13} />} style={{ flex: 1, width: 'auto' }}>
            Play Again
          </PrimaryButton>
        </div>
      </Reveal>
    </Screen>
  );
}
