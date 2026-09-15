import type { IReviewRepository } from '../../../domain/review/review.repository';
import type {
  Review,
  CreateReviewInput,
  UpdateReviewInput,
  ReviewListFilter,
} from '../../../domain/review/review.entity';
import { getPrisma } from './client';
import { mapReview } from './mappers';
import { paginate } from '../../../shared/pagination';

const populateInclude = {
  user: { select: { name: true, email: true } },
  book: { select: { title: true, author: true } },
} as const;

export class PrismaReviewRepository implements IReviewRepository {
  async findById(id: string, populate = false): Promise<Review | null> {
    const row = await getPrisma().review.findFirst({
      where: { id, deletedAt: null },
      include: populate ? populateInclude : undefined,
    });
    return row ? mapReview(row) : null;
  }

  async list(filter: ReviewListFilter): Promise<{ data: Review[]; total: number }> {
    const { limit, skip } = paginate(filter.page, filter.limit);
    const where = {
      deletedAt: null as null,
      ...(filter.book ? { bookId: filter.book } : {}),
      ...(filter.user ? { userId: filter.user } : {}),
    };
    const [rows, total] = await Promise.all([
      getPrisma().review.findMany({
        where,
        include: populateInclude,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      getPrisma().review.count({ where }),
    ]);
    return { data: rows.map(mapReview), total };
  }

  async create(input: CreateReviewInput): Promise<Review> {
    const row = await getPrisma().review.create({
      data: {
        bookId: input.book,
        userId: input.user,
        rating: input.rating,
        comment: input.comment,
      },
    });
    return mapReview(row);
  }

  async update(id: string, input: UpdateReviewInput): Promise<Review | null> {
    try {
      const row = await getPrisma().review.update({
        where: { id },
        data: {
          ...(input.rating !== undefined ? { rating: input.rating } : {}),
          ...(input.comment !== undefined ? { comment: input.comment } : {}),
        },
      });
      if (row.deletedAt) return null;
      return mapReview(row);
    } catch {
      return null;
    }
  }

  async softDelete(id: string): Promise<Review | null> {
    try {
      const row = await getPrisma().review.update({
        where: { id },
        data: { deletedAt: new Date() },
      });
      return mapReview(row);
    } catch {
      return null;
    }
  }
}
