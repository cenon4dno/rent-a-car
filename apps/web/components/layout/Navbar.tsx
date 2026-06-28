'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';

export function Navbar() {
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

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
            <Link href="/search" className="hover:text-blue-600 transition-colors">
              Browse Cars
            </Link>
            <Link href="/how-it-works" className="hover:text-blue-600 transition-colors">
              How It Works
            </Link>
            <Link href="/partners" className="hover:text-blue-600 transition-colors">
              Partners
            </Link>
          </nav>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3">
            {session ? (
              <div className="flex items-center gap-3">
                {(session.user as { role?: string })?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Admin
                  </Link>
                )}
                {(session.user as { role?: string })?.role === 'RENTER' && (
                  <Link
                    href="/renter"
                    className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
                <Link
                  href="/bookings"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  My Bookings
                </Link>
                <Link
                  href="/profile/kyc"
                  className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
                >
                  KYC
                </Link>
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
            <Link href="/search" className="block text-sm text-gray-700 hover:text-blue-600 py-1">
              Browse Cars
            </Link>
            <Link
              href="/how-it-works"
              className="block text-sm text-gray-700 hover:text-blue-600 py-1"
            >
              How It Works
            </Link>
            <Link href="/partners" className="block text-sm text-gray-700 hover:text-blue-600 py-1">
              Partners
            </Link>
            <div className="pt-2 flex flex-col gap-2">
              {session ? (
                <>
                  {(session.user as { role?: string })?.role === 'ADMIN' && (
                    <Link href="/admin" className="text-sm text-gray-700 hover:text-blue-600 py-1">
                      Admin
                    </Link>
                  )}
                  {(session.user as { role?: string })?.role === 'RENTER' && (
                    <Link href="/renter" className="text-sm text-gray-700 hover:text-blue-600 py-1">
                      Dashboard
                    </Link>
                  )}
                  <Link href="/bookings" className="text-sm text-gray-700 hover:text-blue-600 py-1">
                    My Bookings
                  </Link>
                  <Link
                    href="/profile/kyc"
                    className="text-sm text-gray-700 hover:text-blue-600 py-1"
                  >
                    KYC Documents
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
