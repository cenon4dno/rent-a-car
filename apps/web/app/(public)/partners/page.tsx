import Link from 'next/link';
import { getTopRenters } from '@/lib/api';

const BADGE_LABEL: Record<string, string> = {
  VERIFIED: 'Verified',
  PENDING: 'Undergoing Validation',
  UNVERIFIED: 'Not Verified',
};
const BADGE_COLOR: Record<string, string> = {
  VERIFIED: 'bg-green-100 text-green-700',
  PENDING: 'bg-yellow-100 text-yellow-700',
  UNVERIFIED: 'bg-gray-100 text-gray-500',
};

export const dynamic = 'force-dynamic';

export default async function PartnersPage() {
  const result = await getTopRenters(50).catch(() => null);
  const renters = result?.data ?? [];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Our Rental Partners</h1>
          <p className="text-xl text-blue-100">
            Every partner is KYC-verified and carries a trust badge. Browse their fleets and book
            directly.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-50 py-10 px-4 border-b border-blue-100">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-10 text-center">
          <div>
            <p className="text-3xl font-black text-blue-600">{renters.length}</p>
            <p className="text-sm text-gray-500 mt-1">Rental Companies</p>
          </div>
          <div>
            <p className="text-3xl font-black text-blue-600">
              {renters.reduce((s, r) => s + r.fleetCount, 0)}
            </p>
            <p className="text-sm text-gray-500 mt-1">Vehicles Available</p>
          </div>
          <div>
            <p className="text-3xl font-black text-blue-600">
              {renters.filter((r) => r.trustBadge === 'VERIFIED').length}
            </p>
            <p className="text-sm text-gray-500 mt-1">Verified Partners</p>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {renters.length === 0 ? (
            <p className="text-center text-gray-400 py-20">No partners registered yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {renters.map((renter) => (
                <Link
                  key={renter.id}
                  href={`/renter/${renter.id}`}
                  className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-md transition-shadow group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
                      {renter.companyName.charAt(0).toUpperCase()}
                    </div>
                    <span
                      className={`text-xs font-medium px-2.5 py-1 rounded-full ${BADGE_COLOR[renter.trustBadge] ?? 'bg-gray-100 text-gray-500'}`}
                    >
                      {BADGE_LABEL[renter.trustBadge] ?? renter.trustBadge}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {renter.companyName}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {renter.fleetCount} vehicle{renter.fleetCount !== 1 ? 's' : ''} available
                  </p>
                  <p className="text-xs text-blue-600 mt-3 font-medium">View Fleet →</p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-16 px-4 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Are you a rental company?</h2>
        <p className="text-gray-500 mb-6">
          Join our platform, list your fleet, and reach thousands of customers.
        </p>
        <Link
          href="/login"
          className="inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Get Started as a Partner
        </Link>
      </section>
    </div>
  );
}
