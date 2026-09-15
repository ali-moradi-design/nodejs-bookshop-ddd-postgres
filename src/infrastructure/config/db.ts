import { prisma } from '../persistence/prisma/client';
import { env } from './env';

export async function connectDb(): Promise<void> {
  await prisma.$connect();
  // Touch the DB so misconfigured URLs fail fast
  await prisma.$queryRaw`SELECT 1`;
  console.log('PostgreSQL connected');
  void env.DATABASE_URL; // keep import used for future diagnostics
}

export async function disconnectDb(): Promise<void> {
  await prisma.$disconnect();
}
