import { Schema, Model, Types, model, models } from 'mongoose';

export interface NotificationPreferences {
  transactions: boolean;
  lowBalance: boolean;
  loginAlerts: boolean;
  bills: boolean;
  loans: boolean;
}

export interface IUser {
  userId: string;
  email: string;
  passwordHash: string;
  transactionPinHash: string;
  fullName: string;
  mobile: string;
  dateOfBirth: Date;
  securityQuestionId: Types.ObjectId;
  securityAnswerHash: string;
  status: 'active' | 'suspended';
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  tokenVersion: number;
  lowBalanceThresholdPaisa: number;
  notificationPreferences: NotificationPreferences;
  lastLoginAt?: Date | null;
  passwordChangedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const notificationPreferencesSchema = new Schema<NotificationPreferences>(
  {
    transactions: { type: Boolean, default: true },
    lowBalance: { type: Boolean, default: true },
    loginAlerts: { type: Boolean, default: true },
    bills: { type: Boolean, default: true },
    loans: { type: Boolean, default: true },
  },
  { _id: false }
);

const userSchema = new Schema<IUser>(
  {
    userId: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      minlength: 4,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
    },
    passwordHash: { type: String, required: true, select: false },
    transactionPinHash: { type: String, required: true, select: false },
    fullName: { type: String, required: true, trim: true, maxlength: 150 },
    mobile: { type: String, required: true, trim: true, maxlength: 30 },
    dateOfBirth: { type: Date, required: true },
    securityQuestionId: {
      type: Schema.Types.ObjectId,
      ref: 'SecurityQuestion',
      required: true,
    },
    securityAnswerHash: { type: String, required: true, select: false },
    status: { type: String, enum: ['active', 'suspended'], default: 'active' },
    failedLoginAttempts: { type: Number, default: 0, min: 0 },
    lockedUntil: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0, min: 0 },
    lowBalanceThresholdPaisa: { type: Number, default: 500_000, min: 0 },
    notificationPreferences: {
      type: notificationPreferencesSchema,
      default: () => ({}),
    },
    lastLoginAt: { type: Date, default: null },
    passwordChangedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false, collection: 'users' }
);

userSchema.index({ userId: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ mobile: 1 }, { unique: true });
userSchema.index({ lockedUntil: 1 });

export const User: Model<IUser> =
  (models.User as Model<IUser> | undefined) ??
  model<IUser>('User', userSchema);
