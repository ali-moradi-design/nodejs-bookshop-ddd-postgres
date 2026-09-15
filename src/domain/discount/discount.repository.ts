import type { Discount, CreateDiscountInput, UpdateDiscountInput } from './discount.entity';

export interface IDiscountRepository {
  findById(id: string): Promise<Discount | null>;
  findByCode(code: string): Promise<Discount | null>;
  list(): Promise<Discount[]>;
  create(input: CreateDiscountInput): Promise<Discount>;
  update(id: string, input: UpdateDiscountInput): Promise<Discount | null>;
  softDelete(id: string): Promise<Discount | null>;
  incrementUsedCount(id: string): Promise<void>;
}
