import { Router } from 'express';
import { sweepExpiredPendingWithdrawals } from '../../jobs/completePendingWithdrawals';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { listAllTransactions } from '../accounts/account.controller';
import { globalTransactionQuerySchema } from '../accounts/account.schemas';

const router = Router();

router.use(requireAuth);
// Runs the pending-withdrawal completion sweep on demand (node-cron does not
// run on serverless). Throttled in-memory to at most one run per 30s per instance.
router.get(
  '/',
  sweepExpiredPendingWithdrawals,
  validate({ query: globalTransactionQuerySchema }),
  listAllTransactions
);

export default router;
