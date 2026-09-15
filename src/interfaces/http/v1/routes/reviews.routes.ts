import { Router } from 'express';
import { authenticate, requirePermission, requireAnyPermission } from '../../middleware/security/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from '../controllers/reviews.controller';
import {
  createReviewSchema,
  updateReviewSchema,
  idParamSchema,
  listReviewsQuerySchema,
} from '../validators/reviews.validation';

const router = Router();

router.get('/', validate({ query: listReviewsQuerySchema }), ctrl.list);
router.get('/:id', validate({ params: idParamSchema }), ctrl.getById);

router.post('/', authenticate, requirePermission('reviews:create'), validate({ body: createReviewSchema }), ctrl.create);
router.patch(
  '/:id',
  authenticate,
  requireAnyPermission('reviews:update', 'reviews:update-own'),
  validate({ params: idParamSchema, body: updateReviewSchema }),
  ctrl.update,
);
router.delete(
  '/:id',
  authenticate,
  requireAnyPermission('reviews:delete', 'reviews:delete-own'),
  validate({ params: idParamSchema }),
  ctrl.remove,
);

export default router;
