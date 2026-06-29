import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getRenterProfile, type RenterFleetVehicle } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { VehicleCard } from '@/components/ui/VehicleCard';

export const dynamic = 'force-dynamic';

function parseImageUrls(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default async function RenterProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  let profile;
  try {
    const res = await getRenterProfile(id);
    profile = res.data;
  } catch {
    notFound();
  }

  const trustLabel =
    profile.trustBadge === 'VERIFIED'
      ? '✓ Verified'
      : profile.trustBadge === 'UNDER_VALIDATION'
        ? 'Pending Validation'
        : 'Not Verified';

  const trustVariant =
    profile.trustBadge === 'VERIFIED'
      ? 'green'
      : profile.trustBadge === 'UNDER_VALIDATION'
        ? 'yellow'
        : ('gray' as const);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mb-6"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to home
          </Link>

          <div className="flex items-center gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
              <span className="text-3xl font-bold text-blue-600">
                {profile.companyName.charAt(0)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{profile.companyName}</h1>
                <Badge label={trustLabel} variant={trustVariant} />
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-500">
                <span>
                  {profile.fleetCount} vehicle{profile.fleetCount !== 1 ? 's' : ''} in fleet
                </span>
                {profile.averageRating !== null && (
                  <span className="flex items-center gap-1 text-amber-500">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="font-semibold text-gray-700">
                      {profile.averageRating.toFixed(1)}
                    </span>
                    <span className="text-gray-400">avg rating</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fleet */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Available Fleet</h2>

        {profile.vehicles.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No vehicles listed yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {profile.vehicles.map((v: RenterFleetVehicle) => {
              const images = parseImageUrls(v.imageUrls);
              return (
                <VehicleCard
                  key={v.id}
                  id={v.id}
                  make={v.make}
                  model={v.model}
                  year={v.year}
                  fuelType={v.fuelType}
                  transmission={v.transmission}
                  seatingCapacity={v.seatingCapacity}
                  dailyRate={v.dailyRate}
                  imageUrl={images[0]}
                  averageRating={v.averageRating ?? undefined}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
