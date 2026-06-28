import { auth } from '@/auth';
import { getAdminRenters } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { CommissionEditor } from './CommissionEditor';

const TRUST_VARIANT: Record<string, 'green' | 'yellow' | 'gray'> = {
  VERIFIED: 'green',
  UNDER_VALIDATION: 'yellow',
  NOT_VERIFIED: 'gray',
};

export default async function AdminConfigPage() {
  const session = await auth();
  const result = await getAdminRenters(session!.apiToken).catch(() => null);
  const renters = result?.data ?? [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Platform Configuration</h1>
      <p className="text-gray-500 text-sm mb-8">
        Default platform commission: <strong>5%</strong>. You can override per renter below.
      </p>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Company', 'Owner', 'Trust Badge', 'Commission Rate', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {renters.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-gray-400 text-sm">
                  No renters yet.
                </td>
              </tr>
            )}
            {renters.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{r.companyName}</p>
                </td>
                <td className="px-4 py-3">
                  <p className="text-gray-700">{r.user.name}</p>
                  <p className="text-xs text-gray-400">{r.user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    label={r.trustBadge.replace('_', ' ')}
                    variant={TRUST_VARIANT[r.trustBadge] ?? 'gray'}
                  />
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">
                  {(r.commissionRate * 100).toFixed(1)}%
                </td>
                <td className="px-4 py-3">
                  <CommissionEditor renterId={r.id} currentRate={r.commissionRate} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
