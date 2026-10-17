import { Schema, model, Document, Model, Types } from 'mongoose';

export type TransactionType =
  | 'withdrawal'
  | 'deposit'
  | 'balance_inquiry'
  | 'transfer';
export type TransactionStatus = 'success' | 'failed' | 'pending';

export interface ITransaction extends Document {
  reference: string;
  atm: Types.ObjectId;
  atmCode: string;
  type: TransactionType;
  amount: number;
  fee: number;
  status: TransactionStatus;
  cardMasked: string;
  customerName: string;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    atm: { type: Schema.Types.ObjectId, ref: 'Atm', required: true, index: true },
    atmCode: { type: String, required: true, index: true },
    type: {
      type: String,
      enum: ['withdrawal', 'deposit', 'balance_inquiry', 'transfer'],
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0 },
    fee: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ['success', 'failed', 'pending'],
      default: 'success',
      index: true,
    },
    cardMasked: { type: String, default: '**** **** **** 0000' },
    customerName: { type: String, trim: true },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, unknown>) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

transactionSchema.index({ createdAt: -1 });
transactionSchema.index({ atm: 1, createdAt: -1 });

export const Transaction: Model<ITransaction> = model<ITransaction>(
  'Transaction',
  transactionSchema
);
