import { NextResponse } from 'next/server';
import { adminCookie, adminCookieOptions } from '../../../lib/admin-auth';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return new Response('Invalid origin', { status: 403 });
  const response = NextResponse.redirect(new URL('/admin/login', origin), 303);
  response.cookies.set(adminCookie, '', { ...adminCookieOptions, maxAge: 0 });
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
