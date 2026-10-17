import jwt, { SignOptions } from 'jsonwebtoken';
import { CookieOptions, Response } from 'express';
import { env, isProd } from '../config/env';
import type { UserRole } from '../models/User';

export interface JwtPayload {
  id: string;
  role: UserRole;
  email: string;
}

export const signToken = (payload: JwtPayload): string =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as SignOptions);

export const verifyToken = (token: string): JwtPayload =>
  jwt.verify(token, env.jwtSecret) as JwtPayload;

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie(env.cookieName, token, cookieOptions);
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie(env.cookieName, {
    ...cookieOptions,
    maxAge: undefined,
  });
};
