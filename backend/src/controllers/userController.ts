import { Request, Response } from 'express';
import { User } from '../models/User';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { buildMeta, sendSuccess } from '../utils/response';

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1) || 1;
  const limit = Math.min(Number(req.query.limit ?? 20) || 20, 200);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.role) filter.role = req.query.role;
  if (req.query.status) filter.status = req.query.status;
  if (req.query.search) {
    const search = String(req.query.search);
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const [items, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    User.countDocuments(filter),
  ]);

  return sendSuccess(res, items, 'Users', buildMeta(total, page, limit));
});

export const getUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  return sendSuccess(res, user, 'User');
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const exists = await User.findOne({ email: String(req.body.email).toLowerCase() });
  if (exists) throw ApiError.conflict('Email already in use');
  const user = await User.create(req.body);
  const safe = await User.findById(user._id);
  return sendSuccess(res, safe, 'User created', undefined, 201);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const user = await User.findById(req.params.id).select('+password');
  if (!user) throw ApiError.notFound('User not found');

  const { name, email, role, status, phone, password } = req.body;
  if (name !== undefined) user.name = name;
  if (email !== undefined) user.email = email;
  if (role !== undefined) user.role = role;
  if (status !== undefined) user.status = status;
  if (phone !== undefined) user.phone = phone;
  if (password) user.password = password;

  await user.save();
  const safe = await User.findById(user._id);
  return sendSuccess(res, safe, 'User updated');
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  if (req.user && req.user.id === req.params.id) {
    throw ApiError.badRequest('You cannot delete your own account');
  }
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  return sendSuccess(res, null, 'User deleted');
});
