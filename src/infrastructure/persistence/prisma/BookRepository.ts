import type { IBookRepository } from '../../../domain/book/book.repository';
import type { Book, CreateBookInput, UpdateBookInput, BookListFilter } from '../../../domain/book/book.entity';
import type { Prisma } from '@prisma/client';
import { getPrisma } from './client';
import { mapBook } from './mappers';
import { paginate } from '../../../shared/pagination';

export class PrismaBookRepository implements IBookRepository {
  async findById(id: string): Promise<Book | null> {
    const row = await getPrisma().book.findFirst({ where: { id, deletedAt: null } });
    return row ? mapBook(row) : null;
  }

  async findByIds(ids: string[]): Promise<Book[]> {
    const rows = await getPrisma().book.findMany({ where: { id: { in: ids }, deletedAt: null } });
    return rows.map(mapBook);
  }

  async list(filter: BookListFilter): Promise<{ data: Book[]; total: number }> {
    const { limit, skip } = paginate(filter.page, filter.limit);
    const where = buildBookWhere(filter);
    const sortField = filter.sort ?? 'createdAt';
    const orderBy: Prisma.BookOrderByWithRelationInput = {
      [sortField]: filter.order === 'asc' ? 'asc' : 'desc',
    };

    const [rows, total] = await Promise.all([
      getPrisma().book.findMany({ where, orderBy, skip, take: limit }),
      getPrisma().book.count({ where }),
    ]);
    return { data: rows.map(mapBook), total };
  }

  async listFeatured(limit = 20): Promise<Book[]> {
    const rows = await getPrisma().book.findMany({
      where: { featured: true, deletedAt: null },
      orderBy: [{ featuredOrder: 'asc' }, { createdAt: 'desc' }],
      take: limit,
    });
    return rows.map(mapBook);
  }

  async create(input: CreateBookInput): Promise<Book> {
    const row = await getPrisma().book.create({
      data: {
        title: input.title,
        author: input.author,
        description: input.description,
        isbn: input.isbn,
        price: input.price,
        currency: input.currency ?? 'USD',
        stock: input.stock ?? 0,
        coverImageUrl: input.coverImageUrl,
        categories: input.categories ?? [],
        featured: input.featured ?? false,
        featuredOrder: input.featuredOrder ?? 0,
      },
    });
    return mapBook(row);
  }

  async update(id: string, input: UpdateBookInput): Promise<Book | null> {
    try {
      const row = await getPrisma().book.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.author !== undefined ? { author: input.author } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.isbn !== undefined ? { isbn: input.isbn } : {}),
          ...(input.price !== undefined ? { price: input.price } : {}),
          ...(input.currency !== undefined ? { currency: input.currency } : {}),
          ...(input.stock !== undefined ? { stock: input.stock } : {}),
          ...(input.coverImageUrl !== undefined ? { coverImageUrl: input.coverImageUrl } : {}),
          ...(input.categories !== undefined ? { categories: input.categories } : {}),
          ...(input.featured !== undefined ? { featured: input.featured } : {}),
          ...(input.featuredOrder !== undefined ? { featuredOrder: input.featuredOrder } : {}),
        },
      });
      if (row.deletedAt) return null;
      return mapBook(row);
    } catch {
      return null;
    }
  }

  async softDelete(id: string): Promise<Book | null> {
    try {
      const row = await getPrisma().book.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return mapBook(row);
    } catch {
      return null;
    }
  }

  async decrementStock(bookId: string, quantity: number): Promise<boolean> {
    const result = await getPrisma().book.updateMany({
      where: { id: bookId, stock: { gte: quantity }, deletedAt: null },
      data: { stock: { decrement: quantity } },
    });
    return result.count === 1;
  }

  async incrementStock(bookId: string, quantity: number): Promise<void> {
    await getPrisma().book.updateMany({
      where: { id: bookId },
      data: { stock: { increment: quantity } },
    });
  }

  async upsertByIsbn(
    isbn: string,
    data: CreateBookInput & { coverImageUrl: string },
  ): Promise<Book> {
    const row = await getPrisma().book.upsert({
      where: { isbn },
      create: {
        title: data.title,
        author: data.author,
        description: data.description,
        isbn,
        price: data.price,
        currency: data.currency ?? 'USD',
        stock: data.stock ?? 0,
        coverImageUrl: data.coverImageUrl,
        categories: data.categories ?? [],
        featured: data.featured ?? false,
        featuredOrder: data.featuredOrder ?? 0,
      },
      update: {
        title: data.title,
        author: data.author,
        description: data.description,
        price: data.price,
        currency: data.currency ?? 'USD',
        stock: data.stock ?? 0,
        coverImageUrl: data.coverImageUrl,
        categories: data.categories ?? [],
        featured: data.featured ?? false,
        featuredOrder: data.featuredOrder ?? 0,
        deletedAt: null,
      },
    });
    return mapBook(row);
  }

  async count(): Promise<number> {
    return getPrisma().book.count({ where: { deletedAt: null } });
  }

  async countLowStock(threshold: number): Promise<number> {
    return getPrisma().book.count({ where: { stock: { lte: threshold }, deletedAt: null } });
  }

  async findLowStock(threshold: number, limit = 50): Promise<Book[]> {
    const rows = await getPrisma().book.findMany({
      where: { stock: { lte: threshold }, deletedAt: null },
      orderBy: { stock: 'asc' },
      take: limit,
    });
    return rows.map(mapBook);
  }
}

function buildBookWhere(filter: BookListFilter): Prisma.BookWhereInput {
  const where: Prisma.BookWhereInput = { deletedAt: null };

  if (filter.q) {
    where.OR = [
      { title: { contains: filter.q, mode: 'insensitive' } },
      { author: { contains: filter.q, mode: 'insensitive' } },
      { description: { contains: filter.q, mode: 'insensitive' } },
    ];
  }
  if (filter.category) {
    where.categories = { has: filter.category };
  }
  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    where.price = {};
    if (filter.minPrice !== undefined) where.price.gte = filter.minPrice;
    if (filter.maxPrice !== undefined) where.price.lte = filter.maxPrice;
  }
  if (filter.inStock === true) {
    where.stock = { gt: 0 };
  } else if (filter.inStock === false) {
    where.stock = { lte: 0 };
  }
  if (filter.featured !== undefined) {
    where.featured = filter.featured;
  }
  return where;
}
