import { InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from '../../../src/application/use-cases/create-order.use-case';
import { Order, OrderStatus } from '../../../src/domain/entities/order.entity';
import { IOrderAuditLogPort } from '../../../src/domain/ports/order-audit-log.port';
import { IOrderEventsPublisherPort } from '../../../src/domain/ports/order-events-publisher.port';
import { IProductCatalogPort } from '../../../src/domain/ports/product-catalog.port';
import { IOrderSummaryPort } from '../../../src/domain/ports/order-summary.port';
import { IOrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';

describe('CreateOrderUseCase', () => {
    let sut: CreateOrderUseCase;
    let ordersRepository: jest.Mocked<IOrdersRepositoryPort>;
    let productCatalogPort: jest.Mocked<IProductCatalogPort>;
    let orderEventsPublisher: jest.Mocked<IOrderEventsPublisherPort>;
    let orderAuditLog: jest.Mocked<IOrderAuditLogPort>;
    let orderSummary: jest.Mocked<IOrderSummaryPort>;

    const createdAt = new Date('2025-01-01T12:00:00Z');
    const fakeProduct = { name: 'Product A', description: 'Description A', price: 99.9 };
    const fakeOrder = new Order({
        id: 'id-123',
        description: 'test order',
        status: OrderStatus.PENDING,
        productId: 'product-123',
        quantity: 1,
        createdAt,
        updatedAt: createdAt,
        recipient: 'test@test.com',
        productName: 'Product A',
        productDescription: 'Description A',
        unitPrice: 99.9,
        totalPrice: 99.9,
    });

    beforeEach(async () => {
        jest.clearAllMocks();

        ordersRepository = {
            create: jest.fn().mockResolvedValue(fakeOrder),
            findById: jest.fn(),
            updateStatus: jest.fn(),
        } as unknown as jest.Mocked<IOrdersRepositoryPort>;

        productCatalogPort = {
            findById: jest.fn().mockResolvedValue(fakeProduct),
        } as unknown as jest.Mocked<IProductCatalogPort>;

        orderEventsPublisher = {
            publishOrderCreationRequested: jest.fn().mockResolvedValue(undefined),
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
                CreateOrderUseCase,
                { provide: IOrdersRepositoryPort, useValue: ordersRepository },
                { provide: IProductCatalogPort, useValue: productCatalogPort },
                { provide: IOrderEventsPublisherPort, useValue: orderEventsPublisher },
                { provide: IOrderAuditLogPort, useValue: orderAuditLog },
                { provide: IOrderSummaryPort, useValue: orderSummary },
            ],
        }).compile();

        sut = module.get(CreateOrderUseCase);
    });

    describe('execute', () => {
        it('fetches product, persists order with totalPrice = quantity * price, and publishes OrderCreationRequested', async () => {
            const input = { productId: 'product-123', quantity: 1, description: 'test order', recipient: 'test@test.com' };

            const result = await sut.execute(input);

            expect(productCatalogPort.findById).toHaveBeenCalledWith('product-123');
            expect(ordersRepository.create).toHaveBeenCalledTimes(1);
            expect(ordersRepository.create).toHaveBeenCalledWith({
                productId: input.productId,
                quantity: input.quantity,
                description: input.description,
                recipient: input.recipient,
                productName: 'Product A',
                productDescription: 'Description A',
                unitPrice: 99.9,
                totalPrice: 99.9,
            });

            expect(orderAuditLog.log).toHaveBeenCalledTimes(1);
            expect(orderAuditLog.log).toHaveBeenCalledWith({
                orderId: fakeOrder.id,
                action: 'ORDER_CREATED',
                timestamp: expect.any(String),
                details: {
                    productId: fakeOrder.productId,
                    quantity: fakeOrder.quantity,
                    description: fakeOrder.description,
                    recipient: fakeOrder.recipient,
                },
            });

            expect(orderSummary.put).toHaveBeenCalledTimes(1);
            expect(orderSummary.put).toHaveBeenCalledWith({
                orderId: fakeOrder.id,
                status: fakeOrder.status,
                productId: fakeOrder.productId,
                quantity: fakeOrder.quantity,
                description: fakeOrder.description,
                recipient: fakeOrder.recipient,
                createdAt: fakeOrder.createdAt.toISOString(),
                updatedAt: expect.any(String),
            });

            expect(orderEventsPublisher.publishOrderCreationRequested).toHaveBeenCalledTimes(1);
            expect(orderEventsPublisher.publishOrderCreationRequested).toHaveBeenCalledWith({
                orderId: fakeOrder.id,
                productId: fakeOrder.productId,
                productName: 'Product A',
                productDescription: 'Description A',
                totalPrice: 99.9,
                userId: 'test@test.com',
                quantity: fakeOrder.quantity,
                recipientEmail: 'test@test.com',
            });

            expect(result).toEqual(fakeOrder);
        });

        it('throws NotFoundException when product does not exist', async () => {
            const input = { productId: 'product-123', quantity: 1, description: 'order', recipient: 'test@test.com' };
            productCatalogPort.findById.mockResolvedValueOnce(null);

            await expect(sut.execute(input)).rejects.toThrow(new NotFoundException('Product not found'));

            expect(ordersRepository.create).not.toHaveBeenCalled();
            expect(orderEventsPublisher.publishOrderCreationRequested).not.toHaveBeenCalled();
        });

        it('throws InternalServerErrorException when repository returns null', async () => {
            const input = { productId: 'product-123', quantity: 1, description: 'order', recipient: 'test@test.com' };
            ordersRepository.create.mockResolvedValueOnce(null);

            await expect(sut.execute(input)).rejects.toThrow(
                new InternalServerErrorException('Failed to create order'),
            );

            expect(orderEventsPublisher.publishOrderCreationRequested).not.toHaveBeenCalled();
        });

        it('does not publish event when repository throws', async () => {
            const input = { productId: 'product-123', quantity: 1, description: 'order', recipient: 'test@test.com' };
            ordersRepository.create.mockRejectedValueOnce(new Error('DB failed'));

            await expect(sut.execute(input)).rejects.toThrow('DB failed');

            expect(orderEventsPublisher.publishOrderCreationRequested).not.toHaveBeenCalled();
        });
    });
});
