import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getBooking } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { DisputeForm } from './DisputeForm';

interface BookingPageProps {
  params: Promise<{ id: string }>;
}

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

export default async function BookingDetailPage({ params }: BookingPageProps) {
  const { id } = await params;
  const session = await auth();
  if (!session?.apiToken) notFound();

  const result = await getBooking(id, session.apiToken).catch(() => null);
  if (!result?.data) notFound();

  const b = result.data;
  const isPaid = b.payment?.status === 'PAID';
  const ref = `RAC-${b.id.toUpperCase().slice(0, 8)}`;

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });

  const days = Math.ceil(
    (new Date(b.endDate).getTime() - new Date(b.startDate).getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        {/* Success header */}
        {isPaid && (
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Booking Confirmed!</h1>
            <p className="text-gray-500 mt-1">Your reservation is secured. Details are below.</p>
          </div>
        )}

        {!isPaid && <h1 className="text-2xl font-bold text-gray-900 mb-8">Booking Details</h1>}

        {/* Ticket card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Ticket header */}
          <div className="bg-blue-600 px-6 py-5 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-200 uppercase tracking-wide mb-1">
                  Booking Reference
                </p>
                <p className="text-2xl font-bold tracking-widest font-mono">{ref}</p>
              </div>
              <Badge
                label={STATUS_LABEL[b.status] ?? b.status}
                variant={STATUS_VARIANT[b.status] ?? 'gray'}
              />
            </div>
          </div>

          {/* Dashed separator */}
          <div className="relative">
            <div className="absolute -left-4 top-1/2 w-8 h-8 rounded-full bg-gray-50 border border-gray-200" />
            <div className="absolute -right-4 top-1/2 w-8 h-8 rounded-full bg-gray-50 border border-gray-200" />
            <div className="border-t-2 border-dashed border-gray-200 mx-4" />
          </div>

          {/* QR placeholder */}
          <div className="flex justify-center py-6">
            <QrPlaceholder value={ref} />
          </div>

          {/* Dashed separator */}
          <div className="relative">
            <div className="absolute -left-4 top-1/2 w-8 h-8 rounded-full bg-gray-50 border border-gray-200" />
            <div className="absolute -right-4 top-1/2 w-8 h-8 rounded-full bg-gray-50 border border-gray-200" />
            <div className="border-t-2 border-dashed border-gray-200 mx-4" />
          </div>

          {/* Booking details */}
          <div className="px-6 py-6 grid grid-cols-2 gap-x-8 gap-y-5">
            <BookingDetail
              label="Vehicle"
              value={`${b.vehicle.make} ${b.vehicle.model} (${b.vehicle.year})`}
            />
            <BookingDetail label="Pick-up Location" value={b.pickupLocation} />
            <BookingDetail label="Start Date" value={fmt(b.startDate)} />
            <BookingDetail label="End Date" value={fmt(b.endDate)} />
            <BookingDetail label="Duration" value={`${days} day${days !== 1 ? 's' : ''}`} />
            <BookingDetail label="Renter" value={b.renter?.companyName ?? '—'} />
          </div>

          {/* Payment summary */}
          <div className="px-6 pb-6 pt-0">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Daily Rate</span>
                <span>₱{b.dailyRate.toLocaleString()}/day</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Base ({days} days)</span>
                <span>
                  ₱
                  {(b.totalAmount / (1 + b.platformFeeRate))
                    .toFixed(0)
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>Platform fee (5%)</span>
                <span>₱{b.platformFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 border-t border-gray-200 pt-3">
                <span>Total Paid</span>
                <span>₱{b.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-center">
          <Link href="/bookings">
            <Button variant="secondary">View My Bookings</Button>
          </Link>
          <Link href="/search">
            <Button variant="ghost">Browse More Cars</Button>
          </Link>
        </div>

        {/* Dispute */}
        {['COMPLETED', 'ACTIVE', 'CONFIRMED'].includes(b.status) && (
          <DisputeForm bookingId={b.id} />
        )}
      </div>
    </div>
  );
}

function BookingDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function QrPlaceholder({ value }: { value: string }) {
  const cells = Array.from({ length: 7 * 7 }, (_, i) => {
    const row = Math.floor(i / 7);
    const col = i % 7;
    const isFinder =
      (row < 2 && col < 2) ||
      (row < 2 && col > 4) ||
      (row > 4 && col < 2) ||
      (row === 3 && col === 3);
    const seed = (value.charCodeAt(i % value.length) + i * 13) % 7;
    return isFinder || seed < 3;
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="grid border-2 border-gray-800 p-1 rounded"
        style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', width: 80, height: 80 }}
      >
        {cells.map((filled, i) => (
          <div key={i} className={`rounded-sm ${filled ? 'bg-gray-900' : 'bg-white'}`} />
        ))}
      </div>
      <p className="text-xs font-mono text-gray-500">{value}</p>
    </div>
  );
}
