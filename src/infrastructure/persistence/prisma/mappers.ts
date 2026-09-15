import type { Book } from '../../../domain/book/book.entity';
import type { User } from '../../../domain/user/user.entity';
import type { Order, OrderItem, OrderStatus, Payment, ShippingAddress, StatusHistory } from '../../../domain/order/order.entity';
import type { Review } from '../../../domain/review/review.entity';
import type { Permission } from '../../../domain/rbac/permission.entity';
import type { Role } from '../../../domain/rbac/role.entity';
import type { IssueReport } from '../../../domain/report/report.entity';
import type { RefreshTokenRecord } from '../../../domain/auth/auth.types';
import type { Cart } from '../../../domain/cart/cart.entity';
import type { Favorite } from '../../../domain/favorite/favorite.entity';
import type { Discount } from '../../../domain/discount/discount.entity';
import type {
  Book as PrismaBook,
  User as PrismaUser,
  Permission as PrismaPermission,
  Role as PrismaRole,
  Review as PrismaReview,
  Discount as PrismaDiscount,
  IssueReport as PrismaIssue,
  RefreshToken as PrismaRefresh,
  Cart as PrismaCart,
  CartItem as PrismaCartItem,
  Favorite as PrismaFavorite,
  Order as PrismaOrder,
  OrderItem as PrismaOrderItem,
} from '@prisma/client';

export function mapBook(row: PrismaBook): Book {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description,
    isbn: row.isbn ?? undefined,
    price: row.price,
    currency: row.currency,
    stock: row.stock,
    coverImageUrl: row.coverImageUrl ?? undefined,
    categories: row.categories,
    featured: row.featured,
    featuredOrder: row.featuredOrder,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type UserWithRoles = PrismaUser & {
  roles?: { roleId: string; role?: PrismaRole & { permissions?: { permission: PrismaPermission }[] } }[];
};

export function mapUser(row: UserWithRoles, opts?: { populateRoles?: boolean }): User & { rolesPopulated?: unknown } {
  const roleIds = (row.roles ?? []).map((r) => r.roleId);
  const user: User & { rolesPopulated?: unknown } = {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.passwordHash,
    roles: roleIds,
    isActive: row.isActive,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  if (opts?.populateRoles) {
    user.rolesPopulated = (row.roles ?? [])
      .map((r) => r.role)
      .filter(Boolean)
      .map((role) => ({
        id: role!.id,
        name: role!.name,
        description: role!.description ?? undefined,
        permissions: (role!.permissions ?? []).map((p) => p.permission.id),
        createdAt: role!.createdAt,
        updatedAt: role!.updatedAt,
      }));
  }
  return user;
}

export function mapPermission(row: PrismaPermission): Permission {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description ?? undefined,
    section: row.section,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type RoleWithPerms = PrismaRole & {
  permissions?: { permissionId: string; permission?: PrismaPermission }[];
};

export function mapRole(row: RoleWithPerms, populate = false): Role {
  let permissions: Role['permissions'];
  if (populate && row.permissions?.some((p) => p.permission)) {
    permissions = row.permissions
      .map((p) => p.permission)
      .filter(Boolean)
      .map((perm) => ({
        id: perm!.id,
        slug: perm!.slug,
        name: perm!.name,
        description: perm!.description ?? undefined,
        section: perm!.section,
      }));
  } else {
    permissions = (row.permissions ?? []).map((p) => p.permissionId);
  }
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? undefined,
    permissions,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type OrderWithItems = PrismaOrder & { items?: PrismaOrderItem[] };

export function mapOrder(row: OrderWithItems): Order {
  const items: OrderItem[] = (row.items ?? []).map((i) => ({
    book: i.bookId,
    title: i.title,
    price: i.price,
    quantity: i.quantity,
  }));
  const history = (Array.isArray(row.statusHistory) ? row.statusHistory : []) as unknown as StatusHistory[];
  const payment: Payment = {
    method: 'fake',
    status: row.paymentStatus,
    paidAt: row.paidAt ?? undefined,
    transactionId: row.transactionId ?? undefined,
  };
  const shippingAddress: ShippingAddress = {
    fullName: row.shippingFullName,
    line1: row.shippingLine1,
    line2: row.shippingLine2 ?? undefined,
    city: row.shippingCity,
    state: row.shippingState ?? undefined,
    postalCode: row.shippingPostalCode,
    country: row.shippingCountry,
  };
  return {
    id: row.id,
    user: row.userId,
    items,
    subtotalAmount: row.subtotalAmount,
    discountCode: row.discountCode ?? undefined,
    discountAmount: row.discountAmount,
    totalAmount: row.totalAmount,
    status: row.status as OrderStatus,
    payment,
    shippingAddress,
    statusHistory: history.map((h) => ({
      status: h.status,
      at: new Date(h.at),
      note: h.note,
    })),
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type ReviewPopulated = PrismaReview & {
  user?: { name: string; email: string };
  book?: { title: string; author: string };
};

export function mapReview(row: ReviewPopulated): Review {
  const review: Review = {
    id: row.id,
    book: row.bookId,
    user: row.userId,
    rating: row.rating,
    comment: row.comment ?? undefined,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  if (row.user || row.book) {
    review.populated = {};
    if (row.user) review.populated.user = { name: row.user.name, email: row.user.email };
    if (row.book) review.populated.book = { title: row.book.title, author: row.book.author };
  }
  return review;
}

export function mapRefreshToken(row: PrismaRefresh): RefreshTokenRecord {
  return {
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    revokedAt: row.revokedAt,
    replacedByHash: row.replacedByHash,
  };
}

type CartWithItems = PrismaCart & { items?: PrismaCartItem[] };

export function mapCart(row: CartWithItems): Cart {
  return {
    id: row.id,
    userId: row.userId,
    items: (row.items ?? []).map((i) => ({ bookId: i.bookId, quantity: i.quantity })),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type FavoritePopulated = PrismaFavorite & {
  book?: { id: string; title: string; author: string; price: number; coverImageUrl: string | null };
};

export function mapFavorite(row: FavoritePopulated): Favorite {
  const fav: Favorite = {
    id: row.id,
    userId: row.userId,
    bookId: row.bookId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  if (row.book) {
    fav.populated = {
      book: {
        id: row.book.id,
        title: row.book.title,
        author: row.book.author,
        price: row.book.price,
        coverImageUrl: row.book.coverImageUrl ?? undefined,
      },
    };
  }
  return fav;
}

export function mapDiscount(row: PrismaDiscount): Discount {
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: row.value,
    minOrderAmount: row.minOrderAmount ?? undefined,
    maxUses: row.maxUses ?? undefined,
    usedCount: row.usedCount,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    isActive: row.isActive,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

type IssuePopulated = PrismaIssue & { reporter?: { name: string; email: string } };

export function mapIssue(row: IssuePopulated): IssueReport {
  const issue: IssueReport = {
    id: row.id,
    reporter: row.reporterId,
    type: row.type,
    targetId: row.targetId ?? undefined,
    subject: row.subject,
    body: row.body,
    status: row.status,
    adminNotes: row.adminNotes ?? undefined,
    deletedAt: row.deletedAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
  if (row.reporter) {
    issue.populated = {
      reporter: { name: row.reporter.name, email: row.reporter.email },
    };
  }
  return issue;
}
