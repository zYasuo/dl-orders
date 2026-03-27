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
import { fetchProductByIdClient } from '@/lib/client-catalog';
import { cn } from '@/lib/utils';

export function CartHeaderDropdown() {
    const { snapshot, count } = useCart();
    const [open, setOpen] = useState(false);
    const [titles, setTitles] = useState<Record<string, string>>({});

    const items = useMemo(() => (snapshot.kind === 'ok' ? snapshot.items : []), [snapshot]);

    useEffect(() => {
        if (!open || items.length === 0) {
            return;
        }
        let cancelled = false;
        void (async () => {
            const ids = [...new Set(items.map((i) => i.productId))];
            const entries = await Promise.all(
                ids.map(async (id) => {
                    const p = await fetchProductByIdClient(id);
                    return [id, p?.name ?? id.slice(0, 8)] as const;
                }),
            );
            if (!cancelled) {
                setTitles((prev) => {
                    const next = { ...prev };
                    for (const [id, name] of entries) {
                        next[id] = name;
                    }
                    return next;
                });
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
                                const label = titles[line.productId] ?? '…';
                                return (
                                    <DropdownMenuItem key={line.productId} asChild className="cursor-pointer">
                                        <Link
                                            href={`/products/${line.productId}`}
                                            className="flex w-full min-w-0 items-start gap-2"
                                        >
                                            <span className="tabular-nums text-muted-foreground">{line.quantity}×</span>
                                            <span className="min-w-0 flex-1 wrap-break-word text-[13px] font-normal leading-snug text-foreground">
                                                {label}
                                            </span>
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
