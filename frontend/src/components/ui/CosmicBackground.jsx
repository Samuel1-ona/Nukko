import { useMemo } from 'react';
import { useTheme } from '../../theme/ThemeContext.jsx';

export default function CosmicBackground({ intensity = 'medium', dimmed = false, children, style = {} }) {
  const { theme } = useTheme();
  const blobOp  = intensity === 'lush' ? 0.7 : intensity === 'medium' ? 0.5 : 0.3;
  const starCount = intensity === 'lush' ? 70 : intensity === 'medium' ? 50 : 30;

  const stars = useMemo(() => Array.from({ length: starCount }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    r: Math.random() * 1.2 + 0.4,
    o: Math.random() * 0.6 + 0.3,
    delay: Math.random() * 4,
    dur: 2 + Math.random() * 3,
  })), [starCount]);

  return (
    <div style={{
      position: 'absolute', inset: 0, overflow: 'hidden',
      background: theme.bgGradient,
      ...style,
    }}>
      {/* nebula blobs */}
      <div style={{
        position: 'absolute', top: '-10%', left: '-20%', width: '90%', height: '70%',
        background: `radial-gradient(circle, ${theme.blob1} 0%, transparent 60%)`,
        opacity: blobOp, filter: 'blur(20px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: '20%', right: '-25%', width: '90%', height: '70%',
        background: `radial-gradient(circle, ${theme.blob2} 0%, transparent 60%)`,
        opacity: blobOp, filter: 'blur(20px)', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-10%', left: '10%', width: '90%', height: '60%',
        background: `radial-gradient(circle, ${theme.blob3} 0%, transparent 60%)`,
        opacity: blobOp * 0.8, filter: 'blur(20px)', pointerEvents: 'none',
      }} />

      {/* twinkling stars */}
      <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {stars.map((st, i) => (
          <circle key={i} cx={`${st.x}%`} cy={`${st.y}%`} r={st.r} fill="#fff" opacity={st.o}>
            <animate attributeName="opacity"
              values={`${st.o * 0.3};${st.o};${st.o * 0.3}`}
              dur={`${st.dur}s`} begin={`${st.delay}s`} repeatCount="indefinite" />
          </circle>
        ))}
      </svg>

      {dimmed && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,0,21,0.55)', pointerEvents: 'none' }} />
      )}

      <div style={{ position: 'relative', height: '100%' }}>{children}</div>
    </div>
  );
}
