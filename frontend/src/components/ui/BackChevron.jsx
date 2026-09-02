export default function BackChevron({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 40, height: 40, borderRadius: 99, flexShrink: 0,
        background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M15 5l-7 7 7 7" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
