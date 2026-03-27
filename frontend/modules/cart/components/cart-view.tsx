'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';
import { fetchProductsWithStockClient } from '@/modules/products/lib/client-catalog';
import { cancelCartAbandonment } from '@/modules/cart/lib/cart-abandonment-schedule';
import { clearCartStorage, removeCartLine, setLineQuantity } from '@/modules/cart/lib/cart-storage';
import { getStockUiState, isCartLinePurchasable } from '@/modules/products/lib/stock-status';
import { cn, formatCurrencyBRL } from '@/lib/utils';
import { CartAbandonmentPanel } from '@/modules/cart/components/cart-abandonment-panel';
import { OutOfStockRibbon, StockUnverifiedHint } from '@/modules/products/components/out-of-stock-ribbon';
import type { Product } from '@/types/product';

export function CartView() {
    const { snapshot, refresh } = useCart();
    const { toast } = useToast();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stockFailed, setStockFailed] = useState(false);
    const [lines, setLines] = useState<{ item: { productId: string; quantity: number }; product: Product | null }[]>([]);

    const load = useCallback(async () => {
        if (snapshot.kind !== 'ok') {
            setLines([]);
            setLoading(false);
            return;
        }
        const ids = snapshot.items.map((i) => i.productId);
        setLoading(true);
        try {
            const { products, stockFailed: sf } = await fetchProductsWithStockClient(ids);
            setStockFailed(sf);
            const byId = new Map(products.map((p) => [p.id, p]));
            setLines(
                snapshot.items.map((item) => ({
                    item,
                    product: byId.get(item.productId) ?? null,
                })),
            );
        } catch {
            toast({ message: 'Could not load cart data.', variant: 'error' });
            setLines(snapshot.items.map((item) => ({ item, product: null })));
        } finally {
            setLoading(false);
        }
    }, [snapshot, toast]);

    useEffect(() => {
        void load();
    }, [load]);

    useEffect(() => {
        if (snapshot.kind === 'expired') {
            void cancelCartAbandonment();
        }
    }, [snapshot.kind]);

    const subtotal = useMemo(() => {
        return lines.reduce((sum, { item, product }) => {
            if (!product) {
                return sum;
            }
            return sum + product.price * item.quantity;
        }, 0);
    }, [lines]);

    const singleCheckoutLine = useMemo(() => {
        if (lines.length !== 1) {
            return null;
        }
        const row = lines[0];
        if (!row.product || !isCartLinePurchasable(row.product, stockFailed)) {
            return null;
        }
        return row;
    }, [lines, stockFailed]);

    async function handleRefreshStock() {
        setRefreshing(true);
        try {
            await load();
            toast({ message: 'Stock updated.', variant: 'success' });
        } finally {
            setRefreshing(false);
        }
    }

    function clampQty(productId: string, raw: string) {
        const n = Number.parseInt(raw, 10);
        if (Number.isNaN(n) || n < 1) {
            return;
        }
        const line = lines.find((l) => l.item.productId === productId);
        const product = line?.product ?? null;
        if (!product || !isCartLinePurchasable(product, stockFailed)) {
            return;
        }
        const max = product.inStock === true && typeof product.stockQuantity === 'number' ? product.stockQuantity : null;
        const q = max !== null && max > 0 ? Math.min(n, max) : n;
        setLineQuantity(productId, q);
        refresh();
    }

    if (snapshot.kind === 'expired') {
        return (
            <div className="space-y-6 border-l-2 border-black/8 pl-6">
                <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground">
                    Your cart expired and items were removed. You can start again from the catalog.
                </p>
                <Link href="/products" className={cn(buttonVariants({ variant: 'primary', size: 'md' }), 'inline-flex')}>
                    Go to catalog
                </Link>
            </div>
        );
    }

    if (snapshot.kind === 'empty' || snapshot.kind === 'invalid') {
        return (
            <div className="space-y-4">
                <p className="text-[17px] text-foreground/85">Your cart is empty.</p>
                <Link
                    href="/products"
                    className="inline-block text-[15px] text-foreground underline-offset-4 transition-colors duration-200 hover:underline"
                >
                    Browse products
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-10">
            {stockFailed ? (
                <p className="max-w-xl border-l-2 border-amber-500/40 pl-4 text-[14px] leading-relaxed text-muted-foreground">
                    Stock could not be refreshed in real time. Use &quot;Refresh stock&quot; before you pay.
                </p>
            ) : null}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="rounded-full border-black/12"
                    loading={refreshing}
                    onClick={() => void handleRefreshStock()}
                >
                    Refresh stock
                </Button>
                <button
                    type="button"
                    className="text-[13px] text-danger underline-offset-4 transition-colors duration-200 hover:underline"
                    onClick={() => {
                        clearCartStorage();
                        void cancelCartAbandonment();
                        refresh();
                        setLines([]);
                    }}
                >
                    Clear cart
                </button>
            </div>

            <div className="flex flex-col gap-0 lg:grid lg:grid-cols-[1fr_min(100%,17.5rem)] lg:gap-x-16 lg:gap-y-0">
                <aside className="order-1 mb-10 border-b border-black/6 pb-8 lg:order-2 lg:mb-0 lg:border-b-0 lg:pb-0">
                    <div className="lg:sticky lg:top-28">
                        <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">Subtotal</p>
                        <p className="mt-2 text-3xl font-semibold tabular-nums tracking-tight text-foreground">{formatCurrencyBRL(subtotal)}</p>
                        {lines.length > 1 ? (
                            <p className="mt-3 text-[13px] leading-relaxed text-muted-foreground">
                                Checkout is per product from your cart lines.
                            </p>
                        ) : null}
                        {singleCheckoutLine ? (
                            <Link
                                href={`/checkout?productId=${encodeURIComponent(singleCheckoutLine.item.productId)}&quantity=${encodeURIComponent(String(singleCheckoutLine.item.quantity))}`}
                                className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'mt-8 w-full rounded-full')}
                            >
                                Checkout
                            </Link>
                        ) : null}
                    </div>
                </aside>

                <div className="order-2 min-w-0 lg:order-1">
                    {loading ? (
                        <div className="flex flex-col gap-8">
                            <Skeleton variant="card" className="h-28 rounded-2xl" />
                            <Skeleton variant="card" className="h-28 rounded-2xl" />
                        </div>
                    ) : (
                        <ul className="flex flex-col">
                            {lines.map(({ item, product }) => {
                                const stockState = product ? getStockUiState(product) : 'unconfirmed';
                                const lineOk = product ? isCartLinePurchasable(product, stockFailed) : false;
                                const isOutOfStock = stockState === 'out_of_stock';
                                return (
                                    <li
                                        key={item.productId}
                                        className="flex flex-col gap-4 border-b border-black/6 py-6 last:border-b-0 sm:flex-row sm:items-center sm:gap-6 sm:py-7"
                                    >
                                        <Link
                                            href={product ? `/products/${product.id}` : '/products'}
                                            className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-24"
                                        >
                                            {product?.imageUrl ? (
                                                <img
                                                    src={product.imageUrl}
                                                    alt={product.name}
                                                    className={cn('h-full w-full object-cover', isOutOfStock && 'opacity-45 grayscale')}
                                                />
                                            ) : (
                                                <div className="flex h-full items-center justify-center text-[12px] text-muted-foreground/45">
                                                    No photo
                                                </div>
                                            )}
                                            {isOutOfStock ? (
                                                <span className="pointer-events-none absolute inset-x-1 top-1 flex justify-center">
                                                    <OutOfStockRibbon variant="inline" className="scale-90 px-2 py-0.5 text-[9px]" />
                                                </span>
                                            ) : null}
                                        </Link>

                                        <div className="min-w-0 flex-1 space-y-1.5">
                                            {product ? (
                                                <Link
                                                    href={`/products/${product.id}`}
                                                    className="block text-sm font-medium leading-snug text-foreground transition-colors duration-200 hover:text-muted-foreground"
                                                >
                                                    {product.name}
                                                </Link>
                                            ) : (
                                                <span className="text-[15px] text-muted-foreground">Product removed from catalog</span>
                                            )}
                                            {product ? (
                                                <p className="text-sm font-medium tabular-nums text-foreground/90">
                                                    {formatCurrencyBRL(product.price)}
                                                    {item.quantity > 1 ? (
                                                        <span className="font-normal text-muted-foreground">
                                                            {' '}
                                                            × {item.quantity}
                                                            {lineOk ? (
                                                                <span className="tabular-nums">
                                                                    {' '}
                                                                    · {formatCurrencyBRL(product.price * item.quantity)}
                                                                </span>
                                                            ) : null}
                                                        </span>
                                                    ) : null}
                                                </p>
                                            ) : null}
                                            {product ? (
                                                stockState === 'purchasable' ? (
                                                    <p className={cn('text-[13px] text-muted-foreground', product.lastUnits && 'text-foreground/70')}>
                                                        {typeof product.stockQuantity === 'number' ? `${product.stockQuantity} in stock` : null}
                                                        {product.lastUnits ? ' · Limited quantity' : null}
                                                    </p>
                                                ) : stockState === 'out_of_stock' ? (
                                                    <p className="text-[13px] text-muted-foreground">Unavailable for purchase.</p>
                                                ) : (
                                                    <StockUnverifiedHint className="text-[13px]" />
                                                )
                                            ) : null}
                                        </div>

                                        <div className="flex flex-col gap-3 sm:shrink-0 sm:flex-row sm:items-center sm:gap-4 sm:pl-2">
                                            <Field
                                                label="Qty"
                                                htmlFor={`qty-${item.productId}`}
                                                className="w-full min-w-26 sm:w-24 [&_label]:text-[11px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-[0.06em] [&_label]:text-muted-foreground"
                                            >
                                                <Input
                                                    id={`qty-${item.productId}`}
                                                    type="number"
                                                    min={1}
                                                    max={
                                                        product?.inStock === true && typeof product.stockQuantity === 'number'
                                                            ? product.stockQuantity
                                                            : undefined
                                                    }
                                                    className="rounded-xl border-black/8"
                                                    disabled={!product || !lineOk}
                                                    defaultValue={item.quantity}
                                                    key={`${item.productId}-${item.quantity}`}
                                                    onBlur={(e) => clampQty(item.productId, e.target.value)}
                                                />
                                            </Field>
                                            <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                                                {product && lineOk ? (
                                                    <Link
                                                        href={`/checkout?productId=${encodeURIComponent(item.productId)}&quantity=${encodeURIComponent(String(item.quantity))}`}
                                                        className={cn(buttonVariants({ variant: 'primary', size: 'sm' }), 'rounded-full')}
                                                    >
                                                        Checkout
                                                    </Link>
                                                ) : null}
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-auto px-2 text-[13px] font-normal text-muted-foreground hover:bg-transparent hover:text-foreground"
                                                    onClick={() => {
                                                        removeCartLine(item.productId);
                                                        refresh();
                                                    }}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>
            </div>

            <CartAbandonmentPanel items={snapshot.items} />
        </div>
    );
}
