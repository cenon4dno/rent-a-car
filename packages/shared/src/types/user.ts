export type UserRole = 'ADMIN' | 'RENTER' | 'DRIVER' | 'CUSTOMER';

export type KycStatus = 'PENDING' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface BaseUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  kycStatus: KycStatus;
  createdAt: Date;
  updatedAt: Date;
}
