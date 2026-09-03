import { useMemo } from 'react';
import Planet, { PLANET_DATA } from './Planet.jsx';
import { useTheme } from '../../theme/ThemeContext.jsx';

/**
 * The home screen's centrepiece: a working orrery of the player's own system.
 *
 * The player's current tier sits at the centre; every planet they have
 * discovered rides a tilted orbit around it. That makes the screen a live
 * readout of progress rather than decoration — a new player sees an almost
 * empty system, a veteran sees a crowded one, and the merge chain the game is
 * built on is legible in a single glance.
 *
 * Geometry note: each satellite is wrapped in a counter-rotation, so the
 * composed transform reduces to a pure translation along the tilted ellipse.
 * The planet therefore travels in 3-D but never tumbles, and `preserve-3d`
 * lets the browser depth-sort it against the central body for real occlusion.
 */

const TILT = 62;

// Outer orbits run slower — the read that makes it feel like a real mechanism.
const RINGS = [
  { radius: 0.30, duration: 30, scale: 0.125, slots: 2 },
  { radius: 0.42, duration: 46, scale: 0.105, slots: 3 },
  { radius: 0.55, duration: 68, scale: 0.088, slots: 3 },
];

function Satellite({ stage, angle, radius, duration, size, dim }) {
  return (
    <div
      style={{
        position: 'absolute', left: '50%', top: '50%', width: 0, height: 0,
        transform: `rotate(${angle}deg) translateX(${radius}px)`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Undoes the rotor's spin so the body stays upright as it travels. */}
      <div style={{
        animation: `nk-spin-rev ${duration}s linear infinite`,
        transformStyle: 'preserve-3d',
      }}>
        {/* Undoes this satellite's own angle and the world tilt. */}
        <div style={{
          transform: `rotate(${-angle}deg) rotateX(${-TILT}deg) translate(-50%, -50%)`,
          transformOrigin: 'center',
          opacity: dim ? 0.28 : 1,
        }}>
          {stage
            ? <Planet stage={stage} size={size} />
            : <div style={{
                width: size, height: size, borderRadius: '50%',
                border: '1px dashed rgba(255,255,255,0.3)',
              }} />}
        </div>
      </div>
    </div>
  );
}

export default function Orrery({ stage = 2, discovered = [], size = 240 }) {
  const { theme } = useTheme();
  const core = Math.round(size * 0.30);

  // Newest discoveries ride the inner, faster rings where the eye lands first.
  const bodies = useMemo(() => {
    const pool = [...new Set(discovered)]
      .filter(s => s >= 1 && s <= PLANET_DATA.length && s !== stage)
      .sort((a, b) => b - a);

    const out = [];
    let i = 0;
    RINGS.forEach((ring, r) => {
      for (let slot = 0; slot < ring.slots; slot++) {
        const s = pool[i++];
        // Empty slots become faint outlines: the system a player is yet to fill.
        out.push({
          ring: r,
          stage: s ?? null,
          dim: s == null,
          // Golden-angle spacing stops satellites from lining up into a seam.
          angle: (slot * (360 / ring.slots)) + r * 37 + 12,
        });
      }
    });
    return out;
  }, [discovered, stage]);

  return (
    <div
      className="nk-motion"
      style={{
        position: 'relative', width: size, height: size,
        perspective: size * 2.4,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Tilted world: orbit paths and everything riding them. */}
      <div style={{
        position: 'absolute', inset: 0,
        transform: `rotateX(${TILT}deg)`,
        transformStyle: 'preserve-3d',
      }}>
        {RINGS.map((ring, r) => {
          const d = ring.radius * 2 * size;
          return (
            <div key={`path-${r}`} style={{
              position: 'absolute', left: '50%', top: '50%',
              width: d, height: d, marginLeft: -d / 2, marginTop: -d / 2,
              borderRadius: '50%',
              border: `1px solid rgba(${theme.secondaryRGB}, ${0.26 - r * 0.05})`,
            }} />
          );
        })}

        {RINGS.map((ring, r) => (
          <div
            key={`rotor-${r}`}
            style={{
              position: 'absolute', inset: 0,
              animation: `nk-spin ${ring.duration}s linear infinite`,
              transformStyle: 'preserve-3d',
            }}
          >
            {bodies.filter(b => b.ring === r).map((b, i) => (
              <Satellite
                key={`${r}-${i}`}
                stage={b.stage}
                dim={b.dim}
                angle={b.angle}
                radius={ring.radius * size}
                duration={ring.duration}
                size={Math.round(size * ring.scale)}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Central body. Sits at z = 0 so satellites pass in front of and behind it. */}
      <div style={{
        position: 'absolute', left: '50%', top: '50%',
        transform: 'translate(-50%, -50%)',
        transformStyle: 'preserve-3d',
      }}>
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          width: core * 2.1, height: core * 2.1,
          marginLeft: -core * 1.05, marginTop: -core * 1.05,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(${theme.primaryRGB},0.42) 0%, transparent 68%)`,
          animation: 'nk-halo 7s ease-in-out infinite',
          pointerEvents: 'none',
        }} />
        <div style={{ animation: 'nk-breathe 7s ease-in-out infinite' }}>
          <Planet stage={stage} size={core} glow />
        </div>
      </div>
    </div>
  );
}
