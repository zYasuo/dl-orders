import { Test, TestingModule } from '@nestjs/testing';
import { CancelCartAbandonmentScheduleUseCase } from '../../../src/application/use-cases/cancel-cart-abandonment-schedule.use-case';
import { CartAbandonmentScheduleRepositoryPort } from '../../../src/domain/ports/cart-abandonment-schedule-repository.port';

describe('CancelCartAbandonmentScheduleUseCase', () => {
  let sut: CancelCartAbandonmentScheduleUseCase;
  let deleteBySessionKey: jest.Mock;

  beforeEach(async () => {
    deleteBySessionKey = jest.fn().mockResolvedValue(undefined);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CancelCartAbandonmentScheduleUseCase,
        {
          provide: CartAbandonmentScheduleRepositoryPort,
          useValue: { deleteBySessionKey },
        },
      ],
    }).compile();

    sut = module.get(CancelCartAbandonmentScheduleUseCase);
  });

  it('delegates to repository', async () => {
    await sut.execute('abc-session-1');

    expect(deleteBySessionKey).toHaveBeenCalledWith('abc-session-1');
  });
});
