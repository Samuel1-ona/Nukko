import { useId } from 'react';
import { useTheme } from '../../theme/ThemeContext.jsx';

export const PLANET_DATA = [
  { stage: 1,  name: 'Space Pebble',  short: 'Pebble',      color: '#9b8e8a' },
  { stage: 2,  name: 'Meteorite',     short: 'Meteorite',   color: '#6b3a1a' },
  { stage: 3,  name: 'Asteroid',      short: 'Asteroid',    color: '#4a4651' },
  { stage: 4,  name: 'Comet',         short: 'Comet',       color: '#a8e8ff' },
  { stage: 5,  name: 'Moon',          short: 'Moon',        color: '#c9c4ba' },
  { stage: 6,  name: 'Dwarf Planet',  short: 'Dwarf',       color: '#d4a574' },
  { stage: 7,  name: 'Rocky Planet',  short: 'Rocky',       color: '#c7553f' },
  { stage: 8,  name: 'Ocean Planet',  short: 'Ocean',       color: '#2a78d4' },
  { stage: 9,  name: 'Ringed Planet', short: 'Ringed',      color: '#e8b85c' },
  { stage: 10, name: 'Gas Giant',     short: 'Gas Giant',   color: '#e89968' },
  { stage: 11, name: 'Brown Dwarf',   short: 'Brown Dwarf', color: '#7a2818' },
  { stage: 12, name: 'Star',          short: 'Star',        color: '#fff2a8' },
  { stage: 13, name: 'Neutron Star',  short: 'Neutron',     color: '#7fd9ff' },
  { stage: 14, name: 'Black Hole',    short: 'Black Hole',  color: '#1a0533' },
];

function renderFace(s) {
  const cx = s / 2, cy = s / 2;
  const eyeR   = Math.max(1.5, s * 0.07);
  const eyeY   = cy - s * 0.04;
  const eyeOffX = s * 0.14;
  const sparkR  = Math.max(0.5, s * 0.025);
  return (
    <g>
      <circle cx={cx - eyeOffX} cy={eyeY} r={eyeR} fill="#1a0628" />
      <circle cx={cx + eyeOffX} cy={eyeY} r={eyeR} fill="#1a0628" />
      <circle cx={cx - eyeOffX + eyeR * 0.35} cy={eyeY - eyeR * 0.35} r={sparkR} fill="#fff" />
      <circle cx={cx + eyeOffX + eyeR * 0.35} cy={eyeY - eyeR * 0.35} r={sparkR} fill="#fff" />
      <path d={`M ${cx - s*0.07} ${cy + s*0.13} Q ${cx} ${cy + s*0.21} ${cx + s*0.07} ${cy + s*0.13}`}
        fill="none" stroke="#1a0628" strokeWidth={Math.max(1, s * 0.035)} strokeLinecap="round" />
      <circle cx={cx - eyeOffX - s*0.04} cy={cy + s*0.08} r={s * 0.045} fill="#ff6b8a" opacity="0.5" />
      <circle cx={cx + eyeOffX + s*0.04} cy={cy + s*0.08} r={s * 0.045} fill="#ff6b8a" opacity="0.5" />
    </g>
  );
}

function renderPlanet(stage, s, id, accentColor) {
  const r = s / 2, cx = s / 2, cy = s / 2;

  switch (stage) {
    case 1: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#d4cbc3" />
            <stop offset="60%" stopColor="#9b8e8a" />
            <stop offset="100%" stopColor="#5a4f4a" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 0.96} fill={`url(#${id}-g)`} />
        <circle cx={cx + r*0.3}  cy={cy + r*0.25} r={r*0.15} fill="#000" opacity="0.18" />
        <circle cx={cx - r*0.35} cy={cy + r*0.4}  r={r*0.08} fill="#000" opacity="0.18" />
      </g>
    );
    case 2: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#8a4a2a" />
            <stop offset="70%" stopColor="#4a2410" />
            <stop offset="100%" stopColor="#2a1408" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 0.96} fill={`url(#${id}-g)`} />
        <path d={`M ${cx-r*0.5} ${cy-r*0.2} L ${cx+r*0.1} ${cy+r*0.1} L ${cx+r*0.4} ${cy-r*0.4}`}
          stroke="#ff7a2a" strokeWidth={Math.max(1, s*0.025)} fill="none" opacity="0.9" />
        <path d={`M ${cx-r*0.3} ${cy+r*0.5} L ${cx+r*0.05} ${cy+r*0.2}`}
          stroke="#ff9d4a" strokeWidth={Math.max(1, s*0.02)} fill="none" opacity="0.85" />
      </g>
    );
    case 3: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#7a7480" />
            <stop offset="100%" stopColor="#2e2a36" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 0.96} fill={`url(#${id}-g)`} />
        <circle cx={cx - r*0.3}  cy={cy - r*0.2} r={r*0.12} fill="#000" opacity="0.3" />
        <circle cx={cx + r*0.25} cy={cy + r*0.35} r={r*0.18} fill="#000" opacity="0.25" />
        <circle cx={cx + r*0.4}  cy={cy - r*0.4}  r={r*0.07} fill="#000" opacity="0.3" />
      </g>
    );
    case 4: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#a8e8ff" />
            <stop offset="100%" stopColor="#3d8fb8" />
          </radialGradient>
          <linearGradient id={`${id}-tail`} x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#a8e8ff" stopOpacity="0" />
            <stop offset="100%" stopColor="#a8e8ff" stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <path d={`M ${cx-r*0.2} ${cy-r*0.4} Q ${cx-r*1.5} ${cy} ${cx-r*0.2} ${cy+r*0.4} Z`}
          fill={`url(#${id}-tail)`} />
        <circle cx={cx} cy={cy} r={r * 0.85} fill={`url(#${id}-g)`} />
      </g>
    );
    case 5: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#f0ebe0" />
            <stop offset="60%" stopColor="#c9c4ba" />
            <stop offset="100%" stopColor="#6e6a5e" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 0.96} fill={`url(#${id}-g)`} />
        <circle cx={cx - r*0.35} cy={cy - r*0.2}  r={r*0.13} fill="#000" opacity="0.16" />
        <circle cx={cx + r*0.25} cy={cy + r*0.1}   r={r*0.2}  fill="#000" opacity="0.13" />
        <circle cx={cx + r*0.05} cy={cy - r*0.45}  r={r*0.07} fill="#000" opacity="0.18" />
        <circle cx={cx - r*0.15} cy={cy + r*0.45}  r={r*0.09} fill="#000" opacity="0.15" />
      </g>
    );
    case 6: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#f0d4a8" />
            <stop offset="60%" stopColor="#c89a64" />
            <stop offset="100%" stopColor="#6e4828" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 0.96} fill={`url(#${id}-g)`} />
        <ellipse cx={cx + r*0.1} cy={cy + r*0.25} rx={r*0.35} ry={r*0.28} fill="#f5e0b8" opacity="0.55" />
      </g>
    );
    case 7: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#e8825c" />
            <stop offset="60%" stopColor="#c7553f" />
            <stop offset="100%" stopColor="#5a2418" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 0.96} fill={`url(#${id}-g)`} />
        <ellipse cx={cx - r*0.25} cy={cy - r*0.1}  rx={r*0.3}  ry={r*0.18} fill="#7a2818" opacity="0.5" />
        <ellipse cx={cx + r*0.3}  cy={cy + r*0.3}   rx={r*0.2}  ry={r*0.12} fill="#7a2818" opacity="0.45" />
        <ellipse cx={cx - r*0.05} cy={cy + r*0.45}  rx={r*0.18} ry={r*0.08} fill="#fff"    opacity="0.3" />
      </g>
    );
    case 8: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#7fc7ff" />
            <stop offset="50%" stopColor="#2a78d4" />
            <stop offset="100%" stopColor="#0a2a5a" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 0.96} fill={`url(#${id}-g)`} />
        <ellipse cx={cx - r*0.2} cy={cy - r*0.3}  rx={r*0.25} ry={r*0.1}  fill="#a8d8ff" opacity="0.4" />
        <ellipse cx={cx + r*0.3} cy={cy + r*0.1}   rx={r*0.3}  ry={r*0.12} fill="#a8d8ff" opacity="0.35" />
        <ellipse cx={cx - r*0.1} cy={cy + r*0.4}   rx={r*0.35} ry={r*0.1}  fill="#7fb8ff" opacity="0.3" />
        <path d={`M ${cx+r*0.1} ${cy-r*0.1} Q ${cx+r*0.4} ${cy-r*0.2} ${cx+r*0.5} ${cy+r*0.1} Q ${cx+r*0.3} ${cy+r*0.05} ${cx+r*0.1} ${cy-r*0.1} Z`}
          fill="#3d8a4a" opacity="0.7" />
      </g>
    );
    case 9: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#fff0b8" />
            <stop offset="60%" stopColor="#e8b85c" />
            <stop offset="100%" stopColor="#7a4a18" />
          </radialGradient>
          <linearGradient id={`${id}-ring`} x1="0%" x2="100%">
            <stop offset="0%"   stopColor="#d4a85a" stopOpacity="0.3" />
            <stop offset="50%"  stopColor="#f0d488" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#d4a85a" stopOpacity="0.3" />
          </linearGradient>
        </defs>
        <ellipse cx={cx} cy={cy} rx={r*1.35} ry={r*0.32} fill="none"
          stroke={`url(#${id}-ring)`} strokeWidth={s*0.05} opacity="0.95"
          transform={`rotate(-18 ${cx} ${cy})`} />
        <ellipse cx={cx} cy={cy} rx={r*0.78} ry={r*0.78} fill={`url(#${id}-g)`} />
        <ellipse cx={cx} cy={cy - r*0.2}  rx={r*0.7}  ry={r*0.05} fill="#a86a18" opacity="0.4" />
        <ellipse cx={cx} cy={cy + r*0.15} rx={r*0.74} ry={r*0.06} fill="#a86a18" opacity="0.35" />
        <ellipse cx={cx} cy={cy} rx={r*1.35} ry={r*0.32} fill="none"
          stroke={`url(#${id}-ring)`} strokeWidth={s*0.05} opacity="0.95"
          transform={`rotate(-18 ${cx} ${cy})`} />
        <ellipse cx={cx} cy={cy} rx={r*1.1} ry={r*0.26} fill="none"
          stroke="#f8e4a8" strokeWidth={s*0.012} opacity="0.6"
          transform={`rotate(-18 ${cx} ${cy})`} />
      </g>
    );
    case 10: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#ffd4a8" />
            <stop offset="60%" stopColor="#e89968" />
            <stop offset="100%" stopColor="#6e3a18" />
          </radialGradient>
          <clipPath id={`${id}-clip`}>
            <circle cx={cx} cy={cy} r={r * 0.96} />
          </clipPath>
        </defs>
        <circle cx={cx} cy={cy} r={r * 0.96} fill={`url(#${id}-g)`} />
        <g clipPath={`url(#${id}-clip)`}>
          <rect x="0" y={cy - r*0.7}  width={s} height={r*0.1}  fill="#a86838" opacity="0.55" />
          <rect x="0" y={cy - r*0.4}  width={s} height={r*0.14} fill="#fff"    opacity="0.25" />
          <rect x="0" y={cy - r*0.1}  width={s} height={r*0.08} fill="#a86838" opacity="0.5" />
          <rect x="0" y={cy + r*0.15} width={s} height={r*0.18} fill="#fff"    opacity="0.18" />
          <rect x="0" y={cy + r*0.5}  width={s} height={r*0.1}  fill="#7a4818" opacity="0.55" />
          <ellipse cx={cx + r*0.25} cy={cy + r*0.05} rx={r*0.18} ry={r*0.1} fill="#c7553f" opacity="0.85" />
        </g>
      </g>
    );
    case 11: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#e85c2a" />
            <stop offset="40%" stopColor="#a83818" />
            <stop offset="100%" stopColor="#2a0a08" />
          </radialGradient>
          <radialGradient id={`${id}-glow`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#ff6a2a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff6a2a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 1.15} fill={`url(#${id}-glow)`} />
        <circle cx={cx} cy={cy} r={r * 0.92} fill={`url(#${id}-g)`} />
        <ellipse cx={cx - r*0.2} cy={cy - r*0.1} rx={r*0.3}  ry={r*0.1}  fill="#ff8a4a" opacity="0.35" />
        <ellipse cx={cx + r*0.15} cy={cy + r*0.3} rx={r*0.35} ry={r*0.1}  fill="#ff8a4a" opacity="0.3" />
      </g>
    );
    case 12: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="50%" cy="50%">
            <stop offset="0%"   stopColor="#ffffff" />
            <stop offset="30%"  stopColor="#fff2a8" />
            <stop offset="80%"  stopColor="#ffb85c" />
            <stop offset="100%" stopColor="#e87a2a" />
          </radialGradient>
          <radialGradient id={`${id}-corona`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#fff2a8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#ffb85c" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 1.25} fill={`url(#${id}-corona)`} />
        {[0, 45, 90, 135].map(a => (
          <g key={a} transform={`rotate(${a} ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy} rx={r * 1.4} ry={r * 0.06} fill="#fff2a8" opacity="0.5" />
          </g>
        ))}
        <circle cx={cx} cy={cy} r={r * 0.85} fill={`url(#${id}-g)`} />
      </g>
    );
    case 13: return (
      <g>
        <defs>
          <radialGradient id={`${id}-g`} cx="50%" cy="50%">
            <stop offset="0%"   stopColor="#ffffff" />
            <stop offset="40%"  stopColor="#a8e8ff" />
            <stop offset="100%" stopColor="#2a5aa8" />
          </radialGradient>
          <radialGradient id={`${id}-glow`} cx="50%" cy="50%">
            <stop offset="0%" stopColor="#7fd9ff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#7fd9ff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={r * 1.3}  fill={`url(#${id}-glow)`} />
        <circle cx={cx} cy={cy} r={r * 1.1}  fill="none" stroke="#a8e8ff" strokeWidth={s*0.01} opacity="0.7" />
        <circle cx={cx} cy={cy} r={r * 1.2}  fill="none" stroke="#7fd9ff" strokeWidth={s*0.008} opacity="0.5" />
        <ellipse cx={cx} cy={cy} rx={r*0.08} ry={r*1.5} fill="#e0f5ff" opacity="0.55" />
        <circle cx={cx} cy={cy} r={r * 0.78} fill={`url(#${id}-g)`} />
      </g>
    );
    case 14: return (
      <g>
        <defs>
          <radialGradient id={`${id}-disk`} cx="50%" cy="50%">
            <stop offset="20%"  stopColor="#000"    stopOpacity="1" />
            <stop offset="35%"  stopColor="#e8682a" stopOpacity="1" />
            <stop offset="55%"  stopColor="#ffb85c" stopOpacity="0.9" />
            <stop offset="80%"  stopColor={accentColor} stopOpacity="0.5" />
            <stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx={cx} cy={cy} rx={r*1.3} ry={r*0.45} fill={`url(#${id}-disk)`}
          transform={`rotate(-18 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r * 0.55} fill="#000" />
        <ellipse cx={cx} cy={cy} rx={r*1.3} ry={r*0.45} fill="none"
          stroke="#ffb85c" strokeWidth={s*0.015} opacity="0.9"
          transform={`rotate(-18 ${cx} ${cy})`}
          strokeDasharray={`${s*1.5} ${s*4}`} />
        <path d={`M ${cx-r*1.1} ${cy-r*0.1} Q ${cx} ${cy-r*0.85} ${cx+r*1.1} ${cy-r*0.1}`}
          fill="none" stroke="#ffb85c" strokeWidth={s*0.025} opacity="0.85" strokeLinecap="round" />
      </g>
    );
    default:
      return <circle cx={cx} cy={cy} r={r} fill="#888" />;
  }
}

export default function Planet({ stage, size, glow = false, withFace = false, style = {} }) {
  const { theme } = useTheme();
  const uid = useId().replace(/:/g, '');
  const p   = PLANET_DATA[stage - 1];
  const s   = size ?? (24 + stage * 4);
  const id  = `pl${uid}`;
  const filter = glow ? `drop-shadow(0 0 ${s * 0.25}px ${p.color}aa)` : 'none';

  return (
    <div style={{ width: s, height: s, position: 'relative', filter, flexShrink: 0, ...style }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ display: 'block', overflow: 'visible' }}>
        {renderPlanet(stage, s, id, theme.primary)}
        {withFace && stage === 1 && renderFace(s)}
      </svg>
    </div>
  );
}
