import { z } from 'zod';

export const CART_TTL_MS = 20 * 60 * 1000;
export const CART_STORAGE_KEY = 'dl-orders.cart';

export const CART_SESSION_STORAGE_KEY = 'dl-orders.cart-session';

const itemSchema = z.object({
    productId: z.string().min(1).max(36),
    quantity: z.number().int().min(1),
});

const rootSchema = z.object({
    version: z.literal(1),
    items: z.array(itemSchema),
    expiresAt: z.string(),
});

export type CartItem = z.infer<typeof itemSchema>;

export type CartReadResult =
    | { kind: 'ok'; items: CartItem[]; expired: false }
    | { kind: 'empty'; items: []; expired: false }
    | { kind: 'expired'; items: []; expired: true }
    | { kind: 'invalid'; items: []; expired: false };

function persist(items: CartItem[]) {
    const expiresAt = new Date(Date.now() + CART_TTL_MS).toISOString();
    const payload = { version: 1 as const, items, expiresAt };
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
    window.dispatchEvent(new Event('dl-orders-cart'));
}

export function getOrCreateCartSessionId(): string {
    let id = localStorage.getItem(CART_SESSION_STORAGE_KEY)?.trim();
    if (!id || id.length < 8) {
        id = crypto.randomUUID();
        localStorage.setItem(CART_SESSION_STORAGE_KEY, id);
    }
    return id;
}

export function readCart(): CartReadResult {
    if (typeof window === 'undefined') {
        return { kind: 'empty', items: [], expired: false };
    }
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) {
        return { kind: 'empty', items: [], expired: false };
    }
    let parsed: unknown;
    try {
        parsed = JSON.parse(raw) as unknown;
    } catch {
        localStorage.removeItem(CART_STORAGE_KEY);
        return { kind: 'invalid', items: [], expired: false };
    }
    const r = rootSchema.safeParse(parsed);
    if (!r.success) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return { kind: 'invalid', items: [], expired: false };
    }
    const expMs = new Date(r.data.expiresAt).getTime();
    if (Number.isNaN(expMs) || Date.now() > expMs) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return { kind: 'expired', items: [], expired: true };
    }
    const items = r.data.items.filter((i) => i.quantity > 0);
    if (items.length === 0) {
        localStorage.removeItem(CART_STORAGE_KEY);
        return { kind: 'empty', items: [], expired: false };
    }
    return { kind: 'ok', items, expired: false };
}

export function getCartItemCount(): number {
    const r = readCart();
    if (r.kind !== 'ok') {
        return 0;
    }
    return r.items.reduce((n, i) => n + i.quantity, 0);
}

export function addToCart(productId: string, quantity: number) {
    if (quantity < 1) {
        return;
    }
    const r = readCart();
    const items: CartItem[] = r.kind === 'ok' ? r.items.map((i) => ({ ...i })) : [];
    const idx = items.findIndex((i) => i.productId === productId);
    if (idx >= 0) {
        const next = items[idx]!.quantity + quantity;
        items[idx] = { productId, quantity: next };
    } else {
        items.push({ productId, quantity });
    }
    persist(items);
}

export function setLineQuantity(productId: string, quantity: number) {
    const r = readCart();
    const items: CartItem[] = r.kind === 'ok' ? r.items.map((i) => ({ ...i })) : [];
    const idx = items.findIndex((i) => i.productId === productId);
    if (quantity < 1) {
        if (idx >= 0) {
            items.splice(idx, 1);
        }
    } else if (idx >= 0) {
        items[idx] = { productId, quantity };
    } else {
        items.push({ productId, quantity });
    }
    if (items.length === 0) {
        clearCartStorage();
        return;
    }
    persist(items);
}

export function removeCartLine(productId: string) {
    const r = readCart();
    if (r.kind !== 'ok') {
        return;
    }
    const items = r.items.filter((i) => i.productId !== productId);
    if (items.length === 0) {
        clearCartStorage();
        return;
    }
    persist(items);
}

export function clearCartStorage() {
    if (typeof window === 'undefined') {
        return;
    }
    localStorage.removeItem(CART_STORAGE_KEY);
    window.dispatchEvent(new Event('dl-orders-cart'));
}
