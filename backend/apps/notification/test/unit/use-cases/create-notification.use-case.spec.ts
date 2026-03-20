import { Test, TestingModule } from '@nestjs/testing';
import { CreateNotificationUseCase } from '../../../src/application/use-cases/create-notification.use-case';
import {
  INotificationStatus,
  INotificationType,
  NotificationEntity,
} from '../../../src/domain/entities/notification.entity';
import { NotificationRepositoryPort } from '../../../src/domain/ports/notification-repository.port';
import { ICreateNotification } from '../../../src/domain/types/notification-repository.types';

describe('CreateNotificationUseCase', () => {
  let sut: CreateNotificationUseCase;
  let notificationRepository: jest.Mocked<NotificationRepositoryPort>;

  const createdAt = new Date('2025-01-01T12:00:00Z');
  const fakeNotification = new NotificationEntity(
    'notif-1',
    'Pedido confirmado',
    'Seu pedido foi confirmado.',
    INotificationType.EMAIL,
    INotificationStatus.PENDING,
    'order-1',
    'user@test.com',
    'user-123',
    null,
    createdAt,
    createdAt,
  );

  const fullCreateParams: ICreateNotification = {
    title: 'Pedido confirmado',
    content: 'Seu pedido #order-1 foi confirmado.',
    type: INotificationType.EMAIL,
    sourceEventId: 'order-1',
    recipientEmail: 'user@test.com',
    userId: 'user-123',
    productName: 'Product A',
    productDescription: 'Description A',
    totalPrice: 99.9,
    quantity: 2,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    notificationRepository = {
      create: jest.fn().mockResolvedValue(fakeNotification),
      update: jest.fn(),
      delete: jest.fn(),
    } as unknown as jest.Mocked<NotificationRepositoryPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateNotificationUseCase,
        { provide: NotificationRepositoryPort, useValue: notificationRepository },
      ],
    }).compile();

    sut = module.get(CreateNotificationUseCase);
  });

  describe('execute', () => {
    it('calls repository with full ICreateNotification and returns created notification', async () => {
      const result = await sut.execute(fullCreateParams);

      expect(notificationRepository.create).toHaveBeenCalledTimes(1);
      expect(notificationRepository.create).toHaveBeenCalledWith(fullCreateParams);
      expect(result).toEqual(fakeNotification);
    });

    it('returns null when repository returns null', async () => {
      notificationRepository.create.mockResolvedValueOnce(null);

      const result = await sut.execute(fullCreateParams);

      expect(notificationRepository.create).toHaveBeenCalledWith(fullCreateParams);
      expect(result).toBeNull();
    });

    it('propagates error when repository throws', async () => {
      notificationRepository.create.mockRejectedValueOnce(new Error('DB failed'));

      await expect(sut.execute(fullCreateParams)).rejects.toThrow('DB failed');
    });
  });
});
