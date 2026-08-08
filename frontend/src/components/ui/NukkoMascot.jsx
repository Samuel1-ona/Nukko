import { useTheme } from '../../theme/ThemeContext.jsx';

export default function NukkoMascot({ size = 140, pose = 'idle', style = {} }) {
  const { theme } = useTheme();
  const s = size;
  const cx = s / 2;
  const cy = s / 2;
  const r  = s * 0.42;

  const armOffset = pose === 'excited' ? -s * 0.15 : 0;
  const armAngle  = pose === 'excited' ? -30 : pose === 'thinking' ? 20 : 0;

  const animation = {
    idle:     'nukko-bob 3.2s ease-in-out infinite',
    excited:  'nukko-bounce 0.6s ease-in-out infinite',
    thinking: 'nukko-bob 4s ease-in-out infinite',
    spinning: 'nukko-spin 2s linear infinite',
  }[pose];

  return (
    <div style={{
      width: s, height: s, position: 'relative',
      animation,
      filter: `drop-shadow(0 ${s * 0.06}px ${s * 0.1}px rgba(${theme.glowRGB},0.5))`,
      ...style,
    }}>
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id={`mascot-body-${pose}`} cx="35%" cy="30%">
            <stop offset="0%" stopColor="#e8ddd0" />
            <stop offset="55%" stopColor="#a89a90" />
            <stop offset="100%" stopColor="#5a4a48" />
          </radialGradient>
        </defs>

        {/* arms */}
        <ellipse cx={cx - r * 1.15} cy={cy + r * 0.3 + armOffset} rx={r * 0.18} ry={r * 0.22} fill="#7a6a64"
          transform={`rotate(${-armAngle} ${cx - r * 1.15} ${cy + r * 0.3})`} />
        <ellipse cx={cx + r * 1.15} cy={cy + r * 0.3 + armOffset} rx={r * 0.18} ry={r * 0.22} fill="#7a6a64"
          transform={`rotate(${armAngle} ${cx + r * 1.15} ${cy + r * 0.3})`} />

        {/* body */}
        <circle cx={cx} cy={cy} r={r} fill={`url(#mascot-body-${pose})`} />

        {/* craters */}
        <circle cx={cx + r * 0.45} cy={cy + r * 0.25} r={r * 0.13} fill="#000" opacity="0.16" />
        <circle cx={cx - r * 0.5}  cy={cy + r * 0.4}  r={r * 0.08} fill="#000" opacity="0.16" />
        <circle cx={cx + r * 0.55} cy={cy - r * 0.5}  r={r * 0.06} fill="#000" opacity="0.16" />

        {/* eyes */}
        {pose === 'thinking' ? (
          <g stroke="#1a0628" strokeWidth={s * 0.018} strokeLinecap="round" fill="none">
            <path d={`M ${cx - r * 0.4} ${cy - r * 0.05} Q ${cx - r * 0.25} ${cy - r * 0.18} ${cx - r * 0.1} ${cy - r * 0.05}`} />
            <path d={`M ${cx + r * 0.1} ${cy - r * 0.05} Q ${cx + r * 0.25} ${cy - r * 0.18} ${cx + r * 0.4} ${cy - r * 0.05}`} />
          </g>
        ) : (
          <g>
            <circle cx={cx - r * 0.25} cy={cy - r * 0.08} r={r * 0.11} fill="#1a0628" />
            <circle cx={cx + r * 0.25} cy={cy - r * 0.08} r={r * 0.11} fill="#1a0628" />
            <circle cx={cx - r * 0.21} cy={cy - r * 0.12} r={r * 0.035} fill="#fff" />
            <circle cx={cx + r * 0.29} cy={cy - r * 0.12} r={r * 0.035} fill="#fff" />
          </g>
        )}

        {/* mouth */}
        {pose === 'excited' ? (
          <ellipse cx={cx} cy={cy + r * 0.27} rx={r * 0.13} ry={r * 0.17} fill="#1a0628" />
        ) : pose === 'thinking' ? (
          <circle cx={cx} cy={cy + r * 0.25} r={r * 0.06} fill="#1a0628" />
        ) : (
          <path d={`M ${cx - r * 0.13} ${cy + r * 0.2} Q ${cx} ${cy + r * 0.36} ${cx + r * 0.13} ${cy + r * 0.2}`}
            fill="none" stroke="#1a0628" strokeWidth={s * 0.018} strokeLinecap="round" />
        )}

        {/* cheeks */}
        <circle cx={cx - r * 0.42} cy={cy + r * 0.12} r={r * 0.08} fill="#ff6b8a" opacity="0.5" />
        <circle cx={cx + r * 0.42} cy={cy + r * 0.12} r={r * 0.08} fill="#ff6b8a" opacity="0.5" />
      </svg>
    </div>
  );
}
