import { Schema, Model, Types, model, models } from 'mongoose';

export interface ISecurityQuestion {
  code: string;
  question: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const securityQuestionSchema = new Schema<ISecurityQuestion>(
  {
    code: { type: String, required: true, trim: true, lowercase: true },
    question: { type: String, required: true, trim: true, maxlength: 200 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, collection: 'securityQuestions' }
);

securityQuestionSchema.index({ code: 1 }, { unique: true });

export const SecurityQuestion: Model<ISecurityQuestion> =
  (models.SecurityQuestion as Model<ISecurityQuestion> | undefined) ??
  model<ISecurityQuestion>('SecurityQuestion', securityQuestionSchema);

export interface IRefreshToken {
  userId: Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  revokedAt?: Date | null;
  createdByIp?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema<IRefreshToken>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    revokedAt: { type: Date, default: null },
    createdByIp: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true, versionKey: false, collection: 'refreshTokens' }
);

refreshTokenSchema.index({ tokenHash: 1 }, { unique: true });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1, revokedAt: 1 });

export const RefreshToken: Model<IRefreshToken> =
  (models.RefreshToken as Model<IRefreshToken> | undefined) ??
  model<IRefreshToken>('RefreshToken', refreshTokenSchema);

export interface ILoginHistory {
  userId?: Types.ObjectId | null;
  device: string;
  browser: string;
  ipAddress: string;
  location: string;
  status: 'success' | 'failed';
  failureReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const loginHistorySchema = new Schema<ILoginHistory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    device: { type: String, required: true, trim: true },
    browser: { type: String, required: true, trim: true },
    ipAddress: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    status: { type: String, enum: ['success', 'failed'], required: true },
    failureReason: { type: String, default: null, trim: true, maxlength: 200 },
  },
  { timestamps: true, versionKey: false, collection: 'loginHistory' }
);

loginHistorySchema.index({ userId: 1, createdAt: -1 });
loginHistorySchema.index({ createdAt: -1 });

export const LoginHistory: Model<ILoginHistory> =
  (models.LoginHistory as Model<ILoginHistory> | undefined) ??
  model<ILoginHistory>('LoginHistory', loginHistorySchema);

export interface IAuditLog {
  userId?: Types.ObjectId | null;
  adminId?: Types.ObjectId | null;
  action: string;
  entityType?: string | null;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const auditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', default: null, index: true },
    adminId: { type: Schema.Types.ObjectId, ref: 'Admin', default: null, index: true },
    action: { type: String, required: true, trim: true, maxlength: 120 },
    entityType: { type: String, default: null, trim: true, maxlength: 60 },
    entityId: { type: String, default: null, trim: true, maxlength: 120 },
    before: { type: Schema.Types.Mixed, default: null },
    after: { type: Schema.Types.Mixed, default: null },
    ipAddress: { type: String, required: true, trim: true },
    userAgent: { type: String, required: true, trim: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false, collection: 'auditLogs' }
);

auditLogSchema.index({ userId: 1, createdAt: -1 });
auditLogSchema.index({ adminId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog: Model<IAuditLog> =
  (models.AuditLog as Model<IAuditLog> | undefined) ??
  model<IAuditLog>('AuditLog', auditLogSchema);
