import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  authHeader,
  registerCustomer,
  setupTestApp,
  shippingAddress,
  teardownTestApp,
  type TestContext,
} from '../helpers/testApp';

describe('Bookstore API (integration)', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await setupTestApp();
  }, 120_000);

  afterAll(async () => {
    await teardownTestApp();
  }, 60_000);

  describe('Health', () => {
    it('GET /api/health returns ok', async () => {
      const res = await ctx.request.get('/api/health').expect(200);
      expect(res.body.status).toBe('ok');
      expect(res.body.timestamp).toBeTruthy();
    });
  });

  describe('Auth', () => {
    it('register → login → refresh → logout', async () => {
      const email = `flow_${Date.now()}@test.local`;

      const registered = await ctx.request
        .post('/api/v1/auth/register')
        .send({ name: 'Flow User', email, password: 'Password123!' })
        .expect(201);

      expect(registered.body.accessToken).toBeTruthy();
      expect(registered.body.refreshToken).toBeTruthy();
      expect(registered.body.user.email).toBe(email);

      const login = await ctx.request
        .post('/api/v1/auth/login')
        .send({ email, password: 'Password123!' })
        .expect(200);

      const refreshToken = login.body.refreshToken as string;

      const refreshed = await ctx.request
        .post('/api/v1/auth/refresh')
        .send({ refreshToken })
        .expect(200);

      expect(refreshed.body.accessToken).toBeTruthy();
      expect(refreshed.body.refreshToken).not.toBe(refreshToken);

      await ctx.request
        .post('/api/v1/auth/logout')
        .send({ refreshToken: refreshed.body.refreshToken })
        .expect(200);

      await ctx.request
        .post('/api/v1/auth/refresh')
        .send({ refreshToken: refreshed.body.refreshToken })
        .expect(401);
    });

    it('rejects bad login', async () => {
      const res = await ctx.request
        .post('/api/v1/auth/login')
        .send({ email: 'admin@bookstore.local', password: 'wrong-password' })
        .expect(401);
      expect(res.body.message).toMatch(/invalid credentials/i);
    });
  });

  describe('RBAC', () => {
    it('customer cannot hit admin-only routes; admin can', async () => {
      const customer = await registerCustomer(ctx.request, `rbac_${Date.now()}`);

      await ctx.request
        .get('/api/v1/admin/dashboard/summary')
        .set(authHeader(customer.accessToken))
        .expect(403);

      await ctx.request
        .post('/api/v1/books')
        .set(authHeader(customer.accessToken))
        .send({
          title: 'Denied',
          author: 'X',
          description: 'Nope',
          price: 10,
          stock: 1,
        })
        .expect(403);

      const adminSummary = await ctx.request
        .get('/api/v1/admin/dashboard/summary')
        .set(authHeader(ctx.adminToken))
        .expect(200);

      expect(adminSummary.body.data).toBeTruthy();
    });
  });

  describe('Books', () => {
    it('lists, searches, and returns featured books', async () => {
      const list = await ctx.request.get('/api/v1/books').expect(200);
      expect(list.body.data.length).toBeGreaterThan(0);

      const search = await ctx.request.get('/api/v1/books?q=Clean').expect(200);
      expect(search.body.data.some((b: { title: string }) => /clean/i.test(b.title))).toBe(true);

      const featured = await ctx.request.get('/api/v1/books/featured').expect(200);
      expect(featured.body.data.length).toBeGreaterThan(0);
      expect(featured.body.data.every((b: { featured: boolean }) => b.featured === true)).toBe(true);
    });

    it('admin can create and update a book', async () => {
      const created = await ctx.request
        .post('/api/v1/books')
        .set(authHeader(ctx.adminToken))
        .send({
          title: 'Test Book Create',
          author: 'Tester',
          description: 'Created in integration test',
          isbn: `978${Date.now().toString().slice(-10)}`,
          price: 19.99,
          stock: 5,
          categories: ['test'],
        })
        .expect(201);

      const id = created.body.data.id as string;

      const updated = await ctx.request
        .patch(`/api/v1/books/${id}`)
        .set(authHeader(ctx.adminToken))
        .send({ price: 21.5, stock: 8 })
        .expect(200);

      expect(updated.body.data.price).toBe(21.5);
      expect(updated.body.data.stock).toBe(8);
    });
  });

  describe('Cart & orders', () => {
    it('add → update → checkout → pending_payment; pay decrements stock', async () => {
      const books = await ctx.request.get('/api/v1/books?limit=1').expect(200);
      const bookId = books.body.data[0].id as string;
      const bookPrice = books.body.data[0].price as number;

      const customer = await registerCustomer(ctx.request, `cart_${Date.now()}`);
      const token = customer.accessToken;

      const beforeBook = await ctx.request.get(`/api/v1/books/${bookId}`).expect(200);
      const stockBefore = beforeBook.body.data.stock as number;

      await ctx.request
        .post('/api/v1/cart/items')
        .set(authHeader(token))
        .send({ bookId, quantity: 1 })
        .expect(201);

      await ctx.request
        .patch(`/api/v1/cart/items/${bookId}`)
        .set(authHeader(token))
        .send({ quantity: 2 })
        .expect(200);

      const checkout = await ctx.request
        .post('/api/v1/cart/checkout')
        .set(authHeader(token))
        .send({ shippingAddress })
        .expect(201);

      const order = checkout.body.data;
      expect(order.status).toBe('pending_payment');
      expect(order.totalAmount).toBeCloseTo(bookPrice * 2, 2);

      const paid = await ctx.request
        .post(`/api/v1/orders/${order.id}/pay`)
        .set(authHeader(token))
        .expect(200);

      expect(paid.body.data.status).toBe('paid');

      const afterBook = await ctx.request.get(`/api/v1/books/${bookId}`).expect(200);
      expect(afterBook.body.data.stock).toBe(stockBefore - 2);
    });

    it('out-of-stock pay fails when concurrent orders oversell', async () => {
      const created = await ctx.request
        .post('/api/v1/books')
        .set(authHeader(ctx.adminToken))
        .send({
          title: 'Scarce Book',
          author: 'Limited',
          description: 'Only one copy',
          isbn: `979${Date.now().toString().slice(-10)}`,
          price: 25,
          stock: 1,
        })
        .expect(201);

      const scarceId = created.body.data.id as string;
      const c1 = await registerCustomer(ctx.request, `oos1_${Date.now()}`);
      const c2 = await registerCustomer(ctx.request, `oos2_${Date.now()}`);

      for (const c of [c1, c2]) {
        await ctx.request
          .post('/api/v1/cart/items')
          .set(authHeader(c.accessToken))
          .send({ bookId: scarceId, quantity: 1 })
          .expect(201);

        await ctx.request
          .post('/api/v1/cart/checkout')
          .set(authHeader(c.accessToken))
          .send({ shippingAddress })
          .expect(201);
      }

      const orders1 = await ctx.request.get('/api/v1/orders').set(authHeader(c1.accessToken)).expect(200);
      const orders2 = await ctx.request.get('/api/v1/orders').set(authHeader(c2.accessToken)).expect(200);
      const order1Id = orders1.body.data[0].id as string;
      const order2Id = orders2.body.data[0].id as string;

      await ctx.request
        .post(`/api/v1/orders/${order1Id}/pay`)
        .set(authHeader(c1.accessToken))
        .expect(200);

      const fail = await ctx.request
        .post(`/api/v1/orders/${order2Id}/pay`)
        .set(authHeader(c2.accessToken))
        .expect(409);

      expect(fail.body.message).toMatch(/insufficient stock/i);

      const failedOrder = await ctx.request
        .get(`/api/v1/orders/${order2Id}`)
        .set(authHeader(c2.accessToken))
        .expect(200);
      expect(failedOrder.body.data.status).toBe('failed');
    });
  });

  describe('Favorites', () => {
    it('add → list → remove', async () => {
      const customer = await registerCustomer(ctx.request, `fav_${Date.now()}`);
      const books = await ctx.request.get('/api/v1/books?limit=1').expect(200);
      const bookId = books.body.data[0].id as string;

      await ctx.request
        .post('/api/v1/favorites')
        .set(authHeader(customer.accessToken))
        .send({ bookId })
        .expect(201);

      const list = await ctx.request
        .get('/api/v1/favorites')
        .set(authHeader(customer.accessToken))
        .expect(200);

      expect(list.body.data.some((f: { bookId: string }) => f.bookId === bookId)).toBe(true);

      await ctx.request
        .delete(`/api/v1/favorites/${bookId}`)
        .set(authHeader(customer.accessToken))
        .expect(200);

      const after = await ctx.request
        .get('/api/v1/favorites')
        .set(authHeader(customer.accessToken))
        .expect(200);

      expect(after.body.data.length).toBe(0);
    });
  });

  describe('Discounts', () => {
    it('applies WELCOME10 on checkout and rejects invalid codes', async () => {
      const customer = await registerCustomer(ctx.request, `disc_${Date.now()}`);
      const books = await ctx.request.get('/api/v1/books?limit=20').expect(200);
      const book =
        books.body.data.find((b: { price: number; stock: number }) => b.price >= 20 && b.stock > 0) ??
        books.body.data[0];
      const qty = book.price >= 20 ? 1 : 2;

      await ctx.request
        .post('/api/v1/cart/items')
        .set(authHeader(customer.accessToken))
        .send({ bookId: book.id, quantity: qty })
        .expect(201);

      const checkout = await ctx.request
        .post('/api/v1/cart/checkout')
        .set(authHeader(customer.accessToken))
        .send({ shippingAddress, discountCode: 'WELCOME10' })
        .expect(201);

      expect(checkout.body.data.discountCode).toBe('WELCOME10');
      expect(checkout.body.data.discountAmount).toBeGreaterThan(0);
      expect(checkout.body.data.totalAmount).toBeLessThan(checkout.body.data.subtotalAmount);

      const customer2 = await registerCustomer(ctx.request, `disc_bad_${Date.now()}`);
      await ctx.request
        .post('/api/v1/cart/items')
        .set(authHeader(customer2.accessToken))
        .send({ bookId: book.id, quantity: 1 })
        .expect(201);

      const bad = await ctx.request
        .post('/api/v1/cart/checkout')
        .set(authHeader(customer2.accessToken))
        .send({ shippingAddress, discountCode: 'NOTAREALCODE' })
        .expect(400);

      expect(bad.body.message).toMatch(/invalid discount/i);
    });
  });

  describe('Reviews', () => {
    it('allows multiple reviews from the same user for the same book', async () => {
      const customer = await registerCustomer(ctx.request, `rev_${Date.now()}`);
      const books = await ctx.request.get('/api/v1/books?limit=1').expect(200);
      const bookId = books.body.data[0].id as string;

      const r1 = await ctx.request
        .post('/api/v1/reviews')
        .set(authHeader(customer.accessToken))
        .send({ book: bookId, rating: 5, comment: 'First review' })
        .expect(201);

      const r2 = await ctx.request
        .post('/api/v1/reviews')
        .set(authHeader(customer.accessToken))
        .send({ book: bookId, rating: 4, comment: 'Second review same book' })
        .expect(201);

      const id1 = (r1.body.id ?? r1.body.data?.id) as string;
      const id2 = (r2.body.id ?? r2.body.data?.id) as string;
      expect(id1).toBeTruthy();
      expect(id2).toBeTruthy();
      expect(id1).not.toBe(id2);
    });
  });

  describe('Admin dashboard', () => {
    it('summary is reachable by admin', async () => {
      const res = await ctx.request
        .get('/api/v1/admin/dashboard/summary')
        .set(authHeader(ctx.adminToken))
        .expect(200);

      expect(res.body.data).toBeTruthy();
    });
  });

  describe('Uploads', () => {
    it('rejects unauthenticated and unauthorized upload attempts', async () => {
      await ctx.request.post('/api/v1/uploads/book-cover').expect(401);

      const customer = await registerCustomer(ctx.request, `upl_${Date.now()}`);
      await ctx.request
        .post('/api/v1/uploads/book-cover')
        .set(authHeader(customer.accessToken))
        .expect(403);
    });
  });
});
