import { Injectable, NotFoundException } from '@nestjs/common';
import { IPaymentRepositoryPort } from '../../domain/ports/payment-repository.port';

export type TPaymentByOrderResult = {
    paymentId: string;
    orderId: string;
    status: string;
    amount: number;
    initPoint: string | null;
};

@Injectable()
export class FindPaymentByOrderIdUseCase {
    constructor(private readonly paymentRepositoryPort: IPaymentRepositoryPort) {}

    async execute(orderId: string): Promise<TPaymentByOrderResult> {
        const payment = await this.paymentRepositoryPort.findByOrderId(orderId);

        if (!payment) {
            throw new NotFoundException(`Payment for order ${orderId} not found`);
        }

        const gatewayResponse = payment.gatewayResponse as { initPoint?: string } | null;

        return {
            paymentId: payment.id,
            orderId: payment.orderId,
            status: payment.status,
            amount: payment.amount,
            initPoint: gatewayResponse?.initPoint ?? null,
        };
    }
}
