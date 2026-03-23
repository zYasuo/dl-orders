import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrencyBRL } from '@/lib/utils';
import type { Product } from '@/types/product';

export function ProductCard({ product }: { product: Product }) {
    return (
        <Link href={`/products/${product.id}`} className="group block">
            <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative aspect-4/3 w-full overflow-hidden bg-muted">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center text-sm text-muted-foreground">No image</div>
                    )}
                </div>
                <CardContent className="p-4">
                    <h2 className="font-semibold text-foreground group-hover:text-primary">{product.name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
                    <p className="mt-2 text-lg font-medium text-foreground">{formatCurrencyBRL(product.price)}</p>
                </CardContent>
            </Card>
        </Link>
    );
}
