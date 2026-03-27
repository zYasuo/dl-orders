'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { orderKeys } from '@/modules/orders/query-keys';
import { saveLastOrderId } from '@/modules/orders/lib/last-order';
import { createOrder, type CreateOrderInput } from '@/modules/orders/api';

export function useCreateOrder() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (input: CreateOrderInput) => createOrder(input),
        onSuccess: (order) => {
            saveLastOrderId(order.id);
            void queryClient.invalidateQueries({ queryKey: orderKeys.detail(order.id) });
            void queryClient.invalidateQueries({ queryKey: orderKeys.all });
        },
    });
}
