import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PATTERNS, IResetPasswordRequestEvent } from '@app/shared';
import { HandleResetPasswordUseCase } from '../../../application/use-cases/handle-reset-password.use-case';

@Controller()
export class ResetPasswordLinkRequestedConsumer {
    private readonly logger = new Logger(ResetPasswordLinkRequestedConsumer.name);

    constructor(private readonly handleUseCase: HandleResetPasswordUseCase) {}

    @EventPattern(PATTERNS.RESET_PASSWORD_LINK_REQUESTED)
    async handle(@Payload() payload: IResetPasswordRequestEvent): Promise<void> {
        const { email, linkResetPassword, expiresAt } = payload;
        
        this.logger.log('Received reset password link request', { email, linkResetPassword, expiresAt });

        const normalized: IResetPasswordRequestEvent = {
            ...payload,
            expiresAt: typeof payload.expiresAt === 'string' ? new Date(payload.expiresAt) : payload.expiresAt,
        };
        
        await this.handleUseCase.execute(normalized);
    }
}
