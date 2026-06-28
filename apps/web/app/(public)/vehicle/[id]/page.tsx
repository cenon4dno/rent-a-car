import { notFound } from 'next/navigation';
import { getVehicle } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { BookingForm } from './BookingForm';

interface VehiclePageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ startDate?: string; endDate?: string; location?: string }>;
}

const fuelLabel: Record<string, string> = {
  GASOLINE: 'Gasoline',
  DIESEL: 'Diesel',
  HYBRID: 'Hybrid',
  ELECTRIC: 'Electric (EV)',
};

const trustBadgeVariant: Record<string, 'green' | 'yellow' | 'gray'> = {
  VERIFIED: 'green',
  UNDER_VALIDATION: 'yellow',
  NOT_VERIFIED: 'gray',
};

export default async function VehiclePage({ params, searchParams }: VehiclePageProps) {
  const { id } = await params;
  const sp = await searchParams;

  const result = await getVehicle(id).catch(() => null);
  if (!result?.data) notFound();

  const v = result.data;
  const images = parseImageUrls(v.imageUrls);
  const avgRating =
    v.reviews.length > 0
      ? v.reviews.reduce((sum, r) => sum + r.rating, 0) / v.reviews.length
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6">
          <a href="/search" className="hover:text-blue-600 transition-colors">
            Vehicles
          </a>
          <span className="mx-2">/</span>
          <span className="text-gray-700 font-medium">
            {v.make} {v.model}
          </span>
        </nav>

        <div className="lg:grid lg:grid-cols-3 lg:gap-8 space-y-6 lg:space-y-0">
          {/* Left column — images + specs + reviews */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <div className="rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm">
              {images.length > 0 ? (
                <div className="grid grid-cols-2 gap-1">
                  <img
                    src={images[0]}
                    alt={`${v.make} ${v.model}`}
                    className="col-span-2 w-full h-72 object-cover"
                  />
                  {images.slice(1, 3).map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`${v.make} ${v.model} view ${i + 2}`}
                      className="w-full h-40 object-cover"
                    />
                  ))}
                </div>
              ) : (
                <div className="h-72 flex items-center justify-center bg-gray-100 text-gray-400">
                  <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2zM5 8h4M3 12h18m-2-4h2a1 1 0 011 1v5"
                    />
                  </svg>
                </div>
              )}
            </div>

            {/* Vehicle info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {v.make} {v.model}
                  </h1>
                  <p className="text-gray-500 mt-1">{v.year}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">
                    ₱{v.dailyRate.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-400">per day</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <Badge label={fuelLabel[v.fuelType] ?? v.fuelType} variant="blue" />
                <Badge label={v.transmission} variant="gray" />
                <Badge label={`${v.seatingCapacity} seats`} variant="gray" />
                {avgRating !== null && (
                  <Badge label={`★ ${avgRating.toFixed(1)}`} variant="yellow" />
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-t border-gray-100">
                <Spec label="Fuel" value={fuelLabel[v.fuelType] ?? v.fuelType} />
                <Spec label="Transmission" value={v.transmission} />
                <Spec label="Seats" value={String(v.seatingCapacity)} />
                <Spec label="Plate" value={v.plateNumber} />
              </div>
            </div>

            {/* Renter info */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-3">About the Renter</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {v.renter.companyName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{v.renter.companyName}</p>
                  <Badge
                    label={
                      v.renter.trustBadge === 'VERIFIED'
                        ? '✓ Verified'
                        : v.renter.trustBadge === 'UNDER_VALIDATION'
                          ? 'Under Validation'
                          : 'Not Verified'
                    }
                    variant={trustBadgeVariant[v.renter.trustBadge] ?? 'gray'}
                  />
                </div>
              </div>
            </div>

            {/* Reviews */}
            {v.reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">
                  Reviews ({v.reviews.length})
                  {avgRating !== null && (
                    <span className="ml-2 text-amber-500 font-normal">
                      ★ {avgRating.toFixed(1)}
                    </span>
                  )}
                </h2>
                <div className="space-y-4">
                  {v.reviews.map((r) => (
                    <div
                      key={r.id}
                      className="border-b border-gray-100 pb-4 last:border-0 last:pb-0"
                    >
                      <div className="flex items-center gap-1 mb-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <svg
                            key={i}
                            className={`w-3.5 h-3.5 ${i < r.rating ? 'text-amber-400 fill-current' : 'text-gray-300 fill-current'}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      {r.comment && <p className="text-sm text-gray-700">{r.comment}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(r.createdAt).toLocaleDateString('en-PH', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column — booking form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingForm
                vehicleId={v.id}
                dailyRate={v.dailyRate}
                initialStartDate={sp.startDate}
                initialEndDate={sp.endDate}
                initialLocation={sp.location}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function parseImageUrls(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
