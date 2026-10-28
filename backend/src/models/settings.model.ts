import { Schema, Model, model, models } from 'mongoose';

export interface ISettings {
  key: string;
  transactionFeePaisa: number;
  withdrawCancelWindowSeconds: number;
  defaultDailyLimitPaisa: number;
  defaultMonthlyLimitPaisa: number;
  userAutoLogoutMinutes: number;
  approvalThresholdPaisa: number;
  announcement: string | null;
  maintenanceMode: boolean;
}

const settingsSchema = new Schema<ISettings>(
  {
    key: { type: String, required: true },
    transactionFeePaisa: { type: Number, required: true, min: 0, default: 0 },
    withdrawCancelWindowSeconds: { type: Number, required: true, min: 10, max: 3600, default: 120 },
    defaultDailyLimitPaisa: { type: Number, required: true, min: 0, default: 5_000_000 },
    defaultMonthlyLimitPaisa: { type: Number, required: true, min: 0, default: 20_000_000 },
    userAutoLogoutMinutes: { type: Number, required: true, min: 1, max: 1440, default: 10 },
    approvalThresholdPaisa: { type: Number, required: true, min: 0, default: 5_000_000 },
    announcement: { type: String, default: null, trim: true, maxlength: 500 },
    maintenanceMode: { type: Boolean, required: true, default: false },
  },
  { timestamps: true, versionKey: false, collection: 'settings' }
);

settingsSchema.index({ key: 1 }, { unique: true });

export const Settings: Model<ISettings> =
  (models.Settings as Model<ISettings> | undefined) ?? model<ISettings>('Settings', settingsSchema);

export async function getSettings(): Promise<ISettings> {
  const settings = await Settings.findOne({ key: 'app' }).exec();
  if (settings) {
    return settings;
  }
  const created = await Settings.create({ key: 'app' });
  return created;
}
