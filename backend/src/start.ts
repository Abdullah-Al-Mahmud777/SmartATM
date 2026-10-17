import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

const start = async (): Promise<void> => {
  try {
    await connectDB();
    app.listen(env.port, () => {
      // eslint-disable-next-line no-console
      console.log(`[server] listening on http://localhost:${env.port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[server] failed to start', err);
    process.exit(1);
  }
};

start();
