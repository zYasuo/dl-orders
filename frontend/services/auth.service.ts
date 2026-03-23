import { bffJson } from '@/lib/api-client';
import type { MessageResponse, SignupResponse } from '@/types/auth';

export async function signupService(body: { email: string; password: string; name?: string }) {
    return bffJson<SignupResponse>('/api/auth/signup', { method: 'POST', body: JSON.stringify(body) });
}

export async function verifyOtpService(body: { email: string; code: string }) {
    return bffJson<{ success: boolean }>('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) });
}

export async function signinService(body: { email: string; password: string }) {
    return bffJson<{ success: boolean }>('/api/auth/signin', { method: 'POST', body: JSON.stringify(body) });
}

export async function signoutService() {
    await bffJson<unknown>('/api/auth/signout', { method: 'POST' });
}

export async function resetPasswordLinkService(body: { email: string }) {
    return bffJson<MessageResponse>('/api/auth/reset-password-link', { method: 'POST', body: JSON.stringify(body) });
}

export async function changePasswordService(body: { email: string; token: string; newPassword: string }) {
    return bffJson<MessageResponse>('/api/auth/change-password', {
        method: 'PATCH',
        body: JSON.stringify({ email: body.email, token: body.token, new_password: body.newPassword }),
    });
}
