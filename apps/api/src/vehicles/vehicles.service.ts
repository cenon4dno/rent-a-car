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

    const [data, total] = await this.prisma.$transaction([
      this.prisma.vehicle.findMany({
        where: {
          status: 'AVAILABLE',
          id: bookedVehicleIds.length ? { notIn: bookedVehicleIds } : undefined,
          fuelType: fuelType ?? undefined,
          transmission: transmission ?? undefined,
          seatingCapacity: minSeats ? { gte: minSeats } : undefined,
          dailyRate: {
            gte: minPrice ?? undefined,
            lte: maxPrice ?? undefined,
          },
        },
        include: { renter: { select: { companyName: true, trustBadge: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.count({
        where: {
          status: 'AVAILABLE',
          id: bookedVehicleIds.length ? { notIn: bookedVehicleIds } : undefined,
          fuelType: fuelType ?? undefined,
          transmission: transmission ?? undefined,
          seatingCapacity: minSeats ? { gte: minSeats } : undefined,
          dailyRate: { gte: minPrice ?? undefined, lte: maxPrice ?? undefined },
        },
      }),
    ]);

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
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

    return this.prisma.vehicle.update({
      where: { id },
      data: {
        ...dto,
        imageUrls: dto.imageUrls ? JSON.stringify(dto.imageUrls) : undefined,
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
}
