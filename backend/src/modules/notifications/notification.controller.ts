import { Request, Response } from 'express';
import { Notification } from '../../models/notification.model';
import { ApiError } from '../../utils/ApiError';
import { asyncHandler } from '../../utils/asyncHandler';
import { sendSuccess } from '../../utils/response';
import { serializeNotification } from '../../utils/serializers';

export const listNotifications = asyncHandler(async (req: Request, res: Response) => {
  const { page, limit, unreadOnly } = req.query as unknown as {
    page: number;
    limit: number;
    unreadOnly?: boolean;
  };
  const filter = {
    userId: req.user!.id,
    ...(unreadOnly ? { isRead: false } : {}),
  };

  const [notifications, total, unread] = await Promise.all([
    Notification.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
    Notification.countDocuments(filter),
    Notification.countDocuments({ userId: req.user!.id, isRead: false }),
  ]);

  sendSuccess(res, notifications.map(serializeNotification), 'Notifications loaded', 200, {
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
    unread,
  });
});

export const markNotificationRead = asyncHandler(async (req: Request, res: Response) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user!.id },
    { $set: { isRead: true, readAt: new Date() } },
    { new: true }
  );

  if (!notification) throw ApiError.notFound('Notification not found.');
  sendSuccess(res, serializeNotification(notification), 'Notification marked as read');
});

export const markAllNotificationsRead = asyncHandler(async (req: Request, res: Response) => {
  const result = await Notification.updateMany(
    { userId: req.user!.id, isRead: false },
    { $set: { isRead: true, readAt: new Date() } }
  );

  sendSuccess(res, { updated: result.modifiedCount }, 'Notifications marked as read');
});
