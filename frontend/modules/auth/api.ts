'use server';

import { cookies } from 'next/headers';
import { authServiceSessionPaths, postAuthServiceForSession, throwIfAuthSessionFailed } from '@/lib/auth/auth-service-session';
import { bffJson } from '@/lib/http/bff-client';
import { SESSION_COOKIE_NAME } from '@/lib/session/constants';
import { setSessionCookieOnStore } from '@/lib/session/auth-cookie';
import type { MessageResponse, SignupResponse } from '@/types/auth';

export async function signUp(body: { email: string; password: string; name?: string }) {
    return bffJson<SignupResponse>('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) });
}

export async function verifyOtp(body: { email: string; code: string }) {
    const result = await postAuthServiceForSession(authServiceSessionPaths.verifyOtp, body);
    throwIfAuthSessionFailed(result);
    const store = await cookies();
    setSessionCookieOnStore(store, result.accessToken);
    return { success: true as const };
}

export async function signIn(body: { email: string; password: string }) {
    const result = await postAuthServiceForSession(authServiceSessionPaths.signin, body);
    throwIfAuthSessionFailed(result);
    const store = await cookies();
    setSessionCookieOnStore(store, result.accessToken);
    return { success: true as const };
}

export async function signOut() {
    const store = await cookies();
    store.set(SESSION_COOKIE_NAME, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 0,
    });
}

export async function requestResetPasswordLink(body: { email: string }) {
    return bffJson<MessageResponse>('/api/auth/reset-password-link', { method: 'POST', body: JSON.stringify(body) });
}

export async function changePassword(body: { email: string; token: string; newPassword: string }) {
    return bffJson<MessageResponse>('/api/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ email: body.email, token: body.token, new_password: body.newPassword }),
    });
}
