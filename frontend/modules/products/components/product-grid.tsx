import { ProductCard } from '@/modules/products/components/product-card';
import type { Product } from '@/types/product';

export function ProductGrid({ products }: { products: Product[] }) {
    return (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
                <li key={p.id}>
                    <ProductCard product={p} />
                </li>
            ))}
        </ul>
    );
}
