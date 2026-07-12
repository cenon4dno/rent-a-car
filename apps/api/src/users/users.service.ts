import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateMeDto } from './dto/update-me.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

interface SsoUpsertInput {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
  image?: string;
}

export type DocumentType =
  'license' | 'licenseBack' | 'secondaryId' | 'businessPermit' | 'companyReg' | 'avatar';

const CUSTOMER_DOC_FIELDS: Partial<Record<DocumentType, string>> = {
  license: 'licenseUrl',
  licenseBack: 'licenseBackUrl',
  secondaryId: 'secondaryIdUrl',
};

const RENTER_DOC_FIELDS: Partial<Record<DocumentType, string>> = {
  businessPermit: 'businessPermitUrl',
  companyReg: 'companyRegUrl',
};

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
        customerProfile: { create: {} },
      },
      include: { customerProfile: true },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email }, include: { customerProfile: true } });
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: true,
        renterProfile: true,
        driverProfile: true,
      },
    });
    if (!user) return null;
    const { passwordHash, ...rest } = user;
    return { ...rest, hasPassword: !!passwordHash };
  }

  async updateMe(userId: string, dto: UpdateMeDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { renterProfile: true },
    });
    if (!user) throw new BadRequestException('User not found');

    const userData: { name?: string; phone?: string } = {};
    if (dto.name !== undefined) userData.name = dto.name;
    if (dto.phone !== undefined) userData.phone = dto.phone;

    const renterData: { companyName?: string; taxIdNumber?: string; bankAccountDetails?: string } =
      {};
    if (user.renterProfile) {
      if (dto.companyName !== undefined) renterData.companyName = dto.companyName;
      if (dto.taxIdNumber !== undefined) renterData.taxIdNumber = dto.taxIdNumber;
      if (dto.bankAccountDetails !== undefined)
        renterData.bankAccountDetails = dto.bankAccountDetails;
    }

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...userData,
        ...(Object.keys(renterData).length > 0 ? { renterProfile: { update: renterData } } : {}),
      },
      include: { customerProfile: true, renterProfile: true, driverProfile: true },
    });
    const { passwordHash, ...rest } = updated;
    return { ...rest, hasPassword: !!passwordHash };
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException('User not found');

    if (user.passwordHash) {
      if (!dto.currentPassword) {
        throw new BadRequestException('Current password is required');
      }
      const valid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
      if (!valid) throw new UnauthorizedException('Current password is incorrect');
    }

    const passwordHash = await bcrypt.hash(dto.newPassword, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { changed: true };
  }

  async updateDocumentUrl(userId: string, docType: DocumentType, fileUrl: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { customerProfile: true, renterProfile: true, driverProfile: true },
    });
    if (!user) throw new BadRequestException('User not found');

    if (docType === 'avatar') {
      await this.prisma.user.update({ where: { id: userId }, data: { avatarUrl: fileUrl } });
      return { fileUrl };
    }

    if (docType === 'license' && user.driverProfile) {
      await this.prisma.driverProfile.update({
        where: { userId },
        data: { licenseUrl: fileUrl },
      });
      return { fileUrl };
    }

    const customerField = CUSTOMER_DOC_FIELDS[docType];
    const renterField = RENTER_DOC_FIELDS[docType];

    // Customers who signed up before profiles were auto-created may lack one
    if (customerField && user.role === 'CUSTOMER' && !user.customerProfile) {
      user.customerProfile = await this.ensureCustomerProfile(userId);
    }

    if (customerField && user.customerProfile) {
      await this.prisma.customerProfile.update({
        where: { userId },
        data: { [customerField]: fileUrl },
      });
    } else if (renterField && user.renterProfile) {
      await this.prisma.renterProfile.update({
        where: { userId },
        data: { [renterField]: fileUrl },
      });
    } else {
      throw new BadRequestException(`Document type '${docType}' not applicable for this user`);
    }

    return { fileUrl };
  }

  async ensureCustomerProfile(userId: string) {
    const existing = await this.prisma.customerProfile.findUnique({ where: { userId } });
    if (existing) return existing;
    return this.prisma.customerProfile.create({ data: { userId } });
  }

  async getCustomerProfile(customerProfileId: string, requestingUserId: string) {
    const requesting = await this.prisma.user.findUnique({
      where: { id: requestingUserId },
      include: { renterProfile: true },
    });

    const isAdmin = requesting?.role === 'ADMIN';
    const isRenter = requesting?.role === 'RENTER';

    if (!isAdmin && !isRenter) {
      throw new Error('Forbidden');
    }

    const profile = await this.prisma.customerProfile.findUnique({
      where: { id: customerProfileId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true, kycStatus: true } },
        bookings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          include: {
            vehicle: { select: { make: true, model: true, year: true } },
          },
        },
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    });

    if (!profile) return null;

    const renterReviews = await this.prisma.renterReview.findMany({
      where: { customerId: customerProfileId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const avgRating =
      renterReviews.length > 0
        ? renterReviews.reduce((sum, r) => sum + r.rating, 0) / renterReviews.length
        : null;

    return { ...profile, renterReviews, averageRating: avgRating };
  }
}
