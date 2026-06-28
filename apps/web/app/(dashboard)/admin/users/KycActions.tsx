'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { updateUserKyc } from '@/lib/api';

const KYC_OPTIONS = ['PENDING', 'UNDER_REVIEW', 'VERIFIED', 'REJECTED'] as const;

interface KycActionsProps {
  userId: string;
  currentKyc: string;
}

export function KycActions({ userId, currentKyc }: KycActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const update = async (kycStatus: string) => {
    if (!session?.apiToken) return;
    setLoading(true);
    setOpen(false);
    try {
      await updateUserKyc(userId, kycStatus, session.apiToken);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        disabled={loading}
        className="px-3 py-1 text-xs font-medium text-gray-600 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
      >
        {loading ? '…' : 'Set KYC ▾'}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-10 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden min-w-[140px]">
          {KYC_OPTIONS.map((status) => (
            <button
              key={status}
              onClick={() => update(status)}
              className={[
                'w-full text-left px-4 py-2 text-xs font-medium transition-colors',
                status === currentKyc
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-50',
              ].join(' ')}
            >
              {status}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
