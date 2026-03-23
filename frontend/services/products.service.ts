import { bffJson } from '@/lib/api-client';
import type { Product } from '@/types/product';

export async function getProductsService() {
    return bffJson<Product[]>('/api/products');
}

export async function getProductByIdService(id: string) {
    return bffJson<Product>(`/api/products/${id}`);
}
