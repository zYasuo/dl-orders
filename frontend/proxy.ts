import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session-constants';

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
        return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = '/auth/signin';
    url.searchParams.set('returnUrl', pathname);
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ['/checkout/:path*', '/orders/:path*', '/account/:path*'],
};
