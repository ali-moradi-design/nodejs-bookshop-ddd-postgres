import { Router } from 'express';
import { authenticate, requirePermission, requireAnyPermission } from '../../middleware/security/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from '../controllers/users.controller';
import {
  createUserSchema,
  updateUserSchema,
  updateOwnSchema,
  idParamSchema,
} from '../validators/users.validation';

const router = Router();
router.use(authenticate);

router.get('/me', requireAnyPermission('users:read-own', 'users:read'), ctrl.getMe);
router.get('/', requirePermission('users:read'), ctrl.list);
router.get('/:id', requireAnyPermission('users:read', 'users:read-own'), validate({ params: idParamSchema }), ctrl.getById);
router.post('/', requirePermission('users:create'), validate({ body: createUserSchema }), ctrl.create);
router.patch(
  '/:id',
  requireAnyPermission('users:update', 'users:update-own'),
  validate({ params: idParamSchema, body: updateUserSchema.or(updateOwnSchema) }),
  ctrl.update,
);
router.delete('/:id', requirePermission('users:delete'), validate({ params: idParamSchema }), ctrl.remove);

export default router;
