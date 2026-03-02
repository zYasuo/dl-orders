import { Test, TestingModule } from '@nestjs/testing';
import { CreateOrderUseCase } from '../../../../../application/orders/use-cases/create-order.use-case';
import { OrdersRepositoryPort } from '../../../../../domain/orders/ports/orders-repository.port';
import { OrderEventsPublisherPort } from '../../../../../domain/orders/ports/order-events-publisher.port';
import { OrderWasCreatedEvent } from '../../../../../domain/orders/events/order-was-created.event';
import { Order } from '../../../../../domain/orders/entities/order.entity';

describe('CreateOrderUseCase', () => {
  let sut: CreateOrderUseCase;
  let ordersRepository: jest.Mocked<OrdersRepositoryPort>;
  let orderEventsPublisher: jest.Mocked<OrderEventsPublisherPort>;

  const fakeOrder = new Order(
    'id-123',
    'test order',
    new Date('2025-01-01T12:00:00Z'),
  );

  beforeEach(async () => {
    jest.clearAllMocks();

    ordersRepository = {
      create: jest.fn().mockResolvedValue(fakeOrder),
      findAll: jest.fn(),
    } as unknown as jest.Mocked<OrdersRepositoryPort>;

    orderEventsPublisher = {
      publishOrderWasCreated: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<OrderEventsPublisherPort>;

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
    it('persists order, publishes OrderWasCreated and returns the order', async () => {
      const input = { description: 'test order' };

      const result = await sut.execute(input);

      expect(ordersRepository.create).toHaveBeenCalledTimes(1);
      expect(ordersRepository.create).toHaveBeenCalledWith({
        description: input.description,
      });

      expect(orderEventsPublisher.publishOrderWasCreated).toHaveBeenCalledTimes(1);
      const event = orderEventsPublisher.publishOrderWasCreated.mock.calls[0][0];
      expect(event).toBeInstanceOf(OrderWasCreatedEvent);
      expect(event.order).toEqual(fakeOrder);

      expect(result).toEqual(fakeOrder);
    });

    it('does not publish event when repository throws', async () => {
      const input = { description: 'order' };
      ordersRepository.create.mockRejectedValueOnce(new Error('DB failed'));

      await expect(sut.execute(input)).rejects.toThrow('DB failed');

      expect(orderEventsPublisher.publishOrderWasCreated).not.toHaveBeenCalled();
    });
  });
});
