import { Response } from 'express';

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'OK',
  meta?: PaginationMeta | Record<string, unknown>,
  statusCode = 200
): Response => {
  const body: Record<string, unknown> = { success: true, data, message };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

export const sendCreated = <T>(
  res: Response,
  data: T,
  message = 'Created'
): Response => sendSuccess(res, data, message, undefined, 201);

export const buildMeta = (
  total: number,
  page: number,
  limit: number
): PaginationMeta => ({
  total,
  page,
  limit,
  totalPages: Math.max(1, Math.ceil(total / limit)),
});
