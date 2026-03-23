import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME } from '@/lib/session-constants';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
    const base = process.env.ORDERS_SERVICE_URL;
    if (!base) {
        return NextResponse.json({ statusCode: 500, error: 'Config', message: 'ORDERS_SERVICE_URL não configurada.' }, { status: 500 });
    }
    const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
    if (!token) {
        return NextResponse.json({ statusCode: 401, error: 'Unauthorized', message: 'Sessão necessária.' }, { status: 401 });
    }
    const { id } = await context.params;
    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
