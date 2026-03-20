import { Test, TestingModule } from '@nestjs/testing';
import { HandleInventoryLowStockUseCase } from '../../../src/application/use-cases/handle-invetory-low-stock.use-case';
import { EmailSenderPort } from '../../../src/domain/ports/email-sender.port';
import { InventoryNotificationTemplatePort } from '../../../src/domain/ports/inventory-notification-template.port';
import { NotificationAuditLogPort } from '../../../src/domain/ports/notification-audit-log.port';

describe('HandleInventoryLowStockUseCase', () => {
  let sut: HandleInventoryLowStockUseCase;
  let inventoryNotificationTemplate: jest.Mocked<InventoryNotificationTemplatePort>;
  let emailSender: jest.Mocked<EmailSenderPort>;
  let notificationAuditLogPort: jest.Mocked<NotificationAuditLogPort>;

  const event = {
    id: 'inv-1',
    name: 'Warehouse A',
    productId: 'product-1',
    quantity: 2,
    createdBy: 'a@test.com',
  } as any;

  const templateMessage = {
    title: 'Low stock alert',
    content: '<p>Low stock</p>',
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    inventoryNotificationTemplate = {
      getInventoryLowStockMessage: jest.fn().mockReturnValue(templateMessage),
    } as unknown as jest.Mocked<InventoryNotificationTemplatePort>;

    emailSender = {
      send: jest.fn(),
    } as unknown as jest.Mocked<EmailSenderPort>;

    notificationAuditLogPort = {
      log: jest.fn(),
      getByData: jest.fn(),
    } as unknown as jest.Mocked<NotificationAuditLogPort>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HandleInventoryLowStockUseCase,
        { provide: InventoryNotificationTemplatePort, useValue: inventoryNotificationTemplate },
        { provide: EmailSenderPort, useValue: emailSender },
        { provide: NotificationAuditLogPort, useValue: notificationAuditLogPort },
      ],
    }).compile();

    sut = module.get(HandleInventoryLowStockUseCase);
  });

  it('sends email and logs INVENTORY_LOW_STOCK_NOTIFIED on success', async () => {
    emailSender.send.mockResolvedValueOnce({ success: true });

    await sut.execute(event);

    expect(inventoryNotificationTemplate.getInventoryLowStockMessage).toHaveBeenCalledTimes(1);
    expect(inventoryNotificationTemplate.getInventoryLowStockMessage).toHaveBeenCalledWith(event);

    expect(emailSender.send).toHaveBeenCalledTimes(1);
    expect(emailSender.send).toHaveBeenCalledWith({
      to: event.createdBy,
      subject: templateMessage.title,
      html: templateMessage.content,
    });

    expect(notificationAuditLogPort.log).toHaveBeenCalledTimes(1);
    expect(notificationAuditLogPort.log).toHaveBeenCalledWith({
      data: event.createdBy,
      action: 'INVENTORY_LOW_STOCK_NOTIFIED',
      timestamp: expect.any(String),
      details: { event },
    });
  });

  it('logs INVENTORY_LOW_STOCK_NOTIFIED_FAILED and includes error on failure', async () => {
    emailSender.send.mockResolvedValueOnce({ success: false, error: 'SMTP error' });

    await sut.execute(event);

    expect(notificationAuditLogPort.log).toHaveBeenCalledTimes(1);
    expect(notificationAuditLogPort.log).toHaveBeenCalledWith({
      data: event.createdBy,
      action: 'INVENTORY_LOW_STOCK_NOTIFIED_FAILED',
      timestamp: expect.any(String),
      details: { event, error: 'SMTP error' },
    });
  });
});
