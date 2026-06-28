'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createBooking, createPayment, confirmPayment } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

const ADDON_LABELS: Record<string, { label: string; pricePerDay: number }> = {
  childSeat: { label: 'Child Seat', pricePerDay: 500 },
  chauffeur: { label: 'Chauffeur', pricePerDay: 1500 },
};

const PLATFORM_FEE_RATE = 0.05;

const PAYMENT_METHODS = [
  { id: 'card', label: 'Credit / Debit Card', icon: '💳' },
  { id: 'gcash', label: 'GCash', icon: '📱' },
  { id: 'maya', label: 'Maya', icon: '💚' },
] as const;

interface ReviewClientProps {
  vehicle: {
    id: string;
    make: string;
    model: string;
    year: number;
    dailyRate: number;
    renterName: string;
  };
  pickupLocation: string;
  startDate: string;
  endDate: string;
  addons: string[];
}

export function ReviewClient({
  vehicle,
  pickupLocation,
  startDate,
  endDate,
  addons,
}: ReviewClientProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { days, baseTotal, addonsTotal, platformFee, grandTotal } = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const baseTotal = days * vehicle.dailyRate;
    const addonsTotal = addons.reduce((sum, id) => {
      const a = ADDON_LABELS[id];
      return sum + (a ? a.pricePerDay * days : 0);
    }, 0);
    const subtotal = baseTotal + addonsTotal;
    const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
    return { days, baseTotal, addonsTotal, platformFee, grandTotal: subtotal + platformFee };
  }, [startDate, endDate, vehicle.dailyRate, addons]);

  const handleConfirm = async () => {
    if (!session?.apiToken) return;
    setLoading(true);
    setError(null);

    try {
      const bookingRes = await createBooking(
        {
          vehicleId: vehicle.id,
          pickupLocation,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
        },
        session.apiToken,
      );

      const bookingId = bookingRes.data.id;
      const providerRef = `STUB-${Date.now()}`;

      await createPayment(bookingId, paymentMethod, providerRef, session.apiToken);
      await confirmPayment(bookingId, session.apiToken);

      router.push(`/booking/${bookingId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed. Please try again.');
      setLoading(false);
    }
  };

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-5">
      {/* Vehicle summary */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Vehicle
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-lg font-bold text-gray-900">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="text-sm text-gray-500">{vehicle.year}</p>
            <p className="text-sm text-gray-500 mt-1">{vehicle.renterName}</p>
          </div>
          <Badge label={`₱${vehicle.dailyRate.toLocaleString()}/day`} variant="blue" />
        </div>
      </section>

      {/* Trip details */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Trip Details
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Detail label="Pick-up" value={fmt(startDate)} />
          <Detail label="Drop-off" value={fmt(endDate)} />
          <Detail label="Duration" value={`${days} day${days !== 1 ? 's' : ''}`} />
          <Detail label="Location" value={pickupLocation} />
        </div>

        {addons.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Add-ons
            </p>
            <div className="flex flex-wrap gap-2">
              {addons.map((id) => {
                const a = ADDON_LABELS[id];
                return a ? (
                  <Badge key={id} label={`${a.label} (+₱${a.pricePerDay}/day)`} variant="gray" />
                ) : null;
              })}
            </div>
          </div>
        )}
      </section>

      {/* Price breakdown */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Price Breakdown
        </h2>
        <div className="space-y-2 text-sm">
          <PriceLine
            label={`₱${vehicle.dailyRate.toLocaleString()} × ${days} day${days !== 1 ? 's' : ''}`}
            value={baseTotal}
          />
          {addonsTotal > 0 && <PriceLine label="Add-ons" value={addonsTotal} />}
          <PriceLine label="Platform fee (5%)" value={platformFee} />
          <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold text-gray-900">
            <span>Total</span>
            <span>₱{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      </section>

      {/* Payment method */}
      <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
          Payment Method
        </h2>
        <div className="space-y-2">
          {PAYMENT_METHODS.map((m) => (
            <label
              key={m.id}
              className={[
                'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors',
                paymentMethod === m.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300',
              ].join(' ')}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={m.id}
                checked={paymentMethod === m.id}
                onChange={() => setPaymentMethod(m.id)}
                className="text-blue-600 focus:ring-blue-500"
              />
              <span className="text-lg">{m.icon}</span>
              <span className="text-sm font-medium text-gray-800">{m.label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Confirm */}
      <Button
        onClick={handleConfirm}
        loading={loading}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        Confirm & Pay ₱{grandTotal.toLocaleString()}
      </Button>

      <p className="text-xs text-center text-gray-400">
        Payment is simulated — no real charges will be made.
      </p>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}

function PriceLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between text-gray-700">
      <span>{label}</span>
      <span>₱{value.toLocaleString()}</span>
    </div>
  );
}
