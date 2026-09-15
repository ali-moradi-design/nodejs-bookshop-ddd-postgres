import { AsyncLocalStorage } from 'node:async_hooks';
import { PrismaClient, type Prisma } from '@prisma/client';

export type PrismaTx = PrismaClient | Prisma.TransactionClient;

const globalForPrisma = globalThis as unknown as { __bookstorePrisma?: PrismaClient };

export const prisma: PrismaClient =
  globalForPrisma.__bookstorePrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__bookstorePrisma = prisma;
}

const prismaAls = new AsyncLocalStorage<PrismaTx>();

/** Active client: transaction client when inside UoW, else singleton. */
export function getPrisma(): PrismaTx {
  return prismaAls.getStore() ?? prisma;
}

export async function runWithPrismaTx<T>(
  tx: Prisma.TransactionClient,
  fn: () => Promise<T>,
): Promise<T> {
  return prismaAls.run(tx, fn);
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect();
}
