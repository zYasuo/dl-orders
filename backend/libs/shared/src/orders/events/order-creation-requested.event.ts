export interface IOrderCreationRequestedEvent {
  orderId: string;
  productId: string;
  productName: string;
  productDescription: string;
  idempotencyKey: string;
  totalPrice: number;
  userId: string;
  quantity: number;
  recipientEmail: string;
}
