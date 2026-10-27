import { NextFunction, Request, Response } from 'express';
import { authCookieNames } from '../config/env';
import { Admin, AdminLevel } from '../models/admin.model';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { verifyAdminAccessToken } from '../utils/security';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  level: AdminLevel;
  tokenVersion: number;
}

declare global {
  namespace Express {
    interface Request {
      admin?: AdminUser;
    }
  }
}

function extractAdminToken(req: Request): string | null {
  const cookieToken = req.cookies?.[authCookieNames.access];
  if (typeof cookieToken === 'string' && cookieToken) return cookieToken;

  const header = req.get('authorization');
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
}

export const requireAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const token = extractAdminToken(req);
    if (!token) {
      throw ApiError.unauthorized('Please sign in as an admin to continue.');
    }

    const payload = verifyAdminAccessToken(token);
    const admin = await Admin.findById(payload.sub).select(
      'email name level status tokenVersion'
    );

    if (!admin || admin.status !== 'active') {
      throw ApiError.forbidden('This admin account is not available.');
    }
    if (admin.tokenVersion !== payload.tv) {
      throw ApiError.unauthorized('Your admin session is no longer valid. Please sign in again.');
    }

    req.admin = {
      id: admin._id.toString(),
      email: admin.email,
      name: admin.name,
      level: admin.level,
      tokenVersion: admin.tokenVersion,
    };
    next();
  }
);

export const requireSuperAdmin = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const admin = req.admin;
    if (!admin) {
      throw ApiError.unauthorized('Please sign in as a super admin to continue.');
    }
    if (admin.level !== 'SUPER_ADMIN') {
      throw ApiError.forbidden('Only super admins can perform this action.');
    }
    next();
  }
);
