import { Test, TestingModule } from '@nestjs/testing';
import { ListOrdersUseCase } from '../../../../../application/orders/use-cases/list-orders.use-case';
import { OrdersRepositoryPort } from '../../../../../domain/orders/ports/orders-repository.port';
import { InMemoryOrdersRepository } from '../../../../../test/doubles/in-memory-orders.repository';

describe('ListOrdersUseCase (integration)', () => {
  let sut: ListOrdersUseCase;
  let ordersRepository: InMemoryOrdersRepository;

  beforeEach(async () => {
    ordersRepository = new InMemoryOrdersRepository();
    await ordersRepository.create({ description: 'order 1' });
    await ordersRepository.create({ description: 'order 2' });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListOrdersUseCase,
        { provide: OrdersRepositoryPort, useValue: ordersRepository },
      ],
    }).compile();

    sut = module.get(ListOrdersUseCase);
  });

  describe('execute', () => {
    it('returns all orders from repository', async () => {
      const result = await sut.execute();

      expect(result).toHaveLength(2);
      expect(result.map((o) => o.description)).toEqual([
        'order 1',
        'order 2',
      ]);
    });
  });
});
