import { Module } from '@nestjs/common';
import { AdminController, LegalController } from './admin.controller';
import { AdminService } from './admin.service';

@Module({
  controllers: [AdminController, LegalController],
  providers: [AdminService],
})
export class AdminModule {}
