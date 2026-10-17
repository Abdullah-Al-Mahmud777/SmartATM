import { Request, Response } from 'express';
import { Atm } from '../models/Atm';
import { Alert } from '../models/Alert';
import { Maintenance } from '../models/Maintenance';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { buildMeta, sendSuccess } from '../utils/response';

const denominationsValue = (d: {
  thousand?: number;
  fiveHundred?: number;
  twoHundred?: number;
  oneHundred?: number;
  fifty?: number;
}): number =>
  (d.thousand ?? 0) * 1000 +
  (d.fiveHundred ?? 0) * 500 +
  (d.twoHundred ?? 0) * 200 +
  (d.oneHundred ?? 0) * 100 +
  (d.fifty ?? 0) * 50;

export const getCashOverview = asyncHandler(
  async (req: Request, res: Response) => {
    const page = Number(req.query.page ?? 1) || 1;
    const limit = Math.min(Number(req.query.limit ?? 20) || 20, 200);
    const skip = (page - 1) * limit;

    const filter: Record<string, unknown> = {};
    if (req.query.search) {
      const search = String(req.query.search);
      filter.$or = [
        { atmId: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { area: { $regex: search, $options: 'i' } },
      ];
    }

    const [atms, total] = await Promise.all([
      Atm.find(filter).sort({ cash: 1 }).skip(skip).limit(limit).lean(),
      Atm.countDocuments(filter),
    ]);

    const items = atms.map((atm) => {
      const percentage = atm.capacity
        ? Number(((atm.cash / atm.capacity) * 100).toFixed(1))
        : 0;
      const level =
        percentage <= 10
          ? 'critical'
          : percentage <= 25
            ? 'low'
            : percentage <= 60
              ? 'medium'
              : 'healthy';
      return { ...atm, percentage, level };
    });

    return sendSuccess(res, items, 'Cash overview', buildMeta(total, page, limit));
  }
);

export const refillAtm = asyncHandler(async (req: Request, res: Response) => {
  const atm = await Atm.findById(req.params.id);
  if (!atm) throw ApiError.notFound('ATM not found');

  const incoming = req.body.denominations ?? {};
  const added = denominationsValue(incoming);

  atm.denominations.thousand += incoming.thousand ?? 0;
  atm.denominations.fiveHundred += incoming.fiveHundred ?? 0;
  atm.denominations.twoHundred += incoming.twoHundred ?? 0;
  atm.denominations.oneHundred += incoming.oneHundred ?? 0;
  atm.denominations.fifty += incoming.fifty ?? 0;
  atm.cash = Math.min(atm.capacity, atm.cash + added);
  atm.lastRefill = new Date();
  await atm.save();

  await Maintenance.create({
    atm: atm._id,
    atmCode: atm.atmId,
    type: 'Cash Refill',
    description: `Refilled with ${added} BDT`,
    technician: req.body.technician ?? 'Cash Van',
    scheduledDate: new Date(),
    completedDate: new Date(),
    status: 'completed',
    cost: 0,
  });

  if (atm.cash > atm.capacity * 0.25) {
    await Alert.updateMany(
      { atm: atm._id, type: { $in: ['cash_low', 'cash_out'] }, status: 'active' },
      { status: 'resolved', resolvedAt: new Date() }
    );
  }

  return sendSuccess(res, atm, 'ATM refilled successfully');
});

export const adjustCash = asyncHandler(async (req: Request, res: Response) => {
  const atm = await Atm.findById(req.params.id);
  if (!atm) throw ApiError.notFound('ATM not found');

  const amount = Number(req.body.amount ?? 0);
  const next = atm.cash + amount;
  if (next < 0) throw ApiError.badRequest('Adjustment would result in negative cash');
  atm.cash = Math.min(atm.capacity, next);
  await atm.save();

  return sendSuccess(res, atm, 'Cash adjusted');
});

export const getCashAlerts = asyncHandler(async (_req: Request, res: Response) => {
  const atms = await Atm.find({ status: { $ne: 'offline' } })
    .select('atmId name cash capacity')
    .lean();
  const low = atms
    .map((a) => ({
      atmId: a.atmId,
      name: a.name,
      cash: a.cash,
      capacity: a.capacity,
      percentage: a.capacity
        ? Number(((a.cash / a.capacity) * 100).toFixed(1))
        : 0,
    }))
    .filter((a) => a.percentage <= 25)
    .sort((a, b) => a.percentage - b.percentage);
  return sendSuccess(res, low, 'Low cash ATMs');
});
