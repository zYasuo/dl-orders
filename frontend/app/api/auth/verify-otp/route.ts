import { NextResponse } from 'next/server';
import { setSessionCookie } from '@/lib/session/auth-cookie';

export async function POST(request: Request) {
    const base = process.env.AUTH_SERVICE_URL;
    if (!base) {
        return NextResponse.json({ statusCode: 500, error: 'Config', message: 'AUTH_SERVICE_URL is not configured.' }, { status: 500 });
    }
    const body = await request.json();
    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const text = await res.text();
    if (!res.ok) {
        return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
    }
    const parsed = JSON.parse(text) as { accessToken?: string; data?: { accessToken?: string } };
    const accessToken = parsed.data?.accessToken ?? parsed.accessToken;
    if (!accessToken) {
        return NextResponse.json(
            { statusCode: 502, error: 'BadGateway', message: 'Invalid authentication response.' },
            { status: 502 },
        );
    }
    const out = NextResponse.json({ success: true });
    setSessionCookie(out, accessToken);
    return out;
}
