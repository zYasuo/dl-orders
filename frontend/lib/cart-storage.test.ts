import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
    readCart,
    addToCart,
    clearCartStorage,
    CART_STORAGE_KEY,
    CART_TTL_MS,
} from '@/lib/cart-storage';

function installWindowStorage() {
    const store: Record<string, string> = {};
    const ls = {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => {
            store[k] = v;
        },
        removeItem: (k: string) => {
            delete store[k];
        },
    };
    vi.stubGlobal('localStorage', ls as Storage);
    vi.stubGlobal('window', {
        localStorage: ls,
        dispatchEvent: vi.fn(),
    });
}

describe('cart-storage', () => {
    beforeEach(() => {
        vi.unstubAllGlobals();
        installWindowStorage();
    });

    it('returns empty when nothing stored', () => {
        expect(readCart().kind).toBe('empty');
    });

    it('expires and clears when past expiresAt', () => {
        const past = new Date(Date.now() - 1000).toISOString();
        localStorage.setItem(
            CART_STORAGE_KEY,
            JSON.stringify({
                version: 1,
                items: [{ productId: 'p1', quantity: 2 }],
                expiresAt: past,
            }),
        );
        const r = readCart();
        expect(r.kind).toBe('expired');
        expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
    });

    it('merges quantities for same productId', () => {
        addToCart('a', 2);
        addToCart('a', 3);
        const r = readCart();
        expect(r.kind).toBe('ok');
        if (r.kind === 'ok') {
            expect(r.items).toEqual([{ productId: 'a', quantity: 5 }]);
        }
    });

    it('refresh writes new expiresAt within TTL window', () => {
        addToCart('x', 1);
        const raw = localStorage.getItem(CART_STORAGE_KEY);
        expect(raw).toBeTruthy();
        const parsed = JSON.parse(raw!) as { expiresAt: string };
        const exp = new Date(parsed.expiresAt).getTime();
        expect(exp - Date.now()).toBeLessThanOrEqual(CART_TTL_MS + 2000);
        expect(exp - Date.now()).toBeGreaterThan(CART_TTL_MS - 60_000);
    });

    it('clearCartStorage removes key', () => {
        addToCart('y', 1);
        clearCartStorage();
        expect(localStorage.getItem(CART_STORAGE_KEY)).toBeNull();
    });
});
