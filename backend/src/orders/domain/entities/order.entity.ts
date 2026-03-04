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
    status: OrderStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;
};

export class Order {
    constructor(private params: TOrderParams) {}

    static create(params: { productId: string; quantity: number; description: string }): Order {
        const now = new Date();
        return new Order({
            id: crypto.randomUUID(),
            productId: params.productId,
            quantity: params.quantity,
            description: params.description,
            status: OrderStatus.PENDING,
            createdAt: now,
            updatedAt: now,
        });
    }

    get id(): string {
        return this.params.id;
    }

    get productId(): string {
        return this.params.productId;
    }

    get quantity(): number {
        return this.params.quantity;
    }

    get description(): string {
        return this.params.description;
    }

    get status(): OrderStatus {
        return this.params.status;
    }

    get createdAt(): Date {
        return this.params.createdAt;
    }

    get updatedAt(): Date {
        return this.params.updatedAt;
    }
}
