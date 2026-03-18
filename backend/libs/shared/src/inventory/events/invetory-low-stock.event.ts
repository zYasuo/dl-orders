export interface IInventoryLowStockEvent {
  id: string;
  name: string;
  productId: string;
  quantity: number;
  createdBy: string;
}
