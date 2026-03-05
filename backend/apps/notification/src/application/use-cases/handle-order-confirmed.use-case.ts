import { Injectable, Logger } from '@nestjs/common';
import { OrderConfirmedEvent } from '@app/shared';
import { INotificationType } from '../../domain/entities/notification.entity';
import { CreateNotificationUseCase } from './create-notification.use-case';
import { SendNotificationEmailUseCase } from './send-notification-email.use-case';

@Injectable()
export class HandleOrderConfirmedUseCase {
    private readonly logger = new Logger(HandleOrderConfirmedUseCase.name);

    constructor(
        private readonly createNotificationUseCase: CreateNotificationUseCase,
        private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    ) {}

    async execute(payload: OrderConfirmedEvent): Promise<void> {
        const { orderId, description, quantity, productId, recipient } = payload;

        const title = 'Pedido confirmado';
        const content = `Seu pedido #${orderId} foi confirmado: ${description} (${quantity} un.). Produto: ${productId}.`;

        const notification = await this.createNotificationUseCase.execute({
            title,
            content,
            type: INotificationType.EMAIL,
            sourceEventId: orderId,
            recipient,
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
