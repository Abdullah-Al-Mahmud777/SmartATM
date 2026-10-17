import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { User, UserRole } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { verifyToken } from '../utils/token';

export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) token = header.split(' ')[1];
    if (!token && req.cookies?.[env.cookieName]) {
      token = req.cookies[env.cookieName];
    }

    if (!token) throw ApiError.unauthorized('Authentication required');

    const payload = verifyToken(token);
    const user = await User.findById(payload.id);
    if (!user) throw ApiError.unauthorized('User no longer exists');
    if (user.status !== 'active') throw ApiError.forbidden('Account is not active');

    req.user = user;
    next();
  } catch (err) {
    if (err instanceof ApiError) return next(err);
    next(ApiError.unauthorized('Invalid or expired session'));
  }
};

export const authorize =
  (...roles: UserRole[]) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden('Insufficient permissions'));
    }
    next();
  };
