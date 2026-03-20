export interface IOrderDetails {
  orderId: string;
  totalPrice: number;
  idempotencyKey?: string | null;
}

export abstract class OrderDetailsPort {
  abstract getByOrderId(orderId: string): Promise<IOrderDetails | null>;
}
