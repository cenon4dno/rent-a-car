import { Controller, Get, Post, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('bookings')
@Controller('bookings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a booking with a 10-minute reservation hold' })
  create(@Request() req: { user: { id: string } }, @Body() dto: CreateBookingDto) {
    return this.bookingsService.create(req.user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List bookings for the current user (role-filtered)' })
  findAll(@Request() req: { user: { id: string; role: string } }) {
    return this.bookingsService.findAll(req.user.id, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking detail' })
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Patch(':id/confirm')
  @ApiOperation({ summary: 'Renter confirms a pending booking' })
  confirm(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.bookingsService.confirm(id, req.user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel a booking (customer or renter)' })
  cancel(@Param('id') id: string, @Request() req: { user: { id: string; role: string } }) {
    return this.bookingsService.cancel(id, req.user.id, req.user.role);
  }

  @Patch(':id/assign-driver')
  @UseGuards(RolesGuard)
  @Roles('RENTER')
  @ApiOperation({ summary: 'Renter assigns a driver to a booking' })
  assignDriver(
    @Param('id') id: string,
    @Body('driverProfileId') driverProfileId: string,
    @Request() req: { user: { id: string } },
  ) {
    return this.bookingsService.assignDriver(id, driverProfileId, req.user.id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Renter marks booking as completed' })
  complete(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.bookingsService.complete(id, req.user.id);
  }

  @Post(':id/driver-no-show')
  @ApiOperation({ summary: 'Customer reports driver no-show — full refund issued' })
  reportDriverNoShow(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.bookingsService.reportDriverNoShow(id, req.user.id);
  }

  @Post(':id/late-return')
  @UseGuards(RolesGuard)
  @Roles('RENTER')
  @ApiOperation({ summary: 'Renter reports late return — charges penalty to customer' })
  reportLateReturn(
    @Param('id') id: string,
    @Body('extraDays') extraDays: number,
    @Request() req: { user: { id: string } },
  ) {
    return this.bookingsService.reportLateReturn(id, req.user.id, extraDays ?? 1);
  }

  @Post(':id/sos')
  @ApiOperation({ summary: 'Customer triggers SOS — notifies renter and admin' })
  reportSos(@Param('id') id: string, @Request() req: { user: { id: string } }) {
    return this.bookingsService.reportSos(id, req.user.id);
  }
}
