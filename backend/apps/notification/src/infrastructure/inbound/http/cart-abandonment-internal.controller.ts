import { SCartAbandonmentSessionKey, SCartAbandonmentUpsert, type TCartAbandonmentUpsert } from '../../../application/dto/cart-abandonment-upsert.schema';
import { CancelCartAbandonmentScheduleUseCase } from '../../../application/use-cases/cancel-cart-abandonment-schedule.use-case';
import { UpsertCartAbandonmentScheduleUseCase } from '../../../application/use-cases/upsert-cart-abandonment-schedule.use-case';
import { ServiceOrJwtAuthGuard } from '@app/shared/auth/service-or-jwt-auth.guard';
import { ZodValidationPipe } from '@app/shared/pipes/zod-validation.pipe';
import { Body, Controller, Delete, Put, Query, UseGuards } from '@nestjs/common';

@Controller('internal/cart-abandonment')
@UseGuards(ServiceOrJwtAuthGuard)
export class CartAbandonmentInternalController {
  constructor(
    private readonly upsertUseCase: UpsertCartAbandonmentScheduleUseCase,
    private readonly cancelUseCase: CancelCartAbandonmentScheduleUseCase,
  ) {}

  @Put()
  async upsert(@Body(new ZodValidationPipe(SCartAbandonmentUpsert)) body: TCartAbandonmentUpsert) {
    await this.upsertUseCase.execute(body);
    return { ok: true };
  }

  @Delete()
  async cancel(@Query(new ZodValidationPipe(SCartAbandonmentSessionKey)) query: { sessionKey: string }) {
    await this.cancelUseCase.execute(query.sessionKey);
    return { ok: true };
  }
}
