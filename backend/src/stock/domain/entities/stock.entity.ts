export interface IStockParams {
    id: string;
    name: string;
    quantity: number;
    productId: string;
    createdAt: Date;
    updatedAt: Date;
}

export class Stock {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly quantity: number,
        public readonly productId: string,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static create(params: IStockParams): Stock {
        const now = new Date();

        return new Stock(params.id, params.name, params.quantity, params.productId, now, now);
    }
}
