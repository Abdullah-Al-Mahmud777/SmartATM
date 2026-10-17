import type { IncomingMessage, ServerResponse } from 'http';
import app from '../src/app';
import { connectDB } from '../src/config/db';

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  await connectDB();
  return app(req as any, res as any);
}
