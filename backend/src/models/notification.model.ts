import { Schema, Model, Types, model, models } from 'mongoose';

export type NotificationType =
  | 'transaction'
  | 'low_balance'
  | 'login'
  | 'security'
  | 'welcome'
  | 'bill'
  | 'loan'
  | 'card'
  | 'support';

export interface INotification {
  userId: Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'danger';
  isRead: boolean;
  readAt?: Date | null;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: [
        'transaction',
        'low_balance',
        'login',
        'security',
        'welcome',
        'bill',
        'loan',
        'card',
        'support',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 150 },
    message: { type: String, required: true, trim: true, maxlength: 1000 },
    severity: {
      type: String,
      enum: ['info', 'success', 'warning', 'danger'],
      default: 'info',
    },
    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true, versionKey: false, collection: 'notifications' }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification: Model<INotification> =
  (models.Notification as Model<INotification> | undefined) ??
  model<INotification>('Notification', notificationSchema);
