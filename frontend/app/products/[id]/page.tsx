import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ProductDescription } from '@/modules/products/components/product-description';
import { ProductPurchaseActions } from '@/modules/products/components/product-purchase-actions';
import { fetchProductById } from '@/lib/product-catalog';
import { cn } from '@/lib/utils';
import { formatCurrencyBRL } from '@/lib/utils';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await fetchProductById(id);
    if (!product) {
        return { title: 'Product not found' };
    }
    const shortName = product.name.length > 58 ? `${product.name.slice(0, 57)}…` : product.name;
    return {
        title: `${shortName} · dl-orders`,
        description: product.description.slice(0, 160),
    };
}

export default async function ProductDetailPage({ params }: Props) {
    const { id } = await params;
    const product = await fetchProductById(id);
    if (!product) {
        notFound();
    }

    return (
        <div className="flex flex-col gap-10 lg:gap-14">
            <nav aria-label="Breadcrumb" className="text-[13px] text-muted-foreground">
                <ol className="flex flex-wrap items-center gap-x-1 gap-y-1">
                    <li>
                        <Link
                            href="/products"
                            className="transition-colors duration-200 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                            Catalog
                        </Link>
                    </li>
                    <li aria-hidden className="select-none text-muted-foreground/60">
                        /
                    </li>
                    <li className="max-w-full min-w-0 wrap-break-word text-foreground/80 line-clamp-2 sm:max-w-[min(100%,42rem)]">
                        {product.name}
                    </li>
                </ol>
            </nav>
            <div className="grid gap-12 lg:grid-cols-[minmax(0,38rem)_minmax(0,1fr)] lg:items-start lg:gap-16 xl:gap-20">
                <figure
                    className={cn(
                        'mx-auto w-full max-w-lg lg:mx-0',
                        product.inStock === false && 'opacity-[0.92]',
                    )}
                >
                    <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl bg-muted">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className={cn(
                                    'h-full w-full object-cover',
                                    product.inStock === false && 'opacity-50 grayscale',
                                )}
                            />
                        ) : (
                            <div
                                className={cn(
                                    'flex h-full items-center justify-center px-8 text-center text-[13px] text-muted-foreground/55',
                                    product.inStock === false && 'opacity-60',
                                )}
                            >
                                No photo
                            </div>
                        )}
                        {product.inStock === false ? (
                            <span
                                role="status"
                                className="pointer-events-none absolute bottom-4 left-1/2 z-10 w-max max-w-[calc(100%-2rem)] -translate-x-1/2 rounded-full bg-background/85 px-3.5 py-1.5 text-center text-[12px] font-medium text-muted-foreground shadow-sm ring-1 ring-black/6 backdrop-blur-sm"
                            >
                                Out of stock
                            </span>
                        ) : null}
                    </div>
                </figure>
                <div className="flex min-w-0 flex-col gap-8 lg:max-w-xl lg:pt-2">
                    <div className="min-w-0 space-y-4">
                        <h1 className="wrap-break-word text-xl font-semibold leading-snug tracking-tight text-foreground sm:text-2xl">
                            {product.name}
                        </h1>
                        <p className="text-lg font-medium tabular-nums tracking-tight text-foreground sm:text-xl">{formatCurrencyBRL(product.price)}</p>
                        {product.inStock === true ? (
                            <p
                                className={cn(
                                    'max-w-prose text-[15px] leading-relaxed text-muted-foreground',
                                    product.lastUnits && 'text-foreground/75',
                                )}
                            >
                                {product.lastUnits ? 'Limited quantity.' : 'Ships when available.'}
                                {typeof product.stockQuantity === 'number' ? ` ${product.stockQuantity} in stock.` : null}
                            </p>
                        ) : product.inStock === false ? (
                            <p className="max-w-prose text-[15px] leading-relaxed text-muted-foreground">
                                This product is currently unavailable.
                            </p>
                        ) : (
                            <p className="max-w-prose text-[15px] leading-relaxed text-muted-foreground">
                                Live stock could not be loaded. You can still try to order — availability is confirmed when the order is placed.
                            </p>
                        )}
                    </div>
                    <ProductPurchaseActions productId={product.id} inStock={product.inStock} stockQuantity={product.stockQuantity} />
                    <section aria-labelledby="product-desc-heading" className="min-w-0 border-t border-black/6 pt-10">
                        <h2 id="product-desc-heading" className="mb-4 text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">
                            Overview
                        </h2>
                        <ProductDescription text={product.description} />
                    </section>
                </div>
            </div>
        </div>
    );
}
