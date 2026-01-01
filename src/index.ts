import path from 'path';
import { fileURLToPath } from 'url';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { config, validateConfig } from './config/index.js';
import { initializeDatabase } from './db/index.js';
import { newsRoutes } from './routes/news.js';
import { healthRoutes } from './routes/health.js';
import { startScheduler } from './services/scheduler/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fastify = Fastify({
  logger: true,
});

async function main(): Promise<void> {
  try {
    // Validate configuration
    validateConfig();

    // Initialize database
    initializeDatabase();
    console.log('Database initialized');

    // Serve static files from web/
    await fastify.register(fastifyStatic, {
      root: path.join(__dirname, '..', 'web'),
      prefix: '/',
    });

    // Register API routes
    await fastify.register(healthRoutes);
    await fastify.register(newsRoutes);

    // Start the scheduler
    startScheduler();

    // Start server
    await fastify.listen({ port: config.port, host: '0.0.0.0' });
    console.log(`Server running at http://localhost:${config.port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down...');
  await fastify.close();
  process.exit(0);
});

main();
