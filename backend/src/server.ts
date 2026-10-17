import express, { Application } from 'express';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env, isProd } from './config/env';
import { connectDB } from './config/db';
import routes from './routes';
import { errorHandler, notFound } from './middleware/error';
import { apiLimiter } from './middleware/rateLimit';

const stripTrailingSlash = (value: string): string => value.replace(/\/+$/, '');

const allowedOrigins: string[] = Array.from(
  new Set(
    ['http://localhost:3000', 'https://smart-atm-three.vercel.app', env.clientUrl]
      .filter(Boolean)
      .map((origin) => stripTrailingSlash(origin))
  )
);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow no-origin requests (curl, server-to-server, same-origin).
    if (!origin) return callback(null, true);
    const clean = stripTrailingSlash(origin);
    if (allowedOrigins.includes(clean)) return callback(null, true);
    // Allow any localhost/127.0.0.1 port in development only.
    if (!isProd && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(clean)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 204,
};

const createApp = (): Application => {
  const app = express();

  app.set('trust proxy', 1);

  // CORS must run before helmet, rate limiting, and routes.
  app.use(cors(corsOptions));
  app.options('*', cors(corsOptions));

  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(morgan(isProd ? 'combined' : 'dev'));

  app.get('/', (_req, res) => {
    res.json({
      success: true,
      data: { service: 'SmartATM Dashboard API', version: 'v1' },
      message: 'SmartATM API running',
    });
  });

  app.use('/api/v1', apiLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

const start = async (): Promise<void> => {
  try {
    await connectDB();
    const app = createApp();
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

export { createApp };
