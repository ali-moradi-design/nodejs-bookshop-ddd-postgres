export interface StoredFile {
  /** Relative public URL path, e.g. /uploads/books/xyz.jpg */
  url: string;
  filename: string;
  mimetype: string;
  size: number;
}

export interface IStoragePort {
  /** Persist a buffer under a logical folder (e.g. "books"). */
  save(folder: string, filename: string, buffer: Buffer, mimetype: string): Promise<StoredFile>;
  /** Absolute directory used for a folder (for multer disk storage). */
  absoluteDir(folder: string): string;
  publicUrl(folder: string, filename: string): string;
}
