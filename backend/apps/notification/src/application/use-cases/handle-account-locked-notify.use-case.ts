import { Injectable, Logger } from '@nestjs/common';
import { AccountLockedNotifyEvent } from '@app/shared';
import { IEmailSenderPort } from '../../domain/ports/email-sender.port';

@Injectable()
export class HandleAccountLockedNotifyUseCase {
    private readonly logger = new Logger(HandleAccountLockedNotifyUseCase.name);

    constructor(private readonly emailSender: IEmailSenderPort) {}

    async execute(payload: AccountLockedNotifyEvent): Promise<void> {
        const { email, lockedUntilMinutes } = payload;

        const html = `
            <p>Your account has been temporarily locked due to multiple failed login attempts.</p>
            <p><strong>What you need to do:</strong></p>
            <ul>
                <li>Wait <strong>${lockedUntilMinutes} minutes</strong> before trying again.</li>
                <li>Verify you are using the correct password.</li>
                <li>If you forgot your password, use the password recovery option when available.</li>
            </ul>
            <p>If you did not attempt to access your account, we recommend changing your password once the lock is lifted.</p>
        `.trim();

        const result = await this.emailSender.send({
            to: email,
            subject: 'Account temporarily locked - Login attempts',
            html,
        });

        if (!result.success) {
            this.logger.error('Failed to send account locked email', {
                email,
                error: result.error,
            });
        }
    }
}
