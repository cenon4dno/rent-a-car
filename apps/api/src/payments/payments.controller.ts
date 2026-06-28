import { Controller, Post, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':bookingId')
  @ApiOperation({ summary: 'Attach a payment to a booking (initiates payment flow)' })
  create(@Param('bookingId') bookingId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createForBooking(bookingId, dto);
  }

  @Get(':bookingId')
  @ApiOperation({ summary: 'Get payment status for a booking' })
  findOne(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findByBooking(bookingId);
  }

  @Patch(':bookingId/confirm')
  @ApiOperation({ summary: 'Mark payment as paid (called by webhook handler)' })
  confirm(@Param('bookingId') bookingId: string) {
    return this.paymentsService.confirmPayment(bookingId);
  }

  @Patch(':bookingId/refund')
  @ApiOperation({ summary: 'Refund payment and cancel booking' })
  refund(@Param('bookingId') bookingId: string) {
    return this.paymentsService.refund(bookingId);
  }
}
