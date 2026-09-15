import type { IDiscountRepository } from '../../../domain/discount/discount.repository';
import type {
  Discount,
  CreateDiscountInput,
  UpdateDiscountInput,
} from '../../../domain/discount/discount.entity';
import { getPrisma } from './client';
import { mapDiscount } from './mappers';

export class PrismaDiscountRepository implements IDiscountRepository {
  async findById(id: string): Promise<Discount | null> {
    const row = await getPrisma().discount.findFirst({ where: { id, deletedAt: null } });
    return row ? mapDiscount(row) : null;
  }

  async findByCode(code: string): Promise<Discount | null> {
    const row = await getPrisma().discount.findFirst({
      where: { code: code.toUpperCase(), deletedAt: null },
    });
    return row ? mapDiscount(row) : null;
  }

  async list(): Promise<Discount[]> {
    const rows = await getPrisma().discount.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map(mapDiscount);
  }

  async create(input: CreateDiscountInput): Promise<Discount> {
    const row = await getPrisma().discount.create({
      data: {
        code: input.code.toUpperCase(),
        type: input.type,
        value: input.value,
        minOrderAmount: input.minOrderAmount,
        maxUses: input.maxUses,
        startsAt: input.startsAt ?? null,
        endsAt: input.endsAt ?? null,
        usedCount: 0,
        isActive: input.isActive ?? true,
      },
    });
    return mapDiscount(row);
  }

  async update(id: string, input: UpdateDiscountInput): Promise<Discount | null> {
    try {
      const row = await getPrisma().discount.update({
        where: { id },
        data: {
          ...(input.code !== undefined ? { code: input.code.toUpperCase() } : {}),
          ...(input.type !== undefined ? { type: input.type } : {}),
          ...(input.value !== undefined ? { value: input.value } : {}),
          ...(input.minOrderAmount !== undefined ? { minOrderAmount: input.minOrderAmount } : {}),
          ...(input.maxUses !== undefined ? { maxUses: input.maxUses } : {}),
          ...(input.startsAt !== undefined ? { startsAt: input.startsAt } : {}),
          ...(input.endsAt !== undefined ? { endsAt: input.endsAt } : {}),
          ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
        },
      });
      if (row.deletedAt) return null;
      return mapDiscount(row);
    } catch {
      return null;
    }
  }

  async softDelete(id: string): Promise<Discount | null> {
    try {
      const row = await getPrisma().discount.update({
        where: { id },
        data: { deletedAt: new Date(), isActive: false },
      });
      return mapDiscount(row);
    } catch {
      return null;
    }
  }

  async incrementUsedCount(id: string): Promise<void> {
    await getPrisma().discount.update({
      where: { id },
      data: { usedCount: { increment: 1 } },
    });
  }
}
