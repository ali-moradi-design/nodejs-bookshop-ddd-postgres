import fs from 'fs';
import path from 'path';
import type { IStoragePort, StoredFile } from '../../domain/shared/storage.port';
import { env } from '../config/env';

export class LocalDiskStorage implements IStoragePort {
  constructor(private readonly rootDir: string = env.UPLOAD_DIR_ABS) {
    fs.mkdirSync(this.rootDir, { recursive: true });
  }

  absoluteDir(folder: string): string {
    const dir = path.join(this.rootDir, folder);
    fs.mkdirSync(dir, { recursive: true });
    return dir;
  }

  publicUrl(folder: string, filename: string): string {
    return `/uploads/${folder}/${filename}`;
  }

  async save(folder: string, filename: string, buffer: Buffer, mimetype: string): Promise<StoredFile> {
    const dir = this.absoluteDir(folder);
    const full = path.join(dir, filename);
    await fs.promises.writeFile(full, buffer);
    return {
      url: this.publicUrl(folder, filename),
      filename,
      mimetype,
      size: buffer.length,
    };
  }
}
