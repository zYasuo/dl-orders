export interface IInventoryParams {
  readonly id: string;
  name: string;
  quantity: number;
  maxQuantity: number;
  minQuantity: number;
  lowStockThreshold: number;
  readonly productId: string;
  readonly createdBy: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export class InventoryEntity {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly quantity: number,
    public readonly maxQuantity: number,
    public readonly minQuantity: number,
    public readonly lowStockThreshold: number,
    public readonly productId: string,
    public readonly createdBy: string,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  static create(params: IInventoryParams): InventoryEntity {
    const now = new Date();
    const {
      id,
      name,
      quantity,
      maxQuantity,
      minQuantity,
      lowStockThreshold,
      productId,
      createdBy,
    } = params;

    return new InventoryEntity(
      id,
      name,
      quantity,
      maxQuantity,
      minQuantity,
      lowStockThreshold,
      productId,
      createdBy,
      now,
      now,
    );
  }

  isLowStock(): boolean {
    return this.quantity <= this.minQuantity;
  }

  isOverStock(): boolean {
    return this.quantity >= this.maxQuantity;
  }

  isCriticalStock(): boolean {
    return this.quantity <= this.lowStockThreshold;
  }
}
