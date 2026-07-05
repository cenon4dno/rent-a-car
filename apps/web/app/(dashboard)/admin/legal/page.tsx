import { auth } from '@/auth';
import { getLegalPages, LegalPage } from '@/lib/api';
import { LegalCmsClient } from './LegalCmsClient';

export const dynamic = 'force-dynamic';

export default async function AdminLegalPage() {
  const session = await auth();
  let pages: LegalPage[] = [];
  try {
    pages = await getLegalPages();
  } catch {
    // API may not be running yet or table is empty
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Legal Pages CMS</h1>
        <p className="text-sm text-gray-400">Manage Terms, Privacy Policy, Contact, etc.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 min-h-96">
        <LegalCmsClient pages={pages} token={session?.apiToken as string} />
      </div>
    </div>
  );
}
