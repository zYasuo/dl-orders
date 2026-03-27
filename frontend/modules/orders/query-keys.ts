import { DEFAULT_PRODUCTS_PAGE_SIZE } from '@/modules/products/constants';

export const orderKeys = {
    all: ['orders'] as const,
    list: (page?: number, limit?: number) =>
        [...orderKeys.all, 'list', { page: page ?? 1, limit: limit ?? DEFAULT_PRODUCTS_PAGE_SIZE }] as const,
    detail: (id: string) => [...orderKeys.all, 'detail', id] as const,
};
