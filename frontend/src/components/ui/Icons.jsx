/**
 * Nukko cosmic icon set — inline SVG only, no emoji, no external deps.
 * All strokes use the game's design tokens: gold #ffd700, cyan #00d4ff, white.
 * Size prop controls width/height in px (default shown per icon).
 */

/** Supernova burst — used for the Bomb power-up (destroy topmost planet) */
export function BombIcon({ size = 16, color = '#ffd700' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      {/* 8 rays */}
      <line x1="8" y1="1.2" x2="8" y2="4.5"   stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="8" y1="11.5" x2="8" y2="14.8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="1.2" y1="8" x2="4.5" y2="8"   stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="11.5" y1="8" x2="14.8" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3.2" y1="3.2" x2="5.5" y2="5.5"   stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="10.5" y1="10.5" x2="12.8" y2="12.8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="12.8" y1="3.2" x2="10.5" y2="5.5"  stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="5.5" y1="10.5" x2="3.2" y2="12.8"  stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      {/* centre circle */}
      <circle cx="8" cy="8" r="2.8" stroke={color} strokeWidth="1.4"/>
    </svg>
  );
}

/** Horizontal expand arrows — used for the Expand power-up (widen the bucket) */
export function ExpandIcon({ size = 16, color = '#00d4ff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <line x1="6.5" y1="8" x2="1.5" y2="8"   stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <polyline points="3.8,5.8 1.5,8 3.8,10.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="9.5" y1="8" x2="14.5" y2="8"   stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <polyline points="12.2,5.8 14.5,8 12.2,10.2" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Upward chevron — used when the player beats their personal best */
export function RecordIcon({ size = 10, color = '#00d4ff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" fill="none"
      style={{ display: 'inline-block', flexShrink: 0, verticalAlign: 'middle', marginLeft: 2 }}>
      <polyline points="1.5,8 5,2 8.5,8" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Thin clock face — used for the Timer component */
export function ClockIcon({ size = 13, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.4"/>
      <line x1="7" y1="7" x2="7" y2="3.8" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      <line x1="7" y1="7" x2="9.8" y2="7" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

/** X (Twitter) logo — used for the follow link and score sharing */
export function XLogoIcon({ size = 14, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path
        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z"
        fill={color}
      />
    </svg>
  );
}

/** Gear — used for the Settings entry point on Home */
export function SettingsIcon({ size = 20, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h0a1.6 1.6 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v0a1.6 1.6 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" stroke={color} strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  );
}

/** Ranked bars — used for the Leaderboard menu tile */
export function RankingIcon({ size = 19, color = '#00d4ff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <rect x="4" y="14" width="4.5" height="7" rx="1" fill={color}/>
      <rect x="9.8" y="9" width="4.5" height="12" rx="1" fill={color}/>
      <rect x="15.5" y="4" width="4.5" height="17" rx="1" fill={color}/>
    </svg>
  );
}

/** Trophy — used for the Codex menu tile */
export function TrophyIcon({ size = 19, color = '#ffd700' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M7 4h10v3a5 5 0 0 1-10 0V4z" stroke={color} strokeWidth="2" strokeLinejoin="round"/>
      <path d="M7 5H4.5A2.5 2.5 0 0 0 7 9M17 5h2.5A2.5 2.5 0 0 1 17 9" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <path d="M12 12v3.5M9 20h6M9.5 20l.8-3.5h3.4l.8 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Person silhouette — used for the Profile menu tile */
export function ProfileIcon({ size = 19, color = '#ff2e9e' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2"/>
      <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}

/** Padlock — used for locked/"coming soon" tiles (Mode Select) */
export function LockIcon({ size = 10, color = 'rgba(255,255,255,0.7)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <rect x="5" y="11" width="14" height="9" rx="2" stroke={color} strokeWidth="2"/>
      <path d="M8 11V7.5a4 4 0 0 1 8 0V11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="15.2" r="1.2" fill={color}/>
    </svg>
  );
}
