export type PaymentStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'REFUNDED';

export type PaymentByOrder = {
    paymentId: string;
    orderId: string;
    status: PaymentStatus;
    amount: number;
    initPoint: string | null;
};
