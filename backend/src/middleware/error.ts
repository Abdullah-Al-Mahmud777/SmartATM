import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../utils/ApiError';
import { isProd } from '../config/env';

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

interface MongoLikeError {
  code?: number;
  name?: string;
  errors?: Record<string, { message: string }>;
}

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500;
  let message = 'Internal server error';
  let details: unknown;

  if (err instanceof ApiError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else {
    const mongoErr = err as MongoLikeError;
    if (mongoErr?.code === 11000) {
      statusCode = 409;
      message = 'Duplicate key error';
    } else if (mongoErr?.name === 'CastError') {
      statusCode = 400;
      message = 'Invalid identifier';
    } else if (mongoErr?.name === 'ValidationError' && mongoErr.errors) {
      statusCode = 400;
      message = 'Validation failed';
      details = Object.values(mongoErr.errors).map((e) => e.message);
    } else if (err instanceof Error) {
      message = isProd ? message : err.message;
    }
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error('[error]', err);
  }

  res.status(statusCode).json({
    success: false,
    data: null,
    message,
    ...(details ? { errors: details } : {}),
  });
};
