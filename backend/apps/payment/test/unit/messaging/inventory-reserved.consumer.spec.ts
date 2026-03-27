import { InventoryReservedEvent } from '@app/shared';
import { HandleInventoryReservedUseCase } from '../../../src/application/use-cases/handle-inventory-reserved.use-case';
import { InventoryReservedConsumer } from '../../../src/infrastructure/inbound/messaging/inventory-reserved.consumer';

describe('InventoryReservedConsumer (payment)', () => {
  it('delegates to HandleInventoryReservedUseCase with payload', async () => {
    const handleInventoryReservedUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<HandleInventoryReservedUseCase>;

    const sut = new InventoryReservedConsumer(handleInventoryReservedUseCase);
    const payload: InventoryReservedEvent = { orderId: 'o1', productId: 'p1', quantity: 2 };

    await sut.handle(payload);

    expect(handleInventoryReservedUseCase.execute).toHaveBeenCalledTimes(1);
    expect(handleInventoryReservedUseCase.execute).toHaveBeenCalledWith(payload);
  });
});
