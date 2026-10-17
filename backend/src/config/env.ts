import dotenv from 'dotenv';

dotenv.config();

const required = (key: string, fallback?: string): string => {
  const value = process.env[key] ?? fallback;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const env = {
  nodeEnv: process.env.NODE_ENV ?? 'development',
  port: Number(process.env.PORT ?? 10000),
  mongoUri: required('MONGODB_URI', process.env.MONGO_URI),
  jwtSecret: required('JWT_SECRET', 'smartatm-dev-secret'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  cookieName: process.env.COOKIE_NAME ?? 'atm_token',
  clientUrl: process.env.CLIENT_URL ?? 'http://localhost:3000',
  seed: {
    adminEmail: process.env.SEED_ADMIN_EMAIL ?? 'admin@smartatm.com',
    adminPassword: process.env.SEED_ADMIN_PASSWORD ?? 'admin123',
  },
};

export const isProd = env.nodeEnv === 'production';
