import { Request, Response } from 'express';
import { Maintenance } from '../models/Maintenance';
import { Atm } from '../models/Atm';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { buildMeta, sendSuccess } from '../utils/response';

export const listMaintenance = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1) || 1;
    const limit = Math.min(Number(req.query.limit ?? 20) || 20, 200);
    const skip = (page - 1) * limit;
    const filter: Record<string, unknown> = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.atm) filter.atm = req.query.atm;

    const [items, total] = await Promise.all([
      Maintenance.find(filter)
        .sort({ scheduledDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('atm', 'atmId name area')
        .lean(),
      Maintenance.countDocuments(filter),
    ]);

    return sendSuccess(res, items, 'Maintenance records', buildMeta(total, page, limit));
  }
);

export const createMaintenance = asyncHandler(
  async (req: Request, res: Response) => {
    const atm = await Atm.findById(req.body.atm);
    if (!atm) throw ApiError.notFound('ATM not found');
    const record = await Maintenance.create({
      ...req.body,
      atmCode: atm.atmId,
    });
    return sendSuccess(res, record, 'Maintenance scheduled', undefined, 201);
  }
);

export const updateMaintenance = asyncHandler(
  async (req: Request, res: Response) => {
    const record = await Maintenance.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!record) throw ApiError.notFound('Maintenance record not found');
    return sendSuccess(res, record, 'Maintenance updated');
  }
);

export const deleteMaintenance = asyncHandler(
  async (req: Request, res: Response) => {
    const record = await Maintenance.findByIdAndDelete(req.params.id);
    if (!record) throw ApiError.notFound('Maintenance record not found');
    return sendSuccess(res, null, 'Maintenance deleted');
  }
);
