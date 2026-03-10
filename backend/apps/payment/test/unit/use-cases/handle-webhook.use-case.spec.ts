import { Test, TestingModule } from '@nestjs/testing';
import { HandleWebhookUseCase } from '../../../src/application/use-cases/handle-webhook.use-case';
import { PaymentEntity, PaymentStatus } from '../../../src/domain/entities/payment.entity';
import { IPaymentAuditLogPort } from '../../../src/domain/ports/payment-audit-log.port';
import { IPaymentEventsPublisherPort } from '../../../src/domain/ports/payment-events-publisher.port';
import { IPaymentGatewayPort } from '../../../src/domain/ports/payment-gateway.port';
import { IPaymentRepositoryPort } from '../../../src/domain/ports/payment-repository.port';

describe('HandleWebhookUseCase', () => {
    let sut: HandleWebhookUseCase;
    let paymentRepositoryPort: jest.Mocked<IPaymentRepositoryPort>;
    let paymentGatewayPort: jest.Mocked<IPaymentGatewayPort>;
    let paymentEventsPublisherPort: jest.Mocked<IPaymentEventsPublisherPort>;
    let paymentAuditLogPort: jest.Mocked<IPaymentAuditLogPort>;

    const orderId = 'order-1';
    const externalId = 'mp-123';
    const fakePayment = new PaymentEntity({
        id: 'pay-1',
        orderId,
        externalId: null,
        preferenceId: 'pref-1',
        amount: 99.9,
        status: PaymentStatus.PENDING,
        gatewayResponse: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        paymentRepositoryPort = {
            create: jest.fn(),
            findByOrderId: jest.fn().mockResolvedValue(fakePayment),
            findByExternalId: jest.fn().mockResolvedValue(null),
            updateStatus: jest.fn().mockResolvedValue(fakePayment),
            updateStatusIfPending: jest.fn().mockResolvedValue(fakePayment),
        } as unknown as jest.Mocked<IPaymentRepositoryPort>;

        paymentGatewayPort = {
            createPreference: jest.fn(),
            getPayment: jest.fn().mockResolvedValue({
                id: externalId,
                status: 'approved',
                amount: 99.9,
                dateApproved: '2025-01-01T12:00:00Z',
                orderId,
            }),
        } as unknown as jest.Mocked<IPaymentGatewayPort>;

        paymentEventsPublisherPort = {
            publishPaymentApproved: jest.fn().mockResolvedValue(undefined),
            publishPaymentFailed: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<IPaymentEventsPublisherPort>;

        paymentAuditLogPort = {
            log: jest.fn().mockResolvedValue(undefined),
            getByOrderId: jest.fn().mockResolvedValue([]),
        } as unknown as jest.Mocked<IPaymentAuditLogPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HandleWebhookUseCase,
                { provide: IPaymentRepositoryPort, useValue: paymentRepositoryPort },
                { provide: IPaymentGatewayPort, useValue: paymentGatewayPort },
                { provide: IPaymentEventsPublisherPort, useValue: paymentEventsPublisherPort },
                { provide: IPaymentAuditLogPort, useValue: paymentAuditLogPort },
            ],
        }).compile();

        sut = module.get(HandleWebhookUseCase);
    });

    it('publishes PaymentApproved when gateway returns approved', async () => {
        await sut.execute({ type: 'payment', data: { id: externalId } });

        expect(paymentGatewayPort.getPayment).toHaveBeenCalledWith(externalId);
        expect(paymentRepositoryPort.findByOrderId).toHaveBeenCalledWith(orderId);
        expect(paymentRepositoryPort.updateStatusIfPending).toHaveBeenCalledWith(fakePayment.id, expect.objectContaining({ status: PaymentStatus.APPROVED, externalId }));
        expect(paymentEventsPublisherPort.publishPaymentApproved).toHaveBeenCalledWith({
            orderId,
            paymentId: externalId,
            amount: 99.9,
            paidAt: '2025-01-01T12:00:00Z',
        });
        expect(paymentEventsPublisherPort.publishPaymentFailed).not.toHaveBeenCalled();
    });

    it('publishes PaymentFailed when gateway returns rejected', async () => {
        paymentGatewayPort.getPayment.mockResolvedValueOnce({
            id: externalId,
            status: 'rejected',
            amount: 99.9,
            dateApproved: null,
            orderId,
        });

        await sut.execute({ type: 'payment', data: { id: externalId } });

        expect(paymentRepositoryPort.updateStatusIfPending).toHaveBeenCalledWith(fakePayment.id, expect.objectContaining({ status: PaymentStatus.REJECTED }));
        expect(paymentEventsPublisherPort.publishPaymentFailed).toHaveBeenCalledWith({
            orderId,
            paymentId: externalId,
            reason: 'REJECTED',
        });
        expect(paymentEventsPublisherPort.publishPaymentApproved).not.toHaveBeenCalled();
    });

    it('ignores non-payment webhook type', async () => {
        await sut.execute({ type: 'merchant_order', data: { id: 'mo-1' } });

        expect(paymentGatewayPort.getPayment).not.toHaveBeenCalled();
        expect(paymentEventsPublisherPort.publishPaymentApproved).not.toHaveBeenCalled();
    });

    it('does not approve when amount mismatch', async () => {
        paymentGatewayPort.getPayment.mockResolvedValueOnce({
            id: externalId,
            status: 'approved',
            amount: 50,
            dateApproved: '2025-01-01T12:00:00Z',
            orderId,
        });

        await sut.execute({ type: 'payment', data: { id: externalId } });

        expect(paymentRepositoryPort.updateStatusIfPending).not.toHaveBeenCalled();
        expect(paymentEventsPublisherPort.publishPaymentApproved).not.toHaveBeenCalled();
    });

    it('does not publish when updateStatusIfPending returns null (idempotent)', async () => {
        paymentRepositoryPort.updateStatusIfPending.mockResolvedValueOnce(null);

        await sut.execute({ type: 'payment', data: { id: externalId } });

        expect(paymentEventsPublisherPort.publishPaymentApproved).not.toHaveBeenCalled();
        expect(paymentEventsPublisherPort.publishPaymentFailed).not.toHaveBeenCalled();
    });
});
