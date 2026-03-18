export interface IInventoryParams {
    readonly id: string;
    name: string;
    quantity: number;
    maxQuantity: number;
    minQuantity: number;
    lowStockThreshold: number;
    readonly productId: string;
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
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static create(params: IInventoryParams): InventoryEntity {
        const now = new Date();
        return new InventoryEntity(
            params.id,
            params.name,
            params.quantity,
            params.maxQuantity,
            params.minQuantity,
            params.lowStockThreshold,
            params.productId,
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
