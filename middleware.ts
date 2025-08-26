// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt, UserJwtPayload } from './lib/auth'; // Import the type

// We will now use this object
const PROTECTED_ROUTES = {
  ADMIN: '/admin',
  OFFICER: '/officer',
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // No token, redirect to login for all protected routes
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the token
  const payload = verifyJwt(token);

  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  const userRole = payload.role.toUpperCase();

  // Check access using our PROTECTED_ROUTES object
  if (pathname.startsWith(PROTECTED_ROUTES.ADMIN) && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith(PROTECTED_ROUTES.OFFICER) && userRole !== 'OFFICER') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/officer/:path*'],
};
