import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { getFleetAnalytics } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function RenterAnalyticsPage() {
  const session = await auth();
  if (!session?.apiToken) redirect('/login');

  const res = await getFleetAnalytics(session.apiToken).catch(() => null);
  const data = res?.data;

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center text-gray-400">
        No analytics data available yet.
      </div>
    );
  }

  const maxRevenue = Math.max(...data.monthlyRevenue.map((m) => m.revenue), 1);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Fleet Analytics</h1>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard label="Total Vehicles" value={data.totalVehicles} sub="in fleet" />
        <KpiCard
          label="Currently Active"
          value={data.activeVehicles}
          sub="vehicles on rental"
          accent="blue"
        />
        <KpiCard
          label="Utilization Rate"
          value={`${data.utilizationRate}%`}
          sub="of fleet actively rented"
          accent={
            data.utilizationRate >= 60 ? 'green' : data.utilizationRate >= 30 ? 'yellow' : 'red'
          }
        />
      </div>

      {/* Monthly revenue chart */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6">
          Monthly Revenue (last 6 months)
        </h2>
        <div className="flex items-end gap-3 h-40">
          {data.monthlyRevenue.map((m) => {
            const pct = maxRevenue > 0 ? (m.revenue / maxRevenue) * 100 : 0;
            return (
              <div key={m.label} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-500 font-medium">
                  {m.revenue > 0 ? `₱${(m.revenue / 1000).toFixed(0)}k` : '—'}
                </span>
                <div className="w-full bg-gray-100 rounded-t-md" style={{ height: '100%' }}>
                  <div
                    className="w-full bg-blue-500 rounded-t-md transition-all"
                    style={{ height: `${Math.max(pct, m.revenue > 0 ? 4 : 0)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400">{m.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top vehicles by revenue */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            Top Vehicles by Revenue
          </h2>
        </div>
        {data.topVehicles.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-gray-400">
            No completed bookings yet.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.topVehicles.map((v, i) => (
              <div key={v.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600 shrink-0">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">
                    {v.make} {v.model} ({v.year})
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {v.completedBookings} completed &middot; {v.totalBookings} total bookings
                    &middot; {v.reviewCount} reviews
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-green-600">₱{v.revenue.toLocaleString()}</p>
                  {v.currentlyBooked && (
                    <span className="inline-block mt-0.5 text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      Active
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Utilization gauge */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Fleet Utilization
        </h2>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  data.utilizationRate >= 60
                    ? 'bg-green-500'
                    : data.utilizationRate >= 30
                      ? 'bg-yellow-500'
                      : 'bg-red-400'
                }`}
                style={{ width: `${Math.min(data.utilizationRate, 100)}%` }}
              />
            </div>
          </div>
          <span className="text-2xl font-bold text-gray-900 shrink-0">{data.utilizationRate}%</span>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {data.activeVehicles} of {data.totalVehicles} vehicles currently on active rental.
          {data.utilizationRate < 30 && ' Consider promotional pricing to improve utilization.'}
          {data.utilizationRate >= 80 && ' High utilization — consider expanding your fleet.'}
        </p>
      </div>

      {/* Maintenance forecast */}
      {data.maintenanceForecast && data.maintenanceForecast.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
              Maintenance Schedule Forecast
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Based on 30-day use intervals. Vehicles approaching maintenance threshold are flagged.
            </p>
          </div>
          <div className="divide-y divide-gray-100">
            {data.maintenanceForecast.map((v) => (
              <div key={v.id} className="px-6 py-3 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">
                    {v.make} {v.model} ({v.year})
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {v.totalUseDays} total use days &middot; {v.daysUntilMaintenance} days until
                    next service
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  {v.needsMaintenance ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                      Service Due
                    </span>
                  ) : v.weeksUntilMaintenance !== null ? (
                    <span className="text-xs text-gray-500">~{v.weeksUntilMaintenance}w away</span>
                  ) : (
                    <span className="text-xs text-gray-400">Insufficient data</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string;
  value: string | number;
  sub: string;
  accent?: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-500',
  };
  const cls = (accent ? colorMap[accent] : undefined) ?? 'text-gray-900';

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <p className="text-xs text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-3xl font-bold ${cls}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
  );
}
