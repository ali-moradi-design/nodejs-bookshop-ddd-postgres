import { Router } from 'express';
import { authenticate, requirePermission, requireAnyPermission } from '../../middleware/security/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from '../controllers/orders.controller';
import { createOrderSchema, updateStatusSchema, idParamSchema } from '../validators/orders.validation';

const router = Router();
router.use(authenticate);

router.post('/', requirePermission('orders:create'), validate({ body: createOrderSchema }), ctrl.create);
router.get('/', requireAnyPermission('orders:read', 'orders:read-own'), ctrl.listMine);
router.get('/:id', requireAnyPermission('orders:read', 'orders:read-own'), validate({ params: idParamSchema }), ctrl.getById);
router.post('/:id/pay', requireAnyPermission('orders:create', 'orders:update-status'), validate({ params: idParamSchema }), ctrl.pay);
router.patch(
  '/:id/status',
  requirePermission('orders:update-status'),
  validate({ params: idParamSchema, body: updateStatusSchema }),
  ctrl.updateStatus,
);

export default router;
