import { IOtpSendRequestedEvent, PATTERNS } from '@app/shared';
import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { HandleOtpSendRequestedUseCase } from 'apps/notification/src/application/use-cases/handle-otp-send-requested.use-case';

@Controller()
export class OtpSendRequestedConsumer {
    private readonly logger = new Logger(OtpSendRequestedConsumer.name);

    constructor(private readonly handleUseCase: HandleOtpSendRequestedUseCase) {}

    @EventPattern(PATTERNS.OTP_SEND_REQUESTED)
    async handle(@Payload() payload: IOtpSendRequestedEvent): Promise<void> {
        const { email, code, expiresInMinutes } = payload;
        
        this.logger.log('Received OTP send request', { email, code, expiresInMinutes });
        await this.handleUseCase.execute(payload);
    }
}
