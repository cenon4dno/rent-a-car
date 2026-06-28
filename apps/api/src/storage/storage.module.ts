import { Module } from '@nestjs/common';
import { STORAGE_PROVIDER } from './storage-provider.interface';
import { LocalDiskProvider } from './local-disk.provider';
import { AzureBlobProvider } from './azure-blob.provider';

@Module({
  providers: [
    {
      provide: STORAGE_PROVIDER,
      useClass: process.env.AZURE_STORAGE_ACCOUNT ? AzureBlobProvider : LocalDiskProvider,
    },
  ],
  exports: [STORAGE_PROVIDER],
})
export class StorageModule {}
