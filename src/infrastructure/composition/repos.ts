import {
  PrismaBookRepository,
  PrismaUserRepository,
  PrismaOrderRepository,
  PrismaReviewRepository,
  PrismaPermissionRepository,
  PrismaRoleRepository,
  PrismaRefreshTokenRepository,
  PrismaIssueReportRepository,
  PrismaCartRepository,
  PrismaFavoriteRepository,
  PrismaDiscountRepository,
} from '../persistence/prisma';

export const bookRepo = new PrismaBookRepository();
export const userRepo = new PrismaUserRepository();
export const orderRepo = new PrismaOrderRepository();
export const reviewRepo = new PrismaReviewRepository();
export const permissionRepo = new PrismaPermissionRepository();
export const roleRepo = new PrismaRoleRepository();
export const refreshTokenRepo = new PrismaRefreshTokenRepository();
export const issueRepo = new PrismaIssueReportRepository();
export const cartRepo = new PrismaCartRepository();
export const favoriteRepo = new PrismaFavoriteRepository();
export const discountRepo = new PrismaDiscountRepository();

export const repos = {
  books: bookRepo,
  users: userRepo,
  orders: orderRepo,
  reviews: reviewRepo,
  permissions: permissionRepo,
  roles: roleRepo,
  refreshTokens: refreshTokenRepo,
  issues: issueRepo,
  carts: cartRepo,
  favorites: favoriteRepo,
  discounts: discountRepo,
};
