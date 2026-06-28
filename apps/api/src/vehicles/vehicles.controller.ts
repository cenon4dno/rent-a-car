import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { SearchVehicleDto } from './dto/search-vehicle.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @Get()
  @ApiOperation({ summary: 'Search available vehicles with optional date/filter params' })
  search(@Query() dto: SearchVehicleDto) {
    return this.vehiclesService.search(dto);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RENTER')
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get the authenticated renter's fleet with active booking counts" })
  findMine(@Request() req: { user: { id: string } }) {
    return this.vehiclesService.findByRenter(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vehicle detail with renter info and recent reviews' })
  findOne(@Param('id') id: string) {
    return this.vehiclesService.findOne(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RENTER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add a vehicle to the renter fleet' })
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RENTER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update vehicle details or status' })
  update(
    @Param('id') id: string,
    @Request() req: { user: { id: string } },
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, req.user.id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('RENTER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Soft-delete a vehicle (sets status to INACTIVE)' })
  remove(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.vehiclesService.remove(id, req.user.id);
  }
}
