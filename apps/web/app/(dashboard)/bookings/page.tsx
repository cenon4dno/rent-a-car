import Link from 'next/link';
import { auth } from '@/auth';
import { getMyBookings } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

const STATUS_VARIANT: Record<string, 'green' | 'yellow' | 'blue' | 'gray' | 'red'> = {
  CONFIRMED: 'green',
  ACTIVE: 'blue',
  PENDING: 'yellow',
  COMPLETED: 'gray',
  CANCELLED: 'red',
};

const STATUS_LABEL: Record<string, string> = {
  CONFIRMED: 'Confirmed',
  ACTIVE: 'Active',
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export default async function MyBookingsPage() {
  const session = await auth();
  const result = await getMyBookings(session!.apiToken).catch(() => null);
  const bookings = result?.data ?? [];

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">My Bookings</h1>

        {bookings.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <p className="text-gray-500 font-medium">No bookings yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Browse available cars and make your first booking.
            </p>
            <Link
              href="/search"
              className="inline-block mt-4 text-sm text-blue-600 font-medium hover:underline"
            >
              Browse Cars &rarr;
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => {
              const ref = `RAC-${b.id.toUpperCase().slice(0, 8)}`;
              const days = Math.ceil(
                (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) /
                  (1000 * 60 * 60 * 24),
              );
              return (
                <Link
                  key={b.id}
                  href={`/booking/${b.id}`}
                  className="block bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900">
                          {b.vehicle.make} {b.vehicle.model}{' '}
                          <span className="font-normal text-gray-500">({b.vehicle.year})</span>
                        </p>
                        <Badge
                          label={STATUS_LABEL[b.status] ?? b.status}
                          variant={STATUS_VARIANT[b.status] ?? 'gray'}
                        />
                      </div>
                      <p className="text-xs font-mono text-gray-400 mb-2">{ref}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                        <span>
                          {fmt(b.startDate)} &ndash; {fmt(b.endDate)}
                        </span>
                        <span>
                          {days} day{days !== 1 ? 's' : ''}
                        </span>
                        <span>{b.pickupLocation}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-lg font-bold text-gray-900">
                        ₱{b.totalAmount.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {b.payment?.status === 'PAID'
                          ? 'Paid'
                          : b.payment
                            ? 'Pending payment'
                            : 'Unpaid'}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
