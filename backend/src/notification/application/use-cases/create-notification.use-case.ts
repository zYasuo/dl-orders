import { Injectable } from '@nestjs/common';
import { INotificationRepositoryPort } from 'src/notification/domain/ports/notification-repository.ports';
import { Notification } from '../../domain/entities/notification.entity';
import { ICreateNotification } from '../../domain/types/notification-repository.types';

@Injectable()
export class CreateNotificationUseCase {
    constructor(private readonly notificationRepositoryPort: INotificationRepositoryPort) {}

    async execute(params: ICreateNotification): Promise<Notification | null> {
        const { title, content, type, sourceEventId, recipient } = params;

        const createInput: ICreateNotification = {
            title,
            content,
            type,
            sourceEventId,
            recipient,
        };

        return this.notificationRepositoryPort.create(createInput);
    }
}
