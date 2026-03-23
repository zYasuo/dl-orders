import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const base = process.env.AUTH_SERVICE_URL;
    if (!base) {
        return NextResponse.json({ statusCode: 500, error: 'Config', message: 'AUTH_SERVICE_URL não configurada.' }, { status: 500 });
    }
    const body = await request.json();
    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const text = await res.text();
    return new NextResponse(text, {
        status: res.status,
        headers: { 'Content-Type': 'application/json' },
    });
}
