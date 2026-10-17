import { Schema, model, Document, Model } from 'mongoose';

export interface ISettings extends Document {
  orgName: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  lowCashThreshold: number;
  criticalCashThreshold: number;
  refreshInterval: number;
  alertEmail: string;
  maintenanceMode: boolean;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    orgName: { type: String, default: 'SmartATM Network' },
    currency: { type: String, default: 'BDT' },
    currencySymbol: { type: String, default: '৳' },
    timezone: { type: String, default: 'Asia/Dhaka' },
    lowCashThreshold: { type: Number, default: 200000 },
    criticalCashThreshold: { type: Number, default: 50000 },
    refreshInterval: { type: Number, default: 30 },
    alertEmail: { type: String, default: 'ops@smartatm.com' },
    maintenanceMode: { type: Boolean, default: false },
  },
  { timestamps: true }
);

settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

export const Settings: Model<ISettings> = model<ISettings>('Settings', settingsSchema);
