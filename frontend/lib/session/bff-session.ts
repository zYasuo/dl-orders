import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session/constants';

function unauthorizedResponse(): NextResponse {
    return NextResponse.json(
        { statusCode: 401, error: 'Unauthorized', message: 'Session required.' },
        { status: 401 },
    );
}

export function normalizeEmailForBff(email: string): string {
    return email.trim().toLowerCase();
}

export async function requireSessionToken(): Promise<string | NextResponse> {
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value?.trim();
    if (!token) {
        return unauthorizedResponse();
    }
    return token;
}


export async function requireSessionUserEmail(): Promise<
    { token: string; email: string } | NextResponse
> {
    const tokenOrRes = await requireSessionToken();
    if (tokenOrRes instanceof NextResponse) {
        return tokenOrRes;
    }

    const base = process.env.USERS_SERVICE_URL?.replace(/\/$/, '');
    if (!base) {
        return NextResponse.json(
            {
                statusCode: 500,
                error: 'Config',
                message: 'USERS_SERVICE_URL is not configured.',
            },
            { status: 500 },
        );
    }

    const res = await fetch(`${base}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${tokenOrRes}` },
    });

    if (!res.ok) {
        return NextResponse.json(
            {
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Session invalid or expired.',
            },
            { status: 401 },
        );
    }

    let body: unknown;
    try {
        body = await res.json();
    } catch {
        return unauthorizedResponse();
    }

    if (
        body === null ||
        typeof body !== 'object' ||
        typeof (body as { email?: unknown }).email !== 'string'
    ) {
        return NextResponse.json(
            {
                statusCode: 502,
                error: 'Bad Gateway',
                message: 'Invalid user profile response.',
            },
            { status: 502 },
        );
    }

    return {
        token: tokenOrRes,
        email: normalizeEmailForBff((body as { email: string }).email),
    };
}
