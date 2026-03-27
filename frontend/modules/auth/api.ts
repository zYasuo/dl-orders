'use server';

import { bffJson } from '@/lib/http/bff-client';
import type { MessageResponse, SignupResponse } from '@/types/auth';

export async function signUp(body: { email: string; password: string; name?: string }) {
    return bffJson<SignupResponse>('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) });
}

export async function verifyOtp(body: { email: string; code: string }) {
    return bffJson<{ success: boolean }>('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) });
}

export async function signIn(body: { email: string; password: string }) {
    return bffJson<{ success: boolean }>('/api/auth/signin', { method: 'POST', body: JSON.stringify(body) });
}

export async function signOut() {
    await bffJson<unknown>('/api/auth/signout', { method: 'POST' });
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
