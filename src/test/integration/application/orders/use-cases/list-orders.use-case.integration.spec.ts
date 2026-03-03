import { Test, TestingModule } from '@nestjs/testing';
import { ListOrdersUseCase } from '../../../../../orders/application/use-cases/list-orders.use-case';
import { IOrdersRepositoryPort } from '../../../../../orders/domain/ports/orders-repository.port';
import { InMemoryOrdersRepository } from '../../../../doubles/in-memory-orders.repository';

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
        { provide: IOrdersRepositoryPort, useValue: ordersRepository },
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
