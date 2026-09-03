import { useMemo } from 'react';
import { useTheme } from '../../theme/ThemeContext.jsx';

/**
 * Deep-space backdrop.
 *
 * Stars are split into three parallax layers that drift at different rates,
 * which gives the screen depth without a single JS frame: each layer is one
 * composited element carrying a transform animation. Only a handful of bright
 * stars twinkle individually — animating all of them was the expensive part
 * and the least visible.
 */

const LAYERS = [
  { key: 'far',  count: 0.5,  rMin: 0.35, rMax: 0.8,  opacity: 0.42, dur: 26 },
  { key: 'mid',  count: 0.32, rMin: 0.6,  rMax: 1.2,  opacity: 0.62, dur: 19 },
  { key: 'near', count: 0.18, rMin: 0.9,  rMax: 1.7,  opacity: 0.9,  dur: 14 },
];

function makeStars(n, rMin, rMax, seed) {
  // Deterministic per layer so a re-render never reshuffles the sky.
  let h = seed;
  const rnd = () => {
    h = (Math.imul(h, 1664525) + 1013904223) >>> 0;
    return h / 4294967296;
  };
  return Array.from({ length: n }, (_, i) => ({
    x: rnd() * 100,
    y: rnd() * 100,
    r: rMin + rnd() * (rMax - rMin),
    twinkle: i % 5 === 0,
    delay: rnd() * 5,
    dur: 2.4 + rnd() * 3.2,
  }));
}

export default function CosmicBackground({ intensity = 'medium', dimmed = false, children, style = {} }) {
  const { theme } = useTheme();
  const blobOp = intensity === 'lush' ? 0.7 : intensity === 'medium' ? 0.5 : 0.3;
  const total  = intensity === 'lush' ? 96 : intensity === 'medium' ? 68 : 38;

  const layers = useMemo(
    () => LAYERS.map((l, i) => ({
      ...l,
      stars: makeStars(Math.round(total * l.count), l.rMin, l.rMax, 0x9e3779b9 + i * 2654435761),
    })),
    [total],
  );

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: theme.bgGradient,
      ...style,
    }}>
      {/* Nebula wash — slow enough to read as depth, not motion. */}
      <div className="nk-motion" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '-20%', width: '90%', height: '70%',
          background: `radial-gradient(circle, ${theme.blob1} 0%, transparent 60%)`,
          opacity: blobOp, filter: 'blur(20px)',
          animation: 'nk-nebula 34s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', top: '20%', right: '-25%', width: '90%', height: '70%',
          background: `radial-gradient(circle, ${theme.blob2} 0%, transparent 60%)`,
          opacity: blobOp, filter: 'blur(20px)',
          animation: 'nk-nebula 41s ease-in-out infinite reverse',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '10%', width: '90%', height: '60%',
          background: `radial-gradient(circle, ${theme.blob3} 0%, transparent 60%)`,
          opacity: blobOp * 0.8, filter: 'blur(20px)',
          animation: 'nk-nebula 52s ease-in-out infinite',
        }} />
      </div>

      {/* Parallax star field. */}
      <div className="nk-motion" style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {layers.map((layer, i) => (
          <svg
            key={layer.key}
            style={{
              position: 'absolute', inset: '-6%', width: '112%', height: '112%',
              animation: `nk-drift-${layer.key} ${layer.dur}s ease-in-out infinite alternate`,
              willChange: 'transform',
            }}
          >
            {layer.stars.map((st, j) => (
              <circle key={j} cx={`${st.x}%`} cy={`${st.y}%`} r={st.r} fill="#fff" opacity={layer.opacity}>
                {st.twinkle && (
                  <animate
                    attributeName="opacity"
                    values={`${layer.opacity * 0.25};${layer.opacity};${layer.opacity * 0.25}`}
                    dur={`${st.dur}s`} begin={`${st.delay}s`} repeatCount="indefinite"
                  />
                )}
              </circle>
            ))}
            {/* One faint bright star per layer, tinted to the theme. */}
            {i === 2 && (
              <circle cx="78%" cy="16%" r="2" fill={theme.secondary} opacity="0.8">
                <animate attributeName="opacity" values="0.35;0.9;0.35" dur="4.6s" repeatCount="indefinite" />
              </circle>
            )}
          </svg>
        ))}

        {/* A comet crosses roughly once a minute; the rest of the time it is absent. */}
        <div style={{
          position: 'absolute', top: '-4%', left: '-10%',
          width: 84, height: 1.5,
          background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.9))`,
          borderRadius: 2,
          transform: 'rotate(30deg)',
          animation: 'nk-comet 58s linear infinite',
          opacity: 0,
        }} />
      </div>

      {dimmed && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,0,21,0.55)', pointerEvents: 'none' }} />
      )}

      <div style={{ position: 'relative', height: '100%' }}>{children}</div>
    </div>
  );
}
