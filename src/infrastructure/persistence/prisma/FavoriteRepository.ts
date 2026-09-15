import type { IFavoriteRepository } from '../../../domain/favorite/favorite.repository';
import type { Favorite, CreateFavoriteInput } from '../../../domain/favorite/favorite.entity';
import { getPrisma } from './client';
import { mapFavorite } from './mappers';

const bookSelect = {
  book: { select: { id: true, title: true, author: true, price: true, coverImageUrl: true } },
} as const;

export class PrismaFavoriteRepository implements IFavoriteRepository {
  async listByUser(userId: string, populate = true): Promise<Favorite[]> {
    const rows = await getPrisma().favorite.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: populate ? bookSelect : undefined,
    });
    return rows.map(mapFavorite);
  }

  async findByUserAndBook(userId: string, bookId: string): Promise<Favorite | null> {
    const row = await getPrisma().favorite.findUnique({
      where: { userId_bookId: { userId, bookId } },
    });
    return row ? mapFavorite(row) : null;
  }

  async create(input: CreateFavoriteInput): Promise<Favorite> {
    const row = await getPrisma().favorite.create({
      data: { userId: input.userId, bookId: input.bookId },
    });
    return mapFavorite(row);
  }

  async deleteByUserAndBook(userId: string, bookId: string): Promise<boolean> {
    try {
      await getPrisma().favorite.delete({
        where: { userId_bookId: { userId, bookId } },
      });
      return true;
    } catch {
      return false;
    }
  }
}
