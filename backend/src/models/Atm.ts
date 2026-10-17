import { Schema, model, Document, Model, Types } from 'mongoose';

export type AtmStatus = 'online' | 'offline' | 'maintenance';

export interface IDenominations {
  thousand: number;
  fiveHundred: number;
  twoHundred: number;
  oneHundred: number;
  fifty: number;
}

export interface IAtm extends Document {
  atmId: string;
  name: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  area: string;
  status: AtmStatus;
  cash: number;
  capacity: number;
  denominations: IDenominations;
  lastRefill?: Date;
  lastService?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const denominationsSchema = new Schema<IDenominations>(
  {
    thousand: { type: Number, default: 0, min: 0 },
    fiveHundred: { type: Number, default: 0, min: 0 },
    twoHundred: { type: Number, default: 0, min: 0 },
    oneHundred: { type: Number, default: 0, min: 0 },
    fifty: { type: Number, default: 0, min: 0 },
  },
  { _id: false }
);

const atmSchema = new Schema<IAtm>(
  {
    atmId: { type: String, required: true, unique: true, index: true, trim: true },
    name: { type: String, required: true, trim: true },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
      address: { type: String, required: true, trim: true },
    },
    area: { type: String, required: true, trim: true, index: true },
    status: {
      type: String,
      enum: ['online', 'offline', 'maintenance'],
      default: 'online',
      index: true,
    },
    cash: { type: Number, default: 0, min: 0 },
    capacity: { type: Number, default: 2000000 },
    denominations: { type: denominationsSchema, default: () => ({}) },
    lastRefill: { type: Date },
    lastService: { type: Date },
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

atmSchema.index({ 'location.lat': 1, 'location.lng': 1 });

export const Atm: Model<IAtm> = model<IAtm>('Atm', atmSchema);
