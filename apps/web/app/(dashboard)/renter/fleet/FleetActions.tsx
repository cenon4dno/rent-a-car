'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { updateVehicle } from '@/lib/api';

interface FleetActionsProps {
  vehicleId: string;
  currentStatus: string;
}

export function FleetActions({ vehicleId, currentStatus }: FleetActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const isInactive = currentStatus === 'INACTIVE';

  const toggleStatus = async () => {
    if (!session?.apiToken) return;
    setLoading(true);
    try {
      await updateVehicle(
        vehicleId,
        { status: isInactive ? 'AVAILABLE' : 'INACTIVE' },
        session.apiToken,
      );
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Link
        href={`/renter/fleet/${vehicleId}/edit`}
        className="px-3 py-1 text-xs font-medium text-blue-600 border border-blue-200 rounded-md hover:bg-blue-50 transition-colors"
      >
        Edit
      </Link>
      <button
        onClick={toggleStatus}
        disabled={loading}
        className={[
          'px-3 py-1 text-xs font-medium rounded-md border transition-colors disabled:opacity-50',
          isInactive
            ? 'text-green-700 border-green-200 hover:bg-green-50'
            : 'text-gray-600 border-gray-200 hover:bg-gray-50',
        ].join(' ')}
      >
        {loading ? '…' : isInactive ? 'Activate' : 'Deactivate'}
      </button>
    </div>
  );
}
