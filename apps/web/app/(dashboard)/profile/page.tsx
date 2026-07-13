import { auth } from '@/auth';
import { getMe } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { KycUploader } from './KycUploader';
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
  const isAdmin = role === 'ADMIN';
  const kycStatus = profile.kycStatus;

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
          {
            type: 'backgroundCheck',
            label: 'Background Check Clearance',
            description: 'NBI or police clearance certificate',
            currentUrl: profile.driverProfile?.backgroundCheckUrl ?? null,
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
          {!isAdmin && (
            <Badge label={kycStatus.replace('_', ' ')} variant={KYC_VARIANT[kycStatus] ?? 'gray'} />
          )}
        </div>
        <p className="text-sm text-gray-500">
          {isAdmin
            ? 'Manage your account details and password.'
            : 'Manage your personal details, verification documents, and password.'}
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

      {!isAdmin && (
        <section id="kyc" className="scroll-mt-20">
          <div className="flex items-center gap-3 mb-1">
            <h2 className="text-lg font-semibold text-gray-900">KYC Verification</h2>
            <Badge label={kycStatus.replace('_', ' ')} variant={KYC_VARIANT[kycStatus] ?? 'gray'} />
          </div>
          <p className="text-xs text-gray-400 mb-4">
            {isRenter
              ? 'Business documents required to list your fleet. Files are securely stored and only visible to platform admins.'
              : isDriver
                ? 'Professional license and background clearance required before accepting trips.'
                : 'Identity documents required before you can book a car. Files are securely stored and only visible to platform admins.'}
          </p>

          {kycStatus === 'VERIFIED' && (
            <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
              Your account is fully verified. No further action required.
            </div>
          )}

          {kycStatus === 'REJECTED' && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              Your documents were rejected. Please re-upload clear, valid documents and contact
              support if you need help.
            </div>
          )}

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

          {kycStatus !== 'VERIFIED' && (
            <p className="text-xs text-gray-400 mt-3">
              After uploading, your KYC status changes to &quot;Under Review&quot;. Verification
              typically takes 1–2 business days.
            </p>
          )}
        </section>
      )}

      <ChangePasswordForm hasPassword={profile.hasPassword ?? false} />
    </div>
  );
}
