import { Router } from 'express';
import { authenticate } from '../../middleware/security/auth';
import { validate } from '../../middleware/validate';
import * as ctrl from '../controllers/favorites.controller';
import { addFavoriteSchema, bookIdParamSchema } from '../validators/favorites.validation';

const router = Router();
router.use(authenticate);

router.get('/', ctrl.list);
router.post('/', validate({ body: addFavoriteSchema }), ctrl.add);
router.delete('/:bookId', validate({ params: bookIdParamSchema }), ctrl.remove);

export default router;
