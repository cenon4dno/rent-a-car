import { notFound } from 'next/navigation';
import { getDriverPublicProfile } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';

export default async function DriverPublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const result = await getDriverPublicProfile(id).catch(() => null);
  if (!result?.data) notFound();

  const driver = result.data;

  const kycColor: Record<string, 'green' | 'yellow' | 'red' | 'gray'> = {
    VERIFIED: 'green',
    UNDER_REVIEW: 'yellow',
    REJECTED: 'red',
    PENDING: 'gray',
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-10 text-center text-white">
            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white/50 flex items-center justify-center text-4xl font-bold mx-auto mb-4">
              {driver.avatarUrl ? (
                <img
                  src={driver.avatarUrl}
                  alt={driver.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                driver.name.charAt(0).toUpperCase()
              )}
            </div>
            <h1 className="text-2xl font-bold">{driver.name}</h1>
            <p className="text-blue-200 mt-1">Professional Driver</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 divide-x divide-gray-100 border-b border-gray-100">
            <div className="px-8 py-6 text-center">
              <p className="text-3xl font-bold text-gray-900">{driver.completedTrips}</p>
              <p className="text-sm text-gray-500 mt-1">Completed trips</p>
            </div>
            <div className="px-8 py-6 text-center flex flex-col items-center justify-center">
              <Badge
                label={driver.kycStatus.replace('_', ' ')}
                variant={kycColor[driver.kycStatus] ?? 'gray'}
              />
              <p className="text-sm text-gray-500 mt-2">Verification status</p>
            </div>
          </div>

          {/* Info */}
          <div className="px-8 py-6 space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <svg
                className="w-5 h-5 text-blue-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Professional driver's license on file
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <svg
                className="w-5 h-5 text-blue-500 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              Background check clearance on file
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
