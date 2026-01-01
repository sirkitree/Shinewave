import { validateConfig } from '../config/index.js';
import { initializeDatabase } from '../db/index.js';
import { fetchAllSources } from '../services/aggregator/index.js';

async function main(): Promise<void> {
  // Parse --limit argument or FETCH_LIMIT env
  const limitArg = process.argv.find(arg => arg.startsWith('--limit='));
  const maxArticles = limitArg
    ? parseInt(limitArg.split('=')[1], 10)
    : process.env.FETCH_LIMIT
    ? parseInt(process.env.FETCH_LIMIT, 10)
    : undefined;

  console.log('Manual fetch started...');
  if (maxArticles) {
    console.log(`Limiting to ${maxArticles} articles`);
  }

  validateConfig();
  initializeDatabase();

  const result = await fetchAllSources(maxArticles);

  console.log('\nFetch Summary:');
  console.log(`  Processed: ${result.processed}`);
  console.log(`  Added: ${result.added}`);
  console.log(`  Skipped: ${result.skipped}`);

  process.exit(0);
}

main().catch((error) => {
  console.error('Fetch failed:', error);
  process.exit(1);
});
