import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';
import { ensureDemoUsers } from './config/demoUsers';

const start = async (): Promise<void> => {
  try {
    await connectDB();
    await ensureDemoUsers();
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
