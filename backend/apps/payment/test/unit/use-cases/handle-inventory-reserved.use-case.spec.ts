import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HandleInventoryReservedUseCase } from '../../../src/application/use-cases/handle-inventory-reserved.use-case';
import { PaymentEntity, PaymentStatus } from '../../../src/domain/entities/payment.entity';
import { IPaymentAuditLogPort } from '../../../src/domain/ports/payment-audit-log.port';
import { IPaymentGatewayPort } from '../../../src/domain/ports/payment-gateway.port';
import { IPaymentRepositoryPort } from '../../../src/domain/ports/payment-repository.port';
import { IOrderDetailsPort } from '../../../src/domain/ports/order-details.port';

describe('HandleInventoryReservedUseCase', () => {
    let sut: HandleInventoryReservedUseCase;
    let orderDetailsPort: jest.Mocked<IOrderDetailsPort>;
    let paymentRepositoryPort: jest.Mocked<IPaymentRepositoryPort>;
    let paymentGatewayPort: jest.Mocked<IPaymentGatewayPort>;
    let paymentAuditLogPort: jest.Mocked<IPaymentAuditLogPort>;

    const orderId = 'order-1';
    const totalPrice = 99.9;
    const fakePayment = new PaymentEntity({
        id: 'pay-1',
        orderId,
        externalId: null,
        preferenceId: null,
        amount: totalPrice,
        status: PaymentStatus.PENDING,
        gatewayResponse: null,
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        orderDetailsPort = {
            getByOrderId: jest.fn().mockResolvedValue({ orderId, totalPrice }),
        } as unknown as jest.Mocked<IOrderDetailsPort>;

        paymentRepositoryPort = {
            create: jest.fn().mockResolvedValue(fakePayment),
            findByOrderId: jest.fn().mockResolvedValue(null),
            findByExternalId: jest.fn(),
            updateStatus: jest.fn().mockResolvedValue(fakePayment),
        } as unknown as jest.Mocked<IPaymentRepositoryPort>;

        paymentGatewayPort = {
            createPreference: jest.fn().mockResolvedValue({ preferenceId: 'pref-123', initPoint: 'https://checkout.test/123' }),
            getPayment: jest.fn(),
        } as unknown as jest.Mocked<IPaymentGatewayPort>;

        paymentAuditLogPort = {
            log: jest.fn().mockResolvedValue(undefined),
            getByOrderId: jest.fn().mockResolvedValue([]),
        } as unknown as jest.Mocked<IPaymentAuditLogPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                HandleInventoryReservedUseCase,
                { provide: IOrderDetailsPort, useValue: orderDetailsPort },
                { provide: IPaymentRepositoryPort, useValue: paymentRepositoryPort },
                { provide: IPaymentGatewayPort, useValue: paymentGatewayPort },
                { provide: IPaymentAuditLogPort, useValue: paymentAuditLogPort },
            ],
        }).compile();

        sut = module.get(HandleInventoryReservedUseCase);
    });

    it('creates payment and preference when order exists', async () => {
        const event = { orderId, productId: 'product-1', quantity: 2 };

        await sut.execute(event);

        expect(orderDetailsPort.getByOrderId).toHaveBeenCalledWith(orderId);
        expect(paymentRepositoryPort.create).toHaveBeenCalledWith({ orderId, amount: totalPrice });
        expect(paymentGatewayPort.createPreference).toHaveBeenCalledWith({
            orderId,
            amount: totalPrice,
            title: `Order ${orderId}`,
        });
        expect(paymentRepositoryPort.updateStatus).toHaveBeenCalledWith(fakePayment.id, {
            status: PaymentStatus.PENDING,
            preferenceId: 'pref-123',
            gatewayResponse: { initPoint: 'https://checkout.test/123' },
        });
        expect(paymentAuditLogPort.log).toHaveBeenCalledTimes(2);
    });

    it('throws NotFoundException when order not found', async () => {
        orderDetailsPort.getByOrderId.mockResolvedValueOnce(null);

        await expect(sut.execute({ orderId: 'missing', productId: 'p', quantity: 1 })).rejects.toThrow(NotFoundException);
        expect(paymentRepositoryPort.create).not.toHaveBeenCalled();
    });

    it('skips when create returns existing payment with preferenceId', async () => {
        const existingWithPreference = new PaymentEntity({
            id: fakePayment.id,
            orderId: fakePayment.orderId,
            externalId: null,
            preferenceId: 'pref-existing',
            amount: totalPrice,
            status: PaymentStatus.PENDING,
            gatewayResponse: null,
            createdAt: fakePayment.createdAt,
            updatedAt: fakePayment.updatedAt,
        });
        paymentRepositoryPort.create.mockResolvedValueOnce(existingWithPreference);

        await sut.execute({ orderId, productId: 'p', quantity: 1 });

        expect(paymentRepositoryPort.create).toHaveBeenCalledWith({ orderId, amount: totalPrice });
        expect(paymentGatewayPort.createPreference).not.toHaveBeenCalled();
    });
});
