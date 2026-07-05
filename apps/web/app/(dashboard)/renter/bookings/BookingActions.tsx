'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useState } from 'react';
import { confirmBooking, cancelBooking, completeBooking } from '@/lib/api';

function RenterReviewInline({ bookingId, token }: { bookingId: string; token: string }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

  async function submit() {
    setSubmitting(true);
    try {
      await fetch(`${API}/api/v1/reviews/renter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ bookingId, rating, comment: comment || undefined }),
      });
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  if (done) return <span className="text-xs text-green-600 font-medium">Review submitted ✓</span>;
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="px-3 py-1 text-xs font-medium rounded-md border border-purple-200 text-purple-700 hover:bg-purple-50 transition-colors"
      >
        Review Customer
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-2 min-w-[180px]">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((s) => (
          <button
            key={s}
            onMouseEnter={() => setHover(s)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(s)}
          >
            <svg
              className={`w-5 h-5 ${s <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
      </div>
      <input
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comment (optional)"
        className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      <div className="flex gap-2">
        <button
          disabled={!rating || submitting}
          onClick={submit}
          className="text-xs bg-blue-600 text-white px-3 py-1 rounded disabled:opacity-50"
        >
          {submitting ? '…' : 'Submit'}
        </button>
        <button onClick={() => setOpen(false)} className="text-xs text-gray-500">
          Cancel
        </button>
      </div>
    </div>
  );
}

interface BookingActionsProps {
  bookingId: string;
  status: string;
}

export function BookingActions({ bookingId, status }: BookingActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState<string | null>(null);
  const token = session?.apiToken as string | undefined;

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

  if (status === 'COMPLETED' && token) {
    return <RenterReviewInline bookingId={bookingId} token={token} />;
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
