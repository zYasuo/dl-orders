export const queryKeys = {
    products: {
        all: ['products'] as const,
        list: (page?: number, limit?: number) =>
            [...queryKeys.products.all, 'list', { page: page ?? 1, limit: limit ?? 12 }] as const,
        detail: (id: string) => [...queryKeys.products.all, 'detail', id] as const,
    },
    orders: {
        all: ['orders'] as const,
        detail: (id: string) => [...queryKeys.orders.all, 'detail', id] as const,
    },
    payments: {
        byOrder: (orderId: string) => ['payments', 'order', orderId] as const,
    },
    users: {
        me: ['users', 'me'] as const,
    },
};
