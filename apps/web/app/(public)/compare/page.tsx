import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getVehicle, getPrimaryImage } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

interface ComparePageProps {
  searchParams: Promise<{ ids?: string }>;
}

export const dynamic = 'force-dynamic';

const fuelLabel: Record<string, string> = {
  GASOLINE: 'Gasoline',
  DIESEL: 'Diesel',
  HYBRID: 'Hybrid',
  ELECTRIC: 'Electric (EV)',
};

const trustBadgeLabel: Record<string, string> = {
  VERIFIED: 'Verified',
  UNDER_VALIDATION: 'Under Validation',
  NOT_VERIFIED: 'Not Verified',
};

const trustBadgeVariant: Record<string, 'green' | 'yellow' | 'gray'> = {
  VERIFIED: 'green',
  UNDER_VALIDATION: 'yellow',
  NOT_VERIFIED: 'gray',
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const { ids } = await searchParams;
  if (!ids) notFound();

  const idList = ids
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (idList.length < 2) notFound();

  const results = await Promise.all(idList.map((id) => getVehicle(id).catch(() => null)));
  const vehicles = results.map((r) => r?.data).filter(Boolean);

  if (vehicles.length < 2) notFound();

  const rows: { label: string; key: (v: NonNullable<(typeof vehicles)[0]>) => string }[] = [
    { label: 'Make', key: (v) => v.make },
    { label: 'Model', key: (v) => v.model },
    { label: 'Year', key: (v) => String(v.year) },
    { label: 'Fuel Type', key: (v) => fuelLabel[v.fuelType] ?? v.fuelType },
    { label: 'Transmission', key: (v) => v.transmission },
    { label: 'Seating Capacity', key: (v) => `${v.seatingCapacity} seats` },
    { label: 'Daily Rate', key: (v) => `₱${v.dailyRate.toLocaleString()}` },
    {
      label: 'Mileage Limit',
      key: (v) => (v.mileageLimit ? `${v.mileageLimit} km/day` : 'Unlimited'),
    },
    { label: 'Rental Company', key: (v) => v.renter?.companyName ?? '—' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Compare Vehicles</h1>
            <p className="text-sm text-gray-500 mt-1">
              Comparing {vehicles.length} vehicles side by side
            </p>
          </div>
          <Link href="/search" className="text-sm text-blue-600 hover:underline">
            &larr; Back to search
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Vehicle header cards */}
          <div
            className="grid divide-x divide-gray-100"
            style={{ gridTemplateColumns: `180px repeat(${vehicles.length}, 1fr)` }}
          >
            <div className="bg-gray-50 p-4" />
            {vehicles.map((v) => {
              const img = getPrimaryImage(v!.imageUrls, v!.vehiclePhotos);
              return (
                <div key={v!.id} className="p-4 flex flex-col items-center gap-3 text-center">
                  <div className="w-full h-36 rounded-xl overflow-hidden bg-gray-100">
                    {img ? (
                      <img
                        src={img}
                        alt={`${v!.make} ${v!.model}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <svg
                          className="w-10 h-10 text-gray-300"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">
                      {v!.make} {v!.model}
                    </p>
                    <p className="text-sm text-gray-500">{v!.year}</p>
                  </div>
                  {v!.renter?.trustBadge && (
                    <Badge
                      label={trustBadgeLabel[v!.renter.trustBadge] ?? v!.renter.trustBadge}
                      variant={trustBadgeVariant[v!.renter.trustBadge] ?? 'gray'}
                    />
                  )}
                  <Link
                    href={`/vehicle/${v!.id}`}
                    className="mt-1 w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                  >
                    Rent Now
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Spec rows */}
          {rows.map((row, i) => (
            <div
              key={row.label}
              className={`grid divide-x divide-gray-100 border-t border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
              style={{ gridTemplateColumns: `180px repeat(${vehicles.length}, 1fr)` }}
            >
              <div className="px-5 py-3.5 flex items-center">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {row.label}
                </span>
              </div>
              {vehicles.map((v) => (
                <div key={v!.id} className="px-5 py-3.5 flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-900 text-center">
                    {row.key(v!)}
                  </span>
                </div>
              ))}
            </div>
          ))}

          {/* Price highlight row */}
          <div
            className="grid divide-x divide-gray-100 border-t-2 border-blue-100 bg-blue-50"
            style={{ gridTemplateColumns: `180px repeat(${vehicles.length}, 1fr)` }}
          >
            <div className="px-5 py-4 flex items-center">
              <span className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                Best Price
              </span>
            </div>
            {vehicles.map((v) => {
              const isLowest = v!.dailyRate === Math.min(...vehicles.map((x) => x!.dailyRate));
              return (
                <div key={v!.id} className="px-5 py-4 flex flex-col items-center justify-center">
                  <span
                    className={`text-xl font-bold ${isLowest ? 'text-green-600' : 'text-gray-700'}`}
                  >
                    ₱{v!.dailyRate.toLocaleString()}
                  </span>
                  {isLowest && (
                    <span className="text-[10px] font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded-full mt-1">
                      Best value
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
