import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const url = new URL("https://twitter.com/unixzii");
  if (pathname) {
    url.pathname += pathname;
  }
  if (search) {
    url.search = search;
  }
  return NextResponse.redirect(url);
}

export const dynamic = 'force-static';
export const runtime = 'experimental-edge';
export const config = {
  matcher: '/:path*',
};