import { NextFunction, Request, Response } from 'express';
import { authCookieNames, env } from '../config/env';
import { ApiError } from '../utils/ApiError';
import { safeEqual } from '../utils/security';

const safeMethods = new Set(['GET', 'HEAD', 'OPTIONS']);

const allowedOrigins = new Set([
  ...env.clientUrls,
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]);

export function csrfProtection(req: Request, _res: Response, next: NextFunction): void {
  if (safeMethods.has(req.method)) {
    next();
    return;
  }

  const origin = req.get('origin');
  if (origin) {
    const normalized = origin.replace(/\/+$/, '');
    if (!allowedOrigins.has(normalized)) {
      next(ApiError.forbidden('Request origin is not allowed.'));
      return;
    }
  }

  const cookieToken = req.cookies?.[authCookieNames.csrf];
  const headerToken = req.get('x-csrf-token');

  if (
    typeof cookieToken !== 'string' ||
    typeof headerToken !== 'string' ||
    !cookieToken ||
    !headerToken ||
    !safeEqual(cookieToken, headerToken)
  ) {
    next(
      ApiError.forbidden(
        'Your security token is missing or invalid. Refresh the page and try again.'
      )
    );
    return;
  }

  next();
}
