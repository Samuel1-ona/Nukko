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

/* ── Replacements for glyphs and emoji ─────────────────────────────────────
   Tick, cross, warning-sign, star and up-triangle characters are not safe UI:
   Android WebViews (MiniPay included) render several of them as full-colour
   emoji, which is why they kept surfacing in the modals. Drawn instead.      */

/** Tick — confirmation, met objectives, completed challenges */
export function CheckIcon({ size = 14, color = '#00e676', strokeWidth = 2.4 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <polyline points="4,12.5 9.5,18 20,6.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Cross — dismissal, unavailable name, modal close */
export function CloseIcon({ size = 14, color = '#fff', strokeWidth = 2.2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <line x1="5.5" y1="5.5" x2="18.5" y2="18.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
      <line x1="18.5" y1="5.5" x2="5.5" y2="18.5" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round"/>
    </svg>
  );
}

/** Warning triangle — demotion risk, collapse toast, danger line */
export function WarningIcon({ size = 14, color = '#ff5c5c' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M12 3.6 21.4 20H2.6L12 3.6Z" stroke={color} strokeWidth="1.9" strokeLinejoin="round"/>
      <line x1="12" y1="10" x2="12" y2="14.4" stroke={color} strokeWidth="1.9" strokeLinecap="round"/>
      <circle cx="12" cy="17.2" r="1.15" fill={color}/>
    </svg>
  );
}

/** Star — rank-up moments */
export function StarIcon({ size = 14, color = '#ffd700' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M12 2.8l2.86 5.79 6.39.93-4.62 4.5 1.09 6.36L12 17.38l-5.72 3 1.09-6.36-4.62-4.5 6.39-.93L12 2.8Z"
        fill={color}/>
    </svg>
  );
}

/** Cut gem — the CELO rewards line */
export function GemIcon({ size = 14, color = '#00d4ff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M7 3.5h10l4 5.5-9 11.5L3 9l4-5.5Z" stroke={color} strokeWidth="1.7" strokeLinejoin="round"/>
      <path d="M3 9h18M9.5 3.5 8 9l4 11.5L16 9l-1.5-5.5" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
    </svg>
  );
}

/** Lightning bolt — power-ups */
export function BoltIcon({ size = 14, color = '#ffd700' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M13.4 2.5 4.8 13.4h5.4l-.6 8.1 8.6-10.9h-5.4l.6-8.1Z" fill={color}/>
    </svg>
  );
}

/** Wrapped gift — non-cash ladder rewards */
export function GiftIcon({ size = 14, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <rect x="3" y="9.5" width="18" height="11.5" rx="1.8" stroke={color} strokeWidth="1.7"/>
      <line x1="3" y1="14" x2="21" y2="14" stroke={color} strokeWidth="1.7"/>
      <line x1="12" y1="9.5" x2="12" y2="21" stroke={color} strokeWidth="1.7"/>
      <path d="M12 9.5C10.6 6.2 9.4 5 8 5a2.2 2.2 0 0 0 0 4.5M12 9.5c1.4-3.3 2.6-4.5 4-4.5a2.2 2.2 0 0 1 0 4.5"
        stroke={color} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}

/** Banknote — cash-link ladder rewards */
export function CashIcon({ size = 14, color = '#ffd700' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <rect x="2.2" y="6" width="19.6" height="12" rx="2" stroke={color} strokeWidth="1.7"/>
      <circle cx="12" cy="12" r="2.9" stroke={color} strokeWidth="1.7"/>
      <line x1="5.6" y1="9.6" x2="5.6" y2="14.4" stroke={color} strokeWidth="1.7" strokeLinecap="round"/>
      <line x1="18.4" y1="9.6" x2="18.4" y2="14.4" stroke={color} strokeWidth="1.7" strokeLinecap="round"/>
    </svg>
  );
}

/** Ringed planet — the brand mark in body copy */
export function PlanetIcon({ size = 14, color = '#ffd700' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="12" cy="11" r="6" stroke={color} strokeWidth="1.8"/>
      <ellipse cx="12" cy="13.4" rx="10.6" ry="3.4" stroke={color} strokeWidth="1.5"
        transform="rotate(-19 12 13.4)"/>
    </svg>
  );
}

/** Rocket — the final tutorial call to action */
export function RocketIcon({ size = 15, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M12 2.4c3.3 2.5 5 6 5 10.2l-2.4 2.6H9.4L7 12.6C7 8.4 8.7 4.9 12 2.4Z"
        stroke={color} strokeWidth="1.7" strokeLinejoin="round"/>
      <circle cx="12" cy="9.6" r="1.9" stroke={color} strokeWidth="1.6"/>
      <path d="M9.4 15.2 7.2 17c-.9.7-1.3 1.8-1.2 3l2.6-.9M14.6 15.2l2.2 1.8c.9.7 1.3 1.8 1.2 3l-2.6-.9"
        stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 18v3.4" stroke={color} strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  );
}

/** Sparkle burst — level-cleared celebration */
export function SparkleIcon({ size = 14, color = '#ffd700' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M13 2.2 15 8.6l6.4 2-6.4 2-2 6.4-2-6.4-6.4-2 6.4-2 2-6.4Z" fill={color}/>
      <path d="M5.4 15.4 6.3 18l2.6.9-2.6.9-.9 2.6-.9-2.6L2 18.9l2.5-.9.9-2.6Z" fill={color} opacity="0.75"/>
    </svg>
  );
}

/** Left-right arrow — "drag to aim" */
export function DragIcon({ size = 14, color = '#00d4ff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <line x1="4" y1="12" x2="20" y2="12" stroke={color} strokeWidth="1.9" strokeLinecap="round"/>
      <polyline points="7.4,8.4 4,12 7.4,15.6" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
      <polyline points="16.6,8.4 20,12 16.6,15.6" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Arrow down onto a surface — "release to drop" */
export function DropIcon({ size = 14, color = '#ff2e9e' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <line x1="12" y1="3.5" x2="12" y2="14.5" stroke={color} strokeWidth="1.9" strokeLinecap="round"/>
      <polyline points="8,11 12,15 16,11" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="5" y1="19.5" x2="19" y2="19.5" stroke={color} strokeWidth="1.9" strokeLinecap="round"/>
    </svg>
  );
}

/** Rightward arrow — merge result, inline "continue" affordances */
export function ArrowRightIcon({ size = 14, color = 'rgba(255,255,255,0.45)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <line x1="3.5" y1="12" x2="19" y2="12" stroke={color} strokeWidth="1.9" strokeLinecap="round"/>
      <polyline points="14.5,7 19.5,12 14.5,17" stroke={color} strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Single chevron — "next" in the tutorial pager */
export function ChevronRightIcon({ size = 14, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <polyline points="9,5 16,12 9,19" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Single chevron, mirrored — "back" in the tutorial pager */
export function ChevronLeftIcon({ size = 14, color = '#fff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <polyline points="15,5 8,12 15,19" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Solid play triangle — the primary "start a run" control */
export function PlayIcon({ size = 13, color = '#fff' }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 13 15" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M1.5 1.4 11.6 7.5 1.5 13.6V1.4Z" fill={color} />
    </svg>
  );
}

/** House — "back to home" from the pause sheet */
export function HomeIcon({ size = 15, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M1.5 7.5 8 1.5l6.5 6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M3.5 6v7a.5.5 0 0 0 .5.5h2.5v-3.5h3V13.5H12a.5.5 0 0 0 .5-.5V6" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

/** Speaker, on and muted — sound-effects controls */
export function SoundIcon({ size = 16, color = 'currentColor', muted = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 17 17" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M2.5 6h2L8 3v11l-3.5-2.5H2.5A.5.5 0 0 1 2 11V7a.5.5 0 0 1 .5-.5Z" stroke={color} strokeWidth="1.4" strokeLinejoin="round"/>
      {muted ? (
        <path d="M11 6.5l4 4M15 6.5l-4 4" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
      ) : (
        <>
          <path d="M11 5.5a3.5 3.5 0 0 1 0 6" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
          <path d="M12.5 7.5a1.5 1.5 0 0 1 0 2" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>
        </>
      )}
    </svg>
  );
}

/** Beamed notes, on and muted — background-music controls */
export function MusicIcon({ size = 16, color = 'currentColor', muted = false }) {
  return (
    <svg width={size} height={size} viewBox="0 0 17 17" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M6 13V4.5l8-2V11" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="4" cy="13" r="2" stroke={color} strokeWidth="1.4"/>
      <circle cx="12" cy="11" r="2" stroke={color} strokeWidth="1.4"/>
      {muted && <line x1="1.5" y1="2" x2="15.5" y2="15.5" stroke={color} strokeWidth="1.4" strokeLinecap="round"/>}
    </svg>
  );
}

/** Paused bars — the pause sheet's own mark */
export function PauseIcon({ size = 18, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <rect x="3.5" y="2.5" width="4" height="13" rx="1.5" fill={color}/>
      <rect x="10.5" y="2.5" width="4" height="13" rx="1.5" fill={color}/>
    </svg>
  );
}

/** Flame — daily streak */
export function FlameIcon({ size = 14, color = '#ff8a3d', core = '#ffd54a' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M12 2.5c.7 3.2-1.1 4.6-2.6 6.1C7.6 10.4 6 12.1 6 14.8a6 6 0 0 0 12 0c0-2.4-1-4.2-2.4-5.9-.5 1-1.2 1.6-2 1.9.6-2.9-.3-6-1.6-8.3Z"
        fill={color}/>
      <path d="M12 20.8a3 3 0 0 1-3-3c0-1.5 1.2-2.4 1.9-3.4.5 1 1.4 1.4 2 1.9.7-.6 1-1.3 1.1-2 .7.9 1 2 1 3.5a3 3 0 0 1-3 3Z"
        fill={core}/>
    </svg>
  );
}

/** Stepped rungs — the weekly ladder */
export function LadderIcon({ size = 14, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={{ display: 'block', flexShrink: 0 }}>
      <path d="M4 20h5v-5h5v-5h6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 20v-3M9 15h3M14 10h3" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.45"/>
    </svg>
  );
}

