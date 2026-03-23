import { ProductCard } from '@/modules/products/components/product-card';
import type { Product } from '@/types/product';

export function ProductGrid({ products }: { products: Product[] }) {
    return (
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
                <li key={p.id}>
                    <ProductCard product={p} />
                </li>
            ))}
        </ul>
    );
}
