import { Payment, PaymentStatus } from '../../src/domain/entities/payment.entity';
import { IPaymentRepositoryPort } from '../../src/domain/ports/payment-repository.port';
import { ICreatePayment, IUpdatePaymentStatus } from '../../src/domain/types/payment-repository.types';

type StoredPayment = {
    id: string;
    orderId: string;
    externalId: string | null;
    preferenceId: string | null;
    amount: number;
    status: string;
    gatewayResponse: Record<string, unknown> | null;
    createdAt: Date;
    updatedAt: Date;
};

export class InMemoryPaymentRepository extends IPaymentRepositoryPort {
    private readonly payments = new Map<string, StoredPayment>();

    async create(input: ICreatePayment): Promise<Payment | null> {
        const existing = await this.findByOrderId(input.orderId);
        if (existing) return null;
        const now = new Date();
        const stored: StoredPayment = {
            id: crypto.randomUUID(),
            orderId: input.orderId,
            externalId: input.externalId ?? null,
            preferenceId: input.preferenceId ?? null,
            amount: input.amount,
            status: PaymentStatus.PENDING,
            gatewayResponse: null,
            createdAt: now,
            updatedAt: now,
        };
        this.payments.set(stored.id, stored);
        return this.toDomain(stored);
    }

    async findByOrderId(orderId: string): Promise<Payment | null> {
        const stored = Array.from(this.payments.values()).find((p) => p.orderId === orderId);
        return stored ? this.toDomain(stored) : null;
    }

    async findByExternalId(externalId: string): Promise<Payment | null> {
        const stored = Array.from(this.payments.values()).find((p) => p.externalId === externalId);
        return stored ? this.toDomain(stored) : null;
    }

    async updateStatus(id: string, data: IUpdatePaymentStatus): Promise<Payment | null> {
        const stored = this.payments.get(id);
        if (!stored) return null;
        const updated: StoredPayment = {
            ...stored,
            status: data.status,
            updatedAt: new Date(),
            externalId: data.externalId !== undefined ? data.externalId : stored.externalId,
            preferenceId: data.preferenceId !== undefined ? data.preferenceId : stored.preferenceId,
            gatewayResponse: data.gatewayResponse !== undefined ? data.gatewayResponse : stored.gatewayResponse,
        };
        this.payments.set(id, updated);
        return this.toDomain(updated);
    }

    async updateStatusIfPending(id: string, data: IUpdatePaymentStatus): Promise<Payment | null> {
        const stored = this.payments.get(id);
        if (!stored || stored.status !== PaymentStatus.PENDING) return null;
        return this.updateStatus(id, data);
    }

    private toDomain(stored: StoredPayment): Payment {
        return new Payment({
            id: stored.id,
            orderId: stored.orderId,
            externalId: stored.externalId,
            preferenceId: stored.preferenceId,
            amount: stored.amount,
            status: stored.status as PaymentStatus,
            gatewayResponse: stored.gatewayResponse,
            createdAt: stored.createdAt,
            updatedAt: stored.updatedAt,
        });
    }

    seed(payment: Payment): void {
        this.payments.set(payment.id, {
            id: payment.id,
            orderId: payment.orderId,
            externalId: payment.externalId,
            preferenceId: payment.preferenceId,
            amount: payment.amount,
            status: payment.status,
            gatewayResponse: payment.gatewayResponse,
            createdAt: payment.createdAt,
            updatedAt: payment.updatedAt,
        });
    }
}
