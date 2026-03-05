export interface InventoryReservationFailedEvent {
    orderId: string;
    productId: string;
    quantity: number;
    reason: string;
}
