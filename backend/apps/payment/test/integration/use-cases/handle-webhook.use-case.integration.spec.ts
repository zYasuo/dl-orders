import { Test, TestingModule } from '@nestjs/testing';
import { HandleWebhookUseCase } from '../../../src/application/use-cases/handle-webhook.use-case';
import { PaymentEntity, PaymentStatus } from '../../../src/domain/entities/payment.entity';
import { PaymentAuditLogPort } from '../../../src/domain/ports/payment-audit-log.port';
import { PaymentEventsPublisherPort } from '../../../src/domain/ports/payment-events-publisher.port';
import { PaymentGatewayPort } from '../../../src/domain/ports/payment-gateway.port';
import { PaymentRepositoryPort } from '../../../src/domain/ports/payment-repository.port';
import { InMemoryPaymentRepository } from '../../doubles/in-memory-payment.repository';
import { FakePaymentGateway } from '../../doubles/fake-payment-gateway';
import { FakePaymentEventsPublisher } from '../../doubles/fake-payment-events.publisher';

describe('HandleWebhookUseCase (integration)', () => {
  let sut: HandleWebhookUseCase;
  let paymentRepository: InMemoryPaymentRepository;
  let gateway: FakePaymentGateway;
  let eventsPublisher: FakePaymentEventsPublisher;
  const orderId = 'order-1';
  const externalId = 'mp-123';

  beforeEach(async () => {
    paymentRepository = new InMemoryPaymentRepository();
    gateway = new FakePaymentGateway();
    eventsPublisher = new FakePaymentEventsPublisher();
    const paymentAuditLogPort: PaymentAuditLogPort = {
      log: jest.fn().mockResolvedValue(undefined),
      getByOrderId: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleWebhookUseCase,
        { provide: PaymentRepositoryPort, useValue: paymentRepository },
        { provide: PaymentGatewayPort, useValue: gateway },
        { provide: PaymentEventsPublisherPort, useValue: eventsPublisher },
        { provide: PaymentAuditLogPort, useValue: paymentAuditLogPort },
      ],
    }).compile();

    sut = module.get(HandleWebhookUseCase);
  });

  it('updates payment to APPROVED and publishes PaymentApproved', async () => {
    const payment = new PaymentEntity({
      id: 'pay-1',
      orderId,
      idempotencyKey: orderId,
      externalId: null,
      preferenceId: 'pref-1',
      amount: 99.9,
      status: PaymentStatus.PENDING,
      gatewayResponse: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    paymentRepository.seed(payment);
    gateway.setPaymentResponse(externalId, {
      id: externalId,
      status: 'approved',
      amount: 99.9,
      dateApproved: '2025-01-01T12:00:00Z',
      orderId,
    });

    await sut.execute({ type: 'payment', data: { id: externalId } });

    const updated = await paymentRepository.findByOrderId(orderId);
    expect(updated!.status).toBe(PaymentStatus.APPROVED);
    expect(eventsPublisher.approved).toHaveLength(1);
    expect(eventsPublisher.approved[0].orderId).toBe(orderId);
    expect(eventsPublisher.approved[0].paymentId).toBe(externalId);
    expect(eventsPublisher.failed).toHaveLength(0);
  });

  it('updates payment to REJECTED and publishes PaymentFailed', async () => {
    const payment = new PaymentEntity({
      id: 'pay-2',
      orderId,
      idempotencyKey: orderId,
      externalId: null,
      preferenceId: 'pref-2',
      amount: 50,
      status: PaymentStatus.PENDING,
      gatewayResponse: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    paymentRepository.seed(payment);
    gateway.setPaymentResponse(externalId, {
      id: externalId,
      status: 'rejected',
      amount: 50,
      dateApproved: null,
      orderId,
    });

    await sut.execute({ type: 'payment', data: { id: externalId } });

    const updated = await paymentRepository.findByOrderId(orderId);
    expect(updated!.status).toBe(PaymentStatus.REJECTED);
    expect(eventsPublisher.failed).toHaveLength(1);
    expect(eventsPublisher.failed[0].orderId).toBe(orderId);
    expect(eventsPublisher.failed[0].reason).toBe('REJECTED');
    expect(eventsPublisher.approved).toHaveLength(0);
  });

  it('is idempotent when payment already approved', async () => {
    const payment = new PaymentEntity({
      id: 'pay-3',
      orderId,
      idempotencyKey: orderId,
      externalId,
      preferenceId: 'pref-3',
      amount: 10,
      status: PaymentStatus.APPROVED,
      gatewayResponse: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    paymentRepository.seed(payment);
    gateway.setPaymentResponse(externalId, {
      id: externalId,
      status: 'approved',
      amount: 10,
      dateApproved: '2025-01-01T12:00:00Z',
      orderId,
    });

    await sut.execute({ type: 'payment', data: { id: externalId } });

    expect(eventsPublisher.approved).toHaveLength(0);
    expect(eventsPublisher.failed).toHaveLength(0);
  });
});
