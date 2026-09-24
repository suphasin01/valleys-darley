import { NextResponse } from 'next/server';
import { adminCookie, adminCookieOptions, adminReady, createAdminToken, verifyAdmin } from '../../../lib/admin-auth';

export async function POST(request: Request) {
  const origin = new URL(request.url).origin;
  if (request.headers.get('origin') !== origin) return new Response('Invalid origin', { status: 403 });
  if (!adminReady()) return NextResponse.redirect(new URL('/admin/login', origin), 303);
  const form = await request.formData();
  const username = form.get('username');
  const password = form.get('password');
  if (typeof username !== 'string' || typeof password !== 'string' || !verifyAdmin(username, password)) {
    return NextResponse.redirect(new URL('/admin/login?error=credentials', origin), 303);
  }
  const response = NextResponse.redirect(new URL('/admin', origin), 303);
  response.cookies.set(adminCookie, createAdminToken(), adminCookieOptions);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
