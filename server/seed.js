import Monitor from './models/Monitor.js';

const defaultMonitors = [
  {
    name: 'Google',
    url: 'https://www.google.com',
    interval: 60,
    expectedStatusCode: 200,
  },
  {
    name: 'GitHub',
    url: 'https://github.com',
    interval: 60,
    expectedStatusCode: 200,
  },
  {
    name: 'Cloudflare',
    url: 'https://www.cloudflare.com',
    interval: 60,
    expectedStatusCode: 200,
  },
  {
    name: 'JSONPlaceholder API',
    url: 'https://jsonplaceholder.typicode.com/posts/1',
    interval: 60,
    expectedStatusCode: 200,
  },
];

/**
 * Seed default monitors if database is empty.
 */
export async function seedMonitors() {
  const count = await Monitor.countDocuments();
  if (count > 0) {
    console.log(`[Seed] Database already has ${count} monitor(s), skipping seed.`);
    return;
  }

  console.log('[Seed] Seeding default monitors...');
  for (const mon of defaultMonitors) {
    try {
      await Monitor.create(mon);
      console.log(`[Seed] Added: ${mon.name} (${mon.url})`);
    } catch (err) {
      console.warn(`[Seed] Skipped ${mon.name}: ${err.message}`);
    }
  }
  console.log('[Seed] Done.');
}
