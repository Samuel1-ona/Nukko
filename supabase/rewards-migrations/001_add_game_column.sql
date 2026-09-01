-- ============================================================
-- SHARED REWARDS DATABASE — migration 001
--
-- ⚠️  TARGET: the shared Blokaz/Nukko *rewards* Supabase project
--     (REWARDS_SUPABASE_URL), NOT this game's gameplay project
--     (SUPABASE_URL). Running it against the wrong project is a
--     no-op at best — check which project you are connected to.
--
-- Purpose: two games now share the `rewards` table. Without a
-- `game` column every SELECT would show players the other game's
-- rewards. Backward compatible: all 55 existing rows are Blokaz's
-- and become game = 'blokaz'.
-- ============================================================

alter table rewards
  add column if not exists game text not null default 'blokaz';

create index if not exists idx_rewards_game_address
  on rewards (game, address, created_at desc);
