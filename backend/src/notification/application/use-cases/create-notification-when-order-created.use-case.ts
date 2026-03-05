import { Injectable, Logger } from '@nestjs/common';
import { INotificationType } from 'src/notification/domain/entities/notification.entity';
import type { TOrderWasCreatedPayload } from '../dto/order-was-created-payload.schema';
import { CreateNotificationUseCase } from './create-notification.use-case';
import { SendNotificationEmailUseCase } from './send-notification-email.use-case';

@Injectable()
export class CreateNotificationWhenOrderCreatedUseCase {
    private readonly logger = new Logger(CreateNotificationWhenOrderCreatedUseCase.name);

    constructor(
        private readonly createNotificationUseCase: CreateNotificationUseCase,
        private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    ) {}

    async execute(payload: TOrderWasCreatedPayload): Promise<void> {
        const { id, description, quantity, productId, recipient } = payload;

        const title = 'Pedido realizado';
        const content = `Seu pedido #${id} foi criado: ${description} (${quantity} un.). Produto: ${productId}.`;

        const notification = await this.createNotificationUseCase.execute({
            title,
            content,
            type: INotificationType.EMAIL,
            sourceEventId: id,
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
