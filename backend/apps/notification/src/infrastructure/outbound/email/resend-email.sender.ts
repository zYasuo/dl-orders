import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { IEmailSenderPort } from '../../../domain/ports/email-sender.port';

const resendApiKey = process.env.RESEND_API_KEY ?? '';
const resendFromEmail = process.env.RESEND_FROM_EMAIL ?? 'Notifications <onboarding@resend.dev>';

@Injectable()
export class ResendEmailSender extends IEmailSenderPort {
    private readonly logger = new Logger(ResendEmailSender.name);
    private readonly resend: Resend | null = resendApiKey ? new Resend(resendApiKey) : null;

    async send(params: { to: string; subject: string; html: string }): Promise<{ success: boolean; error?: string }> {
        const { to, subject, html } = params;

        if (!this.resend) {
            this.logger.warn('RESEND_API_KEY not set; email not sent', { to, subject });
            return { success: false, error: 'RESEND_API_KEY not configured' };
        }

        try {
            const { data, error } = await this.resend.emails.send({
                from: resendFromEmail,
                to: [to],
                subject,
                html,
            });

            if (error) {
                this.logger.warn('Resend API error', { error, to, subject });
                return { success: false, error: error.message };
            }

            this.logger.debug('Email sent', { id: data?.id, to });
            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            this.logger.error('Resend send failed', { error: message, to, subject });
            return { success: false, error: message };
        }
    }
}
