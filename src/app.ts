import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { env } from './infrastructure/config/env';
import { openApiSpec } from './interfaces/http/docs/openapi';
import { errorHandler, notFoundHandler } from './interfaces/http/middleware/errorHandler';
import { requestIdMiddleware } from './interfaces/http/middleware/requestId';
import { globalRateLimiter } from './interfaces/http/middleware/security/rate-limit';
import apiV1Routes from './interfaces/http/v1/routes';

const app = express();

app.use(requestIdMiddleware);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((s) => s.trim()),
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

if (env.NODE_ENV !== 'test') {
  app.use(globalRateLimiter);
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
app.get('/api/docs.json', (_req, res) => {
  res.json(openApiSpec);
});

app.use('/uploads', express.static(env.UPLOAD_DIR_ABS));

app.use('/api/v1', apiV1Routes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
