import { InventoryReservedEvent } from '@app/shared';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PaymentStatus } from '../../domain/entities/payment.entity';
import { IOrderDetailsPort } from '../../domain/ports/order-details.port';
import { IPaymentAuditLogPort } from '../../domain/ports/payment-audit-log.port';
import { IPaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { IPaymentRepositoryPort } from '../../domain/ports/payment-repository.port';

@Injectable()
export class HandleInventoryReservedUseCase {
    private readonly logger = new Logger(HandleInventoryReservedUseCase.name);

    constructor(
        private readonly orderDetailsPort: IOrderDetailsPort,
        private readonly paymentRepositoryPort: IPaymentRepositoryPort,
        private readonly paymentGatewayPort: IPaymentGatewayPort,
        private readonly paymentAuditLogPort: IPaymentAuditLogPort,
    ) {}

    async execute(event: InventoryReservedEvent): Promise<void> {
        const { orderId } = event;

        const orderDetails = await this.orderDetailsPort.getByOrderId(orderId);

        if (!orderDetails) {
            this.logger.warn(`Order not found for payment, skipping. orderId=${orderId}`);
            throw new NotFoundException(`Order ${orderId} not found`);
        }

        const existing = await this.paymentRepositoryPort.findByOrderId(orderId);

        if (existing) {
            this.logger.log(`Payment already exists for order, skipping. orderId=${orderId}`);
            return;
        }

        await this.paymentAuditLogPort.log({
            orderId,
            action: 'PAYMENT_REQUESTED',
            timestamp: new Date().toISOString(),
            details: { amount: orderDetails.totalPrice },
        });

        const payment = await this.paymentRepositoryPort.create({
            orderId,
            amount: orderDetails.totalPrice,
        });

        if (!payment) {
            this.logger.error(`Failed to create payment record. orderId=${orderId}`);
            throw new Error('Failed to create payment');
        }

        const preference = await this.paymentGatewayPort.createPreference({
            orderId,
            amount: orderDetails.totalPrice,
            title: `Order ${orderId}`,
        });

        await this.paymentRepositoryPort.updateStatus(payment.id, {
            status: PaymentStatus.PENDING,
            preferenceId: preference.preferenceId,
            gatewayResponse: { initPoint: preference.initPoint },
        });

        await this.paymentAuditLogPort.log({
            orderId,
            action: 'PREFERENCE_CREATED',
            timestamp: new Date().toISOString(),
            details: { preferenceId: preference.preferenceId, paymentId: payment.id },
        });

        this.logger.log(`Payment preference created. orderId=${orderId} preferenceId=${preference.preferenceId}`);
    }
}
