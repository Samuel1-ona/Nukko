import Planet, { PLANET_DATA } from '../ui/Planet.jsx';
import { Screen, ScreenHeader, SectionHead, Readout, ReadoutStrip, ReadoutDivider, Reveal } from '../ui/kit.jsx';
import { INK, DIM, FAINT, RULE, GOLD, DISPLAY, BODY, NUM } from '../../theme/tokens.js';
import { useTheme } from '../../theme/ThemeContext.jsx';
import { levelProgress, titleForLevel } from '../../game/progression.js';

function fmtDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * One rung of the chain. The connector runs behind the planets, so the list
 * reads as the merge sequence it actually is — the old 3-across grid called
 * itself "the evolution chain" while showing no chain at all.
 */
function ChainRow({ planet, discovered, merges, firstSeen, first, last }) {
  const size = Math.round(19 + planet.stage * 1.5);

  return (
    <div style={{
      position: 'relative', display: 'flex', alignItems: 'center', gap: 13,
      padding: '9px 0',
    }}>
      <div style={{
        fontFamily: NUM, fontSize: 10.5, fontWeight: 700, color: FAINT,
        width: 18, flexShrink: 0, textAlign: 'right',
      }}>
        {String(planet.stage).padStart(2, '0')}
      </div>

      {/* Planet column, with the chain passing behind it */}
      <div style={{
        position: 'relative', width: 44, height: 44, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {!first && (
          <div style={{
            position: 'absolute', left: '50%', top: -9, height: 'calc(50% + 9px)',
            width: 1, background: RULE, transform: 'translateX(-50%)',
          }} />
        )}
        {!last && (
          <div style={{
            position: 'absolute', left: '50%', top: '50%', bottom: -9,
            width: 1, background: RULE, transform: 'translateX(-50%)',
          }} />
        )}
        <div style={{
          // Undiscovered planets stay silhouettes — the shape is the tease.
          filter: discovered ? 'none' : 'brightness(0) invert(0.19)',
          opacity: discovered ? 1 : 0.85,
        }}>
          <Planet stage={planet.stage} size={size} glow={discovered && planet.stage >= 12} />
        </div>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: BODY, fontSize: 13.5, fontWeight: discovered ? 700 : 600,
          color: discovered ? INK : 'rgba(233,224,246,0.26)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {discovered ? planet.name : 'Undiscovered'}
        </div>
        {discovered && (merges > 0 || firstSeen) && (
          <div style={{ marginTop: 1, fontFamily: NUM, fontSize: 10, color: FAINT }}>
            {merges > 0 ? `×${merges}` : ''}
            {merges > 0 && firstSeen ? ' · ' : ''}
            {fmtDate(firstSeen)}
          </div>
        )}
      </div>

    </div>
  );
}

export default function Codex({ onBack, progress }) {
  const { theme } = useTheme();
  const discovered = new Set(progress?.discovered ?? []);
  const found = discovered.size;
  const total = PLANET_DATA.length;
  const lvl = levelProgress(progress?.xp ?? 0);

  return (
    <Screen intensity="medium">
      <ScreenHeader title="Codex" subtitle={titleForLevel(lvl.level)} onBack={onBack} rule={false} />

      <Reveal delay={60} style={{ marginTop: 16, flex: '0 0 auto' }}>
        <ReadoutStrip>
          <Readout label="Catalogued" value={`${found}/${total}`} accent={GOLD} />
          <ReadoutDivider />
          <Readout label="Complete" value={`${Math.round((found / total) * 100)}%`} accent={theme.secondary} />
          <ReadoutDivider />
          <Readout label="Level" value={lvl.level} />
        </ReadoutStrip>
        <div style={{ height: 2, background: 'rgba(0,0,0,0.3)', overflow: 'hidden' }}>
          <div style={{
            width: `${Math.round(lvl.pct * 100)}%`, height: '100%',
            background: theme.secondary, opacity: 0.7,
            transition: 'width 700ms cubic-bezier(0.16,1,0.3,1)',
          }} />
        </div>
        <div style={{
          marginTop: 5, textAlign: 'right', fontFamily: BODY, fontSize: 8.5,
          fontWeight: 800, letterSpacing: '0.13em', textTransform: 'uppercase', color: FAINT,
        }}>
          {Math.max(0, lvl.needed - lvl.into).toLocaleString()} xp to level {lvl.level + 1}
        </div>
      </Reveal>

      <div style={{
        flex: '1 1 auto', overflowY: 'auto', marginTop: 20,
        WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 16px)',
        maskImage: 'linear-gradient(to bottom, transparent 0, #000 16px)',
      }}>
        <SectionHead delay={120}>The chain</SectionHead>
        <Reveal delay={150}>
          {PLANET_DATA.map((p, i) => (
            <ChainRow
              key={p.stage}
              planet={p}
              discovered={discovered.has(p.stage)}
              merges={progress?.mergesByStage?.[p.stage] ?? 0}
              firstSeen={progress?.firstSeenAt?.[p.stage]}
              first={i === 0}
              last={i === PLANET_DATA.length - 1}
            />
          ))}
        </Reveal>

        {found < total && (
          <Reveal delay={200} style={{
            marginTop: 14, paddingTop: 14, borderTop: `1px solid ${RULE}`,
            fontFamily: BODY, fontSize: 12, color: DIM, lineHeight: 1.5,
          }}>
            {total - found} still uncatalogued. Merge up the chain to reveal them.
          </Reveal>
        )}
        <div style={{ height: 16 }} />
      </div>
    </Screen>
  );
}
