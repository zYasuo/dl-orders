import { NotificationWasSendEvent } from '../events/notification-was-send.events';

export abstract class INotificationEventsConsumerPort {
    abstract consume(event: NotificationWasSendEvent): Promise<void>;
}
