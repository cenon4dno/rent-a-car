'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createVehicle, updateVehicle, type CreateVehicleBody } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface VehicleFormProps {
  mode: 'create' | 'edit';
  vehicleId?: string;
  initial?: Partial<CreateVehicleBody>;
}

const FUEL_OPTIONS = ['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC'];
const TRANSMISSION_OPTIONS = ['AUTOMATIC', 'MANUAL', 'CVT'];

export function VehicleForm({ mode, vehicleId, initial = {} }: VehicleFormProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [form, setForm] = useState<CreateVehicleBody>({
    make: initial.make ?? '',
    model: initial.model ?? '',
    year: initial.year ?? new Date().getFullYear(),
    plateNumber: initial.plateNumber ?? '',
    description: initial.description ?? '',
    fuelType: initial.fuelType ?? 'GASOLINE',
    transmission: initial.transmission ?? 'AUTOMATIC',
    seatingCapacity: initial.seatingCapacity ?? 5,
    dailyRate: initial.dailyRate ?? 0,
    mileageLimit: initial.mileageLimit,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CreateVehicleBody>(key: K, value: CreateVehicleBody[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.apiToken) return;
    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        await createVehicle(form, session.apiToken);
      } else if (vehicleId) {
        await updateVehicle(vehicleId, form, session.apiToken);
      }
      router.push('/renter/fleet');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <Field label="Make" required>
          <input
            value={form.make}
            onChange={(e) => set('make', e.target.value)}
            required
            placeholder="Toyota"
            className={inputCls}
          />
        </Field>
        <Field label="Model" required>
          <input
            value={form.model}
            onChange={(e) => set('model', e.target.value)}
            required
            placeholder="Vios"
            className={inputCls}
          />
        </Field>
        <Field label="Year" required>
          <input
            type="number"
            value={form.year}
            onChange={(e) => set('year', Number(e.target.value))}
            required
            min={1990}
            max={new Date().getFullYear() + 1}
            className={inputCls}
          />
        </Field>
        <Field label="Plate Number" required>
          <input
            value={form.plateNumber}
            onChange={(e) => set('plateNumber', e.target.value)}
            required
            placeholder="ABC 1234"
            className={inputCls}
          />
        </Field>
        <Field label="Fuel Type" required>
          <select
            value={form.fuelType}
            onChange={(e) => set('fuelType', e.target.value)}
            className={inputCls}
          >
            {FUEL_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Transmission" required>
          <select
            value={form.transmission}
            onChange={(e) => set('transmission', e.target.value)}
            className={inputCls}
          >
            {TRANSMISSION_OPTIONS.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Seating Capacity" required>
          <input
            type="number"
            value={form.seatingCapacity}
            onChange={(e) => set('seatingCapacity', Number(e.target.value))}
            required
            min={1}
            max={20}
            className={inputCls}
          />
        </Field>
        <Field label="Daily Rate (₱)" required>
          <input
            type="number"
            value={form.dailyRate}
            onChange={(e) => set('dailyRate', Number(e.target.value))}
            required
            min={0}
            step={50}
            className={inputCls}
          />
        </Field>
        <Field label="Mileage Limit (km/day)">
          <input
            type="number"
            value={form.mileageLimit ?? ''}
            onChange={(e) =>
              set('mileageLimit', e.target.value ? Number(e.target.value) : undefined)
            }
            min={0}
            placeholder="Unlimited"
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Description">
        <textarea
          value={form.description ?? ''}
          onChange={(e) => set('description', e.target.value)}
          rows={3}
          placeholder="Brief description of the vehicle condition and features..."
          className={`${inputCls} resize-none`}
        />
      </Field>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} disabled={loading}>
          {mode === 'create' ? 'Add Vehicle' : 'Save Changes'}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.push('/renter/fleet')}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

const inputCls =
  'w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white';

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}
