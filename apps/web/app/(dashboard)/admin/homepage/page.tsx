import { auth } from '@/auth';
import { getHomepageConfig } from '@/lib/api';
import { HomepageConfigEditor } from './HomepageConfigEditor';

export default async function AdminHomepagePage() {
  const session = await auth();
  const config = await getHomepageConfig().catch(() => ({
    slides: [],
    featuredMode: 'AUTO' as const,
    featuredIds: [],
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Homepage Editor</h1>
      <p className="text-sm text-gray-500 mb-8">
        Manage carousel slides and featured vehicle settings. Changes go live immediately.
      </p>
      <HomepageConfigEditor initialConfig={config} apiToken={session!.apiToken} />
    </div>
  );
}
