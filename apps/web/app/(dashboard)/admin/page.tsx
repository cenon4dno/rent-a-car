import { auth } from '@/auth';
import { getAdminStats } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

const STATUS_VARIANT: Record<string, 'green' | 'yellow' | 'blue' | 'gray' | 'red'> = {
  CONFIRMED: 'green',
  ACTIVE: 'blue',
  PENDING: 'yellow',
  COMPLETED: 'gray',
  CANCELLED: 'red',
};

export default async function AdminOverviewPage() {
  const session = await auth();
  const result = await getAdminStats(session!.apiToken).catch(() => null);
  const stats = result?.data;

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Platform Overview</h1>

      {!stats ? (
        <div className="text-gray-400 text-sm">Could not load stats — is the API running?</div>
      ) : (
        <>
          {/* GMV & Commission cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <BigStatCard
              label="Total GMV"
              value={`₱${stats.gmv.total.toLocaleString()}`}
              sub={`₱${stats.gmv.mtd.toLocaleString()} MTD`}
              accent="green"
            />
            <BigStatCard
              label="Commission Earned"
              value={`₱${stats.commission.total.toLocaleString()}`}
              sub={`₱${stats.commission.mtd.toLocaleString()} MTD`}
              accent="blue"
            />
            <BigStatCard
              label="Total Bookings"
              value={Object.values(stats.bookings).reduce((a, b) => a + b, 0)}
              sub={`${stats.bookings['ACTIVE'] ?? 0} active`}
            />
            <BigStatCard
              label="Total Vehicles"
              value={Object.values(stats.vehicles).reduce((a, b) => a + b, 0)}
              sub={`${stats.vehicles['AVAILABLE'] ?? 0} available`}
            />
          </div>

          {/* User & Booking breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Users by Role
              </h2>
              <div className="space-y-3">
                {Object.entries(stats.users).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{role}</span>
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Bookings by Status
              </h2>
              <div className="space-y-3">
                {Object.entries(stats.bookings).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <Badge label={status} variant={STATUS_VARIANT[status] ?? 'gray'} />
                    <span className="text-sm font-semibold text-gray-900">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Recent bookings */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Recent Bookings</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {stats.recentBookings.map((b) => (
                <div key={b.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {b.vehicle.make} {b.vehicle.model}
                    </p>
                    <p className="text-xs text-gray-400">
                      {b.renter.companyName} · {fmt(b.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge label={b.status} variant={STATUS_VARIANT[b.status] ?? 'gray'} />
                    <span className="text-sm font-semibold text-gray-900">
                      ₱{b.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function BigStatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: 'green' | 'blue';
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p
        className={`text-2xl font-bold ${accent === 'green' ? 'text-green-600' : accent === 'blue' ? 'text-blue-600' : 'text-gray-900'}`}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}
