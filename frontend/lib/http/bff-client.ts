import { throwIfNotOk } from '@/lib/http/errors';
import type { ApiSuccessResponse } from '@/types/api';

function normalizedAppOrigin(value: string | undefined): string | undefined {
    if (value === undefined) {
        return undefined;
    }
    const trimmed = value.trim();
    if (trimmed === '') {
        return undefined;
    }
    return trimmed.replace(/\/$/, '');
}

function resolveServerBffOrigin(): string {
    const internal = normalizedAppOrigin(process.env.INTERNAL_APP_ORIGIN);
    if (internal) {
        return internal;
    }
    const publicUrl = normalizedAppOrigin(process.env.NEXT_PUBLIC_APP_URL);
    if (publicUrl) {
        return publicUrl;
    }
    const vercel = process.env.VERCEL_URL?.trim();
    if (vercel) {
        const host = vercel.replace(/^https?:\/\//, '');
        return `https://${host}`;
    }
    if (process.env.NODE_ENV !== 'production') {
        const port = process.env.PORT ?? '3000';
        return `http://127.0.0.1:${port}`;
    }
    throw new Error(
        'Server-side BFF requests need a known app origin. Set INTERNAL_APP_ORIGIN or NEXT_PUBLIC_APP_URL, or run on Vercel (VERCEL_URL).',
    );
}

function toBffAbsoluteUrl(path: string): string {
    if (!path.startsWith('/') || typeof window !== 'undefined') {
        return path;
    }
    const base = resolveServerBffOrigin();
    return `${base}${path}`;
}

export type BffPaginatedMeta = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export type BffPaginatedResult<T> = {
    data: T[];
    meta: BffPaginatedMeta;
};

export type BffFetchOptions = Omit<RequestInit, 'headers'> & {
    headers?: HeadersInit;
    idempotencyKey?: string;
};

export async function bffFetch(path: string, init?: BffFetchOptions): Promise<Response> {
    const { idempotencyKey, ...rest } = init ?? {};
    const headers = new Headers(rest.headers);
    if (idempotencyKey) {
        headers.set('Idempotency-Key', idempotencyKey);
    }
    const url = toBffAbsoluteUrl(path);
    const res = await fetch(url, {
        ...rest,
        headers,
        credentials: 'include',
    });
    await throwIfNotOk(res);
    return res;
}

export async function bffJson<T>(path: string, init?: BffFetchOptions): Promise<T> {
    const headers = new Headers(init?.headers);
    if (!headers.has('Content-Type') && init?.body !== undefined) {
        headers.set('Content-Type', 'application/json');
    }
    const res = await bffFetch(path, {
        ...init,
        headers,
    });
    if (res.status === 204) {
        return undefined as T;
    }
    const payload = (await res.json()) as unknown;
    if (
        payload !== null &&
        typeof payload === 'object' &&
        'success' in payload &&
        'data' in payload &&
        (payload as Record<string, unknown>).success === true
    ) {
        return (payload as ApiSuccessResponse<T>).data;
    }
    return payload as T;
}

export async function bffPaginatedJson<T>(path: string, init?: BffFetchOptions): Promise<BffPaginatedResult<T>> {
    const headers = new Headers(init?.headers);
    if (!headers.has('Content-Type') && init?.body !== undefined) {
        headers.set('Content-Type', 'application/json');
    }
    const res = await bffFetch(path, {
        ...init,
        headers,
    });
    const payload = (await res.json()) as unknown;
    if (
        payload !== null &&
        typeof payload === 'object' &&
        'success' in payload &&
        (payload as Record<string, unknown>).success === true &&
        'data' in payload &&
        Array.isArray((payload as Record<string, unknown>).data) &&
        'meta' in payload &&
        typeof (payload as Record<string, unknown>).meta === 'object' &&
        (payload as Record<string, unknown>).meta !== null
    ) {
        const p = payload as { data: T[]; meta: BffPaginatedMeta };
        return { data: p.data, meta: p.meta };
    }
    return payload as BffPaginatedResult<T>;
}
