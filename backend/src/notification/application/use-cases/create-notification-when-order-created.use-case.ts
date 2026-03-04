import { Injectable } from '@nestjs/common';
import { INotificationType } from 'src/notification/domain/entities/notification.entity';
import type { TOrderWasCreatedPayload } from '../dto/order-was-created-payload.schema';
import { CreateNotificationUseCase } from './create-notification.use-case';

@Injectable()
export class CreateNotificationWhenOrderCreatedUseCase {
    constructor(private readonly createNotificationUseCase: CreateNotificationUseCase) {}

    async execute(payload: TOrderWasCreatedPayload): Promise<unknown> {
        const { id, description, quantity, productId, recipient } = payload;

        const title = 'Pedido realizado';
        const content = `Seu pedido #${id} foi criado: ${description} (${quantity} un.). Produto: ${productId}.`;

        return this.createNotificationUseCase.execute({
            title,
            content,
            type: INotificationType.EMAIL,
            sourceEventId: id,
            recipient,
        });
    }
}
