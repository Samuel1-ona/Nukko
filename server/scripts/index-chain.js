// Manual chain-event backfill.
//
// The server indexes continuously on a timer, but a fresh deploy (or a long
// outage) benefits from a one-shot catch-up that is not rate limited.
//
// Usage: node scripts/index-chain.js [--from <block>]
//   --from resets the high-water mark first, e.g. to re-index a range.

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { syncChainEvents } from '../chain/indexer.js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const fromArg = process.argv.indexOf('--from');
if (fromArg !== -1) {
  const block = Number(process.argv[fromArg + 1]);
  if (!Number.isFinite(block)) throw new Error('--from needs a block number');
  await supabase.from('indexer_state').upsert({ id: 1, last_block: block });
  console.log(`high-water mark reset to block ${block}`);
}

const t0 = Date.now();
console.log('indexing…');
const result = await syncChainEvents(supabase, { force: true });
console.log('done:', JSON.stringify(result), `in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

const { count } = await supabase
  .from('chain_events').select('*', { count: 'exact', head: true });
console.log('chain_events rows now:', count);
