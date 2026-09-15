import { BookService } from '../../application/book/book.service';
import { AuthService } from '../../application/auth/auth.service';
import { UserService } from '../../application/user/user.service';
import { OrderService } from '../../application/order/order.service';
import { ReviewService } from '../../application/review/review.service';
import { PermissionService } from '../../application/rbac/permission.service';
import { RoleService } from '../../application/rbac/role.service';
import { ReportService } from '../../application/report/report.service';
import { AuthContextService } from '../../application/rbac/auth-context.service';
import { DiscountService } from '../../application/discount/discount.service';
import { CartService } from '../../application/cart/cart.service';
import { FavoriteService } from '../../application/favorite/favorite.service';
import { DashboardService } from '../../application/admin/dashboard.service';

import {
  bookRepo,
  userRepo,
  orderRepo,
  reviewRepo,
  permissionRepo,
  roleRepo,
  refreshTokenRepo,
  issueRepo,
  cartRepo,
  favoriteRepo,
  discountRepo,
} from './repos';
import { tokenService, passwordHasher, unitOfWork, notifier } from './infra';

export const bookService = new BookService(bookRepo);
export const discountService = new DiscountService(discountRepo);
export const authService = new AuthService(
  userRepo,
  roleRepo,
  refreshTokenRepo,
  tokenService,
  passwordHasher,
);
export const userService = new UserService(userRepo, passwordHasher);
export const orderService = new OrderService(
  orderRepo,
  bookRepo,
  discountService,
  unitOfWork,
  notifier,
);
export const reviewService = new ReviewService(reviewRepo, bookRepo);
export const permissionService = new PermissionService(permissionRepo);
export const roleService = new RoleService(roleRepo);
export const reportService = new ReportService(issueRepo, orderRepo);
export const authContextService = new AuthContextService(userRepo, roleRepo, tokenService);
export const cartService = new CartService(cartRepo, bookRepo, orderRepo, discountService);
export const favoriteService = new FavoriteService(favoriteRepo, bookRepo);
export const dashboardService = new DashboardService(userRepo, bookRepo, orderRepo, issueRepo);
