import { Router } from 'express';
import * as alertController from '../controllers/alertController';
import { authorize, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { alertQuerySchema, createAlertSchema, updateAlertSchema } from '../validators';

const router = Router();

router.use(protect);

router.get('/', validate(alertQuerySchema, 'query'), alertController.listAlerts);
router.get('/stats', alertController.getAlertStats);
router.get('/:id', alertController.getAlert);
router.post(
  '/',
  authorize('admin', 'manager'),
  validate(createAlertSchema),
  alertController.createAlert
);
router.patch(
  '/:id',
  validate(updateAlertSchema),
  alertController.updateAlert
);
router.delete('/:id', authorize('admin', 'manager'), alertController.deleteAlert);

export default router;
