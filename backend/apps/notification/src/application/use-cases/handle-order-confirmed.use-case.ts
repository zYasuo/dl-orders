import { IOrderConfirmedEvent } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { INotificationType } from '../../domain/entities/notification.entity';
import { OrderNotificationTemplatePort } from '../../domain/ports/order-notification-template.port';
import { CreateNotificationUseCase } from './create-notification.use-case';
import { SendNotificationEmailUseCase } from './send-notification-email.use-case';

@Injectable()
export class HandleOrderConfirmedUseCase {
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
    private readonly sendNotificationEmailUseCase: SendNotificationEmailUseCase,
    private readonly orderNotificationTemplatePort: OrderNotificationTemplatePort,
  ) {}

  async execute(payload: IOrderConfirmedEvent): Promise<void> {
    const {
      orderId,
      productName,
      productDescription,
      totalPrice,
      userId,
      quantity,
      recipientEmail,
    } = payload;

    const { title, content } = this.orderNotificationTemplatePort.getOrderConfirmedMessage(payload);

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
      } catch {
        // falha no envio não propaga; notificação já foi criada
      }
    }
  }
}
