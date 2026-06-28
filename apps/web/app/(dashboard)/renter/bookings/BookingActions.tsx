'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { confirmBooking, cancelBooking, completeBooking } from '@/lib/api';

interface BookingActionsProps {
  bookingId: string;
  status: string;
}

export function BookingActions({ bookingId, status }: BookingActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);

  const act = async (action: 'confirm' | 'cancel' | 'complete') => {
    if (!session?.apiToken) return;
    setLoading(action);
    try {
      if (action === 'confirm') await confirmBooking(bookingId, session.apiToken);
      else if (action === 'cancel') await cancelBooking(bookingId, session.apiToken);
      else await completeBooking(bookingId, session.apiToken);
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  if (status === 'PENDING') {
    return (
      <div className="flex gap-2">
        <ActionBtn
          label="Confirm"
          onClick={() => act('confirm')}
          loading={loading === 'confirm'}
          variant="green"
        />
        <ActionBtn
          label="Cancel"
          onClick={() => act('cancel')}
          loading={loading === 'cancel'}
          variant="red"
        />
      </div>
    );
  }

  if (status === 'CONFIRMED') {
    return (
      <ActionBtn
        label="Cancel"
        onClick={() => act('cancel')}
        loading={loading === 'cancel'}
        variant="red"
      />
    );
  }

  if (status === 'ACTIVE') {
    return (
      <ActionBtn
        label="Complete"
        onClick={() => act('complete')}
        loading={loading === 'complete'}
        variant="blue"
      />
    );
  }

  return <span className="text-xs text-gray-400">—</span>;
}

function ActionBtn({
  label,
  onClick,
  loading,
  variant,
}: {
  label: string;
  onClick: () => void;
  loading: boolean;
  variant: 'green' | 'red' | 'blue';
}) {
  const cls = {
    green: 'text-green-700 border-green-200 hover:bg-green-50',
    red: 'text-red-700 border-red-200 hover:bg-red-50',
    blue: 'text-blue-700 border-blue-200 hover:bg-blue-50',
  }[variant];

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`px-3 py-1 text-xs font-medium rounded-md border transition-colors disabled:opacity-50 ${cls}`}
    >
      {loading ? '…' : label}
    </button>
  );
}
