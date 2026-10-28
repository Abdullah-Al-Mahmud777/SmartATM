import { createApp } from './app';
import { env } from './config/env';
import { closeDatabase, connectToDatabase } from './db/connect';
import {
  startPendingWithdrawalJob,
  stopPendingWithdrawalJob,
} from './jobs/completePendingWithdrawals';
import { IdempotencyKey } from './models/idempotency.model';

async function start(): Promise<void> {
  try {
    await connectToDatabase();
    await IdempotencyKey.init();
    startPendingWithdrawalJob();
    const app = createApp();

    const server = app.listen(env.port, () => {
      console.log(`[api] SmartBank customer API listening on http://localhost:${env.port}`);
      console.log(`[api] database: ${env.mongodbDbName}`);
      console.log(`[api] allowed client origins: ${env.clientUrls.join(', ')}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`[api] Port ${env.port} is already in use. Kill the process or use a different port.`);
        process.exit(1);
      }
      console.error('[api] server error', error);
      process.exit(1);
    });

  const shutdown = (signal: string) => {
    console.log(`[api] ${signal} received, shutting down`);
    server.close(async () => {
      await stopPendingWithdrawalJob();
      await closeDatabase();
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10_000).unref();
  };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[api] failed to start', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

start().catch((error) => {
  console.error('[api] failed to start', error instanceof Error ? error.message : error);
  process.exit(1);
});
