import { DEFAULT_PRODUCTS_PAGE_SIZE } from '@/modules/products/constants';

export const productKeys = {
    all: ['products'] as const,
    list: (page?: number, limit?: number) =>
        [...productKeys.all, 'list', { page: page ?? 1, limit: limit ?? DEFAULT_PRODUCTS_PAGE_SIZE }] as const,
    detail: (id: string) => [...productKeys.all, 'detail', id] as const,
};
