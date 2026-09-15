import { Router } from 'express';
import { validate } from '../../middleware/validate';
import { authRateLimiter } from '../../middleware/security/rate-limit';
import * as ctrl from '../controllers/auth.controller';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  logoutSchema,
} from '../validators/auth.validation';
import { env } from '../../../../infrastructure/config/env';



const router = Router();

if (env.NODE_ENV !== 'test') {
  router.use(authRateLimiter);
}

router.post('/register', validate({ body: registerSchema }), ctrl.register);
router.post('/login', validate({ body: loginSchema }), ctrl.login);
router.post('/refresh', validate({ body: refreshSchema }), ctrl.refresh);
router.post('/logout', validate({ body: logoutSchema }), ctrl.logout);

export default router;
