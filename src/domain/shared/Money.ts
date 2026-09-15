import { DomainError } from './DomainError';

/** Pragmatic money helper (minor-unit rounding to 2 decimals). */
export class Money {
  readonly amount: number;
  readonly currency: string;

  private constructor(amount: number, currency: string) {
    this.amount = amount;
    this.currency = currency;
  }

  static of(amount: number, currency = 'USD'): Money {
    if (!Number.isFinite(amount) || amount < 0) {
      throw new DomainError('Money amount must be a non-negative finite number', 'VALIDATION');
    }
    return new Money(Money.round(amount), currency.toUpperCase());
  }

  static round(n: number): number {
    return Math.round(n * 100) / 100;
  }

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.of(this.amount + other.amount, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return Money.of(Math.max(0, this.amount - other.amount), this.currency);
  }

  multiply(qty: number): Money {
    if (!Number.isFinite(qty) || qty < 0) {
      throw new DomainError('Quantity must be a non-negative finite number', 'VALIDATION');
    }
    return Money.of(this.amount * qty, this.currency);
  }

  private assertSameCurrency(other: Money): void {
    if (this.currency !== other.currency) {
      throw new DomainError(`Currency mismatch: ${this.currency} vs ${other.currency}`, 'VALIDATION');
    }
  }
}
