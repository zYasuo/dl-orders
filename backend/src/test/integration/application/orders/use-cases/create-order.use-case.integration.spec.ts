import { Test, TestingModule } from '@nestjs/testing';
import { IInventoryRepositoryPort } from '../../../../../inventory/domain/ports/inventory-repository.port';
import { CreateOrderUseCase } from '../../../../../orders/application/use-cases/create-order.use-case';
import { OrderWasCreatedEvent } from '../../../../../orders/domain/events/order-was-created.event';
import { IOrderEventsPublisherPort } from '../../../../../orders/domain/ports/order-events-publisher.port';
import { IOrdersRepositoryPort } from '../../../../../orders/domain/ports/orders-repository.port';
import { FakeOrderEventsPublisher } from '../../../../doubles/fake-order-events.publisher';
import { InMemoryInventoryRepository } from '../../../../doubles/in-memory-inventory.repository';
import { InMemoryOrdersRepository } from '../../../../doubles/in-memory-orders.repository';

describe('CreateOrderUseCase (integration)', () => {
    let sut: CreateOrderUseCase;
    let ordersRepository: InMemoryOrdersRepository;
    let inventoryRepository: InMemoryInventoryRepository;
    let orderEventsPublisher: FakeOrderEventsPublisher;

    beforeEach(async () => {
        ordersRepository = new InMemoryOrdersRepository();
        inventoryRepository = new InMemoryInventoryRepository();
        orderEventsPublisher = new FakeOrderEventsPublisher();

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateOrderUseCase,
                { provide: IOrdersRepositoryPort, useValue: ordersRepository },
                { provide: IOrderEventsPublisherPort, useValue: orderEventsPublisher },
                { provide: IInventoryRepositoryPort, useValue: inventoryRepository },
            ],
        }).compile();

        sut = module.get(CreateOrderUseCase);
    });

    describe('execute', () => {
        it('persists order and publishes OrderWasCreated', async () => {
            const created = await inventoryRepository.create({
                name: 'Estoque Produto',
                quantity: 5,
                productId: 'product-123',
            });
            const input = {
                productId: created!.productId,
                quantity: 1,
                description: 'test order',
                recipient: 'test@test.com',
            };

            const result = await sut.execute(input);

            const found = await ordersRepository.findById(result.id);
            expect(found).not.toBeNull();
            expect(found!.productId).toBe(input.productId);
            expect(found!.quantity).toBe(input.quantity);
            expect(found!.description).toBe(input.description);
            expect(result).toEqual(found);

            expect(orderEventsPublisher.published).toHaveLength(1);
            const event = orderEventsPublisher.published[0];
            expect(event).toBeInstanceOf(OrderWasCreatedEvent);
            expect(event.order.id).toBe(result.id);
            expect(event.order.productId).toBe(input.productId);
            expect(event.order.quantity).toBe(input.quantity);
            expect(event.order.description).toBe(input.description);
            expect(event.order.recipient).toBe(input.recipient);
        });
    });
});
