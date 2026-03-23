import { throwIfNotOk } from '@/lib/errors';

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
    return (await res.json()) as T;
}
