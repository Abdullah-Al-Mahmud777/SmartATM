import { Schema, Model, Types, model, models } from 'mongoose';

export type TransactionType =
  | 'deposit'
  | 'withdrawal'
  | 'transfer_debit'
  | 'transfer_credit'
  | 'exchange'
  | 'bill_payment'
  | 'mobile_recharge'
  | 'card_payment'
  | 'loan_installment'
  | 'fdr_open'
  | 'dps_contribution'
  | 'fee'
  | 'interest'
  | 'reversal';

export interface ITransaction {
  accountId: Types.ObjectId;
  userId: Types.ObjectId;
  type: TransactionType;
  direction: 'debit' | 'credit';
  amountPaisa: number;
  feePaisa: number;
  balanceAfterPaisa: number;
  referenceNumber: string;
  counterpartyName?: string | null;
  counterpartyAccount?: string | null;
  description?: string | null;
  status: 'completed' | 'pending' | 'cancelled' | 'failed';
  channel: 'online' | 'mobile' | 'branch' | 'atm' | 'system';
  idempotencyKey?: string | null;
  cancelableUntil?: Date | null;
  completedAt?: Date | null;
  cancelledAt?: Date | null;
  cancelledBy?: 'customer' | 'system' | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'deposit',
        'withdrawal',
        'transfer_debit',
        'transfer_credit',
        'exchange',
        'bill_payment',
        'mobile_recharge',
        'card_payment',
        'loan_installment',
        'fdr_open',
        'dps_contribution',
        'fee',
        'interest',
        'reversal',
      ],
      required: true,
    },
    direction: { type: String, enum: ['debit', 'credit'], required: true },
    amountPaisa: { type: Number, required: true, min: 1 },
    feePaisa: { type: Number, default: 0, min: 0 },
    balanceAfterPaisa: { type: Number, required: true, min: 0 },
    referenceNumber: { type: String, required: true, trim: true },
    counterpartyName: { type: String, default: null, trim: true, maxlength: 150 },
    counterpartyAccount: { type: String, default: null, trim: true, maxlength: 40 },
    description: { type: String, default: null, trim: true, maxlength: 500 },
    status: {
      type: String,
      enum: ['completed', 'pending', 'cancelled', 'failed'],
      default: 'completed',
    },
    channel: {
      type: String,
      enum: ['online', 'mobile', 'branch', 'atm', 'system'],
      default: 'online',
    },
    idempotencyKey: { type: String, default: null, trim: true, maxlength: 120 },
    cancelableUntil: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    cancelledBy: {
      type: String,
      enum: ['customer', 'system'],
      default: null,
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false, collection: 'transactions' }
);

transactionSchema.index({ accountId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ userId: 1, type: 1, status: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1, cancelableUntil: 1 });
transactionSchema.index({ referenceNumber: 1 }, { unique: true });
transactionSchema.index(
  { userId: 1, idempotencyKey: 1 },
  {
    unique: true,
    partialFilterExpression: { idempotencyKey: { $type: 'string' } },
  }
);

export const Transaction: Model<ITransaction> =
  (models.Transaction as Model<ITransaction> | undefined) ??
  model<ITransaction>('Transaction', transactionSchema);
