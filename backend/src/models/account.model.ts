import { Schema, Model, Types, model, models } from 'mongoose';

export interface IAccount {
  accountNumber: string;
  userId?: Types.ObjectId | null;
  customerRef: string;
  holderName: string;
  accountType: 'savings' | 'current';
  branchCode: string;
  branchName: string;
  balancePaisa: number;
  availableBalancePaisa: number;
  currency: 'BDT';
  status: 'active' | 'dormant' | 'closed';
  isPrimary: boolean;
  dateOfBirth: Date;
  openedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const accountSchema = new Schema<IAccount>(
  {
    accountNumber: { type: String, required: true, trim: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    customerRef: { type: String, required: true, trim: true, uppercase: true },
    holderName: { type: String, required: true, trim: true, maxlength: 150 },
    accountType: { type: String, enum: ['savings', 'current'], default: 'savings' },
    branchCode: { type: String, required: true, trim: true },
    branchName: { type: String, required: true, trim: true },
    balancePaisa: { type: Number, required: true, min: 0, default: 0 },
    availableBalancePaisa: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, enum: ['BDT'], default: 'BDT' },
    status: {
      type: String,
      enum: ['active', 'dormant', 'closed'],
      default: 'active',
      index: true,
    },
    isPrimary: { type: Boolean, default: false },
    dateOfBirth: { type: Date, required: true },
    openedAt: { type: Date, default: Date.now },
  },
  { timestamps: true, versionKey: false, collection: 'accounts' }
);

accountSchema.index({ accountNumber: 1 }, { unique: true });
accountSchema.index({ userId: 1, isPrimary: -1 });
accountSchema.index({ customerRef: 1, userId: 1 });

export const Account: Model<IAccount> =
  (models.Account as Model<IAccount> | undefined) ??
  model<IAccount>('Account', accountSchema);
