'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getOrder } from '@/modules/orders/api';
import type { OrderStatus } from '@/types/order';

export function useOrder(orderId: string, options?: { pollWhilePending?: boolean }) {
    const poll = options?.pollWhilePending ?? false;
    return useQuery({
        queryKey: queryKeys.orders.detail(orderId),
        queryFn: () => getOrder(orderId),
        enabled: Boolean(orderId),
        refetchInterval: (q) => {
            if (!poll) {
                return false;
            }
            const s = q.state.data?.status as OrderStatus | undefined;
            if (s === 'PENDING') {
                return 3000;
            }
            return false;
        },
    });
}
