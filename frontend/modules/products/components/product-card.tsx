import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrencyBRL } from '@/lib/utils';
import type { Product } from '@/types/product';

export function ProductCard({ product }: { product: Product }) {
    return (
        <Link
            href={`/products/${product.id}`}
            className="group block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
            <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                <div className="relative h-28 w-full overflow-hidden bg-muted sm:h-32">
                    {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
                            Sem imagem
                        </div>
                    )}
                </div>
                <CardContent className="p-2.5 sm:p-3">
                    <h2 className="line-clamp-2 text-sm font-medium leading-snug text-foreground group-hover:underline">
                        {product.name}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{product.description}</p>
                    <p className="mt-2 text-sm font-semibold tabular-nums text-foreground">{formatCurrencyBRL(product.price)}</p>
                </CardContent>
            </Card>
        </Link>
    );
}
