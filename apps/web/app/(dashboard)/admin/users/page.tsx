import { auth } from '@/auth';
import { getAdminUsers } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { KycActions } from './KycActions';

const KYC_VARIANT: Record<string, 'green' | 'yellow' | 'gray' | 'red'> = {
  VERIFIED: 'green',
  UNDER_REVIEW: 'yellow',
  PENDING: 'gray',
  REJECTED: 'red',
};

const ROLE_VARIANT: Record<string, 'blue' | 'green' | 'gray' | 'yellow'> = {
  ADMIN: 'blue',
  RENTER: 'green',
  CUSTOMER: 'gray',
  DRIVER: 'yellow',
};

export default async function AdminUsersPage() {
  const session = await auth();
  const result = await getAdminUsers(session!.apiToken).catch(() => null);
  const users = result?.data ?? [];

  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <span className="text-sm text-gray-400">{users.length} total</span>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Name / Email', 'Role', 'KYC Status', 'Joined', 'Actions'].map((h) => (
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
            {users.map((u) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                  {u.renterProfile && (
                    <p className="text-xs text-blue-500 mt-0.5">{u.renterProfile.companyName}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Badge label={u.role} variant={ROLE_VARIANT[u.role] ?? 'gray'} />
                </td>
                <td className="px-4 py-3">
                  <Badge label={u.kycStatus} variant={KYC_VARIANT[u.kycStatus] ?? 'gray'} />
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {fmt(u.createdAt)}
                </td>
                <td className="px-4 py-3">
                  <KycActions userId={u.id} currentKyc={u.kycStatus} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
