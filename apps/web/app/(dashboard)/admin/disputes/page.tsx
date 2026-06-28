import { notFound } from 'next/navigation';
import { auth } from '@/auth';
import { getDisputes, Dispute } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

const STATUS_VARIANT: Record<string, 'yellow' | 'green' | 'gray'> = {
  OPEN: 'yellow',
  RESOLVED: 'green',
};

export default async function AdminDisputesPage() {
  const session = await auth();
  if (!session?.apiToken) notFound();

  const result = await getDisputes(session.apiToken).catch(() => null);
  const disputes = result?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-xl font-bold text-gray-900 mb-6">Disputes</h1>

      {disputes.length === 0 ? (
        <p className="text-sm text-gray-400">No disputes reported yet.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Booking
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  Reported
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {disputes.map((d: Dispute) => (
                <tr key={d.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-700">
                    RAC-{d.bookingId.toUpperCase().slice(0, 8)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-md">
                    <p className="line-clamp-2">{d.description}</p>
                    {d.resolution && (
                      <p className="text-xs text-green-600 mt-1">Resolution: {d.resolution}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <Badge label={d.status} variant={STATUS_VARIANT[d.status] ?? 'gray'} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(d.createdAt).toLocaleDateString('en-PH', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
