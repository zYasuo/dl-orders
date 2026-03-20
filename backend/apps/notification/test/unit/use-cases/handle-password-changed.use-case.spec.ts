import { Test, TestingModule } from '@nestjs/testing';
import { HandlePasswordChangedUseCase } from '../../../src/application/use-cases/handle-password-changed.use-case';
import { AuthNotificationTemplatePort } from '../../../src/domain/ports/auth-notification-template.port';
import { EmailSenderPort } from '../../../src/domain/ports/email-sender.port';
import { NotificationAuditLogPort } from '../../../src/domain/ports/notification-audit-log.port';

const passwordChangedPayload = {
  email: 'user@test.com',
  changedAt: new Date('2025-01-15'),
};

describe('HandlePasswordChangedUseCase', () => {
  let sut: HandlePasswordChangedUseCase;
  let authNotificationTemplatePort: jest.Mocked<AuthNotificationTemplatePort>;
  let emailSender: jest.Mocked<EmailSenderPort>;
  let notificationAuditLogPort: jest.Mocked<NotificationAuditLogPort>;

  beforeEach(async () => {
    jest.clearAllMocks();

    authNotificationTemplatePort = {
      getResetPasswordRequestMessage: jest.fn(),
      getAccountLockedMessage: jest.fn(),
      getPasswordChangedMessage: jest.fn().mockReturnValue({
        title: 'Your password was changed',
        content: '<p>Your account password was successfully updated.</p>',
      }),
    } as unknown as jest.Mocked<AuthNotificationTemplatePort>;

    emailSender = {
      send: jest.fn().mockResolvedValue({ success: true }),
    } as unknown as jest.Mocked<EmailSenderPort>;

    notificationAuditLogPort = {
      log: jest.fn().mockResolvedValue(undefined),
      getByData: jest.fn(),
    } as unknown as jest.Mocked<NotificationAuditLogPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandlePasswordChangedUseCase,
        { provide: AuthNotificationTemplatePort, useValue: authNotificationTemplatePort },
        { provide: EmailSenderPort, useValue: emailSender },
        { provide: NotificationAuditLogPort, useValue: notificationAuditLogPort },
      ],
    }).compile();

    sut = module.get(HandlePasswordChangedUseCase);
  });

  describe('execute', () => {
    it('calls template port with payload, sends email and logs PASSWORD_CHANGED on success', async () => {
      await sut.execute(passwordChangedPayload);

      expect(authNotificationTemplatePort.getPasswordChangedMessage).toHaveBeenCalledTimes(1);
      expect(authNotificationTemplatePort.getPasswordChangedMessage).toHaveBeenCalledWith(
        passwordChangedPayload,
      );
      expect(emailSender.send).toHaveBeenCalledTimes(1);
      expect(emailSender.send).toHaveBeenCalledWith({
        to: 'user@test.com',
        subject: 'Your password was changed',
        html: '<p>Your account password was successfully updated.</p>',
      });
      expect(notificationAuditLogPort.log).toHaveBeenCalledTimes(1);
      expect(notificationAuditLogPort.log).toHaveBeenCalledWith({
        data: 'user@test.com',
        action: 'PASSWORD_CHANGED',
        timestamp: expect.any(String),
        details: { email: 'user@test.com' },
      });
    });

    it('logs PASSWORD_CHANGED_FAILED when email send fails and does not throw', async () => {
      emailSender.send.mockResolvedValueOnce({ success: false, error: 'SMTP error' });

      await expect(sut.execute(passwordChangedPayload)).resolves.not.toThrow();
      expect(notificationAuditLogPort.log).toHaveBeenCalledTimes(1);
      expect(notificationAuditLogPort.log).toHaveBeenCalledWith({
        data: 'user@test.com',
        action: 'PASSWORD_CHANGED_FAILED',
        timestamp: expect.any(String),
        details: { email: 'user@test.com', error: 'SMTP error' },
      });
    });
  });
});
