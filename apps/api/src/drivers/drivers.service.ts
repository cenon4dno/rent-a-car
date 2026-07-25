import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDriverDto } from './dto/create-driver.dto';

@Injectable()
export class DriversService {
  constructor(private readonly prisma: PrismaService) {}

  async create(renterUserId: string, dto: CreateDriverDto) {
    const renterProfile = await this.prisma.renterProfile.findUnique({
      where: { userId: renterUserId },
    });
    if (!renterProfile) throw new ForbiddenException('Renter profile not found');

    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('A user with this email already exists');

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          role: 'DRIVER',
          kycStatus: 'PENDING',
        },
      });
      const driver = await tx.driverProfile.create({
        data: {
          userId: user.id,
          renterId: renterProfile.id,
          licenseUrl: dto.licenseUrl,
          backgroundCheckUrl: dto.backgroundCheckUrl,
        },
        include: { user: true },
      });
      return driver;
    });
  }

  async findByRenter(renterUserId: string) {
    const renterProfile = await this.prisma.renterProfile.findUnique({
      where: { userId: renterUserId },
    });
    if (!renterProfile) throw new ForbiddenException('Renter profile not found');

    return this.prisma.driverProfile.findMany({
      where: { renterId: renterProfile.id },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, kycStatus: true } },
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findPublicById(id: string) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true } },
        bookings: {
          where: { status: 'COMPLETED' },
          select: { id: true },
        },
      },
    });
    if (!driver) throw new NotFoundException('Driver not found');

    const completedTrips = driver.bookings.length;
    return {
      id: driver.id,
      userId: driver.userId,
      name: driver.user.name,
      avatarUrl: driver.user.avatarUrl,
      kycStatus: driver.kycStatus,
      completedTrips,
    };
  }

  async findPrivateById(driverProfileId: string, requestingUserId: string) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { id: driverProfileId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, kycStatus: true } },
        bookings: {
          orderBy: { startDate: 'desc' },
          take: 10,
          include: { vehicle: { select: { make: true, model: true, year: true } } },
        },
      },
    });
    if (!driver) throw new NotFoundException('Driver not found');

    const requestingUser = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
      include: { renterProfile: true },
    });

    const isAdmin = requestingUser?.role === 'ADMIN';
    const isOwnRenter = requestingUser?.renterProfile?.id === driver.renterId;
    const isOwnDriver = driver.userId === requestingUserId;

    if (!isAdmin && !isOwnRenter && !isOwnDriver) {
      throw new ForbiddenException('Access denied');
    }

    return driver;
  }

  async updateDocUrls(
    driverProfileId: string,
    renterUserId: string,
    data: { licenseUrl?: string; backgroundCheckUrl?: string },
  ) {
    const renterProfile = await this.prisma.renterProfile.findUnique({
      where: { userId: renterUserId },
    });
    const driver = await this.prisma.driverProfile.findUnique({ where: { id: driverProfileId } });
    if (!driver) throw new NotFoundException('Driver not found');
    if (!renterProfile || driver.renterId !== renterProfile.id) {
      throw new ForbiddenException('Not your driver');
    }

    return this.prisma.driverProfile.update({
      where: { id: driverProfileId },
      data,
      include: { user: true },
    });
  }

  async getDashboard(userId: string) {
    const driver = await this.prisma.driverProfile.findUnique({
      where: { userId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        bookings: {
          where: { status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] } },
          orderBy: { startDate: 'asc' },
          take: 20,
          include: {
            vehicle: {
              select: { make: true, model: true, year: true, plateNumber: true },
            },
            customer: { select: { user: { select: { name: true } } } },
          },
        },
        _count: { select: { bookings: true } },
      },
    });
    if (!driver) throw new NotFoundException('Driver profile not found');
    return {
      profile: {
        id: driver.id,
        userId: driver.userId,
        licenseUrl: driver.licenseUrl,
        kycStatus: driver.kycStatus,
        user: driver.user,
        renterId: driver.renterId,
        _count: driver._count,
      },
      bookings: driver.bookings,
    };
  }

  async remove(driverProfileId: string, renterUserId: string) {
    const renterProfile = await this.prisma.renterProfile.findUnique({
      where: { userId: renterUserId },
    });
    const driver = await this.prisma.driverProfile.findUnique({ where: { id: driverProfileId } });
    if (!driver) throw new NotFoundException('Driver not found');
    if (!renterProfile || driver.renterId !== renterProfile.id) {
      throw new ForbiddenException('Not your driver');
    }
    await this.prisma.user.delete({ where: { id: driver.userId } });
    return { deleted: true };
  }
}
