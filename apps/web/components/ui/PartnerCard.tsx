import Link from 'next/link';
import { Badge } from './Badge';

export interface PartnerCardProps {
  id: string;
  companyName: string;
  trustBadge: string;
  fleetCount?: number;
  averageRating?: number;
  logoUrl?: string;
}

export function PartnerCard({
  id,
  companyName,
  trustBadge,
  fleetCount,
  averageRating,
  logoUrl,
}: PartnerCardProps) {
  return (
    <Link
      href={`/renter/${id}`}
      className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm hover:shadow-md hover:border-blue-300 transition-all text-center"
    >
      {/* Logo / Avatar */}
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden">
        {logoUrl ? (
          <img src={logoUrl} alt={companyName} className="w-full h-full object-cover" />
        ) : (
          <span className="text-2xl font-bold text-blue-600">{companyName.charAt(0)}</span>
        )}
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-gray-900 text-sm leading-tight">{companyName}</h3>
        <Badge
          label={
            trustBadge === 'VERIFIED'
              ? '✓ Verified'
              : trustBadge === 'UNDER_VALIDATION'
                ? 'Pending'
                : 'Unverified'
          }
          variant={
            trustBadge === 'VERIFIED'
              ? 'green'
              : trustBadge === 'UNDER_VALIDATION'
                ? 'yellow'
                : 'gray'
          }
        />
      </div>

      <div className="flex items-center gap-3 text-xs text-gray-500">
        {fleetCount !== undefined && <span>{fleetCount} vehicles</span>}
        {averageRating !== undefined && (
          <span className="flex items-center gap-0.5 text-amber-500">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {averageRating.toFixed(1)}
          </span>
        )}
      </div>
    </Link>
  );
}
