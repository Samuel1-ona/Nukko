// Client for the SHARED rewards database (Blokaz + Nukko).
//
// This is a DIFFERENT Supabase project from the gameplay database — never
// reuse the gameplay client for it, and never expose this service-role key
// to the browser. Every row this game writes is tagged game = 'nukko' so
// the two games' reward inboxes stay separate.

import { createClient } from '@supabase/supabase-js';

export const GAME_SLUG = 'nukko';

const url = process.env.REWARDS_SUPABASE_URL;
const key = process.env.REWARDS_SUPABASE_SERVICE_ROLE_KEY;

export const rewardsConfigured = Boolean(url && key);

export const rewardsDb = rewardsConfigured
  ? createClient(url, key, { auth: { persistSession: false } })
  : null;

/**
 * Insert a cash reward for a player. Exactly the five fields the shared
 * schema expects, plus the game tag — id, claimed_at and created_at are
 * always left to the database.
 */
export async function issueReward({ address, cashLinkUrl, amount, token, label }) {
  if (!rewardsDb) throw new Error('Rewards database is not configured');

  const { data, error } = await rewardsDb
    .from('rewards')
    .insert({
      address:       address.toLowerCase(),
      cash_link_url: cashLinkUrl,
      amount,
      token,
      label,
      game:          GAME_SLUG,
    })
    .select('id')
    .single();

  if (error) {
    if (error.code === '42703') {
      throw new Error(
        "rewards.game column is missing — apply supabase/rewards-migrations/001_add_game_column.sql " +
        "to the shared rewards project before issuing rewards, or this game's rows will leak into Blokaz's inbox",
      );
    }
    throw new Error(`rewards insert failed: ${error.message}`);
  }

  return data.id;
}

// Never selects cash_link_url — a list query must not expose a bearer token.
export async function listRewards(address, limit = 50) {
  if (!rewardsDb) throw new Error('Rewards database is not configured');

  const { data, error } = await rewardsDb
    .from('rewards')
    .select('id, label, amount, token, claimed_at, created_at')
    .eq('address', address.toLowerCase())
    .eq('game', GAME_SLUG)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw new Error(`rewards list failed: ${error.message}`);
  return data ?? [];
}
