// Nukko theme palettes — each is a full mood, not a filter over Aurora.
// Only brand/ambient tokens are themed here (backgrounds, CTA gradients,
// wordmark, glows). Semantic colors (danger red, success green, session
// amber, score gold) stay constant across themes on purpose — they're
// learned functional cues, not brand decoration.

export const THEMES = {
  aurora: {
    id: 'aurora',
    name: 'Aurora',
    tagline: 'Bright & energetic — the arcade high',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #1f0540 0%, #0a0015 70%)',
    blob1: 'rgba(255,46,158,0.55)',
    blob2: 'rgba(0,212,255,0.45)',
    blob3: 'rgba(255,107,138,0.35)',
    primary:    '#ff2e9e',
    secondary:  '#00d4ff',
    primaryRGB:   '255,46,158',
    secondaryRGB: '0,212,255',
    gradient: 'linear-gradient(135deg, #ff2e9e 0%, #00d4ff 100%)',
    wordmarkGradient: 'linear-gradient(135deg, #fff 0%, #ffd700 50%, #00d4ff 100%)',
    glowRGB: '255,46,158',
    canvasBottomGlow: 'rgba(255,46,158,0.2)',
  },
  nebula: {
    id: 'nebula',
    name: 'Nebula',
    tagline: 'Violet storm, molten gold — denser and more premium',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #2a0e4d 0%, #0d0318 72%)',
    blob1: 'rgba(124,58,237,0.6)',
    blob2: 'rgba(217,70,239,0.5)',
    blob3: 'rgba(251,191,36,0.22)',
    primary:    '#7c3aed',
    secondary:  '#d946ef',
    primaryRGB:   '124,58,237',
    secondaryRGB: '217,70,239',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #d946ef 100%)',
    wordmarkGradient: 'linear-gradient(135deg, #fff 0%, #fbbf24 45%, #d946ef 100%)',
    glowRGB: '217,70,239',
    canvasBottomGlow: 'rgba(217,70,239,0.22)',
  },
  quiet: {
    id: 'quiet',
    name: 'Quiet',
    tagline: 'Slate to sky, glow turned way down — low-stimulation mode',
    bgGradient: 'radial-gradient(ellipse at 50% 0%, #141a24 0%, #080a0e 72%)',
    blob1: 'rgba(71,85,105,0.28)',
    blob2: 'rgba(56,189,248,0.16)',
    blob3: 'rgba(100,116,139,0.14)',
    primary:    '#475569',
    secondary:  '#38bdf8',
    primaryRGB:   '71,85,105',
    secondaryRGB: '56,189,248',
    gradient: 'linear-gradient(135deg, #475569 0%, #38bdf8 100%)',
    wordmarkGradient: 'linear-gradient(135deg, #f1f5f9 0%, #cbd5e1 55%, #7dd3fc 100%)',
    glowRGB: '56,189,248',
    canvasBottomGlow: 'rgba(56,189,248,0.12)',
  },
};

export const THEME_IDS = Object.keys(THEMES);
export const DEFAULT_THEME = 'aurora';
