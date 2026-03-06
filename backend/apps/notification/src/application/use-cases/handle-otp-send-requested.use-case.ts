import { Injectable, Logger } from '@nestjs/common';
import { OtpSendRequestedEvent } from '@app/shared';
import { IEmailSenderPort } from '../../domain/ports/email-sender.port';

@Injectable()
export class HandleOtpSendRequestedUseCase {
    private readonly logger = new Logger(HandleOtpSendRequestedUseCase.name);

    constructor(private readonly emailSender: IEmailSenderPort) {}

    async execute(payload: OtpSendRequestedEvent): Promise<void> {
        const { email, code, expiresInMinutes } = payload;

        const result = await this.emailSender.send({
            to: email,
            subject: 'Confirme seu email - código OTP',
            html: `Seu código de verificação é: <strong>${code}</strong>. Válido por ${expiresInMinutes} minutos.`,
        });

        if (!result.success) {
            this.logger.error('Failed to send OTP email', { email, error: result.error });
        }
    }
}
