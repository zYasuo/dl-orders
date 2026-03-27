import { InventoryReservedEvent } from '@app/shared';
import { OrderEventsPublisherPort } from '../../../../src/domain/ports/order-events-publisher.port';
import { InventoryReservedConsumer } from '../../../../src/infrastructure/inbound/messaging/inventory-reserved.consumer';

describe('InventoryReservedConsumer (orders)', () => {
  it('forwards inventory reserved payload to payment publisher port', async () => {
    const orderEventsPublisherPort = {
      publishInventoryReservedToPayment: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<OrderEventsPublisherPort>;

    const sut = new InventoryReservedConsumer(orderEventsPublisherPort);
    const payload: InventoryReservedEvent = { orderId: 'o1', productId: 'p1', quantity: 3 };

    await sut.handle(payload);

    expect(orderEventsPublisherPort.publishInventoryReservedToPayment).toHaveBeenCalledTimes(1);
    expect(orderEventsPublisherPort.publishInventoryReservedToPayment).toHaveBeenCalledWith(payload);
  });
});
