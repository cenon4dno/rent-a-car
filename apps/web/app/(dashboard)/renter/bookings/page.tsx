import { auth } from '@/auth';
import { getMyBookings } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { BookingActions } from './BookingActions';

const STATUS_VARIANT: Record<string, 'green' | 'yellow' | 'blue' | 'gray' | 'red'> = {
  CONFIRMED: 'green',
  ACTIVE: 'blue',
  PENDING: 'yellow',
  COMPLETED: 'gray',
  CANCELLED: 'red',
};

export default async function RenterBookingsPage() {
  const session = await auth();
  const result = await getMyBookings(session!.apiToken).catch(() => null);
  const bookings = (result?.data ?? []).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No bookings yet.</div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Vehicle', 'Customer', 'Dates', 'Amount', 'Status', 'Actions'].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">
                      {b.vehicle.make} {b.vehicle.model}
                    </p>
                    <p className="text-xs text-gray-400">{b.pickupLocation}</p>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <span className="text-xs font-mono text-gray-400">
                      {`RAC-${b.id.toUpperCase().slice(0, 8)}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {fmt(b.startDate)} &ndash; {fmt(b.endDate)}
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900">
                    ₱{b.totalAmount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge label={b.status} variant={STATUS_VARIANT[b.status] ?? 'gray'} />
                  </td>
                  <td className="px-4 py-3">
                    <BookingActions bookingId={b.id} status={b.status} />
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
