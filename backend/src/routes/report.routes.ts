import { Router } from 'express';
import * as reportController from '../controllers/reportController';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { reportQuerySchema } from '../validators';

const router = Router();

router.use(protect);

router.get(
  '/overview',
  validate(reportQuerySchema, 'query'),
  reportController.getReportOverview
);

export default router;
