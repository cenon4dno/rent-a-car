import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { NotificationsService } from '../notifications/notifications.service';

const PLATFORM_FEE_RATE = 0.05;
const RESERVATION_HOLD_MINUTES = 10;
const ADDON_RATES = { childSeat: 500, chauffeur: 1500 };

@Injectable()
export class BookingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifications: NotificationsService,
  ) {}

  async create(customerId: string, dto: CreateBookingDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    if (start >= end) throw new BadRequestException('startDate must be before endDate');

    return this.prisma.$transaction(async (tx) => {
      // Lock: check for overlapping confirmed/active/pending bookings
      const conflict = await tx.booking.findFirst({
        where: {
          vehicleId: dto.vehicleId,
          status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
          OR: [{ startDate: { lte: end }, endDate: { gte: start } }],
          // Ignore expired reservation holds
          NOT: {
            status: 'PENDING',
            reservedUntil: { lt: new Date() },
          },
        },
      });
      if (conflict) throw new ConflictException('Vehicle is not available for the selected dates');

      const vehicle = await tx.vehicle.findUnique({ where: { id: dto.vehicleId } });
      if (!vehicle || vehicle.status !== 'AVAILABLE') {
        throw new ConflictException('Vehicle is not available');
      }

      const customerProfile = await tx.customerProfile.findUnique({
        where: { userId: customerId },
      });
      if (!customerProfile) throw new ForbiddenException('Customer profile not found');

      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const baseAmount = days * vehicle.dailyRate;
      const addonsAmount =
        (dto.childSeat ? ADDON_RATES.childSeat * days : 0) +
        (dto.chauffeur ? ADDON_RATES.chauffeur * days : 0);
      const totalAmount = baseAmount + addonsAmount;
      const platformFee = Math.round(totalAmount * PLATFORM_FEE_RATE);

      const reservedUntil = new Date(Date.now() + RESERVATION_HOLD_MINUTES * 60 * 1000);

      return tx.booking.create({
        data: {
          vehicleId: dto.vehicleId,
          customerId: customerProfile.id,
          renterId: vehicle.renterId,
          driverId: dto.driverId ?? null,
          pickupLocation: dto.pickupLocation,
          startDate: start,
          endDate: end,
          dailyRate: vehicle.dailyRate,
          platformFeeRate: PLATFORM_FEE_RATE,
          addonsAmount,
          totalAmount,
          platformFee,
          status: 'PENDING',
          reservedUntil,
        },
        include: { vehicle: true },
      });
    });
  }

  async findAll(userId: string, role: string) {
    if (role === 'CUSTOMER') {
      const profile = await this.prisma.customerProfile.findUnique({ where: { userId } });
      if (!profile) return [];
      return this.prisma.booking.findMany({
        where: { customerId: profile.id },
        include: { vehicle: true, driver: true },
        orderBy: { createdAt: 'desc' },
      });
    }
    if (role === 'RENTER') {
      const profile = await this.prisma.renterProfile.findUnique({ where: { userId } });
      if (!profile) return [];
      return this.prisma.booking.findMany({
        where: { renterId: profile.id },
        include: { vehicle: true, customer: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
      });
    }
    // ADMIN sees all
    return this.prisma.booking.findMany({
      include: { vehicle: true, customer: true, renter: true },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { vehicle: true, customer: true, renter: true, driver: true, payment: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async confirm(id: string, renterId: string) {
    return this.updateStatus(id, BookingStatus.CONFIRMED, renterId, 'RENTER');
  }

  async cancel(id: string, userId: string, role: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        renter: { include: { user: true } },
        customer: { include: { user: true } },
        vehicle: true,
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (role === 'RENTER' && booking.renter.userId !== userId) throw new ForbiddenException();
    if (role === 'CUSTOMER' && booking.customer.userId !== userId) throw new ForbiddenException();

    // SLA-based refund calculation
    const hoursUntilPickup =
      (new Date(booking.startDate).getTime() - Date.now()) / (1000 * 60 * 60);
    let refundRate = 0;
    if (hoursUntilPickup >= 48) refundRate = 1.0;
    else if (hoursUntilPickup >= 24) refundRate = 0.5;

    const refundAmount = Math.round(booking.totalAmount * refundRate);

    await this.prisma.booking.update({ where: { id }, data: { status: BookingStatus.CANCELLED } });

    if (booking.payment?.status === 'PAID' && refundAmount > 0) {
      await this.prisma.payment.update({
        where: { bookingId: id },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      });
    }

    const vehicleName = `${booking.vehicle.make} ${booking.vehicle.model}`;
    const ref = `RAC-${booking.id.toUpperCase().slice(0, 8)}`;

    // Email notifications (fire-and-forget)
    void this.notifications.sendBookingCancellation({
      to: booking.customer.user.email,
      customerName: booking.customer.user.name,
      vehicleName,
      referenceNumber: ref,
      refundAmount,
      refundRate,
    });
    void this.notifications.sendRenterCancellationAlert({
      to: booking.renter.user.email,
      renterName: booking.renter.user.name,
      vehicleName,
      referenceNumber: ref,
      startDate: booking.startDate,
    });

    return {
      ...booking,
      status: BookingStatus.CANCELLED,
      refundAmount,
      refundRate,
    };
  }

  async assignDriver(bookingId: string, driverProfileId: string, renterUserId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { renter: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.renter.userId !== renterUserId) throw new ForbiddenException();

    const driver = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
    });
    if (!driver || driver.renterId !== booking.renterId) {
      throw new ForbiddenException('Driver does not belong to your fleet');
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { driverId: driverProfileId },
      include: { driver: { include: { user: true } } },
    });
  }

  async complete(id: string, renterId: string) {
    return this.updateStatus(id, BookingStatus.COMPLETED, renterId, 'RENTER');
  }

  async reportDriverNoShow(bookingId: string, customerUserId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { include: { user: true } },
        renter: { include: { user: true } },
        vehicle: true,
        payment: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customer.userId !== customerUserId) throw new ForbiddenException();
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new BadRequestException(
        'Driver no-show can only be reported for pending/confirmed bookings',
      );
    }

    const ref = `RAC-${booking.id.toUpperCase().slice(0, 8)}`;
    const vehicleName = `${booking.vehicle.make} ${booking.vehicle.model}`;

    await this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: BookingStatus.CANCELLED },
    });

    if (booking.payment?.status === 'PAID') {
      await this.prisma.payment.update({
        where: { bookingId },
        data: { status: 'REFUNDED', refundedAt: new Date() },
      });
    }

    // High-severity penalty flag on renter profile
    await this.prisma.renterProfile.update({
      where: { id: booking.renterId },
      data: { penaltyFlags: { increment: 1 } },
    });

    void this.notifications.sendDriverNoShow({
      to: booking.customer.user.email,
      customerName: booking.customer.user.name,
      vehicleName,
      referenceNumber: ref,
    });
    void this.notifications.sendDriverNoShowRenterPenalty({
      to: booking.renter.user.email,
      renterName: booking.renter.user.name,
      vehicleName,
      referenceNumber: ref,
    });

    return { bookingId, status: BookingStatus.CANCELLED, refunded: true };
  }

  async reportLateReturn(bookingId: string, renterUserId: string, extraDays: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { include: { user: true } },
        renter: { include: { user: true } },
        vehicle: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.renter.userId !== renterUserId) throw new ForbiddenException();
    if (booking.status !== 'ACTIVE') {
      throw new BadRequestException('Late return can only be reported for active bookings');
    }

    const penaltyAmount = Math.round(booking.dailyRate * 1.5 * extraDays);
    const ref = `RAC-${booking.id.toUpperCase().slice(0, 8)}`;
    const vehicleName = `${booking.vehicle.make} ${booking.vehicle.model}`;

    void this.notifications.sendLateReturnAlert({
      to: booking.renter.user.email,
      renterName: booking.renter.user.name,
      vehicleName,
      referenceNumber: ref,
      endDate: booking.endDate,
    });
    void this.notifications.sendLateReturnPenaltyCharge({
      to: booking.customer.user.email,
      customerName: booking.customer.user.name,
      vehicleName,
      referenceNumber: ref,
      penaltyAmount,
      extraDays,
    });

    return { bookingId, penaltyAmount, extraDays };
  }

  async reportSos(bookingId: string, customerUserId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        customer: { include: { user: true } },
        renter: { include: { user: true } },
        vehicle: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customer.userId !== customerUserId) throw new ForbiddenException();
    if (booking.status !== 'ACTIVE') {
      throw new BadRequestException('SOS can only be triggered for active bookings');
    }

    const ref = `RAC-${booking.id.toUpperCase().slice(0, 8)}`;
    const vehicleName = `${booking.vehicle.make} ${booking.vehicle.model}`;

    void this.notifications.sendSosAlert({
      to: booking.renter.user.email,
      name: booking.renter.user.name,
      vehicleName,
      referenceNumber: ref,
      pickupLocation: booking.pickupLocation,
    });

    // Also alert admins
    const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN' } });
    for (const admin of admins) {
      void this.notifications.sendSosAlert({
        to: admin.email,
        name: admin.name,
        vehicleName,
        referenceNumber: ref,
        pickupLocation: booking.pickupLocation,
      });
    }

    return { bookingId, sosFired: true };
  }

  private async updateStatus(id: string, status: BookingStatus, userId: string, role: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { renter: true, customer: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (role === 'RENTER' && booking.renter.userId !== userId) throw new ForbiddenException();
    if (role === 'CUSTOMER' && booking.customer.userId !== userId) throw new ForbiddenException();

    return this.prisma.booking.update({ where: { id }, data: { status } });
  }
}
