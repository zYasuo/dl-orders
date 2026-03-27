import { ApiError, type StandardApiErrorBody } from '@/types/api';

const SIGNIN_PATH = '/api/v1/auth/signin';
const VERIFY_OTP_PATH = '/api/v1/auth/verify-otp';

export type AuthServiceSessionPath = typeof SIGNIN_PATH | typeof VERIFY_OTP_PATH;

export type AuthSessionPostResult =
    | { ok: true; accessToken: string }
    | { ok: false; status: number; bodyText: string };

function parseAccessToken(text: string): string | null {
    try {
        const parsed = JSON.parse(text) as { accessToken?: string; data?: { accessToken?: string } };
        return parsed.data?.accessToken ?? parsed.accessToken ?? null;
    } catch {
        return null;
    }
}

export async function postAuthServiceForSession(
    path: AuthServiceSessionPath,
    body: unknown,
): Promise<AuthSessionPostResult> {
    const base = process.env.AUTH_SERVICE_URL;
    if (!base) {
        return {
            ok: false,
            status: 500,
            bodyText: JSON.stringify({
                statusCode: 500,
                error: 'Config',
                message: 'AUTH_SERVICE_URL is not configured.',
            }),
        };
    }
    const res = await fetch(`${base.replace(/\/$/, '')}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
        return { ok: false, status: res.status, bodyText: text };
    }
    const accessToken = parseAccessToken(text);
    if (!accessToken) {
        return {
            ok: false,
            status: 502,
            bodyText: JSON.stringify({
                statusCode: 502,
                error: 'BadGateway',
                message: 'Invalid authentication response.',
            }),
        };
    }
    return { ok: true, accessToken };
}

export function throwIfAuthSessionFailed(result: AuthSessionPostResult): asserts result is {
    ok: true;
    accessToken: string;
} {
    if (result.ok) {
        return;
    }
    let body: Partial<StandardApiErrorBody>;
    try {
        body = JSON.parse(result.bodyText) as Partial<StandardApiErrorBody>;
    } catch {
        throw new ApiError({
            statusCode: result.status,
            error: 'Error',
            message: 'Could not process the response.',
        });
    }
    const isFailure = body.success === false || body.success === undefined;
    if (!isFailure) {
        throw new ApiError({
            statusCode: result.status,
            error: 'Error',
            message: 'Could not process the response.',
        });
    }
    throw new ApiError({
        statusCode: body.statusCode ?? result.status,
        error: body.error ?? 'Error',
        message: body.message ?? 'Something went wrong.',
        details: body.details,
        timestamp: body.timestamp,
    });
}

export const authServiceSessionPaths = { signin: SIGNIN_PATH, verifyOtp: VERIFY_OTP_PATH } as const;
