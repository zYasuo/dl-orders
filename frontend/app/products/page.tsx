import Link from 'next/link';
import { CatalogPagination } from '@/components/ui/pagination';
import { EmptyState } from '@/components/ui/empty-state';
import { ProductGrid } from '@/modules/products/components/product-grid';
import { DEFAULT_PRODUCTS_PAGE_SIZE, fetchProductList } from '@/lib/product-catalog';

type SearchParams = Promise<{ page?: string; limit?: string }>;

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

    const { data: products, meta } = await fetchProductList(page, limit);
    const { total, totalPages } = meta;

    const emptyCatalog = total === 0;
    const emptyPage = !emptyCatalog && products.length === 0;

    return (
        <div className="flex flex-col gap-8">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Catalog</h1>
                <p className="mt-1 text-muted-foreground">Products available to order.</p>
                {!emptyCatalog ? (
                    <p className="mt-2 text-sm text-muted-foreground">
                        {total} {total === 1 ? 'product' : 'products'}
                        {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : null}
                    </p>
                ) : null}
            </div>
            {emptyCatalog ? (
                <EmptyState
                    title="No products"
                    description="Start the Product service (port 3003), set PRODUCT_SERVICE_URL, and in production NEXT_PUBLIC_APP_URL."
                />
            ) : emptyPage ? (
                <EmptyState
                    title="No products on this page"
                    description="Try another page or return to the start of the catalog."
                    action={
                        <Link href="/products" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                            Go to page 1
                        </Link>
                    }
                />
            ) : (
                <>
                    <ProductGrid products={products} />
                    <CatalogPagination page={page} totalPages={totalPages} limit={limit} />
                </>
            )}
        </div>
    );
}
