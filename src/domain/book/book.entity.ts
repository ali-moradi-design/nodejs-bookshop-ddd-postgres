export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  isbn?: string;
  price: number;
  currency: string;
  stock: number;
  coverImageUrl?: string;
  categories?: string[];
  featured: boolean;
  featuredOrder?: number;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookInput {
  title: string;
  author: string;
  description: string;
  isbn?: string;
  price: number;
  currency?: string;
  stock?: number;
  coverImageUrl?: string;
  categories?: string[];
  featured?: boolean;
  featuredOrder?: number;
}

export type UpdateBookInput = Partial<CreateBookInput>;

export interface BookListFilter {
  q?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: 'price' | 'title' | 'createdAt';
  order?: 'asc' | 'desc';
}
