import { PaymentEntity } from '../entities/payment.entity';
import { ICreatePayment, IUpdatePaymentStatus } from '../types/payment-repository.types';

export abstract class IPaymentRepositoryPort {
    abstract create(input: ICreatePayment): Promise<PaymentEntity | null>;
    abstract findByOrderId(orderId: string): Promise<PaymentEntity | null>;
    abstract findByExternalId(externalId: string): Promise<PaymentEntity | null>;
    abstract updateStatus(id: string, data: IUpdatePaymentStatus): Promise<PaymentEntity | null>;
    abstract updateStatusIfPending(id: string, data: IUpdatePaymentStatus): Promise<PaymentEntity | null>;
}
