import { Schema, model, Document, Model, Types } from 'mongoose';

export type AlertType =
  | 'cash_low'
  | 'cash_out'
  | 'offline'
  | 'maintenance'
  | 'security'
  | 'network';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export interface IAlert extends Document {
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  title: string;
  message: string;
  atm?: Types.ObjectId;
  atmCode?: string;
  acknowledgedBy?: Types.ObjectId;
  resolvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    type: {
      type: String,
      enum: ['cash_low', 'cash_out', 'offline', 'maintenance', 'security', 'network'],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'acknowledged', 'resolved'],
      default: 'active',
      index: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    atm: { type: Schema.Types.ObjectId, ref: 'Atm', index: true },
    atmCode: { type: String },
    acknowledgedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    resolvedAt: { type: Date },
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

alertSchema.index({ createdAt: -1 });

export const Alert: Model<IAlert> = model<IAlert>('Alert', alertSchema);
