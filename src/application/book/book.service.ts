import type { IBookRepository } from '../../domain/book/book.repository';
import type {
  Book,
  CreateBookInput,
  UpdateBookInput,
  BookListFilter,
} from '../../domain/book/book.entity';
import { AppError } from '../../shared/AppError';
import { paginate } from '../../shared/pagination';

export class BookService {
  constructor(private readonly books: IBookRepository) {}

  async list(filter: BookListFilter) {
    const { page, limit } = paginate(filter.page, filter.limit);
    const { data, total } = await this.books.list({ ...filter, page, limit });
    return { data, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
  }

  async listFeatured(limit = 20): Promise<Book[]> {
    return this.books.listFeatured(limit);
  }

  async getById(id: string): Promise<Book> {
    const book = await this.books.findById(id);
    if (!book) throw new AppError('Book not found', 404);
    return book;
  }

  async create(input: CreateBookInput): Promise<Book> {
    return this.books.create(input);
  }

  async update(id: string, input: UpdateBookInput): Promise<Book> {
    const book = await this.books.update(id, input);
    if (!book) throw new AppError('Book not found', 404);
    return book;
  }

  async remove(id: string): Promise<void> {
    const book = await this.books.softDelete(id);
    if (!book) throw new AppError('Book not found', 404);
  }
}
