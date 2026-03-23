import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ProductDescription } from '@/modules/products/components/product-description';
import { fetchProductById } from '@/lib/product-catalog';
import { formatCurrencyBRL } from '@/lib/utils';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await fetchProductById(id);
    if (!product) {
        return { title: 'Produto não encontrado' };
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
        <div className="flex flex-col gap-8">
            <nav aria-label="Navegação hierárquica" className="text-sm text-muted-foreground">
                <ol className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                    <li>
                        <Link href="/products" className="underline-offset-4 hover:text-foreground hover:underline">
                            Catálogo
                        </Link>
                    </li>
                    <li aria-hidden className="select-none text-muted-foreground/70">
                        /
                    </li>
                    <li className="max-w-full min-w-0 wrap-break-word font-medium text-foreground line-clamp-2 sm:max-w-[min(100%,42rem)]">
                        {product.name}
                    </li>
                </ol>
            </nav>
            <div className="grid gap-8 lg:grid-cols-[minmax(0,min(100%,22rem))_minmax(0,1fr)] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,min(100%,26rem))_minmax(0,1fr)]">
                <Card className="mx-auto w-full max-w-xs overflow-hidden sm:max-w-sm lg:mx-0 lg:max-w-md">
                    <div className="relative aspect-square w-full overflow-hidden bg-muted">
                        {product.imageUrl ? (
                            <img
                                src={product.imageUrl}
                                alt={product.name}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
                                Sem imagem
                            </div>
                        )}
                    </div>
                </Card>
                <div className="flex min-w-0 flex-col gap-5">
                    <div className="min-w-0 space-y-2">
                        <h1 className="text-lg font-semibold leading-snug tracking-tight text-foreground wrap-break-word sm:text-xl lg:text-2xl">
                            {product.name}
                        </h1>
                        <p className="text-base font-semibold tabular-nums text-foreground sm:text-lg">{formatCurrencyBRL(product.price)}</p>
                    </div>
                    <section aria-labelledby="product-desc-heading" className="min-w-0">
                        <h2 id="product-desc-heading" className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Descrição
                        </h2>
                        <ProductDescription text={product.description} />
                    </section>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                        <Link href={`/checkout?productId=${encodeURIComponent(product.id)}`} className="sm:inline-flex">
                            <Button size="lg" className="w-full sm:w-auto">
                                Comprar
                            </Button>
                        </Link>
                        <Link
                            href="/products"
                            className="text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline sm:text-left"
                        >
                            Voltar ao catálogo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
