import { NextFunction, Request, Response, Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { moneyOperationLimiter, pinLimiter } from '../../middleware/rateLimit';
import { validate } from '../../middleware/validate';
import {
  cancelWithdrawal,
  deposit,
  exchange,
  getBalance,
  getExchangeRates,
  transfer,
  withdraw,
} from './banking.controller';
import {
  cancelTransactionParamSchema,
  depositSchema,
  exchangeSchema,
  transferSchema,
  withdrawSchema,
} from './banking.schemas';

const router = Router();

function noStore(_req: Request, res: Response, next: NextFunction): void {
  res.setHeader('Cache-Control', 'no-store');
  next();
}

router.use(requireAuth);
router.use(noStore);

router.get('/balance', getBalance);
router.get('/exchange/rates', getExchangeRates);
router.post(
  '/deposit',
  moneyOperationLimiter,
  validate({ body: depositSchema }),
  deposit
);
router.post(
  '/withdraw',
  moneyOperationLimiter,
  pinLimiter,
  validate({ body: withdrawSchema }),
  withdraw
);
router.post(
  '/transfer',
  moneyOperationLimiter,
  pinLimiter,
  validate({ body: transferSchema }),
  transfer
);
router.post(
  '/exchange',
  moneyOperationLimiter,
  pinLimiter,
  validate({ body: exchangeSchema }),
  exchange
);
router.post(
  '/transactions/:id/cancel',
  moneyOperationLimiter,
  validate({ params: cancelTransactionParamSchema }),
  cancelWithdrawal
);

export default router;
