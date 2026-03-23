import { Test, TestingModule } from '@nestjs/testing';
import { FindAllProductsUseCase } from '../../../src/application/use-cases/find-all-products.use-case';
import { ProductEntity } from '../../../src/domain/entities/product.entity';
import { ProductRepositoryPort } from '../../../src/domain/ports/product-repository.port';
import { InMemoryProductRepository } from '../../doubles/in-memory-product.repository';

describe('FindAllProductsUseCase (integration)', () => {
  let sut: FindAllProductsUseCase;
  let productRepository: InMemoryProductRepository;

  beforeEach(async () => {
    productRepository = new InMemoryProductRepository();

    const module: TestingModule = await Test.createTestingModule({
      providers: [FindAllProductsUseCase, { provide: ProductRepositoryPort, useValue: productRepository }],
    }).compile();

    sut = module.get(FindAllProductsUseCase);
  });

  describe('execute', () => {
    it('returns empty paginated result when repository is empty', async () => {
      const result = await sut.execute(1, 12);

      expect(result.data).toEqual([]);
      expect(result.meta).toEqual({ page: 1, limit: 12, total: 0, totalPages: 0 });
    });

    it('returns paginated products sorted by createdAt desc', async () => {
      const older = ProductEntity.create({
        name: 'Older',
        description: 'Desc',
        price: 10,
      });
      const newer = ProductEntity.create({
        name: 'Newer',
        description: 'Desc',
        price: 20,
      });
      await productRepository.create(older);
      await productRepository.create(newer);

      const result = await sut.execute(1, 10);

      expect(result.meta.total).toBe(2);
      expect(result.data).toHaveLength(2);
      expect(result.data[0]!.name).toBe('Newer');
      expect(result.data[1]!.name).toBe('Older');
    });

    it('respects page and limit', async () => {
      for (let i = 0; i < 5; i++) {
        await productRepository.create(
          ProductEntity.create({
            name: `P${i}`,
            description: 'D',
            price: i,
          }),
        );
      }

      const page1 = await sut.execute(1, 2);
      expect(page1.data).toHaveLength(2);
      expect(page1.meta).toMatchObject({ page: 1, limit: 2, total: 5, totalPages: 3 });

      const page2 = await sut.execute(2, 2);
      expect(page2.data).toHaveLength(2);
      expect(page2.meta.page).toBe(2);
    });
  });
});
