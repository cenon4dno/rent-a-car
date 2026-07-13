import { notFound } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';
import { getBooking } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { QrCode } from '@/components/ui/QrCode';
import { DisputeForm } from './DisputeForm';
import { ReviewForm } from './ReviewForm';
import { SosButton } from './SosButton';

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

          {/* QR code */}
          <div className="flex justify-center py-6">
            <QrCode value={ref} size={140} />
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

        {/* Pickup Map — exact pinned coordinates when the booking has them,
            otherwise a Metro Manila overview */}
        <div className="mt-6 bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900">Pickup Location</p>
            <p className="text-xs text-gray-500 mt-0.5">{b.pickupLocation}</p>
          </div>
          <iframe
            title="Pickup location map"
            width="100%"
            height="220"
            style={{ border: 0 }}
            src={
              b.pickupLat != null && b.pickupLng != null
                ? `https://www.openstreetmap.org/export/embed.html?bbox=${b.pickupLng - 0.01},${b.pickupLat - 0.006},${b.pickupLng + 0.01},${b.pickupLat + 0.006}&layer=mapnik&marker=${b.pickupLat},${b.pickupLng}`
                : `https://www.openstreetmap.org/export/embed.html?bbox=120.9,14.5,121.1,14.7&layer=mapnik&marker=14.6,121.0`
            }
            loading="lazy"
          />
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

        {/* SOS button — active rentals only */}
        {b.status === 'ACTIVE' && session.apiToken && (
          <div className="mt-6">
            <SosButton bookingId={b.id} token={session.apiToken as string} type="sos" />
          </div>
        )}

        {/* Driver no-show — pending/confirmed with a driver assigned */}
        {['PENDING', 'CONFIRMED'].includes(b.status) && b.driver && session.apiToken && (
          <div className="mt-4">
            <SosButton bookingId={b.id} token={session.apiToken as string} type="driver-no-show" />
          </div>
        )}

        {/* Review (customer, completed bookings only) */}
        {b.status === 'COMPLETED' && (
          <ReviewForm bookingId={b.id} vehicleId={b.vehicleId} token={session.apiToken as string} />
        )}

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
