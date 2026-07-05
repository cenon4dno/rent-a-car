import { Controller, Get, Post, Delete, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dto/create-driver.dto';

@ApiTags('drivers')
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Post()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RENTER')
  async create(@Body() dto: CreateDriverDto, @Req() req: { user: { id: string } }) {
    return { data: await this.driversService.create(req.user.id, dto) };
  }

  @Get('my')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RENTER')
  async findMine(@Req() req: { user: { id: string } }) {
    return { data: await this.driversService.findByRenter(req.user.id) };
  }

  @Get(':id')
  async findPublic(@Param('id') id: string) {
    return { data: await this.driversService.findPublicById(id) };
  }

  @Get(':id/private')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  async findPrivate(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return { data: await this.driversService.findPrivateById(id, req.user.id) };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RENTER')
  async remove(@Param('id') id: string, @Req() req: { user: { id: string } }) {
    return { data: await this.driversService.remove(id, req.user.id) };
  }
}
