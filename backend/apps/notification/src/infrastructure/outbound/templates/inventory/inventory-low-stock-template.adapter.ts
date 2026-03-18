import { Injectable } from '@nestjs/common';
import { IInventoryLowStockEvent } from '@app/shared';
import { INotificationRequest } from 'apps/notification/src/domain/types/notification-request.types';
import { IInventoryNotificationTemplatePort } from '../../../../domain/ports/inventory-notification-template.port';
import {
  INVENTORY_LOW_STOCK_TITLE,
  inventoryLowStockHtmlTemplate,
} from './inventory-low-stock.template';

@Injectable()
export class InventoryLowStockTemplateAdapter implements IInventoryNotificationTemplatePort {
  getInventoryLowStockMessage(payload: IInventoryLowStockEvent): INotificationRequest {
    const { name, productId, quantity } = payload;

    const content = this.replacePlaceholders(inventoryLowStockHtmlTemplate, {
      inventoryName: name,
      productId,
      quantity: String(quantity),
    });

    return {
      title: INVENTORY_LOW_STOCK_TITLE,
      content: content.trim(),
    };
  }

  private replacePlaceholders(template: string, data: Record<string, string>): string {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_: string, key: string) => data[key] ?? '');
  }
}
