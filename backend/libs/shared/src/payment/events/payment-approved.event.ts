export interface PaymentApprovedEvent {
    orderId: string;
    paymentId: string;
    amount: number;
    paidAt: string;
}
