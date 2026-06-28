import { Controller, Get, Post, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { DisputesService } from './disputes.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@ApiTags('disputes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('disputes')
export class DisputesController {
  constructor(private readonly disputesService: DisputesService) {}

  @Post()
  async create(@Body() dto: CreateDisputeDto, @Req() req: { user: { userId: string } }) {
    return { data: await this.disputesService.create(req.user.userId, dto) };
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async findAll() {
    return { data: await this.disputesService.findAll() };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return { data: await this.disputesService.findById(id) };
  }

  @Patch(':id/resolve')
  @UseGuards(RolesGuard)
  @Roles('ADMIN')
  async resolve(@Param('id') id: string, @Body('resolution') resolution: string) {
    return { data: await this.disputesService.resolve(id, resolution) };
  }
}
