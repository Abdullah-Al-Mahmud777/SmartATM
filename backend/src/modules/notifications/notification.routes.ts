import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from './notification.controller';
import {
  notificationIdParamSchema,
  notificationQuerySchema,
} from './notification.schemas';

const router = Router();

router.use(requireAuth);

router.get('/', validate({ query: notificationQuerySchema }), listNotifications);
router.post('/read-all', markAllNotificationsRead);
router.post(
  '/:id/read',
  validate({ params: notificationIdParamSchema }),
  markNotificationRead
);

export default router;
