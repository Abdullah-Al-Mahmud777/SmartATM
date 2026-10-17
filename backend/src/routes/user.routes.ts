import { Router } from 'express';
import * as userController from '../controllers/userController';
import { authorize, protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createUserSchema, updateUserSchema } from '../validators';

const router = Router();

router.use(protect, authorize('admin', 'manager'));

router.get('/', userController.listUsers);
router.get('/:id', userController.getUser);
router.post(
  '/',
  authorize('admin'),
  validate(createUserSchema),
  userController.createUser
);
router.put(
  '/:id',
  authorize('admin'),
  validate(updateUserSchema),
  userController.updateUser
);
router.delete('/:id', authorize('admin'), userController.deleteUser);

export default router;
