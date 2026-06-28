import { auth } from '@/auth';
import { getMe } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { KycUploader } from './KycUploader';

const KYC_VARIANT: Record<string, 'green' | 'yellow' | 'gray' | 'red'> = {
  VERIFIED: 'green',
  UNDER_REVIEW: 'yellow',
  PENDING: 'gray',
  REJECTED: 'red',
};

const CUSTOMER_DOCS = [
  {
    type: 'license',
    label: "Driver's License",
    description: "Non-professional or professional driver's license (JPEG, PNG, or PDF, max 5 MB)",
  },
  {
    type: 'secondaryId',
    label: 'Secondary Government ID',
    description: 'Passport, SSS, PhilHealth, or any government-issued photo ID',
  },
];

const RENTER_DOCS = [
  {
    type: 'businessPermit',
    label: 'Business Permit',
    description: 'Current year DTI or SEC business permit',
  },
  {
    type: 'companyReg',
    label: 'Company Registration',
    description: 'SEC or DTI certificate of registration',
  },
];

export default async function KycPage() {
  const session = await auth();
  const result = await getMe(session!.apiToken).catch(() => null);
  const profile = result?.data;

  const role = (session?.user as { role?: string })?.role ?? 'CUSTOMER';
  const kycStatus = profile?.kycStatus ?? 'PENDING';

  const docs = role === 'RENTER' ? RENTER_DOCS : CUSTOMER_DOCS;
  const urlMap: Record<string, string | null> =
    role === 'RENTER'
      ? {
          businessPermit: profile?.renterProfile?.businessPermitUrl ?? null,
          companyReg: profile?.renterProfile?.companyRegUrl ?? null,
        }
      : {
          license: profile?.customerProfile?.licenseUrl ?? null,
          secondaryId: profile?.customerProfile?.secondaryIdUrl ?? null,
        };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
          <Badge label={kycStatus.replace('_', ' ')} variant={KYC_VARIANT[kycStatus] ?? 'gray'} />
        </div>
        <p className="text-sm text-gray-500">
          Upload your identity documents to verify your account. Files are securely stored and only
          visible to platform admins.
        </p>
      </div>

      {kycStatus === 'VERIFIED' && (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          Your account is fully verified. No further action required.
        </div>
      )}

      {kycStatus === 'REJECTED' && (
        <div className="mb-6 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          Your documents were rejected. Please re-upload clear, valid documents and contact support
          if you need help.
        </div>
      )}

      <div className="space-y-3">
        {docs.map((doc) => (
          <KycUploader
            key={doc.type}
            type={doc.type}
            label={doc.label}
            description={doc.description}
            currentUrl={urlMap[doc.type] ?? null}
          />
        ))}
      </div>

      <p className="text-xs text-gray-400 text-center mt-8">
        After uploading, your KYC status will be updated to "Under Review". Verification typically
        takes 1–2 business days.
      </p>
    </div>
  );
}
