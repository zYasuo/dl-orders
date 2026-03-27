import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { getStockUiState } from '@/modules/products/lib/stock-status';
import { cn, formatCurrencyBRL } from '@/lib/utils';
import type { Product } from '@/types/product';
import { OutOfStockRibbon, StockUnverifiedHint } from '@/modules/products/components/out-of-stock-ribbon';

export function ProductCard({ product }: { product: Product }) {
    const stockState = getStockUiState(product);
    const isOutOfStock = stockState === 'out_of_stock';

    return (
        <Link
            href={`/products/${product.id}`}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
            <Card
                className={cn(
                    'h-full overflow-hidden border-black/6 shadow-none transition-[box-shadow,opacity] duration-200 hover:shadow-sm',
                    isOutOfStock && 'opacity-[0.92]',
                )}
            >
                <div className="relative h-28 w-full overflow-hidden bg-muted sm:h-32">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className={cn(
                                'h-full w-full object-cover transition-[filter,opacity] duration-200',
                                isOutOfStock && 'opacity-50 grayscale',
                            )}
                        />
                    ) : (
                        <div
                            className={cn(
                                'flex h-full items-center justify-center px-2 text-center text-[11px] text-muted-foreground/55',
                                isOutOfStock && 'opacity-50',
                            )}
                        >
                            No photo
                        </div>
                    )}
                    {isOutOfStock ? <OutOfStockRibbon variant="overlay" /> : null}
                </div>
                <CardContent className={cn('p-2.5 sm:p-3', isOutOfStock && 'opacity-90')}>
                    <h2
                        className={cn(
                            'line-clamp-2 text-[13px] font-medium leading-snug group-hover:underline',
                            isOutOfStock ? 'text-muted-foreground' : 'text-foreground',
                        )}
                    >
                        {product.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.description}</p>
                    <p
                        className={cn(
                            'mt-2 text-sm font-semibold tabular-nums',
                            isOutOfStock ? 'text-muted-foreground' : 'text-foreground',
                        )}
                    >
                        {formatCurrencyBRL(product.price)}
                    </p>
                    {stockState === 'purchasable' ? (
                        <p className="mt-1.5 text-xs text-muted-foreground">
                            {product.lastUnits ? 'Low stock' : 'In stock'}
                            {typeof product.stockQuantity === 'number' ? ` · ${product.stockQuantity}` : null}
                        </p>
                    ) : stockState === 'out_of_stock' ? (
                        <p className="mt-1.5 text-xs text-muted-foreground">Unavailable for purchase.</p>
                    ) : (
                        <StockUnverifiedHint className="mt-1.5" />
                    )}
                </CardContent>
            </Card>
        </Link>
    );
}
