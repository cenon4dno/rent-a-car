import { Injectable } from '@nestjs/common';
import { join, extname } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { IStorageProvider } from './storage-provider.interface';

@Injectable()
export class LocalDiskProvider implements IStorageProvider {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  async upload(buffer: Buffer, filename: string, _mimeType: string): Promise<string> {
    await mkdir(this.uploadDir, { recursive: true });
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(filename) || '.bin';
    const savedName = `${unique}${ext}`;
    await writeFile(join(this.uploadDir, savedName), buffer);
    return `/uploads/${savedName}`;
  }
}
