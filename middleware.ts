import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwt } from './lib/auth'; // Uses the new jose-based function

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // Since we are using an Edge-compatible library, this will no longer crash.
  const payload = token ? await verifyJwt(token) : null;

  if (!payload) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    return response;
  }

  const userRole = payload.role.toUpperCase();

  if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/hr-dashboard') && userRole !== 'HR') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/hr-dashboard/:path*'],
};