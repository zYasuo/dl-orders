import { OrderConfirmedEvent } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { INotificationTemplatePort, IOrderConfirmedMessage } from '../../../domain/ports/notification-template.port';
import { ORDER_CONFIRMED_TITLE, orderConfirmedHtmlTemplate } from './order-confirmed.template';

@Injectable()
export class OrderConfirmedTemplateAdapter implements INotificationTemplatePort {
    getOrderConfirmedMessage(payload: OrderConfirmedEvent): IOrderConfirmedMessage {
        const { orderId, productName, quantity, totalPrice } = payload;

        const content = this.replacePlaceholders(orderConfirmedHtmlTemplate, {
            orderId,
            productName,
            quantity: String(quantity),
            totalPrice: '$' + Number(totalPrice).toFixed(2),
        });

        return {
            title: ORDER_CONFIRMED_TITLE,
            content: content.trim(),
        };
    }

    private replacePlaceholders(template: string, data: Record<string, string>): string {
        return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => data[key] ?? '');
    }
}
