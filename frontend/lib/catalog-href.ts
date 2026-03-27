import { DEFAULT_PRODUCTS_PAGE_SIZE } from '@/lib/product-catalog';

export type CatalogHrefOptions = {
    page?: number;
    limit?: number;
    inStockOnly?: boolean;
};

function parseTruthyQueryFlag(value: string | string[] | undefined): boolean {
    if (value == null || value === '') {
        return false;
    }
    const v = Array.isArray(value) ? value[0] : value;
    return v === '1' || v === 'true' || v === 'yes';
}

export function parseCatalogInStockOnlyFilter(sp: {
    inStockOnly?: string | string[];
    disponiveis?: string | string[];
}): boolean {
    return parseTruthyQueryFlag(sp.inStockOnly) || parseTruthyQueryFlag(sp.disponiveis);
}

export function buildProductsCatalogHref(options: CatalogHrefOptions = {}): string {
    const page = options.page ?? 1;
    const limit = options.limit ?? DEFAULT_PRODUCTS_PAGE_SIZE;
    const params = new URLSearchParams();
    if (page > 1) {
        params.set('page', String(page));
    }
    if (limit !== DEFAULT_PRODUCTS_PAGE_SIZE) {
        params.set('limit', String(limit));
    }
    if (options.inStockOnly) {
        params.set('inStockOnly', '1');
    }
    const q = params.toString();
    return q ? `/products?${q}` : '/products';
}
