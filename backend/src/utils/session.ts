import { ClientSession } from 'mongoose';
import { Request } from 'express';
import { env } from '../config/env';
import { RefreshToken } from '../models/auth.models';
import { setAuthCookies, SessionTokens } from './cookies';
import { getRequestMeta } from './requestMeta';
import {
  generateCsrfToken,
  hashRefreshToken,
  parseDurationSeconds,
  signAccessToken,
  signRefreshToken,
  TokenUser,
} from './security';

export interface SessionUser extends TokenUser {
  id: string;
  userId: string;
  tokenVersion: number;
}

export async function createSession(
  user: SessionUser,
  req: Request,
  session?: ClientSession
): Promise<SessionTokens> {
  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);
  const csrfToken = generateCsrfToken();
  const meta = getRequestMeta(req);
  const refreshSeconds = parseDurationSeconds(env.refreshTokenTtl, 7 * 24 * 60 * 60);

  const doc = {
    userId: user.id,
    tokenHash: hashRefreshToken(refreshToken),
    expiresAt: new Date(Date.now() + refreshSeconds * 1000),
    revokedAt: null,
    createdByIp: meta.ip,
    userAgent: meta.userAgent,
  };

  if (session) {
    await RefreshToken.create([doc], { session });
  } else {
    await RefreshToken.create(doc);
  }

  return { accessToken, refreshToken, csrfToken };
}

export function applySessionCookies(res: Parameters<typeof setAuthCookies>[0], tokens: SessionTokens): void {
  setAuthCookies(res, tokens);
}
