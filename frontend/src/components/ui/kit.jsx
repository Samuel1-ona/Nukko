import CosmicBackground from './CosmicBackground.jsx';
import { ChevronLeftIcon, CloseIcon } from './Icons.jsx';
import { useTheme } from '../../theme/ThemeContext.jsx';
import { INK, DIM, FAINT, RULE, GOLD, DISPLAY, BODY, NUM, EASE } from '../../theme/tokens.js';

/**
 * Shared primitives for the orrery direction.
 *
 * These exist so a screen is assembled from the same pieces as the home
 * screen rather than re-deriving spacing, type and rules by hand — which is
 * how the old build ended up with five different card treatments.
 */

/** Full-screen shell: themed ground, star field, column layout. */
export function Screen({ children, intensity = 'medium', padded = true }) {
  const { theme } = useTheme();
  return (
    <div style={{ position: 'absolute', inset: 0, background: theme.bgGradient }}>
      <CosmicBackground intensity={intensity}>
        <div style={{
          height: '100%', display: 'flex', flexDirection: 'column',
          padding: padded ? '16px 18px 20px' : 0, boxSizing: 'border-box',
        }}>
          {children}
        </div>
      </CosmicBackground>
    </div>
  );
}

/** Staggered entrance. Depth order, not arrival order — top of screen first. */
export function Reveal({ delay = 0, children, style }) {
  return (
    <div className="nk-rise" style={{ animationDelay: `${delay}ms`, ...style }}>
      {children}
    </div>
  );
}

/** Sub-screen header: quiet back affordance, display title, hairline below. */
export function ScreenHeader({ title, subtitle, onBack, action, onAction, rule = true }) {
  return (
    <Reveal style={{ flex: '0 0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {onBack && (
          <button
            onClick={onBack}
            aria-label="Back"
            className="nk-press-sm"
            style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0, padding: 0,
              background: 'transparent', border: `1px solid ${RULE}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <ChevronLeftIcon size={15} color={DIM} />
          </button>
        )}
        <div style={{
          flex: 1, minWidth: 0,
          fontFamily: DISPLAY, fontWeight: 600, fontSize: 21, color: INK,
          letterSpacing: '0.01em', lineHeight: 1.2,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {title}
        </div>
        {action && (
          <button onClick={onAction} className="nk-press-sm" style={{
            background: 'none', border: 'none', padding: '2px 0',
            fontFamily: BODY, fontSize: 11.5, fontWeight: 800, color: DIM,
          }}>
            {action}
          </button>
        )}
      </div>
      {subtitle && (
        <div style={{
          marginTop: 3, marginLeft: onBack ? 44 : 0,
          fontFamily: BODY, fontSize: 12, color: FAINT,
        }}>
          {subtitle}
        </div>
      )}
      {rule && (
        <div style={{ marginTop: 14, height: 1, background: `linear-gradient(90deg, ${RULE}, transparent)` }} />
      )}
    </Reveal>
  );
}

/** Section rule: small label, hairline to the edge, optional trailing action. */
export function SectionHead({ children, action, onAction, delay = 0 }) {
  return (
    <Reveal delay={delay} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
      <span style={{
        fontFamily: DISPLAY, fontSize: 10, fontWeight: 600,
        letterSpacing: '0.22em', textTransform: 'uppercase', color: FAINT,
      }}>
        {children}
      </span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${RULE}, transparent)` }} />
      {action && (
        <button onClick={onAction} className="nk-press-sm" style={{
          background: 'none', border: 'none', padding: '2px 0',
          fontFamily: BODY, fontSize: 11, fontWeight: 800, color: DIM,
        }}>
          {action}
        </button>
      )}
    </Reveal>
  );
}

/** A number and its label. No box — the strip's rules do the containing. */
export function Readout({ label, value, accent, align = 'center', size = 19 }) {
  return (
    <div style={{ flex: 1, textAlign: align, minWidth: 0 }}>
      <div style={{
        fontFamily: NUM, fontWeight: 700, fontSize: size,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em',
        color: accent ?? INK, lineHeight: 1.05,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {value}
      </div>
      <div style={{
        marginTop: 3, fontFamily: BODY, fontSize: 8.5, fontWeight: 800,
        letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT,
      }}>
        {label}
      </div>
    </div>
  );
}

/** Hairline-separated row of readouts. */
export function ReadoutStrip({ children, style }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'flex-end',
      borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`,
      padding: '11px 0 10px', ...style,
    }}>
      {children}
    </div>
  );
}

/** Vertical hairline for use between readouts. */
export function ReadoutDivider() {
  return <div style={{ width: 1, alignSelf: 'stretch', background: RULE }} />;
}

/**
 * The one saturated control on a screen. Single hue, physical edges, and a
 * light that travels across it — never a multi-hue gradient.
 */
export function PrimaryButton({ children, onClick, icon, disabled, height = 54, style }) {
  const { theme } = useTheme();
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="nk-press"
      style={{
        position: 'relative', overflow: 'hidden',
        width: '100%', height, borderRadius: 14, border: 'none',
        background: disabled
          ? 'rgba(233,224,246,0.09)'
          : `linear-gradient(180deg, rgba(255,255,255,0.13) 0%, rgba(255,255,255,0) 44%, rgba(0,0,0,0.13) 100%), ${theme.primary}`,
        boxShadow: disabled
          ? 'none'
          : `inset 0 -2px 0 rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.26), 0 8px 20px -14px rgba(${theme.primaryRGB},0.8)`,
        color: disabled ? FAINT : '#fff',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
      }}
    >
      {icon}
      <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 17, letterSpacing: '0.05em' }}>
        {children}
      </span>
      {!disabled && (
        <span className="nk-motion" style={{
          position: 'absolute', top: 0, bottom: 0, left: 0, width: 56,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.26), transparent)',
          animation: 'nk-sweep 6.5s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
      )}
    </button>
  );
}

/** Secondary action. Outline only — hierarchy is carried by fill, not size. */
export function GhostButton({ children, onClick, tone = 'neutral', height = 44, style }) {
  const danger = tone === 'danger';
  return (
    <button
      onClick={onClick}
      className="nk-press"
      style={{
        width: '100%', height, borderRadius: 12,
        background: 'transparent',
        border: `1px solid ${danger ? 'rgba(255,92,92,0.4)' : RULE}`,
        color: danger ? '#ff8a8a' : DIM,
        fontFamily: BODY, fontWeight: 700, fontSize: 13,
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        ...style,
      }}
    >
      {children}
    </button>
  );
}

/**
 * A block hung off a coloured left rail. Replaces the old translucent cards —
 * it groups without drawing another box inside a box.
 */
export function Rail({ accent, children, onClick, style }) {
  const { theme } = useTheme();
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={onClick ? 'nk-press' : undefined}
      style={{
        display: 'block', width: '100%', textAlign: 'left',
        padding: '2px 0 2px 14px', border: 'none', background: 'none',
        borderLeft: `2px solid ${accent ?? theme.secondary}`,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}

/**
 * Modal shell. Click-outside to dismiss, one ground colour, one hairline —
 * no stacked translucent panels inside translucent panels.
 */
export function Modal({ children, onClose, width = 340, align = 'center', zIndex = 150 }) {
  const { theme } = useTheme();
  const sheet = align === 'bottom';
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex,
        display: 'flex', justifyContent: 'center',
        alignItems: sheet ? 'flex-end' : 'center',
        padding: sheet ? 0 : '0 24px',
        background: 'rgba(4,0,14,0.78)',
        backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        animation: 'nukko-fade-in 0.18s ease-out',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: sheet ? 430 : width,
          background: 'linear-gradient(165deg, #1a0b32 0%, #0d0419 100%)',
          border: `1px solid ${RULE}`,
          borderRadius: sheet ? '22px 22px 0 0' : 20,
          borderBottom: sheet ? 'none' : undefined,
          boxShadow: `0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(${theme.primaryRGB},0.12)`,
          animation: sheet
            ? 'nukko-slide-up 0.26s cubic-bezier(.22,1,.36,1)'
            : 'nk-scale-in 0.22s cubic-bezier(.16,1,.3,1)',
          overflow: 'hidden',
        }}
      >
        {children}
      </div>
    </div>
  );
}

/** Modal title, matched to the ScreenHeader treatment. */
export function ModalTitle({ children, subtitle, align = 'center' }) {
  return (
    <div style={{ textAlign: align }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 20, color: INK, lineHeight: 1.2 }}>
        {children}
      </div>
      {subtitle && (
        <div style={{ marginTop: 5, fontFamily: BODY, fontSize: 12.5, color: DIM, lineHeight: 1.5 }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

/** Segmented token picker — shared by both shop sheets. */
export function TokenTabs({ items, selected, onSelect, disabled }) {
  const { theme } = useTheme();
  return (
    <div style={{ display: 'flex', gap: 7, justifyContent: 'center' }}>
      {items.map(({ key, label, sub }) => {
        const active = key === selected;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            disabled={disabled}
            className="nk-press-sm"
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
              padding: '7px 15px', borderRadius: 99,
              background: 'transparent',
              border: `1px solid ${active ? theme.secondary : RULE}`,
              opacity: disabled ? 0.4 : 1,
              cursor: disabled ? 'not-allowed' : 'pointer',
            }}
          >
            <span style={{
              fontFamily: BODY, fontSize: 12, fontWeight: 800,
              color: active ? theme.secondary : DIM,
            }}>
              {label}
            </span>
            <span style={{ fontFamily: NUM, fontSize: 9.5, color: FAINT }}>{sub}</span>
          </button>
        );
      })}
    </div>
  );
}

/** One purchasable tier. Highlight marks the recommended middle option. */
export function PackageButton({ title, tier, price, accent, highlight, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="nk-press"
      style={{
        flex: 1, minHeight: 78,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: 8, padding: '13px 12px', borderRadius: 14,
        background: highlight ? `${accent}14` : 'transparent',
        border: `1px solid ${highlight ? `${accent}66` : RULE}`,
        opacity: disabled ? 0.4 : 1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
      }}
    >
      <span style={{
        fontFamily: NUM, fontSize: 15, fontWeight: 700, color: accent,
        letterSpacing: '-0.02em',
      }}>
        {title}
      </span>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span style={{
          fontFamily: BODY, fontSize: 8.5, fontWeight: 800, color: FAINT,
          textTransform: 'uppercase', letterSpacing: '0.14em',
        }}>
          {tier}
        </span>
        <span style={{ fontFamily: BODY, fontSize: 11, fontWeight: 600, color: DIM }}>{price}</span>
      </span>
    </button>
  );
}

/**
 * Full-height bottom sheet for long content (legal text, FAQ). Header stays
 * put; only the body scrolls, masked at its top edge like the home screen.
 */
export function Sheet({ title, subtitle, onClose, children, belowHeader, footer, height = '90dvh', zIndex = 210 }) {
  const { theme } = useTheme();
  return (
    <>
      <div
        onClick={onClose}
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex,
          background: 'rgba(4,0,14,0.76)',
          backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)',
          animation: 'nukko-fade-in 0.2s ease-out',
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: zIndex + 10,
          margin: '0 auto', maxWidth: 430,
          display: 'flex', flexDirection: 'column',
          height, maxHeight: '90dvh',
          background: 'linear-gradient(180deg, #150829 0%, #0a0015 100%)',
          border: `1px solid ${RULE}`, borderBottom: 'none',
          borderRadius: '20px 20px 0 0',
          animation: 'nukko-slide-up 0.28s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, padding: '16px 20px 14px', flexShrink: 0,
          borderBottom: `1px solid ${RULE}`,
        }}>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: DISPLAY, fontWeight: 600, fontSize: 18, color: INK, lineHeight: 1.2,
            }}>
              {title}
            </div>
            {subtitle && (
              <div style={{
                marginTop: 3, fontFamily: BODY, fontSize: 9, fontWeight: 800,
                letterSpacing: '0.18em', textTransform: 'uppercase', color: FAINT,
              }}>
                {subtitle}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="nk-press-sm"
            style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0, padding: 0,
              background: 'transparent', border: `1px solid ${RULE}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <CloseIcon size={13} color={DIM} />
          </button>
        </div>

        {belowHeader && (
          <div style={{ flexShrink: 0, padding: '12px 20px 0' }}>{belowHeader}</div>
        )}

        <div style={{
          flex: 1, minHeight: 0, overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '14px 20px 18px',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0, #000 12px)',
          maskImage: 'linear-gradient(to bottom, transparent 0, #000 12px)',
        }}>
          {children}
        </div>

        {footer && (
          <div style={{ flexShrink: 0, borderTop: `1px solid ${RULE}`, padding: '10px 20px 16px' }}>
            {footer}
          </div>
        )}
      </div>
    </>
  );
}

/* ── Game HUD ──────────────────────────────────────────────────────────────
   Compartments, not naked type. The notched corners and inset bevel are what
   make a panel read as instrument housing rather than a web card — the notch
   is drawn by clipping a 1px-padded outer element, since a clip-path removes
   any border you try to put on the cut edge.                                */

function notchPath(n) {
  return `polygon(0 0, calc(100% - ${n}px) 0, 100% ${n}px, 100% 100%, ${n}px 100%, 0 calc(100% - ${n}px))`;
}

export function HudPanel({ children, accent, notch = 11, onClick, style, innerStyle }) {
  const clip = notchPath(notch);
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={onClick ? 'nk-press' : undefined}
      style={{
        display: 'block', width: '100%', padding: 1, border: 'none',
        textAlign: 'left', clipPath: clip,
        background: accent ?? 'rgba(190,170,225,0.2)',
        ...style,
      }}
    >
      <div style={{
        clipPath: clip,
        background: 'linear-gradient(180deg, rgba(38,18,68,0.94) 0%, rgba(18,7,36,0.94) 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1)',
        height: '100%',
        ...innerStyle,
      }}>
        {children}
      </div>
    </Tag>
  );
}

/** One instrument inside a HUD panel. Tappable cells double as navigation. */
export function HudCell({ label, value, accent, icon, onClick, last }) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      onClick={onClick}
      className={onClick ? 'nk-press-sm' : undefined}
      style={{
        flex: 1, minWidth: 0, padding: '11px 6px 10px',
        background: 'none', border: 'none',
        borderRight: last ? 'none' : `1px solid ${RULE}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
      }}
    >
      <div style={{
        display: 'flex', alignItems: 'center', gap: 4,
        fontFamily: NUM, fontWeight: 700, fontSize: 17,
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em',
        color: accent ?? INK, lineHeight: 1,
        maxWidth: '100%', overflow: 'hidden', whiteSpace: 'nowrap',
      }}>
        {icon}
        {value}
      </div>
      <div style={{
        fontFamily: BODY, fontSize: 8, fontWeight: 800,
        letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT,
      }}>
        {label}
      </div>
    </Tag>
  );
}

/** Small progress ring — reads as a gauge where a bar reads as a form field. */
export function ProgressRing({ size = 34, stroke = 3, pct = 0, color, track = 'rgba(0,0,0,0.4)', children }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} style={{ display: 'block', transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.max(0, Math.min(1, pct)))}
          style={{ transition: 'stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {children}
      </div>
    </div>
  );
}

/** Module tile — icon, one number, one word. The unit the home grid is built from. */
export function ModuleTile({ icon, value, label, accent, badge, ring, onClick }) {
  const { theme } = useTheme();
  const hue = accent ?? theme.secondary;
  return (
    <HudPanel onClick={onClick} accent={`${hue}44`} notch={9} style={{ position: 'relative' }}>
      <div style={{ padding: '12px 13px 12px 16px', display: 'flex', alignItems: 'center', gap: 11 }}>
        {ring !== undefined ? (
          <ProgressRing size={36} pct={ring} color={hue}>{icon}</ProgressRing>
        ) : (
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            border: `1px solid ${hue}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon}
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{
            fontFamily: NUM, fontWeight: 700, fontSize: 17, color: INK,
            lineHeight: 1, letterSpacing: '-0.03em',
          }}>
            {value}
          </div>
          <div style={{
            marginTop: 4, fontFamily: BODY, fontSize: 8, fontWeight: 800,
            letterSpacing: '0.16em', textTransform: 'uppercase', color: FAINT,
          }}>
            {label}
          </div>
        </div>
      </div>
      {badge > 0 && (
        <span className="nk-motion" style={{
          position: 'absolute', top: 7, right: 9,
          minWidth: 16, height: 16, borderRadius: 8, padding: '0 4px',
          background: GOLD, color: '#1c0f00',
          fontFamily: BODY, fontSize: 9, fontWeight: 900, lineHeight: '16px',
          textAlign: 'center',
          animation: 'nk-flicker 2.6s ease-in-out infinite',
        }}>
          {badge}
        </span>
      )}
    </HudPanel>
  );
}

/** Segmented switch — keeps only one block of text on screen at a time. */
export function Segmented({ options, value, onChange }) {
  const { theme } = useTheme();
  return (
    <div style={{
      display: 'flex', gap: 3, padding: 3, borderRadius: 11,
      background: 'rgba(0,0,0,0.3)', border: `1px solid ${RULE}`,
    }}>
      {options.map(o => {
        const active = o.key === value;
        return (
          <button
            key={o.key}
            onClick={() => onChange(o.key)}
            className="nk-press-sm"
            style={{
              flex: 1, padding: '7px 4px', borderRadius: 8, border: 'none',
              background: active ? `rgba(${theme.secondaryRGB},0.14)` : 'transparent',
              color: active ? theme.secondary : FAINT,
              fontFamily: DISPLAY, fontSize: 11, fontWeight: 600,
              letterSpacing: '0.12em', textTransform: 'uppercase',
              boxShadow: active ? `inset 0 -2px 0 ${theme.secondary}` : 'none',
              transition: 'background 160ms ease, color 160ms ease',
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export { INK, DIM, FAINT, RULE, GOLD, DISPLAY, BODY, NUM, EASE };
