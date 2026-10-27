import bcrypt from 'bcryptjs';
import crypto from 'node:crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from './ApiError';

const DUMMY_PASSWORD_HASH = bcrypt.hashSync('not-a-real-bank-password', 10);

export interface TokenUser {
  id: string;
  userId: string;
  tokenVersion: number;
}

interface AccessPayload extends jwt.JwtPayload {
  sub: string;
  uid: string;
  tv: number;
  type: 'access';
}

interface RefreshPayload extends jwt.JwtPayload {
  sub: string;
  uid: string;
  tv: number;
  type: 'refresh';
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, env.bcryptRounds);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function verifyDummyPassword(password: string): Promise<boolean> {
  return bcrypt.compare(password, DUMMY_PASSWORD_HASH);
}

export function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, env.bcryptRounds);
}

export function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}

export function normalizeSecurityAnswer(answer: string): string {
  return answer.trim().toLowerCase().replace(/\s+/g, ' ');
}

export function hashSecurityAnswer(answer: string): Promise<string> {
  return bcrypt.hash(normalizeSecurityAnswer(answer), env.bcryptRounds);
}

export function verifySecurityAnswer(answer: string, hash: string): Promise<boolean> {
  return bcrypt.compare(normalizeSecurityAnswer(answer), hash);
}

export function signAccessToken(user: TokenUser): string {
  const payload: Omit<AccessPayload, keyof jwt.JwtPayload> = {
    sub: user.id,
    uid: user.userId,
    tv: user.tokenVersion,
    type: 'access',
  };
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: env.accessTokenTtl as SignOptions['expiresIn'],
    issuer: 'smartbank',
    audience: 'smartbank-customer',
  });
}

export function signRefreshToken(user: TokenUser): string {
  const payload: Omit<RefreshPayload, keyof jwt.JwtPayload> = {
    sub: user.id,
    uid: user.userId,
    tv: user.tokenVersion,
    type: 'refresh',
  };
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenTtl as SignOptions['expiresIn'],
    issuer: 'smartbank',
    audience: 'smartbank-customer',
  });
}

export function verifyAccessToken(token: string): AccessPayload {
  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      issuer: 'smartbank',
      audience: 'smartbank-customer',
    });
    if (typeof payload === 'string' || payload.type !== 'access') {
      throw new Error('wrong token type');
    }
    return payload as AccessPayload;
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.');
  }
}

export function verifyRefreshToken(token: string): RefreshPayload {
  try {
    const payload = jwt.verify(token, env.jwtRefreshSecret, {
      issuer: 'smartbank',
      audience: 'smartbank-customer',
    });
    if (typeof payload === 'string' || payload.type !== 'refresh') {
      throw new Error('wrong token type');
    }
    return payload as RefreshPayload;
  } catch {
    throw ApiError.unauthorized('Your session has expired. Please sign in again.');
  }
}

interface AdminAccessPayload extends jwt.JwtPayload {
  sub: string;
  level: string;
  tv: number;
  type: 'admin_access';
}

export interface AdminTokenUser {
  id: string;
  level: string;
  tokenVersion: number;
}

export function signAdminAccessToken(admin: AdminTokenUser, expiresInSeconds: number): string {
  const payload: Omit<AdminAccessPayload, keyof jwt.JwtPayload> = {
    sub: admin.id,
    level: admin.level,
    tv: admin.tokenVersion,
    type: 'admin_access',
  };
  return jwt.sign(payload, env.jwtSecret, {
    expiresIn: expiresInSeconds,
    issuer: 'smartbank-admin',
    audience: 'smartbank-admin',
  });
}

export function verifyAdminAccessToken(token: string): AdminAccessPayload {
  try {
    const payload = jwt.verify(token, env.jwtSecret, {
      issuer: 'smartbank-admin',
      audience: 'smartbank-admin',
    });
    if (typeof payload === 'string' || payload.type !== 'admin_access') {
      throw new Error('wrong token type');
    }
    return payload as AdminAccessPayload;
  } catch {
    throw ApiError.unauthorized('Your admin session has expired. Please sign in again.');
  }
}

interface AdminRefreshPayload extends jwt.JwtPayload {
  sub: string;
  level: string;
  tv: number;
  type: 'admin_refresh';
}

export function signAdminRefreshToken(admin: AdminTokenUser, expiresInSeconds: number): string {
  const payload: Omit<AdminRefreshPayload, keyof jwt.JwtPayload> = {
    sub: admin.id,
    level: admin.level,
    tv: admin.tokenVersion,
    type: 'admin_refresh',
  };
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: expiresInSeconds,
    issuer: 'smartbank-admin',
    audience: 'smartbank-admin',
  });
}

export function verifyAdminRefreshToken(token: string): AdminRefreshPayload {
  try {
    const payload = jwt.verify(token, env.jwtRefreshSecret, {
      issuer: 'smartbank-admin',
      audience: 'smartbank-admin',
    });
    if (typeof payload === 'string' || payload.type !== 'admin_refresh') {
      throw new Error('wrong token type');
    }
    return payload as AdminRefreshPayload;
  } catch {
    throw ApiError.unauthorized('Your admin session has expired. Please sign in again.');
  }
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function safeEqual(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function hashRefreshToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function parseDurationSeconds(value: string, fallback: number): number {
  const match = /^(\d+)\s*([smhd])$/i.exec(value.trim());
  if (!match) return fallback;
  const amount = Number(match[1]);
  const unit = match[2].toLowerCase();
  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
  };
  return amount * multipliers[unit];
}

export function generateReference(prefix = 'TXN'): string {
  const time = Date.now().toString(36).toUpperCase();
  const random = crypto.randomBytes(5).toString('hex').toUpperCase();
  return `${prefix}${time}${random}`.slice(0, 40);
}

export function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
