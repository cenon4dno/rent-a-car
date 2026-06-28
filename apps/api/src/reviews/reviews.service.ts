import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateReviewDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: { customer: true, review: true },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    if (booking.customer.userId !== userId) throw new ForbiddenException();
    if (booking.status !== 'COMPLETED')
      throw new ForbiddenException('Can only review completed bookings');
    if (booking.review) throw new ConflictException('Review already submitted for this booking');

    const customerProfile = await this.prisma.customerProfile.findUnique({ where: { userId } });
    if (!customerProfile) throw new ForbiddenException();

    return this.prisma.review.create({
      data: {
        bookingId: dto.bookingId,
        vehicleId: dto.vehicleId,
        reviewerId: customerProfile.id,
        rating: dto.rating,
        comment: dto.comment,
      },
    });
  }

  async findByVehicle(vehicleId: string) {
    const reviews = await this.prisma.review.findMany({
      where: { vehicleId },
      include: { reviewer: { include: { user: { select: { name: true, avatarUrl: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
    const avg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    return { data: reviews, averageRating: Math.round(avg * 10) / 10, total: reviews.length };
  }

  async findByRenter(renterId: string) {
    const vehicles = await this.prisma.vehicle.findMany({
      where: { renterId },
      select: { id: true },
    });
    const vehicleIds = vehicles.map((v) => v.id);
    const reviews = await this.prisma.review.findMany({
      where: { vehicleId: { in: vehicleIds } },
      include: { vehicle: { select: { make: true, model: true } } },
      orderBy: { createdAt: 'desc' },
    });
    const avg = reviews.length ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : 0;
    return { data: reviews, averageRating: Math.round(avg * 10) / 10, total: reviews.length };
  }
}
