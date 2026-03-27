import type { NextResponse } from 'next/server';
import type { cookies as cookiesFn } from 'next/headers';
import { SESSION_COOKIE_NAME } from '@/lib/session/constants';

const ONE_DAY = 60 * 60 * 24;

export function setSessionCookie(response: NextResponse, accessToken: string) {
    response.cookies.set(SESSION_COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ONE_DAY,
    });
}

export function setSessionCookieOnStore(store: Awaited<ReturnType<typeof cookiesFn>>, accessToken: string) {
    store.set(SESSION_COOKIE_NAME, accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: ONE_DAY,
    });
}

export function clearSessionCookie(response: NextResponse) {
    response.cookies.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });
}
