import { notFound } from 'next/navigation';
import { getLegalPage } from '@/lib/api';

export const dynamic = 'force-dynamic';

export default async function LegalPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let page = null;
  try {
    page = await getLegalPage(slug);
  } catch {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{page.title}</h1>
        <p className="text-sm text-gray-400 mb-10">
          Last updated:{' '}
          {new Date(page.updatedAt).toLocaleDateString('en-PH', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
          })}
        </p>
        <div
          className="prose prose-gray max-w-none"
          dangerouslySetInnerHTML={{ __html: page.content.replace(/\n/g, '<br/>') }}
        />
      </div>
    </div>
  );
}
