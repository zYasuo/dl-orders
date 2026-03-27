import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { getStockUiState } from '@/modules/products/lib/stock-status';
import { fetchProductById } from '@/modules/products/server/catalog';
import { CheckoutForm, type CheckoutProductPreview } from '@/modules/orders/components/checkout-form';

type SearchParams = Promise<{ productId?: string; quantity?: string }>;

function parseInitialQuantity(raw: string | undefined, maxStock: number | null): number {
    const n = Number.parseInt(raw ?? '', 10);
    let q = Number.isNaN(n) || n < 1 ? 1 : n;
    if (maxStock !== null && maxStock > 0 && q > maxStock) {
        q = maxStock;
    }
    return q;
}

function toPreview(product: NonNullable<Awaited<ReturnType<typeof fetchProductById>>>): CheckoutProductPreview {
    return {
        id: product.id,
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
    };
}

async function CheckoutFormSlot({ searchParams }: { searchParams: SearchParams }) {
    const sp = await searchParams;
    const productId = sp.productId?.trim() ?? '';
    let maxStock: number | null = null;
    let product: CheckoutProductPreview | null = null;
    let stockUnavailable = false;
    if (productId) {
        const p = await fetchProductById(productId);
        if (p) {
            product = toPreview(p);
            const state = getStockUiState(p);
            if (state === 'out_of_stock') {
                maxStock = 0;
            } else if (state === 'unconfirmed') {
                stockUnavailable = true;
            } else if (p.inStock === true && typeof p.stockQuantity === 'number') {
                maxStock = p.stockQuantity;
            } else {
                maxStock = null;
            }
        }
    }
    const initialQuantity = parseInitialQuantity(sp.quantity, maxStock);
    return (
        <CheckoutForm
            key={`${maxStock}-${initialQuantity}-${product?.id ?? ''}-${stockUnavailable}`}
            product={product}
            maxStock={maxStock}
            initialQuantity={initialQuantity}
            stockUnavailable={stockUnavailable}
        />
    );
}

export default function CheckoutPage({ searchParams }: { searchParams: SearchParams }) {
    return (
        <div className="mx-auto w-full max-w-5xl">
            <header className="mb-8 space-y-2 sm:mb-10">
                <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">Checkout</h1>
                <p className="max-w-2xl text-[15px] leading-relaxed text-muted-foreground">
                    Review your order, optional delivery details, and contact. Payment happens on the next screen after you confirm.
                </p>
            </header>
            <Suspense fallback={<Skeleton className="h-112 w-full max-w-3xl rounded-2xl" />}>
                <CheckoutFormSlot searchParams={searchParams} />
            </Suspense>
        </div>
    );
}
