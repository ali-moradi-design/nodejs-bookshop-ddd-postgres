import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/security/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from '../controllers/permissions.controller';
import {
  createPermissionSchema,
  updatePermissionSchema,
  idParamSchema,
} from '../validators/permissions.validation';

const router = Router();

router.use(authenticate);

router.get('/', requirePermission('permissions:read'), ctrl.list);
router.get('/:id', requirePermission('permissions:read'), validate({ params: idParamSchema }), ctrl.getById);
router.post('/', requirePermission('permissions:create'), validate({ body: createPermissionSchema }), ctrl.create);
router.patch('/:id', requirePermission('permissions:update'), validate({ params: idParamSchema, body: updatePermissionSchema }), ctrl.update);
router.delete('/:id', requirePermission('permissions:delete'), validate({ params: idParamSchema }), ctrl.remove);

export default router;
