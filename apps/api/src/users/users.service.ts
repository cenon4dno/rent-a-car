import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SsoUpsertInput {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
  image?: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertFromSso(input: SsoUpsertInput) {
    return this.prisma.user.upsert({
      where: { email: input.email },
      update: {
        name: input.name,
        avatarUrl: input.image,
      },
      create: {
        email: input.email,
        name: input.name,
        avatarUrl: input.image,
        role: 'CUSTOMER',
        kycStatus: 'PENDING',
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }
}
