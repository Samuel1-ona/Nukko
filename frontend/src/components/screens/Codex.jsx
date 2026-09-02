import CosmicBackground from '../ui/CosmicBackground.jsx';
import BackChevron      from '../ui/BackChevron.jsx';
import Planet, { PLANET_DATA } from '../ui/Planet.jsx';
import { useTheme }     from '../../theme/ThemeContext.jsx';
import { levelProgress, titleForLevel } from '../../game/progression.js';

function fmtDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function CodexCell({ planet, discovered, merges, firstSeen }) {
  const { theme } = useTheme();
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
      padding: '12px 6px 10px', borderRadius: 16, minHeight: 118,
      justifyContent: 'flex-end',
      background: discovered ? `rgba(${theme.primaryRGB},0.07)` : 'rgba(255,255,255,0.025)',
      border: `1px solid ${discovered ? `rgba(${theme.primaryRGB},0.28)` : 'rgba(255,255,255,0.06)'}`,
    }}>
      <div style={{
        height: 52, display: 'flex', alignItems: 'center', justifyContent: 'center',
        // Undiscovered planets show as silhouettes — the shape is the tease
        filter: discovered ? 'none' : 'brightness(0) invert(0.22)',
        opacity: discovered ? 1 : 0.75,
      }}>
        <Planet stage={planet.stage} size={Math.min(48, 22 + planet.stage * 2.2)} glow={discovered && planet.stage >= 11} />
      </div>
      <div style={{
        fontFamily: '"Space Mono", monospace', fontSize: 9,
        color: 'rgba(255,255,255,0.4)',
      }}>{String(planet.stage).padStart(2, '0')}</div>
      <div style={{
        fontFamily: '"Nunito", system-ui', fontSize: 10.5, fontWeight: 700,
        textAlign: 'center', lineHeight: 1.15,
        color: discovered ? '#fff' : 'rgba(255,255,255,0.32)',
      }}>{discovered ? planet.short : '???'}</div>
      {discovered && (
        <div style={{
          fontFamily: '"Nunito", system-ui', fontSize: 9,
          color: 'rgba(255,255,255,0.42)', textAlign: 'center',
        }}>
          {merges > 0 ? `×${merges}` : ''}{merges > 0 && firstSeen ? ' · ' : ''}{fmtDate(firstSeen)}
        </div>
      )}
    </div>
  );
}

export default function Codex({ onBack, progress }) {
  const { theme } = useTheme();
  const discovered = new Set(progress?.discovered ?? []);
  const found = discovered.size;
  const total = PLANET_DATA.length;
  const pct = Math.round((found / total) * 100);
  const lvl = levelProgress(progress?.xp ?? 0);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0a0015' }}>
      <CosmicBackground intensity="medium">
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '18px 20px', boxSizing: 'border-box' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <BackChevron onClick={onBack} />
            <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 21, color: '#fff' }}>Codex</div>
          </div>

          {/* Rank + completion */}
          <div style={{
            marginTop: 18, borderRadius: 20, padding: '16px 18px',
            background: `linear-gradient(140deg, rgba(${theme.primaryRGB},0.24), rgba(${theme.secondaryRGB},0.10))`,
            border: '1px solid rgba(255,255,255,0.1)',
          }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
              <div>
                <div style={{ fontFamily: '"Nunito", system-ui', fontWeight: 800, fontSize: 17, color: '#fff' }}>
                  {titleForLevel(lvl.level)}
                </div>
                <div style={{ marginTop: 2, fontFamily: '"Nunito", system-ui', fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>
                  Rank {lvl.level} · {lvl.into}/{lvl.needed} XP
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{
                  fontFamily: '"Space Mono", monospace', fontWeight: 700, fontSize: 20, color: '#ffd700',
                }}>{found}<span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>/{total}</span></div>
                <div style={{
                  fontFamily: '"Nunito", system-ui', fontSize: 9.5, letterSpacing: '0.1em',
                  textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)',
                }}>catalogued</div>
              </div>
            </div>
            {/* Rank progress */}
            <div style={{ marginTop: 12, height: 5, borderRadius: 99, background: 'rgba(0,0,0,0.3)', overflow: 'hidden' }}>
              <div style={{
                width: `${lvl.pct * 100}%`, height: '100%', borderRadius: 99,
                background: theme.gradient, transition: 'width .4s ease',
              }} />
            </div>
          </div>

          <div style={{
            marginTop: 16, marginBottom: 10, display: 'flex',
            alignItems: 'baseline', justifyContent: 'space-between',
          }}>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 800,
              letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)',
            }}>The evolution chain</div>
            <div style={{
              fontFamily: '"Nunito", system-ui', fontSize: 11, fontWeight: 700, color: theme.secondary,
            }}>{pct}%</div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {PLANET_DATA.map(p => (
                <CodexCell
                  key={p.stage}
                  planet={p}
                  discovered={discovered.has(p.stage)}
                  merges={progress?.mergesByStage?.[p.stage] ?? 0}
                  firstSeen={progress?.firstSeenAt?.[p.stage]}
                />
              ))}
            </div>
            {found < total && (
              <div style={{
                marginTop: 16, textAlign: 'center',
                fontFamily: '"Nunito", system-ui', fontSize: 12,
                color: 'rgba(255,255,255,0.45)', lineHeight: 1.5,
              }}>
                {total - found} still uncatalogued — merge your way up the chain to reveal them.
              </div>
            )}
          </div>
        </div>
      </CosmicBackground>
    </div>
  );
}
