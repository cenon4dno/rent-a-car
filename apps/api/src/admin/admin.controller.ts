import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsString, IsOptional, IsIn, Max, Min } from 'class-validator';
import { KycStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('legal')
@Controller('legal')
export class LegalController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  list() {
    return this.adminService.getLegalPages();
  }

  @Get(':slug')
  get(@Param('slug') slug: string) {
    return this.adminService.getLegalPageBySlug(slug);
  }
}

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

class UpsertLegalPageDto {
  @IsString()
  title: string;

  @IsString()
  content: string;

  @IsString()
  @IsOptional()
  slug?: string;
}

class UpdateHomepageConfigDto {
  @IsOptional()
  slides?: unknown[];

  @IsOptional()
  @IsIn(['AUTO', 'MANUAL'])
  featuredMode?: string;

  @IsOptional()
  featuredIds?: string[];
}

@ApiTags('homepage-config')
@Controller('homepage-config')
export class HomepageConfigController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  getConfig() {
    return this.adminService.getHomepageConfig();
  }

  @Patch()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @ApiBearerAuth()
  updateConfig(@Body() dto: UpdateHomepageConfigDto) {
    return this.adminService.updateHomepageConfig(dto);
  }
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

  @Get('legal')
  @ApiOperation({ summary: 'List all legal pages' })
  getLegalPages() {
    return this.adminService.getLegalPages();
  }

  @Post('legal')
  @ApiOperation({ summary: 'Create a new legal page' })
  createLegalPage(@Body() dto: UpsertLegalPageDto) {
    return this.adminService.upsertLegalPage(
      dto.slug ?? dto.title.toLowerCase().replace(/\s+/g, '-'),
      dto.title,
      dto.content,
    );
  }

  @Patch('legal/:slug')
  @ApiOperation({ summary: 'Update a legal page by slug' })
  updateLegalPage(@Param('slug') slug: string, @Body() dto: UpsertLegalPageDto) {
    return this.adminService.upsertLegalPage(slug, dto.title, dto.content);
  }
}
