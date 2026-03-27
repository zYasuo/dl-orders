import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { parseSafeReturnUrl, signInReasonForProtectedPath } from '@/lib/routing/return-url';
import { SESSION_COOKIE_NAME } from '@/lib/session/constants';

export function proxy(request: NextRequest) {
    const { pathname, search } = request.nextUrl;
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
        return NextResponse.next();
    }
    const candidate = `${pathname}${search}`;
    const safeReturn = parseSafeReturnUrl(candidate);
    const reason = signInReasonForProtectedPath(pathname);
    const url = request.nextUrl.clone();
    url.pathname = '/auth/signin';
    url.search = '';
    url.searchParams.set('returnUrl', safeReturn);
    if (reason) {
        url.searchParams.set('reason', reason);
    }
    return NextResponse.redirect(url);
}

export const config = {
    matcher: ['/checkout/:path*', '/orders/:path*', '/account/:path*'],
};
