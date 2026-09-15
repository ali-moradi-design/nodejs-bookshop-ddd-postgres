import { describe, expect, it } from 'vitest';
import { Money } from '../../../src/domain/shared/Money';
import { normalizeEmail } from '../../../src/domain/shared/Email';
import { normalizeIsbn, isValidIsbn } from '../../../src/domain/shared/Isbn';
import { DomainError } from '../../../src/domain/shared/DomainError';

describe('value helpers', () => {
  it('Money rounds and subtracts', () => {
    expect(Money.of(10.125).amount).toBe(10.13);
    expect(Money.of(10).subtract(Money.of(3)).amount).toBe(7);
  });

  it('Email / ISBN', () => {
    expect(normalizeEmail('  A@B.COM ')).toBe('a@b.com');
    expect(() => normalizeEmail('bad')).toThrow(DomainError);
    expect(isValidIsbn('978-0-13-235088-4')).toBe(true);
    expect(normalizeIsbn('9780132350884')).toBe('9780132350884');
  });
});
