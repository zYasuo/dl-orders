import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const base = process.env.PRODUCT_SERVICE_URL;
    if (!base) {
        return NextResponse.json(
            { statusCode: 500, error: 'Config', message: 'PRODUCT_SERVICE_URL is not configured.' },
            { status: 500 },
        );
    }
    const { searchParams } = new URL(request.url);
    const qs = new URLSearchParams();
    const page = searchParams.get('page');
    const limit = searchParams.get('limit');
    if (page != null && page !== '') qs.set('page', page);
    if (limit != null && limit !== '') qs.set('limit', limit);
    const query = qs.toString();
    const url = `${base.replace(/\/$/, '')}/api/v1/products${query ? `?${query}` : ''}`;
    const res = await fetch(url);
    const text = await res.text();
    return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
}
