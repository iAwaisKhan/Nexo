import { createServer } from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { connectDatabase } from './db/connect.js';

async function start() {
  await connectDatabase();
  const server = createServer(app);
  server.listen(env.API_PORT, () => {
    logger.info({ port: env.API_PORT, environment: env.NODE_ENV }, 'Nexo API listening');
  });

  let closing = false;
  const shutdown = (signal: string) => {
    if (closing) return;
    closing = true;
    logger.info({ signal }, 'shutting down Nexo API');
    server.close((error) => {
      import('mongoose')
        .then(({ default: mongoose }) => mongoose.disconnect())
        .then(() => {
          if (error) {
            logger.error({ err: error }, 'HTTP server did not close cleanly');
            process.exitCode = 1;
          }
        })
        .catch((disconnectError: unknown) => {
          logger.error({ err: disconnectError }, 'MongoDB disconnect failed');
          process.exitCode = 1;
        });
    });
    setTimeout(() => {
      logger.error('graceful shutdown timed out');
      process.exit(1);
    }, 10_000).unref();
  };

  process.once('SIGINT', () => shutdown('SIGINT'));
  process.once('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch((error: unknown) => {
  logger.fatal({ err: error }, 'Nexo API failed to start');
  process.exitCode = 1;
});
