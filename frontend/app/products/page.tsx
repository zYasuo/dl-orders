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
        <div className="flex flex-col gap-10">
            <header className="space-y-1">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">Catálogo</h1>
                <p className="max-w-2xl text-sm text-muted-foreground">Produtos disponíveis para pedido.</p>
                {!emptyCatalog ? (
                    <p className="pt-2 text-sm text-muted-foreground">
                        {total} {total === 1 ? 'produto' : 'produtos'}
                        {totalPages > 1 ? ` · Página ${page} de ${totalPages}` : null}
                    </p>
                ) : null}
            </header>
            {emptyCatalog ? (
                <EmptyState
                    title="Nenhum produto"
                    description="Inicie o serviço Product (porta 3003), defina PRODUCT_SERVICE_URL e, em produção, NEXT_PUBLIC_APP_URL."
                />
            ) : emptyPage ? (
                <EmptyState
                    title="Nenhum produto nesta página"
                    description="Tente outra página ou volte ao início do catálogo."
                    action={
                        <Link href="/products" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                            Ir para a página 1
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
