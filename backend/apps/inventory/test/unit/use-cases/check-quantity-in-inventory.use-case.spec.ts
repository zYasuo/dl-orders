import { Test, TestingModule } from '@nestjs/testing';
import { CheckQuantityInInventoryUseCase } from '../../../src/application/use-cases/check-quantity-in-inventory';
import { InventoryEntity } from '../../../src/domain/entities/inventory.entity';
import { IInventoryLowStockPublisherPort } from '../../../src/domain/ports/inventory-low-stock-publisher.port';
import {
  IInventoryRepositoryPort,
} from '../../../src/domain/ports/inventory-repository.port';
import { ILowStockNotificationDeduperPort } from '../../../src/domain/ports/inventory-low-stock-notification-deduper.port';

describe('CheckQuantityInInventoryUseCase', () => {
  let sut: CheckQuantityInInventoryUseCase;
  let inventoryRepository: jest.Mocked<IInventoryRepositoryPort>;
  let inventoryLowStockPublisher: jest.Mocked<IInventoryLowStockPublisherPort>;
  let lowStockNotificationDeduper: jest.Mocked<ILowStockNotificationDeduperPort>;

  beforeEach(async () => {
    jest.clearAllMocks();

    inventoryRepository = {
      create: jest.fn(),
      findByProductId: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      findLowStock: jest.fn(),
      findLowStockPage: jest.fn(),
      decrementStock: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<IInventoryRepositoryPort>;

    inventoryLowStockPublisher = {
      publish: jest.fn(),
    } as unknown as jest.Mocked<IInventoryLowStockPublisherPort>;

    lowStockNotificationDeduper = {
      shouldNotify: jest.fn(),
    } as unknown as jest.Mocked<ILowStockNotificationDeduperPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CheckQuantityInInventoryUseCase,
        { provide: IInventoryRepositoryPort, useValue: inventoryRepository },
        { provide: IInventoryLowStockPublisherPort, useValue: inventoryLowStockPublisher },
        { provide: ILowStockNotificationDeduperPort, useValue: lowStockNotificationDeduper },
      ],
    }).compile();

    sut = module.get(CheckQuantityInInventoryUseCase);
  });

  it('publishes inventory.low_stock for every low stock inventory item', async () => {
    const createdAt = new Date('2025-01-01T12:00:00Z');
    const updatedAt = new Date('2025-01-01T12:05:00Z');
    const lowStock = [
      new InventoryEntity(
        'inv-1',
        'Warehouse A',
        2,
        100,
        1,
        5,
        'product-1',
        'a@test.com',
        createdAt,
        updatedAt,
      ),
      new InventoryEntity(
        'inv-2',
        'Warehouse B',
        0,
        100,
        1,
        5,
        'product-2',
        'b@test.com',
        createdAt,
        new Date('2025-01-01T12:06:00Z'),
      ),
    ];

    inventoryRepository.findLowStockPage.mockResolvedValueOnce(lowStock);
    lowStockNotificationDeduper.shouldNotify.mockResolvedValueOnce(true);
    lowStockNotificationDeduper.shouldNotify.mockResolvedValueOnce(true);
    inventoryLowStockPublisher.publish.mockResolvedValueOnce();
    inventoryLowStockPublisher.publish.mockResolvedValueOnce();

    await sut.execute();

    expect(inventoryLowStockPublisher.publish).toHaveBeenCalledTimes(2);
    expect(inventoryLowStockPublisher.publish).toHaveBeenNthCalledWith(1, {
      id: 'inv-1',
      name: 'Warehouse A',
      productId: 'product-1',
      quantity: 2,
      createdBy: 'a@test.com',
    });
    expect(inventoryLowStockPublisher.publish).toHaveBeenNthCalledWith(2, {
      id: 'inv-2',
      name: 'Warehouse B',
      productId: 'product-2',
      quantity: 0,
      createdBy: 'b@test.com',
    });
  });

  it('does not publish when there are no low stock items', async () => {
    inventoryRepository.findLowStockPage.mockResolvedValueOnce([]);

    await sut.execute();

    expect(inventoryLowStockPublisher.publish).not.toHaveBeenCalled();
    expect(lowStockNotificationDeduper.shouldNotify).not.toHaveBeenCalled();
  });

  it('skips publish when deduper returns false for an inventory id', async () => {
    const createdAt = new Date('2025-01-01T12:00:00Z');
    const lowStock = [
      new InventoryEntity('inv-1', 'Warehouse A', 2, 100, 1, 5, 'product-1', 'a@test.com', createdAt, createdAt),
      new InventoryEntity('inv-2', 'Warehouse B', 0, 100, 1, 5, 'product-2', 'b@test.com', createdAt, createdAt),
    ];

    inventoryRepository.findLowStockPage.mockResolvedValueOnce(lowStock);
    lowStockNotificationDeduper.shouldNotify.mockResolvedValueOnce(true);
    lowStockNotificationDeduper.shouldNotify.mockResolvedValueOnce(false);

    inventoryLowStockPublisher.publish.mockResolvedValueOnce();

    await sut.execute();

    expect(inventoryLowStockPublisher.publish).toHaveBeenCalledTimes(1);
    expect(inventoryLowStockPublisher.publish).toHaveBeenCalledWith({
      id: 'inv-1',
      name: 'Warehouse A',
      productId: 'product-1',
      quantity: 2,
      createdBy: 'a@test.com',
    });
  });
});
