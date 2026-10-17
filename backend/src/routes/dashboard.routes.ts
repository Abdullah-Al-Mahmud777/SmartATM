import { Router } from 'express';
import * as dashboardController from '../controllers/dashboardController';
import { protect } from '../middleware/auth';

const router = Router();

router.use(protect);

router.get('/summary', dashboardController.getSummary);
router.get('/transaction-overview', dashboardController.getTransactionOverview);
router.get('/atm-status-map', dashboardController.getAtmStatusMap);
router.get('/cash-availability', dashboardController.getCashAvailability);
router.get('/recent-transactions', dashboardController.getRecentTransactions);
router.get('/top-atms', dashboardController.getTopAtms);
router.get('/alerts', dashboardController.getAlerts);

export default router;
