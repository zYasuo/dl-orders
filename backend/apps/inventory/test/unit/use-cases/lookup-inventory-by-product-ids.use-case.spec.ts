import { Test, TestingModule } from '@nestjs/testing';
import { LookupInventoryByProductIdsUseCase } from '../../../src/application/use-cases/lookup-inventory-by-product-ids.use-case';
import { InventoryEntity } from '../../../src/domain/entities/inventory.entity';
import { InventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';

describe('LookupInventoryByProductIdsUseCase', () => {
  const now = new Date();
  const createdBy = 'seed@test.com';

  let sut: LookupInventoryByProductIdsUseCase;
  let inventoryRepository: jest.Mocked<InventoryRepositoryPort>;

  beforeEach(async () => {
    inventoryRepository = {
      findByProductIds: jest.fn(),
    } as unknown as jest.Mocked<InventoryRepositoryPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LookupInventoryByProductIdsUseCase,
        { provide: InventoryRepositoryPort, useValue: inventoryRepository },
      ],
    }).compile();

    sut = module.get(LookupInventoryByProductIdsUseCase);
  });

  it('maps entities to storefront rows and dedupes ids passed to repository', async () => {
    const p1 = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const entities = [
      new InventoryEntity(
        'inv-1',
        'N1',
        3,
        100,
        10,
        5,
        p1,
        createdBy,
        now,
        now,
      ),
      new InventoryEntity(
        'inv-2',
        'N2',
        0,
        100,
        10,
        5,
        'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee',
        createdBy,
        now,
        now,
      ),
    ];
    inventoryRepository.findByProductIds.mockResolvedValue(entities);

    const result = await sut.execute({
      productIds: [p1, p1, 'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee'],
    });

    expect(inventoryRepository.findByProductIds).toHaveBeenCalledWith([p1, 'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee']);
    expect(result).toEqual([
      { productId: p1, quantity: 3, inStock: true, lastUnits: true },
      {
        productId: 'bbbbbbbb-bbbb-cccc-dddd-eeeeeeeeeeee',
        quantity: 0,
        inStock: false,
        lastUnits: false,
      },
    ]);
  });

  it('returns lastUnits false when quantity above lowStockThreshold', async () => {
    const p1 = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    const entity = new InventoryEntity(
      'inv-1',
      'N1',
      10,
      100,
      10,
      5,
      p1,
      createdBy,
      now,
      now,
    );
    inventoryRepository.findByProductIds.mockResolvedValue([entity]);

    const result = await sut.execute({ productIds: [p1] });

    expect(result[0]).toEqual({
      productId: p1,
      quantity: 10,
      inStock: true,
      lastUnits: false,
    });
  });
});
