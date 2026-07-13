import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // Mock logged-in user to bypass auth routing gates
  const user = { id: '00000000-0000-0000-0000-000000000000' };

  const path = request.nextUrl.pathname;
  const isAuthRoute = path === '/login' || path === '/register';

  if (user && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  if (path === '/') {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/logos (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
