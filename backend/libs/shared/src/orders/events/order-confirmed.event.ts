export interface IOrderConfirmedEvent {
    orderId: string;
    productId: string;
    productName: string;
    productDescription: string;
    totalPrice: number;
    userId: string;
    quantity: number;
    recipientEmail: string;
    confirmedAt: string;
}
