'use client';

import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { buttonVariants } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCart } from '@/hooks/use-cart';
import { fetchProductsWithStockClient } from '@/modules/products/lib/client-catalog';
import { getStockUiState } from '@/modules/products/lib/stock-status';
import { cn } from '@/lib/utils';

type LineMeta = { name: string; note: string | null };

export function CartHeaderDropdown() {
    const { snapshot, count } = useCart();
    const [open, setOpen] = useState(false);
    const [lineMeta, setLineMeta] = useState<Record<string, LineMeta>>({});
    const [miniLoading, setMiniLoading] = useState(false);

    const items = useMemo(() => (snapshot.kind === 'ok' ? snapshot.items : []), [snapshot]);

    useEffect(() => {
        if (!open || items.length === 0) {
            return;
        }
        let cancelled = false;
        setMiniLoading(true);
        void (async () => {
            const ids = [...new Set(items.map((i) => i.productId))];
            try {
                const { products, stockFailed } = await fetchProductsWithStockClient(ids);
                if (cancelled) {
                    return;
                }
                const byId = new Map(products.map((p) => [p.id, p]));
                const next: Record<string, LineMeta> = {};
                for (const id of ids) {
                    const p = byId.get(id) ?? null;
                    const name = p?.name ?? id.slice(0, 8);
                    let note: string | null = null;
                    if (!p) {
                        note = 'Product not found';
                    } else if (stockFailed) {
                        note = 'Stock not verified';
                    } else {
                        const s = getStockUiState(p);
                        if (s === 'out_of_stock') {
                            note = 'Out of stock';
                        } else if (s === 'unconfirmed') {
                            note = 'Stock not verified';
                        }
                    }
                    next[id] = { name, note };
                }
                setLineMeta((prev) => ({ ...prev, ...next }));
            } finally {
                if (!cancelled) {
                    setMiniLoading(false);
                }
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [open, items]);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
                className={cn(
                    buttonVariants({ variant: 'ghost', size: 'sm' }),
                    'relative h-9 w-9 shrink-0 p-0 text-muted-foreground hover:text-foreground',
                )}
                aria-label="Cart"
            >
                <ShoppingCart className="size-5" strokeWidth={2} aria-hidden />
                {count > 0 ? (
                    <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-4.5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold leading-none text-primary-foreground tabular-nums">
                        {count > 99 ? '99+' : count}
                    </span>
                ) : null}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80" sideOffset={8}>
                <DropdownMenuLabel>Cart</DropdownMenuLabel>
                {count === 0 ? (
                    <>
                        <div className="px-2 py-2 text-center text-sm text-muted-foreground">Your cart is empty.</div>
                        <DropdownMenuItem asChild className="cursor-pointer justify-center">
                            <Link href="/products">View catalog</Link>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <>
                        <div className="max-h-56 overflow-y-auto">
                            {items.map((line) => {
                                const meta = lineMeta[line.productId];
                                const label = miniLoading && !meta ? 'Loading…' : (meta?.name ?? '…');
                                const note = meta?.note ?? null;
                                return (
                                    <DropdownMenuItem key={line.productId} asChild className="cursor-pointer">
                                        <Link
                                            href={`/products/${line.productId}`}
                                            className="flex w-full min-w-0 flex-col items-stretch gap-0.5"
                                        >
                                            <div className="flex w-full min-w-0 items-start gap-2">
                                                <span className="tabular-nums text-muted-foreground">{line.quantity}×</span>
                                                <span className="min-w-0 flex-1 wrap-break-word text-[13px] font-normal leading-snug text-foreground">
                                                    {label}
                                                </span>
                                            </div>
                                            {note ? (
                                                <span className="pl-7 text-[12px] text-muted-foreground" role="status">
                                                    {note}
                                                </span>
                                            ) : null}
                                        </Link>
                                    </DropdownMenuItem>
                                );
                            })}
                        </div>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer justify-center font-medium text-primary focus:text-primary">
                            <Link href="/cart">Open cart</Link>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
