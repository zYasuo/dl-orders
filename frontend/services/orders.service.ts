import { bffJson } from '@/lib/api-client';
import { normalizeOrder } from '@/types/order';

export type CreateOrderInput = {
    productId: string;
    quantity: number;
    description: string;
    recipient: string;
    idempotencyKey: string;
};

export async function createOrderService(input: CreateOrderInput) {
    const raw = await bffJson<unknown>('/api/orders', {
        method: 'POST',
        body: JSON.stringify(input),
        idempotencyKey: input.idempotencyKey,
    });
    return normalizeOrder(raw);
}

export async function getOrderService(id: string) {
    const raw = await bffJson<unknown>(`/api/orders/${id}`);
    return normalizeOrder(raw);
}
