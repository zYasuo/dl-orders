import { Injectable } from '@nestjs/common';
import { NotificationRepositoryPort } from '../../domain/ports/notification-repository.port';
import { NotificationEntity } from '../../domain/entities/notification.entity';

@Injectable()
export class CreateNotificationUseCase {
  constructor(private readonly notificationRepositoryPort: NotificationRepositoryPort) {}

  async execute(params: {
    title: string;
    content: string;
    type: NotificationEntity['type'];
    sourceEventId: string;
    recipientEmail: string;
    userId: string;
    productName: string;
    productDescription: string;
    totalPrice: number;
    quantity: number;
  }): Promise<NotificationEntity | null> {
    return this.notificationRepositoryPort.create(
      NotificationEntity.create({
        title: params.title,
        content: params.content,
        type: params.type,
        sourceEventId: params.sourceEventId,
        recipient: params.recipientEmail,
        userId: params.userId,
        productName: params.productName,
        productDescription: params.productDescription,
        totalPrice: params.totalPrice,
        quantity: params.quantity,
      }),
    );
  }
}
