import { Router } from 'express';
import { authenticate, requirePermission } from '../../middleware/security/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from '../controllers/books.controller';
import {
  createBookSchema,
  updateBookSchema,
  idParamSchema,
  listBooksQuerySchema,
} from '../validators/books.validation';

const router = Router();

router.get('/featured', ctrl.listFeatured);
router.get('/', validate({ query: listBooksQuerySchema }), ctrl.list);
router.get('/:id', validate({ params: idParamSchema }), ctrl.getById);

router.post('/', authenticate, requirePermission('books:create'), validate({ body: createBookSchema }), ctrl.create);
router.patch('/:id', authenticate, requirePermission('books:update'), validate({ params: idParamSchema, body: updateBookSchema }), ctrl.update);
router.delete('/:id', authenticate, requirePermission('books:delete'), validate({ params: idParamSchema }), ctrl.remove);

export default router;
