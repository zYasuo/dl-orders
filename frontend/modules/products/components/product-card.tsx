import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { cn, formatCurrencyBRL } from '@/lib/utils';
import type { Product } from '@/types/product';

export function ProductCard({ product }: { product: Product }) {
    const outOfStock = product.inStock === false;

    return (
        <Link
            href={`/products/${product.id}`}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
            <Card
                className={cn(
                    'h-full overflow-hidden border-black/6 shadow-none transition-[box-shadow,opacity] duration-200 hover:shadow-sm',
                    outOfStock && 'opacity-[0.92]',
                )}
            >
                <div className="relative h-28 w-full overflow-hidden bg-muted sm:h-32">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={cn(
                                'h-full w-full object-cover transition-[filter,opacity] duration-200',
                                outOfStock && 'opacity-50 grayscale',
                            )}
                        />
                    ) : (
                        <div
                            className={cn(
                                'flex h-full items-center justify-center px-2 text-center text-[11px] text-muted-foreground/55',
                                outOfStock && 'opacity-50',
                            )}
                        >
                            No photo
                        </div>
                    )}
                    {outOfStock ? (
                        <div
                            className="pointer-events-none absolute bottom-2 left-1/2 z-10 w-max max-w-[calc(100%-1rem)] -translate-x-1/2 rounded-full bg-background/90 px-2.5 py-1 text-center text-[11px] font-medium text-muted-foreground ring-1 ring-black/6 backdrop-blur-sm"
                            aria-hidden
                        >
                            Out of stock
                        </div>
                    ) : null}
                </div>
                <CardContent className={cn('p-2.5 sm:p-3', outOfStock && 'opacity-90')}>
                    <h2
                        className={cn(
                            'line-clamp-2 text-[13px] font-medium leading-snug group-hover:underline',
                            outOfStock ? 'text-muted-foreground' : 'text-foreground',
                        )}
                    >
                        {product.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.description}</p>
                    <p
                        className={cn(
                            'mt-2 text-sm font-semibold tabular-nums',
                            outOfStock ? 'text-muted-foreground' : 'text-foreground',
                        )}
                    >
                        {formatCurrencyBRL(product.price)}
                    </p>
                    {product.inStock === true ? (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            {product.lastUnits ? 'Low stock' : 'In stock'}
                            {typeof product.stockQuantity === 'number' ? ` · ${product.stockQuantity}` : null}
                        </p>
                    ) : product.inStock === false ? (
                        <p className="mt-1.5 text-xs text-muted-foreground">Out of stock</p>
                    ) : (
                        <p className="mt-1.5 text-xs text-muted-foreground">Stock unavailable — you can still open the product.</p>
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
