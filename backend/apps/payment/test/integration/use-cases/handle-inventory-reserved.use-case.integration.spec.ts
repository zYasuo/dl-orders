import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { HandleInventoryReservedUseCase } from '../../../src/application/use-cases/handle-inventory-reserved.use-case';
import { PaymentAuditLogPort } from '../../../src/domain/ports/payment-audit-log.port';
import { PaymentEventsPublisherPort } from '../../../src/domain/ports/payment-events-publisher.port';
import { PaymentGatewayPort } from '../../../src/domain/ports/payment-gateway.port';
import { PaymentRepositoryPort } from '../../../src/domain/ports/payment-repository.port';
import { OrderDetailsPort } from '../../../src/domain/ports/order-details.port';
import { InMemoryPaymentRepository } from '../../doubles/in-memory-payment.repository';
import { FakePaymentGateway } from '../../doubles/fake-payment-gateway';
import { FakePaymentEventsPublisher } from '../../doubles/fake-payment-events.publisher';

describe('HandleInventoryReservedUseCase (integration)', () => {
  let sut: HandleInventoryReservedUseCase;
  let paymentRepository: InMemoryPaymentRepository;
  let gateway: FakePaymentGateway;
  const orderId = 'order-1';
  const totalPrice = 150.5;

  beforeEach(async () => {
    paymentRepository = new InMemoryPaymentRepository();
    gateway = new FakePaymentGateway();
    const orderDetailsPort: OrderDetailsPort = {
      getByOrderId: jest.fn().mockResolvedValue({ orderId, totalPrice }),
    };
    const paymentAuditLogPort: PaymentAuditLogPort = {
      log: jest.fn().mockResolvedValue(undefined),
      getByOrderId: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleInventoryReservedUseCase,
        { provide: OrderDetailsPort, useValue: orderDetailsPort },
        { provide: PaymentRepositoryPort, useValue: paymentRepository },
        { provide: PaymentGatewayPort, useValue: gateway },
        { provide: PaymentEventsPublisherPort, useValue: new FakePaymentEventsPublisher() },
        { provide: PaymentAuditLogPort, useValue: paymentAuditLogPort },
      ],
    }).compile();

    sut = module.get(HandleInventoryReservedUseCase);
  });

  it('creates payment and preference', async () => {
    await sut.execute({ orderId, productId: 'product-1', quantity: 2 });

    const payment = await paymentRepository.findByOrderId(orderId);
    expect(payment).not.toBeNull();
    expect(payment!.amount).toBe(totalPrice);
    expect(gateway.createdPreferences).toHaveLength(1);
    expect(gateway.createdPreferences[0].orderId).toBe(orderId);
    expect(gateway.createdPreferences[0].amount).toBe(totalPrice);
  });

  it('throws when order details not found', async () => {
    const orderDetailsPort: OrderDetailsPort = {
      getByOrderId: jest.fn().mockResolvedValue(null),
    };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleInventoryReservedUseCase,
        { provide: OrderDetailsPort, useValue: orderDetailsPort },
        { provide: PaymentRepositoryPort, useValue: paymentRepository },
        { provide: PaymentGatewayPort, useValue: gateway },
        { provide: PaymentEventsPublisherPort, useValue: new FakePaymentEventsPublisher() },
        { provide: PaymentAuditLogPort, useValue: { log: jest.fn(), getByOrderId: jest.fn() } },
      ],
    }).compile();
    const useCase = module.get(HandleInventoryReservedUseCase);

    await expect(
      useCase.execute({ orderId: 'missing', productId: 'p', quantity: 1 }),
    ).rejects.toThrow(NotFoundException);
  });
});
