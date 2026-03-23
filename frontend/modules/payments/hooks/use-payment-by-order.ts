'use client';

import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { getPaymentByOrderService } from '@/services/payments.service';

export function usePaymentByOrder(orderId: string | undefined, enabled: boolean) {
    return useQuery({
        queryKey: orderId ? queryKeys.payments.byOrder(orderId) : ['payments', 'disabled'],
        queryFn: () => getPaymentByOrderService(orderId!),
        enabled: Boolean(orderId) && enabled,
        retry: 1,
    });
}
