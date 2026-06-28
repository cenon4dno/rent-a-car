import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

const PLATFORM_FEE_RATE = 0.05;
const RESERVATION_HOLD_MINUTES = 10;

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

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
      const totalAmount = days * vehicle.dailyRate;
      const platformFee = totalAmount * PLATFORM_FEE_RATE;

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
    return this.updateStatus(id, 'CONFIRMED', renterId, 'RENTER');
  }

  async cancel(id: string, userId: string, role: string) {
    return this.updateStatus(id, 'CANCELLED', userId, role);
  }

  async complete(id: string, renterId: string) {
    return this.updateStatus(id, 'COMPLETED', renterId, 'RENTER');
  }

  private async updateStatus(id: string, status: string, userId: string, role: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: { renter: true, customer: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    if (role === 'RENTER' && booking.renter.userId !== userId) throw new ForbiddenException();
    if (role === 'CUSTOMER' && booking.customer.userId !== userId) throw new ForbiddenException();

    return this.prisma.booking.update({ where: { id }, data: { status: status as any } });
  }
}
