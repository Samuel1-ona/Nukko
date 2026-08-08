import { useTheme } from '../../theme/ThemeContext.jsx';

export default function NukkoWordmark({ size = 48, style = {} }) {
  const { theme } = useTheme();
  return (
    <div style={{
      fontFamily: '"Fredoka", "Nunito", system-ui, sans-serif',
      fontWeight: 700,
      fontSize: size,
      letterSpacing: '0.06em',
      lineHeight: 1,
      background: theme.wordmarkGradient,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      filter: `drop-shadow(0 0 20px rgba(${theme.glowRGB},0.5))`,
      ...style,
    }}>
      NUKKO
    </div>
  );
}
