import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getMe } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { KycUploader } from '../profile/KycUploader';
import { OnboardingContinue } from './OnboardingContinue';

const KYC_VARIANT: Record<string, 'green' | 'yellow' | 'gray' | 'red'> = {
  VERIFIED: 'green',
  UNDER_REVIEW: 'yellow',
  PENDING: 'gray',
  REJECTED: 'red',
};

interface OnboardingPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

export default async function OnboardingPage({ searchParams }: OnboardingPageProps) {
  const params = await searchParams;
  const session = await auth();
  const result = await getMe(session!.apiToken).catch(() => null);
  const profile = result?.data;

  if (!profile) redirect('/login');
  if (profile.role !== 'CUSTOMER') redirect('/');

  const licenseFront = profile.customerProfile?.licenseUrl ?? null;
  const licenseBack = profile.customerProfile?.licenseBackUrl ?? null;
  const docsComplete = !!(licenseFront && licenseBack);
  const kycStatus = profile.kycStatus;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Profile</h1>
          <Badge label={kycStatus.replace('_', ' ')} variant={KYC_VARIANT[kycStatus] ?? 'gray'} />
        </div>
        <p className="text-sm text-gray-500">
          Before you can book a car, we need both sides of your driver&apos;s license. An admin will
          review your documents — booking unlocks once your account is verified.
        </p>
      </div>

      {kycStatus === 'VERIFIED' && docsComplete ? (
        <div className="mb-6 rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700">
          Your account is verified — you&apos;re all set to book.
        </div>
      ) : docsComplete ? (
        <div className="mb-6 rounded-xl bg-yellow-50 border border-yellow-200 p-4 text-sm text-yellow-700">
          Documents received. Your account is pending admin approval — verification typically takes
          1–2 business days. You&apos;ll be able to book as soon as it&apos;s approved.
        </div>
      ) : (
        <div className="mb-6 rounded-xl bg-blue-50 border border-blue-200 p-4 text-sm text-blue-700">
          Upload both sides of your driver&apos;s license to continue.
        </div>
      )}

      <div className="space-y-3">
        <KycUploader
          type="license"
          label="Driver's License (Front)"
          description="Front side of your non-professional or professional license (JPEG, PNG, or PDF, max 5 MB)"
          currentUrl={licenseFront}
        />
        <KycUploader
          type="licenseBack"
          label="Driver's License (Back)"
          description="Back side of the same license"
          currentUrl={licenseBack}
        />
      </div>

      <div className="mt-8">
        <OnboardingContinue docsComplete={docsComplete} callbackUrl={params.callbackUrl ?? '/'} />
      </div>
    </div>
  );
}
