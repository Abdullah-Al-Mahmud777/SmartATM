import { NextFunction, Request, Response, Router } from 'express';
import { env } from '../../config/env';
import { ApiError } from '../../utils/ApiError';
import { safeEqual } from '../../utils/security';
import { runPendingWithdrawalsJob } from './jobs.controller';

const router = Router();

function requireCronSecret(req: Request, _res: Response, next: NextFunction): void {
  const expected = env.cronSecret;
  if (!expected) {
    next(ApiError.forbidden('Cron secret is not configured on the server.'));
    return;
  }
  const header = req.get('authorization');
  const bearer = header?.startsWith('Bearer ') ? header.slice(7) : null;
  const provided = bearer ?? req.get('x-cron-secret');
  if (!provided || !safeEqual(provided, expected)) {
    next(ApiError.unauthorized('Invalid cron secret.'));
    return;
  }
  next();
}

router.get('/pending-withdrawals', requireCronSecret, runPendingWithdrawalsJob);
router.post('/pending-withdrawals', requireCronSecret, runPendingWithdrawalsJob);

export default router;
