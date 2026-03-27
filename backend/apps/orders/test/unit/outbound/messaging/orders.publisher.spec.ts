import {
  PATTERNS,
  InventoryReservedEvent,
  IOrderConfirmedEvent,
  IOrderCreationRequestedEvent,
} from '@app/shared';
import { OrdersRabbitMqPublisher } from '../../../../src/infrastructure/outbound/messaging/orders.publisher';

describe('OrdersRabbitMqPublisher', () => {
  let inventoryClient: { emit: jest.Mock };
  let notificationClient: { emit: jest.Mock };
  let paymentClient: { emit: jest.Mock };
  let sut: OrdersRabbitMqPublisher;

  const creationEvent: IOrderCreationRequestedEvent = {
    orderId: 'o1',
    productId: 'p1',
    productName: 'N',
    productDescription: 'D',
    idempotencyKey: 'idem',
    totalPrice: 10,
    userId: 'u',
    quantity: 1,
    recipientEmail: 'a@b.com',
  };

  const confirmedEvent: IOrderConfirmedEvent = {
    ...creationEvent,
    confirmedAt: new Date().toISOString(),
  };

  const inventoryReserved: InventoryReservedEvent = {
    orderId: 'o1',
    productId: 'p1',
    quantity: 2,
  };

  beforeEach(() => {
    inventoryClient = { emit: jest.fn() };
    notificationClient = { emit: jest.fn() };
    paymentClient = { emit: jest.fn() };
    sut = new OrdersRabbitMqPublisher(
      inventoryClient as never,
      notificationClient as never,
      paymentClient as never,
    );
  });

  it('publishOrderCreationRequested emits ORDER_CREATION_REQUESTED to inventory client', () => {
    sut.publishOrderCreationRequested(creationEvent);

    expect(inventoryClient.emit).toHaveBeenCalledTimes(1);
    expect(inventoryClient.emit).toHaveBeenCalledWith(PATTERNS.ORDER_CREATION_REQUESTED, creationEvent);
    expect(notificationClient.emit).not.toHaveBeenCalled();
    expect(paymentClient.emit).not.toHaveBeenCalled();
  });

  it('publishOrderConfirmed emits ORDER_CONFIRMED to notification client', () => {
    sut.publishOrderConfirmed(confirmedEvent);

    expect(notificationClient.emit).toHaveBeenCalledTimes(1);
    expect(notificationClient.emit).toHaveBeenCalledWith(PATTERNS.ORDER_CONFIRMED, confirmedEvent);
    expect(inventoryClient.emit).not.toHaveBeenCalled();
    expect(paymentClient.emit).not.toHaveBeenCalled();
  });

  it('publishInventoryReservedToPayment emits INVENTORY_RESERVED_FOR_PAYMENT to payment client', () => {
    sut.publishInventoryReservedToPayment(inventoryReserved);

    expect(paymentClient.emit).toHaveBeenCalledTimes(1);
    expect(paymentClient.emit).toHaveBeenCalledWith(
      PATTERNS.INVENTORY_RESERVED_FOR_PAYMENT,
      inventoryReserved,
    );
    expect(inventoryClient.emit).not.toHaveBeenCalled();
    expect(notificationClient.emit).not.toHaveBeenCalled();
  });
});
