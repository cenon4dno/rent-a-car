import Link from 'next/link';
import { auth } from '@/auth';
import { getMyVehicles, getMyBookings } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

const STATUS_VARIANT: Record<string, 'green' | 'yellow' | 'blue' | 'gray' | 'red'> = {
  CONFIRMED: 'green',
  ACTIVE: 'blue',
  PENDING: 'yellow',
  COMPLETED: 'gray',
  CANCELLED: 'red',
};

export default async function RenterOverviewPage() {
  const session = await auth();
  const [vehiclesRes, bookingsRes] = await Promise.allSettled([
    getMyVehicles(session!.apiToken),
    getMyBookings(session!.apiToken),
  ]);

  const vehicles = vehiclesRes.status === 'fulfilled' ? (vehiclesRes.value?.data ?? []) : [];
  const bookings = bookingsRes.status === 'fulfilled' ? (bookingsRes.value?.data ?? []) : [];

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const activeBookings = bookings.filter((b) => ['ACTIVE', 'CONFIRMED'].includes(b.status));
  const mtdBookings = bookings.filter(
    (b) => new Date(b.createdAt) >= monthStart && b.status !== 'CANCELLED',
  );
  const mtdRevenue = mtdBookings.reduce((sum, b) => sum + b.totalAmount, 0);
  const recentBookings = [...bookings]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 8);

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Renter Overview</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Vehicles" value={vehicles.length} icon="🚗" />
        <StatCard label="Active Bookings" value={activeBookings.length} icon="📅" accent="blue" />
        <StatCard label="MTD Bookings" value={mtdBookings.length} icon="📊" />
        <StatCard
          label="MTD Revenue"
          value={`₱${mtdRevenue.toLocaleString()}`}
          icon="💰"
          accent="green"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3 mb-10">
        <Link
          href="/renter/fleet/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Vehicle
        </Link>
        <Link
          href="/renter/fleet"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          Manage Fleet
        </Link>
        <Link
          href="/renter/bookings"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          View Bookings
        </Link>
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Recent Bookings</h2>
          <Link href="/renter/bookings" className="text-sm text-blue-600 hover:underline">
            View all
          </Link>
        </div>

        {recentBookings.length === 0 ? (
          <div className="px-6 py-12 text-center text-gray-400 text-sm">No bookings yet.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {recentBookings.map((b) => (
              <Link
                key={b.id}
                href={`/booking/${b.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {b.vehicle.make} {b.vehicle.model}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {fmt(b.startDate)} &ndash; {fmt(b.endDate)} &middot; {b.pickupLocation}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge label={b.status} variant={STATUS_VARIANT[b.status] ?? 'gray'} />
                  <span className="text-sm font-semibold text-gray-900">
                    ₱{b.totalAmount.toLocaleString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: string;
  accent?: 'blue' | 'green';
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-2xl">{icon}</span>
      </div>
      <p
        className={`text-2xl font-bold ${accent === 'blue' ? 'text-blue-600' : accent === 'green' ? 'text-green-600' : 'text-gray-900'}`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  );
}
