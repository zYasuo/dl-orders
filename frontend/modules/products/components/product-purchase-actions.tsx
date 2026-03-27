'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Field } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { addToCart } from '@/lib/cart-storage';
import { cn } from '@/lib/utils';

type Props = {
    productId: string;
    inStock: boolean | undefined;
    stockQuantity?: number;
};

export function ProductPurchaseActions({ productId, inStock, stockQuantity }: Props) {
    const { toast } = useToast();
    const outOfStock = inStock === false;

    const maxQty = useMemo(() => {
        if (outOfStock) {
            return null;
        }
        if (inStock === true && typeof stockQuantity === 'number' && stockQuantity > 0) {
            return stockQuantity;
        }
        return null;
    }, [inStock, outOfStock, stockQuantity]);

    const [quantity, setQuantity] = useState(1);

    const clampedQty = useMemo(() => {
        let q = quantity;
        if (q < 1) {
            q = 1;
        }
        if (maxQty !== null && q > maxQty) {
            q = maxQty;
        }
        return q;
    }, [quantity, maxQty]);

    function handleQtyChange(raw: string) {
        const n = Number.parseInt(raw, 10);
        if (Number.isNaN(n)) {
            setQuantity(1);
            return;
        }
        setQuantity(n);
    }

    const buyHref = `/checkout?productId=${encodeURIComponent(productId)}&quantity=${encodeURIComponent(String(clampedQty))}`;

    function handleAddToCart() {
        if (outOfStock) {
            return;
        }
        addToCart(productId, clampedQty);
        toast({ message: 'Added to cart.', variant: 'success' });
        window.dispatchEvent(new Event('dl-orders-cart'));
    }

    if (outOfStock) {
        return (
            <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
                <Button size="lg" className="w-full min-w-40 sm:w-auto" disabled>
                    Unavailable
                </Button>
                <Link
                    href="/products"
                    className="text-center text-[13px] text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-foreground sm:text-left"
                >
                    Back to catalog
                </Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <Field
                label="Quantity"
                htmlFor="pdp-quantity"
                className="max-w-34 [&_label]:text-[11px] [&_label]:font-medium [&_label]:uppercase [&_label]:tracking-[0.06em] [&_label]:text-muted-foreground"
            >
                <Input
                    id="pdp-quantity"
                    type="number"
                    min={1}
                    max={maxQty ?? undefined}
                    className="rounded-xl border-black/8 bg-card"
                    value={clampedQty}
                    onChange={(e) => handleQtyChange(e.target.value)}
                />
            </Field>
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link href={buyHref} className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full min-w-40 sm:w-auto')}>
                    Buy now
                </Link>
                <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="w-full min-w-40 border-black/12 sm:w-auto"
                    onClick={handleAddToCart}
                >
                    Add to cart
                </Button>
                <Link
                    href="/products"
                    className={cn(
                        'text-center text-[13px] text-muted-foreground underline-offset-4 transition-colors duration-200 hover:text-foreground sm:text-left sm:pl-2',
                    )}
                >
                    Back to catalog
                </Link>
            </div>
        </div>
    );
}
