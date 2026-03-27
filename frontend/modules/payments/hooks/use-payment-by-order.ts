'use client';

import { useQuery } from '@tanstack/react-query';
import { paymentKeys } from '@/modules/payments/query-keys';
import { getPaymentByOrder } from '@/modules/payments/api';

export function usePaymentByOrder(orderId: string | undefined, enabled: boolean) {
    return useQuery({
        queryKey: orderId ? paymentKeys.byOrder(orderId) : ['payments', 'disabled'],
        queryFn: () => getPaymentByOrder(orderId!),
        enabled: Boolean(orderId) && enabled,
        retry: 1,
    });
}
