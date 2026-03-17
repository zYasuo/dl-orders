import { IAccountLockedNotifyEvent, PATTERNS } from '@app/shared';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { HandleAccountLockedNotifyUseCase } from 'apps/notification/src/application/use-cases/handle-account-locked-notify.use-case';

@Controller()
export class AccountLockedNotifyConsumer {
    private readonly logger = new Logger(AccountLockedNotifyConsumer.name);

    constructor(private readonly handleUseCase: HandleAccountLockedNotifyUseCase) {}

    @EventPattern(PATTERNS.ACCOUNT_LOCKED_NOTIFY)
    async handle(@Payload() payload: IAccountLockedNotifyEvent): Promise<void> {
        const { email, lockedUntilMinutes } = payload;
        this.logger.log('Received account locked notify', { email, lockedUntilMinutes });
        await this.handleUseCase.execute(payload);
    }
}
