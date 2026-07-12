import { auth } from '@/auth';
import { NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/search', '/vehicle'];
const BOOKING_PATHS = ['/booking', '/bookings'];

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));

  if (!req.auth && !isPublic) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Customers must complete onboarding (driver's license upload) before any
  // booking feature; session.profileComplete is refreshed via update() after
  // onboarding finishes
  const isBookingPath = BOOKING_PATHS.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  if (
    req.auth &&
    isBookingPath &&
    req.auth.user?.role === 'CUSTOMER' &&
    req.auth.profileComplete === false
  ) {
    const onboardingUrl = new URL('/onboarding', req.url);
    onboardingUrl.searchParams.set('callbackUrl', req.url);
    return NextResponse.redirect(onboardingUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
