import { NextFunction, Request, Response } from 'express';
import { authCookieNames } from '../config/env';
import { User } from '../models/user.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyAccessToken } from '../utils/security';

function extractToken(req: Request): string | null {
  const cookieToken = req.cookies?.[authCookieNames.access];
  if (typeof cookieToken === 'string' && cookieToken) return cookieToken;

  const header = req.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export const requireAuth = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractToken(req);
    if (!token) {
      throw ApiError.unauthorized('Please sign in to continue.');
    }

    const payload = verifyAccessToken(token);
    const user = await User.findById(payload.sub).select(
      'userId email fullName status tokenVersion'
    );

    if (!user || user.status !== 'active') {
      throw ApiError.unauthorized('This account is not available.');
    }
    if (user.tokenVersion !== payload.tv) {
      throw ApiError.unauthorized('Your session is no longer valid. Please sign in again.');
    }

    req.user = {
      id: user._id.toString(),
      userId: user.userId,
      email: user.email,
      fullName: user.fullName,
      tokenVersion: user.tokenVersion,
    };
    next();
  }
);
