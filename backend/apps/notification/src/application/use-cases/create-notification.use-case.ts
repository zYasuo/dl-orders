import { Injectable } from '@nestjs/common';
import { INotificationRepositoryPort } from '../../domain/ports/notification-repository.port';
import { Notification } from '../../domain/entities/notification.entity';
import { ICreateNotification } from '../../domain/types/notification-repository.types';

@Injectable()
export class CreateNotificationUseCase {
    constructor(private readonly notificationRepositoryPort: INotificationRepositoryPort) {}

    async execute(params: ICreateNotification): Promise<Notification | null> {
        return this.notificationRepositoryPort.create(params);
    }
}
