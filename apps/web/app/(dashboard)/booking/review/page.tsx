import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getMe, getVehicle } from '@/lib/api';
import { ReviewClient } from './ReviewClient';

interface ReviewPageProps {
  searchParams: Promise<{
    vehicleId?: string;
    pickupLocation?: string;
    pickupLat?: string;
    pickupLng?: string;
    startDate?: string;
    endDate?: string;
    addons?: string;
  }>;
}

export default async function BookingReviewPage({ searchParams }: ReviewPageProps) {
  const params = await searchParams;

  if (!params.vehicleId || !params.startDate || !params.endDate || !params.pickupLocation) {
    redirect('/search');
  }

  // Live KYC check (the middleware gate relies on the session JWT, which can
  // lag behind admin approvals/rejections)
  const session = await auth();
  const me = session ? await getMe(session.apiToken).catch(() => null) : null;
  if (me?.data?.role === 'CUSTOMER') {
    const cp = me.data.customerProfile;
    const docsComplete = !!(cp?.licenseUrl && cp?.licenseBackUrl);
    if (!docsComplete || me.data.kycStatus !== 'VERIFIED') {
      redirect('/onboarding');
    }
  }

  const result = await getVehicle(params.vehicleId).catch(() => null);
  if (!result?.data) notFound();

  const vehicle = result.data;
  const addons = params.addons ? params.addons.split(',').filter(Boolean) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Review & Confirm Booking</h1>
        <ReviewClient
          vehicle={{
            id: vehicle.id,
            make: vehicle.make,
            model: vehicle.model,
            year: vehicle.year,
            dailyRate: vehicle.dailyRate,
            renterName: vehicle.renter.companyName,
          }}
          pickupLocation={params.pickupLocation}
          pickupLat={params.pickupLat ? Number(params.pickupLat) : undefined}
          pickupLng={params.pickupLng ? Number(params.pickupLng) : undefined}
          startDate={params.startDate}
          endDate={params.endDate}
          addons={addons}
        />
      </div>
    </div>
  );
}
