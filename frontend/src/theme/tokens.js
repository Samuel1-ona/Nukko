/**
 * Visual tokens for the orrery direction (see Home.jsx).
 *
 * Neutrals are tinted toward the brand violet rather than being pure white —
 * greys on a coloured ground read as washed out. Gold has exactly one job:
 * score. Everything else pulls from the active theme so all three palettes
 * stay coherent.
 */

export const INK    = '#f6f1fb';
export const DIM    = 'rgba(233,224,246,0.56)';
export const FAINT  = 'rgba(233,224,246,0.34)';
export const MUTE   = 'rgba(233,224,246,0.22)';
export const RULE   = 'rgba(190,170,225,0.13)';
export const RULE_HI = 'rgba(190,170,225,0.24)';

// Semantic colours — deliberately constant across themes; they are learned
// functional cues, not brand decoration.
export const GOLD  = '#ffd54a';
export const GREEN = '#00e676';
export const RED   = '#ff5c5c';

export const DISPLAY = '"Fredoka", "Nunito", system-ui, sans-serif';
export const BODY    = '"Nunito", system-ui, sans-serif';
export const NUM     = '"Space Mono", ui-monospace, monospace';

/** Exponential ease-out — the deceleration used for every entrance. */
export const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)';
