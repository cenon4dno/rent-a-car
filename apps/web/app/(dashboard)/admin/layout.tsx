import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ActiveNavLink } from '@/components/ui/ActiveNavLink';

const NAV = [
  { href: '/admin', label: 'Overview', exact: true },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/disputes', label: 'Disputes' },
  { href: '/admin/config', label: 'Config' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session) redirect('/login');
  if ((session.user as { role?: string })?.role !== 'ADMIN') redirect('/');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 h-12">
            <span className="text-xs font-semibold text-red-500 uppercase tracking-wide mr-3">
              Admin
            </span>
            {NAV.map((item) => (
              <ActiveNavLink
                key={item.href}
                href={item.href}
                label={item.label}
                exact={item.exact}
              />
            ))}
          </div>
        </div>
      </div>
      {children}
    </div>
  );
}
