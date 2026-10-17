import { Schema, model, Document, Model, Types } from 'mongoose';

export type MaintenanceStatus = 'scheduled' | 'in_progress' | 'completed' | 'cancelled';

export interface IMaintenance extends Document {
  atm: Types.ObjectId;
  atmCode: string;
  type: string;
  description: string;
  technician: string;
  scheduledDate: Date;
  completedDate?: Date;
  cost: number;
  status: MaintenanceStatus;
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceSchema = new Schema<IMaintenance>(
  {
    atm: { type: Schema.Types.ObjectId, ref: 'Atm', required: true, index: true },
    atmCode: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, default: '' },
    technician: { type: String, default: '' },
    scheduledDate: { type: Date, required: true, index: true },
    completedDate: { type: Date },
    cost: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
      default: 'scheduled',
      index: true,
    },
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

export const Maintenance: Model<IMaintenance> = model<IMaintenance>(
  'Maintenance',
  maintenanceSchema
);
