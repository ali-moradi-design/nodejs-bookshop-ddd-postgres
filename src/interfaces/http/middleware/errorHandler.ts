import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../../../shared/AppError';
import { DomainError } from '../../../domain/shared/DomainError';
import { domainToAppError } from '../../../shared/mapDomainError';
import { env } from '../../../infrastructure/config/env';
import { logger } from '../../../infrastructure/logging/logger';

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const requestId = req.requestId;

  if (err instanceof ZodError) {
    res.status(400).json({
      message: 'Validation failed',
      errors: err.flatten(),
      ...(requestId ? { requestId } : {}),
    });
    return;
  }

  const appErr = err instanceof DomainError ? domainToAppError(err) : err;

  if (appErr instanceof AppError) {
    res.status(appErr.statusCode).json({
      message: appErr.message,
      ...(appErr.errors !== undefined ? { errors: appErr.errors } : {}),
      ...(requestId ? { requestId } : {}),
    });
    return;
  }

  if (
    typeof appErr === 'object' &&
    appErr !== null &&
    'code' in appErr &&
    (appErr as { code: number }).code === 11000
  ) {
    res.status(409).json({
      message: 'Duplicate key',
      errors: (appErr as { keyValue?: unknown }).keyValue,
      ...(requestId ? { requestId } : {}),
    });
    return;
  }

  logger.error('unhandled_error', {
    requestId,
    err: appErr instanceof Error ? appErr.message : String(appErr),
    stack: appErr instanceof Error ? appErr.stack : undefined,
  });

  res.status(500).json({
    message: 'Internal server error',
    ...(requestId ? { requestId } : {}),
    ...(env.NODE_ENV === 'development' && appErr instanceof Error
      ? { errors: appErr.message }
      : {}),
  });
}
