import Link from 'next/link';
import { Badge } from './Badge';
import { VehicleImage } from './VehicleImage';

export interface VehicleCardProps {
  id: string;
  make: string;
  model: string;
  year: number;
  fuelType: string;
  transmission: string;
  seatingCapacity: number;
  dailyRate: number;
  imageUrl?: string;
  renterName?: string;
  trustBadge?: string;
  averageRating?: number;
}

const fuelLabel: Record<string, string> = {
  GASOLINE: 'Gas',
  DIESEL: 'Diesel',
  HYBRID: 'Hybrid',
  ELECTRIC: 'EV',
};

const trustBadgeVariant: Record<string, 'green' | 'yellow' | 'gray'> = {
  VERIFIED: 'green',
  UNDER_VALIDATION: 'yellow',
  NOT_VERIFIED: 'gray',
};

export function VehicleCard({
  id,
  make,
  model,
  year,
  fuelType,
  transmission,
  seatingCapacity,
  dailyRate,
  imageUrl,
  renterName,
  trustBadge,
  averageRating,
}: VehicleCardProps) {
  return (
    <Link
      href={`/vehicle/${id}`}
      className="group block rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      {/* Image */}
      <div className="relative h-48 bg-slate-100 overflow-hidden">
        <VehicleImage src={imageUrl} alt={`${make} ${model}`} make={make} model={model} />
        <div className="absolute top-2 right-2">
          <Badge label={fuelLabel[fuelType] ?? fuelType} variant="blue" />
        </div>
      </div>

      {/* Details */}
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              {make} {model}
            </h3>
            <p className="text-sm text-gray-500">
              {year} · {transmission}
            </p>
          </div>
          {averageRating !== undefined && (
            <div className="flex items-center gap-1 text-sm text-amber-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {averageRating.toFixed(1)}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20H7M7 20a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v11a2 2 0 01-2 2zm0 0V5"
              />
            </svg>
            {seatingCapacity} seats
          </span>
        </div>

        {renterName && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-xs text-gray-500 truncate">{renterName}</span>
            {trustBadge && (
              <Badge
                label={
                  trustBadge === 'VERIFIED'
                    ? '✓ Verified'
                    : trustBadge === 'UNDER_VALIDATION'
                      ? 'Pending'
                      : 'Unverified'
                }
                variant={trustBadgeVariant[trustBadge] ?? 'gray'}
              />
            )}
          </div>
        )}

        <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-lg font-bold text-gray-900">₱{dailyRate.toLocaleString()}</span>
          <span className="text-xs text-gray-400">/ day</span>
        </div>
      </div>
    </Link>
  );
}
