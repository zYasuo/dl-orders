export interface IOrderDetails {
  orderId: string;
  totalPrice: number;
  idempotencyKey?: string | null;
}

export abstract class IOrderDetailsPort {
  abstract getByOrderId(orderId: string): Promise<IOrderDetails | null>;
}
