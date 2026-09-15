import path from 'node:path';
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import request from 'supertest';
import type { Express } from 'express';

export type TestAgent = ReturnType<typeof request>;

export type TestContext = {
  app: Express;
  request: TestAgent;
  /** Stop hook for embedded Postgres (null when using TEST_DATABASE_URL). */
  stopPg: (() => Promise<void>) | null;
  adminToken: string;
  adminRefresh: string;
};

let shared: TestContext | null = null;
let refs = 0;

async function ensureDatabaseUrl(): Promise<{ stopPg: (() => Promise<void>) | null }> {
  const externalUri = process.env.TEST_DATABASE_URL?.trim();
  if (externalUri) {
    process.env.DATABASE_URL = externalUri;
    return { stopPg: null };
  }

  // Prefer an already-running local Postgres if TEST_DATABASE_URL is unset but DATABASE_URL works —
  // otherwise boot embedded-postgres for hermetic tests.
  const EmbeddedPostgres = (await import('embedded-postgres')).default;
  const dataDir = path.resolve(process.cwd(), '.pgdata/test');
  fs.mkdirSync(path.dirname(dataDir), { recursive: true });

  // Pick an ephemeral high port to avoid clashing with a local server
  const port = 55432 + Math.floor(Math.random() * 1000);
  const user = 'postgres';
  const password = 'postgres';
  const database = 'bookstore_test';

  const pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user,
    password,
    port,
    persistent: false,
    onLog: () => undefined,
    onError: (msg) => {
      console.warn('[tests] embedded-postgres:', msg);
    },
  });

  await pg.initialise();
  await pg.start();
  try {
    await pg.createDatabase(database);
  } catch {
    // may already exist on reuse
  }

  const uri = `postgresql://${user}:${password}@127.0.0.1:${port}/${database}?schema=public`;
  process.env.DATABASE_URL = uri;

  return {
    stopPg: async () => {
      try {
        await pg.stop();
      } catch {
        /* ignore */
      }
    },
  };
}

function migrateSchema(): void {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL not set for migrate');
  execSync('npx prisma db push --skip-generate --accept-data-loss', {
    cwd: process.cwd(),
    env: { ...process.env, DATABASE_URL: url },
    stdio: 'inherit',
  });
}

async function resetDatabase(): Promise<void> {
  const { prisma } = await import('../../src/infrastructure/persistence/prisma/client');
  // Truncate all tables in public schema
  await prisma.$executeRawUnsafe(`
    DO $$ DECLARE r RECORD;
    BEGIN
      FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
      END LOOP;
    END $$;
  `);
}

export async function setupTestApp(): Promise<TestContext> {
  refs += 1;
  if (shared) return shared;

  const { stopPg } = await ensureDatabaseUrl();
  migrateSchema();

  const { connectDb } = await import('../../src/infrastructure/config/db');
  await connectDb();
  await resetDatabase();

  const { runSeed } = await import('../../src/scripts/seed');
  await runSeed({ minimalBooks: true });

  const { default: app } = await import('../../src/app');
  const agent = request(app);

  const login = await agent
    .post('/api/v1/auth/login')
    .send({ email: 'admin@bookstore.local', password: 'Admin123!' })
    .expect(200);

  shared = {
    app,
    request: agent,
    stopPg,
    adminToken: login.body.accessToken as string,
    adminRefresh: login.body.refreshToken as string,
  };
  return shared;
}

export async function teardownTestApp(): Promise<void> {
  refs = Math.max(0, refs - 1);
  if (refs > 0 || !shared) return;

  try {
    await resetDatabase();
  } catch {
    /* ignore */
  }
  try {
    const { disconnectPrisma } = await import('../../src/infrastructure/persistence/prisma/client');
    await disconnectPrisma();
  } catch {
    /* ignore */
  }
  try {
    if (shared.stopPg) await shared.stopPg();
  } catch {
    /* ignore */
  }
  shared = null;
}

export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}

export const shippingAddress = {
  fullName: 'Test User',
  line1: '1 Test St',
  city: 'Tehran',
  postalCode: '12345',
  country: 'IR',
};

export async function registerCustomer(
  agent: TestAgent,
  suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
): Promise<{ accessToken: string; refreshToken: string; email: string; userId: string }> {
  const email = `customer_${suffix}@test.local`;
  const res = await agent
    .post('/api/v1/auth/register')
    .send({ name: 'Customer', email, password: 'Customer123!' })
    .expect(201);
  return {
    accessToken: res.body.accessToken,
    refreshToken: res.body.refreshToken,
    email,
    userId: res.body.user.id,
  };
}
