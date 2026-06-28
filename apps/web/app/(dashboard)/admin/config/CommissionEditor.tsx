'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { updateRenterCommission } from '@/lib/api';
import { Button } from '@/components/ui/Button';

interface CommissionEditorProps {
  renterId: string;
  currentRate: number;
}

export function CommissionEditor({ renterId, currentRate }: CommissionEditorProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String((currentRate * 100).toFixed(1)));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    if (!session?.apiToken) return;
    const rate = parseFloat(value) / 100;
    if (isNaN(rate) || rate < 0 || rate > 1) {
      setError('Enter a value between 0 and 100');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await updateRenterCommission(renterId, rate, session.apiToken);
      setEditing(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setLoading(false);
    }
  };

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
      >
        Edit
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          step="0.1"
          min="0"
          max="100"
          className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-l-md focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <span className="px-2 py-1 text-sm bg-gray-100 border border-l-0 border-gray-200 rounded-r-md text-gray-500">
          %
        </span>
      </div>
      <Button size="sm" onClick={save} loading={loading} disabled={loading}>
        Save
      </Button>
      <Button
        size="sm"
        variant="ghost"
        onClick={() => {
          setEditing(false);
          setValue(String((currentRate * 100).toFixed(1)));
          setError(null);
        }}
        disabled={loading}
      >
        Cancel
      </Button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
