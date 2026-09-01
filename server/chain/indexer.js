// Indexes the Nukko contract's game events into `chain_events`.
//
// This exists because the ladder must never be movable by a request the
// client composes. POST /api/sessions is an unauthenticated insert — a
// crafted call could claim any score. A GameStarted / ScoreSubmitted log
// cannot: it only exists if the player signed a transaction that the
// contract accepted (submitScore reverts without an open session, so one
// run really is one score).

import { parseAbiItem } from 'viem';
import { publicClient, NUKKO_CONTRACT } from './client.js';

const GAME_STARTED    = parseAbiItem('event GameStarted(address indexed player, uint256 totalGamesPlayed)');
const SCORE_SUBMITTED = parseAbiItem('event ScoreSubmitted(address indexed player, uint256 score, bool newRecord)');

// Celo is ~1s blocks. Chunk getLogs so no single request is rejected for
// range size; halve on failure rather than giving up on the whole sweep.
const MAX_CHUNK   = Number(process.env.INDEXER_CHUNK || 5_000);
const BOOTSTRAP_BLOCKS = Number(process.env.INDEXER_BOOTSTRAP_BLOCKS || 700_000); // ~8 days
const MIN_INTERVAL_MS  = 15_000;

let running   = false;
let lastRunAt = 0;

async function getLastBlock(supabase) {
  const { data } = await supabase.from('indexer_state').select('last_block').eq('id', 1).single();
  if (data?.last_block) return BigInt(data.last_block);

  const head  = await publicClient.getBlockNumber();
  const start = head > BigInt(BOOTSTRAP_BLOCKS) ? head - BigInt(BOOTSTRAP_BLOCKS) : 0n;
  await supabase.from('indexer_state').upsert({ id: 1, last_block: Number(start) });
  return start;
}

async function fetchLogsChunked(fromBlock, toBlock, span = BigInt(MAX_CHUNK)) {
  const out = [];
  for (let from = fromBlock; from <= toBlock; from += span + 1n) {
    const to = from + span > toBlock ? toBlock : from + span;
    try {
      const logs = await publicClient.getLogs({
        address: NUKKO_CONTRACT,
        events: [GAME_STARTED, SCORE_SUBMITTED],
        fromBlock: from,
        toBlock: to,
      });
      out.push(...logs);
    } catch (err) {
      if (span <= 100n) throw err;             // genuinely broken, not a range problem
      const halved = await fetchLogsChunked(from, to, span / 2n);
      out.push(...halved);
    }
  }
  return out;
}

// Block timestamps are not in the logs, and active-days needs them.
// Only blocks that actually contain events are fetched, and each once.
async function blockTimes(blockNumbers) {
  const times = new Map();
  const list  = [...new Set(blockNumbers)];
  const BATCH = 20;
  for (let i = 0; i < list.length; i += BATCH) {
    const slice = list.slice(i, i + BATCH);
    const blocks = await Promise.all(
      slice.map(bn => publicClient.getBlock({ blockNumber: bn, includeTransactions: false })),
    );
    blocks.forEach((b, j) => times.set(slice[j], new Date(Number(b.timestamp) * 1000).toISOString()));
  }
  return times;
}

/**
 * Catch the event ledger up to chain head. Safe to call concurrently —
 * overlapping calls return immediately rather than double-indexing, and
 * rows are upserted on (tx_hash, log_index) so a retry can never duplicate.
 */
export async function syncChainEvents(supabase, { force = false } = {}) {
  if (running) return { skipped: 'already-running' };
  if (!force && Date.now() - lastRunAt < MIN_INTERVAL_MS) return { skipped: 'rate-limited' };

  running = true;
  try {
    const head = await publicClient.getBlockNumber();
    const from = await getLastBlock(supabase) + 1n;
    if (from > head) return { indexed: 0, head: Number(head) };

    const logs = await fetchLogsChunked(from, head);

    if (logs.length) {
      const times = await blockTimes(logs.map(l => l.blockNumber));
      const rows  = logs.map(l => ({
        event_type:     l.eventName === 'ScoreSubmitted' ? 'score_submitted' : 'game_started',
        wallet_address: l.args.player.toLowerCase(),
        score:          l.eventName === 'ScoreSubmitted' ? Number(l.args.score) : null,
        block_number:   Number(l.blockNumber),
        log_index:      l.logIndex,
        tx_hash:        l.transactionHash,
        block_time:     times.get(l.blockNumber),
      }));

      // Chunked upsert — Supabase rejects very large payloads.
      for (let i = 0; i < rows.length; i += 500) {
        const { error } = await supabase
          .from('chain_events')
          .upsert(rows.slice(i, i + 500), { onConflict: 'tx_hash,log_index', ignoreDuplicates: true });
        if (error) throw new Error(`chain_events upsert failed: ${error.message}`);
      }
    }

    // Only advance the high-water mark after the rows are safely stored,
    // so a crash mid-sweep re-reads the range instead of skipping it.
    await supabase.from('indexer_state').upsert({
      id: 1, last_block: Number(head), updated_at: new Date().toISOString(),
    });

    lastRunAt = Date.now();
    return { indexed: logs.length, from: Number(from), head: Number(head) };
  } finally {
    running = false;
  }
}

export function startIndexer(supabase, intervalMs = Number(process.env.INDEXER_INTERVAL_MS || 60_000)) {
  const tick = () => syncChainEvents(supabase).catch(err => console.error('[indexer]', err.message));
  tick();
  const t = setInterval(tick, intervalMs);
  t.unref?.();
  return t;
}
