import { DomainError } from '../domain/shared/DomainError';
import { AppError } from './AppError';

const CODE_TO_STATUS: Record<string, number> = {
  VALIDATION: 400,
  NOT_FOUND: 404,
  CONFLICT: 409,
  FORBIDDEN: 403,
  ILLEGAL_TRANSITION: 400,
  INSUFFICIENT_STOCK: 409,
  INVALID_DISCOUNT: 400,
  EMPTY_CART: 400,
};

export function domainToAppError(err: DomainError): AppError {
  const status = CODE_TO_STATUS[err.code] ?? 400;
  return new AppError(err.message, status, err.details);
}

export function toAppError(err: unknown): unknown {
  if (err instanceof DomainError) return domainToAppError(err);
  return err;
}
