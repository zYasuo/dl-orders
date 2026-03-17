import { Injectable, Logger } from '@nestjs/common';
import { PaymentStatus } from '../../domain/entities/payment.entity';
import { IPaymentAuditLogPort } from '../../domain/ports/payment-audit-log.port';
import { IPaymentEventsPublisherPort } from '../../domain/ports/payment-events-publisher.port';
import { IPaymentGatewayPort } from '../../domain/ports/payment-gateway.port';
import { IPaymentRepositoryPort } from '../../domain/ports/payment-repository.port';

export interface IWebhookPayload {
    type: string;
    data: { id: string };
}

@Injectable()
export class HandleWebhookUseCase {
    private readonly logger = new Logger(HandleWebhookUseCase.name);

    constructor(
        private readonly paymentRepositoryPort: IPaymentRepositoryPort,
        private readonly paymentGatewayPort: IPaymentGatewayPort,
        private readonly paymentEventsPublisherPort: IPaymentEventsPublisherPort,
        private readonly paymentAuditLogPort: IPaymentAuditLogPort,
    ) {}

    async execute(payload: IWebhookPayload): Promise<void> {
        if (!payload.type?.includes('payment')) {
            this.logger.log(`Ignoring webhook type=${payload.type}`);
            return;
        }

        const externalId = payload.data.id;
        const details = await this.paymentGatewayPort.getPayment(externalId);

        if (!details) {
            this.logger.warn(`Payment not found in gateway. externalId=${externalId}`);
            return;
        }

        let paymentRecord = await this.paymentRepositoryPort.findByExternalId(externalId);

        if (!paymentRecord && details.orderId) {
            paymentRecord = await this.paymentRepositoryPort.findByOrderId(details.orderId);
        }

        if (!paymentRecord) {
            this.logger.warn(`No payment record for externalId=${externalId}`);
            return;
        }

        const status = details.status?.toUpperCase?.() ?? details.status;

        if (status === 'APPROVED') {
            if (!paymentRecord.matchesAmount(details.amount)) {
                this.logger.warn('Payment amount mismatch', {
                    orderId: paymentRecord.orderId,
                    externalId,
                    expected: paymentRecord.amount,
                    received: details.amount,
                });
                return;
            }

            if (!paymentRecord.isPending()) {
                this.logger.log('Duplicate webhook ignored', {
                    paymentId: paymentRecord.id,
                    externalId,
                });
                return;
            }

            const updated = await this.paymentRepositoryPort.updateStatusIfPending(paymentRecord.id, {
                status: PaymentStatus.APPROVED,
                externalId,
                gatewayResponse: { ...details },
            });

            if (!updated) {
                this.logger.log('Duplicate webhook ignored', {
                    paymentId: paymentRecord.id,
                    externalId,
                });
                return;
            }

            const now = new Date();
            const timestamp = now.toISOString();

            const results = await Promise.allSettled([
                this.paymentAuditLogPort.log({
                    orderId: paymentRecord.orderId,
                    action: 'PAYMENT_APPROVED',
                    timestamp,
                    details: { externalId, amount: details.amount },
                }),
                this.paymentEventsPublisherPort.publishPaymentApproved({
                    orderId: paymentRecord.orderId,
                    paymentId: externalId,
                    amount: details.amount,
                    paidAt: details.dateApproved ?? new Date().toISOString(),
                }),
            ]);

            results.forEach((r) => {
                if (r.status === 'rejected') {
                    const reason: unknown = r.reason;
                    this.logger.warn('Payment approved side-effect failed', {
                        orderId: paymentRecord.orderId,
                        externalId,
                        error: reason,
                    });
                }
            });

            this.logger.log(`Payment approved. orderId=${paymentRecord.orderId} externalId=${externalId}`);
        } else {
            if (!paymentRecord.isPending()) {
                this.logger.log('Duplicate webhook ignored', {
                    paymentId: paymentRecord.id,
                    externalId,
                });
                return;
            }

            const updated = await this.paymentRepositoryPort.updateStatusIfPending(paymentRecord.id, {
                status: PaymentStatus.REJECTED,
                externalId,
                gatewayResponse: { ...details },
            });

            if (!updated) {
                this.logger.log('Duplicate webhook ignored', {
                    paymentId: paymentRecord.id,
                    externalId,
                });
                return;
            }

            const now = new Date();
            const timestamp = now.toISOString();

            const results = await Promise.allSettled([
                this.paymentAuditLogPort.log({
                    orderId: paymentRecord.orderId,
                    action: 'PAYMENT_FAILED',
                    timestamp,
                    details: { externalId, reason: status },
                }),
                this.paymentEventsPublisherPort.publishPaymentFailed({
                    orderId: paymentRecord.orderId,
                    paymentId: externalId,
                    reason: status,
                }),
            ]);

            results.forEach((r) => {
                if (r.status === 'rejected') {
                    const reason: unknown = r.reason;
                    this.logger.warn('Payment failed side-effect failed', {
                        orderId: paymentRecord.orderId,
                        externalId,
                        error: reason,
                    });
                }
            });

            this.logger.warn('Payment failed', {
                orderId: paymentRecord.orderId,
                externalId,
                reason: status,
            });
        }
    }
}
