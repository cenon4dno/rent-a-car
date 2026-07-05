'use client';

import { useState } from 'react';

interface SosButtonProps {
  bookingId: string;
  token: string;
  type: 'sos' | 'driver-no-show';
}

export function SosButton({ bookingId, token, type }: SosButtonProps) {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

  const label = type === 'sos' ? 'SOS — Report Breakdown' : 'Report Driver No-Show';
  const confirmMsg =
    type === 'sos'
      ? 'This will alert the renter and admin immediately and pause your rental timer. Proceed?'
      : 'This will cancel your booking and issue a full refund. The rental company will be penalized. Proceed?';
  const doneMsg =
    type === 'sos'
      ? 'SOS reported. Help is on the way.'
      : 'No-show reported. A full refund will be processed.';

  async function handleClick() {
    if (!confirm(confirmMsg)) return;
    setLoading(true);
    try {
      await fetch(`${API}/api/v1/bookings/${bookingId}/${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setDone(true);
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 font-medium text-center">
        {doneMsg}
      </div>
    );
  }

  const isRed = type === 'sos' || type === 'driver-no-show';

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full py-3 rounded-xl text-sm font-semibold border transition-colors disabled:opacity-50 ${
        isRed
          ? 'bg-red-600 hover:bg-red-700 text-white border-red-600'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {loading ? 'Sending…' : label}
    </button>
  );
}
