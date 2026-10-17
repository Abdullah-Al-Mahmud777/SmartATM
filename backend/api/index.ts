import { createApp } from '../src/server';
import { connectDB } from '../src/config/db';

let app: ReturnType<typeof createApp> | undefined;

export default async function handler(req: any, res: any) {
  await connectDB();
  app = app || createApp();
  return app(req, res);
}
