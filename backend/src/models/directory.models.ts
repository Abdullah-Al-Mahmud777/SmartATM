import { Schema, Model, model, models } from 'mongoose';

export interface IBranch {
  code: string;
  name: string;
  address: string;
  area: string;
  city: string;
  phone: string;
  hours: string;
  services: string[];
  latitude: number;
  longitude: number;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    code: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    area: { type: String, required: true, trim: true, maxlength: 120 },
    city: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    hours: { type: String, required: true, trim: true, maxlength: 120 },
    services: { type: [String], default: [] },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
  },
  { timestamps: true, versionKey: false, collection: 'branches' }
);

branchSchema.index({ code: 1 }, { unique: true });
branchSchema.index({ city: 1, area: 1 });

export const Branch: Model<IBranch> =
  (models.Branch as Model<IBranch> | undefined) ??
  model<IBranch>('Branch', branchSchema);

export interface IAtm {
  code: string;
  name: string;
  address: string;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  status: 'online' | 'offline' | 'maintenance';
  services: string[];
  createdAt: Date;
  updatedAt: Date;
}

const atmSchema = new Schema<IAtm>(
  {
    code: { type: String, required: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    address: { type: String, required: true, trim: true, maxlength: 300 },
    area: { type: String, required: true, trim: true, maxlength: 120 },
    city: { type: String, required: true, trim: true, maxlength: 120 },
    latitude: { type: Number, required: true, min: -90, max: 90 },
    longitude: { type: Number, required: true, min: -180, max: 180 },
    status: {
      type: String,
      enum: ['online', 'offline', 'maintenance'],
      default: 'online',
    },
    services: { type: [String], default: [] },
  },
  { timestamps: true, versionKey: false, collection: 'atms' }
);

atmSchema.index({ code: 1 }, { unique: true });
atmSchema.index({ city: 1, area: 1 });

export const Atm: Model<IAtm> =
  (models.Atm as Model<IAtm> | undefined) ??
  model<IAtm>('Atm', atmSchema);
