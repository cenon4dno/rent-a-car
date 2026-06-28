import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface SsoUpsertInput {
  provider: string;
  providerAccountId: string;
  email: string;
  name: string;
  image?: string;
}

export type DocumentType = 'license' | 'secondaryId' | 'businessPermit' | 'companyReg';

const CUSTOMER_DOC_FIELDS: Partial<Record<DocumentType, string>> = {
  license: 'licenseUrl',
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
      },
    });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getMe(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        customerProfile: true,
        renterProfile: true,
        driverProfile: true,
      },
    });
  }

  async updateDocumentUrl(userId: string, docType: DocumentType, fileUrl: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { customerProfile: true, renterProfile: true },
    });
    if (!user) throw new BadRequestException('User not found');

    const customerField = CUSTOMER_DOC_FIELDS[docType];
    const renterField = RENTER_DOC_FIELDS[docType];

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
}
