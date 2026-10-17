import { Router } from 'express';
import * as cashController from '../controllers/cashController';
import { authorize, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { refillSchema } from '../validators';

const router = Router();

router.use(protect);

router.get('/overview', cashController.getCashOverview);
router.get('/low', cashController.getCashAlerts);
router.post(
  '/:id/refill',
  authorize('admin', 'manager'),
  validate(refillSchema),
  cashController.refillAtm
);
router.post(
  '/:id/adjust',
  authorize('admin', 'manager'),
  cashController.adjustCash
);

export default router;
