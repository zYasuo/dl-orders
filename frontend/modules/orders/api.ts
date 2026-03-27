import { bffJson, bffPaginatedJson } from '@/lib/http/bff-client';
import { normalizeOrder } from '@/types/order';
import type { Order } from '@/types/order';

export type CreateOrderInput = {
    productId: string;
    quantity: number;
    description: string;
    recipient: string;
    idempotencyKey: string;
};

export async function createOrder(input: CreateOrderInput) {
    const raw = await bffJson<unknown>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(input),
        idempotencyKey: input.idempotencyKey,
    });
    return normalizeOrder(raw);
}

export async function getOrder(id: string) {
    const raw = await bffJson<unknown>(`/api/orders/${id}`);
    return normalizeOrder(raw);
}

export async function listOrders(page = 1, limit = 12) {
    const { data, meta } = await bffPaginatedJson<unknown>(`/api/orders?page=${page}&limit=${limit}`);
    const orders: Order[] = data.map((raw) => normalizeOrder(raw));
    return { orders, meta };
}
