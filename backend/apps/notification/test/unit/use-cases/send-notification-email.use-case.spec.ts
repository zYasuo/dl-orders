import { Test, TestingModule } from '@nestjs/testing';
import { SendNotificationEmailUseCase } from '../../../src/application/use-cases/send-notification-email.use-case';
import { INotificationStatus, INotificationType, Notification } from '../../../src/domain/entities/notification.entity';
import { IEmailSenderPort } from '../../../src/domain/ports/email-sender.port';
import { INotificationAuditLogPort } from '../../../src/domain/ports/notification-audit-log.port';
import { INotificationRepositoryPort } from '../../../src/domain/ports/notification-repository.port';
import { IUserNotificationsPort } from '../../../src/domain/ports/user-notifications.port';

const createdAt = new Date('2025-01-01T12:00:00Z');
const notification = new Notification(
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

describe('SendNotificationEmailUseCase', () => {
    let sut: SendNotificationEmailUseCase;
    let emailSenderPort: jest.Mocked<IEmailSenderPort>;
    let notificationRepositoryPort: jest.Mocked<INotificationRepositoryPort>;
    let notificationAuditLogPort: jest.Mocked<INotificationAuditLogPort>;
    let userNotificationsPort: jest.Mocked<IUserNotificationsPort>;

    beforeEach(async () => {
        jest.clearAllMocks();

        emailSenderPort = {
            send: jest.fn().mockResolvedValue({ success: true }),
        } as unknown as jest.Mocked<IEmailSenderPort>;

        notificationRepositoryPort = {
            create: jest.fn(),
            update: jest.fn().mockResolvedValue(notification),
            delete: jest.fn(),
        } as unknown as jest.Mocked<INotificationRepositoryPort>;

        notificationAuditLogPort = {
            log: jest.fn().mockResolvedValue(undefined),
            getByOrderId: jest.fn().mockResolvedValue([]),
        } as unknown as jest.Mocked<INotificationAuditLogPort>;

        userNotificationsPort = {
            add: jest.fn().mockResolvedValue(undefined),
            getByUserId: jest.fn().mockResolvedValue([]),
        } as unknown as jest.Mocked<IUserNotificationsPort>;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SendNotificationEmailUseCase,
                { provide: IEmailSenderPort, useValue: emailSenderPort },
                { provide: INotificationRepositoryPort, useValue: notificationRepositoryPort },
                { provide: INotificationAuditLogPort, useValue: notificationAuditLogPort },
                { provide: IUserNotificationsPort, useValue: userNotificationsPort },
            ],
        }).compile();

        sut = module.get(SendNotificationEmailUseCase);
    });

    describe('execute', () => {
        it('sends email with to: notification.recipient and updates status to SENT on success', async () => {
            await sut.execute(notification);

            expect(emailSenderPort.send).toHaveBeenCalledWith({
                to: notification.recipient,
                subject: notification.title,
                html: notification.content,
            });
            expect(notificationAuditLogPort.log).toHaveBeenCalledWith({
                orderId: 'order-1',
                action: 'NOTIFICATION_SENT',
                timestamp: expect.any(String),
                details: { notificationId: notification.id, recipient: notification.recipient },
            });
            expect(userNotificationsPort.add).toHaveBeenCalledWith({
                userId: notification.userId,
                timestamp: expect.any(String),
                notificationId: notification.id,
                orderId: 'order-1',
                title: notification.title,
                content: notification.content,
                read: false,
            });
            expect(notificationRepositoryPort.update).toHaveBeenCalledWith(notification.id, {
                status: INotificationStatus.SENT,
                sentAt: expect.any(Date),
                updatedAt: expect.any(Date),
            });
        });

        it('logs NOTIFICATION_FAILED and updates status to FAILED when send fails', async () => {
            emailSenderPort.send.mockResolvedValueOnce({ success: false, error: 'SMTP error' });

            await sut.execute(notification);

            expect(notificationAuditLogPort.log).toHaveBeenCalledWith({
                orderId: 'order-1',
                action: 'NOTIFICATION_FAILED',
                timestamp: expect.any(String),
                details: { notificationId: notification.id, recipient: notification.recipient, error: 'SMTP error' },
            });
            expect(notificationRepositoryPort.update).toHaveBeenCalledWith(notification.id, {
                status: INotificationStatus.FAILED,
                updatedAt: expect.any(Date),
            });
            expect(userNotificationsPort.add).not.toHaveBeenCalled();
        });
    });
});
