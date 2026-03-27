import { NextResponse } from 'next/server';

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
    const base = process.env.PRODUCT_SERVICE_URL;
    if (!base) {
        return NextResponse.json({ statusCode: 500, error: 'Config', message: 'PRODUCT_SERVICE_URL is not configured.' }, { status: 500 });
    }
    const { id } = await context.params;
    const res = await fetch(`${base.replace(/\/$/, '')}/api/v1/products/${id}`);
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
