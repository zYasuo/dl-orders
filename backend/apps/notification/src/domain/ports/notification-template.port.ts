import { OrderConfirmedEvent } from '@app/shared';

export interface IOrderConfirmedMessage {
    title: string;
    content: string;
}

export abstract class INotificationTemplatePort {
    abstract getOrderConfirmedMessage(payload: OrderConfirmedEvent): IOrderConfirmedMessage;
}
