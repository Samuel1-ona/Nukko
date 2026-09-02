// Ladder orchestration: the only place that writes ladder state.
//
// Everything decision-shaped lives in rules.js as a pure function; this
// file just moves those decisions to and from the database in an order
// that survives a crash.

import {
  weekKey, applyRollover, climb, objectiveProgress, atRiskOfDemotion,
  levelConfig, LEVELS, MAX_LEVEL,
} from './rules.js';
import { syncChainEvents } from '../chain/indexer.js';
import { verifyPendingPurchases } from '../chain/purchases.js';
import { issueReward, rewardsConfigured } from '../rewards/client.js';

const WEEK_MS = 7 * 86_400_000;

function toState(row) {
  return {
    level:                row.level,
    highestLevel:         row.highest_level,
    weekStart:            typeof row.week_start === 'string' ? row.week_start.slice(0, 10) : row.week_start,
    levelsGainedThisWeek: row.levels_gained_this_week,
    heldRankThisWeek:     row.held_rank_this_week,
    lastDemotion:         row.last_demotion,
  };
}

async function loadOrCreate(supabase, wallet, currentWeek) {
  const { data } = await supabase
    .from('player_ladder').select('*').eq('wallet_address', wallet).single();
  if (data) return toState(data);

  // player_ladder has an FK to players
  const { data: player } = await supabase
    .from('players').select('wallet_address').eq('wallet_address', wallet).single();
  if (!player) await supabase.from('players').insert({ wallet_address: wallet });

  const { data: created, error } = await supabase
    .from('player_ladder')
    .insert({ wallet_address: wallet, week_start: currentWeek })
    .select().single();

  if (error) {
    // Lost a race with a concurrent create — re-read rather than fail.
    const { data: again } = await supabase
      .from('player_ladder').select('*').eq('wallet_address', wallet).single();
    if (again) return toState(again);
    throw new Error(`ladder row create failed: ${error.message}`);
  }
  return toState(created);
}

async function readCounters(supabase, wallet, weekStart) {
  const { data, error } = await supabase.rpc('ladder_counters', {
    p_wallet: wallet,
    p_week_start: `${weekStart}T00:00:00Z`,
  });
  if (error) throw new Error(`ladder_counters failed: ${error.message}`);
  const row = Array.isArray(data) ? data[0] : data;
  return {
    runs:       Number(row?.runs ?? 0),
    points:     Number(row?.points ?? 0),
    activeDays: Number(row?.active_days ?? 0),
    shopItems:  Number(row?.shop_items ?? 0),
  };
}

async function readGrants(supabase, wallet) {
  const { data, error } = await supabase
    .from('ladder_grants')
    .select('id, level, bombs, expands, is_cash, cash_pending, settled_at')
    .eq('wallet_address', wallet);
  if (error) throw new Error(`grants read failed: ${error.message}`);
  return data ?? [];
}

/**
 * Record a first clear. The UNIQUE index on (wallet, level) — not this
 * code path — is what makes a double payout impossible: a second attempt
 * conflicts and returns null, so nothing is credited twice.
 */
async function grantLevel(supabase, wallet, level) {
  const cfg    = levelConfig(level);
  const isCash = Boolean(cfg.reward.cash);

  const { data, error } = await supabase
    .from('ladder_grants')
    .insert({
      wallet_address: wallet,
      level,
      bombs:   cfg.reward.bombs,
      expands: cfg.reward.expands,
      is_cash: isCash,
      // Pending by default: the grant exists before any payout is attempted,
      // so a crash leaves an admin-settleable debt rather than silently
      // swallowing the player's entitlement.
      cash_pending: isCash,
    })
    .select('id').single();

  if (error) {
    if (error.code === '23505') return null;   // already earned — first clear only
    throw new Error(`grant insert failed: ${error.message}`);
  }
  return data.id;
}

/**
 * Draw a pre-funded link and write the payout into the SHARED rewards
 * database. If anything fails after the draw, the link goes back to the
 * pool — a link marked assigned but never paid can never be spent.
 */
export async function settleCashGrant(supabase, wallet, level, grantId) {
  const cfg = levelConfig(level);

  const { data, error } = await supabase.rpc('draw_cash_link', { p_level: level, p_wallet: wallet });
  if (error) throw new Error(`draw_cash_link failed: ${error.message}`);

  const link = Array.isArray(data) ? data[0] : data;
  if (!link) {
    return { paid: false, reason: 'pool-empty' };   // debt stays cash_pending
  }

  try {
    if (!rewardsConfigured) throw new Error('rewards database not configured');

    const rewardId = await issueReward({
      address:     wallet,
      cashLinkUrl: link.cash_link_url,
      amount:      link.amount,
      token:       link.token,
      label:       `Nukko — Level ${level} ${cfg.badge}`,
    });

    await supabase.from('ladder_grants').update({
      cash_pending:  false,
      cash_link_id:  link.id,
      reward_row_id: rewardId,
      settled_at:    new Date().toISOString(),
    }).eq('id', grantId);

    return { paid: true, amount: link.amount, token: link.token };
  } catch (err) {
    await supabase.rpc('release_cash_link', { p_id: link.id });
    // Never log the URL itself — an unclaimed link is spendable by anyone.
    console.error(`[ladder] cash payout failed for ${wallet} level ${level}:`, err.message);
    return { paid: false, reason: err.message };
  }
}

/**
 * The authoritative pass: roll the week over, climb as far as this week's
 * verified progress allows, pay out newly cleared levels, return the state.
 *
 * Idempotent — calling it twice pays nothing twice and counts nothing
 * twice, because counters are derived (never incremented) and grants are
 * uniquely constrained.
 *
 * @param {boolean} write  false = display only: the rollover is applied in
 *                         memory so the UI never shows a stale level, but
 *                         nothing is persisted and nothing is paid.
 */
export async function syncLadder(supabase, walletAddress, { write = true, fresh = false } = {}) {
  const wallet      = walletAddress.toLowerCase();
  const currentWeek = weekKey();

  if (write) {
    // Refresh the two verifiable sources before reading counters. Failures
    // here must not block the ladder — stale counters are recoverable, a
    // 500 on the home screen is not.
    await Promise.allSettled([
      // `fresh` is set right after a run: the score tx has just been mined,
      // so bypass the poll interval rather than making the player wait for it.
      syncChainEvents(supabase, { force: fresh }),
      verifyPendingPurchases(supabase, { wallet }),
    ]);
  }

  let state = await loadOrCreate(supabase, wallet, currentWeek);

  // ── Rollover (lazy, never a cron job) ────────────────────────
  const rolled = applyRollover(state, currentWeek);
  if (rolled.rolled) {
    state = {
      level: rolled.level,
      highestLevel: state.highestLevel,
      weekStart: currentWeek,
      levelsGainedThisWeek: 0,
      heldRankThisWeek: false,
      lastDemotion: rolled.demotion,
    };
    if (write) {
      await supabase.from('player_ladder').update({
        level:                   state.level,
        week_start:              currentWeek,
        levels_gained_this_week: 0,
        held_rank_this_week:     false,
        last_demotion:           rolled.demotion,
        updated_at:              new Date().toISOString(),
      }).eq('wallet_address', wallet);
    }
  }

  // ── Counters + climb ─────────────────────────────────────────
  const counters = await readCounters(supabase, wallet, state.weekStart);
  const result   = climb(state.level, counters);

  const granted = [];

  if (write && (result.levelsGained > 0 || result.held)) {
    for (const level of result.clearedLevels) {
      const grantId = await grantLevel(supabase, wallet, level);
      if (!grantId) continue;   // re-cleared after demotion: celebrated, paid nothing

      const cfg = levelConfig(level);
      if (cfg.reward.bombs || cfg.reward.expands) {
        await supabase.rpc('credit_inventory', {
          p_wallet: wallet, p_bombs: cfg.reward.bombs, p_expands: cfg.reward.expands,
        });
      }

      let cash = null;
      if (cfg.reward.cash) cash = await settleCashGrant(supabase, wallet, level, grantId);

      granted.push({ level, badge: cfg.badge, bombs: cfg.reward.bombs, expands: cfg.reward.expands, cash });
    }

    state = {
      ...state,
      level:                result.level,
      highestLevel:         Math.max(state.highestLevel, result.level),
      levelsGainedThisWeek: state.levelsGainedThisWeek + result.levelsGained,
      heldRankThisWeek:     state.heldRankThisWeek || result.held,
    };

    await supabase.from('player_ladder').update({
      level:                   state.level,
      highest_level:           state.highestLevel,
      levels_gained_this_week: state.levelsGainedThisWeek,
      held_rank_this_week:     state.heldRankThisWeek,
      updated_at:              new Date().toISOString(),
    }).eq('wallet_address', wallet);
  } else if (!write) {
    // Display only: project where this week's progress would put them, so the
    // read view never warns about a demotion the next sync would prevent.
    state = {
      ...state,
      level:                result.level,
      levelsGainedThisWeek: state.levelsGainedThisWeek + result.levelsGained,
      heldRankThisWeek:     state.heldRankThisWeek || result.held,
    };
  }

  // ── Retry debts whose pool was empty when they were earned ───
  if (write) {
    const pending = (await readGrants(supabase, wallet)).filter(g => g.is_cash && g.cash_pending);
    for (const g of pending) {
      const cash = await settleCashGrant(supabase, wallet, g.level, g.id);
      if (cash.paid) granted.push({ level: g.level, badge: levelConfig(g.level).badge, bombs: 0, expands: 0, cash, backfilled: true });
    }
  }

  return buildView(await readGrants(supabase, wallet), state, counters, result);
}

function buildView(grants, state, counters, result) {
  const earned = new Set(grants.map(g => g.level));
  const cfg    = levelConfig(state.level);

  const weekEndsAt = new Date(new Date(`${state.weekStart}T00:00:00Z`).getTime() + WEEK_MS).toISOString();

  return {
    level:        state.level,
    badge:        cfg.badge,
    highestLevel: state.highestLevel,
    maxLevel:     MAX_LEVEL,
    weekStart:    state.weekStart,
    weekEndsAt,
    levelsGainedThisWeek: state.levelsGainedThisWeek,
    heldRank:     state.heldRankThisWeek,
    lastDemotion: state.lastDemotion,
    // The Monday warning: no advance yet this week means a level is lost.
    atRisk:       atRiskOfDemotion(state),
    counters,
    objectives:   objectiveProgress(counters, state.level),
    reward:       cfg.reward,
    // A card already earned in an earlier week pays nothing if re-cleared.
    currentCardPays: !earned.has(state.level),
    atMax:        state.level === MAX_LEVEL,
    held:         result.held,
    justCleared:  result.clearedLevels,
    levels: LEVELS.map((l) => {
      const hasGrant = earned.has(l.level);
      let status;
      if (l.level === state.level)      status = 'current';
      else if (hasGrant && l.level < state.level) status = 'cleared';
      else if (hasGrant)                status = 'reclaim';   // earned before, lost to demotion
      else                              status = 'locked';
      return {
        level: l.level, badge: l.badge,
        runs: l.runs, points: l.points, activeDays: l.activeDays, shopItems: l.shopItems,
        reward: l.reward,
        status,
        paysReward: !hasGrant,
      };
    }),
    grants: grants
      .sort((a, b) => a.level - b.level)
      .map(g => ({ level: g.level, bombs: g.bombs, expands: g.expands, isCash: g.is_cash, cashPending: g.cash_pending })),
  };
}
