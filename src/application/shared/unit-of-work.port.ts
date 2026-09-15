/** Optional session handle opaque to application (Prisma tx client or null). */
export type UnitOfWorkSession = unknown;

export interface IUnitOfWork {
  /**
   * Run `fn` in a transaction when the store supports it; otherwise run without.
   */
  runInTransaction<T>(fn: (session: UnitOfWorkSession | null) => Promise<T>): Promise<T>;
}
