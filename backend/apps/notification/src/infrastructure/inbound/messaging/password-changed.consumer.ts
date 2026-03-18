import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PATTERNS, IPasswordChangedEvent } from '@app/shared';
import { HandlePasswordChangedUseCase } from '../../../application/use-cases/handle-password-changed.use-case';

@Controller()
export class PasswordChangedConsumer {
  private readonly logger = new Logger(PasswordChangedConsumer.name);

  constructor(private readonly handlePasswordChangedUseCase: HandlePasswordChangedUseCase) {}

  @EventPattern(PATTERNS.PASSWORD_CHANGED)
  async handle(@Payload() payload: IPasswordChangedEvent): Promise<void> {
    this.logger.log('Received password changed', { email: payload.email });

    const normalized: IPasswordChangedEvent = {
      ...payload,
      changedAt: payload.changedAt
        ? typeof payload.changedAt === 'string'
          ? new Date(payload.changedAt)
          : payload.changedAt
        : undefined,
    };

    await this.handlePasswordChangedUseCase.execute(normalized);
  }
}
