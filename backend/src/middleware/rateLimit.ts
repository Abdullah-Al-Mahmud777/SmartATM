import rateLimit from 'express-rate-limit';

const shared = {
  standardHeaders: 'draft-7' as const,
  legacyHeaders: false,
  skip: (req: { method?: string }) => req.method === 'OPTIONS',
  message: {
    success: false,
    message: 'Too many requests. Please wait a few minutes and try again.',
    code: 'RATE_LIMITED',
  },
};

export const generalLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 600,
});

export const registerLimiter = rateLimit({
  ...shared,
  windowMs: 60 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    message: 'Too many registration attempts. Please wait an hour and try again.',
    code: 'RATE_LIMITED',
  },
});

export const loginLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  skipSuccessfulRequests: true,
  message: {
    success: false,
    message: 'Too many sign-in attempts. Please wait 15 minutes and try again.',
    code: 'RATE_LIMITED',
  },
});

export const passwordResetLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 8,
  message: {
    success: false,
    message: 'Too many password reset attempts. Please wait 15 minutes and try again.',
    code: 'RATE_LIMITED',
  },
});

export const moneyOperationLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 40,
  message: {
    success: false,
    message: 'Too many transaction attempts. Please wait 15 minutes and try again.',
    code: 'RATE_LIMITED',
  },
});

export const pinLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  message: {
    success: false,
    message: 'Too many PIN attempts. Please wait 15 minutes and try again.',
    code: 'RATE_LIMITED',
  },
});

export const adminLoginLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: {
    success: false,
    message: 'Too many admin sign-in attempts. Please wait 15 minutes and try again.',
    code: 'RATE_LIMITED',
  },
});

export const adminLimiter = rateLimit({
  ...shared,
  windowMs: 15 * 60 * 1000,
  limit: 300,
  message: {
    success: false,
    message: 'Too many admin requests. Please wait a few minutes and try again.',
    code: 'RATE_LIMITED',
  },
});
