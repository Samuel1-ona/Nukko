import { createClient } from '@supabase/supabase-js';

// The SHARED rewards project — Blokaz and Nukko both write here so a player
// has ONE rewards inbox across both games. This is a different Supabase
// project from the gameplay database: never reuse ../supabase/client.js
// for it, and never put a service-role key in a VITE_ variable.
const url = import.meta.env.VITE_REWARDS_SUPABASE_URL;
const key = import.meta.env.VITE_REWARDS_SUPABASE_ANON_KEY;

export const GAME_SLUG = 'nukko';

export const rewardsConfigured = Boolean(url && key);

export const rewardsDb = rewardsConfigured
  ? createClient(url, key, { auth: { persistSession: false } })
  : null;
