export type DomainErrorCode =
  | 'VALIDATION'
  | 'NOT_FOUND'
  | 'CONFLICT'
  | 'FORBIDDEN'
  | 'ILLEGAL_TRANSITION'
  | 'INSUFFICIENT_STOCK'
  | 'INVALID_DISCOUNT'
  | 'EMPTY_CART';

/**
 * Domain-layer error (no HTTP status). Mapped to AppError / HTTP in error middleware.
 */
export class DomainError extends Error {
  public readonly code: DomainErrorCode;
  public readonly details?: unknown;

  constructor(message: string, code: DomainErrorCode = 'VALIDATION', details?: unknown) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'DomainError';
    Object.setPrototypeOf(this, DomainError.prototype);
  }
}
