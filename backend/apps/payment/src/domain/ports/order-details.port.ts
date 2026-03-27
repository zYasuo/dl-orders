export interface IOrderDetails {
  orderId: string;
  totalPrice: number;
  idempotencyKey?: string | null;
}

export type TGetOrderDetailsOptions = {
  bearerToken: string;
};

export abstract class OrderDetailsPort {
  abstract getByOrderId(
    orderId: string,
    options?: TGetOrderDetailsOptions,
  ): Promise<IOrderDetails | null>;
}
