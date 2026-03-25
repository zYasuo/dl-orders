export function productCacheKey(productId: string): string {
  return `products:${productId}`;
}
