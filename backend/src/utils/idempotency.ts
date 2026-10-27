import crypto from 'node:crypto';
import { Request } from 'express';
import mongoose, { ClientSession, Types } from 'mongoose';
import {
  IdempotencyKey,
  IdempotencyOperation,
  IStoredResponse,
} from '../models/idempotency.model';
import { ApiError } from './ApiError';

const IDEMPOTENCY_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const IDEMPOTENCY_KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{7,119}$/;

interface ExecuteOptions<T> {
  userId: string;
  key: string;
  operation: IdempotencyOperation;
  body: unknown;
  statusCode: number;
  message: string;
  run: (session: ClientSession) => Promise<T>;
}

export interface IdempotentResult<T> {
  data: T;
  message: string;
  statusCode: number;
  replay: boolean;
}

function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === 'object') {
    return Object.keys(value as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((result, key) => {
        result[key] = canonicalize((value as Record<string, unknown>)[key]);
        return result;
      }, {});
  }
  return value;
}

function requestHash(operation: IdempotencyOperation, body: unknown): string {
  return crypto
    .createHash('sha256')
    .update(JSON.stringify(canonicalize({ operation, body })))
    .digest('hex');
}

function isDuplicateKey(error: unknown): boolean {
  return error instanceof mongoose.mongo.MongoServerError && error.code === 11000;
}

function replayResult<T>(
  record: {
    requestHash: string;
    response?: IStoredResponse | null;
  },
  hash: string
): IdempotentResult<T> {
  if (record.requestHash !== hash) {
    throw new ApiError(
      409,
      'This Idempotency-Key was already used for a different request.',
      'IDEMPOTENCY_CONFLICT'
    );
  }
  if (!record.response) {
    throw new ApiError(
      409,
      'A request with this Idempotency-Key is already in progress.',
      'IDEMPOTENCY_IN_PROGRESS'
    );
  }
  return {
    data: record.response.data as T,
    message: record.response.message,
    statusCode: record.response.statusCode,
    replay: true,
  };
}

export function requireIdempotencyKey(req: Request): string {
  const key = req.get('idempotency-key')?.trim();
  if (!key) {
    throw new ApiError(
      400,
      'An Idempotency-Key header is required for this request.',
      'IDEMPOTENCY_KEY_REQUIRED'
    );
  }
  if (!IDEMPOTENCY_KEY_PATTERN.test(key)) {
    throw new ApiError(
      400,
      'The Idempotency-Key must be 8-120 characters using letters, numbers, dots, colons, underscores, or hyphens.',
      'INVALID_IDEMPOTENCY_KEY'
    );
  }
  return key;
}

export async function executeIdempotent<T>(
  options: ExecuteOptions<T>
): Promise<IdempotentResult<T>> {
  const userId = new Types.ObjectId(options.userId);
  const hash = requestHash(options.operation, options.body);

  const existing = await IdempotencyKey.findOne({
    userId,
    key: options.key,
  })
    .lean()
    .exec();
  if (existing) return replayResult<T>(existing, hash);

  const session = await mongoose.startSession();
  let stored: IStoredResponse | null = null;

  try {
    await session.withTransaction(async () => {
      await IdempotencyKey.create(
        [
          {
            userId,
            key: options.key,
            operation: options.operation,
            requestHash: hash,
            expiresAt: new Date(Date.now() + IDEMPOTENCY_TTL_MS),
          },
        ],
        { session }
      );

      const data = await options.run(session);
      stored = {
        data,
        message: options.message,
        statusCode: options.statusCode,
      };

      await IdempotencyKey.updateOne(
        { userId, key: options.key },
        { $set: { response: stored } },
        { session }
      );
    });
  } catch (error) {
    if (!isDuplicateKey(error)) throw error;

    const record = await IdempotencyKey.findOne({
      userId,
      key: options.key,
    })
      .lean()
      .exec();
    if (record) return replayResult<T>(record, hash);
    throw error;
  } finally {
    await session.endSession();
  }

  if (!stored) {
    throw new ApiError(
      500,
      'The request could not be completed safely. Please try again.',
      'IDEMPOTENCY_FAILED'
    );
  }

  return {
    data: (stored as IStoredResponse).data as T,
    message: (stored as IStoredResponse).message,
    statusCode: (stored as IStoredResponse).statusCode,
    replay: false,
  };
}
