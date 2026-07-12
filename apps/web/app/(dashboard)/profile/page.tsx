import Link from 'next/link';
import { auth } from '@/auth';
import { getMe } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { KycUploader } from './kyc/KycUploader';
import { ProfileSettingsForm } from './ProfileSettingsForm';
import { ChangePasswordForm } from './ChangePasswordForm';
import { AvatarUploader } from './AvatarUploader';

const KYC_VARIANT: Record<string, 'green' | 'yellow' | 'gray' | 'red'> = {
  VERIFIED: 'green',
  UNDER_REVIEW: 'yellow',
  PENDING: 'gray',
  REJECTED: 'red',
};

export default async function ProfilePage() {
  const session = await auth();
  const result = await getMe(session!.apiToken).catch(() => null);
  const profile = result?.data;

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 text-center text-sm text-gray-500">
        Could not load your profile. Please try again later.
      </div>
    );
  }

  const role = profile.role;
  const isRenter = role === 'RENTER';
  const isDriver = role === 'DRIVER';
  const isCustomer = role === 'CUSTOMER';

  const documents = isRenter
    ? [
        {
          type: 'businessPermit',
          label: 'Business Permit',
          description: 'Current year DTI or SEC business permit',
          currentUrl: profile.renterProfile?.businessPermitUrl ?? null,
        },
        {
          type: 'companyReg',
          label: 'Company Registration',
          description: 'SEC or DTI certificate of registration',
          currentUrl: profile.renterProfile?.companyRegUrl ?? null,
        },
      ]
    : isDriver
      ? [
          {
            type: 'license',
            label: "Professional Driver's License",
            description: 'LTO professional license (JPEG, PNG, or PDF, max 5 MB)',
            currentUrl: profile.driverProfile?.licenseUrl ?? null,
          },
        ]
      : [
          {
            type: 'license',
            label: "Driver's License (Front)",
            description: 'Front side of your license (JPEG, PNG, or PDF, max 5 MB)',
            currentUrl: profile.customerProfile?.licenseUrl ?? null,
          },
          {
            type: 'licenseBack',
            label: "Driver's License (Back)",
            description: 'Back side of your license',
            currentUrl: profile.customerProfile?.licenseBackUrl ?? null,
          },
          {
            type: 'secondaryId',
            label: 'Secondary Government ID',
            description: 'Passport, SSS, PhilHealth, or any government-issued photo ID',
            currentUrl: profile.customerProfile?.secondaryIdUrl ?? null,
          },
        ];

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <Badge
            label={profile.kycStatus.replace('_', ' ')}
            variant={KYC_VARIANT[profile.kycStatus] ?? 'gray'}
          />
        </div>
        <p className="text-sm text-gray-500">
          Manage your personal details, documents, and password.{' '}
          {(isCustomer || isRenter) && (
            <>
              Looking for verification?{' '}
              <Link href="/profile/kyc" className="text-blue-600 hover:underline">
                Go to KYC
              </Link>
              .
            </>
          )}
        </p>
      </div>

      <AvatarUploader
        currentUrl={profile.avatarUrl}
        label={isRenter ? 'Company Logo' : 'Profile Photo'}
        name={isRenter ? (profile.renterProfile?.companyName ?? profile.name) : profile.name}
      />

      <ProfileSettingsForm
        initial={{
          name: profile.name,
          phone: profile.phone ?? '',
          companyName: profile.renterProfile?.companyName ?? '',
          taxIdNumber: profile.renterProfile?.taxIdNumber ?? '',
          bankAccountDetails: profile.renterProfile?.bankAccountDetails ?? '',
        }}
        email={profile.email}
        isRenter={isRenter}
      />

      {role !== 'ADMIN' && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            {isRenter ? 'Business Documents' : 'Identity Documents'}
          </h2>
          <div className="space-y-3">
            {documents.map((doc) => (
              <KycUploader
                key={doc.type}
                type={doc.type}
                label={doc.label}
                description={doc.description}
                currentUrl={doc.currentUrl}
              />
            ))}
          </div>
        </section>
      )}

      <ChangePasswordForm hasPassword={profile.hasPassword ?? false} />
    </div>
  );
}
