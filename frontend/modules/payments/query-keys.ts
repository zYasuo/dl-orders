export const paymentKeys = {
    byOrder: (orderId: string) => ['payments', 'order', orderId] as const,
};
