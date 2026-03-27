'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { listOrders } from '@/modules/orders/api';

export function useOrdersList(page: number, limit: number, enabled = true) {
    return useQuery({
        queryKey: queryKeys.orders.list(page, limit),
        queryFn: () => listOrders(page, limit),
        staleTime: 30_000,
        enabled,
    });
}
