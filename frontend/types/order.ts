export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

export type Order = {
    id: string;
    sequenceId?: number;
    productId: string;
    quantity: number;
    description: string;
    recipient: string;
    productName: string;
    productDescription: string;
    idempotencyKey: string;
    unitPrice: number;
    totalPrice: number;
    status: OrderStatus;
    createdAt: string;
    updatedAt: string;
};

export function normalizeOrder(raw: unknown): Order {
    if (raw && typeof raw === 'object' && 'success' in raw && 'data' in raw) {
        const data = (raw as { data: unknown }).data;
        if (data && typeof data === 'object') {
            return data as Order;
        }
    }
    if (raw && typeof raw === 'object' && 'params' in raw) {
        const p = (raw as { params: unknown }).params;
        if (p && typeof p === 'object') {
            return p as Order;
        }
    }
    return raw as Order;
}
