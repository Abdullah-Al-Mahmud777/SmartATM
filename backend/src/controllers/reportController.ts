import { Request, Response } from 'express';
import { Transaction } from '../models/Transaction';
import { Atm } from '../models/Atm';
import { asyncHandler } from '../utils/asyncHandler';
import { sendSuccess } from '../utils/response';

const periodToDays = (period?: string): number => {
  switch (period) {
    case '30d':
      return 30;
    case '90d':
      return 90;
    default:
      return 7;
  }
};

export const getReportOverview = asyncHandler(
  async (req: Request, res: Response) => {
    const period = String(req.query.period ?? '7d');
    const days = periodToDays(period);
    const start = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
    start.setUTCHours(0, 0, 0, 0);

    const [byType, byDay, totals, topAtms, statusDistribution] =
      await Promise.all([
        Transaction.aggregate([
          { $match: { createdAt: { $gte: start } } },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              volume: { $sum: '$amount' },
            },
          },
        ]),
        Transaction.aggregate([
          { $match: { createdAt: { $gte: start } } },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: '%Y-%m-%d',
                  date: '$createdAt',
                  timezone: 'Asia/Dhaka',
                },
              },
              count: { $sum: 1 },
              volume: { $sum: '$amount' },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Transaction.aggregate([
          { $match: { createdAt: { $gte: start } } },
          {
            $group: {
              _id: null,
              count: { $sum: 1 },
              volume: { $sum: '$amount' },
              success: {
                $sum: { $cond: [{ $eq: ['$status', 'success'] }, 1, 0] },
              },
              failed: {
                $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] },
              },
              pending: {
                $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
              },
            },
          },
        ]),
        Transaction.aggregate([
          { $match: { createdAt: { $gte: start }, status: 'success' } },
          {
            $group: {
              _id: '$atmCode',
              count: { $sum: 1 },
              volume: { $sum: '$amount' },
            },
          },
          { $sort: { volume: -1 } },
          { $limit: 10 },
        ]),
        Atm.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      ]);

    const total = totals[0] ?? {
      count: 0,
      volume: 0,
      success: 0,
      failed: 0,
      pending: 0,
    };

    return sendSuccess(
      res,
      {
        period,
        days,
        totals: {
          count: total.count,
          volume: total.volume,
          success: total.success,
          failed: total.failed,
          pending: total.pending,
          successRate: total.count
            ? Number(((total.success / total.count) * 100).toFixed(1))
            : 0,
          averagePerDay: Number((total.count / days).toFixed(1)),
        },
        byType,
        byDay,
        topAtms,
        statusDistribution: statusDistribution.reduce(
          (acc, cur) => ({ ...acc, [cur._id]: cur.count }),
          {}
        ),
      },
      'Report overview'
    );
  }
);
