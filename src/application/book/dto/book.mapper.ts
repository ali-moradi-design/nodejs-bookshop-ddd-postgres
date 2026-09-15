import type { Book } from '../../../domain/book/book.entity';

/** HTTP-safe book shape (no deletedAt internals required). */
export interface BookDto {
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
  createdAt: Date;
  updatedAt: Date;
}

export function toBookDto(book: Book): BookDto {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    isbn: book.isbn,
    price: book.price,
    currency: book.currency,
    stock: book.stock,
    coverImageUrl: book.coverImageUrl,
    categories: book.categories,
    featured: book.featured,
    featuredOrder: book.featuredOrder,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };
}
