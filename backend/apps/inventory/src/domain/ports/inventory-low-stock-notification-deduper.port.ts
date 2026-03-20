export abstract class LowStockNotificationDeduperPort {
  abstract shouldNotify(inventoryId: string): Promise<boolean>;
}

