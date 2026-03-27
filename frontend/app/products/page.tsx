import Link from 'next/link';
import { CatalogPagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { DEFAULT_PRODUCTS_PAGE_SIZE, fetchProductList } from '@/modules/products/server/catalog';
import { buildProductsCatalogHref, parseCatalogInStockOnlyFilter } from '@/modules/products/lib/catalog-href';
import { ProductGrid } from '@/modules/products/components/product-grid';
import { cn } from '@/lib/utils';

type SearchParams = Promise<{ page?: string; limit?: string; inStockOnly?: string; disponiveis?: string }>;

function parsePositiveInt(value: string | undefined, fallback: number): number {
    if (value == null || value === '') {
        return fallback;
    }
    const n = Number.parseInt(value, 10);
    if (!Number.isFinite(n) || n < 1) {
        return fallback;
    }
    return n;
}

export default async function ProductsPage({ searchParams }: { searchParams?: SearchParams }) {
    const sp = (await searchParams) ?? {};
    const page = parsePositiveInt(sp.page, 1);
    const limit = Math.min(50, parsePositiveInt(sp.limit, DEFAULT_PRODUCTS_PAGE_SIZE));
    const inStockOnly = parseCatalogInStockOnlyFilter(sp);

    const { data: products, meta } = await fetchProductList(page, limit);
    const { total, totalPages } = meta;

    const displayedProducts = inStockOnly ? products.filter((p) => p.inStock === true) : products;

    const emptyCatalog = total === 0;
    const emptyPage = !emptyCatalog && products.length === 0;
    const emptyFilteredPage = !emptyCatalog && products.length > 0 && inStockOnly && displayedProducts.length === 0;

    return (
        <div className="flex flex-col gap-10">
            <header className="space-y-3">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground">Catalog</h1>
                    <p className="max-w-2xl text-sm text-muted-foreground">
                        {inStockOnly
                            ? 'This view only shows products with confirmed stock.'
                            : 'Products available to order.'}
                    </p>
                </div>
                {!emptyCatalog ? (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Filter</span>
                        <Link
                            href={buildProductsCatalogHref({ page: 1, limit, inStockOnly: false })}
                            className={cn(
                                'rounded-full border px-3 py-1 text-sm transition-colors',
                                !inStockOnly
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-background text-foreground hover:bg-muted',
                            )}
                        >
                            All
                        </Link>
                        <Link
                            href={buildProductsCatalogHref({ page: 1, limit, inStockOnly: true })}
                            className={cn(
                                'rounded-full border px-3 py-1 text-sm transition-colors',
                                inStockOnly
                                    ? 'border-primary bg-primary text-primary-foreground'
                                    : 'border-border bg-background text-foreground hover:bg-muted',
                            )}
                        >
                            In stock only
                        </Link>
                    </div>
                ) : null}
                {!emptyCatalog ? (
                    <p className="text-sm text-muted-foreground">
                        {total} {total === 1 ? 'product' : 'products'} in catalog
                        {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : null}
                        {inStockOnly && displayedProducts.length > 0 ? (
                            <span>
                                {' '}
                                · {displayedProducts.length} in stock on this page
                            </span>
                        ) : null}
                    </p>
                ) : null}
            </header>
            {emptyCatalog ? (
                <EmptyState
                    title="No products"
                    description="If the Product service is not running, start it on port 3003 (e.g. npm run start:dev:product in backend/) and set PRODUCT_SERVICE_URL in the frontend .env (e.g. http://localhost:3003). In production, also set NEXT_PUBLIC_APP_URL. If the API responds but the list is empty, load data with npm run seed:product from backend/ (see the product app README)."
                />
            ) : emptyPage ? (
                <EmptyState
                    title="No products on this page"
                    description="Try another page or return to the first page of the catalog."
                    action={
                        <Link href="/products" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                            Go to page 1
                        </Link>
                    }
                />
            ) : emptyFilteredPage ? (
                <EmptyState
                    title="Nothing in stock on this page"
                    description="There are no in-stock products on this page. Try the next page or view all items."
                    action={
                        <div className="flex flex-wrap gap-3">
                            {page < totalPages ? (
                                <Link
                                    href={buildProductsCatalogHref({ page: page + 1, limit, inStockOnly: true })}
                                    className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                                >
                                    Next page
                                </Link>
                            ) : null}
                            <Link
                                href={buildProductsCatalogHref({ page, limit, inStockOnly: false })}
                                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
                            >
                                View all (incl. out of stock)
                            </Link>
                        </div>
                    }
                />
            ) : (
                <>
                    <ProductGrid products={displayedProducts} />
                    <CatalogPagination page={page} totalPages={totalPages} limit={limit} inStockOnly={inStockOnly} />
                </>
            )}
        </div>
    );
}
