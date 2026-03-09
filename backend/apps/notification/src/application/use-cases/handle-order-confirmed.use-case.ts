import { OrderConfirmedEvent } from '@app/shared';
import { Injectable, Logger } from '@nestjs/common';
import { INotificationType } from '../../domain/entities/notification.entity';
import { INotificationTemplatePort } from '../../domain/ports/notification-template.port';
import { CreateNotificationUseCase } from './create-notification.use-case';
import { SendNotificationEmailUseCase } from './send-notification-email.use-case';

@Injectable()
export class HandleOrderConfirmedUseCase {
    private readonly logger = new Logger(HandleOrderConfirmedUseCase.name);

    constructor(
        private readonly createNotificationUseCase: CreateNotificationUseCase,
        private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
        private readonly notificationTemplatePort: INotificationTemplatePort,
    ) {}

    async execute(payload: OrderConfirmedEvent): Promise<void> {
        const { orderId, productName, productDescription, totalPrice, userId, quantity, recipientEmail } = payload;

        const { title, content } = this.notificationTemplatePort.getOrderConfirmedMessage(payload);

        const notification = await this.createNotificationUseCase.execute({
            title,
            content,
            type: INotificationType.EMAIL,
            sourceEventId: orderId,
            recipientEmail,
            userId,
            productName,
            productDescription,
            totalPrice,
            quantity,
        });

        if (notification) {
            try {
                await this.sendNotificationEmailUseCase.execute(notification);
            } catch (err) {
                this.logger.error('Send notification email failed', { notificationId: notification.id, error: err });
            }
        }
    }
}
