'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateFeedbackStatus, FeedbackItem } from '@/lib/api';

const STATUSES = ['NEW', 'IN_REVIEW', 'RESOLVED'] as const;

export function FeedbackActions({ item, apiToken }: { item: FeedbackItem; apiToken: string }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [reply, setReply] = useState(item.adminReply ?? '');
  const [status, setStatus] = useState(item.status);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateFeedbackStatus(item.id, status, reply || null, apiToken);
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-100">
      {editing ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Reply to submitter
            </label>
            <textarea
              rows={3}
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional reply..."
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditing(true)}
          className="text-sm text-blue-600 font-medium hover:underline"
        >
          {item.status === 'RESOLVED' ? 'Edit Reply' : 'Reply / Update Status'}
        </button>
      )}
    </div>
  );
}
