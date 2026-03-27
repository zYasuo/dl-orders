import { Test, TestingModule } from '@nestjs/testing';
import { ProcessDueCartAbandonmentRemindersUseCase } from '../../../src/application/use-cases/process-due-cart-abandonment-reminders.use-case';
import { CartAbandonmentScheduleRepositoryPort } from '../../../src/domain/ports/cart-abandonment-schedule-repository.port';
import { CartAbandonmentEmailTemplatePort } from '../../../src/domain/ports/cart-abandonment-email-template.port';
import { EmailSenderPort } from '../../../src/domain/ports/email-sender.port';

const dueRow = {
  sessionKey: 'session-key-uuid-1',
  email: 'buyer@test.com',
  resumeUrl: 'http://localhost:3000/cart',
  pendingUntil: new Date('2020-01-01T00:00:00Z'),
  summaryLines: 'p1: 2',
  sent: false,
  failCount: 0,
};

describe('ProcessDueCartAbandonmentRemindersUseCase', () => {
  let sut: ProcessDueCartAbandonmentRemindersUseCase;
  let repo: jest.Mocked<CartAbandonmentScheduleRepositoryPort>;
  let template: jest.Mocked<CartAbandonmentEmailTemplatePort>;
  let emailSender: jest.Mocked<EmailSenderPort>;

  beforeEach(async () => {
    repo = {
      findDue: jest.fn().mockResolvedValue([dueRow]),
      markSent: jest.fn().mockResolvedValue(undefined),
      incrementFailCount: jest.fn().mockResolvedValue(1),
      upsert: jest.fn(),
      deleteBySessionKey: jest.fn(),
    } as unknown as jest.Mocked<CartAbandonmentScheduleRepositoryPort>;

    template = {
      buildReminderEmail: jest.fn().mockReturnValue({
        subject: 'Lembrete',
        html: '<p>html</p>',
      }),
    } as unknown as jest.Mocked<CartAbandonmentEmailTemplatePort>;

    emailSender = {
      send: jest.fn().mockResolvedValue({ success: true }),
    } as unknown as jest.Mocked<EmailSenderPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessDueCartAbandonmentRemindersUseCase,
        { provide: CartAbandonmentScheduleRepositoryPort, useValue: repo },
        { provide: CartAbandonmentEmailTemplatePort, useValue: template },
        { provide: EmailSenderPort, useValue: emailSender },
      ],
    }).compile();

    sut = module.get(ProcessDueCartAbandonmentRemindersUseCase);
  });

  it('sends email and marks sent when send succeeds', async () => {
    await sut.execute();

    expect(repo.findDue).toHaveBeenCalled();
    expect(template.buildReminderEmail).toHaveBeenCalledWith({
      resumeUrl: dueRow.resumeUrl,
      summaryLines: dueRow.summaryLines,
    });
    expect(emailSender.send).toHaveBeenCalledWith({
      to: dueRow.email,
      subject: 'Lembrete',
      html: '<p>html</p>',
    });
    expect(repo.markSent).toHaveBeenCalledWith(dueRow.sessionKey);
    expect(repo.incrementFailCount).not.toHaveBeenCalled();
  });

  it('increments fail count when send returns success false', async () => {
    emailSender.send.mockResolvedValueOnce({ success: false, error: 'Resend down' });
    repo.incrementFailCount.mockResolvedValueOnce(1);

    await sut.execute();

    expect(repo.incrementFailCount).toHaveBeenCalledWith(dueRow.sessionKey);
    expect(repo.markSent).not.toHaveBeenCalled();
  });

  it('marks sent after max failure increments', async () => {
    emailSender.send.mockResolvedValue({ success: false });
    repo.incrementFailCount.mockResolvedValue(3);

    await sut.execute();

    expect(repo.incrementFailCount).toHaveBeenCalled();
    expect(repo.markSent).toHaveBeenCalledWith(dueRow.sessionKey);
  });

  it('does not rethrow when send throws; increments fail count', async () => {
    emailSender.send.mockRejectedValueOnce(new Error('network'));
    repo.incrementFailCount.mockResolvedValueOnce(1);

    await expect(sut.execute()).resolves.toBeUndefined();
    expect(repo.incrementFailCount).toHaveBeenCalledWith(dueRow.sessionKey);
  });
});
