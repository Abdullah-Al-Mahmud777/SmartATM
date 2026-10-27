import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { getDashboard } from './dashboard.controller';
import { dashboardQuerySchema } from './dashboard.schemas';

const router = Router();

router.get('/', requireAuth, validate({ query: dashboardQuerySchema }), getDashboard);

export default router;
