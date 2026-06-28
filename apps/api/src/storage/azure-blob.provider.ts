import { Injectable } from '@nestjs/common';
import { extname } from 'path';
import { IStorageProvider } from './storage-provider.interface';

@Injectable()
export class AzureBlobProvider implements IStorageProvider {
  private readonly accountName = process.env.AZURE_STORAGE_ACCOUNT!;
  private readonly sasToken = process.env.AZURE_STORAGE_SAS_TOKEN!;
  private readonly container = process.env.AZURE_STORAGE_CONTAINER ?? 'uploads';

  async upload(buffer: Buffer, filename: string, mimeType: string): Promise<string> {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = extname(filename) || '.bin';
    const blobName = `${unique}${ext}`;

    const url = `https://${this.accountName}.blob.core.windows.net/${this.container}/${blobName}?${this.sasToken}`;

    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'x-ms-blob-type': 'BlockBlob',
        'Content-Type': mimeType,
        'Content-Length': String(buffer.length),
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      body: buffer as any,
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Azure Blob upload failed: ${res.status} ${text}`);
    }

    return `https://${this.accountName}.blob.core.windows.net/${this.container}/${blobName}`;
  }
}
