import { NextResponse } from 'next/server';

export async function PATCH(request: Request) {
    const base = process.env.AUTH_SERVICE_URL;
    if (!base) {
        return NextResponse.json({ statusCode: 500, error: 'Config', message: 'AUTH_SERVICE_URL não configurada.' }, { status: 500 });
    }
    const body = await request.json();
    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/auth/change-password`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
