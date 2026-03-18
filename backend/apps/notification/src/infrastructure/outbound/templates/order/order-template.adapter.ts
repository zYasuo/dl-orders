import { IOrderConfirmedEvent } from '@app/shared';
import { Injectable } from '@nestjs/common';
import { IOrderNotificationTemplatePort } from '../../../../domain/ports/order-notification-template.port';
import { ORDER_CONFIRMED_TITLE, orderConfirmedHtmlTemplate } from './order-confirmed.template';
import { INotificationRequest } from 'apps/notification/src/domain/types/notification-request.types';

@Injectable()
export class OrderTemplateAdapter implements IOrderNotificationTemplatePort {
  getOrderConfirmedMessage(payload: IOrderConfirmedEvent): INotificationRequest {
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
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_: string, key: string) => data[key] ?? '');
  }
}
