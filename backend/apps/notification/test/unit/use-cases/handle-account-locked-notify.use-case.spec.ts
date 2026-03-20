import { Test, TestingModule } from '@nestjs/testing';
import { HandleAccountLockedNotifyUseCase } from '../../../src/application/use-cases/handle-account-locked-notify.use-case';
import { AuthNotificationTemplatePort } from '../../../src/domain/ports/auth-notification-template.port';
import { EmailSenderPort } from '../../../src/domain/ports/email-sender.port';

describe('HandleAccountLockedNotifyUseCase', () => {
  let sut: HandleAccountLockedNotifyUseCase;
  let authNotificationTemplatePort: jest.Mocked<AuthNotificationTemplatePort>;
  let emailSender: jest.Mocked<EmailSenderPort>;

  const payload = {
    email: 'user@test.com',
    lockedUntilMinutes: 5,
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    authNotificationTemplatePort = {
      getAccountLockedMessage: jest.fn().mockReturnValue({
        title: 'Account temporarily locked - Login attempts',
        content:
          '<p>Your account has been temporarily locked. Wait <strong>5 minutes</strong>.</p>',
      }),
    } as unknown as jest.Mocked<AuthNotificationTemplatePort>;

    emailSender = {
      send: jest.fn().mockResolvedValue({ success: true }),
    } as unknown as jest.Mocked<EmailSenderPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleAccountLockedNotifyUseCase,
        { provide: AuthNotificationTemplatePort, useValue: authNotificationTemplatePort },
        { provide: EmailSenderPort, useValue: emailSender },
      ],
    }).compile();

    sut = module.get(HandleAccountLockedNotifyUseCase);
  });

  describe('execute', () => {
    it('calls template port with payload and sends email with derived title and content', async () => {
      await sut.execute(payload);

      expect(authNotificationTemplatePort.getAccountLockedMessage).toHaveBeenCalledTimes(1);
      expect(authNotificationTemplatePort.getAccountLockedMessage).toHaveBeenCalledWith(payload);
      expect(emailSender.send).toHaveBeenCalledTimes(1);
      expect(emailSender.send).toHaveBeenCalledWith({
        to: 'user@test.com',
        subject: 'Account temporarily locked - Login attempts',
        html: '<p>Your account has been temporarily locked. Wait <strong>5 minutes</strong>.</p>',
      });
    });

    it('does not throw when email send fails', async () => {
      emailSender.send.mockResolvedValueOnce({
        success: false,
        error: 'SMTP error',
      });

      await expect(sut.execute(payload)).resolves.not.toThrow();
      expect(authNotificationTemplatePort.getAccountLockedMessage).toHaveBeenCalledTimes(1);
      expect(emailSender.send).toHaveBeenCalledTimes(1);
    });
  });
});
