import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { listAllTransactions } from '../accounts/account.controller';
import { globalTransactionQuerySchema } from '../accounts/account.schemas';

const router = Router();

router.use(requireAuth);
router.get('/', validate({ query: globalTransactionQuerySchema }), listAllTransactions);

export default router;
