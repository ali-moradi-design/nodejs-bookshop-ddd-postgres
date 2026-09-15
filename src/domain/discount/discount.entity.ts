export const DISCOUNT_TYPES = ['percent', 'fixed'] as const;
export type DiscountType = (typeof DISCOUNT_TYPES)[number];

export interface Discount {
  id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  isActive: boolean;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDiscountInput {
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  startsAt?: Date | null;
  endsAt?: Date | null;
  isActive?: boolean;
}

export type UpdateDiscountInput = Partial<CreateDiscountInput>;
