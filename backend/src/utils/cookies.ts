import { CookieOptions, Response } from 'express';
import { authCookieNames, env } from '../config/env';
import { parseDurationSeconds } from './security';

const refreshCookiePath = '/api/v1/auth';

function baseOptions(httpOnly: boolean, path = '/'): CookieOptions {
  return {
    httpOnly,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    path,
  };
}

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  csrfToken: string;
}

export function setAuthCookies(res: Response, tokens: SessionTokens): void {
  const accessMaxAge = parseDurationSeconds(env.accessTokenTtl, 15 * 60) * 1000;
  const refreshMaxAge = parseDurationSeconds(env.refreshTokenTtl, 7 * 24 * 60 * 60) * 1000;

  res.cookie(authCookieNames.access, tokens.accessToken, {
    ...baseOptions(true),
    maxAge: accessMaxAge,
  });
  res.cookie(authCookieNames.refresh, tokens.refreshToken, {
    ...baseOptions(true, refreshCookiePath),
    maxAge: refreshMaxAge,
  });
  res.cookie(authCookieNames.csrf, tokens.csrfToken, {
    ...baseOptions(false),
    maxAge: refreshMaxAge,
  });
}

export function setCsrfCookie(res: Response, csrfToken: string): void {
  const refreshMaxAge = parseDurationSeconds(env.refreshTokenTtl, 7 * 24 * 60 * 60) * 1000;
  res.cookie(authCookieNames.csrf, csrfToken, {
    ...baseOptions(false),
    maxAge: refreshMaxAge,
  });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie(authCookieNames.access, baseOptions(true));
  res.clearCookie(authCookieNames.refresh, baseOptions(true, refreshCookiePath));
  res.clearCookie(authCookieNames.csrf, baseOptions(false));
}

export function setAdminAccessCookie(
  res: Response,
  token: string,
  maxAgeSeconds: number
): void {
  res.cookie(authCookieNames.access, token, {
    ...baseOptions(true),
    maxAge: maxAgeSeconds * 1000,
  });
}

export function clearAdminAccessCookie(res: Response): void {
  res.clearCookie(authCookieNames.access, baseOptions(true));
}

export function setAdminRefreshCookie(
  res: Response,
  token: string,
  maxAgeSeconds: number
): void {
  res.cookie(authCookieNames.refresh, token, {
    ...baseOptions(true, '/api/v1/admin/auth'),
    maxAge: maxAgeSeconds * 1000,
  });
}

export function clearAdminRefreshCookie(res: Response): void {
  res.clearCookie(authCookieNames.refresh, baseOptions(true, '/api/v1/admin/auth'));
}
