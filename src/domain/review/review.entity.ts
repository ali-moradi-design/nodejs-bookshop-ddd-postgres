export interface Review {
  id: string;
  book: string;
  user: string;
  rating: number;
  comment?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  /** populated fields when requested */
  populated?: {
    user?: { name: string; email: string };
    book?: { title: string; author: string };
  };
}

export interface CreateReviewInput {
  book: string;
  user: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewInput {
  rating?: number;
  comment?: string;
}

export interface ReviewListFilter {
  book?: string;
  user?: string;
  page?: number;
  limit?: number;
}
