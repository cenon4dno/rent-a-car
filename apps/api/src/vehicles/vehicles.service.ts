import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { SearchVehicleDto } from './dto/search-vehicle.dto';

@Injectable()
export class VehiclesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(renterId: string, dto: CreateVehicleDto) {
    const renterProfile = await this.prisma.renterProfile.findUnique({
      where: { userId: renterId },
    });
    if (!renterProfile) throw new ForbiddenException('Renter profile not found');

    return this.prisma.vehicle.create({
      data: {
        ...dto,
        imageUrls: JSON.stringify(dto.imageUrls ?? []),
        vehiclePhotos: JSON.stringify(dto.vehiclePhotos ?? {}),
        registrationDocs: JSON.stringify(dto.registrationDocs ?? {}),
        tags: JSON.stringify(dto.tags ?? []),
        renterId: renterProfile.id,
      },
    });
  }

  async search(dto: SearchVehicleDto) {
    const {
      startDate,
      endDate,
      fuelType,
      transmission,
      minSeats,
      minPrice,
      maxPrice,
      tag,
      page = 1,
      limit = 20,
    } = dto;

    const bookedVehicleIds =
      startDate && endDate
        ? (
            await this.prisma.booking.findMany({
              where: {
                status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
                OR: [
                  { startDate: { lte: new Date(endDate) }, endDate: { gte: new Date(startDate) } },
                ],
              },
              select: { vehicleId: true },
            })
          ).map((b) => b.vehicleId)
        : [];

    const baseWhere = {
      status: 'AVAILABLE' as const,
      id: bookedVehicleIds.length
        ? ({ notIn: bookedVehicleIds } as { notIn: string[] })
        : undefined,
      fuelType: fuelType ?? undefined,
      transmission: transmission ?? undefined,
      seatingCapacity: minSeats ? { gte: minSeats } : undefined,
      dailyRate: { gte: minPrice ?? undefined, lte: maxPrice ?? undefined },
      // SQLite: tags is stored as JSON string — use contains for tag filter
      tags: tag ? { contains: tag } : undefined,
    };

    const [data, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where: baseWhere,
        include: { renter: { select: { companyName: true, trustBadge: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({ where: baseWhere }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findByRenter(userId: string) {
    const renterProfile = await this.prisma.renterProfile.findUnique({ where: { userId } });
    if (!renterProfile) return [];
    return this.prisma.vehicle.findMany({
      where: { renterId: renterProfile.id },
      include: {
        bookings: {
          where: { status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] } },
          select: { id: true, status: true, startDate: true, endDate: true },
        },
        _count: { select: { reviews: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        renter: { select: { companyName: true, trustBadge: true, userId: true } },
        reviews: { take: 10, orderBy: { createdAt: 'desc' } },
      },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    return vehicle;
  }

  async update(id: string, userId: string, dto: UpdateVehicleDto) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { renter: true },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.renter.userId !== userId) throw new ForbiddenException();

    const dtoAny = dto as typeof dto & { tags?: string[] };
    return this.prisma.vehicle.update({
      where: { id },
      data: {
        make: dto.make,
        model: dto.model,
        year: dto.year,
        plateNumber: dto.plateNumber,
        description: dto.description,
        fuelType: dto.fuelType,
        transmission: dto.transmission,
        seatingCapacity: dto.seatingCapacity,
        dailyRate: dto.dailyRate,
        mileageLimit: dto.mileageLimit,
        status: dto.status,
        imageUrls: dto.imageUrls !== undefined ? JSON.stringify(dto.imageUrls) : undefined,
        vehiclePhotos:
          dto.vehiclePhotos !== undefined ? JSON.stringify(dto.vehiclePhotos) : undefined,
        registrationDocs:
          dto.registrationDocs !== undefined ? JSON.stringify(dto.registrationDocs) : undefined,
        tags: dtoAny.tags !== undefined ? JSON.stringify(dtoAny.tags) : undefined,
      },
    });
  }

  async remove(id: string, userId: string) {
    const vehicle = await this.prisma.vehicle.findUnique({
      where: { id },
      include: { renter: true },
    });
    if (!vehicle) throw new NotFoundException('Vehicle not found');
    if (vehicle.renter.userId !== userId) throw new ForbiddenException();

    return this.prisma.vehicle.update({
      where: { id },
      data: { status: 'INACTIVE' },
    });
  }

  async getRenterProfile(renterId: string) {
    const renter = await this.prisma.renterProfile.findUnique({
      where: { id: renterId },
      select: {
        id: true,
        companyName: true,
        trustBadge: true,
        _count: { select: { vehicles: true } },
        vehicles: {
          where: { status: { not: 'INACTIVE' } },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            fuelType: true,
            transmission: true,
            seatingCapacity: true,
            dailyRate: true,
            imageUrls: true,
            vehiclePhotos: true,
            status: true,
            reviews: { select: { rating: true } },
            _count: { select: { reviews: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!renter) throw new NotFoundException('Renter not found');

    const allRatings = renter.vehicles.flatMap((v) => v.reviews.map((r) => r.rating));
    const averageRating = allRatings.length
      ? allRatings.reduce((sum, r) => sum + r, 0) / allRatings.length
      : null;

    return {
      id: renter.id,
      companyName: renter.companyName,
      trustBadge: renter.trustBadge,
      fleetCount: renter._count.vehicles,
      averageRating,
      vehicles: renter.vehicles.map(({ reviews, ...v }) => ({
        ...v,
        averageRating: reviews.length
          ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
          : null,
      })),
    };
  }

  async getFleetAnalytics(userId: string) {
    const renterProfile = await this.prisma.renterProfile.findUnique({ where: { userId } });
    if (!renterProfile) return null;

    const vehicles = await this.prisma.vehicle.findMany({
      where: { renterId: renterProfile.id },
      include: {
        bookings: {
          select: { status: true, totalAmount: true, startDate: true, endDate: true },
        },
        _count: { select: { reviews: true } },
      },
    });

    const now = new Date();
    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) =>
      v.bookings.some((b) => b.status === 'ACTIVE'),
    ).length;
    const utilizationRate = totalVehicles > 0 ? (activeVehicles / totalVehicles) * 100 : 0;

    // Revenue per vehicle (completed bookings only)
    const vehicleRevenue = vehicles
      .map((v) => ({
        id: v.id,
        make: v.make,
        model: v.model,
        year: v.year,
        imageUrls: v.imageUrls,
        status: v.status,
        totalBookings: v.bookings.filter((b) => b.status !== 'CANCELLED').length,
        completedBookings: v.bookings.filter((b) => b.status === 'COMPLETED').length,
        revenue: v.bookings
          .filter((b) => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + b.totalAmount, 0),
        reviewCount: v._count.reviews,
        currentlyBooked: v.bookings.some(
          (b) =>
            b.status === 'ACTIVE' && new Date(b.startDate) <= now && new Date(b.endDate) >= now,
        ),
      }))
      .sort((a, b) => b.revenue - a.revenue);

    // Monthly revenue for last 6 months
    const months: { label: string; revenue: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = d.toLocaleString('en-PH', { month: 'short', year: '2-digit' });
      const revenue = vehicles
        .flatMap((v) => v.bookings)
        .filter(
          (b) =>
            b.status === 'COMPLETED' && new Date(b.startDate) >= d && new Date(b.startDate) < end,
        )
        .reduce((sum, b) => sum + b.totalAmount, 0);
      months.push({ label, revenue });
    }

    // Maintenance schedule forecasting
    // Heuristic: every 30 days of total active use → maintenance recommended
    const MAINTENANCE_INTERVAL_DAYS = 30;
    const maintenanceForecast = vehicles.map((v) => {
      const totalUseDays = v.bookings
        .filter((b) => b.status === 'COMPLETED')
        .reduce((sum, b) => {
          const days = Math.ceil(
            (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) /
              (1000 * 60 * 60 * 24),
          );
          return sum + days;
        }, 0);
      const avgDaysPerMonth = totalUseDays > 0 ? totalUseDays / 6 : 0; // rolling 6-month avg
      const daysUntilMaintenance = Math.max(
        0,
        MAINTENANCE_INTERVAL_DAYS - (totalUseDays % MAINTENANCE_INTERVAL_DAYS),
      );
      const weeksUntilMaintenance =
        avgDaysPerMonth > 0 ? Math.round(daysUntilMaintenance / (avgDaysPerMonth / 4)) : null;

      return {
        id: v.id,
        make: v.make,
        model: v.model,
        year: v.year,
        totalUseDays,
        daysUntilMaintenance,
        weeksUntilMaintenance,
        status: v.status,
        needsMaintenance: daysUntilMaintenance <= 5,
      };
    });

    return {
      totalVehicles,
      activeVehicles,
      utilizationRate: Math.round(utilizationRate),
      topVehicles: vehicleRevenue.slice(0, 5),
      monthlyRevenue: months,
      maintenanceForecast,
    };
  }

  async getCustomerDemographics(userId: string) {
    const renterProfile = await this.prisma.renterProfile.findUnique({ where: { userId } });
    if (!renterProfile) return null;

    const bookings = await this.prisma.booking.findMany({
      where: { renterId: renterProfile.id, status: { in: ['COMPLETED', 'ACTIVE'] } },
      include: {
        customer: {
          include: {
            user: { select: { createdAt: true } },
          },
        },
      },
    });

    // KYC status breakdown
    const kycMap: Record<string, number> = {};
    const seenCustomers = new Set<string>();
    const bookingsPerCustomer: Record<string, number> = {};
    const repeatCustomerIds = new Set<string>();

    for (const b of bookings) {
      const cid = b.customerId;
      const kyc = b.customer.kycStatus;
      if (!seenCustomers.has(cid)) {
        kycMap[kyc] = (kycMap[kyc] ?? 0) + 1;
        seenCustomers.add(cid);
      }
      bookingsPerCustomer[cid] = (bookingsPerCustomer[cid] ?? 0) + 1;
    }

    for (const [cid, count] of Object.entries(bookingsPerCustomer)) {
      if (count > 1) repeatCustomerIds.add(cid);
    }

    const totalCustomers = seenCustomers.size;
    const repeatCustomers = repeatCustomerIds.size;
    const newCustomers = totalCustomers - repeatCustomers;

    // Monthly new customers (last 6 months) — by first booking date with this renter
    const now = new Date();
    const firstBookingByCustomer: Record<string, Date> = {};
    for (const b of bookings) {
      const d = new Date(b.createdAt);
      if (!firstBookingByCustomer[b.customerId] || d < firstBookingByCustomer[b.customerId]) {
        firstBookingByCustomer[b.customerId] = d;
      }
    }

    const monthlyNew: { label: string; count: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const label = start.toLocaleString('en-PH', { month: 'short', year: '2-digit' });
      const count = Object.values(firstBookingByCustomer).filter(
        (d) => d >= start && d < end,
      ).length;
      monthlyNew.push({ label, count });
    }

    // Top customers by booking count
    const topCustomers = Object.entries(bookingsPerCustomer)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([customerId, count]) => ({ customerId, bookings: count }));

    return {
      totalCustomers,
      repeatCustomers,
      newCustomers,
      repeatRate: totalCustomers > 0 ? Math.round((repeatCustomers / totalCustomers) * 100) : 0,
      kycBreakdown: Object.entries(kycMap).map(([status, count]) => ({ status, count })),
      monthlyNewCustomers: monthlyNew,
      topCustomers,
    };
  }

  async getTopRenters(limit = 6) {
    const renters = await this.prisma.renterProfile.findMany({
      where: { trustBadge: { not: 'NOT_VERIFIED' } },
      select: {
        id: true,
        companyName: true,
        trustBadge: true,
        _count: { select: { vehicles: true } },
      },
      orderBy: { vehicles: { _count: 'desc' } },
      take: limit,
    });
    return renters.map((r) => ({
      id: r.id,
      companyName: r.companyName,
      trustBadge: r.trustBadge,
      fleetCount: r._count.vehicles,
    }));
  }
}
