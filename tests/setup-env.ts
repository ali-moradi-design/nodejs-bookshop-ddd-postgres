/**
 * Must run before any app module imports env.ts.
 * DATABASE_URL is overwritten by the test helper after embedded Postgres starts;
 * a placeholder satisfies Zod at first import.
 */
process.env.NODE_ENV = 'test';
process.env.PORT = '4000';
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  process.env.TEST_DATABASE_URL ??
  'postgresql://postgres:postgres@127.0.0.1:5432/bookstore-test-placeholder?schema=public';
process.env.JWT_ACCESS_SECRET = 'test-access-secret-key-min8';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-min8';
process.env.ACCESS_TOKEN_TTL = '15m';
process.env.REFRESH_TOKEN_TTL = '7d';
process.env.CORS_ORIGIN = '*';
process.env.UPLOAD_DIR = 'uploads';
