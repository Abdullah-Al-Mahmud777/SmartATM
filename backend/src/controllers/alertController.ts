import { Request, Response } from 'express';
import { Alert } from '../models/Alert';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { buildMeta, sendSuccess } from '../utils/response';

export const listAlerts = asyncHandler(async (req: Request, res: Response) => {
  const page = Number(req.query.page ?? 1) || 1;
  const limit = Math.min(Number(req.query.limit ?? 20) || 20, 200);
  const skip = (page - 1) * limit;

  const filter: Record<string, unknown> = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.severity) filter.severity = req.query.severity;
  if (req.query.type) filter.type = req.query.type;

  const [items, total] = await Promise.all([
    Alert.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('atm', 'atmId name area')
      .lean(),
    Alert.countDocuments(filter),
  ]);

  return sendSuccess(res, items, 'Alerts', buildMeta(total, page, limit));
});

export const getAlertStats = asyncHandler(async (_req: Request, res: Response) => {
  const [bySeverity, byStatus, byType] = await Promise.all([
    Alert.aggregate([{ $group: { _id: '$severity', count: { $sum: 1 } } }]),
    Alert.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    Alert.aggregate([
      { $match: { status: { $ne: 'resolved' } } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
    ]),
  ]);
  const reduce = (rows: Array<{ _id: string; count: number }>) =>
    rows.reduce((acc, cur) => ({ ...acc, [cur._id]: cur.count }), {});
  return sendSuccess(
    res,
    {
      bySeverity: reduce(bySeverity),
      byStatus: reduce(byStatus),
      byType: reduce(byType),
    },
    'Alert statistics'
  );
});

export const getAlert = asyncHandler(async (req: Request, res: Response) => {
  const alert = await Alert.findById(req.params.id).populate('atm', 'atmId name area');
  if (!alert) throw ApiError.notFound('Alert not found');
  return sendSuccess(res, alert, 'Alert');
});

export const createAlert = asyncHandler(async (req: Request, res: Response) => {
  const alert = await Alert.create(req.body);
  return sendSuccess(res, alert, 'Alert created', undefined, 201);
});

export const updateAlert = asyncHandler(async (req: Request, res: Response) => {
  const update: Record<string, unknown> = { status: req.body.status };
  if (req.body.status === 'acknowledged' && req.user) {
    update.acknowledgedBy = req.user._id;
  }
  if (req.body.status === 'resolved') {
    update.resolvedAt = new Date();
    if (req.user) update.acknowledgedBy = req.user._id;
  }
  const alert = await Alert.findByIdAndUpdate(req.params.id, update, {
    new: true,
    runValidators: true,
  }).populate('atm', 'atmId name area');
  if (!alert) throw ApiError.notFound('Alert not found');
  return sendSuccess(res, alert, 'Alert updated');
});

export const deleteAlert = asyncHandler(async (req: Request, res: Response) => {
  const alert = await Alert.findByIdAndDelete(req.params.id);
  if (!alert) throw ApiError.notFound('Alert not found');
  return sendSuccess(res, null, 'Alert deleted');
});
