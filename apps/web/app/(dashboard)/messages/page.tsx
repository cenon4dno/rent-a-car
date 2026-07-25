import Link from 'next/link';
import { auth } from '@/auth';
import { listConversations } from '@/lib/api';

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(iso).toLocaleDateString('en-PH', { month: 'short', day: 'numeric' });
}

export default async function MessagesInboxPage() {
  const session = await auth();
  const result = await listConversations(session!.apiToken).catch(() => null);
  const conversations = result?.data ?? [];
  const userId = (session!.user as { id?: string })?.id;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>

        {conversations.length === 0 ? (
          <div className="text-center py-20">
            <svg
              className="w-16 h-16 text-gray-300 mx-auto mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-500 font-medium">No conversations yet.</p>
            <p className="text-gray-400 text-sm mt-1">
              Messages will appear here when you start a conversation.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 divide-y divide-gray-100">
            {conversations.map((conv) => {
              const other = conv.participants.find((p) => p.userId !== userId);
              const name = other?.user.name ?? 'Unknown';
              const role = other?.user.role ?? '';
              const bookingLabel = conv.booking
                ? `Re: ${conv.booking.vehicle.make} ${conv.booking.vehicle.model} ${conv.booking.vehicle.year}`
                : null;
              const last = conv.lastMessage;

              return (
                <Link
                  key={conv.id}
                  href={`/messages/${conv.id}`}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 text-blue-700 font-semibold text-sm">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium text-gray-900 truncate">
                        {name}
                        <span className="ml-1.5 text-xs text-gray-400 font-normal">{role}</span>
                      </span>
                      {last && (
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {timeAgo(last.createdAt)}
                        </span>
                      )}
                    </div>
                    {bookingLabel && (
                      <p className="text-xs text-blue-600 mt-0.5 truncate">{bookingLabel}</p>
                    )}
                    <p className="text-sm text-gray-500 truncate mt-0.5">
                      {last ? last.body : 'No messages yet'}
                    </p>
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-medium">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
