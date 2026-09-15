import type { IDiscountRepository } from '../../domain/discount/discount.repository';
import type {
  Discount,
  CreateDiscountInput,
  UpdateDiscountInput,
} from '../../domain/discount/discount.entity';
import { DomainError } from '../../domain/shared/DomainError';
import {
  assertDiscountApplicable,
  assertPercentValue,
  calculateDiscountAmount,
  normalizeDiscountCode,
} from '../../domain/discount/rules/calculate';

export class DiscountService {
  constructor(private readonly discounts: IDiscountRepository) {}

  async list(): Promise<Discount[]> {
    return this.discounts.list();
  }

  async getById(id: string): Promise<Discount> {
    const d = await this.discounts.findById(id);
    if (!d) throw new DomainError('Discount not found', 'NOT_FOUND');
    return d;
  }

  async create(input: CreateDiscountInput): Promise<Discount> {
    const code = normalizeDiscountCode(input.code);
    const existing = await this.discounts.findByCode(code);
    if (existing) throw new DomainError('Discount code already exists', 'CONFLICT');
    if (input.type === 'percent') assertPercentValue(input.value);
    return this.discounts.create({ ...input, code });
  }

  async update(id: string, input: UpdateDiscountInput): Promise<Discount> {
    if (input.code) {
      const code = normalizeDiscountCode(input.code);
      const existing = await this.discounts.findByCode(code);
      if (existing && existing.id !== id) {
        throw new DomainError('Discount code already exists', 'CONFLICT');
      }
      input = { ...input, code };
    }
    if (input.type === 'percent' && input.value !== undefined) {
      assertPercentValue(input.value);
    }
    const d = await this.discounts.update(id, input);
    if (!d) throw new DomainError('Discount not found', 'NOT_FOUND');
    return d;
  }

  async remove(id: string): Promise<void> {
    const d = await this.discounts.softDelete(id);
    if (!d) throw new DomainError('Discount not found', 'NOT_FOUND');
  }

  async computeDiscount(
    code: string | undefined,
    subtotal: number,
  ): Promise<{ discount: Discount | null; discountAmount: number }> {
    if (!code) return { discount: null, discountAmount: 0 };

    const normalized = normalizeDiscountCode(code);
    const discount = await this.discounts.findByCode(normalized);
    if (!discount) throw new DomainError('Invalid discount code', 'INVALID_DISCOUNT');

    assertDiscountApplicable(discount, subtotal);
    const discountAmount = calculateDiscountAmount(discount, subtotal);
    return { discount, discountAmount };
  }

  async recordUse(discountId: string): Promise<void> {
    await this.discounts.incrementUsedCount(discountId);
  }
}
