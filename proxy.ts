import { NextRequest, NextResponse } from 'next/server';
export function proxy(request: NextRequest) {
  const adminOrigin = process.env.ADMIN_ORIGIN || 'https://admin-valleys-darley.vercel.app';
  const adminHosts = new Set([new URL(adminOrigin).host, 'admin.valleys-darley.vercel.app']);
  const requestHost = request.headers.get('host') || request.nextUrl.host;
  if (adminHosts.has(requestHost) && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ['/'] };
