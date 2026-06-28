import Link from 'next/link';
import { auth } from '@/auth';
import { getMyVehicles } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { FleetActions } from './FleetActions';

const STATUS_VARIANT: Record<string, 'green' | 'yellow' | 'blue' | 'gray' | 'red'> = {
  AVAILABLE: 'green',
  RENTED: 'blue',
  MAINTENANCE: 'yellow',
  INACTIVE: 'gray',
};

const FUEL_LABEL: Record<string, string> = {
  GASOLINE: 'Gas',
  DIESEL: 'Diesel',
  HYBRID: 'Hybrid',
  ELECTRIC: 'EV',
};

export default async function RenterFleetPage() {
  const session = await auth();
  const result = await getMyVehicles(session!.apiToken).catch(() => null);
  const vehicles = result?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Fleet</h1>
        <Link
          href="/renter/fleet/new"
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          + Add Vehicle
        </Link>
      </div>

      {vehicles.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <p className="text-lg font-medium mb-2">No vehicles in your fleet yet.</p>
          <Link href="/renter/fleet/new" className="text-blue-600 text-sm hover:underline">
            Add your first vehicle &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Vehicle', 'Fuel / Trans.', 'Seats', 'Daily Rate', 'Status', 'Bookings', ''].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {vehicles.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {v.make} {v.model}
                    </p>
                    <p className="text-xs text-gray-400">
                      {v.year} · {v.plateNumber}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {FUEL_LABEL[v.fuelType] ?? v.fuelType} / {v.transmission}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{v.seatingCapacity}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ₱{v.dailyRate.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={v.status} variant={STATUS_VARIANT[v.status] ?? 'gray'} />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{v.bookings.length} active</td>
                  <td className="px-4 py-3">
                    <FleetActions vehicleId={v.id} currentStatus={v.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
