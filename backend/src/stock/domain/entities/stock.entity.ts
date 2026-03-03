export interface IStockParams {
    id: string;
    name: string;
    price: number;
    quantity: number;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
}

export class Stock {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly price: number,
        public readonly quantity: number,
        public readonly description: string | null,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static create(params: IStockParams): Stock {
        const now = new Date();
        
        return new Stock(params.id, params.name, params.price, params.quantity, params.description, now, now);
    }
}
