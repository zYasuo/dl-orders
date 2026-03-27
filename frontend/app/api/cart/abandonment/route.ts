import { NextResponse } from 'next/server';
import { z } from 'zod';
import { normalizeEmailForBff, requireSessionToken, requireSessionUserEmail } from '@/lib/bff-session';

const putBodySchema = z.object({
    sessionKey: z.string().min(8).max(64),
    email: z.string().email().max(254),
    resumeUrl: z.string().url().max(2000),
    pendingUntil: z.string().datetime(),
    summaryLines: z.string().max(2000),
});

const deleteQuerySchema = z.object({
    sessionKey: z.string().min(8).max(64),
});

export async function PUT(request: Request) {
    const profile = await requireSessionUserEmail();
    if (profile instanceof NextResponse) {
        return profile;
    }

    const base = process.env.NOTIFICATION_SERVICE_URL?.replace(/\/$/, '');
    const secret = process.env.SERVICE_AUTH_SECRET;
    if (!base || !secret) {
        return NextResponse.json(
            { statusCode: 500, error: 'Config', message: 'NOTIFICATION_SERVICE_URL or SERVICE_AUTH_SECRET is not configured.' },
            { status: 500 },
        );
    }
    let json: unknown;
    try {
        json = await request.json();
    } catch {
        return NextResponse.json({ statusCode: 400, error: 'Bad Request', message: 'Invalid JSON body.' }, { status: 400 });
    }
    const parsed = putBodySchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            { statusCode: 400, error: 'Bad Request', message: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 },
        );
    }

    if (normalizeEmailForBff(parsed.data.email) !== profile.email) {
        return NextResponse.json(
            { statusCode: 403, error: 'Forbidden', message: 'Email must match the signed-in user.' },
            { status: 403 },
        );
    }

    const res = await fetch(`${base}/api/v1/internal/cart-abandonment`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'x-service-auth': secret,
        },
        body: JSON.stringify(parsed.data),
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}

export async function DELETE(request: Request) {
    const session = await requireSessionToken();
    if (session instanceof NextResponse) {
        return session;
    }

    const base = process.env.NOTIFICATION_SERVICE_URL?.replace(/\/$/, '');
    const secret = process.env.SERVICE_AUTH_SECRET;
    if (!base || !secret) {
        return NextResponse.json(
            { statusCode: 500, error: 'Config', message: 'NOTIFICATION_SERVICE_URL or SERVICE_AUTH_SECRET is not configured.' },
            { status: 500 },
        );
    }
    const url = new URL(request.url);
    const raw = { sessionKey: url.searchParams.get('sessionKey') ?? '' };
    const parsed = deleteQuerySchema.safeParse(raw);
    if (!parsed.success) {
        return NextResponse.json(
            { statusCode: 400, error: 'Bad Request', message: 'Validation failed', details: parsed.error.flatten() },
            { status: 400 },
        );
    }
    const qs = new URLSearchParams({ sessionKey: parsed.data.sessionKey });
    const res = await fetch(`${base}/api/v1/internal/cart-abandonment?${qs.toString()}`, {
        method: 'DELETE',
        headers: { 'x-service-auth': secret },
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
