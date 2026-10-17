import { Router } from 'express';
import * as settingsController from '../controllers/settingsController';
import { authorize, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { settingsSchema } from '../validators';

const router = Router();

router.use(protect);

router.get('/', settingsController.getSettings);
router.put(
  '/',
  authorize('admin', 'manager'),
  validate(settingsSchema),
  settingsController.updateSettings
);

export default router;
