import { Router } from 'express';
import authRoutes from './auth.routes';
import permissionsRoutes from './permissions.routes';
import rolesRoutes from './roles.routes';
import usersRoutes from './users.routes';
import booksRoutes from './books.routes';
import reviewsRoutes from './reviews.routes';
import ordersRoutes from './orders.routes';
import reportsRoutes from './reports.routes';
import cartRoutes from './cart.routes';
import favoritesRoutes from './favorites.routes';
import discountsRoutes from './discounts.routes';
import uploadsRoutes from './uploads.routes';
import adminRoutes from './admin.routes';

const v1 = Router();

v1.use('/auth', authRoutes);
v1.use('/permissions', permissionsRoutes);
v1.use('/roles', rolesRoutes);
v1.use('/users', usersRoutes);
v1.use('/books', booksRoutes);
v1.use('/reviews', reviewsRoutes);
v1.use('/orders', ordersRoutes);
v1.use('/reports', reportsRoutes);
v1.use('/cart', cartRoutes);
v1.use('/favorites', favoritesRoutes);
v1.use('/discounts', discountsRoutes);
v1.use('/uploads', uploadsRoutes);
v1.use('/admin', adminRoutes);

export default v1;
