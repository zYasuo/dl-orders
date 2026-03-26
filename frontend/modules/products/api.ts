import { bffJson } from '@/lib/api-client';
import type { Product } from '@/types/product';

export async function getProducts() {
    return bffJson<Product[]>('/api/products');
}

export async function getProductById(id: string) {
    return bffJson<Product>(`/api/products/${id}`);
}
