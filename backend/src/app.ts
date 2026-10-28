import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { Express } from 'express';
import mongoSanitize from 'express-mongo-sanitize';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './config/env';
import { databaseReady } from './db/connect';
import { ApiError } from './utils/ApiError';
import { csrfProtection } from './middleware/csrf';
import { errorHandler, notFoundHandler } from './middleware/error';
import { generalLimiter } from './middleware/rateLimit';
import accountRoutes from './modules/accounts/account.routes';
import adminRoutes from './modules/admin/admin.routes';
import authRoutes from './modules/auth/auth.routes';
import bankingRoutes from './modules/banking/banking.routes';
import dashboardRoutes from './modules/dashboard/dashboard.routes';
import jobsRoutes from './modules/jobs/jobs.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import transactionRoutes from './modules/transactions/transaction.routes';

const allowedOrigins = new Set([
  ...env.clientUrls,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

function isAllowedOrigin(origin: string | undefined): boolean {
  if (!origin) return true;
  const normalized = origin.replace(/\/+$/, '');
  if (allowedOrigins.has(normalized)) return true;
  try {
    const url = new URL(normalized);
    if (url.hostname.endsWith('.vercel.app')) return true;
  } catch {
    // ignore
  }
  return false;
}

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  if (env.isProd) {
    app.set('trust proxy', 1);
  }

  app.use(
    helmet({
      contentSecurityPolicy: false,
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );

  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedOrigin(origin)) {
          callback(null, true);
          return;
        }
        callback(ApiError.forbidden('Request origin is not allowed.'));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'Idempotency-Key'],
      exposedHeaders: ['Content-Disposition'],
      maxAge: 600,
    })
  );

  app.use(cookieParser());
  app.use(express.json({ limit: '100kb' }));
  app.use(express.urlencoded({ extended: false, limit: '100kb' }));
  app.use(mongoSanitize({ replaceWith: '_' }));
  app.use(morgan(env.isProd ? 'combined' : 'dev'));

  app.use('/api/v1', generalLimiter);
  app.use('/api/v1', csrfProtection);

  app.get('/api/v1/health', (_req, res) => {
    if (!databaseReady()) {
      res.status(503).json({ status: 'error', db: 'disconnected' });
      return;
    }
    res.json({ status: 'ok', db: 'connected' });
  });

  // Specific routers must be mounted BEFORE the catch-all banking router at
  // /api/v1, otherwise banking's global `requireAuth` middleware intercepts
  // every later route (e.g. POST /api/v1/admin/auth/login) and returns 401.
  app.use('/api/v1/auth', authRoutes);
  app.use('/api/v1/admin', adminRoutes);
  app.use('/api/v1/dashboard', dashboardRoutes);
  app.use('/api/v1/accounts', accountRoutes);
  app.use('/api/v1/transactions', transactionRoutes);
  app.use('/api/v1/notifications', notificationRoutes);
  app.use('/api/v1/jobs', jobsRoutes);
  app.use('/api/v1', bankingRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
