import { Test, TestingModule } from '@nestjs/testing';
import { HandleOrderConfirmedUseCase } from '../../../src/application/use-cases/handle-order-confirmed.use-case';
import {
  INotificationStatus,
  INotificationType,
  NotificationEntity,
} from '../../../src/domain/entities/notification.entity';
import { OrderNotificationTemplatePort } from '../../../src/domain/ports/order-notification-template.port';
import { CreateNotificationUseCase } from '../../../src/application/use-cases/create-notification.use-case';
import { SendNotificationEmailUseCase } from '../../../src/application/use-cases/send-notification-email.use-case';

const createdAt = new Date('2025-01-01T12:00:00Z');
const orderConfirmedPayload = {
  orderId: 'order-1',
  productId: 'product-123',
  productName: 'Product A',
  productDescription: 'Description A',
  totalPrice: 99.9,
  userId: 'user-123',
  quantity: 2,
  recipientEmail: 'user@test.com',
  confirmedAt: new Date().toISOString(),
};

describe('HandleOrderConfirmedUseCase', () => {
  let sut: HandleOrderConfirmedUseCase;
  let createNotificationUseCase: jest.Mocked<CreateNotificationUseCase>;
  let sendNotificationEmailUseCase: jest.Mocked<SendNotificationEmailUseCase>;
  let notificationTemplatePort: jest.Mocked<OrderNotificationTemplatePort>;

  const createdNotification = new NotificationEntity(
    'notif-1',
    'Order confirmed',
    '<p>Order #order-1 – Product A, 2 unit(s), Total $99.9</p>',
    INotificationType.EMAIL,
    INotificationStatus.PENDING,
    'order-1',
    'user@test.com',
    'user-123',
    'Product A',
    'Description A',
    99.9,
    2,
    null,
    createdAt,
    createdAt,
  );

  beforeEach(async () => {
    jest.clearAllMocks();

    createNotificationUseCase = {
      execute: jest.fn().mockResolvedValue(createdNotification),
    } as unknown as jest.Mocked<CreateNotificationUseCase>;

    sendNotificationEmailUseCase = {
      execute: jest.fn().mockResolvedValue(undefined),
    } as unknown as jest.Mocked<SendNotificationEmailUseCase>;

    notificationTemplatePort = {
      getOrderConfirmedMessage: jest.fn().mockReturnValue({
        title: 'Order confirmed',
        content: '<p>Order #order-1 – Product A, 2 unit(s), Total $99.9</p>',
      }),
    } as unknown as jest.Mocked<OrderNotificationTemplatePort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleOrderConfirmedUseCase,
        { provide: CreateNotificationUseCase, useValue: createNotificationUseCase },
        { provide: SendNotificationEmailUseCase, useValue: sendNotificationEmailUseCase },
        { provide: OrderNotificationTemplatePort, useValue: notificationTemplatePort },
      ],
    }).compile();

    sut = module.get(HandleOrderConfirmedUseCase);
  });

  describe('execute', () => {
    it('calls CreateNotificationUseCase with derived title, content and payload fields', async () => {
      await sut.execute(orderConfirmedPayload);

      expect(notificationTemplatePort.getOrderConfirmedMessage).toHaveBeenCalledTimes(1);
      expect(notificationTemplatePort.getOrderConfirmedMessage).toHaveBeenCalledWith(
        orderConfirmedPayload,
      );
      expect(createNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      const createPayload = createNotificationUseCase.execute.mock.calls[0][0];
      expect(createPayload.title).toBe('Order confirmed');
      expect(createPayload.content).toContain('order-1');
      expect(createPayload.content).toContain('Product A');
      expect(createPayload.content).toContain('99.9');
      expect(createPayload.type).toBe(INotificationType.EMAIL);
      expect(createPayload.sourceEventId).toBe('order-1');
      expect(createPayload.recipientEmail).toBe('user@test.com');
      expect(createPayload.userId).toBe('user-123');
      expect(createPayload.productName).toBe('Product A');
      expect(createPayload.productDescription).toBe('Description A');
      expect(createPayload.totalPrice).toBe(99.9);
      expect(createPayload.quantity).toBe(2);
    });

    it('calls SendNotificationEmailUseCase when notification is created', async () => {
      await sut.execute(orderConfirmedPayload);

      expect(sendNotificationEmailUseCase.execute).toHaveBeenCalledTimes(1);
      expect(sendNotificationEmailUseCase.execute).toHaveBeenCalledWith(createdNotification);
    });

    it('does not call SendNotificationEmailUseCase when create returns null', async () => {
      createNotificationUseCase.execute.mockResolvedValueOnce(null);

      await sut.execute(orderConfirmedPayload);

      expect(createNotificationUseCase.execute).toHaveBeenCalledTimes(1);
      expect(sendNotificationEmailUseCase.execute).not.toHaveBeenCalled();
    });

    it('does not throw when SendNotificationEmailUseCase throws', async () => {
      sendNotificationEmailUseCase.execute.mockRejectedValueOnce(new Error('Email failed'));

      await expect(sut.execute(orderConfirmedPayload)).resolves.not.toThrow();
      expect(sendNotificationEmailUseCase.execute).toHaveBeenCalledWith(createdNotification);
    });
  });
});
