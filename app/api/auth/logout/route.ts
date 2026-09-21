import { NextResponse } from 'next/server';
import { allowedOrigin, cookieOptions, sessionCookie } from '../../../lib/auth';
export async function POST(request: Request) {
  let origin: string;
  try { origin = allowedOrigin(request); } catch { return new Response('Invalid host', { status: 400 }); }
  if (request.headers.get('origin') !== origin) return new Response('Forbidden', { status: 403 });
  const response = NextResponse.redirect(new URL('/login', origin), 303);
  response.cookies.set(sessionCookie, '', { ...cookieOptions, maxAge: 0 });
  return response;
}
