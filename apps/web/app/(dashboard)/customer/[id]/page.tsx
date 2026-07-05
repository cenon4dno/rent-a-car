import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getCustomerProfile } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

export const dynamic = 'force-dynamic';

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          className={`w-4 h-4 ${s <= Math.round(value) ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-sm text-gray-600 ml-1">{value.toFixed(1)}</span>
    </div>
  );
}

const STATUS_VARIANT: Record<string, 'green' | 'blue' | 'yellow' | 'red' | 'gray'> = {
  COMPLETED: 'green',
  CONFIRMED: 'blue',
  PENDING: 'yellow',
  CANCELLED: 'red',
  ACTIVE: 'blue',
};

const KYC_VARIANT: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
  VERIFIED: 'green',
  PENDING: 'yellow',
  REJECTED: 'red',
  UNDER_REVIEW: 'gray',
};

export default async function CustomerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.apiToken) redirect('/login');

  const role = (session.user as { role?: string })?.role;
  if (!role || !['RENTER', 'ADMIN'].includes(role)) {
    redirect('/');
  }

  let profile = null;
  try {
    const res = await getCustomerProfile(id, session.apiToken);
    profile = res.data;
  } catch {
    // forbidden or not found
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-16 text-center">
        <p className="text-gray-500">Customer profile not found or access denied.</p>
      </div>
    );
  }

  const initials = profile.user.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-8 px-4">
      {/* Header card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex items-start gap-5">
        <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-2xl font-bold text-blue-700 shrink-0">
          {profile.user.avatarUrl ? (
            <img
              src={profile.user.avatarUrl}
              alt={profile.user.name}
              className="w-20 h-20 rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-gray-900">{profile.user.name}</h1>
          <p className="text-sm text-gray-500 mt-0.5">{profile.user.email}</p>
          <div className="flex flex-wrap items-center gap-2 mt-3">
            <Badge
              label={`KYC: ${profile.kycStatus.replace('_', ' ')}`}
              variant={KYC_VARIANT[profile.kycStatus] ?? 'gray'}
            />
            {profile.licenseUrl && <Badge label="License uploaded" variant="green" />}
            {profile.secondaryIdUrl && <Badge label="Gov ID uploaded" variant="green" />}
          </div>
        </div>
        {profile.averageRating !== null && (
          <div className="shrink-0 text-right">
            <p className="text-xs text-gray-400 mb-1">Avg rating received</p>
            <StarRating value={profile.averageRating} />
          </div>
        )}
      </div>

      {/* Rental history */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Rental History
        </h2>
        {profile.bookings.length === 0 ? (
          <p className="text-sm text-gray-400">No bookings yet.</p>
        ) : (
          <div className="divide-y divide-gray-100">
            {profile.bookings.map((b) => (
              <div key={b.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {b.vehicle.make} {b.vehicle.model} {b.vehicle.year}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(b.startDate).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                    })}{' '}
                    →{' '}
                    {new Date(b.endDate).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <Badge label={b.status} variant={STATUS_VARIANT[b.status] ?? 'gray'} />
                  <p className="text-xs text-gray-500 mt-1">₱{b.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reviews received from renters */}
      {profile.renterReviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Reviews from Renters
          </h2>
          <div className="space-y-3">
            {profile.renterReviews.map((r) => (
              <div key={r.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <StarRating value={r.rating} />
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-gray-700 mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reviews given by this customer */}
      {profile.reviews.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
            Reviews Given
          </h2>
          <div className="space-y-3">
            {profile.reviews.map((r) => (
              <div key={r.id} className="p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <StarRating value={r.rating} />
                  <span className="text-xs text-gray-400">
                    {new Date(r.createdAt).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
                {r.comment && <p className="text-sm text-gray-700 mt-1">{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
