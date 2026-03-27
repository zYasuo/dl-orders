import { NextResponse } from 'next/server';
import { z } from 'zod';
import { stockRowsToMap } from '@/modules/products/lib/stock-map';

const bodySchema = z.object({
    productIds: z.array(z.string().min(1).max(36)).min(1).max(50),
});

export async function POST(request: Request) {
    const base = process.env.INVENTORY_SERVICE_URL;
    const secret = process.env.SERVICE_AUTH_SECRET;
    if (!base || !secret) {
        return NextResponse.json(
            { statusCode: 500, error: 'Config', message: 'INVENTORY_SERVICE_URL or SERVICE_AUTH_SECRET is not configured.' },
            { status: 500 },
        );
    }
    let json: unknown;
    try {
        json = await request.json();
    } catch {
        return NextResponse.json(
            { statusCode: 400, error: 'Bad Request', message: 'Invalid JSON body.' },
            { status: 400 },
        );
    }
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
        return NextResponse.json(
            {
                statusCode: 400,
                error: 'Bad Request',
                message: 'Validation failed',
                details: parsed.error.flatten(),
            },
            { status: 400 },
        );
    }
    const url = `${base.replace(/\/$/, '')}/api/v1/inventories/lookup`;
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-service-auth': secret,
        },
        body: JSON.stringify(parsed.data),
    });
    const text = await res.text();
    if (!res.ok) {
        return new NextResponse(text, { status: res.status, headers: { 'Content-Type': 'application/json' } });
    }
    let envelope: unknown;
    try {
        envelope = JSON.parse(text) as unknown;
    } catch {
        return NextResponse.json(
            { statusCode: 502, error: 'Bad Gateway', message: 'Invalid inventory service response.' },
            { status: 502 },
        );
    }
    if (
        envelope === null ||
        typeof envelope !== 'object' ||
        !('success' in envelope) ||
        (envelope as { success?: unknown }).success !== true ||
        !('data' in envelope) ||
        !Array.isArray((envelope as { data: unknown }).data)
    ) {
        return NextResponse.json(
            { statusCode: 502, error: 'Bad Gateway', message: 'Unexpected inventory success payload.' },
            { status: 502 },
        );
    }
    const rows = (envelope as { data: unknown[] }).data;
    const normalized: { productId: string; quantity: number; inStock: boolean; lastUnits: boolean }[] = [];
    for (const row of rows) {
        if (row === null || typeof row !== 'object') continue;
        const o = row as Record<string, unknown>;
        if (
            typeof o.productId !== 'string' ||
            typeof o.quantity !== 'number' ||
            typeof o.inStock !== 'boolean' ||
            typeof o.lastUnits !== 'boolean'
        ) {
            continue;
        }
        normalized.push({
            productId: o.productId,
            quantity: o.quantity,
            inStock: o.inStock,
            lastUnits: o.lastUnits,
        });
    }
    const map = stockRowsToMap(normalized);
    const envRecord = envelope as Record<string, unknown>;
    const timestamp =
        typeof envRecord.timestamp === 'string' ? envRecord.timestamp : new Date().toISOString();
    return NextResponse.json({ success: true, timestamp, data: map });
}
