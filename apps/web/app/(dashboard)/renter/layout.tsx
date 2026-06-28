import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/auth';

const NAV = [
  { href: '/renter', label: 'Overview' },
  { href: '/renter/fleet', label: 'Fleet' },
  { href: '/renter/bookings', label: 'Bookings' },
];

export default async function RenterLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  if (session.user?.role !== 'RENTER') redirect('/');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Renter sub-nav */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-12">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide mr-3">
              Renter Portal
            </span>
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
