import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from '../../../../../orders/application/use-cases/create-order.use-case';
import { IOrdersRepositoryPort } from '../../../../../orders/domain/ports/orders-repository.port';
import { IOrderEventsPublisherPort } from '../../../../../orders/domain/ports/order-events-publisher.port';
import { InMemoryOrdersRepository } from '../../../../doubles/in-memory-orders.repository';
import { FakeOrderEventsPublisher } from '../../../../doubles/fake-order-events.publisher';
import { OrderWasCreatedEvent } from '../../../../../orders/domain/events/order-was-created.event';

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
