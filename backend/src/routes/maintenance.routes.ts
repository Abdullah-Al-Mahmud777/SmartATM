import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenanceController';
import { authorize, protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/', maintenanceController.listMaintenance);
router.post(
  '/',
  authorize('admin', 'manager'),
  maintenanceController.createMaintenance
);
router.put(
  '/:id',
  authorize('admin', 'manager'),
  maintenanceController.updateMaintenance
);
router.delete(
  '/:id',
  authorize('admin'),
  maintenanceController.deleteMaintenance
);

export default router;
