import { BombIcon, ExpandIcon, ClockIcon } from './Icons.jsx';
import { HudPanel } from './kit.jsx';
import { FAINT, RULE, BODY, NUM } from '../../theme/tokens.js';

/**
 * One power-up bay. The count is the loaded magazine and the "+" is restock —
 * both live on the same tile because during a run the player has no attention
 * to spare for a separate shop affordance.
 */
function PowerBay({ icon, label, count, hasCount, color, onClick, disabled }) {
  const hasStock = hasCount && count > 0;

  return (
    <HudPanel
      onClick={disabled ? undefined : onClick}
      notch={10}
      accent={hasStock ? `${color}66` : RULE}
      style={{ flex: 1, opacity: disabled ? 0.4 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
      innerStyle={{ position: 'relative', minHeight: 74 }}
    >
      <div style={{
        height: '100%', minHeight: 74,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 7, padding: '16px 6px 10px',
      }}>
        {icon}
        <div style={{
          fontFamily: BODY, fontSize: 8.5, fontWeight: 800,
          color: hasStock ? color : FAINT,
          textTransform: 'uppercase', letterSpacing: '0.16em', lineHeight: 1,
        }}>
          {label}
        </div>
      </div>

      {/* Loaded count */}
      {hasStock && (
        <div style={{
          position: 'absolute', top: 6, left: 8,
          minWidth: 19, height: 19, borderRadius: 6, padding: '0 4px',
          background: color, boxShadow: `0 0 10px ${color}80`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: NUM, fontSize: 10, fontWeight: 700, lineHeight: 1,
          color: '#08010f',
        }}>
          {count}
        </div>
      )}

      {/* Restock */}
      <div style={{
        position: 'absolute', top: 7, right: 9,
        width: 15, height: 15, borderRadius: 4,
        border: `1px solid ${RULE}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <svg width="7" height="7" viewBox="0 0 8 8" fill="none" aria-hidden="true">
          <line x1="4" y1="0.8" x2="4" y2="7.2" stroke={FAINT} strokeWidth="1.4" strokeLinecap="round" />
          <line x1="0.8" y1="4" x2="7.2" y2="4" stroke={FAINT} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </div>
    </HudPanel>
  );
}

export default function BottomBar({
  totalBombs, totalExpands, onBombTap, onExpandTap, onTimeTap, disabled,
}) {
  const bombCount   = totalBombs   ?? 0;
  const expandCount = totalExpands ?? 0;

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <PowerBay
        icon={<BombIcon size={24} color={bombCount > 0 ? '#ffd54a' : 'rgba(255,213,74,0.26)'} />}
        label="Bombs"
        count={bombCount}
        hasCount={totalBombs !== undefined}
        color="#ffd54a"
        onClick={onBombTap}
        disabled={disabled}
      />
      <PowerBay
        icon={<ExpandIcon size={24} color={expandCount > 0 ? '#00d4ff' : 'rgba(0,212,255,0.26)'} />}
        label="Expand"
        count={expandCount}
        hasCount={totalExpands !== undefined}
        color="#00d4ff"
        onClick={onExpandTap}
        disabled={disabled}
      />
      <PowerBay
        icon={<ClockIcon size={24} color="#a78bff" />}
        label="Time"
        count={0}
        hasCount={false}
        color="#a78bff"
        onClick={onTimeTap}
        disabled={disabled}
      />
    </div>
  );
}
