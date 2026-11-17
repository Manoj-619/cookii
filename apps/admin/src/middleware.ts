import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token =
    request.cookies.get('ZapEat_admin_token')?.value ||
    request.cookies.get('cookii_admin_token')?.value;

  // Protected route prefixes
  const protectedPaths = [
    '/dashboard',
    '/bookings',
    '/cooks',
    '/customers',
    '/payments',
    '/coupons',
    '/settings',
  ];

  const isProtected =
    protectedPaths.some((p) => pathname.startsWith(p)) || pathname === '/';

  // If trying to access protected route without token, redirect to /login
  if (isProtected && !token) {
    const loginUrl = new URL('/login', request.url);
    if (pathname !== '/') {
      loginUrl.searchParams.set('redirect', pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in and visiting /login, redirect to /dashboard
  if (pathname === '/login' && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
