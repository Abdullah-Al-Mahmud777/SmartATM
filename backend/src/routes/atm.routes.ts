import { Router } from 'express';
import * as atmController from '../controllers/atmController';
import { authorize, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createAtmSchema, updateAtmSchema } from '../validators';

const router = Router();

router.use(protect);

router.get('/', atmController.listAtms);
router.get('/stats', atmController.getAtmStats);
router.get('/:id', atmController.getAtm);
router.post(
  '/',
  authorize('admin', 'manager'),
  validate(createAtmSchema),
  atmController.createAtm
);
router.put(
  '/:id',
  authorize('admin', 'manager'),
  validate(updateAtmSchema),
  atmController.updateAtm
);
router.delete('/:id', authorize('admin'), atmController.deleteAtm);

export default router;
