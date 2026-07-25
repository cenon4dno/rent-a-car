import { auth } from '@/auth';
import { listFeedback } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { FeedbackActions } from './FeedbackActions';

const STATUS_VARIANT: Record<string, 'blue' | 'yellow' | 'green'> = {
  NEW: 'blue',
  IN_REVIEW: 'yellow',
  RESOLVED: 'green',
};
const CAT_VARIANT: Record<string, 'red' | 'blue' | 'gray' | 'yellow'> = {
  Complaint: 'red',
  Inquiry: 'blue',
  Feedback: 'gray',
  Suggestion: 'yellow',
};

export default async function AdminFeedbackPage() {
  const session = await auth();
  const result = await listFeedback(session!.apiToken).catch(() => null);
  const items = result?.data ?? [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Feedback Inbox</h1>
        <span className="text-sm text-gray-500">{items.length} submissions</span>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">No feedback submissions yet.</div>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-6">
              <div className="flex flex-wrap items-start gap-3 mb-3">
                <Badge variant={CAT_VARIANT[item.category] ?? 'gray'} label={item.category} />
                <Badge variant={STATUS_VARIANT[item.status] ?? 'gray'} label={item.status} />
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(item.createdAt).toLocaleDateString('en-PH', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
              </div>

              <h3 className="font-semibold text-gray-900">{item.subject}</h3>
              <p className="text-sm text-gray-500 mt-0.5">
                From: {item.name} &lt;{item.email}&gt;
              </p>
              <p className="text-sm text-gray-700 mt-3 whitespace-pre-wrap">{item.message}</p>

              {item.adminReply && (
                <div className="mt-4 bg-blue-50 rounded-lg p-4 border-l-4 border-blue-400">
                  <p className="text-xs text-blue-500 font-medium mb-1">Admin Reply</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{item.adminReply}</p>
                </div>
              )}

              <FeedbackActions item={item} apiToken={session!.apiToken} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
