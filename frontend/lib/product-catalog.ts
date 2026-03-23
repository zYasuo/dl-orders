import { throwIfNotOk } from '@/lib/errors';
import { ApiError } from '@/types/api';
import type { PaginatedResponse } from '@/types/pagination';
import type { Product } from '@/types/product';

export const DEFAULT_PRODUCTS_PAGE_SIZE = 12;

function emptyPaginated(page: number, limit: number): PaginatedResponse<Product> {
    return {
        data: [],
        meta: { page, limit, total: 0, totalPages: 0 },
    };
}

function serverBffOrigin(): string {
    const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '');
    if (fromEnv) {
        return fromEnv;
    }
    if (process.env.NODE_ENV !== 'production') {
        return 'http://localhost:3000';
    }
    return '';
}

function buildListUrl(origin: string, page: number, limit: number): string {
    const params = new URLSearchParams();
    params.set('page', String(page));
    params.set('limit', String(limit));
    return `${origin}/api/products?${params.toString()}`;
}

function isPaginatedProductPayload(body: unknown): body is PaginatedResponse<Product> {
    if (body === null || typeof body !== 'object') return false;
    const o = body as Record<string, unknown>;
    if (!Array.isArray(o.data) || o.meta === null || typeof o.meta !== 'object') return false;
    const m = o.meta as Record<string, unknown>;
    return (
        typeof m.page === 'number' &&
        typeof m.limit === 'number' &&
        typeof m.total === 'number' &&
        typeof m.totalPages === 'number'
    );
}

export async function fetchProductList(page = 1, limit = DEFAULT_PRODUCTS_PAGE_SIZE): Promise<PaginatedResponse<Product>> {
    const origin = serverBffOrigin();
    if (!origin) {
        console.warn('NEXT_PUBLIC_APP_URL is not set; returning empty catalog.');
        return emptyPaginated(page, limit);
    }
    try {
        const res = await fetch(buildListUrl(origin, page, limit), {
            cache: 'no-store',
        });
        if (res.status === 404) {
            console.warn(
                'Catalog: 404 from /api/products. Start the Product service (e.g. npm run start:dev:product in backend on port 3003) and check PRODUCT_SERVICE_URL.',
            );
            return emptyPaginated(page, limit);
        }
        await throwIfNotOk(res);
        const data = (await res.json()) as unknown;
        if (isPaginatedProductPayload(data)) {
            return data;
        }
        return emptyPaginated(page, limit);
    } catch (e) {
        if (e instanceof ApiError) {
            throw e;
        }
        console.warn('Catalog unavailable (network or server). Check PRODUCT_SERVICE_URL and the Product service.', e);
        return emptyPaginated(page, limit);
    }
}

export async function fetchProductById(id: string): Promise<Product | null> {
    const origin = serverBffOrigin();
    if (!origin) {
        return null;
    }
    try {
        const res = await fetch(`${origin}/api/products/${id}`, {
            next: { revalidate: 30 },
        });
        if (res.status === 404) {
            return null;
        }
        await throwIfNotOk(res);
        return (await res.json()) as Product;
    } catch (e) {
        if (e instanceof ApiError) {
            throw e;
        }
        console.warn('Product detail unavailable. Check PRODUCT_SERVICE_URL and the Product service.', e);
        return null;
    }
}
