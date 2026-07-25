import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getDriverDashboard } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

const STATUS_VARIANT: Record<string, 'green' | 'yellow' | 'blue' | 'gray' | 'red'> = {
  CONFIRMED: 'green',
  ACTIVE: 'blue',
  PENDING: 'yellow',
};

const KYC_VARIANT: Record<string, 'green' | 'yellow' | 'gray' | 'red'> = {
  VERIFIED: 'green',
  PENDING: 'yellow',
  REJECTED: 'red',
  UNVERIFIED: 'gray',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('en-PH', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default async function DriverDashboardPage() {
  const session = await auth();
  const role = (session?.user as { role?: string })?.role;
  if (!session || role !== 'DRIVER') redirect('/login');

  const result = await getDriverDashboard(session.apiToken).catch(() => null);
  const data = result?.data ?? null;

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Driver profile not found.</p>
          <Link href="/profile" className="text-blue-600 text-sm hover:underline mt-2 inline-block">
            Go to Profile
          </Link>
        </div>
      </div>
    );
  }

  const { profile, bookings } = data;

  const upcoming = bookings.filter(
    (b) => b.status === 'CONFIRMED' && new Date(b.startDate) > new Date(),
  );
  const active = bookings.filter((b) => b.status === 'ACTIVE');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xl font-bold">
              {profile.user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">{profile.user.name}</h1>
              <p className="text-sm text-gray-500">{profile.user.email}</p>
            </div>
            <Badge
              variant={KYC_VARIANT[profile.kycStatus] ?? 'gray'}
              label={`KYC: ${profile.kycStatus}`}
            />
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{profile._count.bookings}</p>
              <p className="text-xs text-gray-500 mt-1">Total Trips</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{upcoming.length}</p>
              <p className="text-xs text-gray-500 mt-1">Upcoming</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-500">{active.length}</p>
              <p className="text-xs text-gray-500 mt-1">Active Now</p>
            </div>
          </div>
        </div>

        {/* Active booking */}
        {active.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Active Now</h2>
            <div className="space-y-3">
              {active.map((b) => (
                <div key={b.id} className="bg-blue-50 border border-blue-200 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-900">
                      {b.vehicle.make} {b.vehicle.model} {b.vehicle.year}
                    </span>
                    <Badge variant="blue" label="Active" />
                  </div>
                  <p className="text-sm text-blue-700">Plate: {b.vehicle.plateNumber}</p>
                  <p className="text-sm text-blue-600">
                    {fmt(b.startDate)} — {fmt(b.endDate)}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Customer: {b.customerProfile.user.name}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming bookings */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">My Schedule</h2>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 py-16 text-center">
              <svg
                className="w-12 h-12 text-gray-300 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-400 text-sm">No upcoming assignments.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
              {bookings.map((b) => (
                <div key={b.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {b.vehicle.make} {b.vehicle.model} {b.vehicle.year}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">Plate: {b.vehicle.plateNumber}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {fmt(b.startDate)} — {fmt(b.endDate)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Customer: {b.customerProfile.user.name}
                      </p>
                    </div>
                    <Badge variant={STATUS_VARIANT[b.status] ?? 'gray'} label={b.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="mt-6 flex gap-3">
          <Link href="/profile" className="text-sm text-blue-600 font-medium hover:underline">
            Edit Profile
          </Link>
          <span className="text-gray-300">|</span>
          <Link href="/profile#kyc" className="text-sm text-blue-600 font-medium hover:underline">
            KYC Documents
          </Link>
        </div>
      </div>
    </div>
  );
}
