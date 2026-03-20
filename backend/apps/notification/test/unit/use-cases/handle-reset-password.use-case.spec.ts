import { Test, TestingModule } from '@nestjs/testing';
import { HandleResetPasswordUseCase } from '../../../src/application/use-cases/handle-reset-password.use-case';
import { AuthNotificationTemplatePort } from '../../../src/domain/ports/auth-notification-template.port';
import { EmailSenderPort } from '../../../src/domain/ports/email-sender.port';
import { NotificationAuditLogPort } from '../../../src/domain/ports/notification-audit-log.port';

const resetPasswordPayload = {
  email: 'user@test.com',
  linkResetPassword: 'link-reset-password-123',
  expiresAt: new Date('2025-12-31'),
};

describe('HandleResetPasswordUseCase', () => {
  let sut: HandleResetPasswordUseCase;
  let authNotificationTemplatePort: jest.Mocked<AuthNotificationTemplatePort>;
  let emailSender: jest.Mocked<EmailSenderPort>;
  let notificationAuditLogPort: jest.Mocked<NotificationAuditLogPort>;

  beforeEach(async () => {
    jest.clearAllMocks();

    authNotificationTemplatePort = {
      getResetPasswordRequestMessage: jest.fn().mockReturnValue({
        title: 'Reset your password',
        content: '<p>Click the link to reset your password.</p>',
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
        HandleResetPasswordUseCase,
        { provide: AuthNotificationTemplatePort, useValue: authNotificationTemplatePort },
        { provide: EmailSenderPort, useValue: emailSender },
        { provide: NotificationAuditLogPort, useValue: notificationAuditLogPort },
      ],
    }).compile();

    sut = module.get(HandleResetPasswordUseCase);
  });

  describe('execute', () => {
    it('calls template port with payload and sends email with derived title and content', async () => {
      await sut.execute(resetPasswordPayload);

      expect(authNotificationTemplatePort.getResetPasswordRequestMessage).toHaveBeenCalledTimes(1);
      expect(authNotificationTemplatePort.getResetPasswordRequestMessage).toHaveBeenCalledWith(
        resetPasswordPayload,
      );
      expect(emailSender.send).toHaveBeenCalledTimes(1);
      expect(emailSender.send).toHaveBeenCalledWith({
        to: 'user@test.com',
        subject: 'Reset your password',
        html: '<p>Click the link to reset your password.</p>',
      });
    });

    it('does not throw when email send fails', async () => {
      emailSender.send.mockResolvedValueOnce({ success: false, error: 'SMTP error' });

      await expect(sut.execute(resetPasswordPayload)).resolves.not.toThrow();
      expect(authNotificationTemplatePort.getResetPasswordRequestMessage).toHaveBeenCalledTimes(1);
      expect(emailSender.send).toHaveBeenCalledTimes(1);
    });
  });
});
