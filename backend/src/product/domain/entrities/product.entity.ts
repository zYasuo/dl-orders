export interface IProduct {
    readonly id: string;
    name: string;
    description: string;
    price: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export class Product implements IProduct {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly description: string,
        public readonly price: number,
        public readonly createdAt: Date,
        public readonly updatedAt: Date,
    ) {}

    static create(params: { name: string; description: string; price: number }): Product {
        const now = new Date();
        return new Product(crypto.randomUUID(), params.name, params.description, params.price, now, now);
    }
}
