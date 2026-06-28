'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createDispute } from '@/lib/api';

export function DisputeForm({ bookingId }: { bookingId: string }) {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    const token = (session as { apiToken?: string })?.apiToken;
    if (!token) return;

    setSubmitting(true);
    setError('');
    try {
      await createDispute(bookingId, description.trim(), token);
      setSubmitted(true);
      setOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
        Your report has been submitted. Our team will review it shortly.
      </div>
    );
  }

  return (
    <div className="mt-4">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-sm text-red-600 hover:underline font-medium"
        >
          Report an Issue
        </button>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Report an Issue</h3>
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe the issue you experienced..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={2000}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || !description.trim()}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Submitting…' : 'Submit Report'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
