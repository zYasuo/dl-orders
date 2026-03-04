import { Notification } from '../entities/notification.entity';

export class NotificationWasSendEvent {
    constructor(public readonly notification: Notification) {}
}
