import { Router } from 'express';
import * as transactionController from '../controllers/transactionController';
import { authorize, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTransactionSchema, transactionQuerySchema } from '../validators';

const router = Router();

router.use(protect);

router.get(
  '/',
  validate(transactionQuerySchema, 'query'),
  transactionController.listTransactions
);
router.get('/export', transactionController.exportTransactions);
router.get('/:id', transactionController.getTransaction);
router.post(
  '/',
  authorize('admin', 'manager', 'operator'),
  validate(createTransactionSchema),
  transactionController.createTransaction
);

export default router;
