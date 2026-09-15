import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/security/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from '../controllers/roles.controller';
import { createRoleSchema, updateRoleSchema, idParamSchema } from '../validators/roles.validation';

const router = Router();
router.use(authenticate);

router.get('/', requirePermission('roles:read'), ctrl.list);
router.get('/:id', requirePermission('roles:read'), validate({ params: idParamSchema }), ctrl.getById);
router.post('/', requirePermission('roles:create'), validate({ body: createRoleSchema }), ctrl.create);
router.patch('/:id', requirePermission('roles:update'), validate({ params: idParamSchema, body: updateRoleSchema }), ctrl.update);
router.delete('/:id', requirePermission('roles:delete'), validate({ params: idParamSchema }), ctrl.remove);

export default router;
