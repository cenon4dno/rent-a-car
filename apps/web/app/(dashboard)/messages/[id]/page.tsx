import { auth } from '@/auth';
import { getConversation } from '@/lib/api';
import { ConversationThread } from './ConversationThread';

export default async function ConversationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const result = await getConversation(id, session!.apiToken).catch(() => null);
  const conversation = result?.data ?? null;
  const userId = (session!.user as { id?: string })?.id ?? '';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        <ConversationThread
          conversation={conversation}
          currentUserId={userId}
          apiToken={session!.apiToken}
        />
      </div>
    </div>
  );
}
