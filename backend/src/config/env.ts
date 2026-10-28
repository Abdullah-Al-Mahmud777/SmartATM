import dotenv from 'dotenv';
import path from 'node:path';
import { z } from 'zod';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const boolFromString = z
  .union([z.boolean(), z.string()])
  .transform((value) =>
    typeof value === 'boolean' ? value : ['1', 'true', 'yes', 'on'].includes(value.toLowerCase())
  );

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z
    .string()
    .min(
      1,
      'MONGODB_URI is missing. Add your MongoDB Atlas connection string to backend/.env, or set it in the Vercel project environment variables.'
    ),
  MONGODB_DB_NAME: z
    .string()
    .min(1, 'MONGODB_DB_NAME is required. Use bank_dev for development or bank_test for tests.'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters'),
  ACCESS_TOKEN_TTL: z.string().default('15m'),
  REFRESH_TOKEN_TTL: z.string().default('7d'),
  CLIENT_URL: z.string().default('http://localhost:3000'),
  COOKIE_SAME_SITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  COOKIE_SECURE: boolFromString.default(false),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
  DEPOSIT_MIN_PAISA: z.coerce.number().int().positive().default(1_000),
  DEPOSIT_MAX_PAISA: z.coerce.number().int().positive().default(50_000_000),
  WITHDRAW_MIN_PAISA: z.coerce.number().int().positive().default(1_000),
  WITHDRAW_MAX_PAISA: z.coerce.number().int().positive().default(10_000_000),
  WITHDRAW_DAILY_LIMIT_PAISA: z.coerce.number().int().positive().default(5_000_000),
  TRANSFER_MIN_PAISA: z.coerce.number().int().positive().default(1_000),
  TRANSFER_MAX_PAISA: z.coerce.number().int().positive().default(10_000_000),
  WITHDRAW_CANCEL_WINDOW_SECONDS: z.coerce.number().int().min(10).max(3_600).default(120),
  PENDING_WITHDRAWAL_CRON: z.string().default('*/15 * * * * *'),
  EXCHANGE_MIN_PAISA: z.coerce.number().int().positive().default(1_000),
  EXCHANGE_MAX_PAISA: z.coerce.number().int().positive().default(10_000_000),
  EXCHANGE_RATES: z.coerce.string().default('{"USD":0.0085}'),
  SUPER_ADMIN_EMAIL: z.string().email().default('admin@smartbank.com'),
  SUPER_ADMIN_PASSWORD: z.string().min(8).default('Admin@12345'),
  CRON_SECRET: z.string().min(16).optional(),
}).superRefine((value, ctx) => {
  if (value.DEPOSIT_MAX_PAISA < value.DEPOSIT_MIN_PAISA) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['DEPOSIT_MAX_PAISA'],
      message: 'Deposit maximum must be greater than or equal to the minimum.',
    });
  }
  if (value.WITHDRAW_MAX_PAISA < value.WITHDRAW_MIN_PAISA) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['WITHDRAW_MAX_PAISA'],
      message: 'Withdrawal maximum must be greater than or equal to the minimum.',
    });
  }
  if (value.WITHDRAW_DAILY_LIMIT_PAISA < value.WITHDRAW_MIN_PAISA) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['WITHDRAW_DAILY_LIMIT_PAISA'],
      message: 'Daily withdrawal limit must be at least the minimum withdrawal amount.',
    });
  }
  if (value.TRANSFER_MAX_PAISA < value.TRANSFER_MIN_PAISA) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['TRANSFER_MAX_PAISA'],
      message: 'Transfer maximum must be greater than or equal to the minimum.',
    });
  }
  if (value.EXCHANGE_MAX_PAISA < value.EXCHANGE_MIN_PAISA) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['EXCHANGE_MAX_PAISA'],
      message: 'Exchange maximum must be greater than or equal to the minimum.',
    });
  }
  try {
    const parsedExchangeRates = JSON.parse(value.EXCHANGE_RATES);
    if (!parsedExchangeRates || typeof parsedExchangeRates !== 'object') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['EXCHANGE_RATES'],
        message: 'Exchange rates must be a JSON object.',
      });
    }
  } catch {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['EXCHANGE_RATES'],
      message: 'Exchange rates must be a valid JSON object.',
    });
  }
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

const raw = parsed.data;

export const env = {
  nodeEnv: raw.NODE_ENV,
  isProd: raw.NODE_ENV === 'production',
  port: raw.PORT,
  mongodbUri: raw.MONGODB_URI,
  mongodbDbName: raw.MONGODB_DB_NAME,
  jwtSecret: raw.JWT_SECRET,
  jwtRefreshSecret: raw.JWT_REFRESH_SECRET,
  accessTokenTtl: raw.ACCESS_TOKEN_TTL,
  refreshTokenTtl: raw.REFRESH_TOKEN_TTL,
  clientUrls: raw.CLIENT_URL.split(',')
    .map((value) => value.trim().replace(/\/+$/, ''))
    .filter(Boolean),
  cookieSameSite: raw.COOKIE_SAME_SITE,
  cookieSecure: raw.COOKIE_SECURE,
  bcryptRounds: raw.BCRYPT_ROUNDS,
  depositMinPaisa: raw.DEPOSIT_MIN_PAISA,
  depositMaxPaisa: raw.DEPOSIT_MAX_PAISA,
  withdrawMinPaisa: raw.WITHDRAW_MIN_PAISA,
  withdrawMaxPaisa: raw.WITHDRAW_MAX_PAISA,
  withdrawDailyLimitPaisa: raw.WITHDRAW_DAILY_LIMIT_PAISA,
  transferMinPaisa: raw.TRANSFER_MIN_PAISA,
  transferMaxPaisa: raw.TRANSFER_MAX_PAISA,
  withdrawCancelWindowSeconds: raw.WITHDRAW_CANCEL_WINDOW_SECONDS,
  pendingWithdrawalCron: raw.PENDING_WITHDRAWAL_CRON,
  exchangeMinPaisa: raw.EXCHANGE_MIN_PAISA,
  exchangeMaxPaisa: raw.EXCHANGE_MAX_PAISA,
  exchangeRates: JSON.parse(raw.EXCHANGE_RATES) as Record<string, number>,
  superAdminEmail: raw.SUPER_ADMIN_EMAIL,
  superAdminPassword: raw.SUPER_ADMIN_PASSWORD,
  cronSecret: raw.CRON_SECRET,
} as const;

export const authCookieNames = {
  access: 'bank_access',
  refresh: 'bank_refresh',
  csrf: 'bank_csrf',
} as const;
