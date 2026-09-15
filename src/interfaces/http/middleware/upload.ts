import multer from 'multer';
import path from 'path';
import { AppError } from '../../../shared/AppError';
import { storage } from '../../../infrastructure/composition';

const booksDir = storage.absoluteDir('books');

const disk = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, booksDir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const base = path
      .basename(file.originalname, path.extname(file.originalname))
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    cb(null, `${Date.now()}-${base}${ext}`);
  },
});

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

export const bookCoverUpload = multer({
  storage: disk,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      cb(new AppError('Only image files are allowed (jpeg, png, webp, gif)', 400));
      return;
    }
    cb(null, true);
  },
});
