export interface IStorageProvider {
  upload(buffer: Buffer, filename: string, mimeType: string): Promise<string>;
}

export const STORAGE_PROVIDER = 'STORAGE_PROVIDER';
