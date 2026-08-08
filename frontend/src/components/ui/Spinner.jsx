import { useTheme } from '../../theme/ThemeContext.jsx';

export default function Spinner({ text = '', inline = false }) {
  const { theme } = useTheme();
  if (inline) {
    return (
      <div style={{
        width: 16, height: 16, borderRadius: '50%',
        border: '2px solid rgba(255,255,255,0.15)',
        borderTopColor: 'rgba(255,255,255,0.6)',
        animation: 'nukko-spin 0.8s linear infinite',
        flexShrink: 0,
      }} />
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 44, height: 44, borderRadius: '50%',
        border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: theme.secondary,
        animation: 'nukko-spin 0.8s linear infinite',
      }} />
      {text && (
        <p style={{
          fontFamily: '"Nunito", system-ui', fontSize: 14,
          color: 'rgba(255,255,255,0.6)', textAlign: 'center',
        }}>{text}</p>
      )}
    </div>
  );
}
