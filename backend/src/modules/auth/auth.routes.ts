import { Router } from 'express';
import { requireAuth } from '../../middleware/auth';
import {
  loginLimiter,
  passwordResetLimiter,
  registerLimiter,
} from '../../middleware/rateLimit';
import { validate } from '../../middleware/validate';
import {
  getCsrfToken,
  getRecoveryQuestion,
  getSecurityQuestions,
  getSessionStatus,
  login,
  logout,
  me,
  refresh,
  register,
  resetPassword,
} from './auth.controller';
import {
  loginSchema,
  recoveryQuestionSchema,
  registerSchema,
  resetPasswordSchema,
} from './auth.schemas';

const router = Router();

router.get('/csrf', getCsrfToken);
router.get('/security-questions', getSecurityQuestions);
router.get('/session', getSessionStatus);
router.post('/register', registerLimiter, validate({ body: registerSchema }), register);
router.post('/login', loginLimiter, validate({ body: loginSchema }), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.get(
  '/recovery/question',
  passwordResetLimiter,
  validate({ query: recoveryQuestionSchema }),
  getRecoveryQuestion
);
router.post(
  '/recovery/reset',
  passwordResetLimiter,
  validate({ body: resetPasswordSchema }),
  resetPassword
);

export default router;
