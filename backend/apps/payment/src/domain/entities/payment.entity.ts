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
    readonly idempotencyKey: string | null;
    readonly externalId: string | null;
    readonly preferenceId: string | null;
    readonly amount: number;
    status: PaymentStatus;
    readonly gatewayResponse: Record<string, unknown> | null;
    readonly createdAt: Date;
    readonly updatedAt: Date;
}

export class PaymentEntity {
    constructor(private params: IPaymentParams) {}

    static create(params: {
        orderId: string;
        amount: number;
        idempotencyKey?: string | null;
        preferenceId?: string | null;
        externalId?: string | null;
    }): PaymentEntity {
        const now = new Date();
        return new PaymentEntity({
            id: crypto.randomUUID(),
            orderId: params.orderId,
            amount: params.amount,
            idempotencyKey: params.idempotencyKey ?? null,
            preferenceId: params.preferenceId ?? null,
            externalId: params.externalId ?? null,
            status: PaymentStatus.PENDING,
            gatewayResponse: null,
            createdAt: now,
            updatedAt: now,
        });
    }

    get id() {
        return this.params.id;
    }

    get orderId() {
        return this.params.orderId;
    }

    get idempotencyKey() {
        return this.params.idempotencyKey;
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

    isPending(): boolean {
        return this.params.status === PaymentStatus.PENDING;
    }

    isApproved(): boolean {
        return this.params.status === PaymentStatus.APPROVED;
    }

    isRejected(): boolean {
        return this.params.status === PaymentStatus.REJECTED;
    }

    matchesAmount(receivedAmount: number, tolerance = 0.01): boolean {
        return Math.abs(Number(receivedAmount) - this.params.amount) <= tolerance;
    }

    getInitPoint(): string | null {
        const gr = this.params.gatewayResponse;
        if (!gr || typeof gr !== 'object') return null;
        const initPoint = (gr as Record<string, unknown>).initPoint;
        return typeof initPoint === 'string' ? initPoint : null;
    }
}
