import { Module } from '@nestjs/common';
import { AdminController, LegalController, HomepageConfigController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController, LegalController, HomepageConfigController],
  providers: [AdminService],
})
export class AdminModule {}
