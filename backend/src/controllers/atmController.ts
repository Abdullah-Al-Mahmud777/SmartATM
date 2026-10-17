import { Request, Response } from 'express';
import { Atm } from '../models/Atm';
import { Transaction } from '../models/Transaction';
import { Alert } from '../models/Alert';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { buildMeta, sendSuccess } from '../utils/response';

export const listAtms = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1) || 1;
  const limit = Math.min(Number(req.query.limit ?? 20) || 20, 200);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.area) filter.area = req.query.area;
  if (req.query.search) {
    const search = String(req.query.search);
    filter.$or = [
      { atmId: { $regex: search, $options: 'i' } },
      { name: { $regex: search, $options: 'i' } },
      { 'location.address': { $regex: search, $options: 'i' } },
      { area: { $regex: search, $options: 'i' } },
    ];
  }

  const sortField = String(req.query.sort ?? 'atmId');
  const sortDir = req.query.order === 'desc' ? -1 : 1;

  const [items, total] = await Promise.all([
    Atm.find(filter).sort({ [sortField]: sortDir }).skip(skip).limit(limit).lean(),
    Atm.countDocuments(filter),
  ]);

  return sendSuccess(res, items, 'ATMs', buildMeta(total, page, limit));
});

export const getAtm = asyncHandler(async (req: Request, res: Response) => {
  const atm = await Atm.findById(req.params.id);
  if (!atm) throw ApiError.notFound('ATM not found');

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const [recentTransactions, alertCount] = await Promise.all([
    Transaction.find({ atm: atm._id, createdAt: { $gte: since } })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Alert.countDocuments({ atm: atm._id, status: 'active' }),
  ]);

  return sendSuccess(
    res,
    { atm, recentTransactions, alertCount },
    'ATM details'
  );
});

export const createAtm = asyncHandler(async (req: Request, res: Response) => {
  const exists = await Atm.findOne({ atmId: req.body.atmId });
  if (exists) throw ApiError.conflict('ATM id already exists');
  const atm = await Atm.create(req.body);
  return sendSuccess(res, atm, 'ATM created', undefined, 201);
});

export const updateAtm = asyncHandler(async (req: Request, res: Response) => {
  const atm = await Atm.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!atm) throw ApiError.notFound('ATM not found');
  return sendSuccess(res, atm, 'ATM updated');
});

export const deleteAtm = asyncHandler(async (req: Request, res: Response) => {
  const atm = await Atm.findByIdAndDelete(req.params.id);
  if (!atm) throw ApiError.notFound('ATM not found');
  return sendSuccess(res, null, 'ATM deleted');
});

export const getAtmStats = asyncHandler(async (_req: Request, res: Response) => {
  const [byStatus, byArea, cashAgg] = await Promise.all([
    Atm.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Atm.aggregate([
      {
        $group: {
          _id: '$area',
          count: { $sum: 1 },
          cash: { $sum: '$cash' },
        },
      },
      { $sort: { count: -1 } },
    ]),
    Atm.aggregate([
      {
        $group: {
          _id: null,
          totalCash: { $sum: '$cash' },
          totalCapacity: { $sum: '$capacity' },
        },
      },
    ]),
  ]);
  return sendSuccess(
    res,
    {
      byStatus: byStatus.reduce(
        (acc, cur) => ({ ...acc, [cur._id]: cur.count }),
        {}
      ),
      byArea,
      cash: cashAgg[0] ?? { totalCash: 0, totalCapacity: 0 },
    },
    'ATM statistics'
  );
});
