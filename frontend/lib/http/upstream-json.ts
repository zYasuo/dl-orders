import { throwIfNotOk } from '@/lib/http/errors';

export async function upstreamJson<T>(options: {
    baseUrl: string | undefined;
    path: string;
    method?: string;
    body?: unknown;
    accessToken?: string | null;
    idempotencyKey?: string;
}): Promise<T> {
    const { baseUrl, path, method = 'GET', body, accessToken, idempotencyKey } = options;
    if (!baseUrl) {
        throw new Error('Service URL is not configured.');
    }
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }
    if (idempotencyKey) {
        headers.set('Idempotency-Key', idempotencyKey);
    }
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    await throwIfNotOk(res);
    if (res.status === 204) {
        return undefined as T;
    }
    return (await res.json()) as T;
}
