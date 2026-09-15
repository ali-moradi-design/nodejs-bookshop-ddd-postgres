import type { Book } from '../../../../domain/book/book.entity';
import { toBookDto } from '../../../../application/book/dto/book.mapper';

export function presentBook(book: Book) {
  return toBookDto(book);
}

export function presentBooks(books: Book[]) {
  return books.map(presentBook);
}
