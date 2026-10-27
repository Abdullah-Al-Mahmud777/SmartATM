import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import {
  downloadStatement,
  getAccount,
  getAccountTransactions,
  listAccounts,
} from './account.controller';
import {
  accountIdParamSchema,
  statementQuerySchema,
  transactionQuerySchema,
} from './account.schemas';

const router = Router();

router.use(requireAuth);

router.get('/', listAccounts);
router.get('/:id', validate({ params: accountIdParamSchema }), getAccount);
router.get(
  '/:id/transactions',
  validate({ params: accountIdParamSchema, query: transactionQuerySchema }),
  getAccountTransactions
);
router.get(
  '/:id/statement',
  validate({ params: accountIdParamSchema, query: statementQuerySchema }),
  downloadStatement
);

export default router;
