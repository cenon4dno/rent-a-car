'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';

interface BookingFormProps {
  vehicleId: string;
  dailyRate: number;
  initialStartDate?: string;
  initialEndDate?: string;
  initialLocation?: string;
}

const ADDONS = [
  { id: 'childSeat', label: 'Child Seat', pricePerDay: 500 },
  { id: 'chauffeur', label: 'Chauffeur', pricePerDay: 1500 },
] as const;

const PLATFORM_FEE_RATE = 0.05;

export function BookingForm({
  vehicleId,
  dailyRate,
  initialStartDate = '',
  initialEndDate = '',
  initialLocation = '',
}: BookingFormProps) {
  const router = useRouter();
  const { status } = useSession();

  const today = new Date().toISOString().split('T')[0];

  const [pickupLocation, setPickupLocation] = useState(initialLocation);
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());

  const { days, baseTotal, addonsTotal, platformFee, grandTotal } = useMemo(() => {
    if (!startDate || !endDate) {
      return { days: 0, baseTotal: 0, addonsTotal: 0, platformFee: 0, grandTotal: 0 };
    }
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.max(0, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const baseTotal = days * dailyRate;
    const addonsTotal = ADDONS.filter((a) => selectedAddons.has(a.id)).reduce(
      (sum, a) => sum + a.pricePerDay * days,
      0,
    );
    const subtotal = baseTotal + addonsTotal;
    const platformFee = Math.round(subtotal * PLATFORM_FEE_RATE);
    const grandTotal = subtotal + platformFee;
    return { days, baseTotal, addonsTotal, platformFee, grandTotal };
  }, [startDate, endDate, dailyRate, selectedAddons]);

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isValid = Boolean(pickupLocation && startDate && endDate && days > 0);

  const handleProceed = () => {
    if (status === 'unauthenticated') {
      router.push(`/login?callbackUrl=/vehicle/${vehicleId}`);
      return;
    }
    const qs = new URLSearchParams({
      vehicleId,
      pickupLocation,
      startDate,
      endDate,
      addons: [...selectedAddons].join(','),
    });
    router.push(`/booking/review?${qs.toString()}`);
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-5">
      <h2 className="text-base font-semibold text-gray-900">Reserve this vehicle</h2>

      {/* Pickup location */}
      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="pickup">
          Pick-up Location
        </label>
        <input
          id="pickup"
          type="text"
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          placeholder="e.g. Makati City"
          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Date range */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="startDate">
            Pick-up Date
          </label>
          <input
            id="startDate"
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              if (endDate && e.target.value > endDate) setEndDate('');
            }}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5" htmlFor="endDate">
            Drop-off Date
          </label>
          <input
            id="endDate"
            type="date"
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Add-ons */}
      <div>
        <p className="text-xs font-medium text-gray-600 mb-2">Add-ons</p>
        <div className="space-y-2">
          {ADDONS.map((addon) => (
            <label
              key={addon.id}
              className="flex items-center justify-between gap-2 cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={selectedAddons.has(addon.id)}
                  onChange={() => toggleAddon(addon.id)}
                  className="rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 group-hover:text-gray-900">
                  {addon.label}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                +₱{addon.pricePerDay.toLocaleString()}/day
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price breakdown */}
      {days > 0 && (
        <div className="rounded-xl bg-gray-50 border border-gray-100 p-4 space-y-2 text-sm">
          <PriceLine
            label={`₱${dailyRate.toLocaleString()} × ${days} day${days !== 1 ? 's' : ''}`}
            value={baseTotal}
          />
          {addonsTotal > 0 && <PriceLine label="Add-ons" value={addonsTotal} />}
          <PriceLine label="Platform fee (5%)" value={platformFee} />
          <div className="border-t border-gray-200 pt-2 flex justify-between font-semibold text-gray-900">
            <span>Total</span>
            <span>₱{grandTotal.toLocaleString()}</span>
          </div>
        </div>
      )}

      <Button onClick={handleProceed} disabled={!isValid} className="w-full" size="lg">
        {status === 'unauthenticated' ? 'Sign in to Book' : 'Proceed to Review'}
      </Button>

      <p className="text-xs text-center text-gray-400">You won&apos;t be charged yet.</p>
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
