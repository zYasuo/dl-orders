import { PaymentEntity, PaymentStatus } from '../../src/domain/entities/payment.entity';
import { PaymentRepositoryPort } from '../../src/domain/ports/payment-repository.port';

type StoredPayment = {
  id: string;
  orderId: string;
  idempotencyKey: string | null;
  externalId: string | null;
  preferenceId: string | null;
  amount: number;
  status: string;
  gatewayResponse: Record<string, unknown> | null;
  createdAt: Date;
  updatedAt: Date;
};

export class InMemoryPaymentRepository extends PaymentRepositoryPort {
  private readonly payments = new Map<string, StoredPayment>();

  async create(entity: PaymentEntity): Promise<PaymentEntity | null> {
    const { idempotencyKey, orderId } = entity;

    if (idempotencyKey) {
      const byKey = await this.findByIdempotencyKey(idempotencyKey);
      if (byKey) return byKey;
    }

    const byOrderId = await this.findByOrderId(orderId);
    if (byOrderId) return byOrderId;

    this.payments.set(entity.id, {
      id: entity.id,
      orderId: entity.orderId,
      idempotencyKey: entity.idempotencyKey,
      externalId: entity.externalId,
      preferenceId: entity.preferenceId,
      amount: entity.amount,
      status: entity.status,
      gatewayResponse: entity.gatewayResponse,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
    return entity;
  }

  async findByOrderId(orderId: string): Promise<PaymentEntity | null> {
    const stored = Array.from(this.payments.values()).find((p) => p.orderId === orderId);
    return stored ? this.toDomain(stored) : null;
  }

  async findByIdempotencyKey(idempotencyKey: string): Promise<PaymentEntity | null> {
    const stored = Array.from(this.payments.values()).find(
      (p) => p.idempotencyKey === idempotencyKey,
    );
    return stored ? this.toDomain(stored) : null;
  }

  async findByExternalId(externalId: string): Promise<PaymentEntity | null> {
    const stored = Array.from(this.payments.values()).find((p) => p.externalId === externalId);
    return stored ? this.toDomain(stored) : null;
  }

  async updateStatus(entity: PaymentEntity): Promise<PaymentEntity | null> {
    const stored = this.payments.get(entity.id);
    if (!stored) return null;
    const updated: StoredPayment = {
      ...stored,
      status: entity.status,
      updatedAt: entity.updatedAt,
      externalId: entity.externalId,
      preferenceId: entity.preferenceId,
      gatewayResponse: entity.gatewayResponse,
    };
    this.payments.set(entity.id, updated);
    return this.toDomain(updated);
  }

  async updateStatusIfPending(entity: PaymentEntity): Promise<PaymentEntity | null> {
    const stored = this.payments.get(entity.id);
    if (!stored || stored.status !== PaymentStatus.PENDING) return null;
    return this.updateStatus(entity);
  }

  private toDomain(stored: StoredPayment): PaymentEntity {
    return new PaymentEntity({
      id: stored.id,
      orderId: stored.orderId,
      idempotencyKey: stored.idempotencyKey,
      externalId: stored.externalId,
      preferenceId: stored.preferenceId,
      amount: stored.amount,
      status: stored.status as PaymentStatus,
      gatewayResponse: stored.gatewayResponse,
      createdAt: stored.createdAt,
      updatedAt: stored.updatedAt,
    });
  }

  seed(payment: PaymentEntity): void {
    this.payments.set(payment.id, {
      id: payment.id,
      orderId: payment.orderId,
      idempotencyKey: payment.idempotencyKey,
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
