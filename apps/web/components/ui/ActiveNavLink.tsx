'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface ActiveNavLinkProps {
  href: string;
  label: string;
  exact?: boolean;
}

export function ActiveNavLink({ href, label, exact = false }: ActiveNavLinkProps) {
  const pathname = usePathname();
  const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
        active
          ? 'bg-blue-50 text-blue-600 font-semibold'
          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
      }`}
    >
      {label}
    </Link>
  );
}
