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
    readonly productName: string;
    readonly productDescription: string;
    readonly unitPrice: number;
    readonly totalPrice: number;
    status: OrderStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;
};

export class Order {
    constructor(private params: TOrderParams) {}

    static create(params: {
        productId: string;
        quantity: number;
        description: string;
        recipient: string;
        productName: string;
        productDescription: string;
        unitPrice: number;
        totalPrice: number;
    }): Order {
        const now = new Date();
        return new Order({
            id: crypto.randomUUID(),
            productId: params.productId,
            quantity: params.quantity,
            description: params.description,
            recipient: params.recipient,
            productName: params.productName,
            productDescription: params.productDescription,
            unitPrice: params.unitPrice,
            totalPrice: params.totalPrice,
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
    get productName() { return this.params.productName; }
    get productDescription() { return this.params.productDescription; }
    get unitPrice() { return this.params.unitPrice; }
    get totalPrice() { return this.params.totalPrice; }
    get status() { return this.params.status; }
    get createdAt() { return this.params.createdAt; }
    get updatedAt() { return this.params.updatedAt; }
}
