import { Schema, Model, model, models } from 'mongoose';

export type AdminLevel = 'SUPER_ADMIN' | 'ADMIN';

export interface IAdmin {
  name: string;
  email: string;
  passwordHash: string;
  level: AdminLevel;
  status: 'active' | 'disabled';
  failedLoginAttempts: number;
  lockedUntil?: Date | null;
  tokenVersion: number;
  passwordChangeRequired: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const adminSchema = new Schema<IAdmin>(
  {
    name: { type: String, required: true, trim: true, maxlength: 150 },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 255,
      unique: true,
    },
    passwordHash: { type: String, required: true, select: false },
    level: { type: String, enum: ['SUPER_ADMIN', 'ADMIN'], default: 'ADMIN' },
    status: { type: String, enum: ['active', 'disabled'], default: 'active' },
    failedLoginAttempts: { type: Number, default: 0, min: 0 },
    lockedUntil: { type: Date, default: null },
    tokenVersion: { type: Number, default: 0, min: 0 },
    passwordChangeRequired: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, collection: 'admins' }
);

adminSchema.index({ email: 1 }, { unique: true });
adminSchema.index({ level: 1, status: 1 });

export const Admin: Model<IAdmin> =
  (models.Admin as Model<IAdmin> | undefined) ?? model<IAdmin>('Admin', adminSchema);
