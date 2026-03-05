export interface OrderConfirmedEvent {
    orderId: string;
    productId: string;
    quantity: number;
    description: string;
    recipient: string;
    confirmedAt: string;
}
