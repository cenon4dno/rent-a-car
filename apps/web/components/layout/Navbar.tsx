'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';

function useUnreadCount(apiToken: string | undefined) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!apiToken) return;
    fetch(`${API_URL}/api/v1/messages/unread-count`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    })
      .then((r) => r.json())
      .then((j) => setCount((j as { data?: { count?: number } })?.data?.count ?? 0))
      .catch(() => {});
    const interval = setInterval(() => {
      fetch(`${API_URL}/api/v1/messages/unread-count`, {
        headers: { Authorization: `Bearer ${apiToken}` },
      })
        .then((r) => r.json())
        .then((j) => setCount((j as { data?: { count?: number } })?.data?.count ?? 0))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(interval);
  }, [apiToken]);
  return count;
}

// Public marketing links are onboarding-only: hidden once signed in, except
// Browse Cars which stays for customers. Staff roles see their own dashboards.
function navLinksForRole(role: string | undefined, authenticated: boolean) {
  if (!authenticated) {
    return [
      { href: '/search', label: 'Browse Cars' },
      { href: '/how-it-works', label: 'How It Works' },
      { href: '/partners', label: 'Partners' },
    ];
  }
  switch (role) {
    case 'ADMIN':
      return [
        { href: '/admin', label: 'Dashboard' },
        { href: '/admin/users', label: 'Users' },
        { href: '/admin/disputes', label: 'Disputes' },
      ];
    case 'RENTER':
      return [
        { href: '/renter', label: 'Dashboard' },
        { href: '/renter/fleet', label: 'Fleet' },
        { href: '/renter/bookings', label: 'Bookings' },
      ];
    case 'DRIVER':
      return [
        { href: '/driver/dashboard', label: 'My Schedule' },
        { href: '/profile', label: 'My Profile' },
      ];
    default:
      // authenticated customer
      return [{ href: '/search', label: 'Browse Cars' }];
  }
}

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const role = (session?.user as { role?: string })?.role;
  const apiToken = (session as { apiToken?: string } | null)?.apiToken;
  const navLinks = navLinksForRole(role, !!session);
  const isCustomer = !!session && (!role || role === 'CUSTOMER');
  const unreadMessages = useUnreadCount(apiToken);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l2 2h8l2-2z"
                />
              </svg>
            </div>
            <span className="text-lg font-bold text-gray-900">
              Rent<span className="text-blue-600">A</span>Car
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-blue-600 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                {isCustomer && (
                  <Link
                    href="/bookings"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    My Bookings
                  </Link>
                )}
                <Link
                  href="/messages"
                  className="relative text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  Messages
                  {unreadMessages > 0 && (
                    <span className="absolute -top-2 -right-3 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                      {unreadMessages > 9 ? '9+' : unreadMessages}
                    </span>
                  )}
                </Link>
                {role !== 'ADMIN' && (
                  <Link
                    href="/profile#kyc"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    KYC
                  </Link>
                )}
                <Link href="/profile" className="text-sm text-gray-700 hover:text-blue-600">
                  {session.user?.name?.split(' ')[0]}
                </Link>
                <Button variant="secondary" size="sm" onClick={() => signOut({ callbackUrl: '/' })}>
                  Sign out
                </Button>
              </div>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="sm">Get started</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {menuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 space-y-3">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block text-sm text-gray-700 hover:text-blue-600 py-1"
              >
                {link.label}
              </Link>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              {session ? (
                <>
                  {isCustomer && (
                    <Link
                      href="/bookings"
                      className="text-sm text-gray-700 hover:text-blue-600 py-1"
                    >
                      My Bookings
                    </Link>
                  )}
                  <Link
                    href="/messages"
                    className="relative text-sm text-gray-700 hover:text-blue-600 py-1 inline-flex items-center gap-1"
                  >
                    Messages
                    {unreadMessages > 0 && (
                      <span className="w-4 h-4 rounded-full bg-red-500 text-white text-[10px] flex items-center justify-center font-bold">
                        {unreadMessages > 9 ? '9+' : unreadMessages}
                      </span>
                    )}
                  </Link>
                  {role !== 'ADMIN' && (
                    <Link
                      href="/profile#kyc"
                      className="text-sm text-gray-700 hover:text-blue-600 py-1"
                    >
                      KYC Documents
                    </Link>
                  )}
                  <Link href="/profile" className="text-sm text-gray-700 hover:text-blue-600 py-1">
                    Profile Settings
                  </Link>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => signOut({ callbackUrl: '/' })}
                  >
                    Sign out
                  </Button>
                </>
              ) : (
                <Link href="/login">
                  <Button size="sm" className="w-full">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
