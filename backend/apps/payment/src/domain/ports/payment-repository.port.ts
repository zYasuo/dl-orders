import { Payment } from '../entities/payment.entity';
import { ICreatePayment, IUpdatePaymentStatus } from '../types/payment-repository.types';

export abstract class IPaymentRepositoryPort {
    abstract create(input: ICreatePayment): Promise<Payment | null>;
    abstract findByOrderId(orderId: string): Promise<Payment | null>;
    abstract findByExternalId(externalId: string): Promise<Payment | null>;
    abstract updateStatus(id: string, data: IUpdatePaymentStatus): Promise<Payment | null>;
    abstract updateStatusIfPending(id: string, data: IUpdatePaymentStatus): Promise<Payment | null>;
}
