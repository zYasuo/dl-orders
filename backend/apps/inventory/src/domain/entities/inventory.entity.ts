export interface IInventoryParams {
    readonly id: string;
    name: string;
    quantity: number;
    readonly productId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export class InventoryEntity {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly quantity: number,
        public readonly productId: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static create(params: IInventoryParams): InventoryEntity {
        const now = new Date();
        return new InventoryEntity(params.id, params.name, params.quantity, params.productId, now, now);
    }
}
