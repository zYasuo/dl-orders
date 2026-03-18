export interface ICreateInventory {
    productId: string;
    name: string;
    quantity: number;
    maxQuantity: number;
    minQuantity: number;
    lowStockThreshold: number;
}
