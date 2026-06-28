import { Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus, KycStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const notCancelled = { status: { notIn: [BookingStatus.CANCELLED] } };

    const [
      usersByRole,
      vehiclesByStatus,
      bookingsByStatus,
      gmvTotal,
      commissionTotal,
      gmvMtd,
      commissionMtd,
      recentBookings,
    ] = await Promise.all([
      this.prisma.user.groupBy({ by: ['role'], _count: { id: true } }),
      this.prisma.vehicle.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.booking.groupBy({ by: ['status'], _count: { id: true } }),
      this.prisma.booking.aggregate({
        where: notCancelled,
        _sum: { totalAmount: true },
      }),
      this.prisma.booking.aggregate({
        where: notCancelled,
        _sum: { platformFee: true },
      }),
      this.prisma.booking.aggregate({
        where: { ...notCancelled, createdAt: { gte: monthStart } },
        _sum: { totalAmount: true },
      }),
      this.prisma.booking.aggregate({
        where: { ...notCancelled, createdAt: { gte: monthStart } },
        _sum: { platformFee: true },
      }),
      this.prisma.booking.findMany({
        include: {
          vehicle: { select: { make: true, model: true } },
          renter: { select: { companyName: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      users: Object.fromEntries(usersByRole.map((g) => [g.role, g._count.id])),
      vehicles: Object.fromEntries(vehiclesByStatus.map((g) => [g.status, g._count.id])),
      bookings: Object.fromEntries(bookingsByStatus.map((g) => [g.status, g._count.id])),
      gmv: {
        total: gmvTotal._sum.totalAmount ?? 0,
        mtd: gmvMtd._sum.totalAmount ?? 0,
      },
      commission: {
        total: commissionTotal._sum.platformFee ?? 0,
        mtd: commissionMtd._sum.platformFee ?? 0,
      },
      recentBookings,
    };
  }

  async getUsers() {
    return this.prisma.user.findMany({
      include: {
        renterProfile: {
          select: { id: true, companyName: true, trustBadge: true, commissionRate: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
  }

  async updateKyc(userId: string, kycStatus: KycStatus) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return this.prisma.user.update({ where: { id: userId }, data: { kycStatus } });
  }

  async updateRenterCommission(renterProfileId: string, commissionRate: number) {
    const profile = await this.prisma.renterProfile.findUnique({
      where: { id: renterProfileId },
    });
    if (!profile) throw new NotFoundException('Renter profile not found');
    return this.prisma.renterProfile.update({
      where: { id: renterProfileId },
      data: { commissionRate },
    });
  }

  async getRenters() {
    return this.prisma.renterProfile.findMany({
      include: { user: { select: { id: true, name: true, email: true, kycStatus: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }
}
