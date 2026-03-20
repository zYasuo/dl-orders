import { Test, TestingModule } from '@nestjs/testing';
import { FindAllProductsUseCase } from '../../../src/application/use-cases/find-all-products.use-case';
import { ProductCachePort } from '../../../src/domain/ports/product-cache.port';
import { ProductRepositoryPort } from '../../../src/domain/ports/product-repository.port';
import { InMemoryProductCache } from '../../doubles/in-memory-product-cache';
import { InMemoryProductRepository } from '../../doubles/in-memory-product.repository';

describe('FindAllProductsUseCase (integration)', () => {
  let sut: FindAllProductsUseCase;
  let productRepository: InMemoryProductRepository;
  let productCache: InMemoryProductCache;

  beforeEach(async () => {
    productRepository = new InMemoryProductRepository();
    productCache = new InMemoryProductCache();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FindAllProductsUseCase,
        { provide: ProductRepositoryPort, useValue: productRepository },
        { provide: ProductCachePort, useValue: productCache },
      ],
    }).compile();

    sut = module.get(FindAllProductsUseCase);
  });

  describe('execute', () => {
    it('returns null when repository is empty', async () => {
      const result = await sut.execute();

      expect(result).toBeNull();
    });

    it('returns all products from repository and caches them', async () => {
      const a = await productRepository.create({
        name: 'Product A',
        description: 'Desc A',
        price: 10,
      });
      const b = await productRepository.create({
        name: 'Product B',
        description: 'Desc B',
        price: 20,
      });

      const result = await sut.execute();

      expect(result).toHaveLength(2);
      expect(result).toEqual(expect.arrayContaining([a, b]));

      const cached = await productCache.getAll();
      expect(cached).toHaveLength(2);
      expect(cached).toEqual(expect.arrayContaining([a, b]));
    });

    it('returns cached list on second call without hitting repository', async () => {
      await productRepository.create({ name: 'Product A', description: 'Desc A', price: 10 });
      const first = await sut.execute();
      const second = await sut.execute();

      expect(first).toEqual(second);
      expect(first).toHaveLength(1);
    });
  });
});
