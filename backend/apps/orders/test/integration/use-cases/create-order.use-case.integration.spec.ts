import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from '../../../src/application/use-cases/create-order.use-case';
import { OrderStatus } from '../../../src/domain/entities/order.entity';
import { IOrderEventsPublisherPort } from '../../../src/domain/ports/order-events-publisher.port';
import { IOrdersRepositoryPort } from '../../../src/domain/ports/orders-repository.port';
import { FakeOrderEventsPublisher } from '../../doubles/fake-order-events.publisher';
import { InMemoryOrdersRepository } from '../../doubles/in-memory-orders.repository';

describe('CreateOrderUseCase (integration)', () => {
    let sut: CreateOrderUseCase;
    let ordersRepository: InMemoryOrdersRepository;
    let orderEventsPublisher: FakeOrderEventsPublisher;

    beforeEach(async () => {
        ordersRepository = new InMemoryOrdersRepository();
        orderEventsPublisher = new FakeOrderEventsPublisher();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateOrderUseCase,
                { provide: IOrdersRepositoryPort, useValue: ordersRepository },
                { provide: IOrderEventsPublisherPort, useValue: orderEventsPublisher },
            ],
        }).compile();

        sut = module.get(CreateOrderUseCase);
    });

    describe('execute', () => {
        it('persists order as PENDING and publishes OrderCreationRequested', async () => {
            const input = { productId: 'product-123', quantity: 1, description: 'test order', recipient: 'test@test.com' };

            const result = await sut.execute(input);

            expect(result.status).toBe(OrderStatus.PENDING);

            const found = await ordersRepository.findById(result.id);
            expect(found).not.toBeNull();
            expect(found!.productId).toBe(input.productId);
            expect(found!.quantity).toBe(input.quantity);
            expect(found!.description).toBe(input.description);
            expect(found!.recipient).toBe(input.recipient);

            expect(orderEventsPublisher.creationRequested).toHaveLength(1);
            expect(orderEventsPublisher.creationRequested[0].orderId).toBe(result.id);
            expect(orderEventsPublisher.creationRequested[0].productId).toBe(input.productId);
        });
    });
});
