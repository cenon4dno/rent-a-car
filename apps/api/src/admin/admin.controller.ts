import { Controller, Get, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEnum, IsNumber, Max, Min } from 'class-validator';
import { KycStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

class UpdateKycDto {
  @IsEnum(KycStatus)
  kycStatus: KycStatus;
}

class UpdateCommissionDto {
  @IsNumber()
  @Min(0)
  @Max(1)
  commissionRate: number;
}

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Platform statistics — GMV, commission, user/vehicle/booking counts' })
  getStats() {
    return this.adminService.getStats();
  }

  @Get('users')
  @ApiOperation({ summary: 'List all users with renter profiles' })
  getUsers() {
    return this.adminService.getUsers();
  }

  @Get('renters')
  @ApiOperation({ summary: 'List all renter profiles with commission rates' })
  getRenters() {
    return this.adminService.getRenters();
  }

  @Patch('users/:id/kyc')
  @ApiOperation({ summary: 'Update KYC status for a user' })
  updateKyc(@Param('id') id: string, @Body() dto: UpdateKycDto) {
    return this.adminService.updateKyc(id, dto.kycStatus);
  }

  @Patch('renters/:id/commission')
  @ApiOperation({ summary: 'Update per-renter commission rate' })
  updateCommission(@Param('id') id: string, @Body() dto: UpdateCommissionDto) {
    return this.adminService.updateRenterCommission(id, dto.commissionRate);
  }
}
