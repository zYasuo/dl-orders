export enum OrderStatus {
    PENDING = 'PENDING',
    CONFIRMED = 'CONFIRMED',
    CANCELLED = 'CANCELLED',
}

export type TOrderParams = {
    readonly id: string;
    readonly productId: string;
    readonly quantity: number;
    readonly description: string;
    readonly recipient: string;
    status: OrderStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;
};

export class Order {
    constructor(private params: TOrderParams) {}

    static create(params: { productId: string; quantity: number; description: string; recipient: string }): Order {
        const now = new Date();
        return new Order({
            id: crypto.randomUUID(),
            productId: params.productId,
            quantity: params.quantity,
            description: params.description,
            recipient: params.recipient,
            status: OrderStatus.PENDING,
            createdAt: now,
            updatedAt: now,
        });
    }

    get id() { return this.params.id; }
    get productId() { return this.params.productId; }
    get quantity() { return this.params.quantity; }
    get description() { return this.params.description; }
    get recipient() { return this.params.recipient; }
    get status() { return this.params.status; }
    get createdAt() { return this.params.createdAt; }
    get updatedAt() { return this.params.updatedAt; }
}
