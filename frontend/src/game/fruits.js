// Cosmic planet data — 14 stages from pebble to black hole
export const FRUITS = [
  { name: 'Space Pebble',  r: 14,  color: '#9b8e8a', pts: 1,   stage: 1  },
  { name: 'Meteorite',     r: 20,  color: '#6b3a1a', pts: 3,   stage: 2  },
  { name: 'Asteroid',      r: 26,  color: '#4a4651', pts: 6,   stage: 3  },
  { name: 'Comet',         r: 33,  color: '#a8e8ff', pts: 10,  stage: 4  },
  { name: 'Moon',          r: 40,  color: '#c9c4ba', pts: 15,  stage: 5  },
  { name: 'Dwarf Planet',  r: 47,  color: '#d4a574', pts: 21,  stage: 6  },
  { name: 'Rocky Planet',  r: 54,  color: '#c7553f', pts: 28,  stage: 7  },
  { name: 'Ocean Planet',  r: 62,  color: '#2a78d4', pts: 36,  stage: 8  },
  { name: 'Ringed Planet', r: 70,  color: '#e8b85c', pts: 45,  stage: 9  },
  { name: 'Gas Giant',     r: 79,  color: '#e89968', pts: 55,  stage: 10 },
  { name: 'Brown Dwarf',   r: 90,  color: '#7a2818', pts: 100, stage: 11 },
  { name: 'Star',          r: 100, color: '#ffcc00', pts: 136, stage: 12 },
  { name: 'Neutron Star',  r: 112, color: '#b0d4ff', pts: 190, stage: 13 },
  { name: 'Black Hole',    r: 126, color: '#4b0082', pts: 260, stage: 14 },
];

// ── Spawn bag ─────────────────────────────────────────────────────────────────
// Weighted shuffle-bag instead of an independent uniform roll. Two reasons:
//  1. Uniform-across-6 spawned Dwarf Planets (a large body) as often as Pebbles,
//     so runs could be decided by RNG before the player acted.
//  2. A bag guarantees the *distribution* over every 15 drops, eliminating the
//     droughts and floods that make a lost run feel stolen rather than earned.
// Only the five smallest bodies spawn — larger ones must be earned by merging.
//
// This is also the single choke point for spawn randomness: swapping Math.random
// here for a seeded PRNG is all that's needed for reproducible/fair-seeded runs.
const SPAWN_BAG = [0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 4]; // 33/27/20/13/7%

let bag = [];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** Reset the bag so each run draws an independent sequence. */
export function resetBag() {
  bag = [];
}

export function randFruitIdx() {
  if (bag.length === 0) bag = shuffle([...SPAWN_BAG]);
  return bag.pop();
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function rg(ctx, cx, cy, r, stops) {
  const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 0, cx, cy, r);
  stops.forEach(([t, c]) => g.addColorStop(t, c));
  return g;
}

/**
 * Draw a pair of googly eyes with per-planet personality.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} cx  planet centre X
 * @param {number} cy  planet centre Y
 * @param {number} r   planet radius
 * @param {object} opts
 *   eyeR         – eyeball radius
 *   eyeSpacing   – half-distance between eye centres (absolute)
 *   eyeY         – absolute Y of eye centres
 *   scleraColor  – white of the eye
 *   scleraGlow   – optional shadow color for scleraGlow (string | null)
 *   irisColor    – colored ring around pupil
 *   irisScale    – iris radius as fraction of eyeR
 *   pupilScale   – pupil radius as fraction of eyeR
 *   leftPupil    – { x, y } offsets as fractions of eyeR for left eye
 *   rightPupil   – { x, y } offsets for right eye
 *   pupilColor   – pupil fill (default near-black)
 *   hlColor      – highlight fill
 *   hlScale      – highlight radius fraction
 *   extraHL      – boolean: draw a second smaller highlight for sparkle
 *   topLidFrac   – 0–1: fraction of eye height covered by top eyelid
 *   lidColor     – eyelid fill colour
 *   outlineColor – eyeball stroke
 *   outlineW     – eyeball stroke width as fraction of eyeR
 */
function drawGooglyEyes(ctx, cx, cy, r, opts = {}) {
  const {
    eyeR         = r * 0.22,
    eyeSpacing   = r * 0.36,
    eyeY         = cy - r * 0.12,
    scleraColor  = '#ffffff',
    scleraGlow   = null,
    irisColor    = '#4a90d9',
    irisScale    = 0.58,
    pupilScale   = 0.32,
    leftPupil    = { x: 0.12, y: 0.12 },
    rightPupil   = { x: 0.12, y: 0.12 },
    pupilColor   = '#080808',
    hlColor      = 'rgba(255,255,255,0.92)',
    hlScale      = 0.15,
    extraHL      = false,
    topLidFrac   = 0,
    lidColor     = '#888888',
    outlineColor = 'rgba(0,0,0,0.42)',
    outlineW     = 0.07,
  } = opts;

  const eyes = [
    { x: cx - eyeSpacing, y: eyeY, po: leftPupil  },
    { x: cx + eyeSpacing, y: eyeY, po: rightPupil },
  ];

  eyes.forEach(({ x, y, po }) => {
    // ── Sclera ──
    ctx.save();
    if (scleraGlow) { ctx.shadowBlur = eyeR * 1.6; ctx.shadowColor = scleraGlow; }
    ctx.beginPath(); ctx.arc(x, y, eyeR, 0, Math.PI * 2);
    ctx.fillStyle = scleraColor; ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = Math.max(0.5, eyeR * outlineW);
    ctx.stroke();
    ctx.restore();

    // ── Iris ──
    ctx.beginPath(); ctx.arc(x, y, eyeR * irisScale, 0, Math.PI * 2);
    ctx.fillStyle = irisColor; ctx.fill();

    // ── Pupil (offset for the "googly" look) ──
    const px = x + eyeR * po.x;
    const py = y + eyeR * po.y;
    ctx.beginPath(); ctx.arc(px, py, eyeR * pupilScale, 0, Math.PI * 2);
    ctx.fillStyle = pupilColor; ctx.fill();

    // ── Primary highlight ──
    ctx.beginPath();
    ctx.arc(px - eyeR * 0.18, py - eyeR * 0.18, eyeR * hlScale, 0, Math.PI * 2);
    ctx.fillStyle = hlColor; ctx.fill();

    // ── Secondary sparkle highlight ──
    if (extraHL) {
      ctx.beginPath();
      ctx.arc(px + eyeR * 0.09, py - eyeR * 0.11, eyeR * hlScale * 0.52, 0, Math.PI * 2);
      ctx.fillStyle = hlColor; ctx.fill();
    }

    // ── Top eyelid (sleepy / angry squint) ──
    if (topLidFrac > 0) {
      ctx.save();
      ctx.beginPath(); ctx.arc(x, y, eyeR * 1.01, 0, Math.PI * 2); ctx.clip();
      ctx.fillStyle = lidColor;
      // Rect from top of eyeball down by topLidFrac * diameter
      ctx.fillRect(x - eyeR - 1, y - eyeR - 1, eyeR * 2 + 2, eyeR * topLidFrac * 2 + 1);
      ctx.restore();
      // Re-stroke outline over lid
      ctx.beginPath(); ctx.arc(x, y, eyeR, 0, Math.PI * 2);
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = Math.max(0.5, eyeR * outlineW);
      ctx.stroke();
    }
  });
}

// ── Planet drawing ────────────────────────────────────────────────────────────

export function drawFruitOnCtx(ctx, cx, cy, radius, idx, alpha = 1) {
  const r = radius;
  ctx.save();
  ctx.globalAlpha = alpha;

  switch (idx) {

    // ─────────────────────────────────────────────────────────────────────────
    case 0: { // Space Pebble — tiny cross-eyed derpy rock
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
      ctx.fillStyle = rg(ctx, cx, cy, r, [[0,'#d4cbc3'],[0.6,'#9b8e8a'],[1,'#5a4f4a']]);
      ctx.fill();
      [[cx+r*.3,cy+r*.25,r*.15],[cx-r*.35,cy+r*.4,r*.08],[cx-r*.12,cy-r*.32,r*.06]]
        .forEach(([x,y,cr]) => {
          ctx.fillStyle='rgba(0,0,0,0.18)'; ctx.beginPath(); ctx.arc(x,y,cr,0,Math.PI*2); ctx.fill();
        });
      // Eyes: tiny cross-eyed (pupils point toward each other = derpy)
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.30, eyeSpacing: r * 0.30, eyeY: cy - r * 0.06,
        irisColor: '#6a6260', irisScale: 0.54, pupilScale: 0.27,
        leftPupil:  { x:  0.24, y: 0.06 },  // looking inward → cross-eyed
        rightPupil: { x: -0.24, y: 0.06 },
        outlineColor: 'rgba(0,0,0,0.35)',
      });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 1: { // Meteorite — wide terrified eyes (orange-lit by cracks)
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
      ctx.fillStyle = rg(ctx, cx, cy, r, [[0,'#8a4a2a'],[0.7,'#4a2410'],[1,'#2a1408']]);
      ctx.fill();
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#ff7a2a'; ctx.lineWidth = Math.max(1, r * 0.07); ctx.globalAlpha = alpha * 0.92;
      ctx.beginPath(); ctx.moveTo(cx-r*.5,cy-r*.2); ctx.lineTo(cx+r*.1,cy+r*.1); ctx.lineTo(cx+r*.4,cy-r*.4); ctx.stroke();
      ctx.strokeStyle = '#ff9d4a'; ctx.lineWidth = Math.max(0.5, r * 0.045); ctx.globalAlpha = alpha * 0.8;
      ctx.beginPath(); ctx.moveTo(cx-r*.28,cy+r*.5); ctx.lineTo(cx+r*.05,cy+r*.2); ctx.stroke();
      ctx.globalAlpha = alpha;
      // Eyes: wide + scared, pupils up (orange irises from crack glow)
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.28, eyeSpacing: r * 0.34, eyeY: cy - r * 0.08,
        scleraColor: '#fff5ee', scleraGlow: 'rgba(255,100,30,0.4)',
        irisColor: '#c04010', irisScale: 0.64, pupilScale: 0.22,
        leftPupil:  { x: -0.08, y: -0.20 },  // looking up-left (scared)
        rightPupil: { x:  0.08, y: -0.20 },  // looking up-right (scared)
        outlineColor: 'rgba(60,10,0,0.5)',
      });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 2: { // Asteroid — sleepy half-lidded eyes
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
      ctx.fillStyle = rg(ctx, cx, cy, r, [[0,'#7a7480'],[1,'#2e2a36']]);
      ctx.fill();
      [[cx-r*.3,cy-r*.2,r*.12,.30],[cx+r*.25,cy+r*.35,r*.18,.25],[cx+r*.4,cy-r*.38,r*.07,.30]]
        .forEach(([x,y,cr,o]) => {
          ctx.fillStyle=`rgba(0,0,0,${o})`; ctx.beginPath(); ctx.arc(x,y,cr,0,Math.PI*2); ctx.fill();
        });
      // Eyes: sleepy, pupils drooping down
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.27, eyeSpacing: r * 0.34, eyeY: cy - r * 0.14,
        irisColor: '#504868', irisScale: 0.54, pupilScale: 0.30,
        leftPupil:  { x: 0.05, y: 0.20 },
        rightPupil: { x: 0.05, y: 0.20 },
        topLidFrac: 0.44, lidColor: '#3a3040',
        outlineColor: 'rgba(0,0,0,0.4)',
      });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 3: { // Comet — wide excited eyes, icy blue
      ctx.save(); ctx.globalAlpha = alpha * 0.4;
      const tail = ctx.createLinearGradient(cx - r*1.5, cy, cx - r*0.2, cy);
      tail.addColorStop(0, 'rgba(168,232,255,0)'); tail.addColorStop(1, 'rgba(168,232,255,0.72)');
      ctx.fillStyle = tail;
      ctx.beginPath();
      ctx.moveTo(cx-r*.2, cy-r*.42); ctx.quadraticCurveTo(cx-r*1.6, cy, cx-r*.2, cy+r*.42);
      ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
      ctx.fillStyle = rg(ctx, cx, cy, r, [[0,'#ffffff'],[0.55,'#a8e8ff'],[1,'#3d8fb8']]);
      ctx.fill();
      // Eyes: excited, pupils looking up — with extra sparkle highlight
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.27, eyeSpacing: r * 0.34, eyeY: cy - r * 0.10,
        scleraColor: '#f2fbff',
        irisColor: '#28c0f0', irisScale: 0.66, pupilScale: 0.29,
        leftPupil:  { x:  0.10, y: -0.24 },
        rightPupil: { x:  0.16, y: -0.24 },
        extraHL: true,
        outlineColor: 'rgba(30,80,120,0.35)',
      });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 4: { // Moon — dreamy, slightly drowsy
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
      ctx.fillStyle = rg(ctx, cx, cy, r, [[0,'#f0ebe0'],[0.6,'#c9c4ba'],[1,'#6e6a5e']]);
      ctx.fill();
      [[cx-r*.35,cy-r*.2,r*.13,.16],[cx+r*.25,cy+r*.1,r*.2,.13],
       [cx+r*.05,cy-r*.45,r*.07,.18],[cx-r*.14,cy+r*.44,r*.09,.15]]
        .forEach(([x,y,cr,o]) => {
          ctx.fillStyle=`rgba(0,0,0,${o})`; ctx.beginPath(); ctx.arc(x,y,cr,0,Math.PI*2); ctx.fill();
        });
      // Eyes: dreamy, light grey irises, pupils drifting down
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.24, eyeSpacing: r * 0.34, eyeY: cy - r * 0.12,
        scleraColor: '#f8f4ef',
        irisColor: '#9898b0', irisScale: 0.56, pupilScale: 0.30,
        leftPupil:  { x: 0.06, y: 0.12 },
        rightPupil: { x: 0.06, y: 0.12 },
        topLidFrac: 0.18, lidColor: '#d6d0c2',
        outlineColor: 'rgba(0,0,0,0.30)',
      });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 5: { // Dwarf Planet — curious sideways glance
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
      ctx.fillStyle = rg(ctx, cx, cy, r, [[0,'#f0d4a8'],[0.6,'#c89a64'],[1,'#6e4828']]);
      ctx.fill();
      ctx.save(); ctx.globalAlpha = alpha * 0.55; ctx.fillStyle = '#f5e0b8';
      ctx.beginPath(); ctx.ellipse(cx+r*.1, cy+r*.25, r*.36, r*.28, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Eyes: warm caramel irises, both pupils looking sideways (curious)
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.24, eyeSpacing: r * 0.35, eyeY: cy - r * 0.12,
        irisColor: '#b07830', irisScale: 0.57, pupilScale: 0.30,
        leftPupil:  { x: 0.28, y: 0.04 },
        rightPupil: { x: 0.28, y: 0.04 },
        outlineColor: 'rgba(40,20,0,0.35)',
      });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 6: { // Rocky Planet — angry squint + red irises + eyebrows
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
      ctx.fillStyle = rg(ctx, cx, cy, r, [[0,'#e8825c'],[0.6,'#c7553f'],[1,'#5a2418']]);
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = alpha * 0.5; ctx.fillStyle = '#7a2818';
      ctx.beginPath(); ctx.ellipse(cx-r*.25, cy-r*.1, r*.3, r*.18, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx+r*.3, cy+r*.3, r*.2, r*.12, 0, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = alpha * 0.28; ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.ellipse(cx-r*.04, cy+r*.46, r*.18, r*.08, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Eyes: angry squint, red irises, pupils staring down menacingly
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.22, eyeSpacing: r * 0.34, eyeY: cy - r * 0.14,
        scleraColor: '#fff0ee',
        irisColor: '#cc2010', irisScale: 0.58, pupilScale: 0.27,
        leftPupil:  { x: 0.04, y: 0.24 },
        rightPupil: { x: 0.04, y: 0.24 },
        topLidFrac: 0.36, lidColor: '#8a2018',
        outlineColor: 'rgba(0,0,0,0.55)',
      });
      // Angry V-shaped eyebrows
      ctx.save();
      ctx.strokeStyle = '#6a1810'; ctx.lineWidth = Math.max(1, r * 0.055); ctx.lineCap = 'round';
      const ebY = cy - r * 0.44;
      // Left brow: inner end dips lower (angry frown shape)
      ctx.beginPath();
      ctx.moveTo(cx - r*0.52, ebY - r*0.07);
      ctx.lineTo(cx - r*0.22, ebY + r*0.06);
      ctx.stroke();
      // Right brow
      ctx.beginPath();
      ctx.moveTo(cx + r*0.22, ebY + r*0.06);
      ctx.lineTo(cx + r*0.52, ebY - r*0.07);
      ctx.stroke();
      ctx.restore();
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 7: { // Ocean Planet — big beautiful hopeful eyes
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
      ctx.fillStyle = rg(ctx, cx, cy, r, [[0,'#7fc7ff'],[0.5,'#2a78d4'],[1,'#0a2a5a']]);
      ctx.fill();
      ctx.save();
      ctx.globalAlpha = alpha * 0.4; ctx.fillStyle = '#a8d8ff';
      ctx.beginPath(); ctx.ellipse(cx-r*.2, cy-r*.3, r*.25, r*.1, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx+r*.3, cy+r*.1, r*.3, r*.12, 0, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = alpha * 0.3; ctx.fillStyle = '#7fb8ff';
      ctx.beginPath(); ctx.ellipse(cx-r*.1, cy+r*.4, r*.34, r*.1, 0, 0, Math.PI*2); ctx.fill();
      ctx.globalAlpha = alpha * 0.72; ctx.fillStyle = '#3d8a4a';
      ctx.beginPath();
      ctx.moveTo(cx+r*.1, cy-r*.1);
      ctx.quadraticCurveTo(cx+r*.42, cy-r*.22, cx+r*.5, cy+r*.1);
      ctx.quadraticCurveTo(cx+r*.3, cy+r*.05, cx+r*.1, cy-r*.1);
      ctx.closePath(); ctx.fill();
      ctx.restore();
      // Eyes: large, hopeful, deep blue, pupils looking gently upward
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.27, eyeSpacing: r * 0.35, eyeY: cy - r * 0.10,
        scleraColor: '#f0f8ff',
        irisColor: '#1860c8', irisScale: 0.68, pupilScale: 0.31,
        leftPupil:  { x: -0.04, y: -0.16 },
        rightPupil: { x:  0.04, y: -0.16 },
        extraHL: true,
        outlineColor: 'rgba(0,20,60,0.38)',
      });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 8: { // Ringed Planet — elegant, slightly lidded golden eyes
      const ringGradFn = () => {
        const rg2 = ctx.createLinearGradient(-r*1.35, 0, r*1.35, 0);
        rg2.addColorStop(0, 'rgba(212,168,90,0.28)');
        rg2.addColorStop(0.5, 'rgba(240,212,136,0.92)');
        rg2.addColorStop(1, 'rgba(212,168,90,0.28)');
        return rg2;
      };
      // Back ring
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - r*2, cy - r*2, r*4, r*2); ctx.clip();
      ctx.translate(cx, cy); ctx.rotate(-0.32);
      ctx.beginPath(); ctx.ellipse(0, 0, r*1.35, r*0.32, 0, 0, Math.PI*2);
      ctx.strokeStyle = ringGradFn(); ctx.lineWidth = r * 0.14; ctx.stroke();
      ctx.restore();
      // Planet body
      const pg = rg(ctx, cx, cy, r * 0.78, [[0,'#fff0b8'],[0.6,'#e8b85c'],[1,'#7a4a18']]);
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
      ctx.fillStyle = pg; ctx.fill();
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r*0.78, 0, Math.PI*2); ctx.clip();
      ctx.globalAlpha = alpha * 0.4; ctx.fillStyle = '#a86a18';
      ctx.fillRect(cx-r, cy-r*.22, r*2, r*.1);
      ctx.fillRect(cx-r, cy+r*.13, r*2, r*.12);
      ctx.restore();
      // Eyes: regal, golden irises, slightly lidded — drawn before front ring
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.22, eyeSpacing: r * 0.32, eyeY: cy - r * 0.22,
        scleraColor: '#fffff8',
        irisColor: '#c89020', irisScale: 0.55, pupilScale: 0.26,
        leftPupil:  { x: 0.08, y: 0.08 },
        rightPupil: { x: 0.08, y: 0.08 },
        topLidFrac: 0.24, lidColor: '#c8a040',
        outlineColor: 'rgba(60,30,0,0.35)',
      });
      // Front ring (drawn over eyes for correct layering)
      ctx.save();
      ctx.beginPath(); ctx.rect(cx - r*2, cy, r*4, r*2); ctx.clip();
      ctx.translate(cx, cy); ctx.rotate(-0.32);
      ctx.beginPath(); ctx.ellipse(0, 0, r*1.35, r*0.32, 0, 0, Math.PI*2);
      ctx.strokeStyle = ringGradFn(); ctx.lineWidth = r * 0.14; ctx.stroke();
      ctx.beginPath(); ctx.ellipse(0, 0, r*1.1, r*0.26, 0, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(248,228,168,0.55)'; ctx.lineWidth = r * 0.016; ctx.stroke();
      ctx.restore();
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 9: { // Gas Giant — crazy wild eyes pointing opposite directions
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.96, 0, Math.PI * 2);
      ctx.fillStyle = rg(ctx, cx, cy, r, [[0,'#ffd4a8'],[0.6,'#e89968'],[1,'#6e3a18']]);
      ctx.fill();
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r*0.96, 0, Math.PI*2); ctx.clip();
      ctx.globalAlpha = alpha * 0.55; ctx.fillStyle = '#a86838';
      ctx.fillRect(cx-r, cy-r*.7, r*2, r*.11);
      ctx.fillRect(cx-r, cy-r*.1, r*2, r*.09);
      ctx.fillRect(cx-r, cy+r*.5, r*2, r*.11);
      ctx.globalAlpha = alpha * 0.22; ctx.fillStyle = '#ffffff';
      ctx.fillRect(cx-r, cy-r*.42, r*2, r*.15);
      ctx.fillRect(cx-r, cy+r*.15, r*2, r*.18);
      ctx.globalAlpha = alpha * 0.88; ctx.fillStyle = '#c7553f';
      ctx.beginPath(); ctx.ellipse(cx+r*.26, cy+r*.05, r*.19, r*.1, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Eyes: unhinged — pupils pointing in completely different directions
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.25, eyeSpacing: r * 0.36, eyeY: cy - r * 0.12,
        scleraColor: '#fff8f0',
        irisColor: '#d46020', irisScale: 0.62, pupilScale: 0.32,
        leftPupil:  { x:  0.34, y: -0.26 },  // upper-right (crazy)
        rightPupil: { x: -0.30, y:  0.30 },  // lower-left (chaos)
        outlineColor: 'rgba(40,10,0,0.4)',
      });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 10: { // Brown Dwarf — intense glowing lava eyes, dark sclera
      ctx.save(); ctx.globalAlpha = alpha * 0.38;
      const halo = ctx.createRadialGradient(cx, cy, r*0.6, cx, cy, r*1.25);
      halo.addColorStop(0, 'rgba(255,106,42,0.55)'); halo.addColorStop(1, 'rgba(255,106,42,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, r*1.25, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r*0.92);
      bg.addColorStop(0, '#e85c2a'); bg.addColorStop(0.4, '#a83818'); bg.addColorStop(1, '#2a0a08');
      ctx.beginPath(); ctx.arc(cx, cy, r*0.92, 0, Math.PI*2); ctx.fillStyle = bg; ctx.fill();
      ctx.save(); ctx.globalAlpha = alpha * 0.35; ctx.fillStyle = '#ff8a4a';
      ctx.beginPath(); ctx.ellipse(cx-r*.2, cy-r*.1, r*.3, r*.1, 0, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx+r*.15, cy+r*.3, r*.35, r*.1, 0, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Eyes: dark sclera, lava-red irises, intense narrow squint
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.22, eyeSpacing: r * 0.35, eyeY: cy - r * 0.14,
        scleraColor: '#240808',
        scleraGlow: 'rgba(255,60,10,0.65)',
        irisColor: '#ff3a08', irisScale: 0.60, pupilScale: 0.26,
        pupilColor: '#120000',
        leftPupil:  { x: 0.06, y: 0.06 },
        rightPupil: { x: 0.06, y: 0.06 },
        topLidFrac: 0.16, lidColor: '#3c0808',
        hlColor: 'rgba(255,130,60,0.65)',
        outlineColor: 'rgba(255,70,20,0.55)',
        outlineW: 0.08,
      });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 11: { // Star — warm radiant eyes with golden glow + sparkle
      // Outer halo
      ctx.save(); ctx.globalAlpha = alpha * 0.45;
      const halo11 = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r * 1.9);
      halo11.addColorStop(0, 'rgba(255,220,60,0.8)');
      halo11.addColorStop(1, 'rgba(255,120,0,0)');
      ctx.fillStyle = halo11; ctx.beginPath(); ctx.arc(cx, cy, r * 1.9, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // 8 radiating spikes
      ctx.save(); ctx.translate(cx, cy);
      for (let i = 0; i < 8; i++) {
        ctx.save(); ctx.rotate((i / 8) * Math.PI * 2);
        const spk = ctx.createLinearGradient(0, -r * 0.72, 0, -r * 1.6);
        spk.addColorStop(0, `rgba(255,240,100,${alpha * 0.95})`);
        spk.addColorStop(1, `rgba(255,180,0,0)`);
        ctx.fillStyle = spk;
        ctx.beginPath();
        ctx.moveTo(-r * 0.07, -r * 0.72);
        ctx.lineTo(0, -r * 1.6);
        ctx.lineTo(r * 0.07, -r * 0.72);
        ctx.closePath(); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
      // Body
      const sg11 = ctx.createRadialGradient(cx - r*0.28, cy - r*0.28, 0, cx, cy, r);
      sg11.addColorStop(0, '#fffde0'); sg11.addColorStop(0.35, '#ffdc00');
      sg11.addColorStop(0.75, '#ff9900'); sg11.addColorStop(1, '#cc5500');
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fillStyle = sg11; ctx.fill();
      ctx.save();
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.clip();
      ctx.globalAlpha = alpha * 0.22; ctx.fillStyle = '#ff6600';
      ctx.beginPath(); ctx.ellipse(cx-r*.3, cy+r*.2, r*.28, r*.18, 0.4, 0, Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.ellipse(cx+r*.35, cy-r*.25, r*.22, r*.14, -0.3, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Eyes: warm golden, happy, pupils looking slightly upward, extra sparkle
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.21, eyeSpacing: r * 0.33, eyeY: cy - r * 0.16,
        scleraColor: '#fffce0',
        scleraGlow: 'rgba(255,220,50,0.55)',
        irisColor: '#ff9900', irisScale: 0.60, pupilScale: 0.27,
        pupilColor: '#1a0800',
        leftPupil:  { x: -0.06, y: -0.14 },
        rightPupil: { x:  0.06, y: -0.14 },
        hlColor: 'rgba(255,255,200,0.95)',
        extraHL: true,
        outlineColor: 'rgba(100,40,0,0.3)',
      });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 12: { // Neutron Star — alien dead-centre stare, electric blue
      // Outer diffuse glow
      ctx.save(); ctx.globalAlpha = alpha * 0.5;
      const og12 = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 2.2);
      og12.addColorStop(0, 'rgba(200,230,255,0.9)');
      og12.addColorStop(1, 'rgba(80,140,255,0)');
      ctx.fillStyle = og12; ctx.beginPath(); ctx.arc(cx, cy, r * 2.2, 0, Math.PI*2); ctx.fill();
      ctx.restore();
      // Cross pulsar jets
      ctx.save(); ctx.translate(cx, cy);
      [0, Math.PI/2, Math.PI, Math.PI*1.5].forEach((angle) => {
        ctx.save(); ctx.rotate(angle);
        const jet = ctx.createLinearGradient(0, 0, 0, -r * 1.85);
        jet.addColorStop(0, `rgba(255,255,255,${alpha * 0.9})`);
        jet.addColorStop(0.4, `rgba(160,210,255,${alpha * 0.6})`);
        jet.addColorStop(1, 'rgba(100,180,255,0)');
        ctx.fillStyle = jet;
        ctx.beginPath(); ctx.moveTo(-r*0.055, 0); ctx.lineTo(0, -r*1.85); ctx.lineTo(r*0.055, 0); ctx.closePath(); ctx.fill();
        ctx.restore();
      });
      [Math.PI/4, Math.PI*3/4, Math.PI*5/4, Math.PI*7/4].forEach((angle) => {
        ctx.save(); ctx.rotate(angle);
        const j2 = ctx.createLinearGradient(0, 0, 0, -r * 1.2);
        j2.addColorStop(0, `rgba(200,230,255,${alpha * 0.55})`);
        j2.addColorStop(1, 'rgba(100,180,255,0)');
        ctx.fillStyle = j2;
        ctx.beginPath(); ctx.moveTo(-r*0.035, 0); ctx.lineTo(0, -r*1.2); ctx.lineTo(r*0.035, 0); ctx.closePath(); ctx.fill();
        ctx.restore();
      });
      ctx.restore();
      // Body
      const nb12 = ctx.createRadialGradient(cx - r*0.25, cy - r*0.25, 0, cx, cy, r);
      nb12.addColorStop(0, '#ffffff'); nb12.addColorStop(0.3, '#d0eaff');
      nb12.addColorStop(0.7, '#6090e0'); nb12.addColorStop(1, '#203090');
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI*2); ctx.fillStyle = nb12; ctx.fill();
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.82, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = r * 0.04; ctx.stroke();
      // Eyes: alien — massive irises, pupils dead-centre (unblinking stare)
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.22, eyeSpacing: r * 0.32, eyeY: cy - r * 0.15,
        scleraColor: '#e8f4ff',
        scleraGlow: 'rgba(80,180,255,0.6)',
        irisColor: '#18a8ff', irisScale: 0.72, pupilScale: 0.27,
        pupilColor: '#000e28',
        leftPupil:  { x: 0, y: 0 },  // dead-centre alien stare
        rightPupil: { x: 0, y: 0 },
        hlColor: 'rgba(200,240,255,0.9)',
        outlineColor: 'rgba(60,160,255,0.55)',
        outlineW: 0.08,
      });
      break;
    }

    // ─────────────────────────────────────────────────────────────────────────
    case 13: { // Black Hole — void eyes, dark sclera, purple abyss iris
      // Deep purple outer glow
      ctx.save(); ctx.globalAlpha = alpha * 0.55;
      const pg13 = ctx.createRadialGradient(cx, cy, r * 0.5, cx, cy, r * 2.6);
      pg13.addColorStop(0, 'rgba(120,0,200,0.6)');
      pg13.addColorStop(0.5, 'rgba(60,0,120,0.3)');
      pg13.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = pg13; ctx.beginPath(); ctx.arc(cx, cy, r * 2.6, 0, Math.PI*2); ctx.fill();
      ctx.restore();

      // Back half of accretion disk
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.22);
      ctx.save();
      ctx.beginPath(); ctx.rect(-r*2, -r*2, r*4, r*2); ctx.clip();
      const diskBack = ctx.createLinearGradient(-r*1.7, 0, r*1.7, 0);
      diskBack.addColorStop(0, 'rgba(140,60,0,0.25)');
      diskBack.addColorStop(0.25, 'rgba(255,140,0,0.55)');
      diskBack.addColorStop(0.5, 'rgba(255,210,60,0.7)');
      diskBack.addColorStop(0.75, 'rgba(255,140,0,0.55)');
      diskBack.addColorStop(1, 'rgba(140,60,0,0.25)');
      ctx.strokeStyle = diskBack; ctx.lineWidth = r * 0.22;
      ctx.beginPath(); ctx.ellipse(0, 0, r*1.62, r*0.36, 0, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
      ctx.restore();

      // Event horizon
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.88, 0, Math.PI*2);
      ctx.fillStyle = '#000000'; ctx.fill();

      // Photon ring
      ctx.beginPath(); ctx.arc(cx, cy, r * 0.92, 0, Math.PI*2);
      ctx.strokeStyle = 'rgba(255,200,60,0.7)'; ctx.lineWidth = r * 0.07; ctx.stroke();

      // Eyes: drawn inside event horizon — void dark sclera, huge void pupils
      drawGooglyEyes(ctx, cx, cy, r, {
        eyeR: r * 0.20, eyeSpacing: r * 0.32, eyeY: cy - r * 0.14,
        scleraColor: '#0e0018',
        scleraGlow: 'rgba(150,0,230,0.75)',
        irisColor: '#6000c0', irisScale: 0.62, pupilScale: 0.44,
        pupilColor: '#000000',
        leftPupil:  { x: 0, y: 0 },
        rightPupil: { x: 0, y: 0 },
        hlColor: 'rgba(170,80,255,0.55)',
        hlScale: 0.12,
        outlineColor: 'rgba(180,0,255,0.75)',
        outlineW: 0.09,
      });

      // Front half of accretion disk (drawn over eyes)
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.22);
      ctx.save();
      ctx.beginPath(); ctx.rect(-r*2, 0, r*4, r*2); ctx.clip();
      const diskFront = ctx.createLinearGradient(-r*1.7, 0, r*1.7, 0);
      diskFront.addColorStop(0, 'rgba(160,70,0,0.35)');
      diskFront.addColorStop(0.25, 'rgba(255,160,20,0.85)');
      diskFront.addColorStop(0.5, 'rgba(255,230,80,1)');
      diskFront.addColorStop(0.75, 'rgba(255,160,20,0.85)');
      diskFront.addColorStop(1, 'rgba(160,70,0,0.35)');
      ctx.strokeStyle = diskFront; ctx.lineWidth = r * 0.22;
      ctx.beginPath(); ctx.ellipse(0, 0, r*1.62, r*0.36, 0, 0, Math.PI*2); ctx.stroke();
      ctx.strokeStyle = 'rgba(255,245,160,0.5)'; ctx.lineWidth = r * 0.07;
      ctx.beginPath(); ctx.ellipse(0, 0, r*1.45, r*0.3, 0, 0, Math.PI*2); ctx.stroke();
      ctx.restore();
      ctx.restore();
      break;
    }

    default: {
      ctx.beginPath(); ctx.arc(cx, cy, radius * 0.96, 0, Math.PI * 2);
      ctx.fillStyle = rg(ctx, cx, cy, radius, [[0,'#ccc'],[1,'#555']]);
      ctx.fill();
    }
  }

  ctx.restore();
}
