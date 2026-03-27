import { Test, TestingModule } from '@nestjs/testing';
import { CancelCartAbandonmentScheduleUseCase } from '../../../src/application/use-cases/cancel-cart-abandonment-schedule.use-case';
import { ProcessDueCartAbandonmentRemindersUseCase } from '../../../src/application/use-cases/process-due-cart-abandonment-reminders.use-case';
import { UpsertCartAbandonmentScheduleUseCase } from '../../../src/application/use-cases/upsert-cart-abandonment-schedule.use-case';
import { CartAbandonmentTemplateAdapter } from '../../../src/infrastructure/outbound/templates/cart/cart-abandonment-template.adapter';
import { CartAbandonmentScheduleRepositoryPort } from '../../../src/domain/ports/cart-abandonment-schedule-repository.port';
import { CartAbandonmentEmailTemplatePort } from '../../../src/domain/ports/cart-abandonment-email-template.port';
import { EmailSenderPort } from '../../../src/domain/ports/email-sender.port';
import { InMemoryCartAbandonmentScheduleRepository } from '../../doubles/in-memory-cart-abandonment-schedule.repository';

describe('Cart abandonment schedule flow (integration)', () => {
  let repo: InMemoryCartAbandonmentScheduleRepository;
  let upsert: UpsertCartAbandonmentScheduleUseCase;
  let cancel: CancelCartAbandonmentScheduleUseCase;
  let processDue: ProcessDueCartAbandonmentRemindersUseCase;
  let emailSend: jest.Mock;

  beforeEach(async () => {
    repo = new InMemoryCartAbandonmentScheduleRepository();
    emailSend = jest.fn().mockResolvedValue({ success: true });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpsertCartAbandonmentScheduleUseCase,
        CancelCartAbandonmentScheduleUseCase,
        ProcessDueCartAbandonmentRemindersUseCase,
        { provide: CartAbandonmentScheduleRepositoryPort, useValue: repo },
        { provide: CartAbandonmentEmailTemplatePort, useClass: CartAbandonmentTemplateAdapter },
        { provide: EmailSenderPort, useValue: { send: emailSend } },
      ],
    }).compile();

    upsert = module.get(UpsertCartAbandonmentScheduleUseCase);
    cancel = module.get(CancelCartAbandonmentScheduleUseCase);
    processDue = module.get(ProcessDueCartAbandonmentRemindersUseCase);
  });

  it('upserts due row, processDue sends email and marks sent', async () => {
    await upsert.execute({
      sessionKey: 'flow-session-aa',
      email: 'flow@test.com',
      resumeUrl: 'http://app/cart',
      pendingUntil: '2000-01-01T00:00:00.000Z',
      summaryLines: 'prod:1',
    });

    await processDue.execute();

    expect(emailSend).toHaveBeenCalledWith({
      to: 'flow@test.com',
      subject: expect.stringMatching(/cart/i),
      html: expect.any(String),
    });
    expect(repo.getRow('flow-session-aa')?.sent).toBe(true);
  });

  it('cancel removes row so processDue sends nothing', async () => {
    await upsert.execute({
      sessionKey: 'flow-session-bb',
      email: 'flow@test.com',
      resumeUrl: 'http://app/cart',
      pendingUntil: '2000-01-01T00:00:00.000Z',
      summaryLines: 'x',
    });

    await cancel.execute('flow-session-bb');
    emailSend.mockClear();

    await processDue.execute();

    expect(emailSend).not.toHaveBeenCalled();
  });

  it('second upsert same sessionKey resets sent and failCount for a new cycle', async () => {
    await upsert.execute({
      sessionKey: 'flow-session-cc',
      email: 'a@test.com',
      resumeUrl: 'http://a/c',
      pendingUntil: '2000-01-01T00:00:00.000Z',
      summaryLines: 'old',
    });
    await processDue.execute();
    expect(repo.getRow('flow-session-cc')?.sent).toBe(true);

    await upsert.execute({
      sessionKey: 'flow-session-cc',
      email: 'a@test.com',
      resumeUrl: 'http://a/c',
      pendingUntil: '2000-01-02T00:00:00.000Z',
      summaryLines: 'new',
    });

    const row = repo.getRow('flow-session-cc');
    expect(row?.sent).toBe(false);
    expect(row?.failCount).toBe(0);
    expect(row?.summaryLines).toBe('new');
  });
});
