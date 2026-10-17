import { Request, Response } from 'express';
import { Atm } from '../models/Atm';
import { Transaction } from '../models/Transaction';
import { Alert } from '../models/Alert';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

const DHAKA_OFFSET_MS = 6 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDhakaDay = (date = new Date()): Date => {
  const shifted = new Date(date.getTime() + DHAKA_OFFSET_MS);
  shifted.setUTCHours(0, 0, 0, 0);
  return new Date(shifted.getTime() - DHAKA_OFFSET_MS);
};

const pctChange = (current: number, previous: number): number => {
  if (previous === 0) return current === 0 ? 0 : 100;
  return Number((((current - previous) / previous) * 100).toFixed(1));
};

export const getSummary = asyncHandler(async (_req: Request, res: Response) => {
  const todayStart = startOfDhakaDay();
  const yesterdayStart = new Date(todayStart.getTime() - DAY_MS);
  const tomorrowStart = new Date(todayStart.getTime() + DAY_MS);

  const [
    totalAtms,
    online,
    offline,
    maintenance,
    cashAgg,
    todayAgg,
    yesterdayAgg,
    activeAlerts,
  ] = await Promise.all([
    Atm.countDocuments(),
    Atm.countDocuments({ status: 'online' }),
    Atm.countDocuments({ status: 'offline' }),
    Atm.countDocuments({ status: 'maintenance' }),
    Atm.aggregate([
      { $group: { _id: null, total: { $sum: '$cash' }, capacity: { $sum: '$capacity' } } },
    ]),
    Transaction.aggregate([
      { $match: { createdAt: { $gte: todayStart, $lt: tomorrowStart } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          volume: { $sum: '$amount' },
          success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
        },
      },
    ]),
    Transaction.aggregate([
      { $match: { createdAt: { $gte: yesterdayStart, $lt: todayStart } } },
      {
        $group: {
          _id: null,
          count: { $sum: 1 },
          volume: { $sum: '$amount' },
          success: { $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] } },
        },
      },
    ]),
    Alert.countDocuments({ status: 'active' }),
  ]);

  const today = todayAgg[0] ?? { count: 0, volume: 0, success: 0 };
  const yesterday = yesterdayAgg[0] ?? { count: 0, volume: 0, success: 0 };
  const cash = cashAgg[0] ?? { total: 0, capacity: 0 };

  const todaySuccessRate = today.count ? (today.success / today.count) * 100 : 0;
  const yesterdaySuccessRate = yesterday.count
    ? (yesterday.success / yesterday.count) * 100
    : 0;

  return sendSuccess(
    res,
    {
      totalAtms,
      online,
      offline,
      maintenance,
      uptimePercentage: totalAtms
        ? Number(((online / totalAtms) * 100).toFixed(1))
        : 0,
      cash: {
        total: cash.total,
        capacity: cash.capacity,
        percentage: cash.capacity
          ? Number(((cash.total / cash.capacity) * 100).toFixed(1))
          : 0,
      },
      transactionsToday: {
        count: today.count,
        volume: today.volume,
        change: pctChange(today.count, yesterday.count),
        volumeChange: pctChange(today.volume, yesterday.volume),
      },
      successRate: {
        value: Number(todaySuccessRate.toFixed(1)),
        change: Number((todaySuccessRate - yesterdaySuccessRate).toFixed(1)),
      },
      activeAlerts,
    },
    'Dashboard summary'
  );
});

export const getTransactionOverview = asyncHandler(
  async (req: Request, res: Response) => {
    const days = Math.min(Number(req.query.days ?? 7) || 7, 30);
    const rangeStart = startOfDhakaDay(
      new Date(Date.now() - (days - 1) * DAY_MS)
    );

    const rows = await Transaction.aggregate([
      { $match: { createdAt: { $gte: rangeStart } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt',
              timezone: 'Asia/Dhaka',
            },
          },
          transactions: { $sum: 1 },
          successful: {
            $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
          },
          volume: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const map = new Map(rows.map((r) => [r._id as string, r]));
    const data: Array<Record<string, unknown>> = [];
    for (let i = 0; i < days; i += 1) {
      const day = new Date(rangeStart.getTime() + i * DAY_MS);
      const key = day.toISOString().slice(0, 10);
      const row = map.get(key);
      data.push({
        date: key,
        transactions: row?.transactions ?? 0,
        successful: row?.successful ?? 0,
        volume: row?.volume ?? 0,
      });
    }

    return sendSuccess(res, data, 'Transaction overview');
  }
);

export const getAtmStatusMap = asyncHandler(
  async (_req: Request, res: Response) => {
    const atms = await Atm.find()
      .select('atmId name area location status cash capacity lastService')
      .lean();
    return sendSuccess(res, atms, 'ATM status map');
  }
);

const cashLevel = (percentage: number): string => {
  if (percentage <= 10) return 'critical';
  if (percentage <= 25) return 'low';
  if (percentage <= 60) return 'medium';
  return 'healthy';
};

export const getCashAvailability = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit ?? 10) || 10, 50);
    const atms = await Atm.find()
      .select('atmId name area status cash capacity')
      .lean();

    const mapped = atms
      .map((atm) => {
        const percentage = atm.capacity
          ? Number(((atm.cash / atm.capacity) * 100).toFixed(1))
          : 0;
        return {
          id: atm._id,
          atmId: atm.atmId,
          name: atm.name,
          area: atm.area,
          status: atm.status,
          cash: atm.cash,
          capacity: atm.capacity,
          percentage,
          level: cashLevel(percentage),
        };
      })
      .sort((a, b) => a.percentage - b.percentage);

    const summary = {
      critical: mapped.filter((a) => a.level === 'critical').length,
      low: mapped.filter((a) => a.level === 'low').length,
      medium: mapped.filter((a) => a.level === 'medium').length,
      healthy: mapped.filter((a) => a.level === 'healthy').length,
    };

    const needsAttention = mapped
      .filter((a) => a.level === 'critical' || a.level === 'low')
      .slice(0, limit);

    return sendSuccess(
      res,
      { items: needsAttention, summary, total: mapped.length },
      'Cash availability'
    );
  }
);

export const getRecentTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const limit = Math.min(Number(req.query.limit ?? 8) || 8, 50);
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('atm', 'atmId name area')
      .lean();
    return sendSuccess(res, transactions, 'Recent transactions');
  }
);

export const getTopAtms = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit ?? 5) || 5, 20);
  const rangeStart = new Date(Date.now() - 6 * DAY_MS);
  rangeStart.setUTCHours(0, 0, 0, 0);

  const rows = await Transaction.aggregate([
    { $match: { createdAt: { $gte: rangeStart }, status: 'success' } },
    {
      $group: {
        _id: '$atm',
        transactions: { $sum: 1 },
        volume: { $sum: '$amount' },
      },
    },
    { $sort: { volume: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'atms',
        localField: '_id',
        foreignField: '_id',
        as: 'atm',
      },
    },
    { $unwind: '$atm' },
    {
      $project: {
        _id: 0,
        id: '$_id',
        atmId: '$atm.atmId',
        name: '$atm.name',
        area: '$atm.area',
        status: '$atm.status',
        transactions: 1,
        volume: 1,
      },
    },
  ]);

  return sendSuccess(res, rows, 'Top ATMs');
});

export const getAlerts = asyncHandler(async (req: Request, res: Response) => {
  const limit = Math.min(Number(req.query.limit ?? 5) || 5, 50);
  const alerts = await Alert.find({ status: { $ne: 'resolved' } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('atm', 'atmId name area')
    .lean();
  return sendSuccess(res, alerts, 'Recent alerts');
});
