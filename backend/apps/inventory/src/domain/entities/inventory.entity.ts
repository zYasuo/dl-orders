export interface IInventoryParams {
    readonly id: string;
    name: string;
    quantity: number;
    readonly productId: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export class Inventory {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly quantity: number,
        public readonly productId: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static create(params: IInventoryParams): Inventory {
        const now = new Date();
        return new Inventory(params.id, params.name, params.quantity, params.productId, now, now);
    }
}
