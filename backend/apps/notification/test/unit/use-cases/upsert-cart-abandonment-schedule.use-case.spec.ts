import { Test, TestingModule } from '@nestjs/testing';
import { UpsertCartAbandonmentScheduleUseCase } from '../../../src/application/use-cases/upsert-cart-abandonment-schedule.use-case';
import { CartAbandonmentScheduleRepositoryPort } from '../../../src/domain/ports/cart-abandonment-schedule-repository.port';

describe('UpsertCartAbandonmentScheduleUseCase', () => {
  let sut: UpsertCartAbandonmentScheduleUseCase;
  let repo: jest.Mocked<Pick<CartAbandonmentScheduleRepositoryPort, 'upsert'>>;

  beforeEach(async () => {
    repo = {
      upsert: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpsertCartAbandonmentScheduleUseCase,
        { provide: CartAbandonmentScheduleRepositoryPort, useValue: repo },
      ],
    }).compile();

    sut = module.get(UpsertCartAbandonmentScheduleUseCase);
  });

  it('persists schedule with parsed pendingUntil', async () => {
    await sut.execute({
      sessionKey: 'sess-12345678',
      email: 'a@b.co',
      resumeUrl: 'http://localhost/cart',
      pendingUntil: '2030-06-15T12:00:00.000Z',
      summaryLines: 'id:1',
    });

    expect(repo.upsert).toHaveBeenCalledWith({
      sessionKey: 'sess-12345678',
      email: 'a@b.co',
      resumeUrl: 'http://localhost/cart',
      pendingUntil: new Date('2030-06-15T12:00:00.000Z'),
      summaryLines: 'id:1',
      sent: false,
      failCount: 0,
    });
  });

  it('does not call repo when pendingUntil is invalid', async () => {
    await sut.execute({
      sessionKey: 'sess-12345678',
      email: 'a@b.co',
      resumeUrl: 'http://localhost/cart',
      pendingUntil: 'not-a-date',
      summaryLines: '',
    });

    expect(repo.upsert).not.toHaveBeenCalled();
  });
});
