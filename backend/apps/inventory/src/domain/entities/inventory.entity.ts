import { DomainError, Email, Quantity } from '@app/shared/domain';

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
    if (!params.productId) {
      throw new DomainError('productId is required');
    }

    if (!params.name) {
      throw new DomainError('name is required');
    }

    Email.create(params.createdBy);

    Quantity.create(params.quantity);
    Quantity.create(params.maxQuantity);
    Quantity.create(params.minQuantity);
    Quantity.create(params.lowStockThreshold);

    if (params.minQuantity >= params.maxQuantity) {
      throw new DomainError('minQuantity must be less than maxQuantity');
    }

    if (params.lowStockThreshold > params.minQuantity) {
      throw new DomainError('lowStockThreshold must be less than or equal to minQuantity');
    }

    if (params.quantity > params.maxQuantity) {
      throw new DomainError('quantity must be less than or equal to maxQuantity');
    }

    const now = new Date();

    return new InventoryEntity(
      params.id,
      params.name,
      params.quantity,
      params.maxQuantity,
      params.minQuantity,
      params.lowStockThreshold,
      params.productId,
      params.createdBy,
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
