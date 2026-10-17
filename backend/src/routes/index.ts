import { Router } from 'express';
import authRoutes from './auth.routes';
import dashboardRoutes from './dashboard.routes';
import atmRoutes from './atm.routes';
import transactionRoutes from './transaction.routes';
import cashRoutes from './cash.routes';
import alertRoutes from './alert.routes';
import reportRoutes from './report.routes';
import userRoutes from './user.routes';
import settingsRoutes from './settings.routes';
import maintenanceRoutes from './maintenance.routes';

const router = Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, data: { status: 'ok' }, message: 'Healthy' });
});

router.use('/auth', authRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/atms', atmRoutes);
router.use('/transactions', transactionRoutes);
router.use('/cash', cashRoutes);
router.use('/alerts', alertRoutes);
router.use('/reports', reportRoutes);
router.use('/users', userRoutes);
router.use('/settings', settingsRoutes);
router.use('/maintenance', maintenanceRoutes);

export default router;
