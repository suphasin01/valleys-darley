import { NextRequest, NextResponse } from 'next/server';
export function proxy(request: NextRequest) {
  const adminOrigin = process.env.ADMIN_ORIGIN;
  if (adminOrigin && request.nextUrl.host === new URL(adminOrigin).host && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/admin', request.url));
  }
  return NextResponse.next();
}
export const config = { matcher: ['/'] };
