'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  createVehicle,
  updateVehicle,
  type CreateVehicleBody,
  type VehiclePhotos,
  type RegistrationDocs,
} from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface VehicleFormProps {
  mode: 'create' | 'edit';
  vehicleId?: string;
  initial?: Partial<CreateVehicleBody>;
}

const FUEL_OPTIONS = ['GASOLINE', 'DIESEL', 'HYBRID', 'ELECTRIC'];
const TRANSMISSION_OPTIONS = ['AUTOMATIC', 'MANUAL', 'CVT'];
const TAG_OPTIONS = [
  'Wedding',
  'Airport Transfer',
  'Road Trip',
  'House Move',
  'Corporate',
  'Group Tour',
];

const PHOTO_SLOTS: { key: keyof VehiclePhotos; label: string; hint: string }[] = [
  { key: 'front', label: 'Front View', hint: 'Head-on shot of the front of the vehicle' },
  { key: 'back', label: 'Rear View', hint: 'Head-on shot of the rear of the vehicle' },
  { key: 'side', label: 'Side View', hint: 'Full side profile of the vehicle' },
  { key: 'interior', label: 'Interior', hint: 'Dashboard and cabin area' },
];

async function compressImage(file: File, maxPx = 1200): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.src = url;
  });
}

async function fileToDataUrl(file: File): Promise<string> {
  if (file.type === 'application/pdf') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
  return compressImage(file);
}

export function VehicleForm({ mode, vehicleId, initial = {} }: VehicleFormProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [selectedTags, setSelectedTags] = useState<string[]>(initial.tags ?? []);
  const [vehiclePhotos, setVehiclePhotos] = useState<Partial<VehiclePhotos>>(
    initial.vehiclePhotos ?? {},
  );
  const [registrationDocs, setRegistrationDocs] = useState<Partial<RegistrationDocs>>(
    initial.registrationDocs ?? {},
  );

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

  function toggleTag(t: string) {
    setSelectedTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof CreateVehicleBody>(key: K, value: CreateVehicleBody[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const MAX_FILE_BYTES = 1 * 1024 * 1024; // 1 MB

  async function handlePhotoChange(key: keyof VehiclePhotos, file: File | null) {
    if (!file) {
      setVehiclePhotos((p) => ({ ...p, [key]: '' }));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(`"${file.name}" exceeds the 1 MB limit. Please choose a smaller file.`);
      return;
    }
    setError(null);
    const dataUrl = await fileToDataUrl(file);
    setVehiclePhotos((p) => ({ ...p, [key]: dataUrl }));
  }

  async function handleDocChange(key: keyof RegistrationDocs, file: File | null) {
    if (!file) {
      setRegistrationDocs((d) => ({ ...d, [key]: '' }));
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError(`"${file.name}" exceeds the 1 MB limit. Please choose a smaller file.`);
      return;
    }
    setError(null);
    const dataUrl = await fileToDataUrl(file);
    setRegistrationDocs((d) => ({ ...d, [key]: dataUrl }));
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.apiToken) return;

    const missingPhotos = PHOTO_SLOTS.filter(({ key }) => !vehiclePhotos[key]).map(
      ({ label }) => label,
    );
    if (missingPhotos.length) {
      setError(`Please upload all required vehicle photos: ${missingPhotos.join(', ')}.`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const body = { ...form, tags: selectedTags, vehiclePhotos, registrationDocs };
      if (mode === 'create') {
        await createVehicle(body, session.apiToken);
      } else if (vehicleId) {
        await updateVehicle(vehicleId, body, session.apiToken);
      }
      router.push('/renter/fleet');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save vehicle.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* ── Vehicle details ── */}
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

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Use-case tags <span className="text-gray-400 font-normal">(select all that apply)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {TAG_OPTIONS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => toggleTag(t)}
              className={[
                'px-3 py-1 rounded-full text-sm border transition-colors',
                selectedTags.includes(t)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300',
              ].join(' ')}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* ── Vehicle Photos ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Vehicle Photos <span className="text-red-500">*</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            All four angles are required before the vehicle can be listed.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PHOTO_SLOTS.map(({ key, label, hint }) => (
            <PhotoUploadCard
              key={key}
              label={label}
              hint={hint}
              value={vehiclePhotos[key] ?? ''}
              accept="image/*"
              onChange={(f) => handlePhotoChange(key, f)}
            />
          ))}
        </div>
      </section>

      {/* ── Registration Documents ── */}
      <section>
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-gray-800">Registration Documents</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload the Official Receipt (OR) and Certificate of Registration (CR) of the vehicle.
            Accepted formats: JPG, PNG, PDF.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <DocUploadCard
            label="Official Receipt (OR)"
            value={registrationDocs.or ?? ''}
            accept="image/*,application/pdf"
            onChange={(f) => handleDocChange('or', f)}
          />
          <DocUploadCard
            label="Certificate of Registration (CR)"
            value={registrationDocs.cr ?? ''}
            accept="image/*,application/pdf"
            onChange={(f) => handleDocChange('cr', f)}
          />
        </div>
      </section>

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

// ─── Photo upload card (images only, with preview) ─────────────────────────

function PhotoUploadCard({
  label,
  hint,
  value,
  accept,
  onChange,
}: {
  label: string;
  hint: string;
  value: string;
  accept: string;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1.5">
        {label} <span className="text-red-500">*</span>
      </p>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-50">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove photo"
          >
            <XIcon />
          </button>
        </div>
      ) : (
        <label
          className="flex flex-col items-center justify-center gap-1.5 aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-colors"
          title={hint}
        >
          <CameraIcon />
          <span className="text-xs text-gray-500">{hint}</span>
          <span className="text-[11px] text-blue-600 font-medium">Click to upload</span>
          <input
            ref={inputRef}
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
    </div>
  );
}

// ─── Document upload card (image or PDF, no preview image for PDF) ──────────

function DocUploadCard({
  label,
  value,
  accept,
  onChange,
}: {
  label: string;
  value: string;
  accept: string;
  onChange: (file: File | null) => void;
}) {
  const isPdf = value.startsWith('data:application/pdf');
  const isImage = value && !isPdf;

  return (
    <div>
      <p className="text-xs font-medium text-gray-600 mb-1.5">{label}</p>
      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
          {isImage ? (
            <img src={value} alt={label} className="w-full aspect-video object-cover" />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 aspect-video">
              <DocumentIcon />
              <span className="text-xs text-gray-600 font-medium">PDF uploaded</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 rounded-full p-1 shadow opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove document"
          >
            <XIcon />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center gap-1.5 aspect-video rounded-xl border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer transition-colors">
          <DocumentIcon />
          <span className="text-[11px] text-blue-600 font-medium">Click to upload</span>
          <span className="text-[10px] text-gray-400">JPG, PNG or PDF</span>
          <input
            type="file"
            accept={accept}
            className="sr-only"
            onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          />
        </label>
      )}
    </div>
  );
}

// ─── Shared atoms ───────────────────────────────────────────────────────────

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

function CameraIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"
      />
    </svg>
  );
}

function DocumentIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-6 h-6 text-gray-300"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
      />
    </svg>
  );
}

function XIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="w-4 h-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}
