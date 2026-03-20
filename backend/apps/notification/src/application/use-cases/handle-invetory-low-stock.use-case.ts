import { Injectable } from '@nestjs/common';
import { InventoryNotificationTemplatePort } from '../../domain/ports/inventory-notification-template.port';
import { IInventoryLowStockEvent } from '@app/shared';
import { EmailSenderPort } from '../../domain/ports/email-sender.port';
import { NotificationAuditLogPort } from '../../domain/ports/notification-audit-log.port';

@Injectable()
export class HandleInventoryLowStockUseCase {
  constructor(
    private readonly inventoryNotificationTemplate: InventoryNotificationTemplatePort,
    private readonly emailSender: EmailSenderPort,
    private readonly notificationAuditLogPort: NotificationAuditLogPort,
  ) {}

  async execute(event: IInventoryLowStockEvent): Promise<void> {
    const { title, content } =
      this.inventoryNotificationTemplate.getInventoryLowStockMessage(event);

    const timestamp = new Date().toISOString();

    const result = await this.emailSender.send({
      to: event.createdBy,
      subject: title,
      html: content,
    });

    if (result.success) {
      await this.notificationAuditLogPort.log({
        data: event.createdBy,
        action: 'INVENTORY_LOW_STOCK_NOTIFIED',
        timestamp,
        details: { event },
      });
      return;
    }

    await this.notificationAuditLogPort.log({
      data: event.createdBy,
      action: 'INVENTORY_LOW_STOCK_NOTIFIED_FAILED',
      timestamp,
      details: { event, error: result.error },
    });
  }
}
