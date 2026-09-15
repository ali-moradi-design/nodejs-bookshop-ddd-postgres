import type { IReviewRepository } from '../../domain/review/review.repository';
import type { IBookRepository } from '../../domain/book/book.repository';
import type { ReviewListFilter } from '../../domain/review/review.entity';
import { AppError } from '../../shared/AppError';
import { paginate } from '../../shared/pagination';

export class ReviewService {
  constructor(
    private readonly reviews: IReviewRepository,
    private readonly books: IBookRepository,
  ) {}

  async list(filter: ReviewListFilter) {
    const { page, limit } = paginate(filter.page, filter.limit);
    const { data, total } = await this.reviews.list({ ...filter, page, limit });
    return {
      data: data.map((r) => this.toResponse(r)),
      meta: { page, limit, total },
    };
  }

  async getById(id: string) {
    const review = await this.reviews.findById(id, true);
    if (!review) throw new AppError('Review not found', 404);
    return this.toResponse(review);
  }

  async create(input: { book: string; userId: string; rating: number; comment?: string }) {
    const book = await this.books.findById(input.book);
    if (!book) throw new AppError('Book not found', 404);

    const review = await this.reviews.create({
      book: input.book,
      user: input.userId,
      rating: input.rating,
      comment: input.comment,
    });
    return this.toResponse(review);
  }

  async update(
    id: string,
    body: { rating?: number; comment?: string },
    requester: { id: string; permissions: string[] },
  ) {
    const review = await this.reviews.findById(id);
    if (!review) throw new AppError('Review not found', 404);

    const isOwn = review.user === requester.id;
    const canUpdateAll = requester.permissions.includes('reviews:update');
    const canUpdateOwn = requester.permissions.includes('reviews:update-own');

    if (!isOwn && !canUpdateAll) throw new AppError('Forbidden', 403);
    if (isOwn && !canUpdateOwn && !canUpdateAll) throw new AppError('Forbidden', 403);

    const updated = await this.reviews.update(id, body);
    return this.toResponse(updated!);
  }

  async remove(id: string, requester: { id: string; permissions: string[] }) {
    const review = await this.reviews.findById(id);
    if (!review) throw new AppError('Review not found', 404);

    const isOwn = review.user === requester.id;
    const canDeleteAll = requester.permissions.includes('reviews:delete');
    const canDeleteOwn = requester.permissions.includes('reviews:delete-own');

    if (!isOwn && !canDeleteAll) throw new AppError('Forbidden', 403);
    if (isOwn && !canDeleteOwn && !canDeleteAll) throw new AppError('Forbidden', 403);

    await this.reviews.softDelete(id);
  }

  private toResponse(review: {
    id: string;
    book: string;
    user: string;
    rating: number;
    comment?: string;
    createdAt: Date;
    updatedAt: Date;
    populated?: {
      user?: { name: string; email: string };
      book?: { title: string; author: string };
    };
  }) {
    return {
      id: review.id,
      _id: review.id,
      book: review.populated?.book
        ? { _id: review.book, ...review.populated.book }
        : review.book,
      user: review.populated?.user
        ? { _id: review.user, ...review.populated.user }
        : review.user,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}
