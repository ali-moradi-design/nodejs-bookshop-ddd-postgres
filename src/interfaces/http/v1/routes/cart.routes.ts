import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/security/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from '../controllers/cart.controller';
import {
  addCartItemSchema,
  updateCartItemSchema,
  bookIdParamSchema,
  checkoutSchema,
} from '../validators/cart.validation';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.get);
router.post('/items', validate({ body: addCartItemSchema }), ctrl.addItem);
router.patch(
  '/items/:bookId',
  validate({ params: bookIdParamSchema, body: updateCartItemSchema }),
  ctrl.updateItem,
);
router.delete('/items/:bookId', validate({ params: bookIdParamSchema }), ctrl.removeItem);
router.delete('/', ctrl.clear);
router.post(
  '/checkout',
  requirePermission('orders:create'),
  validate({ body: checkoutSchema }),
  ctrl.checkout,
);

export default router;
