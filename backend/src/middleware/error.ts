import { NextFunction, Request, Response } from 'express';
import mongoose from 'mongoose';
import { ZodError } from 'zod';
import { ApiError } from '../utils/ApiError';

export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} was not found.`));
}

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'Please correct the highlighted fields.',
      code: 'VALIDATION_ERROR',
      errors: error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof ApiError) {
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
      code: error.code,
      ...(error.details ? { details: error.details } : {}),
    });
    return;
  }

  if (error instanceof mongoose.Error.ValidationError) {
    res.status(400).json({
      success: false,
      message: 'One or more submitted values are invalid.',
      code: 'VALIDATION_ERROR',
      errors: Object.values(error.errors).map((issue) => ({
        field: issue.path,
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof mongoose.Error.CastError) {
    res.status(400).json({
      success: false,
      message: 'One or more submitted identifiers are invalid.',
      code: 'BAD_REQUEST',
    });
    return;
  }

  if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
    const keys = Object.keys(error.keyPattern ?? {});
    let message = 'A record with these details already exists.';
    if (keys.includes('email')) message = 'This email address is already registered.';
    else if (keys.includes('userId')) message = 'This User ID is already taken.';
    else if (keys.includes('mobile')) message = 'This mobile number is already registered.';
    else if (keys.includes('accountNumber')) message = 'This account is already linked.';
    else if (keys.includes('referenceNumber')) message = 'A duplicate reference was generated.';
    else if (keys.includes('tokenHash')) message = 'This session already exists.';

    res.status(409).json({ success: false, message, code: 'CONFLICT' });
    return;
  }

  if (error instanceof Error && /mongo|sanitize/i.test(error.name)) {
    res.status(400).json({
      success: false,
      message: 'The submitted request contains invalid characters.',
      code: 'BAD_REQUEST',
    });
    return;
  }

  console.error('[api] unhandled error', error);
  res.status(500).json({
    success: false,
    message: 'Something went wrong. Please try again.',
    code: 'INTERNAL_ERROR',
  });
}
