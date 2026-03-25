export function orderCacheKey(orderId: string): string {
  return `orders:${orderId}`;
}
