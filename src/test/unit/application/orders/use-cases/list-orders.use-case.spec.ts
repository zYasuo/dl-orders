import { Test, TestingModule } from '@nestjs/testing';
import { ListOrdersUseCase } from '../../../../../orders/application/use-cases/list-orders.use-case';
import { IOrdersRepositoryPort } from '../../../../../orders/domain/ports/orders-repository.port';
import { Order } from '../../../../../orders/domain/entities/order.entity';

describe('ListOrdersUseCase', () => {
  let sut: ListOrdersUseCase;
  let ordersRepository: jest.Mocked<IOrdersRepositoryPort>;

  const fakeOrders = [
    new Order('id-1', 'order 1', new Date('2025-01-01T12:00:00Z')),
    new Order('id-2', 'order 2', new Date('2025-01-02T12:00:00Z')),
  ];

  beforeEach(async () => {
    jest.clearAllMocks();

    ordersRepository = {
      create: jest.fn(),
      findAll: jest.fn().mockResolvedValue(fakeOrders),
    } as unknown as jest.Mocked<IOrdersRepositoryPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListOrdersUseCase,
        { provide: IOrdersRepositoryPort, useValue: ordersRepository },
      ],
    }).compile();

    sut = module.get(ListOrdersUseCase);
  });

  describe('execute', () => {
    it('returns the list of orders from repository', async () => {
      const result = await sut.execute();

      expect(ordersRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual(fakeOrders);
    });

    it('returns empty array when there are no orders', async () => {
      ordersRepository.findAll.mockResolvedValueOnce([]);

      const result = await sut.execute();

      expect(ordersRepository.findAll).toHaveBeenCalledTimes(1);
      expect(result).toEqual([]);
    });

    it('propagates error when repository throws', async () => {
      ordersRepository.findAll.mockRejectedValueOnce(new Error('DB failed'));

      await expect(sut.execute()).rejects.toThrow('DB failed');
    });
  });
});
