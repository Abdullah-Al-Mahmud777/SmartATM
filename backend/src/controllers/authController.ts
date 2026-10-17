import { Request, Response } from 'express';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';
import { clearAuthCookie, setAuthCookie, signToken } from '../utils/token';

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) throw ApiError.unauthorized('Invalid email or password');

  const valid = await user.comparePassword(password);
  if (!valid) throw ApiError.unauthorized('Invalid email or password');
  if (user.status !== 'active') throw ApiError.forbidden('Account is not active');

  const token = signToken({
    id: user.id,
    role: user.role,
    email: user.email,
  });

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  setAuthCookie(res, token);

  const safeUser = await User.findById(user.id);
  return sendSuccess(res, { user: safeUser, token }, 'Logged in successfully');
});

export const logout = asyncHandler(async (_req: Request, res: Response) => {
  clearAuthCookie(res);
  return sendSuccess(res, null, 'Logged out successfully');
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  return sendSuccess(res, req.user, 'Current user');
});
