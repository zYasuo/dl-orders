export enum PaymentStatus {
    PENDING = 'PENDING',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED',
    CANCELLED = 'CANCELLED',
    REFUNDED = 'REFUNDED',
}

export interface IPaymentParams {
    readonly id: string;
    readonly orderId: string;
    readonly externalId: string | null;
    readonly preferenceId: string | null;
    readonly amount: number;
    status: PaymentStatus;
    readonly gatewayResponse: Record<string, unknown> | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export class Payment {
    constructor(private params: IPaymentParams) {}

    get id() {
        return this.params.id;
    }

    get orderId() {
        return this.params.orderId;
    }

    get externalId() {
        return this.params.externalId;
    }

    get preferenceId() {
        return this.params.preferenceId;
    }

    get amount() {
        return this.params.amount;
    }

    get status() {
        return this.params.status;
    }

    get gatewayResponse() {
        return this.params.gatewayResponse;
    }

    get createdAt() {
        return this.params.createdAt;
    }

    get updatedAt() {
        return this.params.updatedAt;
    }
}
