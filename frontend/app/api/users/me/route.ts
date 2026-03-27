import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session-constants';

export async function GET() {
    const base = process.env.USERS_SERVICE_URL;
    if (!base) {
        return NextResponse.json({ statusCode: 500, error: 'Config', message: 'USERS_SERVICE_URL is not configured.' }, { status: 500 });
    }
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.json({ statusCode: 401, error: 'Unauthorized', message: 'Session required.' }, { status: 401 });
    }
    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}

export async function PATCH(request: Request) {
    const base = process.env.USERS_SERVICE_URL;
    if (!base) {
        return NextResponse.json({ statusCode: 500, error: 'Config', message: 'USERS_SERVICE_URL is not configured.' }, { status: 500 });
    }
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.json({ statusCode: 401, error: 'Unauthorized', message: 'Session required.' }, { status: 401 });
    }
    const body = await request.json();
    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/users/me`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
