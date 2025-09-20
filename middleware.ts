// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET!;
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  // If the request is for an API route
  if (pathname.startsWith('/api/')) {
    // Exclude auth routes from token verification
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next();
    }

    if (!token) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    try {
      await jwtVerify(token, secretKey);
      return NextResponse.next();
    } catch (error) {
      return new NextResponse(
        JSON.stringify({ success: false, message: 'Authentication failed' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }
  }

  // For page routes, handle redirects
  if (!token) {
    // Allow access to public pages without a token
    const publicPages = ['/login', '/signup', '/'];
    if (publicPages.includes(pathname)) {
        return NextResponse.next();
    }
    // Redirect all other pages to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    await jwtVerify(token, secretKey);
     // If user is authenticated and tries to access login/signup, redirect to dashboard
     if (pathname === '/login' || pathname === '/signup') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  } catch (error) {
    // If token is invalid, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  // This matcher will run the middleware on all routes except for static files
  // and Next.js internal routes.
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)',
  ],
};