import { useTheme } from '../../theme/ThemeContext.jsx';

export default function Toggle({ value, onChange }) {
  const { theme } = useTheme();
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 44, height: 26, borderRadius: 99, border: 'none', cursor: 'pointer', padding: 3,
        background: value ? theme.gradient : 'rgba(255,255,255,0.15)',
        display: 'flex', justifyContent: value ? 'flex-end' : 'flex-start', flexShrink: 0,
        transition: 'background 0.2s ease',
      }}
    >
      <div style={{ width: 20, height: 20, borderRadius: 99, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.3)' }} />
    </button>
  );
}
