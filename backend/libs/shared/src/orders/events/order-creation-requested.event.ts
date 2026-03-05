export interface OrderCreationRequestedEvent {
    orderId: string;
    productId: string;
    quantity: number;
    description: string;
    recipient: string;
}
