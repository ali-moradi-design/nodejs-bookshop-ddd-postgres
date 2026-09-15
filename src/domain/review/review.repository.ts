import type { Review, CreateReviewInput, UpdateReviewInput, ReviewListFilter } from './review.entity';

export interface IReviewRepository {
  findById(id: string, populate?: boolean): Promise<Review | null>;
  list(filter: ReviewListFilter): Promise<{ data: Review[]; total: number }>;
  create(input: CreateReviewInput): Promise<Review>;
  update(id: string, input: UpdateReviewInput): Promise<Review | null>;
  softDelete(id: string): Promise<Review | null>;
}
