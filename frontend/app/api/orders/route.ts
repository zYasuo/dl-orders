import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session/constants';

export async function GET(request: Request) {
    const base = process.env.ORDERS_SERVICE_URL;
    if (!base) {
        return NextResponse.json({ statusCode: 500, error: 'Config', message: 'ORDERS_SERVICE_URL is not configured.' }, { status: 500 });
    }
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.json({ statusCode: 401, error: 'Unauthorized', message: 'Session required.' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const page = searchParams.get('page') ?? '1';
    const limit = searchParams.get('limit') ?? '12';
    const qs = new URLSearchParams({ page, limit }).toString();
    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/orders?${qs}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}

export async function POST(request: Request) {
    const base = process.env.ORDERS_SERVICE_URL;
    if (!base) {
        return NextResponse.json({ statusCode: 500, error: 'Config', message: 'ORDERS_SERVICE_URL is not configured.' }, { status: 500 });
    }
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.json({ statusCode: 401, error: 'Unauthorized', message: 'Session required.' }, { status: 401 });
    }
    const body = await request.json();
    const idempotencyKey = request.headers.get('Idempotency-Key') ?? undefined;
    const headers: HeadersInit = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
    if (idempotencyKey) {
        (headers as Record<string, string>)['Idempotency-Key'] = idempotencyKey;
    }
    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/orders`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
