'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { updateMe } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface ProfileSettingsFormProps {
  initial: {
    name: string;
    phone: string;
    companyName: string;
    taxIdNumber: string;
    bankAccountDetails: string;
  };
  email: string;
  isRenter: boolean;
}

export function ProfileSettingsForm({ initial, email, isRenter }: ProfileSettingsFormProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [field]: e.target.value }));
    setSaved(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.apiToken) return;
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await updateMe(
        {
          name: form.name.trim(),
          phone: form.phone.trim(),
          ...(isRenter
            ? {
                companyName: form.companyName.trim(),
                taxIdNumber: form.taxIdNumber.trim(),
                bankAccountDetails: form.bankAccountDetails.trim(),
              }
            : {}),
        },
        session.apiToken,
      );
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500';

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {isRenter ? 'Company Details' : 'Personal Details'}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            disabled
            className={`${inputClass} bg-gray-50 text-gray-500`}
          />
          <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {isRenter ? 'Contact Person Name' : 'Display Name'}
          </label>
          <input
            type="text"
            value={form.name}
            onChange={set('name')}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+63 917 123 4567"
            className={inputClass}
          />
        </div>

        {isRenter && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
              <input
                type="text"
                value={form.companyName}
                onChange={set('companyName')}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tax Identification Number
              </label>
              <input
                type="text"
                value={form.taxIdNumber}
                onChange={set('taxIdNumber')}
                placeholder="123-456-789-000"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Corporate Bank Details
              </label>
              <input
                type="text"
                value={form.bankAccountDetails}
                onChange={set('bankAccountDetails')}
                placeholder="Bank, account number, account name"
                className={inputClass}
              />
            </div>
          </>
        )}

        {error && <p className="text-sm text-red-500">{error}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" loading={saving}>
            Save changes
          </Button>
          {saved && <span className="text-sm text-green-600">Saved.</span>}
        </div>
      </form>
    </section>
  );
}
