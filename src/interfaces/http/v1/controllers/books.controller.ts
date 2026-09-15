import { Request, Response } from 'express';
import { bookService } from '../../../../infrastructure/composition';
import { asyncHandler } from '../../../../shared/asyncHandler';
import { presentBook, presentBooks } from '../presenters/book.presenter';

export const list = asyncHandler(async (req: Request, res: Response) => {
  const result = await bookService.list({
    q: req.query.q as string | undefined,
    category: req.query.category as string | undefined,
    minPrice: req.query.minPrice !== undefined ? Number(req.query.minPrice) : undefined,
    maxPrice: req.query.maxPrice !== undefined ? Number(req.query.maxPrice) : undefined,
    inStock: req.query.inStock as boolean | undefined,
    featured: req.query.featured as boolean | undefined,
    page: Number(req.query.page) || 1,
    limit: Number(req.query.limit) || 20,
    sort: (req.query.sort as 'price' | 'title' | 'createdAt') || 'createdAt',
    order: (req.query.order as 'asc' | 'desc') || 'desc',
  });
  res.json({ ...result, data: presentBooks(result.data) });
});

export const listFeatured = asyncHandler(async (_req: Request, res: Response) => {
  const data = await bookService.listFeatured(20);
  res.json({ data: presentBooks(data) });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const book = await bookService.getById(String(req.params.id));
  res.json({ data: presentBook(book) });
});

export const create = asyncHandler(async (req: Request, res: Response) => {
  const book = await bookService.create(req.body);
  res.status(201).json({ data: presentBook(book) });
});

export const update = asyncHandler(async (req: Request, res: Response) => {
  const book = await bookService.update(String(req.params.id), req.body);
  res.json({ data: presentBook(book) });
});

export const remove = asyncHandler(async (req: Request, res: Response) => {
  await bookService.remove(String(req.params.id));
  res.json({ message: 'Book soft-deleted' });
});
