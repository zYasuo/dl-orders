import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateInventoryUseCase } from '../../../src/application/use-cases/create-inventory.use-case';
import { InventoryEntity } from '../../../src/domain/entities/inventory.entity';
import { InventoryListCachePort } from '../../../src/domain/ports/inventory-list-cache.port';
import { InventoryRepositoryPort } from '../../../src/domain/ports/inventory-repository.port';

describe('CreateInventoryUseCase', () => {
  let sut: CreateInventoryUseCase;
  let inventoryRepository: jest.Mocked<InventoryRepositoryPort>;
  let listCache: jest.Mocked<InventoryListCachePort>;

  const createdAt = new Date('2025-01-01T12:00:00Z');
  const createdBy = 'user@test.com';
  const fakeInventory = new InventoryEntity(
    'inventory-123',
    'Warehouse 1',
    10,
    100,
    5,
    3,
    'product-123',
    createdBy,
    createdAt,
    createdAt,
  );

  beforeEach(async () => {
    jest.clearAllMocks();

    inventoryRepository = {
      create: jest.fn().mockResolvedValue(fakeInventory),
      findByProductId: jest.fn().mockResolvedValue(null),
      findByName: jest.fn().mockResolvedValue(null),
      decrementStock: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<InventoryRepositoryPort>;

    listCache = {
      get: jest.fn(),
      set: jest.fn(),
      invalidate: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<InventoryListCachePort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateInventoryUseCase,
        { provide: InventoryRepositoryPort, useValue: inventoryRepository },
        { provide: InventoryListCachePort, useValue: listCache },
      ],
    }).compile();

    sut = module.get(CreateInventoryUseCase);
  });

  describe('execute', () => {
    it('creates inventory and returns it', async () => {
      const input = {
        productId: 'product-123',
        name: 'Warehouse 1',
        quantity: 10,
        maxQuantity: 100,
        minQuantity: 5,
        lowStockThreshold: 3,
        createdBy,
      };

      const result = await sut.execute(input);

      expect(inventoryRepository.findByProductId).toHaveBeenCalledWith(input.productId);
      expect(inventoryRepository.findByName).toHaveBeenCalledWith(input.name);
      expect(inventoryRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          productId: input.productId,
          name: input.name,
          quantity: input.quantity,
          maxQuantity: input.maxQuantity,
          minQuantity: input.minQuantity,
          lowStockThreshold: input.lowStockThreshold,
          createdBy: input.createdBy,
        }),
      );
      expect(result).toEqual(fakeInventory);
      expect(listCache.invalidate).toHaveBeenCalledTimes(1);
    });

    it('throws BadRequestException when inventory already exists for product', async () => {
      inventoryRepository.findByProductId.mockResolvedValueOnce(fakeInventory);

      await expect(
        sut.execute({
          productId: 'product-123',
          name: 'W',
          quantity: 10,
          maxQuantity: 100,
          minQuantity: 5,
          lowStockThreshold: 3,
          createdBy,
        }),
      ).rejects.toThrow(new BadRequestException('Inventory already exists for this product'));
      expect(inventoryRepository.create).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when inventory name already exists', async () => {
      inventoryRepository.findByName.mockResolvedValueOnce(fakeInventory);

      await expect(
        sut.execute({
          productId: 'product-123',
          name: 'Existing',
          quantity: 10,
          maxQuantity: 100,
          minQuantity: 5,
          lowStockThreshold: 3,
          createdBy,
        }),
      ).rejects.toThrow(new BadRequestException('An inventory with this name already exists'));
      expect(inventoryRepository.create).not.toHaveBeenCalled();
    });

    it('throws InternalServerErrorException when create returns null', async () => {
      inventoryRepository.create.mockResolvedValueOnce(null);

      await expect(
        sut.execute({
          productId: 'product-123',
          name: 'W',
          quantity: 10,
          maxQuantity: 100,
          minQuantity: 5,
          lowStockThreshold: 3,
          createdBy,
        }),
      ).rejects.toThrow(new InternalServerErrorException('Failed to create inventory'));
    });
  });
});
