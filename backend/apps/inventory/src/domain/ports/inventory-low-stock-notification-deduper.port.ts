export abstract class ILowStockNotificationDeduperPort {
  abstract shouldNotify(inventoryId: string): Promise<boolean>;
}

