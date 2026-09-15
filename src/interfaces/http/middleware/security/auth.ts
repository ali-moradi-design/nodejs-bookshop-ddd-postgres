import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../../../shared/AppError';
import { asyncHandler } from '../../../../shared/asyncHandler';
import { authContextService } from '../../../../infrastructure/composition';
import { hasAllPermissions, hasAnyPermission } from '../../../../domain/rbac/rules/hasPermission';

export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new AppError('Authentication required', 401);
  }
  const token = header.slice(7);
  req.user = await authContextService.fromAccessToken(token);
  next();
});

export function requirePermission(...required: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }
    if (!hasAllPermissions(req.user.permissions, required)) {
      next(new AppError('Forbidden: insufficient permissions', 403));
      return;
    }
    next();
  };
}

export function requireAnyPermission(...required: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required', 401));
      return;
    }
    if (!hasAnyPermission(req.user.permissions, required)) {
      next(new AppError('Forbidden: insufficient permissions', 403));
      return;
    }
    next();
  };
}
