import { PaymentEntity } from '../entities/payment.entity';

export abstract class PaymentRepositoryPort {
  abstract create(entity: PaymentEntity): Promise<PaymentEntity | null>;
  abstract findByOrderId(orderId: string): Promise<PaymentEntity | null>;
  abstract findByIdempotencyKey(idempotencyKey: string): Promise<PaymentEntity | null>;
  abstract findByExternalId(externalId: string): Promise<PaymentEntity | null>;
  abstract updateStatus(entity: PaymentEntity): Promise<PaymentEntity | null>;
  abstract updateStatusIfPending(entity: PaymentEntity): Promise<PaymentEntity | null>;
}
