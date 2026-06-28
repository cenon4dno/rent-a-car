import { Suspense } from 'react';
import { searchVehicles } from '@/lib/api';
import { VehicleCard } from '@/components/ui/VehicleCard';
import { FilterSidebar } from '@/components/ui/FilterSidebar';
import { Pagination } from '@/components/ui/Pagination';

interface SearchPageProps {
  searchParams: Promise<{
    location?: string;
    startDate?: string;
    endDate?: string;
    fuelType?: string;
    transmission?: string;
    minSeats?: string;
    minPrice?: string;
    maxPrice?: string;
    page?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? 1));

  const result = await searchVehicles({
    location: params.location,
    startDate: params.startDate,
    endDate: params.endDate,
    fuelType: params.fuelType,
    transmission: params.transmission,
    minSeats: params.minSeats ? Number(params.minSeats) : undefined,
    minPrice: params.minPrice ? Number(params.minPrice) : undefined,
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    page,
    limit: 12,
  }).catch(() => null);

  const vehicles = result?.data?.data ?? [];
  const total = result?.data?.total ?? 0;
  const totalPages = result?.data?.totalPages ?? 1;

  const hasDateRange = params.startDate && params.endDate;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Available Vehicles</h1>
          <p className="text-sm text-gray-500 mt-1">
            {params.location ? (
              <>
                Results in <span className="font-medium text-gray-700">{params.location}</span>
              </>
            ) : (
              'All locations'
            )}
            {hasDateRange && (
              <>
                {' · '}
                {params.startDate} &ndash; {params.endDate}
              </>
            )}
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            {total} vehicle{total !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex gap-6 items-start">
          {/* Filter sidebar — client component, needs Suspense for useSearchParams */}
          <Suspense fallback={<div className="hidden lg:block w-64 shrink-0" />}>
            <FilterSidebar />
          </Suspense>

          {/* Results grid */}
          <div className="flex-1 min-w-0">
            {vehicles.length === 0 ? (
              <EmptyState apiDown={result === null} />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {vehicles.map((v) => {
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
                        renterName={v.renter?.companyName}
                        trustBadge={v.renter?.trustBadge}
                      />
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center">
                    <Suspense fallback={null}>
                      <Pagination currentPage={page} totalPages={totalPages} />
                    </Suspense>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ apiDown }: { apiDown: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <svg
        className="w-16 h-16 text-gray-300 mb-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
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
      {apiDown ? (
        <>
          <p className="text-gray-500 font-medium">Could not reach the server.</p>
          <p className="text-gray-400 text-sm mt-1">Please try again in a moment.</p>
        </>
      ) : (
        <>
          <p className="text-gray-500 font-medium">No vehicles found.</p>
          <p className="text-gray-400 text-sm mt-1">
            Try adjusting your filters or search for different dates.
          </p>
        </>
      )}
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
