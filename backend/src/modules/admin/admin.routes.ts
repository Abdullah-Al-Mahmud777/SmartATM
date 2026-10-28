import { Router } from 'express';
import { requireAdmin, requireSuperAdmin } from '../../middleware/adminAuth';
import { adminLimiter, adminLoginLimiter } from '../../middleware/rateLimit';
import { validate } from '../../middleware/validate';
import {
  adminChangePassword,
  adminLogin,
  adminLogout,
  adminRefresh,
  getAdminMe,
  getAdminOverview,
  getAdminSettings,
  updateAdminSettings,
} from './admin.controller';
import {
  adminLoginSchema,
  adminSettingsSchema,
  changePasswordSchema,
} from './admin.schemas';

const router = Router();

router.use(adminLimiter);

router.post('/auth/login', adminLoginLimiter, validate({ body: adminLoginSchema }), adminLogin);
router.post('/auth/logout', requireAdmin, adminLogout);
router.post('/auth/refresh', requireAdmin, adminRefresh);
router.post('/auth/change-password', requireAdmin, validate({ body: changePasswordSchema }), adminChangePassword);
router.get('/me', requireAdmin, getAdminMe);
router.get('/overview', requireAdmin, getAdminOverview);
router.get('/settings', requireAdmin, requireSuperAdmin, getAdminSettings);
router.put('/settings', requireAdmin, requireSuperAdmin, validate({ body: adminSettingsSchema }), updateAdminSettings);

export default router;
