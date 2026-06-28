import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Inject,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { IPaymentProvider, CardDetails } from './providers/payment-provider.interface';

export const PAYMENT_PROVIDER = 'PAYMENT_PROVIDER';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(PAYMENT_PROVIDER) private readonly provider: IPaymentProvider,
  ) {}

  async initiatePayment(
    bookingId: string,
    paymentMethod: string,
    baseUrl: string,
    cardDetails?: CardDetails,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.payment) throw new ConflictException('Payment already exists for this booking');

    const intent = await this.provider.createIntent({
      bookingId,
      amount: booking.totalAmount,
      currency: 'PHP',
      paymentMethod,
      successUrl: `${baseUrl}/booking/${bookingId}`,
      failedUrl: `${baseUrl}/booking/review?error=payment_failed`,
      cardDetails,
    });

    await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          bookingId,
          amount: booking.totalAmount,
          provider: paymentMethod,
          providerRef: intent.providerRef,
          status: 'PENDING',
        },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED', reservedUntil: null },
      }),
    ]);

    if (intent.directConfirm) {
      await this.confirmPayment(bookingId);
    }

    return {
      checkoutUrl: intent.checkoutUrl,
      directConfirm: intent.directConfirm,
      bookingId,
    };
  }

  async handleWebhook(rawBody: string, signature: string) {
    if (!this.provider.verifyWebhookSignature(rawBody, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>;
    if (!this.provider.isSuccessEvent(payload)) {
      return { received: true };
    }

    const bookingId = this.provider.extractBookingIdFromWebhook(payload);
    if (!bookingId) {
      this.logger.warn('Webhook received but could not extract bookingId');
      return { received: true };
    }

    await this.confirmPayment(bookingId).catch((err) =>
      this.logger.error(`Webhook confirm failed for booking ${bookingId}: ${String(err)}`),
    );

    return { received: true };
  }

  // Legacy endpoint kept for backward compat with existing stub flow
  async createForBooking(bookingId: string, dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.payment) throw new ConflictException('Payment already exists for this booking');

    const [payment] = await this.prisma.$transaction([
      this.prisma.payment.create({
        data: {
          bookingId,
          amount: booking.totalAmount,
          provider: dto.provider,
          providerRef: dto.providerRef,
          status: 'PENDING',
        },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CONFIRMED', reservedUntil: null },
      }),
    ]);
    return payment;
  }

  async confirmPayment(bookingId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) throw new NotFoundException('Payment not found');

    return this.prisma.payment.update({
      where: { bookingId },
      data: { status: 'PAID', paidAt: new Date() },
    });
  }

  async refund(bookingId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) throw new NotFoundException('Payment not found');
    if (payment.status !== 'PAID')
      throw new ConflictException('Payment is not in a refundable state');

    return this.prisma.$transaction([
      this.prisma.payment.update({
        where: { bookingId },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      }),
      this.prisma.booking.update({
        where: { id: bookingId },
        data: { status: 'CANCELLED' },
      }),
    ]);
  }

  async findByBooking(bookingId: string) {
    const payment = await this.prisma.payment.findUnique({ where: { bookingId } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }
}
