import { throwIfNotOk } from '@/lib/errors';
import { mergeStockIntoProduct } from '@/lib/stock-map';
import type { StockLookupRow, StockRow } from '@/lib/stock-map';
import { ApiError } from '@/types/api';
import type { ApiSuccessResponse } from '@/types/api';
import type { Product } from '@/types/product';

async function fetchStockMapRaw(productIds: string[]): Promise<Record<string, StockRow> | null> {
    if (productIds.length === 0) {
        return {};
    }
    try {
        const res = await fetch('/api/inventory/stock', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productIds }),
        });
        await throwIfNotOk(res);
        const payload = (await res.json()) as unknown;
        if (
            payload !== null &&
            typeof payload === 'object' &&
            'success' in payload &&
            (payload as Record<string, unknown>).success === true &&
            'data' in payload &&
            (payload as Record<string, unknown>).data !== null &&
            typeof (payload as Record<string, unknown>).data === 'object'
        ) {
            return (payload as ApiSuccessResponse<Record<string, StockRow>>).data;
        }
        return null;
    } catch (e) {
        if (e instanceof ApiError) {
            console.warn('Client stock lookup failed:', e.message);
            return null;
        }
        console.warn('Client stock lookup failed:', e);
        return null;
    }
}

function unwrapProduct(body: unknown): Product | null {
    if (body !== null && typeof body === 'object' && 'success' in body && 'data' in body && (body as Record<string, unknown>).success === true) {
        return (body as ApiSuccessResponse<Product>).data;
    }
    if (body !== null && typeof body === 'object') {
        return body as Product;
    }
    return null;
}

export async function fetchProductByIdClient(id: string): Promise<Product | null> {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`);
    if (res.status === 404) {
        return null;
    }
    await throwIfNotOk(res);
    const data = (await res.json()) as unknown;
    return unwrapProduct(data);
}

export async function fetchProductsWithStockClient(ids: string[]): Promise<{ products: Product[]; stockFailed: boolean }> {
    const unique = [...new Set(ids)];
    const results = await Promise.all(unique.map((id) => fetchProductByIdClient(id)));
    const products = results.filter((p): p is Product => p !== null);
    let stockFailed = false;
    const idsFound = products.map((p) => p.id);
    const stockMap = await fetchStockMapRaw(idsFound);
    if (stockMap === null) {
        stockFailed = true;
    }
    return {
        products: products.map((p) => mergeStockIntoProduct(p, stockMap)),
        stockFailed,
    };
}

export async function postStockRowsClient(productIds: string[]): Promise<StockLookupRow[]> {
    const res = await fetch('/api/inventory/stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productIds }),
    });
    await throwIfNotOk(res);
    const envelope = (await res.json()) as unknown;
    if (
        envelope === null ||
        typeof envelope !== 'object' ||
        !('success' in envelope) ||
        (envelope as { success?: unknown }).success !== true ||
        !('data' in envelope) ||
        typeof (envelope as { data: unknown }).data !== 'object'
    ) {
        return [];
    }
    const data = (envelope as { data: Record<string, unknown> }).data;
    const rows: StockLookupRow[] = [];
    for (const [productId, row] of Object.entries(data)) {
        if (row === null || typeof row !== 'object') {
            continue;
        }
        const o = row as Record<string, unknown>;
        if (
            typeof o.quantity !== 'number' ||
            typeof o.inStock !== 'boolean' ||
            typeof o.lastUnits !== 'boolean'
        ) {
            continue;
        }
        rows.push({
            productId,
            quantity: o.quantity,
            inStock: o.inStock,
            lastUnits: o.lastUnits,
        });
    }
    return rows;
}
