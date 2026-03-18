export interface ICreateOrder {
  productId: string;
  quantity: number;
  description: string;
  recipient: string;
  productName: string;
  productDescription: string;
  idempotencyKey: string;
  unitPrice: number;
  totalPrice: number;
}
