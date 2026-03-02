import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from '../../../../../application/orders/use-cases/create-order.use-case';
import { OrdersRepositoryPort } from '../../../../../domain/orders/ports/orders-repository.port';
import { OrderEventsPublisherPort } from '../../../../../domain/orders/ports/order-events-publisher.port';
import { InMemoryOrdersRepository } from '../../../../../test/doubles/in-memory-orders.repository';
import { FakeOrderEventsPublisher } from '../../../../../test/doubles/fake-order-events.publisher';
import { OrderWasCreatedEvent } from '../../../../../domain/orders/events/order-was-created.event';

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
        { provide: OrdersRepositoryPort, useValue: ordersRepository },
        { provide: OrderEventsPublisherPort, useValue: orderEventsPublisher },
      ],
    }).compile();

    sut = module.get(CreateOrderUseCase);
  });

  describe('execute', () => {
    it('persists order and publishes OrderWasCreated', async () => {
      const input = { description: 'test order' };

      const result = await sut.execute(input);

      const all = await ordersRepository.findAll();
      expect(all).toHaveLength(1);
      expect(all[0].description).toBe(input.description);
      expect(result).toEqual(all[0]);

      expect(orderEventsPublisher.published).toHaveLength(1);
      const event = orderEventsPublisher.published[0];
      expect(event).toBeInstanceOf(OrderWasCreatedEvent);
      expect(event.order.id).toBe(result.id);
      expect(event.order.description).toBe(input.description);
    });
  });
});
