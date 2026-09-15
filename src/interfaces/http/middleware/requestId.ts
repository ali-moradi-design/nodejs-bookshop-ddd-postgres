import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incoming = req.header('x-request-id');
  const id = incoming && incoming.trim() ? incoming.trim() : randomUUID();
  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
}
