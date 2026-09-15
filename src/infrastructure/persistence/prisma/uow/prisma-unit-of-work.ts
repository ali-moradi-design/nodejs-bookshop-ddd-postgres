import type { IUnitOfWork, UnitOfWorkSession } from '../../../../application/shared/unit-of-work.port';
import { prisma, runWithPrismaTx } from '../client';

export class PrismaUnitOfWork implements IUnitOfWork {
  runInTransaction<T>(fn: (session: UnitOfWorkSession | null) => Promise<T>): Promise<T> {
    return prisma.$transaction(async (tx) => {
      return runWithPrismaTx(tx, () => fn(tx));
    });
  }
}
