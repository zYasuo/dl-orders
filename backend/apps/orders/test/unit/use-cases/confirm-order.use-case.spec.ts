import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfirmOrderUseCase } from '../../../src/application/use-cases/confirm-order.use-case';
import { Order, OrderStatus } from '../../../src/domain/entities/order.entity';
import { IOrderAuditLogPort } from '../../../src/domain/ports/order-audit-log.port';
import { IOrderEventsPublisherPort } from '../../../src/domain/ports/order-events-publisher.port';
import { IOrderSummaryPort } from '../../../src/domain/ports/order-summary.port';
import { IOrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';

describe('ConfirmOrderUseCase', () => {
    let sut: ConfirmOrderUseCase;
    let ordersRepository: jest.Mocked<IOrdersRepositoryPort>;
    let orderEventsPublisher: jest.Mocked<IOrderEventsPublisherPort>;
    let orderAuditLog: jest.Mocked<IOrderAuditLogPort>;
    let orderSummary: jest.Mocked<IOrderSummaryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const confirmedOrder = new Order({
        id: 'order-1',
        description: 'test order',
        status: OrderStatus.CONFIRMED,
        productId: 'product-123',
        quantity: 2,
        createdAt,
        updatedAt: createdAt,
        recipient: 'test@test.com',
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        ordersRepository = {
            create: jest.fn(),
            findById: jest.fn(),
            updateStatus: jest.fn().mockResolvedValue(confirmedOrder),
        } as unknown as jest.Mocked<IOrdersRepositoryPort>;

        orderEventsPublisher = {
            publishOrderCreationRequested: jest.fn(),
            publishOrderConfirmed: jest.fn().mockResolvedValue(undefined),
        } as unknown as jest.Mocked<IOrderEventsPublisherPort>;

        orderAuditLog = {
            log: jest.fn().mockResolvedValue(undefined),
            getByOrderId: jest.fn().mockResolvedValue([]),
        } as unknown as jest.Mocked<IOrderAuditLogPort>;

        orderSummary = {
            put: jest.fn().mockResolvedValue(undefined),
            getByOrderId: jest.fn().mockResolvedValue(null),
        } as unknown as jest.Mocked<IOrderSummaryPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ConfirmOrderUseCase,
                { provide: IOrdersRepositoryPort, useValue: ordersRepository },
                { provide: IOrderEventsPublisherPort, useValue: orderEventsPublisher },
                { provide: IOrderAuditLogPort, useValue: orderAuditLog },
                { provide: IOrderSummaryPort, useValue: orderSummary },
            ],
        }).compile();

        sut = module.get(ConfirmOrderUseCase);
    });

    describe('execute', () => {
        it('updates order to CONFIRMED and publishes OrderConfirmed', async () => {
            const event = { orderId: 'order-1', productId: 'product-123', quantity: 2 };

            await sut.execute(event);

            expect(ordersRepository.updateStatus).toHaveBeenCalledWith('order-1', OrderStatus.CONFIRMED);
            expect(orderSummary.put).toHaveBeenCalledTimes(1);
            expect(orderSummary.put).toHaveBeenCalledWith({
                orderId: confirmedOrder.id,
                status: confirmedOrder.status,
                productId: confirmedOrder.productId,
                quantity: confirmedOrder.quantity,
                description: confirmedOrder.description,
                recipient: confirmedOrder.recipient,
                createdAt: confirmedOrder.createdAt.toISOString(),
                updatedAt: expect.any(String),
            });
            expect(orderEventsPublisher.publishOrderConfirmed).toHaveBeenCalledTimes(1);
            const published = orderEventsPublisher.publishOrderConfirmed.mock.calls[0][0];
            expect(published.orderId).toBe('order-1');
            expect(published.productId).toBe('product-123');
            expect(published.quantity).toBe(2);
            expect(published.description).toBe('test order');
            expect(published.recipient).toBe('test@test.com');
            expect(published.confirmedAt).toBeDefined();
        });

        it('throws NotFoundException when order does not exist', async () => {
            ordersRepository.updateStatus.mockResolvedValueOnce(null);

            await expect(sut.execute({ orderId: 'non-existent', productId: 'p', quantity: 1 })).rejects.toThrow(NotFoundException);

            expect(orderEventsPublisher.publishOrderConfirmed).not.toHaveBeenCalled();
        });
    });
});
