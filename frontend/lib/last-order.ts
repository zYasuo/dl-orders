const KEY = 'dl_orders_last_order_id';

export function saveLastOrderId(orderId: string) {
    if (typeof window === 'undefined') {
        return;
    }
    try {
        sessionStorage.setItem(KEY, orderId);
    } catch {}
}

export function readLastOrderId(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }
    try {
        return sessionStorage.getItem(KEY);
    } catch {
        return null;
    }
}
