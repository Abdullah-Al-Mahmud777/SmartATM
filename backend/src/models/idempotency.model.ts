import { Schema, Model, Types, model, models } from 'mongoose';

export type IdempotencyOperation =
  | 'deposit'
  | 'withdraw'
  | 'transfer'
  | 'cancel_withdrawal'
  | 'exchange';

export interface IStoredResponse {
  data: unknown;
  message: string;
  statusCode: number;
}

export interface IIdempotencyKey {
  userId: Types.ObjectId;
  key: string;
  operation: IdempotencyOperation;
  requestHash: string;
  response?: IStoredResponse | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const idempotencyKeySchema = new Schema<IIdempotencyKey>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    key: { type: String, required: true, trim: true, maxlength: 120 },
    operation: {
      type: String,
      enum: ['deposit', 'withdraw', 'transfer', 'cancel_withdrawal', 'exchange'],
      required: true,
    },
    requestHash: { type: String, required: true },
    response: { type: Schema.Types.Mixed, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true, versionKey: false, collection: 'idempotencyKeys' }
);

idempotencyKeySchema.index({ userId: 1, key: 1 }, { unique: true });
idempotencyKeySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const IdempotencyKey: Model<IIdempotencyKey> =
  (models.IdempotencyKey as Model<IIdempotencyKey> | undefined) ??
  model<IIdempotencyKey>('IdempotencyKey', idempotencyKeySchema);
