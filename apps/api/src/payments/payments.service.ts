import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createForBooking(bookingId: string, dto: CreatePaymentDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.payment) throw new ConflictException('Payment already exists for this booking');

    // Mark booking as confirmed once payment record is created
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
