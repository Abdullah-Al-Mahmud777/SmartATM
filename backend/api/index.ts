import type { Request, Response } from 'express';
import { createApp } from '../src/app';
import { connectToDatabase } from '../src/db/connect';
import { IdempotencyKey } from '../src/models/idempotency.model';

const app = createApp();

interface ServerlessGlobal {
  __smartbankDbReady?: Promise<void>;
}

const globalScope = globalThis as typeof globalThis & ServerlessGlobal;

function ensureDatabase(): Promise<void> {
  if (!globalScope.__smartbankDbReady) {
    globalScope.__smartbankDbReady = (async () => {
      await connectToDatabase();
      await IdempotencyKey.init();
    })();
  }
  return globalScope.__smartbankDbReady;
}

export default async function handler(req: Request, res: Response): Promise<void> {
  try {
    await ensureDatabase();
  } catch {
    globalScope.__smartbankDbReady = undefined;
    res.status(503).json({
      success: false,
      message:
        'Database is unavailable. Check MONGODB_URI, the database user password, and Atlas Network Access.',
      code: 'DB_UNAVAILABLE',
    });
    return;
  }

  await app(req, res);
}
