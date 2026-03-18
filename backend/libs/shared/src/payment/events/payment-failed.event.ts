export interface PaymentFailedEvent {
  orderId: string;
  paymentId: string;
  reason: string;
}
