import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';

@Injectable()
export class DisputesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(reporterId: string, dto: CreateDisputeDto) {
    const booking = await this.prisma.booking.findUnique({ where: { id: dto.bookingId } });
    if (!booking) throw new NotFoundException('Booking not found');

    return this.prisma.dispute.create({
      data: {
        bookingId: dto.bookingId,
        reporterId,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.dispute.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');
    return dispute;
  }

  async resolve(id: string, resolution: string) {
    const dispute = await this.prisma.dispute.findUnique({ where: { id } });
    if (!dispute) throw new NotFoundException('Dispute not found');

    return this.prisma.dispute.update({
      where: { id },
      data: { status: 'RESOLVED', resolution },
    });
  }
}
