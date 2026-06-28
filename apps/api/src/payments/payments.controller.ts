import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Req,
  UseGuards,
  RawBodyRequest,
  Headers,
} from '@nestjs/common';
import { Request } from 'express';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CardDetails } from './providers/payment-provider.interface';

class CardDetailsDto implements CardDetails {
  @ApiProperty() @IsString() @IsNotEmpty() cardNumber: string;
  @ApiProperty() @IsInt() @Min(1) @Max(12) expMonth: number;
  @ApiProperty() @IsInt() @Min(2024) @Max(2099) expYear: number;
  @ApiProperty() @IsString() @IsNotEmpty() cvc: string;
  @ApiProperty() @IsString() @IsNotEmpty() cardHolder: string;
}

class InitiatePaymentDto {
  @ApiProperty({ description: 'Payment method: card | gcash | maya' })
  @IsString()
  paymentMethod: string;

  @ApiPropertyOptional({ description: 'Frontend base URL for redirect URLs' })
  @IsOptional()
  @IsString()
  baseUrl?: string;

  @ApiPropertyOptional({ type: CardDetailsDto })
  @IsOptional()
  cardDetails?: CardDetailsDto;
}

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':bookingId/initiate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Initiate payment via provider (stub or PayMongo)' })
  initiate(
    @Param('bookingId') bookingId: string,
    @Body() dto: InitiatePaymentDto,
    @Req() req: Request,
  ) {
    const baseUrl = dto.baseUrl ?? `${req.protocol}://${req.get('host')}`.replace('/api/v1', '');
    return this.paymentsService.initiatePayment(
      bookingId,
      dto.paymentMethod,
      baseUrl,
      dto.cardDetails,
    );
  }

  @Post('webhook')
  @ApiOperation({ summary: 'Receive payment provider webhook (no auth)' })
  webhook(@Req() req: RawBodyRequest<Request>, @Headers('paymongo-signature') signature: string) {
    const rawBody = req.rawBody?.toString() ?? JSON.stringify(req.body);
    return this.paymentsService.handleWebhook(rawBody, signature ?? '');
  }

  @Post(':bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Legacy] Attach a payment to a booking' })
  create(@Param('bookingId') bookingId: string, @Body() dto: CreatePaymentDto) {
    return this.paymentsService.createForBooking(bookingId, dto);
  }

  @Get(':bookingId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment status for a booking' })
  findOne(@Param('bookingId') bookingId: string) {
    return this.paymentsService.findByBooking(bookingId);
  }

  @Patch(':bookingId/confirm')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark payment as paid (called by webhook handler)' })
  confirm(@Param('bookingId') bookingId: string) {
    return this.paymentsService.confirmPayment(bookingId);
  }

  @Patch(':bookingId/refund')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund payment and cancel booking' })
  refund(@Param('bookingId') bookingId: string) {
    return this.paymentsService.refund(bookingId);
  }
}
