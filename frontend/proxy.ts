import { NextRequest, NextResponse } from 'next/server';

const ADMIN_COOKIE_NAME = 'bank_access';
const ADMIN_LOGIN_PATH = '/admin/login';
const ADMIN_DASHBOARD_PATH = '/admin/dashboard';

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isLogin = pathname === ADMIN_LOGIN_PATH;

  if (isLogin) {
    if (request.cookies.has(ADMIN_COOKIE_NAME)) {
      return NextResponse.redirect(new URL(ADMIN_DASHBOARD_PATH, request.url));
    }
    return NextResponse.next();
  }

  const isAdminPath = pathname === '/admin' || pathname.startsWith('/admin/');
  if (isAdminPath) {
    if (!request.cookies.has(ADMIN_COOKIE_NAME)) {
      const loginUrl = new URL(ADMIN_LOGIN_PATH, request.url);
      loginUrl.searchParams.set('next', `${pathname}${search}`);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
