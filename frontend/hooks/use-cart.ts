'use client';

import { useCallback, useEffect, useState } from 'react';
import {
    CART_STORAGE_KEY,
    type CartReadResult,
    getCartItemCount,
    readCart,
} from '@/lib/cart-storage';

export function useCart() {
    const [snapshot, setSnapshot] = useState<CartReadResult>(() => ({
        kind: 'empty',
        items: [],
        expired: false,
    }));
    const [count, setCount] = useState(0);

    const refresh = useCallback(() => {
        setSnapshot(readCart());
        setCount(getCartItemCount());
    }, []);

    useEffect(() => {
        queueMicrotask(() => refresh());
        function onStorage(e: StorageEvent) {
            if (e.key === null || e.key === CART_STORAGE_KEY) {
                refresh();
            }
        }
        function onCustom() {
            refresh();
        }
        window.addEventListener('storage', onStorage);
        window.addEventListener('dl-orders-cart', onCustom);
        return () => {
            window.removeEventListener('storage', onStorage);
            window.removeEventListener('dl-orders-cart', onCustom);
        };
    }, [refresh]);

    return { snapshot, count, refresh };
}
