import { throwIfNotOk } from '@/lib/errors';
import type { ApiSuccessResponse } from '@/types/api';

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
    const res = await fetch(path, {
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
