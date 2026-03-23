import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { fetchProductById } from '@/lib/product-catalog';
import { formatCurrencyBRL } from '@/lib/utils';
import type { Metadata } from 'next';

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await fetchProductById(id);
    if (!product) {
        return { title: 'Product not found' };
    }
    return { title: product.name, description: product.description.slice(0, 160) };
}

export default async function ProductDetailPage({ params }: Props) {
    const { id } = await params;
    const product = await fetchProductById(id);
    if (!product) {
        notFound();
    }

    return (
        <div className="grid gap-8 lg:grid-cols-2">
            <Card className="overflow-hidden">
                <div className="relative aspect-square w-full overflow-hidden bg-muted">
                    {product.imageUrl ? (
                        <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">No image</div>
                    )}
                </div>
            </Card>
            <div className="flex flex-col gap-4">
                <h1 className="text-3xl font-bold">{product.name}</h1>
                <p className="text-2xl font-semibold text-primary">{formatCurrencyBRL(product.price)}</p>
                <Card>
                    <CardContent className="p-6">
                        <p className="whitespace-pre-wrap text-muted-foreground">{product.description}</p>
                    </CardContent>
                </Card>
                <Link href={`/checkout?productId=${encodeURIComponent(product.id)}`}>
                    <Button size="lg" className="w-full sm:w-auto">
                        Buy
                    </Button>
                </Link>
                <Link href="/products" className="text-sm text-primary underline-offset-4 hover:underline">
                    Back to catalog
                </Link>
            </div>
        </div>
    );
}
