'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-keys';
import { saveLastOrderId } from '@/lib/last-order';
import { createOrderService, type CreateOrderInput } from '@/services/orders.service';

export function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateOrderInput) => createOrderService(input),
        onSuccess: (order) => {
            saveLastOrderId(order.id);
            void queryClient.invalidateQueries({ queryKey: queryKeys.orders.detail(order.id) });
        },
    });
}
