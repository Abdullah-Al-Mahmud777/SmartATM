import { NextResponse, type NextRequest } from 'next/server';

const COOKIE_NAME = 'atm_token';

const ROUTE_ROLES: Record<string, string[]> = {
  '/reports': ['admin', 'manager'],
  '/users': ['admin', 'manager'],
  '/settings': ['admin'],
};

interface DecodedToken {
  role?: string;
  exp?: number;
}

function decodeToken(token: string): DecodedToken | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json) as DecodedToken;
  } catch {
    return null;
  }
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isLoginPage = pathname === '/login';

  if (!token) {
    if (isLoginPage) return NextResponse.next();
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  const decoded = decodeToken(token);

  if (isLoginPage) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    url.searchParams.delete('from');
    return NextResponse.redirect(url);
  }

  const requiredRole = Object.entries(ROUTE_ROLES).find(
    ([route]) => pathname === route || pathname.startsWith(`${route}/`)
  );
  if (requiredRole && decoded?.role && !requiredRole[1].includes(decoded.role)) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
};
